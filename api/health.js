// SPDX-License-Identifier: GPL-3.0-or-later
// Instance Invidious publik yang dipakai sebagai sumber audio di Vercel.
// YouTube memblokir semua permintaan audio dari IP datacenter, jadi audio
// diambil dari instance ini dan diputar langsung oleh browser pengunjung.
const invidious = require("./_invidious");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  const instance = await invidious.pick();

  res.json({
    innertube: true,
    ytdlp: false,
    ffmpeg: false,
    mp3: false,
    downloads: true,
    // "invidious" = audio stream langsung tanpa iklan dan tanpa batas embed.
    // "iframe"    = cadangan: pemutar resmi YouTube (bisa ada iklan).
    engine: instance ? "invidious" : "iframe",
    instance
  });
};
