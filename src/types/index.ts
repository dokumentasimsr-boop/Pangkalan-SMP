export type UserRole = 'ADMIN' | 'PEMBINA' | 'PETUGAS';

export interface User {
  id: string;
  username: string;
  nama: string;
  role: UserRole;
  email?: string;
  status: 'Aktif' | 'Nonaktif' | 'Non-Aktif';
  lastLogin?: string;
  terakhirLogin?: string;
  password?: string;
  passwordHash?: string;
}

export interface AppConfig {
  namaPangkalan: string;
  namaSekolah: string;
  nomorGudepPutra: string;
  nomorGudepPutri: string;
  nomorGudepPa?: string;
  nomorGudepPi?: string;
  jenjang?: string;
  kwarran: string;
  kwarcab: string;
  kwarda: string;
  alamat: string;
  email?: string;
  telepon?: string;
  website?: string;
  namaMabigus?: string;
  kaMabigus?: string;
  namaKetuaGudep?: string;
  kaGudepPa?: string;
  kaGudepPi?: string;
  namaPembinaPutra?: string;
  namaPembinaPutri?: string;
  logoSekolah?: string;
  logoPramuka?: string;
  tahunPelajaran?: string;
  tahunKegiatan?: string;
  googleSheetWebAppUrl?: string;
  gasWebAppUrl?: string;
  googleSpreadsheetId?: string;
  spreadsheetUrl?: string;
  autoSyncOnStart?: boolean;
  autoSyncOnChange?: boolean;
  lastSyncTime?: string;
}

export type PangkalanConfig = AppConfig;

export interface Pembina {
  id: string; // PEM-0001
  nip?: string;
  nta?: string;
  nama: string;
  gelar: string;
  jenisKelamin?: 'L' | 'P';
  jabatan: string;
  kualifikasiIjazah?: string;
  noHp?: string;
  email?: string;
  status: 'Aktif' | 'Nonaktif' | 'Non-Aktif';
  keterangan?: string;
}

export interface Anggota {
  id: string; // AGT-0001
  nisn: string;
  nta?: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string; // DD/MM/YYYY
  agama?: string;
  kelas: string; // e.g., '7A', '7B', '8A', '8B', '9A', '9B'
  alamat: string;
  namaOrtu: string;
  noHpOrtu: string;
  regu: string; // e.g., 'Garuda', 'Melati'
  jabatanRegu?: 'Pinru' | 'Wapinru' | 'Anggota';
  status: 'Aktif' | 'Alumni' | 'Pindah/Keluar';
  tanggalBergabung?: string;
  nomorGudep?: string;
  tingkatSKU: 'Calon Penggalang' | 'Penggalang Ramu' | 'Penggalang Rakit' | 'Penggalang Terap' | 'Penggalang Garuda';
  fotoUrl?: string;
  keterangan?: string;
}

export interface Regu {
  id: string; // REG-001
  namaRegu: string;
  kategori: 'Putra' | 'Putri';
  pangkalan?: string;
  tahun?: string;
  pemimpinRegu?: string; // ID / Nama Anggota
  pinru?: string;
  wapinru?: string;
  wakilPemimpin?: string; // ID / Nama Anggota
  pembinaPendamping?: string;
  jumlahAnggota: number;
  status?: 'Aktif' | 'Nonaktif';
  keterangan?: string;
  slogan?: string;
  semboyan?: string;
  warnaRegu?: string;
}

export interface ProgramKerja {
  id: string; // PRG-0001
  namaProgram: string;
  bidang: 'Kepramukaan' | 'Keterampilan' | 'Karakter' | 'Sosial' | 'Kepemimpinan' | 'Keagamaan' | 'Outdoor' | 'Prestasi' | 'Administrasi' | string;
  tujuan: string;
  sasaran: string;
  waktuPelaksanaan: string;
  penanggungJawab: string;
  indikatorKeberhasilan?: string;
  anggaran: number;
  sumberDana?: string;
  status: 'Belum Terlaksana' | 'Dalam Proses' | 'Terlaksana' | 'Dibatalkan';
  keterangan?: string;
}

export interface JadwalLatihan {
  id: string; // LAT-0001
  tanggal: string; // YYYY-MM-DD or DD/MM/YYYY
  hari: string;
  materi: string;
  pembina: string;
  kategori?: string;
  waktuMulai?: string;
  waktuSelesai?: string;
  reguSasaran?: string;
  lokasi: string;
  durasi?: string;
  status: 'Terjadwal' | 'Selesai' | 'Ditunda' | 'Dibatalkan';
  keterangan?: string;
  catatan?: string;
}

export interface MateriLatihan {
  id: string; // MAT-0001
  judul?: string;
  judulMateri?: string;
  kategori: string;
  tingkat?: string;
  deskripsiRingkas?: string;
  kontenLengkap?: string;
  tujuan?: string;
  materi?: string;
  metode?: string;
  alat?: string;
  langkahKegiatan?: string;
  evaluasi?: string;
  fileUrl?: string;
  author?: string;
}

export type PresensiStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

export interface PresensiRecord {
  id: string; // PRS-0001
  tanggal: string;
  idLatihan?: string;
  idAnggota: string;
  namaAnggota: string;
  regu: string;
  status: PresensiStatus;
  kegiatan?: string;
  catatan?: string;
  keterangan?: string;
}

export interface SKUItem {
  id: string; // SKU-RAMU-01
  tingkat: 'Penggalang Ramu' | 'Penggalang Rakit' | 'Penggalang Terap';
  nomor: number;
  areaPengembangan: 'Spiritual' | 'Emosional' | 'Sosial' | 'Intelektual' | 'Fisik' | string;
  butirSKU: string;
  deskripsi?: string;
  panduanPengujian?: string;
}

export interface PencapaianSKU {
  id: string; // PSKU-0001
  idAnggota: string;
  namaAnggota?: string;
  regu?: string;
  idSKU?: string;
  idSKUItem?: string;
  nomorSKU?: number;
  tingkat: 'Penggalang Ramu' | 'Penggalang Rakit' | 'Penggalang Terap';
  nomorButir?: number;
  butirSKU?: string;
  status: 'Belum' | 'Proses' | 'Tuntas';
  tanggalPencapaian?: string;
  tanggalUjian?: string;
  penguji?: string;
  catatan?: string;
}

export interface SKKItem {
  id: string; // SKK-001
  namaSKK: string;
  bidang: 'Agama & Moral' | 'Patriotisme & Seni' | 'Ketangkasan & Kesehatan' | 'Keterampilan & Teknik Pembangunan' | 'Sosial & Kemanusiaan' | string;
  tingkat: 'Purwa' | 'Madya' | 'Utama' | string;
  deskripsi: string;
  gambarBadge?: string;
}

export interface PencapaianSKK {
  id: string; // PSKK-0001
  idAnggota: string;
  namaAnggota?: string;
  regu?: string;
  idSKK?: string;
  namaSKK: string;
  bidang?: string;
  tingkat: 'Purwa' | 'Madya' | 'Utama' | string;
  tanggal?: string;
  tanggalUjian?: string;
  penguji: string;
  status: 'Tuntas' | 'Proses';
  catatan?: string;
}

export interface Kegiatan {
  id: string; // KEG-0001
  namaKegiatan: string;
  jenis: 'Latihan Rutin' | 'Persami' | 'Mukhoyyam' | 'Perkemahan' | 'Penjelajahan' | 'Bakti Sosial' | 'Lomba' | 'Pelantikan' | 'Kegiatan Pramuka SIT' | 'Kegiatan Kwartir' | string;
  tanggalMulai: string;
  tanggalSelesai: string;
  tempat?: string;
  lokasi?: string;
  tingkat?: string;
  penanggungJawab: string;
  jumlahPeserta: number;
  anggaran: number;
  status: 'Rencana' | 'Berjalan' | 'Selesai' | 'Dibatalkan' | string;
  deskripsi?: string;
  keterangan?: string;
  pesertaIds?: string[];
}

export interface Inventaris {
  id: string; // INV-0001
  kodeBarang?: string;
  namaBarang: string;
  kategori: 'Tenda' | 'Tongkat' | 'Tali' | 'Kompas' | 'Semaphore' | 'Peluit' | 'Bendera' | 'P3K' | 'Peralatan Camping' | 'Peralatan Pioneering' | 'Peralatan Kegiatan' | 'Lainnya' | string;
  jumlah: number;
  satuan: string; // buah, set, rol, pack, unit
  kondisi: 'Baik' | 'Rusak Ringan' | 'Rusak Berat' | 'Hilang' | string;
  lokasi?: string;
  lokasiPenyimpanan?: string;
  tanggalPengadaan: string;
  harga?: number;
  sumberDana?: string;
  sumberPengadaan?: string;
  status?: 'Tersedia' | 'Dipinjam' | 'Perbaikan' | 'Afkir' | string;
  keterangan?: string;
}

export interface KeuanganRecord {
  id: string; // TRX-0001
  tanggal: string;
  jenis: 'Pemasukan' | 'Pengeluaran';
  kategori: string;
  keterangan?: string;
  uraian?: string;
  nominal: number;
  saldo?: number;
  saldoBerjalan?: number;
  sumberTujuan?: string;
  bukti?: string;
  idKegiatan?: string;
  penanggungJawab?: string;
  nomorKwitansi?: string;
}

export type Keuangan = KeuanganRecord;

export interface Prestasi {
  id: string; // PST-0001
  tanggal: string;
  namaKegiatan?: string;
  namaKejuaraan?: string;
  cabangLomba?: string;
  tingkat: 'Sekolah' | 'Kecamatan' | 'Kabupaten' | 'Provinsi' | 'Nasional' | 'Internasional' | string;
  kategori?: 'Regu' | 'Individu' | 'Pangkalan' | string;
  peringkat?: string;
  namaPesertaRegu?: string;
  prestasi?: string; // Juara 1, Juara Umum, dsb.
  penyelenggara: string;
  tahun: string;
  delegasiPeserta?: string;
  pembinaPendamping?: string;
  linkPiagam?: string;
  keterangan?: string;
}

export interface Dokumentasi {
  id: string; // DOK-0001
  idKegiatan?: string;
  namaKegiatan?: string;
  kegiatan?: string;
  tanggal: string;
  judul: string;
  kategori?: string;
  deskripsi?: string;
  driveUrl?: string;
  linkFoto?: string;
  linkVideo?: string;
  keterangan?: string;
}

export interface SuratRecord {
  id: string; // SRT-0001
  nomorSurat: string;
  tanggal?: string;
  tanggalSurat?: string;
  tanggalDiterimaDikirim?: string;
  jenisSurat: 'Surat Masuk' | 'Surat Keluar' | 'Surat Tugas' | 'Surat Mandat / Tugas' | 'Surat Izin Kegiatan' | 'Surat Pemberitahuan Orang Tua' | 'Surat Undangan' | 'Berita Acara' | string;
  perihal: string;
  pengirimTujuan?: string;
  tujuan?: string;
  pengirim?: string;
  penanggungJawab?: string;
  fileUrl?: string;
  linkFile?: string;
  keterangan?: string;
}

export type SuratMenyurat = SuratRecord;

export interface LogAktivitas {
  id: string;
  waktu?: string; // DD/MM/YYYY HH:mm:ss
  timestamp?: string;
  user: string;
  role?: UserRole;
  modul: string;
  aktivitas: string;
  targetId?: string;
  idData?: string;
  keterangan: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'pengaturan-landing'
  | 'pembina'
  | 'anggota'
  | 'regu'
  | 'program-kerja'
  | 'jadwal-latihan'
  | 'materi-latihan'
  | 'presensi'
  | 'sku'
  | 'skk'
  | 'kegiatan'
  | 'inventaris'
  | 'keuangan'
  | 'prestasi'
  | 'dokumentasi'
  | 'surat-menyurat'
  | 'laporan'
  | 'gas-guide'
  | 'pengaturan'
  | 'manajemen-user'
  | 'log-aktivitas';

// Landing Page Management Interfaces
export interface LandingHeroConfig {
  tagline: string;
  title: string;
  description: string;
  heroImageUrl: string;
  badgeAkbarTitle: string;
  badgeAkbarSub: string;
  badgeSkuTitle: string;
  badgeSkuSub: string;
  kwardaText: string;
}

export interface LandingKegiatanItem {
  id: string;
  judul: string;
  kategori: string;
  namaKegiatan: string;
  deskripsi: string;
  imageUrl: string;
  sasaran: string;
  frekuensi: string;
  tagWarna?: 'amber' | 'emerald' | 'blue' | 'purple' | string;
  icon?: string;
  poinHighlights?: string[];
}

export interface LandingKarakterItem {
  id: string;
  nomor: number;
  istilahArab: string;
  arti: string;
  keterangan?: string;
}

export interface LandingKodeKehormatan {
  triSatyaTitle: string;
  triSatyaIntro: string;
  triSatyaPoin: string[];
  dasaDarmaTitle: string;
  dasaDarmaItems: string[];
  karakterSITTitle: string;
  karakterSITItems: LandingKarakterItem[];
  catatanKarakter?: string;
}

export interface LandingReguItem {
  id: string;
  nama: string;
  gender: 'Pa' | 'Pi';
  semboyan?: string;
  pinru?: string;
  jumlahAnggota?: number;
  iconEmoji?: string;
  lambangUrl?: string;
}

export interface LandingPembinaItem {
  id: string;
  nama: string;
  gelar: string;
  jabatan: string;
  gender: 'Pa' | 'Pi';
  kontak?: string;
  email?: string;
  fotoUrl?: string;
  pesanMotivasi?: string;
}

export interface LandingDataReguPembina {
  namaPasukanPutra: string;
  noGudepPutra: string;
  namaPasukanPutri: string;
  noGudepPutri: string;
  reguPutra: LandingReguItem[];
  reguPutri: LandingReguItem[];
  pembinaList: LandingPembinaItem[];
}

export interface LandingPageContent {
  identitas: {
    namaPangkalan: string;
    namaSekolah: string;
    nomorGudepPutra: string;
    nomorGudepPutri: string;
    kwarran: string;
    kwarcab: string;
    kwarda: string;
    alamat: string;
    telepon: string;
    email: string;
    website?: string;
    logoPangkalanUrl?: string;
    hero: LandingHeroConfig;
  };
  galeriKegiatan: LandingKegiatanItem[];
  kodeKehormatan: LandingKodeKehormatan;
  reguDanPembina: LandingDataReguPembina;
}

