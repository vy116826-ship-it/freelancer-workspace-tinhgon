import { useState, useEffect } from 'react';
import { Activity, Play, Pause, Zap, Clock, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react';
import { getWorkflows, executeWorkflow, getExecutions } from '../../services/n8n.js';
import { useAppPreferences } from '../../context/AppPreferencesContext.jsx';

export default function N8NWorkflowPanel() {
  const { t } = useAppPreferences();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [executions, setExecutions] = useState({});
  const [executing, setExecuting] = useState(null);

  useEffect(() => {
    getWorkflows()
      .then((data) => setWorkflows(data || []))
      .catch(() => setError(t('n8nPanel.error')))
      .finally(() => setLoading(false));
  }, []);

  const handleExecute = async (id) => {
    setExecuting(id);
    try {
      await executeWorkflow(id);
    } catch { /* ignore */ }
    setExecuting(null);
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!executions[id]) {
      const data = await getExecutions(id, 5);
      setExecutions((prev) => ({ ...prev, [id]: data || [] }));
    }
  };

  if (loading) {
    return (
      <div className="page-shell animate-fade-in no-print">
        <div className="page-header"><div><h2 className="page-title">{t('n8nPanel.title')}</h2></div></div>
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="page-card animate-pulse"><div className="h-12 bg-slate-800 rounded-lg" /></div>
        ))}</div>
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in no-print">
      <div className="page-header page-header-block">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <Zap size={22} className="text-amber-400" />
            {t('n8nPanel.title')}
          </h2>
          <p className="page-desc">{t('n8nPanel.desc')}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-4">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {workflows.length === 0 && !error && (
        <div className="text-center py-16">
          <Zap size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500">{t('n8nPanel.noWorkflows')}</p>
        </div>
      )}

      <div className="space-y-3">
        {workflows.map((wf) => (
          <div key={wf.id} className="page-card !p-0 overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              <div className={`w-2 h-8 rounded-full shrink-0 ${wf.active ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{wf.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-md border ${
                    wf.active
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {wf.active ? t('n8nPanel.active') : t('n8nPanel.inactive')}
                  </span>
                  {wf.updatedAt && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock size={11} /> {new Date(wf.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleExecute(wf.id)}
                  disabled={executing === wf.id}
                  className="px-3 py-1.5 text-xs font-medium bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg hover:bg-indigo-600/30 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {executing === wf.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                  {t('n8nPanel.execute')}
                </button>
                <button
                  type="button"
                  onClick={() => toggleExpand(wf.id)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  {expandedId === wf.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* Execution history */}
            {expandedId === wf.id && (
              <div className="border-t border-slate-800 bg-slate-900/50 p-4">
                <p className="text-xs font-medium text-slate-400 mb-3">{t('n8nPanel.executions')}</p>
                {executions[wf.id]?.length ? (
                  <div className="space-y-2">
                    {executions[wf.id].map((exec) => (
                      <div key={exec.id} className="flex items-center gap-3 text-xs">
                        <span className={`w-1.5 h-1.5 rounded-full ${exec.finished ? (exec.stoppedAt ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-amber-500 animate-pulse'}`} />
                        <span className="text-slate-300 font-mono">{exec.id?.slice(0, 8)}</span>
                        <span className="text-slate-500">{exec.startedAt ? new Date(exec.startedAt).toLocaleString() : '-'}</span>
                        <span className={`ml-auto ${exec.finished ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {exec.finished ? t('n8nPanel.success') : t('n8nPanel.executing')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">{t('n8nPanel.noWorkflows')}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
