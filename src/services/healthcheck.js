import { HEALTH_CHECK_SERVICES } from '../config/services';

const CACHE_TTL_MS = 60_000;
let cache = null;
let cacheTimestamp = 0;

/**
 * Ping a single service URL.
 * @param {string} url — public URL to probe
 * @param {number} [timeout=5000] — ms before abort
 * @returns {Promise<{status:'online'|'offline'|'slow', responseTime:number}>}
 */
export async function checkServiceHealth(url, timeout = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const start = performance.now();

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });
    const responseTime = Math.round(performance.now() - start);
    clearTimeout(timer);

    // no-cors returns opaque response (status 0) — treat as online
    const status = res.type === 'opaque' || res.ok
      ? (responseTime > 3000 ? 'slow' : 'online')
      : 'offline';

    return { status, responseTime };
  } catch {
    clearTimeout(timer);
    const responseTime = Math.round(performance.now() - start);
    return { status: 'offline', responseTime };
  }
}

/**
 * Health-check every service in HEALTH_CHECK_SERVICES.
 * Results are cached in memory for 60 s.
 * @param {boolean} [forceRefresh=false]
 * @returns {Promise<Array<{id:string, name:string, url:string, icon:string, status:string, responseTime:number}>>}
 */
export async function checkAllServices(forceRefresh = false) {
  if (!forceRefresh && cache && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cache;
  }

  const results = await Promise.allSettled(
    HEALTH_CHECK_SERVICES.map(async (svc) => {
      const health = await checkServiceHealth(svc.url);
      return { ...svc, ...health };
    }),
  );

  cache = results.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : { ...HEALTH_CHECK_SERVICES[0], status: 'offline', responseTime: 0 },
  );
  cacheTimestamp = Date.now();

  return cache;
}
