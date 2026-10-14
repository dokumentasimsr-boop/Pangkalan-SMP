export interface GASFile {
  filename: string;
  type: 'gs' | 'html' | 'json';
  description: string;
  code: string;
}

export const gasFiles: GASFile[] = [
  {
    filename: 'SetupSpreadsheet.gs',
    type: 'gs',
    description: 'Skrip Otomatis 1-Klik Pembuat Seluruh 23 Sheet, Header Berwarna, Validasi, dan Data Awal',
    code: `/**
 * SISTEM ADMINISTRASI PRAMUKA PENGGALANG
 * Pangkalan SMP IT ALBASHIROH TUREN
 * 
 * Skrip Inisialisasi Database Google Spreadsheet
 * Jalankan fungsi "setupEntireDatabase()" satu kali untuk membuat seluruh sheet dan formatnya.
 */

function setupEntireDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const sheetsDef = [
    {
      name: "CONFIG",
      headers: ["Key", "Value", "Keterangan"],
      data: [
        ["NAMA_PANGKALAN", "Pangkalan Pramuka", "Nama pangkalan resmi"],
        ["NAMA_SEKOLAH", "Nama Sekolah / Madrasah", "Nama sekolah induk"],
        ["NOMOR_GUDEP_PA", "", "Nomor Gudep Putra"],
        ["NOMOR_GUDEP_PI", "", "Nomor Gudep Putri"],
        ["KWARRAN", "", "Kwartir Ranting"],
        ["KWARCAB", "", "Kwartir Cabang"],
        ["KWARDA", "", "Kwartir Daerah"],
        ["MABIGUS", "", "Ketua Majelis Pembimbing Gugus Depan"],
        ["KETUA_GUDEP", "", "Ketua Gugus Depan"],
        ["PEMBINA_PA", "", "Pembina Satuan Putra"],
        ["PEMBINA_PI", "", "Pembina Satuan Putri"],
        ["TAHUN_PELAJARAN", "2026/2027", "Tahun pelajaran aktif"],
        ["TAHUN_KEGIATAN", "2026", "Tahun kalender kegiatan"]
      ]
    },
    {
      name: "USERS",
      headers: ["ID_User", "Username", "PasswordHash", "Nama_Lengkap", "Role", "Email", "Status", "Last_Login", "Created_At"]
    },
    {
      name: "PEMBINA",
      headers: ["ID_Pembina", "NIP_NUPTK", "Nama_Lengkap", "Gelar", "Jenis_Kelamin", "Jabatan", "Nomor_HP", "Email", "Status", "Keterangan", "Created_At"]
    },
    {
      name: "ANGGOTA",
      headers: ["ID_Anggota", "NIS_NISN", "Nama_Lengkap", "Jenis_Kelamin", "Tempat_Lahir", "Tanggal_Lahir", "Kelas", "Alamat", "Nama_Ortu", "Nomor_HP_Ortu", "Regu", "Status", "Tanggal_Bergabung", "Nomor_Gudep", "Tingkat_SKU", "Keterangan", "Created_At"]
    },
    {
      name: "REGU",
      headers: ["ID_Regu", "Nama_Regu", "Kategori", "Pangkalan", "Tahun", "Pemimpin_Regu", "Wakil_Pemimpin", "Pembina_Pendamping", "Jumlah_Anggota", "Status", "Keterangan", "Created_At"]
    },
    {
      name: "ANGGOTA_REGU",
      headers: ["ID_Anggota_Regu", "ID_Regu", "Nama_Regu", "ID_Anggota", "Nama_Anggota", "Jabatan_Regu", "Tahun_Ajaran", "Status"]
    },
    {
      name: "PROGRAM_KERJA",
      headers: ["ID_Program", "Nama_Program", "Bidang", "Tujuan", "Sasaran", "Waktu_Pelaksanaan", "Penanggung_Jawab", "Indikator_Keberhasilan", "Anggaran", "Status", "Keterangan", "Created_At"]
    },
    {
      name: "JADWAL_LATIHAN",
      headers: ["ID_Latihan", "Tanggal", "Hari", "Materi", "Pembina", "Regu_Sasaran", "Lokasi", "Durasi", "Status", "Catatan", "Created_At"]
    },
    {
      name: "PRESENSI",
      headers: ["ID_Presensi", "Tanggal", "ID_Latihan", "ID_Anggota", "Nama_Anggota", "Regu", "Status_Kehadiran", "Catatan", "Created_At"]
    },
    {
      name: "MATERI_LATIHAN",
      headers: ["ID_Materi", "Judul", "Kategori", "Tujuan", "Materi", "Metode", "Alat", "Langkah_Kegiatan", "Evaluasi", "Created_At"]
    },
    {
      name: "SKU",
      headers: ["ID_SKU", "Tingkat", "Nomor_Butir", "Area_Pengembangan", "Butir_SKU", "Panduan_Pengujian"]
    },
    {
      name: "PENCAPAIAN_SKU",
      headers: ["ID_Pencapaian_SKU", "ID_Anggota", "Nama_Anggota", "ID_SKU", "Tingkat", "Nomor_Butir", "Status", "Tanggal_Pencapaian", "Penguji", "Catatan", "Created_At"]
    },
    {
      name: "SKK",
      headers: ["ID_SKK", "Nama_SKK", "Bidang", "Tingkat", "Deskripsi"]
    },
    {
      name: "PENCAPAIAN_SKK",
      headers: ["ID_Pencapaian_SKK", "ID_Anggota", "Nama_Anggota", "ID_SKK", "Nama_SKK", "Tingkat", "Tanggal", "Penguji", "Status", "Catatan", "Created_At"]
    },
    {
      name: "KEGIATAN",
      headers: ["ID_Kegiatan", "Nama_Kegiatan", "Jenis", "Tanggal_Mulai", "Tanggal_Selesai", "Lokasi", "Penanggung_Jawab", "Jumlah_Peserta", "Anggaran", "Status", "Deskripsi", "Created_At"]
    },
    {
      name: "PESERTA_KEGIATAN",
      headers: ["ID_Peserta_Kegiatan", "ID_Kegiatan", "Nama_Kegiatan", "ID_Anggota", "Nama_Anggota", "Regu", "Status_Kehadiran", "Catatan"]
    },
    {
      name: "INVENTARIS",
      headers: ["ID_Inventaris", "Kode_Barang", "Nama_Barang", "Kategori", "Jumlah", "Satuan", "Kondisi", "Lokasi", "Tanggal_Pengadaan", "Harga", "Sumber_Dana", "Status", "Keterangan", "Created_At"]
    },
    {
      name: "KEUANGAN",
      headers: ["ID_Transaksi", "Tanggal", "Jenis", "Kategori", "Uraian", "Nominal", "Sumber_Tujuan", "Bukti", "ID_Kegiatan", "Keterangan", "Created_At"]
    },
    {
      name: "PRESTASI",
      headers: ["ID_Prestasi", "Tanggal", "Nama_Kegiatan", "Tingkat", "Kategori", "Nama_Peserta_Regu", "Prestasi", "Penyelenggara", "Tahun", "Link_Piagam", "Keterangan", "Created_At"]
    },
    {
      name: "DOKUMENTASI",
      headers: ["ID_Dokumentasi", "ID_Kegiatan", "Nama_Kegiatan", "Tanggal", "Judul", "Deskripsi", "Link_Foto", "Link_Video", "Keterangan", "Created_At"]
    },
    {
      name: "SURAT",
      headers: ["ID_Surat", "Nomor_Surat", "Tanggal", "Jenis_Surat", "Perihal", "Tujuan", "Pengirim", "Link_File", "Keterangan", "Created_At"]
    },
    {
      name: "LAPORAN",
      headers: ["ID_Laporan", "Judul_Laporan", "Jenis_Laporan", "Periode", "Tanggal_Dibuat", "Dibuat_Oleh", "Link_File", "Keterangan"]
    },
    {
      name: "LOG_AKTIVITAS",
      headers: ["ID_Log", "Waktu", "User", "Role", "Modul", "Aktivitas", "ID_Data", "Keterangan"]
    }
  ];

  sheetsDef.forEach(def => {
    let sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
    }
    
    // Set Header
    const headerRange = sheet.getRange(1, 1, 1, def.headers.length);
    headerRange.setValues([def.headers]);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#78350f"); // Scout Brown color
    headerRange.setFontColor("#ffffff");
    headerRange.setHorizontalAlignment("center");
    
    // Auto populate initial data if exists
    if (def.data && def.data.length > 0) {
      sheet.getRange(2, 1, def.data.length, def.headers.length).setValues(def.data);
    }
    
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, def.headers.length);
  });

  // Create initial Admin User if not exists
  const userSheet = ss.getSheetByName("USERS");
  if (userSheet.getLastRow() === 1) {
    userSheet.appendRow([
      "USR-001",
      "admin",
      "admin123", // Password hash in production
      "Administrator",
      "ADMIN",
      "admin@pramuka.sch.id",
      "Aktif",
      new Date().toISOString(),
      new Date().toISOString()
    ]);
  }

  Logger.log("Database Google Spreadsheet Gugus Depan Pramuka berhasil diinisialisasi!");
}`
  },
  {
    filename: 'Code.gs',
    type: 'gs',
    description: 'Entry Point Utama Web App Google Apps Script (doGet, doPost, Router)',
    code: `/**
 * SISTEM ADMINISTRASI PRAMUKA PENGGALANG
 * Entry point Google Apps Script Web App
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  
  if (action === 'GET_ALL_DATA' || action === 'PING' || action === 'ping' || action === 'GET_CONFIG' || action === 'getConfig' || action === 'CONFIG' || action === 'config') {
    var output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    var data;
    if (action === 'PING' || action === 'ping') {
      data = { success: true, message: 'Server Google Apps Script Aktif', timestamp: new Date() };
    } else if (action === 'GET_CONFIG' || action === 'getConfig' || action === 'CONFIG' || action === 'config') {
      data = { success: true, config: getConfigData(SpreadsheetApp.getActiveSpreadsheet()) };
    } else {
      data = getAllDatabaseData();
    }
    output.setContent(JSON.stringify(data));
    return output;
  }

  return HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>API Database Pramuka</title>' +
    '<style>body{font-family:sans-serif;padding:30px;background:#f5f5f4;color:#1c1917;}' +
    '.card{background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:600px;margin:0 auto;}' +
    'h1{color:#9a3412;margin-top:0;}pre{background:#292524;color:#fef08a;padding:12px;border-radius:8px;overflow-x:auto;}' +
    '</style></head><body>' +
    '<div class="card"><h1>Endpoint Google Apps Script Aktif</h1>' +
    '<p>Backend Database Pramuka Gugus Depan siap menerima sinkronisasi data dari aplikasi.</p>' +
    '<p><strong>Status:</strong> Siap / Online</p>' +
    '<p>Gunakan URL ini di menu <em>Pengaturan &gt; URL Web App GAS</em> pada aplikasi Anda.</p>' +
    '</div></body></html>'
  )
  .setTitle('Sistem Administrasi Pramuka - Gugus Depan')
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Handle API POST requests from client-side SPA or mobile app
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(20000);
  
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var postData = JSON.parse(raw);
    var action = postData.action || '';
    var payload = postData.payload || {};
    var result = { success: false, message: 'Action not found' };

    switch(action) {
      case 'ping':
      case 'PING':
        result = { success: true, message: 'Server Active', timestamp: new Date() };
        break;
      case 'GET_ALL_DATA':
      case 'getAllData':
        result = getAllDatabaseData();
        break;
      case 'GET_CONFIG':
      case 'getConfig':
      case 'CONFIG':
      case 'config':
        result = { success: true, config: getConfigData(SpreadsheetApp.getActiveSpreadsheet()) };
        break;
      case 'SAVE_CONFIG':
      case 'saveConfig':
        result = saveConfigData(payload);
        break;
      case 'SYNC_ALL':
      case 'syncAll':
        result = syncAllDatabase(payload);
        break;
      case 'login':
      case 'LOGIN':
        result = handleLogin(payload.username, payload.password);
        break;
      case 'getDashboardData':
        result = getDashboardStats();
        break;
      case 'crud':
        result = handleGenericCRUD(payload.sheetName, payload.operation, payload.data, payload.user);
        break;
      default:
        result = { success: false, message: 'Unknown action: ' + action };
    }

    output.setContent(JSON.stringify(result));
    return output;
  } catch(err) {
    output.setContent(JSON.stringify({
      success: false,
      error: err.toString()
    }));
    return output;
  } finally {
    lock.releaseLock();
  }
}`
  },
  {
    filename: 'Database.gs',
    type: 'gs',
    description: 'Modul Abstraksi Database Google Sheets (CRUD, Batch Read/Write, Auto-ID, ACID Lock)',
    code: `/**
 * Modul Database Google Apps Script
 * Operasi Baca/Tulis 23 Sheet Google Spreadsheet Otomatis & Fleksibel
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
    proker: getSheetObjects(ss, 'PROGRAM_KERJA'),
    jadwal: getSheetObjects(ss, 'JADWAL_LATIHAN'),
    materi: getSheetObjects(ss, 'MATERI_LATIHAN'),
    presensi: getSheetObjects(ss, 'PRESENSI'),
    skuPencapaian: getSheetObjects(ss, 'PENCAPAIAN_SKU'),
    skkPencapaian: getSheetObjects(ss, 'PENCAPAIAN_SKK'),
    kegiatan: getSheetObjects(ss, 'KEGIATAN'),
    inventaris: getSheetObjects(ss, 'INVENTARIS'),
    keuangan: getSheetObjects(ss, 'KEUANGAN'),
    prestasi: getSheetObjects(ss, 'PRESTASI'),
    dokumentasi: getSheetObjects(ss, 'DOKUMENTASI'),
    surat: getSheetObjects(ss, 'SURAT')
  };
}

function getConfigData(ss) {
  // Case-insensitive sheet finder
  var sheet = ss.getSheetByName('CONFIG');
  if (!sheet) {
    var allSheets = ss.getSheets();
    for (var s = 0; s < allSheets.length; s++) {
      var sName = allSheets[s].getName().trim().toUpperCase();
      if (sName === 'CONFIG' || sName === 'PENGATURAN' || sName === 'IDENTITAS' || sName === 'PROFIL' || sName === 'IDENTITAS_PANGKALAN') {
        sheet = allSheets[s];
        break;
      }
    }
  }
  if (!sheet) return {};
  
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return {};
  
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  if (values.length === 0) return {};
  
  var configObj = {};
  
  // Check if horizontal layout (Row 0 = headers like namaPangkalan, namaSekolah, kaMabigus)
  var row0 = values[0];
  var recognizedKeywords = ['namapangkalan', 'namasekolah', 'kamabigus', 'namamabigus', 'ketuamabigus', 'nomorgudep', 'kwarran', 'kwarcab', 'kwarda', 'alamat', 'tahunpelajaran'];
  var matchedCount = 0;
  for (var c = 0; c < row0.length; c++) {
    var normHeader = String(row0[c] || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    for (var rk = 0; rk < recognizedKeywords.length; rk++) {
      if (normHeader.indexOf(recognizedKeywords[rk]) !== -1 || recognizedKeywords[rk].indexOf(normHeader) !== -1) {
        matchedCount++;
        break;
      }
    }
  }

  if (matchedCount >= 2 && values.length > 1) {
    // Horizontal format
    for (var col = 0; col < row0.length; col++) {
      var hName = String(row0[col] || '').trim();
      if (hName) {
        var hVal = values[1][col] !== undefined && values[1][col] !== null ? String(values[1][col]).trim() : '';
        configObj[hName] = hVal;
      }
    }
    return configObj;
  }

  // Vertical format: Parse each row
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    if (!row || row.length === 0) continue;

    // Filter out empty cells
    var cells = [];
    for (var j = 0; j < row.length; j++) {
      var cellStr = String(row[j] !== undefined && row[j] !== null ? row[j] : '').trim();
      if (cellStr !== '') {
        cells.push(cellStr);
      }
    }

    if (cells.length === 0) continue;

    // Skip colon-only or separator cells
    var filtered = [];
    for (var f = 0; f < cells.length; f++) {
      if (cells[f] !== ':' && cells[f] !== '=' && cells[f] !== '-') {
        filtered.push(cells[f]);
      }
    }

    if (filtered.length === 0) continue;

    // Skip table header rows like [No, Parameter, Nilai]
    var firstNorm = filtered[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    if (['no', 'nomor', 'key', 'kunci', 'parameter', 'namaparameter', 'kunciparameter', 'variabel', 'setting', 'atribut', 'uraian', 'item', 'jabatan'].indexOf(firstNorm) !== -1) {
      continue;
    }

    var keyIdx = 0;
    // If first element is just a row number (e.g. 1, 2, 01, A)
    if (/^[0-9]+[\.\)]?$/.test(filtered[0]) || /^[a-zA-Z][\.\)]$/.test(filtered[0])) {
      keyIdx = 1;
    }

    if (keyIdx < filtered.length) {
      var rawK = filtered[keyIdx];
      var valIdx = keyIdx + 1;
      var rawV = valIdx < filtered.length ? filtered[valIdx] : '';

      // Strip leading/trailing colons
      rawK = rawK.replace(/^[:=\s]+/, '').replace(/[:=\s]+$/, '').trim();
      rawV = rawV.replace(/^[:=\s]+/, '').trim();

      if (rawK) {
        configObj[rawK] = rawV;
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
    sheet.getRange(1, 1, 1, headers.length).setBackground('#78350f').setFontColor('#ffffff').setFontWeight('bold');
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
  
  if (payload.config) counts.config = saveConfigData(payload.config).count;
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
  
  return { success: true, message: 'Seluruh database berhasil disinkronkan & disimpan ke Google Spreadsheet', counts: counts };
}

function saveAnggotaData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID_Anggota', 'NIS_NISN', 'Nama_Lengkap', 'Jenis_Kelamin', 'Tempat_Lahir', 'Tanggal_Lahir', 'Kelas', 'Alamat', 'Nama_Ortu', 'Nomor_HP_Ortu', 'Regu', 'Status', 'Tanggal_Bergabung', 'Nomor_Gudep', 'Tingkat_SKU', 'Keterangan', 'Created_At'];
  return writeSheetRows(ss, 'ANGGOTA', headers, list, function(a) {
    return [
      a.id || '', a.nisn || '', a.nama || '', a.jenisKelamin || 'L', a.tempatLahir || '', a.tanggalLahir || '',
      a.kelas || '7A', a.alamat || '', a.namaOrtu || '', a.noHpOrtu || '', a.regu || '', a.status || 'Aktif',
      a.tanggalBergabung || '', a.nta || '', a.tingkatSKU || 'Calon Penggalang', a.keterangan || '', a.createdAt || new Date().toISOString()
    ];
  });
}

function savePembinaData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID_Pembina', 'NIP_NUPTK', 'Nama_Lengkap', 'Gelar', 'Jenis_Kelamin', 'Jabatan', 'Nomor_HP', 'Email', 'Status', 'Keterangan', 'Created_At'];
  return writeSheetRows(ss, 'PEMBINA', headers, list, function(p) {
    return [
      p.id || '', p.nip || '', p.nama || '', p.gelar || '', p.jenisKelamin || 'L',
      p.jabatan || '', p.noHp || '', p.email || '', p.status || 'Aktif', p.keterangan || '', p.createdAt || new Date().toISOString()
    ];
  });
}

function saveReguData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID_Regu', 'Nama_Regu', 'Kategori', 'Pangkalan', 'Tahun', 'Pemimpin_Regu', 'Wakil_Pemimpin', 'Pembina_Pendamping', 'Jumlah_Anggota', 'Status', 'Keterangan', 'Created_At'];
  return writeSheetRows(ss, 'REGU', headers, list, function(r) {
    return [
      r.id || '', r.nama || '', r.kategori || 'Putra', r.pangkalan || '', r.tahunAjaran || '',
      r.pemimpinRegu || '', r.wakilPemimpin || '', r.pembinaPendamping || '', r.jumlahAnggota || 0,
      r.status || 'Aktif', r.keterangan || '', r.createdAt || new Date().toISOString()
    ];
  });
}

function saveProkerData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID_Program', 'Nama_Program', 'Bidang', 'Tujuan', 'Sasaran', 'Waktu_Pelaksanaan', 'Penanggung_Jawab', 'Indikator_Keberhasilan', 'Anggaran', 'Status', 'Keterangan', 'Created_At'];
  return writeSheetRows(ss, 'PROGRAM_KERJA', headers, list, function(p) {
    return [
      p.id || '', p.nama || '', p.bidang || '', p.tujuan || '', p.sasaran || '',
      p.waktu || '', p.penanggungJawab || '', p.indikator || '', p.anggaran || 0,
      p.status || 'Rencana', p.keterangan || '', p.createdAt || new Date().toISOString()
    ];
  });
}

function saveJadwalData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID_Latihan', 'Tanggal', 'Hari', 'Materi', 'Pembina', 'Regu_Sasaran', 'Lokasi', 'Durasi', 'Status', 'Catatan', 'Created_At'];
  return writeSheetRows(ss, 'JADWAL_LATIHAN', headers, list, function(j) {
    return [
      j.id || '', j.tanggal || '', j.hari || '', j.materi || '', j.pembina || '',
      j.regu || '', j.lokasi || '', j.durasi || '', j.status || 'Terjadwal', j.catatan || '', j.createdAt || new Date().toISOString()
    ];
  });
}

function saveMateriData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID_Materi', 'Judul', 'Kategori', 'Tujuan', 'Materi', 'Metode', 'Alat', 'Langkah_Kegiatan', 'Evaluasi', 'Created_At'];
  return writeSheetRows(ss, 'MATERI_LATIHAN', headers, list, function(m) {
    return [
      m.id || '', m.judul || '', m.kategori || '', m.tujuan || '', m.ringkasan || '',
      m.metode || '', m.alat || '', m.referensi || '', m.evaluasi || '', m.createdAt || new Date().toISOString()
    ];
  });
}

function savePresensiData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID_Presensi', 'Tanggal', 'ID_Latihan', 'ID_Anggota', 'Nama_Anggota', 'Regu', 'Status_Kehadiran', 'Catatan', 'Created_At'];
  return writeSheetRows(ss, 'PRESENSI', headers, list, function(p) {
    return [
      p.id || '', p.tanggal || '', p.idLatihan || '', p.idAnggota || '', p.namaAnggota || '',
      p.regu || '', p.status || 'Hadir', p.keterangan || '', p.createdAt || new Date().toISOString()
    ];
  });
}

function saveSKUPencapaianData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID_Pencapaian_SKU', 'ID_Anggota', 'Nama_Anggota', 'ID_SKU', 'Tingkat', 'Nomor_Butir', 'Status', 'Tanggal_Pencapaian', 'Penguji', 'Catatan', 'Created_At'];
  return writeSheetRows(ss, 'PENCAPAIAN_SKU', headers, list, function(s) {
    return [
      s.id || '', s.idAnggota || '', s.namaAnggota || '', s.idSKU || '', s.tingkat || '',
      s.nomorButir || '', s.status || 'Tuntas', s.tanggal || '', s.penguji || '', s.catatan || '', s.createdAt || new Date().toISOString()
    ];
  });
}

function saveSKKPencapaianData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID_Pencapaian_SKK', 'ID_Anggota', 'Nama_Anggota', 'ID_SKK', 'Nama_SKK', 'Tingkat', 'Tanggal', 'Penguji', 'Status', 'Catatan', 'Created_At'];
  return writeSheetRows(ss, 'PENCAPAIAN_SKK', headers, list, function(s) {
    return [
      s.id || '', s.idAnggota || '', s.namaAnggota || '', s.idSKK || '', s.namaSKK || '',
      s.tingkat || '', s.tanggal || '', s.penguji || '', s.status || 'Tuntas', s.catatan || '', s.createdAt || new Date().toISOString()
    ];
  });
}

function saveKegiatanData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID_Kegiatan', 'Nama_Kegiatan', 'Jenis', 'Tanggal_Mulai', 'Tanggal_Selesai', 'Lokasi', 'Penanggung_Jawab', 'Jumlah_Peserta', 'Anggaran', 'Status', 'Deskripsi', 'Created_At'];
  return writeSheetRows(ss, 'KEGIATAN', headers, list, function(k) {
    return [
      k.id || '', k.nama || '', k.jenis || '', k.tanggalMulai || '', k.tanggalSelesai || '',
      k.lokasi || '', k.penanggungJawab || '', k.jumlahPeserta || 0, k.anggaran || 0,
      k.status || 'Rencana', k.deskripsi || '', k.createdAt || new Date().toISOString()
    ];
  });
}

function saveInventarisData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID_Inventaris', 'Kode_Barang', 'Nama_Barang', 'Kategori', 'Jumlah', 'Satuan', 'Kondisi', 'Lokasi', 'Tanggal_Pengadaan', 'Harga', 'Sumber_Dana', 'Status', 'Keterangan', 'Created_At'];
  return writeSheetRows(ss, 'INVENTARIS', headers, list, function(i) {
    return [
      i.id || '', i.kode || '', i.nama || '', i.kategori || '', i.jumlah || 0,
      i.satuan || 'Unit', i.kondisi || 'Baik', i.lokasi || '', i.tanggalPengadaan || '',
      i.harga || 0, i.sumberDana || '', i.status || 'Tersedia', i.keterangan || '', i.createdAt || new Date().toISOString()
    ];
  });
}

function saveKeuanganData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID_Transaksi', 'Tanggal', 'Jenis', 'Kategori', 'Uraian', 'Nominal', 'Sumber_Tujuan', 'Bukti', 'ID_Kegiatan', 'Keterangan', 'Created_At'];
  return writeSheetRows(ss, 'KEUANGAN', headers, list, function(k) {
    return [
      k.id || '', k.tanggal || '', k.jenis || 'Pemasukan', k.kategori || '', k.uraian || '',
      k.nominal || 0, k.sumber || '', k.bukti || '', k.idKegiatan || '', k.keterangan || '', k.createdAt || new Date().toISOString()
    ];
  });
}

function savePrestasiData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID_Prestasi', 'Tanggal', 'Nama_Kegiatan', 'Tingkat', 'Kategori', 'Nama_Peserta_Regu', 'Prestasi', 'Penyelenggara', 'Tahun', 'Link_Piagam', 'Keterangan', 'Created_At'];
  return writeSheetRows(ss, 'PRESTASI', headers, list, function(p) {
    return [
      p.id || '', p.tanggal || '', p.kegiatan || '', p.tingkat || '', p.kategori || '',
      p.namaPeserta || '', p.juara || '', p.penyelenggara || '', p.tahun || '',
      p.fotoUrl || '', p.keterangan || '', p.createdAt || new Date().toISOString()
    ];
  });
}

function saveDokumentasiData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID_Dokumentasi', 'ID_Kegiatan', 'Nama_Kegiatan', 'Tanggal', 'Judul', 'Deskripsi', 'Link_Foto', 'Link_Video', 'Keterangan', 'Created_At'];
  return writeSheetRows(ss, 'DOKUMENTASI', headers, list, function(d) {
    return [
      d.id || '', d.idKegiatan || '', d.namaKegiatan || '', d.tanggal || '', d.judul || '',
      d.deskripsi || '', d.url || '', d.videoUrl || '', d.keterangan || '', d.createdAt || new Date().toISOString()
    ];
  });
}

function saveSuratData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID_Surat', 'Nomor_Surat', 'Tanggal', 'Jenis_Surat', 'Perihal', 'Tujuan', 'Pengirim', 'Link_File', 'Keterangan', 'Created_At'];
  return writeSheetRows(ss, 'SURAT', headers, list, function(s) {
    return [
      s.id || '', s.nomor || '', s.tanggal || '', s.jenis || 'Masuk', s.perihal || '',
      s.tujuan || '', s.pengirim || '', s.linkFile || '', s.keterangan || '', s.createdAt || new Date().toISOString()
    ];
  });
}

function saveUsersData(list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ID_User', 'Username', 'PasswordHash', 'Nama_Lengkap', 'Role', 'Email', 'Status', 'Last_Login', 'Created_At'];
  return writeSheetRows(ss, 'USERS', headers, list, function(u) {
    return [
      u.id || '', u.username || '', u.password || '', u.nama || '', u.role || 'PEMBINA',
      u.email || '', u.status || 'Aktif', u.terakhirLogin || '', u.createdAt || new Date().toISOString()
    ];
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
}

const DB = {
  getSpreadsheet: function() {
    return SpreadsheetApp.getActiveSpreadsheet();
  },

  getAll: function(sheetName) {
    const ss = this.getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const headers = data[0];
    const rows = data.slice(1);
    
    return rows.map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  },

  insert: function(sheetName, record, prefix) {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    
    try {
      const ss = this.getSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error('Sheet ' + sheetName + ' not found');
      
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      const idKey = headers[0];
      if (!record[idKey]) {
        const lastRow = sheet.getLastRow();
        const nextNum = lastRow;
        record[idKey] = (prefix || 'DATA-') + String(nextNum).padStart(4, '0');
      }
      
      if (!record.Created_At && headers.includes('Created_At')) {
        record.Created_At = new Date().toISOString();
      }
      
      const newRow = headers.map(h => record[h] !== undefined ? record[h] : '');
      sheet.appendRow(newRow);
      
      return { success: true, id: record[idKey], data: record };
    } finally {
      lock.releaseLock();
    }
  },

  update: function(sheetName, id, updatedFields) {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    
    try {
      const ss = this.getSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error('Sheet ' + sheetName + ' not found');
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idColIndex = 0;
      
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][idColIndex]) === String(id)) {
          headers.forEach((h, colIdx) => {
            if (updatedFields[h] !== undefined) {
              sheet.getRange(i + 1, colIdx + 1).setValue(updatedFields[h]);
            }
          });
          return { success: true, message: 'Record updated' };
        }
      }
      
      return { success: false, message: 'Record with ID ' + id + ' not found' };
    } finally {
      lock.releaseLock();
    }
  },

  delete: function(sheetName, id) {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    
    try {
      const ss = this.getSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error('Sheet ' + sheetName + ' not found');
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(id)) {
          sheet.deleteRow(i + 1);
          return { success: true, message: 'Record deleted' };
        }
      }
      return { success: false, message: 'Record not found' };
    } finally {
      lock.releaseLock();
    }
  }
};`
  },
  {
    filename: 'Auth.gs',
    type: 'gs',
    description: 'Modul Autentikasi dan Role-Based Access Control (Admin, Pembina, Petugas)',
    code: `/**
 * Modul Autentikasi & Session GAS
 */

function handleLogin(username, password) {
  const users = DB.getAll('USERS');
  const user = users.find(u => u.Username === username && u.Status === 'Aktif');
  
  if (!user) {
    return { success: false, message: 'Username atau kata sandi tidak sesuai.' };
  }
  
  if (user.PasswordHash !== password) {
    return { success: false, message: 'Username atau kata sandi salah.' };
  }
  
  // Update last login
  DB.update('USERS', user.ID_User, { Last_Login: new Date().toISOString() });
  
  // Log Activity
  logSystemActivity(user.Nama_Lengkap, user.Role, 'Autentikasi', 'Login', user.ID_User, 'Pengguna berhasil masuk ke sistem');
  
  return {
    success: true,
    user: {
      id: user.ID_User,
      username: user.Username,
      nama: user.Nama_Lengkap,
      role: user.Role,
      email: user.Email
    }
  };
}

function logSystemActivity(user, role, modul, aktivitas, idData, keterangan) {
  try {
    DB.insert('LOG_AKTIVITAS', {
      Waktu: Utilities.formatDate(new Date(), 'GMT+7', 'dd/MM/yyyy HH:mm:ss'),
      User: user,
      Role: role,
      Modul: modul,
      Aktivitas: aktivitas,
      ID_Data: idData,
      Keterangan: keterangan
    }, 'LOG-');
  } catch(e) {
    Logger.log('Error logging activity: ' + e);
  }
}`
  },
  {
    filename: 'Dashboard.gs',
    type: 'gs',
    description: 'Modul Kalkulasi Statistik Dashboard Otomatis Langsung dari Spreadsheet',
    code: `/**
 * Modul Statistik Dashboard Google Apps Script
 */

function getDashboardStats() {
  const anggota = DB.getAll('ANGGOTA');
  const regu = DB.getAll('REGU');
  const pembina = DB.getAll('PEMBINA');
  const presensi = DB.getAll('PRESENSI');
  const kegiatan = DB.getAll('KEGIATAN');
  const inventaris = DB.getAll('INVENTARIS');
  const keuangan = DB.getAll('KEUANGAN');
  const prestasi = DB.getAll('PRESTASI');
  const skuPencapaian = DB.getAll('PENCAPAIAN_SKU');
  const skkPencapaian = DB.getAll('PENCAPAIAN_SKK');

  // Perhitungan Saldo Kas
  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  keuangan.forEach(trx => {
    const nom = Number(trx.Nominal) || 0;
    if (trx.Jenis === 'Pemasukan') totalPemasukan += nom;
    else if (trx.Jenis === 'Pengeluaran') totalPengeluaran += nom;
  });
  const saldoKas = totalPemasukan - totalPengeluaran;

  // Anggota aktif
  const totalAnggotaAktif = anggota.filter(a => a.Status === 'Aktif').length;

  // Persentase Kehadiran
  const totalPresensi = presensi.length;
  const hadirCount = presensi.filter(p => p.Status_Kehadiran === 'Hadir').length;
  const persentaseKehadiran = totalPresensi > 0 ? Math.round((hadirCount / totalPresensi) * 100) : 0;

  return {
    success: true,
    data: {
      totalAnggota: anggota.length,
      totalAnggotaAktif: totalAnggotaAktif,
      totalRegu: regu.length,
      totalPembina: pembina.length,
      persentaseKehadiran: persentaseKehadiran,
      totalKegiatan: kegiatan.length,
      totalInventaris: inventaris.length,
      totalPrestasi: prestasi.length,
      saldoKas: saldoKas,
      totalPemasukan: totalPemasukan,
      totalPengeluaran: totalPengeluaran,
      totalPencapaianSKU: skuPencapaian.filter(s => s.Status === 'Tuntas').length,
      totalPencapaianSKK: skkPencapaian.filter(s => s.Status === 'Tuntas').length
    }
  };
}`
  }
];
