# Mau Ikut Bantu Vinyl? (●'◡'●)

Terima kasih sudah mampir! Vinyl dibuat ringan pakai HTML, CSS, dan JavaScript murni — tanpa framework atau bundler ribet.

## Jalanin di Lokal

- **Web (PowerShell + Node.js):**
  ```powershell
  powershell -NoProfile -ExecutionPolicy Bypass -File .\server.ps1
  # lalu buka http://127.0.0.1:4173/
  ```
- **Desktop (Electron):**
  ```powershell
  npm install
  npm start
  ```

## Lapor Bug atau Usul Fitur

Buka tab **Issues** di GitHub dan pilih template yang sesuai (Laporan Bug atau Usulan Fitur). Sertakan platform yang dipakai (Web, Windows, atau macOS) dan langkah reproduksinya biar gampang dicek.

## Mengajukan Pull Request

1. Fork repo ini lalu buat branch baru dari `main`.
2. Jaga kode tetap vanilla JS/CSS/HTML dan hindari menambah dependensi berat tanpa alasan kuat.
3. Tes dulu di lokal (dan pastikan `node --check` pada file `.js` yang diubah aman).
4. Pakai gaya pesan commit yang rapi seperti repo ini:
   - `feat:` fitur baru
   - `fix:` perbaikan bug
   - `docs:` dokumentasi / README
   - `chore:` konfigurasi, build, atau perapian ringan

## Lisensi Kontribusi

Dengan mengirimkan Pull Request atau kontribusi ke repo ini, kamu setuju bahwa kontribusimu dilisensikan di bawah **GNU General Public License v3.0 or later (`GPL-3.0-or-later`)** sesuai [LICENSE](LICENSE).
