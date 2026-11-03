// Browser modules split out of public/app.js live in public/app/. The server serves
// them at /app/<name>.js and the SRI manifest covers them; public/sw.js lists them
// for offline use (test/frontend-integrity.test.js keeps that list complete).
import { readdirSync } from 'node:fs';

export function appModuleFiles() {
  return readdirSync(new URL('../public/app/', import.meta.url))
    .filter(name => /^[a-z0-9-]+\.js$/.test(name))
    .sort()
    .map(name => `app/${name}`);
}
