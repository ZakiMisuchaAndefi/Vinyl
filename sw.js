/* ==========================================================================
   sw.js — service worker Vinyl
   Menyimpan kerangka aplikasi agar Vinyl bisa dibuka tanpa jaringan.
   Permintaan audio/API (streaming, pencarian, unduhan) tidak pernah
   disimpan di cache.
   ========================================================================== */

const VERSION = "vinyl-v2";
const SHELL_CACHE = VERSION + "-shell";
const RUNTIME_CACHE = VERSION + "-runtime";

const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/base.css",
  "./css/layout.css",
  "./css/sidebar.css",
  "./css/content.css",
  "./css/player.css",
  "./css/overlays.css",
  "./css/responsive.css",
  "./css/onboarding.css",
  "./js/db.js",
  "./js/utils.js",
  "./js/ui.js",
  "./js/library.js",
  "./js/metadata.js",
  "./js/media.js",
  "./js/player.js",
  "./js/views.js",
  "./js/home.js",
  "./js/online.js",
  "./js/youtube.js",
  "./js/lossless.js",
  "./js/downloads.js",
  "./js/lyrics.js",
  "./js/romanize.js",
  "./js/audiolab.js",
  "./js/demo.js",
  "./js/onboarding.js",
  "./js/analytics.js",
  "./js/app.js",
  "./assets/logo-vinyl.png",
  "./assets/dev-avatar.jpg",
  "./assets/icons/icon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/fonts/InterVariable.woff2",
  "./assets/onboarding/vinyl-record.svg",
  "./assets/onboarding/opening.mp3",
  "./assets/onboarding/art-just-enough.png",
  "./assets/onboarding/art-entwined.png",
  "./assets/onboarding/art-rest.png",
  "./assets/onboarding/art-heading-home.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.all(
        SHELL.map((url) =>
          // Satu berkas yang gagal tidak boleh membatalkan seluruh instalasi.
          cache.add(new Request(url, { cache: "reload" })).catch(() => null)
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isApi(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_vercel/") ||
    url.pathname.startsWith("/downloads/") ||
    url.pathname.startsWith("/scripts/")
  );
}

function isShellAsset(url) {
  return (
    url.pathname.startsWith("/css/") ||
    url.pathname.startsWith("/js/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname === "/manifest.webmanifest"
  );
}

async function networkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = (await cache.match(request)) || (await cache.match("./index.html"));
    if (cached) return cached;
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  if (cached) return cached;
  const response = await network;
  if (response) return response;
  throw new Error("Offline dan tidak ada cache untuk " + request.url);
}

// Elemen audio meminta berkas dengan header Range. Bila berkasnya sudah ada di
// cache, potong sendiri agar tetap bisa diputar tanpa jaringan.
async function rangeFromCache(request, url) {
  const header = (request.headers.get("range") || "").trim();
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match) return null;

  const cache = await caches.open(SHELL_CACHE);
  const cached = (await cache.match(url.href)) || (await cache.match(url.pathname));
  if (!cached) return null;

  const buffer = await cached.arrayBuffer();
  const size = buffer.byteLength;
  let start;
  let end;

  if (!match[1]) {
    // Bentuk "-N": N byte terakhir.
    const suffix = Number(match[2]);
    if (!suffix) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": "bytes */" + size }
    });
  }

  const headers = new Headers();
  headers.set("Content-Type", cached.headers.get("content-type") || "application/octet-stream");
  headers.set("Content-Range", "bytes " + start + "-" + end + "/" + size);
  headers.set("Content-Length", String(end - start + 1));
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "no-store");
  return new Response(buffer.slice(start, end + 1), {
    status: 206,
    statusText: "Partial Content",
    headers
  });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isApi(url)) return;
  // Permintaan ber-Range (audio) dipotong dari cache bila tersedia.
  if (request.headers.has("range")) {
    if (url.pathname.startsWith("/assets/")) {
      event.respondWith(
        rangeFromCache(request, url)
          .then((response) => response || fetch(request))
          .catch(() => fetch(request))
      );
    }
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isShellAsset(url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
