/* ==========================================================================
   scripts/after-pack-mac.js — tanda tangan ad-hoc untuk build macOS tanpa
   sertifikat Apple.

   electron-builder melewati penandatanganan bila tidak ada sertifikat.
   Pada Apple Silicon, aplikasi Electron yang isinya berubah tanpa ditandatangani
   ulang bisa dianggap rusak oleh Gatekeeper. Tanda tangan ad-hoc ("-") membuat
   bundel tetap konsisten, meski pengguna masih perlu menghapus atribut
   karantina karena build ini belum dinotarisasi.

   Bila sertifikat asli tersedia (CSC_LINK/CSC_KEYCHAIN), hook ini tidak
   melakukan apa pun; electron-builder menandatangani dengan sertifikat itu
   setelah tahap ini.
   ========================================================================== */

"use strict";

const path = require("path");

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;
  if (process.env.CSC_LINK || process.env.CSC_KEYCHAIN) return;

  // Pada build universal, electron-builder memaketkan tiap arsitektur ke
  // folder sementara (*-temp) lalu menggabungkannya dengan @electron/universal.
  // Menandatangani app sementara membuat berkas _CodeSignature/CodeResources
  // berbeda antar-arsitektur sehingga penggabungan gagal. Lewati folder
  // sementara; app universal hasil gabungan tetap ditandatangani di bawah.
  if (/-temp[\\/]?$/.test(context.appOutDir)) return;

  const appName = context.packager.appInfo.productFilename + ".app";
  const appPath = path.join(context.appOutDir, appName);

  try {
    const { signAsync } = require("@electron/osx-sign");
    await signAsync({
      app: appPath,
      identity: "-",
      identityValidation: false,
      platform: "darwin"
    });
    console.log("[vinyl] tanda tangan ad-hoc selesai: " + appPath);
  } catch (error) {
    // Jangan gagalkan build: tanpa tanda tangan pun DMG tetap bisa dibuat.
    console.warn(
      "[vinyl] tanda tangan ad-hoc dilewati: " +
        (error && error.message ? error.message : String(error))
    );
  }
};
