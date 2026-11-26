// SPDX-License-Identifier: GPL-3.0-or-later
/* ==========================================================================
   _invidious.js — pemilih instance Invidious untuk streaming audio.

   YouTube menolak permintaan audio dari IP datacenter Vercel, jadi pemutaran
   audio di browser memakai instance Invidious publik. Modul ini dipakai
   /api/health untuk menentukan mesin audio yang aktif.
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

// Host yang sedang hidup. Hasilnya disimpan sebentar agar health check tidak
// memeriksa instance berulang kali.
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

module.exports = { pick };
