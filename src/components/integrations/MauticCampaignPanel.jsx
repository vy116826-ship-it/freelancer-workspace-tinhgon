import { useState, useEffect } from 'react';
import { Mail, Send, MousePointerClick, Users, Loader2 } from 'lucide-react';
import { getCampaigns, getContacts } from '../../services/mautic.js';
import { useAppPreferences } from '../../context/AppPreferencesContext.jsx';

export default function MauticCampaignPanel() {
  const { t } = useAppPreferences();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCampaigns()
      .then((data) => setCampaigns(data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-shell animate-fade-in no-print">
        <div className="page-header"><div><h2 className="page-title">{t('mauticPanel.title')}</h2></div></div>
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in no-print">
      <div className="page-header page-header-block">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <Mail size={22} className="text-cyan-400" />
            {t('mauticPanel.title')}
          </h2>
          <p className="page-desc">{t('mauticPanel.desc')}</p>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16">
          <Mail size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500">{t('mauticPanel.noCampaigns')}</p>
        </div>
      ) : (
        <div className="page-grid grid-cols-1 lg:grid-cols-2">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="page-card-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-white">{campaign.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{campaign.description || '-'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md border ${
                  campaign.isPublished
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {campaign.isPublished ? t('n8nPanel.active') : t('n8nPanel.inactive')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <Send size={16} className="mx-auto text-blue-400 mb-1.5" />
                  <p className="stat-value text-lg">{campaign.sentCount ?? 0}</p>
                  <p className="text-xs text-slate-500">{t('mauticPanel.sent')}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <Mail size={16} className="mx-auto text-emerald-400 mb-1.5" />
                  <p className="stat-value text-lg">{campaign.readCount ?? 0}</p>
                  <p className="text-xs text-slate-500">{t('mauticPanel.opened')}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <MousePointerClick size={16} className="mx-auto text-amber-400 mb-1.5" />
                  <p className="stat-value text-lg">{campaign.clickCount ?? 0}</p>
                  <p className="text-xs text-slate-500">{t('mauticPanel.clicked')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
