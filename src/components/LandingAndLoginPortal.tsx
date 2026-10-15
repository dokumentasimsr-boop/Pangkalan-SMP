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
  MessageSquare,
} from 'lucide-react';
import { AppConfig, User, UserRole, LandingPageContent } from '../types';
import { DEFAULT_GAS_URL } from '../services/gasService';
import { defaultLandingContent, heroCampImg, pioneeringImg, upacaraImg } from '../data/initialLandingData';

interface LandingAndLoginPortalProps {
  config: AppConfig;
  landingContent?: LandingPageContent;
  users: User[];
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onEnterAsGuest: () => void;
  onContinueToDashboard: () => void;
  isSyncingGas?: boolean;
}

export const LandingAndLoginPortal: React.FC<LandingAndLoginPortalProps> = ({
  config,
  landingContent,
  users,
  currentUser,
  onLoginSuccess,
  onEnterAsGuest,
  onContinueToDashboard,
  isSyncingGas = false,
}) => {
  const content = landingContent || defaultLandingContent;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'beranda' | 'kegiatan' | 'karakter' | 'regu' | 'login'>('beranda');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pangkalanName = content.identitas.namaPangkalan || config.namaPangkalan || 'PANGKALAN SMP IT ALBASHIROH TUREN';
  const gudepPa = content.identitas.nomorGudepPutra || config.nomorGudepPutra || config.nomorGudepPa || '24.081';
  const gudepPi = content.identitas.nomorGudepPutri || config.nomorGudepPutri || config.nomorGudepPi || '24.082';
  const heroData = content.identitas.hero;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      const trimmedUser = (username || '').trim().toLowerCase();
      const trimmedPass = (password || '').trim();

      const found = users.find(
        (u) => (u.username || '').toLowerCase() === trimmedUser
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
                {content.identitas.namaSekolah || 'SMP IT ALBASHIROH TUREN'}
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
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'beranda'
                  ? 'text-amber-400 font-bold bg-stone-800/80'
                  : 'hover:text-white hover:bg-stone-800/50'
              }`}
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
              Galeri & Liputan Kegiatan
            </button>
            <button
              onClick={() => {
                setActiveTab('karakter');
                scrollToSection('karakter-section');
              }}
              className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-stone-800/50 transition-colors"
            >
              Kode Kehormatan & Karakter
            </button>
            <button
              onClick={() => {
                setActiveTab('regu');
                scrollToSection('regu-section');
              }}
              className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-stone-800/50 transition-colors"
            >
              Data Regu & Pembina
            </button>
            <button
              onClick={() => scrollToSection('kontak-section')}
              className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-stone-800/50 transition-colors"
            >
              Kontak Gudep
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
                <span>{heroData.tagline || 'Satuan Komunitas Pramuka Sekolah Islam Terpadu (SIT)'}</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  {heroData.title.split('&').length > 1 ? (
                    <>
                      {heroData.title.split('&')[0]} &{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                        {heroData.title.split('&')[1]}
                      </span>
                    </>
                  ) : (
                    heroData.title
                  )}
                </h1>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                  {heroData.description}
                </p>
              </div>

              {/* Quick Info Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-stone-800/60 border border-stone-700/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                    🏕️
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">
                      {heroData.badgeAkbarSub || 'Kegiatan Akbar'}
                    </div>
                    <div className="text-xs font-bold text-white">
                      {heroData.badgeAkbarTitle || 'PERKASA Mukhoyyam'}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-stone-800/60 border border-stone-700/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                    📜
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">
                      {heroData.badgeSkuSub || 'SKU & SKK'}
                    </div>
                    <div className="text-xs font-bold text-white">
                      {heroData.badgeSkuTitle || 'Ramu, Rakit, Terap'}
                    </div>
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
                  Gugus Depan <strong className="text-stone-300">{gudepPa} - {gudepPi}</strong> Kwartir Ranting {content.identitas.kwarran || 'Turen'}, Kwartir Cabang {content.identitas.kwarcab || 'Malang'}, {content.identitas.kwarda || 'Jawa Timur'}.
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
                        onChange={(e) => setUsername(e.target.value)}
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
                        onChange={(e) => setPassword(e.target.value)}
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
                        const adminUser = users.find((u) => u.role === 'ADMIN') || {
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
                        const pembinaUser = users.find((u) => u.role === 'PEMBINA') || {
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
                        const petugasUser = users.find((u) => u.role === 'PETUGAS') || {
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

                {/* Guest Access */}
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
              Galeri & Liputan Kegiatan Pramuka SIT Albashiroh
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm">
              Memadukan kurikulum kepramukaan nasional Gerakan Pramuka dengan nilai-nilai luhur keislaman
              khas Jaringan Sekolah Islam Terpadu (JSIT).
            </p>
          </div>

          {/* Cards Grid Dynamically Rendered */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.galeriKegiatan.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-stone-950 rounded-3xl border border-stone-800 overflow-hidden shadow-xl hover:border-amber-600/50 transition-all flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden bg-stone-900">
                  <img
                    src={item.imageUrl || heroCampImg}
                    alt={item.namaKegiatan}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                  <span className="absolute top-3 right-3 bg-amber-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                    {item.kategori}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <Tent className="w-4 h-4" />
                      <span>{item.judul}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {item.namaKegiatan}
                    </h3>
                    <p className="text-stone-400 text-xs leading-relaxed">
                      {item.deskripsi}
                    </p>

                    {item.poinHighlights && item.poinHighlights.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        {item.poinHighlights.map((point, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2 text-xs text-stone-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                    <span>Sasaran: <strong className="text-stone-300">{item.sasaran}</strong></span>
                    <span className="text-emerald-400 font-semibold">{item.frekuensi}</span>
                  </div>
                </div>
              </div>
            ))}
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
              Pedoman hidup setiap insan Pramuka Penggalang di Gugus Depan {pangkalanName}
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
                    <h3 className="text-base font-bold text-white">
                      {content.kodeKehormatan.triSatyaTitle || 'Tri Satya Penggalang'}
                    </h3>
                    <p className="text-[11px] text-amber-400 font-semibold">Janji Kehormatan Pramuka</p>
                  </div>
                </div>

                <div className="text-xs text-stone-200 space-y-2 pl-4 border-l-2 border-amber-600/80 italic font-serif leading-relaxed">
                  <p>{content.kodeKehormatan.triSatyaIntro || 'Demi kehormatanku aku berjanji akan bersungguh-sungguh:'}</p>
                  <ul className="list-disc pl-4 space-y-1.5 not-italic font-sans text-stone-300">
                    {content.kodeKehormatan.triSatyaPoin.map((poin, idx) => (
                      <li key={idx}>{poin}</li>
                    ))}
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
                      <h3 className="text-base font-bold text-white">
                        {content.kodeKehormatan.dasaDarmaTitle || 'Dasa Darma Pramuka'}
                      </h3>
                      <p className="text-[11px] text-stone-400">10 Ketentuan Moral Pandu Indonesia</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-800 px-2.5 py-1 rounded-full text-stone-300 font-mono">
                    {content.kodeKehormatan.dasaDarmaItems.length} Butir
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {content.kodeKehormatan.dasaDarmaItems.map((darma, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80 text-stone-300 font-medium flex items-center gap-2 hover:border-amber-600/40 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{idx + 1}. {darma.replace(/^\d+\.\s*/, '')}</span>
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
                  <h3 className="text-base font-bold text-white">
                    {content.kodeKehormatan.karakterSITTitle || '10 Karakter Pandu SIT'}
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-semibold">Muwashafat Kepanduan Islam Terpadu</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {content.kodeKehormatan.karakterSITItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-2.5 rounded-xl bg-stone-950/50 border border-stone-800/60 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-emerald-950 text-emerald-400 font-mono text-[10px] flex items-center justify-center font-bold shrink-0">
                        {item.nomor || idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white text-[11px]">{item.istilahArab}</div>
                        {item.keterangan && (
                          <div className="text-[10px] text-stone-400 line-clamp-1">{item.keterangan}</div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold shrink-0 text-right">
                      {item.arti}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regu & Struktur Pembina */}
      <section id="regu-section" className="py-16 sm:py-20 bg-stone-900 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-400 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Pasukan & Struktur Pasukan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Data Regu Penggalang & Pembina
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm">
              Keluarga besar Pasukan Penggalang Putra ({gudepPa}) dan Putri ({gudepPi})
            </p>
          </div>

          {/* Regu Putra & Putri Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pasukan Putra */}
            <div className="bg-stone-950 rounded-3xl border border-stone-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center text-lg font-bold">
                    🦅
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {content.reguDanPembina.namaPasukanPutra || 'Pasukan Penggalang Putra'}
                    </h3>
                    <p className="text-xs text-amber-400 font-semibold">Gudep {content.reguDanPembina.noGudepPutra || gudepPa}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-stone-800 px-2.5 py-1 rounded-full text-stone-300">
                  {content.reguDanPembina.reguPutra.length} Regu Putra
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {content.reguDanPembina.reguPutra.map((regu, rIdx) => (
                  <div
                    key={regu.id || rIdx}
                    className="p-3 rounded-2xl bg-stone-900 border border-stone-800/80 flex items-center gap-3 hover:border-amber-600/40 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center text-base overflow-hidden shrink-0">
                      {regu.lambangUrl ? (
                        <img src={regu.lambangUrl} alt={regu.nama} className="w-full h-full object-cover" />
                      ) : (
                        <span>{regu.iconEmoji || '🦅'}</span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-white text-xs truncate">{regu.nama}</div>
                      <div className="text-[10px] text-amber-400 italic truncate">
                        "{regu.semboyan || 'Semboyan Regu'}"
                      </div>
                      {regu.pinru && (
                        <div className="text-[10px] text-stone-400 mt-0.5 truncate">
                          Pinru: {regu.pinru}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                    <h3 className="text-base font-bold text-white">
                      {content.reguDanPembina.namaPasukanPutri || 'Pasukan Penggalang Putri'}
                    </h3>
                    <p className="text-xs text-emerald-400 font-semibold">Gudep {content.reguDanPembina.noGudepPutri || gudepPi}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-stone-800 px-2.5 py-1 rounded-full text-stone-300">
                  {content.reguDanPembina.reguPutri.length} Regu Putri
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {content.reguDanPembina.reguPutri.map((regu, rIdx) => (
                  <div
                    key={regu.id || rIdx}
                    className="p-3 rounded-2xl bg-stone-900 border border-stone-800/80 flex items-center gap-3 hover:border-emerald-600/40 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center text-base overflow-hidden shrink-0">
                      {regu.lambangUrl ? (
                        <img src={regu.lambangUrl} alt={regu.nama} className="w-full h-full object-cover" />
                      ) : (
                        <span>{regu.iconEmoji || '🌸'}</span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-white text-xs truncate">{regu.nama}</div>
                      <div className="text-[10px] text-emerald-400 italic truncate">
                        "{regu.semboyan || 'Semboyan Regu'}"
                      </div>
                      {regu.pinru && (
                        <div className="text-[10px] text-stone-400 mt-0.5 truncate">
                          Pinru: {regu.pinru}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profil Pembina & Pelatih */}
          <div className="space-y-4 pt-4">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <h3 className="text-lg font-bold text-white">Pembina & Pelatih Satuan Mahir</h3>
              <p className="text-xs text-stone-400">Membimbing santri dengan keteladanan dan keikhlasan bakti</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {content.reguDanPembina.pembinaList.map((pem, idx) => (
                <div
                  key={pem.id || idx}
                  className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-3 relative group hover:border-amber-600/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-stone-700 bg-stone-900 shrink-0">
                        {pem.fotoUrl ? (
                          <img src={pem.fotoUrl} alt={pem.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-500 font-bold text-lg">
                            👤
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{pem.nama}</h4>
                        <div className="text-xs text-amber-400 font-semibold">{pem.jabatan}</div>
                        <div className="text-[10px] text-stone-400">{pem.gelar}</div>
                      </div>
                    </div>

                    {pem.pesanMotivasi && (
                      <p className="text-xs text-stone-300 italic p-3 rounded-2xl bg-stone-900/80 border border-stone-800/80 leading-relaxed font-serif">
                        "{pem.pesanMotivasi}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{pem.kontak || '-'}</span>
                    </div>
                    <span className="text-[10px] text-stone-500">Pramuka SIT</span>
                  </div>
                </div>
              ))}
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
                tersimpan rapi secara real-time di spreadsheet pangkalan Anda.
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
                    Gudep {gudepPa} - {gudepPi} Kwarran {content.identitas.kwarran || 'Turen'}, Kwarcab {content.identitas.kwarcab || 'Malang'}
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
                  <span>
                    {content.reguDanPembina.pembinaList[0]?.nama || 'Kak Ainul Yaqin, S.S. / KML'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{content.identitas.telepon || '085731436595 (WhatsApp)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{content.identitas.email || 'yaqin446@gmail.com'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{content.identitas.alamat || 'Kec. Turen, Kab. Malang, Jawa Timur'}</span>
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
