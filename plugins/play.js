
import fetch from "node-fetch";
import yts from "yt-search";
import axios from "axios";

// ─ Función principal con oceansaver
const ddownr = {
  download: async (url, format) => {
    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    };
    const response = await axios.request(config);
    if (response.data && response.data.success) {
      const { id } = response.data;
      const downloadUrl = await ddownr.cekProgress(id);
      return downloadUrl;
    }
    throw new Error("Fallo al obtener detalles del video.");
  },
  cekProgress: async (id) => {
    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    };
    while (true) {
      const response = await axios.request(config);
      if (response.data && response.data.success && response.data.progress === 1000) {
        return response.data.download_url;
      }
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  }
};

// ─ APIs de respaldo
const apisExtra = [
  {
    name: "vreden",
    fetchUrl: async (url) => {
      const res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      return data?.result?.download?.url || null;
    }
  },
  {
    name: "zenkey",
    fetchUrl: async (url) => {
      const res = await fetch(`https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${encodeURIComponent(url)}`);
      const data = await res.json();
      return data?.result?.download?.url || null;
    }
  },
  {
    name: "axeel",
    fetchUrl: async (url) => {
      const res = await fetch(`https://axeel.my.id/api/download/audio?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      return data?.result?.url || data?.result?.download || null;
    }
  }
];

// ─ Handler
const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.trim()) {
    throw `⭐ 𝘌𝘯𝘷𝘪𝘢 𝘦𝘭 𝘯𝘰𝘮𝘣𝘳𝘦 𝘥𝘦 𝘭𝘢 𝘤𝘢𝘯𝘤𝘪ó𝘯\n\n» 𝘌𝘫𝘦𝘮𝘱𝘭𝘰: ${usedPrefix + command} Bad Bunny - Monaco`;
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

    // Buscar en YouTube
    const searchResults = await yts({ query: text.trim(), hl: 'es', gl: 'ES' });
    const video = searchResults.videos[0];
    if (!video) throw new Error("No se encontró el video");

    // Limite de duración
    if (video.seconds > 600) {
      throw "❌ El audio es muy largo (máximo 10 minutos)";
    }

    // Preview
    await conn.sendMessage(m.chat, {
      text: `01:27 ━━━━━⬤────── 05:48\n*⇄ㅤ      ◁        ❚❚        ▷        ↻*\n╴𝗘𝗹𝗶𝘁𝗲 𝗕𝗼𝘁 𝗚𝗹𝗼𝗯𝗮𝗹`,
      contextInfo: {
        externalAdReply: {
          title: video.title.slice(0, 60),
          body: "",
          thumbnailUrl: video.thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true,
          sourceUrl: video.url
        }
      }
    }, { quoted: m });

    // Descargar audio
    let audioUrl;
    try {
      audioUrl = await ddownr.download(video.url, "mp3");
    } catch (e) {
      console.error("Oceansaver falló:", e.message);
      for (let api of apisExtra) {
        try {
          audioUrl = await api.fetchUrl(video.url);
          if (audioUrl) break;
        } catch {}
      }
    }

    if (!audioUrl) throw "⚠️ Error al procesar el audio. Intenta con otra canción";

    // Enviar audio
    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      fileName: `${video.title.slice(0, 30)}.mp3`.replace(/[^\w\s.-]/gi, ''),
      ptt: false
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error:", error);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    
    const errorMsg = typeof error === 'string' ? error : 
      `❌ *Error:* ${error.message || 'Ocurrió un problema'}\n\n` +
      `🔸 *Posibles soluciones:*\n` +
      `• Verifica el nombre de la canción\n` +
      `• Intenta con otro tema\n` +
      `• Prueba más tarde`;
      
    await conn.sendMessage(m.chat, { text: errorMsg }, { quoted: m });
  }
};

handler.command = ['play', 'playaudio', 'ytmusic'];
handler.exp = 0;
export default handler;
