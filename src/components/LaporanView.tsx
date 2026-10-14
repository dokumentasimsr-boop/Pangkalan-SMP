import React, { useState, useMemo, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Users,
  Award,
  Wallet,
  Package,
  Clock,
  ChevronDown,
  AlertCircle,
  HelpCircle,
  XCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import {
  Anggota,
  Pembina,
  Regu,
  ProgramKerja,
  JadwalLatihan,
  PresensiRecord,
  PencapaianSKU,
  PencapaianSKK,
  Kegiatan,
  Inventaris,
  KeuanganRecord,
  Prestasi,
  PangkalanConfig,
} from '../types';
import { useToast } from './Toast';
import { printHtmlElement, downloadElementAsPdf } from '../utils/printUtils';

interface LaporanViewProps {
  config: PangkalanConfig;
  anggotaList: Anggota[];
  pembinaList: Pembina[];
  reguList: Regu[];
  prokerList: ProgramKerja[];
  jadwalList: JadwalLatihan[];
  presensiList: PresensiRecord[];
  pencapaianSKU: PencapaianSKU[];
  pencapaianSKK: PencapaianSKK[];
  kegiatanList: Kegiatan[];
  inventarisList: Inventaris[];
  keuanganList: KeuanganRecord[];
  prestasiList: Prestasi[];
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function parseDateParts(dateStr: string): { year: number; month: number; day: number; formattedDate: string } {
  if (!dateStr) return { year: 2026, month: 8, day: 1, formattedDate: '' };
  
  let year = 2026;
  let month = 8;
  let day = 1;

  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      year = parseInt(parts[0], 10) || 2026;
      month = parseInt(parts[1], 10) || 8;
      day = parseInt(parts[2], 10) || 1;
    } else {
      // DD-MM-YYYY
      day = parseInt(parts[0], 10) || 1;
      month = parseInt(parts[1], 10) || 8;
      year = parseInt(parts[2], 10) || 2026;
    }
  } else if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts[0].length === 4) {
      // YYYY/MM/DD
      year = parseInt(parts[0], 10) || 2026;
      month = parseInt(parts[1], 10) || 8;
      day = parseInt(parts[2], 10) || 1;
    } else {
      // DD/MM/YYYY
      day = parseInt(parts[0], 10) || 1;
      month = parseInt(parts[1], 10) || 8;
      year = parseInt(parts[2], 10) || 2026;
    }
  }

  const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  return { year, month, day, formattedDate };
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  config,
  anggotaList,
  pembinaList,
  reguList,
  prokerList,
  jadwalList,
  presensiList,
  pencapaianSKU,
  pencapaianSKK,
  kegiatanList,
  inventarisList,
  keuanganList,
  prestasiList,
}) => {
  const { showToast } = useToast();
  const [jenisLaporan, setJenisLaporan] = useState<string>('Rekap Kehadiran Bulanan');
  const [periode, setPeriode] = useState<string>('Tahun Ajaran 2026/2027');

  // Month & Year state for Rekap Kehadiran Bulanan
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 8 = Agustus (1-indexed)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [filterReguPresensi, setFilterReguPresensi] = useState<string>('Semua');
  const [filterKategoriPresensi, setFilterKategoriPresensi] = useState<string>('Semua');

  // Paper Orientation State (Landscape vs Portrait)
  const [paperOrientation, setPaperOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Automatically adjust default orientation when report type changes
  useEffect(() => {
    if (jenisLaporan === 'Rekap Kehadiran Bulanan' || jenisLaporan === 'Buku Inventaris Sarpras') {
      setPaperOrientation('landscape');
    } else {
      setPaperOrientation('portrait');
    }
  }, [jenisLaporan]);

  const totalAnggota = anggotaList.length;
  const anggotaPa = anggotaList.filter(a => a.jenisKelamin === 'L').length;
  const anggotaPi = anggotaList.filter(a => a.jenisKelamin === 'P').length;

  const totalMasuk = keuanganList
    .filter(k => k.jenis === 'Pemasukan')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalKeluar = keuanganList
    .filter(k => k.jenis === 'Pengeluaran')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const saldoKas = totalMasuk - totalKeluar;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  // Extract available distinct months from jadwal and presensi
  const availableMonths = useMemo(() => {
    const map = new Map<string, { year: number; month: number; label: string }>();

    // Add standard months in academic year 2026/2027
    const defaultMonths = [
      { year: 2026, month: 7, label: 'Juli 2026' },
      { year: 2026, month: 8, label: 'Agustus 2026' },
      { year: 2026, month: 9, label: 'September 2026' },
      { year: 2026, month: 10, label: 'Oktober 2026' },
      { year: 2026, month: 11, label: 'November 2026' },
      { year: 2026, month: 12, label: 'Desember 2026' },
      { year: 2027, month: 1, label: 'Januari 2027' },
      { year: 2027, month: 2, label: 'Februari 2027' },
      { year: 2027, month: 3, label: 'Maret 2027' },
      { year: 2027, month: 4, label: 'April 2027' },
      { year: 2027, month: 5, label: 'Mei 2027' },
      { year: 2027, month: 6, label: 'Juni 2027' },
    ];

    defaultMonths.forEach(m => map.set(`${m.year}-${m.month}`, m));

    // Also scan actual data
    [...jadwalList.map(j => j.tanggal), ...presensiList.map(p => p.tanggal)].forEach(t => {
      if (!t) return;
      const { year, month } = parseDateParts(t);
      if (year && month) {
        const key = `${year}-${month}`;
        if (!map.has(key)) {
          map.set(key, { year, month, label: `${MONTH_NAMES[month - 1]} ${year}` });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));
  }, [jadwalList, presensiList]);

  // Find all distinct training session dates in the selected month & year
  const monthlyDates = useMemo(() => {
    const datesSet = new Set<string>();

    jadwalList.forEach(j => {
      const { year, month } = parseDateParts(j.tanggal);
      if (year === selectedYear && month === selectedMonth) {
        datesSet.add(j.tanggal);
      }
    });

    presensiList.forEach(p => {
      const { year, month } = parseDateParts(p.tanggal);
      if (year === selectedYear && month === selectedMonth) {
        datesSet.add(p.tanggal);
      }
    });

    const datesArray = Array.from(datesSet);

    // Sort chronologically by day
    return datesArray.sort((a, b) => {
      const pA = parseDateParts(a);
      const pB = parseDateParts(b);
      return pA.day - pB.day;
    });
  }, [jadwalList, presensiList, selectedMonth, selectedYear]);

  // Filtered members for attendance report
  const filteredAnggotaPresensi = useMemo(() => {
    return anggotaList.filter(a => {
      if (a.status !== 'Aktif') return false;

      if (filterKategoriPresensi === 'Putra' && a.jenisKelamin !== 'L') return false;
      if (filterKategoriPresensi === 'Putri' && a.jenisKelamin !== 'P') return false;

      if (filterReguPresensi !== 'Semua' && a.regu !== filterReguPresensi) return false;

      return true;
    }).sort((a, b) => {
      // Sort by Regu first, then by Name
      if (a.regu !== b.regu) return a.regu.localeCompare(b.regu);
      return a.nama.localeCompare(b.nama);
    });
  }, [anggotaList, filterKategoriPresensi, filterReguPresensi]);

  // Compute attendance matrix and summary stats for selected month
  const attendanceMatrix = useMemo(() => {
    const totalSessions = monthlyDates.length;

    let overallHadir = 0;
    let overallIzin = 0;
    let overallSakit = 0;
    let overallAlpa = 0;

    const rows = filteredAnggotaPresensi.map((anggota, idx) => {
      let countH = 0;
      let countI = 0;
      let countS = 0;
      let countA = 0;

      const dateStatuses: { [dateStr: string]: { status: string; symbol: string } } = {};

      monthlyDates.forEach(dateStr => {
        const record = presensiList.find(p => {
          const isDateMatch = p.tanggal === dateStr || parseDateParts(p.tanggal).formattedDate === parseDateParts(dateStr).formattedDate;
          const isUserMatch = p.idAnggota === anggota.id || (p.namaAnggota && p.namaAnggota.toLowerCase() === anggota.nama.toLowerCase());
          return isDateMatch && isUserMatch;
        });

        if (record) {
          const st = record.status;
          if (st === 'Hadir') {
            countH++;
            dateStatuses[dateStr] = { status: 'Hadir', symbol: 'H' };
          } else if (st === 'Izin') {
            countI++;
            dateStatuses[dateStr] = { status: 'Izin', symbol: 'I' };
          } else if (st === 'Sakit') {
            countS++;
            dateStatuses[dateStr] = { status: 'Sakit', symbol: 'S' };
          } else if (st === 'Alpa') {
            countA++;
            dateStatuses[dateStr] = { status: 'Alpa', symbol: 'A' };
          } else {
            countH++;
            dateStatuses[dateStr] = { status: 'Hadir', symbol: 'H' };
          }
        } else {
          // If no specific presensi record exists for this date, show '-'
          dateStatuses[dateStr] = { status: 'None', symbol: '-' };
        }
      });

      overallHadir += countH;
      overallIzin += countI;
      overallSakit += countS;
      overallAlpa += countA;

      const totalRecorded = countH + countI + countS + countA;
      const pct = totalSessions > 0 ? Math.round((countH / totalSessions) * 100) : (totalRecorded > 0 ? Math.round((countH / totalRecorded) * 100) : 0);

      return {
        no: idx + 1,
        anggota,
        dateStatuses,
        countH,
        countI,
        countS,
        countA,
        totalRecorded,
        pct,
      };
    });

    // Regu Level Summaries
    const reguMap = new Map<string, {
      namaRegu: string;
      kategori: string;
      totalAnggota: number;
      hadir: number;
      izin: number;
      sakit: number;
      alpa: number;
    }>();

    rows.forEach(r => {
      const reguName = r.anggota.regu || 'Tanpa Regu';
      const kat = r.anggota.jenisKelamin === 'L' ? 'Putra' : 'Putri';
      const existing = reguMap.get(reguName) || {
        namaRegu: reguName,
        kategori: kat,
        totalAnggota: 0,
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpa: 0,
      };

      existing.totalAnggota += 1;
      existing.hadir += r.countH;
      existing.izin += r.countI;
      existing.sakit += r.countS;
      existing.alpa += r.countA;

      reguMap.set(reguName, existing);
    });

    const reguSummaries = Array.from(reguMap.values()).map(rg => {
      const maxPossible = rg.totalAnggota * (totalSessions || 1);
      const pct = maxPossible > 0 ? Math.round((rg.hadir / maxPossible) * 100) : 0;
      return { ...rg, pct };
    });

    const totalPotentialAttendances = rows.length * (totalSessions || 1);
    const avgPercentage = totalPotentialAttendances > 0 ? Math.round((overallHadir / totalPotentialAttendances) * 100) : 0;

    return {
      rows,
      totalSessions,
      overallHadir,
      overallIzin,
      overallSakit,
      overallAlpa,
      avgPercentage,
      reguSummaries,
    };
  }, [filteredAnggotaPresensi, monthlyDates, presensiList]);

  const handleDownloadPDF = async () => {
    let filename = 'Laporan_Pramuka.pdf';
    const cleanPangkalan = (config.namaPangkalan || 'Gudep').replace(/\s+/g, '_');

    if (jenisLaporan === 'Rekap Kehadiran Bulanan') {
      const monthLabel = MONTH_NAMES[selectedMonth - 1];
      filename = `Rekap_Kehadiran_Pramuka_${monthLabel}_${selectedYear}_${cleanPangkalan}.pdf`;
    } else if (jenisLaporan === 'Buku Induk Anggota') {
      filename = `Buku_Induk_Anggota_Pramuka_${cleanPangkalan}.pdf`;
    } else if (jenisLaporan === 'Rekap SKU & SKK') {
      filename = `Rekap_Pencapaian_SKU_SKK_Pramuka_${cleanPangkalan}.pdf`;
    } else if (jenisLaporan === 'Laporan Kas Keuangan') {
      filename = `Laporan_Kas_Keuangan_Pramuka_${cleanPangkalan}.pdf`;
    } else if (jenisLaporan === 'Buku Inventaris Sarpras') {
      filename = `Buku_Inventaris_Sarpras_Pramuka_${cleanPangkalan}.pdf`;
    } else {
      filename = `Laporan_Eksekutif_Pramuka_${cleanPangkalan}.pdf`;
    }

    setIsGeneratingPdf(true);
    showToast('Sedang membuat file PDF... Mohon tunggu sebentar.', 'info');

    try {
      const ok = await downloadElementAsPdf('laporan-printable-document', {
        filename,
        orientation: paperOrientation,
        scale: 2,
        onSuccess: () => {
          setIsGeneratingPdf(false);
          showToast(`File PDF (${filename}) berhasil diunduh secara otomatis ke perangkat Anda.`, 'success');
        },
        onError: (err) => {
          setIsGeneratingPdf(false);
          console.error('PDF generation failed:', err);
          showToast('Gagal memproses file PDF secara langsung. Membuka dialog cetak browser sebagai alternatif...', 'error');
          handlePrint();
        },
      });

      if (!ok) {
        setIsGeneratingPdf(false);
      }
    } catch (e) {
      setIsGeneratingPdf(false);
      console.error(e);
      handlePrint();
    }
  };

  const handlePrint = () => {
    const reportTitle = `${jenisLaporan} - ${config.namaPangkalan || 'Gudep SMP IT'}`;
    const success = printHtmlElement('laporan-printable-document', {
      title: reportTitle,
      orientation: paperOrientation,
      onSuccess: () => {
        showToast(
          `Dialog cetak terbuka (${paperOrientation === 'landscape' ? 'Lanskap' : 'Potret'}).`,
          'success'
        );
      },
      onError: (err) => {
        console.warn('Fallback printing triggered:', err);
        window.print();
      },
    });

    if (!success) {
      window.print();
    }
  };

  const handleExportSummaryCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = '';

    if (jenisLaporan === 'Rekap Kehadiran Bulanan') {
      const monthLabel = MONTH_NAMES[selectedMonth - 1];
      filename = `Rekap_Kehadiran_Pramuka_${monthLabel}_${selectedYear}.csv`;

      // Date headers
      const dateHeaders = monthlyDates.map(d => {
        const p = parseDateParts(d);
        return `Tgl ${p.day}/${p.month}`;
      });

      headers = ['No', 'ID Anggota', 'NISN', 'Nama Anggota', 'Kategori', 'Regu', 'Kelas', ...dateHeaders, 'Total Hadir (H)', 'Total Izin (I)', 'Total Sakit (S)', 'Total Alpa (A)', 'Persentase Kehadiran (%)'];

      rows = attendanceMatrix.rows.map(r => {
        const dateVals = monthlyDates.map(d => r.dateStatuses[d]?.symbol || '-');
        return [
          r.no,
          `"${r.anggota.id}"`,
          `"${r.anggota.nisn}"`,
          `"${r.anggota.nama}"`,
          r.anggota.jenisKelamin === 'L' ? 'Putra' : 'Putri',
          `"${r.anggota.regu}"`,
          `"${r.anggota.kelas}"`,
          ...dateVals,
          r.countH,
          r.countI,
          r.countS,
          r.countA,
          `"${r.pct}%"`,
        ];
      });

      // Add Footer row
      const summaryDateCounts = monthlyDates.map(d => {
        const hadirCount = attendanceMatrix.rows.filter(r => r.dateStatuses[d]?.symbol === 'H').length;
        return `${hadirCount} Hadir`;
      });

      rows.push([
        'TOTAL',
        '-',
        '-',
        'REKAPITULASI KESELURUHAN',
        '-',
        '-',
        '-',
        ...summaryDateCounts,
        attendanceMatrix.overallHadir,
        attendanceMatrix.overallIzin,
        attendanceMatrix.overallSakit,
        attendanceMatrix.overallAlpa,
        `"${attendanceMatrix.avgPercentage}%"`,
      ]);
    } else if (jenisLaporan === 'Buku Induk Anggota') {
      filename = `Buku_Induk_Anggota_Pramuka_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = ['No', 'ID', 'NISN', 'Nama Lengkap', 'Jenis Kelamin', 'Regu', 'Jabatan', 'Kelas', 'Tingkat SKU', 'Nama Ortu', 'No HP'];
      rows = anggotaList.map((a, i) => [
        i + 1,
        `"${a.id}"`,
        `"${a.nisn}"`,
        `"${a.nama}"`,
        a.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        `"${a.regu}"`,
        `"${a.jabatanRegu || 'Anggota'}"`,
        `"${a.kelas}"`,
        `"${a.tingkatSKU}"`,
        `"${a.namaOrtu || '-'}"`,
        `"${a.noHpOrtu || '-'}"`,
      ]);
    } else if (jenisLaporan === 'Rekap SKU & SKK') {
      filename = `Rekap_Pencapaian_SKU_SKK_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = ['No', 'Nama Anggota', 'Regu', 'Jenis Ujian', 'Nama SKU/SKK', 'Tingkat', 'Tanggal Ujian', 'Penguji', 'Status'];
      rows = [
        ...pencapaianSKU.map((s, i) => [
          i + 1,
          `"${s.namaAnggota || '-'}"`,
          `"${s.regu || '-'}"`,
          'SKU',
          `"Butir ${s.nomorButir || s.nomorSKU || 1}"`,
          `"${s.tingkat}"`,
          `"${s.tanggalUjian || s.tanggalPencapaian || '-'}"`,
          `"${s.penguji || '-'}"`,
          `"${s.status}"`,
        ]),
        ...pencapaianSKK.map((k, i) => [
          pencapaianSKU.length + i + 1,
          `"${k.namaAnggota}"`,
          `"${k.regu}"`,
          'SKK / TKK',
          `"${k.namaSKK}"`,
          `"${k.tingkat}"`,
          `"${k.tanggalUjian}"`,
          `"${k.penguji}"`,
          'Lulus / Terbit TKK',
        ]),
      ];
    } else if (jenisLaporan === 'Laporan Kas Keuangan') {
      filename = `Laporan_Kas_Keuangan_Pramuka_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = ['No', 'Tanggal', 'Jenis Transaksi', 'Kategori', 'Keterangan', 'Pemasukan', 'Pengeluaran'];
      rows = keuanganList.map((k, i) => [
        i + 1,
        `"${k.tanggal}"`,
        `"${k.jenis}"`,
        `"${k.kategori || '-'}"`,
        `"${k.keterangan}"`,
        k.jenis === 'Pemasukan' ? k.nominal : 0,
        k.jenis === 'Pengeluaran' ? k.nominal : 0,
      ]);
    } else if (jenisLaporan === 'Buku Inventaris Sarpras') {
      filename = `Buku_Inventaris_Sarpras_Pramuka_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = ['No', 'Kode Barang', 'Nama Barang', 'Kategori', 'Jumlah', 'Kondisi Baik', 'Kondisi Rusak', 'Lokasi Penyimpanan'];
      rows = inventarisList.map((inv, i) => [
        i + 1,
        `"${inv.kodeBarang}"`,
        `"${inv.namaBarang}"`,
        `"${inv.kategori}"`,
        inv.jumlah,
        inv.kondisiBaik,
        inv.kondisiRusak,
        `"${inv.lokasiPenyimpanan}"`,
      ]);
    } else {
      // Laporan Umum Eksekutif
      filename = `Laporan_Eksekutif_Pramuka_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = ['Indikator Administrasi', 'Nilai / Kuantitas', 'Keterangan'];
      rows = [
        ['Pangkalan', `"${config.namaPangkalan}"`, 'Gugus Depan SMP IT'],
        ['Nomor Gudep Putra / Putri', `"${config.nomorGudepPa || config.nomorGudepPutra} / ${config.nomorGudepPi || config.nomorGudepPutri}"`, 'Kwarcab Malang'],
        ['Ketua Mabigus', `"${config.kaMabigus || config.namaMabigus}"`, 'Kepala Sekolah'],
        ['Total Pembina', pembinaList.length, 'Pembina Putra & Putri'],
        ['Total Anggota Penggalang', totalAnggota, `${anggotaPa} Putra, ${anggotaPi} Putri`],
        ['Total Regu Aktif', reguList.length, 'Regu Putra & Putri'],
        ['Program Kerja Terdaftar', prokerList.length, 'Program Semester/Tahunan'],
        ['Total Sesi Latihan Rutin', jadwalList.length, 'Jadwal Mingguan'],
        ['Pencapaian Uji SKU Tuntas', pencapaianSKU.filter(p => p.status === 'Tuntas').length, 'Ramu, Rakit, Terap'],
        ['Tanda Kecakapan Khusus (TKK) Diterbitkan', pencapaianSKK.length, 'Purwa, Madya, Utama'],
        ['Total Prestasi Juara Diraih', prestasiList.length, 'Kwarran & Kwarcab'],
        ['Total Aset Inventaris', inventarisList.reduce((a, b) => a + b.jumlah, 0), 'Unit Sarana Kemah'],
        ['Total Pemasukan Kas', totalMasuk, formatRupiah(totalMasuk)],
        ['Total Pengeluaran Kas', totalKeluar, formatRupiah(totalKeluar)],
        ['Saldo Kas Berjalan', saldoKas, formatRupiah(saldoKas)],
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Laporan (${filename}) berhasil diekspor.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-700" />
            <span>Pusat Laporan & Rekapitulasi Administrasi</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Cetak dan ekspor Rekap Bulanan Kehadiran Latihan, Buku Induk, SKU/SKK, Kas, dan Inventaris
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Orientation Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-300 text-xs">
            <button
              type="button"
              onClick={() => setPaperOrientation('landscape')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                paperOrientation === 'landscape'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Cetak format Lanskap (Mendatar - Sangat cocok untuk tabel matriks presensi yang lebar)"
            >
              Lanskap (Mendatar)
            </button>
            <button
              type="button"
              onClick={() => setPaperOrientation('portrait')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                paperOrientation === 'portrait'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Cetak format Potret (Tegak)"
            >
              Potret (Tegak)
            </button>
          </div>

          <button
            onClick={handleExportSummaryCSV}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Unduh data dalam format CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Buka dialog cetak browser langsung"
          >
            <Printer className="w-3.5 h-3.5 text-stone-700" />
            <span>Cetak Printer</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="px-4 py-2 bg-amber-800 hover:bg-amber-900 disabled:bg-amber-700/70 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:shadow-md active:scale-95 disabled:cursor-not-allowed"
            title="Otomatis mengunduh file berkas dokumen dalam format PDF"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Membuat PDF...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Cetak / Unduh PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-700 shrink-0">Model Laporan:</span>
            <select
              value={jenisLaporan}
              onChange={e => setJenisLaporan(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-500"
            >
              <option value="Rekap Kehadiran Bulanan">1. Rekap Bulanan Kehadiran Latihan Pramuka</option>
              <option value="Laporan Umum Eksekutif">2. Laporan Umum Eksekutif Gudep</option>
              <option value="Buku Induk Anggota">3. Buku Induk & Data Anggota</option>
              <option value="Rekap SKU & SKK">4. Rekapitulasi Capaian SKU & SKK</option>
              <option value="Laporan Kas Keuangan">5. Laporan Pertanggungjawaban Kas Keuangan</option>
              <option value="Buku Inventaris Sarpras">6. Buku Inventaris Sarana Prasarana</option>
            </select>
          </div>

          {/* Conditional filters for Rekap Kehadiran Bulanan */}
          {jenisLaporan === 'Rekap Kehadiran Bulanan' && (
            <div className="flex flex-wrap items-center gap-2 bg-amber-50/60 p-1.5 rounded-xl border border-amber-200">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-amber-900">Bulan:</span>
                <select
                  value={`${selectedYear}-${selectedMonth}`}
                  onChange={e => {
                    const [y, m] = e.target.value.split('-');
                    setSelectedYear(parseInt(y, 10));
                    setSelectedMonth(parseInt(m, 10));
                  }}
                  className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-stone-800"
                >
                  {availableMonths.map(m => (
                    <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-amber-900">Satuan:</span>
                <select
                  value={filterKategoriPresensi}
                  onChange={e => setFilterKategoriPresensi(e.target.value)}
                  className="px-2 py-1 bg-white border border-amber-300 rounded-lg text-xs font-medium text-stone-800"
                >
                  <option value="Semua">Semua (Putra & Putri)</option>
                  <option value="Putra">Khusus Satuan Putra (Pa)</option>
                  <option value="Putri">Khusus Satuan Putri (Pi)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-amber-900">Regu:</span>
                <select
                  value={filterReguPresensi}
                  onChange={e => setFilterReguPresensi(e.target.value)}
                  className="px-2 py-1 bg-white border border-amber-300 rounded-lg text-xs font-medium text-stone-800"
                >
                  <option value="Semua">Semua Regu</option>
                  {reguList.map(r => (
                    <option key={r.id} value={r.namaRegu}>
                      Regu {r.namaRegu} ({r.kategori})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <span className="text-xs font-semibold text-stone-600 shrink-0">Tahun Ajaran / Periode:</span>
          <input
            type="text"
            value={periode}
            onChange={e => setPeriode(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 w-44"
          />
        </div>
      </div>

      {/* Printable Report Document (A4 Styled) */}
      <div
        id="laporan-printable-document"
        className="bg-white p-6 sm:p-10 rounded-2xl border border-stone-300 shadow-md print:p-0 print:border-none print:shadow-none font-sans text-stone-900 text-xs leading-relaxed space-y-6"
      >
        {/* KOP Surat Resmi */}
        <div className="border-b-4 border-double border-stone-900 pb-4 text-center space-y-1">
          <div className="font-bold text-xs sm:text-sm tracking-wide text-stone-800 uppercase">
            GERAKAN PRAMUKA GUGUS DEPAN {config.kwarcab ? config.kwarcab.toUpperCase() : 'GERAKAN PRAMUKA'} {config.nomorGudepPa || config.nomorGudepPutra || ''} {config.nomorGudepPi || config.nomorGudepPutri ? `- ${config.nomorGudepPi || config.nomorGudepPutri}` : ''}
          </div>
          <div className="font-black text-base sm:text-xl tracking-wider uppercase text-amber-900">
            PANGKALAN {config.namaPangkalan || config.namaSekolah || 'PANGKALAN GUGUS DEPAN'}
          </div>
          <div className="text-xs text-stone-700">
            {config.alamat || ''} {config.kwarran ? `• Kwarran ${config.kwarran}` : ''} {config.kwarcab ? `, Kwarcab ${config.kwarcab}` : ''} {config.kwarda ? `, Kwarda ${config.kwarda}` : ''}
          </div>
          {(config.email || config.telepon || config.website) && (
            <div className="text-[11px] text-stone-500">
              {config.email ? `Email: ${config.email}` : ''} {config.telepon ? ` • Telp: ${config.telepon}` : ''} {config.website ? ` • Web: ${config.website}` : ''}
            </div>
          )}
        </div>

        {/* Title */}
        <div className="text-center space-y-1 pt-1">
          <h2 className="font-black text-base uppercase tracking-wider underline text-stone-900">
            {jenisLaporan === 'Rekap Kehadiran Bulanan'
              ? `REKAPITULASI BULANAN KEHADIRAN LATIHAN PRAMUKA - BULAN ${MONTH_NAMES[selectedMonth - 1].toUpperCase()} ${selectedYear}`
              : jenisLaporan.toUpperCase()}
          </h2>
          <div className="text-xs font-semibold text-stone-600">
            Periode: {periode} {jenisLaporan === 'Rekap Kehadiran Bulanan' ? `• Bulan ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}` : ''} • Dicetak Otomatis oleh Sistem Administrasi Pramuka
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODEL 1: REKAP BULANAN KEHADIRAN LATIHAN PRAMUKA (REQUESTED CORE FEATURE) */}
        {/* ========================================================================= */}
        {jenisLaporan === 'Rekap Kehadiran Bulanan' && (
          <div className="space-y-6">
            {/* Stat Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-center">
                <div className="text-[10px] text-amber-900 font-bold uppercase">Sesi Latihan Bulan Ini</div>
                <div className="text-xl font-black text-amber-950 mt-1">{attendanceMatrix.totalSessions} Pertemuan</div>
                <div className="text-[10px] text-amber-700 font-semibold">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</div>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-center">
                <div className="text-[10px] text-emerald-900 font-bold uppercase">Rata-Rata Kehadiran</div>
                <div className="text-xl font-black text-emerald-950 mt-1">{attendanceMatrix.avgPercentage}%</div>
                <div className="text-[10px] text-emerald-700 font-semibold">{attendanceMatrix.overallHadir} Total Presensi Hadir</div>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-center">
                <div className="text-[10px] text-blue-900 font-bold uppercase">Izin & Sakit</div>
                <div className="text-xl font-black text-blue-950 mt-1">
                  {attendanceMatrix.overallIzin + attendanceMatrix.overallSakit} Orang
                </div>
                <div className="text-[10px] text-blue-700 font-semibold">
                  {attendanceMatrix.overallIzin} Izin • {attendanceMatrix.overallSakit} Sakit
                </div>
              </div>

              <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 text-center">
                <div className="text-[10px] text-rose-900 font-bold uppercase">Tanpa Keterangan (Alpa)</div>
                <div className="text-xl font-black text-rose-950 mt-1">{attendanceMatrix.overallAlpa} Kali</div>
                <div className="text-[10px] text-rose-700 font-semibold">
                  Dari {filteredAnggotaPresensi.length} Anggota Terdaftar
                </div>
              </div>
            </div>

            {/* Info and filter info banner in print */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-800">Filter Satuan/Regu:</span>
                <span className="bg-white px-2 py-0.5 rounded border border-stone-300 font-semibold">
                  {filterKategoriPresensi === 'Semua' ? 'Putra & Putri' : `Satuan ${filterKategoriPresensi}`} • {filterReguPresensi === 'Semua' ? 'Semua Regu' : `Regu ${filterReguPresensi}`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-stone-800">Keterangan Simbol:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700"><span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-300 text-[10px] inline-flex items-center justify-center font-black">H</span> Hadir</span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-700"><span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300 text-[10px] inline-flex items-center justify-center font-black">I</span> Izin</span>
                <span className="inline-flex items-center gap-1 font-semibold text-blue-700"><span className="w-3.5 h-3.5 rounded bg-blue-100 border border-blue-300 text-[10px] inline-flex items-center justify-center font-black">S</span> Sakit</span>
                <span className="inline-flex items-center gap-1 font-semibold text-rose-700"><span className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-300 text-[10px] inline-flex items-center justify-center font-black">A</span> Alpa</span>
              </div>
            </div>

            {/* Attendance Matrix Table */}
            {monthlyDates.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300 text-stone-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-stone-400 opacity-70" />
                <p className="font-bold text-stone-700">Belum ada data jadwal latihan atau presensi pada bulan {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.</p>
                <p className="text-xs text-stone-500 mt-1">Silakan pilih bulan lain pada selektor di atas atau tambahkan jadwal/presensi pada menu Presensi & Jadwal.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-stone-300 text-left text-[10.5px]">
                  <thead className="bg-stone-100 font-bold text-stone-800">
                    <tr>
                      <th className="border border-stone-300 px-2 py-1.5 text-center w-7" rowSpan={2}>No</th>
                      <th className="border border-stone-300 px-2 py-1.5" rowSpan={2}>Nama Lengkap Anggota</th>
                      <th className="border border-stone-300 px-2 py-1.5 text-center w-14" rowSpan={2}>Regu</th>
                      <th className="border border-stone-300 px-2 py-1.5 text-center w-10" rowSpan={2}>Kelas</th>
                      <th
                        className="border border-stone-300 px-2 py-1 text-center bg-amber-50 text-amber-950 font-black"
                        colSpan={monthlyDates.length}
                      >
                        Tanggal Latihan Pertemuan ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
                      </th>
                      <th className="border border-stone-300 px-1 py-1 text-center bg-emerald-50 text-emerald-950 w-7" rowSpan={2} title="Total Hadir">H</th>
                      <th className="border border-stone-300 px-1 py-1 text-center bg-amber-50 text-amber-950 w-7" rowSpan={2} title="Total Izin">I</th>
                      <th className="border border-stone-300 px-1 py-1 text-center bg-blue-50 text-blue-950 w-7" rowSpan={2} title="Total Sakit">S</th>
                      <th className="border border-stone-300 px-1 py-1 text-center bg-rose-50 text-rose-950 w-7" rowSpan={2} title="Total Alpa">A</th>
                      <th className="border border-stone-300 px-2 py-1.5 text-center w-12 font-black" rowSpan={2}>% Hadir</th>
                    </tr>
                    <tr>
                      {monthlyDates.map((dateStr, dIdx) => {
                        const { day, month } = parseDateParts(dateStr);
                        return (
                          <th
                            key={dateStr}
                            className="border border-stone-300 px-1.5 py-1 text-center font-bold text-[10px] min-w-[34px]"
                            title={`Pertemuan ke-${dIdx + 1}: ${dateStr}`}
                          >
                            {day}/{month}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceMatrix.rows.map((row) => (
                      <tr key={row.anggota.id} className="hover:bg-stone-50 transition-colors">
                        <td className="border border-stone-300 px-2 py-1 text-center font-bold text-stone-500">{row.no}</td>
                        <td className="border border-stone-300 px-2 py-1 font-bold text-stone-900">
                          {row.anggota.nama}
                          {row.anggota.jabatanRegu && row.anggota.jabatanRegu !== 'Anggota' && (
                            <span className="ml-1 text-[9px] px-1 py-0.2 bg-amber-100 text-amber-800 rounded font-semibold">
                              {row.anggota.jabatanRegu}
                            </span>
                          )}
                        </td>
                        <td className="border border-stone-300 px-2 py-1 text-center font-medium">
                          {row.anggota.regu}
                        </td>
                        <td className="border border-stone-300 px-2 py-1 text-center font-mono">
                          {row.anggota.kelas}
                        </td>

                        {/* Date Status Badges */}
                        {monthlyDates.map((dateStr) => {
                          const statusInfo = row.dateStatuses[dateStr] || { status: 'None', symbol: '-' };
                          const sym = statusInfo.symbol;

                          let badgeClass = 'text-stone-300';
                          if (sym === 'H') badgeClass = 'font-black text-emerald-700 bg-emerald-50';
                          else if (sym === 'I') badgeClass = 'font-black text-amber-700 bg-amber-50';
                          else if (sym === 'S') badgeClass = 'font-black text-blue-700 bg-blue-50';
                          else if (sym === 'A') badgeClass = 'font-black text-rose-700 bg-rose-50';

                          return (
                            <td
                              key={dateStr}
                              className={`border border-stone-300 px-1 py-1 text-center text-[10px] ${badgeClass}`}
                            >
                              {sym}
                            </td>
                          );
                        })}

                        <td className="border border-stone-300 px-1 py-1 text-center font-bold text-emerald-800 bg-emerald-50/40">
                          {row.countH}
                        </td>
                        <td className="border border-stone-300 px-1 py-1 text-center font-bold text-amber-800 bg-amber-50/40">
                          {row.countI}
                        </td>
                        <td className="border border-stone-300 px-1 py-1 text-center font-bold text-blue-800 bg-blue-50/40">
                          {row.countS}
                        </td>
                        <td className="border border-stone-300 px-1 py-1 text-center font-bold text-rose-800 bg-rose-50/40">
                          {row.countA}
                        </td>
                        <td className={`border border-stone-300 px-2 py-1 text-center font-black ${row.pct >= 75 ? 'text-emerald-800' : row.pct >= 50 ? 'text-amber-800' : 'text-rose-800'}`}>
                          {row.pct}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-stone-100 font-bold text-stone-900">
                    <tr>
                      <td colSpan={4} className="border border-stone-300 px-2 py-1.5 text-right uppercase text-[10px]">
                        Total Hadir Tiap Pertemuan:
                      </td>
                      {monthlyDates.map((dateStr) => {
                        const hadirOnDate = attendanceMatrix.rows.filter(r => r.dateStatuses[dateStr]?.symbol === 'H').length;
                        return (
                          <td key={dateStr} className="border border-stone-300 px-1 py-1.5 text-center font-black text-emerald-900 bg-emerald-50/60">
                            {hadirOnDate}
                          </td>
                        );
                      })}
                      <td className="border border-stone-300 px-1 py-1.5 text-center font-black text-emerald-900 bg-emerald-100">
                        {attendanceMatrix.overallHadir}
                      </td>
                      <td className="border border-stone-300 px-1 py-1.5 text-center font-black text-amber-900 bg-amber-100">
                        {attendanceMatrix.overallIzin}
                      </td>
                      <td className="border border-stone-300 px-1 py-1.5 text-center font-black text-blue-900 bg-blue-100">
                        {attendanceMatrix.overallSakit}
                      </td>
                      <td className="border border-stone-300 px-1 py-1.5 text-center font-black text-rose-900 bg-rose-100">
                        {attendanceMatrix.overallAlpa}
                      </td>
                      <td className="border border-stone-300 px-2 py-1.5 text-center font-black text-amber-950 bg-amber-100">
                        {attendanceMatrix.avgPercentage}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Table Ringkasan Rekap Per Regu */}
            {attendanceMatrix.reguSummaries.length > 0 && (
              <div className="pt-2">
                <h4 className="font-bold text-stone-900 mb-2 border-b border-stone-200 pb-1 text-xs">
                  Ringkasan Tingkat Kehadiran per Regu Penggalang:
                </h4>
                <table className="w-full border-collapse border border-stone-300 text-left text-[11px]">
                  <thead className="bg-stone-100 font-bold">
                    <tr>
                      <th className="border border-stone-300 px-2.5 py-1.5 text-center w-8">No</th>
                      <th className="border border-stone-300 px-2.5 py-1.5">Nama Regu</th>
                      <th className="border border-stone-300 px-2.5 py-1.5 text-center">Satuan</th>
                      <th className="border border-stone-300 px-2.5 py-1.5 text-center">Jumlah Anggota</th>
                      <th className="border border-stone-300 px-2.5 py-1.5 text-center text-emerald-800">Total Hadir</th>
                      <th className="border border-stone-300 px-2.5 py-1.5 text-center text-amber-800">Izin</th>
                      <th className="border border-stone-300 px-2.5 py-1.5 text-center text-blue-800">Sakit</th>
                      <th className="border border-stone-300 px-2.5 py-1.5 text-center text-rose-800">Alpa</th>
                      <th className="border border-stone-300 px-2.5 py-1.5 text-center font-black">Persentase (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceMatrix.reguSummaries.map((rg, idx) => (
                      <tr key={rg.namaRegu} className="hover:bg-stone-50">
                        <td className="border border-stone-300 px-2.5 py-1 text-center font-bold text-stone-500">{idx + 1}</td>
                        <td className="border border-stone-300 px-2.5 py-1 font-bold text-stone-900">Regu {rg.namaRegu}</td>
                        <td className="border border-stone-300 px-2.5 py-1 text-center">{rg.kategori}</td>
                        <td className="border border-stone-300 px-2.5 py-1 text-center font-semibold">{rg.totalAnggota} Orang</td>
                        <td className="border border-stone-300 px-2.5 py-1 text-center font-bold text-emerald-800">{rg.hadir}</td>
                        <td className="border border-stone-300 px-2.5 py-1 text-center text-amber-800">{rg.izin}</td>
                        <td className="border border-stone-300 px-2.5 py-1 text-center text-blue-800">{rg.sakit}</td>
                        <td className="border border-stone-300 px-2.5 py-1 text-center text-rose-800">{rg.alpa}</td>
                        <td className={`border border-stone-300 px-2.5 py-1 text-center font-black ${rg.pct >= 75 ? 'text-emerald-800' : 'text-amber-800'}`}>
                          {rg.pct}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODEL 2: LAPORAN UMUM EKSEKUTIF                                           */}
        {/* ========================================================================= */}
        {jenisLaporan === 'Laporan Umum Eksekutif' && (
          <div className="space-y-6">
            {/* Key Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                <div className="text-[10px] text-stone-500 font-bold uppercase">Total Penggalang</div>
                <div className="text-xl font-black text-amber-900 mt-1">{totalAnggota} Anggota</div>
                <div className="text-[10px] text-stone-400 font-semibold">{anggotaPa} Pa / {anggotaPi} Pi</div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                <div className="text-[10px] text-stone-500 font-bold uppercase">Regu Aktif</div>
                <div className="text-xl font-black text-stone-900 mt-1">{reguList.length} Regu</div>
                <div className="text-[10px] text-stone-400 font-semibold">Pa & Pi</div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                <div className="text-[10px] text-stone-500 font-bold uppercase">Prestasi Juara</div>
                <div className="text-xl font-black text-purple-900 mt-1">{prestasiList.length} Gelar</div>
                <div className="text-[10px] text-stone-400 font-semibold">Tingkat Kwarran/Kwarcab</div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                <div className="text-[10px] text-stone-500 font-bold uppercase">Saldo Kas Akhir</div>
                <div className="text-base font-black text-emerald-900 mt-1.5">{formatRupiah(saldoKas)}</div>
                <div className="text-[10px] text-stone-400 font-semibold">Kas Berjalan</div>
              </div>
            </div>

            {/* Table Struktur Pembina */}
            <div>
              <h4 className="font-bold text-stone-900 mb-2 border-b border-stone-200 pb-1">
                A. Susunan Pembina & Majelis Pembimbing Gugus Depan (Mabigus)
              </h4>
              <table className="w-full border-collapse border border-stone-300 text-left">
                <thead className="bg-stone-100 font-bold">
                  <tr>
                    <th className="border border-stone-300 px-3 py-1.5 w-10 text-center">No</th>
                    <th className="border border-stone-300 px-3 py-1.5">Nama Pembina</th>
                    <th className="border border-stone-300 px-3 py-1.5">Jabatan Gudep</th>
                    <th className="border border-stone-300 px-3 py-1.5">NTA & Kualifikasi</th>
                  </tr>
                </thead>
                <tbody>
                  {pembinaList.map((p, idx) => (
                    <tr key={p.id}>
                      <td className="border border-stone-300 px-3 py-1 text-center font-bold">{idx + 1}</td>
                      <td className="border border-stone-300 px-3 py-1 font-semibold">{p.nama}, {p.gelar || ''}</td>
                      <td className="border border-stone-300 px-3 py-1">{p.jabatan}</td>
                      <td className="border border-stone-300 px-3 py-1">{p.nta} ({p.kualifikasiIjazah || 'KMD'})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Rekap Regu */}
            <div>
              <h4 className="font-bold text-stone-900 mb-2 border-b border-stone-200 pb-1">
                B. Rekapitulasi Regu Penggalang
              </h4>
              <table className="w-full border-collapse border border-stone-300 text-left">
                <thead className="bg-stone-100 font-bold">
                  <tr>
                    <th className="border border-stone-300 px-3 py-1.5 w-10 text-center">No</th>
                    <th className="border border-stone-300 px-3 py-1.5">Nama Regu</th>
                    <th className="border border-stone-300 px-3 py-1.5">Kategori</th>
                    <th className="border border-stone-300 px-3 py-1.5">Pemimpin Regu (Pinru)</th>
                    <th className="border border-stone-300 px-3 py-1.5 text-center">Jumlah Anggota</th>
                  </tr>
                </thead>
                <tbody>
                  {reguList.map((r, idx) => (
                    <tr key={r.id}>
                      <td className="border border-stone-300 px-3 py-1 text-center font-bold">{idx + 1}</td>
                      <td className="border border-stone-300 px-3 py-1 font-bold">Regu {r.namaRegu}</td>
                      <td className="border border-stone-300 px-3 py-1">{r.kategori}</td>
                      <td className="border border-stone-300 px-3 py-1">{r.pinru || r.pemimpinRegu || '-'}</td>
                      <td className="border border-stone-300 px-3 py-1 text-center font-semibold">{r.jumlahAnggota} Orang</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODEL 3: BUKU INDUK ANGGOTA                                               */}
        {/* ========================================================================= */}
        {jenisLaporan === 'Buku Induk Anggota' && (
          <div>
            <table className="w-full border-collapse border border-stone-300 text-left text-[11px]">
              <thead className="bg-stone-100 font-bold">
                <tr>
                  <th className="border border-stone-300 px-2 py-1.5 text-center w-8">No</th>
                  <th className="border border-stone-300 px-2 py-1.5">ID & Nama Lengkap</th>
                  <th className="border border-stone-300 px-2 py-1.5">NISN / NTA</th>
                  <th className="border border-stone-300 px-2 py-1.5">Regu & Jabatan</th>
                  <th className="border border-stone-300 px-2 py-1.5 text-center">Kelas</th>
                  <th className="border border-stone-300 px-2 py-1.5">Tingkat SKU</th>
                </tr>
              </thead>
              <tbody>
                {anggotaList.map((a, idx) => (
                  <tr key={a.id}>
                    <td className="border border-stone-300 px-2 py-1 text-center font-bold">{idx + 1}</td>
                    <td className="border border-stone-300 px-2 py-1 font-bold">{a.nama}</td>
                    <td className="border border-stone-300 px-2 py-1 font-mono">{a.nisn}</td>
                    <td className="border border-stone-300 px-2 py-1">Regu {a.regu} ({a.jabatanRegu || 'Anggota'})</td>
                    <td className="border border-stone-300 px-2 py-1 text-center">Kelas {a.kelas}</td>
                    <td className="border border-stone-300 px-2 py-1 font-semibold">{a.tingkatSKU}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODEL 4: REKAP SKU & SKK                                                  */}
        {/* ========================================================================= */}
        {jenisLaporan === 'Rekap SKU & SKK' && (
          <div className="space-y-4">
            <h4 className="font-bold text-stone-900 border-b border-stone-200 pb-1">Daftar Penerbitan TKK Penggalang</h4>
            <table className="w-full border-collapse border border-stone-300 text-left">
              <thead className="bg-stone-100 font-bold">
                <tr>
                  <th className="border border-stone-300 px-3 py-1.5 w-10 text-center">No</th>
                  <th className="border border-stone-300 px-3 py-1.5">Nama Anggota</th>
                  <th className="border border-stone-300 px-3 py-1.5">Regu</th>
                  <th className="border border-stone-300 px-3 py-1.5">Nama TKK & Jenjang</th>
                  <th className="border border-stone-300 px-3 py-1.5">Tanggal Ujian</th>
                  <th className="border border-stone-300 px-3 py-1.5">Penguji</th>
                </tr>
              </thead>
              <tbody>
                {pencapaianSKK.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="border border-stone-300 px-3 py-1 text-center font-bold">{idx + 1}</td>
                    <td className="border border-stone-300 px-3 py-1 font-bold">{s.namaAnggota}</td>
                    <td className="border border-stone-300 px-3 py-1">Regu {s.regu}</td>
                    <td className="border border-stone-300 px-3 py-1 font-semibold">{s.namaSKK} ({s.tingkat})</td>
                    <td className="border border-stone-300 px-3 py-1">{s.tanggalUjian}</td>
                    <td className="border border-stone-300 px-3 py-1">{s.penguji}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODEL 5: LAPORAN KAS KEUANGAN                                             */}
        {/* ========================================================================= */}
        {jenisLaporan === 'Laporan Kas Keuangan' && (
          <div className="space-y-4">
            <table className="w-full border-collapse border border-stone-300 text-left">
              <thead className="bg-stone-100 font-bold">
                <tr>
                  <th className="border border-stone-300 px-3 py-1.5 w-10 text-center">No</th>
                  <th className="border border-stone-300 px-3 py-1.5">Tanggal</th>
                  <th className="border border-stone-300 px-3 py-1.5">Uraian Transaksi</th>
                  <th className="border border-stone-300 px-3 py-1.5 text-right">Pemasukan</th>
                  <th className="border border-stone-300 px-3 py-1.5 text-right">Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                {keuanganList.map((k, idx) => (
                  <tr key={k.id}>
                    <td className="border border-stone-300 px-3 py-1 text-center font-bold">{idx + 1}</td>
                    <td className="border border-stone-300 px-3 py-1">{k.tanggal}</td>
                    <td className="border border-stone-300 px-3 py-1 font-semibold">{k.keterangan}</td>
                    <td className="border border-stone-300 px-3 py-1 text-right text-emerald-800 font-bold">
                      {k.jenis === 'Pemasukan' ? formatRupiah(k.nominal) : '-'}
                    </td>
                    <td className="border border-stone-300 px-3 py-1 text-right text-rose-800 font-bold">
                      {k.jenis === 'Pengeluaran' ? formatRupiah(k.nominal) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-stone-100 font-black">
                <tr>
                  <td colSpan={3} className="border border-stone-300 px-3 py-2 text-right">TOTAL ARUS KAS:</td>
                  <td className="border border-stone-300 px-3 py-2 text-right text-emerald-900">{formatRupiah(totalMasuk)}</td>
                  <td className="border border-stone-300 px-3 py-2 text-right text-rose-900">{formatRupiah(totalKeluar)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="border border-stone-300 px-3 py-2 text-right">SALDO AKHIR:</td>
                  <td colSpan={2} className="border border-stone-300 px-3 py-2 text-center text-amber-900 text-sm">
                    {formatRupiah(saldoKas)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODEL 6: BUKU INVENTARIS SARPRAS                                          */}
        {/* ========================================================================= */}
        {jenisLaporan === 'Buku Inventaris Sarpras' && (
          <div className="space-y-4">
            <table className="w-full border-collapse border border-stone-300 text-left">
              <thead className="bg-stone-100 font-bold">
                <tr>
                  <th className="border border-stone-300 px-3 py-1.5 w-10 text-center">No</th>
                  <th className="border border-stone-300 px-3 py-1.5">Kode</th>
                  <th className="border border-stone-300 px-3 py-1.5">Nama Barang / Sarana</th>
                  <th className="border border-stone-300 px-3 py-1.5">Kategori</th>
                  <th className="border border-stone-300 px-3 py-1.5 text-center">Jumlah</th>
                  <th className="border border-stone-300 px-3 py-1.5 text-center">Kondisi Baik</th>
                  <th className="border border-stone-300 px-3 py-1.5 text-center">Kondisi Rusak</th>
                  <th className="border border-stone-300 px-3 py-1.5">Lokasi Simpan</th>
                </tr>
              </thead>
              <tbody>
                {inventarisList.map((inv, idx) => (
                  <tr key={inv.id}>
                    <td className="border border-stone-300 px-3 py-1 text-center font-bold">{idx + 1}</td>
                    <td className="border border-stone-300 px-3 py-1 font-mono text-[10px]">{inv.kodeBarang}</td>
                    <td className="border border-stone-300 px-3 py-1 font-bold">{inv.namaBarang}</td>
                    <td className="border border-stone-300 px-3 py-1">{inv.kategori}</td>
                    <td className="border border-stone-300 px-3 py-1 text-center font-bold">{inv.jumlah} {inv.satuan}</td>
                    <td className="border border-stone-300 px-3 py-1 text-center text-emerald-800 font-semibold">{inv.kondisiBaik}</td>
                    <td className="border border-stone-300 px-3 py-1 text-center text-rose-800 font-semibold">{inv.kondisiRusak}</td>
                    <td className="border border-stone-300 px-3 py-1">{inv.lokasiPenyimpanan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signatures */}
        <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-1">
            <div>Mengetahui,</div>
            <div className="font-bold">Ketua Majelis Pembimbing Gugus Depan (Kamabigus)</div>
            <div className="h-16 flex items-center justify-center text-stone-300 italic text-[11px]">
              (Tanda Tangan & Cap Mabigus)
            </div>
            <div className="font-black underline">{config.kaMabigus || config.namaMabigus || '( ......................................... )'}</div>
            <div className="text-[10px] text-stone-500">{config.namaSekolah || config.namaPangkalan ? `Kepala ${config.namaSekolah || config.namaPangkalan}` : 'Kamabigus Pangkalan'}</div>
          </div>

          <div className="space-y-1">
            <div>{config.kwarran || 'Pangkalan'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div className="font-bold">Ketua Gugus Depan Putra / Putri</div>
            <div className="h-16 flex items-center justify-center text-stone-300 italic text-[11px]">
              (Tanda Tangan & Cap Gudep)
            </div>
            <div className="font-black underline">{config.kaGudepPa || config.namaKetuaGudep || config.namaPembinaPutra || '( ......................................... )'}</div>
            <div className="text-[10px] text-stone-500">Pembina / Pengurus Gugus Depan</div>
          </div>
        </div>
      </div>
    </div>
  );
};
