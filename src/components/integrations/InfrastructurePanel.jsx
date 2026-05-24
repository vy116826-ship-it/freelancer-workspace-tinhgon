import { useState, useEffect } from 'react';
import { Box, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { getContainers } from '../../services/portainer.js';
import { useAppPreferences } from '../../context/AppPreferencesContext.jsx';

function ContainerStatus({ state }) {
  const map = {
    running: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
    exited: { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: XCircle },
    restarting: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: AlertCircle },
  };
  const cfg = map[state?.toLowerCase()] || map.exited;
  const Icon = cfg.icon;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-md border flex items-center gap-1 ${cfg.color}`}>
      <Icon size={11} /> {state || 'unknown'}
    </span>
  );
}

export default function InfrastructurePanel() {
  const { t } = useAppPreferences();
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContainers(1)
      .then((data) => setContainers(data || []))
      .finally(() => setLoading(false));
  }, []);

  const runningCount = containers.filter((c) => c.State?.toLowerCase() === 'running').length;
  const stoppedCount = containers.length - runningCount;

  return (
    <div className="page-shell animate-fade-in no-print">
      <div className="page-header page-header-block">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <Box size={22} className="text-cyan-400" />
            {t('infraPanel.title')}
          </h2>
          <p className="page-desc">{t('infraPanel.desc')}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-4 mb-5">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">{runningCount} {t('infraPanel.running')}</span>
        </div>
        {stoppedCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <XCircle size={16} className="text-rose-400" />
            <span className="text-sm font-medium text-rose-400">{stoppedCount} {t('infraPanel.stopped')}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
      ) : containers.length === 0 ? (
        <div className="text-center py-16">
          <Box size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500">{t('infraPanel.noContainers')}</p>
        </div>
      ) : (
        <div className="page-card overflow-x-auto !p-0">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="tbl-head">
                <th className="tbl-th">Container</th>
                <th className="tbl-th">{t('infraPanel.image')}</th>
                <th className="tbl-th">Status</th>
                <th className="tbl-th">{t('infraPanel.created')}</th>
              </tr>
            </thead>
            <tbody>
              {containers.map((c) => {
                const name = (c.Names?.[0] || c.Name || '-').replace(/^\//, '');
                return (
                  <tr key={c.Id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="tbl-td">
                      <div className="flex items-center gap-2">
                        <Box size={14} className="text-slate-500 shrink-0" />
                        <span className="text-white font-medium text-sm">{name}</span>
                      </div>
                    </td>
                    <td className="tbl-td text-slate-400 text-xs font-mono truncate max-w-[200px]">
                      {c.Image?.split(':')[0] || '-'}
                    </td>
                    <td className="tbl-td"><ContainerStatus state={c.State} /></td>
                    <td className="tbl-td text-xs text-slate-500">
                      {c.Created ? new Date(c.Created * 1000).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
