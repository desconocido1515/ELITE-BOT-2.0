import fs, { promises } from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) throw `🎶 *¡Oops! Olvidaste mencionar al usuario con quien quieres bailar!* 💃\n\n✨ *Ejemplo:*\n\n.dance @kevin`

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

    let menu = `━━━━━━━━━━━━━━━━━━\n🎉 *¡@${m.sender.split("@")[0]} está bailando con* *${text}* 💃🏻🕺🏻✨\n\n🎶 *¡Que suene la música y a disfrutar!* 🎶\n\n💖 *Que el ritmo los acompañe* 💖\n\n━━━━━━━━━━━━━━━━━━\n©𝘌𝘭𝘪𝘵𝘦𝘉𝘰𝘵𝘎𝘭𝘰𝘣𝘢𝘭 -`.trim()

    const img = './src/baile.jpg'  // Cambié el video por una imagen, usa la ruta de tu imagen

    await m.react('💃🏻')

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
      `${lenguajeGB['smsMalError3']()} 💥\n*Algo salió mal, pero no te preocupes* 🛠️\n\n💬 *Puedes reportar el error usando el comando:* ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'reporte' : 'report'}\n\n❌ *Te ayudaremos a solucionarlo.*`
    )
    console.log(`❗❗ ${lenguajeGB['smsMensError2']()} ${usedPrefix + command} ❗❗`)
    console.log(e)
  }
}

handler.command = /^(bailar)$/i
handler.register = false
handler.group = true

export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
