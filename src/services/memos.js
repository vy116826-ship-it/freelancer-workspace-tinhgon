import { SERVICES } from '../config/services';
import { apiFetch } from './api';

const BASE = SERVICES.memos.baseUrl;

/**
 * List memos.
 * @param {Record<string,string>} [params={}] — pageSize, pageToken, filter, …
 * @returns {Promise<any[]>}
 */
export async function getMemos(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const data = await apiFetch(`${BASE}/api/v1/memos${qs ? `?${qs}` : ''}`);
  return data?.memos ?? [];
}

/**
 * Get a single memo by resource name (e.g. "memos/123").
 * @param {string} name — resource name like "memos/123"
 * @returns {Promise<object|null>}
 */
export async function getMemo(name) {
  return apiFetch(`${BASE}/api/v1/${name}`);
}

/**
 * Create a new memo.
 * @param {string} content — markdown content
 * @param {'PRIVATE'|'PROTECTED'|'PUBLIC'} [visibility='PRIVATE']
 * @returns {Promise<object|null>}
 */
export async function createMemo(content, visibility = 'PRIVATE') {
  return apiFetch(`${BASE}/api/v1/memos`, {
    method: 'POST',
    body: JSON.stringify({ content, visibility }),
  });
}

/**
 * Update memo content.
 * @param {string} name — resource name like "memos/123"
 * @param {string} content
 * @returns {Promise<object|null>}
 */
export async function updateMemo(name, content) {
  return apiFetch(`${BASE}/api/v1/${name}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });
}

/**
 * Delete a memo.
 * @param {string} name — resource name like "memos/123"
 * @returns {Promise<boolean>}
 */
export async function deleteMemo(name) {
  const result = await apiFetch(`${BASE}/api/v1/${name}`, { method: 'DELETE' });
  return result === null; // 204 → success
}
