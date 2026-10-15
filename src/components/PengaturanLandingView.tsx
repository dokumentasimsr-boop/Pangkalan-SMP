import React, { useState, useRef } from 'react';
import {
  Globe,
  Save,
  RotateCcw,
  Eye,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Award,
  Tent,
  Users,
  Building,
  Flag,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Compass,
  Heart,
  Phone,
  Mail,
  X,
  Layers,
  Star,
} from 'lucide-react';
import {
  LandingPageContent,
  LandingKegiatanItem,
  LandingKarakterItem,
  LandingReguItem,
  LandingPembinaItem,
  UserRole,
} from '../types';
import { useToast } from './Toast';
import {
  defaultLandingContent,
  heroCampImg,
  pioneeringImg,
  upacaraImg,
} from '../data/initialLandingData';

interface PengaturanLandingViewProps {
  content: LandingPageContent;
  onSaveContent: (updated: LandingPageContent) => void;
  currentUserRole: UserRole;
  onPreviewLanding: () => void;
  onAddLog?: (modul: string, act: string, id: string, note: string) => void;
}

export const PengaturanLandingView: React.FC<PengaturanLandingViewProps> = ({
  content,
  onSaveContent,
  currentUserRole,
  onPreviewLanding,
  onAddLog,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<LandingPageContent>(content);
  const [activeSubTab, setActiveSubTab] = useState<'identitas' | 'galeri' | 'karakter' | 'regu-pembina'>('identitas');

  // Modal States for Add/Edit
  const [isKegiatanModalOpen, setIsKegiatanModalOpen] = useState(false);
  const [editingKegiatan, setEditingKegiatan] = useState<LandingKegiatanItem | null>(null);

  const [isKarakterModalOpen, setIsKarakterModalOpen] = useState(false);
  const [editingKarakter, setEditingKarakter] = useState<LandingKarakterItem | null>(null);

  const [isReguModalOpen, setIsReguModalOpen] = useState(false);
  const [editingRegu, setEditingRegu] = useState<LandingReguItem | null>(null);
  const [reguGenderTarget, setReguGenderTarget] = useState<'Pa' | 'Pi'>('Pa');

  const [isPembinaModalOpen, setIsPembinaModalOpen] = useState(false);
  const [editingPembina, setEditingPembina] = useState<LandingPembinaItem | null>(null);

  // Hidden File input ref for uploading custom images
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileTargetCallback, setFileTargetCallback] = useState<((dataUrl: string) => void) | null>(null);

  const handleTriggerUpload = (onLoaded: (dataUrl: string) => void) => {
    setFileTargetCallback(() => onLoaded);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar (JPG, PNG, WebP).', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal 5MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && fileTargetCallback) {
        fileTargetCallback(dataUrl);
        showToast('Gambar berhasil diunggah!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = () => {
    onSaveContent(formData);
    if (onAddLog) {
      onAddLog('LandingPage', 'Update Pengaturan Landing', 'LANDING', 'Memperbarui konten landing page');
    }
    showToast('Seluruh perubahan halaman Landing Page berhasil disimpan!', 'success');
  };

  const handleResetToDefault = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan seluruh konten Landing Page ke pengaturan standar SMP IT Albashiroh?')) {
      setFormData(defaultLandingContent);
      onSaveContent(defaultLandingContent);
      showToast('Konten Landing Page berhasil di-reset ke standar Albashiroh.', 'info');
    }
  };

  // Preset photos library for fast picking
  const presetPhotos = [
    { label: 'Perkemahan Mukhoyyam Pine Forest', url: heroCampImg, tag: 'Berkemah' },
    { label: 'Pioneering & Menara Isyarat', url: pioneeringImg, tag: 'Pioneering' },
    { label: 'Upacara Disiplin Pramuka SIT', url: upacaraImg, tag: 'Upacara' },
    { label: 'Tilawah & Ibadah Alam Terbuka', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80', tag: 'Spiritual' },
    { label: 'Penjelajahan Alam Turen', url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80', tag: 'Penjelajahan' },
    { label: 'Aksi Bakti Sosial Santri', url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80', tag: 'Bakti Sosial' },
  ];

  return (
    <div className="space-y-6">
      {/* Hidden Global File Input for Images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Header Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-500/30 text-white flex items-center justify-center text-2xl shadow-lg shadow-amber-950/40">
              🌐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  MANAJEMEN KONTEN PUBLIK
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-800/60">
                  Live Preview Ready
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Pengaturan Halaman Landing & Portal Pramuka SIT
              </h1>
              <p className="text-stone-400 text-xs sm:text-sm mt-0.5">
                Kelola identitas pangkalan, foto galeri liputan kegiatan, kode kehormatan, hingga data regu & pembina.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onPreviewLanding}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-xl text-xs font-bold border border-stone-700 transition-all flex items-center gap-2 shadow-sm"
              title="Buka tampilan landing page seperti yang dilihat santri dan wali murid"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Lihat Halaman Landing</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3.5 py-2.5 bg-stone-800/80 hover:bg-rose-950/50 hover:border-rose-700/60 text-stone-300 hover:text-rose-300 rounded-xl text-xs font-semibold border border-stone-700/80 transition-all flex items-center gap-1.5"
              title="Reset seluruh teks dan gambar ke format awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Default</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-950/40 border border-amber-500/40 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-stone-800/80 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveSubTab('identitas')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeSubTab === 'identitas'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Identitas Pangkalan & Hero</span>
          </button>

          <button
            onClick={() => setActiveSubTab('galeri')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeSubTab === 'galeri'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Galeri & Liputan Kegiatan ({formData.galeriKegiatan.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('karakter')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeSubTab === 'karakter'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Kode Kehormatan & Karakter SIT</span>
          </button>

          <button
            onClick={() => setActiveSubTab('regu-pembina')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeSubTab === 'regu-pembina'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Regu & Pembina</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: IDENTITAS PANGKALAN & HERO */}
      {activeSubTab === 'identitas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Form (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Pangkalan Info Card */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-800">
                <div className="w-9 h-9 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                  🏛️
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Identitas Resmi Gugus Depan</h2>
                  <p className="text-xs text-stone-400">Informasi nama pangkalan, nomor gudep, dan lokasi wilayah</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-300 mb-1.5">
                    Nama Pangkalan Resmi
                  </label>
                  <input
                    type="text"
                    value={formData.identitas.namaPangkalan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        identitas: { ...formData.identitas, namaPangkalan: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    placeholder="Contoh: PANGKALAN SMP IT ALBASHIROH TUREN"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1.5">
                    Nama Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.identitas.namaSekolah}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        identitas: { ...formData.identitas, namaSekolah: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    placeholder="SMP IT ALBASHIROH TUREN"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-stone-300 mb-1.5">
                      No Gudep Putra
                    </label>
                    <input
                      type="text"
                      value={formData.identitas.nomorGudepPutra}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identitas: { ...formData.identitas, nomorGudepPutra: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono text-center font-bold text-amber-400"
                      placeholder="24.081"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-300 mb-1.5">
                      No Gudep Putri
                    </label>
                    <input
                      type="text"
                      value={formData.identitas.nomorGudepPutri}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identitas: { ...formData.identitas, nomorGudepPutri: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono text-center font-bold text-emerald-400"
                      placeholder="24.082"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1.5">
                    Kwartir Ranting (Kwarran)
                  </label>
                  <input
                    type="text"
                    value={formData.identitas.kwarran}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        identitas: { ...formData.identitas, kwarran: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                    placeholder="Turen"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1.5">
                    Kwartir Cabang (Kwarcab) & Kwarda
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.identitas.kwarcab}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identitas: { ...formData.identitas, kwarcab: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                      placeholder="Malang"
                    />
                    <input
                      type="text"
                      value={formData.identitas.kwarda}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identitas: { ...formData.identitas, kwarda: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                      placeholder="Jawa Timur"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-300 mb-1.5">
                    Alamat Lengkap Pangkalan / Sanggar
                  </label>
                  <input
                    type="text"
                    value={formData.identitas.alamat}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        identitas: { ...formData.identitas, alamat: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                    placeholder="Jl. Raya Turen No. 45, Sedayu, Kec. Turen, Kab. Malang, Jawa Timur"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1.5">
                    Kontak WhatsApp / Telepon Pembina
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.identitas.telepon}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identitas: { ...formData.identitas, telepon: e.target.value },
                        })
                      }
                      className="w-full pl-9 pr-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                      placeholder="085731436595"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1.5">
                    Email Resmi
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={formData.identitas.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identitas: { ...formData.identitas, email: e.target.value },
                        })
                      }
                      className="w-full pl-9 pr-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                      placeholder="yaqin446@gmail.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Section Content & Headline */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-800">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✨
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Slogan & Konten Hero Banner</h2>
                  <p className="text-xs text-stone-400">Kalimat penyemangat, visi, dan sambutan yang memikat pengunjung</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1.5">
                    Pita Tagline Atas (Badge Sako SIT)
                  </label>
                  <input
                    type="text"
                    value={formData.identitas.hero.tagline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        identitas: {
                          ...formData.identitas,
                          hero: { ...formData.identitas.hero, tagline: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                    placeholder="Satuan Komunitas Pramuka Sekolah Islam Terpadu (SIT)"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1.5">
                    Judul Utama Hero (Headline)
                  </label>
                  <input
                    type="text"
                    value={formData.identitas.hero.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        identitas: {
                          ...formData.identitas,
                          hero: { ...formData.identitas.hero, title: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-bold text-sm"
                    placeholder="Mencetak Pandu Penggalang Tangguh, Mandiri & Berakhlak Qur'ani"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1.5">
                    Deskripsi Ringkas / Kata Sambutan Portal
                  </label>
                  <textarea
                    rows={3}
                    value={formData.identitas.hero.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        identitas: {
                          ...formData.identitas,
                          hero: { ...formData.identitas.hero, description: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium leading-relaxed"
                    placeholder="Selamat datang di Portal Resmi Administrasi dan Informasi Kegiatan Kepramukaan..."
                  />
                </div>

                {/* Badges on Hero */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
                    <span className="font-semibold text-amber-400 text-[11px] block">
                      Badge 1: Kegiatan Akbar
                    </span>
                    <input
                      type="text"
                      value={formData.identitas.hero.badgeAkbarTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identitas: {
                            ...formData.identitas,
                            hero: { ...formData.identitas.hero, badgeAkbarTitle: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-white font-medium"
                      placeholder="PERKASA Mukhoyyam"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
                    <span className="font-semibold text-emerald-400 text-[11px] block">
                      Badge 2: Kurikulum SKU
                    </span>
                    <input
                      type="text"
                      value={formData.identitas.hero.badgeSkuTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identitas: {
                            ...formData.identitas,
                            hero: { ...formData.identitas.hero, badgeSkuTitle: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-white font-medium"
                      placeholder="Ramu, Rakit, Terap"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Column: Gambar Hero & Preset Visual (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-stone-800">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Gambar Banner Utama (Hero)</h3>
              </div>

              {/* Current Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-700 h-44 bg-stone-950 group">
                {formData.identitas.hero.heroImageUrl ? (
                  <img
                    src={formData.identitas.hero.heroImageUrl}
                    alt="Preview Hero Banner"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-500 text-xs">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span>Belum ada gambar</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-[10px] font-bold text-amber-300 bg-stone-900/90 px-2 py-0.5 rounded-md border border-stone-700">
                    Banner Aktif
                  </span>
                </div>
              </div>

              {/* Upload or Link Input */}
              <div className="space-y-2 text-xs">
                <label className="block font-semibold text-stone-300">
                  URL Gambar Banner
                </label>
                <input
                  type="text"
                  value={formData.identitas.hero.heroImageUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      identitas: {
                        ...formData.identitas,
                        hero: { ...formData.identitas.hero, heroImageUrl: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono text-[11px]"
                  placeholder="https://... atau tempel URL gambar"
                />

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleTriggerUpload((dataUrl) => {
                        setFormData({
                          ...formData,
                          identitas: {
                            ...formData.identitas,
                            hero: { ...formData.identitas.hero, heroImageUrl: dataUrl },
                          },
                        });
                      })
                    }
                    className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-xl font-semibold border border-stone-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Foto Lokal</span>
                  </button>
                </div>
              </div>

              {/* Preset Visuals Quick Select */}
              <div className="pt-3 border-t border-stone-800 space-y-2.5">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Pilih Preset Foto Pramuka:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {presetPhotos.slice(0, 4).map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          identitas: {
                            ...formData.identitas,
                            hero: { ...formData.identitas.hero, heroImageUrl: p.url },
                          },
                        })
                      }
                      className="group text-left p-1.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/60 transition-all"
                    >
                      <div className="h-16 rounded-lg overflow-hidden mb-1 relative">
                        <img
                          src={p.url}
                          alt={p.label}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <span className="absolute bottom-1 right-1 bg-stone-900/90 text-[9px] font-bold text-amber-400 px-1 py-0.2 rounded">
                          {p.tag}
                        </span>
                      </div>
                      <div className="text-[10px] font-medium text-stone-300 truncate">
                        {p.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GALERI & LIPUTAN KEGIATAN */}
      {activeSubTab === 'galeri' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  GALERI & LIPUTAN
                </span>
                <span className="text-[10px] bg-amber-950 text-amber-400 font-semibold px-2 py-0.5 rounded-full border border-amber-800/60">
                  {formData.galeriKegiatan.length} Kegiatan Terpasang
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                Kelola Kartu Liputan Kegiatan Kepramukaan
              </h2>
              <p className="text-stone-400 text-xs mt-0.5">
                Tambahkan foto kegiatan, nama liputan, sasaran, jadwal, dan uraian seru kegiatan santri.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingKegiatan({
                  id: `KEG-${Date.now().toString().slice(-4)}`,
                  judul: 'KEGIATAN BARU',
                  kategori: 'Kegiatan Kepanduan',
                  namaKegiatan: 'Nama Liputan Kegiatan',
                  deskripsi: 'Deskripsi lengkap kegiatan santri...',
                  imageUrl: heroCampImg,
                  sasaran: 'Seluruh Penggalang',
                  frekuensi: '1x Setahun',
                  tagWarna: 'amber',
                  poinHighlights: ['Poin Utama 1', 'Poin Utama 2'],
                });
                setIsKegiatanModalOpen(true);
              }}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-950/40 transition-all flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Liputan Baru</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formData.galeriKegiatan.map((item, index) => (
              <div
                key={item.id || index}
                className="bg-stone-950 rounded-3xl border border-stone-800 overflow-hidden shadow-xl hover:border-stone-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image with action overlays */}
                  <div className="relative h-48 overflow-hidden bg-stone-900">
                    <img
                      src={item.imageUrl || heroCampImg}
                      alt={item.namaKegiatan}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-stone-900/90 text-amber-400 border border-stone-700 uppercase tracking-wider">
                        {item.kategori}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingKegiatan({ ...item });
                          setIsKegiatanModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-stone-900/90 hover:bg-amber-600 text-stone-200 hover:text-white transition-colors"
                        title="Edit Liputan Kegiatan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Hapus liputan kegiatan "${item.namaKegiatan}"?`)) {
                            const filtered = formData.galeriKegiatan.filter((k) => k.id !== item.id);
                            setFormData({ ...formData, galeriKegiatan: filtered });
                            showToast('Liputan kegiatan berhasil dihapus.', 'info');
                          }
                        }}
                        className="p-1.5 rounded-lg bg-stone-900/90 hover:bg-rose-600 text-stone-200 hover:text-white transition-colors"
                        title="Hapus Liputan Kegiatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2.5">
                    <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      {item.judul}
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {item.namaKegiatan}
                    </h3>
                    <p className="text-stone-400 text-xs leading-relaxed line-clamp-3">
                      {item.deskripsi}
                    </p>

                    {item.poinHighlights && item.poinHighlights.length > 0 && (
                      <div className="space-y-1 pt-2">
                        {item.poinHighlights.slice(0, 3).map((p, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2 text-[11px] text-stone-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="p-4 bg-stone-900/60 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Sasaran: <strong className="text-stone-300 font-semibold">{item.sasaran}</strong></span>
                  <span className="text-amber-400 font-bold">{item.frekuensi}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: KODE KEHORMATAN & KARAKTER PRAMUKA SIT */}
      {activeSubTab === 'karakter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tri Satya & Dasa Darma (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tri Satya */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                    ⚜️
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Tri Satya Penggalang</h3>
                    <p className="text-xs text-stone-400">Janji Kehormatan Pandu</p>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-800">
                  3 Butir
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Judul Janji
                  </label>
                  <input
                    type="text"
                    value={formData.kodeKehormatan.triSatyaTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kodeKehormatan: {
                          ...formData.kodeKehormatan,
                          triSatyaTitle: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Kalimat Pengantar Janji
                  </label>
                  <input
                    type="text"
                    value={formData.kodeKehormatan.triSatyaIntro}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kodeKehormatan: {
                          ...formData.kodeKehormatan,
                          triSatyaIntro: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium italic"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="block font-semibold text-stone-300">
                    Isi 3 Butir Tri Satya:
                  </label>
                  {formData.kodeKehormatan.triSatyaPoin.map((poin, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-lg bg-stone-800 text-amber-400 flex items-center justify-center font-bold shrink-0 text-xs mt-1">
                        {pIdx + 1}
                      </span>
                      <textarea
                        rows={2}
                        value={poin}
                        onChange={(e) => {
                          const updated = [...formData.kodeKehormatan.triSatyaPoin];
                          updated[pIdx] = e.target.value;
                          setFormData({
                            ...formData,
                            kodeKehormatan: {
                              ...formData.kodeKehormatan,
                              triSatyaPoin: updated,
                            },
                          });
                        }}
                        className="w-full px-3 py-1.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dasa Darma (10 Butir) */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                    ⭐
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Dasa Darma Pramuka</h3>
                    <p className="text-xs text-stone-400">10 Ketentuan Moral Pandu Indonesia</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800">
                  10 Butir
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {formData.kodeKehormatan.dasaDarmaItems.map((darma, dIdx) => (
                  <div key={dIdx} className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 font-mono flex items-center justify-center font-bold shrink-0 text-xs">
                      {dIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={darma}
                      onChange={(e) => {
                        const updated = [...formData.kodeKehormatan.dasaDarmaItems];
                        updated[dIdx] = e.target.value;
                        setFormData({
                          ...formData,
                          kodeKehormatan: {
                            ...formData.kodeKehormatan,
                            dasaDarmaItems: updated,
                          },
                        });
                      }}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 10 Karakter Muwashafat SIT (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/30 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    🕌
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">10 Karakter Pandu SIT</h3>
                    <p className="text-xs text-emerald-400 font-medium">Muwashafat Kepanduan Islam Terpadu</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingKarakter({
                      id: `K-${Date.now().toString().slice(-4)}`,
                      nomor: formData.kodeKehormatan.karakterSITItems.length + 1,
                      istilahArab: 'Karakter Baru',
                      arti: 'Arti Karakter Mulia',
                      keterangan: 'Penjelasan implementasi dalam kegiatan kepanduan...',
                    });
                    setIsKarakterModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                  title="Tambah Karakter Baru"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                {formData.kodeKehormatan.karakterSITItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-1.5 hover:border-amber-600/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-400 font-mono text-[10px] flex items-center justify-center font-bold">
                          {item.nomor || idx + 1}
                        </span>
                        <span className="font-bold text-white text-xs">{item.istilahArab}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingKarakter({ ...item });
                            setIsKarakterModalOpen(true);
                          }}
                          className="p-1 text-stone-400 hover:text-amber-400"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Hapus karakter "${item.istilahArab}"?`)) {
                              const updated = formData.kodeKehormatan.karakterSITItems.filter((k) => k.id !== item.id);
                              setFormData({
                                ...formData,
                                kodeKehormatan: {
                                  ...formData.kodeKehormatan,
                                  karakterSITItems: updated,
                                },
                              });
                            }
                          }}
                          className="p-1 text-stone-400 hover:text-rose-400"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] font-semibold text-emerald-400">
                      {item.arti}
                    </div>
                    {item.keterangan && (
                      <div className="text-[10px] text-stone-400 leading-normal">
                        {item.keterangan}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Reset to 10 JSIT Default */}
              <div className="pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      kodeKehormatan: {
                        ...formData.kodeKehormatan,
                        karakterSITItems: defaultLandingContent.kodeKehormatan.karakterSITItems,
                      },
                    });
                    showToast('10 Karakter Muwashafat JSIT dikembalikan ke standar resmi.', 'info');
                  }}
                  className="w-full py-2 bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-white rounded-xl text-xs font-semibold border border-stone-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke 10 Standar Muwashafat JSIT</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DATA REGU & PEMBINA */}
      {activeSubTab === 'regu-pembina' && (
        <div className="space-y-6">
          {/* Regu Penggalang Putra & Putri Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pasukan Putra */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center text-xl font-bold">
                    🦅
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Pasukan Penggalang Putra</h3>
                    <p className="text-xs text-amber-400 font-semibold">Gudep {formData.reguDanPembina.noGudepPutra || '24.081'}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setReguGenderTarget('Pa');
                    setEditingRegu({
                      id: `RP-${Date.now().toString().slice(-4)}`,
                      nama: 'Regu Baru Putra',
                      gender: 'Pa',
                      semboyan: 'Semboyan Regu Putra...',
                      pinru: 'Nama Pinru',
                      jumlahAnggota: 8,
                      iconEmoji: '🦅',
                      lambangUrl: '',
                    });
                    setIsReguModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Regu</span>
                </button>
              </div>

              {/* List Regu Putra */}
              <div className="space-y-2.5">
                {formData.reguDanPembina.reguPutra.map((regu, rIdx) => (
                  <div
                    key={regu.id || rIdx}
                    className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between group hover:border-amber-600/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-center text-lg overflow-hidden shrink-0">
                        {regu.lambangUrl ? (
                          <img src={regu.lambangUrl} alt={regu.nama} className="w-full h-full object-cover" />
                        ) : (
                          <span>{regu.iconEmoji || '🦅'}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span>{regu.nama}</span>
                          <span className="text-[10px] text-stone-400 font-normal">({regu.jumlahAnggota || 8} Anggota)</span>
                        </div>
                        <div className="text-[11px] text-stone-400 italic">
                          "{regu.semboyan || 'Semboyan Regu'}"
                        </div>
                        {regu.pinru && (
                          <div className="text-[10px] text-amber-400 font-medium mt-0.5">
                            Pinru: {regu.pinru}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          setReguGenderTarget('Pa');
                          setEditingRegu({ ...regu });
                          setIsReguModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-stone-900 hover:bg-amber-600 text-stone-300 hover:text-white transition-colors"
                        title="Edit Regu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Hapus regu "${regu.nama}"?`)) {
                            const updated = formData.reguDanPembina.reguPutra.filter((r) => r.id !== regu.id);
                            setFormData({
                              ...formData,
                              reguDanPembina: { ...formData.reguDanPembina, reguPutra: updated },
                            });
                          }
                        }}
                        className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-600 text-stone-300 hover:text-white transition-colors"
                        title="Hapus Regu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pasukan Putri */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-xl font-bold">
                    🌸
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Pasukan Penggalang Putri</h3>
                    <p className="text-xs text-emerald-400 font-semibold">Gudep {formData.reguDanPembina.noGudepPutri || '24.082'}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setReguGenderTarget('Pi');
                    setEditingRegu({
                      id: `RPI-${Date.now().toString().slice(-4)}`,
                      nama: 'Regu Baru Putri',
                      gender: 'Pi',
                      semboyan: 'Semboyan Regu Putri...',
                      pinru: 'Nama Pinru Putri',
                      jumlahAnggota: 8,
                      iconEmoji: '🌸',
                      lambangUrl: '',
                    });
                    setIsReguModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Regu</span>
                </button>
              </div>

              {/* List Regu Putri */}
              <div className="space-y-2.5">
                {formData.reguDanPembina.reguPutri.map((regu, rIdx) => (
                  <div
                    key={regu.id || rIdx}
                    className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between group hover:border-emerald-600/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-center text-lg overflow-hidden shrink-0">
                        {regu.lambangUrl ? (
                          <img src={regu.lambangUrl} alt={regu.nama} className="w-full h-full object-cover" />
                        ) : (
                          <span>{regu.iconEmoji || '🌸'}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span>{regu.nama}</span>
                          <span className="text-[10px] text-stone-400 font-normal">({regu.jumlahAnggota || 8} Anggota)</span>
                        </div>
                        <div className="text-[11px] text-stone-400 italic">
                          "{regu.semboyan || 'Semboyan Regu'}"
                        </div>
                        {regu.pinru && (
                          <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                            Pinru: {regu.pinru}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          setReguGenderTarget('Pi');
                          setEditingRegu({ ...regu });
                          setIsReguModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-stone-900 hover:bg-emerald-600 text-stone-300 hover:text-white transition-colors"
                        title="Edit Regu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Hapus regu "${regu.nama}"?`)) {
                            const updated = formData.reguDanPembina.reguPutri.filter((r) => r.id !== regu.id);
                            setFormData({
                              ...formData,
                              reguDanPembina: { ...formData.reguDanPembina, reguPutri: updated },
                            });
                          }
                        }}
                        className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-600 text-stone-300 hover:text-white transition-colors"
                        title="Hapus Regu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profil Pembina & Pelatih Gudep */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center text-xl font-bold">
                  🎖️
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Profil Pembina & Pelatih Pangkalan</h3>
                  <p className="text-xs text-stone-400">Ditampilkan pada halaman profil publik & kontak kepanduan</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingPembina({
                    id: `PEM-L${Date.now().toString().slice(-4)}`,
                    nama: 'Nama Pembina',
                    gelar: 'KMD / KML',
                    jabatan: 'Pembina Satuan',
                    gender: 'Pa',
                    kontak: '0857...',
                    email: 'pembina@gmail.com',
                    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                    pesanMotivasi: 'Pesan kepanduan untuk para santri...',
                  });
                  setIsPembinaModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pembina</span>
              </button>
            </div>

            {/* List Pembina Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formData.reguDanPembina.pembinaList.map((pem, pIdx) => (
                <div
                  key={pem.id || pIdx}
                  className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 relative group hover:border-amber-600/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-stone-700 bg-stone-900 shrink-0">
                      {pem.fotoUrl ? (
                        <img src={pem.fotoUrl} alt={pem.nama} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-500 font-bold text-lg">
                          👤
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">{pem.nama}</h4>
                      <div className="text-[11px] text-amber-400 font-semibold">{pem.jabatan}</div>
                      <div className="text-[10px] text-stone-400">{pem.gelar}</div>
                    </div>
                  </div>

                  {pem.pesanMotivasi && (
                    <div className="text-[11px] text-stone-300 italic p-2 rounded-xl bg-stone-900/80 border border-stone-800/80 leading-relaxed">
                      "{pem.pesanMotivasi}"
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>{pem.kontak || '-'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPembina({ ...pem });
                          setIsPembinaModalOpen(true);
                        }}
                        className="p-1 rounded-md bg-stone-800 hover:bg-amber-600 text-stone-300 hover:text-white transition-colors"
                        title="Edit Profil Pembina"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Hapus pembina "${pem.nama}" dari landing page?`)) {
                            const updated = formData.reguDanPembina.pembinaList.filter((p) => p.id !== pem.id);
                            setFormData({
                              ...formData,
                              reguDanPembina: { ...formData.reguDanPembina, pembinaList: updated },
                            });
                          }
                        }}
                        className="p-1 rounded-md bg-stone-800 hover:bg-rose-600 text-stone-300 hover:text-white transition-colors"
                        title="Hapus Pembina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT / TAMBAH KEGIATAN */}
      {isKegiatanModalOpen && editingKegiatan && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                  📸
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {formData.galeriKegiatan.some((k) => k.id === editingKegiatan.id)
                      ? 'Edit Liputan Kegiatan'
                      : 'Tambah Liputan Kegiatan Baru'}
                  </h3>
                  <p className="text-xs text-stone-400">Atur judul, gambar, kategori, dan deskripsi kegiatan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsKegiatanModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Label Kategori (Contoh: Perkemahan Akbar)
                  </label>
                  <input
                    type="text"
                    value={editingKegiatan.kategori}
                    onChange={(e) => setEditingKegiatan({ ...editingKegiatan, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                    placeholder="Perkemahan Akbar"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Kode / Judul Ringkas (Contoh: MUKHOYYAM PERKASA)
                  </label>
                  <input
                    type="text"
                    value={editingKegiatan.judul}
                    onChange={(e) => setEditingKegiatan({ ...editingKegiatan, judul: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                    placeholder="MUKHOYYAM PERKASA"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Nama Lengkap Liputan Kegiatan
                </label>
                <input
                  type="text"
                  value={editingKegiatan.namaKegiatan}
                  onChange={(e) => setEditingKegiatan({ ...editingKegiatan, namaKegiatan: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-bold text-sm"
                  placeholder="Perkemahan Akbar Santri Albashiroh"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Deskripsi Lengkap Kegiatan
                </label>
                <textarea
                  rows={3}
                  value={editingKegiatan.deskripsi}
                  onChange={(e) => setEditingKegiatan({ ...editingKegiatan, deskripsi: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium leading-relaxed"
                  placeholder="Ceritakan pengalaman seru santri, lokasi, dan manfaat kegiatan..."
                />
              </div>

              {/* Image Picker Section */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-200">Foto Kegiatan</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleTriggerUpload((dataUrl) => {
                        setEditingKegiatan({ ...editingKegiatan, imageUrl: dataUrl });
                      })
                    }
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto Lokal</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="w-full sm:w-40 h-28 rounded-xl overflow-hidden border border-stone-700 bg-stone-900 shrink-0">
                    <img
                      src={editingKegiatan.imageUrl || heroCampImg}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-1.5">
                    <label className="block text-[11px] text-stone-400">Atau masukkan URL Foto Gambar:</label>
                    <input
                      type="text"
                      value={editingKegiatan.imageUrl}
                      onChange={(e) => setEditingKegiatan({ ...editingKegiatan, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white font-mono text-[11px]"
                      placeholder="https://... URL gambar"
                    />
                    <div className="flex flex-wrap gap-1 pt-1">
                      {presetPhotos.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditingKegiatan({ ...editingKegiatan, imageUrl: p.url })}
                          className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px]"
                        >
                          {p.tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Sasaran Peserta
                  </label>
                  <input
                    type="text"
                    value={editingKegiatan.sasaran}
                    onChange={(e) => setEditingKegiatan({ ...editingKegiatan, sasaran: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                    placeholder="Seluruh Penggalang / Ramu Rakit"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Waktu / Frekuensi
                  </label>
                  <input
                    type="text"
                    value={editingKegiatan.frekuensi}
                    onChange={(e) => setEditingKegiatan({ ...editingKegiatan, frekuensi: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                    placeholder="1x Setahun / Setiap Pekan"
                  />
                </div>
              </div>

              {/* Highlights */}
              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Poin Capaian / Highlight (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={(editingKegiatan.poinHighlights || []).join(', ')}
                  onChange={(e) =>
                    setEditingKegiatan({
                      ...editingKegiatan,
                      poinHighlights: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                  placeholder="Qiyamul Lail, Halang Rintang, Api Unggun"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsKegiatanModalOpen(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const existingIdx = formData.galeriKegiatan.findIndex((k) => k.id === editingKegiatan.id);
                  let updatedList = [...formData.galeriKegiatan];
                  if (existingIdx >= 0) {
                    updatedList[existingIdx] = editingKegiatan;
                  } else {
                    updatedList.push(editingKegiatan);
                  }
                  setFormData({ ...formData, galeriKegiatan: updatedList });
                  setIsKegiatanModalOpen(false);
                  showToast('Liputan kegiatan berhasil disimpan ke daftar!', 'success');
                }}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-950/40"
              >
                Simpan Liputan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT / TAMBAH KARAKTER SIT */}
      {isKarakterModalOpen && editingKarakter && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-white">Kelola Karakter Pandu SIT</h3>
              <button
                type="button"
                onClick={() => setIsKarakterModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Nomor Urut
                </label>
                <input
                  type="number"
                  value={editingKarakter.nomor}
                  onChange={(e) => setEditingKarakter({ ...editingKarakter, nomor: parseInt(e.target.value) || 1 })}
                  className="w-24 px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Istilah Karakter (Bahasa Arab / Nilai)
                </label>
                <input
                  type="text"
                  value={editingKarakter.istilahArab}
                  onChange={(e) => setEditingKarakter({ ...editingKarakter, istilahArab: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-bold"
                  placeholder="Contoh: Salimul Aqidah"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Arti / Terjemahan Karakter
                </label>
                <input
                  type="text"
                  value={editingKarakter.arti}
                  onChange={(e) => setEditingKarakter({ ...editingKarakter, arti: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                  placeholder="Aqidah yang Bersih & Lurus"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Keterangan / Implementasi Lapangan
                </label>
                <textarea
                  rows={3}
                  value={editingKarakter.keterangan || ''}
                  onChange={(e) => setEditingKarakter({ ...editingKarakter, keterangan: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium leading-relaxed"
                  placeholder="Penjelasan pembiasaan ibadah dan akhlak..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsKarakterModalOpen(false)}
                className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const existingIdx = formData.kodeKehormatan.karakterSITItems.findIndex((k) => k.id === editingKarakter.id);
                  let updatedList = [...formData.kodeKehormatan.karakterSITItems];
                  if (existingIdx >= 0) {
                    updatedList[existingIdx] = editingKarakter;
                  } else {
                    updatedList.push(editingKarakter);
                  }
                  setFormData({
                    ...formData,
                    kodeKehormatan: {
                      ...formData.kodeKehormatan,
                      karakterSITItems: updatedList,
                    },
                  });
                  setIsKarakterModalOpen(false);
                  showToast('Karakter SIT berhasil diperbarui!', 'success');
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                Simpan Karakter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT / TAMBAH REGU */}
      {isReguModalOpen && editingRegu && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-white">
                Kelola Regu Penggalang {reguGenderTarget === 'Pa' ? 'Putra' : 'Putri'}
              </h3>
              <button
                type="button"
                onClick={() => setIsReguModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Nama Regu
                </label>
                <input
                  type="text"
                  value={editingRegu.nama}
                  onChange={(e) => setEditingRegu({ ...editingRegu, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-bold"
                  placeholder={reguGenderTarget === 'Pa' ? 'Regu Garuda' : 'Regu Melati'}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Ikon Emoji Regu
                  </label>
                  <input
                    type="text"
                    value={editingRegu.iconEmoji || ''}
                    onChange={(e) => setEditingRegu({ ...editingRegu, iconEmoji: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white text-center text-lg font-medium"
                    placeholder="🦅 / 🌸"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Jumlah Anggota
                  </label>
                  <input
                    type="number"
                    value={editingRegu.jumlahAnggota || 8}
                    onChange={(e) => setEditingRegu({ ...editingRegu, jumlahAnggota: parseInt(e.target.value) || 8 })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white text-center font-medium"
                    placeholder="8"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Nama Pemimpin Regu (Pinru)
                </label>
                <input
                  type="text"
                  value={editingRegu.pinru || ''}
                  onChange={(e) => setEditingRegu({ ...editingRegu, pinru: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                  placeholder="Nama Lengkap Pinru"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Semboyan / Yel-yel Regu
                </label>
                <input
                  type="text"
                  value={editingRegu.semboyan || ''}
                  onChange={(e) => setEditingRegu({ ...editingRegu, semboyan: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium italic"
                  placeholder="Semboyan regu yang membakar semangat..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-stone-300">
                    Gambar Lambang Regu (Opsional)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleTriggerUpload((dataUrl) => {
                        setEditingRegu({ ...editingRegu, lambangUrl: dataUrl });
                      })
                    }
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Logo</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={editingRegu.lambangUrl || ''}
                  onChange={(e) => setEditingRegu({ ...editingRegu, lambangUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono text-[11px]"
                  placeholder="https://... URL gambar logo regu"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsReguModalOpen(false)}
                className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetArray = reguGenderTarget === 'Pa' ? formData.reguDanPembina.reguPutra : formData.reguDanPembina.reguPutri;
                  const existingIdx = targetArray.findIndex((r) => r.id === editingRegu.id);
                  let updated = [...targetArray];
                  if (existingIdx >= 0) {
                    updated[existingIdx] = editingRegu;
                  } else {
                    updated.push(editingRegu);
                  }

                  if (reguGenderTarget === 'Pa') {
                    setFormData({
                      ...formData,
                      reguDanPembina: { ...formData.reguDanPembina, reguPutra: updated },
                    });
                  } else {
                    setFormData({
                      ...formData,
                      reguDanPembina: { ...formData.reguDanPembina, reguPutri: updated },
                    });
                  }
                  setIsReguModalOpen(false);
                  showToast('Data regu berhasil diperbarui!', 'success');
                }}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold"
              >
                Simpan Regu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT / TAMBAH PEMBINA */}
      {isPembinaModalOpen && editingPembina && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-white">Kelola Profil Pembina</h3>
              <button
                type="button"
                onClick={() => setIsPembinaModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Nama Lengkap Pembina / Pelatih
                </label>
                <input
                  type="text"
                  value={editingPembina.nama}
                  onChange={(e) => setEditingPembina({ ...editingPembina, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-bold"
                  placeholder="Kak Ainul Yaqin, S.S."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Gelar Kepramukaan / Kursus
                  </label>
                  <input
                    type="text"
                    value={editingPembina.gelar}
                    onChange={(e) => setEditingPembina({ ...editingPembina, gelar: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                    placeholder="KML / KMD"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Jabatan di Gugus Depan
                  </label>
                  <input
                    type="text"
                    value={editingPembina.jabatan}
                    onChange={(e) => setEditingPembina({ ...editingPembina, jabatan: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                    placeholder="Pembina Satuan Putra / Ka Gudep"
                  />
                </div>
              </div>

              {/* Photo Input & Upload */}
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-200">Foto Avatar Pembina</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleTriggerUpload((dataUrl) => {
                        setEditingPembina({ ...editingPembina, fotoUrl: dataUrl });
                      })
                    }
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-700 bg-stone-900 shrink-0">
                    {editingPembina.fotoUrl ? (
                      <img src={editingPembina.fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-500">
                        👤
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={editingPembina.fotoUrl || ''}
                    onChange={(e) => setEditingPembina({ ...editingPembina, fotoUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white font-mono text-[11px]"
                    placeholder="https://... URL foto"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    No WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={editingPembina.kontak || ''}
                    onChange={(e) => setEditingPembina({ ...editingPembina, kontak: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                    placeholder="085731436595"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingPembina.email || ''}
                    onChange={(e) => setEditingPembina({ ...editingPembina, email: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium"
                    placeholder="yaqin446@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Pesan Motivasi Kepanduan
                </label>
                <textarea
                  rows={2}
                  value={editingPembina.pesanMotivasi || ''}
                  onChange={(e) => setEditingPembina({ ...editingPembina, pesanMotivasi: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-medium leading-relaxed italic"
                  placeholder="Ikhlas Bakti Bina Bangsa, Berbudi Bawa Laksana..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsPembinaModalOpen(false)}
                className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const existingIdx = formData.reguDanPembina.pembinaList.findIndex((p) => p.id === editingPembina.id);
                  let updated = [...formData.reguDanPembina.pembinaList];
                  if (existingIdx >= 0) {
                    updated[existingIdx] = editingPembina;
                  } else {
                    updated.push(editingPembina);
                  }
                  setFormData({
                    ...formData,
                    reguDanPembina: { ...formData.reguDanPembina, pembinaList: updated },
                  });
                  setIsPembinaModalOpen(false);
                  showToast('Profil pembina berhasil disimpan!', 'success');
                }}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold"
              >
                Simpan Pembina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
