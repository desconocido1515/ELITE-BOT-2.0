import { sticker } from '../../lib/sticker.js'
import axios from 'axios'

let handler = async (m, {
    conn,
    args,
    usedPrefix,
    command
}) => {
    let text
    if (args.length >= 1) {
        text = args.slice(0).join(" ")
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text
    } else throw `✨ *Formato incorrecto*\n\nEscribe un texto o responde a un mensaje para generar el sticker.\n\nEjemplo:\n${usedPrefix + command} Esto es genial`

    if (!text) return m.reply('✏️ *¿Olvidaste el texto?* Escribe algo para generar tu sticker.')

    // Reacción mientras genera el sticker
    if (conn.react) await conn.react(m.chat, '🛠️', m.key)

    let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://telegra.ph/file/a2ae6cbfa40f6eeea0cf1.jpg')

    const charPerLine = 40
    const lineCount = Math.ceil(text.length / charPerLine)

    const dynamicHeight = Math.min(2048, 512 + lineCount * 50)
    const dynamicWidth = Math.min(2048, 512 + Math.min(text.length, 200))

    const obj = {
        "type": "quote",
        "format": "png",
        "backgroundColor": "#000000",
        "width": dynamicWidth,
        "height": dynamicHeight,
        "scale": 2,
        "messages": [{
            "entities": [],
            "avatar": true,
            "from": {
                "id": 1,
                "name": m.name,
                "photo": {
                    "url": pp
                }
            },
            "text": text,
            "replyMessage": {}
        }]
    }

    const json = await axios.post('https://bot.lyo.su/quote/generate', obj, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const buffer = Buffer.from(json.data.result.image, 'base64')
    let stiker = await sticker(buffer, false, global.packname, global.author)
    if (stiker) return conn.sendFile(m.chat, stiker, 'Quotly.webp', '', m)
}

handler.help = ['qc']
handler.tags = ['sticker']
handler.command = /^(qc|opinion|opinión)$/i

export default handler
