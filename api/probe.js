// Probe sementara: menguji instance Invidious/Piped dari region Vercel.
// Dihapus setelah instance pengganti dipilih.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const INVIDIOUS = [
  "yt.chocolatemoo53.com",
  "yewtu.be",
  "inv.nadeko.net",
  "invidious.nerdvpn.de",
  "invidious.f5.si",
  "iv.melmac.space",
  "inv.tux.pizza",
  "invidious.jing.rocks",
  "invidious.privacyredirect.com",
  "yt.artemislena.eu",
  "invidious.materialio.us",
  "iv.datura.network",
  "invidious.dhusch.de",
  "invidious.reallyaweso.me",
  "yt.private.coffee",
  "invidious.protokolla.fi"
];

const PIPED = [
  "pipedapi.kavin.rocks",
  "pipedapi.adminforge.de",
  "api.piped.private.coffee",
  "pipedapi.reallyaweso.me",
  "pipedapi.ducks.party"
];

async function readHead(response, limit) {
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader();
  const parts = [];
  let taken = 0;
  try {
    while (taken < limit) {
      const { done, value } = await reader.read();
      if (done) break;
      const take = Math.min(value.byteLength, limit - taken);
      parts.push(Buffer.from(value.subarray(0, take)));
      taken += take;
      if (take < value.byteLength) break;
    }
  } finally {
    try {
      await reader.cancel();
    } catch (error) {
      /* abaikan */
    }
  }
  return Buffer.concat(parts);
}

async function timed(fn, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  const started = Date.now();
  try {
    return await fn(controller.signal, started);
  } finally {
    clearTimeout(timer);
  }
}

async function probeInvidious(host, video, itag) {
  return timed(async (signal, started) => {
    try {
      const response = await fetch(
        "https://" + host + "/latest_version?id=" + video + "&itag=" + itag + "&local=true",
        {
          signal,
          redirect: "follow",
          headers: { Range: "bytes=0-1023", "User-Agent": UA, Accept: "*/*" }
        }
      );
      const body = await readHead(response, 256);
      return {
        host,
        status: response.status,
        ms: Date.now() - started,
        type: response.headers.get("content-type"),
        range: response.headers.get("content-range"),
        bytes: body.length,
        head: body.subarray(0, 60).toString("utf8").replace(/\s+/g, " ")
      };
    } catch (error) {
      return { host, error: String(error.name || error.message), ms: Date.now() - started };
    }
  }, 12000);
}

async function probePiped(host, video) {
  return timed(async (signal, started) => {
    try {
      const response = await fetch("https://" + host + "/streams/" + video, {
        signal,
        headers: { "User-Agent": UA, Accept: "application/json" }
      });
      const text = await response.text();
      let audio = [];
      try {
        const data = JSON.parse(text);
        audio = (data.audioStreams || []).map((s) => ({
          mime: s.mimeType,
          bitrate: s.bitrate,
          url: String(s.url || "").slice(0, 90)
        }));
      } catch (error) {
        /* bukan JSON */
      }
      return {
        host,
        status: response.status,
        ms: Date.now() - started,
        audio: audio.slice(0, 4),
        snippet: audio.length ? "" : text.slice(0, 100).replace(/\s+/g, " ")
      };
    } catch (error) {
      return { host, error: String(error.name || error.message), ms: Date.now() - started };
    }
  }, 12000);
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const video = /^[A-Za-z0-9_-]{11}$/.test(String(req.query.video || ""))
    ? String(req.query.video)
    : "dQw4w9WgXcQ";
  const itag = Number(req.query.itag) || 251;
  const mode = String(req.query.mode || "all");

  const tasks = [];
  if (mode !== "piped") {
    tasks.push(
      Promise.all(INVIDIOUS.map((host) => probeInvidious(host, video, itag))).then((items) => ({
        invidious: items
      }))
    );
  }
  if (mode !== "invidious") {
    tasks.push(
      Promise.all(PIPED.map((host) => probePiped(host, video))).then((items) => ({ piped: items }))
    );
  }
  const results = Object.assign({}, ...(await Promise.all(tasks)));
  res.json(results);
};
