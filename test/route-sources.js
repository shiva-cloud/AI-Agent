// Source text of the HTTP route dispatch: src/server.js plus every route module
// in src/routes/. Tests that inspect route literals read this instead of server.js alone.
import {readFileSync, readdirSync} from 'node:fs';

export function routeSourceFiles() {
  const routes = new URL('../src/routes/', import.meta.url);
  return [new URL('../src/server.js', import.meta.url), ...readdirSync(routes, { recursive: true }).filter(name => name.endsWith('.js')).sort().map(name => new URL(name.replace(/\\/g, '/'), routes))];
}

export function routeSource() {
  return routeSourceFiles().map(file => readFileSync(file, 'utf8')).join('\n');
}
