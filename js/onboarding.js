// SPDX-License-Identifier: GPL-3.0-or-later
/* ==========================================================================
   onboarding.js — intro pertama & penyiapan nama panggilan
   ========================================================================== */

(function (AM) {
  "use strict";

  const U = AM.Utils;
  const L = AM.Library;

  const DONE_KEY = "onboardingDone";
  const NAME_KEY = "displayName";
  const MAX_NAME = 24;

  const INTRO = [
    {
      id: "vinyl",
      title: "Vinyl.",
      sub: "Semua musikmu, dalam satu tempat yang tenang.",
      primary: "Mulai"
    },
    {
      id: "play",
      title: 'Putar<br><span class="ob-accent">apa saja.</span>',
      sub: "Cari di YouTube, atau impor MP3, M4A, FLAC, dan WAV dari perangkatmu.",
      primary: "Lanjut"
    },
    {
      id: "stream",
      title: 'Streaming, unduh,<br><span class="ob-accent">FLAC.</span>',
      sub: "Putar langsung dari YouTube, simpan lagu untuk offline, dan nikmati audio lossless saat tersedia.",
      primary: "Lanjut"
    },
    {
      id: "lyrics",
      title: 'Lirik yang<br><span class="ob-accent">mengikuti.</span>',
      sub: "Ketuk baris mana pun untuk melompat ke bagian lagu itu.",
      primary: "Lanjut"
    },
    {
      id: "library",
      title: 'Tersimpan di<br><span class="ob-accent">perangkatmu.</span>',
      sub: "Perpustakaan, favorit, dan riwayatmu tidak butuh akun.",
      primary: "Mulai mendengarkan"
    }
  ];

  const SONGS = [
    { title: "Just enough", artist: "Hayden", time: "3:25", art: "art-just-enough.png", active: true },
    { title: "Entwined", artist: "Nora Ashford", time: "5:15", art: "art-entwined.png" },
    { title: "Rest", artist: "Owen Reed", time: "4:24", art: "art-rest.png" }
  ];

  const LYRIC_LINES = [
    { text: "Dusk falls at the road's end" },
    { text: "The city drifts to sleep" },
    { text: "We don't have to run" },
    { text: "Head home slowly", active: true },
    { text: "Let the night watch over us" }
  ];

  const LIBRARY_ROWS = [
    { icon: "user", label: "Artis" },
    { icon: "disc", label: "Album" },
    { icon: "music", label: "Lagu" },
    { icon: "heart", label: "Disukai", accent: true }
  ];

  const STREAM_FEATURES = [
    {
      icon: "disc",
      title: "Streaming FLAC",
      sub: "Audio lossless bila katalog menyediakan."
    },
    {
      icon: "download",
      title: "Unduh untuk offline",
      sub: "Simpan lagu, putar tanpa internet."
    }
  ];

  const THEMES = [
    { value: "dark", label: "Gelap", sub: "Hitam AMOLED" },
    { value: "light", label: "Terang", sub: "Latar terang" }
  ];

  const NAME_INDEX = INTRO.length;
  const THEME_INDEX = INTRO.length + 1;
  const PREVIEW_INDEX = INTRO.length + 2;

  // Cadangan bila helper sapaan di views.js belum tersedia.
  const FALLBACK_SLOTS = [
    { key: "pagi", label: "Selamat pagi", end: ".", from: 5, to: 11 },
    { key: "siang", label: "Selamat siang", end: ".", from: 11, to: 15 },
    { key: "sore", label: "Selamat sore", end: ".", from: 15, to: 19 },
    { key: "malam", label: "Selamat malam", end: ".", from: 19, to: 24 },
    { key: "larut", label: "Belum tidur", end: "?", from: 0, to: 5 }
  ];

  let layer = null;
  let els = null;
  let index = 0;
  let draft = "";
  let theme = "dark";
  let editing = false;
  let previousFocus = null;
  let handlers = {};
  let openingAudio = null;
  let openingNode = null;
  let openingTimers = [];
  let openingTarget = PREVIEW_INDEX;

  /* ------------------------------------------------------------------------
     Sapaan
     ------------------------------------------------------------------------ */

  function greetingSlots() {
    if (AM.Views && typeof AM.Views.greetingSlots === "function") {
      const slots = AM.Views.greetingSlots();
      if (Array.isArray(slots) && slots.length) return slots;
    }
    return FALLBACK_SLOTS;
  }

  function greetingSlot(hour) {
    if (AM.Views && typeof AM.Views.greetingSlot === "function") {
      return AM.Views.greetingSlot(hour);
    }
    const value = Number.isFinite(hour) ? hour : new Date().getHours();
    return (
      FALLBACK_SLOTS.find(function (slot) {
        return value >= slot.from && value < slot.to;
      }) || FALLBACK_SLOTS[3]
    );
  }

  function greetingLine(name) {
    if (AM.Views && typeof AM.Views.greetingLine === "function") {
      return AM.Views.greetingLine(name);
    }
    const slot = greetingSlot(new Date().getHours());
    const value = typeof name === "string" ? name.replace(/\s+/g, " ").trim() : "";
    return slot.label + (value ? ", " + value : "") + slot.end;
  }

  function echoLine(value) {
    const slot = greetingSlot(new Date().getHours());
    const name = normalizeName(value);
    return name ? slot.label + ", " + name + slot.end : slot.label + ", …";
  }

  /* ------------------------------------------------------------------------
     Penyimpanan
     ------------------------------------------------------------------------ */

  function normalizeName(value) {
    return String(value == null ? "" : value)
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function storedName() {
    const value = L.getSetting(NAME_KEY, "");
    return typeof value === "string" ? normalizeName(value) : "";
  }

  function isDone() {
    return !!L.getSetting(DONE_KEY, false);
  }

  /* ------------------------------------------------------------------------
     Markup ilustrasi
     ------------------------------------------------------------------------ */

  function esc(value) {
    return U.esc(value);
  }

  function vinylHTML() {
    return (
      '<div class="ob-vinyl">' +
      '<span class="ob-vinyl__halo" aria-hidden="true"></span>' +
      '<img class="ob-vinyl__record" src="/assets/onboarding/vinyl-record.svg" alt="" draggable="false">' +
      '<span class="ob-bubble ob-bubble--1" aria-hidden="true"></span>' +
      '<span class="ob-bubble ob-bubble--2" aria-hidden="true"></span>' +
      '<span class="ob-bubble ob-bubble--3" aria-hidden="true"></span>' +
      '<span class="ob-bubble ob-bubble--4" aria-hidden="true"></span>' +
      "</div>"
    );
  }

  function bubblesHTML() {
    return (
      '<span class="ob-bubble ob-bubble--corner-1" aria-hidden="true"></span>' +
      '<span class="ob-bubble ob-bubble--corner-2" aria-hidden="true"></span>'
    );
  }

  function searchHeroHTML() {
    const rows = SONGS.map(function (song) {
      return (
        '<div class="ob-song' +
        (song.active ? " is-active" : "") +
        '">' +
        '<img class="ob-song__art" src="/assets/onboarding/' +
        song.art +
        '" alt="" width="72" height="72" draggable="false">' +
        '<div class="ob-song__meta">' +
        '<span class="ob-song__title">' +
        esc(song.title) +
        "</span>" +
        '<span class="ob-song__artist">' +
        esc(song.artist) +
        "</span>" +
        "</div>" +
        '<span class="ob-song__time">' +
        esc(song.time) +
        "</span>" +
        "</div>"
      );
    }).join("");

    return (
      '<div class="ob-product">' +
      bubblesHTML() +
      '<div class="ob-card ob-card--search">' +
      '<div class="ob-search">' +
      U.svgIcon("search") +
      "<span>Cari lagu atau artis</span>" +
      "</div>" +
      rows +
      "</div>" +
      "</div>"
    );
  }

  function streamHeroHTML() {
    const rows = STREAM_FEATURES.map(function (item) {
      return (
        '<li class="ob-feature">' +
        '<span class="ob-feature__icon">' +
        U.svgIcon(item.icon) +
        "</span>" +
        '<span class="ob-feature__text">' +
        '<span class="ob-feature__title">' +
        esc(item.title) +
        "</span>" +
        '<span class="ob-feature__sub">' +
        esc(item.sub) +
        "</span>" +
        "</span>" +
        "</li>"
      );
    }).join("");

    return (
      '<div class="ob-product">' +
      bubblesHTML() +
      '<div class="ob-card ob-card--stream">' +
      '<div class="ob-stream__head">' +
      '<span class="ob-stream__icon">' +
      U.svgIcon("globe") +
      "</span>" +
      '<span class="ob-stream__meta">' +
      '<span class="ob-stream__title">Streaming online</span>' +
      '<span class="ob-stream__sub">Langsung dari YouTube, tanpa unduh</span>' +
      "</span>" +
      '<span class="ob-pill">FLAC</span>' +
      "</div>" +
      '<ul class="ob-feature-list">' +
      rows +
      "</ul>" +
      "</div>" +
      "</div>"
    );
  }

  function currentTheme() {
    const applied = document.documentElement.getAttribute("data-theme");
    if (applied === "light" || applied === "dark") return applied;
    const stored = L.getSetting("theme", "dark");
    return stored === "light" ? "light" : "dark";
  }

  function themeHeroHTML() {
    const cards = THEMES.map(function (item) {
      const active = item.value === theme;
      return (
        '<button class="ob-theme' +
        (active ? " is-active" : "") +
        '" type="button" data-ob-theme="' +
        item.value +
        '" aria-pressed="' +
        (active ? "true" : "false") +
        '">' +
        '<span class="ob-theme__preview ob-theme__preview--' +
        item.value +
        '" aria-hidden="true">' +
        '<span class="ob-theme__bar"></span>' +
        '<span class="ob-theme__row"></span>' +
        '<span class="ob-theme__row ob-theme__row--short"></span>' +
        '<span class="ob-theme__row"></span>' +
        "</span>" +
        '<span class="ob-theme__label">' +
        '<span class="ob-theme__name">' +
        esc(item.label) +
        '<span class="ob-theme__sub">' +
        esc(item.sub) +
        "</span>" +
        "</span>" +
        U.svgIcon("check", "ob-theme__check") +
        "</span>" +
        "</button>"
      );
    }).join("");

    return '<div class="ob-themes">' + cards + "</div>";
  }

  function lyricsHeroHTML() {
    return (
      '<div class="ob-product">' +
      bubblesHTML() +
      '<div class="ob-card ob-card--lyrics">' +
      '<div class="ob-lyrics__cover">' +
      '<img src="/assets/onboarding/art-heading-home.png" alt="" width="280" height="280" draggable="false">' +
      '<div class="ob-lyrics__track">' +
      '<span class="ob-lyrics__title">Heading home</span>' +
      '<span class="ob-lyrics__artist">Amber Skye</span>' +
      "</div>" +
      "</div>" +
      '<div class="ob-lyrics__lines">' +
      LYRIC_LINES.map(function (line) {
        return (
          "<p" + (line.active ? ' class="is-active"' : "") + ">" + esc(line.text) + "</p>"
        );
      }).join("") +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function libraryHeroHTML() {
    const rows = LIBRARY_ROWS.map(function (row) {
      return (
        '<li class="ob-library__row' +
        (row.accent ? " is-accent" : "") +
        '">' +
        U.svgIcon(row.icon) +
        "<span>" +
        esc(row.label) +
        "</span>" +
        "</li>"
      );
    }).join("");

    return (
      '<div class="ob-product">' +
      bubblesHTML() +
      '<div class="ob-card ob-card--library">' +
      '<div class="ob-library__head">' +
      '<span class="ob-library__device" aria-hidden="true"><span></span></span>' +
      '<div class="ob-library__id">' +
      '<span class="ob-library__title">Perpustakaan</span>' +
      '<span class="ob-library__sub">Di perangkat ini</span>' +
      "</div>" +
      "</div>" +
      '<ul class="ob-library__rows">' +
      rows +
      "</ul>" +
      "</div>" +
      "</div>"
    );
  }

  function setupHeroHTML() {
    return (
      '<div class="ob-setup">' +
      vinylHTML() +
      '<p class="ob-echo" data-ob-echo>' +
      esc(echoLine(draft)) +
      "</p>" +
      "</div>"
    );
  }

  function greetingsHeroHTML() {
    const name = draft || storedName();
    const hour = new Date().getHours();
    const now = greetingSlot(hour);
    const rows = greetingSlots()
      .map(function (slot) {
        const line = slot.label + (name ? ", " + name : "") + slot.end;
        return (
          '<div class="ob-greeting' +
          (slot.key === now.key ? " is-active" : "") +
          '">' +
          "<span>" +
          esc(line) +
          "</span>" +
          "</div>"
        );
      })
      .join("");

    return '<div class="ob-greetings">' + rows + "</div>";
  }

  function heroHTML() {
    if (isIntro()) {
      const id = INTRO[index].id;
      if (id === "vinyl") return '<div class="ob-hero-media">' + vinylHTML() + "</div>";
      if (id === "play") return searchHeroHTML();
      if (id === "stream") return streamHeroHTML();
      if (id === "lyrics") return lyricsHeroHTML();
      return libraryHeroHTML();
    }
    if (isNameStep()) return setupHeroHTML();
    if (isThemeStep()) return themeHeroHTML();
    return greetingsHeroHTML();
  }

  /* ------------------------------------------------------------------------
     Markup langkah
     ------------------------------------------------------------------------ */

  function isIntro() {
    return index >= 0 && index < INTRO.length;
  }

  function isNameStep() {
    return index === NAME_INDEX;
  }

  function isThemeStep() {
    return index === THEME_INDEX;
  }

  function isPreview() {
    return index === PREVIEW_INDEX;
  }

  function copyHTML() {
    if (isIntro()) {
      const step = INTRO[index];
      return (
        '<h1 class="ob-title" id="obTitle">' +
        step.title +
        "</h1>" +
        '<p class="ob-sub" id="obSub">' +
        esc(step.sub) +
        "</p>"
      );
    }

    if (isNameStep()) {
      return (
        '<h1 class="ob-title ob-title--setup" id="obTitle">Mau kami<br><span class="ob-accent">panggil apa?</span></h1>' +
        '<p class="ob-sub" id="obSub">Cukup nama depan atau nama panggilan. Tersimpan di perangkat ini.</p>' +
        '<form class="ob-name" data-ob="form" novalidate>' +
        '<label class="ob-name__label" for="obName">Nama panggilan</label>' +
        '<input class="ob-name__input" id="obName" name="name" type="text" inputmode="text" autocomplete="nickname" spellcheck="false" enterkeyhint="done" maxlength="48" placeholder="Nama kamu" value="' +
        esc(draft) +
        '" aria-describedby="obNameHint">' +
        '<p class="ob-name__hint" id="obNameHint" data-ob-error role="alert" hidden></p>' +
        "</form>"
      );
    }

    if (isThemeStep()) {
      return (
        '<h1 class="ob-title ob-title--setup" id="obTitle">Pilih tampilan<br><span class="ob-accent">favoritmu.</span></h1>' +
        '<p class="ob-sub" id="obSub">Bisa diganti kapan saja di Pengaturan → Tampilan.</p>'
      );
    }

    const name = draft || storedName() || "kamu";
    return (
      '<h1 class="ob-title ob-title--setup" id="obTitle">Senang bertemu<br>denganmu, <span class="ob-accent">' +
      esc(name) +
      ".</span></h1>" +
      '<p class="ob-sub" id="obSub">Begini Vinyl akan menyapamu.</p>'
    );
  }

  function dotsHTML() {
    if (!isIntro()) return "";
    return (
      '<div class="ob-dots" aria-hidden="true">' +
      INTRO.map(function (_, dotIndex) {
        return '<span class="ob-dot' + (dotIndex === index ? " is-active" : "") + '"></span>';
      }).join("") +
      "</div>"
    );
  }

  function controlsHTML() {
    let primary = "Lanjut";
    let secondary = "";
    let secondaryAction = "skip";

    if (isIntro()) {
      primary = INTRO[index].primary;
      secondary = "Lewati";
    } else if (isNameStep()) {
      primary = "Lanjut";
      secondary = "Lewati dulu";
    } else if (isThemeStep()) {
      primary = "Lanjut";
    } else {
      primary = "Mulai";
      secondary = "Ganti nama";
      secondaryAction = "change-name";
    }

    return (
      '<div class="ob-actions">' +
      '<button class="ob-btn ob-btn--primary" type="button" data-ob-action="next">' +
      esc(primary) +
      "</button>" +
      (secondary
        ? '<button class="ob-btn ob-btn--text ' +
          (secondaryAction === "change-name" ? "ob-change-name" : "ob-skip-desktop") +
          '" type="button" data-ob-action="' +
          secondaryAction +
          '">' +
          esc(secondary) +
          "</button>"
        : "") +
      "</div>" +
      dotsHTML()
    );
  }

  /* ------------------------------------------------------------------------
     Opening di awal penyiapan
     ------------------------------------------------------------------------ */

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function openingMarkup() {
    return (
      '<div class="ob-opening__glow" aria-hidden="true"></div>' +
      '<div class="ob-opening__stage">' +
      '<div class="ob-opening__disc">' +
      '<img class="ob-opening__record" src="/assets/onboarding/vinyl-record.svg" alt="" draggable="false">' +
      '<span class="ob-opening__ring" aria-hidden="true"></span>' +
      "</div>" +
      '<p class="ob-opening__word">Vinyl<span>.</span></p>' +
      "</div>"
    );
  }

  function primeOpeningAudio() {
    if (openingAudio) return openingAudio;
    try {
      openingAudio = new Audio("/assets/onboarding/opening.mp3");
      openingAudio.preload = "auto";
      openingAudio.volume = 0.9;
      openingAudio.setAttribute("playsinline", "");
      openingAudio.setAttribute("aria-hidden", "true");
      openingAudio.style.display = "none";
      // iOS Safari lebih konsisten bila elemennya benar-benar ada di halaman.
      if (document.body) document.body.appendChild(openingAudio);
    } catch (error) {
      openingAudio = null;
    }
    return openingAudio;
  }

  function playOpeningAudio() {
    const audio = primeOpeningAudio();
    if (!audio) return;
    try {
      audio.currentTime = 0;
      const started = audio.play();
      if (started && typeof started.catch === "function") {
        started.catch(function () {
          /* Autoplay ditolak; opening tetap berjalan tanpa suara. */
        });
      }
    } catch (error) {
      /* Audio tidak tersedia. */
    }
  }

  function fadeOpeningAudio() {
    const audio = openingAudio;
    if (!audio || audio.paused) return;
    const target = audio.volume;
    let step = 0;
    const timer = window.setInterval(function () {
      step += 1;
      try {
        audio.volume = Math.max(0, target * (1 - step / 5));
      } catch (error) {
        /* abaikan */
      }
      if (step >= 5) {
        window.clearInterval(timer);
        try {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0.9;
        } catch (error) {
          /* abaikan */
        }
      }
    }, 60);
  }

  function clearOpeningTimers() {
    openingTimers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    openingTimers = [];
  }

  function endOpening(early) {
    const node = openingNode;
    if (!node || !layer) return;
    openingNode = null;
    clearOpeningTimers();
    if (early) fadeOpeningAudio();
    // Langkah berikutnya sudah disiapkan di balik lapisan yang memudar.
    goTo(openingTarget);
    node.classList.add("is-leaving");
    openingTimers.push(
      window.setTimeout(function () {
        node.remove();
      }, 720)
    );
  }

  function startOpening(target) {
    if (!layer || openingNode) return;
    openingTarget = typeof target === "number" ? target : PREVIEW_INDEX;
    if (reducedMotion()) {
      goTo(openingTarget);
      return;
    }

    const node = document.createElement("div");
    node.className = "ob-opening";
    node.setAttribute("aria-hidden", "true");
    node.innerHTML = openingMarkup();
    layer.appendChild(node);
    openingNode = node;

    // Ketuk sekali untuk melewati pembukaan.
    node.addEventListener("pointerdown", function () {
      endOpening(true);
    });

    // Paksa reflow supaya transisi masuk benar-benar berjalan.
    void node.offsetWidth;
    node.classList.add("is-active");
    playOpeningAudio();

    openingTimers.push(
      window.setTimeout(function () {
        endOpening(false);
      }, 3080)
    );
  }

  /* ------------------------------------------------------------------------
     Render & transisi
     ------------------------------------------------------------------------ */

  function animateIn() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    [els.copy, els.hero].forEach(function (node) {
      node.classList.remove("is-in");
      // Paksa reflow agar animasi bisa diputar ulang di langkah berikutnya.
      void node.offsetWidth;
      node.classList.add("is-in");
    });
  }

  function focusStep() {
    if (!layer) return;
    if (isNameStep()) {
      const input = els.copy.querySelector("#obName");
      if (input) {
        input.focus({ preventScroll: true });
        const length = input.value.length;
        try {
          input.setSelectionRange(length, length);
        } catch (error) {
          /* input tidak mendukung seleksi */
        }
      }
      return;
    }
    layer.focus({ preventScroll: true });
  }

  function validateName(input) {
    if (!input) return;
    const clean = normalizeName(input.value);
    const error = clean.length > MAX_NAME ? "Maksimal " + MAX_NAME + " karakter." : "";
    input.classList.toggle("is-invalid", !!error);
    input.setAttribute("aria-invalid", error ? "true" : "false");

    const hint = els.copy.querySelector("[data-ob-error]");
    if (hint) {
      hint.hidden = !error;
      hint.textContent = error;
    }

    const next = els.controls.querySelector('[data-ob-action="next"]');
    if (next) next.disabled = !clean || !!error;
  }

  function updateEcho() {
    const echo = els.hero.querySelector("[data-ob-echo]");
    if (echo) echo.textContent = echoLine(draft);
  }

  function render(initial) {
    if (!layer) return;
    els.copy.innerHTML = copyHTML();
    els.controls.innerHTML = controlsHTML();
    els.hero.innerHTML = heroHTML();

    const input = isNameStep() ? els.copy.querySelector("#obName") : null;
    if (input) validateName(input);

    els.skipMobile.hidden = isPreview() || isThemeStep();
    els.skipMobile.textContent = isNameStep() ? "Lewati dulu" : "Lewati";

    if (!initial) {
      animateIn();
      layer.scrollTop = 0;
    }
    focusStep();
  }

  /* ------------------------------------------------------------------------
     Navigasi langkah
     ------------------------------------------------------------------------ */

  function goTo(nextIndex) {
    index = Math.max(0, Math.min(nextIndex, PREVIEW_INDEX));
    render(false);
  }

  function next() {
    if (isIntro()) {
      // Pembukaan diputar sekali di awal penyiapan, saat pengguna menekan "Mulai".
      if (index === 0) {
        startOpening(1);
        return;
      }
      goTo(index + 1);
      return;
    }

    if (isNameStep()) {
      const input = els.copy.querySelector("#obName");
      const clean = normalizeName(input ? input.value : draft);
      if (!clean || clean.length > MAX_NAME) {
        validateName(input);
        if (input) input.focus({ preventScroll: true });
        return;
      }
      draft = clean;
      // Saat mengubah nama dari Pengaturan, tema tidak perlu ditanyakan lagi.
      goTo(editing ? PREVIEW_INDEX : THEME_INDEX);
      return;
    }

    if (isThemeStep()) {
      goTo(PREVIEW_INDEX);
      return;
    }

    if (isPreview()) finish(draft);
  }

  function skip() {
    if (isIntro()) {
      draft = "";
      goTo(NAME_INDEX);
      return;
    }

    if (isNameStep()) {
      if (editing) {
        close();
        return;
      }
      finish("");
    }
  }

  /* ------------------------------------------------------------------------
     Selesai & tutup
     ------------------------------------------------------------------------ */

  async function finish(name) {
    const clean = normalizeName(name);
    try {
      if (clean) await L.setSetting(NAME_KEY, clean);
      await L.setSetting(DONE_KEY, true);
    } catch (error) {
      console.warn("[onboarding] gagal menyimpan nama", error);
    }

    const done = handlers.onComplete;
    close();
    if (typeof done === "function") {
      try {
        done({ name: clean });
      } catch (error) {
        console.warn("[onboarding] callback selesai gagal", error);
      }
    }
  }

  function close() {
    if (!layer) return;
    const node = layer;
    layer = null;
    els = null;
    draft = "";
    editing = false;
    clearOpeningTimers();
    if (openingNode) {
      openingNode.remove();
      openingNode = null;
    }
    fadeOpeningAudio();
    document.documentElement.classList.remove("has-onboarding");
    node.classList.add("is-closing");
    window.setTimeout(function () {
      node.remove();
    }, 240);
    if (previousFocus && document.contains(previousFocus) && typeof previousFocus.focus === "function") {
      previousFocus.focus({ preventScroll: true });
    }
    previousFocus = null;
  }

  /* ------------------------------------------------------------------------
     Event
     ------------------------------------------------------------------------ */

  function selectTheme(value) {
    const picked = value === "light" ? "light" : "dark";
    if (picked === theme) return;
    theme = picked;
    // Halaman penyiapan ikut berganti gelap/terang saat tema dipilih.
    if (layer) layer.classList.toggle("is-light", theme === "light");
    els.hero.querySelectorAll("[data-ob-theme]").forEach(function (button) {
      const active = button.dataset.obTheme === theme;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    if (typeof handlers.onThemeSelect === "function") {
      handlers.onThemeSelect(theme);
    }
  }

  function onClick(event) {
    const langButton = event.target.closest("[data-ob-lang]");
    if (langButton) {
      if (AM.I18n && typeof AM.I18n.setLanguage === "function") {
        AM.I18n.setLanguage(langButton.dataset.obLang === "id" ? "id" : "en");
      }
      syncLangButtons();
      return;
    }

    const themeButton = event.target.closest("[data-ob-theme]");
    if (themeButton) {
      selectTheme(themeButton.dataset.obTheme);
      return;
    }

    const target = event.target.closest("[data-ob-action]");
    if (!target || target.disabled) return;
    const action = target.dataset.obAction;
    if (action === "next") {
      next();
    } else if (action === "skip") {
      skip();
    } else if (action === "change-name") {
      draft = draft || storedName();
      goTo(NAME_INDEX);
    }
  }

  function onInput(event) {
    const input = event.target;
    if (!input || input.id !== "obName") return;
    draft = input.value;
    validateName(input);
    updateEcho();
  }

  function onKeydown(event) {
    if (!layer) return;

    if (
      openingNode &&
      (event.key === "Escape" || event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      endOpening(true);
      return;
    }

    if (event.key === "Escape") {
      if (editing) {
        event.preventDefault();
        close();
      }
      return;
    }

    if (event.key !== "Tab") return;
    const focusables = Array.from(
      layer.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (node) {
      return node.offsetParent !== null;
    });
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onSubmit(event) {
    if (event.target && event.target.matches('[data-ob="form"]')) {
      event.preventDefault();
      next();
    }
  }

  /* ------------------------------------------------------------------------
     Buka & init
     ------------------------------------------------------------------------ */

  function syncLangButtons() {
    if (!layer) return;
    const lang = AM.I18n && typeof AM.I18n.language === "function" ? AM.I18n.language() : "en";
    layer.querySelectorAll("[data-ob-lang]").forEach(function (button) {
      const active = button.dataset.obLang === lang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function build() {
    layer = document.createElement("div");
    layer.className = "onboarding";
    layer.tabIndex = -1;
    layer.setAttribute("role", "dialog");
    layer.setAttribute("aria-modal", "true");
    layer.setAttribute("aria-labelledby", "obTitle");
    layer.setAttribute("aria-describedby", "obSub");
    layer.innerHTML =
      '<div class="onboarding__aura" aria-hidden="true"></div>' +
      '<button class="onboarding__skip" type="button" data-ob-action="skip">Lewati</button>' +
      '<div class="onboarding__lang" role="group" aria-label="Bahasa">' +
      '<button class="onboarding__lang-btn" type="button" data-ob-lang="en">EN</button>' +
      '<button class="onboarding__lang-btn" type="button" data-ob-lang="id">ID</button>' +
      "</div>" +
      '<div class="onboarding__stage">' +
      '<div class="onboarding__hero" data-ob="hero"></div>' +
      '<div class="onboarding__copy">' +
      '<div class="onboarding__copy-main" data-ob="copy"></div>' +
      '<div class="onboarding__controls" data-ob="controls"></div>' +
      "</div>" +
      "</div>";

    document.body.appendChild(layer);
    els = {
      hero: layer.querySelector('[data-ob="hero"]'),
      copy: layer.querySelector('[data-ob="copy"]'),
      controls: layer.querySelector('[data-ob="controls"]'),
      skipMobile: layer.querySelector(".onboarding__skip")
    };

    layer.addEventListener("click", onClick);
    layer.addEventListener("input", onInput);
    layer.addEventListener("keydown", onKeydown);
    layer.addEventListener("submit", onSubmit);
    syncLangButtons();
  }

  function open(options) {
    if (layer) return;
    const opts = options || {};
    editing = opts.start === "name";
    index = editing ? NAME_INDEX : 0;
    draft = editing ? storedName() : "";
    theme = currentTheme();
    previousFocus = document.activeElement;
    if (!editing && !reducedMotion()) primeOpeningAudio();

    build();
    layer.classList.toggle("is-light", theme === "light");
    document.documentElement.classList.add("has-onboarding");
    render(true);
    window.requestAnimationFrame(function () {
      focusStep();
    });
  }

  function init(options) {
    handlers = options || {};
    if (isDone()) return false;
    open({ start: "intro" });
    return true;
  }

  AM.Onboarding = {
    init,
    open,
    getName: storedName,
    isDone
  };
})(window.AM = window.AM || {});
