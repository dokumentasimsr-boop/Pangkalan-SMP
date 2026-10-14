import React, { useState } from 'react';
import {
  Tent,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Wallet,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  X,
  FileText,
} from 'lucide-react';
import { Kegiatan, UserRole } from '../types';
import { useToast } from './Toast';

interface KegiatanViewProps {
  kegiatanList: Kegiatan[];
  onSave: (list: Kegiatan[]) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
}

export const KegiatanView: React.FC<KegiatanViewProps> = ({
  kegiatanList,
  onSave,
  currentUserRole,
  onAddLog,
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Kegiatan>>({
    namaKegiatan: '',
    jenis: 'Perkemahan / Mukhoyyam',
    tanggalMulai: '15/10/2026',
    tanggalSelesai: '17/10/2026',
    tempat: 'Bumi Perkemahan Coban Rondo, Malang',
    tingkat: 'Gudep',
    penanggungJawab: 'Kak Ahmad Fauzi, S.Pd',
    jumlahPeserta: 40,
    anggaran: 2500000,
    status: 'Rencana',
    keterangan: '',
  });

  const jenisOptions = [
    'Semua',
    'Latihan Rutin',
    'Perkemahan / Mukhoyyam',
    'Pelantikan SKU/SKK',
    'Lomba / Kompetisi',
    'Bakti Sosial',
    'Pentas Seni & Api Unggun',
  ];

  const filteredList = kegiatanList.filter(k => {
    const s = (search || '').toLowerCase();
    const matchSearch =
      (k.namaKegiatan || '').toLowerCase().includes(s) ||
      (k.tempat || '').toLowerCase().includes(s) ||
      (k.penanggungJawab || '').toLowerCase().includes(s);
    const matchJenis = filterJenis === 'Semua' || k.jenis === filterJenis;
    const matchStatus = filterStatus === 'Semua' || k.status === filterStatus;
    return matchSearch && matchJenis && matchStatus;
  });

  const handleOpenAdd = () => {
    setEditingKegiatan(null);
    setFormData({
      namaKegiatan: '',
      jenis: 'Perkemahan / Mukhoyyam',
      tanggalMulai: '15/10/2026',
      tanggalSelesai: '17/10/2026',
      tempat: 'Bumi Perkemahan Coban Rondo, Malang',
      tingkat: 'Gudep',
      penanggungJawab: 'Kak Ahmad Fauzi, S.Pd',
      jumlahPeserta: 40,
      anggaran: 2500000,
      status: 'Rencana',
      keterangan: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (keg: Kegiatan) => {
    setEditingKegiatan(keg);
    setFormData({ ...keg });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Hapus kegiatan: "${nama}"?`)) {
      const updated = kegiatanList.filter(k => k.id !== id);
      onSave(updated);
      onAddLog('Kegiatan', 'Hapus Data', id, `Menghapus Kegiatan: ${nama}`);
      showToast('Kegiatan berhasil dihapus.', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaKegiatan || !formData.tempat) {
      showToast('Nama Kegiatan dan Lokasi wajib diisi!', 'error');
      return;
    }

    if (editingKegiatan) {
      const updated = kegiatanList.map(k =>
        k.id === editingKegiatan.id ? ({ ...k, ...formData, jumlahPeserta: Number(formData.jumlahPeserta) || 0, anggaran: Number(formData.anggaran) || 0 } as Kegiatan) : k
      );
      onSave(updated);
      onAddLog('Kegiatan', 'Edit Data', editingKegiatan.id, `Memperbarui Kegiatan: ${formData.namaKegiatan}`);
      showToast('Data Kegiatan berhasil diperbarui.', 'success');
    } else {
      const nextNum = kegiatanList.length + 1;
      const newId = `KEG-${String(nextNum).padStart(4, '0')}`;
      const newKeg: Kegiatan = {
        id: newId,
        namaKegiatan: formData.namaKegiatan || '',
        jenis: formData.jenis || 'Latihan Rutin',
        tanggalMulai: formData.tanggalMulai || '15/10/2026',
        tanggalSelesai: formData.tanggalSelesai || '17/10/2026',
        tempat: formData.tempat || 'Bumi Perkemahan',
        tingkat: formData.tingkat || 'Gudep',
        penanggungJawab: formData.penanggungJawab || 'Kak Pembina',
        jumlahPeserta: Number(formData.jumlahPeserta) || 0,
        anggaran: Number(formData.anggaran) || 0,
        status: formData.status as any || 'Rencana',
        keterangan: formData.keterangan || '',
      };
      onSave([...kegiatanList, newKeg]);
      onAddLog('Kegiatan', 'Tambah Data', newId, `Menambahkan Kegiatan: ${newKeg.namaKegiatan}`);
      showToast('Kegiatan baru berhasil ditambahkan.', 'success');
    }

    setIsModalOpen(false);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const canEdit = currentUserRole === 'ADMIN' || currentUserRole === 'PEMBINA';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Tent className="w-5 h-5 text-amber-700" />
            <span>Kegiatan & Perkemahan Pramuka</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manajemen Perkemahan, Pelantikan, Lomba, dan Kegiatan Outdoor Penggalang
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kegiatan</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama kegiatan, lokasi, PJ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-amber-700/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterJenis}
            onChange={e => setFilterJenis(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
          >
            {jenisOptions.map(j => (
              <option key={j} value={j}>{j === 'Semua' ? 'Semua Jenis' : j}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
          >
            <option value="Semua">Semua Status</option>
            <option value="Rencana">Rencana</option>
            <option value="Berlangsung">Berlangsung</option>
            <option value="Selesai">Selesai</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Grid of Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map(k => (
          <div
            key={k.id}
            className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                  {k.jenis}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  k.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                  k.status === 'Berlangsung' ? 'bg-amber-100 text-amber-800' :
                  k.status === 'Dibatalkan' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {k.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-stone-900 text-sm leading-snug">{k.namaKegiatan}</h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{k.tanggalMulai} s.d {k.tanggalSelesai}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{k.tempat}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" /> {k.jumlahPeserta} Peserta
                  </span>
                  <span className="flex items-center gap-1 font-bold text-stone-800">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" /> {formatRupiah(k.anggaran)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 truncate">
                PJ: <span className="font-semibold text-stone-700">{k.penanggungJawab}</span>
              </span>

              {canEdit && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(k)}
                    className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-stone-100 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(k.id, k.namaKegiatan)}
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
                {editingKegiatan ? 'Edit Kegiatan Pramuka' : 'Tambah Kegiatan Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Kegiatan *</label>
                <input
                  type="text"
                  required
                  value={formData.namaKegiatan || ''}
                  onChange={e => setFormData({ ...formData, namaKegiatan: e.target.value })}
                  placeholder="Contoh: Perkemahan Akhir Tahun & Pelantikan Ramu"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Jenis Kegiatan</label>
                  <select
                    value={formData.jenis}
                    onChange={e => setFormData({ ...formData, jenis: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    {jenisOptions.filter(j => j !== 'Semua').map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tingkat</label>
                  <select
                    value={formData.tingkat}
                    onChange={e => setFormData({ ...formData, tingkat: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Gudep">Gugus Depan (Sekolah)</option>
                    <option value="Ranting">Kwarran Turen</option>
                    <option value="Cabang">Kwarcab Malang</option>
                    <option value="Daerah">Kwarda Jatim</option>
                    <option value="Nasional">Kwarnas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal Mulai (DD/MM/YYYY)</label>
                  <input
                    type="text"
                    value={formData.tanggalMulai || ''}
                    onChange={e => setFormData({ ...formData, tanggalMulai: e.target.value })}
                    placeholder="15/10/2026"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="text"
                    value={formData.tanggalSelesai || ''}
                    onChange={e => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                    placeholder="17/10/2026"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tempat / Lokasi *</label>
                <input
                  type="text"
                  required
                  value={formData.tempat || ''}
                  onChange={e => setFormData({ ...formData, tempat: e.target.value })}
                  placeholder="Contoh: Bumi Perkemahan Coban Rondo, Malang"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Jumlah Peserta</label>
                  <input
                    type="number"
                    value={formData.jumlahPeserta || 0}
                    onChange={e => setFormData({ ...formData, jumlahPeserta: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Anggaran (Rp)</label>
                  <input
                    type="number"
                    value={formData.anggaran || 0}
                    onChange={e => setFormData({ ...formData, anggaran: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Status</label>
                  <select
                    value={formData.status || 'Rencana'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Rencana">Rencana</option>
                    <option value="Berlangsung">Berlangsung</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Penanggung Jawab (PJ)</label>
                <input
                  type="text"
                  value={formData.penanggungJawab || ''}
                  onChange={e => setFormData({ ...formData, penanggungJawab: e.target.value })}
                  placeholder="Kak Pembina"
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
                  Simpan Kegiatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
