import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Search, Edit2, ShieldAlert, CheckCircle, ToggleLeft, ToggleRight, Trash2, ArrowUpDown } from 'lucide-react';
import { authentikApiService } from '../services/authentikApi.js';
import EmployeeModal from './EmployeeModal.jsx';
import { ROLES } from '../config/roles.js';

export default function EmployeePanel({ onSaved }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authentikApiService.listEmployees();
      setEmployees(data);
    } catch (e) {
      console.error(e);
      setError('Không thể kết nối Authentik Admin API qua api-proxy.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddOrEdit = async (formData) => {
    if (editingEmployee) {
      // Edit existing user
      await authentikApiService.updateEmployee(editingEmployee.id, { name: formData.name });
      if (editingEmployee.role !== formData.role) {
        await authentikApiService.updateEmployeeRole(editingEmployee.id, formData.role);
      }
      onSaved?.('Đã cập nhật thông tin nhân viên thành công.');
    } else {
      // Create new user
      await authentikApiService.createEmployee(formData);
      onSaved?.('Đã thêm nhân viên mới và gửi thư mời đăng nhập.');
    }
    fetchEmployees();
  };

  const handleToggleStatus = async (employee) => {
    const nextActive = !employee.isActive;
    try {
      await authentikApiService.updateEmployee(employee.id, { is_active: nextActive });
      setEmployees(employees.map(e => e.id === employee.id ? { ...e, isActive: nextActive } : e));
      onSaved?.(`Đã ${nextActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản nhân viên.`);
    } catch (e) {
      alert('Có lỗi xảy ra khi đổi trạng thái tài khoản.');
    }
  };

  const handleDelete = async (employee) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên ${employee.name} khỏi hệ thống?`)) {
      try {
        await authentikApiService.deleteEmployee(employee.id);
        setEmployees(employees.filter(e => e.id !== employee.id));
        onSaved?.('Đã xóa nhân viên khỏi hệ thống.');
      } catch (e) {
        alert('Có lỗi xảy ra khi xóa tài khoản.');
      }
    }
  };

  // Filters logic
  const filtered = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="page-card space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--app-border)]">
        <div className="flex items-center gap-2.5">
          <Users size={20} className="text-indigo-400" />
          <div>
            <h3 className="section-title text-base sm:text-lg">Danh sách nhân viên</h3>
            <p className="text-xs text-[var(--app-text-muted)] mt-0.5">Quản lý và phân quyền tài khoản SSO trên Authentik.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <UserPlus size={15} />
          Thêm nhân viên mới
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Lỗi kết nối API SSO</p>
            <p className="text-xs text-rose-500/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full bg-slate-950 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer w-full sm:w-auto shrink-0"
        >
          <option value="all">Tất cả vai trò</option>
          <option value={ROLES.owner}>Quản trị viên (Owner)</option>
          <option value={ROLES.freelancer}>Cộng tác viên (Freelancer)</option>
          <option value={ROLES.client}>Khách hàng (Client)</option>
        </select>
      </div>

      {/* Employees Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <p className="text-slate-500 text-xs mt-3 animate-pulse">Đang tải danh sách nhân viên từ Authentik...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/30">
                <th className="px-4 py-3 text-xs font-semibold text-slate-400">Nhân viên</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400">Vai trò</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400">Trạng thái</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-800/10 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-xs">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white">{emp.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium ${
                      emp.role === ROLES.owner ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                      emp.role === ROLES.client ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-sky-500/10 text-sky-400 border-sky-500/20'
                    }`}>
                      {emp.role === ROLES.owner ? 'Owner' : emp.role === ROLES.client ? 'Client' : 'Freelancer'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${emp.isActive ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                      <span className="text-[10px] text-slate-400">{emp.isActive ? 'Đang hoạt động' : 'Bị vô hiệu hóa'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }}
                        title="Chỉnh sửa"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(emp)}
                        title={emp.isActive ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                        className={`p-1.5 rounded-lg transition-colors ${emp.isActive ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                      >
                        {emp.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(emp)}
                        title="Xóa nhân viên"
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-500 text-xs">
                    Không tìm thấy nhân viên nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <EmployeeModal
        open={isModalOpen}
        employee={editingEmployee}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddOrEdit}
      />
    </div>
  );
}
