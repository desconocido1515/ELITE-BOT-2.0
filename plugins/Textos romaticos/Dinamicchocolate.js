import fs, { promises } from 'fs'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) throw `🌟 *¡Oops! Olvidaste mencionar al usuario!*\n➡️ *Etiqueta al usuario que le quieres dar un chocolate* 🍫\n\n✨ *Ejemplo:*\n\n.darchocolate @kevin`

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

    let img = './src/chocolate.jpg'
    let menu = `━━━━━━━━━━━━━━━━━━\n🎉 *¡Felicidades, @${m.sender.split("@")[0]}!* 🎉\n\n🍫 *¡Le diste un delicioso chocolate* 𝘢 *${text}* 🤩\n\n💖 *Disfrútalo con mucho amor* 💖\n\n✨ *¡Qué dulce momento!* ✨\n\n━━━━━━━━━━━━━━━━━━\n©𝘌𝘭𝘪𝘵𝘦𝘉𝘰𝘵𝘎𝘭𝘰𝘣𝘢𝘭 -`.trim()

    await m.react('🍩')

    await conn.sendMessage(m.chat, {
      image: { url: img },
      caption: menu,
      mentions: await conn.parseMention(menu)
    }, { quoted: fkontak })

  } catch (e) {
    await m.reply(
      `${lenguajeGB['smsMalError3']()} 💥\n*Algo salió mal, pero no te preocupes!* 🛠️\n\n💬 *Puedes reportar el error usando el comando:* ${usedPrefix}${lenguajeGB.lenguaje() == 'es' ? 'reporte' : 'report'}\n\n❌ *Te ayudaremos a solucionarlo.*\n`
    )
    console.log(`❗❗ ${lenguajeGB['smsMensError2']()} ${usedPrefix + command} ❗❗`)
    console.log(e)
  }
}

handler.command = /^(darchocolate)$/i
handler.register = false
handler.group = true

export default handler
