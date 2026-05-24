import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ThompBui from './ThompBui.jsx';
import { AppPreferencesProvider } from './context/AppPreferencesContext.jsx';
import { AuthProvider } from './components/auth/AuthProvider.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import { applyThemeToDocument, applyLocaleToDocument, loadAppPreferences } from './utils/appPreferencesStorage.js';
import { FEATURES } from './config/services.js';

const prefs = loadAppPreferences();
applyThemeToDocument(prefs.theme);
applyLocaleToDocument(prefs.locale);

const App = FEATURES.auth ? (
  <StrictMode>
    <AppPreferencesProvider>
      <AuthProvider>
        <ProtectedRoute>
          <ThompBui />
        </ProtectedRoute>
      </AuthProvider>
    </AppPreferencesProvider>
  </StrictMode>
) : (
  <StrictMode>
    <AppPreferencesProvider>
      <ThompBui />
    </AppPreferencesProvider>
  </StrictMode>
);

createRoot(document.getElementById('root')).render(App);