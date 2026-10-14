import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Calendar,
  User,
  Activity,
} from 'lucide-react';
import { LogAktivitas, UserRole } from '../types';
import { useToast } from './Toast';

interface LogAktivitasViewProps {
  logs: LogAktivitas[];
  onClearLogs: () => void;
  currentUserRole: UserRole;
}

export const LogAktivitasView: React.FC<LogAktivitasViewProps> = ({
  logs,
  onClearLogs,
  currentUserRole,
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterModul, setFilterModul] = useState('Semua');

  const modulOptions = ['Semua', ...Array.from(new Set(logs.map(l => l.modul)))];

  const filteredLogs = logs.filter(l => {
    const s = (search || '').toLowerCase();
    const matchSearch =
      (l.user || '').toLowerCase().includes(s) ||
      (l.aktivitas || '').toLowerCase().includes(s) ||
      (l.keterangan || '').toLowerCase().includes(s);
    const matchModul = filterModul === 'Semua' || l.modul === filterModul;
    return matchSearch && matchModul;
  });

  const handleClear = () => {
    if (confirm('Bersihkan riwayat log aktivitas sistem?')) {
      onClearLogs();
      showToast('Log aktivitas berhasil dibersihkan.', 'success');
    }
  };

  const isAdmin = currentUserRole === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-700" />
            <span>Audit Log & Rekam Jejak Aktivitas</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Log audit aktivitas pembina dan operator sistem administrasi pramuka
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-stone-100 hover:bg-rose-50 text-rose-700 border border-stone-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Bersihkan Log</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari aktivitas, user, keterangan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-amber-700/20"
          />
        </div>

        <select
          value={filterModul}
          onChange={e => setFilterModul(e.target.value)}
          className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
        >
          {modulOptions.map(m => (
            <option key={m} value={m}>{m === 'Semua' ? 'Semua Modul' : m}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-900 text-stone-200 border-b border-stone-800 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Waktu & Tanggal</th>
                <th className="px-4 py-3.5">Pengguna (User)</th>
                <th className="px-4 py-3.5">Modul & Aksi</th>
                <th className="px-4 py-3.5">Target ID</th>
                <th className="px-4 py-3.5">Rincian Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(l => (
                  <tr key={l.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-3 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                      {l.timestamp}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>{l.user}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 mr-1.5">
                        {l.modul}
                      </span>
                      <span className="font-semibold text-stone-800">{l.aktivitas}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-amber-900">
                      {l.targetId}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {l.keterangan}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                    Tidak ada catatan log aktivitas yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
