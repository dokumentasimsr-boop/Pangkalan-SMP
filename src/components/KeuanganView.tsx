import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Calendar,
  DollarSign,
  Trash2,
  Edit2,
  X,
  FileCheck,
  Building,
} from 'lucide-react';
import { KeuanganRecord, UserRole } from '../types';
import { useToast } from './Toast';

interface KeuanganViewProps {
  keuanganList: KeuanganRecord[];
  onSave: (list: KeuanganRecord[]) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
}

export const KeuanganView: React.FC<KeuanganViewProps> = ({
  keuanganList,
  onSave,
  currentUserRole,
  onAddLog,
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('Semua');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<KeuanganRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<KeuanganRecord>>({
    tanggal: new Date().toISOString().slice(0, 10),
    jenis: 'Pemasukan',
    kategori: 'Iuran Kas Anggota',
    nominal: 0,
    keterangan: '',
    penanggungJawab: '',
    nomorKwitansi: '',
  });

  const kategoriOptions = [
    'Semua',
    'Iuran Kas Anggota',
    'BOS / Anggaran Sekolah',
    'Iuran Perkemahan',
    'Pembelian Sarpras & Tenda',
    'Konsumsi & Snack Latihan',
    'Transportasi & Delegasi',
    'P3K & Kesehatan',
    'Lain-lain',
  ];

  // Calculate cumulative balance properly
  let running = 0;
  const listWithBalances = keuanganList.map(item => {
    if (item.jenis === 'Pemasukan') {
      running += item.nominal;
    } else {
      running -= item.nominal;
    }
    return {
      ...item,
      saldo: running,
    };
  });

  const totalMasuk = keuanganList
    .filter(k => k.jenis === 'Pemasukan')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalKeluar = keuanganList
    .filter(k => k.jenis === 'Pengeluaran')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const saldoAkhir = totalMasuk - totalKeluar;

  const filteredList = listWithBalances.filter(k => {
    const s = (search || '').toLowerCase();
    const matchSearch =
      (k.keterangan || '').toLowerCase().includes(s) ||
      (k.penanggungJawab || '').toLowerCase().includes(s) ||
      (k.nomorKwitansi || '').toLowerCase().includes(s) ||
      (k.kategori || '').toLowerCase().includes(s);
    const matchJenis = filterJenis === 'Semua' || k.jenis === filterJenis;
    const matchKat = filterKategori === 'Semua' || k.kategori === filterKategori;
    return matchSearch && matchJenis && matchKat;
  });

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      tanggal: '20/08/2026',
      jenis: 'Pemasukan',
      kategori: 'Iuran Kas Anggota',
      nominal: 150000,
      keterangan: '',
      penanggungJawab: 'Kak Siti Rahmawati (Bendahara)',
      nomorKwitansi: `KWT-${String(keuanganList.length + 1).padStart(3, '0')}`,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: KeuanganRecord) => {
    setEditingRecord(rec);
    setFormData({ ...rec });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, ket: string) => {
    if (confirm(`Hapus transaksi kas: "${ket}"?`)) {
      const updated = keuanganList.filter(k => k.id !== id);
      onSave(updated);
      onAddLog('Keuangan', 'Hapus Data', id, `Menghapus Transaksi: ${ket}`);
      showToast('Transaksi kas berhasil dihapus.', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nominal || formData.nominal <= 0 || !formData.keterangan) {
      showToast('Nominal dan Uraian Keterangan wajib diisi!', 'error');
      return;
    }

    if (editingRecord) {
      const updated = keuanganList.map(k =>
        k.id === editingRecord.id ? ({ ...k, ...formData, nominal: Number(formData.nominal) || 0 } as KeuanganRecord) : k
      );
      onSave(updated);
      onAddLog('Keuangan', 'Edit Data', editingRecord.id, `Memperbarui Transaksi Kas: ${formData.keterangan}`);
      showToast('Data transaksi kas berhasil diperbarui.', 'success');
    } else {
      const nextNum = keuanganList.length + 1;
      const newId = `KAS-${String(nextNum).padStart(4, '0')}`;
      const newRec: KeuanganRecord = {
        id: newId,
        tanggal: formData.tanggal || '20/08/2026',
        jenis: formData.jenis as any || 'Pemasukan',
        kategori: formData.kategori || 'Iuran Kas Anggota',
        nominal: Number(formData.nominal) || 0,
        saldo: 0, // Recalculated dynamically
        keterangan: formData.keterangan || '',
        penanggungJawab: formData.penanggungJawab || 'Bendahara Gudep',
        nomorKwitansi: formData.nomorKwitansi || `KWT-${nextNum}`,
      };
      onSave([...keuanganList, newRec]);
      onAddLog('Keuangan', 'Tambah Data', newId, `Mencatat ${newRec.jenis} sebesar ${formatRupiah(newRec.nominal)}`);
      showToast(`Transaksi ${newRec.jenis} berhasil dicatat.`, 'success');
    }

    setIsModalOpen(false);
  };

  const exportCSV = () => {
    const headers = ['ID Transaksi', 'Tanggal', 'Jenis', 'Kategori', 'Uraian Keterangan', 'Nominal', 'Penanggung Jawab', 'No. Kwitansi'];
    const rows = filteredList.map(k => [
      k.id,
      k.tanggal,
      k.jenis,
      `"${k.kategori}"`,
      `"${k.keterangan}"`,
      k.nominal,
      `"${k.penanggungJawab}"`,
      `"${k.nomorKwitansi}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Buku_Kas_Pramuka_Gudep_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Buku kas berhasil diekspor ke CSV', 'info');
  };

  const canEdit = currentUserRole === 'ADMIN' || currentUserRole === 'PEMBINA';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-700" />
            <span>Buku Kas & Keuangan Digital Gudep</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Pencatatan Pemasukan, Pengeluaran, Iuran Kas, dan Saldo Berjalan Gugus Depan
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
              <span>Catat Transaksi Kas</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Saldo */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Saldo Kas Saat Ini</span>
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2">
            {formatRupiah(saldoAkhir)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 font-medium">
            Kas aktif Gugus Depan Pramuka
          </div>
        </div>

        {/* Total Masuk */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Total Pemasukan</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-2">
            {formatRupiah(totalMasuk)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold">
            Iuran kas, dana kegiatan & bantuan
          </div>
        </div>

        {/* Total Keluar */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800">Total Pengeluaran</span>
            <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-rose-900 mt-2">
            {formatRupiah(totalKeluar)}
          </div>
          <div className="text-[11px] text-rose-500 mt-1 font-medium">
            Pengadaan sarpras, konsumsi & transport
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari uraian, kwitansi, PJ..."
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
            <option value="Semua">Semua Arus Kas</option>
            <option value="Pemasukan">Pemasukan (+)</option>
            <option value="Pengeluaran">Pengeluaran (-)</option>
          </select>

          <select
            value={filterKategori}
            onChange={e => setFilterKategori(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 max-w-[200px]"
          >
            {kategoriOptions.map(k => (
              <option key={k} value={k}>{k === 'Semua' ? 'Semua Pos Kategori' : k}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cash Flow Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-900 text-stone-200 border-b border-stone-800 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Tanggal & No. Kwt</th>
                <th className="px-4 py-3.5">Pos Kategori & Uraian</th>
                <th className="px-4 py-3.5 text-right">Pemasukan</th>
                <th className="px-4 py-3.5 text-right">Pengeluaran</th>
                <th className="px-4 py-3.5 text-right">Saldo Kas</th>
                <th className="px-4 py-3.5 text-right no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {filteredList.map(k => {
                const isMasuk = k.jenis === 'Pemasukan';
                return (
                  <tr key={k.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-stone-900">{k.tanggal}</div>
                      <div className="text-[10px] text-amber-800 font-mono font-semibold">{k.nomorKwitansi}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700 mb-1">
                        {k.kategori}
                      </span>
                      <div className="font-semibold text-stone-900">{k.keterangan}</div>
                      <div className="text-[10px] text-stone-400">PJ: {k.penanggungJawab}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">
                      {isMasuk ? `+${formatRupiah(k.nominal)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-700">
                      {!isMasuk ? `-${formatRupiah(k.nominal)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-stone-900 font-mono">
                      {formatRupiah(k.saldo)}
                    </td>
                    <td className="px-4 py-3 text-right no-print">
                      {canEdit && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(k)}
                            className="p-1 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(k.id, k.keterangan)}
                            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
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
                {editingRecord ? 'Edit Transaksi Kas' : 'Catat Transaksi Kas Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Jenis Transaksi</label>
                  <select
                    value={formData.jenis}
                    onChange={e => setFormData({ ...formData, jenis: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  >
                    <option value="Pemasukan">Pemasukan (+)</option>
                    <option value="Pengeluaran">Pengeluaran (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal (DD/MM/YYYY)</label>
                  <input
                    type="text"
                    value={formData.tanggal || ''}
                    onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                    placeholder="20/08/2026"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Pos Kategori</label>
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
                  <label className="block font-semibold text-stone-700 mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={formData.nominal || 0}
                    onChange={e => setFormData({ ...formData, nominal: Number(e.target.value) })}
                    placeholder="150000"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Uraian / Keterangan Transaksi *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.keterangan || ''}
                  onChange={e => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Contoh: Pembelian tali tambang manila & patok bambu pionering"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nomor Kwitansi / Bukti</label>
                  <input
                    type="text"
                    value={formData.nomorKwitansi || ''}
                    onChange={e => setFormData({ ...formData, nomorKwitansi: e.target.value })}
                    placeholder="KWT-012"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Penanggung Jawab (Bendahara)</label>
                  <input
                    type="text"
                    value={formData.penanggungJawab || ''}
                    onChange={e => setFormData({ ...formData, penanggungJawab: e.target.value })}
                    placeholder="Kak Bendahara"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
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
                  Simpan Transaksi Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
