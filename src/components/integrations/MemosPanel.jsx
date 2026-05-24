import { useState, useEffect } from 'react';
import { StickyNote, Plus, Eye, EyeOff, Clock, Loader2, Trash2 } from 'lucide-react';
import { getMemos, createMemo, deleteMemo } from '../../services/memos.js';
import { useAppPreferences } from '../../context/AppPreferencesContext.jsx';

export default function MemosPanel() {
  const { t } = useAppPreferences();
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [visibility, setVisibility] = useState('PRIVATE');
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchMemos = async () => {
    const data = await getMemos();
    setMemos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMemos(); }, []);

  const handleCreate = async () => {
    if (!newContent.trim()) return;
    setCreating(true);
    await createMemo(newContent, visibility);
    setNewContent('');
    await fetchMemos();
    setCreating(false);
  };

  const handleDelete = async (name) => {
    await deleteMemo(name);
    setMemos((prev) => prev.filter((m) => m.name !== name));
  };

  return (
    <div className="page-shell animate-fade-in no-print">
      <div className="page-header page-header-block">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <StickyNote size={22} className="text-amber-400" />
            {t('memosPanel.title')}
          </h2>
          <p className="page-desc">{t('memosPanel.desc')}</p>
        </div>
      </div>

      {/* Create new memo */}
      <div className="page-card mb-5">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder={t('memosPanel.newMemo')}
          rows={3}
          className="w-full bg-transparent border-0 text-sm text-white placeholder-slate-500 resize-none focus:outline-none"
        />
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVisibility(visibility === 'PRIVATE' ? 'PUBLIC' : 'PRIVATE')}
              className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
                visibility === 'PRIVATE'
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {visibility === 'PRIVATE' ? <EyeOff size={12} /> : <Eye size={12} />}
              {visibility === 'PRIVATE' ? t('memosPanel.private') : t('memosPanel.public')}
            </button>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !newContent.trim()}
            className="btn-page-primary !py-1.5 !px-4 !text-xs disabled:opacity-50"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {t('memosPanel.create')}
          </button>
        </div>
      </div>

      {/* Memo list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
      ) : memos.length === 0 ? (
        <div className="text-center py-16">
          <StickyNote size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500">{t('memosPanel.noMemos')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {memos.map((memo) => {
            const isExpanded = expandedId === memo.name;
            return (
              <div
                key={memo.name}
                onClick={() => setExpandedId(isExpanded ? null : memo.name)}
                className="page-card !p-3 sm:!p-4 hover:border-slate-600 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm text-slate-200 ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {memo.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock size={11} />
                        {memo.createTime ? new Date(memo.createTime).toLocaleDateString() : '-'}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        memo.visibility === 'PUBLIC'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}>
                        {memo.visibility === 'PUBLIC' ? t('memosPanel.public') : t('memosPanel.private')}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDelete(memo.name); }}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
