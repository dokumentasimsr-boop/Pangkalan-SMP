import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Shield,
  Printer,
  Calendar,
  Sparkles,
  Database,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { ActiveTab, AppConfig, User, UserRole } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  activeTab: ActiveTab;
  currentUser: User | null;
  config: AppConfig;
  onSwitchRole: (role: UserRole) => void;
  onQuickNavigate: (tab: ActiveTab) => void;
  onSyncGas?: () => void;
  isSyncingGas?: boolean;
  onOpenLandingPage?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  activeTab,
  currentUser,
  config,
  onSwitchRole,
  onQuickNavigate,
  onSyncGas,
  isSyncingGas = false,
  onOpenLandingPage,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };
      setCurrentDateTime(now.toLocaleDateString('id-ID', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const searchItems = [
    { title: 'Presensi Latihan', tab: 'presensi' as ActiveTab, category: 'Latihan' },
    { title: 'SKU Penggalang (Ramu, Rakit, Terap)', tab: 'sku' as ActiveTab, category: 'Kecakapan' },
    { title: 'SKK Penggalang', tab: 'skk' as ActiveTab, category: 'Kecakapan' },
    { title: 'Data Anggota & Cetak KTA', tab: 'anggota' as ActiveTab, category: 'Data Pokok' },
    { title: 'Manajemen Regu (Garuda, Melati, dll)', tab: 'regu' as ActiveTab, category: 'Data Pokok' },
    { title: 'Buku Kas & Keuangan', tab: 'keuangan' as ActiveTab, category: 'Operasional' },
    { title: 'Inventaris & Sarana Perlengkapan', tab: 'inventaris' as ActiveTab, category: 'Operasional' },
    { title: 'Materi Pramuka (Morse, Semaphore, Pioneering)', tab: 'materi-latihan' as ActiveTab, category: 'Materi' },
    { title: 'Jadwal Latihan Mingguan', tab: 'jadwal-latihan' as ActiveTab, category: 'Latihan' },
    { title: 'Generator Laporan & Cetak PDF', tab: 'laporan' as ActiveTab, category: 'Laporan' },
    { title: 'Integrasi Google Spreadsheet & Kode GAS', tab: 'gas-guide' as ActiveTab, category: 'Sistem' },
    { title: 'Pengaturan Database & Pangkalan', tab: 'pengaturan' as ActiveTab, category: 'Sistem' },
  ];

  const filteredSearch = searchItems.filter(item => {
    const q = (searchQuery || '').toLowerCase();
    return (item.title || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q);
  });

  const getPageTitle = (tab: ActiveTab): string => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Utama';
      case 'pembina': return 'Data Pembina Pramuka';
      case 'anggota': return 'Database Anggota Penggalang';
      case 'regu': return 'Manajemen Regu Penggalang';
      case 'program-kerja': return 'Program Kerja Gugus Depan';
      case 'jadwal-latihan': return 'Jadwal & Kalender Latihan';
      case 'materi-latihan': return 'Database Materi Kepramukaan';
      case 'presensi': return 'Presensi Digital Latihan';
      case 'sku': return 'Pencapaian SKU Penggalang';
      case 'skk': return 'Pencapaian SKK Penggalang';
      case 'kegiatan': return 'Kegiatan & Perkemahan';
      case 'inventaris': return 'Inventaris & Sarana Perlengkapan';
      case 'keuangan': return 'Buku Kas Keuangan Gudep';
      case 'prestasi': return 'Prestasi & Kejuaraan Pramuka';
      case 'dokumentasi': return 'Galeri & Dokumentasi Kegiatan';
      case 'surat-menyurat': return 'Administrasi Surat-Menyurat';
      case 'laporan': return 'Generator Laporan Administrasi';
      case 'gas-guide': return 'Integrasi Google Spreadsheet & Kode GAS';
      case 'pengaturan': return 'Pengaturan Identitas Pangkalan';
      case 'manajemen-user': return 'Manajemen Pengguna & Akses';
      case 'log-aktivitas': return 'Log Audit & Aktivitas Sistem';
      default: return 'Sistem Administrasi Pramuka';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-xs no-print">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3">
        {/* Left Side: Mobile Button & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl lg:hidden transition-colors"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 hidden sm:inline-block">
                {config.namaPangkalan || config.namaSekolah || 'Pangkalan Pramuka'}
              </span>
              <span className="text-xs text-stone-400 hidden md:inline-block">•</span>
              <span className="text-xs text-stone-500 hidden md:flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {currentDateTime}
              </span>
            </div>
            <h2 className="text-lg font-bold text-stone-900 tracking-tight">
              {getPageTitle(activeTab)}
            </h2>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2">
          {/* Portal Publik / Landing Page Button */}
          {onOpenLandingPage && (
            <button
              onClick={onOpenLandingPage}
              title="Lihat Landing Page & Portal Publik Kegiatan Pramuka SIT"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-xl text-xs font-semibold transition-all shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Portal Publik</span>
            </button>
          )}

          {/* Google Spreadsheet Sync Status / Trigger Button */}
          {config.gasWebAppUrl ? (
            <button
              onClick={onSyncGas}
              disabled={isSyncingGas}
              title={`Google Spreadsheet Terhubung. Klik untuk sinkronisasi data.${config.lastSyncTime ? ` Terakhir sinkron: ${config.lastSyncTime}` : ''}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-semibold transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncingGas ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncingGas ? 'Menyinkronkan...' : 'Spreadsheet'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>
          ) : (
            <button
              onClick={() => onQuickNavigate('pengaturan')}
              title="Hubungkan ke Google Spreadsheet untuk penyimpanan cloud"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 text-stone-600 border border-stone-200 rounded-xl text-xs font-semibold transition-all"
            >
              <Database className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden sm:inline">Mode Lokal</span>
            </button>
          )}

          {/* Quick Search */}
          <div className="relative">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari modul / data..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-32 sm:w-48 pl-9 pr-3 py-1.5 bg-stone-100/80 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition-all"
              />
            </div>

            {/* Quick Search Dropdown */}
            {isSearchOpen && searchQuery.trim() !== '' && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Hasil Pencarian
                </div>
                {filteredSearch.length > 0 ? (
                  filteredSearch.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onQuickNavigate(item.tab);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-amber-50 flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-medium text-stone-800">{item.title}</span>
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-3 text-xs text-stone-400 text-center">
                    Tidak ada modul yang cocok
                  </div>
                )}
                <div className="border-t border-stone-100 mt-1 pt-1 px-3 flex justify-end">
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="text-[10px] text-stone-500 hover:text-stone-800"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher for Testing / Permissions */}
          <div className="hidden sm:flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
            <span className="text-[10px] font-semibold text-stone-500 px-2 flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-700" /> Role:
            </span>
            {(['ADMIN', 'PEMBINA', 'PETUGAS'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => onSwitchRole(role)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                  currentUser?.role === role
                    ? 'bg-amber-800 text-white shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Quick Print Button */}
          <button
            onClick={() => window.print()}
            title="Cetak Halaman Ini"
            className="p-2 text-stone-600 hover:text-amber-800 hover:bg-amber-50 border border-stone-200 rounded-xl transition-all hidden md:flex items-center gap-1.5 text-xs font-medium"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            <span>Cetak</span>
          </button>
        </div>
      </div>
    </header>
  );
};
