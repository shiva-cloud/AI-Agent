import { ValidationError } from './api-errors.js';
import { isIP } from 'node:net';

export function publicHttpsUrl(value) {
  let url; try { url=new URL(value); } catch { throw new ValidationError('Invalid source URL'); }
  if(url.protocol!=='https:' || url.username || url.password || url.hash || isIP(url.hostname.replace(/[\[\]]/g,'')) || !url.hostname.includes('.') || /(?:\.local|\.localhost|\.internal)$/i.test(url.hostname)) throw new ValidationError('Source must use an approved public HTTPS host');
  return url;
}
export function configureCrawlPolicy(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS crawl_permissions(source_id TEXT PRIMARY KEY,url TEXT NOT NULL,allowed INTEGER NOT NULL CHECK(allowed IN(0,1)),reviewer TEXT NOT NULL,note TEXT NOT NULL,at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS crawl_permission_audit(id INTEGER PRIMARY KEY,source_id TEXT NOT NULL,url TEXT NOT NULL,allowed INTEGER NOT NULL,reviewer TEXT NOT NULL,note TEXT NOT NULL,at TEXT NOT NULL);`);
}
export function permitCrawl(db, source, options = {}) {
  const { reviewer, note, allowed = true } = (options && typeof options === 'object') ? options : {};
  publicHttpsUrl(source?.url);
  if(typeof reviewer!=='string'||reviewer.trim().length<2||typeof note!=='string'||note.trim().length<20) throw new ValidationError('Named reviewer and source-specific access rationale (20+ characters) required');
  configureCrawlPolicy(db);const at=new Date().toISOString(),values=[source.id,source.url,allowed?1:0,reviewer.trim(),note.trim(),at];
  db.exec('BEGIN IMMEDIATE');
  try{db.prepare('INSERT INTO crawl_permissions VALUES (?,?,?,?,?,?) ON CONFLICT(source_id) DO UPDATE SET url=excluded.url,allowed=excluded.allowed,reviewer=excluded.reviewer,note=excluded.note,at=excluded.at').run(...values);db.prepare('INSERT INTO crawl_permission_audit(source_id,url,allowed,reviewer,note,at) VALUES (?,?,?,?,?,?)').run(...values);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
}
export function isCrawlPermitted(db, source) {
  publicHttpsUrl(source?.url);
  configureCrawlPolicy(db);
  const permission=db.prepare('SELECT allowed,url FROM crawl_permissions WHERE source_id=?').get(source?.id);
  if(!permission?.allowed||permission.url!==source?.url)return false;
  return !db.prepare('SELECT 1 FROM suspended_sources x JOIN sources s ON s.id=x.source_id WHERE s.url=?').get(source?.url);
}
