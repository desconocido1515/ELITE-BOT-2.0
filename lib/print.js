import { WAMessageStubType } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'

const terminalImage = global.opts['img'] ? require('terminal-image') : ''
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

// Función para traducir messageStubType a texto legible
async function formatMessageStubType(stubType, user) {
  const map = {
    2: 'Grupo eliminado',
    21: 'Nombre de grupo cambiado',
    22: 'Foto de grupo cambiada',
    23: 'Enlace de grupo restablecido',
    24: 'Descripción de grupo cambiada',
    25: 'Configuración del grupo ajustada',
    26: 'Mensajes restringidos',
    29: 'Administrador agregado',
    30: 'Administrador removido',
    145: 'Aprobación de miembros activada',
    171: 'Modo de añadir miembros',
  }
  return map[stubType] || `Tipo de stub desconocido (${stubType})`
}

// Función alternativa simple
async function formaTxtStub(text) {
  return text || 'Desconocido'
}

export default async function printMessage(m, conn = { user: {} }) {
  let _name = await conn.getName(m.sender)
  let sender = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international') + (_name ? ' ~' + _name : '')
  let chat = await conn.getName(m.chat)
  let img
  try {
    if (global.opts['img'])
      img = /sticker|image/gi.test(m.mtype) ? await terminalImage.buffer(await m.download()) : false
  } catch (e) {
    console.error(e)
  }

  console.log(`
╭━━━━━━━━━━━━━━𖡼
┃ ❖ Bot: ${chalk.cyan.bold('Elite Bot Global')} 
┃ ❖ Chat: ${chalk.green.bold(chat)}
┃ ❖ Acción: ${m.messageStubType ? await formatMessageStubType(m.messageStubType, _name) : (m.text || 'Mensaje normal')}
┃ ❖ Usuario: ${chalk.white(sender)}
┃ ❖ Texto: ${m.text ? chalk.white(m.text) : ''}
╰━━━━━━━━━━━━━━𖡼`.trim())

  if (img) console.log(img.trimEnd())

  if (m.mentionedJid) {
    for (let user of m.mentionedJid) {
      console.log('Mencionado:', chalk.blueBright('@' + (await conn.getName(user))))
    }
  }

  if (/document/i.test(m.mtype)) console.log(`📄 ${m.msg.fileName || m.msg.displayName || 'Document'}`)
  else if (/contact/i.test(m.mtype)) console.log(`👨 ${m.msg.displayName || ''}`)
  else if (/audio/i.test(m.mtype)) {
    const duration = m.msg.seconds
    console.log(`${m.msg.ptt ? '🎤 (PTT ' : '🎵 (AUDIO)'} ${Math.floor(duration / 60).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')})`)
  }

  console.log()
}

let file = global.__filename(import.meta.url)
watchFile(file, () => {
  console.log(chalk.redBright("Update 'lib/print.js'"))
})
