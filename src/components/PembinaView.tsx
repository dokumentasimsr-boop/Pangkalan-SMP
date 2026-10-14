import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Award,
  X,
  Check,
  Download,
} from 'lucide-react';
import { Pembina, UserRole } from '../types';
import { useToast } from './Toast';

interface PembinaViewProps {
  pembinaList: Pembina[];
  onSave: (list: Pembina[]) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
}

export const PembinaView: React.FC<PembinaViewProps> = ({
  pembinaList,
  onSave,
  currentUserRole,
  onAddLog,
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPembina, setEditingPembina] = useState<Pembina | null>(null);
  const [detailPembina, setDetailPembina] = useState<Pembina | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Pembina>>({
    nip: '',
    nama: '',
    gelar: '',
    jenisKelamin: 'L',
    jabatan: '',
    noHp: '',
    email: '',
    status: 'Aktif',
    keterangan: '',
  });

  const filteredList = pembinaList.filter(p => {
    const s = (search || '').toLowerCase();
    const matchSearch =
      (p.nama || '').toLowerCase().includes(s) ||
      (p.nip || '').toLowerCase().includes(s) ||
      (p.nta || '').toLowerCase().includes(s) ||
      (p.jabatan || '').toLowerCase().includes(s);
    const matchStatus = filterStatus === 'Semua' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleOpenAdd = () => {
    setEditingPembina(null);
    setFormData({
      nip: '',
      nama: '',
      gelar: '',
      jenisKelamin: 'L',
      jabatan: '',
      noHp: '',
      email: '',
      status: 'Aktif',
      keterangan: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pembina: Pembina) => {
    setEditingPembina(pembina);
    setFormData({ ...pembina });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data Pembina ${nama}?`)) {
      const updated = pembinaList.filter(p => p.id !== id);
      onSave(updated);
      onAddLog('Pembina', 'Hapus Data', id, `Menghapus Pembina: ${nama}`);
      showToast(`Data Pembina ${nama} berhasil dihapus.`, 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.jabatan) {
      showToast('Nama dan Jabatan wajib diisi!', 'error');
      return;
    }

    if (editingPembina) {
      // Edit
      const updated = pembinaList.map(p =>
        p.id === editingPembina.id ? ({ ...p, ...formData } as Pembina) : p
      );
      onSave(updated);
      onAddLog('Pembina', 'Edit Data', editingPembina.id, `Memperbarui data Pembina: ${formData.nama}`);
      showToast('Data Pembina berhasil diperbarui.', 'success');
    } else {
      // Add
      const nextNum = pembinaList.length + 1;
      const newId = `PEM-${String(nextNum).padStart(4, '0')}`;
      const newPembina: Pembina = {
        id: newId,
        nip: formData.nip || '-',
        nama: formData.nama || '',
        gelar: formData.gelar || '',
        jenisKelamin: formData.jenisKelamin as 'L' | 'P',
        jabatan: formData.jabatan || '',
        noHp: formData.noHp || '-',
        email: formData.email || '-',
        status: formData.status as 'Aktif' | 'Nonaktif',
        keterangan: formData.keterangan || '',
      };
      onSave([...pembinaList, newPembina]);
      onAddLog('Pembina', 'Tambah Data', newId, `Menambahkan Pembina: ${newPembina.nama}`);
      showToast('Pembina baru berhasil ditambahkan.', 'success');
    }

    setIsModalOpen(false);
  };

  const exportCSV = () => {
    const headers = ['ID Pembina', 'NIP/NUPTK', 'Nama Lengkap', 'Gelar', 'JK', 'Jabatan', 'No HP', 'Email', 'Status', 'Keterangan'];
    const rows = filteredList.map(p => [
      p.id,
      p.nip,
      `"${p.nama}"`,
      `"${p.gelar}"`,
      p.jenisKelamin,
      `"${p.jabatan}"`,
      `"${p.noHp}"`,
      p.email,
      p.status,
      `"${p.keterangan}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Pembina_Pramuka_Gudep_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data Pembina berhasil diekspor ke CSV', 'info');
  };

  const canEdit = currentUserRole === 'ADMIN' || currentUserRole === 'PEMBINA';

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-700" />
            <span>Master Data Pembina Pramuka</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Daftar Pembina dan Pelatih Resmi Gugus Depan Pramuka
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-stone-600" />
            <span>Ekspor CSV</span>
          </button>
          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pembina</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, NIP, atau jabatan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700/20"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Status: Aktif</option>
            <option value="Nonaktif">Status: Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Table Data Pembina */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-900 text-stone-200 border-b border-stone-800 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">ID & Nama Lengkap</th>
                <th className="px-4 py-3.5">NIP/NUPTK</th>
                <th className="px-4 py-3.5">Jabatan / Satuan</th>
                <th className="px-4 py-3.5">Kontak</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {filteredList.length > 0 ? (
                filteredList.map(p => (
                  <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold flex items-center justify-center shrink-0">
                          {p.nama.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">{p.nama}, {p.gelar}</div>
                          <div className="text-[11px] text-stone-500 font-mono">{p.id} • {p.jenisKelamin === 'L' ? 'Putra' : 'Putri'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-stone-600">
                      {p.nip}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-stone-800">{p.jabatan}</span>
                    </td>
                    <td className="px-4 py-3.5 space-y-0.5 text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{p.noHp}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                        <Mail className="w-3.5 h-3.5 text-amber-600" />
                        <span>{p.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right no-print">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailPembina(p)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                        >
                          Detail
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.nama)}
                              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                    Tidak ada data pembina yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit Pembina */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-700" />
                <span>{editingPembina ? 'Edit Data Pembina' : 'Tambah Pembina Baru'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama || ''}
                    onChange={e => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Nama Pembina"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Gelar / Kualifikasi</label>
                  <input
                    type="text"
                    value={formData.gelar || ''}
                    onChange={e => setFormData({ ...formData, gelar: e.target.value })}
                    placeholder="S.Pd (KML)"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">NIP / NUPTK</label>
                  <input
                    type="text"
                    value={formData.nip || ''}
                    onChange={e => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="1988..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jenisKelamin || 'L'}
                    onChange={e => setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                  >
                    <option value="L">Laki-laki (Putra)</option>
                    <option value="P">Perempuan (Putri)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Jabatan di Pangkalan *</label>
                <input
                  type="text"
                  required
                  value={formData.jabatan || ''}
                  onChange={e => setFormData({ ...formData, jabatan: e.target.value })}
                  placeholder="Contoh: Pembina Satuan Putra / Pelatih Pioneering"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nomor WhatsApp/HP</label>
                  <input
                    type="text"
                    value={formData.noHp || ''}
                    onChange={e => setFormData({ ...formData, noHp: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="pembina@albashiroh.sch.id"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Status Keaktifan</label>
                  <select
                    value={formData.status || 'Aktif'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Nonaktif' })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Keterangan / Keahlian</label>
                  <input
                    type="text"
                    value={formData.keterangan || ''}
                    onChange={e => setFormData({ ...formData, keterangan: e.target.value })}
                    placeholder="Lulusan KMD/KML, Ahli Morse, dll"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
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
                  Simpan Pembina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Pembina */}
      {detailPembina && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">Biodata Lengkap Pembina</h3>
              <button onClick={() => setDetailPembina(null)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-800 text-white font-bold text-lg flex items-center justify-center">
                  {detailPembina.nama.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900">{detailPembina.nama}, {detailPembina.gelar}</div>
                  <div className="text-stone-600">{detailPembina.jabatan}</div>
                  <div className="text-amber-800 font-mono font-semibold">{detailPembina.id}</div>
                </div>
              </div>

              <div className="space-y-2 text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <div className="flex justify-between">
                  <span className="text-stone-500">NIP/NUPTK:</span>
                  <span className="font-semibold">{detailPembina.nip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Jenis Kelamin:</span>
                  <span className="font-semibold">{detailPembina.jenisKelamin === 'L' ? 'Laki-laki (Putra)' : 'Perempuan (Putri)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">No. WhatsApp/HP:</span>
                  <span className="font-semibold text-emerald-700">{detailPembina.noHp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Email:</span>
                  <span className="font-semibold">{detailPembina.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Status Keaktifan:</span>
                  <span className="font-bold text-emerald-800">{detailPembina.status}</span>
                </div>
                <div className="pt-2 border-t border-stone-200">
                  <span className="text-stone-500 block mb-1">Catatan / Kualifikasi:</span>
                  <p className="text-stone-800 italic bg-white p-2 rounded border border-stone-200">
                    {detailPembina.keterangan || 'Tidak ada catatan.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setDetailPembina(null)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
