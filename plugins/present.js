let handler = m => m

handler.before = async function (m, { conn, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return
  if (m.messageStubType !== 20) return // 20 = bot agregado al grupo

  let botName = conn.user.name
  let audioPath = './Audios/presentacion1.mp3'

  let welcomeBotText = `🥇 ¡𝗛𝗢𝗟𝗔 𝗚𝗥𝗨𝗣𝗢!🥇  
¡Soy ${botName}, su nuevo asistente digital!  
━━━━━━━━━━━━━━━━━━━  
⚡ *Mis funciones :*  
▸  Descargar música/videos  
▸  Búsquedas en Google  
▸  Juegos y diversión  
▸  Generar imágenes con IA  
▸  Herramientas para Free Fire  
━━━━━━━━━━━━━━━━━━━  
📂 *Mis menús:*  
▸  .menu → *Menú general*  
▸  .menuimg → *Imágenes AI*  
▸  .menuhot → *Contenido hot*  
▸  .menuaudios → *Efectos*  
▸  .menujuegos → *Juegos grupales*  
▸  .menufreefire → *Free Fire tools*  
━━━━━━━━━━━━━━━━━━━  
©EliteBotGlobal 2023`

  // Enviar texto (sin quoted para evitar errores)
  await conn.sendMessage(m.chat, {
    text: welcomeBotText
  })

  // Enviar audio
  await conn.sendMessage(m.chat, {
    audio: { url: audioPath },
    mimetype: 'audio/mpeg',
    ptt: true
  })
}

export default handler
