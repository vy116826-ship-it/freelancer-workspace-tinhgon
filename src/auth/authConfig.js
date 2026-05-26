// OIDC Authentication Client Configuration
export const AUTH_CONFIG = {
  authority: import.meta.env.VITE_AUTH_URL || 'https://auth.tinhgon.com',
  clientId: import.meta.env.VITE_AUTH_CLIENT_ID || '7SDsAvsF294WlZiwsjkShu6BvEQ5mY6MOS09kGEt',
  redirectUri: `${window.location.origin}/auth/callback`,
  postLogoutRedirectUri: window.location.origin,
  scope: 'openid email profile workspace-roles',
};
