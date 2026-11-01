import { writeFileSync } from 'node:fs';
writeFileSync('scripts/resolve-all-pending-and-sources.js', `// Retired: bulk approval cannot establish independent source review.\nconsole.error('Bulk approval is disabled. Use the authenticated editorial ingestion and review workflow. No records, expiry dates or gaps were changed.');\nprocess.exitCode = 1;\n`);
