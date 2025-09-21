/*import fs from 'fs'
import fetch from 'node-fetch'

let handler = m => m

handler.before = async function (m, { conn, participants, groupMetadata, isBotAdmin }) {
  if (!m.messageStubType || !m.isGroup) return

  // Foto predeterminada en ruta local
  const FOTO_PREDETERMINADA = './src/sinfoto2.jpg'

  let pp
  try {
    // Intentar obtener la foto de perfil del usuario
    pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => null)
  } catch {
    pp = null
  }

  let img
  if (pp) {
    try {
      img = await (await fetch(pp)).buffer()
    } catch {
      img = null
    }
  }

  if (!img) {
    // Si no hay imagen externa, usa la imagen local
    try {
      img = fs.readFileSync(FOTO_PREDETERMINADA)
    } catch {
      img = null // Si tampoco existe la imagen local
    }
  }

  let usuario = `@${m.sender.split`@`[0]}`
  let chat = global.db.data.chats[m.chat]
  let users = participants.map(u => conn.decodeJid(u.id))

  if (chat.welcome && m.messageStubType == 27 && this.user.jid != global.conn.user.jid) {
    let subject = groupMetadata.subject
    let descs = groupMetadata.desc || "Sin descripción"
    let userName = `${m.messageStubParameters[0].split`@`[0]}`
    let defaultWelcome = `*╔══════════════*
*╟* 𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗢/𝗔
*╠══════════════*
*╟*🛡️ *${subject}*
*╟*👤 *@${userName}*
*╟* 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗖𝗜𝗢́𝗡 

${descs}

*╟* ¡🇼‌🇪‌🇱‌🇨‌🇴‌🇲‌🇪!
*╚══════════════*`

    let textWel = chat.sWelcome ? chat.sWelcome
      .replace(/@user/g, `@${userName}`)
      .replace(/@group/g, subject)
      .replace(/@desc/g, descs)
      : defaultWelcome

    await this.sendMessage(m.chat, { 
      image: img,
      caption: textWel,
      contextInfo: {
        mentionedJid: [m.sender, m.messageStubParameters[0]]
      }
    }, { quoted: m })
  }

  else if (chat.welcome && m.messageStubType == 28 && this.user.jid != global.conn.user.jid) {
    let subject = groupMetadata.subject
    let userName = `${m.messageStubParameters[0].split`@`[0]}`
    let defaultBye = `*╔══════════════*
*╟* *SE FUE UNA BASURA*
*╟*👤 @${userName}* 
*╚══════════════*`

    let textBye = chat.sBye ? chat.sBye
      .replace(/@user/g, `@${userName}`)
      .replace(/@group/g, subject)
      : defaultBye

    await this.sendMessage(m.chat, { 
      image: img,
      caption: textBye,
      contextInfo: {
        mentionedJid: [m.sender, m.messageStubParameters[0]]
      }
    }, { quoted: m })
  }
}

export default handler
*/
