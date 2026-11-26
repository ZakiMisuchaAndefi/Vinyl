// SPDX-License-Identifier: GPL-3.0-or-later
/* ==========================================================================
   download.js — proxy unduhan audio untuk versi web.

   Browser tidak bisa menyimpan audio YouTube atau FLAC katalog secara
   langsung: berkasnya cross-origin dan sebagian tidak mengirim header CORS.
   Fungsi ini meneruskan potongan berkas sehingga klien bisa merangkainya
   menjadi Blob lalu menyimpannya sebagai file.

     GET /api/download?track=ID_KATALOG   -> berkas FLAC dari katalog Tracks
     GET /api/download?video=ID_VIDEO&quality=best -> audio YouTube (InnerTube)

   Audio YouTube diselesaikan dengan klien visionOS yang sama seperti
   /api/stream, lalu diambil langsung dari Google Video. Google Video menolak
   byte-range di atas ~1 MB untuk URL InnerTube, jadi potongannya 1 MB. FLAC
   diambil dari katalog Tracks dengan potongan 4 MB (batas respons Vercel
   4,5 MB).
   ========================================================================== */

const lossless = require("./_lossless");
const lib = require("./_lib");

const FLAC_CHUNK = 4 * 1024 * 1024;
const YOUTUBE_CHUNK = 1024 * 1024;
const TIMEOUT = 50000;

const AAC_TYPE = /audio\/(mp4|m4a|aac)/i;

// Ikuti redirect Google Video, tapi tolak kalau keluar dari domain yang aman.
async function fetchAllowed(target, range, headers) {
  let current = target;
  let redirects = 0;
  while (true) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    let response;
    try {
      response = await fetch(current, {
        method: "GET",
        signal: controller.signal,
        redirect: "manual",
        headers: Object.assign({ Range: range }, headers || {})
      });
    } finally {
      clearTimeout(timer);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) return response;
      if (redirects >= 5) throw new Error("Terlalu banyak redirect saat mengambil audio");
      current = new URL(location, current).toString();
      if (!lib.isAllowed(current)) throw new Error("URL redirect tidak valid");
      redirects += 1;
      continue;
    }

    return response;
  }
}

// Baca isi respons sampai `limit` byte. Kalau upstream mengabaikan Range dan
// mengirim seluruh berkas, lewati `skip` byte pertama supaya potongannya tetap
// dimulai dari posisi yang diminta klien.
async function readBody(response, skip, limit) {
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader();
  const parts = [];
  let skipped = 0;
  let taken = 0;
  try {
    while (taken < limit) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      let view = value;
      if (skipped < skip) {
        const drop = Math.min(skip - skipped, view.byteLength);
        skipped += drop;
        view = view.subarray(drop);
        if (!view.byteLength) continue;
      }

      const take = Math.min(view.byteLength, limit - taken);
      parts.push(Buffer.from(view.subarray(0, take)));
      taken += take;

      if (take < view.byteLength) break;
    }
  } finally {
    try {
      await reader.cancel();
    } catch (error) {
      /* Abaikan. */
    }
  }
  return Buffer.concat(parts);
}

function contentRangeOf(upstream, start, bytes, total) {
  const header = String(upstream.headers.get("content-range") || "");
  const match = /^bytes\s+(\d+)-(\d+)\/(\d+|\*)$/i.exec(header);
  if (match) {
    const from = Number(match[1]);
    const known = match[3] === "*" ? 0 : Number(match[3]);
    const to = from + bytes.length - 1;
    return "bytes " + from + "-" + to + "/" + (known > 0 ? known : "*");
  }
  if (start === null || !bytes.length) return "";
  const guess = total || 0;
  return guess > 0
    ? "bytes " + start + "-" + (start + bytes.length - 1) + "/" + guess
    : "";
}

function sanitizeName(value) {
  return (
    String(value || "")
      .normalize("NFKD")
      .replace(/[\\/:*?"<>|\u0000-\u001F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "vinyl-audio"
  );
}

function extensionFor(type, flac) {
  if (flac) return ".flac";
  if (AAC_TYPE.test(String(type || ""))) return ".m4a";
  return ".webm";
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  const track = String(req.query.track || "").trim();
  const video = String(req.query.video || "").trim();
  if (!track && !video) {
    return res.status(400).json({ error: "Tentukan track atau video yang akan diunduh." });
  }

  let target = "";
  let headers = {};
  let chunk = YOUTUBE_CHUNK;
  let type = "";
  let total = 0;
  const flac = !!track;

  if (track) {
    if (!/^\d{1,30}$/.test(track)) {
      return res.status(400).json({ error: "ID lagu lossless tidak valid." });
    }
    target = lossless.BASE + "/track/" + encodeURIComponent(track);
    headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "*/*"
    };
    chunk = FLAC_CHUNK;
    type = "audio/flac";
  } else {
    if (!/^[A-Za-z0-9_-]{11}$/.test(video)) {
      return res.status(400).json({ error: "ID video tidak valid." });
    }
    const quality = lib.qualityOf(req.query.quality);
    let entry;
    try {
      entry = await lib.getAudioUrl(video, quality, false);
    } catch (error) {
      console.error("[download] gagal menyiapkan audio YouTube:", error);
      return res.status(502).json({ error: "Layanan audio tidak tersedia saat ini." });
    }
    const format = (entry && entry.format) || {};
    target = entry.url;
    headers = entry.headers || {};
    chunk = YOUTUBE_CHUNK;
    type = String(format.mimeType || "").split(";")[0].trim() || "audio/webm";
    total =
      Number(new URL(target).searchParams.get("clen")) ||
      Number(format.contentLength) ||
      0;
  }

  // Rentang yang diminta klien, dipotong agar tidak melewati batas upstream.
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range || "").trim());
  let start = 0;
  let end = chunk - 1;
  let suffix = null;
  if (match && match[1] === "" && match[2] !== "") {
    suffix = Math.min(Math.max(1, Number(match[2]) || chunk), chunk);
  } else if (match && match[1] !== "") {
    start = Math.max(0, Number(match[1]) || 0);
    const asked = match[2] === "" ? Infinity : Number(match[2]);
    end = Math.min(start + chunk - 1, asked);
    if (total > 0 && start >= total) {
      res.statusCode = 416;
      res.setHeader("Content-Range", "bytes */" + total);
      res.setHeader("Accept-Ranges", "bytes");
      return res.end();
    }
    if (total > 0) end = Math.min(end, total - 1);
  }

  const rangeHeader =
    suffix !== null ? "bytes=-" + suffix : "bytes=" + start + "-" + end;
  const limit = suffix !== null ? suffix : end - start + 1;

  let upstream;
  try {
    upstream = await fetchAllowed(target, rangeHeader, headers);
    if (!upstream.ok && upstream.status !== 206) {
      console.error("[download] upstream menolak:", upstream.status, target);
      await upstream.body?.cancel();
      return res.status(502).json({ error: "Berkas audio tidak dapat diambil saat ini." });
    }

    const skip = upstream.status === 200 && suffix === null ? start : 0;
    const bytes = await readBody(upstream, skip, limit);
    if (!bytes.length) {
      return res.status(502).json({ error: "Berkas audio kosong." });
    }

    const contentRange = contentRangeOf(
      upstream,
      suffix === null ? start : null,
      bytes,
      total
    );
    res.statusCode = contentRange ? 206 : 200;
    res.setHeader("Content-Type", type);
    res.setHeader("Content-Length", String(bytes.length));
    if (contentRange) res.setHeader("Content-Range", contentRange);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="' + sanitizeName("vinyl-audio") + extensionFor(type, flac) + '"'
    );

    if (req.method === "HEAD") return res.end();
    res.end(bytes);
  } catch (error) {
    console.error("[download] gagal meneruskan audio:", error);
    if (!res.headersSent) {
      res.status(502).json({ error: "Berkas audio tidak dapat diambil saat ini." });
    }
  }
};
