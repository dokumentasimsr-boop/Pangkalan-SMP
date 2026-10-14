import React, { useState } from 'react';
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  Check,
  X,
  Sparkles,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Calendar,
  Percent,
} from 'lucide-react';
import { Anggota, Pembina, PencapaianSKU, SKUItem, UserRole } from '../types';
import { useToast } from './Toast';

interface SKUViewProps {
  skuItems: SKUItem[];
  pencapaianList: PencapaianSKU[];
  anggotaList: Anggota[];
  pembinaList: Pembina[];
  onSavePencapaian: (list: PencapaianSKU[]) => void;
  onSaveAnggota: (list: Anggota[]) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
}

export const SKUView: React.FC<SKUViewProps> = ({
  skuItems,
  pencapaianList,
  anggotaList,
  pembinaList,
  onSavePencapaian,
  onSaveAnggota,
  currentUserRole,
  onAddLog,
}) => {
  const { showToast } = useToast();
  const [selectedTingkat, setSelectedTingkat] = useState<'Penggalang Ramu' | 'Penggalang Rakit' | 'Penggalang Terap'>('Penggalang Ramu');
  const [selectedAnggotaId, setSelectedAnggotaId] = useState<string>(anggotaList[0]?.id || '');
  const [search, setSearch] = useState('');
  const [activeKategori, setActiveKategori] = useState<string>('Semua');

  // Active student
  const activeAnggota = anggotaList.find(a => a.id === selectedAnggotaId) || anggotaList[0];

  // Filter SKU Items
  const itemsForTingkat = skuItems.filter(item => item.tingkat === selectedTingkat);
  const categories = ['Semua', ...Array.from(new Set(itemsForTingkat.map(i => i.areaPengembangan || i.kategori || 'Umum')))];

  const filteredItems = itemsForTingkat.filter(item => {
    const itemCat = item.areaPengembangan || item.kategori || 'Umum';
    const itemText = item.butirSKU || item.deskripsi || '';
    const matchCat = activeKategori === 'Semua' || itemCat === activeKategori;
    const matchSearch =
      itemText.toLowerCase().includes((search || '').toLowerCase()) ||
      String(item.nomor).includes(search || '');
    return matchCat && matchSearch;
  });

  // Get status of an SKU item for current student
  const getItemPencapaian = (item: SKUItem): PencapaianSKU | undefined => {
    if (!activeAnggota) return undefined;
    return pencapaianList.find(
      p => p.idAnggota === activeAnggota.id && (p.idSKU === item.id || p.nomorSKU === item.nomor)
    );
  };

  // Toggle item status
  const handleToggleItem = (item: SKUItem) => {
    if (!activeAnggota) return;

    const currentRecord = getItemPencapaian(item);
    const defaultPembina = pembinaList[0]?.nama || 'Kak Pembina';
    const nowStr = new Date().toLocaleDateString('id-ID');
    const itemText = item.butirSKU || item.deskripsi || '';

    let updated = [...pencapaianList];

    if (!currentRecord || currentRecord.status === 'Belum') {
      // Mark as Tuntas
      const nextNum = pencapaianList.length + 1;
      const newRecord: PencapaianSKU = {
        id: `PSKU-${String(nextNum).padStart(4, '0')}`,
        idAnggota: activeAnggota.id,
        namaAnggota: activeAnggota.nama,
        regu: activeAnggota.regu,
        tingkat: selectedTingkat,
        idSKU: item.id,
        nomorSKU: item.nomor,
        butirSKU: itemText,
        tanggalUjian: nowStr,
        penguji: defaultPembina,
        status: 'Tuntas',
        catatan: 'Lulus uji butir SKU dengan baik',
      };
      updated = updated.filter(p => !(p.idAnggota === activeAnggota.id && (p.idSKU === item.id || p.nomorSKU === item.nomor)));
      updated.push(newRecord);
      showToast(`Butir SKU #${item.nomor} untuk ${activeAnggota.nama} ditandai LULUS!`, 'success');
    } else {
      // Mark as Belum
      updated = updated.filter(p => !(p.idAnggota === activeAnggota.id && (p.idSKU === item.id || p.nomorSKU === item.nomor)));
      showToast(`Butir SKU #${item.nomor} dibatalkan.`, 'info');
    }

    onSavePencapaian(updated);
    onAddLog('SKU', 'Update Butir SKU', activeAnggota.id, `Memperbarui SKU #${item.nomor} (${selectedTingkat}) untuk ${activeAnggota.nama}`);

    // Check if all items in this tingkat are complete
    const totalTingkat = itemsForTingkat.length;
    const completedTingkat = itemsForTingkat.filter(i => {
      const rec = updated.find(p => p.idAnggota === activeAnggota.id && (p.idSKU === i.id || p.nomorSKU === i.nomor));
      return rec && rec.status === 'Tuntas';
    }).length;

    // Auto promote SKU badge level on 100% completion
    if (completedTingkat === totalTingkat && totalTingkat > 0) {
      if (activeAnggota.tingkatSKU !== selectedTingkat) {
        const updatedAnggotaList = anggotaList.map(a =>
          a.id === activeAnggota.id ? { ...a, tingkatSKU: selectedTingkat } : a
        );
        onSaveAnggota(updatedAnggotaList);
        showToast(`🎉 Selamat! ${activeAnggota.nama} telah menyelesaikan 100% SKU ${selectedTingkat} dan berhak dilantik!`, 'success');
      }
    }
  };

  // Student progress calculation
  const totalInTingkat = itemsForTingkat.length;
  const completedCount = itemsForTingkat.filter(i => {
    const rec = getItemPencapaian(i);
    return rec && rec.status === 'Tuntas';
  }).length;
  const percentage = totalInTingkat > 0 ? Math.round((completedCount / totalInTingkat) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-700" />
            <span>Pencapaian SKU (Syarat Kecakapan Umum)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Pengujian & Verifikasi Tingkat Penggalang Ramu, Rakit, dan Terap
          </p>
        </div>
      </div>

      {/* Select Anggota & Tingkat Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Select Anggota */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Pilih Anggota Penggalang yang Diuji:
            </label>
            <select
              value={selectedAnggotaId}
              onChange={e => setSelectedAnggotaId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-700/20"
            >
              {anggotaList.map(a => (
                <option key={a.id} value={a.id}>
                  {a.nama} ({a.regu} - Kelas {a.kelas}) • {a.tingkatSKU}
                </option>
              ))}
            </select>
          </div>

          {/* Select Jenjang Tingkat SKU */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Tingkat SKU yang Diuji:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Penggalang Ramu', 'Penggalang Rakit', 'Penggalang Terap'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTingkat(t)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                    selectedTingkat === t
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {t.replace('Penggalang ', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Student Status Card */}
        {activeAnggota && (
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-800 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                {activeAnggota.nama.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">{activeAnggota.nama}</h3>
                <div className="text-xs text-stone-600">
                  Regu {activeAnggota.regu} • Kelas {activeAnggota.kelas} • Status: <span className="font-bold text-amber-900">{activeAnggota.tingkatSKU}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 min-w-[200px]">
              <div className="flex justify-between text-xs font-bold text-stone-800">
                <span>Progress {selectedTingkat}:</span>
                <span className="text-amber-900">{completedCount} / {totalInTingkat} ({percentage}%)</span>
              </div>
              <div className="w-full h-3 bg-amber-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-700 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Pills & Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveKategori(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                activeKategori === cat
                  ? 'bg-amber-800 text-white font-bold'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari butir SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-amber-700/20"
          />
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="space-y-3">
        {filteredItems.map(item => {
          const rec = getItemPencapaian(item);
          const isTuntas = rec && rec.status === 'Tuntas';

          return (
            <div
              key={item.id}
              onClick={() => handleToggleItem(item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                isTuntas
                  ? 'bg-emerald-50/60 border-emerald-300 shadow-xs'
                  : 'bg-white border-stone-200 hover:border-amber-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-colors ${
                    isTuntas
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 border border-stone-300'
                  }`}
                >
                  {isTuntas ? <Check className="w-4 h-4" /> : `#${item.nomor}`}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      {item.areaPengembangan || item.kategori || 'Umum'}
                    </span>
                    <span className="text-[10px] text-stone-400">Butir #{item.nomor}</span>
                  </div>

                  <p className={`text-xs font-semibold leading-relaxed ${isTuntas ? 'text-emerald-950' : 'text-stone-800'}`}>
                    {item.butirSKU || item.deskripsi}
                  </p>

                  {isTuntas && rec && (
                    <div className="text-[11px] text-emerald-700 flex items-center gap-2 pt-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Lulus Uji Tanggal: {rec.tanggalUjian} • Penguji: {rec.penguji}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
                    isTuntas
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-amber-900'
                  }`}
                >
                  {isTuntas ? 'Lulus / Tuntas' : 'Belum Diuji'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
