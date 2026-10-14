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

export const initialConfig: AppConfig = {
  namaPangkalan: '',
  namaSekolah: '',
  nomorGudepPutra: '',
  nomorGudepPutri: '',
  nomorGudepPa: '',
  nomorGudepPi: '',
  jenjang: 'Penggalang (SMP/MTs)',
  kwarran: '',
  kwarcab: '',
  kwarda: '',
  alamat: '',
  email: '',
  telepon: '',
  website: '',
  namaMabigus: '',
  kaMabigus: '',
  namaKetuaGudep: '',
  kaGudepPa: '',
  kaGudepPi: '',
  namaPembinaPutra: '',
  namaPembinaPutri: '',
  logoSekolah: '',
  logoPramuka: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Gerakan_Pramuka_Indonesia_WOSM_emblem.svg/200px-Gerakan_Pramuka_Indonesia_WOSM_emblem.svg.png',
  tahunPelajaran: '2026/2027',
  tahunKegiatan: '2026',
  googleSheetWebAppUrl: '',
  gasWebAppUrl: '',
  googleSpreadsheetId: '',
  spreadsheetUrl: '',
  autoSyncOnStart: true,
  autoSyncOnChange: true,
};

export const initialUsers: User[] = [
  {
    id: 'USR-001',
    username: 'admin',
    nama: 'Administrator',
    role: 'ADMIN',
    email: '',
    status: 'Aktif',
    lastLogin: '',
  },
];

// Seluruh data entitas dinamis dikosongkan agar 100% sinkron & bersumber murni dari Google Spreadsheet
export const initialPembina: Pembina[] = [];
export const initialAnggota: Anggota[] = [];
export const initialRegu: Regu[] = [];
export const initialProgramKerja: ProgramKerja[] = [];
export const initialJadwalLatihan: JadwalLatihan[] = [];
export const initialMateriLatihan: MateriLatihan[] = [];
export const initialPresensi: PresensiRecord[] = [];
export const initialPencapaianSKU: PencapaianSKU[] = [];
export const initialPencapaianSKK: PencapaianSKK[] = [];
export const initialKegiatan: Kegiatan[] = [];
export const initialInventaris: Inventaris[] = [];
export const initialKeuangan: KeuanganRecord[] = [];
export const initialPrestasi: Prestasi[] = [];
export const initialDokumentasi: Dokumentasi[] = [];
export const initialSuratMenyurat: SuratRecord[] = [];
export const initialLogAktivitas: LogAktivitas[] = [];

// Kurikulum Standar Nasional Gerakan Pramuka (SKU Penggalang Ramu, Rakit, Terap)
export const skuItemsMaster: SKUItem[] = [
  // PENGGALANG RAMU (30 Butir Standar)
  { id: 'SKU-RAMU-01', tingkat: 'Penggalang Ramu', nomor: 1, areaPengembangan: 'Spiritual', butirSKU: 'Selalu taat menjalankan ibadah agamanya secara pribadi ataupun berjamaah', panduanPengujian: 'Pengujian melalui keaktifan ibadah secara rutin' },
  { id: 'SKU-RAMU-02', tingkat: 'Penggalang Ramu', nomor: 2, areaPengembangan: 'Spiritual', butirSKU: 'Dapat menghafal dan memahami dasar-dasar keimanan sesuai agamanya', panduanPengujian: 'Melafalkan dan menjelaskan makna dengan pemahaman baik' },
  { id: 'SKU-RAMU-03', tingkat: 'Penggalang Ramu', nomor: 3, areaPengembangan: 'Spiritual', butirSKU: 'Dapat membaca kitab suci agamanya dengan baik dan memahami artinya', panduanPengujian: 'Tes pembacaan kitab suci bersama Pembina' },
  { id: 'SKU-RAMU-04', tingkat: 'Penggalang Ramu', nomor: 4, areaPengembangan: 'Spiritual', butirSKU: 'Dapat memimpin doa harian dan adab makan/minum/kegiatan secara santun', panduanPengujian: 'Praktik memimpin doa sebelum memulai latihan' },
  { id: 'SKU-RAMU-05', tingkat: 'Penggalang Ramu', nomor: 5, areaPengembangan: 'Emosional', butirSKU: 'Dapat menjelaskan tentang lambang Gerakan Pramuka dan WOSM', panduanPengujian: 'Menjelaskan arti kiasan tunas kelapa dan lambang bunga lili WOSM' },
  { id: 'SKU-RAMU-06', tingkat: 'Penggalang Ramu', nomor: 6, areaPengembangan: 'Emosional', butirSKU: 'Dapat melafalkan dan menjelaskan makna Tri Satya dan Dasa Darma Pramuka', panduanPengujian: 'Lafal lancar di hadapan pembina dan regu' },
  { id: 'SKU-RAMU-07', tingkat: 'Penggalang Ramu', nomor: 7, areaPengembangan: 'Sosial', butirSKU: 'Dapat menyebutkan struktur organisasi Gugus Depan dan Kwartir', panduanPengujian: 'Mengetahui nama Kamabigus, Pembina Gudep, Kwarran, dan Kwarcab' },
  { id: 'SKU-RAMU-08', tingkat: 'Penggalang Ramu', nomor: 8, areaPengembangan: 'Sosial', butirSKU: 'Tahu dan dapat menyanyikan Lagu Kebangsaan Indonesia Raya stanza 1 dan lagu wajib nasional', panduanPengujian: 'Menyanyikan lagu dengan sikap sempurna' },
  { id: 'SKU-RAMU-09', tingkat: 'Penggalang Ramu', nomor: 9, areaPengembangan: 'Sosial', butirSKU: 'Tahu arti dan sejarah Bendera Merah Putih serta cara mengibarkan/menurunkannya', panduanPengujian: 'Praktik tugas pasukan pengibar bendera regu' },
  { id: 'SKU-RAMU-10', tingkat: 'Penggalang Ramu', nomor: 10, areaPengembangan: 'Sosial', butirSKU: 'Dapat menyebutkan sila-sila Pancasila dan lambang burung Garuda Pancasila', panduanPengujian: 'Menyebutkan lambang bintang, rantai, pohon beringin, kepala banteng, padi kapas' },
  { id: 'SKU-RAMU-11', tingkat: 'Penggalang Ramu', nomor: 11, areaPengembangan: 'Intelektual', butirSKU: 'Dapat membuat dan menggunakan simpul hidup, simpul mati, simpul anyam, simpul pangkal, dan simpul jangkar', panduanPengujian: 'Praktik mengikat 5 simpul dasar' },
  { id: 'SKU-RAMU-12', tingkat: 'Penggalang Ramu', nomor: 12, areaPengembangan: 'Intelektual', butirSKU: 'Dapat menyampaikan isyarat Semaphore dan Morse alfabet A sampai Z', panduanPengujian: 'Mengirimkan minimal 1 kalimat sandi' },
  { id: 'SKU-RAMU-13', tingkat: 'Penggalang Ramu', nomor: 13, areaPengembangan: 'Intelektual', butirSKU: 'Dapat membaca jam, kompas 8 arah mata angin, dan menentukan arah utara magnetis', panduanPengujian: 'Praktik mencari sudut azimut target' },
  { id: 'SKU-RAMU-14', tingkat: 'Penggalang Ramu', nomor: 14, areaPengembangan: 'Intelektual', butirSKU: 'Dapat membuat peta pita sederhana dari perjalanan sejauh minimal 1 km', panduanPengujian: 'Menyerahkan buku laporan peta pita' },
  { id: 'SKU-RAMU-15', tingkat: 'Penggalang Ramu', nomor: 15, areaPengembangan: 'Fisik', butirSKU: 'Dapat melakukan Peraturan Baris Berbaris (PBB) dasar dengan aba-aba di tempat dan berjalan', panduanPengujian: 'Ujian PBB bersama tim pelatih' },
  { id: 'SKU-RAMU-16', tingkat: 'Penggalang Ramu', nomor: 16, areaPengembangan: 'Fisik', butirSKU: 'Selalu berpakaian rapi, menjaga kebersihan diri, memotong kuku, dan mandi teratur', panduanPengujian: 'Pemeriksaan kerapian seragam pramuka lengkap tanda atribut' },
  { id: 'SKU-RAMU-17', tingkat: 'Penggalang Ramu', nomor: 17, areaPengembangan: 'Fisik', butirSKU: 'Dapat melakukan pertolongan pertama pada luka lecet, mimisan, dan luka bakar ringan', panduanPengujian: 'Simulasi pembersihan dan pembalutan luka' },
  { id: 'SKU-RAMU-18', tingkat: 'Penggalang Ramu', nomor: 18, areaPengembangan: 'Intelektual', butirSKU: 'Memiliki buku tabungan pribadi dan rajin menabung minimal 3 bulan berturut-turut', panduanPengujian: 'Menunjukkan bukti buku tabungan atau tabungan regu' },
  { id: 'SKU-RAMU-19', tingkat: 'Penggalang Ramu', nomor: 19, areaPengembangan: 'Sosial', butirSKU: 'Dapat mendirikan tenda regu dan membongkarnya kembali secara rapi bersama anggota regu', panduanPengujian: 'Mendirikan tenda dome/prisma' },
  { id: 'SKU-RAMU-20', tingkat: 'Penggalang Ramu', nomor: 20, areaPengembangan: 'Intelektual', butirSKU: 'Dapat memasak makanan darurat / sederhana di alam terbuka', panduanPengujian: 'Praktik memasak menggunakan trangia/kompor lapangan' },

  // PENGGALANG RAKIT
  { id: 'SKU-RAKIT-01', tingkat: 'Penggalang Rakit', nomor: 1, areaPengembangan: 'Spiritual', butirSKU: 'Rajin beribadah dan memimpin ibadah bersama anggota regu', panduanPengujian: 'Praktik kepemimpinan ibadah bersama' },
  { id: 'SKU-RAKIT-02', tingkat: 'Penggalang Rakit', nomor: 2, areaPengembangan: 'Spiritual', butirSKU: 'Memahami makna nilai-nilai moralitas dan budi pekerti luhur dalam keseharian', panduanPengujian: 'Uji pemahaman moral bersama Pembina' },
  { id: 'SKU-RAKIT-03', tingkat: 'Penggalang Rakit', nomor: 3, areaPengembangan: 'Emosional', butirSKU: 'Dapat memimpin rapat musyawarah di tingkat regu dan mengambil keputusan bersama', panduanPengujian: 'Laporan notulen musyawarah regu' },
  { id: 'SKU-RAKIT-04', tingkat: 'Penggalang Rakit', nomor: 4, areaPengembangan: 'Sosial', butirSKU: 'Dapat menjelaskan sejarah kepanduan dunia Baden Powell dan sejarah Gerakan Pramuka RI', panduanPengujian: 'Tes lisan/tulis sejarah kepramukaan' },
  { id: 'SKU-RAKIT-05', tingkat: 'Penggalang Rakit', nomor: 5, areaPengembangan: 'Intelektual', butirSKU: 'Dapat membuat ikatan palang, silang, canggah, dan membuat tiang bendera kaki tiga', panduanPengujian: 'Membangun pionering mini kokoh' },
  { id: 'SKU-RAKIT-06', tingkat: 'Penggalang Rakit', nomor: 6, areaPengembangan: 'Intelektual', butirSKU: 'Dapat menaksir tinggi pohon/gedung dan lebar sungai menggunakan metode segitiga', panduanPengujian: 'Praktik pengukuran lapangan' },
  { id: 'SKU-RAKIT-07', tingkat: 'Penggalang Rakit', nomor: 7, areaPengembangan: 'Fisik', butirSKU: 'Dapat membuat tandu darurat dan membalut bidai patah tulang dengan mitella', panduanPengujian: 'Simulasi evakuasi korban lapangan' },
  { id: 'SKU-RAKIT-08', tingkat: 'Penggalang Rakit', nomor: 8, areaPengembangan: 'Intelektual', butirSKU: 'Dapat membaca dan mempraktikkan sandi kotak 1, kotak 2, dan sandi angka/rumput', panduanPengujian: 'Menerjemahkan sandi rahasia' },
  { id: 'SKU-RAKIT-09', tingkat: 'Penggalang Rakit', nomor: 9, areaPengembangan: 'Sosial', butirSKU: 'Pernah mengikuti kegiatan perkemahan minimal 2 hari 1 malam', panduanPengujian: 'Sertifikat atau piagam perkemahan' },
  { id: 'SKU-RAKIT-10', tingkat: 'Penggalang Rakit', nomor: 10, areaPengembangan: 'Intelektual', butirSKU: 'Memiliki minimal 2 TKK (Tanda Kecakapan Khusus) tingkat Purwa', panduanPengujian: 'Menunjukkan bukti sertifikat TKK Purwa' },

  // PENGGALANG TERAP
  { id: 'SKU-TERAP-01', tingkat: 'Penggalang Terap', nomor: 1, areaPengembangan: 'Spiritual', butirSKU: 'Dapat memberi kultum/ceramah singkat dan memimpin doa di hadapan pasukan penggalang', panduanPengujian: 'Penyampaian ceramah/refleksi singkat' },
  { id: 'SKU-TERAP-02', tingkat: 'Penggalang Terap', nomor: 2, areaPengembangan: 'Sosial', butirSKU: 'Dapat menjadi pemimpin upacara pasukan penggalang (Pratama) dengan sempurna', panduanPengujian: 'Menjadi pemimpin upacara pembukaan latihan' },
  { id: 'SKU-TERAP-03', tingkat: 'Penggalang Terap', nomor: 3, areaPengembangan: 'Intelektual', butirSKU: 'Dapat membuat rancangan pioneering kompleks (menara pandang / jembatan tali)', panduanPengujian: 'Gambar teknik dan pembuatan konstruksi utuh' },
  { id: 'SKU-TERAP-04', tingkat: 'Penggalang Terap', nomor: 4, areaPengembangan: 'Intelektual', butirSKU: 'Dapat melakukan perjalanan penjelajahan (wide game) dengan membaca kompas dan peta topografi', panduanPengujian: 'Laporan penjelajahan lapangan' },
  { id: 'SKU-TERAP-05', tingkat: 'Penggalang Terap', nomor: 5, areaPengembangan: 'Intelektual', butirSKU: 'Memiliki minimal 5 TKK (minimal 2 tingkat Madya dan 3 tingkat Purwa)', panduanPengujian: 'Menunjukkan bukti sertifikat TKK' },
  { id: 'SKU-TERAP-06', tingkat: 'Penggalang Terap', nomor: 6, areaPengembangan: 'Sosial', butirSKU: 'Dapat mengelola administrasi regu dan membuat proposal kegiatan sederhana', panduanPengujian: 'Menyerahkan buku kas dan presensi regu' },
];

// Standar Kecakapan Khusus (SKK) Resmi
export const skkItemsMaster: SKKItem[] = [
  { id: 'SKK-001', namaSKK: 'Shalat & Doa (Keagamaan)', bidang: 'Agama & Moral', tingkat: 'Purwa', deskripsi: 'Hafal bacaan shalat wajib, sujud sahwi, dan wirid dzikir ba’da shalat dengan tartil' },
  { id: 'SKK-002', namaSKK: 'Qari / Tilawah Kitab Suci', bidang: 'Agama & Moral', tingkat: 'Purwa', deskripsi: 'Mampu membaca kitab suci dengan tajwid, makharijul huruf, dan nada murattal yang indah' },
  { id: 'SKK-003', namaSKK: 'Berkemah (Campcraft)', bidang: 'Ketangkasan & Kesehatan', tingkat: 'Purwa', deskripsi: 'Tahu cara memilih tapak kemah, mendirikan tenda, membuat parit perlindungan, dan memasak lapangan' },
  { id: 'SKK-004', namaSKK: 'Pertolongan Pertama (P3K)', bidang: 'Sosial & Kemanusiaan', tingkat: 'Purwa', deskripsi: 'Menguasai pembalutan mitella, pembidaian fraktur, penanganan luka gigitan ular dan evakuasi tandu' },
  { id: 'SKK-005', namaSKK: 'Juru Isyarat (Morse & Semaphore)', bidang: 'Keterampilan & Teknik Pembangunan', tingkat: 'Purwa', deskripsi: 'Mampu membaca dan mengirim pesan sandi semaphore dan peluit morse dengan kecepatan stabil' },
  { id: 'SKK-006', namaSKK: 'Pengamat (Scouting Observer)', bidang: 'Keterampilan & Teknik Pembangunan', tingkat: 'Purwa', deskripsi: 'Mampu mengingat 15 dari 20 macam benda Kim Game dalam 1 menit dan membaca jejak kaki di tanah' },
  { id: 'SKK-007', namaSKK: 'Menabung (Thrift & Finance)', bidang: 'Patriotisme & Seni', tingkat: 'Purwa', deskripsi: 'Memiliki catatan buku kas tabungan pribadi dan menyisihkan uang jajan minimal 3 bulan berturut-turut' },
  { id: 'SKK-008', namaSKK: 'Juru Masak (Camp Cook)', bidang: 'Keterampilan & Teknik Pembangunan', tingkat: 'Purwa', deskripsi: 'Mampu memasak makanan bergizi seimbang dan minuman hangat untuk satu regu di perkemahan' },
  { id: 'SKK-009', namaSKK: 'Gerak Jalan (Hiking)', bidang: 'Ketangkasan & Kesehatan', tingkat: 'Purwa', deskripsi: 'Pernah menempuh jalan kaki sejauh minimal 10 km dengan membawa perlengkapan standar' },
  { id: 'SKK-010', namaSKK: 'Pengatur Ruangan (Home Decor)', bidang: 'Patriotisme & Seni', tingkat: 'Purwa', deskripsi: 'Mampu menata ruangan sanggar pramuka atau kelas secara rapi, bersih, estetis, dan teratur' },
];

export const initialSKUItems = skuItemsMaster;
export const initialSKKItems = skkItemsMaster;
export const initialSurat = initialSuratMenyurat;
export const initialLogs = initialLogAktivitas;
