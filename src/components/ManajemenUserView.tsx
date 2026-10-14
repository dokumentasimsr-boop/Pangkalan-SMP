import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Shield,
  UserCheck,
  Edit2,
  Trash2,
  X,
  KeyRound,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { useToast } from './Toast';

interface ManajemenUserViewProps {
  users: User[];
  onSaveUsers: (list: User[]) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
}

export const ManajemenUserView: React.FC<ManajemenUserViewProps> = ({
  users,
  onSaveUsers,
  currentUserRole,
  onAddLog,
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    nama: '',
    role: 'PEMBINA',
    status: 'Aktif',
    passwordHash: 'pembina123',
  });

  const filteredUsers = users.filter(u => {
    const s = (search || '').toLowerCase();
    return (
      (u.nama || '').toLowerCase().includes(s) ||
      (u.username || '').toLowerCase().includes(s) ||
      (u.role || '').toLowerCase().includes(s)
    );
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      nama: '',
      role: 'PEMBINA',
      status: 'Aktif',
      passwordHash: 'password123',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, username: string) => {
    if (username === 'admin') {
      showToast('User Super Admin utama tidak dapat dihapus!', 'error');
      return;
    }

    if (confirm(`Hapus akun pengguna: "${username}"?`)) {
      const updated = users.filter(u => u.id !== id);
      onSaveUsers(updated);
      onAddLog('Manajemen User', 'Hapus Akun', id, `Menghapus user: ${username}`);
      showToast('Akun pengguna berhasil dihapus.', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.nama) {
      showToast('Username dan Nama Lengkap wajib diisi!', 'error');
      return;
    }

    if (editingUser) {
      const updated = users.map(u =>
        u.id === editingUser.id ? ({ ...u, ...formData } as User) : u
      );
      onSaveUsers(updated);
      onAddLog('Manajemen User', 'Edit Akun', editingUser.id, `Memperbarui user: ${formData.username}`);
      showToast('Data user berhasil diperbarui.', 'success');
    } else {
      const existing = users.find(u => u.username.toLowerCase() === formData.username?.toLowerCase());
      if (existing) {
        showToast('Username tersebut sudah digunakan!', 'error');
        return;
      }

      const nextNum = users.length + 1;
      const newId = `USR-${String(nextNum).padStart(4, '0')}`;
      const newUser: User = {
        id: newId,
        username: formData.username || '',
        passwordHash: formData.passwordHash || 'password123',
        nama: formData.nama || '',
        role: formData.role as any || 'PEMBINA',
        status: formData.status as any || 'Aktif',
        terakhirLogin: 'Belum pernah',
      };
      onSaveUsers([...users, newUser]);
      onAddLog('Manajemen User', 'Tambah Akun', newId, `Membuat akun baru: ${newUser.username} (${newUser.role})`);
      showToast('Akun pengguna baru berhasil dibuat.', 'success');
    }

    setIsModalOpen(false);
  };

  const isAdmin = currentUserRole === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-700" />
            <span>Manajemen Pengguna & Hak Akses (RBAC)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Kelola Akun Pembina, Petugas Administrasi, dan Super Admin Pangkalan
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        )}
      </div>

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
            <Shield className="w-4 h-4 text-amber-700" />
            <span>ADMINISTRATOR</span>
          </div>
          <p className="text-[11px] text-stone-600 leading-tight">
            Akses penuh ke seluruh modul, konfigurasi pangkalan, kelola akun pengguna, dan integrasi backend.
          </p>
        </div>

        <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>PEMBINA PRAMUKA</span>
          </div>
          <p className="text-[11px] text-stone-600 leading-tight">
            Mengelola data anggota, input presensi, verifikasi uji SKU/SKK, materi latihan, dan buku kas.
          </p>
        </div>

        <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
            <Users className="w-4 h-4 text-blue-700" />
            <span>PETUGAS / OPERATOR</span>
          </div>
          <p className="text-[11px] text-stone-600 leading-tight">
            Membantu pencatatan presensi mingguan, inventaris sarana kemah, dan dokumentasi kegiatan.
          </p>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau username..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-amber-700/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-900 text-stone-200 border-b border-stone-800 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Nama & Username</th>
                <th className="px-4 py-3.5">Role Hak Akses</th>
                <th className="px-4 py-3.5">Status Akun</th>
                <th className="px-4 py-3.5">Terakhir Login</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-stone-900">{u.nama}</div>
                    <div className="text-[11px] text-stone-500 font-mono">@{u.username} • {u.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      u.role === 'PEMBINA' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                      'bg-blue-100 text-blue-900 border border-blue-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-500 text-[11px]">
                    {u.terakhirLogin || 'Baru saja'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {u.username !== 'admin' && (
                          <button
                            onClick={() => handleDelete(u.id, u.username)}
                            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.nama || ''}
                  onChange={e => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Kak Ahmad Fauzi, S.Pd"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={formData.username || ''}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  placeholder="ahmad_fauzi"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Password</label>
                <input
                  type="text"
                  value={formData.passwordHash || ''}
                  onChange={e => setFormData({ ...formData, passwordHash: e.target.value })}
                  placeholder="******"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Role / Peran</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="PEMBINA">PEMBINA</option>
                    <option value="PETUGAS">PETUGAS</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-semibold shadow-sm"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
