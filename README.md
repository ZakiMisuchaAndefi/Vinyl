# Vinyl

Vinyl adalah pemutar musik **streaming di browser** dengan nuansa semi-Apple Music. Buka situsnya, cari lagu, lalu putar langsung — tanpa memasang aplikasi, tanpa akun, dan tanpa iklan. Audio dialirkan dari internet, dan bila lagunya tersedia kamu bisa mendengarkan **FLAC lossless**.

Tampilannya mengikuti rasa Apple Music — pemutar penuh, panel lirik, dan transisi halus — dengan identitas sendiri: palet Vinyl (pink, icy, dan ink), tema gelap AMOLED dan terang, serta sampul prosedural untuk lagu tanpa artwork. Semuanya berjalan di browser modern, termasuk di ponsel.

Perpustakaan pribadi tetap ada sebagai pelengkap: impor MP3, M4A, FLAC, WAV, OGG, dan format lain yang didukung browser, lalu simpan di perangkat ini. Tapi tidak wajib — seluruh katalog streaming bisa diputar tanpa mengimpor satu file pun.

## Fitur

**Streaming tanpa pemasangan**

- **Langsung dari browser** — buka [vinyl.my.id](https://vinyl.my.id), cari lagu, lalu putar. Tidak ada aplikasi yang perlu diunduh, tidak ada akun, tidak ada iklan.
- **FLAC lossless** — pilih format **FLAC** di Pengaturan untuk mengambil versi lossless dari katalog Tracks; kalau tidak tersedia, pemutar otomatis memakai audio terbaik dari YouTube.
- **Chip format jujur** — pemutar selalu menampilkan format yang benar-benar mengalir (`OPUS · 48 kHz`, `FLAC · 44,1 kHz`), dan bisa diklik untuk membuka **Stats for nerds**.
- **Musik dari YouTube** — cari dengan kata kunci atau tempel tautan video; audio diputar murni tanpa tampilan video dan tanpa iklan.
- **Radio otomatis** — antrean diisi lagu serupa secara otomatis, mirip autoplay YouTube Music/Spotify.
- **Beranda streaming** — rekomendasi harian, ubin cepat, stasiun radio, dan lagu populer siap diputar sekali klik.
- **Pencarian langsung** — satu kotak mencari perpustakaan dan YouTube sekaligus, dengan halaman berikutnya lewat **Muat lebih banyak**.
- **Suka lintas sumber** — lagu streaming dan lagu lokal bisa ditandai hati dan tetap ada setelah muat ulang.
- **Lirik sinkron + romanisasi** — lirik LRC bergaya Apple Music, baris aktif membesar dan terang; aksara non-Latin otomatis diberi transliterasi lokal.
- **Unduhan di browser** — simpan lagu sebagai **FLAC lossless** atau audio sumber YouTube (`.webm`/`.m4a`) langsung dari web, tanpa server lokal dan tanpa `ffmpeg`.
- **Timer tidur** — hentikan pemutaran setelah 5, 10, 15, 30, 45, atau 60 menit, atau di akhir lagu; volume menurun perlahan sebelum jeda.

**Perpustakaan pribadi (opsional)**

- **Impor fleksibel** — pilih beberapa file, pilih satu folder, atau seret file ke jendela aplikasi.
- **Metadata otomatis** — judul, artis, album, genre, tahun, nomor trek, dan sampul tertanam dibaca dari tag ID3, Vorbis, MP4, atau RIFF INFO.
- **Tersimpan lokal** — file audio dan sampul disimpan di IndexedDB browser, jadi tetap ada setelah halaman ditutup dan tidak diunggah ke mana pun.
- **Pemutar lengkap** — putar, jeda, sebelumnya/berikutnya, geser posisi, volume, acak, ulangi semua/satu lagu, dan antrean.
- **Lanjut setelah muat ulang** — lagu, posisi, antrean, volume, acak, dan mode ulangi dipulihkan saat halaman dibuka lagi; pemutaran dimulai dalam keadaan jeda.
- **Riwayat pemutaran** — lagu yang diputar minimal 30 detik (atau selesai jika lebih pendek) masuk ke halaman **Riwayat**, terbaru di atas.
- **Impor ke playlist** — impor file langsung dari halaman playlist; lagu baru masuk ke perpustakaan dan playlist sekaligus.

**Antarmuka & lain-lain**

- **Gaya semi-Apple Music** — pemutar penuh, panel lirik, dan transisi halus, dengan identitas visual Vinyl.
- **Tema** — gelap AMOLED dan terang, dapat diganti dari sidebar atau halaman **Pengaturan**.
- **Playlist & favorit** — buat playlist, tambahkan lagu dari menu konteks, ganti nama, hapus, dan tandai lagu favorit.
- **Jelajahi koleksi** — Jelajahi, Radio, Terbaru, Artis, Album, Lagu, Suka, genre, pencarian, dan halaman detail.
- **Pengaturan terpusat** — halaman khusus dengan nav bertanda ikon + teks, berisi tampilan, pemutaran, audio, data, dan info penyimpanan dalam satu kolom.
- **Perpustakaan demo** — 12 lagu yang dibuat secara prosedural untuk mencoba semua fitur tanpa file pribadi.
- **Responsif** — sidebar berubah menjadi laci di tablet, dan tata letak ponsel tetap nyaman digunakan.
- **Pintasan keyboard** — kendalikan pemutaran dan pencarian tanpa meninggalkan keyboard.
- **Media Session** — kontrol pemutaran muncul di pusat media sistem saat browser mendukung.
- **Analitik web** — kunjungan halaman dan navigasi aplikasi dicatat melalui Vercel Web Analytics saat di-deploy ke Vercel.

## Menjalankan

### Langsung di browser (disarankan)

Buka **[vinyl.my.id](https://vinyl.my.id)**. Tidak ada yang perlu dipasang: pencarian, radio, streaming audio, dan unduhan berjalan lewat fungsi serverless di Vercel. Versi online sudah mencakup FLAC lossless, unduhan FLAC, lirik, radio otomatis, dan perpustakaan pribadi di penyimpanan browser.

### Jalankan lokal (opsional)

Versi lokal berguna untuk mengembangkan proyek atau memakai proxy audio sendiri. Butuh **Node.js** dan PowerShell di Windows. Unduhan tetap berjalan di browser; `ffmpeg` tidak diperlukan.

```powershell
cd "C:\path\ke\vinyl"
powershell -NoProfile -ExecutionPolicy Bypass -File .\server.ps1
```

Lalu buka **http://127.0.0.1:4173/**.

Tekan `Ctrl+C` di jendela PowerShell untuk menghentikan server.

### Aplikasi desktop Windows (opsional)

Vinyl juga bisa dipasang sebagai aplikasi Windows. Versi desktop membawa seluruh antarmuka dan server API lokal di dalam aplikasi, jadi perpustakaan, pengaturan, dan tampilan tetap berjalan tanpa internet; pencarian dan streaming audio tetap memerlukan koneksi.

```powershell
npm install
npm start        # menjalankan aplikasi tanpa installer
npm run dist     # membuat installer di dist\Vinyl-Setup-<versi>.exe
```

Aplikasi memakai server lokal di `http://127.0.0.1:41730` dengan port tetap, sehingga `localStorage` dan IndexedDB tetap awet antar-jalankan. Hanya satu jendela aplikasi yang bisa terbuka; tautan ke luar dibuka di browser default. Installer dibuat dengan electron-builder (NSIS, per pengguna) dan ikon diambil dari `assets/icons/icon-512.png` lewat `scripts/make-icon.ps1`.

### Vercel

Repo ini juga siap di-deploy ke **Vercel** tanpa build step:

1. Impor repo di Vercel dan biarkan **Framework Preset** di **Other**.
2. `api/*.js` otomatis menjadi serverless function (`vercel.json` sudah mengatur `maxDuration`).
3. Pencarian, beranda, dan radio langsung berjalan lewat fungsi serverless. Pemutaran audio YouTube memakai **instance Invidious** sebagai sumber audio: YouTube menolak permintaan audio dari IP datacenter Vercel, jadi `api/health` memeriksa instance yang tersedia dan browser memutar audionya langsung. Hasilnya tanpa iklan, durasi penuh, dan video yang melarang embed tetap bisa diputar. Jika instance sedang mati, aplikasi otomatis memakai pemutar resmi YouTube sebagai cadangan.
4. Aktifkan **Web Analytics** dari dashboard proyek Vercel, lalu deploy ulang. Script Analytics sudah terpasang dan navigasi aplikasi ikut dicatat; query pencarian dan ID detail tidak dikirim sebagai path.

> Di Vercel, unduhan memakai `api/download`: potongan 4 MB untuk FLAC dari katalog Tracks dan potongan 1 MB untuk audio YouTube (resolver InnerTube yang sama dengan streaming). Tidak ada `ffmpeg` yang dibutuhkan.

> **Penting:** di versi lokal, jalankan lewat server agar IndexedDB aktif dan koleksi tersimpan permanen. Membuka `index.html` langsung lewat `file://` masih bisa dipakai, tetapi browser dapat menonaktifkan penyimpanan sehingga koleksi hanya bertahan selama tab terbuka.

### Endpoint server lokal

`server.ps1` hanya mendengarkan di `127.0.0.1` dan menyediakan:

| Endpoint | Fungsi |
| --- | --- |
| `GET /api/health` | Status resolver `innertube`, `ffmpeg`, `mp3`, unduhan, serta `engine` audio (`proxy`, `invidious`, atau `iframe`). |
| `GET /api/search?q=KATA` | Hasil pencarian YouTube lewat InnerTube (dipakai halaman Pencarian dan Beranda). Tambahkan `cursor` + `page` dari respons sebelumnya untuk mengambil halaman berikutnya (`Muat lebih banyak`). |
| `GET /api/resolve?id=VIDEO_ID&quality=high` | URL audio langsung dari YouTube (di-cache per video + kualitas); `force=1` mengambil URL baru untuk percobaan ulang. Dipakai saat aplikasi berjalan lokal. |
| `GET /api/stream?id=VIDEO_ID&quality=high` | Menyajikan audio lewat byte-range agar player aplikasi bisa memutar dan seek; `force=1` mengambil URL baru saat mencoba ulang. Dipakai saat aplikasi berjalan lokal. |
| `GET /api/lossless?title=...&artist=...&duration=...` | Mencari versi FLAC di katalog **Tracks** (monochrome.st) dan mengembalikan URL audio + detail format (sample rate, kanal, bit depth, bitrate). `404` berarti lagu tidak tersedia dalam FLAC. |
| `GET /api/radio?id=VIDEO_ID` | Daftar lagu radio YouTube untuk lagu terkait. |
| `GET /api/download?video=ID_VIDEO&quality=best` + `Range` | Potongan audio YouTube (maksimal 1 MB per respons) untuk tombol unduhan di web. |
| `GET /api/download?track=ID_KATALOG` + `Range` | Potongan berkas FLAC dari katalog Tracks (maksimal 4 MB per respons). Dipakai tombol unduhan. |
| `GET /api/download?id=VIDEO_ID&quality=best&title=...` | Job MP3 lama (opsional, butuh `ffmpeg`); tidak dipakai lagi oleh antarmuka unduhan. |
| `GET /api/download-status?job=JOB_ID` | Status job: `running`, `done`, atau `error`. |
| `GET /api/download-file?job=JOB_ID` | Mengirim file hasil unduhan sebagai lampiran. |

Saat di-deploy ke **Vercel**, endpoint yang sama dilayani fungsi Node di folder `api/` (tanpa server yang perlu menyala). Pencarian dan radio memakai InnerTube di fungsi serverless; audio YouTube diputar dari instance Invidious lewat browser. Pencarian FLAC memakai endpoint `/api/lossless` di serverless, lalu audio lossless diputar langsung dari katalog Tracks (mendukung Range, tanpa proxy). Untuk unduhan, `/api/download` menyelesaikan audio YouTube lewat InnerTube (klien visionOS) lalu meneruskannya dalam potongan 1 MB, atau meneruskan berkas FLAC katalog dalam potongan 4 MB; potongan itu dirangkai browser menjadi file utuh.

## Beranda streaming

Halaman **Dengarkan Sekarang** adalah etalase utama Vinyl. Saat dibuka, aplikasi mencari saran lagu dari internet lalu menampilkan:

- **Ubin cepat** — Rekomendasi harian, Lagu galau, Akustik santai, Nostalgia 80–90an, Dangdut koplo, dan Pop internasional. Klik satu ubin untuk langsung memutar hasilnya.
- **Rekomendasi untukmu** — delapan lagu pilihan; tombol putar muncul saat kartu diarahkan kursor.
- **Stasiun untukmu** — radio yang dimulai dari sebuah lagu dan berjalan otomatis.
- **Lagu populer hari ini** — daftar lagu yang bisa diputar satu per satu atau sekaligus.
- **Bagian perpustakaan** — album baru, lagu yang terakhir diputar, mix genre, dan lagu Suka tetap tampil di bawahnya bila kamu sudah mengimpor musik.

Rekomendasi memakai pencarian YouTube yang sama dengan halaman **Pencarian**, jadi tidak perlu API key. Hasilnya disimpan sementara di tab (30 menit) supaya beranda tidak mencari ulang setiap kali dibuka. Tombol **Putar rekomendasi** dan **Acak** memutar seluruh daftar; setelah lagu terakhir, radio otomatis menambahkan lagu serupa seperti autoplay YouTube Music/Spotify.

## Mengimpor musik (opsional)

Impor hanya diperlukan kalau kamu ingin memutar file milikmu sendiri. Untuk streaming, lewati bagian ini — buka **Pencarian** atau langsung putar dari beranda.

1. Klik **Impor musik** di sidebar atau tombol **Impor** di kanan atas.
2. Pilih **Pilih file**, **Pilih folder**, atau seret file ke jendela aplikasi.
3. Tunggu proses selesai. Ringkasan akan menampilkan jumlah lagu yang ditambahkan, dilewati, atau gagal.

Catatan:

- File dengan isi dan nama yang sama akan dilewati otomatis agar tidak duplikat.
- Dari halaman playlist, tombol **Impor file** menambahkan lagu baru ke perpustakaan **dan** playlist dalam satu langkah. Lagu yang sudah ada di perpustakaan tidak diduplikasi, tetapi tetap dimasukkan ke playlist.
- Dukungan kodek ditentukan oleh browser. Edge/Chrome umumnya mendukung MP3, AAC/M4A, FLAC, WAV, dan Opus/OGG; Safari memiliki dukungan kodek yang berbeda.
- Sampul album diambil dari artwork yang tertanam di file. Jika tidak ada, aplikasi membuat sampul bergradasi secara otomatis.
- Format file yang tidak didukung akan dilewati dan dilaporkan di ringkasan impor.
- File asli tidak diubah atau dipindahkan.

## Pencarian

Kotak pencarian — tombol **Cari** di sidebar, ikon cari di bilah atas, atau pintasan `/` — langsung mencari di perpustakaan **dan** YouTube dalam satu halaman.

- Hasil perpustakaan muncul di bagian **Di perpustakaanmu**.
- Setelah berhenti mengetik ±0,4 detik (minimal 2 huruf), aplikasi otomatis mencari di YouTube dan menampilkan bagian **Dari YouTube**. Lagu di sana bisa langsung diputar, disukai lewat ikon hati, dibuka menunya (`⋯`), atau diunduh.
- Tekan **Enter** untuk memutar hasil teratas. Jika perpustakaan tidak punya lagu yang cocok, Enter memutar hasil YouTube.
- Kalau yang kamu cari adalah **judul lagu** lalu memutar salah satu hasilnya, antrean dimulai dari lagu itu dan langsung diisi radio YouTube — bukan daftar unggahan lain yang judulnya sama. Kalau yang kamu cari adalah **nama artis**, hasil pencarian tetap menjadi antrean seperti biasa.
- Hasil YouTube tampil langsung di halaman ini — semua hasil yang sudah dimuat ikut ditampilkan, bukan hanya 10 teratas.
- Tombol **Muat lebih banyak** mengambil halaman berikutnya dari YouTube (InnerTube continuation), jadi hasil pencarian tidak dibatasi 20–30 lagu dan bisa terus ditambah selama masih tersedia.
- Kalau pencarian YouTube gagal, muncul tombol **Coba lagi**; hasil perpustakaan tetap tampil seperti biasa.
- Antrean dari hasil pencarian ini diberi label **Cari · YouTube** di panel antrean.

## Musik dari YouTube

Tidak perlu API key, akun, atau impor file. Cukup buka **Pencarian** dan ketik kata kunci, atau tempel tautan video.

| Sumber | Yang tersedia | Catatan |
| --- | --- | --- |
| **YouTube** | Streaming audio dari video YouTube | Cari dengan kata kunci, atau tempel tautan video (watch, youtu.be, Shorts, atau YouTube Music). Audio diputar sebagai audio murni — tanpa tampilan video dan tanpa iklan. Di Vercel sumbernya instance Invidious; saat lokal, audio diproksikan oleh server. |

### Cara memakai YouTube

1. Buka **[vinyl.my.id](https://vinyl.my.id)** — tidak perlu memasang apa pun. Untuk pengembangan atau proxy audio sendiri, jalankan versi lokal lewat `server.ps1` (butuh Node.js).
2. Buka **Pencarian**, lalu ketik judul lagu atau nama artis — atau tempel tautan video langsung. Bagian **Dari YouTube** muncul otomatis di bawah hasil perpustakaan.
3. Hasil pencarian bisa diputar lewat **Putar semua** atau **Acak**; satu video dari tautan langsung diputar sendiri.
4. Kendalikan dari bar pemutar aplikasi seperti biasa — putar/jeda, geser posisi, volume, antrean, acak, dan ulangi tetap berfungsi. Lagu YouTube tampil seperti lagu lain karena yang diputar hanya audionya.
5. Saat sisa antrean tinggal ±5 lagu (dan ulangi = mati), aplikasi otomatis mengambil rekomendasi baru berdasarkan lagu yang sedang diputar lalu mengisi antrean sampai ±20 lagu. Sumbernya playlist Mix/Radio YouTube (`list=RD…`) yang diambil lewat API InnerTube, bukan pencarian judul — jadi lagu berikutnya berbeda judul tetapi mirip vibe, genre, era, dan bahasanya. Lagu yang ditambahkan manual tetap di atas rekomendasi otomatis.

Catatan:

- Pencarian memakai **InnerTube**, API internal YouTube yang juga dipakai situs YouTube, lewat `/api/search` (hasil disimpan sementara 5 menit). Tidak perlu API key resmi. Halaman berikutnya diambil lewat token continuation, jadi daftar hasil bisa ditambah tanpa batas selama YouTube masih menyediakannya. Jika pencarian gagal, coba lagi beberapa saat atau tempel tautan video langsung.
- Video yang tidak mengizinkan pemutaran di luar YouTube tetap bisa diputar, karena audio diambil langsung (bukan lewat pemutar embed). Jika satu format gagal, aplikasi mencoba format lain, lalu pemutar resmi YouTube untuk lagu itu, lalu hasil alternatif untuk lagu yang sama.
- Di Vercel, YouTube memblokir pengambilan audio dari IP datacenter. Karena itu aplikasi memakai **instance Invidious** sebagai sumber audio: server hanya memeriksa instance mana yang hidup lewat `/api/health`, lalu browser memutar audionya langsung. Di localhost resolver server tetap dipakai. Keduanya bebas iklan.
- Radio otomatis butuh `InnerTube resolver` dan koneksi internet; hasilnya disimpan sementara agar tidak berulang kali mengambil daftar yang sama. Kandidat disaring: judul sama/mirip dengan lagu acuan dibuang, duplikat unggahan dirapikan, durasi wajib 1–10 menit, maksimal 2 lagu per artis dalam 10 lagu, dan artis yang sama tidak muncul dua kali berturut-turut. Cover, karaoke, dan remix dilewati kecuali lagu acuannya memang cover/remix.
- Tautan playlist bisa ditempel, tetapi hanya video utamanya yang diputar.

### Suka lagu YouTube

- Tekan ikon hati di bar pemutar atau di baris lagu untuk menyukai lagu YouTube. Hati yang menyala menandakan lagu tersimpan.
- Lagu YouTube yang disukai disimpan di `localStorage` (kunci `musik.online.likes.v1`) dan **tetap ada setelah halaman dimuat ulang**.
- Halaman **Suka** memisahkan dua bagian: **Dari perpustakaan** (favorit file lokal) dan **Dari YouTube** (lagu yang disukai dari internet). Tombol **Putar** dan **Acak** memutar keduanya dalam satu antrean.
- Menghapus hati pada lagu YouTube akan menghapusnya dari halaman **Suka**. Ini tidak memengaruhi file lokal atau playlist.

### Unduhan

- Tekan tombol unduh di bar pemutar saat lagu YouTube diputar, atau pilih **Unduh audio** dari menu `⋯` pada baris lagu online.
- **Pengaturan → Audio → Kualitas unduhan** menentukan hasilnya: **FLAC** (lossless dari katalog Tracks), **Hemat/Standar/Tinggi**, atau **Terbaik** (audio sumber YouTube).
- Berkas diambil lewat `/api/download` dalam potongan 4 MB (FLAC) atau 1 MB (audio YouTube), dirangkai browser, lalu disimpan langsung ke folder Unduhan. Tidak perlu `ffmpeg`, folder `downloads/`, atau server lokal.
- FLAC diunduh sebagai `.flac`; bila lagunya tidak ada di katalog, Vinyl otomatis mengunduh audio terbaik YouTube dan memberi tahu lewat notifikasi.
- Audio YouTube disimpan sebagai `.webm` (OPUS) atau `.m4a` (AAC) sesuai format sumber, dengan nama `Artis - Judul`.
- Ukuran FLAC jauh lebih besar daripada audio YouTube (sekitar 20–40 MB per lagu). Di versi lokal, unduhan memakai proxy audio `server.ps1`; di web, proxy Vercel.

### Format streaming

- **Pengaturan → Audio → Format streaming** memilih format audio yang diambil resolver: **Hemat** (OPUS 70 kbps), **Standar** (OPUS 160 kbps), **Tinggi** (AAC/OPUS hingga 256 kbps sesuai sumber), atau **FLAC**.
- **FLAC** mencari versi lossless di katalog **Tracks** (`tracks.monochrome.st`, API yang dipakai Monochrome Music) lewat `/api/lossless`. Jika lagunya tersedia, audio FLAC diputar langsung dari katalog; sample rate, kanal, bit depth, dan bitrate dibaca dari header FLAC. Jika tidak tersedia (atau katalog sedang mati), aplikasi otomatis kembali ke audio YouTube terbaik dan chip menampilkan `FLAC → OPUS` sebagai penanda fallback.
- Pencarian FLAC mencocokkan judul, artis, dan durasi (toleransi ±15 detik untuk intro/outro video musik), serta menolak versi live/acoustic/remix/karaoke/cover bila lagu aslinya bukan versi itu. Judul mentah video ikut dibaca supaya versi di dalam tanda kurung tidak lolos. Bila tidak yakin, aplikasi memilih fallback ke YouTube daripada memutar lagu yang salah. Instance katalog bisa diganti lewat env `LOSSLESS_API` saat deploy Vercel.
- Pemutar selalu menampilkan chip format yang benar-benar mengalir, mis. `OPUS · 48 kHz` atau `FLAC · 44,1 kHz`. Untuk berkas lokal, sample rate, kanal, dan bit depth dibaca langsung dari header FLAC/WAV/AIFF/MP3/OGG sehingga angkanya akurat.
- **Klik chip format** di pil pemutar atau Now Playing untuk membuka panel **Stats for nerds**: codec, wadah/MIME, bitrate, sample rate, kanal, bit depth, itag, mode yang diminta, mesin pemutaran, status, buffer, volume, dan catatan fallback. Data perangkat keluaran/resampling ditandai sebagai dikelola browser/OS karena tidak dapat dibaca aplikasi.
- Aktifkan **Stats for nerds** di Pengaturan untuk menambahkan satu baris detail kecil di bawah judul Now Playing (bitrate, sample rate, kanal, bit depth, itag).
- Jika format diubah saat lagu YouTube sedang diputar, aplikasi membersihkan cache audio dan memuat ulang lagu pada posisi yang sama.

Umum:

- Lagu online tidak masuk ke perpustakaan lokal atau playlist. Yang bertahan setelah muat ulang adalah **antrean lokal** dan **daftar Suka dari YouTube**.
- Pemutaran online memerlukan koneksi internet. Jika penyedia sedang tidak dapat diakses, coba beberapa saat lagi.

### Kenapa bukan YouTube Data API atau Spotify?

Pemutaran YouTube memakai mesin yang dipilih otomatis lewat `/api/health`:

- **Lokal (`proxy`)** — klien InnerTube di `server.ps1` mengambil audio, lalu dikirim per byte-range ke elemen `<audio>` aplikasi.
- **Vercel (`invidious`)** — browser memutar audio dari instance Invidious terdekat yang hidup. YouTube menolak permintaan audio dari IP datacenter, jadi sumbernya bukan server Vercel. Tanpa iklan dan tanpa batas embed.
- **Cadangan (`iframe`)** — pemutar resmi YouTube di browser, dipakai hanya bila instance tidak tersedia atau satu lagu gagal di semua format.

Pencarian dan radio selalu memakai **InnerTube**, bukan YouTube Data API.

Pemutaran Spotify penuh juga memerlukan akun **Spotify Premium**, OAuth, dan Spotify Web Playback SDK — arsitektur yang berbeda dari pemutar `<audio>` ini.

## Riwayat pemutaran

- Lagu dicatat setelah diputar **minimal 30 detik**, atau saat selesai jika durasinya lebih pendek dari 30 detik.
- Halaman **Riwayat** menampilkan lagu terbaru di atas dan diperbarui langsung saat kamu memutar lagu.
- Memutar ulang lagu yang sudah ada akan memindahkannya ke atas, bukan membuat entri duplikat.
- Riwayat disimpan permanen di IndexedDB (maksimal 500 entri) dan mencakup lagu lokal maupun YouTube.
- Tombol **Hapus riwayat** membersihkan daftar tanpa menyentuh perpustakaan atau file asli.

## Timer tidur

- Buka dari tombol bulan di bar pemutar atau **Pengaturan → Pemutaran → Timer tidur**.
- Pilihan: **5, 10, 15, 30, 45, atau 60 menit**, atau **Akhir lagu**.
- Hitung mundur tampil di tombol pemutar dan di halaman Pengaturan.
- Saat waktu habis, volume menurun perlahan selama ±5 detik lalu pemutaran dijeda; volume awal dipulihkan otomatis.
- Pilih **Batalkan timer** untuk menghentikan hitung mundur kapan saja.

## Lirik & romanisasi

- Lirik dibaca dari tag audio: ID3 `USLT`/`SYLT`/`TXXX`, Vorbis `LYRICS`/`UNSYNCEDLYRICS`, dan MP4 `©lyr`.
- Buka layar lirik lewat tombol lirik di bar pemutar, bilah atas, atau tampilan pemutar penuh. Latarnya memakai sampul lagu yang diburamkan.
- Lirik berformat **LRC** (`[mm:ss.xx]`) disinkronkan dengan pemutaran: baris aktif membesar dan terang, baris di sekitarnya memudar dan sedikit kabur. Panel menggulir halus dan menahan baris aktif di sekitar 42% tinggi layar. Ketuk baris untuk melompat ke waktunya.
- Menggulir sendiri akan menghentikan gulir otomatis sementara; setelah ±4 detik panel kembali mengikuti baris aktif.
- Lirik tanpa timestamp tampil sebagai teks biasa. Jika lagu tidak punya lirik, layar menampilkan **“Lirik tidak tersedia”** tanpa error.
- Baris dengan aksara non-Latin otomatis mendapat **transliterasi** di bawahnya: Han (pinyin), Hangul, kana/kanji Jepang, Arab/Persia, Kiril, dan Thai. Baris Latin tidak diberi transliterasi.
- Semua romanisasi diproses **lokal di browser** — tidak ada panggilan API atau layanan berbayar.

## Penyimpanan & privasi

- Lagu yang di-streaming **tidak disimpan**; audio mengalir langsung dari penyedia ke browser. Yang tersimpan hanya antrean, riwayat, pengaturan, dan daftar Suka.
- Perpustakaan pribadi (jika kamu mengimpor) disimpan di **IndexedDB** milik browser, bukan di server.
- Kapasitas bergantung pada kuota browser (biasanya beberapa GB). Pengaturan menampilkan perkiraan pemakaian.
- Semua file lokal tetap di perangkat ini dan tidak pernah diunggah ke internet.
- Saat memakai pencarian YouTube, kata kunci pencarian atau tautan yang kamu tempel dan metadata video dikirim ke YouTube (via InnerTube dan oEmbed). Di Vercel, audio diputar dari instance Invidious sehingga instance itu dan YouTube menerima koneksi langsung dari perangkatmu. Tidak ada data perpustakaan lokal yang ikut dikirim.
- **Unduhan** diambil lewat `/api/download` (potongan 4 MB untuk FLAC, 1 MB untuk audio YouTube) agar berkas bisa dirangkai dan disimpan browser; fungsi itu tidak menyimpan salinan audio setelah respons selesai.
- **Daftar Suka dari YouTube** disimpan di `localStorage` browser. **File hasil unduhan** disimpan oleh browser ke folder Unduhan perangkatmu dan tidak diunggah ke mana pun.
- **Pengaturan → Hapus semua data** menghapus lagu, sampul, playlist, dan favorit lokal dari aplikasi. File asli di folder musikmu dan file hasil unduhan di folder Unduhan tidak terhapus.
- Menghapus data situs di browser juga akan menghapus koleksi Vinyl, antrean, pengaturan, dan daftar Suka dari YouTube.

## Pintasan keyboard

| Tombol | Fungsi |
| --- | --- |
| `Space` | Putar / jeda |
| `←` / `→` | Geser 5 detik |
| `M` | Bisukan / bunyikan |
| `S` | Acak aktif/mati |
| `R` | Ganti mode ulangi |
| `L` | Sukai / batal sukai lagu yang diputar |
| `Q` | Buka / tutup antrean |
| `/` atau `Shift` + `/` | Buka pencarian |
| `Ctrl` + `K` / `⌘` + `K` | Buka pencarian |
| `Esc` | Tutup modal, menu, antrean, layar lirik, atau sidebar |

Pintasan selain `Esc` tidak aktif saat kamu sedang mengetik di kolom input.

## Struktur proyek

```text
.
├── index.html
├── package.json
├── server.ps1          # server lokal opsional (proxy audio + FLAC)
├── README.md
├── vercel.json         # konfigurasi deploy serverless
├── api/                # fungsi serverless Vercel (Node)
│   ├── _innertube.js   # klien InnerTube untuk pencarian
│   ├── search.js       # GET /api/search
│   ├── _lib.js         # resolver audio InnerTube dan helper radio
│   ├── _invidious.js   # pemilih instance Invidious untuk pemutaran
│   ├── _lossless.js    # pencarian + pembacaan header FLAC (Tracks)
│   ├── lossless.js     # GET /api/lossless
│   ├── resolve.js      # GET /api/resolve
│   ├── stream.js       # GET /api/stream
│   ├── download.js     # GET /api/download (potongan audio/FLAC)
│   ├── radio.js        # GET /api/radio
│   └── health.js       # GET /api/health (pilih mesin audio)
├── scripts/            # CLI bantu untuk mencoba InnerTube dan katalog FLAC
├── assets/             # logo dan font
├── css/
│   ├── base.css        # variabel warna, tipografi, tombol, form
│   ├── layout.css      # kerangka aplikasi, topbar, area konten
│   ├── sidebar.css     # sidebar dan laci navigasi
│   ├── content.css     # hero, kartu, daftar lagu, pencarian
│   ├── player.css      # pemutar bawah, antrean, timer tidur, layar lirik
│   ├── overlays.css    # modal, menu konteks, toast, pengaturan
│   └── responsive.css  # tablet, ponsel, dan perangkat sentuh
└── js/
    ├── utils.js        # helper, format, sampul prosedural
    ├── vendor/
    │   └── pinyin-pro.js  # pustaka pinyin lokal (MIT)
    ├── romanize.js     # deteksi aksara + romanisasi lirik lokal
    ├── db.js           # pembungkus IndexedDB (termasuk riwayat)
    ├── metadata.js     # pembaca tag audio dan lirik tertanam
    ├── demo.js         # generator perpustakaan demo
    ├── online.js       # sumber musik online (YouTube), cache & daftar Suka
    ├── youtube.js      # pencarian InnerTube + URL audio (proxy/Invidious/IFrame)
    ├── lossless.js     # pencarian FLAC (Tracks) saat format streaming = FLAC
    ├── lyrics.js       # pencarian lirik LRCLIB saat lirik tidak tertanam
    ├── downloads.js    # unduhan browser: FLAC lossless + audio YouTube
    ├── home.js         # feed streaming untuk beranda
    ├── library.js      # state perpustakaan, impor, playlist, riwayat
    ├── media.js        # jembatan <audio> + pemutar YouTube IFrame
    ├── player.js       # antrean, pemutaran, snapshot, timer tidur
    ├── ui.js           # modal, menu, toast, prompt
    ├── views.js        # renderer setiap halaman
    └── app.js          # router, event, impor, pengaturan, lirik
```

## Tips

- Gunakan **Jelajahi** untuk melihat genre dan album, atau **Radio** untuk memutar stasiun acak dari genre tertentu.
- Klik ikon putar di kolom nomor, atau klik judul lagu, untuk mulai memutar.
- Buka album lewat nama album di baris lagu atau melalui menu konteks.
- Klik kanan (atau tombol `⋯`) pada baris lagu untuk membuka aksi cepat.
- Tekan `Ctrl` + `K` dari halaman mana pun untuk langsung mencari.
- Ketik langsung di kotak pencarian untuk mencari di perpustakaan sekaligus YouTube — semuanya di satu halaman **Pencarian**.
- Untuk koleksi besar, impor per folder agar mudah dilacak. Proses durasi berjalan otomatis di latar belakang.
- Di **Pencarian**, gunakan kata kunci singkat (judul/artis) atau tempel tautan video agar hasil lebih relevan.
- Lagu online bisa diputar bersamaan dengan lagu lokal dalam satu antrean.
- Buka panel lirik saat lagu diputar; jika liriknya LRC, baris aktif akan mengikuti posisi lagu.
- Gunakan timer tidur sebelum tidur agar pemutaran berhenti sendiri tanpa perlu membuka aplikasi.

## Kompatibilitas

Vinyl berjalan di browser modern — Chrome, Edge, Safari, dan Firefox — yang mendukung elemen `<audio>`, IndexedDB, File API, dan Blob. Versi online tidak memerlukan pemasangan apa pun, hanya koneksi internet. Unduhan FLAC maupun audio YouTube berjalan langsung di browser tanpa `ffmpeg`. Versi lokal (opsional) berjalan di Windows dengan PowerShell dan Node.js. Tampilan memakai font Inter yang dibundel lokal dengan cadangan font sistem.

## Terima kasih & kredit

Vinyl tidak akan berjalan tanpa proyek open source, layanan publik, dan orang-orang yang membagikan karyanya. Terima kasih banyak kepada:

**Pustaka & kode**

| Proyek | Pembuat | Lisensi | Dipakai untuk |
| --- | --- | --- | --- |
| [pinyin-pro](https://github.com/zh-lx/pinyin-pro) | [zh-lx](https://github.com/zh-lx) | MIT | Romanisasi Han (Mandarin) pada lirik, dibundel di `js/vendor/pinyin-pro.js` |
| [Inter](https://github.com/rsms/inter) | [Rasmus Andersson / The Inter Project Authors](https://github.com/rsms/inter) | SIL OFL 1.1 | Font antarmuka di `assets/fonts` |
| [LRCLIB](https://github.com/tranxuanthang/lrclib) | [tranxuanthang](https://github.com/tranxuanthang) | MIT | Pencarian lirik sinkron lewat `lrclib.net` |
| [Monochrome](https://github.com/monochrome-music/monochrome) | [monochrome-music](https://github.com/monochrome-music) | Apache-2.0 | Katalog dan streaming FLAC `tracks.monochrome.st` |
| [Invidious](https://github.com/iv-org/invidious) | [iv-org](https://github.com/iv-org) dan para operator instance | AGPL-3.0 | Sumber audio streaming YouTube di versi web |
| [@vercel/analytics](https://github.com/vercel/analytics) | [Vercel](https://github.com/vercel) | MIT | Analitik halaman yang ramah privasi |
| [tombulled/innertube](https://github.com/tombulled/innertube) | [tombulled](https://github.com/tombulled) | MIT | Referensi klien InnerTube untuk pencarian dan audio YouTube |

**Layanan & API**

- **YouTube / YouTube Music** — pencarian, metadata, thumbnail (oEmbed dan `i.ytimg.com`), serta audio lewat InnerTube. Video, audio, dan metadata tetap milik pemiliknya.
- **Tracks (`tracks.monochrome.st`)** — katalog dan streaming FLAC.
- **LRCLIB (`lrclib.net`)** — lirik sinkron.
- **Invidious (`yt.chocolatemoo53.com`)** — instance publik yang memutar audio YouTube di versi web. Terima kasih kepada operatornya yang menjaga server dan bandwidth tetap hidup.
- **Vercel** — hosting statis dan fungsi serverless di folder `api/`, termasuk Web Analytics.

**Ucapan terima kasih**

- Untuk semua maintainer dan kontributor proyek di atas yang bekerja tanpa bayaran.
- Untuk operator instance Invidious publik yang menyediakan server dan bandwidth.
- Untuk komunitas musik open source dan para kontributor LRCLIB yang mengumpulkan lirik.
- Untuk siapa pun yang melaporkan bug, memberi masukan, atau memakai Vinyl.

Vinyl dibuat dan dirawat oleh [Zaki Misucha Andefi](https://github.com/ZakiMisuchaAndefi).

> Vinyl tidak berafiliasi dengan YouTube, Apple Music, Monochrome, Invidious, LRCLIB, atau Vercel. Nama dan merek dagang milik pemiliknya masing-masing. Jika kamu merasa karyamu dipakai tanpa kredit yang layak, buka issue di repo ini.

## Lisensi

Vinyl adalah proyek pribadi yang dibagikan apa adanya. Lagu demo dihasilkan secara prosedural oleh aplikasi dan bukan rekaman berhak cipta. Audio yang diputar dari YouTube dan katalog FLAC tetap milik pencipta dan pemegang haknya; aplikasi hanya menautkan ke aliran resmi dari penyedia tersebut.

