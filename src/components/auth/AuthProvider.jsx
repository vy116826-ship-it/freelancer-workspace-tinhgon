import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { login as directusLogin, getCurrentUser } from '../../services/directus.js';
import { getAuthToken, setAuthToken, clearAuthToken, setRefreshToken } from '../../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // On mount: validate existing token
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    getCurrentUser()
      .then((u) => { if (u) setUser(u); })
      .catch(() => clearAuthToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await directusLogin(email, password);
    if (!result) throw new Error('Login failed');
    setAuthToken(result.access_token);
    if (result.refresh_token) setRefreshToken(result.refresh_token);
    const me = await getCurrentUser();
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
