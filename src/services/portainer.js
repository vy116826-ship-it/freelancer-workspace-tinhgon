import { SERVICES } from '../config/services';

const BASE = SERVICES.portainer.baseUrl;
const API_KEY = import.meta.env.VITE_PORTAINER_API_KEY || '';

/**
 * Internal fetch for Portainer — uses X-API-Key header (read-only).
 * @param {string} path
 * @returns {Promise<any|null>}
 */
async function portainerFetch(path) {
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  };

  try {
    const res = await fetch(`${BASE}${path}`, { headers });
    if (!res.ok) {
      console.error(`[portainer] ${res.status} ${path}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`[portainer] Network error ${path}`, err);
    return null;
  }
}

/**
 * List all Portainer endpoints (environments).
 * @returns {Promise<any[]>}
 */
export async function getEndpoints() {
  const data = await portainerFetch('/api/endpoints');
  return Array.isArray(data) ? data : [];
}

/**
 * List all containers for a given endpoint.
 * @param {string|number} endpointId
 * @returns {Promise<any[]>}
 */
export async function getContainers(endpointId) {
  const data = await portainerFetch(
    `/api/endpoints/${endpointId}/docker/containers/json?all=true`,
  );
  return Array.isArray(data) ? data : [];
}

/**
 * Get resource stats for a specific container (CPU, memory, network).
 * @param {string|number} endpointId
 * @param {string} containerId
 * @returns {Promise<object|null>}
 */
export async function getContainerStats(endpointId, containerId) {
  return portainerFetch(
    `/api/endpoints/${endpointId}/docker/containers/${containerId}/stats?stream=false`,
  );
}
