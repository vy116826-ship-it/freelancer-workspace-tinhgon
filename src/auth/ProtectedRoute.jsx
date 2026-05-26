import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { ShieldAlert, Lock, User, AlertCircle, KeyRound, ChevronRight } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, login, backupLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if disaster recovery backup login is requested via URL parameter
  const isBackupMode = window.location.search.includes('backup') || window.location.search.includes('mode=backup');

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isBackupMode) {
      login();
    }
  }, [isLoading, isAuthenticated, login, isBackupMode]);

  const handleBackupSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Small delay to simulate processing and give a premium feel
    setTimeout(() => {
      const success = backupLogin(username, password);
      setIsSubmitting(false);
      if (!success) {
        setError('Sai tài khoản hoặc mật khẩu dự phòng.');
      } else {
        // Clear query parameters on success
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        </div>
        <h3 className="mt-6 text-sm font-medium text-slate-400 animate-pulse">Đang kiểm tra bảo mật...</h3>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (isBackupMode) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100 px-4 relative overflow-hidden">
          {/* Ambient background glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative z-10">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Cổng Dự Phòng Workspace</h2>
              <p className="text-slate-400 text-xs mt-2 text-center max-w-xs">
                Sử dụng tài khoản quản trị tối cao nội bộ khi kết nối SSO Authentik gặp sự cố.
              </p>
            </div>

            <form onSubmit={handleBackupSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-rose-400 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Tài khoản</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Nhập tài khoản backup"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : (
                  <>
                    <span>Đăng nhập hệ thống</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800/60 flex justify-center">
              <a
                href="/"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                Thử lại với Đăng nhập chính (SSO)
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 px-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-rose-500 animate-bounce" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Yêu cầu xác thực</h2>
        <p className="text-slate-400 text-sm max-w-sm text-center mb-6">
          Vui lòng đăng nhập qua cổng Authentik SSO của Tinh Gọn để tiếp tục truy cập Workspace.
        </p>
        <button
          onClick={login}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 active:scale-95 cursor-pointer"
        >
          Đăng nhập ngay
        </button>

        <a
          href="/?backup=true"
          className="mt-6 text-xs text-slate-500 hover:text-slate-400 transition-colors"
        >
          Đăng nhập dự phòng
        </a>
      </div>
    );
  }

  return children;
}

  return children;
}
