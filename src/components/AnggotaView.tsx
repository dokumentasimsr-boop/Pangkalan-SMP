import React, { useState, useRef } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Download,
  Upload,
  CreditCard,
  Eye,
  X,
  Printer,
  CheckCircle2,
  FileSpreadsheet,
  Award,
  FileText,
  Loader2,
} from 'lucide-react';
import { Anggota, Regu, UserRole, AppConfig } from '../types';
import { useToast } from './Toast';
import { printHtmlElement, downloadElementAsPdf } from '../utils/printUtils';

interface AnggotaViewProps {
  anggotaList: Anggota[];
  reguList: Regu[];
  config: AppConfig;
  onSave: (list: Anggota[]) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
}

export const AnggotaView: React.FC<AnggotaViewProps> = ({
  anggotaList,
  reguList,
  config,
  onSave,
  currentUserRole,
  onAddLog,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua');
  const [filterJK, setFilterJK] = useState('Semua');
  const [filterRegu, setFilterRegu] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnggota, setEditingAnggota] = useState<Anggota | null>(null);
  const [detailAnggota, setDetailAnggota] = useState<Anggota | null>(null);
  const [ktaAnggota, setKtaAnggota] = useState<Anggota | null>(null);
  const [isGeneratingKtaPdf, setIsGeneratingKtaPdf] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Anggota>>({
    nisn: '',
    nama: '',
    jenisKelamin: 'L',
    tempatLahir: 'Malang',
    tanggalLahir: '15/05/2012',
    kelas: '7A',
    alamat: '',
    namaOrtu: '',
    noHpOrtu: '',
    regu: 'Garuda',
    status: 'Aktif',
    tanggalBergabung: '15/07/2026',
    nomorGudep: config.nomorGudepPutra,
    tingkatSKU: 'Calon Penggalang',
    keterangan: '',
  });

  const filteredList = anggotaList.filter(a => {
    const s = (search || '').toLowerCase();
    const matchSearch =
      (a.nama || '').toLowerCase().includes(s) ||
      (a.nisn || '').toLowerCase().includes(s) ||
      (a.id || '').toLowerCase().includes(s) ||
      (a.regu || '').toLowerCase().includes(s);
    const matchKelas = filterKelas === 'Semua' || a.kelas === filterKelas;
    const matchJK = filterJK === 'Semua' || a.jenisKelamin === filterJK;
    const matchRegu = filterRegu === 'Semua' || a.regu === filterRegu;
    const matchStatus = filterStatus === 'Semua' || a.status === filterStatus;
    return matchSearch && matchKelas && matchJK && matchRegu && matchStatus;
  });

  const handleOpenAdd = () => {
    setEditingAnggota(null);
    setFormData({
      nisn: '',
      nama: '',
      jenisKelamin: 'L',
      tempatLahir: 'Malang',
      tanggalLahir: '15/05/2012',
      kelas: '7A',
      alamat: '',
      namaOrtu: '',
      noHpOrtu: '',
      regu: reguList[0]?.namaRegu || 'Garuda',
      status: 'Aktif',
      tanggalBergabung: '15/07/2026',
      nomorGudep: config.nomorGudepPutra,
      tingkatSKU: 'Calon Penggalang',
      keterangan: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (agt: Anggota) => {
    setEditingAnggota(agt);
    setFormData({ ...agt });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Hapus data Anggota Pramuka ${nama}?`)) {
      const updated = anggotaList.filter(a => a.id !== id);
      onSave(updated);
      onAddLog('Anggota', 'Hapus Data', id, `Menghapus Anggota: ${nama}`);
      showToast(`Data Anggota ${nama} berhasil dihapus.`, 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.nisn) {
      showToast('Nama Lengkap dan NISN wajib diisi!', 'error');
      return;
    }

    if (editingAnggota) {
      const updated = anggotaList.map(a =>
        a.id === editingAnggota.id ? ({ ...a, ...formData } as Anggota) : a
      );
      onSave(updated);
      onAddLog('Anggota', 'Edit Data', editingAnggota.id, `Memperbarui data Anggota: ${formData.nama}`);
      showToast('Data Anggota berhasil diperbarui.', 'success');
    } else {
      const nextNum = anggotaList.length + 1;
      const newId = `AGT-${String(nextNum).padStart(4, '0')}`;
      const newAnggota: Anggota = {
        id: newId,
        nisn: formData.nisn || '',
        nama: formData.nama || '',
        jenisKelamin: formData.jenisKelamin as 'L' | 'P',
        tempatLahir: formData.tempatLahir || 'Malang',
        tanggalLahir: formData.tanggalLahir || '01/01/2012',
        kelas: formData.kelas || '7A',
        alamat: formData.alamat || '-',
        namaOrtu: formData.namaOrtu || '-',
        noHpOrtu: formData.noHpOrtu || '-',
        regu: formData.regu || 'Garuda',
        status: formData.status as 'Aktif' | 'Alumni' | 'Pindah/Keluar',
        tanggalBergabung: formData.tanggalBergabung || '15/07/2026',
        nomorGudep: formData.jenisKelamin === 'L' ? config.nomorGudepPutra : config.nomorGudepPutri,
        tingkatSKU: formData.tingkatSKU as any || 'Calon Penggalang',
        keterangan: formData.keterangan || '',
      };
      onSave([...anggotaList, newAnggota]);
      onAddLog('Anggota', 'Tambah Data', newId, `Menambahkan Anggota: ${newAnggota.nama}`);
      showToast('Anggota baru berhasil didaftarkan.', 'success');
    }

    setIsModalOpen(false);
  };

  const exportCSV = () => {
    const headers = [
      'ID Anggota',
      'NISN',
      'Nama Lengkap',
      'JK',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Kelas',
      'Alamat',
      'Nama Ortu',
      'No HP Ortu',
      'Regu',
      'Status',
      'Tanggal Bergabung',
      'Nomor Gudep',
      'Tingkat SKU',
      'Keterangan',
    ];
    const rows = filteredList.map(a => [
      a.id,
      a.nisn,
      `"${a.nama}"`,
      a.jenisKelamin,
      `"${a.tempatLahir}"`,
      `"${a.tanggalLahir}"`,
      a.kelas,
      `"${a.alamat}"`,
      `"${a.namaOrtu}"`,
      `"${a.noHpOrtu}"`,
      `"${a.regu}"`,
      a.status,
      a.tanggalBergabung,
      a.nomorGudep,
      `"${a.tingkatSKU}"`,
      `"${a.keterangan}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Database_Anggota_Pramuka_SMPIT_Albashiroh_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data Anggota berhasil diekspor ke CSV', 'info');
  };

  const downloadTemplateCSV = () => {
    const headers = ['NISN', 'Nama Lengkap', 'JK (L/P)', 'Tempat Lahir', 'Tanggal Lahir (DD/MM/YYYY)', 'Kelas', 'Alamat', 'Nama Ortu', 'No HP Ortu', 'Regu', 'Status (Aktif/Alumni)', 'Tingkat SKU'];
    const sample = ['0098712399', 'Fulan Al-Ayyubi', 'L', 'Malang', '15/04/2012', '7A', 'Jl. Turen Permai No. 10', 'Budi Santoso', '081234567890', 'Garuda', 'Aktif', 'Penggalang Ramu'];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), sample.join(',')].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'Template_Import_Anggota_Pramuka.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Template CSV berhasil diunduh.', 'info');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length <= 1) {
          showToast('File kosong atau format tidak sesuai.', 'error');
          return;
        }

        const newImported: Anggota[] = [];
        let curCount = anggotaList.length;

        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.replace(/^"|"$/g, '').trim());
          if (parts.length >= 2 && parts[1]) {
            curCount++;
            const newId = `AGT-${String(curCount).padStart(4, '0')}`;
            const jk = parts[2]?.toUpperCase() === 'P' ? 'P' : 'L';
            newImported.push({
              id: newId,
              nisn: parts[0] || `009${Math.floor(1000000 + Math.random() * 9000000)}`,
              nama: parts[1],
              jenisKelamin: jk,
              tempatLahir: parts[3] || 'Malang',
              tanggalLahir: parts[4] || '01/01/2012',
              kelas: parts[5] || '7A',
              alamat: parts[6] || '-',
              namaOrtu: parts[7] || '-',
              noHpOrtu: parts[8] || '-',
              regu: parts[9] || (jk === 'L' ? 'Garuda' : 'Melati'),
              status: (parts[10] as any) || 'Aktif',
              tanggalBergabung: '15/07/2026',
              nomorGudep: jk === 'L' ? config.nomorGudepPutra : config.nomorGudepPutri,
              tingkatSKU: (parts[11] as any) || 'Penggalang Ramu',
              keterangan: 'Diimpor dari file CSV',
            });
          }
        }

        if (newImported.length > 0) {
          onSave([...anggotaList, ...newImported]);
          onAddLog('Anggota', 'Import CSV', 'BULK', `Berhasil mengimpor ${newImported.length} anggota baru`);
          showToast(`Berhasil mengimpor ${newImported.length} anggota baru!`, 'success');
        } else {
          showToast('Tidak ada data valid yang dapat diimpor.', 'error');
        }
      } catch (err) {
        showToast('Gagal memproses file CSV: ' + err, 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-700" />
            <span>Database Anggota Pramuka Penggalang</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Total {anggotaList.length} Anggota terdaftar di Pangkalan SMP IT Albashiroh Turen
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Import dari CSV"
          >
            <Upload className="w-3.5 h-3.5 text-stone-600" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={downloadTemplateCSV}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Unduh Format Template Import"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Template</span>
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span>Ekspor</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Anggota</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, NISN, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-amber-700/20"
            />
          </div>

          {/* Filter Kelas */}
          <select
            value={filterKelas}
            onChange={e => setFilterKelas(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
          >
            <option value="Semua">Semua Kelas</option>
            <option value="7A">Kelas 7A</option>
            <option value="7B">Kelas 7B</option>
            <option value="8A">Kelas 8A</option>
            <option value="8B">Kelas 8B</option>
            <option value="9A">Kelas 9A</option>
            <option value="9B">Kelas 9B</option>
          </select>

          {/* Filter JK */}
          <select
            value={filterJK}
            onChange={e => setFilterJK(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
          >
            <option value="Semua">Semua Gender</option>
            <option value="L">Putra (Laki-laki)</option>
            <option value="P">Putri (Perempuan)</option>
          </select>

          {/* Filter Regu */}
          <select
            value={filterRegu}
            onChange={e => setFilterRegu(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
          >
            <option value="Semua">Semua Regu</option>
            {reguList.map(r => (
              <option key={r.id} value={r.namaRegu}>Regu {r.namaRegu}</option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Status: Aktif</option>
            <option value="Alumni">Status: Alumni</option>
            <option value="Pindah/Keluar">Pindah/Keluar</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-900 text-stone-200 border-b border-stone-800 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">ID & Nama Anggota</th>
                <th className="px-4 py-3.5">NISN & Kelas</th>
                <th className="px-4 py-3.5">Regu & Gudep</th>
                <th className="px-4 py-3.5">Tingkat SKU</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {filteredList.length > 0 ? (
                filteredList.map(a => (
                  <tr key={a.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          a.jenisKelamin === 'L' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}>
                          {a.nama.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">{a.nama}</div>
                          <div className="text-[11px] text-stone-500 font-mono">{a.id} • {a.jenisKelamin === 'L' ? 'Putra' : 'Putri'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-800">Kelas {a.kelas}</div>
                      <div className="text-[11px] text-stone-500 font-mono">NISN: {a.nisn}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        Regu {a.regu}
                      </span>
                      <div className="text-[10px] text-stone-500 mt-0.5">Gudep {a.nomorGudep}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        a.tingkatSKU === 'Penggalang Terap' ? 'bg-emerald-100 text-emerald-900' :
                        a.tingkatSKU === 'Penggalang Rakit' ? 'bg-purple-100 text-purple-900' :
                        a.tingkatSKU === 'Penggalang Ramu' ? 'bg-blue-100 text-blue-900' : 'bg-stone-100 text-stone-700'
                      }`}>
                        <Award className="w-3 h-3" />
                        {a.tingkatSKU}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right no-print">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setKtaAnggota(a)}
                          className="px-2 py-1 text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg transition-colors flex items-center gap-1"
                          title="Cetak Kartu Tanda Anggota (KTA)"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>KTA</span>
                        </button>
                        <button
                          onClick={() => setDetailAnggota(a)}
                          className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                          title="Detail Biodata"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(a)}
                          className="p-1 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id, a.nama)}
                          className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                    Tidak ada data anggota yang memenuhi filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Anggota */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-700" />
                <span>{editingAnggota ? 'Edit Biodata Anggota' : 'Formulir Pendaftaran Anggota Baru'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Nama Lengkap Santri/Siswa *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama || ''}
                    onChange={e => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Muhammad Fatih Al-Faruq"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">NISN / NIS *</label>
                  <input
                    type="text"
                    required
                    value={formData.nisn || ''}
                    onChange={e => setFormData({ ...formData, nisn: e.target.value })}
                    placeholder="0098712341"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jenisKelamin || 'L'}
                    onChange={e => setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="L">Laki-laki (Putra)</option>
                    <option value="P">Perempuan (Putri)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kelas</label>
                  <select
                    value={formData.kelas || '7A'}
                    onChange={e => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="7A">7A</option>
                    <option value="7B">7B</option>
                    <option value="8A">8A</option>
                    <option value="8B">8B</option>
                    <option value="9A">9A</option>
                    <option value="9B">9B</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.tempatLahir || ''}
                    onChange={e => setFormData({ ...formData, tempatLahir: e.target.value })}
                    placeholder="Malang"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="text"
                    value={formData.tanggalLahir || ''}
                    onChange={e => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Regu Penggalang</label>
                  <select
                    value={formData.regu || 'Garuda'}
                    onChange={e => setFormData({ ...formData, regu: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    {reguList.map(r => (
                      <option key={r.id} value={r.namaRegu}>Regu {r.namaRegu} ({r.kategori})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tingkat SKU Saat Ini</label>
                  <select
                    value={formData.tingkatSKU || 'Calon Penggalang'}
                    onChange={e => setFormData({ ...formData, tingkatSKU: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Calon Penggalang">Calon Penggalang</option>
                    <option value="Penggalang Ramu">Penggalang Ramu</option>
                    <option value="Penggalang Rakit">Penggalang Rakit</option>
                    <option value="Penggalang Terap">Penggalang Terap</option>
                    <option value="Penggalang Garuda">Penggalang Garuda</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Status Keanggotaan</label>
                  <select
                    value={formData.status || 'Aktif'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Pindah/Keluar">Pindah/Keluar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  value={formData.alamat || ''}
                  onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Jl. Raya Turen No..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={formData.namaOrtu || ''}
                    onChange={e => setFormData({ ...formData, namaOrtu: e.target.value })}
                    placeholder="Nama Ayah / Ibu"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nomor WhatsApp / HP Orang Tua</label>
                  <input
                    type="text"
                    value={formData.noHpOrtu || ''}
                    onChange={e => setFormData({ ...formData, noHpOrtu: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Catatan Khusus / Prestasi</label>
                <input
                  type="text"
                  value={formData.keterangan || ''}
                  onChange={e => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Pinru, Juara Lomba, Alergi, dsb."
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
                  Simpan Data Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cetak Kartu Tanda Anggota (KTA) */}
      {ktaAnggota && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 no-print">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-700" />
                <span>Kartu Tanda Anggota (KTA) Penggalang</span>
              </h3>
              <button onClick={() => setKtaAnggota(null)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            {/* KTA Printable Layout */}
            <div
              id="kta-printable-card"
              className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-amber-900 via-amber-950 to-stone-950 text-white border-2 border-amber-500/60 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-amber-700/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">⚜️</div>
                  <div>
                    <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none">
                      KARTU TANDA ANGGOTA PRAMUKA
                    </div>
                    <div className="text-xs font-black text-white leading-tight">
                      SMP IT ALBASHIROH TUREN
                    </div>
                    <div className="text-[9px] text-stone-300">
                      Gudep {ktaAnggota.nomorGudep} • Kwarran Turen
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500 text-stone-950 uppercase">
                    PENGGALANG
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="mt-3.5 flex gap-3.5 items-center">
                <div className="w-20 h-24 rounded-xl bg-amber-800/60 border border-amber-600/60 flex flex-col items-center justify-center text-center p-1 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-amber-900 text-amber-200 font-bold text-sm flex items-center justify-center mb-1">
                    {ktaAnggota.nama.charAt(0)}
                  </div>
                  <span className="text-[8px] text-amber-300 uppercase font-semibold">Foto 3x4</span>
                </div>

                <div className="space-y-1 text-[11px] flex-1 min-w-0">
                  <div>
                    <span className="text-[9px] text-amber-400 block uppercase font-bold">Nama Lengkap</span>
                    <span className="font-extrabold text-xs text-white truncate block">{ktaAnggota.nama}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-[8px] text-amber-400 block uppercase">ID / NISN</span>
                      <span className="font-mono text-stone-200">{ktaAnggota.id}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-amber-400 block uppercase">Regu / Kelas</span>
                      <span className="font-bold text-stone-200">{ktaAnggota.regu} ({ktaAnggota.kelas})</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] text-amber-400 block uppercase">Tingkat SKU</span>
                    <span className="font-bold text-amber-200">{ktaAnggota.tingkatSKU}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-3 pt-2 border-t border-amber-800/50 flex justify-between items-end text-[9px] text-stone-400">
                <div>
                  <div>Berlaku s.d: <span className="text-white font-semibold">30 Juni 2027</span></div>
                  <div className="font-mono text-[8px] text-stone-500">ID: {ktaAnggota.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] text-stone-300 font-semibold">Kamabigus / Pembina Gudep</div>
                  <div className="text-[9px] text-amber-300 font-bold mt-1">Kak Ahmad Fauzi, S.Pd</div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2 no-print">
              <button
                onClick={() => setKtaAnggota(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
              >
                Tutup
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    printHtmlElement('kta-printable-card', {
                      title: `KTA - ${ktaAnggota.nama}`,
                      orientation: 'portrait',
                      onSuccess: () => showToast(`Dialog cetak KTA ${ktaAnggota.nama} terbuka.`, 'success'),
                    });
                  }}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  title="Cetak KTA ke printer langsung"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-700" />
                  <span>Cetak</span>
                </button>
                <button
                  disabled={isGeneratingKtaPdf}
                  onClick={async () => {
                    const cleanName = (ktaAnggota.nama || 'Anggota').replace(/\s+/g, '_');
                    const filename = `KTA_Pramuka_${cleanName}_${ktaAnggota.id}.pdf`;
                    setIsGeneratingKtaPdf(true);
                    showToast('Sedang membuat file PDF KTA...', 'info');

                    await downloadElementAsPdf('kta-printable-card', {
                      filename,
                      orientation: 'portrait',
                      scale: 2.5,
                      onSuccess: () => {
                        setIsGeneratingKtaPdf(false);
                        showToast(`File PDF KTA ${ktaAnggota.nama} berhasil diunduh.`, 'success');
                      },
                      onError: () => {
                        setIsGeneratingKtaPdf(false);
                        showToast('Membuka dialog cetak browser...', 'info');
                        window.print();
                      },
                    });
                  }}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 disabled:bg-amber-700/70 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 disabled:cursor-not-allowed"
                >
                  {isGeneratingKtaPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Membuat PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Unduh PDF KTA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Anggota */}
      {detailAnggota && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">Biodata Lengkap Anggota</h3>
              <button onClick={() => setDetailAnggota(null)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-800 text-white font-bold text-lg flex items-center justify-center">
                  {detailAnggota.nama.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900">{detailAnggota.nama}</div>
                  <div className="text-stone-600">Regu {detailAnggota.regu} • Kelas {detailAnggota.kelas}</div>
                  <div className="text-amber-800 font-mono font-semibold">{detailAnggota.id} • NISN: {detailAnggota.nisn}</div>
                </div>
              </div>

              <div className="space-y-2 text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <div className="flex justify-between">
                  <span className="text-stone-500">Tempat, Tgl Lahir:</span>
                  <span className="font-semibold">{detailAnggota.tempatLahir}, {detailAnggota.tanggalLahir}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Jenis Kelamin:</span>
                  <span className="font-semibold">{detailAnggota.jenisKelamin === 'L' ? 'Laki-laki (Putra)' : 'Perempuan (Putri)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Tingkat SKU:</span>
                  <span className="font-bold text-purple-900">{detailAnggota.tingkatSKU}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Nama Orang Tua/Wali:</span>
                  <span className="font-semibold">{detailAnggota.namaOrtu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">No. HP/WA Ortu:</span>
                  <span className="font-semibold text-emerald-700">{detailAnggota.noHpOrtu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Alamat Rumah:</span>
                  <span className="font-semibold">{detailAnggota.alamat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Tanggal Bergabung:</span>
                  <span className="font-semibold">{detailAnggota.tanggalBergabung}</span>
                </div>
                <div className="pt-2 border-t border-stone-200">
                  <span className="text-stone-500 block mb-1">Catatan Khusus:</span>
                  <p className="text-stone-800 italic bg-white p-2 rounded border border-stone-200">
                    {detailAnggota.keterangan || 'Tidak ada catatan khusus.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setDetailAnggota(null)}
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
