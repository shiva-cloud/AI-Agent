/**
 * Real-Time Alert & Notification Dispatcher
 * 
 * Formats and broadcasts detected policy changes and breaking alerts
 * to admin webhooks (Slack, Discord, Telegram, or custom endpoints).
 */

import { publicHttpsUrl } from './crawl-policy.js';
import { signWebhookBody } from './alert-webhook.js';

export function formatSlackMessage(alert) {
  const geo = [alert.city, alert.region, alert.country].filter(Boolean).join(', ');
  return {
    text: `🚨 Real-Time Policy Alert: ${alert.headline} (${geo})`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 Real-Time Immigration & Settlement Update',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Location:*\n${geo}` },
          { type: 'mrkdwn', text: `*Topic:*\n${alert.topic} (${alert.tier || 'national'})` },
          { type: 'mrkdwn', text: `*Risk Level:*\n${alert.risk.toUpperCase()}` },
          { type: 'mrkdwn', text: `*Detected At:*\n${alert.detectedAt}` }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Headline:*\n${alert.headline}\n\n*Summary:*\n${alert.summary}\n\n*Source:* <${alert.url}|Official Publication Link>`
        }
      }
    ]
  };
}

export function formatTelegramMessage(alert) {
  const geo = [alert.city, alert.region, alert.country].filter(Boolean).join(', ');
  return [
    '🚨 *REAL-TIME POLICY ALERT*',
    `📍 *Location:* ${geo}`,
    `📋 *Topic:* ${alert.topic}`,
    `⚠️ *Risk:* ${alert.risk.toUpperCase()}`,
    `⏰ *Detected:* ${alert.detectedAt.slice(0, 16)}`,
    '',
    `*Headline:* ${alert.headline}`,
    '',
    `*Summary:* ${alert.summary}`,
    '',
    `🔗 [Official Government Notice](${alert.url})`
  ].join('\n');
}

export async function dispatchAlertWebhook(alert, webhookConfig = {}, fetcher = fetch) {
  if (!webhookConfig.url) return { dispatched: false, reason: 'no_webhook_url_configured' };
  const target=publicHttpsUrl(webhookConfig.url);
  if(webhookConfig.secret!==undefined&&(typeof webhookConfig.secret!=='string'||webhookConfig.secret.length<32))throw new Error('Webhook secret requires at least 32 characters');
  const timeoutMs=webhookConfig.timeoutMs??8000;
  if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>30000)throw new Error('Invalid webhook timeout');

  let body;
  if (webhookConfig.type === 'slack' || webhookConfig.type === 'discord') {
    body = JSON.stringify(formatSlackMessage(alert));
  } else if (webhookConfig.type === 'telegram') {
    body = JSON.stringify({
      chat_id: webhookConfig.telegramChatId || '@northstar_alerts',
      text: formatTelegramMessage(alert),
      parse_mode: 'Markdown'
    });
  } else {
    // Generic JSON payload
    body = JSON.stringify({
      event: 'realtime_policy_alert',
      alert,
      dispatchedAt: new Date().toISOString()
    });
  }

  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
  const timestamp=String(Math.floor(Date.now()/1000));
  try {
    const request=fetcher(target.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(webhookConfig.idempotencyKey?{'Idempotency-Key':webhookConfig.idempotencyKey}:{}), ...(webhookConfig.secret?{'X-Northstar-Timestamp':timestamp,'X-Northstar-Signature':signWebhookBody(webhookConfig.secret,timestamp,body)}:{}) },
      body, signal:controller.signal, redirect:'error'
    });
    const res=await Promise.race([request,new Promise((_,reject)=>controller.signal.addEventListener('abort',()=>reject(new Error('Timeout')),{once:true}))]);
    try{await res.body?.cancel();}catch{}
    return {
      dispatched: Boolean(res.ok),
      status: res.status,
      ok: res.ok
    };
  } catch (err) {
    return {
      dispatched: false,
      error: 'Webhook delivery failed'
    };
  } finally {clearTimeout(timer);}
}
