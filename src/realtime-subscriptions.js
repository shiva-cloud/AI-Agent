// src/realtime-subscriptions.js
// Settlement Policy & City Update Alert Subscription Engine
// Allows newcomers, legal clinics, and counselors to subscribe to real-time regulatory changes.

import { randomUUID } from 'node:crypto';
import { ValidationError } from './api-errors.js';
import { publicHttpsUrl } from './crawl-policy.js';
const countryAliases=new Map(Object.entries({canada:'CA','united states':'US',usa:'US','united kingdom':'GB',uk:'GB',australia:'AU',germany:'DE','united arab emirates':'AE','new zealand':'NZ',ireland:'IE'}));
const countryCode=value=>countryAliases.get(String(value).trim().toLowerCase())||String(value).trim().toUpperCase();

export class SubscriptionManager {
  constructor(db) {
    this.db = db;
    this.initTable();
  }

  initTable() {
    if (!this.db) return;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS realtime_subscriptions (
        id TEXT PRIMARY KEY,
        subscriber_name TEXT NOT NULL,
        contact_endpoint TEXT NOT NULL,
        channel TEXT NOT NULL CHECK(channel IN ('webhook', 'email', 'telegram')),
        country TEXT NOT NULL DEFAULT 'CA',
        region TEXT,
        city TEXT,
        topic TEXT NOT NULL DEFAULT 'all',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        last_notified_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_subs_geo_topic ON realtime_subscriptions(country, region, city, topic, is_active);
    `);
  }

  subscribe({
    subscriberName = 'Subscriber',
    contactEndpoint,
    channel = 'webhook',
    country = 'CA',
    region = null,
    city = null,
    topic = 'all'
  }) {
    if (!contactEndpoint || typeof contactEndpoint !== 'string') {
      throw new ValidationError('Valid contactEndpoint is required');
    }
    if(channel!=='webhook')throw new ValidationError('Only webhook delivery is implemented; email and Telegram subscriptions are not enabled');
    publicHttpsUrl(contactEndpoint);
    for(const [key,value] of Object.entries({subscriberName,contactEndpoint,country,topic}))if(typeof value!=='string'||!value.trim()||value.length>(key==='contactEndpoint'?2048:120))throw new ValidationError(`Invalid ${key}`);
    for(const value of [region,city])if(value!==null&&(typeof value!=='string'||value.length>120))throw new ValidationError('Invalid geographic scope');
    const id = `sub_${randomUUID()}`;
    country=countryCode(country);
    region=region?.trim().toUpperCase()||null;
    city=city?.trim()||null;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO realtime_subscriptions (id, subscriber_name, contact_endpoint, channel, country, region, city, topic, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);
    stmt.run(id, subscriberName, contactEndpoint.trim(), channel, country, region, city, topic, now);

    return {
      subscriptionId: id,
      subscriberName,
      contactEndpoint,
      channel,
      scope: { country, region, city, topic },
      status: 'active',
      createdAt: now
    };
  }

  listActiveSubscriptions({ country = 'CA', topic = null, city = null } = {}) {
    if (!this.db) return [];
    let query = `SELECT * FROM realtime_subscriptions WHERE is_active = 1 AND country = ?`;
    const params = [countryCode(country)];

    if (city) {
      query += ` AND (city IS NULL OR city = ? OR city = 'all')`;
      params.push(city);
    }
    if (topic && topic !== 'all') {
      query += ` AND (topic = 'all' OR topic = ?)`;
      params.push(topic);
    }
    return this.db.prepare(query).all(...params);
  }

  cancel(subscriptionId) {
    if (typeof subscriptionId!=='string'||!/^sub_[a-f0-9-]{36}$/.test(subscriptionId))throw new ValidationError('Invalid subscription ID');
    const info = this.db.prepare(`UPDATE realtime_subscriptions SET is_active = 0,subscriber_name='Cancelled subscriber',contact_endpoint='' WHERE id = ?`).run(subscriptionId);
    return info.changes > 0;
  }

  findMatchingSubscribers(alert) {
    if (!this.db || !alert) return [];
    return this.db.prepare(`SELECT * FROM realtime_subscriptions WHERE is_active=1 AND country=?
      AND (topic='all' OR topic=?)
      AND (city IS NULL OR lower(city)='all' OR ? IS NULL OR lower(city)=lower(?))
      AND (region IS NULL OR region='ALL' OR ? IS NULL OR upper(region)=upper(?))`).all(
        countryCode(alert.country||'CA'),alert.topic||'all',alert.city||null,alert.city||null,alert.region||null,alert.region||null);
  }

  // Preview by default. No live contact is redacted without explicit operator action.
  retain({days=365,now=new Date(),apply=false}={}) {
    if(!Number.isInteger(days)||days<30||days>3650||!(now instanceof Date)||!Number.isFinite(now.getTime())||typeof apply!=='boolean')throw new ValidationError('Invalid subscription retention options');
    const cutoff=new Date(now.getTime()-days*86400000).toISOString();
    const rows=this.db.prepare(`SELECT id FROM realtime_subscriptions WHERE
      (is_active=0 AND (contact_endpoint<>'' OR subscriber_name<>'Cancelled subscriber'))
      OR (is_active=1 AND created_at<? AND (last_notified_at IS NULL OR last_notified_at<?))`).all(cutoff,cutoff);
    if(apply){
      this.db.exec('BEGIN IMMEDIATE');
      try {
        const hasDeliveries=this.db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='realtime_deliveries'").get();
        for(const row of rows){this.cancel(row.id);if(hasDeliveries)this.db.prepare("UPDATE realtime_deliveries SET state='cancelled' WHERE subscription_id=? AND state='pending'").run(row.id);}
        this.db.exec('COMMIT');
      }catch(error){this.db.exec('ROLLBACK');throw error;}
    }
    return {mode:apply?'applied':'preview',cutoff,affected:rows.length};
  }
}
