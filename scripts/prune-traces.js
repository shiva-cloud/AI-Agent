#!/usr/bin/env node
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { runDatabaseMaintenance } from '../src/db-maintenance.js';

const dbPath = resolve(process.cwd(), 'data', 'settlement.sqlite');
const db = new DatabaseSync(dbPath);

const dryRun = process.argv.includes('--dry-run');
const daysArg = process.argv.find(arg => arg.startsWith('--days='));
const retentionDays = daysArg ? parseInt(daysArg.split('=')[1], 10) : 90;

try {
  const result = runDatabaseMaintenance(db, { retentionDays, dryRun });
  console.log(JSON.stringify(result, null, 2));
} finally {
  db.close();
}
