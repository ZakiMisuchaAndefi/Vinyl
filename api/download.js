/* ==========================================================================
   download.js — proxy unduhan audio untuk versi web.

   Browser tidak bisa menyimpan audio YouTube atau FLAC katalog secara
   langsung: berkasnya cross-origin dan sebagian tidak mengirim header CORS.
   Fungsi ini meneruskan potongan berkas (maksimal 4 MB per respons agar tetap
   di bawah batas 4,5 MB Vercel) sehingga klien bisa merangkainya menjadi Blob
   lalu menyimpannya sebagai file.

     GET /api/download?track=ID_KATALOG   -> berkas FLAC dari katalog Tracks
     GET /api/download?video=ID_VIDEO     -> audio YouTube lewat Invidious
   ========================================================================== */

const lossless = require("./_lossless");
const invidious = require("./_invidious");

// Batas Vercel untuk satu respons adalah 4,5 MB; sisakan ruang untuk header.
const CHUNK = 4 * 1024 * 1024;
const TIMEOUT = 50000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const AAC_ITAGS = new Set([139, 140, 141]);
const OPUS_ITAGS = new Set([249, 250, 251, 774]);
const DEFAULT_ITAG = 251;

function requestedRange(header) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(header || "").trim());
  if (!match || (match[1] === "" && match[2] === "")) {
    return { header: "bytes=0-" + (CHUNK - 1), start: 0 };
  }
  if (match[1] === "") {
    // Rentang sufiks: cukup ambil beberapa byte terakhir, tidak lebih dari CHUNK.
    const length = Math.min(Math.max(1, Number(match[2]) || CHUNK), CHUNK);
    return { header: "bytes=-" + length, start: null };
  }
  const start = Number(match[1]);
  const end =
    match[2] === ""
      ? start + CHUNK - 1
      : Math.min(Number(match[2]), start + CHUNK - 1);
  return { header: "bytes=" + start + "-" + end, start };
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

function contentRangeOf(upstream, range, bytes) {
  const header = String(upstream.headers.get("content-range") || "");
  const match = /^bytes\s+(\d+)-(\d+)\/(\d+|\*)$/i.exec(header);
  if (match) {
    const start = Number(match[1]);
    const total = match[3] === "*" ? 0 : Number(match[3]);
    const end = Math.min(
      start + bytes.length - 1,
      total > 0 ? total - 1 : Number.MAX_SAFE_INTEGER
    );
    return "bytes " + start + "-" + end + "/" + (total > 0 ? total : "*");
  }
  if (range.start === null || !bytes.length) return "";
  const length = Number(upstream.headers.get("content-length")) || 0;
  const total = upstream.status === 200 && length > 0 ? range.start + length : 0;
  return total > 0
    ? "bytes " + range.start + "-" + (range.start + bytes.length - 1) + "/" + total
    : "";
}

function contentTypeFor(track, itag) {
  if (track) return "audio/flac";
  if (AAC_ITAGS.has(itag)) return "audio/mp4";
  if (OPUS_ITAGS.has(itag)) return "audio/webm";
  return "application/octet-stream";
}

function extensionFor(track, itag) {
  if (track) return ".flac";
  if (AAC_ITAGS.has(itag)) return ".m4a";
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
  let itag = 0;
  if (track) {
    if (!/^\d{1,30}$/.test(track)) {
      return res.status(400).json({ error: "ID lagu lossless tidak valid." });
    }
    target = lossless.BASE + "/track/" + encodeURIComponent(track);
  } else {
    if (!/^[A-Za-z0-9_-]{11}$/.test(video)) {
      return res.status(400).json({ error: "ID video tidak valid." });
    }
    const requested = Number(req.query.itag) || DEFAULT_ITAG;
    itag = AAC_ITAGS.has(requested) || OPUS_ITAGS.has(requested) ? requested : DEFAULT_ITAG;
    const host = await invidious.pick();
    if (!host) {
      return res.status(503).json({ error: "Layanan audio tidak tersedia saat ini." });
    }
    target = invidious.audioUrl(host, video, itag);
  }

  const range = requestedRange(req.headers.range);
  const limit =
    range.start === null
      ? CHUNK
      : Math.min(CHUNK, Number(range.header.split("-")[1]) - range.start + 1);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const upstream = await fetch(target, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        Range: range.header,
        "User-Agent": UA,
        Accept: "*/*"
      }
    });

    if (!upstream.ok && upstream.status !== 206) {
      console.error("[download] upstream menolak:", upstream.status, target);
      await upstream.body?.cancel();
      return res.status(502).json({ error: "Berkas audio tidak dapat diambil saat ini." });
    }

    const skip = upstream.status === 200 && range.start ? range.start : 0;
    const bytes = await readBody(upstream, skip, limit);
    if (!bytes.length) {
      return res.status(502).json({ error: "Berkas audio kosong." });
    }

    const contentRange = contentRangeOf(upstream, range, bytes);
    res.statusCode = contentRange ? 206 : 200;
    res.setHeader("Content-Type", contentTypeFor(track, itag));
    res.setHeader("Content-Length", String(bytes.length));
    if (contentRange) res.setHeader("Content-Range", contentRange);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="vinyl-audio' + extensionFor(track, itag) + '"'
    );

    if (req.method === "HEAD") return res.end();
    res.end(bytes);
  } catch (error) {
    console.error("[download] gagal meneruskan audio:", error);
    if (!res.headersSent) {
      res.status(502).json({ error: "Berkas audio tidak dapat diambil saat ini." });
    }
  } finally {
    clearTimeout(timer);
  }
};
