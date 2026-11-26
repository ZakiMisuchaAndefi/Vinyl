// SPDX-License-Identifier: GPL-3.0-or-later
/* ==========================================================================
   audiolab.js — graf Web Audio untuk Audio Lab (equalizer, mono, kompresor)

   Kenapa rute ganda? Graf Web Audio hanya boleh menempel satu kali per
   elemen <audio>, dan elemen yang sudah menempel TIDAK BISA kembali
   mengeluarkan suara langsung. Selain itu, elemen yang memutar berkas
   lintas-origin tanpa header CORS (katalog FLAC tracks.monochrome.st)
   akan menghasilkan senyap di dalam graf.

   Solusinya: mesin pemutar (media.js) memiliki dua elemen —
   1. elemen langsung (asli, tidak pernah menempel graf) — dipakai untuk
      FLAC lintas-origin dan sebagai bawaan;
   2. elemen terhubung-graf — dipakai untuk sumber same-origin
      (/api/stream YouTube, blob file lokal, URL relatif).

   AM.AudioLab.prepare(url) dipanggil player sebelum audio.src disetel,
   lalu memilih rute yang tepat per lagu. Keputusan selalu aman: bila
   ragu, audio tetap terdengar — hanya saja tanpa pemrosesan.
   ========================================================================== */

(function (AM) {
  "use strict";

  const L = AM.Library;

  // Sepuluh pita ala EQ grafis (spasi oktaf ISO): lowshelf, peaking x8,
  // highshelf. Rentang ±12 dB. Q ≈ 1,4 = lebar band satu oktaf.
  const BANDS = [
    { freq: 31, type: "lowshelf", label: "31 Hz" },
    { freq: 62, type: "peaking", label: "62 Hz" },
    { freq: 125, type: "peaking", label: "125 Hz" },
    { freq: 250, type: "peaking", label: "250 Hz" },
    { freq: 500, type: "peaking", label: "500 Hz" },
    { freq: 1000, type: "peaking", label: "1 kHz" },
    { freq: 2000, type: "peaking", label: "2 kHz" },
    { freq: 4000, type: "peaking", label: "4 kHz" },
    { freq: 8000, type: "peaking", label: "8 kHz" },
    { freq: 16000, type: "highshelf", label: "16 kHz" }
  ];

  const PRESETS = {
    datar: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    bass: [7, 6, 5, 3, 1, 0, 0, -1, -1, 0],
    vokal: [-3, -2, 0, 1, 2, 3.5, 4, 3, 1, 0],
    elektronik: [6, 5, 3, 1, -1, -2, 0, 2, 4, 5],
    akustik: [3, 2.5, 2, 1.5, 1, 1.5, 2, 2.5, 3, 3.5],
    rock: [5, 4.5, 3.5, 1.5, -1, -1.5, 2, 3.5, 4.5, 5]
  };

  let ctx = null;
  let nodes = null; // { source, filters[], compressor, splitter, merger }
  let gestureArmed = false;
  let lastPreparedUrl = "";

  /* ---------------------------------------------------------------- util */

  function setting(key, fallback) {
    try {
      return L && typeof L.getSetting === "function" ? L.getSetting(key, fallback) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function wantsGraph() {
    return (
      !!setting("eqEnabled", false) ||
      !!setting("monoAudio", false) ||
      !!setting("compressor", false)
    );
  }

  // Sumber aman untuk graf = same-origin, blob:, atau data:. FLAC dari
  // katalog Tracks adalah https lintas-origin tanpa CORS -> tidak aman.
  function sameOriginSafe(url) {
    const value = String(url || "");
    if (!value) return true; // src kosong: tidak ada yang bocor
    try {
      const u = new URL(value, window.location.href);
      if (u.protocol === "blob:" || u.protocol === "data:") return true;
      return u.origin === window.location.origin;
    } catch (error) {
      return false;
    }
  }

  function eqGains() {
    const stored = setting("eqGains", null);
    const preset = String(setting("eqPreset", "datar"));
    const base = PRESETS[preset] || PRESETS.datar;
    // Array tersimpan dari versi lama (jumlah pita beda) diabaikan agar
    // tidak tercampur; preset jadi titik awal sampai pengguna menggeser lagi.
    if (!Array.isArray(stored) || stored.length !== BANDS.length) {
      return base.slice();
    }
    return BANDS.map((band, index) => {
      const raw = Number(stored[index]);
      if (!Number.isFinite(raw)) return base[index];
      return Math.max(-12, Math.min(12, raw));
    });
  }

  /* ------------------------------------------------------------ graf */

  function buildChain(element) {
    const filters = BANDS.map((band) => {
      const filter = ctx.createBiquadFilter();
      filter.type = band.type;
      filter.frequency.value = band.freq;
      filter.Q.value = 1.4;
      filter.gain.value = 0;
      return filter;
    });

    const compressor = ctx.createDynamicsCompressor();
    // Netral saat mati: rasio 1:1 = tembus pandang.
    compressor.threshold.value = 0;
    compressor.knee.value = 0;
    compressor.ratio.value = 1;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    const splitter = ctx.createChannelSplitter(2);
    const merger = ctx.createChannelMerger(2);

    const source = ctx.createMediaElementSource(element);
    let node = source;
    filters.forEach((filter) => {
      node.connect(filter);
      node = filter;
    });
    node.connect(compressor);
    compressor.connect(splitter);
    connectMono(setting("monoAudio", false) === true);
    merger.connect(ctx.destination);

    nodes = { source, filters, compressor, splitter, merger };
    applySettings();
  }

  // monoAudio: kanal kiri digandakan ke kanan. monoAudio mati: kiri->kiri,
  // kanan->kanan seperti biasa.
  function connectMono(mono) {
    if (!nodes) return;
    const { splitter, merger } = nodes;
    try {
      splitter.disconnect(merger);
    } catch (error) {
      /* Belum tersambung. */
    }
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, mono ? 0 : 1, 1);
  }

  function applySettings() {
    if (!nodes) return;
    const gains = eqGains();
    nodes.filters.forEach((filter, index) => {
      filter.gain.value = setting("eqEnabled", false) ? gains[index] : 0;
    });

    if (setting("compressor", false) === true) {
      nodes.compressor.threshold.value = -18;
      nodes.compressor.knee.value = 18;
      nodes.compressor.ratio.value = 4;
    } else {
      nodes.compressor.threshold.value = 0;
      nodes.compressor.knee.value = 0;
      nodes.compressor.ratio.value = 1;
    }

    connectMono(setting("monoAudio", false) === true);
  }

  function setBand(index, value) {
    if (!nodes || !nodes.filters[index]) return;
    nodes.filters[index].gain.value = Math.max(-12, Math.min(12, Number(value) || 0));
  }

  /* ------------------------------------------------------- aktivasi */

  function ensureContext() {
    if (ctx) return ctx;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch (error) {
      console.warn("[audiolab] AudioContext gagal dibuat:", error);
      return null;
    }
    armGesture();
    return ctx;
  }

  // Kebijakan autoplay: AudioContext baru berbunyi setelah interaksi
  // pengguna. Daftarkan sekali untuk melanjutkan/membuat graf.
  function armGesture() {
    if (gestureArmed) return;
    gestureArmed = true;
    const resume = () => {
      gestureArmed = false;
      if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
      if (wantsGraph() && !nodes) activate();
      document.removeEventListener("pointerdown", resume, true);
      document.removeEventListener("keydown", resume, true);
    };
    document.addEventListener("pointerdown", resume, true);
    document.addEventListener("keydown", resume, true);
  }

  // Dipanggil saat pengguna menyalakan EQ/efek di Pengaturan (gesture)
  // dan dari pendengar gesture di atas. Tidak mengganggu lagu yang sedang
  // diputar: elemen aktif tidak ditukar, rute baru berlaku untuk lagu
  // berikutnya.
  function activate() {
    if (!wantsGraph()) return false;
    if (!ensureContext()) return false;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const engine = AM.Media && AM.Media.instance;
    if (engine && typeof engine.routedElement === "function" && !nodes) {
      buildChain(engine.routedElement());
    }
    return graphReady();
  }

  function graphReady() {
    return !!ctx && ctx.state === "running" && !!nodes;
  }

  /* ------------------------------------------------------- per lagu */

  // Dipanggil player sebelum audio.src = url. Mengembalikan true bila
  // lagu ini akan melewati graf.
  function prepare(url) {
    lastPreparedUrl = String(url || "");
    const engine = AM.Media && AM.Media.instance;
    if (!engine || typeof engine.useRouted !== "function") return false;

    if (!wantsGraph()) {
      engine.useRouted(false);
      return false;
    }
    if (!sameOriginSafe(lastPreparedUrl)) {
      // FLAC lintas-origin: rute langsung agar tetap terdengar.
      engine.useRouted(false);
      return false;
    }
    if (!graphReady()) {
      // Graf belum boleh berbunyi (belum ada gesture). Jalur langsung
      // sekarang; graf aktif setelah interaksi pertama.
      armGesture();
      engine.useRouted(false);
      return false;
    }
    engine.useRouted(true);
    applySettings();
    return true;
  }

  /* ------------------------------------------------------------ UI */

  // Teks status jujur untuk baris Pengaturan.
  function statusText() {
    if (!wantsGraph()) {
      return "Nonaktif — audio mengalir langsung ke perangkat tanpa pemrosesan.";
    }
    if (!ctx) {
      return "Graf audio akan aktif setelah kamu berinteraksi dengan halaman (aturan autoplay browser).";
    }
    if (ctx.state === "suspended" && !nodes) {
      return "Menunggu interaksi pengguna untuk mengaktifkan graf audio.";
    }
    if (!graphReady()) {
      return "Graf audio belum aktif — akan menyala untuk lagu berikutnya.";
    }
    if (!sameOriginSafe(lastPreparedUrl)) {
      return "Graf aktif. FLAC dari katalog diputar tanpa pemrosesan (server katalog tidak mengirim CORS); lagu lain tetap diproses.";
    }
    return "Graf Web Audio aktif untuk lagu saat ini.";
  }

  AM.AudioLab = {
    BANDS,
    PRESETS,
    eqGains,
    prepare,
    activate,
    applySettings,
    setBand,
    statusText,
    /** Uji dari konsol: apakah url akan lewat graf? */
    isGraphReady: graphReady,
    get lastUrl() {
      return lastPreparedUrl;
    }
  };
})(window.AM = window.AM || {});
