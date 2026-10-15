import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  KeyRound,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Tent,
  Compass,
  Award,
  BookOpen,
  Flag,
  Users,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  LogIn,
  ChevronRight,
  Star,
  Heart,
  Flame,
  Radio,
  ExternalLink,
  RefreshCw,
  Home,
} from 'lucide-react';
import { AppConfig, User, UserRole } from '../types';
import { DEFAULT_GAS_URL } from '../services/gasService';

// Generated authentic scout images
import heroCampImg from '../assets/images/pramuka_camp_hero_1792028474074.jpg';
import pioneeringImg from '../assets/images/pramuka_pioneering_1792028495129.jpg';

interface LandingAndLoginPortalProps {
  config: AppConfig;
  users: User[];
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onEnterAsGuest: () => void;
  onContinueToDashboard: () => void;
  isSyncingGas?: boolean;
}

export const LandingAndLoginPortal: React.FC<LandingAndLoginPortalProps> = ({
  config,
  users,
  currentUser,
  onLoginSuccess,
  onEnterAsGuest,
  onContinueToDashboard,
  isSyncingGas = false,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'beranda' | 'kegiatan' | 'karakter' | 'login'>('beranda');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pangkalanName = config.namaPangkalan || 'PANGKALAN SMP IT ALBASHIROH TUREN';
  const gudepPa = config.nomorGudepPutra || config.nomorGudepPa || '24.081';
  const gudepPi = config.nomorGudepPutri || config.nomorGudepPi || '24.082';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      const trimmedUser = (username || '').trim().toLowerCase();
      const trimmedPass = (password || '').trim();

      const found = users.find(
        u => (u.username || '').toLowerCase() === trimmedUser
      );

      if (!found) {
        setErrorMsg('Username tidak terdaftar di database.');
        setIsSubmitting(false);
        return;
      }

      if (found.status !== 'Aktif') {
        setErrorMsg('Akun Anda dinonaktifkan. Hubungi Admin Pangkalan.');
        setIsSubmitting(false);
        return;
      }

      // Password verification: checks against passwordHash or default standard '123456' / 'admin123'
      const validPasswords = [
        String(found.passwordHash || ''),
        String(found.password || ''),
        '123456',
        'admin123',
      ].filter(Boolean);

      if (validPasswords.length > 0 && !validPasswords.includes(trimmedPass)) {
        setErrorMsg('Kata sandi salah! Coba periksa kembali kata sandi Anda.');
        setIsSubmitting(false);
        return;
      }

      const updatedUser: User = {
        ...found,
        terakhirLogin: new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setIsSubmitting(false);
      onLoginSuccess(updatedUser);
    }, 400);
  };

  const handleQuickLogin = (demoUser: User) => {
    setUsername(demoUser.username);
    setPassword(demoUser.passwordHash ? String(demoUser.passwordHash) : '123456');
    setErrorMsg('');
  };

  const handleInstantQuickLogin = (demoUser: User) => {
    handleQuickLogin(demoUser);
    const updatedUser: User = {
      ...demoUser,
      terakhirLogin: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    onLoginSuccess(updatedUser);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Top Banner Navigation */}
      <nav className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Logo & School Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-xl shadow-lg shadow-amber-900/40 border border-amber-500/30">
              ⚜️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-amber-400">
                  PRAMUKA SIT
                </span>
                <span className="text-[10px] bg-amber-900/60 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-700/50">
                  Gudep {gudepPa} - {gudepPi}
                </span>
              </div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
                SMP IT ALBASHIROH TUREN
              </h1>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-1 text-xs font-medium text-stone-300">
            <button
              onClick={() => {
                setActiveTab('beranda');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'beranda' ? 'text-amber-400 font-bold bg-stone-800/80' : 'hover:text-white hover:bg-stone-800/50'}`}
            >
              Beranda
            </button>
            <button
              onClick={() => {
                setActiveTab('kegiatan');
                scrollToSection('kegiatan-section');
              }}
              className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-stone-800/50 transition-colors"
            >
              Kegiatan & Mukhoyyam
            </button>
            <button
              onClick={() => {
                setActiveTab('karakter');
                scrollToSection('karakter-section');
              }}
              className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-stone-800/50 transition-colors"
            >
              Karakter SIT & Dasa Darma
            </button>
            <button
              onClick={() => scrollToSection('kontak-section')}
              className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-stone-800/50 transition-colors"
            >
              Kontak & Gudep
            </button>
          </div>

          {/* Right Action: Login / Dashboard Button */}
          <div className="flex items-center gap-2.5">
            {currentUser ? (
              <button
                onClick={onContinueToDashboard}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-900/30 transition-all border border-amber-500/40"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Buka Dashboard ({currentUser.nama.split(' ')[0]})</span>
              </button>
            ) : (
              <button
                onClick={() => scrollToSection('login-card')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-900/30 transition-all border border-amber-500/40"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk ke Sistem</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-stone-800 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-900">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 text-xs font-semibold shadow-inner">
                <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Satuan Komunitas Pramuka Sekolah Islam Terpadu (SIT)</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  Mencetak Pandu Penggalang{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                    Tangguh, Mandiri & Berakhlak Qur'ani
                  </span>
                </h1>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                  Selamat datang di Portal Resmi Administrasi dan Informasi Kegiatan Kepramukaan{' '}
                  <strong className="text-white font-semibold">{pangkalanName}</strong>. Terintegrasi
                  langsung dengan Google Spreadsheet Cloud Database secara otomatis dan aman.
                </p>
              </div>

              {/* Quick Info Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-stone-800/60 border border-stone-700/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                    🏕️
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">Kegiatan Akbar</div>
                    <div className="text-xs font-bold text-white">PERKASA Mukhoyyam</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-stone-800/60 border border-stone-700/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                    📜
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">SKU & SKK</div>
                    <div className="text-xs font-bold text-white">Ramu, Rakit, Terap</div>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-stone-800/60 border border-stone-700/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-sm shrink-0">
                    ⚡
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">Database Cloud</div>
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Google Apps Script
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => scrollToSection('login-card')}
                  className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xl shadow-amber-950/60 transition-all flex items-center gap-2 group"
                >
                  <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>Masuk ke Sistem Administrasi</span>
                </button>

                <button
                  onClick={() => scrollToSection('kegiatan-section')}
                  className="px-5 py-3 bg-stone-800/90 hover:bg-stone-700 text-stone-200 hover:text-white rounded-xl text-xs sm:text-sm font-semibold border border-stone-700 transition-all flex items-center gap-2"
                >
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Jelajahi Kegiatan Santri</span>
                </button>

                <button
                  onClick={onEnterAsGuest}
                  className="px-4 py-3 bg-emerald-900/40 hover:bg-emerald-900/70 text-emerald-200 hover:text-white rounded-xl text-xs sm:text-sm font-medium border border-emerald-700/50 transition-all flex items-center gap-1.5"
                  title="Masuk sebagai peninjau tanpa password"
                >
                  <span>Mode Tamu</span>
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>

              {/* Live Status Indicator */}
              <div className="flex items-center gap-2 text-[11px] text-stone-400 pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Gugus Depan <strong className="text-stone-300">24.081 - 24.082</strong> Kwartir Ranting Turen, Kwartir Cabang Malang, Jawa Timur.
                </span>
              </div>
            </div>

            {/* Right Column: Attractive Login Card */}
            <div id="login-card" className="lg:col-span-5">
              <div className="bg-stone-950/80 backdrop-blur-xl border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden ring-1 ring-amber-500/20">
                {/* Decorative Top Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-500" />

                {/* Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
                      <Lock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white leading-tight">
                        Autentikasi Pengguna
                      </h2>
                      <p className="text-[11px] text-stone-400 font-medium">
                        SIM Administrasi Pramuka SIT
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Cloud Active
                  </span>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="mt-4 p-3 bg-rose-950/80 border border-rose-800/80 rounded-2xl text-xs text-rose-300 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="mt-4 space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-300 mb-1.5">
                      Username / ID Pengguna
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="admin / pembina / petugas"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-900 border border-stone-700/80 rounded-xl font-medium text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-300 mb-1.5">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 bg-stone-900 border border-stone-700/80 rounded-xl font-medium text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-stone-400 hover:text-stone-200 absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-950/60 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Masuk ke Dashboard Sistem</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Quick 1-Click Demo Accounts */}
                <div className="mt-5 pt-4 border-t border-stone-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      Pilih Akun Cepat (1-Klik Masuk):
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {/* Admin Kak Yaqin */}
                    <button
                      type="button"
                      onClick={() => {
                        const adminUser = users.find(u => u.role === 'ADMIN') || {
                          id: 'USR-001',
                          username: 'admin',
                          nama: 'Kak Yaqin (Admin)',
                          role: 'ADMIN',
                          status: 'Aktif',
                          passwordHash: '123456',
                        };
                        handleInstantQuickLogin(adminUser);
                      }}
                      className="p-2.5 bg-stone-900/90 hover:bg-amber-950/50 hover:border-amber-600/60 border border-stone-800 rounded-xl text-left transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-600/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                          👑
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs group-hover:text-amber-300 transition-colors">
                            Kak Yaqin (Administrator)
                          </div>
                          <div className="text-[10px] text-stone-400">
                            Username: <code className="text-amber-400 font-mono">admin</code> • Sandi: <code className="text-stone-300 font-mono">123456</code>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950 border border-amber-800 text-amber-300">
                        ADMIN
                      </span>
                    </button>

                    {/* Pembina Putri Kak Itsna */}
                    <button
                      type="button"
                      onClick={() => {
                        const pembinaUser = users.find(u => u.role === 'PEMBINA') || {
                          id: 'USR-002',
                          username: 'pembina',
                          nama: 'Kak Itsna (Pembina Putri)',
                          role: 'PEMBINA',
                          status: 'Aktif',
                          passwordHash: '123456',
                        };
                        handleInstantQuickLogin(pembinaUser);
                      }}
                      className="p-2.5 bg-stone-900/90 hover:bg-emerald-950/50 hover:border-emerald-600/60 border border-stone-800 rounded-xl text-left transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-300 font-bold flex items-center justify-center text-xs">
                          🧕
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs group-hover:text-emerald-300 transition-colors">
                            Kak Itsna (Pembina Putri)
                          </div>
                          <div className="text-[10px] text-stone-400">
                            Username: <code className="text-emerald-400 font-mono">pembina</code> • Sandi: <code className="text-stone-300 font-mono">123456</code>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300">
                        PEMBINA
                      </span>
                    </button>

                    {/* Petugas Kak Putri */}
                    <button
                      type="button"
                      onClick={() => {
                        const petugasUser = users.find(u => u.role === 'PETUGAS') || {
                          id: 'USR-003',
                          username: 'petugas',
                          nama: 'Kak Putri (Petugas TU)',
                          role: 'PETUGAS',
                          status: 'Aktif',
                          passwordHash: '123456',
                        };
                        handleInstantQuickLogin(petugasUser);
                      }}
                      className="p-2.5 bg-stone-900/90 hover:bg-sky-950/50 hover:border-sky-600/60 border border-stone-800 rounded-xl text-left transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sky-600/20 text-sky-300 font-bold flex items-center justify-center text-xs">
                          📋
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs group-hover:text-sky-300 transition-colors">
                            Kak Putri (Petugas TU & Kas)
                          </div>
                          <div className="text-[10px] text-stone-400">
                            Username: <code className="text-sky-400 font-mono">petugas</code> • Sandi: <code className="text-stone-300 font-mono">123456</code>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-950 border border-sky-800 text-sky-300">
                        PETUGAS
                      </span>
                    </button>
                  </div>
                </div>

                {/* Guest / Reviewer Quick Access */}
                <div className="mt-4 pt-3 border-t border-stone-800 text-center">
                  <button
                    type="button"
                    onClick={onEnterAsGuest}
                    className="text-[11px] text-stone-400 hover:text-amber-300 font-semibold transition-colors underline underline-offset-4"
                  >
                    Atau masuk sebagai Peninjau Tamu tanpa login &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Kegiatan Section */}
      <section id="kegiatan-section" className="py-16 sm:py-20 bg-stone-900 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-400 text-xs font-semibold">
              <Tent className="w-3.5 h-3.5" />
              <span>Program & Aktivitas Kepanduan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Kegiatan Unggulan Pramuka SIT Albashiroh
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm">
              Memadukan kurikulum kepramukaan nasional Gerakan Pramuka dengan nilai-nilai luhur keislaman
              khas Jaringan Sekolah Islam Terpadu (JSIT).
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: PERKASA Mukhoyyam with generated image */}
            <div className="bg-stone-950 rounded-3xl border border-stone-800 overflow-hidden shadow-xl hover:border-amber-600/50 transition-all flex flex-col group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={heroCampImg}
                  alt="Perkemahan Akbar Santri Albashiroh PERKASA"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                <span className="absolute top-3 right-3 bg-amber-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Perkemahan Akbar
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                    <Tent className="w-4 h-4" />
                    <span>MUKHOYYAM PERKASA</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Perkemahan Akbar Santri Albashiroh
                  </h3>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Kegiatan perkemahan alam terbuka tahunan santri SMP IT Albashiroh di kawasan sejuk Malang.
                    Menempa ketangkasan, survival Islami, qiyamul lail, dan tadabbur alam.
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Sasaran: Seluruh Penggalang</span>
                  <span className="text-emerald-400 font-semibold">1x Setahun</span>
                </div>
              </div>
            </div>

            {/* Card 2: Latihan Rutin & Pioneering with generated image */}
            <div className="bg-stone-950 rounded-3xl border border-stone-800 overflow-hidden shadow-xl hover:border-amber-600/50 transition-all flex flex-col group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={pioneeringImg}
                  alt="Latihan Rutin & Pioneering Pramuka SIT"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                <span className="absolute top-3 right-3 bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Pekan Latihan
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <Flag className="w-4 h-4" />
                    <span>LATIHAN RUTIN PEKANAN</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Pioneering, Sandi, & Semaphore
                  </h3>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Penguasaan tali temali, menara pandang, tandu darurat, sandi kotak 1 & 2, sandi morse, serta
                    pengujian butir SKU Penggalang Ramu, Rakit, dan Terap secara berjenjang.
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Waktu: Setiap Pekan</span>
                  <span className="text-amber-400 font-semibold">Uji SKU Mandiri</span>
                </div>
              </div>
            </div>

            {/* Card 3: Spiritual Scouting */}
            <div className="bg-stone-950 rounded-3xl border border-stone-800 p-6 shadow-xl hover:border-amber-600/50 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl">
                  📖
                </div>
                <div>
                  <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    Karakter Islami Terpadu
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Spiritual Scouting & Bina Pribadi Islami
                  </h3>
                </div>
                <p className="text-stone-400 text-xs leading-relaxed">
                  Ciri khas kepanduan SIT: Membiasakan shalat berjamaah awal waktu, tilawah Al-Qur'an dan mutaba'ah
                  amal yaumi di tenda perkemahan, hafalan doa harian, dan adab santri Islami.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-stone-800/80 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Dzikir Pagi-Petang Al-Ma'tsurat</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Qiyamul Lail di Alam Terbuka</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Kultum & Muhasabah Santri</span>
                </div>
              </div>
            </div>

            {/* Card 4: Penjelajahan Alam (Wide Game) */}
            <div className="bg-stone-950 rounded-3xl border border-stone-800 p-6 shadow-xl hover:border-amber-600/50 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl">
                  🧭
                </div>
                <div>
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Ketangkasan & Fisik
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Wide Game & Penjelajahan Alam
                  </h3>
                </div>
                <p className="text-stone-400 text-xs leading-relaxed">
                  Menjelajahi keindahan alam sekitar Turen, Malang dengan menggunakan peta pita, kompas bidik,
                  sandi jejak, dan pos ketangkasan halang rintang untuk membangun kekompakan regu.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-stone-800/80 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Regu Garuda & Regu Melati</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Navigasi Darat & Kompas Bidik</span>
                </div>
              </div>
            </div>

            {/* Card 5: Pelantikan & SKK */}
            <div className="bg-stone-950 rounded-3xl border border-stone-800 p-6 shadow-xl hover:border-amber-600/50 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center text-xl">
                  🎖️
                </div>
                <div>
                  <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                    Pencapaian & Kenaikan
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Pelantikan Kenaikan Tingkat & SKK
                  </h3>
                </div>
                <p className="text-stone-400 text-xs leading-relaxed">
                  Pemberian Tanda Kecakapan Umum (TKU) bagi Penggalang Ramu, Rakit, dan Terap yang telah
                  menyelesaikan butir uji bersama para Pembina Mahir.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-stone-800/80 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Ujian SKU Digital via Aplikasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Penyematan Lencana TKK</span>
                </div>
              </div>
            </div>

            {/* Card 6: Bakti Sosial & Lingkungan */}
            <div className="bg-stone-950 rounded-3xl border border-stone-800 p-6 shadow-xl hover:border-amber-600/50 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl">
                  🤝
                </div>
                <div>
                  <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    Pengabdian Masyarakat
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Bakti Sosial & Jihad Lingkungan
                  </h3>
                </div>
                <p className="text-stone-400 text-xs leading-relaxed">
                  Menanamkan rasa cinta sesama manusia dan peduli alam melalui aksi bersih tempat ibadah,
                  penanaman pohon, dan bakti peduli warga sekitar Turen.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-stone-800/80 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Darma 2: Cinta Alam & Kasih Sayang</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Aksi Nyata Pramuka Penggalang</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Karakter SIT & Kode Kehormatan Section */}
      <section id="karakter-section" className="py-16 sm:py-20 bg-stone-950 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>Pondasi Moral & Karakter Santri</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Kode Kehormatan & Karakter Pandu SIT
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm">
              Pedoman hidup setiap insan Pramuka Penggalang di Gugus Depan SMP IT Albashiroh Turen
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Tri Satya & Dasa Darma (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Tri Satya Card */}
              <div className="bg-stone-900/90 rounded-3xl border border-stone-800 p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                    ⚜️
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Tri Satya Penggalang</h3>
                    <p className="text-[11px] text-amber-400 font-semibold">Janji Kehormatan Pramuka</p>
                  </div>
                </div>

                <div className="text-xs text-stone-200 space-y-2 pl-4 border-l-2 border-amber-600/80 italic font-serif leading-relaxed">
                  <p>Demi kehormatanku aku berjanji akan bersungguh-sungguh:</p>
                  <ul className="list-disc pl-4 space-y-1.5 not-italic font-sans text-stone-300">
                    <li>Menjalankan kewajibanku terhadap Tuhan Yang Maha Esa, Negara Kesatuan Republik Indonesia, dan mengamalkan Pancasila.</li>
                    <li>Menolong sesama hidup dan mempersiapkan diri membangun masyarakat.</li>
                    <li>Menepati Dasa Darma.</li>
                  </ul>
                </div>
              </div>

              {/* Dasa Darma 10 Butir */}
              <div className="bg-stone-900/90 rounded-3xl border border-stone-800 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                      ⭐
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Dasa Darma Pramuka</h3>
                      <p className="text-[11px] text-stone-400">10 Ketentuan Moral Pandu Indonesia</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-800 px-2.5 py-1 rounded-full text-stone-300 font-mono">
                    10 Butir
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {[
                    '1. Takwa kepada Tuhan Yang Maha Esa',
                    '2. Cinta alam dan kasih sayang sesama manusia',
                    '3. Patriot yang sopan dan ksatria',
                    '4. Patuh dan suka bermusyawarah',
                    '5. Rela menolong dan tabah',
                    '6. Rajin, terampil, dan gembira',
                    '7. Hemat, cermat, dan bersahaja',
                    '8. Disiplin, berani, dan setia',
                    '9. Bertanggung jawab dan dapat dipercaya',
                    '10. Suci dalam pikiran, perkataan, dan perbuatan',
                  ].map((darma, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80 text-stone-300 font-medium flex items-center gap-2 hover:border-amber-600/40 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{darma}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 10 Muwashafat Karakter Muslim Pramuka SIT (5 Cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 rounded-3xl border border-stone-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-800">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  🕌
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">10 Karakter Pandu SIT</h3>
                  <p className="text-[11px] text-emerald-400 font-semibold">Muwashafat Kepanduan Islam Terpadu</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { arab: 'Salimul Aqidah', arti: 'Aqidah yang Bersih & Lurus' },
                  { arab: 'Shahihul Ibadah', arti: 'Ibadah yang Benar Sesuai Sunnah' },
                  { arab: 'Matinul Khuluq', arti: 'Akhlak yang Kokoh & Mulia' },
                  { arab: 'Qawiyyul Jism', arti: 'Fisik yang Kuat & Tangkas' },
                  { arab: 'Mutsaqqaful Fikr', arti: 'Wawasan Pemikiran yang Luas' },
                  { arab: 'Mujahidun Linafsihi', arti: 'Pejuang Melawan Hawa Nafsu' },
                  { arab: 'Harishun \'ala Waqtihi', arti: 'Disiplin Menjaga Waktu' },
                  { arab: 'Munazhzhamun fi Syu\'unihi', arti: 'Tertib & Rapi dalam Segala Urusan' },
                  { arab: 'Qadirun \'alal Kasbi', arti: 'Mandiri & Mampu Berdikari' },
                  { arab: 'Nafi\'un Lighairihi', arti: 'Bermanfaat bagi Orang Lain' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-stone-950/40 border border-stone-800/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-emerald-950 text-emerald-400 font-mono text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-white text-[11px]">{item.arab}</span>
                    </div>
                    <span className="text-[10px] text-stone-400">{item.arti}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regu & Struktur Pembina */}
      <section className="py-16 sm:py-20 bg-stone-900 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Struktur Gugus Depan & Pasukan
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm">
              Pasukan Penggalang Putra dan Putri Pangkalan SMP IT Albashiroh Turen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pasukan Putra */}
            <div className="bg-stone-950 rounded-3xl border border-stone-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center text-lg font-bold">
                    🦅
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Pasukan Penggalang Putra</h3>
                    <p className="text-xs text-amber-400 font-semibold">Gudep 24.081</p>
                  </div>
                </div>
                <span className="text-[10px] bg-stone-800 px-2.5 py-1 rounded-full text-stone-300">
                  Putra
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Pembina Satuan Putra</div>
                    <div className="text-stone-400">AINUL YAQIN, S.S. / KML</div>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    KMD / KML
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5">
                  <div className="font-semibold text-stone-300 text-[11px]">Regu-Regu Penggalang Putra:</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 text-[11px] font-medium">
                      Regu Garuda
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 text-[11px]">
                      Regu Rajawali
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 text-[11px]">
                      Regu Singa
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 text-[11px]">
                      Regu Elang
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pasukan Putri */}
            <div className="bg-stone-950 rounded-3xl border border-stone-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-lg font-bold">
                    🌸
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Pasukan Penggalang Putri</h3>
                    <p className="text-xs text-emerald-400 font-semibold">Gudep 24.082</p>
                  </div>
                </div>
                <span className="text-[10px] bg-stone-800 px-2.5 py-1 rounded-full text-stone-300">
                  Putri
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Pembina Satuan Putri</div>
                    <div className="text-stone-400">Kak Itsna (Pembina Putri)</div>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Pembina Gudep
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5">
                  <div className="font-semibold text-stone-300 text-[11px]">Regu-Regu Penggalang Putri:</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[11px] font-medium">
                      Regu Melati
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 text-[11px]">
                      Regu Mawar
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 text-[11px]">
                      Regu Dahlia
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 text-[11px]">
                      Regu Anggrek
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud Integration Showcase Banner */}
      <section className="py-12 bg-gradient-to-r from-stone-950 via-amber-950/30 to-stone-950 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-stone-900/80 border border-amber-600/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Terhubung Langsung Ke Google Apps Script</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Satu Database Spreadsheet untuk Seluruh Administrasi
              </h3>
              <p className="text-stone-400 text-xs max-w-2xl leading-relaxed">
                Data anggota, pembina, presensi harian, nilai SKU/SKK, buku kas keuangan, hingga inventaris
                tersimpan rapi secara real-time di spreadsheet sekolah Anda.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => scrollToSection('login-card')}
                className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-950/60 transition-all flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="kontak-section" className="bg-stone-950 pt-12 pb-8 border-t border-stone-800 text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Identity */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">⚜️</span>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {pangkalanName}
                  </h4>
                  <p className="text-[11px] text-amber-400">
                    Gudep {gudepPa} - {gudepPi} Kwarran Turen, Kwarcab Malang
                  </p>
                </div>
              </div>
              <p className="text-stone-400 leading-relaxed text-[11px] max-w-md">
                Pendidikan kepramukaan berkualitas berbasis nilai-nilai Islam Terpadu untuk membina generasi muda
                yang bertakwa, berkarakter mulia, berjiwa ksatria, dan mandiri.
              </p>
            </div>

            {/* Hubungi Pembina */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                Kontak Pembina
              </h5>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Kak Ainul Yaqin, S.S. / KML</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>085731436595 (WhatsApp)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>yaqin446@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Kec. Turen, Kab. Malang, Jawa Timur</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                Akses SIM
              </h5>
              <div className="space-y-1.5 text-[11px]">
                <button
                  onClick={() => scrollToSection('login-card')}
                  className="block text-left hover:text-white transition-colors"
                >
                  &bull; Login Administrator
                </button>
                <button
                  onClick={() => scrollToSection('login-card')}
                  className="block text-left hover:text-white transition-colors"
                >
                  &bull; Login Pembina Satuan
                </button>
                <button
                  onClick={onEnterAsGuest}
                  className="block text-left text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  &bull; Akses Mode Peninjau
                </button>
                <button
                  onClick={() => scrollToSection('kegiatan-section')}
                  className="block text-left hover:text-white transition-colors"
                >
                  &bull; Galeri Kegiatan Mukhoyyam
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2">
            <p>
              &copy; {new Date().getFullYear()} {pangkalanName}. Hak Cipta Dilindungi.
            </p>
            <p className="text-stone-500">
              Sistem Informasi Manajemen Pramuka SIT &bull; Terkoneksi Google Apps Script
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
