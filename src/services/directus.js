import { SERVICES } from '../config/services';
import { apiFetch, setAuthToken } from './api';

const BASE = SERVICES.directus.baseUrl;

/**
 * Authenticate with Directus.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{access_token:string, refresh_token:string}|null>}
 */
export async function login(email, password) {
  const data = await apiFetch(`${BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data?.data?.access_token) {
    setAuthToken(data.data.access_token);
  }
  return data?.data ?? null;
}

/**
 * Refresh an expired access token.
 * @param {string} refreshToken
 * @returns {Promise<{access_token:string, refresh_token:string}|null>}
 */
export async function refreshToken(refreshToken) {
  const data = await apiFetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken, mode: 'json' }),
  });
  if (data?.data?.access_token) {
    setAuthToken(data.data.access_token);
  }
  return data?.data ?? null;
}

/**
 * Get the currently authenticated user profile.
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser() {
  const data = await apiFetch(`${BASE}/users/me`);
  return data?.data ?? null;
}

/**
 * List items from a Directus collection.
 * @param {string} collection
 * @param {Record<string,string>} [params={}] — Directus query params (fields, filter, sort, limit, …)
 * @returns {Promise<any[]>}
 */
export async function getItems(collection, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE}/items/${collection}${qs ? `?${qs}` : ''}`;
  const data = await apiFetch(url);
  return data?.data ?? [];
}

/**
 * Create a new item in a Directus collection.
 * @param {string} collection
 * @param {object} itemData
 * @returns {Promise<object|null>}
 */
export async function createItem(collection, itemData) {
  const data = await apiFetch(`${BASE}/items/${collection}`, {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
  return data?.data ?? null;
}

/**
 * Update an existing item.
 * @param {string} collection
 * @param {string|number} id
 * @param {object} itemData
 * @returns {Promise<object|null>}
 */
export async function updateItem(collection, id, itemData) {
  const data = await apiFetch(`${BASE}/items/${collection}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(itemData),
  });
  return data?.data ?? null;
}

/**
 * Delete an item from a collection.
 * @param {string} collection
 * @param {string|number} id
 * @returns {Promise<boolean>}
 */
export async function deleteItem(collection, id) {
  const result = await apiFetch(`${BASE}/items/${collection}/${id}`, {
    method: 'DELETE',
  });
  // DELETE returns 204 (null from apiFetch) on success
  return result === null;
}
