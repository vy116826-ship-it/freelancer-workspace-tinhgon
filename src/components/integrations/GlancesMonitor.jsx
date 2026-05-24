import { useState, useEffect, useCallback } from 'react';
import { Activity, Cpu, HardDrive, Wifi, AlertTriangle, RefreshCw } from 'lucide-react';
import { getMemory, getCpu, getSystemInfo } from '../../services/glances.js';
import { useAppPreferences } from '../../context/AppPreferencesContext.jsx';

function UsageBar({ label, icon: Icon, percent, used, total, unit = 'GB' }) {
  const color = percent > 80 ? 'bg-rose-500' : percent > 60 ? 'bg-amber-500' : 'bg-emerald-500';
  const textColor = percent > 80 ? 'text-rose-400' : percent > 60 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className="page-card-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={18} className={textColor} />
          <span className="text-sm font-semibold text-white">{label}</span>
        </div>
        <span className={`text-lg font-bold ${textColor}`}>{percent.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{used.toFixed(1)} {unit} used</span>
        <span>{total.toFixed(1)} {unit} total</span>
      </div>
    </div>
  );
}

export default function GlancesMonitor() {
  const { t } = useAppPreferences();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [mem, cpu] = await Promise.all([getMemory(), getCpu()]);
      setData({ mem, cpu });
    } catch { /* graceful fallback */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const memPercent = data?.mem?.percent ?? 0;
  const memUsed = (data?.mem?.used ?? 0) / 1073741824; // bytes to GB
  const memTotal = (data?.mem?.total ?? 0) / 1073741824;
  const cpuPercent = data?.cpu?.total ?? 0;
  const showRamAlert = memPercent > 80;

  if (loading) {
    return (
      <div className="page-shell animate-fade-in no-print">
        <div className="page-header"><div><h2 className="page-title">{t('monitorPanel.title')}</h2></div></div>
        <div className="page-grid grid-cols-1 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="page-card-lg animate-pulse"><div className="h-20 bg-slate-800 rounded-lg" /></div>
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
            {t('monitorPanel.title')}
          </h2>
          <p className="page-desc">{t('monitorPanel.desc')}</p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* RAM alert */}
      {showRamAlert && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 mb-5 animate-fade-in">
          <AlertTriangle size={20} className="text-rose-400 shrink-0" />
          <p className="text-sm font-medium text-rose-300">{t('monitorPanel.alertHigh')}</p>
        </div>
      )}

      <div className="page-grid grid-cols-1 lg:grid-cols-2">
        <UsageBar
          label={t('monitorPanel.ram')}
          icon={HardDrive}
          percent={memPercent}
          used={memUsed}
          total={memTotal}
        />
        <UsageBar
          label={t('monitorPanel.cpu')}
          icon={Cpu}
          percent={cpuPercent}
          used={cpuPercent}
          total={100}
          unit="%"
        />
      </div>
    </div>
  );
}
