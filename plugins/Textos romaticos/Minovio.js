import fs, { promises } from 'fs'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) throw `» *Etiqueta al usuario que le quieres dar un chocolate*\nEjemplo:\n.darchocolate @kevin`

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

    let menu = `*@${m.sender.split("@")[0]}* 𝘭𝘦 𝘥𝘪𝘰 𝘶𝘯 𝘤𝘩𝘰𝘤𝘰𝘭𝘢𝘵𝘦 𝘢 *${text}* 🍫\n©𝘌𝘭𝘪𝘵𝘦𝘉𝘰𝘵𝘎𝘭𝘰𝘣𝘢𝘭 -`.trim()

    const vi = [
      'https://files.catbox.moe/dlnac4.jpg',
      'https://files.catbox.moe/dlnac4.jpg'
    ]
    
    let img = './src/comprar.jpg' // Ruta local a imagen

    await m.react('🍩')

    try {
      await conn.sendMessage(m.chat, {
        video: { url: vi.getRandom() },
        gifPlayback: true,
        caption: menu,
        mentions: await conn.parseMention(menu)
      }, { quoted: fkontak })
    } catch (error) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: vi.getRandom() },
          gifPlayback: false,
          caption: menu,
          mentions: await conn.parseMention(menu)
        }, { quoted: fkontak })
      } catch (error) {
        try {
          await conn.sendMessage(m.chat, {
            image: { url: img },
            gifPlayback: false,
            caption: menu,
            mentions: await conn.parseMention(menu)
          }, { quoted: fkontak })
        } catch (error) {
          try {
            await conn.sendFile(m.chat, img, 'chocolate.jpg', menu, fkontak, false, {
              mentions: await conn.parseMention(menu)
            })
          } catch (error) {
            return
          }
        }
      }
    }
  } catch (e) {
    await m.reply(
      lenguajeGB['smsMalError3']() +
      '\n*' + lenguajeGB.smsMensError1() +
      '\n' + usedPrefix + `${lenguajeGB.lenguaje() == 'es' ? 'reporte' : 'report'}` +
      '* ' + `${lenguajeGB.smsMensError2()} ` + usedPrefix + command
    )
    console.log(`❗❗ ${lenguajeGB['smsMensError2']()} ${usedPrefix + command} ❗❗`)
    console.log(e)
  }
}

handler.command = /^(darchocolate)$/i
handler.register = false
handler.group = true

export default handler
