import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ThompBui from './ThompBui.jsx';
import CallbackPage from './auth/CallbackPage.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import { AppPreferencesProvider } from './context/AppPreferencesContext.jsx';
import { applyThemeToDocument, applyLocaleToDocument, loadAppPreferences } from './utils/appPreferencesStorage.js';

const prefs = loadAppPreferences();
applyThemeToDocument(prefs.theme);
applyLocaleToDocument(prefs.locale);

// Simple path router checker to support Callback page without React Router package bloat
const isCallbackPath = window.location.pathname === '/auth/callback';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AppPreferencesProvider>
        {isCallbackPath ? (
          <CallbackPage />
        ) : (
          <ProtectedRoute>
            <ThompBui />
          </ProtectedRoute>
        )}
      </AppPreferencesProvider>
    </AuthProvider>
  </StrictMode>,
);