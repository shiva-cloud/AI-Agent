// Source text of the main web app: public/app.js plus the modules split out of it
// into public/app/. Tests that inspect app code read this instead of app.js alone.
import {readFileSync, readdirSync} from 'node:fs';

export function appSourceFiles() {
  const dir = new URL('../public/app/', import.meta.url);
  return [new URL('../public/app.js', import.meta.url), ...readdirSync(dir).filter(name => name.endsWith('.js')).sort().map(name => new URL(name, dir))];
}

export function appSource() {
  return appSourceFiles().map(file => readFileSync(file, 'utf8')).join('\n');
}
