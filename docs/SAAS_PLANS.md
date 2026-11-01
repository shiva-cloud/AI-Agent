# Northstar as a SaaS: analysis, plans and limits

Prepared 1 November 2026. This document covers what the project contains today, how it is packaged into paid plans, how the limits are enforced, what comparable products offer, and what was added after that research.

## 1. Project analysis (snapshot)

| Area | Today |
| --- | --- |
| Chat | `POST /v1/answers`: rule-based parser plus evidence retrieval, optional AI rewriting checked against sources, follow-up context (context-1), place clarifications (geo-1). |
| Tools | 194 tool endpoints under `/v1/tools/*` (192 found in the inventory, plus 2 added here). They cover immigration (Express Entry, PNPs, work and study permits, citizenship, PR card), tenancy (Ontario, BC, Alberta, Manitoba, Saskatchewan), employment standards, tax and benefits, banking and credit, health coverage, family, vehicles and customs. |
| Interface | One page, 21 views and about 40 tool forms (`public/index.html`, `public/app.js`). |
| Backend | 310+ ES modules, SQLite storage, OpenAPI 3.1 contract, about 1,600 automated tests. |
| Operations | Rate limits, metrics, queue and runtime monitors with webhook alerts, encrypted backups. |
| Missing for a SaaS | Before this change there were no customer accounts, no plans, no usage limits per customer and no billing. Admin identity (B8) is still a static-token or file-based model. |

Observations that affect a SaaS launch:
- Without plans, one page load used to run about 65 tools automatically (68 `/v1` requests), so two reloads in a minute could hit the 120 requests/minute limit. Tools now run lazily, when their view is first opened (5 `/v1` requests per load). In SaaS mode they never run on their own (see section 3).
- All answers and tool results are estimates, not legal advice. Paid plans must not change that wording or promise outcomes; `test/wording-guard.test.js` blocks absolute promises.
- Knowledge-base coverage is still pilot-level (four cities). A paid product should say so on its pricing page.

## 2. Plans and limits (plans-2)

These are the defaults. An administrator can change every value in the admin panel (`/manage`, section 3a) without a restart.

| Plan | Price (placeholder) | Chat answers / month | Tool runs / month | Tools | API keys |
| --- | --- | --- | --- | --- | --- |
| Free | CAD 0 | unlimited | unlimited | essential + core | 1 |
| Plus | CAD 9 | 500 | 500 | essential + core + plus | 2 |
| Pro | CAD 29 | 3,000 | 3,000 | all tiers | 3 |
| Team | CAD 99 | 20,000 | 20,000 | all tiers | 10 |

Tool tiers (`src/plans.js`):
- **essential:** 17 safety and legal-rights tools, for example eviction defense, illegal entry (T2), rent increase defense, vulnerable worker, wage theft, human rights, workplace safety, debt collection, consumer protection and port-of-entry rights. They are available on every plan and are never metered, so nobody facing an eviction or abuse hits a paywall.
- **core:** 31 everyday newcomer tools, including city comparison, budget, settlement roadmap, health eligibility, document check, benefits, banking, CRS, citizenship and PR days, the CLB converter and proof of funds.
- **pro:** 26 practitioner and business tools, including the GCMS notes analyzer, form auto-fill, legal notices, small claims, voluntary disclosure, estate planning, LMIA readiness, Start-up Visa, business structure and cross-border tax.
- **plus:** every other tool. New tools default to this tier, so they are never free by accident or locked behind the top plan.

Other rules:
- Periods are calendar months in UTC; usage resets on the 1st.
- Only successful responses (HTTP status below 400) count. Failed or rejected requests are free.
- The existing per-minute rate limits still apply on top of monthly quotas.
- Prices are placeholders. No billing provider is connected and nothing takes payment.

## 3a. Admin panel and testing mode

### Admin panel (`/manage`)

Sign in with an administrator account (email and password), or paste an `ADMIN_TOKEN` / admin-role token. API keys never open it, not even an administrator's. It is backed by `/v1/manage/*` (`src/manage-api.js`), and every change is written to the audit log.

| Tab | What you can do |
| --- | --- |
| Overview | Accounts, active, suspended, admins, keys, this month's chat and tool usage, tools turned off, accounts per plan |
| Users | Search and filter. Change a plan, suspend or activate, make or remove an administrator. Details: rename, reset the password (shows a temporary one), revoke all API keys, sign out everywhere, mark the email confirmed, delete (you type the email to confirm). Add a user. |
| Plans | Edit the name, price, monthly limits (empty = unlimited), API key limit, tool tiers and on/off. Add a plan. Delete an unused plan. |
| Tools | Move any tool to another tier, or turn it off for everyone (it answers 503 `tool_disabled`). "Only changed" lists your overrides. |
| Settings | Open or close sign-ups. Choose the default plan for new accounts and anonymous visitors. |
| Audit log | Who changed what, and when. |

Safeguards, so a click cannot break the service:
- The last active administrator cannot be demoted, suspended or deleted.
- The default plan cannot be turned off or deleted, and at least one plan always stays on.
- A plan that still has accounts cannot be deleted. Move the accounts first.
- "Essential" safety tools stay in every plan.
- Plans, tool overrides and settings live in the accounts database (`plan_configs`, `tool_settings`, `settings`), so code updates never overwrite them. The defaults in `src/plans.js` only seed an empty database.

First administrator on a real server: set `ADMIN_TOKEN`, open `/manage`, choose "Use an admin token instead", then use "Make admin" on your own account. After that, sign in with email and password.

### Testing mode

```
npm run start:test
```

Then open http://127.0.0.1:3000. The command starts the server with `TEST_MODE=1`, separate test databases (`data/test-settlement.sqlite`, `data/test-accounts.sqlite`) and console email.
- It creates or refreshes the demo administrator **demo@northstar.test / Northstar-Test-2026** on the Free plan, which is unlimited. Override with `TEST_MODE_EMAIL` / `TEST_MODE_PASSWORD`.
- Every visitor is signed in automatically as that user. A yellow banner shows the login and links to the admin panel. After "Log out", auto-login stops for that browser tab.
- The login is public by design. Never enter real personal data, and never expose a testing-mode server to the internet.
- The server refuses to start with `TEST_MODE=1` when `NODE_ENV=production`.

## 3. How it is enforced

SaaS mode is opt-in. Start the server with `ACCOUNTS_DB_PATH` (a dedicated SQLite file) and `ACCOUNTS_SECRET` (64 hex characters). Without them, behaviour is unchanged.

| Piece | Where |
| --- | --- |
| Plan catalog and tool tiers | `src/plans.js` |
| Accounts, hashed API keys, monthly usage | `src/accounts.js` |
| Request gate (after the rate limit) | `src/server.js` |
| Account administration CLI | `scripts/accounts.js`: create, list, plan, key, revoke, suspend, activate |
| Browser plan widget and messages | `public/plan-access.js` |

API behaviour:
- `GET /v1/plans` is always public and returns the catalog.
- `GET /v1/account` returns the caller's plan and this month's usage (SaaS mode only).
- Send `Authorization: Bearer nsk_…` for an account; without a key the caller is on Free.
- Metered responses carry `X-Plan`, `X-Quota-Limit`, `X-Quota-Remaining` and `X-Quota-Reset`.
- A tool above the caller's plan returns **402** `plan_upgrade_required` with `requiredPlan`.
- An exhausted quota returns **429** `plan_quota_exceeded` with `resetAt` and `upgradeTo`.
- A bad or revoked key returns **401** `invalid_api_key`; a suspended account returns **403** `account_suspended`.

Privacy and security:
- API keys are shown once and stored only as SHA-256 hashes.
- Anonymous Free users are metered under an HMAC of their address that changes every month, so no IP address is stored.
- In the browser the key lives in `sessionStorage` (this tab only) and is never put in a URL.

Browser experience:
- The sidebar shows the current plan, remaining usage, a plan-key box and the plan list.
- 402 and 429 responses show a banner explaining the upgrade or the reset date.
- In SaaS mode, tools no longer run themselves on page load: 65 automatic runs would have used most of a Free month on every visit. They run when the visitor submits the form. Without SaaS mode they still auto-run as before.

### Customer sign-up and login

Visitors can create a Free account and log in with email and password from the sidebar (SaaS mode only). An administrator can also issue API keys for programmatic use.

| Endpoint | Purpose |
| --- | --- |
| `POST /v1/auth/signup` `{email, password, name?}` | Creates a Free account and starts a session (201). |
| `POST /v1/auth/login` `{email, password}` | Starts a session. |
| `POST /v1/auth/logout` `{confirm: true}` | Ends the session and clears the cookie. |
| `POST /v1/auth/password` `{currentPassword, newPassword}` | Changes the password and logs out the account's other sessions. |
| `GET /v1/account` | Includes `account.email` when signed in. |

Security:
- Passwords must be 10–200 characters with at least 4 different characters. They are stored as scrypt hashes (N=16384, r=8, p=1, random salt).
- The session is a random 256-bit token in an `ns_session` cookie: `HttpOnly`, `SameSite=Strict`, `Path=/`, 30 days, and `Secure` when `PUBLIC_ORIGIN` is HTTPS. Only its SHA-256 hash is stored. Cross-origin requests were already refused by the server.
- Emails are matched case-insensitively. Login errors are identical for an unknown email and a wrong password, and unknown emails are checked against a dummy hash so timing is similar.
- After 10 failed logins for one email within 15 minutes, logins for that email are refused for the rest of the window. Per-minute rate limits still apply.
- An API key wins over a session; without either, the visitor is anonymous Free.
- Administrator password reset: `node scripts/accounts.js reset-password <email>` prints a temporary password once and ends all of that account's sessions.

### Email verification and password reset

| Endpoint | Purpose |
| --- | --- |
| `POST /v1/auth/verify` `{token}` | Confirms the email from the link sent at sign-up (valid 24 hours, single use). |
| `POST /v1/auth/verify/resend` `{confirm: true}` | Sends a new confirmation link to the signed-in account. |
| `POST /v1/auth/reset/request` `{email}` | Always answers 202 with the same message. If the email has an active account, a reset link (valid 60 minutes, single use) is emailed. |
| `POST /v1/auth/reset/confirm` `{token, newPassword}` | Sets the new password, ends every session and every other reset link, and marks the email confirmed. |

`GET /v1/account` also returns `account.emailVerified` and `emailEnabled`.

Email providers (`src/mailer.js`), configured with `EMAIL_PROVIDER`:
- `console` prints messages, including links, to the server log. Development only; the server warns at start-up.
- `resend` sends through the Resend API with `RESEND_API_KEY` and `EMAIL_FROM` (for example `Northstar <no-reply@yourdomain.com>`). Delivery failures are logged and never change an API response.

Safety rules:
- Tokens are 256-bit random values stored only as hashes, and each one works once.
- At most 3 verification or reset emails per account per hour, so the endpoints cannot flood an inbox; the API answer stays the same when throttled.
- Links are built from `PUBLIC_ORIGIN`. Without it, links are sent only when the request comes to a loopback host (local development). A forged `Host` header can therefore never make the server email a link to another site; tests cover this.
- Mail is sent without waiting, so response timing does not reveal whether an email has an account.
- In the browser the token is read from the link and immediately removed from the address bar and history, and the server sends `Referrer-Policy: no-referrer`.

Unverified accounts can still use their plan; the sidebar shows "Your email is not confirmed yet" with a button to send a new link.

### Self-service API keys

Signed-in customers manage their own keys from the sidebar ("API keys") or the API:

| Endpoint | Purpose |
| --- | --- |
| `GET /v1/account/keys` | Lists the account's keys by short id (first 12 hex characters of the hash) with label, created, last used and revoked dates, plus the plan's key limit. Never returns a key. |
| `POST /v1/account/keys` `{label}` | Creates a key (201) and returns it once, with the notice "Copy this key now. It will not be shown again." |
| `POST /v1/account/keys/revoke` `{id}` | Revokes one of the caller's own active keys; anything else answers 404. |

Rules:
- Keys are managed only with a browser session, never with an API key, so a leaked key cannot create or revoke keys.
- When email is configured, the email must be confirmed first (403 `email_not_verified`).
- Plans limit active keys: Free 1, Plus 2, Pro 3, Team 10. Above the limit the API answers 409 `key_limit_reached`, and the sidebar disables "Create API key".
- Labels are cleaned of control characters and capped at 60 characters.
- "Last used" is recorded at most once an hour per key, so busy keys do not write on every request.
- In the sidebar the new key appears in a one-time box with Copy; "I have saved it" removes it from the page, and logging out clears it.

### Usage dashboard

`GET /v1/account/usage` (signed-in session or the account's API key) returns the month to date: plan, limits, totals, a projection to the end of the month, one row per day (UTC) and one row per source (each API key, plus "Browser (signed in)"). Every successful metered request writes a daily row (`usage_daily`) next to the monthly counter. Safety and legal-rights tools are not counted.

The sidebar's **Usage dashboard** button opens a dialog with:
- Tiles for chat answers and tool runs (used of limit, amount left) and the plan with its reset date.
- A pace line. When the current daily rate would use up a limit before the reset, it warns ("⚠ At this pace you will use all your tool runs around day 18 of 30").
- Two one-axis bar charts (chat answers per day, tool runs per day). Each chart is a single series named by its title. Every bar has a hover or keyboard-focus tooltip, and tooltips stay inside the chart.
- "Show as table" for the daily numbers, and a per-key table.
- Series colours are the reference categorical slots 1 and 2, validated with the dataviz palette checker on the app's light (#ffffff) and dark (#1e293b) card surfaces: all checks pass. Dark mode uses its own steps.

Not built yet: requiring a confirmed email before upgrading, SSO or social login, two-factor authentication, per-key scopes or expiry dates, usage history beyond the current month, and CSV export.

## 4. Market research

| Product type | Examples | What it offers | Northstar status |
| --- | --- | --- | --- |
| Government newcomer apps | Welcome to Canada (PeaceGeeks), IRCC Settlement Services tool, Job Bank, CRA and Service Canada accounts | Settlement information, city comparison, service finder, job search | City comparison, roadmap, agencies list exist; job search links out |
| Newcomer settlement apps | Arrive (RBC), MoveCa | Checklists, city guides, mentoring, AI helper | Checklists, roadmap and AI-checked answers exist; mentoring is not in scope |
| Immigration case software for professionals | Docketwise (about USD 80–140 per user per month), eImmigration (about USD 55–100), INSZoom, LegistAI | Smart forms, case tracking, client portals, document requests, e-signature, AI drafting | GCMS analyzer, form auto-fill and legal notices exist; case management, client portal and e-signature do not |
| Credit history portability | Nova Credit Credit Passport with RBC and Scotiabank | Converts a foreign credit history into a Canadian equivalent for some countries | Credit simulator and banking comparator exist; no partner integration |
| Calculators | CLB converters, CRS calculators, proof-of-funds calculators, processing-time lookups | Quick self-checks | CRS existed; **CLB converter and proof of funds added**; processing times need live IRCC data |

Pricing for the Team plan was set with professional tools in mind. Per-user case software costs USD 55–140 per month, so a CAD 99 team plan for a small practice sits below that, while offering less: there is no case management.

## 5. Tools added from the research

| Tool | Endpoint | Tier | Notes |
| --- | --- | --- | --- |
| Language score → CLB/NCLC | `/v1/tools/language-score-clb` | core | IELTS General, CELPIP-General, PTE Core, TEF Canada, TCF Canada, per skill and overall. Explains that IELTS Academic, PTE Academic and CELPIP LS are not accepted. Uses a reference copy of IRCC's equivalency charts and links to them. |
| Express Entry proof of funds | `/v1/tools/proof-of-funds` | core | Uses the amounts effective 7 July 2025 (CAD 15,263 for one person, plus CAD 4,112 for each member beyond seven). Covers CEC and job-offer exemptions, shortfall and a 10% buffer, and the rules on which funds count. |

Both answer over GET and POST, are in OpenAPI, and are tested in `test/new-research-tools.test.js`.

## 6. Not built yet, and why

| Gap | Why it is not built yet |
| --- | --- |
| Billing (Stripe or similar), invoices, taxes | Needs a provider choice, a business entity and tax registration. |
| SSO, two-factor authentication | Need an identity decision (B8). Email and password login, email verification and emailed resets are built; a production Resend sender domain still has to be set up. |
| IRCC processing times, draw tracker, application status | Need live official data feeds and licence terms; static numbers would mislead. |
| Case management, client portal, e-signature (Pro/Team) | A separate product line with stronger privacy and retention duties. |
| Credit Passport-style integrations | Partner agreements. |
| Per-seat team management and shared usage | Team accounts share one quota today; seats are not modelled. |
| ~~Lazy tool loading in the free (non-SaaS) site~~ | Done: tools now run their example only when their view is first opened. A page load sends 5 `/v1` requests instead of 68. |

## Sources

- [Welcome to Canada app (PeaceGeeks)](https://www.peacegeeks.org/projects/welcome-to-canada)
- [CIC News: apps to prepare for your move to Canada](https://www.cicnews.com/2024/07/15-apps-to-download-before-you-arrive-in-canada-0745227.html)
- [MoveCa newcomer guide](https://moveca.app/)
- [Docketwise pricing](https://www.docketwise.com/pricing/)
- [Immigration software pricing comparison 2026](https://inceptionai.co/immigration-software-pricing-comparison/)
- [Immigration law software pricing 2026, vendor by vendor](https://permtracker.app/blog/immigration-software-pricing-2026)
- [RBC Global Credit Connect with Nova Credit](https://www.novacredit.com/corporate-blog/nova-credit-announces-new-partnership-with-royal-bank-of-canada)
- [IRCC language test equivalency charts](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/standard-requirements/language-requirements/test-equivalency-charts.html)
- [Proof of funds for Express Entry in 2026 (secondary source; confirm on canada.ca)](https://www.panelphysician.ca/blog/proof-of-funds-express-entry-how-much-you-need)
- [CIC News: personalized processing times](https://www.cicnews.com/2025/10/permanent-residence-and-citizenship-applicants-can-now-look-up-personalized-processing-times-1060927.html)
- [IRCC eTA eligibility](https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta/eligibility/eta-x.html)
