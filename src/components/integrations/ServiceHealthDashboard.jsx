import { useState, useEffect, useCallback } from 'react';
import {
  Activity, LayoutDashboard, Database, BarChart3, HardDrive,
  StickyNote, Home, Users, MessageCircle, Mail, RefreshCw,
  CheckCircle2, XCircle, Clock, Loader2, Box,
} from 'lucide-react';
import { checkAllServices } from '../../services/healthcheck.js';
import { useAppPreferences } from '../../context/AppPreferencesContext.jsx';

const ICON_MAP = {
  LayoutDashboard, Activity, Database, BarChart3, HardDrive,
  StickyNote, Home, Users, MessageCircle, Mail,
  Workflow: Activity, Container: Box,
};

function StatusDot({ status }) {
  const colors = {
    online: 'bg-emerald-500 shadow-emerald-500/40',
    offline: 'bg-rose-500 shadow-rose-500/40',
    slow: 'bg-amber-500 shadow-amber-500/40',
    checking: 'bg-slate-500 animate-pulse',
  };
  return <span className={`w-2.5 h-2.5 rounded-full shadow-lg ${colors[status] || colors.checking}`} />;
}

export default function ServiceHealthDashboard() {
  const { t } = useAppPreferences();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  const fetchHealth = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await checkAllServices();
      setResults(data);
      setLastCheck(new Date());
    } catch { /* graceful fallback */ }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(() => fetchHealth(), 60000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const onlineCount = results.filter((r) => r.status === 'online').length;
  const offlineCount = results.filter((r) => r.status === 'offline').length;

  if (loading) {
    return (
      <div className="page-shell animate-fade-in no-print">
        <div className="page-header"><div><h2 className="page-title">{t('healthDashboard.title')}</h2></div></div>
        <div className="page-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="page-card animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-24" />
                  <div className="h-3 bg-slate-800 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in no-print">
      <div className="page-header page-header-block">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <Activity size={22} className="text-indigo-400" />
            {t('healthDashboard.title')}
          </h2>
          <p className="page-desc">{t('healthDashboard.desc')}</p>
        </div>
        <div className="flex items-center gap-3">
          {lastCheck && (
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock size={12} /> {lastCheck.toLocaleTimeString()}
            </span>
          )}
          <button
            type="button"
            onClick={() => fetchHealth(true)}
            disabled={refreshing}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">{t('healthDashboard.servicesOnline', { n: onlineCount })}</span>
        </div>
        {offlineCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <XCircle size={16} className="text-rose-400" />
            <span className="text-sm font-medium text-rose-400">{t('healthDashboard.servicesOffline', { n: offlineCount })}</span>
          </div>
        )}
      </div>

      {/* Service grid */}
      <div className="page-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map((service) => {
          const IconComponent = ICON_MAP[service.icon] || Box;
          const borderColor = service.status === 'online' ? 'border-emerald-500/20 hover:border-emerald-500/40' :
            service.status === 'offline' ? 'border-rose-500/20 hover:border-rose-500/40' :
            'border-amber-500/20 hover:border-amber-500/40';

          return (
            <a
              key={service.id}
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`page-card ${borderColor} transition-all hover:shadow-lg cursor-pointer group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0 group-hover:bg-slate-700/80 transition-colors">
                  <IconComponent size={20} className="text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white truncate">{service.name}</p>
                    <StatusDot status={service.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-medium ${
                      service.status === 'online' ? 'text-emerald-400' :
                      service.status === 'offline' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {t(`healthDashboard.${service.status}`)}
                    </span>
                    {service.responseTime != null && (
                      <span className="text-[11px] text-slate-500">{service.responseTime}ms</span>
                    )}
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
