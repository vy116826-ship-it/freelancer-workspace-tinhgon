import { SERVICES } from '../config/services';

const BASE = SERVICES.mautic.baseUrl;
const USERNAME = import.meta.env.VITE_MAUTIC_USERNAME || '';
const PASSWORD = import.meta.env.VITE_MAUTIC_PASSWORD || '';

/**
 * Internal fetch for Mautic — uses Basic Auth.
 * @param {string} path
 * @param {RequestInit} [options={}]
 * @returns {Promise<any|null>}
 */
async function mauticFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (USERNAME && PASSWORD) {
    headers['Authorization'] = `Basic ${btoa(`${USERNAME}:${PASSWORD}`)}`;
  }

  try {
    const res = await fetch(`${BASE}${path}`, { ...options, headers });
    if (!res.ok) {
      console.error(`[mautic] ${res.status} ${path}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`[mautic] Network error ${path}`, err);
    return null;
  }
}

/**
 * List all campaigns.
 * @returns {Promise<any[]>}
 */
export async function getCampaigns() {
  const data = await mauticFetch('/api/campaigns');
  return data?.campaigns ? Object.values(data.campaigns) : [];
}

/**
 * Get a single campaign by ID.
 * @param {string|number} id
 * @returns {Promise<object|null>}
 */
export async function getCampaign(id) {
  const data = await mauticFetch(`/api/campaigns/${id}`);
  return data?.campaign ?? null;
}

/**
 * List contacts.
 * @param {Record<string,string>} [params={}] — search, orderBy, limit, …
 * @returns {Promise<any[]>}
 */
export async function getContacts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const data = await mauticFetch(`/api/contacts${qs ? `?${qs}` : ''}`);
  return data?.contacts ? Object.values(data.contacts) : [];
}

/**
 * List all emails.
 * @returns {Promise<any[]>}
 */
export async function getEmails() {
  const data = await mauticFetch('/api/emails');
  return data?.emails ? Object.values(data.emails) : [];
}
