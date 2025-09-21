import fs, { promises } from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) throw `🍽️ *¡Ups! Olvidaste mencionar al usuario con el que quieres cenar!* 🌹\n\n✨ *Ejemplo:*\n\n.cenar @kevin`

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

    let menu = `━━━━━━━━━━━━━━━━━━\n🍕 *@${m.sender.split("@")[0]}* 𝘵𝘪𝘦𝘯𝘦 𝘶𝘯𝘢 𝘤𝘦𝘯𝘢 𝘳𝘰𝘮𝘢𝘯𝘵𝘪𝘤𝘢 𝘤𝘰𝘯 *${text}* 🍷\n\n💖 *¡Que la cena sea deliciosa y romántica!*✨\n\n━━━━━━━━━━━━━━━━━━\n©𝘌𝘭𝘪𝘵𝘦𝘉𝘰𝘵𝘎𝘭𝘰𝘣𝘢𝘭 -`.trim()

    const img = './src/cenar.jpg'  // Cambié el video por una imagen, usa la ruta de tu imagen

    await m.react('🍽️')

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

handler.command = /^(cenar)$/i
handler.register = false
handler.group = true

export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
