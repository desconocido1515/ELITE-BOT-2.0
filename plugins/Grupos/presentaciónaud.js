/*let handler = m => m

handler.before = async function (m, { conn, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return
  if (m.messageStubType !== 20) return // 20 = Creación de grupo

  let botName = conn.user.name // Obtiene el nombre de la cuenta del bot
  let audioPath = './Audios/presentacion1.mp3' // Ruta del archivo de audio local

  // Texto opcional para enviar junto con el audio
  let welcomeBotText = `🥇 ¡𝗛𝗢𝗟𝗔 𝗚𝗥𝗨𝗣𝗢!🥇  
¡Soy ${botName}, su nuevo asistente digital!`

  // Enviar el audio
  await conn.sendMessage(m.chat, { 
    audio: { url: audioPath }, // Ruta al archivo de audio
    mimetype: 'audio/mpeg', // Tipo MIME para archivos MP3
    ptt: true // Si deseas que el audio se envíe como nota de voz (opcional)
  }, { quoted: m })
}

export default handler
*/
