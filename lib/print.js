import { WAMessageStubType } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'

const terminalImage = global.opts['img'] ? await import('terminal-image') : null
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

export default async function printMessage(m, conn = { user: {} }) {
  try {
    const _name = await conn.getName(m.sender)
    const senderNumber = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international')
    const sender = _name ? `${senderNumber} ~${_name}` : senderNumber
    const chatName = await conn.getName(m.chat)

    // Imágenes (opcional)
    let img = null
    if (global.opts['img'] && /sticker|image/gi.test(m.mtype)) {
      try {
        img = await terminalImage.buffer(await m.download())
      } catch (e) {
        console.error(chalk.red('Error descargando la imagen:'), e)
      }
    }

    // Tamaño de archivo o longitud de mensaje
    const filesize = m.msg?.vcard?.length ||
      m.msg?.fileLength?.low ||
      m.msg?.axolotlSenderKeyDistributionMessage?.length ||
      m.text?.length || 0

    console.log(chalk.yellow.bgMagenta.bold('Elite Bot Global'),
                chalk.blue('Mensaje de:'), chalk.green(sender))

    if (img) console.log(img.trimEnd())

    if (typeof m.text === 'string' && m.text) {
      let log = m.text.replace(/\u200e+/g, '')

      // Formato Markdown básico
      const mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~])(.+?)\1|```((?:.||[\n\r])+?)```)(?=\S?(?:[\s\n]|$))/g
      const mdFormat = (depth = 4) => (_, type, text, monospace) => {
        const types = { _: 'italic', '*': 'bold', '~': 'strikethrough' }
        text = text || monospace
        return (!types[type] || depth < 1) ? text : chalk[types[type]](text.replace(mdRegex, mdFormat(depth - 1)))
      }
      log = log.replace(mdRegex, mdFormat(4))
      
      // Resaltar URLs
      log = log.replace(urlRegex, url => chalk.blueBright(url))

      // Menciones
      if (m.mentionedJid?.length) {
        for (const jid of m.mentionedJid) {
          const name = await conn.getName(jid)
          log = log.replace('@' + jid.split('@')[0], chalk.cyan('@' + name))
        }
      }

      console.log(m.error ? chalk.red(log) : m.isCommand ? chalk.yellow(log) : log)
    }

    // Mensajes de sistema / stubs
    if (m.messageStubParameters?.length) {
      const stubLog = await Promise.all(
        m.messageStubParameters.map(async jid => {
          jid = conn.decodeJid(jid)
          const name = await conn.getName(jid)
          return chalk.gray(`${PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')} ~${name || ''}`)
        })
      )
      console.log(stubLog.join(', '))
    }

    // Tipos de archivo
    if (/document/i.test(m.mtype)) console.log(`📄 ${m.msg.fileName || m.msg.displayName || 'Document'}`)
    else if (/ContactsArray/i.test(m.mtype)) console.log('👨‍👩‍👧‍👦 Contactos')
    else if (/contact/i.test(m.mtype)) console.log(`👤 ${m.msg.displayName || 'Contacto'}`)
    else if (/audio/i.test(m.mtype)) {
      const duration = m.msg.seconds || 0
      const timeStr = `${Math.floor(duration/60).toString().padStart(2,'0')}:${(duration%60).toString().padStart(2,'0')}`
      console.log(`${m.msg.ptt ? '🎤 (PTT)' : '🎵 (Audio)'} Duración: ${timeStr}`)
    }

    console.log() // línea en blanco al final
  } catch (err) {
    console.error(chalk.red('❌ Error en printMessage:'), err)
  }
}

// Auto recarga al cambiar el archivo
const file = global.__filename(import.meta.url)
watchFile(file, () => console.log(chalk.redBright("Archivo 'lib/print.js' actualizado")))
