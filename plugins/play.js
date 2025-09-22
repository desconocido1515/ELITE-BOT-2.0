import fetch from "node-fetch";
import yts from "yt-search";

// Función para probar varias APIs
async function fetchFromApis(apis) {
  for (const { api, endpoint, extractor } of apis) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(endpoint, { signal: controller.signal }).then(r => r.json());
      clearTimeout(timeout);
      const link = extractor(res);
      if (link) return { url: link, api };
    } catch (e) {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return null;
}

// APIs disponibles (funcionales)
async function getAud(url) {
  const apis = [
    { api: 'ZenzzXD', endpoint: `https://zenzxz.my.id/downloader/ytmp3?url=${encodeURIComponent(url)}`, extractor: res => res.download_url },
    { api: 'ZenzzXD v2', endpoint: `https://zenzxz.my.id/downloader/ytmp3v2?url=${encodeURIComponent(url)}`, extractor: res => res.download_url }, 
    { api: 'Vreden', endpoint: `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`, extractor: res => res.result?.download?.url },
    { api: 'Delirius', endpoint: `https://api.delirius.my.id/download/ymp3?url=${encodeURIComponent(url)}`, extractor: res => res.data?.download?.url }
  ];
  return await fetchFromApis(apis);
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.trim()) {
    throw `⭐ 𝘌𝘯𝘷𝘪𝘢 𝘦𝘭 𝘯𝘰𝘮𝘣𝘳𝘦 𝘥𝘦 𝘭𝘢 𝘤𝘢𝘯𝘤𝘪ó𝘯\n\n» 𝘌𝘫𝘦𝘮𝘱𝘭𝘰: ${usedPrefix + command} Bad Bunny - Monaco`;
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

    // Buscar canción
    const searchResults = await yts({ query: text.trim(), hl: 'es', gl: 'ES' });
    const video = searchResults.videos[0];
    if (!video) throw new Error("No se encontró el video");

    // Límite de duración (10 min)
    if (video.seconds > 600) {
      throw "❌ El audio es muy largo (máximo 10 minutos)";
    }

    // Miniatura del video
    const thumb = (await conn.getFile(video.thumbnail)).data;

    // Enviar preview con imagen + texto
    await conn.sendMessage(m.chat, { 
      image: thumb, 
      caption: `01:27 ━━━━━⬤────── 05:48
*⇄ㅤ      ◁        ❚❚        ▷        ↻*
╴𝗘𝗹𝗶𝘁𝗲 𝗕𝗼𝘁 𝗚𝗹𝗼𝗯𝗮𝗹

🎶 *${video.title}*
📺 Canal: ${video.author.name}
⏱ Duración: ${video.timestamp}
👀 Vistas: ${video.views.toLocaleString()}
🔗 ${video.url}`
    }, { quoted: m });

    // Obtener audio usando APIs nuevas
    let audioData = await getAud(video.url);
    if (!audioData?.url) throw "⚠️ Error al procesar el audio. Intenta con otra canción";

    // Avisar qué servidor funcionó
    await m.reply(`> ❀ *Audio procesado. Servidor:* \`${audioData.api}\``);

    // Enviar audio
    await conn.sendMessage(m.chat, {
      audio: { url: audioData.url },
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

handler.command = ['play', 'playaudio', 'ytmusic', 'yta', 'ytmp3'];
handler.exp = 0;
export default handler;
