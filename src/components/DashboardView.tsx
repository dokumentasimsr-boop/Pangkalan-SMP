import React from 'react';
import {
  Users,
  Flag,
  UserCheck,
  ClipboardCheck,
  Award,
  Medal,
  Tent,
  Trophy,
  Package,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Shield,
  FileText,
} from 'lucide-react';
import {
  Anggota,
  AppConfig,
  Inventaris,
  JadwalLatihan,
  Kegiatan,
  Keuangan,
  LogAktivitas,
  Pembina,
  PencapaianSKK,
  PencapaianSKU,
  PresensiRecord,
  Prestasi,
  Regu,
  ActiveTab,
} from '../types';

interface DashboardViewProps {
  config: AppConfig;
  anggota: Anggota[];
  regu: Regu[];
  pembina: Pembina[];
  presensi: PresensiRecord[];
  kegiatan: Kegiatan[];
  inventaris: Inventaris[];
  keuangan: Keuangan[];
  prestasi: Prestasi[];
  pencapaianSKU: PencapaianSKU[];
  pencapaianSKK: PencapaianSKK[];
  jadwalLatihan: JadwalLatihan[];
  logs: LogAktivitas[];
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  config,
  anggota,
  regu,
  pembina,
  presensi,
  kegiatan,
  inventaris,
  keuangan,
  prestasi,
  pencapaianSKU,
  pencapaianSKK,
  jadwalLatihan,
  logs,
  onNavigate,
}) => {
  // Calculations
  const totalAnggota = anggota.length;
  const anggotaAktif = anggota.filter(a => a.status === 'Aktif').length;
  const totalRegu = regu.length;
  const totalPembina = pembina.filter(p => p.status === 'Aktif').length;

  // Kehadiran stats
  const totalPresensi = presensi.length;
  const totalHadir = presensi.filter(p => p.status === 'Hadir').length;
  const persentaseKehadiran = totalPresensi > 0 ? Math.round((totalHadir / totalPresensi) * 100) : 0;

  // SKU stats
  const tuntasSKU = pencapaianSKU.filter(p => p.status === 'Tuntas').length;
  const prosesSKU = pencapaianSKU.filter(p => p.status === 'Proses').length;
  const ramuCount = anggota.filter(a => a.tingkatSKU === 'Penggalang Ramu').length;
  const rakitCount = anggota.filter(a => a.tingkatSKU === 'Penggalang Rakit').length;
  const terapCount = anggota.filter(a => a.tingkatSKU === 'Penggalang Terap').length;

  // SKK stats
  const tuntasSKK = pencapaianSKK.filter(p => p.status === 'Tuntas').length;

  // Keuangan stats
  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  keuangan.forEach(trx => {
    if (trx.jenis === 'Pemasukan') totalPemasukan += trx.nominal;
    else if (trx.jenis === 'Pengeluaran') totalPengeluaran += trx.nominal;
  });
  const saldoKas = totalPemasukan - totalPengeluaran;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const statCards = [
    { title: 'Total Anggota', value: totalAnggota, sub: `${anggotaAktif} Aktif`, icon: Users, color: 'from-amber-600 to-amber-700', tab: 'anggota' as ActiveTab },
    { title: 'Total Regu', value: totalRegu, sub: `${regu.filter(r=>r.kategori==='Putra').length} Pa / ${regu.filter(r=>r.kategori==='Putri').length} Pi`, icon: Flag, color: 'from-orange-600 to-orange-700', tab: 'regu' as ActiveTab },
    { title: 'Total Pembina', value: totalPembina, sub: 'Pembina Aktif', icon: UserCheck, color: 'from-emerald-600 to-emerald-700', tab: 'pembina' as ActiveTab },
    { title: 'Kehadiran Latihan', value: `${persentaseKehadiran}%`, sub: `${totalHadir} dari ${totalPresensi} presensi`, icon: ClipboardCheck, color: 'from-blue-600 to-blue-700', tab: 'presensi' as ActiveTab },
    { title: 'Pencapaian SKU', value: tuntasSKU, sub: `${prosesSKU} dalam pengujian`, icon: Award, color: 'from-purple-600 to-purple-700', tab: 'sku' as ActiveTab },
    { title: 'Pencapaian SKK', value: tuntasSKK, sub: 'TKK Terbit', icon: Medal, color: 'from-teal-600 to-teal-700', tab: 'skk' as ActiveTab },
    { title: 'Jumlah Kegiatan', value: kegiatan.length, sub: `${kegiatan.filter(k=>k.status==='Selesai').length} Terlaksana`, icon: Tent, color: 'from-cyan-600 to-cyan-700', tab: 'kegiatan' as ActiveTab },
    { title: 'Prestasi Juara', value: prestasi.length, sub: 'Tingkat Kec-Prov', icon: Trophy, color: 'from-yellow-600 to-yellow-700', tab: 'prestasi' as ActiveTab },
    { title: 'Item Inventaris', value: inventaris.length, sub: `${inventaris.filter(i=>i.kondisi==='Baik').length} Kondisi Baik`, icon: Package, color: 'from-stone-600 to-stone-700', tab: 'inventaris' as ActiveTab },
    { title: 'Saldo Kas Gudep', value: formatRupiah(saldoKas), sub: `Masuk: ${formatRupiah(totalPemasukan)}`, icon: Wallet, color: 'from-amber-800 to-stone-900', tab: 'keuangan' as ActiveTab, isWide: true },
  ];

  // Regu chart max calculation
  const maxReguMembers = Math.max(...regu.map(r => r.jumlahAnggota), 1);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-6 sm:p-8 shadow-xl border border-amber-800/30">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-700/40 border border-amber-600/50 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Administrasi Digital Pramuka Penggalang</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {config.namaPangkalan || config.namaSekolah ? `Pangkalan ${config.namaPangkalan || config.namaSekolah}` : 'Pangkalan Gugus Depan Pramuka'}
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed">
              {config.nomorGudepPutra || config.nomorGudepPutri || config.kwarran || config.kwarcab
                ? `Gugus Depan Putra ${config.nomorGudepPutra || config.nomorGudepPa || '-'} & Putri ${config.nomorGudepPutri || config.nomorGudepPi || '-'} • Kwarran ${config.kwarran || '-'}, Kwarcab ${config.kwarcab || '-'}.`
                : 'Sistem administrasi digital terpadu. Data pangkalan dan seluruh modul tersinkronisasi otomatis dengan Google Spreadsheet database.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('presensi')}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-amber-950/40 flex items-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Input Presensi</span>
            </button>
            <button
              onClick={() => onNavigate('gas-guide')}
              className="px-4 py-2.5 bg-stone-800/90 hover:bg-stone-700 text-amber-200 border border-amber-700/50 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Google Sheets Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(card.tab)}
              className={`bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs hover:shadow-md hover:border-amber-400/80 transition-all cursor-pointer group flex flex-col justify-between ${
                card.isWide ? 'col-span-2 sm:col-span-3 lg:col-span-1' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-stone-500 truncate">{card.title}</span>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight truncate">
                  {card.value}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5 truncate flex items-center gap-1 font-medium">
                  <span>{card.sub}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Grafik & Visualisasi Statistik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik 1: Anggota per Regu */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-700" />
              <span>Jumlah Anggota per Regu</span>
            </h3>
            <button onClick={() => onNavigate('regu')} className="text-xs font-semibold text-amber-800 hover:underline">
              Detail
            </button>
          </div>
          <div className="space-y-3 pt-1">
            {regu.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400">
                Belum ada data regu. Data tersinkron otomatis dari Google Spreadsheet.
              </div>
            ) : (
              regu.map(r => {
                const pct = Math.round((r.jumlahAnggota / maxReguMembers) * 100);
                return (
                  <div key={r.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: r.warnaRegu || '#b45309' }}
                        />
                        Regu {r.namaRegu} ({r.kategori})
                      </span>
                      <span className="font-bold text-stone-900">{r.jumlahAnggota} Anggota</span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: r.warnaRegu || '#b45309',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Grafik 2: Progress Tingkat SKU Penggalang */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-700" />
              <span>Distribusi Jenjang SKU</span>
            </h3>
            <button onClick={() => onNavigate('sku')} className="text-xs font-semibold text-amber-800 hover:underline">
              Uji SKU
            </button>
          </div>
          <div className="space-y-3.5 pt-1">
            {/* Ramu */}
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-900">Penggalang Ramu</div>
                <div className="text-[11px] text-amber-700">Tingkat dasar kecakapan penggalang</div>
              </div>
              <div className="text-right">
                <div className="text-base font-extrabold text-amber-900">{ramuCount}</div>
                <div className="text-[10px] text-amber-600 font-semibold">{totalAnggota > 0 ? Math.round((ramuCount/totalAnggota)*100) : 0}%</div>
              </div>
            </div>

            {/* Rakit */}
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-purple-900">Penggalang Rakit</div>
                <div className="text-[11px] text-purple-700">Tingkat menengah kecakapan</div>
              </div>
              <div className="text-right">
                <div className="text-base font-extrabold text-purple-900">{rakitCount}</div>
                <div className="text-[10px] text-purple-600 font-semibold">{totalAnggota > 0 ? Math.round((rakitCount/totalAnggota)*100) : 0}%</div>
              </div>
            </div>

            {/* Terap */}
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-900">Penggalang Terap</div>
                <div className="text-[11px] text-emerald-700">Tingkat utama persiapan Garuda</div>
              </div>
              <div className="text-right">
                <div className="text-base font-extrabold text-emerald-900">{terapCount}</div>
                <div className="text-[10px] text-emerald-600 font-semibold">{totalAnggota > 0 ? Math.round((terapCount/totalAnggota)*100) : 0}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Grafik 3: Ringkasan Arus Kas Keuangan */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-700" />
              <span>Arus Kas Gudep</span>
            </h3>
            <button onClick={() => onNavigate('keuangan')} className="text-xs font-semibold text-amber-800 hover:underline">
              Buku Kas
            </button>
          </div>
          <div className="space-y-3 pt-1">
            <div className="p-3.5 bg-stone-900 rounded-xl text-white">
              <div className="text-[11px] text-stone-400 font-medium">Saldo Kas Aktif</div>
              <div className="text-xl font-black text-amber-400 mt-0.5">
                {formatRupiah(saldoKas)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> Pemasukan
                </div>
                <div className="text-xs font-extrabold text-emerald-900 mt-1 truncate">
                  {formatRupiah(totalPemasukan)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <div className="flex items-center gap-1 text-[11px] font-bold text-rose-800">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" /> Pengeluaran
                </div>
                <div className="text-xs font-extrabold text-rose-900 mt-1 truncate">
                  {formatRupiah(totalPengeluaran)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Bawah: Agenda Latihan & Prestasi Terkini */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agenda Latihan Terdekat */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-700" />
              <span>Agenda & Jadwal Latihan Pramuka</span>
            </h3>
            <button onClick={() => onNavigate('jadwal-latihan')} className="text-xs font-semibold text-amber-800 hover:underline">
              Lihat Kalender
            </button>
          </div>

          <div className="space-y-2.5">
            {jadwalLatihan.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400">
                Belum ada jadwal latihan. Data tersinkron otomatis dari Google Spreadsheet.
              </div>
            ) : (
              jadwalLatihan.slice(0, 3).map(jdw => (
                <div key={jdw.id} className="p-3.5 rounded-xl border border-stone-200 hover:border-amber-300 bg-stone-50/50 flex items-start justify-between gap-3 transition-colors">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        {jdw.hari}, {jdw.tanggal}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        jdw.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {jdw.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-stone-900 truncate">
                      {jdw.materi}
                    </div>
                    <div className="text-[11px] text-stone-500 truncate">
                      📍 {jdw.lokasi} • Pembina: {jdw.pembina}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Prestasi Pangkalan & Regu */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span>Prestasi & Rekam Jejak Juara</span>
            </h3>
            <button onClick={() => onNavigate('prestasi')} className="text-xs font-semibold text-amber-800 hover:underline">
              Semua Prestasi
            </button>
          </div>

          <div className="space-y-2.5">
            {prestasi.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400">
                Belum ada data prestasi. Data tersinkron otomatis dari Google Spreadsheet.
              </div>
            ) : (
              prestasi.slice(0, 3).map(pst => (
                <div key={pst.id} className="p-3.5 rounded-xl border border-yellow-200 bg-yellow-50/40 flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-900 truncate">
                        🏆 {pst.prestasi}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200 text-amber-900">
                        Tk. {pst.tingkat}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-stone-800 truncate">
                      {pst.namaKegiatan}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Oleh: <span className="font-semibold text-stone-700">{pst.namaPesertaRegu}</span> ({pst.tahun})
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
