import React, { useState } from 'react';
import {
  Mail,
  Plus,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Printer,
  Edit2,
  Trash2,
  X,
  Send,
  Calendar,
  Building,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Anggota, Pembina, PangkalanConfig, SuratRecord, UserRole } from '../types';
import { useToast } from './Toast';
import { printHtmlElement, downloadElementAsPdf } from '../utils/printUtils';

interface SuratMenyuratViewProps {
  suratList: SuratRecord[];
  pembinaList: Pembina[];
  anggotaList: Anggota[];
  config: PangkalanConfig;
  onSave: (list: SuratRecord[]) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
}

export const SuratMenyuratView: React.FC<SuratMenyuratViewProps> = ({
  suratList,
  pembinaList,
  anggotaList,
  config,
  onSave,
  currentUserRole,
  onAddLog,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'agenda' | 'generator'>('agenda');
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SuratRecord | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Mandat Letter Generator State
  const [mandatData, setMandatData] = useState({
    nomorSurat: '',
    dasarSurat: '',
    pembinaPendamping: pembinaList[0]?.nama || config.namaPembinaPutra || '',
    namaKegiatan: '',
    tempatKegiatan: '',
    tanggalKegiatan: '',
    selectedAnggotaIds: [] as string[],
    penandatangan: config.kaGudepPa || config.namaKetuaGudep || '',
    jabatanPenandatangan: `Ketua Gudep Putra ${config.nomorGudepPutra || config.nomorGudepPa || ''}`.trim(),
    tanggalSurat: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
  });

  // Form State for Agenda
  const [formData, setFormData] = useState<Partial<SuratRecord>>({
    jenisSurat: 'Surat Keluar',
    nomorSurat: '',
    tanggalSurat: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    tanggalDiterimaDikirim: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    pengirimTujuan: '',
    perihal: '',
    penanggungJawab: '',
    fileUrl: '',
    keterangan: '',
  });

  const filteredList = suratList.filter(s => {
    const query = (search || '').toLowerCase();
    const matchSearch =
      (s.nomorSurat || '').toLowerCase().includes(query) ||
      (s.perihal || '').toLowerCase().includes(query) ||
      (s.pengirimTujuan || '').toLowerCase().includes(query);
    const matchJenis = filterJenis === 'Semua' || s.jenisSurat === filterJenis;
    return matchSearch && matchJenis;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      jenisSurat: 'Surat Keluar',
      nomorSurat: `0${suratList.length + 1}/SMPIT-ALB/GUDP/VIII/2026`,
      tanggalSurat: '10/08/2026',
      tanggalDiterimaDikirim: '10/08/2026',
      pengirimTujuan: '',
      perihal: '',
      penanggungJawab: pembinaList[0]?.nama || 'Kak Pembina',
      fileUrl: '',
      keterangan: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SuratRecord) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nomor: string) => {
    if (confirm(`Hapus arsip surat: "${nomor}"?`)) {
      const updated = suratList.filter(s => s.id !== id);
      onSave(updated);
      onAddLog('Surat', 'Hapus Data', id, `Menghapus Surat: ${nomor}`);
      showToast('Arsip surat berhasil dihapus.', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomorSurat || !formData.perihal || !formData.pengirimTujuan) {
      showToast('Nomor Surat, Pengirim/Tujuan, dan Perihal wajib diisi!', 'error');
      return;
    }

    if (editingItem) {
      const updated = suratList.map(s =>
        s.id === editingItem.id ? ({ ...s, ...formData } as SuratRecord) : s
      );
      onSave(updated);
      onAddLog('Surat', 'Edit Data', editingItem.id, `Memperbarui Surat: ${formData.nomorSurat}`);
      showToast('Data surat berhasil diperbarui.', 'success');
    } else {
      const nextNum = suratList.length + 1;
      const newId = `SRT-${String(nextNum).padStart(4, '0')}`;
      const newSurat: SuratRecord = {
        id: newId,
        jenisSurat: formData.jenisSurat as any || 'Surat Keluar',
        nomorSurat: formData.nomorSurat || '',
        tanggalSurat: formData.tanggalSurat || '10/08/2026',
        tanggalDiterimaDikirim: formData.tanggalDiterimaDikirim || '10/08/2026',
        pengirimTujuan: formData.pengirimTujuan || '',
        perihal: formData.perihal || '',
        penanggungJawab: formData.penanggungJawab || 'Sekretaris Gudep',
        fileUrl: formData.fileUrl || '',
        keterangan: formData.keterangan || '',
      };
      onSave([...suratList, newSurat]);
      onAddLog('Surat', 'Tambah Data', newId, `Mencatat ${newSurat.jenisSurat}: ${newSurat.nomorSurat}`);
      showToast('Surat baru berhasil dicatat dalam agenda.', 'success');
    }

    setIsModalOpen(false);
  };

  const handleDownloadMandatPdf = async () => {
    const safeNomor = (mandatData.nomorSurat || 'Mandat').replace(/[\/\\]/g, '_');
    const filename = `Surat_Mandat_${safeNomor}.pdf`;
    setIsGeneratingPdf(true);
    showToast('Sedang membuat file PDF Surat Mandat...', 'info');

    try {
      const ok = await downloadElementAsPdf('surat-mandat-printable', {
        filename,
        orientation: 'portrait',
        scale: 2,
        onSuccess: () => {
          setIsGeneratingPdf(false);
          showToast(`File PDF Surat Mandat (${filename}) berhasil diunduh secara otomatis.`, 'success');
        },
        onError: (err) => {
          setIsGeneratingPdf(false);
          console.error('PDF error:', err);
          showToast('Gagal memproses file PDF langsung, membuka dialog cetak browser...', 'error');
          handlePrintMandat();
        },
      });

      if (!ok) setIsGeneratingPdf(false);
    } catch (e) {
      setIsGeneratingPdf(false);
      handlePrintMandat();
    }
  };

  const handlePrintMandat = () => {
    const success = printHtmlElement('surat-mandat-printable', {
      title: `Surat Mandat - ${mandatData.nomorSurat || 'Pramuka'}`,
      orientation: 'portrait',
      onSuccess: () => {
        showToast('Membuka dialog cetak Surat Mandat.', 'success');
      },
      onError: (err) => {
        console.warn('Fallback printing:', err);
        window.print();
      },
    });

    if (!success) {
      window.print();
    }
  };

  const toggleSelectAnggotaForMandat = (id: string) => {
    if (mandatData.selectedAnggotaIds.includes(id)) {
      setMandatData({
        ...mandatData,
        selectedAnggotaIds: mandatData.selectedAnggotaIds.filter(x => x !== id),
      });
    } else {
      setMandatData({
        ...mandatData,
        selectedAnggotaIds: [...mandatData.selectedAnggotaIds, id],
      });
    }
  };

  const selectedMembers = anggotaList.filter(a => mandatData.selectedAnggotaIds.includes(a.id));

  const canEdit = currentUserRole === 'ADMIN' || currentUserRole === 'PEMBINA' || currentUserRole === 'PETUGAS';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-700" />
            <span>Administrasi Surat & Generator Surat Tugas</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Buku Agenda Surat Masuk / Keluar & Pembuat Surat Mandat Resmi Gugus Depan
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'agenda' && canEdit && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Surat Baru</span>
            </button>
          )}

          {activeTab === 'generator' && (
            <button
              onClick={handlePrintMandat}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Surat Tugas / Mandat</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-2 no-print">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'agenda'
              ? 'border-amber-700 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Buku Agenda Surat ({suratList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('generator')}
          className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'generator'
              ? 'border-amber-700 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-700" />
          <span>Generator Surat Mandat / Tugas Resmi</span>
        </button>
      </div>

      {/* View 1: Agenda Surat */}
      {activeTab === 'agenda' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nomor surat, perihal, instansi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-amber-700/20"
              />
            </div>

            <select
              value={filterJenis}
              onChange={e => setFilterJenis(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
            >
              <option value="Semua">Semua Jenis Surat</option>
              <option value="Surat Masuk">Surat Masuk (Inbound)</option>
              <option value="Surat Keluar">Surat Keluar (Outbound)</option>
              <option value="Surat Mandat / Tugas">Surat Mandat / Tugas</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-900 text-stone-200 border-b border-stone-800 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">Jenis & Nomor Surat</th>
                    <th className="px-4 py-3.5">Tanggal</th>
                    <th className="px-4 py-3.5">Pengirim / Tujuan</th>
                    <th className="px-4 py-3.5">Perihal Surat</th>
                    <th className="px-4 py-3.5 text-right no-print">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {filteredList.map(s => (
                    <tr key={s.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold mb-1 ${
                          s.jenisSurat === 'Surat Masuk'
                            ? 'bg-blue-100 text-blue-900'
                            : s.jenisSurat === 'Surat Mandat / Tugas'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {s.jenisSurat === 'Surat Masuk' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {s.jenisSurat}
                        </span>
                        <div className="font-bold text-stone-900 font-mono text-[11px]">{s.nomorSurat}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-stone-800">{s.tanggalSurat}</div>
                        <div className="text-[10px] text-stone-400">Proses: {s.tanggalDiterimaDikirim}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-stone-800">
                        {s.pengirimTujuan}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-stone-900">{s.perihal}</div>
                        <div className="text-[10px] text-stone-400">PJ: {s.penanggungJawab}</div>
                      </td>
                      <td className="px-4 py-3 text-right no-print">
                        {canEdit && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="p-1 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id, s.nomorSurat)}
                              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Mandat Letter Generator */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generator Controls */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4 no-print text-xs">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-700" />
              <span>Pengaturan Isi Surat Mandat</span>
            </h3>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nomor Surat Mandat</label>
              <input
                type="text"
                value={mandatData.nomorSurat}
                onChange={e => setMandatData({ ...mandatData, nomorSurat: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Dasar Surat / Referensi</label>
              <textarea
                rows={2}
                value={mandatData.dasarSurat}
                onChange={e => setMandatData({ ...mandatData, dasarSurat: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nama Kegiatan / Agenda</label>
              <input
                type="text"
                value={mandatData.namaKegiatan}
                onChange={e => setMandatData({ ...mandatData, namaKegiatan: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tempat</label>
                <input
                  type="text"
                  value={mandatData.tempatKegiatan}
                  onChange={e => setMandatData({ ...mandatData, tempatKegiatan: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Waktu</label>
                <input
                  type="text"
                  value={mandatData.tanggalKegiatan}
                  onChange={e => setMandatData({ ...mandatData, tanggalKegiatan: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Pembina Pendamping</label>
              <select
                value={mandatData.pembinaPendamping}
                onChange={e => setMandatData({ ...mandatData, pembinaPendamping: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              >
                {pembinaList.map(p => (
                  <option key={p.id} value={`${p.nama}, ${p.gelar}`}>{p.nama}, ${p.gelar}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Pilih Anggota yang Ditugaskan ({selectedMembers.length}):</label>
              <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-stone-50 rounded-xl border border-stone-200">
                {anggotaList.map(a => (
                  <label key={a.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded">
                    <input
                      type="checkbox"
                      checked={mandatData.selectedAnggotaIds.includes(a.id)}
                      onChange={() => toggleSelectAnggotaForMandat(a.id)}
                      className="rounded text-amber-700"
                    />
                    <span className="truncate">{a.nama} (Regu {a.regu})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleDownloadMandatPdf}
                disabled={isGeneratingPdf}
                className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 disabled:bg-amber-700/70 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
                title="Otomatis mengunduh berkas PDF Surat Mandat"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Membuat PDF Surat Mandat...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Cetak / Unduh PDF Surat Mandat</span>
                  </>
                )}
              </button>
              <button
                onClick={handlePrintMandat}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                title="Buka dialog cetak printer browser"
              >
                <Printer className="w-3.5 h-3.5 text-stone-600" />
                <span>Cetak Printer</span>
              </button>
            </div>
          </div>

          {/* Letter Live Preview (A4 Printable Layout) */}
          <div
            id="surat-mandat-printable"
            className="lg:col-span-2 bg-white p-8 rounded-2xl border border-stone-300 shadow-md print:p-0 print:border-none print:shadow-none font-serif text-stone-950 text-xs leading-relaxed space-y-4"
          >
            {/* KOP Surat */}
            <div className="border-b-4 border-double border-stone-900 pb-3 text-center space-y-1">
              <div className="font-bold text-sm tracking-wide">
                GERAKAN PRAMUKA GUGUS DEPAN {config.kwarcab ? config.kwarcab.toUpperCase() : 'GERAKAN PRAMUKA'} {config.nomorGudepPutra || config.nomorGudepPa || ''} {config.nomorGudepPutri || config.nomorGudepPi ? `- ${config.nomorGudepPutri || config.nomorGudepPi}` : ''}
              </div>
              <div className="font-black text-base tracking-wider uppercase text-amber-900">
                PANGKALAN {config.namaPangkalan || config.namaSekolah || 'PANGKALAN GUGUS DEPAN'}
              </div>
              <div className="text-[11px] font-sans text-stone-700">
                {config.alamat || ''} {config.kwarran ? `• ${config.kwarran}` : ''} {config.kwarcab ? `, ${config.kwarcab}` : ''} {config.kwarda ? `, ${config.kwarda}` : ''}
              </div>
              {(config.email || config.telepon || config.website) && (
                <div className="text-[10px] font-sans text-stone-500">
                  {config.email ? `Email: ${config.email}` : ''} {config.telepon ? ` • Telp: ${config.telepon}` : ''} {config.website ? ` • Web: ${config.website}` : ''}
                </div>
              )}
            </div>

            {/* Letter Title */}
            <div className="text-center pt-2 space-y-1">
              <div className="font-bold text-sm underline tracking-wider uppercase">SURAT TUGAS / SURAT MANDAT</div>
              <div className="text-xs font-mono font-semibold">Nomor: {mandatData.nomorSurat || '... / ... / ...'}</div>
            </div>

            {/* Body */}
            <div className="space-y-2 pt-2">
              <p>
                Yang bertanda tangan di bawah ini, Pembina Gugus Depan Pramuka Pangkalan {config.namaPangkalan || config.namaSekolah || 'Gugus Depan'}, dengan ini memberikan mandat dan menugaskan kepada:
              </p>

              <div className="pl-4 space-y-1 font-sans text-xs">
                <div><strong>1. Pembina Pendamping:</strong> {mandatData.pembinaPendamping}</div>
                <div><strong>2. Anggota Penggalang Delegasi:</strong></div>
                <table className="w-full border-collapse border border-stone-400 mt-1">
                  <thead className="bg-stone-100 font-bold">
                    <tr>
                      <th className="border border-stone-400 px-2 py-1 text-center w-8">No</th>
                      <th className="border border-stone-400 px-2 py-1">Nama Anggota</th>
                      <th className="border border-stone-400 px-2 py-1">Regu / Kelas</th>
                      <th className="border border-stone-400 px-2 py-1">Tingkat SKU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMembers.map((m, idx) => (
                      <tr key={m.id}>
                        <td className="border border-stone-400 px-2 py-1 text-center font-bold">{idx + 1}</td>
                        <td className="border border-stone-400 px-2 py-1 font-bold">{m.nama}</td>
                        <td className="border border-stone-400 px-2 py-1">Regu {m.regu} / Kelas {m.kelas}</td>
                        <td className="border border-stone-400 px-2 py-1">{m.tingkatSKU}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="pt-2">
                Untuk mengikuti dan mewakili Pangkalan {config.namaPangkalan} pada kegiatan:
              </p>

              <div className="pl-4 font-sans text-xs space-y-0.5">
                <div><strong>Nama Kegiatan:</strong> {mandatData.namaKegiatan}</div>
                <div><strong>Tempat Pelaksanaan:</strong> {mandatData.tempatKegiatan}</div>
                <div><strong>Waktu:</strong> {mandatData.tanggalKegiatan}</div>
                <div><strong>Dasar Penugasan:</strong> {mandatData.dasarSurat}</div>
              </div>

              <p className="pt-2">
                Demikian Surat Mandat ini diterbitkan untuk dipergunakan sebagaimana mestinya dan dilaksanakan dengan penuh rasa tanggung jawab serta menjunjung tinggi Trisatya dan Dasadarma Pramuka.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-8 flex justify-end">
              <div className="text-center w-64 space-y-1 font-sans">
                <div>Turen, {mandatData.tanggalSurat}</div>
                <div>Ketua Gugus Depan,</div>
                <div className="h-16 flex items-center justify-center text-stone-300 italic text-[11px]">
                  (Tanda Tangan & Cap Gudep)
                </div>
                <div className="font-bold text-xs underline">{mandatData.penandatangan}</div>
                <div className="text-[10px] text-stone-600">NTA: 13.07.04.001</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Agenda */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">
                {editingItem ? 'Edit Arsip Surat' : 'Catat Surat Masuk / Keluar Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Jenis Surat</label>
                  <select
                    value={formData.jenisSurat}
                    onChange={e => setFormData({ ...formData, jenisSurat: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  >
                    <option value="Surat Keluar">Surat Keluar (Outbound)</option>
                    <option value="Surat Masuk">Surat Masuk (Inbound)</option>
                    <option value="Surat Mandat / Tugas">Surat Mandat / Tugas</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nomor Surat *</label>
                  <input
                    type="text"
                    required
                    value={formData.nomorSurat || ''}
                    onChange={e => setFormData({ ...formData, nomorSurat: e.target.value })}
                    placeholder="012/SMPIT-ALB/GUDP/VIII/2026"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal Surat</label>
                  <input
                    type="text"
                    value={formData.tanggalSurat || ''}
                    onChange={e => setFormData({ ...formData, tanggalSurat: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal Kirim / Terima</label>
                  <input
                    type="text"
                    value={formData.tanggalDiterimaDikirim || ''}
                    onChange={e => setFormData({ ...formData, tanggalDiterimaDikirim: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Pengirim / Tujuan Surat *</label>
                <input
                  type="text"
                  required
                  value={formData.pengirimTujuan || ''}
                  onChange={e => setFormData({ ...formData, pengirimTujuan: e.target.value })}
                  placeholder="Contoh: Kwartir Ranting / Kwarcab / Instansi"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Perihal Surat *</label>
                <input
                  type="text"
                  required
                  value={formData.perihal || ''}
                  onChange={e => setFormData({ ...formData, perihal: e.target.value })}
                  placeholder="Permohonan Izin Tempat Perkemahan"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Link File / Scan Surat</label>
                  <input
                    type="url"
                    value={formData.fileUrl || ''}
                    onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Penanggung Jawab / Pengolah</label>
                  <input
                    type="text"
                    value={formData.penanggungJawab || ''}
                    onChange={e => setFormData({ ...formData, penanggungJawab: e.target.value })}
                    placeholder="Sekretaris Gudep"
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
                  Simpan Surat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
