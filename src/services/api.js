const TOKEN_KEY = 'auth_token';

/**
 * Read the JWT token from localStorage.
 * @returns {string|null}
 */
export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Persist a JWT token to localStorage.
 * @param {string} token
 */
export function setAuthToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch { /* SSR or storage-full — silently ignore */ }
}

/**
 * Remove the stored JWT token.
 */
export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('refresh_token');
  } catch { /* noop */ }
}

/**
 * Persist the refresh token.
 * @param {string} token
 */
export function setRefreshToken(token) {
  try { localStorage.setItem('refresh_token', token); } catch { /* noop */ }
}

/**
 * Read the refresh token.
 * @returns {string|null}
 */
export function getRefreshToken() {
  try { return localStorage.getItem('refresh_token'); } catch { return null; }
}

/**
 * Authenticated fetch wrapper.
 * - Injects Authorization header when a token exists.
 * - On 401, clears the token and redirects to `/login`.
 * - Returns the parsed JSON body, or `null` on error.
 *
 * @param {string} url  — absolute or relative URL
 * @param {RequestInit} [options={}]
 * @returns {Promise<any|null>}
 */
export async function apiFetch(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      clearAuthToken();
      window.location.href = '/login';
      return null;
    }

    if (response.status === 204) return null;

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      console.error(`[apiFetch] ${response.status} ${url}`, errorBody);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error(`[apiFetch] Network error ${url}`, err);
    return null;
  }
}
