import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AUTH_CONFIG } from './authConfig.js';
import { mapAuthentikGroupToRole } from '../config/roles.js';

const AuthContext = createContext(null);

// Decodes JWT tokens locally to read payload without validation
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth State from sessionStorage
  const initAuth = useCallback(() => {
    const idToken = sessionStorage.getItem('workspace_id_token');
    const accessToken = sessionStorage.getItem('workspace_access_token');
    
    if (idToken && accessToken) {
      const claims = parseJwt(idToken);
      if (claims && claims.exp * 1000 > Date.now()) {
        const groups = claims.workspace_roles || [];
        const role = mapAuthentikGroupToRole(groups);
        
        setUser({
          id: claims.sub,
          name: claims.name || claims.nickname || claims.username || claims.email,
          email: claims.email,
          role: role,
          groups: groups,
        });
        setIsAuthenticated(true);
      } else {
        // Token expired
        sessionStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Authorization Redirect
  const login = useCallback(() => {
    const state = Math.random().toString(36).substring(2, 15);
    const nonce = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('oidc_state', state);
    
    // Authorization Endpoint
    const url = `${AUTH_CONFIG.authority}/application/o/authorize/` +
      `?client_id=${AUTH_CONFIG.clientId}` +
      `&redirect_uri=${encodeURIComponent(AUTH_CONFIG.redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(AUTH_CONFIG.scope)}` +
      `&state=${state}` +
      `&nonce=${nonce}`;
      
    window.location.href = url;
  }, []);

  // Token exchange callback handling
  const handleCallback = useCallback(async (code, state) => {
    setIsLoading(true);
    const savedState = sessionStorage.getItem('oidc_state');
    if (savedState && savedState !== state) {
      console.error('State mismatch error.');
      setIsLoading(false);
      return false;
    }

    try {
      const tokenUrl = `${AUTH_CONFIG.authority}/application/o/token/`;
      const body = new URLSearchParams({
        client_id: AUTH_CONFIG.clientId,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: AUTH_CONFIG.redirectUri,
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }

      const tokens = await response.json();
      sessionStorage.setItem('workspace_access_token', tokens.access_token);
      sessionStorage.setItem('workspace_id_token', tokens.id_token);
      
      initAuth();
      return true;
    } catch (e) {
      console.error('Token exchange error:', e);
      setIsLoading(false);
      return false;
    }
  }, [initAuth]);

  // Log out session
  const logout = useCallback(() => {
    const idToken = sessionStorage.getItem('workspace_id_token');
    sessionStorage.clear();
    setUser(null);
    setIsAuthenticated(false);

    // Redirect to Authentik logout endpoint
    let url = `${AUTH_CONFIG.authority}/application/o/workspace/end-session/`;
    if (idToken) {
      url += `?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(AUTH_CONFIG.postLogoutRedirectUri)}`;
    }
    window.location.href = url;
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    handleCallback
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
