// Outgoing account email (verification and password reset).
// Providers:
//   console  writes the message to stderr; for local development only (it prints links).
//   resend   sends through the Resend HTTP API (RESEND_API_KEY, EMAIL_FROM).
// A send never throws to the caller: account flows must not reveal whether an email
// exists or whether delivery worked. Failures are reported through onError.

const RESEND_URL = 'https://api.resend.com/emails';

export function createMailer(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    provider = 'console',
    from,
    apiKey,
    fetchImpl = globalThis.fetch,
    write = text => process.stderr.write(text),
    onError = () => {},
    timeoutMs = 10000
  } = safeParams;
  if (!['console', 'resend'].includes(provider)) throw new Error('EMAIL_PROVIDER must be console or resend');
  if (provider === 'resend') {
    if (typeof apiKey !== 'string' || apiKey.length < 10) throw new Error('RESEND_API_KEY is required for the resend provider');
    if (typeof from !== 'string' || from.length > 200 || !/[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+/.test(from)) throw new Error('EMAIL_FROM must be a sender address, for example "Northstar <no-reply@example.com>"');
  }

  async function send({to, subject, text}) {
    try {
      if (provider === 'console') {
        write(`\n[mail:console] to=${to}\nsubject: ${subject}\n\n${text}\n[/mail]\n`);
        return true;
      }
      const response = await fetchImpl(RESEND_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`},
        body: JSON.stringify({from, to: [to], subject, text}),
        signal: AbortSignal.timeout(timeoutMs),
        redirect: 'error'
      });
      try { await response.body?.cancel(); } catch { /* body not needed */ }
      if (!response.ok) throw new Error(`Email provider responded with HTTP ${response.status}`);
      return true;
    } catch (error) {
      onError(error);
      return false;
    }
  }
  return {provider, send};
}

export function mailerFromEnvironment(env = process.env, options = {}) {
  if (!env.EMAIL_PROVIDER) return null;
  return createMailer({provider: env.EMAIL_PROVIDER, from: env.EMAIL_FROM, apiKey: env.RESEND_API_KEY, ...options});
}

export const accountEmails = {
  verify: (link, hours) => ({
    subject: 'Confirm your email for Northstar',
    text: `Confirm your email address by opening this link:\n\n${link}\n\nThe link works once and expires in ${hours} hours. If you did not create a Northstar account, you can ignore this email.`
  }),
  reset: (link, minutes) => ({
    subject: 'Reset your Northstar password',
    text: `Someone asked to reset the password for this email address. To choose a new password, open this link:\n\n${link}\n\nThe link works once and expires in ${minutes} minutes. If you did not ask for this, ignore this email; your password stays the same.`
  })
};
