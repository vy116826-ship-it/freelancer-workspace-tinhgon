import { SERVICES } from '../config/services';

const BASE = SERVICES.glances.baseUrl;

/**
 * Internal fetch for Glances (no auth required).
 * @param {string} path
 * @returns {Promise<any|null>}
 */
async function glancesFetch(path) {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) {
      console.error(`[glances] ${res.status} ${path}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`[glances] Network error ${path}`, err);
    return null;
  }
}

/**
 * Get full system snapshot (CPU, mem, disk, network, processes, …).
 * @returns {Promise<object|null>}
 */
export async function getSystemInfo() {
  return glancesFetch('/api/4/all');
}

/**
 * Get CPU usage metrics.
 * @returns {Promise<object|null>}
 */
export async function getCpu() {
  return glancesFetch('/api/4/cpu');
}

/**
 * Get memory usage metrics.
 * @returns {Promise<object|null>}
 */
export async function getMemory() {
  return glancesFetch('/api/4/mem');
}

/**
 * Get disk I/O metrics.
 * @returns {Promise<any[]>}
 */
export async function getDiskIO() {
  const data = await glancesFetch('/api/4/diskio');
  return Array.isArray(data) ? data : [];
}

/**
 * Get network interface metrics.
 * @returns {Promise<any[]>}
 */
export async function getNetwork() {
  const data = await glancesFetch('/api/4/network');
  return Array.isArray(data) ? data : [];
}

/**
 * Get Docker container metrics.
 * @returns {Promise<any[]>}
 */
export async function getContainers() {
  const data = await glancesFetch('/api/4/containers');
  return Array.isArray(data) ? data : [];
}
