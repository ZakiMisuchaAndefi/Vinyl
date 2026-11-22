/* ==========================================================================
   electron/preload.js — jembatan aman antara halaman dan proses utama.

   Halaman web tidak mendapat akses Node. Hanya beberapa fungsi pembaruan
   aplikasi yang dibuka lewat contextBridge, dan semuanya menuju IPC yang
   ditangani electron/main.js.
   ========================================================================== */

"use strict";

const { contextBridge, ipcRenderer } = require("electron");

// Info versi diambil sinkron saat preload dimuat agar halaman bisa langsung
// menampilkan "Vinyl 1.0" tanpa menunggu permintaan jaringan.
let info = { version: "", platform: "" };
try {
  info = ipcRenderer.sendSync("vinyl:info") || info;
} catch (error) {
  /* biarkan kosong; halaman tetap berjalan */
}

contextBridge.exposeInMainWorld("vinylDesktop", {
  isDesktop: true,
  version: String(info.version || ""),
  platform: String(info.platform || ""),

  checkForUpdates: function () {
    return ipcRenderer.invoke("vinyl:update-check");
  },
  downloadUpdate: function () {
    return ipcRenderer.invoke("vinyl:update-download");
  },
  installUpdate: function () {
    return ipcRenderer.invoke("vinyl:update-install");
  },

  // Mengembalikan fungsi untuk berhenti mendengarkan, berguna bila halaman
  // dimuat ulang tanpa memulai proses baru.
  onUpdateEvent: function (callback) {
    if (typeof callback !== "function") return function () {};
    const listener = function (event, payload) {
      callback(payload);
    };
    ipcRenderer.on("vinyl:update-event", listener);
    return function () {
      ipcRenderer.removeListener("vinyl:update-event", listener);
    };
  }
});
