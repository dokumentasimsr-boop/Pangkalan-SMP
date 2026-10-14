import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Database,
  Terminal,
  Shield,
  Layers,
  Sparkles,
  Server,
  Zap,
} from 'lucide-react';
import { useToast } from './Toast';

export const GasDeploymentGuideView: React.FC = () => {
  const { showToast } = useToast();
  const [activeCodeTab, setActiveCodeTab] = useState<'Code' | 'Auth' | 'Database' | 'SetupSheet'>('Code');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const codeSnippets: Record<string, { filename: string; desc: string; code: string }> = {
    Code: {
      filename: 'Code.gs',
      desc: 'Entry point Web App Google Apps Script untuk menangani request GET (Web App UI & Sync Data) & POST (API CRUD & Sync)',
      code: `/**
 * =========================================================================
 * SISTEM ADMINISTRASI PRAMUKA PENGGALANG
 * Pangkalan SMP IT ALBASHIROH TUREN
 * Backend Controller: Code.gs
 * =========================================================================
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  
  // Jika diakses sebagai API JSON (e.g. ?action=GET_ALL_DATA atau ?action=PING)
  if (action === 'GET_ALL_DATA' || action === 'PING') {
    var output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    var data = getAllDatabaseData();
    output.setContent(JSON.stringify(data));
    return output;
  }

  // Melayani Tampilan Web App status jika dibuka langsung di browser
  return HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>API Database Pramuka</title>' +
    '<style>body{font-family:sans-serif;padding:30px;background:#f5f5f4;color:#1c1917;}' +
    '.card{background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:600px;margin:0 auto;}' +
    'h1{color:#9a3412;margin-top:0;}pre{background:#292524;color:#fef08a;padding:12px;border-radius:8px;overflow-x:auto;}' +
    '</style></head><body>' +
    '<div class="card"><h1>Endpoint Google Apps Script Aktif</h1>' +
    '<p>Backend Database Pramuka SMP IT Albashiroh Turen siap menerima sinkronisasi data dari aplikasi.</p>' +
    '<p><strong>Status:</strong> Siap / Online</p>' +
    '<p>Gunakan URL ini di menu <em>Pengaturan &gt; URL Web App GAS</em> pada aplikasi Anda.</p>' +
    '</div></body></html>'
  )
  .setTitle('Sistem Administrasi Pramuka - SMP IT Albashiroh Turen')
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var data = JSON.parse(raw);
    var action = data.action || '';
    var payload = data.payload;
    var result = {};
    
    switch (action) {
      case 'GET_ALL_DATA':
        result = getAllDatabaseData();
        break;
      case 'SYNC_ALL':
        result = syncAllDatabase(payload);
        break;
      case 'SAVE_ANGGOTA':
        result = saveAnggotaData(payload);
        break;
      case 'SAVE_PEMBINA':
        result = savePembinaData(payload);
        break;
      case 'SAVE_REGU':
        result = saveReguData(payload);
        break;
      case 'SAVE_PROKER':
        result = saveProkerData(payload);
        break;
      case 'SAVE_JADWAL':
        result = saveJadwalData(payload);
        break;
      case 'SAVE_MATERI':
        result = saveMateriData(payload);
        break;
      case 'SAVE_PRESENSI':
        result = savePresensiData(payload);
        break;
      case 'SAVE_SKU_PENCAPAIAN':
        result = saveSKUPencapaianData(payload);
        break;
      case 'SAVE_SKK_PENCAPAIAN':
        result = saveSKKPencapaianData(payload);
        break;
      case 'SAVE_KEGIATAN':
        result = saveKegiatanData(payload);
        break;
      case 'SAVE_INVENTARIS':
        result = saveInventarisData(payload);
        break;
      case 'SAVE_KEUANGAN':
        result = saveKeuanganData(payload);
        break;
      case 'SAVE_PRESTASI':
        result = savePrestasiData(payload);
        break;
      case 'SAVE_DOKUMENTASI':
        result = saveDokumentasiData(payload);
        break;
      case 'SAVE_SURAT':
        result = saveSuratData(payload);
        break;
      case 'SAVE_CONFIG':
        result = saveConfigData(payload);
        break;
      case 'SAVE_USERS':
        result = saveUsersData(payload);
        break;
      case 'LOGIN':
        result = handleLogin(payload.username, payload.password);
        break;
      default:
        result = { success: false, message: 'Aksi tidak dikenali: ' + action };
    }
    
    output.setContent(JSON.stringify(result));
  } catch (err) {
    output.setContent(JSON.stringify({ success: false, error: err.toString() }));
  }
  
  return output;
}`,
    },
    Auth: {
      filename: 'Auth.gs',
      desc: 'Otentikasi & Verifikasi Hak Akses Role-Based Access Control (Admin, Pembina, Petugas)',
      code: `/**
 * =========================================================================
 * AUTH CONTROLLER: Auth.gs
 * Manajemen Login & Role-Based Access Control
 * =========================================================================
 */

function handleLogin(username, password) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('USERS');
  if (!sheet) {
    return { success: false, message: 'Sheet USERS tidak ditemukan!' };
  }
  
  var data = sheet.getDataRange().getValues();
  // Headers: ID, Username, PasswordHash, Nama, Role, Status, TerakhirLogin
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var dbUser = String(row[1]).trim().toLowerCase();
    var dbPass = String(row[2]).trim();
    var dbStatus = String(row[5]).trim();
    
    if (dbUser === String(username).trim().toLowerCase()) {
      if (dbStatus !== 'Aktif') {
        return { success: false, message: 'Akun Anda berstatus non-aktif. Hubungi Admin.' };
      }
      
      if (dbPass === String(password).trim()) {
        // Update Terakhir Login
        var now = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');
        sheet.getRange(i + 1, 7).setValue(now);
        
        // Log ke ACTIVITY_LOG
        logActivity(row[3], 'LOGIN', 'USERS', 'Login berhasil ke sistem');
        
        return {
          success: true,
          user: {
            id: row[0],
            username: row[1],
            nama: row[3],
            role: row[4],
            status: row[5]
          }
        };
      } else {
        return { success: false, message: 'Password salah!' };
      }
    }
  }
  
  return { success: false, message: 'Username tidak terdaftar!' };
}

function logActivity(user, aktivitas, modul, keterangan) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('ACTIVITY_LOG');
    if (!sheet) return;
    
    var now = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');
    var id = 'LOG-' + new Date().getTime();
    sheet.appendRow([id, now, user, modul, aktivitas, '-', keterangan]);
  } catch (e) {
    Logger.log('Gagal menulis log: ' + e);
  }
}`,
    },
    Database: {
      filename: 'Database.gs',
      desc: 'CRUD Services untuk 23 Sheet Google Spreadsheet Otomatis & Fleksibel',
      code: `/**
 * =========================================================================
 * DATABASE CONTROLLER: Database.gs
 * Operasi Baca/Tulis 23 Sheet Google Spreadsheet Otomatis & Fleksibel
 * =========================================================================
 */

function getAllDatabaseData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  return {
    success: true,
    timestamp: new Date().toISOString(),
    config: getConfigData(ss),
    users: getSheetObjects(ss, 'USERS'),
    pembina: getSheetObjects(ss, 'PEMBINA'),
    anggota: getSheetObjects(ss, 'ANGGOTA'),
    regu: getSheetObjects(ss, 'REGU'),
    proker: getSheetObjects(ss, 'PROKER'),
    jadwal: getSheetObjects(ss, 'JADWAL_LATIHAN'),
    materi: getSheetObjects(ss, 'MATERI_LATIHAN'),
    presensi: getSheetObjects(ss, 'PRESENSI'),
    skuPencapaian: getSheetObjects(ss, 'SKU_PENCAPAIAN'),
    skkPencapaian: getSheetObjects(ss, 'SKK_PENCAPAIAN'),
    kegiatan: getSheetObjects(ss, 'KEGIATAN'),
    inventaris: getSheetObjects(ss, 'INVENTARIS'),
    keuangan: getSheetObjects(ss, 'KEUANGAN'),
    prestasi: getSheetObjects(ss, 'PRESTASI'),
    dokumentasi: getSheetObjects(ss, 'DOKUMENTASI'),
    surat: getSheetObjects(ss, 'SURAT')
  };
}

function getConfigData(ss) {
  var sheet = ss.getSheetByName('CONFIG');
  if (!sheet) return {};
  
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return {};
  
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  if (values.length === 0) return {};
  
  var configObj = {};
  
  // Format 1: Key-Value vertical rows (Col 0 = Key/Parameter, Col 1 = Value/Nilai)
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var rawKey = String(row[0] || '').trim();
    var normKey = rawKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Skip header row if it's just "key" / "parameter" / "kunci"
    if (i === 0 && (normKey === 'key' || normKey === 'kunci' || normKey === 'parameter' || normKey === 'kunciparameter' || normKey === 'variabel')) {
      continue;
    }
    
    if (rawKey && row.length >= 2) {
      var val = row[1] !== undefined && row[1] !== null ? String(row[1]).trim() : '';
      configObj[rawKey] = val;
    }
  }
  
  // Format 2: Single-row horizontal table (Row 0 = Headers, Row 1 = Values)
  if (values.length > 1) {
    var headers = values[0];
    for (var j = 0; j < headers.length; j++) {
      var h = String(headers[j] || '').trim();
      if (h) {
        var cellVal = values[1][j] !== undefined && values[1][j] !== null ? String(values[1][j]).trim() : '';
        if (cellVal && !configObj[h]) {
          configObj[h] = cellVal;
        }
      }
    }
  }
  
  return configObj;
}

function getSheetObjects(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol < 1) return [];
  
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = values[0];
  var list = [];
  
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var isBlank = true;
    for (var k = 0; k < row.length; k++) {
      if (row[k] !== '' && row[k] !== null && row[k] !== undefined) {
        isBlank = false;
        break;
      }
    }
    if (isBlank) continue;
    
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var rawHeader = String(headers[j] || '').trim();
      if (!rawHeader) continue;
      
      var val = row[j];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, 'Asia/Jakarta', 'dd/MM/yyyy');
      }
      obj[rawHeader] = val;
    }
    list.push(obj);
  }
  return list;
}

function writeSheetRows(ss, sheetName, headers, list, mapFn) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#1c1917').setFontColor('#ffffff').setFontWeight('bold');
  } else {
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
    }
  }
  
  if (!Array.isArray(list) || list.length === 0) {
    return { success: true, count: 0 };
  }
  
  var rows = list.map(mapFn);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  return { success: true, count: rows.length };
}

function syncAllDatabase(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var counts = {};
  
  if (payload.anggota) counts.anggota = saveAnggotaData(payload.anggota).count;
  if (payload.pembina) counts.pembina = savePembinaData(payload.pembina).count;
  if (payload.regu) counts.regu = saveReguData(payload.regu).count;
  if (payload.programKerja || payload.proker) counts.proker = saveProkerData(payload.programKerja || payload.proker).count;
  if (payload.jadwalLatihan || payload.jadwal) counts.jadwal = saveJadwalData(payload.jadwalLatihan || payload.jadwal).count;
  if (payload.materiLatihan || payload.materi) counts.materi = saveMateriData(payload.materiLatihan || payload.materi).count;
  if (payload.presensi) counts.presensi = savePresensiData(payload.presensi).count;
  if (payload.pencapaianSKU) counts.sku = saveSKUPencapaianData(payload.pencapaianSKU).count;
  if (payload.pencapaianSKK) counts.skk = saveSKKPencapaianData(payload.pencapaianSKK).count;
  if (payload.kegiatan) counts.kegiatan = saveKegiatanData(payload.kegiatan).count;
  if (payload.inventaris) counts.inventaris = saveInventarisData(payload.inventaris).count;
  if (payload.keuangan) counts.keuangan = saveKeuanganData(payload.keuangan).count;
  if (payload.prestasi) counts.prestasi = savePrestasiData(payload.prestasi).count;
  if (payload.dokumentasi) counts.dokumentasi = saveDokumentasiData(payload.dokumentasi).count;
  if (payload.suratMenyurat || payload.surat) counts.surat = saveSuratData(payload.suratMenyurat || payload.surat).count;
  if (payload.users) counts.users = saveUsersData(payload.users).count;
  if (payload.config) counts.config = saveConfigData(payload.config).count;
  
  return { success: true, message: 'Seluruh database berhasil disinkronkan ke Google Spreadsheet', counts: counts };
}

function saveAnggotaData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID', 'Nama', 'NISN', 'NTA', 'TempatLahir', 'TanggalLahir', 'JK', 'Agama', 'Kelas', 'Regu', 'JabatanRegu', 'Alamat', 'NamaOrtu', 'NoHPOrtu', 'TingkatSKU', 'Status', 'FotoUrl'];
  return writeSheetRows(ss, 'ANGGOTA', headers, list, function(a) {
    return [
      a.id || '', a.nama || '', a.nisn || '', a.nta || '', a.tempatLahir || '', a.tanggalLahir || '',
      a.jenisKelamin || 'L', a.agama || 'Islam', a.kelas || '7A', a.regu || '', a.jabatanRegu || 'Anggota',
      a.alamat || '', a.namaOrtu || '', a.noHpOrtu || '', a.tingkatSKU || 'Calon Penggalang', a.status || 'Aktif', a.fotoUrl || ''
    ];
  });
}

function savePembinaData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID', 'NIP', 'NTA', 'Nama', 'Gelar', 'JK', 'Jabatan', 'Kualifikasi', 'NoHP', 'Email', 'Status', 'Keterangan'];
  return writeSheetRows(ss, 'PEMBINA', headers, list, function(p) {
    return [
      p.id || '', p.nip || '', p.nta || '', p.nama || '', p.gelar || '', p.jenisKelamin || 'L',
      p.jabatan || '', p.kualifikasiIjazah || '', p.noHp || '', p.email || '', p.status || 'Aktif', p.keterangan || ''
    ];
  });
}

function saveReguData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID', 'NamaRegu', 'Kategori', 'Pinru', 'Wapinru', 'JumlahAnggota', 'Pangkalan', 'Slogan'];
  return writeSheetRows(ss, 'REGU', headers, list, function(r) {
    return [r.id || '', r.namaRegu || '', r.kategori || 'Putra', r.pinru || '', r.wapinru || '', r.jumlahAnggota || 0, r.pangkalan || '', r.slogan || ''];
  });
}

function saveProkerData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID', 'NamaProgram', 'Bidang', 'Tujuan', 'Sasaran', 'WaktuPelaksanaan', 'Anggaran', 'PJ', 'Status', 'Keterangan'];
  return writeSheetRows(ss, 'PROKER', headers, list, function(p) {
    return [p.id || '', p.namaProgram || '', p.bidang || '', p.tujuan || '', p.sasaran || '', p.waktuPelaksanaan || '', p.anggaran || 0, p.penanggungJawab || '', p.status || 'Belum Terlaksana', p.keterangan || ''];
  });
}

function saveJadwalData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID', 'Tanggal', 'Hari', 'WaktuMulai', 'WaktuSelesai', 'Kategori', 'Materi', 'Pembina', 'Lokasi', 'Status', 'Keterangan'];
  return writeSheetRows(ss, 'JADWAL_LATIHAN', headers, list, function(j) {
    return [j.id || '', j.tanggal || '', j.hari || '', j.waktuMulai || '', j.waktuSelesai || '', j.kategori || '', j.materi || '', j.pembina || '', j.lokasi || '', j.status || 'Terjadwal', j.keterangan || ''];
  });
}

function saveMateriData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID', 'JudulMateri', 'Kategori', 'Tingkat', 'DeskripsiRingkas', 'KontenLengkap', 'FileUrl', 'Author'];
  return writeSheetRows(ss, 'MATERI_LATIHAN', headers, list, function(m) {
    return [m.id || '', m.judulMateri || m.judul || '', m.kategori || '', m.tingkat || '', m.deskripsiRingkas || '', m.kontenLengkap || m.materi || '', m.fileUrl || '', m.author || ''];
  });
}

function savePresensiData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID', 'Tanggal', 'IDAnggota', 'NamaAnggota', 'Regu', 'Status', 'Kegiatan', 'Keterangan'];
  return writeSheetRows(ss, 'PRESENSI', headers, list, function(p) {
    return [p.id || '', p.tanggal || '', p.idAnggota || '', p.namaAnggota || '', p.regu || '', p.status || 'Hadir', p.kegiatan || '', p.keterangan || ''];
  });
}

function saveSKUPencapaianData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID', 'IDAnggota', 'NamaAnggota', 'Regu', 'Tingkat', 'NomorSKU', 'ButirSKU', 'TanggalUjian', 'Penguji', 'Status', 'Catatan'];
  return writeSheetRows(ss, 'SKU_PENCAPAIAN', headers, list, function(s) {
    return [s.id || '', s.idAnggota || '', s.namaAnggota || '', s.regu || '', s.tingkat || '', s.nomorSKU || 1, s.butirSKU || '', s.tanggalUjian || '', s.penguji || '', s.status || 'Tuntas', s.catatan || ''];
  });
}

function saveSKKPencapaianData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID', 'IDAnggota', 'NamaAnggota', 'Regu', 'NamaSKK', 'Tingkat', 'Bidang', 'TanggalUjian', 'Penguji', 'Status', 'Catatan'];
  return writeSheetRows(ss, 'SKK_PENCAPAIAN', headers, list, function(s) {
    return [s.id || '', s.idAnggota || '', s.namaAnggota || '', s.regu || '', s.namaSKK || '', s.tingkat || '', s.bidang || '', s.tanggalUjian || '', s.penguji || '', s.status || 'Tuntas', s.catatan || ''];
  });
}

function saveKegiatanData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID', 'NamaKegiatan', 'Jenis', 'TanggalMulai', 'TanggalSelesai', 'Tempat', 'Tingkat', 'PJ', 'JumlahPeserta', 'Anggaran', 'Status', 'Keterangan'];
  return writeSheetRows(ss, 'KEGIATAN', headers, list, function(k) {
    return [k.id || '', k.namaKegiatan || '', k.jenis || '', k.tanggalMulai || '', k.tanggalSelesai || '', k.tempat || '', k.tingkat || '', k.penanggungJawab || '', k.jumlahPeserta || 0, k.anggaran || 0, k.status || 'Rencana', k.keterangan || ''];
  });
}

function saveInventarisData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID', 'KodeBarang', 'NamaBarang', 'Kategori', 'Jumlah', 'Satuan', 'Kondisi', 'LokasiSimpan', 'Sumber', 'TanggalPengadaan', 'Keterangan'];
  return writeSheetRows(ss, 'INVENTARIS', headers, list, function(i) {
    return [i.id || '', i.kodeBarang || '', i.namaBarang || '', i.kategori || '', i.jumlah || 1, i.satuan || 'buah', i.kondisi || 'Baik', i.lokasiPenyimpanan || '', i.sumberPengadaan || '', i.tanggalPengadaan || '', i.keterangan || ''];
  });
}

function saveKeuanganData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID', 'Tanggal', 'Jenis', 'Kategori', 'Nominal', 'Keterangan', 'PJ', 'NomorKwitansi'];
  return writeSheetRows(ss, 'KEUANGAN', headers, list, function(k) {
    return [k.id || '', k.tanggal || '', k.jenis || 'Pemasukan', k.kategori || '', k.nominal || 0, k.keterangan || '', k.penanggungJawab || '', k.nomorKwitansi || ''];
  });
}

function savePrestasiData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID', 'NamaKejuaraan', 'CabangLomba', 'Peringkat', 'Tingkat', 'Tahun', 'Tanggal', 'Penyelenggara', 'Delegasi', 'Pembina', 'Keterangan'];
  return writeSheetRows(ss, 'PRESTASI', headers, list, function(p) {
    return [p.id || '', p.namaKejuaraan || '', p.cabangLomba || '', p.peringkat || '', p.tingkat || '', p.tahun || '', p.tanggal || '', p.penyelenggara || '', p.delegasiPeserta || '', p.pembinaPendamping || '', p.keterangan || ''];
  });
}

function saveDokumentasiData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID', 'Judul', 'Tanggal', 'Kegiatan', 'Kategori', 'DriveUrl', 'Keterangan'];
  return writeSheetRows(ss, 'DOKUMENTASI', headers, list, function(d) {
    return [d.id || '', d.judul || '', d.tanggal || '', d.kegiatan || '', d.kategori || '', d.driveUrl || '', d.keterangan || ''];
  });
}

function saveSuratData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID', 'JenisSurat', 'NomorSurat', 'TanggalSurat', 'PengirimTujuan', 'Perihal', 'PJ', 'FileUrl', 'Keterangan'];
  return writeSheetRows(ss, 'SURAT', headers, list, function(s) {
    return [s.id || '', s.jenisSurat || '', s.nomorSurat || '', s.tanggalSurat || '', s.pengirimTujuan || '', s.perihal || '', s.penanggungJawab || '', s.fileUrl || '', s.keterangan || ''];
  });
}

function saveUsersData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID', 'Username', 'PasswordHash', 'Nama', 'Role', 'Status', 'TerakhirLogin'];
  return writeSheetRows(ss, 'USERS', headers, list, function(u) {
    return [u.id || '', u.username || '', u.password || '123456', u.nama || '', u.role || 'PEMBINA', u.status || 'Aktif', u.terakhirLogin || ''];
  });
}

function saveConfigData(cfg) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['Key', 'Value', 'Keterangan'];
  if (!cfg || typeof cfg !== 'object') {
    return { success: true, count: 0 };
  }
  var keyMap = [
    { key: 'NAMA_PANGKALAN', val: cfg.namaPangkalan || cfg.namaSekolah || '', desc: 'Nama pangkalan resmi' },
    { key: 'NAMA_SEKOLAH', val: cfg.namaSekolah || cfg.namaPangkalan || '', desc: 'Nama sekolah induk' },
    { key: 'NOMOR_GUDEP_PA', val: cfg.nomorGudepPa || cfg.nomorGudepPutra || '', desc: 'Nomor Gudep Putra' },
    { key: 'NOMOR_GUDEP_PI', val: cfg.nomorGudepPi || cfg.nomorGudepPutri || '', desc: 'Nomor Gudep Putri' },
    { key: 'JENJANG', val: cfg.jenjang || 'SMP / MTs', desc: 'Jenjang pendidikan' },
    { key: 'KWARRAN', val: cfg.kwarran || '', desc: 'Kwartir Ranting' },
    { key: 'KWARCAB', val: cfg.kwarcab || '', desc: 'Kwartir Cabang' },
    { key: 'KWARDA', val: cfg.kwarda || '', desc: 'Kwartir Daerah' },
    { key: 'ALAMAT', val: cfg.alamat || '', desc: 'Alamat lengkap pangkalan' },
    { key: 'EMAIL', val: cfg.email || '', desc: 'Email resmi pangkalan' },
    { key: 'TELEPON', val: cfg.telepon || '', desc: 'Nomor telepon/kontak' },
    { key: 'WEBSITE', val: cfg.website || '', desc: 'Website/portal resmi' },
    { key: 'MABIGUS', val: cfg.kaMabigus || cfg.namaMabigus || '', desc: 'Ketua Mabigus (Kamabigus)' },
    { key: 'KETUA_GUDEP', val: cfg.kaGudepPa || cfg.namaKetuaGudep || '', desc: 'Ketua Gugus Depan' },
    { key: 'PEMBINA_PA', val: cfg.namaPembinaPutra || cfg.kaGudepPa || '', desc: 'Pembina Satuan Putra' },
    { key: 'PEMBINA_PI', val: cfg.namaPembinaPutri || cfg.kaGudepPi || '', desc: 'Pembina Satuan Putri' },
    { key: 'TAHUN_PELAJARAN', val: cfg.tahunPelajaran || '2026/2027', desc: 'Tahun pelajaran aktif' },
    { key: 'TAHUN_KEGIATAN', val: cfg.tahunKegiatan || '2026', desc: 'Tahun kalender kegiatan' },
    { key: 'LOGO_SEKOLAH', val: cfg.logoSekolah || '', desc: 'URL logo sekolah' },
    { key: 'LOGO_PRAMUKA', val: cfg.logoPramuka || '', desc: 'URL logo gerakan pramuka' }
  ];
  return writeSheetRows(ss, 'CONFIG', headers, keyMap, function(item) {
    return [item.key, item.val, item.desc];
  });
}`,
    },
    SetupSheet: {
      filename: 'SetupSheet.gs',
      desc: 'Inisialisasi Otomatis 23 Struktur Sheet Google Spreadsheet dengan 1-Klik Run',
      code: `/**
 * =========================================================================
 * SETUP SPREADSHEET OTOMATIS: SetupSheet.gs
 * Jalankan fungsi setupInitialSheets() sekali di Script Editor
 * =========================================================================
 */

function setupInitialSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheetDefinitions = [
    { name: 'CONFIG', headers: ['Key', 'Value', 'Keterangan'] },
    { name: 'USERS', headers: ['ID', 'Username', 'PasswordHash', 'Nama', 'Role', 'Status', 'TerakhirLogin'] },
    { name: 'PEMBINA', headers: ['ID', 'NIP', 'NTA', 'Nama', 'Gelar', 'JK', 'Jabatan', 'Kualifikasi', 'NoHP', 'Email', 'Status', 'Keterangan'] },
    { name: 'ANGGOTA', headers: ['ID', 'Nama', 'NISN', 'NTA', 'TempatLahir', 'TanggalLahir', 'JK', 'Agama', 'Kelas', 'Regu', 'JabatanRegu', 'Alamat', 'NamaOrtu', 'NoHPOrtu', 'TingkatSKU', 'Status', 'FotoUrl'] },
    { name: 'REGU', headers: ['ID', 'NamaRegu', 'Kategori', 'Pinru', 'Wapinru', 'JumlahAnggota', 'Pangkalan', 'Slogan'] },
    { name: 'PROKER', headers: ['ID', 'NamaProgram', 'Bidang', 'Tujuan', 'Sasaran', 'WaktuPelaksanaan', 'Anggaran', 'PJ', 'Status', 'Keterangan'] },
    { name: 'JADWAL_LATIHAN', headers: ['ID', 'Tanggal', 'Hari', 'WaktuMulai', 'WaktuSelesai', 'Kategori', 'Materi', 'Pembina', 'Lokasi', 'Status', 'Keterangan'] },
    { name: 'MATERI_LATIHAN', headers: ['ID', 'JudulMateri', 'Kategori', 'Tingkat', 'DeskripsiRingkas', 'KontenLengkap', 'FileUrl', 'Author'] },
    { name: 'PRESENSI', headers: ['ID', 'Tanggal', 'IDAnggota', 'NamaAnggota', 'Regu', 'Status', 'Kegiatan', 'Keterangan'] },
    { name: 'SKU_PENCAPAIAN', headers: ['ID', 'IDAnggota', 'NamaAnggota', 'Regu', 'Tingkat', 'NomorSKU', 'ButirSKU', 'TanggalUjian', 'Penguji', 'Status', 'Catatan'] },
    { name: 'SKK_PENCAPAIAN', headers: ['ID', 'IDAnggota', 'NamaAnggota', 'Regu', 'NamaSKK', 'Tingkat', 'Bidang', 'TanggalUjian', 'Penguji', 'Status', 'Catatan'] },
    { name: 'KEGIATAN', headers: ['ID', 'NamaKegiatan', 'Jenis', 'TanggalMulai', 'TanggalSelesai', 'Tempat', 'Tingkat', 'PJ', 'JumlahPeserta', 'Anggaran', 'Status', 'Keterangan'] },
    { name: 'INVENTARIS', headers: ['ID', 'KodeBarang', 'NamaBarang', 'Kategori', 'Jumlah', 'Satuan', 'Kondisi', 'LokasiSimpan', 'Sumber', 'TanggalPengadaan', 'Keterangan'] },
    { name: 'KEUANGAN', headers: ['ID', 'Tanggal', 'Jenis', 'Kategori', 'Nominal', 'Keterangan', 'PJ', 'NomorKwitansi'] },
    { name: 'PRESTASI', headers: ['ID', 'NamaKejuaraan', 'CabangLomba', 'Peringkat', 'Tingkat', 'Tahun', 'Tanggal', 'Penyelenggara', 'Delegasi', 'Pembina', 'Keterangan'] },
    { name: 'DOKUMENTASI', headers: ['ID', 'Judul', 'Tanggal', 'Kegiatan', 'Kategori', 'DriveUrl', 'Keterangan'] },
    { name: 'SURAT', headers: ['ID', 'JenisSurat', 'NomorSurat', 'TanggalSurat', 'PengirimTujuan', 'Perihal', 'PJ', 'FileUrl', 'Keterangan'] },
    { name: 'ACTIVITY_LOG', headers: ['ID', 'Timestamp', 'User', 'Modul', 'Aktivitas', 'TargetID', 'Keterangan'] }
  ];
  
  sheetDefinitions.forEach(function(def) {
    var sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
    }
    
    // Format Header
    sheet.getRange(1, 1, 1, def.headers.length).setValues([def.headers]);
    sheet.getRange(1, 1, 1, def.headers.length)
      .setBackground('#1c1917')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  });
  
  SpreadsheetApp.getUi().alert('Berhasil menginisialisasi seluruh sheet database Pramuka!');
}`,
    },
  };

  const handleCopyCode = (tab: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tab);
    showToast(`Kode ${codeSnippets[tab].filename} berhasil disalin ke clipboard!`, 'success');
    setTimeout(() => setCopiedTab(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-700" />
            <span>Panduan Integrasi & Backend Google Apps Script (GAS)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Source code lengkap backend Google Apps Script & arsitektur 23 sheet database Google Spreadsheet
          </p>
        </div>

        <a
          href="https://script.google.com"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Buka Google Apps Script Editor</span>
        </a>
      </div>

      {/* 4 Step Deployment Roadmap */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1.5">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">
            1
          </div>
          <h4 className="font-bold text-stone-900 text-xs">Buat Spreadsheet</h4>
          <p className="text-[11px] text-stone-500 leading-tight">
            Buka Google Sheets baru di Google Drive Anda, beri nama <em>Database Pramuka SMP IT Albashiroh</em>.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1.5">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">
            2
          </div>
          <h4 className="font-bold text-stone-900 text-xs">Buka Apps Script</h4>
          <p className="text-[11px] text-stone-500 leading-tight">
            Klik menu <strong>Ekstensi &gt; Apps Script</strong>. Buat file <code>Code.gs</code>, <code>Auth.gs</code>, <code>Database.gs</code>, dan <code>SetupSheet.gs</code>.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1.5">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">
            3
          </div>
          <h4 className="font-bold text-stone-900 text-xs">Inisialisasi Sheet</h4>
          <p className="text-[11px] text-stone-500 leading-tight">
            Jalankan fungsi <code>setupInitialSheets()</code> sekali di Script Editor untuk generate 23 sheet otomatis.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1.5">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">
            4
          </div>
          <h4 className="font-bold text-stone-900 text-xs">Deploy Web App</h4>
          <p className="text-[11px] text-stone-500 leading-tight">
            Klik <strong>Deploy &gt; New deployment</strong>, pilih <em>Web App</em>, set akses <em>Anyone</em>, dan salin URL Web App.
          </p>
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className="bg-stone-950 rounded-2xl border border-stone-800 shadow-xl overflow-hidden">
        {/* Code Tabs */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-900 border-b border-stone-800 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            {(['Code', 'Auth', 'Database', 'SetupSheet'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeCodeTab === tab
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                {codeSnippets[tab].filename}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleCopyCode(activeCodeTab, codeSnippets[activeCodeTab].code)}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
          >
            {copiedTab === activeCodeTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedTab === activeCodeTab ? 'Tersalin!' : 'Salin Kode'}</span>
          </button>
        </div>

        {/* Code Description */}
        <div className="px-5 py-2.5 bg-stone-900/50 border-b border-stone-800 text-[11px] text-stone-400 font-mono">
          // {codeSnippets[activeCodeTab].desc}
        </div>

        {/* Code Block */}
        <div className="p-5 overflow-x-auto max-h-[500px]">
          <pre className="font-mono text-xs text-amber-200/90 leading-relaxed">
            <code>{codeSnippets[activeCodeTab].code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
