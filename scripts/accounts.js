import {openAccounts} from '../src/accounts.js';
import {randomBytes} from 'node:crypto';
import {PLAN_ORDER} from '../src/plans.js';

// Usage (ACCOUNTS_DB_PATH must point to the accounts database):
//   node scripts/accounts.js create "<name>" [plan]     prints the new API key once
//   node scripts/accounts.js list
//   node scripts/accounts.js plan <accountId> <plan>
//   node scripts/accounts.js key <accountId>            issues another key within the plan's limit
//   node scripts/accounts.js revoke <accountId>         revokes all keys
//   node scripts/accounts.js suspend|activate <accountId>
//   node scripts/accounts.js reset-password <email>     sets a temporary password, printed once, and ends all sessions
const [command, ...args] = process.argv.slice(2);
const usage = `Commands: create "<name>" [${PLAN_ORDER.join('|')}], list, plan <id> <plan>, key <id>, revoke <id>, suspend <id>, activate <id>, reset-password <email>`;
if (!process.env.ACCOUNTS_DB_PATH) { console.error('Set ACCOUNTS_DB_PATH first.'); process.exit(1); }
const accounts = openAccounts(process.env.ACCOUNTS_DB_PATH);
try {
  switch (command) {
    case 'create': {
      const {account, apiKey} = accounts.createAccount({name: args[0], plan: args[1] ?? 'free'});
      console.log(JSON.stringify({account}, null, 2));
      console.log(`API key (shown once, store it securely): ${apiKey}`);
      break;
    }
    case 'list': console.log(JSON.stringify(accounts.list(), null, 2)); break;
    case 'plan': console.log(JSON.stringify(accounts.setPlan(args[0], args[1]), null, 2)); break;
    case 'key': console.log(`API key (shown once, store it securely): ${accounts.issueKey(args[0], 'cli')}`); break;
    case 'revoke': console.log(`Revoked ${accounts.revokeKeys(args[0])} key(s).`); break;
    case 'suspend': console.log(JSON.stringify(accounts.setStatus(args[0], 'suspended'), null, 2)); break;
    case 'activate': console.log(JSON.stringify(accounts.setStatus(args[0], 'active'), null, 2)); break;
    case 'reset-password': {
      const temporary = randomBytes(12).toString('base64url');
      accounts.resetPassword(args[0], temporary);
      console.log(`Temporary password (shown once; ask the customer to change it): ${temporary}`);
      break;
    }
    default: console.error(usage); process.exitCode = 1;
  }
} catch (error) {
  console.error(`Failed: ${error.message}`); process.exitCode = 1;
} finally { accounts.close(); }
