import React, { useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login();
    }
  }, [isLoading, isAuthenticated, login]);

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
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 active:scale-95"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return children;
}
