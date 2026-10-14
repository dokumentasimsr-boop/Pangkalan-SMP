import React, { useState } from 'react';
import {
  Medal,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Award,
  Calendar,
  UserCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { Anggota, Pembina, PencapaianSKK, SKKItem, UserRole } from '../types';
import { useToast } from './Toast';

interface SKKViewProps {
  skkItems: SKKItem[];
  pencapaianList: PencapaianSKK[];
  anggotaList: Anggota[];
  pembinaList: Pembina[];
  onSavePencapaian: (list: PencapaianSKK[]) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
}

export const SKKView: React.FC<SKKViewProps> = ({
  skkItems,
  pencapaianList,
  anggotaList,
  pembinaList,
  onSavePencapaian,
  currentUserRole,
  onAddLog,
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterBidang, setFilterBidang] = useState('Semua');
  const [filterTingkat, setFilterTingkat] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for new SKK Award
  const [formData, setFormData] = useState<Partial<PencapaianSKK>>({
    idAnggota: anggotaList[0]?.id || '',
    namaSKK: 'SKK Sholat',
    tingkat: 'Purwa',
    bidang: 'Agama, Mental, Spiritual, Moral',
    tanggalUjian: new Date().toLocaleDateString('id-ID'),
    penguji: pembinaList[0]?.nama || 'Kak Ahmad Fauzi, S.Pd',
    status: 'Tuntas',
    catatan: 'Lulus dengan nilai sangat memuaskan',
  });

  const bidangList = [
    'Semua',
    'Agama, Mental, Spiritual, Moral',
    'Patriotisme dan Seni Budaya',
    'Keterampilan dan Teknik Pembangunan',
    'Ketangkasan dan Kesehatan',
    'Sosial, Perikemanusiaan, Gotong Royong',
  ];

  const filteredPencapaian = pencapaianList.filter(p => {
    const s = (search || '').toLowerCase();
    const matchSearch =
      (p.namaAnggota || '').toLowerCase().includes(s) ||
      (p.namaSKK || '').toLowerCase().includes(s) ||
      (p.regu || '').toLowerCase().includes(s);
    const matchBidang = filterBidang === 'Semua' || p.bidang === filterBidang;
    const matchTingkat = filterTingkat === 'Semua' || p.tingkat === filterTingkat;
    return matchSearch && matchBidang && matchTingkat;
  });

  const handleOpenAdd = () => {
    setFormData({
      idAnggota: anggotaList[0]?.id || '',
      namaSKK: skkItems[0]?.namaSKK || 'SKK Sholat',
      tingkat: 'Purwa',
      bidang: skkItems[0]?.bidang || 'Agama, Mental, Spiritual, Moral',
      tanggalUjian: new Date().toLocaleDateString('id-ID'),
      penguji: pembinaList[0]?.nama || 'Kak Ahmad Fauzi, S.Pd',
      status: 'Tuntas',
      catatan: 'Lulus ujian praktik dan teori TKK',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Hapus data pencapaian SKK untuk ${nama}?`)) {
      const updated = pencapaianList.filter(p => p.id !== id);
      onSavePencapaian(updated);
      onAddLog('SKK', 'Hapus Data', id, `Menghapus pencapaian SKK: ${nama}`);
      showToast('Pencapaian SKK berhasil dihapus.', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = anggotaList.find(a => a.id === formData.idAnggota);
    if (!student) {
      showToast('Pilih anggota terlebih dahulu!', 'error');
      return;
    }

    const nextNum = pencapaianList.length + 1;
    const newId = `PSKK-${String(nextNum).padStart(4, '0')}`;
    const newRecord: PencapaianSKK = {
      id: newId,
      idAnggota: student.id,
      namaAnggota: student.nama,
      regu: student.regu,
      namaSKK: formData.namaSKK || 'SKK Umum',
      tingkat: formData.tingkat as any || 'Purwa',
      bidang: formData.bidang || 'Bidang Umum',
      tanggalUjian: formData.tanggalUjian || '01/08/2026',
      penguji: formData.penguji || 'Kak Pembina',
      status: 'Tuntas',
      catatan: formData.catatan || '',
    };

    onSavePencapaian([...pencapaianList, newRecord]);
    onAddLog('SKK', 'Tambah Data', newId, `Menetapkan ${newRecord.namaSKK} (${newRecord.tingkat}) untuk ${student.nama}`);
    showToast(`TKK ${newRecord.namaSKK} (${newRecord.tingkat}) berhasil diterbitkan untuk ${student.nama}!`, 'success');
    setIsModalOpen(false);
  };

  const canEdit = currentUserRole === 'ADMIN' || currentUserRole === 'PEMBINA';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Medal className="w-5 h-5 text-amber-700" />
            <span>Syarat & Tanda Kecakapan Khusus (SKK / TKK)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manajemen Pengujian TKK Penggalang (Purwa / Madya / Utama) dalam 5 Bidang
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan TKK Baru</span>
          </button>
        )}
      </div>

      {/* 5 Bidang SKK Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skkItems.slice(0, 6).map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                ⚜️
              </span>
              <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                SKK Wajib
              </span>
            </div>
            <h3 className="font-bold text-stone-900 text-xs">{item.namaSKK}</h3>
            <p className="text-[11px] text-stone-500 line-clamp-2">{item.deskripsi}</p>
            <div className="text-[10px] text-amber-800 font-semibold pt-1 border-t border-stone-100">
              {item.bidang}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama anggota, SKK, regu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-amber-700/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterBidang}
            onChange={e => setFilterBidang(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 max-w-[200px] truncate"
          >
            {bidangList.map(b => (
              <option key={b} value={b}>{b === 'Semua' ? 'Semua Bidang' : b}</option>
            ))}
          </select>

          <select
            value={filterTingkat}
            onChange={e => setFilterTingkat(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
          >
            <option value="Semua">Semua Jenjang</option>
            <option value="Purwa">Purwa (Lingkaran)</option>
            <option value="Madya">Madya (Persegi)</option>
            <option value="Utama">Utama (Segilima)</option>
          </select>
        </div>
      </div>

      {/* Table Records */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-900 text-stone-200 border-b border-stone-800 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">ID & Anggota</th>
                <th className="px-4 py-3.5">Nama TKK & Bidang</th>
                <th className="px-4 py-3.5">Jenjang Tingkat</th>
                <th className="px-4 py-3.5">Tgl Ujian & Penguji</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {filteredPencapaian.length > 0 ? (
                filteredPencapaian.map(p => (
                  <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-stone-900">{p.namaAnggota}</div>
                      <div className="text-[11px] text-stone-500">Regu {p.regu} • {p.idAnggota}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-stone-900">{p.namaSKK}</div>
                      <div className="text-[10px] text-stone-500">{p.bidang}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.tingkat === 'Utama' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        p.tingkat === 'Madya' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                        'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}>
                        TKK {p.tingkat}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-800">{p.tanggalUjian}</div>
                      <div className="text-[10px] text-stone-500">Oleh: {p.penguji}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right no-print">
                      {canEdit && (
                        <button
                          onClick={() => handleDelete(p.id, `${p.namaSKK} (${p.namaAnggota})`)}
                          className="text-stone-400 hover:text-rose-600 p-1 rounded-lg"
                          title="Hapus"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                    Belum ada data pencapaian SKK yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add SKK */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Medal className="w-5 h-5 text-amber-700" />
                <span>Terbitkan Tanda Kecakapan Khusus (TKK)</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Pilih Anggota Penggalang *</label>
                <select
                  value={formData.idAnggota}
                  onChange={e => setFormData({ ...formData, idAnggota: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  {anggotaList.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nama} (Regu {a.regu})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama SKK / TKK *</label>
                <select
                  value={formData.namaSKK}
                  onChange={e => {
                    const found = skkItems.find(s => s.namaSKK === e.target.value);
                    setFormData({
                      ...formData,
                      namaSKK: e.target.value,
                      bidang: found ? found.bidang : formData.bidang,
                    });
                  }}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  {skkItems.map(s => (
                    <option key={s.id} value={s.namaSKK}>{s.namaSKK} ({s.bidang})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Jenjang Tingkat</label>
                  <select
                    value={formData.tingkat || 'Purwa'}
                    onChange={e => setFormData({ ...formData, tingkat: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Purwa">Purwa (Lingkaran)</option>
                    <option value="Madya">Madya (Persegi)</option>
                    <option value="Utama">Utama (Segilima)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal Pengujian</label>
                  <input
                    type="text"
                    value={formData.tanggalUjian || ''}
                    onChange={e => setFormData({ ...formData, tanggalUjian: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Penguji / Pembina Penilai</label>
                <select
                  value={formData.penguji}
                  onChange={e => setFormData({ ...formData, penguji: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  {pembinaList.map(p => (
                    <option key={p.id} value={`${p.nama}, ${p.gelar}`}>{p.nama}, {p.gelar}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Catatan Hasil Ujian</label>
                <input
                  type="text"
                  value={formData.catatan || ''}
                  onChange={e => setFormData({ ...formData, catatan: e.target.value })}
                  placeholder="Lulus pengujian praktik & wawancara"
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
                  Terbitkan TKK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
