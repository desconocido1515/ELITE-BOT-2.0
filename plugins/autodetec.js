import fetch from 'node-fetch'
import { WAMessageStubType } from '@whiskeysockets/baileys'

let handler = m => m

// Función para obtener el jid real dentro del grupo
const getRealJid = async (jid, chatId, conn) => {
  if (!jid?.endsWith?.('@lid')) return jid
  const group = await conn.groupMetadata(chatId)
  const member = group.participants.find(p => p.jid.includes(jid.split('@')[0]))
  return member ? member.jid : jid
}

handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.messageStubType) return

  const chat = global.db.data.chats[m.chat]
  if (!chat.detect) return

  const usuario = '@' + m.sender.split('@')[0]
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch(() => null) || 'https://files.catbox.moe/xr2m6u.jpg'

  // Contacto para citar
  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "AlienMenu"
    },
    message: {
      locationMessage: {
        name: "𝙀𝙡𝙞𝙩𝙚 𝘽𝙤𝙩 𝙂𝙡𝙤𝙗𝙖𝙡 2023 -",
        jpegThumbnail: Buffer.from(await (await fetch('https://files.catbox.moe/1j784p.jpg')).arrayBuffer()),
        vcard:
          "BEGIN:VCARD\n" +
          "VERSION:3.0\n" +
          "N:;Sasuke;;;\n" +
          "FN:Sasuke Bot\n" +
          "ORG:Barboza Developers\n" +
          "TITLE:\n" +
          "item1.TEL;waid=19709001746:+1 (970) 900-1746\n" +
          "item1.X-ABLabel:Alien\n" +
          "X-WA-BIZ-DESCRIPTION:🛸 Llamado grupal universal con estilo.\n" +
          "X-WA-BIZ-NAME:Sasuke\n" +
          "END:VCARD"
      }
    },
    participant: "0@s.whatsapp.net"
  }

  // Obtener jid real del participante si aplica
  const stubUser = m.messageStubParameters?.[0] 
    ? await getRealJid(m.messageStubParameters[0], m.chat, conn) 
    : null

  // Mensajes
  const nombre = `✨ ${usuario} *ha cambiado el nombre del grupo* ✨\n\n> 📝 *Nuevo nombre:* _${m.messageStubParameters?.[0] || ''}_`
  const foto = `📸 *¡Nueva foto de grupo!* 📸\n\n> 💫 Acción realizada por: ${usuario}`
  const edit = `⚙️ ${usuario} ha ajustado la configuración del grupo.\n\n> 🔒 Ahora *${m.messageStubParameters?.[0] == 'on' ? 'solo los administradores' : 'todos'}* pueden configurar el grupo.`
  const newlink = `🔗 *¡El enlace del grupo ha sido restablecido!* 🔗\n\n> 💫 Acción realizada por: ${usuario}`
  const status = `❱❱ 𝗢́𝗥𝗗𝗘𝗡𝗘𝗦 𝗥𝗘𝗖𝗜𝗕𝗜𝗗𝗔𝗦 ❰❰\n\n👤 ${m.messageStubParameters?.[0] == 'on' ? '𝗖𝗘𝗥𝗥𝗔𝗗𝗢' : '𝗔𝗕𝗜𝗘𝗥𝗧𝗢'} 𝗣𝗢𝗥 ${usuario}\n\n> 💬 Ahora *${m.messageStubParameters?.[0] == 'on' ? 'solo los administradores' : 'todos'}* pueden enviar mensajes.`
  const admingp = `❱❱ 𝙁𝙀𝙇𝙄𝘾𝙄𝘿𝘼𝘿𝙀𝙎 ❰❰\n\n👤 @${stubUser?.split('@')[0]}\n» 𝘼𝙃𝙊𝙍𝘼 𝙀𝙎 𝘼𝘿𝙈𝙄𝙉.\n\n» 𝘼𝘾𝘾𝙄𝙊́𝙉 𝙍𝙀𝘼𝙇𝙄𝙕𝘼𝘿𝘼 𝙋𝙊𝙍:\n${usuario}`
  const noadmingp = `❱❱ 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝘾𝙄𝙊́𝙉 ❰❰\n\n👤 @${stubUser?.split('@')[0]}\n» 𝙔𝘼 𝙉𝙊 𝙀𝙎 𝘼𝘿𝙈𝙄𝙉.\n\n» 𝘼𝘾𝘾𝙄𝙊́𝙉 𝙍𝙀𝘼𝙇𝙄𝙕𝘼𝘿𝘼 𝙋𝙊𝙍:\n${usuario}`
  const descChange = `📝 ${usuario} ha cambiado la descripción del grupo.\n\n> 🔹 Nueva descripción: _${m.messageStubParameters?.[0] || ''}_`

  // Detectar tipos de stubs
  switch (m.messageStubType) {
    case WAMessageStubType.GROUP_CHANGE_NAME:
      await conn.sendMessage(m.chat, { text: nombre, mentions: [m.sender] }, { quoted: fkontak })
      break
    case WAMessageStubType.GROUP_CHANGE_ICON:
      await conn.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [m.sender] }, { quoted: fkontak })
      break
    case WAMessageStubType.GROUP_CHANGE_ANNOUNCE:
      await conn.sendMessage(m.chat, { text: status, mentions: [m.sender] }, { quoted: fkontak })
      break
    case WAMessageStubType.GROUP_CHANGE_RESTRICT:
      await conn.sendMessage(m.chat, { text: edit, mentions: [m.sender] }, { quoted: fkontak })
      break
    case WAMessageStubType.GROUP_CHANGE_INVITE_LINK:
      await conn.sendMessage(m.chat, { text: newlink, mentions: [m.sender] }, { quoted: fkontak })
      break
    case WAMessageStubType.GROUP_PARTICIPANT_PROMOTE:
      await conn.sendMessage(m.chat, { text: admingp, mentions: [m.sender, stubUser] }, { quoted: fkontak })
      break
    case WAMessageStubType.GROUP_PARTICIPANT_DEMOTE:
      await conn.sendMessage(m.chat, { text: noadmingp, mentions: [m.sender, stubUser] }, { quoted: fkontak })
      break
    case WAMessageStubType.GROUP_CHANGE_DESCRIPTION: // ✅ Nuevo agregado
      await conn.sendMessage(m.chat, { text: descChange, mentions: [m.sender] }, { quoted: fkontak })
      break
    default:
      console.log({
        messageStubType: m.messageStubType,
        messageStubParameters: m.messageStubParameters,
        type: WAMessageStubType[m.messageStubType],
      })
  }
}

export default handler
