import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Search,
  Filter,
  Medal,
  Calendar,
  MapPin,
  Users,
  Edit2,
  Trash2,
  X,
  Award,
} from 'lucide-react';
import { Prestasi, UserRole } from '../types';
import { useToast } from './Toast';

interface PrestasiViewProps {
  prestasiList: Prestasi[];
  onSave: (list: Prestasi[]) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
}

export const PrestasiView: React.FC<PrestasiViewProps> = ({
  prestasiList,
  onSave,
  currentUserRole,
  onAddLog,
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterTingkat, setFilterTingkat] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Prestasi | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Prestasi>>({
    namaKejuaraan: '',
    cabangLomba: 'Pioneering & Semaphore Morse',
    peringkat: 'Juara 1',
    tingkat: 'Kabupaten / Kwarcab',
    tahun: '2026',
    tanggal: '12/08/2026',
    penyelenggara: 'Kwarcab Gerakan Pramuka Kabupaten Malang',
    delegasiPeserta: 'Regu Elang & Regu Melati',
    pembinaPendamping: 'Kak Ahmad Fauzi, S.Pd',
    keterangan: 'Piala Tetap dan Piagam Penghargaan',
  });

  const tingkatOptions = [
    'Semua',
    'Ranting / Kecamatan',
    'Kabupaten / Kwarcab',
    'Daerah / Kwarda (Provinsi)',
    'Nasional / Kwarnas',
    'Internasional',
  ];

  const filteredList = prestasiList.filter(p => {
    const s = (search || '').toLowerCase();
    const matchSearch =
      (p.namaKejuaraan || '').toLowerCase().includes(s) ||
      (p.cabangLomba || '').toLowerCase().includes(s) ||
      (p.delegasiPeserta || '').toLowerCase().includes(s);
    const matchTingkat = filterTingkat === 'Semua' || p.tingkat === filterTingkat;
    return matchSearch && matchTingkat;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      namaKejuaraan: '',
      cabangLomba: '',
      peringkat: 'Juara 1',
      tingkat: 'Kabupaten / Kwarcab',
      tahun: '2026',
      tanggal: '12/08/2026',
      penyelenggara: 'Kwarcab Gerakan Pramuka Kabupaten Malang',
      delegasiPeserta: 'Regu Elang & Regu Melati',
      pembinaPendamping: 'Kak Ahmad Fauzi, S.Pd',
      keterangan: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Prestasi) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Hapus catatan prestasi: "${nama}"?`)) {
      const updated = prestasiList.filter(p => p.id !== id);
      onSave(updated);
      onAddLog('Prestasi', 'Hapus Data', id, `Menghapus Prestasi: ${nama}`);
      showToast('Data prestasi berhasil dihapus.', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaKejuaraan || !formData.peringkat) {
      showToast('Nama Kejuaraan dan Peringkat Juara wajib diisi!', 'error');
      return;
    }

    if (editingItem) {
      const updated = prestasiList.map(p =>
        p.id === editingItem.id ? ({ ...p, ...formData } as Prestasi) : p
      );
      onSave(updated);
      onAddLog('Prestasi', 'Edit Data', editingItem.id, `Memperbarui Prestasi: ${formData.namaKejuaraan}`);
      showToast('Data prestasi berhasil diperbarui.', 'success');
    } else {
      const nextNum = prestasiList.length + 1;
      const newId = `PRS-${String(nextNum).padStart(4, '0')}`;
      const newPrestasi: Prestasi = {
        id: newId,
        namaKejuaraan: formData.namaKejuaraan || '',
        cabangLomba: formData.cabangLomba || '',
        peringkat: formData.peringkat || 'Juara 1',
        tingkat: formData.tingkat || 'Kabupaten / Kwarcab',
        tahun: formData.tahun || '2026',
        tanggal: formData.tanggal || '12/08/2026',
        penyelenggara: formData.penyelenggara || 'Kwartir Cabang',
        delegasiPeserta: formData.delegasiPeserta || 'Regu Penggalang',
        pembinaPendamping: formData.pembinaPendamping || 'Kak Pembina',
        keterangan: formData.keterangan || '',
      };
      onSave([...prestasiList, newPrestasi]);
      onAddLog('Prestasi', 'Tambah Data', newId, `Menambahkan Prestasi: ${newPrestasi.peringkat} ${newPrestasi.namaKejuaraan}`);
      showToast('Prestasi baru berhasil ditambahkan.', 'success');
    }

    setIsModalOpen(false);
  };

  const canEdit = currentUserRole === 'ADMIN' || currentUserRole === 'PEMBINA';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-700" />
            <span>Prestasi & Rekam Jejak Juara Pramuka</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Dokumentasi Kejuaraan, Lomba Tingkat (LT), dan Penghargaan Pangkalan SMP IT Albashiroh
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Catatan Prestasi</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kejuaraan, cabang lomba, delegasi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-amber-700/20"
          />
        </div>

        <select
          value={filterTingkat}
          onChange={e => setFilterTingkat(e.target.value)}
          className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
        >
          {tingkatOptions.map(t => (
            <option key={t} value={t}>{t === 'Semua' ? 'Semua Tingkat Kejuaraan' : t}</option>
          ))}
        </select>
      </div>

      {/* Prestasi Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map(p => (
          <div
            key={p.id}
            className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Medal className="w-3.5 h-3.5 text-amber-700" />
                  {p.peringkat}
                </span>
                <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                  {p.tahun}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-stone-900 text-sm leading-snug">{p.namaKejuaraan}</h3>
                <p className="text-xs text-amber-900 font-semibold mt-0.5">{p.cabangLomba}</p>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                <div className="flex items-center gap-1.5 truncate">
                  <Award className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="truncate">{p.tingkat}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">Delegasi: {p.delegasiPeserta}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{p.tanggal} • {p.penyelenggara}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-400 truncate">
                Pendamping: <span className="text-stone-700 font-semibold">{p.pembinaPendamping}</span>
              </span>

              {canEdit && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-stone-100 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.namaKejuaraan)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-lg"
                    title="Hapus"
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">
                {editingItem ? 'Edit Catatan Prestasi' : 'Tambah Prestasi Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Event / Kejuaraan *</label>
                <input
                  type="text"
                  required
                  value={formData.namaKejuaraan || ''}
                  onChange={e => setFormData({ ...formData, namaKejuaraan: e.target.value })}
                  placeholder="Contoh: Lomba Tingkat II (LT II) Kwarran Turen"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Cabang / Kategori Lomba *</label>
                  <input
                    type="text"
                    required
                    value={formData.cabangLomba || ''}
                    onChange={e => setFormData({ ...formData, cabangLomba: e.target.value })}
                    placeholder="Pioneering / Morse / Regu Terbaik"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Peringkat / Juara *</label>
                  <input
                    type="text"
                    required
                    value={formData.peringkat || ''}
                    onChange={e => setFormData({ ...formData, peringkat: e.target.value })}
                    placeholder="Juara 1 / Juara Umum / Harapan 1"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tingkat</label>
                  <select
                    value={formData.tingkat}
                    onChange={e => setFormData({ ...formData, tingkat: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    {tingkatOptions.filter(t => t !== 'Semua').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tahun Perolehan</label>
                  <input
                    type="text"
                    value={formData.tahun || '2026'}
                    onChange={e => setFormData({ ...formData, tahun: e.target.value })}
                    placeholder="2026"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Delegasi Peserta / Regu</label>
                <input
                  type="text"
                  value={formData.delegasiPeserta || ''}
                  onChange={e => setFormData({ ...formData, delegasiPeserta: e.target.value })}
                  placeholder="Regu Elang (Ahmad Fadhil dkk.)"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Penyelenggara</label>
                  <input
                    type="text"
                    value={formData.penyelenggara || ''}
                    onChange={e => setFormData({ ...formData, penyelenggara: e.target.value })}
                    placeholder="Kwarran Turen / Kwarcab Malang"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Pembina Pendamping</label>
                  <input
                    type="text"
                    value={formData.pembinaPendamping || ''}
                    onChange={e => setFormData({ ...formData, pembinaPendamping: e.target.value })}
                    placeholder="Kak Pembina"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Hadiah & Keterangan</label>
                <input
                  type="text"
                  value={formData.keterangan || ''}
                  onChange={e => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Piala Tetap, Piagam & Uang Pembinaan"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
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
                  Simpan Prestasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
