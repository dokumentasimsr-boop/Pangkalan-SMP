import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Wallet,
  X,
  Download,
} from 'lucide-react';
import { ProgramKerja, UserRole } from '../types';
import { useToast } from './Toast';

interface ProgramKerjaViewProps {
  programList: ProgramKerja[];
  onSave: (list: ProgramKerja[]) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
}

export const ProgramKerjaView: React.FC<ProgramKerjaViewProps> = ({
  programList,
  onSave,
  currentUserRole,
  onAddLog,
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterBidang, setFilterBidang] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramKerja | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ProgramKerja>>({
    namaProgram: '',
    bidang: 'Kegiatan Operasional',
    tujuan: '',
    sasaran: 'Seluruh Penggalang',
    waktuPelaksanaan: 'Setiap Pekan',
    penanggungJawab: 'Pembina Satuan',
    anggaran: 0,
    sumberDana: 'BOS / Iuran Gudep',
    status: 'Belum Terlaksana',
    keterangan: '',
  });

  const bidangOptions = [
    'Semua',
    'Organisasi & Administrasi',
    'Pendidikan & Latihan',
    'Kegiatan Operasional',
    'Sarana & Prasarana',
    'Keuangan & Usaha',
    'Hubungan Masyarakat',
  ];

  const filteredList = programList.filter(p => {
    const s = (search || '').toLowerCase();
    const matchSearch =
      (p.namaProgram || '').toLowerCase().includes(s) ||
      (p.tujuan || '').toLowerCase().includes(s) ||
      (p.penanggungJawab || '').toLowerCase().includes(s);
    const matchBidang = filterBidang === 'Semua' || p.bidang === filterBidang;
    const matchStatus = filterStatus === 'Semua' || p.status === filterStatus;
    return matchSearch && matchBidang && matchStatus;
  });

  const totalAnggaran = programList.reduce((sum, item) => sum + item.anggaran, 0);
  const terlaksanaCount = programList.filter(p => p.status === 'Terlaksana').length;

  const handleOpenAdd = () => {
    setEditingProgram(null);
    setFormData({
      namaProgram: '',
      bidang: 'Kegiatan Operasional',
      tujuan: '',
      sasaran: 'Seluruh Penggalang',
      waktuPelaksanaan: 'Setiap Pekan',
      penanggungJawab: 'Pembina Satuan',
      anggaran: 0,
      sumberDana: 'BOS / Iuran Gudep',
      status: 'Belum Terlaksana',
      keterangan: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prog: ProgramKerja) => {
    setEditingProgram(prog);
    setFormData({ ...prog });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Hapus program kerja: ${nama}?`)) {
      const updated = programList.filter(p => p.id !== id);
      onSave(updated);
      onAddLog('Program Kerja', 'Hapus Data', id, `Menghapus Program: ${nama}`);
      showToast('Program Kerja berhasil dihapus.', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaProgram || !formData.tujuan) {
      showToast('Nama Program dan Tujuan wajib diisi!', 'error');
      return;
    }

    if (editingProgram) {
      const updated = programList.map(p =>
        p.id === editingProgram.id ? ({ ...p, ...formData, anggaran: Number(formData.anggaran) || 0 } as ProgramKerja) : p
      );
      onSave(updated);
      onAddLog('Program Kerja', 'Edit Data', editingProgram.id, `Memperbarui Program: ${formData.namaProgram}`);
      showToast('Program Kerja berhasil diperbarui.', 'success');
    } else {
      const nextNum = programList.length + 1;
      const newId = `PROG-${String(nextNum).padStart(4, '0')}`;
      const newProg: ProgramKerja = {
        id: newId,
        namaProgram: formData.namaProgram || '',
        bidang: formData.bidang || 'Kegiatan Operasional',
        tujuan: formData.tujuan || '',
        sasaran: formData.sasaran || 'Seluruh Penggalang',
        waktuPelaksanaan: formData.waktuPelaksanaan || 'Semester Ganjil',
        penanggungJawab: formData.penanggungJawab || 'Pembina Satuan',
        anggaran: Number(formData.anggaran) || 0,
        sumberDana: formData.sumberDana || 'BOS / Iuran Gudep',
        status: formData.status as any || 'Belum Terlaksana',
        keterangan: formData.keterangan || '',
      };
      onSave([...programList, newProg]);
      onAddLog('Program Kerja', 'Tambah Data', newId, `Menambahkan Program: ${newProg.namaProgram}`);
      showToast('Program Kerja baru berhasil ditambahkan.', 'success');
    }

    setIsModalOpen(false);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const canEdit = currentUserRole === 'ADMIN' || currentUserRole === 'PEMBINA';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-700" />
            <span>Program Kerja Gugus Depan</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Rencana Strategis & Operasional Gerakan Pramuka SMP IT Albashiroh Turen
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Program Kerja</span>
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-stone-500">Total Program</div>
            <div className="text-2xl font-bold text-stone-900 mt-0.5">{programList.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-stone-500">Tingkat Keterlaksanaan</div>
            <div className="text-2xl font-bold text-emerald-800 mt-0.5">
              {programList.length > 0 ? Math.round((terlaksanaCount / programList.length) * 100) : 0}%
            </div>
            <div className="text-[11px] text-stone-500 font-medium">{terlaksanaCount} dari {programList.length} selesai</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-stone-500">Total Rencana Anggaran</div>
            <div className="text-xl font-bold text-amber-900 mt-0.5">{formatRupiah(totalAnggaran)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari program, tujuan, PJ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-amber-700/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterBidang}
            onChange={e => setFilterBidang(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
          >
            {bidangOptions.map(b => (
              <option key={b} value={b}>{b === 'Semua' ? 'Semua Bidang' : b}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
          >
            <option value="Semua">Semua Status</option>
            <option value="Belum Terlaksana">Belum Terlaksana</option>
            <option value="Proses">Sedang Berjalan</option>
            <option value="Terlaksana">Terlaksana</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-900 text-stone-200 border-b border-stone-800 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">ID & Nama Program</th>
                <th className="px-4 py-3.5">Bidang & Tujuan</th>
                <th className="px-4 py-3.5">Waktu & PJ</th>
                <th className="px-4 py-3.5">Anggaran & Sumber</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {filteredList.length > 0 ? (
                filteredList.map(p => (
                  <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-stone-900 text-xs">{p.namaProgram}</div>
                      <div className="text-[11px] text-amber-800 font-mono font-semibold">{p.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700 mb-1">
                        {p.bidang}
                      </span>
                      <div className="text-[11px] text-stone-600 line-clamp-2">{p.tujuan}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-800">{p.waktuPelaksanaan}</div>
                      <div className="text-[11px] text-stone-500">PJ: {p.penanggungJawab}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-stone-900">{formatRupiah(p.anggaran)}</div>
                      <div className="text-[10px] text-stone-500">{p.sumberDana}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'Terlaksana' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'Proses' ? 'bg-amber-100 text-amber-800' :
                        p.status === 'Dibatalkan' ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right no-print">
                      {canEdit && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.namaProgram)}
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
                    Tidak ada program kerja yang cocok dengan filter.
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
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-700" />
                <span>{editingProgram ? 'Edit Program Kerja' : 'Tambah Program Kerja Baru'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Program Kerja *</label>
                <input
                  type="text"
                  required
                  value={formData.namaProgram || ''}
                  onChange={e => setFormData({ ...formData, namaProgram: e.target.value })}
                  placeholder="Contoh: Latihan Rutin Mingguan & SKU"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Bidang Kerja</label>
                  <select
                    value={formData.bidang || 'Pendidikan & Latihan'}
                    onChange={e => setFormData({ ...formData, bidang: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    {bidangOptions.filter(b => b !== 'Semua').map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Sasaran Peserta</label>
                  <input
                    type="text"
                    value={formData.sasaran || ''}
                    onChange={e => setFormData({ ...formData, sasaran: e.target.value })}
                    placeholder="Seluruh Anggota Penggalang"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tujuan & Target Program *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.tujuan || ''}
                  onChange={e => setFormData({ ...formData, tujuan: e.target.value })}
                  placeholder="Jelaskan tujuan dan output yang diharapkan..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Waktu Pelaksanaan</label>
                  <input
                    type="text"
                    value={formData.waktuPelaksanaan || ''}
                    onChange={e => setFormData({ ...formData, waktuPelaksanaan: e.target.value })}
                    placeholder="Setiap Jumat / Oktober 2026"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Penanggung Jawab (PJ)</label>
                  <input
                    type="text"
                    value={formData.penanggungJawab || ''}
                    onChange={e => setFormData({ ...formData, penanggungJawab: e.target.value })}
                    placeholder="Kak Ahmad Fauzi, S.Pd"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Rencana Anggaran (Rp)</label>
                  <input
                    type="number"
                    value={formData.anggaran || 0}
                    onChange={e => setFormData({ ...formData, anggaran: Number(e.target.value) })}
                    placeholder="500000"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Sumber Dana</label>
                  <input
                    type="text"
                    value={formData.sumberDana || ''}
                    onChange={e => setFormData({ ...formData, sumberDana: e.target.value })}
                    placeholder="Kas Gudep / Dana BOS"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Status Keterlaksanaan</label>
                <select
                  value={formData.status || 'Belum Terlaksana'}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="Belum Terlaksana">Belum Terlaksana</option>
                  <option value="Proses">Sedang Berjalan / Proses</option>
                  <option value="Terlaksana">Terlaksana (Selesai)</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
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
                  Simpan Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
