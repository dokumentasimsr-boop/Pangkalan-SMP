import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  UserCheck,
  ClipboardCheck,
  X,
  CheckCircle2,
} from 'lucide-react';
import { JadwalLatihan, Pembina, UserRole, ActiveTab } from '../types';
import { useToast } from './Toast';

interface JadwalLatihanViewProps {
  jadwalList: JadwalLatihan[];
  pembinaList: Pembina[];
  onSave: (list: JadwalLatihan[]) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
  onNavigateToPresensi: (jadwal: JadwalLatihan) => void;
}

export const JadwalLatihanView: React.FC<JadwalLatihanViewProps> = ({
  jadwalList,
  pembinaList,
  onSave,
  currentUserRole,
  onAddLog,
  onNavigateToPresensi,
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<JadwalLatihan | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<JadwalLatihan>>({
    hari: 'Jumat',
    tanggal: '22/08/2026',
    waktuMulai: '14:30',
    waktuSelesai: '16:30',
    kategori: 'Semua',
    materi: '',
    pembina: pembinaList[0]?.nama || 'Kak Ahmad Fauzi, S.Pd',
    lokasi: 'Lapangan Utama SMP IT Albashiroh',
    status: 'Rencana',
    keterangan: '',
  });

  const filteredList = jadwalList.filter(j => {
    const s = (search || '').toLowerCase();
    const matchSearch =
      (j.materi || '').toLowerCase().includes(s) ||
      (j.pembina || '').toLowerCase().includes(s) ||
      (j.lokasi || '').toLowerCase().includes(s);
    const matchStatus = filterStatus === 'Semua' || j.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleOpenAdd = () => {
    setEditingJadwal(null);
    setFormData({
      hari: 'Jumat',
      tanggal: '22/08/2026',
      waktuMulai: '14:30',
      waktuSelesai: '16:30',
      kategori: 'Semua',
      materi: '',
      pembina: pembinaList[0]?.nama || 'Kak Ahmad Fauzi, S.Pd',
      lokasi: 'Lapangan Utama SMP IT Albashiroh',
      status: 'Rencana',
      keterangan: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (jdw: JadwalLatihan) => {
    setEditingJadwal(jdw);
    setFormData({ ...jdw });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, materi: string) => {
    if (confirm(`Hapus jadwal latihan: "${materi}"?`)) {
      const updated = jadwalList.filter(j => j.id !== id);
      onSave(updated);
      onAddLog('Jadwal Latihan', 'Hapus Data', id, `Menghapus Jadwal: ${materi}`);
      showToast('Jadwal latihan berhasil dihapus.', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.materi || !formData.tanggal) {
      showToast('Materi dan Tanggal latihan wajib diisi!', 'error');
      return;
    }

    if (editingJadwal) {
      const updated = jadwalList.map(j =>
        j.id === editingJadwal.id ? ({ ...j, ...formData } as JadwalLatihan) : j
      );
      onSave(updated);
      onAddLog('Jadwal Latihan', 'Edit Data', editingJadwal.id, `Memperbarui Jadwal: ${formData.materi}`);
      showToast('Jadwal latihan berhasil diperbarui.', 'success');
    } else {
      const nextNum = jadwalList.length + 1;
      const newId = `JDW-${String(nextNum).padStart(4, '0')}`;
      const newJadwal: JadwalLatihan = {
        id: newId,
        hari: formData.hari || 'Jumat',
        tanggal: formData.tanggal || '22/08/2026',
        waktuMulai: formData.waktuMulai || '14:30',
        waktuSelesai: formData.waktuSelesai || '16:30',
        kategori: formData.kategori as any || 'Semua',
        materi: formData.materi || '',
        pembina: formData.pembina || 'Kak Pembina',
        lokasi: formData.lokasi || 'Lapangan Sekolah',
        status: formData.status as any || 'Rencana',
        keterangan: formData.keterangan || '',
      };
      onSave([...jadwalList, newJadwal]);
      onAddLog('Jadwal Latihan', 'Tambah Data', newId, `Menambahkan Jadwal: ${newJadwal.materi}`);
      showToast('Jadwal latihan baru berhasil ditambahkan.', 'success');
    }

    setIsModalOpen(false);
  };

  const canEdit = currentUserRole === 'ADMIN' || currentUserRole === 'PEMBINA' || currentUserRole === 'PETUGAS';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-700" />
            <span>Jadwal & Kalender Latihan Rutin</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Latihan Rutin Pramuka Penggalang SMP IT Albashiroh Turen
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal Latihan</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari materi, pembina, tempat..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-amber-700/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
          >
            <option value="Semua">Semua Status</option>
            <option value="Rencana">Status: Rencana</option>
            <option value="Selesai">Status: Selesai</option>
            <option value="Ditunda">Status: Ditunda</option>
            <option value="Dibatalkan">Status: Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Grid of Schedules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map(j => (
          <div
            key={j.id}
            className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  {j.hari}, {j.tanggal}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  j.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                  j.status === 'Ditunda' ? 'bg-amber-100 text-amber-800' :
                  j.status === 'Dibatalkan' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {j.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-stone-900 text-sm leading-snug">{j.materi}</h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Pukul {j.waktuMulai} - {j.waktuSelesai} WIB</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{j.lokasi}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate font-semibold text-stone-800">{j.pembina}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onNavigateToPresensi(j)}
                className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                title="Buka Presensi Sesi Ini"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Presensi</span>
              </button>

              {canEdit && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(j)}
                    className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-stone-100 rounded-lg"
                    title="Edit Jadwal"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(j.id, j.materi)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-lg"
                    title="Hapus Jadwal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-700" />
                <span>{editingJadwal ? 'Edit Jadwal Latihan' : 'Tambah Jadwal Latihan Baru'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Hari</label>
                  <select
                    value={formData.hari || 'Jumat'}
                    onChange={e => setFormData({ ...formData, hari: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                    <option value="Ahad">Ahad</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal (DD/MM/YYYY) *</label>
                  <input
                    type="text"
                    required
                    value={formData.tanggal || ''}
                    onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                    placeholder="22/08/2026"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Waktu Mulai</label>
                  <input
                    type="text"
                    value={formData.waktuMulai || '14:30'}
                    onChange={e => setFormData({ ...formData, waktuMulai: e.target.value })}
                    placeholder="14:30"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Waktu Selesai</label>
                  <input
                    type="text"
                    value={formData.waktuSelesai || '16:30'}
                    onChange={e => setFormData({ ...formData, waktuSelesai: e.target.value })}
                    placeholder="16:30"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Materi / Topik Latihan *</label>
                <input
                  type="text"
                  required
                  value={formData.materi || ''}
                  onChange={e => setFormData({ ...formData, materi: e.target.value })}
                  placeholder="Contoh: Sandi Kotak 1 & 2 serta Morse Peluit"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Pembina Pendamping</label>
                  <select
                    value={formData.pembina || ''}
                    onChange={e => setFormData({ ...formData, pembina: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    {pembinaList.map(p => (
                      <option key={p.id} value={`${p.nama}, ${p.gelar}`}>{p.nama}, {p.gelar}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Lokasi / Tempat</label>
                  <input
                    type="text"
                    value={formData.lokasi || ''}
                    onChange={e => setFormData({ ...formData, lokasi: e.target.value })}
                    placeholder="Lapangan Utama SMP IT Albashiroh"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kategori Peserta</label>
                  <select
                    value={formData.kategori || 'Semua'}
                    onChange={e => setFormData({ ...formData, kategori: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Semua">Semua (Putra & Putri)</option>
                    <option value="Putra">Putra Saja</option>
                    <option value="Putri">Putri Saja</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Status Latihan</label>
                  <select
                    value={formData.status || 'Rencana'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Rencana">Rencana</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Ditunda">Ditunda</option>
                    <option value="Dibatalkan">Dibatalkan</option>
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
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
