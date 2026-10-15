import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PembinaView } from './components/PembinaView';
import { AnggotaView } from './components/AnggotaView';
import { ReguView } from './components/ReguView';
import { ProgramKerjaView } from './components/ProgramKerjaView';
import { JadwalLatihanView } from './components/JadwalLatihanView';
import { MateriLatihanView } from './components/MateriLatihanView';
import { PresensiView } from './components/PresensiView';
import { SKUView } from './components/SKUView';
import { SKKView } from './components/SKKView';
import { KegiatanView } from './components/KegiatanView';
import { InventarisView } from './components/InventarisView';
import { KeuanganView } from './components/KeuanganView';
import { PrestasiView } from './components/PrestasiView';
import { DokumentasiView } from './components/DokumentasiView';
import { SuratMenyuratView } from './components/SuratMenyuratView';
import { LaporanView } from './components/LaporanView';
import { GasDeploymentGuideView } from './components/GasDeploymentGuideView';
import { PengaturanView } from './components/PengaturanView';
import { ManajemenUserView } from './components/ManajemenUserView';
import { LogAktivitasView } from './components/LogAktivitasView';
import { PengaturanLandingView } from './components/PengaturanLandingView';
import { LoginModal } from './components/LoginModal';
import { LandingAndLoginPortal } from './components/LandingAndLoginPortal';
import { GasService, FullDatabasePayload, DEFAULT_GAS_URL } from './services/gasService';

import {
  ActiveTab,
  Anggota,
  AppConfig,
  Dokumentasi,
  Inventaris,
  JadwalLatihan,
  Kegiatan,
  KeuanganRecord,
  LogAktivitas,
  MateriLatihan,
  Pembina,
  PencapaianSKK,
  PencapaianSKU,
  PresensiRecord,
  Prestasi,
  ProgramKerja,
  Regu,
  SKKItem,
  SKUItem,
  SuratRecord,
  User,
  UserRole,
  LandingPageContent,
} from './types';
import { defaultLandingContent } from './data/initialLandingData';

import {
  initialConfig,
  initialUsers,
  initialPembina,
  initialAnggota,
  initialRegu,
  initialProgramKerja,
  initialJadwalLatihan,
  initialMateriLatihan,
  initialPresensi,
  initialSKUItems,
  initialPencapaianSKU,
  initialSKKItems,
  initialPencapaianSKK,
  initialKegiatan,
  initialInventaris,
  initialKeuangan,
  initialPrestasi,
  initialDokumentasi,
  initialSurat,
  initialLogs,
} from './data/initialData';

// Pembersihan Data Dummy Lama & Integrasi URL Google Apps Script:
// Memastikan data dummy lama dibersihkan dan URL GAS resmi langsung terpasang
function purgeLegacyDummyData() {
  if (typeof window === 'undefined') return;
  const purgeKey = 'pramuka_gas_integrated_v5';
  if (localStorage.getItem(purgeKey) === 'true') return;

  try {
    const rawAnggota = localStorage.getItem('pramuka_anggota');
    const rawConfig = localStorage.getItem('pramuka_config');
    const isDummyAnggota = rawAnggota && (rawAnggota.includes('Muhammad Fatih') || rawAnggota.includes('AGT-0001') || rawAnggota.includes('Abdullah Azzam'));
    const isDummyConfig = rawConfig && (rawConfig.includes('SMP IT ALBASHIROH') || rawConfig.includes('Abdullah S.Pd.I'));

    let preservedGasUrl = DEFAULT_GAS_URL;
    let preservedSheetId = '';
    let preservedSyncOnStart = true;
    if (rawConfig) {
      try {
        const parsed = JSON.parse(rawConfig);
        if (parsed.gasWebAppUrl && GasService.isValidGasUrl(parsed.gasWebAppUrl) && !parsed.gasWebAppUrl.includes('AKfycbx...')) {
          preservedGasUrl = parsed.gasWebAppUrl;
        }
        preservedSheetId = parsed.googleSpreadsheetId || parsed.spreadsheetUrl || '';
        if (parsed.autoSyncOnStart !== undefined) preservedSyncOnStart = parsed.autoSyncOnStart;
      } catch {}
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

    if (isDummyAnggota || isDummyConfig) {
      storageKeysToClean.forEach(k => localStorage.removeItem(k));
    }

    // Pastikan URL Google Apps Script resmi selalu terisi
    if (rawConfig) {
      try {
        const parsed = JSON.parse(rawConfig);
        if (!parsed.gasWebAppUrl || !parsed.gasWebAppUrl.trim() || parsed.gasWebAppUrl.includes('AKfycbx...')) {
          parsed.gasWebAppUrl = DEFAULT_GAS_URL;
          parsed.googleSheetWebAppUrl = DEFAULT_GAS_URL;
        }
        localStorage.setItem('pramuka_config', JSON.stringify(parsed));
      } catch {}
    } else {
      localStorage.setItem('pramuka_config', JSON.stringify(initialConfig));
    }
  } catch (err) {
    console.warn('Dummy cleanup warning:', err);
  } finally {
    localStorage.setItem(purgeKey, 'true');
  }
}
purgeLegacyDummyData();

function MainApp() {
  const { showToast } = useToast();

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedJadwalForPresensi, setSelectedJadwalForPresensi] = useState<JadwalLatihan | null>(null);

  // Sync State
  const [isSyncingGas, setIsSyncingGas] = useState(false);
  const hasAutoPulled = useRef(false);

  // Landing Page & Login Portal View State
  const [isViewingLanding, setIsViewingLanding] = useState<boolean>(() => {
    const userSession = localStorage.getItem('pramuka_logged_in');
    return userSession !== 'true';
  });

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('pramuka_current_user');
    return saved ? JSON.parse(saved) : initialUsers[0];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pramuka_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  // Master Data States (with local persistence)
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('pramuka_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.gasWebAppUrl || !parsed.gasWebAppUrl.trim() || parsed.gasWebAppUrl.includes('AKfycbx...')) {
          parsed.gasWebAppUrl = DEFAULT_GAS_URL;
          parsed.googleSheetWebAppUrl = DEFAULT_GAS_URL;
          localStorage.setItem('pramuka_config', JSON.stringify(parsed));
        }
        return parsed;
      } catch {}
    }
    return initialConfig;
  });

  const [pembinaList, setPembinaList] = useState<Pembina[]>(() => {
    const saved = localStorage.getItem('pramuka_pembina');
    return saved ? JSON.parse(saved) : initialPembina;
  });

  const [anggotaList, setAnggotaList] = useState<Anggota[]>(() => {
    const saved = localStorage.getItem('pramuka_anggota');
    return saved ? JSON.parse(saved) : initialAnggota;
  });

  const [reguList, setReguList] = useState<Regu[]>(() => {
    const saved = localStorage.getItem('pramuka_regu');
    return saved ? JSON.parse(saved) : initialRegu;
  });

  const [programList, setProgramList] = useState<ProgramKerja[]>(() => {
    const saved = localStorage.getItem('pramuka_proker');
    return saved ? JSON.parse(saved) : initialProgramKerja;
  });

  const [jadwalList, setJadwalList] = useState<JadwalLatihan[]>(() => {
    const saved = localStorage.getItem('pramuka_jadwal');
    return saved ? JSON.parse(saved) : initialJadwalLatihan;
  });

  const [materiList, setMateriList] = useState<MateriLatihan[]>(() => {
    const saved = localStorage.getItem('pramuka_materi');
    return saved ? JSON.parse(saved) : initialMateriLatihan;
  });

  const [presensiList, setPresensiList] = useState<PresensiRecord[]>(() => {
    const saved = localStorage.getItem('pramuka_presensi');
    return saved ? JSON.parse(saved) : initialPresensi;
  });

  const [skuItems] = useState<SKUItem[]>(initialSKUItems);
  const [pencapaianSKUList, setPencapaianSKUList] = useState<PencapaianSKU[]>(() => {
    const saved = localStorage.getItem('pramuka_sku_pencapaian');
    return saved ? JSON.parse(saved) : initialPencapaianSKU;
  });

  const [skkItems] = useState<SKKItem[]>(initialSKKItems);
  const [pencapaianSKKList, setPencapaianSKKList] = useState<PencapaianSKK[]>(() => {
    const saved = localStorage.getItem('pramuka_skk_pencapaian');
    return saved ? JSON.parse(saved) : initialPencapaianSKK;
  });

  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>(() => {
    const saved = localStorage.getItem('pramuka_kegiatan');
    return saved ? JSON.parse(saved) : initialKegiatan;
  });

  const [inventarisList, setInventarisList] = useState<Inventaris[]>(() => {
    const saved = localStorage.getItem('pramuka_inventaris');
    return saved ? JSON.parse(saved) : initialInventaris;
  });

  const [keuanganList, setKeuanganList] = useState<KeuanganRecord[]>(() => {
    const saved = localStorage.getItem('pramuka_keuangan');
    return saved ? JSON.parse(saved) : initialKeuangan;
  });

  const [prestasiList, setPrestasiList] = useState<Prestasi[]>(() => {
    const saved = localStorage.getItem('pramuka_prestasi');
    return saved ? JSON.parse(saved) : initialPrestasi;
  });

  const [dokumentasiList, setDokumentasiList] = useState<Dokumentasi[]>(() => {
    const saved = localStorage.getItem('pramuka_dokumentasi');
    return saved ? JSON.parse(saved) : initialDokumentasi;
  });

  const [suratList, setSuratList] = useState<SuratRecord[]>(() => {
    const saved = localStorage.getItem('pramuka_surat');
    return saved ? JSON.parse(saved) : initialSurat;
  });

  const [logs, setLogs] = useState<LogAktivitas[]>(() => {
    const saved = localStorage.getItem('pramuka_logs');
    return saved ? JSON.parse(saved) : initialLogs;
  });

  // Landing Page Customized Content State
  const [landingContent, setLandingContent] = useState<LandingPageContent>(() => {
    const saved = localStorage.getItem('pramuka_landing_content');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return defaultLandingContent;
  });

  useEffect(() => {
    localStorage.setItem('pramuka_landing_content', JSON.stringify(landingContent));
  }, [landingContent]);

  const handleSaveLandingContent = (updated: LandingPageContent) => {
    setLandingContent(updated);
    localStorage.setItem('pramuka_landing_content', JSON.stringify(updated));
    // Keep pangkalan config synchronized with identical properties
    setConfig((prev) => {
      const merged = {
        ...prev,
        namaPangkalan: updated.identitas.namaPangkalan || prev.namaPangkalan,
        namaSekolah: updated.identitas.namaSekolah || prev.namaSekolah,
        nomorGudepPutra: updated.identitas.nomorGudepPutra || prev.nomorGudepPutra,
        nomorGudepPutri: updated.identitas.nomorGudepPutri || prev.nomorGudepPutri,
        kwarran: updated.identitas.kwarran || prev.kwarran,
        kwarcab: updated.identitas.kwarcab || prev.kwarcab,
        kwarda: updated.identitas.kwarda || prev.kwarda,
        alamat: updated.identitas.alamat || prev.alamat,
        telepon: updated.identitas.telepon || prev.telepon,
        email: updated.identitas.email || prev.email,
      };
      localStorage.setItem('pramuka_config', JSON.stringify(merged));
      return merged;
    });
  };

  // Save to LocalStorage effects
  useEffect(() => {
    localStorage.setItem('pramuka_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('pramuka_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('pramuka_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('pramuka_pembina', JSON.stringify(pembinaList));
  }, [pembinaList]);

  useEffect(() => {
    localStorage.setItem('pramuka_anggota', JSON.stringify(anggotaList));
  }, [anggotaList]);

  useEffect(() => {
    localStorage.setItem('pramuka_regu', JSON.stringify(reguList));
  }, [reguList]);

  useEffect(() => {
    localStorage.setItem('pramuka_proker', JSON.stringify(programList));
  }, [programList]);

  useEffect(() => {
    localStorage.setItem('pramuka_jadwal', JSON.stringify(jadwalList));
  }, [jadwalList]);

  useEffect(() => {
    localStorage.setItem('pramuka_materi', JSON.stringify(materiList));
  }, [materiList]);

  useEffect(() => {
    localStorage.setItem('pramuka_presensi', JSON.stringify(presensiList));
  }, [presensiList]);

  useEffect(() => {
    localStorage.setItem('pramuka_sku_pencapaian', JSON.stringify(pencapaianSKUList));
  }, [pencapaianSKUList]);

  useEffect(() => {
    localStorage.setItem('pramuka_skk_pencapaian', JSON.stringify(pencapaianSKKList));
  }, [pencapaianSKKList]);

  useEffect(() => {
    localStorage.setItem('pramuka_kegiatan', JSON.stringify(kegiatanList));
  }, [kegiatanList]);

  useEffect(() => {
    localStorage.setItem('pramuka_inventaris', JSON.stringify(inventarisList));
  }, [inventarisList]);

  useEffect(() => {
    localStorage.setItem('pramuka_keuangan', JSON.stringify(keuanganList));
  }, [keuanganList]);

  useEffect(() => {
    localStorage.setItem('pramuka_prestasi', JSON.stringify(prestasiList));
  }, [prestasiList]);

  useEffect(() => {
    localStorage.setItem('pramuka_dokumentasi', JSON.stringify(dokumentasiList));
  }, [dokumentasiList]);

  useEffect(() => {
    localStorage.setItem('pramuka_surat', JSON.stringify(suratList));
  }, [suratList]);

  useEffect(() => {
    localStorage.setItem('pramuka_logs', JSON.stringify(logs));
  }, [logs]);

  // Helper to add activity log
  const handleAddLog = useCallback((modul: string, aktivitas: string, idData: string, keterangan: string) => {
    const timeStr = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const newLog: LogAktivitas = {
      id: `LOG-${Date.now()}`,
      waktu: timeStr,
      timestamp: timeStr,
      user: currentUser?.nama || 'Sistem',
      role: currentUser?.role || 'ADMIN',
      modul,
      aktivitas,
      idData,
      targetId: idData,
      keterangan,
    };
    setLogs(prev => [newLog, ...prev]);
  }, [currentUser]);

  // Bidirectional Synchronization Handler: PULL from Google Sheets
  const handlePullFromGas = useCallback(async (arg1?: boolean | string, arg2?: string | boolean) => {
    let isSilent = false;
    let urlOverride: string | undefined;

    if (typeof arg1 === 'boolean') {
      isSilent = arg1;
      if (typeof arg2 === 'string') urlOverride = arg2;
    } else if (typeof arg1 === 'string') {
      urlOverride = arg1;
      if (typeof arg2 === 'boolean') isSilent = arg2;
    }

    const url = (urlOverride || config.gasWebAppUrl || '').trim();
    if (!url || !GasService.isValidGasUrl(url)) {
      if (!isSilent) {
        showToast('URL Web App Google Apps Script belum dikonfigurasikan atau formatnya tidak sesuai.', 'warning');
      }
      return { success: false, message: 'URL belum dikonfigurasi' };
    }

    if (urlOverride && urlOverride !== config.gasWebAppUrl) {
      setConfig(prev => ({ ...prev, gasWebAppUrl: urlOverride }));
    }

    setIsSyncingGas(true);
    try {
      const pulled = await GasService.pullFullDatabase(url);
      let updatedCount = 0;

      if (pulled.anggota !== undefined) {
        setAnggotaList(pulled.anggota);
        updatedCount += pulled.anggota.length;
      }
      if (pulled.pembina !== undefined) {
        setPembinaList(pulled.pembina);
        updatedCount += pulled.pembina.length;
      }
      if (pulled.regu !== undefined) {
        setReguList(pulled.regu);
        updatedCount += pulled.regu.length;
      }
      if (pulled.programKerja !== undefined) {
        setProgramList(pulled.programKerja);
        updatedCount += pulled.programKerja.length;
      }
      if (pulled.jadwalLatihan !== undefined) {
        setJadwalList(pulled.jadwalLatihan);
        updatedCount += pulled.jadwalLatihan.length;
      }
      if (pulled.materiLatihan !== undefined) {
        setMateriList(pulled.materiLatihan);
        updatedCount += pulled.materiLatihan.length;
      }
      if (pulled.presensi !== undefined) {
        setPresensiList(pulled.presensi);
        updatedCount += pulled.presensi.length;
      }
      if (pulled.pencapaianSKU !== undefined) {
        setPencapaianSKUList(pulled.pencapaianSKU);
        updatedCount += pulled.pencapaianSKU.length;
      }
      if (pulled.pencapaianSKK !== undefined) {
        setPencapaianSKKList(pulled.pencapaianSKK);
        updatedCount += pulled.pencapaianSKK.length;
      }
      if (pulled.kegiatan !== undefined) {
        setKegiatanList(pulled.kegiatan);
        updatedCount += pulled.kegiatan.length;
      }
      if (pulled.inventaris !== undefined) {
        setInventarisList(pulled.inventaris);
        updatedCount += pulled.inventaris.length;
      }
      if (pulled.keuangan !== undefined) {
        setKeuanganList(pulled.keuangan);
        updatedCount += pulled.keuangan.length;
      }
      if (pulled.prestasi !== undefined) {
        setPrestasiList(pulled.prestasi);
        updatedCount += pulled.prestasi.length;
      }
      if (pulled.dokumentasi !== undefined) {
        setDokumentasiList(pulled.dokumentasi);
        updatedCount += pulled.dokumentasi.length;
      }
      if (pulled.suratMenyurat !== undefined) {
        setSuratList(pulled.suratMenyurat);
        updatedCount += pulled.suratMenyurat.length;
      }
      if (pulled.users !== undefined && pulled.users.length > 0) {
        setUsers(pulled.users);
      }

      const syncTimestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      if (pulled.config && Object.keys(pulled.config).length > 0) {
        setConfig(prev => {
          const nextConfig = { ...prev, ...pulled.config, lastSyncTime: syncTimestamp };
          localStorage.setItem('pramuka_config', JSON.stringify(nextConfig));
          return nextConfig;
        });
      } else {
        setConfig(prev => {
          const nextConfig = { ...prev, lastSyncTime: syncTimestamp };
          localStorage.setItem('pramuka_config', JSON.stringify(nextConfig));
          return nextConfig;
        });
      }

      const msg = `Berhasil menarik ${updatedCount} baris data dan konfigurasi identitas dari Google Spreadsheet!`;
      if (!isSilent) {
        showToast(msg, 'success');
      }
      return { success: true, message: msg };
    } catch (err: any) {
      const errMsg = err?.message || 'Gagal menarik data dari Google Spreadsheet.';
      if (!isSilent) {
        showToast(errMsg, 'error');
      }
      return { success: false, message: errMsg };
    } finally {
      setIsSyncingGas(false);
    }
  }, [config.gasWebAppUrl, showToast]);

  // Bidirectional Synchronization Handler: PUSH to Google Sheets
  const handlePushToGas = useCallback(async (arg1?: boolean | string, arg2?: string | boolean) => {
    let isSilent = false;
    let urlOverride: string | undefined;

    if (typeof arg1 === 'boolean') {
      isSilent = arg1;
      if (typeof arg2 === 'string') urlOverride = arg2;
    } else if (typeof arg1 === 'string') {
      urlOverride = arg1;
      if (typeof arg2 === 'boolean') isSilent = arg2;
    }

    const url = (urlOverride || config.gasWebAppUrl || '').trim();
    if (!url || !GasService.isValidGasUrl(url)) {
      if (!isSilent) {
        showToast('URL Web App Google Apps Script belum dikonfigurasikan atau formatnya tidak sesuai.', 'warning');
      }
      return { success: false, message: 'URL belum dikonfigurasi' };
    }

    if (urlOverride && urlOverride !== config.gasWebAppUrl) {
      setConfig(prev => ({ ...prev, gasWebAppUrl: urlOverride }));
    }

    setIsSyncingGas(true);
    try {
      const payload: FullDatabasePayload = {
        config: { ...config, ...(urlOverride ? { gasWebAppUrl: urlOverride } : {}) },
        users,
        pembina: pembinaList,
        anggota: anggotaList,
        regu: reguList,
        programKerja: programList,
        jadwalLatihan: jadwalList,
        materiLatihan: materiList,
        presensi: presensiList,
        pencapaianSKU: pencapaianSKUList,
        pencapaianSKK: pencapaianSKKList,
        kegiatan: kegiatanList,
        inventaris: inventarisList,
        keuangan: keuanganList,
        prestasi: prestasiList,
        dokumentasi: dokumentasiList,
        suratMenyurat: suratList,
        logAktivitas: logs,
      };

      const res = await GasService.pushFullDatabase(url, payload);
      const syncTimestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setConfig(prev => ({ ...prev, lastSyncTime: syncTimestamp }));

      const msg = res?.message || 'Seluruh data berhasil disinkronkan & disimpan ke Google Spreadsheet!';
      if (!isSilent) {
        showToast(msg, 'success');
      }
      return { success: true, message: msg };
    } catch (err: any) {
      const errMsg = err?.message || 'Gagal mengirim data ke Google Spreadsheet.';
      if (!isSilent) {
        showToast(errMsg, 'error');
      }
      return { success: false, message: errMsg };
    } finally {
      setIsSyncingGas(false);
    }
  }, [
    config,
    users,
    pembinaList,
    anggotaList,
    reguList,
    programList,
    jadwalList,
    materiList,
    presensiList,
    pencapaianSKUList,
    pencapaianSKKList,
    kegiatanList,
    inventarisList,
    keuanganList,
    prestasiList,
    dokumentasiList,
    suratList,
    logs,
    showToast,
  ]);

  // Initial Auto-Sync on App Startup if valid URL configured
  useEffect(() => {
    if (
      !hasAutoPulled.current &&
      config.gasWebAppUrl &&
      GasService.isValidGasUrl(config.gasWebAppUrl) &&
      config.autoSyncOnStart !== false
    ) {
      hasAutoPulled.current = true;
      handlePullFromGas(true).catch(() => {
        // Silently handled on startup
      });
    }
  }, [config.gasWebAppUrl, config.autoSyncOnStart, handlePullFromGas]);

  // Role Switcher for easy testing
  const handleSwitchRole = (newRole: UserRole) => {
    const matchingUser = users.find(u => u.role === newRole) || {
      id: `USR-${Date.now()}`,
      username: newRole.toLowerCase(),
      nama: `Kak ${newRole} (Simulasi)`,
      role: newRole,
      status: 'Aktif',
      terakhirLogin: 'Baru saja',
    };
    setCurrentUser(matchingUser);
    showToast(`Beralih ke peran: ${newRole}`, 'info');
  };

  const handleLogout = () => {
    localStorage.removeItem('pramuka_logged_in');
    setIsViewingLanding(true);
    showToast('Anda telah keluar dari sesi administrasi.', 'info');
  };

  const handleNavigateToPresensi = (jadwal: JadwalLatihan) => {
    setSelectedJadwalForPresensi(jadwal);
    setActiveTab('presensi');
  };

  const currentRole = currentUser?.role || 'ADMIN';

  const dataStats = {
    anggota: anggotaList.length,
    pembina: pembinaList.length,
    regu: reguList.length,
    proker: programList.length,
    jadwal: jadwalList.length,
    materi: materiList.length,
    presensi: presensiList.length,
    sku: pencapaianSKUList.length,
    skk: pencapaianSKKList.length,
    kegiatan: kegiatanList.length,
    inventaris: inventarisList.length,
    keuangan: keuanganList.length,
    prestasi: prestasiList.length,
    dokumentasi: dokumentasiList.length,
    surat: suratList.length,
    users: users.length,
  };

  if (isViewingLanding) {
    return (
      <LandingAndLoginPortal
        config={config}
        landingContent={landingContent}
        users={users}
        currentUser={currentUser}
        onLoginSuccess={(loggedInUser) => {
          setCurrentUser(loggedInUser);
          localStorage.setItem('pramuka_logged_in', 'true');
          setIsViewingLanding(false);
          showToast(`Selamat datang kembali, ${loggedInUser.nama}! (${loggedInUser.role})`, 'success');
        }}
        onEnterAsGuest={() => {
          const guestUser: User = {
            id: 'USR-GUEST',
            username: 'tamu',
            nama: 'Tamu Peninjau',
            role: 'PEMBINA',
            status: 'Aktif',
            terakhirLogin: 'Baru saja',
          };
          setCurrentUser(guestUser);
          localStorage.setItem('pramuka_logged_in', 'true');
          setIsViewingLanding(false);
          showToast('Masuk dalam Mode Tamu (Peninjau).', 'info');
        }}
        onContinueToDashboard={() => {
          localStorage.setItem('pramuka_logged_in', 'true');
          setIsViewingLanding(false);
        }}
        isSyncingGas={isSyncingGas}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        config={config}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
        onOpenLandingPage={() => setIsViewingLanding(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeTab={activeTab}
          currentUser={currentUser}
          config={config}
          onSwitchRole={handleSwitchRole}
          onQuickNavigate={setActiveTab}
          onSyncGas={() => handlePullFromGas(false)}
          isSyncingGas={isSyncingGas}
          onOpenLandingPage={() => setIsViewingLanding(true)}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              config={config}
              anggota={anggotaList}
              regu={reguList}
              pembina={pembinaList}
              presensi={presensiList}
              kegiatan={kegiatanList}
              inventaris={inventarisList}
              keuangan={keuanganList}
              prestasi={prestasiList}
              pencapaianSKU={pencapaianSKUList}
              pencapaianSKK={pencapaianSKKList}
              jadwalLatihan={jadwalList}
              logs={logs}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'pengaturan-landing' && (
            <PengaturanLandingView
              content={landingContent}
              onSaveContent={handleSaveLandingContent}
              currentUserRole={currentRole}
              onPreviewLanding={() => setIsViewingLanding(true)}
              onAddLog={handleAddLog}
            />
          )}

          {activeTab === 'pembina' && (
            <PembinaView
              pembinaList={pembinaList}
              onSave={setPembinaList}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
            />
          )}

          {activeTab === 'anggota' && (
            <AnggotaView
              anggotaList={anggotaList}
              reguList={reguList}
              config={config}
              onSave={setAnggotaList}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
            />
          )}

          {activeTab === 'regu' && (
            <ReguView
              reguList={reguList}
              anggotaList={anggotaList}
              onSaveRegu={setReguList}
              onSaveAnggota={setAnggotaList}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
            />
          )}

          {activeTab === 'program-kerja' && (
            <ProgramKerjaView
              programList={programList}
              onSave={setProgramList}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
            />
          )}

          {activeTab === 'jadwal-latihan' && (
            <JadwalLatihanView
              jadwalList={jadwalList}
              pembinaList={pembinaList}
              onSave={setJadwalList}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
              onNavigateToPresensi={handleNavigateToPresensi}
            />
          )}

          {activeTab === 'materi-latihan' && (
            <MateriLatihanView
              materiList={materiList}
              onSave={setMateriList}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
            />
          )}

          {activeTab === 'presensi' && (
            <PresensiView
              presensiList={presensiList}
              anggotaList={anggotaList}
              jadwalList={jadwalList}
              reguList={reguList}
              onSavePresensi={setPresensiList}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
              selectedJadwal={selectedJadwalForPresensi}
            />
          )}

          {activeTab === 'sku' && (
            <SKUView
              skuItems={skuItems}
              pencapaianList={pencapaianSKUList}
              anggotaList={anggotaList}
              pembinaList={pembinaList}
              onSavePencapaian={setPencapaianSKUList}
              onSaveAnggota={setAnggotaList}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
            />
          )}

          {activeTab === 'skk' && (
            <SKKView
              skkItems={skkItems}
              pencapaianList={pencapaianSKKList}
              anggotaList={anggotaList}
              pembinaList={pembinaList}
              onSavePencapaian={setPencapaianSKKList}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
            />
          )}

          {activeTab === 'kegiatan' && (
            <KegiatanView
              kegiatanList={kegiatanList}
              onSave={setKegiatanList}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
            />
          )}

          {activeTab === 'inventaris' && (
            <InventarisView
              inventarisList={inventarisList}
              onSave={setInventarisList}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
            />
          )}

          {activeTab === 'keuangan' && (
            <KeuanganView
              keuanganList={keuanganList}
              onSave={setKeuanganList}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
            />
          )}

          {activeTab === 'prestasi' && (
            <PrestasiView
              prestasiList={prestasiList}
              onSave={setPrestasiList}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
            />
          )}

          {activeTab === 'dokumentasi' && (
            <DokumentasiView
              dokumentasiList={dokumentasiList}
              onSave={setDokumentasiList}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
            />
          )}

          {activeTab === 'surat-menyurat' && (
            <SuratMenyuratView
              suratList={suratList}
              pembinaList={pembinaList}
              anggotaList={anggotaList}
              config={config}
              onSave={setSuratList}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
            />
          )}

          {activeTab === 'laporan' && (
            <LaporanView
              config={config}
              anggotaList={anggotaList}
              pembinaList={pembinaList}
              reguList={reguList}
              prokerList={programList}
              jadwalList={jadwalList}
              presensiList={presensiList}
              pencapaianSKU={pencapaianSKUList}
              pencapaianSKK={pencapaianSKKList}
              kegiatanList={kegiatanList}
              inventarisList={inventarisList}
              keuanganList={keuanganList}
              prestasiList={prestasiList}
            />
          )}

          {activeTab === 'gas-guide' && <GasDeploymentGuideView />}

          {activeTab === 'pengaturan' && (
            <PengaturanView
              config={config}
              onSaveConfig={setConfig}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
              onPullFromGas={(url) => handlePullFromGas(url || false)}
              onPushToGas={(url) => handlePushToGas(url || false)}
              isSyncingGas={isSyncingGas}
              dataStats={dataStats}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'manajemen-user' && (
            <ManajemenUserView
              users={users}
              onSaveUsers={setUsers}
              currentUserRole={currentRole}
              onAddLog={handleAddLog}
            />
          )}

          {activeTab === 'log-aktivitas' && (
            <LogAktivitasView
              logs={logs}
              onClearLogs={() => setLogs([])}
              currentUserRole={currentRole}
            />
          )}
        </main>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={setCurrentUser}
        users={users}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
