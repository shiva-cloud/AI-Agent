// Per-User Daily Token Quota & Cost Shield (Rec 112)
// Enforces a strict daily token budget per client IP/session,
// preventing billing overruns and DDoS depletion.

export class DailyTokenQuotaManager {
  constructor({ dailyTokenCap = 50_000 } = {}) {
    this.dailyTokenCap = dailyTokenCap;
    this.buckets = new Map(); // key -> { day: 'YYYY-MM-DD', used: N }
  }

  getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  checkQuota(clientId, estimatedTokens = 1000) {
    const today = this.getTodayKey();
    let bucket = this.buckets.get(clientId);

    if (!bucket || bucket.day !== today) {
      bucket = { day: today, used: 0 };
      this.buckets.set(clientId, bucket);
    }

    if (bucket.used + estimatedTokens > this.dailyTokenCap) {
      return {
        allowed: false,
        used: bucket.used,
        cap: this.dailyTokenCap,
        remaining: Math.max(0, this.dailyTokenCap - bucket.used),
        resetsAt: `${today}T23:59:59Z`
      };
    }

    return {
      allowed: true,
      used: bucket.used,
      cap: this.dailyTokenCap,
      remaining: this.dailyTokenCap - (bucket.used + estimatedTokens)
    };
  }

  recordUsage(clientId, actualTokens) {
    const today = this.getTodayKey();
    let bucket = this.buckets.get(clientId);

    if (!bucket || bucket.day !== today) {
      bucket = { day: today, used: 0 };
      this.buckets.set(clientId, bucket);
    }

    bucket.used += Math.max(0, actualTokens);
    return bucket.used;
  }

  getCostSummary({ pricePerMillionTokens = 0.50 } = {}) {
    let totalTokens = 0;
    const clientBreakdown = [];
    for (const [clientId, data] of this.buckets) {
      totalTokens += data.used;
      const estimatedCostUsd = Number(((data.used / 1_000_000) * pricePerMillionTokens).toFixed(4));
      clientBreakdown.push({ clientId, day: data.day, tokensUsed: data.used, estimatedCostUsd });
    }
    const totalCostUsd = Number(((totalTokens / 1_000_000) * pricePerMillionTokens).toFixed(4));
    return {
      totalTokens,
      totalCostUsd,
      pricePerMillionTokens,
      activeClientsCount: this.buckets.size,
      clientBreakdown
    };
  }
}

export const defaultTokenQuotaManager = new DailyTokenQuotaManager();
