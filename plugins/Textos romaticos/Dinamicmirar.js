import fs, { promises } from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) throw `🌠 *¿Con quién deseas mirar las estrellas?*\n\n✨ *Ejemplo:*\n\n.mirar @kevin`

  try {
    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
    let fkontak = {
      "key": { "participants": "0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" },
      "message": {
        "contactMessage": {
          "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
        }
      },
      "participant": "0@s.whatsapp.net"
    }

    let menu = `━━━━━━━━━━━━━━━━━━\n🌌 *@${m.sender.split("@")[0]}* 𝘦𝘴𝘵𝘢 𝘮𝘪𝘳𝘢𝘯𝘥𝘰 𝘭𝘢𝘴 𝘦𝘴𝘵𝘳𝘦𝘭𝘭𝘢𝘴 𝘤𝘰𝘯 *${text}* 💫\n\n🌙 *Noche perfecta para soñar juntos...* ✨\n━━━━━━━━━━━━━━━━━━\n©𝘌𝘭𝘪𝘵𝘦𝘉𝘰𝘵𝘎𝘭𝘰𝘣𝘢𝘭 -`.trim()

    const img = './src/mirar.jpg' // Imagen personalizada para este comando

    await m.react('🌃')

    try {
      await conn.sendMessage(m.chat, {
        image: { url: img },
        caption: menu,
        mentions: await conn.parseMention(menu)
      }, { quoted: fkontak })
    } catch (error) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: gataMenu.getRandom() },
          caption: menu,
          mentions: await conn.parseMention(menu)
        }, { quoted: fkontak })
      } catch (error) {
        try {
          await conn.sendMessage(m.chat, {
            image: gataImg.getRandom(),
            caption: menu,
            mentions: await conn.parseMention(menu)
          }, { quoted: fkontak })
        } catch (error) {
          try {
            await conn.sendFile(m.chat, imagen5, 'menu.jpg', menu, fkontak, false, { mentions: await conn.parseMention(menu) })
          } catch (error) {
            return
          }
        }
      }
    }

  } catch (e) {
    await m.reply(
      `${lenguajeGB['smsMalError3']()} 🌠\n*Hubo un error inesperado.*\n\n💬 *Por favor repórtalo con:* ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'reporte' : 'report'}`
    )
    console.log(`❗❗ ${lenguajeGB['smsMensError2']()} ${usedPrefix + command} ❗❗`)
    console.log(e)
  }
}

handler.command = /^(mirar)$/i
handler.register = false
handler.group = true

export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
