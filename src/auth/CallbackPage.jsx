import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function CallbackPage() {
  const { handleCallback } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      handleCallback(code, state)
        .then((success) => {
          if (success) {
            window.location.href = '/';
          } else {
            setError('Không thể đổi token xác thực. Vui lòng liên hệ quản trị viên.');
          }
        })
        .catch((e) => {
          setError(e.message || 'Lỗi xử lý xác thực SSO.');
        });
    } else {
      setError('Tham số xác thực OIDC callback không hợp lệ.');
    }
  }, [handleCallback]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 px-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Lỗi Đăng Nhập SSO</h2>
        <p className="text-slate-400 text-sm max-w-sm text-center mb-6">{error}</p>
        <a
          href="/"
          className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all"
        >
          Quay lại Trang chủ
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
      <div className="relative w-16 h-16 flex items-center justify-center mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        <ShieldCheck className="w-8 h-8 text-emerald-500 animate-pulse" />
      </div>
      <h2 className="text-lg font-bold text-white mb-1">Xác thực thành công</h2>
      <p className="text-slate-400 text-sm animate-pulse">Đang hoàn tất đăng nhập và tải Workspace...</p>
    </div>
  );
}
