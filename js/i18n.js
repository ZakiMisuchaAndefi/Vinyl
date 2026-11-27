// SPDX-License-Identifier: GPL-3.0-or-later
/* ==========================================================================
   i18n.js — terjemahan antarmuka (Indonesia -> Inggris)
   --------------------------------------------------------------------------
   Sumber teks di seluruh aplikasi tetap Bahasa Indonesia. Modul ini
   menerjemahkan teks yang sudah dirender ke DOM, sehingga tidak perlu
   membungkus setiap string di kode tampilan.

   - Bahasa disimpan di localStorage "vinyl.language" (boot instan) dan
     setelan IndexedDB "language" (sumber utama setelah perpustakaan siap).
   - Default: Inggris.
   - Konten buatan pengguna (judul lagu, artis, album, playlist, lirik)
     dilewati lewat SKIP_SELECTOR dan karena tidak ada di kamus.
   ========================================================================== */

(function (AM) {
  "use strict";

  const STORAGE_KEY = "vinyl.language";
  const DEFAULT_LANGUAGE = "en";
  const LANGUAGES = { en: true, id: true };

  function readStoredLanguage() {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      return LANGUAGES[value] ? value : null;
    } catch (error) {
      return null;
    }
  }

  let language = readStoredLanguage() || DEFAULT_LANGUAGE;
  let observer = null;
  let started = false;
  const listeners = [];

  /* ------------------------------------------------------------------------
     Kamus
     ------------------------------------------------------------------------ */

  const DICT = {
    /* Shell, navigasi, tombol umum */
    "Dengarkan Sekarang": "Listen Now",
    "Vinyl — Dengarkan Sekarang": "Vinyl — Listen Now",
    "Jelajahi": "Explore",
    "Radio": "Radio",
    "Pengaturan": "Settings",
    "Perpustakaan": "Library",
    "Riwayat": "History",
    "Artis": "Artists",
    "Album": "Albums",
    "Lagu": "Songs",
    "Suka": "Liked",
    "Playlist": "Playlist",
    "Buat playlist": "Create playlist",
    "Impor musik": "Import music",
    "Musikmu, di satu tempat.": "Your music, all in one place.",
    "Penyimpanan lokal": "Local storage",
    "Mode sementara": "Temporary mode",
    "IndexedDB tidak tersedia — koleksi hanya bertahan selama tab ini terbuka":
      "IndexedDB isn't available — the collection only lasts while this tab is open",
    "Buka menu": "Open menu",
    "Kembali": "Back",
    "Maju": "Forward",
    "Cari": "Search",
    "Antrean": "Queue",
    "Lirik": "Lyrics",
    "Impor": "Import",
    "Tutup": "Close",
    "Batal": "Cancel",
    "Simpan": "Save",
    "Hapus": "Delete",
    "Hapus semua": "Delete all",
    "Tambahkan": "Add",
    "Tambah": "Add",
    "Buat sekarang": "Create now",
    "Selesai": "Done",
    "Lanjut": "Continue",
    "Mulai": "Get started",
    "Lewati": "Skip",
    "Lewati dulu": "Skip for now",
    "Ganti nama": "Change name",
    "Mulai mendengarkan": "Start listening",
    "Nanti": "Later",
    "Cek lagi": "Check again",
    "Cek pembaruan": "Check for updates",
    "Pasang aplikasi": "Install app",
    "Pasang & mulai ulang": "Install & restart",
    "Unduh pembaruan": "Download update",
    "Impor lagi": "Import again",

    /* Pemutar */
    "Tidak ada yang diputar": "Nothing playing",
    "Pilih lagu dari perpustakaanmu": "Pick a song from your library",
    "Buka pemutar": "Open player",
    "Buka pemutar lagu yang sedang diputar": "Open the now playing screen",
    "Buka album": "Open album",
    "Buka artis": "Open artist",
    "Buka lirik": "Open lyrics",
    "Tutup lirik": "Close lyrics",
    "Info format audio": "Audio format info",
    "Sukai": "Like",
    "Sukai lagu": "Like song",
    "Hapus dari suka": "Remove from Liked",
    "Unduh audio dari YouTube": "Download audio from YouTube",
    "Unduh audio": "Download audio",
    "Unduh audio (FLAC bila tersedia)": "Download audio (FLAC when available)",
    "Acak": "Shuffle",
    "Jeda": "Pause",
    "Acak album": "Shuffle album",
    "Acak playlist": "Shuffle playlist",
    "Putar": "Play",
    "Putar album": "Play album",
    "Putar playlist": "Play playlist",
    "Putar berikutnya": "Play next",
    "Sebelumnya": "Previous",
    "Lagu sebelumnya": "Previous song",
    "Berikutnya": "Next",
    "Lagu berikutnya": "Next song",
    "Ulangi": "Repeat",
    "Posisi putar": "Playback position",
    "Timer tidur": "Sleep timer",
    "Bisukan": "Mute",
    "Bunyikan": "Unmute",
    "Bisu": "Muted",
    "Volume": "Volume",
    "Buka antrean": "Open queue",
    "Tutup antrean": "Close queue",
    "Antrean pemutaran": "Playback queue",
    "Sedang diputar": "Now playing",
    "Sekarang diputar": "Now playing",
    "Bersihkan antrean": "Clear queue",
    "Bersihkan": "Clear",
    "Pilihan cepat": "Quick picks",
    "Navigasi utama": "Main navigation",
    "Sidebar navigasi": "Sidebar navigation",
    "Pemutar musik": "Music player",
    "Daftar lagu": "Song list",
    "Lagu online": "Online songs",
    "Riwayat pemutaran": "Listening history",
    "Perbesar tampilan": "Expand view",
    "Layar penuh": "Full screen",
    "Tutup pemutar": "Close player",
    "Buka pengaturan": "Open settings",
    "Tutup menu": "Close menu",
    "Cari musik": "Search music",
    "Bersihkan pencarian": "Clear search",
    "Dari YouTube": "From YouTube",
    "Dari perpustakaan": "From your library",
    "Dari Perpustakaan": "From your library",
    "Dari internet": "From the internet",
    "SEDANG DIPUTAR": "NOW PLAYING",
    "Video streaming dari YouTube": "Video streamed from YouTube",
    "Sampul YouTube": "YouTube cover",
    "YouTube": "YouTube",
    "Video": "Video",

    /* Beranda */
    "Selamat pagi": "Good morning",
    "Selamat siang": "Good afternoon",
    "Selamat sore": "Good evening",
    "Selamat malam": "Good evening",
    "Belum tidur": "Still up",
    "Temukan soundtrack harianmu — rekomendasi langsung diputar tanpa impor.":
      "Find your daily soundtrack — recommendations play instantly, no imports.",
    "Dibuat untukmu": "Made for you",
    "Lagu populer hari ini": "Popular today",
    "Rekomendasi untukmu": "Recommended for you",
    "Terakhir diputar": "Recently played",
    "Lagu lokal yang terakhir kamu dengarkan": "The last local songs you listened to",
    "Stasiun untukmu": "Stations for you",
    "Stasiun pintar dari koleksi musikmu sendiri.": "Smart stations from your own music collection.",
    "Radio yang dimulai dari sebuah lagu — terus berjalan otomatis":
      "Radio that starts from a song — and keeps going automatically",
    "Sering diputar orang lain — tekan untuk memutar":
      "Popular with other listeners — press to play",
    "Dipilih dari lagu yang sedang populer dan yang kamu dengarkan":
      "Picked from popular songs and what you've been listening to",
    "Lagu pilihan berdasarkan yang sedang populer": "Curated songs based on what's popular",
    "Mulai cepat": "Quick start",
    "Lihat semua ↗": "See all ↗",
    "Jelajahi ↗": "Explore ↗",
    "Putar semua": "Play all",
    "Putar semua hasil": "Play all results",
    "Putar acak": "Shuffle play",
    "Muat lebih banyak": "Load more",
    "Muat demo": "Load demo",
    "Coba perpustakaan demo": "Try the demo library",
    "Rekomendasi belum bisa dimuat": "Recommendations couldn't load",
    "Rekomendasi masih dimuat. Coba lagi sebentar.":
      "Recommendations are still loading. Try again in a moment.",
    "Coba lagi": "Try again",
    "Periksa koneksi internet lalu coba lagi.": "Check your internet connection and try again.",
    "Gagal memuat rekomendasi": "Couldn't load recommendations",
    "Belum ada musik": "No music yet",
    "Muat perpustakaan demo?": "Load the demo library?",
    "Ini akan menambahkan 12 lagu demo ke perpustakaanmu. Kamu bisa menghapusnya kapan saja tanpa memengaruhi file aslimu.":
      "This adds 12 demo songs to your library. You can remove them at any time without affecting your own files.",
    "Perpustakaan demo sudah dimuat.": "The demo library is loaded.",
    "Gagal membuat demo": "Couldn't create the demo",
    "Modul demo tidak tersedia.": "The demo module isn't available.",
    "Membuat audio contoh di browser. Ini mungkin memerlukan beberapa detik.":
      "Creating sample audio in your browser. This may take a few seconds.",

    /* Jelajahi */
    "Jelajahi genre": "Explore genres",
    "Belum ada yang bisa dijelajahi": "Nothing to explore yet",
    "Impor musik dengan tag artis, atau muat demo untuk melihat contoh.":
      "Import music with artist tags, or load the demo for a preview.",
    "Kumpulan lagu berdasarkan genre di perpustakaanmu":
      "Song collections by genre in your library",
    "Temukan album, artis, dan genre dari koleksimu.": "Find albums, artists, and genres from your collection.",
    "Genre": "Genre",
    "Album lainnya oleh": "More albums by",
    "Jelajahi genre di perpustakaanmu.": "Explore genres in your library.",

    /* Radio */
    "Stasiun tanpa henti": "Endless stations",
    "Stasiun pilihan": "Featured stations",
    "Stasiun": "Stations",
    "Stasiun radio": "Radio stations",
    "Radio belum mengudara": "Radio is off air",
    "Tambahkan lagu ke perpustakaan, atau mulai stasiun dari lagu mana pun di Beranda dan pemutar.":
      "Add songs to your library, or start a station from any song on Home or in the player.",
    "Impor beberapa lagu terlebih dahulu, atau muat perpustakaan demo untuk melihat aplikasi bekerja.":
      "Import a few songs first, or load the demo library to see the app in action.",
    "Radio lokal.": "Local radio.",
    "Stasiun di bawah memilih lagu acak dari genre yang tersedia. Tidak ada data yang dikirim keluar perangkat.":
      "The stations below pick random songs from available genres. No data leaves your device.",

    /* Riwayat */
    "Riwayat Pemutaran": "Listening History",
    "Lagu yang kamu dengarkan minimal 30 detik akan muncul di sini.":
      "Songs you listen to for at least 30 seconds show up here.",
    "Belum ada riwayat pemutaran": "No listening history yet",
    "Mulai putar satu lagu, lalu kembali ke halaman ini.":
      "Start playing a song, then come back to this page.",
    "Putar lagu dari beranda atau pencarian untuk mulai membangun riwayat.":
      "Play a song from Home or Search to start building your history.",
    "Acak riwayat": "Shuffle history",
    "Hapus riwayat": "Clear history",
    "Hapus riwayat pemutaran?": "Clear listening history?",
    "Daftar lagu yang pernah diputar akan dihapus. Lagu di perpustakaan tetap aman.":
      "Your listening history will be cleared. Songs in your library stay safe.",
    "Riwayat pemutaran dihapus.": "Listening history cleared.",
    "Gagal menghapus riwayat.": "Couldn't clear the history.",
    "Baru saja": "Just now",

    /* Artis, album, lagu, suka */
    "Belum ada artis": "No artists yet",
    "Belum ada album": "No albums yet",
    "Belum ada lagu": "No songs yet",
    "Belum ada lagu di sini.": "No songs here yet.",
    "Impor file audio untuk mulai mengisi perpustakaan.":
      "Import audio files to start filling your library.",
    "Album dibentuk otomatis dari tag album pada file musikmu.":
      "Albums are created automatically from the album tags in your music files.",
    "Belum ada lagu yang disukai": "No liked songs yet",
    "Belum ada lagu yang disukai.": "No liked songs yet.",
    "Tekan ikon hati pada lagu mana pun — termasuk lagu YouTube — untuk menyimpannya di sini.":
      "Tap the heart on any song — including YouTube songs — to save it here.",
    "Semua lagu": "All songs",
    "Lagu teratas": "Top songs",
    "Lagu galau": "Sad songs",
    "Terbaru": "Newest",
    "A–Z": "A–Z",
    "Diputar": "Played",
    "Sumber": "Source",
    "Judul": "Title",
    "Waktu": "Time",
    "Tidak ditemukan": "Not found",
    "Tidak tersedia": "Unavailable",
    "Tidak diketahui": "Unknown",
    "Lagu tanpa judul": "Untitled song",
    "Artis tidak dikenal": "Unknown artist",
    "Playlist tanpa nama": "Untitled playlist",
    "Singel": "Single",
    "Lainnya": "Others",
    "Tidak ada lagu untuk diputar. Coba kata kunci lain.":
      "No songs to play. Try another keyword.",
    "Tidak ada lagu untuk diputar.": "No songs to play.",
    "Belum ada lagu untuk diputar.": "No songs to play yet.",
    "Tidak ada hasil": "No results",
    "Playlist ini masih kosong": "This playlist is empty",
    "Playlist ini masih kosong.": "This playlist is empty.",
    "Tambahkan lagu dari perpustakaanmu untuk mulai menyusun playlist.":
      "Add songs from your library to start building a playlist.",
    "Tambah lagu": "Add songs",
    "Tambah lagu…": "Add songs…",
    "Hapus dari playlist": "Remove from playlist",
    "Hapus lagu": "Delete song",
    "Hapus lagu?": "Delete song?",
    "Hapus dari perpustakaan": "Remove from library",
    "Hapus album": "Delete album",
    "Hapus album?": "Delete album?",
    "Hapus album dari perpustakaan": "Remove album from library",
    "Hapus album dari Suka": "Remove album from Liked",
    "Album dihapus dari perpustakaan.": "Album removed from your library.",
    "Album dihapus dari Suka.": "Album removed from Liked.",
    "Album ditambahkan ke Suka.": "Album added to Liked.",
    "Lagu dihapus dari perpustakaan.": "Song removed from your library.",
    "Lagu dihapus dari playlist.": "Song removed from the playlist.",
    "Hapus dari Suka": "Remove from Liked",
    "Hapus dari suka": "Remove from Liked",
    "Sukai semua lagu": "Like all songs",
    "Sukai album": "Like album",
    "Diperbarui": "Updated",
    "album penuh": "full album",
    "lagu oleh": "songs by",
    "kumpulan lagu": "song collection",
    "lagu": "songs",

    /* Pencarian */
    "Cari lagu apa pun": "Search for any song",
    "Cari lagu di perpustakaanmu dan YouTube — hasil muncul langsung di sini.":
      "Search your library and YouTube — results appear right here.",
    "Ketik judul lagu atau nama artis. Hasil dari perpustakaan dan YouTube langsung muncul di sini.":
      "Type a song title or artist name. Results from your library and YouTube appear here instantly.",
    "Cari · YouTube": "Search · YouTube",
    "Hasil pencarian": "Search results",
    "Cari lagi di YouTube": "Search YouTube again",
    "Cari lagu": "Find songs",
    "Cari lagu atau artis": "Find a song or artist",
    "Pencarian YouTube sedang tidak dapat diakses. Coba lagi beberapa saat lagi, atau tempel tautan video langsung.":
      "YouTube search is unavailable right now. Try again in a moment, or paste a video link directly.",
    "Tidak dapat mencari di YouTube.": "Couldn't search YouTube.",
    "Periksa koneksi internet atau coba lagi beberapa saat lagi.":
      "Check your internet connection or try again in a moment.",
    "Tidak ada hasil untuk": "No results for",
    "Hasil untuk": "Results for",
    "Mencari di YouTube.": "Searching YouTube.",
    "Mencari lirik…": "Searching for lyrics…",

    /* Pengaturan */
    "Tampilan": "Appearance",
    "Tema dan tampilan antarmuka.": "Theme and interface appearance.",
    "Tema": "Theme",
    "Gelap": "Dark",
    "Terang": "Light",
    "Mode gelap memakai hitam murni untuk layar AMOLED.": "Dark mode uses pure black for AMOLED screens.",
    "Pemutaran": "Playback",
    "Acak, ulangi, dan timer tidur.": "Shuffle, repeat, and sleep timer.",
    "Audio": "Audio",
    "Kualitas streaming dan unduhan (Tracks, cadangan YouTube).":
      "Streaming and download quality (Tracks, YouTube fallback).",
    "Audio Lab": "Audio Lab",
    "Equalizer, efek audio, transisi lagu, dan kecepatan.":
      "Equalizer, audio effects, crossfade, and speed.",
    "Perpustakaan & Penyimpanan": "Library & Storage",
    "Impor musik, penyimpanan lokal, dan data.": "Music imports, local storage, and data.",
    "Tentang": "About",
    "Pintasan, kredit, dan informasi aplikasi.": "Shortcuts, credits, and app information.",
    "Bahasa": "Language",
    "Bahasa antarmuka": "Interface language",
    "Bahasa antarmuka.": "Interface language.",
    "Pilih bahasa yang dipakai Vinyl.": "Choose the language Vinyl uses.",
    "Tampilan, pemutaran, audio, dan data perpustakaan dalam satu tempat.":
      "Appearance, playback, audio, and library data in one place.",

    /* Detail pengaturan */
    "Ulangi semua lagu atau satu lagu.": "Repeat all songs or one song.",
    "Atur": "Set",
    "Ubah": "Edit",
    "Nonaktif — pemutaran berhenti mengikuti pilihanmu.":
      "Off — playback stops according to your choice.",
    "Hemat = OPUS 70 kbps · Standar = OPUS 160 kbps · Tinggi = hingga 256 kbps (AAC/OPUS) · FLAC = lossless dari katalog Tracks (monochrome.st) bila lagunya tersedia; jika tidak, otomatis turun ke audio YouTube terbaik. Format yang benar-benar dipakai selalu tampil di pemutar.":
      "Data saver = OPUS 70 kbps · Standard = OPUS 160 kbps · High = up to 256 kbps (AAC/OPUS) · FLAC = lossless from the Tracks catalog (monochrome.st) when the song is available; otherwise it falls back to the best YouTube audio automatically. The format actually in use always appears in the player.",
    "Tampilkan baris detail kecil di bawah judul pada tampilan Now Playing. Klik chip format di pemutar untuk membuka panel info lengkap.":
      "Show a small detail line under the title on the Now Playing screen. Click the format chip in the player to open the full info panel.",
    "Unduhan berjalan langsung di browser, tanpa server lokal maupun ffmpeg. Pilih":
      "Downloads run right in the browser, with no local server or ffmpeg. Choose",
    "untuk mengambil versi lossless dari katalog Tracks; bila lagunya tidak tersedia, audio terbaik YouTube yang diunduh. Pilihan lain mengunduh audio sumber YouTube (OPUS/AAC).":
      "to get the lossless version from the Tracks catalog; if the song isn't available, the best YouTube audio is downloaded. Other options download the source YouTube audio (OPUS/AAC).",
    "MP3, M4A, FLAC, WAV, OGG, dan format audio lain yang didukung browser.":
      "MP3, M4A, FLAC, WAV, OGG, and other audio formats your browser supports.",
    "Tambahkan 12 lagu contoh untuk mencoba semua fitur tanpa file pribadi.":
      "Add 12 sample songs to try every feature without your own files.",
    "Memori": "Memory",
    "Menghapus seluruh lagu, sampul, dan playlist dari aplikasi. File asli tidak terhapus.":
      "Removes every song, cover, and playlist from the app. Your original files are untouched.",
    "Volume meluncur turun di akhir lagu lalu naik perlahan di awal lagu berikutnya, jadi perpindahan antar lagu terasa mulus. Bekerja di semua sumber, termasuk FLAC dan YouTube.":
      "Volume fades down at the end of a song and rises gently at the start of the next, so transitions feel seamless. Works with every source, including FLAC and YouTube.",
    "Koreksi sepuluh pita frekuensi (31 Hz – 16 kHz) lewat Web Audio. Berlaku untuk lagu yang diputar lewat server Vinyl atau file lokal; FLAC dari katalog diputar langsung tanpa pemrosesan.":
      "Ten-band frequency correction (31 Hz – 16 kHz) through Web Audio. Applies to songs played through the Vinyl server or local files; catalog FLAC plays straight through without processing.",
    "Titik awal kurva; kamu bisa menyetel tiap pita lewat slider di bawah.":
      "Starting point for the curve; you can adjust each band with the sliders below.",
    "Datar": "Flat",
    "Vokal": "Vocal",
    "Elektronik": "Electronic",
    "Akustik": "Acoustic",
    "Geser tiap pita dari −12 hingga +12 dB. Perubahan terdengar langsung.":
      "Drag each band from −12 to +12 dB. Changes are audible instantly.",
    "Gabungkan kanal kiri dan kanan menjadi satu — berguna dengan satu speaker atau headset tengah.":
      "Merge the left and right channels into one — useful with a single speaker or a centered headset.",
    "Meratakan bagian paling keras dan paling pelan, nyaman untuk dengarkan di lingkungan bising.":
      "Evens out the loudest and quietest parts, making listening comfortable in noisy places.",
    "Ubah tempo pemutaran; pilihan tersimpan untuk semua lagu berikutnya.":
      "Change the playback tempo; your choice is saved for all upcoming songs.",
    "Saat kecepatan diubah, nada tetap seperti aslinya. Berlaku di pemutar elemen audio; pemutar YouTube IFrame selalu mempertahankan nada.":
      "When the speed changes, the pitch stays as it was. Applies to the audio-element player; the YouTube IFrame player always preserves pitch.",
    "Status pemrosesan": "Processing status",
    "Datar": "Flat",
    "Bass": "Bass",
    "Rock": "Rock",
    "Vinyl sudah terpasang": "Vinyl is installed",
    "Aplikasi berjalan di layar penuh. Buka lagi lewat ikon Vinyl di layar utama.":
      "The app runs full screen. Open it again from the Vinyl icon on your home screen.",
    "Terpasang": "Installed",
    "Di Safari, ketuk tombol Bagikan lalu pilih “Tambah ke Layar Utama”. Vinyl terbuka seperti aplikasi biasa.":
      "In Safari, tap the Share button and choose “Add to Home Screen”. Vinyl opens like a regular app.",
    "Buka menu browser lalu pilih “Pasang aplikasi”. Vinyl bisa dibuka dari layar utama tanpa address bar.":
      "Open the browser menu and choose “Install app”. Vinyl opens from your home screen without an address bar.",
    "Tambahkan Vinyl ke layar utama. Terbuka layar penuh dan tetap ringan dipakai di ponsel.":
      "Add Vinyl to your home screen. It opens full screen and stays light on phones.",
    "Pasang": "Install",
    "Pemutar musik streaming bergaya semi-Apple Music di browser. Tanpa akun, lengkap dengan FLAC lossless dan unduhan langsung dari browser.":
      "A semi-Apple Music style streaming player in the browser. No account, complete with lossless FLAC and direct downloads from the browser.",
    "Pintasan": "Shortcuts",
    "Dibuat dengan HTML, CSS, dan JavaScript murni, ditambah fungsi serverless untuk pencarian dan streaming.":
      "Built with plain HTML, CSS, and JavaScript, plus serverless functions for search and streaming.",
    "putar/jeda ·": "play/pause ·",
    "geser 5 detik ·": "seek 5 seconds ·",
    "cari ·": "search ·",
    "bisukan ·": "mute ·",
    "antrean.": "queue.",
    "Versi": "Version",
    "· Lisensi: GPL-3.0-or-later ·": "· License: GPL-3.0-or-later ·",
    "Kode sumber": "Source code",
    "Pemberitahuan pihak ketiga": "Third-party notices",
    "Terima kasih untuk proyek open source dan layanan yang membuat Vinyl mungkin.":
      "Thanks to the open source projects and services that make Vinyl possible.",
    "Lihat kredit lengkap": "See full credits",
    "Pengembang Vinyl": "Vinyl developer",
    "Aktifkan FLAC lossless": "Enable FLAC lossless",
    "Tidak ada pengaturan yang cocok.": "No matching settings.",
    "Stasiun utama": "Main station",
    "Radio Musik": "Music Radio",
    "semua genre, acak": "all genres, shuffled",
    "Pilih lagu atau album untuk mulai memutar musik.":
      "Pick a song or album to start playing music.",
    "AAC/OPUS hingga 256 kbps": "AAC/OPUS up to 256 kbps",
    "Lossless via katalog Tracks": "Lossless via the Tracks catalog",
    "OPUS sekitar 50 kbps": "OPUS around 50 kbps",
    "OPUS sekitar 70 kbps": "OPUS around 70 kbps",
    "OPUS/AAC hingga 160 kbps": "OPUS/AAC up to 160 kbps",
    "audio sumber": "source audio",
    "lossless dari katalog Tracks": "lossless from the Tracks catalog",
    "Tinggi (audio sumber)": "High (source audio)",
    "Graf audio belum aktif - akan menyala untuk lagu berikutnya.":
      "The audio graph isn't active yet - it will start on the next song.",
    "Putar / jeda": "Play / pause",
    "Geser 5 detik": "Seek 5 seconds",
    "Lagu sebelumnya / berikutnya": "Previous / next song",
    "Klik tombol": "Click the button",
    "Suka lagu saat ini": "Like the current song",
    "Bantuan": "Help",
    "Versi aplikasi · pintasan keyboard · kredit open source":
      "App version · keyboard shortcuts · open source credits",
    "Pembaruan hanya tersedia pada aplikasi terpasang.":
      "Updates are only available in the installed app.",
    "Putar antrean dalam urutan acak.": "Shuffle the queue.",
    "Memeriksa…": "Checking…",
    "Mengunduh…": "Downloading…",
    "Memasang…": "Installing…",
    "Lompat ke konten": "Skip to content",
    "Lanjutkan": "Continue",
    "Konfirmasi": "Confirm",

    /* Detail pengaturan (lanjutan audio lab) */

    "Cari pengaturan": "Search settings",
    "Cari lagu, artis, album.": "Search songs, artists, albums.",
    "Cari lagu, artis, album…": "Search songs, artists, albums…",
    "Cari lagu, artis, atau album.": "Search songs, artists, or albums.",
    "Cari playlist.": "Search playlists.",
    "Cari playlist": "Search playlists",
    "Ganti ke tema gelap": "Switch to dark theme",
    "Ganti ke tema terang": "Switch to light theme",
    "Acak semua": "Shuffle all",
    "Belum ada playlist.": "No playlists yet.",
    "Belum ada lagu.": "No songs yet.",
    "Belum ada riwayat pemutaran.": "No listening history yet.",
    "Belum ada data musik tersimpan.": "No saved music data yet.",
    "Bukan lagu online.": "Not an online song.",
    "Impor dibatalkan sebelum semua file selesai.":
      "Import canceled before all files finished.",
    "Impor musik terlebih dahulu untuk menambahkan lagu ke playlist.":
      "Import music first to add songs to a playlist.",
    "Nonaktif - audio mengalir langsung ke perangkat tanpa pemrosesan.":
      "Off - audio goes straight to your device without processing.",
    "Nonaktif — audio mengalir langsung ke perangkat tanpa pemrosesan.":
      "Off — audio goes straight to your device without processing.",
    "Sudah ada - dilewati": "Already exists - skipped",
    "Sudah ada — dilewati": "Already exists — skipped",
    "Tutup notifikasi": "Close notification",
    "Vinyl belum tahu harus memanggilmu apa. Atur nama panggilan untuk sapaan di Beranda.":
      "Vinyl doesn't know what to call you yet. Set a display name for the greeting on Home.",
    "Temukan soundtrack harianmu dari koleksi dan rekomendasi pilihan.":
      "Find your daily soundtrack from your collection and curated picks.",
    "Suka · YouTube": "Liked · YouTube",
    "Berlaku untuk lagu berikutnya.": "Applies to the next song.",
    "Lagu dimuat ulang.": "The song was reloaded.",
    "tersimpan di browser.": "saved in the browser.",
    "(hanya di memori tab ini).": "(only in this tab's memory).",
    "Disarankan": "Suggested",
    "Atur Timer tidur": "Set sleep timer",
    "Batalkan timer": "Cancel timer",
    "Belum tidur": "Still up",
    "Maksimal": "Maximum",
    "Equalizer": "Equalizer",
    "Transisi lagu": "Crossfade",
    "Transisi lagu:": "Crossfade:",
    "Transisi lagu dimatikan.": "Crossfade turned off.",
    "Kecepatan putar": "Playback speed",
    "Kecepatan putar:": "Playback speed:",
    "Kecepatan putar: normal.": "Playback speed: normal.",
    "Mati": "Off",
    "Aktif": "On",
    "Nonaktif": "Off",
    "Normal": "Normal",
    "Format streaming": "Streaming format",
    "Format unduhan": "Download format",
    "Kualitas streaming": "Streaming quality",
    "Kualitas unduhan": "Download quality",
    "Kualitas streaming:": "Streaming quality:",
    "Kualitas unduhan:": "Download quality:",
    "Kualitas streaming dan unduhan": "Streaming and download quality",
    "Stats for nerds": "Stats for nerds",
    "Info format audio:": "Audio format info:",
    "Format audio": "Audio format",
    "Format audio sedang dideteksi": "Detecting audio format",
    "Mendeteksi…": "Detecting…",
    "FLAC tidak tersedia": "FLAC unavailable",
    "Berkas lokal": "Local file",
    "Berkas lokal (browser)": "Local file (browser)",
    "berkas lokal": "local file",
    "Mendeteksi…": "Detecting…",
    "Mendeteksi.": "Detecting…",
    "internet": "the internet",
    "Proxy audio lokal": "Local audio proxy",
    "Tidak aktif": "Inactive",
    "Format & tentang": "Format & about",
    "Versi aplikasi": "App version",
    "Versi katalog": "Catalog version",
    "Pembaruan": "Updates",
    "Memeriksa pembaruan…": "Checking for updates…",
    "Vinyl sudah versi terbaru.": "Vinyl is up to date.",
    "Gagal memeriksa pembaruan.": "Couldn't check for updates.",
    "Gagal memeriksa pembaruan. Coba lagi nanti.": "Couldn't check for updates. Try again later.",
    "Gagal mengunduh pembaruan.": "Couldn't download the update.",
    "Gagal mengunduh pembaruan. Coba lagi nanti.": "Couldn't download the update. Try again later.",
    "Gagal memasang pembaruan.": "Couldn't install the update.",
    "Mengunduh pembaruan…": "Downloading update…",
    "Periksa pembaruan untuk mendapatkan versi terbaru.": "Check for updates to get the latest version.",
    "Unduh untuk offline": "Download for offline",
    "Simpan lagu, putar tanpa internet.": "Save songs, play without the internet.",

    /* Stats for nerds */
    "Asal audio": "Audio source",
    "Jenis": "Type",
    "Itag": "Itag",
    "MIME": "MIME",
    "Bitrate": "Bitrate",
    "Sample rate": "Sample rate",
    "Kanal": "Channels",
    "Kanal keluaran": "Output channels",
    "Bit depth": "Bit depth",
    "Mesin": "Engine",
    "Output": "Output",
    "Perangkat keluaran": "Output device",
    "Posisi": "Position",
    "Resampling": "Resampling",
    "Status": "Status",
    "Wadah": "Container",
    "Buffer": "Buffer",
    "Kecepatan": "Speed",
    "Mode diminta": "Requested mode",
    "Efek / DSP": "Effects / DSP",
    "Dikelola browser/OS": "Managed by browser/OS",
    "Tidak ada di aplikasi": "Not in app",
    "Dijeda": "Paused",
    "Lossy (terkompresi)": "Lossy (compressed)",
    "Tinggi": "High",
    "Hemat": "Data saver",
    "Standar": "Standard",
    "Terbaik": "Best",
    "Graf Web Audio aktif untuk lagu saat ini.": "The Web Audio graph is active for the current song.",
    "Graf aktif. FLAC dari katalog diputar tanpa pemrosesan (server katalog tidak mengirim CORS); lagu lain tetap diproses.":
      "Graph active. Catalog FLAC plays without processing (the catalog server doesn't send CORS); other songs are still processed.",
    "Graf audio belum aktif — akan menyala untuk lagu berikutnya.":
      "The audio graph isn't active yet — it will start on the next song.",
    "Graf audio akan aktif setelah kamu berinteraksi dengan halaman (aturan autoplay browser).":
      "The audio graph starts after you interact with the page (browser autoplay rules).",
    "Menunggu interaksi pengguna untuk mengaktifkan graf audio.":
      "Waiting for user interaction to enable the audio graph.",
    "Data perangkat keluaran dan resampling dikelola browser/sistem operasi sehingga tidak bisa dibaca aplikasi. Angka di atas adalah format audio yang benar-benar diterima pemutar.":
      "Output device and resampling data is managed by the browser/operating system, so the app can't read it. The numbers above are the audio format the player actually receives.",
    "Periksa detail di bawah ini.": "Check the details below.",

    /* Timer tidur */
    "Atur timer tidur": "Set sleep timer",
    "Timer tidur:": "Sleep timer:",
    "Timer tidur dibatalkan.": "Sleep timer canceled.",
    "Timer tidur selesai — pemutaran dijeda.": "Sleep timer finished — playback paused.",
    "Akan berhenti setelah lagu ini selesai.": "Will stop after this song ends.",
    "Pemutaran berhenti setelah lagu ini selesai.": "Playback will stop after this song ends.",
    "menit": "minutes",
    "detik": "seconds",
    "menit.": "minutes.",
    "akhir lagu": "end of song",
    "Akhir lagu": "End of song",

    /* Menu & dialog */
    "Opsi lain": "More options",
    "Opsi lain untuk": "More options for",
    "Hapus dari antrean": "Remove from queue",
    "Tambahkan ke antrean": "Add to queue",
    "Tambahkan album ke antrean": "Add album to queue",
    "Tambahkan album ke playlist": "Add album to playlist",
    "Tambah ke playlist": "Add to playlist",
    "Impor ke playlist": "Import to playlist",
    "Ganti nama playlist": "Rename playlist",
    "Nama playlist": "Playlist name",
    "Playlist baru": "New playlist",
    "Nama playlist diperbarui.": "Playlist renamed.",
    "Hapus playlist": "Delete playlist",
    "Hapus playlist?": "Delete playlist?",
    "Playlist dihapus.": "Playlist deleted.",
    "Playlist tidak ditemukan.": "Playlist not found.",
    "Tidak ada lagu yang cocok.": "No matching songs.",
    "Playlist baru ditambahkan. Tekan Tambahkan untuk menyimpan.":
      "New playlist added. Press Add to save it.",
    "Lagu sudah ada di playlist yang dipilih.": "The song is already in the selected playlist.",
    "Masukkan nama": "Enter a name",
    "Misalnya: Lagu untuk malam": "For example: Songs for the night",
    "Maksimal": "Maximum",
    "Pilih lagu untuk melihat lirik": "Pick a song to see the lyrics",
    "Ketuk baris untuk melompat": "Tap a line to jump",
    "Ketuk baris mana pun untuk melompat ke bagian lagu itu.":
      "Tap any line to jump to that part of the song.",
    "Lirik tidak tersedia": "Lyrics unavailable",
    "Lirik tidak ditemukan di file atau katalog lirik online.":
      "No lyrics found in the file or the online lyrics catalog.",
    "Lirik file atau LRCLIB": "File lyrics or LRCLIB",
    "Lirik sinkron": "Synced lyrics",
    "Lirik teks": "Plain lyrics",
    "Gagal memuat lirik": "Couldn't load lyrics",
    "Lagu untuk pencarian lirik tidak valid.": "Invalid song for a lyrics lookup.",
    "Lirik gagal dimuat": "Lyrics failed to load",
    "Lirik dicari berdasarkan judul dan artis lagu.": "Lyrics are looked up by song title and artist.",
    "Lirik tidak ditemukan": "Lyrics not found",
    "Tidak ada yang diimpor": "Nothing imported",
    "Tidak ada file audio yang dipilih.": "No audio files selected.",
    "Tidak ada file audio yang terbaca.": "No readable audio files.",
    "Tidak ada file yang berhasil diimpor.": "No files were imported.",
    "Tidak ada file yang terbaca.": "No readable files.",
    "Tidak dapat membaca file.": "Couldn't read the file.",
    "File tidak valid.": "Invalid file.",
    "File audio tidak ditemukan.": "Audio file not found.",
    "Impor dibatalkan": "Import canceled",
    "Impor sedang berjalan. Tunggu hingga selesai.": "An import is running. Wait for it to finish.",
    "Mengimpor musik": "Importing music",
    "Impor selesai": "Import complete",
    "Impor selesai dengan masalah.": "Import finished with issues.",
    "Gagal mengimpor": "Import failed",
    "Gagal diimpor": "Failed to import",
    "Membatalkan setelah file ini…": "Canceling after this file…",
    "Membatalkan.": "Canceling.",
    "Jangan tutup jendela ini.": "Don't close this window.",
    "Jangan tutup jendela ini sampai selesai.": "Don't close this window until it finishes.",
    "File tetap berada di perangkat ini.": "Files stay on this device.",
    "Tambahkan file audio dari perangkatmu.": "Add audio files from your device.",
    "Tambahkan file audio ke perpustakaanmu": "Add audio files to your library",
    "Seret file musik ke sini": "Drag music files here",
    "atau pilih file dari perangkatmu. Metadata dan sampul dibaca otomatis.":
      "or pick files from your device. Metadata and artwork are read automatically.",
    "atau pilih file dari perangkatmu.": "or pick files from your device.",
    "Pilih file": "Choose files",
    "Pilih folder": "Choose folder",
    "Impor file": "Import files",
    "Lepaskan untuk mengimpor": "Drop to import",
    "Hapus semua data": "Delete all data",
    "Hapus semua data?": "Delete all data?",
    "Seluruh lagu, sampul, playlist, dan riwayat di aplikasi ini akan dihapus. File asli di perangkatmu tetap aman. Tindakan ini tidak bisa dibatalkan.":
      "All songs, artwork, playlists, and history in this app will be deleted. Your original files stay safe. This can't be undone.",
    "Semua data perpustakaan dihapus.": "All library data deleted.",
    "Gagal menghapus semua data.": "Couldn't delete all data.",
    "Gagal menghapus data.": "Couldn't delete the data.",
    "Gagal membersihkan data.": "Couldn't clear the data.",
    "Gagal menyimpan data.": "Couldn't save the data.",
    "Penyimpanan dibatalkan.": "Storage canceled.",
    "Menyimpan ke perangkat": "Saving to device",
    "tersimpan di browser.": "saved in the browser.",
    "Tersimpan di perangkat ini.": "Stored on this device.",
    "Koleksi tersimpan di IndexedDB browser ini": "Collection stored in this browser's IndexedDB",
    "Penyimpanan browser tidak tersedia. Impor hanya bertahan selama tab ini terbuka. Jalankan lewat server lokal untuk penyimpanan permanen.":
      "Browser storage isn't available. Imports only last while this tab is open. Run through a local server for permanent storage.",
    "Basis data belum siap.": "The database isn't ready.",
    "Basis data sedang dipakai oleh tab lain.": "The database is in use by another tab.",
    "Gagal membuka basis data.": "Couldn't open the database.",
    "Permintaan basis data gagal.": "Database request failed.",
    "Permintaan memakan waktu terlalu lama. Periksa koneksi internet lalu coba lagi.":
      "The request took too long. Check your internet connection and try again.",

    /* Pemutar: error & unduhan */
    "Lagu ini": "This song",
    "Lagu ini belum siap disimpan. Coba putar dulu.": "This song isn't ready to save yet. Try playing it first.",
    "Lagu ini sedang diunduh. Tunggu sampai selesai.": "This song is downloading. Wait for it to finish.",
    "Lagu siap diputar. Tekan tombol putar untuk memulai.": "The song is ready. Press play to start.",
    "Lagu ini tidak bisa diputar": "This song can't be played",
    "Tidak dapat memutar": "Couldn't play",
    "dari internet. Periksa koneksi lalu coba lagi.": "from the internet. Check your connection and try again.",
    ". Format mungkin tidak didukung browser.": ". The format may not be supported by your browser.",
    "Format audio mungkin tidak didukung browser ini.": "This browser may not support the audio format.",
    "Pemutaran diblokir browser. Tekan tombol putar untuk memulai.":
      "Playback was blocked by the browser. Press play to start.",
    "Pemutar HTML5 tidak didukung browser ini": "This browser doesn't support the HTML5 player",
    "Semua lagu YouTube di antrean tidak bisa diputar.": "None of the YouTube songs in the queue can be played.",
    "Video tidak ditemukan atau bersifat privat": "Video not found or private",
    "Video tidak ditemukan, privat, atau tidak tersedia. Coba tautan lain.":
      "Video not found, private, or unavailable. Try another link.",
    "Video tidak ditemukan, privat, atau embed-nya dinonaktifkan. Coba tautan lain.":
      "Video not found, private, or embedding is disabled. Try another link.",
    "Video ini tidak mengizinkan pemutaran di luar YouTube. Coba pilih hasil pencarian lain.":
      "This video doesn't allow playback outside YouTube. Try another search result.",
    "ID video YouTube tidak valid": "Invalid YouTube video ID",
    "Audio lagu YouTube tidak dapat diambil.": "Couldn't fetch the YouTube song audio.",
    "Tautan streaming tidak tersedia.": "The streaming link isn't available.",
    "Server tidak dapat mengambil audio.": "The server couldn't fetch the audio.",
    "Layanan YouTube tidak tersedia saat ini. Beberapa lagu mungkin tidak bisa diputar.":
      "YouTube is unavailable right now. Some songs may not play.",
    "Gagal memuat YouTube IFrame API": "Couldn't load the YouTube IFrame API",
    "Gagal memutar video YouTube": "Couldn't play the YouTube video",
    "Kamu sedang offline. Sambungkan internet untuk memutar musik online.":
      "You're offline. Connect to the internet to play online music.",
    "Unduhan hanya tersedia untuk lagu YouTube.": "Downloads are only available for YouTube songs.",
    "Unduhan tersedia untuk lagu YouTube": "Downloads are available for YouTube songs",
    "Unduhan tersedia untuk lagu YouTube.": "Downloads are available for YouTube songs.",
    "Unduhan tidak tersedia": "Downloads unavailable",
    "Unduhan gagal dimulai. Coba lagi.": "The download couldn't start. Try again.",
    "Gagal mengunduh:": "Download failed:",
    "FLAC tidak tersedia. Mengunduh audio terbaik…": "FLAC unavailable. Downloading the best audio…",
    "Sumber tidak menyediakan FLAC; dipakai": "The source doesn't provide FLAC; using",
    "format terbaik": "best format",
    "Modul unduhan belum siap. Muat ulang halaman.": "The download module isn't ready. Reload the page.",
    "Modul YouTube belum siap. Muat ulang halaman.": "The YouTube module isn't ready. Reload the page.",
    "Tidak ada lagu baru untuk ditambahkan ke antrean.": "No new songs to add to the queue.",
    "Tidak ada lagu baru yang ditambahkan.": "No new songs were added.",
    "Antrean kosong.": "The queue is empty.",
    "Antrean dibersihkan.": "Queue cleared.",
    "Tidak ada yang diputar": "Nothing playing",

    /* PWA */
    "Pasang lewat menu browser: ⋮ → “Pasang aplikasi” atau “Instal Vinyl”.":
      "Install from the browser menu: ⋮ → “Install app” or “Install Vinyl”.",
    "Di Safari: ketuk tombol Bagikan, lalu pilih “Tambah ke Layar Utama”.":
      "On Safari: tap the Share button, then choose “Add to Home Screen”.",
    "Vinyl dipasang. Buka lewat ikon di layar utama.": "Vinyl installed. Open it from the home screen icon.",
    "tersedia. Unduh lalu pasang tanpa membuka browser.":
      "available. Download and install without opening a browser.",
    "Pembaruan siap dipasang. Klik \"Pasang & mulai ulang\" di Pengaturan.":
      "Update ready to install. Click \"Install & restart\" in Settings.",
    "Memasang pembaruan. Vinyl akan dibuka lagi sebentar.":
      "Installing the update. Vinyl will reopen in a moment.",
    "siap dipasang. Vinyl akan ditutup dan dibuka lagi.":
      "ready to install. Vinyl will close and reopen.",

    /* Onboarding */
    "Vinyl.": "Vinyl.",
    "Semua musikmu, dalam satu tempat yang tenang.": "All your music, in one quiet place.",
    "apa saja.": "anything.",
    "Cari di YouTube, atau impor MP3, M4A, FLAC, dan WAV dari perangkatmu.":
      "Search YouTube, or import MP3, M4A, FLAC, and WAV files from your device.",
    "Streaming, unduh,": "Stream, download,",
    "FLAC.": "FLAC.",
    "Putar langsung dari YouTube, simpan lagu untuk offline, dan nikmati audio lossless saat tersedia.":
      "Play straight from YouTube, save songs for offline, and enjoy lossless audio when available.",
    "Lirik yang": "Lyrics that",
    "mengikuti.": "follow along.",
    "Tersimpan di": "Stored on",
    "perangkatmu.": "your device.",
    "Perpustakaan, favorit, dan riwayatmu tidak butuh akun.":
      "Your library, favorites, and history need no account.",
    "Mau kami": "What should",
    "panggil apa?": "we call you?",
    "Cukup nama depan atau nama panggilan. Tersimpan di perangkat ini.":
      "Just a first name or nickname. Stored on this device.",
    "Nama panggilan": "Display name",
    "Nama kamu": "Your name",
    "Nama panggilan": "Display name",
    "Pilih tampilan": "Choose your",
    "favoritmu.": "favorite look.",
    "Bisa diganti kapan saja di Pengaturan → Tampilan.":
      "You can change it anytime in Settings → Appearance.",
    "Senang bertemu": "Nice to meet",
    "denganmu, ": "you, ",
    "Begini Vinyl akan menyapamu.": "Here's how Vinyl will greet you.",
    "Hitam AMOLED": "AMOLED black",
    "Latar terang": "Light background",
    "Streaming FLAC": "FLAC streaming",
    "Audio lossless bila katalog menyediakan.": "Lossless audio when the catalog provides it.",
    "Langsung dari YouTube, tanpa unduh": "Straight from YouTube, no download",
    "Di perangkat ini": "On this device",
    "Disukai": "Liked",
    "Pertanyaan": "Question",
    "Putar": "Play",
    "Musik": "Music",
    "Impor musik": "Import music",
    "Nama panggilan": "Display name",
    "Maksimal 24 karakter.": "Maximum 24 characters.",
    "Maksimal 24 karakter": "Maximum 24 characters",
    "Vinyl menyapamu dengan": "Vinyl greets you with",

    /* Format & istilah audio */
    "Format audio:": "Audio format:",
    "Format audio:": "Audio format:",
    "Kodek": "Codec",
    "Codec": "Codec",
    "Tipe": "Type",
    "Kualitas": "Quality",
    "Ukuran": "Size",
    "Durasi": "Duration",
    "Sampul": "Cover",
    "Tahun": "Year",
    "Track": "Track",
    "Disk": "Disc",
    "Diskon": "Discount",
    "Format": "Format",
    "Lossless": "Lossless",
    "Kompresi": "Compression",
    "Stereo": "Stereo",
    "Mono": "Mono",
    "Lokal": "Local",
    "Online": "Online",
    "Tersimpan": "Saved",
    "Diperbarui": "Updated",
    "Ditambahkan": "Added",
    "Baru ditambahkan": "Newly added",
    "Direkomendasikan": "Recommended",
    "Populer": "Popular",
    "Mingguan": "Weekly",
    "Harian": "Daily",
    "Semua": "All",
    "Satu": "One",
    "Lagu ini": "This song",

    /* Frasa status umum */
    "Berhasil": "Success",
    "Gagal": "Failed",
    "Terjadi kesalahan. Coba lagi.": "Something went wrong. Try again.",
    "Tidak dapat terhubung ke": "Couldn't connect to",
    "Tidak dapat memeriksa tautan YouTube. Periksa koneksi internet lalu coba lagi.":
      "Couldn't check the YouTube link. Check your internet connection and try again.",
    "Tidak dapat memuat rekomendasi. Periksa koneksi internet lalu coba lagi.":
      "Couldn't load recommendations. Check your internet connection and try again.",
    "Gagal memuat perpustakaan. Coba muat ulang halaman.":
      "Couldn't load the library. Try reloading the page.",
    "Gagal memuat": "Couldn't load",
    "Memuat…": "Loading…",
    "Menyiapkan Vinyl…": "Setting up Vinyl…",
    "Memuat koleksi, antrean, dan pengaturanmu.": "Loading your collection, queue, and settings.",
    "Menyiapkan antrean…": "Preparing the queue…",
    "Menyiapkan pemutar…": "Preparing the player…",
    "Halaman tidak ditemukan": "Page not found",
    "Tautan yang kamu buka mungkin sudah tidak tersedia, atau album/playlist telah dihapus.":
      "The link you opened may no longer exist, or the album/playlist was deleted.",
    "Kembali ke Beranda": "Back to Home",
    "Belum ada apa-apa di sini": "Nothing here yet",
    "Lainnya": "Others"
  };

  /* ------------------------------------------------------------------------
     Aturan pola dinamis
     ------------------------------------------------------------------------ */

  function enWord(word) {
    return DICT[word] || word;
  }

  function pluralEn(word, count) {
    const base = enWord(word);
    if (String(count) === "1") return base;
    if (/(s|x|z|ch|sh)$/i.test(base)) return base + "es";
    if (/[^aeiou]y$/i.test(base)) return base.slice(0, -1) + "ies";
    return base + "s";
  }

  function countText(count, word) {
    if (language === "id") return count + " " + word;
    return count + " " + pluralEn(word, count);
  }

  const NUMBER = "([0-9][0-9.,]*)";

  function numberRule(pattern, build) {
    // Callback String.replace menerima (match, grup1, grup2, ...). Build
    // ditulis sebagai (grup1, grup2, ...), jadi buang argumen match.
    return [
      new RegExp(pattern),
      function () {
        return build.apply(null, Array.prototype.slice.call(arguments, 1));
      }
    ];
  }

  const RULES = [
    /* Hitungan */
    numberRule("^" + NUMBER + "\\s+lagu$", (n) => n + (n === "1" ? " song" : " songs")),
    numberRule("^" + NUMBER + "\\s+album$", (n) => n + (n === "1" ? " album" : " albums")),
    numberRule("^" + NUMBER + "\\s+artis$", (n) => n + (n === "1" ? " artist" : " artists")),
    numberRule("^" + NUMBER + "\\s+lagu\\s+·\\s+tersimpan di perangkat ini$", (n) => n + (n === "1" ? " song" : " songs") + " · stored on this device"),
    numberRule("^" + NUMBER + "\\s+lagu\\s+·\\s+streaming penuh$", (n) => n + (n === "1" ? " song" : " songs") + " · full streaming"),
    numberRule("^" + NUMBER + "\\s+lagu\\s+yang kamu tandai$", (n) => n + (n === "1" ? " liked song" : " liked songs")),
    numberRule("^" + NUMBER + "\\s+lagu\\s+dalam riwayat\\s+·\\s+terbaru di atas$", (n) => n + (n === "1" ? " song" : " songs") + " in history · newest first"),
    numberRule("^" + NUMBER + "\\s+artis\\s+di koleksimu$", (n) => n + (n === "1" ? " artist" : " artists") + " in your collection"),
    numberRule("^Berikutnya\\s+·\\s+" + NUMBER + "\\s+lagu$", (n) => "Up next · " + n + (n === "1" ? " song" : " songs")),
    numberRule("^" + NUMBER + "\\s+lagu\\s+·\\s+(.+)$", (n, rest) => n + (n === "1" ? " song" : " songs") + " · " + translateCore(rest, null)),
    numberRule("^" + NUMBER + "\\s+album\\s+·\\s+" + NUMBER + "\\s+lagu$", (albums, tracks) =>
      albums + (albums === "1" ? " album" : " albums") + " · " + tracks + (tracks === "1" ? " song" : " songs")),
    numberRule("^" + NUMBER + "\\s+lagu\\s+·\\s+" + NUMBER + "\\s+album\\s+·\\s+" + NUMBER + "\\s+artis$", (songs, albums, artists) =>
      songs + (songs === "1" ? " song" : " songs") + " · " +
      albums + (albums === "1" ? " album" : " albums") + " · " +
      artists + (artists === "1" ? " artist" : " artists")),
    numberRule("^" + NUMBER + "\\s+lagu dipilih$", (n) => n + (n === "1" ? " song selected" : " songs selected")),
    numberRule("^" + NUMBER + "\\s+lagu diimpor ke perpustakaan\\.$", (n) => n + (n === "1" ? " song imported to your library." : " songs imported to your library.")),
    numberRule("^" + NUMBER + "\\s+lagu ditambahkan ke perpustakaanmu$", (n) => n + (n === "1" ? " song added to your library" : " songs added to your library")),
    numberRule("^Tambah \\(" + NUMBER + "\\)$", (n) => "Add (" + n + ")"),

    /* Durasi & waktu */
    numberRule("^" + NUMBER + "\\s+j\\s+" + NUMBER + "\\s+mnt$", (h, m) => h + " hr " + m + " min"),
    numberRule("^" + NUMBER + "\\s+j$", (h) => h + " hr"),
    numberRule("^" + NUMBER + "\\s+mnt$", (m) => m + " min"),
    numberRule("^" + NUMBER + "\\s+dtk$", (s) => s + " sec"),
    numberRule("^" + NUMBER + "\\s+menit lalu$", (n) => n + " minutes ago"),
    numberRule("^" + NUMBER + "\\s+jam lalu$", (n) => n + " hours ago"),
    numberRule("^" + NUMBER + "\\s+hari lalu$", (n) => n + " days ago"),
    numberRule("^" + NUMBER + "\\s+menit$", (n) => n + " minutes"),
    numberRule("^" + NUMBER + "\\s+detik$", (n) => n + " seconds"),

    /* Sapaan */
    [/^Selamat (pagi|siang|sore|malam)(?:,\s*(.+))?\.$/, (match, part, name) => {
      const label = DICT["Selamat " + part] || "Good day";
      return label + (name ? ", " + name : "") + ".";
    }],
    [/^Belum tidur(?:,\s*(.+))?\?$/, (match, name) => "Still up" + (name ? ", " + name : "") + "?"],

    /* Tanggal & metadata */
    [/^Selamat (pagi|siang|sore|malam)(,\s*.+?)?([.!?…])?$/, (match, slot, name, end) => {
      const word = slot === "pagi" ? "morning" : slot === "siang" ? "afternoon" : "evening";
      return "Good " + word + (name || "") + (end || "");
    }],
    [/^Dari (.+)$/, (match, target) => "From " + target],
    [/^Diperbarui (.+)$/, (match, date) => "Updated " + date],
    [/^(.+) · Diperbarui (.+)$/, (match, first, date) => first + " · Updated " + date],
    [/^(.+) · diputar tanpa henti$/, (match, base) => translateCore(base, null) + " · playing endlessly"],
    [/^(.+) · acak tanpa henti$/, (match, base) => translateCore(base, null) + " · shuffling endlessly"],
    [/^Pengaturan › (.+)$/, (match, section) => "Settings › " + translateCore(section, null)],
    [/^Tentang › (.+)$/, (match, section) => "About › " + translateCore(section, null)],
    [/^Aplikasi (.+)\. Periksa pembaruan untuk mendapatkan versi terbaru\.$/, (match, platform) =>
      "The " + platform + " app. Check for updates to get the latest version."],
    [/^Pembaruan (.+) tersedia\. Unduh lalu pasang tanpa membuka browser\.$/, (match, version) =>
      "Update " + version + " available. Download and install without opening a browser."],
    [/^Pembaruan (.+) tersedia\.$/, (match, version) => "Update " + version + " available."],
    [/^Pembaruan (.+) siap dipasang\. Vinyl akan ditutup dan dibuka lagi\.$/, (match, version) =>
      "Update " + version + " ready to install. Vinyl will close and reopen."],
    [/^Mengunduh pembaruan… ([0-9]+)%$/, (match, percent) => "Downloading update… " + percent + "%"],
    [/^Kualitas streaming: (.+)\. Berlaku untuk lagu berikutnya\.$/, (match, quality) =>
      "Streaming quality: " + translateCore(quality, null) + ". Applies to the next song."],
    [/^Kualitas streaming: (.+)\. Lagu dimuat ulang\.$/, (match, quality) =>
      "Streaming quality: " + translateCore(quality, null) + ". The song was reloaded."],
    [/^([0-9][0-9.,]*\s*[A-Za-z]+)\s+tersimpan di browser\.$/, (match, size) =>
      size + " saved in the browser."],
    [/^([0-9][0-9.,]*\s*[A-Za-z]+)\s+\(hanya di memori tab ini\)\.$/, (match, size) =>
      size + " (only in this tab's memory)."],
    [/^([0-9][0-9.,]*\s*[A-Za-z]+)\s+data musik\s+·\s+([0-9][0-9.,]*\s*[A-Za-z]+)\s+dari\s+([0-9][0-9.,]*\s*[A-Za-z]+)\s+kuota browser\.$/, (match, total, usage, quota) =>
      total + " of music · " + usage + " of " + quota + " browser quota."],
    [/^([0-9][0-9.,]*)\s+lagu\s+·\s+([0-9][0-9.,]*\s*[A-Za-z]+)\s+data musik\s+·\s+([0-9][0-9.,]*\s*[A-Za-z]+)\s+dari\s+([0-9][0-9.,]*\s*[A-Za-z]+)\s+kuota browser\.$/, (match, n, total, usage, quota) =>
      n + (n === "1" ? " song" : " songs") + " · " + total + " of music · " + usage + " of " + quota + " browser quota."],
    [/^Gagal memutar video YouTube \((.+)\)$/, (match, code) =>
      "Couldn't play the YouTube video (" + code + ")"],
    [/^“(.+)” akan dihapus dari perpustakaan aplikasi ini\. File asli di perangkatmu tidak terpengaruh\.$/, (match, target) =>
      "“" + target + "” will be removed from this app's library. Your original files are unaffected."],
    [/^“(.+)” akan dihapus dari perpustakaan aplikasi\. File asli tetap aman\.$/, (match, target) =>
      "“" + target + "” will be removed from the app's library. Your original files stay safe."],
    [/^“(.+)” akan dihapus\. Lagu di perpustakaan tetap aman\.$/, (match, target) =>
      "“" + target + "” will be removed. Songs in your library stay safe."],
    [/^Playlist “(.+)” akan dihapus\. Lagu di perpustakaan tetap aman\.$/, (match, name) =>
      "Playlist “" + name + "” will be deleted. Songs in your library stay safe."],
    [/^“(.+)” akan diputar berikutnya\.$/, (match, target) =>
      "“" + target + "” will play next."],
    [/^“(.+)” dari YouTube…$/, (match, target) => "“" + target + "” from YouTube…"],
    [/^Pita (.+)$/, (match, label) => "Band " + (DICT[label] || label)],
    [/^Foto profil Instagram (.+)$/, (match, handle) => "Instagram profile photo of " + handle],
    [/^Instagram pengembang: (.+)$/, (match, handle) => "Developer Instagram: " + handle],
    [/^GitHub pengembang: (.+)$/, (match, handle) => "Developer GitHub: " + handle],
    [/^Pengaturan · (.+)$/, (match, rest) => "Settings · " + translateCore(rest, null)],
    [/^Tidak ada lagu yang bisa diputar untuk “(.+)”\.$/, (match, target) =>
      "No songs available to play for “" + target + "”."],
    [/^Transisi lagu: (.+) detik\. Efek terdengar di akhir lagu yang sedang diputar\.$/, (match, seconds) =>
      "Crossfade: " + seconds + " seconds. The effect is audible at the end of the current song."],
    [/^Vinyl menyapamu dengan “(.+)” di Beranda\. Tersimpan di perangkat ini\.$/, (match, name) =>
      "Vinyl greets you with “" + name + "” on Home. Stored on this device."],
    [/^Versi (.+) · Lisensi: GPL-3\.0-or-later ·$/, (match, version) =>
      "Version " + version + " · License: GPL-3.0-or-later ·"],
    [/^Tidak dapat terhubung ke (.+)\. Periksa koneksi internet atau coba lagi beberapa saat lagi\.$/, (match, target) =>
      "Couldn't connect to " + target + ". Check your internet connection or try again in a moment."],

    /* Pencarian */
    [/^Menampilkan hasil untuk “(.+)”$/, (match, q) => "Showing results for “" + q + "”"],
    [/^hasil untuk “(.+)”$/, (match, q) => "results for “" + q + "”"],
    [/^Mencari “(.+)” di YouTube\.$/, (match, q) => "Searching “" + q + "” on YouTube."],
    [/^Mencari “(.+)”\.$/, (match, q) => "Searching “" + q + "”."],
    [/^From (Perpustakaan|internet)$/, (match, source) =>
      "From " + (source === "internet" ? "the internet" : "your library")],
    [/^Tidak ada hasil untuk ["“](.+)[”"]$/, (match, q) => "No results for “" + q + "”"],
    [/^(.+) hasil untuk ["“](.+)[”"]$/, (match, n, q) => n + " results for “" + q + "”"],

    /* Ringkasan pengaturan */
    [/^Acak:\s*(Aktif|Mati)\s*·\s*Ulangi:\s*(Satu|Semua|Mati)$/, (match, shuffle, repeat) =>
      "Shuffle: " + (shuffle === "Aktif" ? "On" : "Off") + " · Repeat: " +
      (repeat === "Satu" ? "One" : repeat === "Semua" ? "All" : "Off")],
    [/^Ulangi:\s*(mati|satu lagu|semua lagu)$/, (match, value) =>
      "Repeat: " + (value === "satu lagu" ? "one song" : value === "semua lagu" ? "all songs" : "off")],
    [/^Streaming:\s*(.+?)\s*·\s*Unduhan:\s*(.+)$/, (match, stream, download) =>
      "Streaming: " + (DICT[stream] || stream) + " · Download: " + (DICT[download] || download)],
    [/^EQ:\s*(Mati|Aktif)\s*·\s*Transisi:\s*(.+)$/, (match, eq, fade) =>
      "EQ: " + (eq === "Aktif" ? "On" : "Off") + " · Crossfade: " + (fade === "Mati" ? "Off" : fade)],
    [/^Timer tidur:\s*(.+)$/, (match, value) => "Sleep timer: " + value],
    [/^Timer tidur\s*·\s*(.+)$/, (match, value) => "Sleep timer · " + value],
    [/^Kecepatan putar:\s*(.+)$/, (match, value) => "Playback speed: " + (value === "normal." ? "normal." : value)],

    /* Atribut dinamis */
    [/^Putar (.+)$/, (match, target) => "Play " + target],
    [/^Opsi lain untuk (.+)$/, (match, target) => "More options for " + target],
    [/^Hapus (.+) dari antrean$/, (match, target) => "Remove " + target + " from queue"],
    [/^Tambahkan (.+) ke antrean$/, (match, target) => "Add " + target + " to queue"],
    [/^Sukai (.+)$/, (match, target) => "Like " + target],
    [/^Mulai Radio (.+)$/, (match, target) => "Start " + target + " Radio"],
    [/^Cari (.+) di YouTube$/, (match, target) => "Search " + target + " on YouTube"],
    [/^Buka pengaturan (.+)$/, (match, section) => "Open " + (DICT[section] || section) + " settings"],
    [/^Buka artis (.+)$/, (match, target) => "Open artist " + target],
    [/^Cari (.+) di (.+)$/, (match, target, provider) => "Search " + target + " on " + (DICT[provider] || provider)],
    [/^Info format audio:\s*(.+)$/, (match, value) => "Audio format info: " + translateCore(value, null)],
    [/^Sampul (.+)$/, (match, target) => "Cover " + target],

    /* Toast & status dinamis */
    [/^Tidak dapat memutar (.+)$/, (match, target) => "Couldn't play " + target],
    [/^(.+) tidak bisa diputar — lanjut ke lagu berikutnya\.$/, (match, target) => "Couldn't play " + target + " — moving to the next song."],
    [/^Gagal memuat “(.+)”$/, (match, target) => "Couldn't load “" + target + "”"],
    numberRule("^" + NUMBER + "\\s+lagu dari “(.+)” ditambahkan ke antrean\\.$", (n, name) => n + (n === "1" ? " song" : " songs") + " from “" + name + "” added to the queue."),
    [/^(.+) ditambahkan ke antrean\.$/, (match, target) => target + " added to the queue."],
    numberRule("^" + NUMBER + "\\s+lagu ditambahkan ke playlist “(.+)”\\.$", (n, name) => n + (n === "1" ? " song" : " songs") + " added to playlist “" + name + "”."),
    [/^Semua lagu sudah ada di playlist “(.+)”\.$/, (match, name) => "All songs are already in playlist “" + name + "”."],
    numberRule("^" + NUMBER + "\\s+lagu berhasil diimpor ke perpustakaan\\.$", (n) => n + (n === "1" ? " song imported to your library." : " songs imported to your library.")),
    numberRule("^" + NUMBER + "\\s+file gagal diimpor\\.$", (n) => n + (n === "1" ? " file failed to import." : " files failed to import.")),
    numberRule("^" + NUMBER + "\\s+file bukan audio yang didukung dan dilewati\\.$", (n) => n + (n === "1" ? " file isn't supported audio and was skipped." : " files aren't supported audio and were skipped.")),
    numberRule("^" + NUMBER + "\\s+lagu dilewati karena sudah ada\\.$", (n) => n + (n === "1" ? " song skipped because it already exists." : " songs skipped because they already exist.")),
    [/^(.+) file gagal\.$/, (match, n) => n + " file(s) failed."],
    [/^Tidak dapat memutar (.+)\. Format mungkin tidak didukung browser\.$/, (match, target) => "Couldn't play " + target + ". The format may not be supported by your browser."]
  ];

  /* ------------------------------------------------------------------------
     Terjemahan inti
     ------------------------------------------------------------------------ */

  function translateCore(text, contextEl) {
    if (!text) return text;
    if (language === "id") return text;

    if (contextEl) {
      const queueHeading = contextEl.closest && contextEl.closest(".queue-panel__head");
      if (queueHeading && text === "Berikutnya") return "Up next";
      const navHead = contextEl.closest && contextEl.closest(".nav-section__head");
      if (navHead && text === "Playlist") return "Playlists";
      const heroType = contextEl.closest && contextEl.closest(".detail-hero__type");
      if (heroType && text === "Album") return "Album";
      if (heroType && text === "Artis") return "Artist";
    }

    const exact = DICT[text];
    if (typeof exact === "string") return exact;

    for (let index = 0; index < RULES.length; index += 1) {
      const rule = RULES[index];
      const pattern = rule[0];
      const replace = rule[1];
      if (!pattern.test(text)) continue;
      try {
        return text.replace(pattern, function () {
          const args = Array.prototype.slice.call(arguments);
          if (typeof replace === "function") return replace.apply(null, args);
          return replace;
        });
      } catch (error) {
        return text;
      }
    }

    return text;
  }

  function splitRaw(raw) {
    const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(raw || "");
    if (!match) return { lead: "", core: raw || "", trail: "" };
    return { lead: match[1] || "", core: match[2] || "", trail: match[3] || "" };
  }

  function translateRaw(raw, contextEl) {
    if (!raw) return raw;
    if (language === "id") return raw;
    const parts = splitRaw(raw);
    if (!parts.core || !/[A-Za-zÀ-ÿ]/.test(parts.core)) return raw;
    const next = translateCore(parts.core, contextEl);
    if (next === parts.core) return raw;
    return parts.lead + next + parts.trail;
  }

  /* ------------------------------------------------------------------------
     Terjemahan DOM
     ------------------------------------------------------------------------ */

  // Konten pengguna & elemen teknis tidak ikut diterjemahkan.
  const SKIP_SELECTOR = [
    "[data-i18n-skip]",
    "script",
    "style",
    "svg",
    "noscript",
    "template",
    "textarea",
    "select",
    "#view .track-row__name",
    "#view .track-row__artist",
    "#view .track-row__album",
    "#view .track-row__mobile-sub",
    "#view .track-row__title-cell",
    "#view .track-row__art img",
    "#view .home-song__title",
    "#view .home-song__artist",
    "#view .home-card__title",
    "#view .home-card__sub",
    "#view .home-station__name",
    "#view .station__name",
    "#view .card__title",
    "#view .artist-row__name",
    "#view .mix-card__title",
    "#view .quick-card__title",
    "#view .detail-hero h1",
    "#view .detail-hero__desc",
    "#view .detail-hero__art img",
    ".queue-item__title",
    ".queue-item__sub",
    ".ob-song__title",
    ".ob-song__artist",
    ".ob-song__time",
    "#playerTitle",
    "#playerArtist",
    "#npTitle",
    "#npArtist",
    "#npAlbum",
    "#lyricsBody",
    "#lyricsArtist",
    "#searchInput",
    ".mark",
    ".time",
    ".track-row__time",
    ".track-row__num",
    ".track-row__index",
    ".track-row__eq",
    ".player__repeat-one",
    ".now-playing__repeat-one",
    ".sleep-toggle__time",
    "#curTime",
    "#durTime",
    "#npCurTime",
    "#npDurTime"
  ].join(",");

  const ATTRS = ["title", "aria-label", "placeholder", "alt", "aria-valuetext"];
  const textRecords = new WeakMap();
  const attrRecords = new WeakMap();
  let applying = false;

  function isSkipped(element) {
    if (!element || element === document.body || element === document.documentElement) return false;
    try {
      return !!element.closest(SKIP_SELECTOR);
    } catch (error) {
      return false;
    }
  }

  function applyTextNode(node) {
    const value = node.nodeValue;
    if (!value || !/[A-Za-zÀ-ÿ]/.test(value)) return;
    const parent = node.parentElement;
    if (!parent || isSkipped(parent)) return;
    // Teks murni angka/tanda baca (durasi, persentase) dilewati.
    if (!/[A-Za-zÀ-ÿ]/.test(value.replace(/[0-9]/g, ""))) return;

    const record = textRecords.get(node);
    let source;
    if (record) {
      // Nilai DOM bisa berasal dari hasil terjemahan sebelumnya, teks sumber,
      // atau konten dinamis baru. Simpan teks sumber agar bisa bolak-balik.
      if (record.out !== value && record.src !== value) record.src = value;
      source = record.src;
    } else {
      source = value;
    }

    const next = translateRaw(source, parent);
    if (next !== value) node.nodeValue = next;
    if (record) {
      record.src = source;
      record.out = next;
    } else {
      textRecords.set(node, { src: source, out: next });
    }
  }

  function applyAttr(element, name) {
    if (!element || !element.getAttribute) return;
    if (isSkipped(element) && !element.matches("#playerTitle,#playerArtist,#npTitle,#npArtist")) return;
    const value = element.getAttribute(name);
    if (!value || !/[A-Za-zÀ-ÿ]/.test(value)) return;

    let store = attrRecords.get(element);
    if (!store) {
      store = {};
      attrRecords.set(element, store);
    }
    let record = store[name];
    let source;
    if (record) {
      if (record.out !== value && record.src !== value) record.src = value;
      source = record.src;
    } else {
      source = value;
    }

    let next;
    if (name === "aria-valuetext") {
      next = translateRaw(source, element).replace(/\s+dari\s+/i, " of ");
    } else {
      next = translateRaw(source, element);
    }
    if (next !== value) element.setAttribute(name, next);
    store[name] = { src: source, out: next };
  }

  function applyElementAttrs(element) {
    if (!element || element.nodeType !== 1) return;
    if (isSkipped(element) && !element.matches("#playerTitle,#playerArtist,#npTitle,#npArtist")) return;
    for (let index = 0; index < ATTRS.length; index += 1) {
      const name = ATTRS[index];
      if (element.hasAttribute(name)) applyAttr(element, name);
    }
  }

  function apply(root) {
    const target = root || document.documentElement;
    if (!target) return;
    applying = true;
    try {
      if (target.nodeType === 3) {
        applyTextNode(target);
      } else if (target.nodeType === 1 || target.nodeType === 9 || target.nodeType === 11) {
        if (target.nodeType === 1) applyElementAttrs(target);
        const textWalker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, null);
        let node = textWalker.nextNode();
        while (node) {
          applyTextNode(node);
          node = textWalker.nextNode();
        }
        const elements = target.querySelectorAll
          ? target.querySelectorAll("[title],[aria-label],[placeholder],[alt],[aria-valuetext]")
          : [];
        for (let index = 0; index < elements.length; index += 1) {
          applyElementAttrs(elements[index]);
        }
      }
    } finally {
      applying = false;
    }
  }

  /* ------------------------------------------------------------------------
     MutationObserver — jaring pengaman untuk konten dinamis
     ------------------------------------------------------------------------ */

  function startObserver() {
    if (observer || typeof MutationObserver !== "function") return;
    observer = new MutationObserver(function (mutations) {
      if (applying) return;
      for (let index = 0; index < mutations.length; index += 1) {
        const mutation = mutations[index];
        if (mutation.type === "childList") {
          for (let i = 0; i < mutation.addedNodes.length; i += 1) {
            const node = mutation.addedNodes[i];
            if (node.nodeType === 1 || node.nodeType === 11) apply(node);
            else if (node.nodeType === 3) applyTextNode(node);
          }
        } else if (mutation.type === "characterData") {
          applyTextNode(mutation.target);
        } else if (mutation.type === "attributes") {
          applyAttr(mutation.target, mutation.attributeName);
        }
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS
    });
  }

  /* ------------------------------------------------------------------------
     API
     ------------------------------------------------------------------------ */

  function locale() {
    return language === "id" ? "id-ID" : "en-US";
  }

  function languageTag() {
    return language === "id" ? "id" : "en";
  }

  function t(text, vars) {
    if (language === "id") {
      return applyVars(String(text == null ? "" : text), vars);
    }
    const translated = translateCore(String(text == null ? "" : text), null);
    return applyVars(translated, vars);
  }

  function applyVars(value, vars) {
    if (!vars) return value;
    return value.replace(/\{(\w+)\}/g, function (match, key) {
      return Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match;
    });
  }

  function count(value, word) {
    return countText(value, word);
  }

  function setDocumentLanguage() {
    document.documentElement.setAttribute("lang", languageTag());
  }

  function setLanguage(next, options) {
    const value = next === "id" ? "id" : "en";
    const opts = options || {};
    const changed = value !== language;
    language = value;

    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      /* localStorage bisa diblokir */
    }

    setDocumentLanguage();
    apply(document.documentElement);

    if (opts.persist !== false && AM.Library && typeof AM.Library.setSetting === "function") {
      try {
        AM.Library.setSetting("language", value);
      } catch (error) {
        /* abaikan */
      }
    }

    if (changed || opts.force) {
      listeners.forEach(function (fn) {
        try {
          fn(value);
        } catch (error) {
          console.warn("[i18n] listener gagal:", error);
        }
      });
    }
    return value;
  }

  function onChange(fn) {
    if (typeof fn === "function") listeners.push(fn);
    return function off() {
      const index = listeners.indexOf(fn);
      if (index >= 0) listeners.splice(index, 1);
    };
  }

  function hydrate(stored) {
    if (stored !== "id" && stored !== "en") return language;
    const local = readStoredLanguage();
    if (local === stored) return language;
    return setLanguage(stored, { persist: false });
  }

  function init() {
    if (started) return;
    started = true;
    setDocumentLanguage();
    apply(document.documentElement);
    startObserver();
  }

  AM.I18n = {
    init,
    hydrate,
    apply,
    t,
    count,
    locale,
    language: function () {
      return language;
    },
    setLanguage,
    onChange,
    translate: translateCore
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})(window.AM = window.AM || {});
