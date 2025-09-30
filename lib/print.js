import { WAMessageStubType } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'

const terminalImage = global.opts['img'] ? require('terminal-image') : ''
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

export default async function printMessage(m, conn = { user: {} }) {
  try {
    // Nombre del remitente
    let _name = await conn.getName(m.sender)
    let sender = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international') + (_name ? ' ~' + _name : '')
    let chatName = await conn.getName(m.chat)

    // Imagen para consola si está habilitada
    let img
    try {
      if (global.opts['img'])
        img = /sticker|image/gi.test(m.mtype) ? await terminalImage.buffer(await m.download()) : false
    } catch (e) {
      console.error(e)
    }

    // Mensaje
    let logText = typeof m.text === 'string' ? m.text.replace(/\u200e+/g, '') : ''

    if (m.mentionedJid) {
      for (let userJid of m.mentionedJid)
        logText = logText.replace('@' + userJid.split`@`[0], chalk.blueBright('@' + await conn.getName(userJid)))
    }

    // Acción (stub)
    const mid = { idioma_code: 'es' } // o setear según tu lógica
    const accion = mid.idioma_code === 'es'
      ? await formatMessageStubType(m.messageStubType, sender)
      : await formaTxtStub(WAMessageStubType[m.messageStubType])
    const tipoMensaje = m.mtype || 'Desconocido'
    const horario = new Date().toLocaleString()

    // Consola principal
    console.log(`
╭━━━━━━━━━━━━━━𖡼
┃ ❖ ${chalk.white.bold('Bot:')} ${chalk.cyan.bold('Elite Bot Global')}
┃ ❖ ${chalk.white.bold(mid.idioma_code === 'es' ? 'Horario:' : 'Schedule:')} ${chalk.black.bgGreen(horario)}
┃ ❖ ${chalk.white.bold(mid.idioma_code === 'es' ? 'Acción:' : 'Action:')} ${accion}
┃ ❖ ${chalk.white.bold(mid.idioma_code === 'es' ? 'Usuario:' : 'User:')} ${sender}
┃ ❖ ${chalk.white.bold(mid.idioma_code === 'es' ? 'Tipo de mensaje:' : 'Type of message')} ${chalk.bgBlueBright.bold(`[${tipoMensaje}]`)}
╰━━━━━━━━━━━━━━𖡼
`.trim())

    if (img) console.log(img.trimEnd())
    if (logText) console.log(logText)
    if (m.messageStubParameters) {
      console.log(m.messageStubParameters.map(jid => {
        jid = conn.decodeJid(jid)
        let name = conn.getName(jid)
        return chalk.gray(PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international') + (name ? ' ~' + name : ''))
      }).join(', '))
    }

    if (/document/i.test(m.mtype)) console.log(`📄 ${m.msg.fileName || m.msg.displayName || 'Document'}`)
    else if (/ContactsArray/i.test(m.mtype)) console.log(`👨‍👩‍👧‍👦`)
    else if (/contact/i.test(m.mtype)) console.log(`👨 ${m.msg.displayName || ''}`)
    else if (/audio/i.test(m.mtype)) {
      const duration = m.msg.seconds
      console.log(`${m.msg.ptt ? '🎤 (PTT ' : '🎵 (AUDIO) '} ${Math.floor(duration / 60).toString().padStart(2, 0)}:${(duration % 60).toString().padStart(2, 0)}`)
    }

    console.log()

  } catch (e) {
    console.error('❌ Error en printMessage:', e)
  }
}

// Actualización automática
let file = global.__filename(import.meta.url)
watchFile(file, () => {
  console.log(chalk.redBright("Update 'lib/print.js'"))
})
