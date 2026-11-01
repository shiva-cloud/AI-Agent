// Starts the server in testing mode: plans enabled, a public demo administrator that the
// web app signs in automatically, emails printed to this console, and its own databases
// under data/test-* so test runs never touch data/settlement.sqlite.
//
//   npm run start:test            then open http://127.0.0.1:3000 and /manage
//
// Override with TEST_MODE_EMAIL, TEST_MODE_PASSWORD, PORT. Never use for real customers.
import {spawn} from 'node:child_process';
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

if (process.env.NODE_ENV === 'production') {
  console.error('Testing mode publishes an administrator login and must not run with NODE_ENV=production.');
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
mkdirSync(dataDir, {recursive: true});

// A stable secret keeps anonymous usage counting the same across restarts.
const secretFile = join(dataDir, 'test-accounts.secret');
if (!existsSync(secretFile)) writeFileSync(secretFile, randomBytes(32).toString('hex'), {mode: 0o600});

const env = {
  ...process.env,
  TEST_MODE: '1',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_PATH: process.env.DB_PATH || join(dataDir, 'test-settlement.sqlite'),
  ACCOUNTS_DB_PATH: process.env.ACCOUNTS_DB_PATH || join(dataDir, 'test-accounts.sqlite'),
  ACCOUNTS_SECRET: process.env.ACCOUNTS_SECRET || readFileSync(secretFile, 'utf8').trim(),
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'console',
  PORT: process.env.PORT || '3000',
  HOST: process.env.HOST || '127.0.0.1'
};

console.log(`Testing mode on http://${env.HOST}:${env.PORT} (admin panel: /manage)`);
const child = spawn(process.execPath, [join(root, 'src', 'server.js')], {env, stdio: 'inherit'});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', code => process.exit(code ?? 0));
