// src/community-translation-ledger.js
// Community Translation & Vernacular Counselors Ledger
// Stores counselor-verified and community-contributed translations for statutory terms and records.
// Best-effort identifier masking; submitted names and free text are not guaranteed PII-free.

import { randomUUID } from 'node:crypto';
import { ValidationError } from './api-errors.js';

// Zero-PII Regex Masks
const PII_PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const PII_EMAIL_REGEX = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;
const PII_SIN_SSN_REGEX = /\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b/g;
const PII_POSTAL_CODE_REGEX = /\b[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d\b/g;
const PII_HEALTH_CARD_REGEX = /\b\d{4}[ -]?\d{3}[ -]?\d{3}(?:[ -]?[A-Za-z]{2})?\b/g;

export function sanitizeZeroPII(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(PII_EMAIL_REGEX, '[REDACTED_EMAIL]')
    .replace(PII_PHONE_REGEX, '[REDACTED_PHONE]')
    .replace(PII_POSTAL_CODE_REGEX, '[REDACTED_POSTAL_CODE]')
    .replace(PII_HEALTH_CARD_REGEX, '[REDACTED_HEALTH_CARD]')
    .replace(PII_SIN_SSN_REGEX, '[REDACTED_IDENTIFIER]');
}

export function createTranslationLedger(db = null) {
let dbInstance = null;
const memoryStore = new Map();
const endorsements = new Map();
const events = [];

/**
 * Initialize community translation ledger tables.
 */
function initTranslationLedger(db) {
  if (db && typeof db.exec === 'function') {
    dbInstance = db;
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS community_translation_ledger (
        id TEXT PRIMARY KEY,
        term_or_record_id TEXT NOT NULL,
        target_locale TEXT NOT NULL,
        original_text TEXT NOT NULL,
        suggested_translation TEXT NOT NULL,
        counselor_name TEXT NOT NULL,
        organization_credential TEXT NOT NULL,
        notes TEXT,
        endorse_count INTEGER DEFAULT 1,
        status TEXT DEFAULT 'pending',
        verified_by TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS translation_endorsements(translation_id TEXT NOT NULL,actor TEXT NOT NULL,at TEXT NOT NULL,PRIMARY KEY(translation_id,actor));
      CREATE TABLE IF NOT EXISTS translation_events(id TEXT PRIMARY KEY,translation_id TEXT NOT NULL,actor TEXT NOT NULL,action TEXT NOT NULL,at TEXT NOT NULL);
      CREATE TRIGGER IF NOT EXISTS translation_events_no_update BEFORE UPDATE ON translation_events BEGIN SELECT RAISE(ABORT,'Immutable moderation event'); END;
      CREATE TRIGGER IF NOT EXISTS translation_events_no_delete BEFORE DELETE ON translation_events BEGIN SELECT RAISE(ABORT,'Immutable moderation event'); END;
      CREATE INDEX IF NOT EXISTS idx_trans_lookup ON community_translation_ledger(term_or_record_id, target_locale);
      CREATE INDEX IF NOT EXISTS idx_trans_status ON community_translation_ledger(status);
    `);
  }
}

/**
 * Submit a translation suggestion with strict Zero-PII sanitization.
 */
function submitTranslationSuggestion(options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const {
    termOrRecordId,
    targetLocale,
    originalText,
    suggestedTranslation,
    counselorName,
    organizationCredential,
    notes = ''
  } = safeOptions;
  // Missing or non-text fields are a client error (400), not a server fault.
  for (const [name, value] of Object.entries({ termOrRecordId, targetLocale, suggestedTranslation })) {
    if (typeof value !== 'string' || !value.trim()) throw new ValidationError(`${name} is required and must be text.`);
  }
  for (const [name, value] of Object.entries({ originalText, counselorName, organizationCredential, notes })) {
    if (value !== undefined && value !== null && typeof value !== 'string') throw new ValidationError(`${name} must be text.`);
  }

  for(const [key,value] of Object.entries({termOrRecordId,targetLocale,originalText,suggestedTranslation,counselorName,organizationCredential,notes})) {
    const limit=['originalText','suggestedTranslation','notes'].includes(key)?4000:160;
    if(typeof value==='string'&&value.length>limit)throw new ValidationError(`${key} exceeds ${limit} characters`);
  }
  if(!/^[a-z]{2}(?:-[A-Za-z]{2})?$/.test(targetLocale))throw new ValidationError('Invalid locale');
  const id = `trans_${randomUUID()}`;
  const now = new Date().toISOString();
  const cleanOriginal = sanitizeZeroPII(originalText || '');
  const cleanSuggestion = sanitizeZeroPII(suggestedTranslation);
  const cleanCounselor = sanitizeZeroPII(counselorName || 'Anonymous Counselor');
  const cleanOrg = sanitizeZeroPII(organizationCredential || 'Community Practitioner');
  const cleanNotes = sanitizeZeroPII(notes);
  const normLocale = String(targetLocale).toLowerCase().trim().slice(0, 5);

  const entry = {
    id,
    term_or_record_id: termOrRecordId,
    target_locale: normLocale,
    original_text: cleanOriginal,
    suggested_translation: cleanSuggestion,
    counselor_name: cleanCounselor,
    organization_credential: cleanOrg,
    notes: cleanNotes,
    endorse_count: 0,
    status: 'pending',
    verified_by: null,
    created_at: now,
    updated_at: now
  };

  if (dbInstance) {
    const stmt = dbInstance.prepare(`
      INSERT INTO community_translation_ledger (
        id, term_or_record_id, target_locale, original_text,
        suggested_translation, counselor_name, organization_credential,
        notes, endorse_count, status, verified_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      entry.id, entry.term_or_record_id, entry.target_locale,
      entry.original_text, entry.suggested_translation, entry.counselor_name,
      entry.organization_credential, entry.notes, entry.endorse_count,
      entry.status, entry.verified_by, entry.created_at, entry.updated_at
    );
  } else {
    memoryStore.set(id, entry);
  }

  return entry;
}

/**
 * Endorse an existing translation suggestion.
 */
function actorId(actor) {
  if(typeof actor!=='string'||!actor.trim()||actor.length>160)throw new ValidationError('Authenticated moderator identity is required');
  return actor;
}
function event(id,actor,action,at) {
  if(dbInstance)dbInstance.prepare('INSERT INTO translation_events VALUES(?,?,?,?,?)').run(randomUUID(),id,actor,action,at);
  else events.push({id,actor,action,at});
}
function endorseTranslation(options = {}) {
  const { id, actor } = (options && typeof options === 'object') ? options : {};
  const safeActor = actorId(actor); const now = new Date().toISOString();
  if(dbInstance) {
    dbInstance.exec('BEGIN IMMEDIATE');
    try {
      const row=dbInstance.prepare('SELECT * FROM community_translation_ledger WHERE id=?').get(id);
      if(!row){dbInstance.exec('COMMIT');return null;}
      if(!['pending','endorsed'].includes(row.status))throw new ValidationError('Only pending translations can be endorsed');
      const added=dbInstance.prepare('INSERT OR IGNORE INTO translation_endorsements VALUES(?,?,?)').run(id,actor,now).changes;
      const count=dbInstance.prepare('SELECT count(*) n FROM translation_endorsements WHERE translation_id=?').get(id).n;
      const status=count>=3?'endorsed':'pending';
      dbInstance.prepare('UPDATE community_translation_ledger SET endorse_count=?,status=?,updated_at=? WHERE id=?').run(count,status,now,id);
      if(added)event(id,actor,'endorse',now);
      dbInstance.exec('COMMIT');return {...row,endorse_count:count,status,updated_at:now};
    }catch(error){dbInstance.exec('ROLLBACK');throw error;}
  }
  const row=memoryStore.get(id);if(!row)return null;
  if(!['pending','endorsed'].includes(row.status))throw new ValidationError('Only pending translations can be endorsed');
  const set=endorsements.get(id)||new Set();if(!set.has(actor))event(id,actor,'endorse',now);set.add(actor);endorsements.set(id,set);
  Object.assign(row,{endorse_count:set.size,status:set.size>=3?'endorsed':'pending',updated_at:now});return {...row};
}
function verifyTranslation(options = {}) {
  const { id, actor, status = 'verified' } = (options && typeof options === 'object') ? options : {};
  const safeActor = actorId(actor);
  if(!['verified','rejected','pending'].includes(status))throw new ValidationError('Invalid moderation status');
  const now=new Date().toISOString();
  if(dbInstance) {
    dbInstance.exec('BEGIN IMMEDIATE');
    try {
      const row=dbInstance.prepare('SELECT * FROM community_translation_ledger WHERE id=?').get(id);
      if(!row){dbInstance.exec('COMMIT');return null;}
      dbInstance.prepare('UPDATE community_translation_ledger SET status=?,verified_by=?,updated_at=? WHERE id=?').run(status,safeActor,now,id);
      event(id,safeActor,status,now);dbInstance.exec('COMMIT');return {...row,status,verified_by:safeActor,updated_at:now};
    }catch(error){dbInstance.exec('ROLLBACK');throw error;}
  }
  const row=memoryStore.get(id);if(!row)return null;
  Object.assign(row,{status,verified_by:safeActor,updated_at:now});event(id,safeActor,status,now);return {...row};
}

/**
 * List translations with optional filtering.
 */
function listTranslations(options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  let {
    status = null,
    locale = null,
    termOrRecordId = null,
    limit = 50,
    offset = 0
  } = safeOptions;
  limit=Number.isInteger(limit)&&limit>0?Math.min(limit,100):50;
  offset=Number.isInteger(offset)&&offset>=0?Math.min(offset,100000):0;
  if (dbInstance) {
    let sql = `SELECT * FROM community_translation_ledger WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }
    if (locale) {
      sql += ` AND target_locale = ?`;
      params.push(locale);
    }
    if (termOrRecordId) {
      sql += ` AND term_or_record_id = ?`;
      params.push(termOrRecordId);
    }

    // Bad paging values (text, negative, NaN) fall back to defaults instead of a database error.
    const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 200) : 50;
    const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
    sql += ` ORDER BY updated_at DESC LIMIT ? OFFSET ?`;
    params.push(safeLimit, safeOffset);

    const rows = dbInstance.prepare(sql).all(...params);
    return { total: rows.length, items: rows };
  } else {
    let items = Array.from(memoryStore.values());
    if (status) items = items.filter(i => i.status === status);
    if (locale) items = items.filter(i => i.target_locale === locale);
    if (termOrRecordId) items = items.filter(i => i.term_or_record_id === termOrRecordId);

    items.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    return {
      total: items.length,
      items: items.slice(offset, offset + limit)
    };
  }
}

function listPublicTranslations(options={}) {
  const result=listTranslations({...options,status:'verified'});
  return {...result,items:result.items.map(({id,term_or_record_id,target_locale,suggested_translation,status,updated_at})=>({id,term_or_record_id,target_locale,suggested_translation,status,updated_at}))};
}
initTranslationLedger(db);
return {submitTranslationSuggestion,endorseTranslation,verifyTranslation,listTranslations,listPublicTranslations};
}
const standaloneLedger=createTranslationLedger();
export const {submitTranslationSuggestion,endorseTranslation,verifyTranslation,listTranslations}=standaloneLedger;
export const initTranslationLedger = db => createTranslationLedger(db);
