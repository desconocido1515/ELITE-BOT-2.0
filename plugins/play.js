import yts from 'yt-search'
import ytdl from 'ytdl-core'

let handler = async (m, { conn, text, args }) => {
  if (!text) return m.reply("🍃 Ingresa el texto de lo que quieres buscar")

  // Buscar en YouTube
  const ytres = await search(args.join(" "))
  if (!ytres.length) return m.reply("🍃 No se encontraron resultados para tu búsqueda.")

  const video = ytres[0]
  const infoTxt = `🎬 *Título*: ${video.title}
⏱️ *Duración*: ${video.timestamp}
📅 *Publicado*: ${video.ago}
📺 *Canal*: ${video.author.name || 'Desconocido'}
🔗 *Url*: ${video.url}`

  // Enviar miniatura
  await conn.sendFile(m.chat, video.image, 'thumbnail.jpg', infoTxt, m)

  try {
    const audioStream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' })

    await conn.sendMessage(
      m.chat,
      {
        audio: audioStream,
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`
      },
      { quoted: m }
    )
  } catch (err) {
    console.error(err)
    m.reply(`❌ No pude descargar el audio.\n${err.message}`)
  }
}

handler.command = /^(play)$/i
export default handler

async function search(query) {
  const result = await yts.search({ query, hl: "es", gl: "ES" })
  return result.videos || []
}
