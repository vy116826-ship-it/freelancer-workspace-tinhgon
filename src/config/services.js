/** Service endpoint configuration — all URLs use Nginx reverse proxy */

export const SERVICES = {
  directus: { baseUrl: import.meta.env.VITE_DIRECTUS_URL || '/api/directus', name: 'Directus' },
  n8n: { baseUrl: import.meta.env.VITE_N8N_URL || '/api/n8n', name: 'N8N' },
  espocrm: { baseUrl: import.meta.env.VITE_ESPOCRM_URL || '/api/espocrm', name: 'EspoCRM' },
  portainer: { baseUrl: import.meta.env.VITE_PORTAINER_URL || '/api/portainer', name: 'Portainer' },
  glances: { baseUrl: import.meta.env.VITE_GLANCES_URL || '/api/glances', name: 'Glances' },
  mautic: { baseUrl: import.meta.env.VITE_MAUTIC_URL || '/api/mautic', name: 'Mautic' },
  memos: { baseUrl: import.meta.env.VITE_MEMOS_URL || '/api/memos', name: 'Memos' },
  appsmith: { baseUrl: import.meta.env.VITE_APPSMITH_URL || 'https://dashboard.tinhgon.com', name: 'Appsmith' },
  chatwoot: { baseUrl: import.meta.env.VITE_CHATWOOT_URL || '/api/chatwoot', name: 'Chatwoot' },
  homepage: { baseUrl: import.meta.env.VITE_HOMEPAGE_URL || 'https://home.tinhgon.com', name: 'Homepage' },
  databasement: { baseUrl: import.meta.env.VITE_DATABASEMENT_URL || 'https://db.tinhgon.com', name: 'Databasement' },
  evisaBackend: { baseUrl: import.meta.env.VITE_EVISA_BACKEND_URL || 'https://backend.evisavietnamservice.com', name: 'eVisa Backend' },
};

/** Public URLs for health check pings (bypass proxy) */
export const HEALTH_CHECK_SERVICES = [
  { id: 'workspace', name: 'Workspace', url: 'https://workspace.tinhgon.com', icon: 'LayoutDashboard' },
  { id: 'n8n', name: 'N8N', url: 'https://automation.tinhgon.com', icon: 'Workflow' },
  { id: 'directus', name: 'Directus', url: 'https://api-builder.tinhgon.com', icon: 'Database' },
  { id: 'appsmith', name: 'Appsmith', url: 'https://dashboard.tinhgon.com', icon: 'BarChart3' },
  { id: 'databasement', name: 'Databasement', url: 'https://db.tinhgon.com', icon: 'HardDrive' },
  { id: 'memos', name: 'Memos', url: 'https://notes.tinhgon.com', icon: 'StickyNote' },
  { id: 'homepage', name: 'Homepage', url: 'https://home.tinhgon.com', icon: 'Home' },
  { id: 'glances', name: 'Glances', url: 'https://glances.tinhgon.com', icon: 'Activity' },
  { id: 'portainer', name: 'Portainer', url: 'https://portainer.tinhgon.com', icon: 'Container' },
  { id: 'espocrm', name: 'EspoCRM', url: 'https://evisacrm.tinhgon.com', icon: 'Users' },
  { id: 'chatwoot', name: 'Chatwoot', url: 'https://chat.evisavietnamservice.com', icon: 'MessageCircle' },
  { id: 'mautic', name: 'Mautic', url: 'https://mautic.evisavietnamservice.com', icon: 'Mail' },
];

/** Feature flags */
export const FEATURES = {
  auth: import.meta.env.VITE_ENABLE_AUTH !== 'false',
  crmSync: import.meta.env.VITE_ENABLE_CRM_SYNC !== 'false',
  n8nPanel: import.meta.env.VITE_ENABLE_N8N_PANEL !== 'false',
  monitoring: import.meta.env.VITE_ENABLE_MONITORING !== 'false',
};
