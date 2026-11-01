// Cloudflare Edge CDN Worker Template (Rec 155)
// Deploys to Cloudflare Workers / Fastly Compute@Edge for sub-10ms global edge caching.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Bypass cache for mutations, admin sessions, and personalized POST questions
    if (request.method !== 'GET' || url.pathname.startsWith('/admin')) {
      return fetch(request);
    }

    const cache = caches.default;
    let response = await cache.match(request);

    if (response) {
      return response;
    }

    response = await fetch(request);

    // Cache static immutable assets for 24h at the edge
    if (response.status === 200) {
      const headers = new Headers(response.headers);
      if (
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.startsWith('/v1/topics') ||
        url.pathname.startsWith('/v1/corridors') ||
        url.pathname.startsWith('/v1/coverage')
      ) {
        headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=600');
        headers.set('X-Edge-Cache', 'HIT-CLOUDFLARE');
        const edgeResponse = new Response(response.body, { ...response, headers });
        ctx.waitUntil(cache.put(request, edgeResponse.clone()));
        return edgeResponse;
      }
    }

    return response;
  }
};
