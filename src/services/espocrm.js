import { SERVICES } from '../config/services';

const BASE = SERVICES.espocrm.baseUrl;
const API_KEY = import.meta.env.VITE_ESPOCRM_API_KEY || '';

/**
 * Internal fetch for EspoCRM — uses X-Api-Key header.
 * @param {string} path
 * @param {RequestInit} [options={}]
 * @returns {Promise<any|null>}
 */
async function espoFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Api-Key': API_KEY,
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE}${path}`, { ...options, headers });
    if (!res.ok) {
      console.error(`[espocrm] ${res.status} ${path}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`[espocrm] Network error ${path}`, err);
    return null;
  }
}

/**
 * List contacts.
 * @param {Record<string,string>} [params={}] — where, orderBy, maxSize, offset, …
 * @returns {Promise<any[]>}
 */
export async function getContacts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const data = await espoFetch(`/api/v1/Contact${qs ? `?${qs}` : ''}`);
  return data?.list ?? [];
}

/**
 * Get a single contact by ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function getContact(id) {
  return espoFetch(`/api/v1/Contact/${id}`);
}

/**
 * List accounts.
 * @param {Record<string,string>} [params={}]
 * @returns {Promise<any[]>}
 */
export async function getAccounts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const data = await espoFetch(`/api/v1/Account${qs ? `?${qs}` : ''}`);
  return data?.list ?? [];
}

/**
 * List opportunities (deals).
 * @param {Record<string,string>} [params={}]
 * @returns {Promise<any[]>}
 */
export async function getOpportunities(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const data = await espoFetch(`/api/v1/Opportunity${qs ? `?${qs}` : ''}`);
  return data?.list ?? [];
}
