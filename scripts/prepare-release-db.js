import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { databasePath } from '../src/runtime-config.js';
import { healthReport } from './kb-health.js';

// Preserve the complete audit chain and the evidence needed to replay publication.
export const evidenceTables = new Set([
  'audit_checkpoints', 'evidence_revision', 'records', 'audits', 'audit_authorizations', 'sources', 'snapshots', 'candidates',
  'candidate_decisions', 'publications', 'source_policy_reviews', 'restorations',
  'suspended_sources', 'change_events', 'schema_migrations', 'archived_stale_records'
]);

export function prepareRelease(source, target = 'release/settlement.sqlite', { research = false } = {}) {
  if (!existsSync(source)) throw new Error('Evidence database not found');
  if (resolve(source) === resolve(target)) throw new Error('Release target must differ from source');
  mkdirSync(resolve(target, '..'), { recursive: true });
  const temporary = target + '.' + randomUUID() + '.tmp';
  const input = new DatabaseSync(source, { readOnly: true });
  let output;
  try {
    input.exec('BEGIN');
    output = new DatabaseSync(temporary);
    const schema = input.prepare("SELECT name, type, tbl_name, sql FROM sqlite_schema WHERE sql IS NOT NULL").all();
    const tables = schema.filter(row => row.type === 'table' && evidenceTables.has(row.name));
    output.exec('BEGIN');
    for (const table of tables) {
      output.exec(table.sql);
      const columns = input.prepare('PRAGMA table_info("' + table.name + '")').all();
      const insert = output.prepare('INSERT INTO "' + table.name + '" VALUES (' + columns.map(() => '?').join(',') + ')');
      for (const row of input.prepare('SELECT * FROM "' + table.name + '"').iterate()) {
        insert.run(...columns.map(column => row[column.name]));
      }
    }
    for (const row of schema.filter(row => ['index', 'trigger'].includes(row.type) && evidenceTables.has(row.tbl_name))) output.exec(row.sql);
    output.exec('COMMIT');
    input.exec('COMMIT');
    if (output.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok') throw new Error('Release integrity check failed');
    if (output.prepare('PRAGMA foreign_key_check').all().length) throw new Error('Release foreign key check failed');
    const records = output.prepare('SELECT count(*) AS n FROM records').get().n;
    output.close();
    output = null;
    if (!research && !healthReport({ dbPath: temporary }).publicationReadiness.ready) throw new Error('Publication review is incomplete. Release refused. Use --research only for a private research snapshot.');
    renameSync(temporary, target);
    return { status: 'written', target, records, research };
  } finally {
    output?.close();
    input.close();
    rmSync(temporary, { force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  console.log(JSON.stringify(prepareRelease(databasePath(args.find(arg => !arg.startsWith('--'))), undefined, { research: args.includes('--research') })));
}
