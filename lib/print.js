import { WAMessageStubType } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'
import '../config.js'

const terminalImage = global.opts['img'] ? require('terminal-image') : ''
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

export default async function printMessage(m, conn = { user: {} }) {
    // Nombre y número del remitente
    const senderName = await conn.getName(m.sender) || 'Anónimo'
    const senderNumber = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international')
    const senderDisplay = `${senderNumber}${senderName ? ' ~' + senderName : ''}`

    // Detectar si el mensaje viene de subbot o principal
    const botName = conn.user?.name || 'Bot Principal'
    const botTag = conn.user?.jid !== global.conn.user?.jid ? ' 【𝗦𝗨𝗕 𝗕𝗢𝗧】' : ''
    const botDisplay = `${botName}${botTag}`

    // Obtener chat
    const chatName = await conn.getName(m.chat)

    // Imagen opcional
    let img = ''
    try {
        if (global.opts['img'] && /sticker|image/gi.test(m.mtype)) 
            img = await terminalImage.buffer(await m.download())
    } catch (e) {
        console.error(e)
    }

    // Construir mensaje dentro de la caja
    let messageLines = []
    if (m.text) {
        let log = m.text.replace(/\u200e+/g, '')
        const mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~`])(?!`)(.+?)\1|```((?:.|[\n\r])+?)```|`([^`]+?)`)(?=\S?(?:[\s\n]|$))/g
        const mdFormat = (depth = 4) => (_, type, text, monospace) => {
            const types = { _: 'italic', '*': 'bold', '~': 'strikethrough', '`': 'bgGray' }
            text = text || monospace
            return !types[type] || depth < 1 ? text : chalk[types[type]](text.replace(mdRegex, mdFormat(depth - 1)))
        }
        log = log.replace(mdRegex, mdFormat(4))
        log = log.replace(urlRegex, url => chalk.blueBright(url))
        messageLines = log.split('\n').map(line => `┃ ${line}`)
    }

    console.log(`
╭━━━━━━━━━━━━━━𖡼
┃ ❖ ${chalk.white.bold('Bot:')} ${chalk.cyan.bold(botDisplay)}
┃ ❖ ${chalk.white.bold('Usuario:')} ${chalk.white(senderDisplay)}
┃ ❖ ${chalk.white.bold('Chat:')} ${chatName}
${messageLines.join('\n')}
╰━━━━━━━━━━━━━━𖡼
`.trim())

    if (img) console.log(img.trimEnd())
}
