import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Download,
} from 'lucide-react';
import { Inventaris, UserRole } from '../types';
import { useToast } from './Toast';

interface InventarisViewProps {
  inventarisList: Inventaris[];
  onSave: (list: Inventaris[]) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
}

export const InventarisView: React.FC<InventarisViewProps> = ({
  inventarisList,
  onSave,
  currentUserRole,
  onAddLog,
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [filterKondisi, setFilterKondisi] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventaris | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Inventaris>>({
    namaBarang: '',
    kategori: 'Perlengkapan Kemah',
    jumlah: 1,
    satuan: 'Unit',
    kondisi: 'Baik',
    lokasiPenyimpanan: 'Gudang Pramuka Rak A',
    sumberPengadaan: 'BOS / Iuran Gudep',
    tanggalPengadaan: '10/01/2026',
    keterangan: '',
  });

  const kategoriOptions = [
    'Semua',
    'Perlengkapan Kemah',
    'Peralatan Latihan',
    'Atribut & Bendera',
    'Alat Kebersihan & Lapangan',
    'Kesehatan & P3K',
  ];

  const filteredList = inventarisList.filter(i => {
    const s = (search || '').toLowerCase();
    const matchSearch =
      (i.namaBarang || '').toLowerCase().includes(s) ||
      (i.lokasiPenyimpanan || i.lokasi || '').toLowerCase().includes(s) ||
      (i.kodeBarang || '').toLowerCase().includes(s);
    const matchKat = filterKategori === 'Semua' || i.kategori === filterKategori;
    const matchKon = filterKondisi === 'Semua' || i.kondisi === filterKondisi;
    return matchSearch && matchKat && matchKon;
  });

  const totalItems = inventarisList.reduce((acc, curr) => acc + curr.jumlah, 0);
  const baikCount = inventarisList.filter(i => i.kondisi === 'Baik').reduce((acc, curr) => acc + curr.jumlah, 0);
  const rusakCount = inventarisList.filter(i => i.kondisi === 'Rusak Ringan' || i.kondisi === 'Rusak Berat').reduce((acc, curr) => acc + curr.jumlah, 0);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      namaBarang: '',
      kategori: 'Perlengkapan Kemah',
      jumlah: 1,
      satuan: 'Unit',
      kondisi: 'Baik',
      lokasiPenyimpanan: 'Gudang Pramuka Rak A',
      sumberPengadaan: 'BOS / Iuran Gudep',
      tanggalPengadaan: '10/01/2026',
      keterangan: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Inventaris) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Hapus barang inventaris: "${nama}"?`)) {
      const updated = inventarisList.filter(i => i.id !== id);
      onSave(updated);
      onAddLog('Inventaris', 'Hapus Data', id, `Menghapus Inventaris: ${nama}`);
      showToast('Barang inventaris berhasil dihapus.', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaBarang) {
      showToast('Nama Barang wajib diisi!', 'error');
      return;
    }

    if (editingItem) {
      const updated = inventarisList.map(i =>
        i.id === editingItem.id ? ({ ...i, ...formData, jumlah: Number(formData.jumlah) || 1 } as Inventaris) : i
      );
      onSave(updated);
      onAddLog('Inventaris', 'Edit Data', editingItem.id, `Memperbarui Inventaris: ${formData.namaBarang}`);
      showToast('Data Inventaris berhasil diperbarui.', 'success');
    } else {
      const nextNum = inventarisList.length + 1;
      const newId = `INV-${String(nextNum).padStart(4, '0')}`;
      const newItem: Inventaris = {
        id: newId,
        namaBarang: formData.namaBarang || '',
        kategori: formData.kategori || 'Perlengkapan Kemah',
        jumlah: Number(formData.jumlah) || 1,
        satuan: formData.satuan || 'Unit',
        kondisi: formData.kondisi as any || 'Baik',
        lokasiPenyimpanan: formData.lokasiPenyimpanan || 'Gudang Pramuka',
        sumberPengadaan: formData.sumberPengadaan || 'Gudep',
        tanggalPengadaan: formData.tanggalPengadaan || '01/01/2026',
        keterangan: formData.keterangan || '',
      };
      onSave([...inventarisList, newItem]);
      onAddLog('Inventaris', 'Tambah Data', newId, `Menambahkan Inventaris: ${newItem.namaBarang}`);
      showToast('Barang baru berhasil dicatat.', 'success');
    }

    setIsModalOpen(false);
  };

  const exportCSV = () => {
    const headers = ['ID Barang', 'Nama Barang', 'Kategori', 'Jumlah', 'Satuan', 'Kondisi', 'Lokasi Simpan', 'Sumber', 'Tgl Pengadaan', 'Keterangan'];
    const rows = filteredList.map(i => [
      i.id,
      `"${i.namaBarang}"`,
      `"${i.kategori}"`,
      i.jumlah,
      i.satuan,
      i.kondisi,
      `"${i.lokasiPenyimpanan}"`,
      `"${i.sumberPengadaan}"`,
      i.tanggalPengadaan,
      `"${i.keterangan}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Inventaris_Sarpras_Pramuka_SMPIT_Albashiroh_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data inventaris berhasil diekspor ke CSV', 'info');
  };

  const canEdit = currentUserRole === 'ADMIN' || currentUserRole === 'PEMBINA' || currentUserRole === 'PETUGAS';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-700" />
            <span>Inventaris & Sarana Perlengkapan Gudep</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Pencatatan sarana kemah, peralatan pionering, bendera, dan aset pangkalan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span>Ekspor CSV</span>
          </button>
          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Barang</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-stone-500">Total Jenis Barang</div>
            <div className="text-2xl font-bold text-stone-900 mt-0.5">{inventarisList.length} Item</div>
            <div className="text-[11px] text-stone-400 font-medium">{totalItems} kuantiti total</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-700">Kondisi Baik (Siap Pakai)</div>
            <div className="text-2xl font-bold text-emerald-900 mt-0.5">{baikCount} Unit</div>
            <div className="text-[11px] text-emerald-600 font-semibold">{totalItems > 0 ? Math.round((baikCount/totalItems)*100) : 0}% kelayakan</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-rose-700">Perlu Perbaikan / Rusak</div>
            <div className="text-2xl font-bold text-rose-900 mt-0.5">{rusakCount} Unit</div>
            <div className="text-[11px] text-rose-500 font-medium">Perlu peremajaan</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama barang, tempat simpan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-amber-700/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterKategori}
            onChange={e => setFilterKategori(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 max-w-[200px]"
          >
            {kategoriOptions.map(k => (
              <option key={k} value={k}>{k === 'Semua' ? 'Semua Kategori' : k}</option>
            ))}
          </select>

          <select
            value={filterKondisi}
            onChange={e => setFilterKondisi(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
          >
            <option value="Semua">Semua Kondisi</option>
            <option value="Baik">Kondisi Baik</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Rusak Berat">Rusak Berat</option>
            <option value="Hilang">Hilang</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-900 text-stone-200 border-b border-stone-800 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Kode & Nama Barang</th>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">Jumlah & Satuan</th>
                <th className="px-4 py-3.5">Kondisi</th>
                <th className="px-4 py-3.5">Lokasi Penyimpanan</th>
                <th className="px-4 py-3.5 text-right no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {filteredList.length > 0 ? (
                filteredList.map(i => (
                  <tr key={i.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-stone-900">{i.namaBarang}</div>
                      <div className="text-[11px] text-amber-800 font-mono font-semibold">{i.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700">
                        {i.kategori}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-stone-900">
                      {i.jumlah} {i.satuan}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        i.kondisi === 'Baik' ? 'bg-emerald-100 text-emerald-800' :
                        i.kondisi === 'Rusak Ringan' ? 'bg-amber-100 text-amber-800' :
                        i.kondisi === 'Rusak Berat' ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {i.kondisi}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-800">{i.lokasiPenyimpanan}</div>
                      <div className="text-[10px] text-stone-400">Pengadaan: {i.tanggalPengadaan}</div>
                    </td>
                    <td className="px-4 py-3 text-right no-print">
                      {canEdit && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(i)}
                            className="p-1 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(i.id, i.namaBarang)}
                            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                    Tidak ada data inventaris yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">
                {editingItem ? 'Edit Data Inventaris' : 'Tambah Barang Inventaris Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Barang *</label>
                <input
                  type="text"
                  required
                  value={formData.namaBarang || ''}
                  onChange={e => setFormData({ ...formData, namaBarang: e.target.value })}
                  placeholder="Contoh: Tenda Dome Kapasitas 6 Orang"
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
                  <label className="block font-semibold text-stone-700 mb-1">Kondisi Barang</label>
                  <select
                    value={formData.kondisi}
                    onChange={e => setFormData({ ...formData, kondisi: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                    <option value="Hilang">Hilang</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Jumlah</label>
                  <input
                    type="number"
                    value={formData.jumlah || 1}
                    onChange={e => setFormData({ ...formData, jumlah: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    value={formData.satuan || 'Unit'}
                    onChange={e => setFormData({ ...formData, satuan: e.target.value })}
                    placeholder="Unit / Buah / Set / Gulung"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Lokasi Penyimpanan</label>
                <input
                  type="text"
                  value={formData.lokasiPenyimpanan || ''}
                  onChange={e => setFormData({ ...formData, lokasiPenyimpanan: e.target.value })}
                  placeholder="Gudang Pramuka Rak B / Lemari Pembina"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Sumber Pengadaan</label>
                  <input
                    type="text"
                    value={formData.sumberPengadaan || ''}
                    onChange={e => setFormData({ ...formData, sumberPengadaan: e.target.value })}
                    placeholder="Dana BOS / Hibah Mabigus"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal Pengadaan</label>
                  <input
                    type="text"
                    value={formData.tanggalPengadaan || ''}
                    onChange={e => setFormData({ ...formData, tanggalPengadaan: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={formData.keterangan || ''}
                  onChange={e => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Kelengkapan tali, pasak, dsb."
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
                  Simpan Inventaris
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
