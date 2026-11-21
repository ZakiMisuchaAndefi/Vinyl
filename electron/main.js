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
const { app, BrowserWindow, Menu, shell, dialog, session } = require("electron");
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
