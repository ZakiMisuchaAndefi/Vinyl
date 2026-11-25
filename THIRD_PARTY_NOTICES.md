# Third-Party Notices

Dokumen ini mencantumkan komponen pihak ketiga yang dibundel, disalin, atau dijadikan referensi port di dalam repositori **Vinyl**, beserta layanan eksternal yang hanya diakses melalui jaringan.

---

## 1. Komponen Pihak Ketiga yang Dibundel atau Di-port

### Inter
- **Repositori:** https://github.com/rsms/inter
- **Lisensi:** SIL Open Font License 1.1 (OFL-1.1)
- **Pemegang Hak Cipta:** Copyright (c) 2016 The Inter Project Authors
- **Berkas di repositori:** `assets/fonts/InterVariable.woff2`, `assets/fonts/LICENSE-Inter.txt` (dirujuk oleh `css/base.css`)

```text
Copyright (c) 2016 The Inter Project Authors (https://github.com/rsms/inter)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL

-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION AND CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```

---

### pinyin-pro
- **Repositori:** https://github.com/zh-lx/pinyin-pro
- **Lisensi:** MIT License
- **Pemegang Hak Cipta:** Copyright (c) 2021-present zh-lx
- **Berkas di repositori:** `js/vendor/pinyin-pro.js` (dibundel dalam format UMD/minified dan dimuat lewat `index.html`)

```text
MIT License

Copyright (c) 2021-present zh-lx

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

### tombulled/innertube (Referensi Klien InnerTube)
- **Repositori:** https://github.com/tombulled/innertube
- **Lisensi:** MIT License
- **Pemegang Hak Cipta:** Copyright (c) Tom Bulled & contributors
- **Berkas di repositori:** `api/_innertube.js` (klien InnerTube ringan yang ditulis dengan merujuk pada `tombulled/innertube`; juga terkait dengan pemanggilan endpoint InnerTube di `api/_lib.js`)

```text
MIT License

Copyright (c) Tom Bulled

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 2. Dependensi npm (Desktop & Analitik Web)

Dependensi berikut dipasang melalui npm (`package.json`) dan tidak disalin secara manual ke direktori sumber repositori:

- **Electron** (https://github.com/electron/electron) — MIT License
- **electron-builder** (https://github.com/electron-userland/electron-builder) — MIT License
- **electron-updater** (https://github.com/electron-userland/electron-builder/tree/master/packages/electron-updater) — MIT License
- **@vercel/analytics** (https://github.com/vercel/analytics) — MIT License

---

## 3. Layanan Eksternal yang Hanya Dipakai Lewat Jaringan (Tanpa Kode yang Dibundel)

Berdasarkan hasil audit kode di `js/`, `api/`, `electron/`, `assets/`, `css/`, dan `build/`, layanan-layanan berikut **hanya diakses lewat permintaan jaringan (HTTP/REST API)** saat aplikasi berjalan. **Tidak ada kode sumber atau biner dari layanan-layanan ini yang disalin atau dibundel ke dalam repositori Vinyl.**

- **Invidious (Instance Publik)** — https://github.com/iv-org/invidious (AGPL-3.0)
  - Dipakai pada versi web melalui permintaan HTTP ke instance publik (lihat `api/_invidious.js`, `api/health.js`, dan `js/youtube.js`). Tidak ada kode Invidious yang disalin atau dibundel ke repo ini.
- **Tracks / Monochrome** — https://tracks.monochrome.st / https://github.com/monochrome-music/monochrome (Apache-2.0)
  - Dipakai melalui permintaan HTTP API publik `tracks.monochrome.st` (`/search/tracks`, `/track/<id>`) di `api/_lossless.js` dan `js/lossless.js`. Tidak ada kode Monochrome yang disalin atau dibundel ke repo ini.
- **LRCLIB** — https://lrclib.net / https://github.com/tranxuanthang/lrclib (MIT)
  - Dipakai melalui permintaan REST API publik `https://lrclib.net/api/search` di `js/lyrics.js`. Tidak ada kode LRCLIB yang disalin atau dibundel ke repo ini.
- **YouTube / YouTube Music / Google Video**
  - Dipakai sebagai sumber pencarian dan streaming eksternal melalui HTTP API/stream. Tidak ada kode kepemilikan YouTube/Google yang dibundel ke repo ini.
