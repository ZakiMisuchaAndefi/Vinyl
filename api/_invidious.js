/* ==========================================================================
   _invidious.js — pemilih instance Invidious untuk audio YouTube.

   YouTube menolak permintaan audio dari IP datacenter Vercel, jadi audio
   diambil lewat instance Invidious publik. Modul ini dipakai bersama oleh
   /api/health (memilih mesin audio) dan /api/download (proxy unduhan).
   ========================================================================== */

const INSTANCES = ["yt.chocolatemoo53.com"];
const PROBE_TIMEOUT = 3000;
const CACHE_TTL = 5 * 60 * 1000;

let chosen = { host: "", at: 0 };

async function reachable(host) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT);
  try {
    const response = await fetch("https://" + host + "/api/v1/stats", {
      signal: controller.signal,
      headers: { "user-agent": "Mozilla/5.0", accept: "application/json" }
    });
    return response.ok;
  } catch (error) {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// Host yang sedang hidup. Hasilnya disimpan sebentar agar proxy unduhan tidak
// memeriksa instance berulang kali untuk setiap potongan berkas.
async function pick(force) {
  if (!force && chosen.host && Date.now() - chosen.at < CACHE_TTL) {
    return chosen.host;
  }
  for (const host of INSTANCES) {
    if (await reachable(host)) {
      chosen = { host, at: Date.now() };
      return host;
    }
  }
  chosen = { host: "", at: 0 };
  return "";
}

function audioUrl(host, videoId, itag) {
  return (
    "https://" +
    host +
    "/latest_version?id=" +
    encodeURIComponent(videoId) +
    "&itag=" +
    encodeURIComponent(String(itag)) +
    "&local=true"
  );
}

module.exports = { INSTANCES, reachable, pick, audioUrl };
