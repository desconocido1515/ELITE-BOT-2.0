import yts from "yt-search";
import fetch from "node-fetch";

const getAud = async (id) => {
  try {
    const res = await fetch(`https://widipe.com/download/ytdl?id=${id}`);
    const json = await res.json();
    if (!json.status || !json.result || !json.result.url) return null;
    return json.result;
  } catch {
    return null;
  }
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `⚠️ Ingresa el nombre de la canción.\n\n📌 Ejemplo: *${usedPrefix + command}* shape of you`;

  await m.react("🎶");

  const { videos } = await yts(text);
  if (!videos || !videos.length) throw "⚠️ No encontré resultados.";

  const video = videos[0];
  const audio = await getAud(video.videoId);

  if (!audio) throw "⚠️ Error al procesar el audio. Intenta con otra canción.";

  // Enviar miniatura + info
  const thumb = (await conn.getFile(video.thumbnail)).data;
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

  // Enviar audio
  await conn.sendMessage(m.chat, { 
    audio: { url: audio.url }, 
    mimetype: "audio/mpeg" 
  }, { quoted: m });

  await m.react("✅");
};

handler.help = ["play"].map(v => v + " <nombre>");
handler.tags = ["downloader"];
handler.command = /^play$/i;

export default handler;
