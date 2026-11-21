/* ==========================================================================
   electron/server.js — server lokal untuk aplikasi desktop Vinyl.

   Tugasnya sama seperti server.ps1 + rewrite Vercel saat di web:
   - menyajikan berkas statis dari folder aplikasi,
   - meneruskan /api/... ke fungsi yang sama dengan yang dipakai di Vercel,
   - melayani path bersih (/home, /settings/pemutaran) dengan index.html.

   Server hanya mendengarkan di 127.0.0.1, jadi tidak bisa diakses dari
   perangkat lain di jaringan.
   ========================================================================== */

"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".flac": "audio/flac",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".opus": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8"
};

/* --------------------------------------------------------------------------
   Pembantu respons
   -------------------------------------------------------------------------- */

function applyCommonHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
}

function sendJson(res, statusCode, payload) {
  if (res.writableEnded) return;
  const body = Buffer.from(JSON.stringify(payload));
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Length", String(body.length));
  res.end(body);
}

// Fungsi api/*.js memakai gaya Vercel: res.status(...).json(...), res.send(...).
function decorateApiResponse(res) {
  res.status = function (code) {
    res.statusCode = code;
    return res;
  };
  res.json = function (payload) {
    if (res.writableEnded) return res;
    const body = Buffer.from(JSON.stringify(payload));
    if (!res.headersSent) res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Length", String(body.length));
    res.end(body);
    return res;
  };
  res.send = function (payload) {
    if (res.writableEnded) return res;
    if (payload == null) {
      res.end();
      return res;
    }
    if (Buffer.isBuffer(payload)) {
      res.setHeader("Content-Length", String(payload.length));
      res.end(payload);
      return res;
    }
    if (typeof payload === "object") return res.json(payload);
    const body = Buffer.from(String(payload));
    if (!res.getHeader("Content-Type")) res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Length", String(body.length));
    res.end(body);
    return res;
  };
  return res;
}

/* --------------------------------------------------------------------------
   API
   -------------------------------------------------------------------------- */

function queryFrom(searchParams) {
  const query = {};
  searchParams.forEach(function (value, key) {
    if (!Object.prototype.hasOwnProperty.call(query, key)) query[key] = value;
    else if (Array.isArray(query[key])) query[key].push(value);
    else query[key] = [query[key], value];
  });
  return query;
}

function handleApi(req, res, root, pathname, searchParams) {
  const name = pathname.slice("/api/".length).replace(/\/+$/, "");
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    sendJson(res, 404, { error: "Endpoint tidak ditemukan." });
    return;
  }

  const file = path.join(root, "api", name + ".js");
  let handler;
  try {
    handler = require(file);
  } catch (error) {
    console.error("[vinyl] gagal memuat api/" + name + ".js:", error);
    sendJson(res, 404, { error: "Endpoint tidak ditemukan." });
    return;
  }
  if (typeof handler !== "function") {
    sendJson(res, 404, { error: "Endpoint tidak ditemukan." });
    return;
  }

  req.query = queryFrom(searchParams);
  decorateApiResponse(res);

  Promise.resolve()
    .then(function () {
      return handler(req, res);
    })
    .catch(function (error) {
      console.error("[vinyl] api/" + name + ".js error:", error);
      if (!res.headersSent) sendJson(res, 500, { error: "Terjadi kesalahan di server lokal." });
      else if (!res.writableEnded) res.end();
    });
}

/* --------------------------------------------------------------------------
   Berkas statis
   -------------------------------------------------------------------------- */

function withinRoot(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(header || "").trim());
  if (!match) return null;
  let start;
  let end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!suffix) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) {
    return { invalid: true };
  }
  return { start: start, end: Math.min(end, size - 1) };
}

function sendFile(req, res, file, stats) {
  const ext = path.extname(file).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  const rangeHeader = req.headers.range;
  const options = {
    headers: {
      "Content-Type": type,
      "Accept-Ranges": "bytes",
      "Cache-Control": ext === ".html" ? "no-store" : "no-cache"
    }
  };

  if (rangeHeader) {
    const range = parseRange(rangeHeader, stats.size);
    if (range && range.invalid) {
      res.writeHead(416, {
        "Content-Type": type,
        "Content-Range": "bytes */" + stats.size,
        "Accept-Ranges": "bytes"
      });
      res.end();
      return;
    }
    if (range) {
      const length = range.end - range.start + 1;
      res.writeHead(206, {
        "Content-Type": type,
        "Content-Range": "bytes " + range.start + "-" + range.end + "/" + stats.size,
        "Content-Length": String(length),
        "Accept-Ranges": "bytes",
        "Cache-Control": ext === ".html" ? "no-store" : "no-cache"
      });
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      fs.createReadStream(file, { start: range.start, end: range.end }).pipe(res);
      return;
    }
  }

  options.headers["Content-Length"] = String(stats.size);
  res.writeHead(200, options.headers);
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  fs.createReadStream(file).pipe(res);
}

function serveStatic(req, res, root, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch (error) {
    sendJson(res, 400, { error: "Alamat tidak valid." });
    return;
  }

  const relative = decoded.replace(/^\/+/, "");
  let target = path.resolve(root, relative || "index.html");
  if (!withinRoot(root, target)) {
    sendJson(res, 403, { error: "Akses ditolak." });
    return;
  }

  function fallbackToIndex() {
    // Path bersih tanpa ekstensi dilayani index.html, seperti rewrite Vercel.
    if (path.extname(decoded)) {
      sendJson(res, 404, { error: "Berkas tidak ditemukan." });
      return;
    }
    const indexFile = path.join(root, "index.html");
    fs.stat(indexFile, function (statError, indexStats) {
      if (statError) {
        sendJson(res, 500, { error: "index.html tidak ditemukan." });
        return;
      }
      sendFile(req, res, indexFile, indexStats);
    });
  }

  fs.stat(target, function (error, stats) {
    if (!error && stats.isDirectory()) {
      target = path.join(target, "index.html");
      fs.stat(target, function (indexError, indexStats) {
        if (indexError) fallbackToIndex();
        else sendFile(req, res, target, indexStats);
      });
      return;
    }
    if (error) {
      fallbackToIndex();
      return;
    }
    sendFile(req, res, target, stats);
  });
}

/* --------------------------------------------------------------------------
   Server
   -------------------------------------------------------------------------- */

function startServer(options) {
  const opts = options || {};
  const root = path.resolve(opts.root || path.join(__dirname, ".."));
  const port = Number(opts.port) || 41730;
  const host = "127.0.0.1";

  const server = http.createServer(function (req, res) {
    applyCommonHeaders(res);

    let url;
    try {
      url = new URL(req.url, "http://" + host + ":" + port);
    } catch (error) {
      sendJson(res, 400, { error: "Permintaan tidak valid." });
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJson(res, 405, { error: "Metode tidak didukung." });
      return;
    }

    // Skrip Vercel Insights tidak ada di aplikasi lokal; jawab kosong agar
    // konsol tidak menampilkan 404.
    if (url.pathname === "/_vercel/insights/script.js") {
      res.writeHead(200, {
        "Content-Type": "text/javascript; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Length": "0"
      });
      res.end();
      return;
    }

    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      handleApi(req, res, root, url.pathname, url.searchParams);
      return;
    }

    serveStatic(req, res, root, url.pathname);
  });

  return new Promise(function (resolve, reject) {
    server.once("error", reject);
    server.listen(port, host, function () {
      server.removeListener("error", reject);
      resolve({
        server: server,
        port: port,
        url: "http://" + host + ":" + port
      });
    });
  });
}

module.exports = { startServer: startServer };
