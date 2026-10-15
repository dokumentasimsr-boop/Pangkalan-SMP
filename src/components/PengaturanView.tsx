import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Shield,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Download,
  Upload,
  ArrowUpDown,
  Table,
  Check,
  Zap,
  X,
  Radio,
  Trash2,
} from 'lucide-react';
import { AppConfig, PangkalanConfig, UserRole } from '../types';
import { useToast } from './Toast';
import { GasService, DEFAULT_GAS_URL } from '../services/gasService';

interface PengaturanViewProps {
  config: PangkalanConfig;
  onSaveConfig: (cfg: PangkalanConfig) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
  onPullFromGas?: (urlOverride?: string) => Promise<{ success: boolean; message: string; counts?: Record<string, number> }>;
  onPushToGas?: (urlOverride?: string) => Promise<{ success: boolean; message: string }>;
  isSyncingGas?: boolean;
  dataStats?: Record<string, number>;
  onNavigateToTab?: (tab: any) => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  config,
  onSaveConfig,
  currentUserRole,
  onAddLog,
  onPullFromGas,
  onPushToGas,
  isSyncingGas = false,
  dataStats = {} as Record<string, number>,
  onNavigateToTab,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<PangkalanConfig>({
    ...config,
    autoSyncOnStart: config.autoSyncOnStart ?? true,
    autoSyncOnChange: config.autoSyncOnChange ?? false,
  });
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isSyncingConfigSheet, setIsSyncingConfigSheet] = useState(false);
  const [isPushConfirmOpen, setIsPushConfirmOpen] = useState(false);

  // Synchronize internal form data whenever config changes (e.g. from Google Sheets Pull or startup)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...config,
      autoSyncOnStart: config.autoSyncOnStart ?? prev.autoSyncOnStart ?? true,
      autoSyncOnChange: config.autoSyncOnChange ?? prev.autoSyncOnChange ?? false,
    }));
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onAddLog('Pengaturan', 'Update Konfigurasi', 'CONFIG', 'Memperbarui identitas pangkalan & nomor Gudep');
    showToast('Konfigurasi identitas pangkalan berhasil disimpan!', 'success');

    // Automatically sync updated config directly to CONFIG sheet in Google Spreadsheet if URL is configured
    const trimmedUrl = (formData.gasWebAppUrl || '').trim();
    if (trimmedUrl && GasService.isValidGasUrl(trimmedUrl)) {
      setIsSyncingConfigSheet(true);
      try {
        const res = await GasService.pushEntity(trimmedUrl, 'SAVE_CONFIG', formData);
        if (res && res.success) {
          showToast('Data sheet CONFIG di Google Spreadsheet otomatis disinkronkan!', 'success');
        }
      } catch (err: any) {
        console.warn('Auto-sync to Google Spreadsheet CONFIG sheet failed:', err);
      } finally {
        setIsSyncingConfigSheet(false);
      }
    }
  };

  const handleTestGasWebhook = async () => {
    if (!formData.gasWebAppUrl || !formData.gasWebAppUrl.startsWith('http')) {
      showToast('Masukkan URL Web App Google Apps Script yang valid terlebih dahulu (berakhiran /exec).', 'warning');
      return;
    }

    setIsTestingWebhook(true);
    setTestResult(null);
    try {
      const direct = await GasService.testConnection(formData.gasWebAppUrl);
      setTestResult(direct);
      if (direct.success) {
        showToast(direct.message, 'success');
        onAddLog('Database', 'Uji Koneksi', 'GAS', `Koneksi berhasil (${direct.latencyMs}ms)`);

        // Automatically pull and apply CONFIG sheet data upon successful connection test
        try {
          const pulledCfg = await GasService.pullConfig(formData.gasWebAppUrl);
          if (pulledCfg && Object.keys(pulledCfg).length > 0) {
            const updatedConfig = {
              ...formData,
              ...pulledCfg,
            };
            setFormData(updatedConfig);
            onSaveConfig(updatedConfig);
            showToast('Identitas pangkalan otomatis diperbarui dari Sheet CONFIG!', 'success');
          }
        } catch (pullErr) {
          console.warn('Auto-pull config on test connection warning:', pullErr);
        }
      } else {
        showToast(direct.message, 'error');
      }
    } catch (e: any) {
      const msg = e?.message || 'Gagal terhubung ke endpoint GAS.';
      setTestResult({ success: false, message: msg });
      showToast(msg, 'error');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleManualPull = async () => {
    const trimmedUrl = (formData.gasWebAppUrl || '').trim();
    if (!trimmedUrl) {
      showToast('Konfigurasikan URL Web App Google Apps Script terlebih dahulu.', 'warning');
      return;
    }
    if (!onPullFromGas) return;

    // Auto-save any changes in form config
    onSaveConfig(formData);

    setIsPulling(true);
    try {
      const res = await onPullFromGas(trimmedUrl);
      if (res.success) {
        showToast(res.message, 'success');
        onAddLog('Database', 'Tarik Data', 'SPREADSHEET', 'Berhasil menarik data lengkap dari Google Spreadsheet');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menarik data dari Google Spreadsheet.', 'error');
    } finally {
      setIsPulling(false);
    }
  };

  const handleClearCacheAndPull = async () => {
    const trimmedUrl = (formData.gasWebAppUrl || '').trim();
    if (!trimmedUrl) {
      showToast('Konfigurasikan URL Web App Google Apps Script terlebih dahulu.', 'warning');
      return;
    }

    const storageKeysToClean = [
      'pramuka_anggota',
      'pramuka_pembina',
      'pramuka_regu',
      'pramuka_proker',
      'pramuka_jadwal',
      'pramuka_materi',
      'pramuka_presensi',
      'pramuka_sku_pencapaian',
      'pramuka_skk_pencapaian',
      'pramuka_kegiatan',
      'pramuka_inventaris',
      'pramuka_keuangan',
      'pramuka_prestasi',
      'pramuka_dokumentasi',
      'pramuka_surat',
      'pramuka_logs',
    ];
    storageKeysToClean.forEach(k => localStorage.removeItem(k));

    setIsPulling(true);
    try {
      if (onPullFromGas) {
        const res = await onPullFromGas(trimmedUrl);
        if (res.success) {
          showToast('Cache lokal berhasil dibersihkan & data database dimuat murni dari Google Spreadsheet!', 'success');
          onAddLog('Database', 'Clear Cache & Pull', 'ALL', 'Membersihkan cache lokal dan menarik data murni dari Google Spreadsheet');
        } else {
          showToast(res.message || 'Gagal menarik data.', 'error');
        }
      }
    } catch (e: any) {
      showToast(e?.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setIsPulling(false);
    }
  };

  const handleOpenPushConfirm = () => {
    const trimmedUrl = (formData.gasWebAppUrl || '').trim();
    if (!trimmedUrl) {
      showToast('Konfigurasikan URL Web App Google Apps Script terlebih dahulu.', 'warning');
      return;
    }
    if (!onPushToGas) return;

    setIsPushConfirmOpen(true);
  };

  const executeManualPush = async () => {
    setIsPushConfirmOpen(false);
    const trimmedUrl = (formData.gasWebAppUrl || '').trim();
    if (!trimmedUrl || !onPushToGas) return;

    // Auto-save form config
    onSaveConfig(formData);

    setIsPushing(true);
    try {
      const res = await onPushToGas(trimmedUrl);
      if (res.success) {
        showToast(res.message, 'success');
        onAddLog('Database', 'Kirim Data', 'SPREADSHEET', 'Berhasil mengirim seluruh data ke Google Spreadsheet');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal mengirim data ke Google Spreadsheet.', 'error');
    } finally {
      setIsPushing(false);
    }
  };

  const isAdmin = currentUserRole === 'ADMIN';

  const sheetModules = [
    { name: 'ANGGOTA', label: 'Database Anggota', count: dataStats.anggota || 0, tab: 'anggota' },
    { name: 'PEMBINA', label: 'Data Pembina', count: dataStats.pembina || 0, tab: 'pembina' },
    { name: 'REGU', label: 'Manajemen Regu', count: dataStats.regu || 0, tab: 'regu' },
    { name: 'PROKER', label: 'Program Kerja Gudep', count: dataStats.proker || 0, tab: 'program-kerja' },
    { name: 'JADWAL_LATIHAN', label: 'Jadwal & Kalender Latihan', count: dataStats.jadwal || 0, tab: 'jadwal-latihan' },
    { name: 'MATERI_LATIHAN', label: 'Materi Kepramukaan', count: dataStats.materi || 0, tab: 'materi-latihan' },
    { name: 'PRESENSI', label: 'Presensi Digital Latihan', count: dataStats.presensi || 0, tab: 'presensi' },
    { name: 'SKU_PENCAPAIAN', label: 'Pencapaian Ujian SKU', count: dataStats.sku || 0, tab: 'sku' },
    { name: 'SKK_PENCAPAIAN', label: 'Pencapaian Ujian SKK', count: dataStats.skk || 0, tab: 'skk' },
    { name: 'KEGIATAN', label: 'Kegiatan & Perkemahan', count: dataStats.kegiatan || 0, tab: 'kegiatan' },
    { name: 'INVENTARIS', label: 'Inventaris & Sarana', count: dataStats.inventaris || 0, tab: 'inventaris' },
    { name: 'KEUANGAN', label: 'Buku Kas Keuangan', count: dataStats.keuangan || 0, tab: 'keuangan' },
    { name: 'PRESTASI', label: 'Prestasi & Kejuaraan', count: dataStats.prestasi || 0, tab: 'prestasi' },
    { name: 'DOKUMENTASI', label: 'Galeri Dokumentasi', count: dataStats.dokumentasi || 0, tab: 'dokumentasi' },
    { name: 'SURAT', label: 'Arsip Surat Masuk/Keluar', count: dataStats.surat || 0, tab: 'surat-menyurat' },
    { name: 'USERS', label: 'Pengguna & Akun', count: dataStats.users || 0, tab: 'manajemen-user' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-700" />
            <span>Pengaturan Identitas Pangkalan & Integrasi Database</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Konfigurasi Nomor Gudep, Mabigus, Sinkronisasi Google Spreadsheet, dan Google Apps Script
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card: Google Apps Script Web App Integration (High Priority) */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 flex-wrap gap-2">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-700" />
              <span>Integrasi Google Spreadsheet & Google Apps Script</span>
            </h3>
            <div className="flex items-center gap-2">
              {formData.gasWebAppUrl ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Endpoint Terkonfigurasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                  Mode Penyimpanan Lokal
                </span>
              )}
              {onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab('gas-guide')}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 underline underline-offset-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Lihat Kode Script & Panduan</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-semibold text-stone-700">
                  URL Web App Google Apps Script (Exec) *
                </label>
                {formData.gasWebAppUrl === DEFAULT_GAS_URL ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <Check className="w-3 h-3 text-emerald-600" />
                    URL Resmi Terpasang
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        gasWebAppUrl: DEFAULT_GAS_URL,
                        googleSheetWebAppUrl: DEFAULT_GAS_URL,
                      }));
                    }}
                    className="text-[11px] text-amber-700 hover:text-amber-900 font-bold underline"
                  >
                    Gunakan URL Resmi Default
                  </button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  disabled={!isAdmin}
                  value={formData.gasWebAppUrl || ''}
                  onChange={e => setFormData({ ...formData, gasWebAppUrl: e.target.value })}
                  placeholder={DEFAULT_GAS_URL}
                  className="flex-1 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                />
                <button
                  type="button"
                  onClick={handleTestGasWebhook}
                  disabled={isTestingWebhook || !formData.gasWebAppUrl}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingWebhook ? 'animate-spin' : ''}`} />
                  <span>Uji Koneksi Spreadsheet</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                URL Google Apps Script resmi telah terkonfigurasi secara otomatis untuk sinkronisasi langsung dengan database Google Spreadsheet.
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-xs">{testResult.message}</p>
                  {testResult.latencyMs !== undefined && (
                    <p className="text-[11px] opacity-80 mt-0.5">Waktu respon server: {testResult.latencyMs} ms</p>
                  )}
                </div>
              </div>
            )}

            {/* Sync Settings Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-start gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-100/80 transition-colors">
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={formData.autoSyncOnStart ?? true}
                  onChange={e => setFormData({ ...formData, autoSyncOnStart: e.target.checked })}
                  className="mt-0.5 rounded text-amber-700 focus:ring-amber-700"
                />
                <div>
                  <span className="font-semibold text-stone-900 block">Tarik Data Otomatis Saat Dibuka</span>
                  <span className="text-[11px] text-stone-500">
                    Aplikasi akan otomatis memuat data terbaru dari Google Spreadsheet setiap kali dibuka.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-100/80 transition-colors">
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={formData.autoSyncOnChange ?? false}
                  onChange={e => setFormData({ ...formData, autoSyncOnChange: e.target.checked })}
                  className="mt-0.5 rounded text-amber-700 focus:ring-amber-700"
                />
                <div>
                  <span className="font-semibold text-stone-900 block">Sinkronisasi Otomatis Saat Data Berubah</span>
                  <span className="text-[11px] text-stone-500">
                    Kirim data ke Google Spreadsheet di latar belakang setiap kali data diinput atau diedit.
                  </span>
                </div>
              </label>
            </div>

            {/* Manual Sync Actions */}
            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleManualPull}
                disabled={isPulling || isSyncingGas || !formData.gasWebAppUrl}
                className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Download className={`w-4 h-4 text-amber-700 ${isPulling ? 'animate-bounce' : ''}`} />
                <span>{isPulling ? 'Menarik Data...' : 'Tarik Semua Data dari Spreadsheet'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenPushConfirm}
                disabled={isPushing || isSyncingGas || !formData.gasWebAppUrl}
                className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Upload className={`w-4 h-4 text-amber-400 ${isPushing ? 'animate-bounce' : ''}`} />
                <span>{isPushing ? 'Mengirim Data...' : 'Kirim & Timpa ke Spreadsheet (Push All)'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearCacheAndPull}
                disabled={isPulling || isSyncingGas || !formData.gasWebAppUrl}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl font-semibold flex items-center gap-1.5 transition-all text-xs disabled:opacity-50"
                title="Hapus cache data dummy lokal dan muat data murni dari Google Spreadsheet"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Bersihkan Cache & Tarik Ulang</span>
              </button>

              {config.lastSyncTime && (
                <span className="text-[11px] text-stone-500 flex items-center gap-1 ml-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Terakhir sinkron: {config.lastSyncTime}
                </span>
              )}
            </div>

            {/* Sheets Status Breakdown Table */}
            <div className="mt-4 pt-4 border-t border-stone-100">
              <h4 className="font-bold text-stone-800 mb-2 flex items-center gap-2">
                <Table className="w-4 h-4 text-amber-700" />
                <span>Status & Jumlah Baris 16 Modul Terhubung</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {sheetModules.map(mod => (
                  <div
                    key={mod.name}
                    className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-[11px] font-bold text-stone-800 truncate">{mod.label}</p>
                      <p className="text-[9px] font-mono text-stone-500">{mod.name}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-white border border-stone-200 text-amber-800 font-bold rounded-lg text-xs shrink-0">
                      {mod.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 1: Identitas Pangkalan */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-700" />
                <span>Identitas Pangkalan & Nomor Gugus Depan</span>
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Data identitas otomatis tersinkronisasi dua arah sesuai database di sheet <span className="font-mono font-bold text-amber-800 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">CONFIG</span> Google Spreadsheet.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sinkron Otomatis Sheet CONFIG
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nama Pangkalan *</label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                value={formData.namaPangkalan}
                onChange={e => setFormData({ ...formData, namaPangkalan: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-900"
                placeholder="Pangkalan SMP IT Albashiroh Turen"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nama Sekolah Induk / Lembaga *</label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                value={formData.namaSekolah || ''}
                onChange={e => setFormData({ ...formData, namaSekolah: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-900"
                placeholder="SMP Islam Terpadu Albashiroh Turen"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Jenjang Pendidikan</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.jenjang || 'SMP / MTs'}
                onChange={e => setFormData({ ...formData, jenjang: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nomor Gudep Putra (Pa)</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.nomorGudepPa || formData.nomorGudepPutra || ''}
                onChange={e => setFormData({ ...formData, nomorGudepPa: e.target.value, nomorGudepPutra: e.target.value })}
                placeholder="Contoh: 01.001"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nomor Gudep Putri (Pi)</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.nomorGudepPi || formData.nomorGudepPutri || ''}
                onChange={e => setFormData({ ...formData, nomorGudepPi: e.target.value, nomorGudepPutri: e.target.value })}
                placeholder="Contoh: 01.002"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Tahun Pelajaran</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.tahunPelajaran || ''}
                onChange={e => setFormData({ ...formData, tahunPelajaran: e.target.value })}
                placeholder="2026/2027"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Kwartir Ranting (Kwarran)</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.kwarran || ''}
                onChange={e => setFormData({ ...formData, kwarran: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Kwartir Cabang (Kwarcab)</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.kwarcab || ''}
                onChange={e => setFormData({ ...formData, kwarcab: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Kwartir Daerah (Kwarda)</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.kwarda || ''}
                onChange={e => setFormData({ ...formData, kwarda: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Pimpinan & Pejabat Gudep */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 pb-2 border-b border-stone-100">
            <Shield className="w-4 h-4 text-amber-700" />
            <span>Pimpinan & Penanggung Jawab Administrasi</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Ketua Mabigus (Kamabigus)</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.kaMabigus || formData.namaMabigus || ''}
                onChange={e => setFormData({ ...formData, kaMabigus: e.target.value, namaMabigus: e.target.value })}
                placeholder="Kepala Sekolah / Kamabigus"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Ketua Gudep Putra (Ka Gudep Pa)</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.kaGudepPa || formData.namaKetuaGudep || ''}
                onChange={e => setFormData({ ...formData, kaGudepPa: e.target.value, namaKetuaGudep: e.target.value })}
                placeholder="Nama Ketua Gudep Putra"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Ketua Gudep Putri (Ka Gudep Pi)</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.kaGudepPi || ''}
                onChange={e => setFormData({ ...formData, kaGudepPi: e.target.value })}
                placeholder="Nama Ketua Gudep Putri"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Pembina Satuan Putra (Pa)</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.namaPembinaPutra || ''}
                onChange={e => setFormData({ ...formData, namaPembinaPutra: e.target.value })}
                placeholder="Nama Pembina Satuan Putra"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Pembina Satuan Putri (Pi)</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.namaPembinaPutri || ''}
                onChange={e => setFormData({ ...formData, namaPembinaPutri: e.target.value })}
                placeholder="Nama Pembina Satuan Putri"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Kontak & Alamat */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 pb-2 border-b border-stone-100">
            <MapPin className="w-4 h-4 text-amber-700" />
            <span>Kontak & Lokasi Pangkalan</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">Alamat Lengkap Pangkalan</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.alamat}
                onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email Resmi</label>
              <input
                type="email"
                disabled={!isAdmin}
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={formData.telepon || ''}
                onChange={e => setFormData({ ...formData, telepon: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Pengaturan</span>
            </button>
          </div>
        )}
      </form>

      {/* Push Confirmation In-App Modal */}
      {isPushConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200">
            <div className="p-5 bg-amber-50 border-b border-amber-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Konfirmasi Kirim & Timpa Database</h3>
                  <p className="text-xs text-stone-600">Google Spreadsheet Integration</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPushConfirmOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-stone-700">
              <p className="leading-relaxed">
                Anda akan mengirim seluruh data aplikasi saat ini (<strong>16 modul terhubung</strong>) ke Google Spreadsheet. Data yang ada di sheet target akan diperbarui sesuai data lokal aplikasi.
              </p>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Target Endpoint:</span>
                  <span className="font-mono text-[10px] text-amber-900 max-w-[240px] truncate bg-amber-100/70 px-2 py-0.5 rounded">
                    {formData.gasWebAppUrl}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Total Modul Disinkronkan:</span>
                  <span className="font-bold text-stone-900">16 Modul & Data Konfigurasi</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Pastikan skrip Google Apps Script telah disiapkan sesuai panduan di tab <strong>Panduan GAS</strong>.
                </span>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsPushConfirmOpen(false)}
                className="px-4 py-2 text-stone-700 hover:bg-stone-200 font-semibold rounded-xl text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeManualPush}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Ya, Kirim & Simpan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
