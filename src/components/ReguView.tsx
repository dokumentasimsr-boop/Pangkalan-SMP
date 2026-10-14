import React, { useState } from 'react';
import {
  Flag,
  Plus,
  Users,
  Award,
  Crown,
  Edit2,
  Trash2,
  ArrowRightLeft,
  X,
  Check,
  Search,
} from 'lucide-react';
import { Regu, Anggota, UserRole } from '../types';
import { useToast } from './Toast';

interface ReguViewProps {
  reguList: Regu[];
  anggotaList: Anggota[];
  onSaveRegu: (list: Regu[]) => void;
  onSaveAnggota: (list: Anggota[]) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
}

export const ReguView: React.FC<ReguViewProps> = ({
  reguList,
  anggotaList,
  onSaveRegu,
  onSaveAnggota,
  currentUserRole,
  onAddLog,
}) => {
  const { showToast } = useToast();
  const [selectedRegu, setSelectedRegu] = useState<Regu | null>(reguList[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegu, setEditingRegu] = useState<Regu | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAnggota, setTransferAnggota] = useState<Anggota | null>(null);
  const [targetReguName, setTargetReguName] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState<Partial<Regu>>({
    namaRegu: '',
    kategori: 'Putra',
    pemimpinRegu: '',
    wakilPemimpin: '',
    warnaRegu: '#b45309',
    semboyan: '',
  });

  const handleOpenAdd = () => {
    setEditingRegu(null);
    setFormData({
      namaRegu: '',
      kategori: 'Putra',
      pemimpinRegu: '',
      wakilPemimpin: '',
      warnaRegu: '#b45309',
      semboyan: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (regu: Regu) => {
    setEditingRegu(regu);
    setFormData({ ...regu });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus Regu ${nama}?`)) {
      const updated = reguList.filter(r => r.id !== id);
      onSaveRegu(updated);
      onAddLog('Regu', 'Hapus Regu', id, `Menghapus Regu: ${nama}`);
      showToast(`Regu ${nama} berhasil dihapus.`, 'success');
      if (selectedRegu?.id === id) {
        setSelectedRegu(updated[0] || null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaRegu) {
      showToast('Nama Regu wajib diisi!', 'error');
      return;
    }

    if (editingRegu) {
      const updated = reguList.map(r =>
        r.id === editingRegu.id ? ({ ...r, ...formData } as Regu) : r
      );
      onSaveRegu(updated);
      onAddLog('Regu', 'Edit Regu', editingRegu.id, `Memperbarui data Regu: ${formData.namaRegu}`);
      showToast('Data Regu berhasil diperbarui.', 'success');
      if (selectedRegu?.id === editingRegu.id) {
        setSelectedRegu({ ...selectedRegu, ...formData } as Regu);
      }
    } else {
      const nextNum = reguList.length + 1;
      const newId = `REG-${String(nextNum).padStart(4, '0')}`;
      const newRegu: Regu = {
        id: newId,
        namaRegu: formData.namaRegu || '',
        kategori: formData.kategori as 'Putra' | 'Putri',
        pemimpinRegu: formData.pemimpinRegu || '-',
        wakilPemimpin: formData.wakilPemimpin || '-',
        jumlahAnggota: 0,
        warnaRegu: formData.warnaRegu || '#b45309',
        semboyan: formData.semboyan || 'Satyaku Kudharmakan, Dharmaku Kubaktikan',
      };
      onSaveRegu([...reguList, newRegu]);
      onAddLog('Regu', 'Tambah Regu', newId, `Menambahkan Regu: ${newRegu.namaRegu}`);
      showToast('Regu baru berhasil dibuat.', 'success');
      setSelectedRegu(newRegu);
    }

    setIsModalOpen(false);
  };

  const handleOpenTransfer = (agt: Anggota) => {
    setTransferAnggota(agt);
    setTargetReguName(reguList.find(r => r.namaRegu !== agt.regu)?.namaRegu || '');
    setIsTransferModalOpen(true);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAnggota || !targetReguName) return;

    const oldRegu = transferAnggota.regu;
    const updatedAnggota = anggotaList.map(a =>
      a.id === transferAnggota.id ? { ...a, regu: targetReguName } : a
    );
    onSaveAnggota(updatedAnggota);

    // recalculate counts
    const updatedRegu = reguList.map(r => {
      const count = updatedAnggota.filter(a => (a.regu || '').toLowerCase() === (r.namaRegu || '').toLowerCase() && a.status === 'Aktif').length;
      return { ...r, jumlahAnggota: count };
    });
    onSaveRegu(updatedRegu);

    onAddLog('Regu', 'Mutasi Anggota', transferAnggota.id, `Memindahkan ${transferAnggota.nama} dari Regu ${oldRegu} ke Regu ${targetReguName}`);
    showToast(`${transferAnggota.nama} berhasil dipindahkan ke Regu ${targetReguName}!`, 'success');
    setIsTransferModalOpen(false);
  };

  const membersOfSelectedRegu = selectedRegu
    ? anggotaList.filter(a => (a.regu || '').toLowerCase() === (selectedRegu.namaRegu || '').toLowerCase() && a.status === 'Aktif')
    : [];

  const canEdit = currentUserRole === 'ADMIN' || currentUserRole === 'PEMBINA';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-700" />
            <span>Manajemen Regu Penggalang</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Satuan Regu Putra (Binatang) & Regu Putri (Bunga) Pasukan Penggalang
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Regu Baru</span>
          </button>
        )}
      </div>

      {/* Regu Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reguList.map(r => {
          const isSelected = selectedRegu?.id === r.id;
          const memberCount = anggotaList.filter(a => (a.regu || '').toLowerCase() === (r.namaRegu || '').toLowerCase() && a.status === 'Aktif').length;

          return (
            <div
              key={r.id}
              onClick={() => setSelectedRegu(r)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-50/70 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                  : 'bg-white border-stone-200 hover:border-amber-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs"
                    style={{ backgroundColor: r.warnaRegu || '#b45309' }}
                  >
                    ⚜️
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">Regu {r.namaRegu}</h3>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.kategori === 'Putra' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      Regu {r.kategori}
                    </span>
                  </div>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(r); }}
                      className="p-1 text-stone-400 hover:text-amber-700 hover:bg-white rounded-lg transition-colors"
                      title="Edit Regu"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(r.id, r.namaRegu); }}
                      className="p-1 text-stone-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                      title="Hapus Regu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-stone-600 border-t border-stone-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-stone-500">
                    <Crown className="w-3.5 h-3.5 text-amber-600" /> Pinru:
                  </span>
                  <span className="font-bold text-stone-800 truncate max-w-[130px]">{r.pemimpinRegu || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-stone-500">
                    <Award className="w-3.5 h-3.5 text-amber-500" /> Wapinru:
                  </span>
                  <span className="font-medium text-stone-700 truncate max-w-[130px]">{r.wakilPemimpin || '-'}</span>
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-lg">
                  {memberCount} Anggota
                </span>
                <span className="text-[10px] text-stone-400 italic truncate max-w-[140px]">
                  "{r.semboyan}"
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Regu Member Roster */}
      {selectedRegu && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedRegu.warnaRegu || '#b45309' }}
                />
                <h3 className="text-base font-bold text-stone-900">
                  Daftar Anggota Regu {selectedRegu.namaRegu} ({selectedRegu.kategori})
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Pinru: <span className="font-bold text-stone-700">{selectedRegu.pemimpinRegu}</span> • Wapinru: <span className="font-bold text-stone-700">{selectedRegu.wakilPemimpin}</span>
              </p>
            </div>

            <div className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              Total: {membersOfSelectedRegu.length} Penggalang
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[10px] border-y border-stone-200">
                <tr>
                  <th className="px-4 py-2.5">No</th>
                  <th className="px-4 py-2.5">Nama Anggota</th>
                  <th className="px-4 py-2.5">NISN / ID</th>
                  <th className="px-4 py-2.5">Kelas</th>
                  <th className="px-4 py-2.5">Tingkat SKU</th>
                  <th className="px-4 py-2.5 text-right no-print">Aksi Mutasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {membersOfSelectedRegu.length > 0 ? (
                  membersOfSelectedRegu.map((agt, idx) => (
                    <tr key={agt.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-stone-500">{idx + 1}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{agt.nama}</span>
                          {agt.nama === selectedRegu.pemimpinRegu && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500 text-stone-950">
                              PINRU
                            </span>
                          )}
                          {agt.nama === selectedRegu.wakilPemimpin && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200 text-amber-900">
                              WAPINRU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-stone-500">{agt.nisn}</td>
                      <td className="px-4 py-2.5 font-semibold">Kelas {agt.kelas}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-[11px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {agt.tingkatSKU}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right no-print">
                        {canEdit && (
                          <button
                            onClick={() => handleOpenTransfer(agt)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-stone-100 hover:bg-amber-100 hover:text-amber-900 rounded-lg transition-colors inline-flex items-center gap-1"
                            title="Pindahkan ke Regu Lain"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Pindah Regu</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-stone-400">
                      Belum ada anggota aktif di regu ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Regu */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">
                {editingRegu ? 'Edit Data Regu' : 'Tambah Regu Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Regu *</label>
                <input
                  type="text"
                  required
                  value={formData.namaRegu || ''}
                  onChange={e => setFormData({ ...formData, namaRegu: e.target.value })}
                  placeholder="Contoh: Garuda, Melati, Rajawali..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={formData.kategori || 'Putra'}
                    onChange={e => setFormData({ ...formData, kategori: e.target.value as 'Putra' | 'Putri' })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Putra">Putra (Binatang)</option>
                    <option value="Putri">Putri (Bunga/Tumbuhan)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Warna Badge Regu</label>
                  <input
                    type="color"
                    value={formData.warnaRegu || '#b45309'}
                    onChange={e => setFormData({ ...formData, warnaRegu: e.target.value })}
                    className="w-full h-9 p-1 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Pemimpin Regu (Pinru)</label>
                <input
                  type="text"
                  value={formData.pemimpinRegu || ''}
                  onChange={e => setFormData({ ...formData, pemimpinRegu: e.target.value })}
                  placeholder="Nama Lengkap Pinru"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Wakil Pemimpin Regu (Wapinru)</label>
                <input
                  type="text"
                  value={formData.wakilPemimpin || ''}
                  onChange={e => setFormData({ ...formData, wakilPemimpin: e.target.value })}
                  placeholder="Nama Lengkap Wapinru"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Semboyan / Motto Regu</label>
                <input
                  type="text"
                  value={formData.semboyan || ''}
                  onChange={e => setFormData({ ...formData, semboyan: e.target.value })}
                  placeholder="Contoh: Tangkas, Disiplin, dan Berani"
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
                  Simpan Regu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Transfer Anggota */}
      {isTransferModalOpen && transferAnggota && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-700" />
                <span>Mutasi / Pindah Regu</span>
              </h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <div className="text-stone-500">Nama Anggota:</div>
                <div className="font-bold text-stone-900 text-sm">{transferAnggota.nama}</div>
                <div className="text-stone-600">Regu Saat Ini: <span className="font-bold text-amber-800">Regu {transferAnggota.regu}</span></div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Pindahkan ke Regu Tujuan:</label>
                <select
                  value={targetReguName}
                  onChange={e => setTargetReguName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-700/20"
                >
                  {reguList.map(r => (
                    <option key={r.id} value={r.namaRegu}>
                      Regu {r.namaRegu} ({r.kategori})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-semibold shadow-sm"
                >
                  Konfirmasi Pindah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
