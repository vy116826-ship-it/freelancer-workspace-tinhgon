import React, { useState, useEffect } from 'react';
import { X, Mail, User, Shield, AlertCircle } from 'lucide-react';
import { ROLES } from '../config/roles.js';

export default function EmployeeModal({ open, onClose, onSubmit, employee = null }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLES.freelancer);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setEmail(employee.email || '');
      setName(employee.name || '');
      setRole(employee.role || ROLES.freelancer);
    } else {
      setEmail('');
      setName('');
      setRole(ROLES.freelancer);
    }
    setError('');
  }, [employee, open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Định dạng email không hợp lệ.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({ email: email.trim(), name: name.trim(), role });
      onClose();
    } catch (e) {
      setError(e.message || 'Có lỗi xảy ra khi lưu thông tin nhân viên.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto no-print">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 text-left shadow-2xl transition-all animate-scale-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              {employee ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Địa chỉ Email *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  disabled={!!employee || isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@tinhgon.com"
                  className="w-full bg-slate-950 border border-slate-700 disabled:border-slate-800 disabled:text-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Tên hiển thị *</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên hoặc biệt danh nhân viên"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Phân quyền vai trò</label>
              <select
                disabled={isSubmitting}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={ROLES.freelancer}>Cộng tác viên (Freelancer)</option>
                <option value={ROLES.owner}>Quản trị viên (Owner)</option>
                <option value={ROLES.client}>Khách hàng (Client)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                {role === ROLES.owner && 'Owner: Toàn quyền quản trị hệ thống, hạ tầng, doanh thu và thêm bớt nhân viên.'}
                {role === ROLES.freelancer && 'Freelancer: Quyền xem dự án được phân công, cập nhật việc làm và lịch biểu.'}
                {role === ROLES.client && 'Client: Xem tiến độ dự án của riêng mình, chat tương tác trực tiếp với Agency.'}
              </p>
            </div>

            <div className="flex gap-3 justify-end border-t border-slate-800 pt-4 mt-6">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Đang xử lý...' : employee ? 'Cập nhật' : 'Thêm nhân viên'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
