/* ==========================================================================
   electron/main.js — entry aplikasi desktop Vinyl.

   Alur kerjanya:
   1. Nyalakan server lokal (electron/server.js) di port tetap 41730.
   2. Buka jendela Chromium yang menampilkan http://127.0.0.1:41730/.

   Port sengaja tetap supaya origin tidak berubah antar-jalankan aplikasi;
   localStorage, IndexedDB (pengaturan, riwayat, unduhan) tetap awet.
   ========================================================================== */

"use strict";

const path = require("path");
const { app, BrowserWindow, Menu, shell, dialog, session, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const { startServer } = require("./server");

const PORT = 41730;
const APP_URL = "http://127.0.0.1:" + PORT + "/";
const APP_ORIGIN = "http://127.0.0.1:" + PORT;
// Sama dengan appId di package.json: menyatukan ikon taskbar dan pintasan.
const APP_ID = "id.vinyl.desktop";

app.setAppUserModelId(APP_ID);

let mainWindow = null;
let localServer = null;
let quitting = false;
let updateReady = false;

// Versi dibaca preload secara sinkron saat halaman mulai dimuat.
ipcMain.on("vinyl:info", function (event) {
  event.returnValue = { version: app.getVersion(), platform: process.platform };
});

// Hanya satu jendela aplikasi. Membuka EXE lagi akan memfokuskan jendela lama.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", function () {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });
}

/* --------------------------------------------------------------------------
   Jendela
   -------------------------------------------------------------------------- */

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 960,
    minHeight: 640,
    title: "Vinyl",
    backgroundColor: "#0b0b0d",
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "..", "build", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      backgroundThrottling: false
    }
  });

  // Menu bawaan Electron (File/Edit/View) tidak diperlukan.
  Menu.setApplicationMenu(null);

  mainWindow.once("ready-to-show", function () {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.show();
  });

  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  // Tautan ke luar aplikasi (mis. sumber lagu) dibuka di browser default.
  mainWindow.webContents.setWindowOpenHandler(function (details) {
    openExternal(details.url);
    return { action: "deny" };
  });

  // Navigasi di dalam jendela hanya boleh ke origin server lokal.
  mainWindow.webContents.on("will-navigate", function (event, url) {
    if (url.startsWith(APP_ORIGIN + "/") || url === APP_ORIGIN) return;
    event.preventDefault();
    openExternal(url);
  });

  // File yang diunduh lewat API tetap memakai dialog normal Windows.
  mainWindow.webContents.session.on("will-download", function (event, item) {
    item.once("done", function (doneEvent, state) {
      if (state !== "completed") return;
      // Beri tahu pengguna tanpa mengganggu pemutaran.
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.flashFrame(true);
      }
    });
  });

  mainWindow.loadURL(APP_URL);

  mainWindow.webContents.on("did-fail-load", function (event, code, description, url) {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (code === -3) return; // navigasi dibatalkan, bukan error
    dialog.showMessageBox(mainWindow, {
      type: "error",
      title: "Vinyl",
      message: "Halaman gagal dimuat.",
      detail: description + "\n" + url
    });
  });

  // Ctrl+/Ctrl- tetap berfungsi lewat menu aplikasi yang minimal.
  mainWindow.webContents.on("before-input-event", function (event, input) {
    if (input.type !== "keyDown") return;
    const ctrl = input.control || input.meta;
    if (!ctrl) return;
    if (input.key === "=" || input.key === "+") {
      setZoom(mainWindow.webContents.getZoomLevel() + 0.5);
      event.preventDefault();
    } else if (input.key === "-") {
      setZoom(mainWindow.webContents.getZoomLevel() - 0.5);
      event.preventDefault();
    } else if (input.key === "0") {
      setZoom(0);
      event.preventDefault();
    } else if (input.key.toLowerCase() === "r" && !input.shift) {
      mainWindow.webContents.reload();
      event.preventDefault();
    }
  });
}

function setZoom(level) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const clamped = Math.max(-3, Math.min(5, level));
  mainWindow.webContents.setZoomLevel(clamped);
}

function openExternal(url) {
  if (!/^https?:/i.test(String(url || ""))) return;
  shell.openExternal(url).catch(function () {
    /* tidak ada aksi: tautan gagal dibuka bukan error fatal */
  });
}

/* --------------------------------------------------------------------------
   Pembaruan aplikasi

   Pembaruan diambil dari GitHub Releases (lihat "publish" di package.json).
   Alurnya sengaja bertahap: periksa -> unduh -> pasang, agar pengguna tidak
   kehilangan pemutaran yang sedang berjalan tanpa persetujuan.
   -------------------------------------------------------------------------- */

function sendUpdateEvent(payload) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("vinyl:update-event", payload);
}

function updateErrorMessage(error) {
  const text = String((error && error.message) || error || "");
  if (/404|latest\.ya?ml|not found|cannot find|no published|no releases?|latest version/i.test(text)) {
    return "Belum ada pembaruan yang tersedia.";
  }
  if (/net::|ENOTFOUND|EAI_AGAIN|ECONN|network|internet|timeout|socket/i.test(text)) {
    return "Tidak bisa memeriksa pembaruan. Periksa koneksi internet.";
  }
  return "Gagal memeriksa pembaruan. Coba lagi nanti.";
}

function setupUpdater() {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.allowPrerelease = false;
  // Jangan menulis log updater ke stdout: saat aplikasi dibuka dari shell yang
  // sudah ditutup, pipe bisa putus dan console.info melempar EPIPE.
  autoUpdater.logger = {
    info: function () {},
    warn: function () {},
    error: function () {},
    debug: function () {}
  };

  autoUpdater.on("update-available", function (info) {
    sendUpdateEvent({ type: "available", version: info && info.version ? info.version : "" });
  });

  autoUpdater.on("update-not-available", function (info) {
    sendUpdateEvent({
      type: "not-available",
      version: info && info.version ? info.version : app.getVersion()
    });
  });

  autoUpdater.on("download-progress", function (progress) {
    const percent = Number(progress && progress.percent);
    sendUpdateEvent({
      type: "progress",
      percent: Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0))
    });
  });

  autoUpdater.on("update-downloaded", function (info) {
    updateReady = true;
    sendUpdateEvent({ type: "downloaded", version: info && info.version ? info.version : "" });
  });

  autoUpdater.on("error", function (error) {
    sendUpdateEvent({ type: "error", message: updateErrorMessage(error) });
  });

  ipcMain.handle("vinyl:update-check", async function () {
    if (!app.isPackaged) {
      return { ok: false, error: "Pembaruan hanya tersedia pada aplikasi terpasang." };
    }
    try {
      await autoUpdater.checkForUpdates();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: updateErrorMessage(error) };
    }
  });

  ipcMain.handle("vinyl:update-download", async function () {
    if (!app.isPackaged) {
      return { ok: false, error: "Pembaruan hanya tersedia pada aplikasi terpasang." };
    }
    try {
      await autoUpdater.downloadUpdate();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: updateErrorMessage(error) };
    }
  });

  ipcMain.handle("vinyl:update-install", function () {
    if (!app.isPackaged || !updateReady) {
      return { ok: false, error: "Belum ada pembaruan yang siap dipasang." };
    }
    // Beri waktu balasan IPC terkirim sebelum aplikasi ditutup.
    setTimeout(function () {
      quitting = true;
      autoUpdater.quitAndInstall(true, true);
    }, 250);
    return { ok: true };
  });
}

/* --------------------------------------------------------------------------
   Siklus hidup aplikasi
   -------------------------------------------------------------------------- */

function fail(message, detail) {
  dialog.showErrorBox(message, detail || "");
  app.exit(1);
}

app.whenReady().then(function () {
  // Tolak permintaan izin yang tidak dipakai aplikasi (kamera, mikrofon, dsb).
  session.defaultSession.setPermissionRequestHandler(function (contents, permission, callback) {
    callback(permission === "fullscreen" || permission === "clipboard-sanitized-write");
  });

  startServer({ port: PORT, root: path.join(__dirname, "..") })
    .then(function (result) {
      localServer = result.server;
      localServer.on("error", function (error) {
        if (quitting) return;
        dialog.showErrorBox(
          "Vinyl",
          "Server lokal berhenti: " + (error && error.message ? error.message : String(error))
        );
      });
      setupUpdater();
      createWindow();
    })
    .catch(function (error) {
      const taken = error && (error.code === "EADDRINUSE" || error.code === "EACCES");
      fail(
        "Vinyl tidak bisa dijalankan",
        taken
          ? "Port " + PORT + " sudah dipakai aplikasi lain. Tutup aplikasi tersebut lalu jalankan Vinyl lagi."
          : "Server lokal gagal dinyalakan.\n\n" + (error && error.message ? error.message : String(error))
      );
    });

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  app.quit();
});

app.on("before-quit", function () {
  quitting = true;
  if (localServer) {
    try {
      localServer.close();
    } catch (error) {
      /* server sudah tertutup */
    }
    localServer = null;
  }
});
