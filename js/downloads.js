// SPDX-License-Identifier: GPL-3.0-or-later
/* ==========================================================================
   downloads.js — unduhan audio langsung dari browser.

   Berkas diambil lewat /api/download (proxy potongan 4 MB) atau /api/stream
   saat memakai server lokal, dirangkai menjadi Blob, lalu disimpan oleh
   browser. Formatnya mengikuti sumber: FLAC lossless dari katalog Tracks,
   atau audio YouTube (OPUS/AAC). Tidak perlu ffmpeg maupun folder downloads.
   ========================================================================== */

(function (AM) {
  "use strict";

  // Harus di bawah batas respons Vercel (4,5 MB).
  const CHUNK = 4 * 1024 * 1024;

  const active = new Map();

  function toast(message, options) {
    if (AM.UI && typeof AM.UI.toast === "function") return AM.UI.toast(message, options);
    return null;
  }

  function qualityLabel(id) {
    switch (id) {
      case "low":
        return "Hemat";
      case "medium":
        return "Standar";
      case "high":
        return "Tinggi";
      case "lossless":
      case "flac":
        return "FLAC";
      case "best":
      default:
        return "Terbaik";
    }
  }

  function downloadQuality() {
    const value = AM.Library ? AM.Library.getSetting("downloadQuality", "best") : "best";
    return ["low", "medium", "high", "best", "flac"].includes(value) ? value : "best";
  }

  function apiBase() {
    return window.API_BASE || "";
  }

  function isLocalHost() {
    return /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(window.location.hostname);
  }

  /* ------------------------------------------------------------------------
     Progress di toast
     ------------------------------------------------------------------------ */

  function updateToast(handle, message) {
    if (!handle || !handle.el) return;
    const span = handle.el.querySelector("span");
    if (span) span.textContent = message;
  }

  function progress(handle, track, codec, done, total) {
    const now = Date.now();
    if (handle && handle.progressAt && now - handle.progressAt < 180 && !(total > 0 && done >= total)) {
      return;
    }
    if (handle) handle.progressAt = now;
    const percent = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    updateToast(
      handle,
      "Mengunduh “" + track.title + "” · " + codec + (total > 0 ? " " + percent + "%" : "…")
    );
  }

  /* ------------------------------------------------------------------------
     Nama berkas & penyimpanan
     ------------------------------------------------------------------------ */

  function fileName(track, extension) {
    const artist = String(track.artist || "").trim();
    const title = String(track.songTitle || track.title || "").trim() || "audio";
    const artistKey = artist.toLowerCase();
    const alreadyNamed =
      artistKey &&
      artistKey !== "youtube" &&
      (title.toLowerCase() === artistKey || title.toLowerCase().startsWith(artistKey + " "));
    const raw =
      artist && artistKey !== "youtube" && !alreadyNamed ? artist + " - " + title : title;
    const clean = raw
      .replace(/[\\/:*?"<>|\u0000-\u001F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
    return (clean || "audio") + extension;
  }

  function extensionOf(type, fallback) {
    const value = String(type || "").toLowerCase();
    if (value.includes("flac")) return ".flac";
    if (value.includes("mp4") || value.includes("m4a") || value.includes("aac")) return ".m4a";
    if (value.includes("webm")) return ".webm";
    if (value.includes("ogg") || value.includes("opus")) return ".opus";
    if (value.includes("mpeg") || value.includes("mp3")) return ".mp3";
    if (value.includes("wav")) return ".wav";
    return fallback || ".audio";
  }

  function saveBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name || "audio";
    link.rel = "noopener";
    link.style.display = "none";
    document.body.appendChild(link);
    try {
      link.click();
    } finally {
      window.setTimeout(() => link.remove(), 0);
    }
    // Beri waktu untuk tombol "Simpan" di toast memakai URL yang sama.
    window.setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
    return url;
  }

  /* ------------------------------------------------------------------------
     Pengambilan berkas per potongan
     ------------------------------------------------------------------------ */

  async function fetchBlob(url, options) {
    const opts = options || {};
    const parts = [];
    let start = 0;
    let total = 0;
    let type = opts.type || "";

    for (let guard = 0; guard < 500; guard += 1) {
      const end = start + CHUNK - 1;
      const response = await fetch(url, {
        headers: { Range: "bytes=" + start + "-" + end },
        cache: "no-store"
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error((data && data.error) || "Server tidak dapat mengambil audio.");
      }

      if (!type) {
        const header = response.headers.get("content-type") || "";
        if (header && !header.includes("application/octet-stream")) type = header;
      }

      const buffer = await response.arrayBuffer();
      const range = /^bytes\s+\d+-\d+\/(\d+|\*)$/i.exec(
        String(response.headers.get("content-range") || "")
      );
      if (range && range[1] !== "*") total = Number(range[1]) || total;

      if (!buffer.byteLength) break;
      parts.push(buffer);
      start += buffer.byteLength;
      if (opts.onProgress) opts.onProgress(start, total);

      if (total > 0 && start >= total) break;
      // Server mengirim seluruh berkas dalam satu respons.
      if (!range) break;
    }

    if (!parts.length) throw new Error("Berkas audio kosong.");
    return {
      blob: new Blob(parts, { type: type || opts.type || "application/octet-stream" }),
      type
    };
  }

  /* ------------------------------------------------------------------------
     FLAC lossless
     ------------------------------------------------------------------------ */

  async function downloadLossless(track, handle) {
    if (!AM.Lossless || typeof AM.Lossless.resolve !== "function") return null;
    const result = await AM.Lossless.resolve(track, { force: true });
    if (!result || !result.id) return null;

    updateToast(handle, "Mengunduh “" + track.title + "” · FLAC 0%");
    try {
      const file = await fetchBlob(
        apiBase() + "/api/download?track=" + encodeURIComponent(result.id),
        {
          type: "audio/flac",
          onProgress: (done, total) => progress(handle, track, "FLAC", done, total)
        }
      );
      const name = fileName(track, extensionOf(file.type, ".flac"));
      saveBlob(file.blob, name);
      return { blob: file.blob, name, format: "FLAC" };
    } catch (error) {
      // Katalog bisa menolak atau jaringan terputus di tengah unduhan; jangan
      // hentikan seluruh proses, cukup turun ke audio YouTube terbaik.
      console.warn("[downloads] unduhan FLAC gagal:", error);
      return null;
    }
  }

  /* ------------------------------------------------------------------------
     Audio YouTube
     ------------------------------------------------------------------------ */

  function codecOf(type) {
    const value = String(type || "").toLowerCase();
    if (value.includes("flac")) return "FLAC";
    if (value.includes("webm") || value.includes("opus")) return "OPUS";
    if (value.includes("mp4") || value.includes("m4a") || value.includes("aac")) return "AAC";
    return "Audio";
  }

  async function downloadYoutube(track, quality, handle) {
    const qualityId = ["low", "medium", "high", "best"].includes(quality) ? quality : "best";

    // Server lokal memakai proxy /api/stream yang sudah ber-Range. Di web,
    // /api/download menyelesaikan audio lewat InnerTube lalu meneruskannya.
    const base = isLocalHost()
      ? "/api/stream?id=" + encodeURIComponent(track.sourceId) + "&quality=" + qualityId
      : "/api/download?video=" + encodeURIComponent(track.sourceId) + "&quality=" + qualityId;

    updateToast(handle, "Mengunduh “" + track.title + "” · audio 0%");
    const file = await fetchBlob(apiBase() + base, {
      onProgress: (done, total) => progress(handle, track, "audio", done, total)
    });
    const extension = extensionOf(file.type, ".webm");
    const name = fileName(track, extension);
    saveBlob(file.blob, name);
    return { blob: file.blob, name, format: codecOf(file.type) };
  }

  /* ------------------------------------------------------------------------
     API publik
     ------------------------------------------------------------------------ */

  async function download(track, qualityId) {
    if (!track || track.provider !== "youtube" || !track.sourceId) {
      toast("Unduhan hanya tersedia untuk lagu YouTube.", { icon: "info" });
      return null;
    }
    if (active.has(track.id)) {
      toast("Lagu ini sedang diunduh. Tunggu sampai selesai.", { icon: "info" });
      return null;
    }

    const quality = qualityId || downloadQuality();
    const handle = toast(
      "Menyiapkan unduhan “" + track.title + "” · " + qualityLabel(quality) + "…",
      { icon: "download", duration: 0 }
    );
    active.set(track.id, true);

    try {
      let result = null;
      if (quality === "flac") {
        result = await downloadLossless(track, handle);
        if (!result) {
          updateToast(handle, "FLAC tidak tersedia. Mengunduh audio terbaik…");
        }
      }
      if (!result) {
        result = await downloadYoutube(track, quality === "flac" ? "best" : quality, handle);
      }

      if (handle) handle.dismiss();
      toast("“" + track.title + "” siap diunduh (" + result.format + ").", {
        type: "success",
        duration: 12000,
        action: { label: "Simpan", onClick: () => saveBlob(result.blob, result.name) }
      });
      return { name: result.name, format: result.format };
    } catch (error) {
      if (handle) handle.dismiss();
      toast(
        "Gagal mengunduh: " + (error && error.message ? error.message : "coba lagi."),
        { type: "error", duration: 9000 }
      );
      return null;
    } finally {
      active.delete(track.id);
    }
  }

  AM.Downloads = {
    download,
    qualityLabel,
    downloadQuality,
    isDownloading: (trackId) => active.has(trackId)
  };
})(window.AM = window.AM || {});
