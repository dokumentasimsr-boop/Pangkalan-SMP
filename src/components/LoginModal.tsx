import React, { useState } from 'react';
import {
  Lock,
  User,
  KeyRound,
  Shield,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';
import { useToast } from './Toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
  users: UserType[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  users,
}) => {
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const found = users.find(
      u => (u.username || '').toLowerCase() === (username || '').trim().toLowerCase()
    );

    if (!found) {
      setErrorMsg('Username tidak terdaftar.');
      return;
    }

    if (found.status !== 'Aktif') {
      setErrorMsg('Akun Anda dinonaktifkan. Hubungi Admin Pangkalan.');
      return;
    }

    // In demo/localStorage mode: check password (or accept demo default)
    if (found.passwordHash && found.passwordHash !== password) {
      setErrorMsg('Kata sandi salah!');
      return;
    }

    const updatedUser = {
      ...found,
      terakhirLogin: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    onLoginSuccess(updatedUser);
    showToast(`Selamat datang kembali, ${found.nama}! (${found.role})`, 'success');
    onClose();
  };

  const handleQuickLogin = (quickUser: UserType) => {
    setUsername(quickUser.username);
    setPassword(quickUser.passwordHash || 'admin123');
  };

  return (
    <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-800 text-white flex items-center justify-center font-bold shadow-xs">
              <Lock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                Autentikasi Pengguna
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                Sistem Administrasi Gugus Depan Pramuka
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Username Pengguna</label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin / ahmad_fauzi / petugas"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-900 focus:ring-2 focus:ring-amber-700/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Kata Sandi</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-900 focus:ring-2 focus:ring-amber-700/20"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold shadow-md transition-all mt-2"
          >
            Masuk ke Sistem
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="mt-5 pt-4 border-t border-stone-100 space-y-2">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Akun Demo Cepat:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {users.slice(0, 3).map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                className="p-2 bg-stone-50 hover:bg-amber-50 hover:border-amber-300 border border-stone-200 rounded-xl text-left transition-all"
              >
                <div className="font-bold text-stone-900 text-[11px] truncate">{u.nama}</div>
                <div className="text-[9px] font-bold text-amber-800">{u.role}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
