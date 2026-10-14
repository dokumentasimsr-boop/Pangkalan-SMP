import React, { useState } from 'react';
import {
  Camera,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Calendar,
  Tag,
  Trash2,
  Edit2,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { Dokumentasi, UserRole } from '../types';
import { useToast } from './Toast';

interface DokumentasiViewProps {
  dokumentasiList: Dokumentasi[];
  onSave: (list: Dokumentasi[]) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
}

export const DokumentasiView: React.FC<DokumentasiViewProps> = ({
  dokumentasiList,
  onSave,
  currentUserRole,
  onAddLog,
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Dokumentasi | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Dokumentasi>>({
    judul: '',
    tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    kegiatan: '',
    kategori: 'Foto Kegiatan',
    driveUrl: '',
    keterangan: '',
  });

  const kategoriOptions = [
    'Semua',
    'Foto Kegiatan',
    'Video & Vlog',
    'Arsip Dokumen / LPJ',
    'Sertifikat & Piagam',
  ];

  const filteredList = dokumentasiList.filter(d => {
    const s = (search || '').toLowerCase();
    const matchSearch =
      (d.judul || '').toLowerCase().includes(s) ||
      (d.kegiatan || '').toLowerCase().includes(s);
    const matchKat = filterKategori === 'Semua' || d.kategori === filterKategori;
    return matchSearch && matchKat;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      judul: '',
      tanggal: '15/08/2026',
      kegiatan: '',
      kategori: 'Foto Kegiatan',
      driveUrl: '',
      keterangan: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Dokumentasi) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, judul: string) => {
    if (confirm(`Hapus tautan dokumentasi: "${judul}"?`)) {
      const updated = dokumentasiList.filter(d => d.id !== id);
      onSave(updated);
      onAddLog('Dokumentasi', 'Hapus Data', id, `Menghapus Dokumentasi: ${judul}`);
      showToast('Dokumentasi berhasil dihapus.', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.driveUrl) {
      showToast('Judul dan Tautan Drive wajib diisi!', 'error');
      return;
    }

    if (editingItem) {
      const updated = dokumentasiList.map(d =>
        d.id === editingItem.id ? ({ ...d, ...formData } as Dokumentasi) : d
      );
      onSave(updated);
      onAddLog('Dokumentasi', 'Edit Data', editingItem.id, `Memperbarui Dokumentasi: ${formData.judul}`);
      showToast('Dokumentasi berhasil diperbarui.', 'success');
    } else {
      const nextNum = dokumentasiList.length + 1;
      const newId = `DOK-${String(nextNum).padStart(4, '0')}`;
      const newDok: Dokumentasi = {
        id: newId,
        judul: formData.judul || '',
        tanggal: formData.tanggal || '15/08/2026',
        kegiatan: formData.kegiatan || 'Kegiatan Pramuka',
        kategori: formData.kategori || 'Foto Kegiatan',
        driveUrl: formData.driveUrl || '',
        keterangan: formData.keterangan || '',
      };
      onSave([...dokumentasiList, newDok]);
      onAddLog('Dokumentasi', 'Tambah Data', newId, `Menambahkan Dokumentasi: ${newDok.judul}`);
      showToast('Tautan dokumentasi baru berhasil ditambahkan.', 'success');
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
            <Camera className="w-5 h-5 text-amber-700" />
            <span>Dokumentasi & Galeri Arsip Digital</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manajemen Tautan Foto Kegiatan, Video, Album Google Drive & Arsip Dokumenter
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Dokumentasi</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul dokumentasi atau kegiatan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-amber-700/20"
          />
        </div>

        <select
          value={filterKategori}
          onChange={e => setFilterKategori(e.target.value)}
          className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
        >
          {kategoriOptions.map(k => (
            <option key={k} value={k}>{k === 'Semua' ? 'Semua Kategori' : k}</option>
          ))}
        </select>
      </div>

      {/* Grid Documentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map(d => (
          <div
            key={d.id}
            className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                  {d.kategori}
                </span>
                <span className="text-[11px] text-stone-500 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  {d.tanggal}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-stone-900 text-sm leading-snug">{d.judul}</h3>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">{d.kegiatan}</p>
                <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">{d.keterangan}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
              <a
                href={d.driveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Google Drive</span>
              </a>

              {canEdit && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(d)}
                    className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-stone-100 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(d.id, d.judul)}
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">
                {editingItem ? 'Edit Link Dokumentasi' : 'Tambah Tautan Dokumentasi'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Judul Album / Dokumentasi *</label>
                <input
                  type="text"
                  required
                  value={formData.judul || ''}
                  onChange={e => setFormData({ ...formData, judul: e.target.value })}
                  placeholder="Contoh: Galeri Foto Pelantikan Ramu & Rakit 2026"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={formData.kategori}
                    onChange={e => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    {kategoriOptions.filter(k => k !== 'Semua').map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal Kegiatan</label>
                  <input
                    type="text"
                    value={formData.tanggal || ''}
                    onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Kegiatan</label>
                <input
                  type="text"
                  value={formData.kegiatan || ''}
                  onChange={e => setFormData({ ...formData, kegiatan: e.target.value })}
                  placeholder="Perkemahan Coban Rondo / Latihan Rutin"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Link Google Drive / YouTube *</label>
                <input
                  type="url"
                  required
                  value={formData.driveUrl || ''}
                  onChange={e => setFormData({ ...formData, driveUrl: e.target.value })}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Keterangan / Catatan Album</label>
                <textarea
                  rows={2}
                  value={formData.keterangan || ''}
                  onChange={e => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Dokumentasi foto & video resolusi tinggi..."
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
                  Simpan Dokumentasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
