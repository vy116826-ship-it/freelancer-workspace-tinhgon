import { SERVICES } from '../config/services';

const BASE = SERVICES.n8n.baseUrl;
const API_KEY = import.meta.env.VITE_N8N_API_KEY || '';

/**
 * Internal fetch for N8N — uses X-N8N-API-KEY auth.
 * @param {string} path
 * @param {RequestInit} [options={}]
 * @returns {Promise<any|null>}
 */
async function n8nFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': API_KEY,
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE}${path}`, { ...options, headers });
    if (!res.ok) {
      console.error(`[n8n] ${res.status} ${path}`);
      return null;
    }
    if (res.status === 204) return null;
    return await res.json();
  } catch (err) {
    console.error(`[n8n] Network error ${path}`, err);
    return null;
  }
}

/**
 * List all workflows.
 * @returns {Promise<any[]>}
 */
export async function getWorkflows() {
  const data = await n8nFetch('/api/v1/workflows');
  return data?.data ?? [];
}

/**
 * Get a single workflow by ID.
 * @param {string|number} id
 * @returns {Promise<object|null>}
 */
export async function getWorkflow(id) {
  return n8nFetch(`/api/v1/workflows/${id}`);
}

/**
 * Activate a workflow.
 * @param {string|number} id
 * @returns {Promise<object|null>}
 */
export async function activateWorkflow(id) {
  return n8nFetch(`/api/v1/workflows/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ active: true }),
  });
}

/**
 * Deactivate a workflow.
 * @param {string|number} id
 * @returns {Promise<object|null>}
 */
export async function deactivateWorkflow(id) {
  return n8nFetch(`/api/v1/workflows/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ active: false }),
  });
}

/**
 * Manually execute a workflow.
 * @param {string|number} id
 * @returns {Promise<object|null>}
 */
export async function executeWorkflow(id) {
  return n8nFetch(`/api/v1/workflows/${id}/execute`, { method: 'POST' });
}

/**
 * List executions, optionally filtered by workflow.
 * @param {string|number} [workflowId]
 * @param {number} [limit=10]
 * @returns {Promise<any[]>}
 */
export async function getExecutions(workflowId, limit = 10) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (workflowId) params.set('workflowId', String(workflowId));
  const data = await n8nFetch(`/api/v1/executions?${params}`);
  return data?.data ?? [];
}
