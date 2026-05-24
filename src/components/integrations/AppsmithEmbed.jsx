import { useState } from 'react';
import { BarChart3, Loader2, AlertCircle } from 'lucide-react';
import { SERVICES } from '../../config/services.js';
import { useAppPreferences } from '../../context/AppPreferencesContext.jsx';

export default function AppsmithEmbed() {
  const { t } = useAppPreferences();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const embedUrl = SERVICES.appsmith.baseUrl;

  return (
    <div className="page-shell animate-fade-in no-print">
      <div className="page-header page-header-block">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <BarChart3 size={22} className="text-indigo-400" />
            {t('appsmithPanel.title')}
          </h2>
          <p className="page-desc">{t('appsmithPanel.desc')}</p>
        </div>
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
        >
          Open in new tab ↗
        </a>
      </div>

      <div className="page-card !p-0 relative overflow-hidden" style={{ minHeight: '70vh' }}>
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-indigo-500" />
              <p className="text-sm text-slate-400">{t('appsmithPanel.loading')}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
            <div className="flex flex-col items-center gap-3 text-center px-4">
              <AlertCircle size={40} className="text-rose-500" />
              <p className="text-sm text-slate-400">{t('appsmithPanel.error')}</p>
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-400 hover:text-indigo-300 underline"
              >
                {embedUrl}
              </a>
            </div>
          </div>
        )}

        <iframe
          src={embedUrl}
          title="Appsmith Dashboard"
          className="w-full h-full border-0"
          style={{ minHeight: '70vh' }}
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
