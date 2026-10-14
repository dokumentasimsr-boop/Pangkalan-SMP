import React from 'react';
import {
  Home,
  UserCheck,
  Users,
  Flag,
  Briefcase,
  Calendar,
  BookOpen,
  ClipboardCheck,
  Award,
  Medal,
  Tent,
  Package,
  Wallet,
  Trophy,
  Camera,
  Mail,
  FileBarChart,
  Code,
  Settings,
  ShieldCheck,
  Activity,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ActiveTab, AppConfig, User } from '../types';

interface MenuItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: string;
  highlight?: boolean;
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  config: AppConfig;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  config,
  isOpen,
  setIsOpen,
  onLogout,
}) => {
  const menuGroups: MenuGroup[] = [
    {
      group: 'UTAMA',
      items: [
        { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: Home, roles: ['ADMIN', 'PEMBINA', 'PETUGAS'] },
      ],
    },
    {
      group: 'DATA POKOK PRAMUKA',
      items: [
        { id: 'pembina' as ActiveTab, label: 'Data Pembina', icon: UserCheck, roles: ['ADMIN', 'PEMBINA'] },
        { id: 'anggota' as ActiveTab, label: 'Data Anggota', icon: Users, roles: ['ADMIN', 'PEMBINA', 'PETUGAS'] },
        { id: 'regu' as ActiveTab, label: 'Manajemen Regu', icon: Flag, roles: ['ADMIN', 'PEMBINA'] },
      ],
    },
    {
      group: 'LATIHAN & KECAKAPAN',
      items: [
        { id: 'program-kerja' as ActiveTab, label: 'Program Kerja', icon: Briefcase, roles: ['ADMIN', 'PEMBINA'] },
        { id: 'jadwal-latihan' as ActiveTab, label: 'Jadwal Latihan', icon: Calendar, roles: ['ADMIN', 'PEMBINA', 'PETUGAS'] },
        { id: 'materi-latihan' as ActiveTab, label: 'Materi Latihan', icon: BookOpen, roles: ['ADMIN', 'PEMBINA', 'PETUGAS'] },
        { id: 'presensi' as ActiveTab, label: 'Presensi Digital', icon: ClipboardCheck, roles: ['ADMIN', 'PEMBINA', 'PETUGAS'] },
        { id: 'sku' as ActiveTab, label: 'SKU Penggalang', icon: Award, badge: 'Ramu/Rakit/Terap', roles: ['ADMIN', 'PEMBINA'] },
        { id: 'skk' as ActiveTab, label: 'SKK Penggalang', icon: Medal, roles: ['ADMIN', 'PEMBINA'] },
      ],
    },
    {
      group: 'KEGIATAN & OPERASIONAL',
      items: [
        { id: 'kegiatan' as ActiveTab, label: 'Kegiatan Pramuka', icon: Tent, roles: ['ADMIN', 'PEMBINA', 'PETUGAS'] },
        { id: 'inventaris' as ActiveTab, label: 'Inventaris Sarpras', icon: Package, roles: ['ADMIN', 'PEMBINA', 'PETUGAS'] },
        { id: 'keuangan' as ActiveTab, label: 'Buku Kas Keuangan', icon: Wallet, roles: ['ADMIN', 'PEMBINA', 'PETUGAS'] },
        { id: 'prestasi' as ActiveTab, label: 'Prestasi & Kejuaraan', icon: Trophy, roles: ['ADMIN', 'PEMBINA', 'PETUGAS'] },
        { id: 'dokumentasi' as ActiveTab, label: 'Dokumentasi & Drive', icon: Camera, roles: ['ADMIN', 'PEMBINA', 'PETUGAS'] },
        { id: 'surat-menyurat' as ActiveTab, label: 'Surat-Menyurat', icon: Mail, roles: ['ADMIN', 'PEMBINA', 'PETUGAS'] },
      ],
    },
    {
      group: 'LAPORAN & DEPLOYMENT',
      items: [
        { id: 'laporan' as ActiveTab, label: 'Generator Laporan', icon: FileBarChart, roles: ['ADMIN', 'PEMBINA'] },
        { id: 'gas-guide' as ActiveTab, label: 'Integrasi Google Sheets & Kode GAS', icon: Code, highlight: true, roles: ['ADMIN', 'PEMBINA'] },
      ],
    },
    {
      group: 'SISTEM & AUDIT',
      items: [
        { id: 'pengaturan' as ActiveTab, label: 'Pengaturan Gudep', icon: Settings, roles: ['ADMIN'] },
        { id: 'manajemen-user' as ActiveTab, label: 'Manajemen User', icon: ShieldCheck, roles: ['ADMIN'] },
        { id: 'log-aktivitas' as ActiveTab, label: 'Log Aktivitas', icon: Activity, roles: ['ADMIN'] },
      ],
    },
  ];

  const currentRole = currentUser?.role || 'ADMIN';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-72 bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950 text-stone-200 border-r border-stone-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Header / Identity */}
        <div className="p-4 border-b border-stone-800 bg-stone-950/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center shadow-md shadow-amber-950/50 border border-amber-600/40 text-amber-100 font-bold text-xl shrink-0">
              ⚜️
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">Pangkalan Pramuka</div>
              <h1 className="text-sm font-bold text-white truncate leading-tight">
                {config.namaPangkalan || 'SMP IT ALBASHIROH'}
              </h1>
              <div className="text-[11px] text-stone-400 truncate">
                Gudep {config.nomorGudepPutra} - {config.nomorGudepPutri}
              </div>
            </div>
          </div>
        </div>

        {/* User Info Capsule */}
        <div className="px-4 py-3 bg-stone-950/30 border-b border-stone-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-800/60 border border-amber-600/50 flex items-center justify-center text-xs font-bold text-amber-200 shrink-0">
              {currentUser?.nama?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-stone-200 truncate">{currentUser?.nama || 'Tamu'}</p>
              <div className="flex items-center gap-1.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${currentUser?.role === 'ADMIN' ? 'bg-amber-400' : currentUser?.role === 'PEMBINA' ? 'bg-emerald-400' : 'bg-sky-400'}`} />
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">{currentUser?.role || 'ADMIN'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Keluar"
            className="p-1.5 text-stone-400 hover:text-amber-300 hover:bg-stone-800/80 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {menuGroups.map((group, idx) => {
            const filteredItems = group.items.filter(item => item.roles.includes(currentRole));
            if (filteredItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-amber-500/80 uppercase">
                  {group.group}
                </div>
                {filteredItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-amber-800 text-white font-semibold shadow-sm shadow-amber-950/40'
                          : item.highlight
                          ? 'text-amber-300 bg-amber-950/30 border border-amber-700/40 hover:bg-amber-900/40'
                          : 'text-stone-300 hover:bg-stone-800/70 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-stone-400 group-hover:text-amber-300'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge ? (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${isActive ? 'bg-amber-900 text-amber-200' : 'bg-stone-800 text-stone-300'}`}>
                          {item.badge}
                        </span>
                      ) : item.highlight ? (
                        <span className="flex items-center text-[10px] text-amber-400 font-bold">
                          <Sparkles className="w-3 h-3 mr-0.5" /> GAS
                        </span>
                      ) : isActive ? (
                        <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-950/60 border-t border-stone-800/80 text-center">
          <p className="text-[10px] text-stone-400 font-medium">
            T.P. {config.tahunPelajaran} • {config.kwarran}, {config.kwarcab}
          </p>
          <p className="text-[9px] text-amber-500/70 mt-0.5 font-mono">
            Sistem Administrasi Pramuka v2.0
          </p>
        </div>
      </aside>
    </>
  );
};
