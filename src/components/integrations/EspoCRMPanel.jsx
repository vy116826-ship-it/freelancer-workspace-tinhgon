import { useState, useEffect, useMemo } from 'react';
import { Users, Building2, DollarSign, Search, Mail, Phone, ChevronRight, Loader2 } from 'lucide-react';
import { getContacts, getAccounts, getOpportunities } from '../../services/espocrm.js';
import { useAppPreferences } from '../../context/AppPreferencesContext.jsx';
import { formatVND } from '../../utils/format.js';

const TABS = [
  { id: 'contacts', icon: Users, colorClass: 'text-blue-400' },
  { id: 'accounts', icon: Building2, colorClass: 'text-emerald-400' },
  { id: 'deals', icon: DollarSign, colorClass: 'text-amber-400' },
];

export default function EspoCRMPanel() {
  const { t } = useAppPreferences();
  const [activeTab, setActiveTab] = useState('contacts');
  const [data, setData] = useState({ contacts: [], accounts: [], deals: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    Promise.all([getContacts(), getAccounts(), getOpportunities()])
      .then(([contacts, accounts, deals]) => {
        setData({
          contacts: contacts || [],
          accounts: accounts || [],
          deals: deals || [],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    const items = data[activeTab] || [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) =>
      (item.name || item.firstName || '').toLowerCase().includes(q) ||
      (item.lastName || '').toLowerCase().includes(q) ||
      (item.emailAddress || '').toLowerCase().includes(q)
    );
  }, [data, activeTab, search]);

  const renderContact = (item) => {
    const name = [item.firstName, item.lastName].filter(Boolean).join(' ') || item.name || '-';
    const isExpanded = expandedId === item.id;
    return (
      <div
        key={item.id}
        onClick={() => setExpandedId(isExpanded ? null : item.id)}
        className="page-card !p-3 sm:!p-4 hover:border-slate-600 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <Users size={16} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{name}</p>
            {item.emailAddress && <p className="text-xs text-slate-400 truncate">{item.emailAddress}</p>}
          </div>
          <ChevronRight size={16} className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
            {item.emailAddress && (
              <div className="flex items-center gap-1.5 text-slate-300"><Mail size={12} className="text-slate-500" /> {item.emailAddress}</div>
            )}
            {item.phoneNumber && (
              <div className="flex items-center gap-1.5 text-slate-300"><Phone size={12} className="text-slate-500" /> {item.phoneNumber}</div>
            )}
            {item.accountName && (
              <div className="flex items-center gap-1.5 text-slate-300"><Building2 size={12} className="text-slate-500" /> {item.accountName}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAccount = (item) => (
    <div key={item.id} className="page-card !p-3 sm:!p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
          <Building2 size={16} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{item.name}</p>
          {item.website && <p className="text-xs text-indigo-400 truncate">{item.website}</p>}
        </div>
      </div>
    </div>
  );

  const renderDeal = (item) => (
    <div key={item.id} className="page-card !p-3 sm:!p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{item.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{item.stage || '-'}</p>
        </div>
        {item.amount != null && (
          <span className="text-sm font-bold text-emerald-400 shrink-0">{formatVND(item.amount)}</span>
        )}
      </div>
    </div>
  );

  const emptyKeys = { contacts: 'crmPanel.noContacts', accounts: 'crmPanel.noAccounts', deals: 'crmPanel.noDeals' };

  return (
    <div className="page-shell animate-fade-in no-print">
      <div className="page-header page-header-block">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <Users size={22} className="text-blue-400" />
            {t('crmPanel.title')}
          </h2>
          <p className="page-desc">{t('crmPanel.desc')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-5 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); setSearch(''); setExpandedId(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={16} className={activeTab === tab.id ? tab.colorClass : ''} />
              {t(`crmPanel.${tab.id}`)}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('crmPanel.search')}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
      ) : filteredItems.length === 0 ? (
        <p className="text-center py-12 text-slate-500">{t(emptyKeys[activeTab])}</p>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) =>
            activeTab === 'contacts' ? renderContact(item) :
            activeTab === 'accounts' ? renderAccount(item) :
            renderDeal(item)
          )}
        </div>
      )}
    </div>
  );
}
