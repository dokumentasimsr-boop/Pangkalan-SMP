import {
  Anggota,
  AppConfig,
  Dokumentasi,
  Inventaris,
  JadwalLatihan,
  Kegiatan,
  Keuangan,
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
  SuratMenyurat,
  User,
} from '../types';

import {
  initialAnggota,
  initialConfig,
  initialDokumentasi,
  initialInventaris,
  initialJadwalLatihan,
  initialKegiatan,
  initialKeuangan,
  initialLogAktivitas,
  initialMateriLatihan,
  initialPembina,
  initialPencapaianSKK,
  initialPencapaianSKU,
  initialPresensi,
  initialPrestasi,
  initialProgramKerja,
  initialRegu,
  initialSuratMenyurat,
  initialUsers,
  skkItemsMaster,
  skuItemsMaster,
} from '../data/initialData';

const STORAGE_KEYS = {
  CONFIG: 'pramuka_config',
  USERS: 'pramuka_users',
  PEMBINA: 'pramuka_pembina',
  ANGGOTA: 'pramuka_anggota',
  REGU: 'pramuka_regu',
  PROGRAM_KERJA: 'pramuka_program_kerja',
  JADWAL_LATIHAN: 'pramuka_jadwal_latihan',
  MATERI_LATIHAN: 'pramuka_materi_latihan',
  PRESENSI: 'pramuka_presensi',
  SKU_ITEMS: 'pramuka_sku_items',
  PENCAPAIAN_SKU: 'pramuka_pencapaian_sku',
  SKK_ITEMS: 'pramuka_skk_items',
  PENCAPAIAN_SKK: 'pramuka_pencapaian_skk',
  KEGIATAN: 'pramuka_kegiatan',
  INVENTARIS: 'pramuka_inventaris',
  KEUANGAN: 'pramuka_keuangan',
  PRESTASI: 'pramuka_prestasi',
  DOKUMENTASI: 'pramuka_dokumentasi',
  SURAT: 'pramuka_surat',
  LOG_AKTIVITAS: 'pramuka_log_aktivitas',
  CURRENT_USER: 'pramuka_current_user',
};

export class StorageService {
  private static load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private static save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // Getters
  static getConfig(): AppConfig {
    return this.load<AppConfig>(STORAGE_KEYS.CONFIG, initialConfig);
  }

  static setConfig(config: AppConfig): void {
    this.save(STORAGE_KEYS.CONFIG, config);
  }

  static getUsers(): User[] {
    return this.load<User[]>(STORAGE_KEYS.USERS, initialUsers);
  }

  static setUsers(users: User[]): void {
    this.save(STORAGE_KEYS.USERS, users);
  }

  static getCurrentUser(): User | null {
    return this.load<User | null>(STORAGE_KEYS.CURRENT_USER, initialUsers[0]);
  }

  static setCurrentUser(user: User | null): void {
    this.save(STORAGE_KEYS.CURRENT_USER, user);
  }

  static getPembina(): Pembina[] {
    return this.load<Pembina[]>(STORAGE_KEYS.PEMBINA, initialPembina);
  }

  static setPembina(data: Pembina[]): void {
    this.save(STORAGE_KEYS.PEMBINA, data);
  }

  static getAnggota(): Anggota[] {
    return this.load<Anggota[]>(STORAGE_KEYS.ANGGOTA, initialAnggota);
  }

  static setAnggota(data: Anggota[]): void {
    this.save(STORAGE_KEYS.ANGGOTA, data);
    // Auto update regu count
    this.recalculateReguCounts(data);
  }

  static getRegu(): Regu[] {
    return this.load<Regu[]>(STORAGE_KEYS.REGU, initialRegu);
  }

  static setRegu(data: Regu[]): void {
    this.save(STORAGE_KEYS.REGU, data);
  }

  static recalculateReguCounts(anggotaList?: Anggota[]): void {
    const anggotas = anggotaList || this.getAnggota();
    const regus = this.getRegu();
    const updatedRegus = regus.map(r => {
      const count = anggotas.filter(a => (a.regu || '').toLowerCase() === (r.namaRegu || '').toLowerCase() && a.status === 'Aktif').length;
      return { ...r, jumlahAnggota: count };
    });
    this.save(STORAGE_KEYS.REGU, updatedRegus);
  }

  static getProgramKerja(): ProgramKerja[] {
    return this.load<ProgramKerja[]>(STORAGE_KEYS.PROGRAM_KERJA, initialProgramKerja);
  }

  static setProgramKerja(data: ProgramKerja[]): void {
    this.save(STORAGE_KEYS.PROGRAM_KERJA, data);
  }

  static getJadwalLatihan(): JadwalLatihan[] {
    return this.load<JadwalLatihan[]>(STORAGE_KEYS.JADWAL_LATIHAN, initialJadwalLatihan);
  }

  static setJadwalLatihan(data: JadwalLatihan[]): void {
    this.save(STORAGE_KEYS.JADWAL_LATIHAN, data);
  }

  static getMateriLatihan(): MateriLatihan[] {
    return this.load<MateriLatihan[]>(STORAGE_KEYS.MATERI_LATIHAN, initialMateriLatihan);
  }

  static setMateriLatihan(data: MateriLatihan[]): void {
    this.save(STORAGE_KEYS.MATERI_LATIHAN, data);
  }

  static getPresensi(): PresensiRecord[] {
    return this.load<PresensiRecord[]>(STORAGE_KEYS.PRESENSI, initialPresensi);
  }

  static setPresensi(data: PresensiRecord[]): void {
    this.save(STORAGE_KEYS.PRESENSI, data);
  }

  static getSKUItems(): SKUItem[] {
    return this.load<SKUItem[]>(STORAGE_KEYS.SKU_ITEMS, skuItemsMaster);
  }

  static getPencapaianSKU(): PencapaianSKU[] {
    return this.load<PencapaianSKU[]>(STORAGE_KEYS.PENCAPAIAN_SKU, initialPencapaianSKU);
  }

  static setPencapaianSKU(data: PencapaianSKU[]): void {
    this.save(STORAGE_KEYS.PENCAPAIAN_SKU, data);
  }

  static getSKKItems(): SKKItem[] {
    return this.load<SKKItem[]>(STORAGE_KEYS.SKK_ITEMS, skkItemsMaster);
  }

  static getPencapaianSKK(): PencapaianSKK[] {
    return this.load<PencapaianSKK[]>(STORAGE_KEYS.PENCAPAIAN_SKK, initialPencapaianSKK);
  }

  static setPencapaianSKK(data: PencapaianSKK[]): void {
    this.save(STORAGE_KEYS.PENCAPAIAN_SKK, data);
  }

  static getKegiatan(): Kegiatan[] {
    return this.load<Kegiatan[]>(STORAGE_KEYS.KEGIATAN, initialKegiatan);
  }

  static setKegiatan(data: Kegiatan[]): void {
    this.save(STORAGE_KEYS.KEGIATAN, data);
  }

  static getInventaris(): Inventaris[] {
    return this.load<Inventaris[]>(STORAGE_KEYS.INVENTARIS, initialInventaris);
  }

  static setInventaris(data: Inventaris[]): void {
    this.save(STORAGE_KEYS.INVENTARIS, data);
  }

  static getKeuangan(): Keuangan[] {
    return this.load<Keuangan[]>(STORAGE_KEYS.KEUANGAN, initialKeuangan);
  }

  static setKeuangan(data: Keuangan[]): void {
    this.save(STORAGE_KEYS.KEUANGAN, data);
  }

  static getPrestasi(): Prestasi[] {
    return this.load<Prestasi[]>(STORAGE_KEYS.PRESTASI, initialPrestasi);
  }

  static setPrestasi(data: Prestasi[]): void {
    this.save(STORAGE_KEYS.PRESTASI, data);
  }

  static getDokumentasi(): Dokumentasi[] {
    return this.load<Dokumentasi[]>(STORAGE_KEYS.DOKUMENTASI, initialDokumentasi);
  }

  static setDokumentasi(data: Dokumentasi[]): void {
    this.save(STORAGE_KEYS.DOKUMENTASI, data);
  }

  static getSuratMenyurat(): SuratMenyurat[] {
    return this.load<SuratMenyurat[]>(STORAGE_KEYS.SURAT, initialSuratMenyurat);
  }

  static setSuratMenyurat(data: SuratMenyurat[]): void {
    this.save(STORAGE_KEYS.SURAT, data);
  }

  static getLogAktivitas(): LogAktivitas[] {
    return this.load<LogAktivitas[]>(STORAGE_KEYS.LOG_AKTIVITAS, initialLogAktivitas);
  }

  static addLog(modul: string, aktivitas: string, idData: string, keterangan: string): void {
    const logs = this.getLogAktivitas();
    const user = this.getCurrentUser();
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const newLog: LogAktivitas = {
      id: `LOG-${String(logs.length + 1).padStart(4, '0')}`,
      waktu: formattedDate,
      user: user ? user.nama : 'Sistem',
      role: user ? user.role : 'ADMIN',
      modul,
      aktivitas,
      idData,
      keterangan,
    };

    this.save(STORAGE_KEYS.LOG_AKTIVITAS, [newLog, ...logs]);
  }

  // ID Generators
  static generateId(prefix: string, listLength: number): string {
    return `${prefix}-${String(listLength + 1).padStart(4, '0')}`;
  }

  // Reset all to factory defaults
  static resetToDefaults(): void {
    localStorage.clear();
    this.setConfig(initialConfig);
    this.setUsers(initialUsers);
    this.setPembina(initialPembina);
    this.setAnggota(initialAnggota);
    this.setRegu(initialRegu);
    this.setProgramKerja(initialProgramKerja);
    this.setJadwalLatihan(initialJadwalLatihan);
    this.setMateriLatihan(initialMateriLatihan);
    this.setPresensi(initialPresensi);
    this.setPencapaianSKU(initialPencapaianSKU);
    this.setPencapaianSKK(initialPencapaianSKK);
    this.setKegiatan(initialKegiatan);
    this.setInventaris(initialInventaris);
    this.setKeuangan(initialKeuangan);
    this.setPrestasi(initialPrestasi);
    this.setDokumentasi(initialDokumentasi);
    this.setSuratMenyurat(initialSuratMenyurat);
    this.save(STORAGE_KEYS.LOG_AKTIVITAS, initialLogAktivitas);
    this.setCurrentUser(initialUsers[0]);
  }

  // Export full database as JSON
  static exportFullDatabase(): string {
    const fullDB = {
      pangkalan: 'SMP IT ALBASHIROH TUREN',
      exportedAt: new Date().toISOString(),
      config: this.getConfig(),
      pembina: this.getPembina(),
      anggota: this.getAnggota(),
      regu: this.getRegu(),
      programKerja: this.getProgramKerja(),
      jadwalLatihan: this.getJadwalLatihan(),
      materiLatihan: this.getMateriLatihan(),
      presensi: this.getPresensi(),
      pencapaianSKU: this.getPencapaianSKU(),
      pencapaianSKK: this.getPencapaianSKK(),
      kegiatan: this.getKegiatan(),
      inventaris: this.getInventaris(),
      keuangan: this.getKeuangan(),
      prestasi: this.getPrestasi(),
      dokumentasi: this.getDokumentasi(),
      suratMenyurat: this.getSuratMenyurat(),
      logAktivitas: this.getLogAktivitas(),
    };
    return JSON.stringify(fullDB, null, 2);
  }

  // Import full database from JSON
  static importFullDatabase(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.config) this.setConfig(data.config);
      if (data.pembina) this.setPembina(data.pembina);
      if (data.anggota) this.setAnggota(data.anggota);
      if (data.regu) this.setRegu(data.regu);
      if (data.programKerja) this.setProgramKerja(data.programKerja);
      if (data.jadwalLatihan) this.setJadwalLatihan(data.jadwalLatihan);
      if (data.materiLatihan) this.setMateriLatihan(data.materiLatihan);
      if (data.presensi) this.setPresensi(data.presensi);
      if (data.pencapaianSKU) this.setPencapaianSKU(data.pencapaianSKU);
      if (data.pencapaianSKK) this.setPencapaianSKK(data.pencapaianSKK);
      if (data.kegiatan) this.setKegiatan(data.kegiatan);
      if (data.inventaris) this.setInventaris(data.inventaris);
      if (data.keuangan) this.setKeuangan(data.keuangan);
      if (data.prestasi) this.setPrestasi(data.prestasi);
      if (data.dokumentasi) this.setDokumentasi(data.dokumentasi);
      if (data.suratMenyurat) this.setSuratMenyurat(data.suratMenyurat);
      this.addLog('Sistem', 'Import Database', 'ALL', 'Import database JSON berhasil dipulihkan');
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  }
}
