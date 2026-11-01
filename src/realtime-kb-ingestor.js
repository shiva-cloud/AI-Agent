/**
 * Dual-Track Knowledge Base Ingestion Engine
 * 
 * Bridges automated crawl extraction with the Northstar Knowledge Base:
 * 1. Fast-track Live Alerts: Immediate transparent surfacing in chat.
 * 2. Guarded KB Evidence: High-risk human review gatekeeping vs. low-risk immediate research seed.
 * 3. Scoped Cache Invalidation: Instant eviction of stale geographic answer caches.
 */

import { assertEnglishRecord, assertEnglishText } from './language.js';
import { dispatchAlertWebhook } from './realtime-alerts.js';
import { createHash } from 'node:crypto';
import { ValidationError } from './api-errors.js';

const countries = new Map(Object.entries({canada:'CA','united states':'US',usa:'US','united kingdom':'GB',uk:'GB',australia:'AU',germany:'DE','united arab emirates':'AE','new zealand':'NZ',ireland:'IE'}));
const countryCode = value => countries.get(String(value).toLowerCase()) || String(value).toUpperCase();

export function configureRealtimeTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS live_updates (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      record_id TEXT NOT NULL,
      country TEXT NOT NULL,
      region TEXT,
      city TEXT,
      tier TEXT NOT NULL,
      topic TEXT NOT NULL,
      headline TEXT NOT NULL,
      summary TEXT NOT NULL,
      url TEXT NOT NULL,
      detected_at TEXT NOT NULL,
      effective_from TEXT,
      effective_to TEXT,
      risk TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('active', 'archived', 'superseded'))
    );
    CREATE INDEX IF NOT EXISTS idx_live_updates_geo ON live_updates(country, region, city, topic, status);
    CREATE TABLE IF NOT EXISTS realtime_evidence_snapshots (
      id TEXT PRIMARY KEY, source_id TEXT NOT NULL, record_id TEXT NOT NULL,
      content TEXT NOT NULL, content_hash TEXT NOT NULL, captured_at TEXT NOT NULL
    );
    CREATE TRIGGER IF NOT EXISTS realtime_snapshot_immutable_update BEFORE UPDATE ON realtime_evidence_snapshots
      BEGIN SELECT RAISE(ABORT,'Immutable realtime snapshot'); END;
    CREATE TRIGGER IF NOT EXISTS realtime_snapshot_immutable_delete BEFORE DELETE ON realtime_evidence_snapshots
      BEGIN SELECT RAISE(ABORT,'Immutable realtime snapshot'); END;
  `);
}

export function realtimeKbStore(db, answerCache = null, webhookConfig = null) {
  configureRealtimeTables(db);

  return {
    /**
     * Ingests an extracted policy update into the dual-track pipeline
     */
    async ingestPolicyUpdate({ candidateRecord, liveAlert, sourceContent, deltaMetrics = null }) {
      candidateRecord = { ...candidateRecord, status: candidateRecord.risk === 'high' ? 'pending' : 'research_seed' };
      assertEnglishRecord(candidateRecord);
      assertEnglishText(liveAlert.headline, 'Alert Headline');
      assertEnglishText(liveAlert.summary, 'Alert Summary');
      if (typeof sourceContent !== 'string' || Buffer.byteLength(sourceContent)>1024*1024 || !sourceContent.includes(candidateRecord.quote)) throw new ValidationError('Exact source content containing the quote is required');
      if(liveAlert.recordId!==candidateRecord.id || liveAlert.risk!==candidateRecord.risk || liveAlert.url!==candidateRecord.url || liveAlert.topic!==candidateRecord.topic) throw new ValidationError('Alert and evidence must match');
      const contentHash=createHash('sha256').update(sourceContent).digest('hex');
      const snapshotId=createHash('sha256').update(liveAlert.sourceId+':'+candidateRecord.id+':'+contentHash).digest('hex');

      const priorSnapshot=db.prepare('SELECT 1 FROM realtime_evidence_snapshots WHERE id=?').get(snapshotId);
      const priorRecord=db.prepare('SELECT body FROM records WHERE id=?').get(candidateRecord.id);
      if(priorSnapshot&&priorRecord){
        const record=JSON.parse(priorRecord.body);
        const alert=db.prepare('SELECT id FROM live_updates WHERE record_id=? ORDER BY detected_at DESC LIMIT 1').get(record.id);
        return {success:true,replayed:true,alertId:alert?.id,recordId:record.id,risk:record.risk,status:record.status,liveAlertActive:Boolean(alert&&this.findActiveAlerts({alertId:alert.id}).length),webhookResult:null};
      }
      if(priorRecord)throw new ValidationError('Existing evidence cannot be overwritten by an automated update');

      db.exec('BEGIN IMMEDIATE');
      try {
        db.prepare('INSERT OR IGNORE INTO realtime_evidence_snapshots VALUES (?,?,?,?,?,?)').run(snapshotId,liveAlert.sourceId,candidateRecord.id,sourceContent,contentHash,new Date().toISOString());
        // 1. Supersede previous active alerts for the exact same source
        db.prepare(`
          UPDATE live_updates 
          SET status = 'superseded' 
          WHERE source_id = ? AND status = 'active'
        `).run(liveAlert.sourceId);

        // 2. Insert new live alert
        db.prepare(`
          INSERT INTO live_updates (
            id, source_id, record_id, country, region, city, tier, topic, 
            headline, summary, url, detected_at, effective_from, effective_to, risk, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `).run(
          liveAlert.id,
          liveAlert.sourceId,
          liveAlert.recordId,
          countryCode(liveAlert.country),
          liveAlert.region || null,
          liveAlert.city || null,
          liveAlert.tier,
          liveAlert.topic,
          liveAlert.headline,
          liveAlert.summary,
          liveAlert.url,
          liveAlert.detectedAt,
          liveAlert.effectiveFrom || null,
          liveAlert.effectiveTo || null,
          liveAlert.risk
        );

        // 3. Upsert into main records table
        // For low-risk records: status='research_seed' (directly retrievable)
        // For high-risk records: status='pending' (requires editorial approval)
        const existing = db.prepare('SELECT body FROM records WHERE id = ?').get(candidateRecord.id);
        if (existing) {
          db.prepare('UPDATE records SET body = ? WHERE id = ?').run(JSON.stringify(candidateRecord), candidateRecord.id);
        } else {
          db.prepare('INSERT INTO records (id, body) VALUES (?, ?)').run(candidateRecord.id, JSON.stringify(candidateRecord));
        }

        db.exec('COMMIT');
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }

      // 4. Invalidate answer cache if cache provider is linked
      if (answerCache && typeof answerCache.clear === 'function') {
        answerCache.clear();
      }

      // 5. Asynchronously dispatch alert webhook if configured
      let webhookResult = null;
      if (webhookConfig && candidateRecord.risk === 'low') {
        try {
          webhookResult = await dispatchAlertWebhook(liveAlert, webhookConfig);
        } catch {
          // Non-blocking for KB write
        }
      }

      return {
        success: true,
        alertId: liveAlert.id,
        recordId: candidateRecord.id,
        risk: candidateRecord.risk,
        status: candidateRecord.status,
        liveAlertActive: candidateRecord.risk === 'low',
        webhookResult
      };
    },

    /**
     * Retrieves active live updates for a given geographic query
     */
    findActiveAlerts({ country, region, city, topic, alertId, limit = 50, now = new Date() } = {}) {
      if(!Number.isInteger(limit)||limit<1||limit>10000)throw new ValidationError('Invalid alert limit');
      for(const value of [country,region,city,topic,alertId])if(value!==undefined&&value!==null&&(typeof value!=='string'||value.length>200))throw new ValidationError('Invalid alert filter');
      const today=now.toISOString().slice(0,10), predicates=["a.status='active'", "json_extract(r.body,'$.status') IN ('approved','research_seed')",
        "json_extract(r.body,'$.checkedAt')<=?", "json_extract(r.body,'$.expiresAt')>=?",
        '(a.effective_from IS NULL OR a.effective_from<=?)', '(a.effective_to IS NULL OR a.effective_to>?)',
        `(a.risk='low' OR (json_extract(r.body,'$.reviewMethod') IN ('editorial_review','source_verified') AND EXISTS
          (SELECT 1 FROM publications p JOIN snapshots s ON s.id=p.snapshot_id JOIN candidate_decisions d ON d.candidate_id=p.candidate_id AND d.decision='approve'
           WHERE p.record_id=a.record_id AND p.snapshot_id=json_extract(r.body,'$.snapshotId'))))`,
        'NOT EXISTS (SELECT 1 FROM suspended_sources x JOIN sources s ON s.id=x.source_id WHERE s.url=a.url)'];
      const params=[today,today,today,today];
      if(alertId){predicates.push('a.id=?');params.push(alertId);}
      if(country){predicates.push('upper(a.country)=?');params.push(countryCode(country));}
      if(topic){predicates.push('a.topic=?');params.push(topic);}
      if(city){predicates.push('(a.city IS NULL OR lower(a.city)=lower(?))');params.push(city);}
      else if(country || region) predicates.push('a.city IS NULL');
      if(region){predicates.push('(a.region IS NULL OR upper(a.region)=upper(?))');params.push(region);}
      else if(country && !city) predicates.push('a.region IS NULL');
      return db.prepare(`SELECT a.* FROM live_updates a JOIN records r ON r.id=a.record_id WHERE ${predicates.join(' AND ')} ORDER BY a.detected_at DESC,a.id LIMIT ?`).all(...params,limit);
    },

    /**
     * Lists all alerts (active, superseded, archived)
     */
    listAlerts(limit = 100) {
      return db.prepare(`
        SELECT * FROM live_updates 
        ORDER BY detected_at DESC 
        LIMIT ?
      `).all(limit);
    },

    /**
     * Archived an alert
     */
    archiveAlert(alertId) {
      db.prepare(`UPDATE live_updates SET status = 'archived' WHERE id = ?`).run(alertId);
      return { success: true, alertId };
    }
  };
}
