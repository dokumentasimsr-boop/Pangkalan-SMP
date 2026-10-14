import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  FileText,
  Radio,
  Flag,
  Scissors,
  HeartPulse,
} from 'lucide-react';
import { MateriLatihan, UserRole } from '../types';
import { useToast } from './Toast';

interface MateriLatihanViewProps {
  materiList: MateriLatihan[];
  onSave: (list: MateriLatihan[]) => void;
  currentUserRole: UserRole;
  onAddLog: (modul: string, act: string, id: string, note: string) => void;
}

export const MateriLatihanView: React.FC<MateriLatihanViewProps> = ({
  materiList,
  onSave,
  currentUserRole,
  onAddLog,
}) => {
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'koleksi' | 'morse' | 'semaphore' | 'sandi'>('koleksi');
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMateri, setEditingMateri] = useState<MateriLatihan | null>(null);
  const [detailMateri, setDetailMateri] = useState<MateriLatihan | null>(null);

  // Morse Simulator State
  const [morseInput, setMorseInput] = useState('PRAMUKA PENGGALANG');
  const [isPlayingMorse, setIsPlayingMorse] = useState(false);
  const [morseCurrentChar, setMorseCurrentChar] = useState('');
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<MateriLatihan>>({
    judulMateri: '',
    kategori: 'Kepramukaan Umum',
    tingkat: 'Penggalang Ramu',
    deskripsiRingkas: '',
    kontenLengkap: '',
    fileUrl: '',
    author: 'Kak Pembina',
  });

  const morseCodeMap: Record<string, string> = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
    G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
    M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
    S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
    Y: '-.--', Z: '--..',
    '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
    ' ': ' / ',
  };

  const textToMorse = (text: string): string => {
    return text
      .toUpperCase()
      .split('')
      .map(char => morseCodeMap[char] || '?')
      .join(' ');
  };

  const playMorseAudio = async () => {
    if (isPlayingMorse) return;
    setIsPlayingMorse(true);

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const dotTime = 0.08; // 80ms
      const dashTime = dotTime * 3;
      const intraCharTime = dotTime;
      const interCharTime = dotTime * 3;
      const wordTime = dotTime * 7;

      const words = morseInput.toUpperCase().split('');

      const playTone = (duration: number): Promise<void> => {
        return new Promise(resolve => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(750, ctx.currentTime);

          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + duration);

          setTimeout(resolve, duration * 1000);
        });
      };

      const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

      for (let char of words) {
        setMorseCurrentChar(char);
        if (char === ' ') {
          await sleep(wordTime * 1000);
          continue;
        }

        const code = morseCodeMap[char];
        if (code) {
          for (let symbol of code) {
            if (symbol === '.') {
              await playTone(dotTime);
              await sleep(intraCharTime * 1000);
            } else if (symbol === '-') {
              await playTone(dashTime);
              await sleep(intraCharTime * 1000);
            }
          }
          await sleep(interCharTime * 1000);
        }
      }
    } catch (e) {
      console.error('Audio play error:', e);
    } finally {
      setIsPlayingMorse(false);
      setMorseCurrentChar('');
    }
  };

  const filteredList = materiList.filter(m => {
    const title = m.judulMateri || m.judul || '';
    const desc = m.deskripsiRingkas || m.tujuan || m.materi || '';
    const matchSearch =
      title.toLowerCase().includes((search || '').toLowerCase()) ||
      desc.toLowerCase().includes((search || '').toLowerCase());
    const matchKat = filterKategori === 'Semua' || m.kategori === filterKategori;
    return matchSearch && matchKat;
  });

  const handleOpenAdd = () => {
    setEditingMateri(null);
    setFormData({
      judulMateri: '',
      judul: '',
      kategori: 'Kepramukaan Umum',
      tingkat: 'Penggalang Ramu',
      deskripsiRingkas: '',
      kontenLengkap: '',
      tujuan: '',
      materi: '',
      fileUrl: '',
      author: 'Kak Pembina',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mat: MateriLatihan) => {
    setEditingMateri(mat);
    setFormData({
      ...mat,
      judulMateri: mat.judulMateri || mat.judul || '',
      deskripsiRingkas: mat.deskripsiRingkas || mat.tujuan || mat.materi || '',
      kontenLengkap: mat.kontenLengkap || mat.materi || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, judul?: string) => {
    const namaJudul = judul || 'Materi ini';
    if (confirm(`Hapus materi: "${namaJudul}"?`)) {
      const updated = materiList.filter(m => m.id !== id);
      onSave(updated);
      onAddLog('Materi', 'Hapus Data', id, `Menghapus Materi: ${namaJudul}`);
      showToast('Materi latihan berhasil dihapus.', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const judulText = formData.judulMateri || formData.judul || '';
    const descText = formData.deskripsiRingkas || formData.tujuan || formData.materi || '';

    if (!judulText.trim() || !descText.trim()) {
      showToast('Judul dan Deskripsi materi wajib diisi!', 'error');
      return;
    }

    if (editingMateri) {
      const updated = materiList.map(m =>
        m.id === editingMateri.id
          ? ({
              ...m,
              ...formData,
              judul: judulText,
              judulMateri: judulText,
              deskripsiRingkas: descText,
              kontenLengkap: formData.kontenLengkap || formData.materi || descText,
            } as MateriLatihan)
          : m
      );
      onSave(updated);
      onAddLog('Materi', 'Edit Data', editingMateri.id, `Memperbarui Materi: ${judulText}`);
      showToast('Materi latihan berhasil diperbarui.', 'success');
    } else {
      const nextNum = materiList.length + 1;
      const newId = `MAT-${String(nextNum).padStart(4, '0')}`;
      const newMateri: MateriLatihan = {
        id: newId,
        judul: judulText,
        judulMateri: judulText,
        kategori: formData.kategori || 'Kepramukaan Umum',
        tingkat: formData.tingkat || 'Semua Tingkat',
        deskripsiRingkas: descText,
        kontenLengkap: formData.kontenLengkap || formData.materi || descText,
        tujuan: formData.tujuan || descText,
        materi: formData.kontenLengkap || formData.materi || descText,
        fileUrl: formData.fileUrl || '',
        author: formData.author || 'Kak Pembina',
      };
      onSave([...materiList, newMateri]);
      onAddLog('Materi', 'Tambah Data', newId, `Menambahkan Materi: ${newMateri.judulMateri}`);
      showToast('Materi baru berhasil ditambahkan.', 'success');
    }

    setIsModalOpen(false);
  };

  const canEdit = currentUserRole === 'ADMIN' || currentUserRole === 'PEMBINA';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-700" />
            <span>Database Materi & Simulator Kepramukaan</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Materi Standar SKU/SKK Penggalang, Simulator Morse, Semaphore, Sandi, & Pioneering
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Materi Baru</span>
          </button>
        )}
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex border-b border-stone-200 gap-2">
        <button
          onClick={() => setActiveSubTab('koleksi')}
          className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'koleksi'
              ? 'border-amber-700 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Koleksi Materi ({materiList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('morse')}
          className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'morse'
              ? 'border-amber-700 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Radio className="w-4 h-4 text-amber-700" />
          <span>Simulator Kode Morse Audio</span>
        </button>

        <button
          onClick={() => setActiveSubTab('semaphore')}
          className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'semaphore'
              ? 'border-amber-700 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Flag className="w-4 h-4 text-orange-600" />
          <span>Panduan Semaphore</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sandi')}
          className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'sandi'
              ? 'border-amber-700 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Sandi-Sandi Pramuka</span>
        </button>
      </div>

      {/* SubTab 1: Koleksi Materi */}
      {activeSubTab === 'koleksi' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari materi atau topik..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-amber-700/20"
              />
            </div>

            <select
              value={filterKategori}
              onChange={e => setFilterKategori(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Tali Temali & Pioneering">Tali Temali & Pioneering</option>
              <option value="Sandi & Isyarat">Sandi & Isyarat</option>
              <option value="Kesehatan & P3K">Kesehatan & P3K</option>
              <option value="Kepramukaan Umum">Kepramukaan Umum</option>
              <option value="Teknik Kepramukaan">Teknik Kepramukaan</option>
            </select>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map(m => (
              <div
                key={m.id}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                      {m.kategori}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium">
                      {m.tingkat}
                    </span>
                  </div>

                  <h3 className="font-bold text-stone-900 text-sm">{m.judulMateri || m.judul || 'Materi Tanpa Judul'}</h3>
                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {m.deskripsiRingkas || m.tujuan || m.materi || 'Tidak ada ringkasan.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => setDetailMateri(m)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Baca Lengkap
                  </button>

                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-stone-100 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id, m.judulMateri || m.judul)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-lg"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 2: Morse Code Simulator */}
      {activeSubTab === 'morse' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-6">
          <div className="max-w-xl space-y-2">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-700" />
              <span>Simulator & Generator Kode Morse Audio</span>
            </h3>
            <p className="text-xs text-stone-600">
              Ketikkan teks untuk menghasilkan sandi morse dengan bunyi audio tit-tat (tit = pendek, tat = panjang) secara langsung.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input & Output */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Teks Masukan:</label>
                <input
                  type="text"
                  value={morseInput}
                  onChange={e => setMorseInput(e.target.value)}
                  placeholder="Ketik teks di sini..."
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold uppercase text-stone-900 focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Konversi Sandi Morse:</label>
                <div className="p-4 bg-stone-900 text-amber-400 rounded-xl font-mono text-sm tracking-widest break-all min-h-[70px]">
                  {textToMorse(morseInput)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={playMorseAudio}
                  disabled={isPlayingMorse || !morseInput.trim()}
                  className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>{isPlayingMorse ? 'Sedang Membunyikan...' : 'Putar Audio Morse'}</span>
                </button>

                {isPlayingMorse && morseCurrentChar && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-sm rounded-lg animate-pulse">
                    Karakter: {morseCurrentChar}
                  </span>
                )}
              </div>
            </div>

            {/* Morse Reference Table */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <h4 className="text-xs font-bold text-stone-800">Tabel Rujukan Kode Morse Alfabet</h4>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-xs font-mono">
                {Object.entries(morseCodeMap).filter(([k]) => k !== ' ').slice(0, 26).map(([char, code]) => (
                  <div key={char} className="p-1.5 bg-white rounded border border-stone-200 text-center">
                    <span className="font-bold text-stone-900 block">{char}</span>
                    <span className="text-amber-800 font-extrabold text-[11px]">{code}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 3: Semaphore Guide */}
      {activeSubTab === 'semaphore' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Flag className="w-5 h-5 text-orange-600" />
              <span>Panduan Posisi Isyarat Bendera Semaphore</span>
            </h3>
            <p className="text-xs text-stone-600">
              Sistem pengiriman isyarat menggunakan dua bendera semaphore berukuran 45 x 45 cm warna merah-kuning diagonal.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {[
              { huruf: 'A', posisi: 'Tangan kanan bawah (sudut 45°), tangan kiri lurus ke bawah' },
              { huruf: 'B', posisi: 'Tangan kanan mendatar (90°), tangan kiri lurus ke bawah' },
              { huruf: 'C', posisi: 'Tangan kanan atas (135°), tangan kiri lurus ke bawah' },
              { huruf: 'D', posisi: 'Tangan kanan lurus ke atas (180°), tangan kiri lurus bawah' },
              { huruf: 'E', posisi: 'Tangan kiri atas (135°), tangan kanan lurus ke bawah' },
              { huruf: 'F', posisi: 'Tangan kiri mendatar (90°), tangan kanan lurus ke bawah' },
              { huruf: 'G', posisi: 'Tangan kiri bawah (45°), tangan kanan lurus ke bawah' },
              { huruf: 'H', posisi: 'Tangan kanan bawah (45°), tangan kiri mendatar (90°)' },
              { huruf: 'I', posisi: 'Tangan kanan bawah (45°), tangan kiri atas (135°)' },
              { huruf: 'K', posisi: 'Tangan kanan bawah (45°), tangan kiri lurus atas (180°)' },
              { huruf: 'L', posisi: 'Tangan kanan bawah (45°), tangan kiri atas kiri (135°)' },
              { huruf: 'M', posisi: 'Tangan kanan bawah (45°), tangan kiri mendatar kiri (90°)' },
            ].map(sem => (
              <div key={sem.huruf} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-1">
                <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-tr from-amber-600 to-rose-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
                  {sem.huruf}
                </div>
                <div className="text-[10px] text-stone-600 leading-tight pt-1">
                  {sem.posisi}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 4: Sandi Pramuka */}
      {activeSubTab === 'sandi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-700" />
              <span>Sandi Kotak 1 & 2</span>
            </h3>
            <p className="text-xs text-stone-600">
              Sandi Kotak 1 menggunakan 2 garis vertikal-horizontal tegak (#) dan silang (X). Setiap kotak memuat 2 huruf (huruf kedua diberi titik).
            </p>
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 font-mono">
              [A B] [C D] [E F] <br/>
              [G H] [I J] [K L] <br/>
              [M N] [O P] [Q R] <br/>
              Silang: [S T U V] [W X Y Z]
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Sandi Rumput & Sandi Jam</span>
            </h3>
            <p className="text-xs text-stone-600">
              Sandi Rumput merupakan turunan dari sandi morse. Titik (.) digambarkan dengan rumput pendek (/\), dan strip (-) digambarkan dengan rumput tinggi (//\\).
            </p>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-mono">
              Contoh "AKU": <br/>
              A = .-  -&gt;  /\ //\\ <br/>
              K = -.- -&gt; //\\ /\ //\\ <br/>
              U = ..- -&gt; /\ /\ //\\
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Materi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">
                {editingMateri ? 'Edit Materi Kepramukaan' : 'Tambah Materi Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Judul Materi *</label>
                <input
                  type="text"
                  required
                  value={formData.judulMateri || ''}
                  onChange={e => setFormData({ ...formData, judulMateri: e.target.value })}
                  placeholder="Contoh: Tata Cara Pertolongan Pertama Patah Tulang"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={formData.kategori || 'Kepramukaan Umum'}
                    onChange={e => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Tali Temali & Pioneering">Tali Temali & Pioneering</option>
                    <option value="Sandi & Isyarat">Sandi & Isyarat</option>
                    <option value="Kesehatan & P3K">Kesehatan & P3K</option>
                    <option value="Kepramukaan Umum">Kepramukaan Umum</option>
                    <option value="Teknik Kepramukaan">Teknik Kepramukaan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tingkat Sasaran</label>
                  <select
                    value={formData.tingkat || 'Semua Tingkat'}
                    onChange={e => setFormData({ ...formData, tingkat: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Semua Tingkat">Semua Tingkat</option>
                    <option value="Penggalang Ramu">Penggalang Ramu</option>
                    <option value="Penggalang Rakit">Penggalang Rakit</option>
                    <option value="Penggalang Terap">Penggalang Terap</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Deskripsi Ringkas *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.deskripsiRingkas || ''}
                  onChange={e => setFormData({ ...formData, deskripsiRingkas: e.target.value })}
                  placeholder="Ringkasan isi materi untuk kartu..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Konten Lengkap & Langkah-Langkah</label>
                <textarea
                  rows={5}
                  value={formData.kontenLengkap || ''}
                  onChange={e => setFormData({ ...formData, kontenLengkap: e.target.value })}
                  placeholder="Tuliskan uraian detail materi..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Link Dokumen / Video</label>
                  <input
                    type="url"
                    value={formData.fileUrl || ''}
                    onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Penyusun / Penulis</label>
                  <input
                    type="text"
                    value={formData.author || ''}
                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Kak Pembina"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-semibold shadow-sm"
                >
                  Simpan Materi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Materi */}
      {detailMateri && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  {detailMateri.kategori}
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-1">{detailMateri.judulMateri || detailMateri.judul || 'Materi'}</h3>
              </div>
              <button onClick={() => setDetailMateri(null)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-stone-700 leading-relaxed">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 font-medium">
                {detailMateri.deskripsiRingkas || detailMateri.tujuan || detailMateri.materi || 'Tidak ada ringkasan.'}
              </div>

              <div className="whitespace-pre-line p-4 bg-stone-900 text-stone-100 rounded-xl font-mono">
                {detailMateri.kontenLengkap || detailMateri.materi || 'Belum ada uraian konten detail.'}
              </div>

              {detailMateri.fileUrl && (
                <a
                  href={detailMateri.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Tautan Lampiran Pendukung</span>
                </a>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setDetailMateri(null)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
