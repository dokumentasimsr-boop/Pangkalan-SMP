import React, { useState } from 'react';
import {
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Printer,
  Users,
  Search,
  Filter,
  Check,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { Anggota, JadwalLatihan, PresensiRecord, PresensiStatus, Regu, UserRole } from '../types';
import { useToast } from './Toast';

interface PresensiViewProps {
  presensiList: PresensiRecord[];
  anggotaList: Anggota[];
  jadwalList: JadwalLatihan[];
  reguList: Regu[];
  onSavePresensi: (list: PresensiRecord[]) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
  selectedJadwal?: JadwalLatihan | null;
}

export const PresensiView: React.FC<PresensiViewProps> = ({
  presensiList,
  anggotaList,
  jadwalList,
  reguList,
  onSavePresensi,
  currentUserRole,
  onAddLog,
  selectedJadwal,
}) => {
  const { showToast } = useToast();

  // Active training date/session
  const defaultJadwal = selectedJadwal || jadwalList[0] || null;
  const [activeDate, setActiveDate] = useState<string>(defaultJadwal?.tanggal || '15/08/2026');
  const [activeMateri, setActiveMateri] = useState<string>(defaultJadwal?.materi || 'Latihan Rutin Pramuka');
  const [filterRegu, setFilterRegu] = useState<string>('Semua');
  const [search, setSearch] = useState('');

  // Get active members
  const activeAnggota = anggotaList.filter(a => a.status === 'Aktif');

  // Filtered members for presensi
  const filteredAnggota = activeAnggota.filter(a => {
    const matchRegu = filterRegu === 'Semua' || a.regu === filterRegu;
    const s = (search || '').toLowerCase();
    const matchSearch = (a.nama || '').toLowerCase().includes(s) || (a.id || '').toLowerCase().includes(s);
    return matchRegu && matchSearch;
  });

  // Get status for an individual on current activeDate
  const getPresensiStatus = (anggotaId: string): PresensiStatus => {
    const record = presensiList.find(p => p.tanggal === activeDate && p.idAnggota === anggotaId);
    return record ? record.status : 'Hadir'; // Default to Hadir if not explicitly set
  };

  const getPresensiKeterangan = (anggotaId: string): string => {
    const record = presensiList.find(p => p.tanggal === activeDate && p.idAnggota === anggotaId);
    return record ? record.keterangan || '' : '';
  };

  // Change individual status
  const handleSetStatus = (anggota: Anggota, status: PresensiStatus, keterangan: string = '') => {
    const existingIndex = presensiList.findIndex(p => p.tanggal === activeDate && p.idAnggota === anggota.id);
    let updated = [...presensiList];

    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        status,
        keterangan,
      };
    } else {
      const nextNum = presensiList.length + 1;
      const newRecord: PresensiRecord = {
        id: `PRS-${String(nextNum).padStart(4, '0')}`,
        tanggal: activeDate,
        idAnggota: anggota.id,
        namaAnggota: anggota.nama,
        regu: anggota.regu,
        status,
        kegiatan: activeMateri,
        keterangan,
      };
      updated.push(newRecord);
    }

    onSavePresensi(updated);
  };

  // 1-Click "Tandai Semua Hadir" for current filter
  const handleMarkAllPresent = () => {
    let updated = [...presensiList];
    filteredAnggota.forEach(agt => {
      const existingIndex = updated.findIndex(p => p.tanggal === activeDate && p.idAnggota === agt.id);
      if (existingIndex >= 0) {
        updated[existingIndex] = {
          ...updated[existingIndex],
          status: 'Hadir',
        };
      } else {
        const nextNum = updated.length + 1;
        updated.push({
          id: `PRS-${String(nextNum).padStart(4, '0')}`,
          tanggal: activeDate,
          idAnggota: agt.id,
          namaAnggota: agt.nama,
          regu: agt.regu,
          status: 'Hadir',
          kegiatan: activeMateri,
          keterangan: 'Hadir Latihan',
        });
      }
    });

    onSavePresensi(updated);
    onAddLog('Presensi', 'Tandai Semua Hadir', activeDate, `Presensi massal Hadir untuk sesi ${activeDate}`);
    showToast(`Seluruh anggota (${filteredAnggota.length}) ditandai Hadir!`, 'success');
  };

  // Calculate recap stats for current date
  let hadirCount = 0;
  let sakitCount = 0;
  let izinCount = 0;
  let alpaCount = 0;

  activeAnggota.forEach(agt => {
    const st = getPresensiStatus(agt.id);
    if (st === 'Hadir') hadirCount++;
    else if (st === 'Sakit') sakitCount++;
    else if (st === 'Izin') izinCount++;
    else if (st === 'Alpa') alpaCount++;
  });

  const totalMember = activeAnggota.length;
  const persentaseHadir = totalMember > 0 ? Math.round((hadirCount / totalMember) * 100) : 0;

  const exportCSV = () => {
    const headers = ['Tanggal Latihan', 'Materi', 'ID Anggota', 'Nama Anggota', 'Regu', 'Status Presensi', 'Keterangan'];
    const rows = filteredAnggota.map(a => [
      activeDate,
      `"${activeMateri}"`,
      a.id,
      `"${a.nama}"`,
      `"${a.regu}"`,
      getPresensiStatus(a.id),
      `"${getPresensiKeterangan(a.id)}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Presensi_Latihan_Pramuka_${activeDate.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Rekap presensi berhasil diekspor ke CSV', 'info');
  };

  const handleSelectJadwal = (jdw: JadwalLatihan) => {
    setActiveDate(jdw.tanggal);
    setActiveMateri(jdw.materi);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-amber-700" />
            <span>Presensi Digital Latihan Pramuka</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Pencatatan kehadiran anggota Penggalang per sesi latihan & kalkulasi rekap otomatis
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
          <button
            onClick={handleMarkAllPresent}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Tandai Semua Hadir</span>
          </button>
        </div>
      </div>

      {/* Date & Training Selector Card */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-stone-500 font-semibold uppercase">Sesi Latihan Aktif</div>
              <div className="text-sm font-bold text-stone-900">{activeMateri}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600">Pilih Tanggal:</span>
            <input
              type="text"
              value={activeDate}
              onChange={e => setActiveDate(e.target.value)}
              placeholder="DD/MM/YYYY"
              className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 w-32 focus:ring-2 focus:ring-amber-700/20"
            />
          </div>
        </div>

        {/* Quick buttons for existing schedule dates */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 text-[11px] font-medium shrink-0">Jadwal Terdaftar:</span>
          {jadwalList.map(j => (
            <button
              key={j.id}
              onClick={() => handleSelectJadwal(j)}
              className={`px-3 py-1 rounded-lg shrink-0 font-semibold transition-all ${
                activeDate === j.tanggal
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {j.tanggal} ({j.hari})
            </button>
          ))}
        </div>
      </div>

      {/* Recap Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] text-stone-500 font-medium">% Kehadiran</div>
          <div className="text-2xl font-black text-amber-800 mt-0.5">{persentaseHadir}%</div>
          <div className="text-[10px] text-stone-400 mt-0.5 font-medium">{hadirCount} dari {totalMember} hadir</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hadir
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-0.5">{hadirCount}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">{totalMember > 0 ? Math.round((hadirCount/totalMember)*100) : 0}%</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-xs">
          <div className="text-[11px] text-blue-700 font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" /> Sakit
          </div>
          <div className="text-2xl font-black text-blue-900 mt-0.5">{sakitCount}</div>
          <div className="text-[10px] text-blue-600 font-semibold">{sakitCount} Penggalang</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Izin
          </div>
          <div className="text-2xl font-black text-amber-900 mt-0.5">{izinCount}</div>
          <div className="text-[10px] text-amber-600 font-semibold">{izinCount} Penggalang</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] text-rose-700 font-bold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Alpa
          </div>
          <div className="text-2xl font-black text-rose-900 mt-0.5">{alpaCount}</div>
          <div className="text-[10px] text-rose-600 font-semibold">{alpaCount} Penggalang</div>
        </div>
      </div>

      {/* Filter Roster */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama anggota..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-amber-700/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={filterRegu}
            onChange={e => setFilterRegu(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
          >
            <option value="Semua">Semua Regu ({filteredAnggota.length})</option>
            {reguList.map(r => (
              <option key={r.id} value={r.namaRegu}>Regu {r.namaRegu} ({r.kategori})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Presensi Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-900 text-stone-200 border-b border-stone-800 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">No</th>
                <th className="px-4 py-3.5">Nama Anggota</th>
                <th className="px-4 py-3.5">Regu & Kelas</th>
                <th className="px-4 py-3.5 text-center">Status Kehadiran ({activeDate})</th>
                <th className="px-4 py-3.5">Keterangan / Alasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {filteredAnggota.map((agt, idx) => {
                const currentStatus = getPresensiStatus(agt.id);
                const currentKet = getPresensiKeterangan(agt.id);

                return (
                  <tr key={agt.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-stone-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-stone-900">{agt.nama}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{agt.id} • NISN: {agt.nisn}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-stone-800">Regu {agt.regu}</span>
                      <div className="text-[11px] text-stone-500">Kelas {agt.kelas}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex rounded-xl p-1 bg-stone-100 border border-stone-200 gap-1">
                        {(['Hadir', 'Sakit', 'Izin', 'Alpa'] as PresensiStatus[]).map(st => (
                          <button
                            key={st}
                            onClick={() => handleSetStatus(agt, st, currentKet)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              currentStatus === st
                                ? st === 'Hadir'
                                  ? 'bg-emerald-700 text-white shadow-xs'
                                  : st === 'Sakit'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : st === 'Izin'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-rose-600 text-white shadow-xs'
                                : 'text-stone-600 hover:bg-stone-200'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={currentKet}
                        onChange={e => handleSetStatus(agt, currentStatus, e.target.value)}
                        placeholder="Catatan izin/keterangan..."
                        className="w-full px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-[11px] text-stone-800 placeholder-stone-400 focus:ring-1 focus:ring-amber-700"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
