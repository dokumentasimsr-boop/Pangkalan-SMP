import {
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
} from '../types';

/**
 * URL Web App Google Apps Script default terintegrasi langsung
 */
export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycby-8H2ZkmqDGumaaYQQmOgdTMdC2n_C0sWmZ22VHHONSy3S0CA-2UCCmzDnPxgrob2f/exec';

export interface FullDatabasePayload {
  config?: Partial<AppConfig>;
  users?: User[];
  pembina?: Pembina[];
  anggota?: Anggota[];
  regu?: Regu[];
  programKerja?: ProgramKerja[];
  jadwalLatihan?: JadwalLatihan[];
  materiLatihan?: MateriLatihan[];
  presensi?: PresensiRecord[];
  pencapaianSKU?: PencapaianSKU[];
  pencapaianSKK?: PencapaianSKK[];
  kegiatan?: Kegiatan[];
  inventaris?: Inventaris[];
  keuangan?: KeuanganRecord[];
  prestasi?: Prestasi[];
  dokumentasi?: Dokumentasi[];
  suratMenyurat?: SuratRecord[];
  logAktivitas?: LogAktivitas[];
}

export interface GasApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  counts?: Record<string, number>;
  timestamp?: string;
  [key: string]: unknown;
}

// Normalizer helpers for data from Google Sheets (which might have uppercase/lowercase headers or date objects)
function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
}

function formatDateValue(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'string') {
    // If it's an ISO string from JSON date
    if (val.includes('T') && val.includes('-')) {
      try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }
      } catch {
        // ignore
      }
    }
    return val.trim();
  }
  if (val instanceof Date || (typeof val === 'object' && val !== null && 'toISOString' in (val as Record<string, unknown>))) {
    const d = new Date(val as Date);
    if (!isNaN(d.getTime())) {
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }
  }
  return String(val).trim();
}

function parseNumber(val: unknown, fallback = 0): number {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (!val) return fallback;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? fallback : num;
}

// Maps arbitrary sheet row objects into normalized Anggota
export function normalizeAnggota(raw: Record<string, unknown>, index: number): Anggota {
  const norm: Record<string, unknown> = {};
  for (const k in raw) {
    norm[normalizeKey(k)] = raw[k];
  }

  const id = String(norm['id'] || `AGT-${String(index + 1).padStart(4, '0')}`).trim();
  const nama = String(norm['nama'] || norm['namaanggota'] || norm['namalengkap'] || 'Anggota').trim();
  const nisn = String(norm['nisn'] || '').trim();
  const nta = String(norm['nta'] || '').trim();
  const jenisKelamin = (String(norm['jeniskelamin'] || norm['jk'] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L') as 'L' | 'P';
  const tempatLahir = String(norm['tempatlahir'] || 'Malang').trim();
  const tanggalLahir = formatDateValue(norm['tanggallahir'] || '01/01/2010');
  const agama = String(norm['agama'] || 'Islam').trim();
  const kelas = String(norm['kelas'] || '7A').trim();
  const alamat = String(norm['alamat'] || '').trim();
  const namaOrtu = String(norm['namaortu'] || norm['orangtua'] || '').trim();
  const noHpOrtu = String(norm['nohportu'] || norm['nohp'] || norm['telepon'] || '').trim();
  const regu = String(norm['regu'] || norm['namaregu'] || 'Garuda').trim();
  const jabatanRegu = (norm['jabatanregu'] || norm['jabatan'] || 'Anggota') as 'Pinru' | 'Wapinru' | 'Anggota';
  const status = (norm['status'] || 'Aktif') as 'Aktif' | 'Alumni' | 'Pindah/Keluar';
  const tingkatSKU = (norm['tingkatsku'] || norm['tingkat'] || 'Calon Penggalang') as Anggota['tingkatSKU'];
  const fotoUrl = String(norm['fotourl'] || norm['foto'] || '').trim();

  return {
    id,
    nama,
    nisn,
    nta,
    jenisKelamin,
    tempatLahir,
    tanggalLahir,
    agama,
    kelas,
    alamat,
    namaOrtu,
    noHpOrtu,
    regu,
    jabatanRegu,
    status,
    tingkatSKU,
    fotoUrl,
  };
}

export function normalizePembina(raw: Record<string, unknown>, index: number): Pembina {
  const norm: Record<string, unknown> = {};
  for (const k in raw) {
    norm[normalizeKey(k)] = raw[k];
  }

  return {
    id: String(norm['id'] || `PEM-${String(index + 1).padStart(4, '0')}`).trim(),
    nip: String(norm['nip'] || '').trim(),
    nta: String(norm['nta'] || '').trim(),
    nama: String(norm['nama'] || norm['namalengkap'] || 'Pembina').trim(),
    gelar: String(norm['gelar'] || '').trim(),
    jenisKelamin: (String(norm['jeniskelamin'] || norm['jk'] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L') as 'L' | 'P',
    jabatan: String(norm['jabatan'] || 'Pembina Penggalang').trim(),
    kualifikasiIjazah: String(norm['kualifikasiijazah'] || norm['kualifikasi'] || 'KMD').trim(),
    noHp: String(norm['nohp'] || norm['telepon'] || norm['kontak'] || '').trim(),
    email: String(norm['email'] || '').trim(),
    status: (norm['status'] || 'Aktif') as Pembina['status'],
    keterangan: String(norm['keterangan'] || '').trim(),
  };
}

export function normalizeRegu(raw: Record<string, unknown>, index: number): Regu {
  const norm: Record<string, unknown> = {};
  for (const k in raw) {
    norm[normalizeKey(k)] = raw[k];
  }

  const namaRegu = String(norm['namaregu'] || norm['nama'] || `Regu ${index + 1}`).trim();
  const kategori = (String(norm['kategori'] || norm['gender'] || 'Putra').toLowerCase().includes('putri') ? 'Putri' : 'Putra') as 'Putra' | 'Putri';

  return {
    id: String(norm['id'] || `REG-${String(index + 1).padStart(3, '0')}`).trim(),
    namaRegu,
    kategori,
    pinru: String(norm['pinru'] || norm['pemimpinregu'] || '').trim(),
    wapinru: String(norm['wapinru'] || norm['wakilpemimpin'] || '').trim(),
    jumlahAnggota: parseNumber(norm['jumlahanggota'] || norm['jumlah'] || norm['anggota'], 0),
    pangkalan: String(norm['pangkalan'] || '').trim(),
    slogan: String(norm['slogan'] || norm['semboyan'] || '').trim(),
  };
}

export function normalizeProgramKerja(raw: Record<string, unknown>, index: number): ProgramKerja {
  const norm: Record<string, unknown> = {};
  for (const k in raw) {
    norm[normalizeKey(k)] = raw[k];
  }

  return {
    id: String(norm['id'] || `PRG-${String(index + 1).padStart(4, '0')}`).trim(),
    namaProgram: String(norm['namaprogram'] || norm['nama'] || norm['program'] || '').trim(),
    bidang: String(norm['bidang'] || 'Kepramukaan').trim(),
    tujuan: String(norm['tujuan'] || '').trim(),
    sasaran: String(norm['sasaran'] || '').trim(),
    waktuPelaksanaan: String(norm['waktupelaksanaan'] || norm['waktu'] || norm['tanggal'] || '').trim(),
    penanggungJawab: String(norm['penanggungjawab'] || norm['pj'] || '').trim(),
    anggaran: parseNumber(norm['anggaran'] || norm['dana'] || norm['biaya'], 0),
    status: (norm['status'] || 'Belum Terlaksana') as ProgramKerja['status'],
    keterangan: String(norm['keterangan'] || '').trim(),
  };
}

export function normalizeJadwal(raw: Record<string, unknown>, index: number): JadwalLatihan {
  const norm: Record<string, unknown> = {};
  for (const k in raw) {
    norm[normalizeKey(k)] = raw[k];
  }

  return {
    id: String(norm['id'] || `LAT-${String(index + 1).padStart(4, '0')}`).trim(),
    tanggal: formatDateValue(norm['tanggal'] || ''),
    hari: String(norm['hari'] || 'Jumat').trim(),
    waktuMulai: String(norm['waktumulai'] || '13:30').trim(),
    waktuSelesai: String(norm['waktuselesai'] || '15:30').trim(),
    kategori: String(norm['kategori'] || 'Rutin').trim(),
    materi: String(norm['materi'] || norm['judulmateri'] || '').trim(),
    pembina: String(norm['pembina'] || norm['instruktur'] || '').trim(),
    lokasi: String(norm['lokasi'] || norm['tempat'] || 'Pangkalan').trim(),
    status: (norm['status'] || 'Terjadwal') as JadwalLatihan['status'],
    keterangan: String(norm['keterangan'] || '').trim(),
  };
}

export function normalizeMateri(raw: Record<string, unknown>, index: number): MateriLatihan {
  const norm: Record<string, unknown> = {};
  for (const k in raw) {
    norm[normalizeKey(k)] = raw[k];
  }

  const judul = String(norm['judulmateri'] || norm['judul'] || norm['materi'] || `Materi ${index + 1}`).trim();
  const desc = String(norm['deskripsiringkas'] || norm['deskripsi'] || norm['tujuan'] || '').trim();
  const konten = String(norm['kontenlengkap'] || norm['materi'] || norm['isi'] || desc).trim();

  return {
    id: String(norm['id'] || `MAT-${String(index + 1).padStart(4, '0')}`).trim(),
    judul,
    judulMateri: judul,
    kategori: String(norm['kategori'] || 'Kepramukaan Umum').trim(),
    tingkat: String(norm['tingkat'] || 'Semua Tingkat').trim(),
    deskripsiRingkas: desc,
    kontenLengkap: konten,
    tujuan: desc,
    materi: konten,
    fileUrl: String(norm['fileurl'] || norm['link'] || '').trim(),
    author: String(norm['author'] || norm['penulis'] || 'Kak Pembina').trim(),
  };
}

export function normalizePresensi(raw: Record<string, unknown>, index: number): PresensiRecord {
  const norm: Record<string, unknown> = {};
  for (const k in raw) {
    norm[normalizeKey(k)] = raw[k];
  }

  return {
    id: String(norm['id'] || `PRS-${String(index + 1).padStart(4, '0')}`).trim(),
    tanggal: formatDateValue(norm['tanggal'] || ''),
    idAnggota: String(norm['idanggota'] || '').trim(),
    namaAnggota: String(norm['namaanggota'] || norm['nama'] || '').trim(),
    regu: String(norm['regu'] || '').trim(),
    status: (norm['status'] || 'Hadir') as PresensiRecord['status'],
    kegiatan: String(norm['kegiatan'] || 'Latihan Rutin Mingguan').trim(),
    keterangan: String(norm['keterangan'] || norm['catatan'] || '').trim(),
  };
}

export function normalizePencapaianSKU(raw: Record<string, unknown>, index: number): PencapaianSKU {
  const norm: Record<string, unknown> = {};
  for (const k in raw) {
    norm[normalizeKey(k)] = raw[k];
  }

  return {
    id: String(norm['id'] || `PSKU-${String(index + 1).padStart(4, '0')}`).trim(),
    idAnggota: String(norm['idanggota'] || '').trim(),
    namaAnggota: String(norm['namaanggota'] || norm['nama'] || '').trim(),
    regu: String(norm['regu'] || '').trim(),
    tingkat: (norm['tingkat'] || 'Penggalang Ramu') as PencapaianSKU['tingkat'],
    idSKU: String(norm['idsku'] || '').trim(),
    nomorSKU: parseNumber(norm['nomorsku'] || norm['nomorbutir'] || norm['nomor'], 1),
    butirSKU: String(norm['butirsku'] || norm['deskripsi'] || '').trim(),
    tanggalUjian: formatDateValue(norm['tanggalujian'] || norm['tanggalpencapaian'] || norm['tanggal'] || ''),
    penguji: String(norm['penguji'] || 'Pembina').trim(),
    status: (norm['status'] || 'Tuntas') as PencapaianSKU['status'],
    catatan: String(norm['catatan'] || norm['keterangan'] || '').trim(),
  };
}

export function normalizePencapaianSKK(raw: Record<string, unknown>, index: number): PencapaianSKK {
  const norm: Record<string, unknown> = {};
  for (const k in raw) {
    norm[normalizeKey(k)] = raw[k];
  }

  return {
    id: String(norm['id'] || `PSKK-${String(index + 1).padStart(4, '0')}`).trim(),
    idAnggota: String(norm['idanggota'] || '').trim(),
    namaAnggota: String(norm['namaanggota'] || norm['nama'] || '').trim(),
    regu: String(norm['regu'] || '').trim(),
    namaSKK: String(norm['namaskk'] || norm['skk'] || '').trim(),
    tingkat: (norm['tingkat'] || 'Purwa') as PencapaianSKK['tingkat'],
    bidang: String(norm['bidang'] || 'Agama & Moral').trim(),
    tanggalUjian: formatDateValue(norm['tanggalujian'] || norm['tanggal'] || ''),
    penguji: String(norm['penguji'] || 'Pembina').trim(),
    status: (norm['status'] || 'Tuntas') as PencapaianSKK['status'],
    catatan: String(norm['catatan'] || norm['keterangan'] || '').trim(),
  };
}

export function normalizeKegiatan(raw: Record<string, unknown>, index: number): Kegiatan {
  const norm: Record<string, unknown> = {};
  for (const k in raw) {
    norm[normalizeKey(k)] = raw[k];
  }

  return {
    id: String(norm['id'] || `KEG-${String(index + 1).padStart(4, '0')}`).trim(),
    namaKegiatan: String(norm['namakegiatan'] || norm['nama'] || '').trim(),
    jenis: String(norm['jenis'] || 'Perkemahan').trim(),
    tanggalMulai: formatDateValue(norm['tanggalmulai'] || norm['tanggal'] || ''),
    tanggalSelesai: formatDateValue(norm['tanggalselesai'] || norm['tanggalmulai'] || ''),
    tempat: String(norm['tempat'] || norm['lokasi'] || '').trim(),
    tingkat: String(norm['tingkat'] || 'Pangkalan').trim(),
    penanggungJawab: String(norm['penanggungjawab'] || norm['pj'] || '').trim(),
    jumlahPeserta: parseNumber(norm['jumlahpeserta'] || norm['peserta'], 0),
    anggaran: parseNumber(norm['anggaran'] || norm['biaya'], 0),
    status: String(norm['status'] || 'Rencana').trim(),
    keterangan: String(norm['keterangan'] || norm['deskripsi'] || '').trim(),
  };
}

export function normalizeInventaris(raw: Record<string, unknown>, index: number): Inventaris {
  const norm: Record<string, unknown> = {};
  for (const k in raw) {
    norm[normalizeKey(k)] = raw[k];
  }

  return {
    id: String(norm['id'] || `INV-${String(index + 1).padStart(4, '0')}`).trim(),
    kodeBarang: String(norm['kodebarang'] || norm['kode'] || '').trim(),
    namaBarang: String(norm['namabarang'] || norm['nama'] || '').trim(),
    kategori: String(norm['kategori'] || 'Lainnya').trim(),
    jumlah: parseNumber(norm['jumlah'] || norm['qty'], 1),
    satuan: String(norm['satuan'] || 'buah').trim(),
    kondisi: String(norm['kondisi'] || 'Baik').trim(),
    lokasiPenyimpanan: String(norm['lokasipenyimpanan'] || norm['lokasi'] || 'Sanggar Pramuka').trim(),
    sumberPengadaan: String(norm['sumberpengadaan'] || norm['sumber'] || 'BOS / Gudep').trim(),
    tanggalPengadaan: formatDateValue(norm['tanggalpengadaan'] || norm['tanggal'] || ''),
    keterangan: String(norm['keterangan'] || '').trim(),
  };
}

export function normalizeKeuangan(raw: Record<string, unknown>, index: number): KeuanganRecord {
  const norm: Record<string, unknown> = {};
  for (const k in raw) {
    norm[normalizeKey(k)] = raw[k];
  }

  const jenis = (String(norm['jenis'] || '').toLowerCase().includes('keluar') ? 'Pengeluaran' : 'Pemasukan') as 'Pemasukan' | 'Pengeluaran';

  return {
    id: String(norm['id'] || `TRX-${String(index + 1).padStart(4, '0')}`).trim(),
    tanggal: formatDateValue(norm['tanggal'] || ''),
    jenis,
    kategori: String(norm['kategori'] || 'Operasional').trim(),
    nominal: parseNumber(norm['nominal'] || norm['jumlah'] || norm['total'], 0),
    keterangan: String(norm['keterangan'] || norm['uraian'] || '').trim(),
    penanggungJawab: String(norm['penanggungjawab'] || norm['pj'] || '').trim(),
    nomorKwitansi: String(norm['nomorkwitansi'] || norm['kwitansi'] || norm['nobukti'] || '').trim(),
  };
}

export function normalizePrestasi(raw: Record<string, unknown>, index: number): Prestasi {
  const norm: Record<string, unknown> = {};
  for (const k in raw) {
    norm[normalizeKey(k)] = raw[k];
  }

  return {
    id: String(norm['id'] || `PST-${String(index + 1).padStart(4, '0')}`).trim(),
    namaKejuaraan: String(norm['namakejuaraan'] || norm['kejuaraan'] || norm['nama'] || '').trim(),
    cabangLomba: String(norm['cabanglomba'] || norm['lomba'] || '').trim(),
    peringkat: String(norm['peringkat'] || norm['prestasi'] || norm['juara'] || 'Juara 1').trim(),
    tingkat: String(norm['tingkat'] || 'Kecamatan').trim(),
    tahun: String(norm['tahun'] || '2024').trim(),
    tanggal: formatDateValue(norm['tanggal'] || ''),
    penyelenggara: String(norm['penyelenggara'] || 'Kwarran Turen').trim(),
    delegasiPeserta: String(norm['delegasipeserta'] || norm['delegasi'] || norm['peserta'] || '').trim(),
    pembinaPendamping: String(norm['pembinapendamping'] || norm['pembina'] || '').trim(),
    keterangan: String(norm['keterangan'] || '').trim(),
  };
}

export function normalizeDokumentasi(raw: Record<string, unknown>, index: number): Dokumentasi {
  const norm: Record<string, unknown> = {};
  for (const k in raw) {
    norm[normalizeKey(k)] = raw[k];
  }

  return {
    id: String(norm['id'] || `DOK-${String(index + 1).padStart(4, '0')}`).trim(),
    judul: String(norm['judul'] || norm['namakegiatan'] || 'Dokumentasi').trim(),
    tanggal: formatDateValue(norm['tanggal'] || ''),
    kegiatan: String(norm['kegiatan'] || norm['namakegiatan'] || '').trim(),
    kategori: String(norm['kategori'] || 'Foto Kegiatan').trim(),
    driveUrl: String(norm['driveurl'] || norm['link'] || norm['url'] || '').trim(),
    keterangan: String(norm['keterangan'] || '').trim(),
  };
}

export function normalizeSurat(raw: Record<string, unknown>, index: number): SuratRecord {
  const norm: Record<string, unknown> = {};
  for (const k in raw) {
    norm[normalizeKey(k)] = raw[k];
  }

  return {
    id: String(norm['id'] || `SRT-${String(index + 1).padStart(4, '0')}`).trim(),
    jenisSurat: String(norm['jenissurat'] || norm['jenis'] || 'Surat Keluar').trim(),
    nomorSurat: String(norm['nomorsurat'] || norm['nomor'] || '').trim(),
    tanggalSurat: formatDateValue(norm['tanggalsurat'] || norm['tanggal'] || ''),
    pengirimTujuan: String(norm['pengirimtujuan'] || norm['tujuan'] || norm['pengirim'] || '').trim(),
    perihal: String(norm['perihal'] || norm['isi'] || '').trim(),
    penanggungJawab: String(norm['penanggungjawab'] || norm['pj'] || '').trim(),
    fileUrl: String(norm['fileurl'] || norm['link'] || '').trim(),
    keterangan: String(norm['keterangan'] || '').trim(),
  };
}

export function normalizeUser(raw: Record<string, unknown>, index: number): User {
  const norm: Record<string, unknown> = {};
  for (const k in raw) {
    norm[normalizeKey(k)] = raw[k];
  }

  const roleStr = String(norm['role'] || 'PEMBINA').toUpperCase();
  const role = (roleStr.includes('ADMIN') ? 'ADMIN' : roleStr.includes('PETUGAS') ? 'PETUGAS' : 'PEMBINA') as User['role'];

  return {
    id: String(norm['id'] || `USR-${String(index + 1).padStart(3, '0')}`).trim(),
    username: String(norm['username'] || norm['user'] || `user${index + 1}`).trim(),
    nama: String(norm['nama'] || norm['namalengkap'] || 'Pengguna').trim(),
    role,
    status: (norm['status'] || 'Aktif') as User['status'],
    password: String(norm['password'] || norm['passwordhash'] || '123456').trim(),
    terakhirLogin: formatDateValue(norm['terakhirlogin'] || norm['lastlogin'] || 'Belum pernah'),
  };
}

export function normalizeConfig(raw: unknown, existingConfig?: Partial<AppConfig>): Partial<AppConfig> {
  if (!raw) return {};

  const kvMap: Record<string, string> = {};

  const cleanPrefix = (str: string): string => {
    return str
      .replace(/^[0-9]+[\.\-\)\s_:]+/, '') // Strip leading numbers "1.", "01 -", "1:", etc.
      .replace(/^[a-zA-Z][\.\-\)\s_:]+/, '') // Strip leading letters "A.", "a)", etc.
      .replace(/[:=]+$/, '') // Strip trailing colons or equals
      .trim();
  };

  const registerKv = (rawKey: string, rawVal: unknown) => {
    if (rawVal === undefined || rawVal === null) return;
    let v = String(rawVal).trim();
    if (!v || v === ':' || v === '=' || v === '-') return;

    // Clean any leading colon in value
    v = v.replace(/^[:=\s]+/, '').trim();
    if (!v) return;

    const normK = normalizeKey(rawKey);
    const cleanedK = normalizeKey(cleanPrefix(rawKey));

    const ignoredKeys = ['no', 'nomor', 'num', 'key', 'kunci', 'parameter', 'kunciparameter', 'namaparameter', 'variabel', 'setting', 'atribut', 'kolom', 'uraian', 'item'];

    if (normK && !ignoredKeys.includes(normK)) {
      kvMap[normK] = v;
    }
    if (cleanedK && !ignoredKeys.includes(cleanedK)) {
      kvMap[cleanedK] = v;
    }

    // Special auto-mapping for known keywords in key
    if (normK.includes('mabigus') || normK.includes('kamabigus') || normK.includes('kepalasekolah') || normK.includes('kepsek') || normK.includes('majelispembimbing')) {
      kvMap['kamabigus'] = v;
      kvMap['namamabigus'] = v;
      kvMap['ketuamabigus'] = v;
    }
    if (normK.includes('kagudep') || normK.includes('ketuagudep') || normK.includes('ketuagugusdepan')) {
      if (normK.includes('pi') || normK.includes('putri')) {
        kvMap['kagudeppi'] = v;
        kvMap['ketuagudeppi'] = v;
      } else {
        kvMap['kagudeppa'] = v;
        kvMap['ketuagudeppa'] = v;
        kvMap['namaketuagudep'] = v;
      }
    }
    if (normK.includes('pembinaputra') || normK.includes('pembinapa') || normK.includes('pembinasatuanputra')) {
      kvMap['namapembinaputra'] = v;
      kvMap['pembinaputra'] = v;
    }
    if (normK.includes('pembinaputri') || normK.includes('pembinapi') || normK.includes('pembinasatuanputri')) {
      kvMap['namapembinaputri'] = v;
      kvMap['pembinaputri'] = v;
    }
    if (normK.includes('pangkalan') && !normK.includes('nomor') && !normK.includes('no') && !normK.includes('alamat')) {
      kvMap['namapangkalan'] = v;
    }
    if ((normK.includes('sekolah') || normK.includes('instansi') || normK.includes('lembaga')) && !normK.includes('alamat') && !normK.includes('kepala')) {
      kvMap['namasekolah'] = v;
    }
    if (normK.includes('gudep') && (normK.includes('putra') || normK.includes('pa') || normK.includes('091')) && (normK.includes('no') || normK.includes('nomor') || /^[0-9]/.test(v))) {
      kvMap['nomorgudeppa'] = v;
      kvMap['nomorgudepputra'] = v;
    }
    if (normK.includes('gudep') && (normK.includes('putri') || normK.includes('pi') || normK.includes('092')) && (normK.includes('no') || normK.includes('nomor') || /^[0-9]/.test(v))) {
      kvMap['nomorgudeppi'] = v;
      kvMap['nomorgudepputri'] = v;
    }
    if (normK.includes('kwarran') || normK.includes('ranting') || normK.includes('kecamatan')) {
      kvMap['kwarran'] = v;
    }
    if (normK.includes('kwarcab') || normK.includes('cabang') || normK.includes('kabupaten') || normK.includes('kota')) {
      kvMap['kwarcab'] = v;
    }
    if (normK.includes('kwarda') || normK.includes('daerah') || normK.includes('provinsi')) {
      kvMap['kwarda'] = v;
    }
    if (normK.includes('alamat') || normK.includes('jalan') || normK.includes('lokasi')) {
      kvMap['alamat'] = v;
    }
    if (normK.includes('tahunpelajaran') || normK.includes('tahunajaran') || normK.includes('tapel') || normK === 'tp') {
      kvMap['tahunpelajaran'] = v;
    }
    if (normK.includes('tahunkegiatan') || normK.includes('tahunanggaran') || normK === 'tahun' || normK === 'thn') {
      kvMap['tahunkegiatan'] = v;
    }
  };

  // Helper to extract key-value from a single row array (handles any column layout)
  const parseRowArray = (row: unknown[]) => {
    if (!Array.isArray(row) || row.length === 0) return;
    
    // Clean cells
    const nonBlankCells = row
      .map(c => (c !== undefined && c !== null ? String(c).trim() : ''))
      .filter(c => c !== '');

    if (nonBlankCells.length === 0) return;

    // Filter out colon ':' or '=' standalone cells
    const meaningfulCells = nonBlankCells.filter(c => c !== ':' && c !== '=' && c !== '-');
    if (meaningfulCells.length === 0) return;

    if (meaningfulCells.length === 1) {
      // Could be "Ketua Mabigus: Ainul Yaqin" or "1. Ketua Mabigus = Ainul Yaqin"
      const cell = meaningfulCells[0];
      if (cell.includes(':') || cell.includes('=')) {
        const parts = cell.split(/[:=]/);
        if (parts.length >= 2) {
          registerKv(parts[0], parts.slice(1).join(':'));
          return;
        }
      }
      return;
    }

    // If first cell is a list number (e.g. "1", "01", "1.", "A."):
    let keyIdx = 0;
    if (/^[0-9]+[\.\)]?$/.test(meaningfulCells[0]) || /^[a-zA-Z][\.\)]$/.test(meaningfulCells[0])) {
      keyIdx = 1;
    }

    if (keyIdx < meaningfulCells.length) {
      const rawKey = meaningfulCells[keyIdx];
      // Value is the next meaningful cell
      const valIdx = keyIdx + 1;
      if (valIdx < meaningfulCells.length) {
        const rawVal = meaningfulCells[valIdx];
        registerKv(rawKey, rawVal);
      }
    }

    // Also handle 4+ column pairs: [Key1, Val1, Key2, Val2]
    if (meaningfulCells.length >= 4 && keyIdx === 0) {
      registerKv(meaningfulCells[0], meaningfulCells[1]);
      registerKv(meaningfulCells[2], meaningfulCells[3]);
    }
  };

  // Flatten any response shape (2D array, array of row objects, nested object)
  const extractKv = (item: unknown) => {
    if (!item) return;

    // Case 1: Array
    if (Array.isArray(item)) {
      if (item.length === 0) return;

      // Check if 2D array:
      if (Array.isArray(item[0])) {
        // Inspect row 0
        const row0 = item[0] as unknown[];
        const row0Cells = row0.map(c => String(c ?? '').trim());
        const firstCellNorm = normalizeKey(row0Cells[0] || '');
        const isHeaderKey = ['no', 'nomor', 'key', 'kunci', 'parameter', 'namaparameter', 'variabel', 'setting', 'atribut', 'uraian', 'item', 'jabatan'].includes(firstCellNorm);

        // Check if row 0 has multiple recognized Pramuka config keys horizontally (e.g. namaPangkalan, namaSekolah, kaMabigus)
        const recognizedKeywords = ['namapangkalan', 'namasekolah', 'kamabigus', 'namamabigus', 'ketuamabigus', 'nomorgudep', 'kwarran', 'kwarcab', 'kwarda', 'alamat', 'tahunpelajaran'];
        const matchedKeywordsInRow0 = row0Cells.filter(c => {
          const norm = normalizeKey(c);
          return recognizedKeywords.some(k => norm.includes(k) || k.includes(norm));
        });

        if (matchedKeywordsInRow0.length >= 2 && item.length > 1) {
          // Pure Horizontal Layout: Row 0 = Field Names, Row 1 = Values
          const headers = row0Cells;
          const dataRow = (item[1] as unknown[]) || [];
          for (let col = 0; col < headers.length; col++) {
            const h = headers[col];
            const val = dataRow[col];
            if (h) registerKv(h, val);
          }
        } else {
          // Vertical Layout (each row has Key and Value, regardless of headers)
          const startIdx = isHeaderKey ? 1 : 0;
          for (let i = startIdx; i < item.length; i++) {
            parseRowArray(item[i] as unknown[]);
          }
        }
        return;
      }

      // Array of Objects: [ { ... }, { ... } ]
      for (const el of item) {
        if (typeof el === 'object' && el !== null) {
          const rec = el as Record<string, unknown>;
          const entries = Object.entries(rec);

          // Check if this object represents a single Key-Value row from a spreadsheet table
          // e.g. { No: 1, Parameter: "Ketua Mabigus", Nilai: "Ainul Yaqin" }
          // e.g. { 'Nama Parameter': 'Kamabigus', 'Isi': 'Ainul Yaqin' }
          // e.g. { 'Jabatan': 'Ketua Mabigus', 'Nama': 'Ainul Yaqin' }
          let detectedKey = '';
          let detectedVal = '';

          // Look through all values in the object to see if any value is a known parameter name
          for (const [propName, propVal] of entries) {
            if (propVal === undefined || propVal === null) continue;
            const strVal = String(propVal).trim();
            if (!strVal || strVal === ':' || strVal === '=') continue;

            const normPropName = normalizeKey(propName);
            const normVal = normalizeKey(strVal);

            // Is the property name explicitly a key/parameter column?
            if (['key', 'kunci', 'parameter', 'namaparameter', 'kunciparameter', 'item', 'variabel', 'atribut', 'setting', 'uraian', 'jabatan', 'komponen', 'bidang', 'identitas'].includes(normPropName)) {
              detectedKey = strVal;
            } else if (['value', 'nilai', 'isi', 'data', 'val', 'nama', 'pejabat', 'keterangan', 'deskripsi', 'hasil', 'teks'].includes(normPropName)) {
              if (!detectedVal) detectedVal = strVal;
            }

            // Or is the cell VALUE itself a recognized parameter name (e.g. "Ketua Mabigus", "Nama Sekolah")?
            const isParamValue = [
              'mabigus', 'kamabigus', 'pangkalan', 'sekolah', 'gudep', 'kwarran', 'kwarcab', 'kwarda',
              'pembina', 'alamat', 'tahunpelajaran', 'tahunajaran', 'jenjang', 'telepon', 'email', 'website'
            ].some(keyword => normVal.includes(keyword));

            if (isParamValue && !detectedKey) {
              detectedKey = strVal;
            }
          }

          if (detectedKey) {
            // Find the corresponding value from the remaining fields in the object
            if (!detectedVal) {
              for (const [propName, propVal] of entries) {
                if (propVal === undefined || propVal === null) continue;
                const strVal = String(propVal).trim();
                const normPropName = normalizeKey(propName);
                if (
                  strVal &&
                  strVal !== detectedKey &&
                  strVal !== ':' &&
                  strVal !== '=' &&
                  !/^[0-9]+$/.test(strVal) && // Skip row numbers
                  !['no', 'nomor'].includes(normPropName)
                ) {
                  detectedVal = strVal;
                  break;
                }
              }
            }
            if (detectedVal) {
              registerKv(detectedKey, detectedVal);
              continue;
            }
          }

          // Otherwise, treat object properties directly as Key-Value pairs
          for (const [k, v] of entries) {
            if (v === undefined || v === null || v === '') continue;
            const normK = normalizeKey(k);

            if (['config', 'data', 'items', 'rows', 'payload', 'values'].includes(normK) && (Array.isArray(v) || typeof v === 'object')) {
              extractKv(v);
            } else if (typeof v === 'object' && !Array.isArray(v)) {
              extractKv(v);
            } else {
              registerKv(k, v);
            }
          }
        }
      }
      return;
    }

    // Case 2: Object
    if (typeof item === 'object' && item !== null) {
      const rec = item as Record<string, unknown>;
      const entries = Object.entries(rec);

      // Check if this object represents a single Key-Value row: e.g. { Key: "namaPangkalan", Value: "..." }
      let detectedKey = '';
      let detectedVal = '';
      for (const [propName, propVal] of entries) {
        if (propVal === undefined || propVal === null) continue;
        const strVal = String(propVal).trim();
        if (!strVal || strVal === ':' || strVal === '=') continue;
        const normPropName = normalizeKey(propName);
        if (['key', 'kunci', 'parameter', 'namaparameter', 'kunciparameter', 'item', 'variabel', 'atribut', 'setting', 'uraian', 'jabatan'].includes(normPropName)) {
          detectedKey = strVal;
        } else if (['value', 'nilai', 'isi', 'data', 'val'].includes(normPropName)) {
          if (!detectedVal) detectedVal = strVal;
        }
      }
      if (detectedKey && detectedVal) {
        registerKv(detectedKey, detectedVal);
      }

      for (const [k, v] of entries) {
        if (v === undefined || v === null || v === '') continue;
        const normK = normalizeKey(k);

        if (['config', 'data', 'items', 'rows', 'payload', 'values'].includes(normK) && (Array.isArray(v) || typeof v === 'object')) {
          extractKv(v);
        } else if (typeof v === 'object' && !Array.isArray(v)) {
          extractKv(v);
        } else {
          registerKv(k, v);
        }
      }
    }
  };

  extractKv(raw);

  // Multi-tier value extractor
  const getVal = (aliases: string[], fallback?: string): string | undefined => {
    // Tier 1: Direct normalized key match
    for (const alias of aliases) {
      const norm = normalizeKey(alias);
      if (kvMap[norm] !== undefined && kvMap[norm] !== '') {
        return kvMap[norm];
      }
    }

    // Tier 2: Substring contains match in kvMap keys
    for (const alias of aliases) {
      const normAlias = normalizeKey(alias);
      if (normAlias.length < 3) continue;

      for (const k in kvMap) {
        if (!kvMap[k]) continue;
        if (k === normAlias || k.includes(normAlias) || normAlias.includes(k)) {
          return kvMap[k];
        }
      }
    }

    return fallback;
  };

  // 1. Nama Pangkalan
  const namaPangkalan = getVal(
    ['namaPangkalan', 'pangkalan', 'namapangkalan', 'nama_pangkalan', 'namapangkalangudep', 'namalembaga', 'gugusdepan', 'namagudep', 'pangkalansekolah', 'pangkalangudep'],
    existingConfig?.namaPangkalan
  );

  // 2. Nama Sekolah Induk
  const namaSekolah = getVal(
    ['namaSekolah', 'namasekolah', 'sekolah', 'nama_sekolah', 'namalengkaplembaga', 'namasekolahinduk', 'namainstansi', 'instansi', 'lembaga', 'namasekolahpangkalan', 'namasekolahresmi', 'sekolahinduk', 'namalembagapendidikan', 'satuanpendidikan'],
    existingConfig?.namaSekolah
  );

  // 3. Nomor Gudep Putra
  const nomorGudepPa = getVal(
    ['nomorGudepPutra', 'nomorGudepPa', 'nomorgudepputra', 'nomorgudeppa', 'gudepPutra', 'gudepPa', 'gudep_putra', 'gudeppa', 'nogudeppa', 'nogudepputra', 'nomorgudep', 'nogudep_pa', 'nogudep_putra', 'nomorputra', 'nogudep'],
    existingConfig?.nomorGudepPa || existingConfig?.nomorGudepPutra
  );

  // 4. Nomor Gudep Putri
  const nomorGudepPi = getVal(
    ['nomorGudepPutri', 'nomorGudepPi', 'nomorgudepputri', 'nomorgudeppi', 'gudepPutri', 'gudepPi', 'gudep_putri', 'gudeppi', 'nogudeppi', 'nogudepputri', 'nogudep_pi', 'nogudep_putri', 'nomorputri'],
    existingConfig?.nomorGudepPi || existingConfig?.nomorGudepPutri
  );

  // 5. Jenjang Pendidikan
  const jenjang = getVal(
    ['jenjang', 'jenjangPendidikan', 'tingkat', 'tingkatpendidikan', 'jenjang_pendidikan', 'satuanpendidikan', 'jenjangsekolah', 'golongan', 'tingkatsekolah'],
    existingConfig?.jenjang || 'SMP / MTs'
  );

  // 6. Kwartir Ranting (Kwarran)
  const kwarran = getVal(
    ['kwarran', 'kwartirRanting', 'kwartir_ranting', 'ranting', 'kecamatan', 'kwaran', 'kwartirranting'],
    existingConfig?.kwarran
  );

  // 7. Kwartir Cabang (Kwarcab)
  const kwarcab = getVal(
    ['kwarcab', 'kwartirCabang', 'kwartir_cabang', 'cabang', 'kabupaten', 'kota', 'kwartircabang', 'kabupatenkota'],
    existingConfig?.kwarcab
  );

  // 8. Kwartir Daerah (Kwarda)
  const kwarda = getVal(
    ['kwarda', 'kwartirDaerah', 'kwartir_daerah', 'daerah', 'provinsi', 'kwartirdaerah'],
    existingConfig?.kwarda || 'Jawa Timur'
  );

  // 9. Alamat Lengkap
  const alamat = getVal(
    ['alamat', 'alamatPangkalan', 'alamatSekolah', 'lokasi', 'alamatlengkap', 'jalan', 'alamat_lengkap', 'alamatgudep', 'domisili'],
    existingConfig?.alamat
  );

  // 10. Email, Telepon, Website
  const email = getVal(
    ['email', 'emailResmi', 'emailPangkalan', 'emailSekolah', 'surel'],
    existingConfig?.email
  );

  const telepon = getVal(
    ['telepon', 'telp', 'nohp', 'whatsapp', 'notelp', 'nomortelepon', 'kontak', 'wa', 'handphone'],
    existingConfig?.telepon
  );

  const website = getVal(
    ['website', 'web', 'situs', 'linkwebsite', 'portal'],
    existingConfig?.website
  );

  // 11. Nama Mabigus (Kamabigus) - Supports Ketua Mabigus, Ainul Yaqin, etc.
  const kaMabigus = getVal(
    ['namaMabigus', 'kaMabigus', 'kamabigus', 'ketuaMabigus', 'mabigus', 'kepalaSekolah', 'kepsek', 'kamabigusnama', 'namaKamabigus', 'ketua_mabigus', 'namamabigus', 'namakepalasekolah', 'ka_mabigus', 'majelispembimbing', 'ketuamajelispembimbing', 'ketuamajelispembimbinggugusdepan', 'pembimbinggudep', 'kamabiguspangkalan'],
    existingConfig?.kaMabigus || existingConfig?.namaMabigus
  );

  // 12. Nama Ketua Gudep (Ka Gudep Putra & Putri)
  const kaGudepPa = getVal(
    ['namaKetuaGudep', 'kaGudepPa', 'kagudep', 'kaGudep', 'ketuaGudep', 'ketuaGudepPa', 'namaKetuaGudepPa', 'namakagudep', 'namakagudeppa', 'kagudepputra', 'namaketuagudep', 'ketua_gudep', 'ketuagudeppa', 'ketuagudepputra', 'ka_gudep', 'ketuagugusdepan'],
    existingConfig?.kaGudepPa || existingConfig?.namaKetuaGudep
  );

  const kaGudepPi = getVal(
    ['kaGudepPi', 'kagudeppi', 'ketuaGudepPi', 'ketuaGudepPutri', 'namakagudeppi', 'namakagudepputri', 'ketua_gudep_pi', 'ketuagudeppi', 'ketuagudepputri', 'namaketuagudeppi'],
    existingConfig?.kaGudepPi
  );

  // 13. Nama Pembina Putra
  const namaPembinaPutra = getVal(
    ['namaPembinaPutra', 'pembinaPutra', 'namapembinaputra', 'pembinapa', 'pembinasatuanputra', 'namapembinasatuanputra', 'pembina_pa', 'pembinaputra_nama', 'namapembina_pa', 'pembina_putra', 'pembinasatpa'],
    existingConfig?.namaPembinaPutra || kaGudepPa
  );

  // 14. Nama Pembina Putri
  const namaPembinaPutri = getVal(
    ['namaPembinaPutri', 'pembinaPutri', 'namapembinaputri', 'pembinapi', 'pembinasatuanputri', 'namapembinasatuanputri', 'pembina_pi', 'pembinaputri_nama', 'namapembina_pi', 'pembina_putri', 'pembinasatpi'],
    existingConfig?.namaPembinaPutri || kaGudepPi
  );

  // 15. Tahun Pelajaran & Tahun Kegiatan
  const tahunPelajaran = getVal(
    ['tahunPelajaran', 'tp', 'tahunAjaran', 'ta', 'tapel', 'periode', 'tahun_pelajaran', 'tahun_ajaran', 'tahunpelajaran', 'tahunakademik'],
    existingConfig?.tahunPelajaran || '2026/2027'
  );

  const tahunKegiatan = getVal(
    ['tahunKegiatan', 'tahun', 'thn', 'tahunkegiatan', 'tahunkegiatanberjalan', 'tahunanggaran'],
    existingConfig?.tahunKegiatan || '2026'
  );

  const logoSekolah = getVal(
    ['logoSekolah', 'logosekolah', 'logolembaga'],
    existingConfig?.logoSekolah
  );

  const logoPramuka = getVal(
    ['logoPramuka', 'logopramuka', 'logocikal'],
    existingConfig?.logoPramuka
  );

  const gasWebAppUrl = getVal(
    ['gasWebAppUrl', 'googleSheetWebAppUrl', 'webappurl', 'gasurl', 'scripturl', 'url'],
    existingConfig?.gasWebAppUrl
  );

  const googleSpreadsheetId = getVal(
    ['googleSpreadsheetId', 'spreadsheetId', 'sheetid'],
    existingConfig?.googleSpreadsheetId
  );

  const result: Partial<AppConfig> = {};
  if (namaPangkalan !== undefined) result.namaPangkalan = namaPangkalan;
  if (namaSekolah !== undefined) {
    result.namaSekolah = namaSekolah;
    if (!result.namaPangkalan) result.namaPangkalan = namaSekolah;
  } else if (result.namaPangkalan) {
    result.namaSekolah = result.namaPangkalan;
  }

  if (nomorGudepPa !== undefined) {
    result.nomorGudepPa = nomorGudepPa;
    result.nomorGudepPutra = nomorGudepPa;
  }
  if (nomorGudepPi !== undefined) {
    result.nomorGudepPi = nomorGudepPi;
    result.nomorGudepPutri = nomorGudepPi;
  }
  if (jenjang !== undefined) result.jenjang = jenjang;
  if (kwarran !== undefined) result.kwarran = kwarran;
  if (kwarcab !== undefined) result.kwarcab = kwarcab;
  if (kwarda !== undefined) result.kwarda = kwarda;
  if (alamat !== undefined) result.alamat = alamat;
  if (email !== undefined) result.email = email;
  if (telepon !== undefined) result.telepon = telepon;
  if (website !== undefined) result.website = website;
  if (kaMabigus !== undefined) {
    result.kaMabigus = kaMabigus;
    result.namaMabigus = kaMabigus;
  }
  if (kaGudepPa !== undefined) {
    result.kaGudepPa = kaGudepPa;
    result.namaKetuaGudep = kaGudepPa;
  }
  if (kaGudepPi !== undefined) result.kaGudepPi = kaGudepPi;
  if (namaPembinaPutra !== undefined) result.namaPembinaPutra = namaPembinaPutra;
  if (namaPembinaPutri !== undefined) result.namaPembinaPutri = namaPembinaPutri;
  if (tahunPelajaran !== undefined) result.tahunPelajaran = tahunPelajaran;
  if (tahunKegiatan !== undefined) result.tahunKegiatan = tahunKegiatan;
  if (logoSekolah !== undefined) result.logoSekolah = logoSekolah;
  if (logoPramuka !== undefined) result.logoPramuka = logoPramuka;
  if (gasWebAppUrl !== undefined && gasWebAppUrl.startsWith('http')) {
    result.gasWebAppUrl = gasWebAppUrl;
    result.googleSheetWebAppUrl = gasWebAppUrl;
  }
  if (googleSpreadsheetId !== undefined) result.googleSpreadsheetId = googleSpreadsheetId;

  return result;
}

export class GasService {
  /**
   * Memvalidasi apakah URL merupakan endpoint Google Apps Script Web App yang valid dan siap digunakan
   */
  static isValidGasUrl(url?: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
    if (
      trimmed.includes('AKfycbx...') ||
      trimmed.includes('your-script-id') ||
      trimmed.includes('example.com') ||
      trimmed === 'https://script.google.com/macros/s/' ||
      trimmed.endsWith('/macros/s/')
    ) {
      return false;
    }
    return true;
  }

  /**
   * Mengirim request ke Google Apps Script Web App
   * Menggunakan Content-Type text/plain untuk menghindari CORS Preflight OPTIONS error di GAS
   */
  static async requestGas<T = unknown>(
    webAppUrl: string,
    action: string,
    payload?: unknown,
    method: 'GET' | 'POST' = 'POST',
    timeoutMs = 35000
  ): Promise<GasApiResponse<T>> {
    const trimmedUrl = (webAppUrl || '').trim();
    if (!trimmedUrl || !trimmedUrl.startsWith('http')) {
      throw new Error('URL Web App Google Apps Script tidak valid.');
    }

    if (!this.isValidGasUrl(trimmedUrl)) {
      throw new Error('Format URL Web App tidak sesuai. Masukkan URL Web App Google Apps Script resmi.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      let response: Response;

      if (method === 'GET' && !payload) {
        const separator = trimmedUrl.includes('?') ? '&' : '?';
        const urlWithQuery = `${trimmedUrl}${separator}action=${encodeURIComponent(action)}&_t=${Date.now()}`;

        response = await fetch(urlWithQuery, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
        });
      } else {
        // GAS Web App POST with text/plain is optimal for CORS
        response = await fetch(trimmedUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({ action, payload, timestamp: Date.now() }),
          redirect: 'follow',
          signal: controller.signal,
        });
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return json as GasApiResponse<T>;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Waktu permintaan habis (Request Timeout). Proses sinkronisasi membutuhkan koneksi internet yang stabil.');
      }

      const rawMsg = err instanceof Error ? err.message : String(err);
      if (rawMsg.includes('Failed to fetch') || rawMsg.includes('NetworkError') || rawMsg.includes('Load failed')) {
        throw new Error(
          'Tidak dapat terhubung ke Google Apps Script. Pastikan Web App di-deploy dengan opsi "Who has access: Anyone" (Siapa Saja) dan URL berakhiran /exec.'
        );
      }

      throw new Error(`Gagal berkomunikasi dengan Google Apps Script: ${rawMsg}`);
    }
  }

  /**
   * Menguji konektivitas ke Google Apps Script Web App
   */
  static async testConnection(webAppUrl: string): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const trimmedUrl = (webAppUrl || '').trim();
    if (!this.isValidGasUrl(trimmedUrl)) {
      return {
        success: false,
        message: 'URL Google Apps Script tidak valid. Masukkan URL Web App resmi berakhiran /exec.',
        latencyMs: 0,
      };
    }

    const start = Date.now();
    try {
      // First try GET ?action=GET_ALL_DATA
      const res = await this.requestGas(trimmedUrl, 'GET_ALL_DATA', undefined, 'GET', 12000);
      const latency = Date.now() - start;

      if (res && res.success !== false) {
        return {
          success: true,
          message: `Koneksi sukses ke Google Spreadsheet! Waktu respon: ${latency} ms.`,
          latencyMs: latency,
        };
      } else {
        throw new Error(res.message || res.error || 'Respon GAS tidak valid.');
      }
    } catch (e: unknown) {
      // Fallback try POST
      try {
        const postRes = await this.requestGas(trimmedUrl, 'GET_ALL_DATA', {}, 'POST', 12000);
        const latency = Date.now() - start;
        if (postRes && postRes.success !== false) {
          return {
            success: true,
            message: `Koneksi sukses via POST! Waktu respon: ${latency} ms.`,
            latencyMs: latency,
          };
        }
      } catch {
        // continue to formatted error below
      }

      const msg = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        message: msg,
        latencyMs: Date.now() - start,
      };
    }
  }

  /**
   * Menarik seluruh data database dari 23 sheet di Google Spreadsheet
   */
  static async pullFullDatabase(webAppUrl: string): Promise<FullDatabasePayload> {
    const res = await this.requestGas<Record<string, unknown[]>>(webAppUrl, 'GET_ALL_DATA', undefined, 'GET');
    
    if (!res || res.success === false) {
      // Try POST if GET returns error
      const postRes = await this.requestGas<Record<string, unknown[]>>(webAppUrl, 'GET_ALL_DATA', {}, 'POST');
      if (!postRes || postRes.success === false) {
        throw new Error(postRes?.message || postRes?.error || 'Gagal mengambil data dari Google Spreadsheet.');
      }
      return this.parseAndNormalizeGasPayload(postRes);
    }

    return this.parseAndNormalizeGasPayload(res);
  }

  private static parseAndNormalizeGasPayload(res: GasApiResponse<any>): FullDatabasePayload {
    const data = (res.data || res) as Record<string, any[]>;

    const result: FullDatabasePayload = {};

    // 1. ANGGOTA
    if (Array.isArray(data.anggota)) {
      result.anggota = data.anggota.map((row: any, idx: number) => normalizeAnggota(row, idx));
    }

    // 2. PEMBINA
    if (Array.isArray(data.pembina)) {
      result.pembina = data.pembina.map((row: any, idx: number) => normalizePembina(row, idx));
    }

    // 3. REGU
    if (Array.isArray(data.regu)) {
      result.regu = data.regu.map((row: any, idx: number) => normalizeRegu(row, idx));
    }

    // 4. PROGRAM KERJA / PROKER
    const prokerData = data.programKerja || data.proker || data.program;
    if (Array.isArray(prokerData)) {
      result.programKerja = prokerData.map((row: any, idx: number) => normalizeProgramKerja(row, idx));
    }

    // 5. JADWAL LATIHAN
    const jadwalData = data.jadwalLatihan || data.jadwal || data.latihan;
    if (Array.isArray(jadwalData)) {
      result.jadwalLatihan = jadwalData.map((row: any, idx: number) => normalizeJadwal(row, idx));
    }

    // 6. MATERI LATIHAN
    const materiData = data.materiLatihan || data.materi;
    if (Array.isArray(materiData)) {
      result.materiLatihan = materiData.map((row: any, idx: number) => normalizeMateri(row, idx));
    }

    // 7. PRESENSI
    if (Array.isArray(data.presensi)) {
      result.presensi = data.presensi.map((row: any, idx: number) => normalizePresensi(row, idx));
    }

    // 8. SKU PENCAPAIAN
    const skuData = data.pencapaianSKU || data.skuPencapaian || data.sku;
    if (Array.isArray(skuData)) {
      result.pencapaianSKU = skuData.map((row: any, idx: number) => normalizePencapaianSKU(row, idx));
    }

    // 9. SKK PENCAPAIAN
    const skkData = data.pencapaianSKK || data.skkPencapaian || data.skk;
    if (Array.isArray(skkData)) {
      result.pencapaianSKK = skkData.map((row: any, idx: number) => normalizePencapaianSKK(row, idx));
    }

    // 10. KEGIATAN
    if (Array.isArray(data.kegiatan)) {
      result.kegiatan = data.kegiatan.map((row: any, idx: number) => normalizeKegiatan(row, idx));
    }

    // 11. INVENTARIS
    if (Array.isArray(data.inventaris)) {
      result.inventaris = data.inventaris.map((row: any, idx: number) => normalizeInventaris(row, idx));
    }

    // 12. KEUANGAN
    if (Array.isArray(data.keuangan)) {
      result.keuangan = data.keuangan.map((row: any, idx: number) => normalizeKeuangan(row, idx));
    }

    // 13. PRESTASI
    if (Array.isArray(data.prestasi)) {
      result.prestasi = data.prestasi.map((row: any, idx: number) => normalizePrestasi(row, idx));
    }

    // 14. DOKUMENTASI
    if (Array.isArray(data.dokumentasi)) {
      result.dokumentasi = data.dokumentasi.map((row: any, idx: number) => normalizeDokumentasi(row, idx));
    }

    // 15. SURAT
    const suratData = data.suratMenyurat || data.surat;
    if (Array.isArray(suratData)) {
      result.suratMenyurat = suratData.map((row: any, idx: number) => normalizeSurat(row, idx));
    }

    // 16. USERS
    if (Array.isArray(data.users)) {
      result.users = data.users.map((row: any, idx: number) => normalizeUser(row, idx));
    }

    // 17. CONFIG
    if (data.config) {
      result.config = normalizeConfig(data.config);
    }

    return result;
  }

  /**
   * Mengirim & menimpa seluruh sheet database ke Google Spreadsheet (Push All)
   */
  static async pushFullDatabase(webAppUrl: string, fullData: FullDatabasePayload): Promise<GasApiResponse> {
    return await this.requestGas(webAppUrl, 'SYNC_ALL', fullData, 'POST', 45000);
  }

  /**
   * Menarik data konfigurasi identitas pangkalan dari sheet CONFIG
   */
  static async pullConfig(webAppUrl: string): Promise<Partial<AppConfig>> {
    try {
      // First try GET ?action=GET_CONFIG
      const res = await this.requestGas<any>(webAppUrl, 'GET_CONFIG', undefined, 'GET', 12000);
      if (res && res.success !== false) {
        const rawConfig = res.config || res.data || res;
        const norm = normalizeConfig(rawConfig);
        if (Object.keys(norm).length > 0) return norm;
      }
    } catch {
      // Continue to full pull
    }

    // Pull full database as fallback
    const full = await this.pullFullDatabase(webAppUrl);
    return full.config || {};
  }

  /**
   * Menyimpan entitas spesifik ke Google Spreadsheet secara terarah
   */
  static async pushEntity(webAppUrl: string, action: string, data: unknown): Promise<GasApiResponse> {
    return await this.requestGas(webAppUrl, action, data, 'POST');
  }
}
