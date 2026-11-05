// Prunes old database backups so the backup disks do not grow forever.
//
//   node scripts/prune-backups.js                list what would go, delete nothing
//   node scripts/prune-backups.js --apply        write the deletion manifest, then delete
//   node scripts/prune-backups.js --keep 5       keep five newest per prefix (default 3)
//   --dir <path>                                 prune a specific directory
//
// Retention: for each backup filename prefix (the part before the first
// timestamp-like number run), the newest N files are always kept. Files named
// in docs (the two backups referenced by the 0.19.66 CHANGELOG/STATUS entries)
// are never deleted. Every deletion is recorded in a manifest next to the
// backups, so a pruned file can be traced even after it is gone.
import { readdirSync, statSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const apply = args.includes('--apply');
const keepOpt = args.indexOf('--keep');
const KEEP = keepOpt === -1 ? 3 : Number(args[keepOpt + 1]) || 3;
const dirOpt = args.indexOf('--dir');
const dirs = dirOpt === -1
  ? [join(root, 'data', 'backups'), join(root, 'backups')]
  : [args[dirOpt + 1]];

// Backups cited by the release notes as the audit trail for specific batches.
const PINNED = new Set([
  'settlement-before-verify-publish-1793912413535.sqlite',
  'settlement-before-kb-audit-2026-11-05-1793912363594.sqlite',
]);

// "settlement-before-kb-audit-2026-11-05-1793912363594.sqlite" ->
// prefix "settlement-before-kb-audit". Anything without a recognisable
// timestamp keeps its own full name as the prefix, so it is never pruned
// (a one-file group is always the newest file in its group).
function splitPrefix(name) {
  const stem = name.replace(/\.(sqlite|sqlite-wal|sqlite-shm|enc|json)$/i, '');
  const m = stem.match(/^(.*?)[-_]?(\d{4}-\d{2}-\d{2})[-_T]?(\d{2}-\d{2}-\d{2}(?:-\d+)?)?([-_]\d{10,})?$/);
  if (!m) return { prefix: stem };
  return { prefix: m[1].replace(/[-_]+$/, '') || stem };
}

const manifest = { date: new Date().toISOString(), apply, keep: KEEP, dirs: [] };
for (const dir of dirs) {
  let entries;
  try { entries = readdirSync(dir); } catch { continue; }
  const groups = new Map();
  for (const name of entries) {
    if (name.endsWith('.json') || name === 'README.md') continue;
    let full;
    try { full = join(dir, name); if (!statSync(full).isFile()) continue; } catch { continue; }
    const { prefix } = splitPrefix(name);
    if (!groups.has(prefix)) groups.set(prefix, []);
    groups.get(prefix).push({ name, full, size: statSync(full).size, mtime: statSync(full).mtimeMs });
  }
  const deletions = [];
  for (const [prefix, files] of groups) {
    files.sort((a, b) => b.mtime - a.mtime);
    files.slice(KEEP).forEach(f => {
      if (PINNED.has(f.name)) return;
      deletions.push({ ...f, prefix });
    });
  }
  manifest.dirs.push({
    dir, filesScanned: [...groups.values()].flat().length,
    deletions: deletions.map(d => ({ name: d.name, sizeMB: Math.round(d.size / 1048576 * 10) / 10, prefix: d.prefix })),
  });
  for (const d of deletions) {
    if (apply) { try { unlinkSync(d.full); } catch (e) { console.error(`could not delete ${d.name}: ${e.message}`); } }
  }
  console.log(`${dir}: ${deletions.length} backup(s) ${apply ? 'deleted' : 'would be deleted (dry run)'}`);
}
const totalMB = manifest.dirs.flatMap(d => d.deletions).reduce((s, d) => s + d.sizeMB, 0);
manifest.totalMB = totalMB;
console.log(`total: ${manifest.dirs.reduce((s, d) => s + d.deletions.length, 0)} file(s), ${totalMB} MB ${apply ? 'deleted' : 'identified'}`);
if (apply) {
  const out = join(root, 'backups', `prune-manifest-${Date.now()}.json`);
  writeFileSync(out, JSON.stringify(manifest, null, 2));
  console.log(`manifest: ${out}`);
} else {
  console.log('dry run — nothing deleted. Re-run with --apply to delete.');
}
