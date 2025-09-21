import chalk from 'chalk'
import fetch from 'node-fetch'
import ws from 'ws'
let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync} from 'fs'
import path from 'path'

let handler = m => m

handler.before = async function (m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return

    // Plantilla de contacto para citas
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "AlienMenu"
        },
        message: {
            locationMessage: {
                name: "𝙀𝙡𝙞𝙩𝙚 𝘽𝙤𝙩 𝙂𝙡𝙤𝙗𝙖𝙡",
                jpegThumbnail: await (await fetch('https://files.catbox.moe/1j784p.jpg')).buffer(),
                vcard:
                    "BEGIN:VCARD\n" +
                    "VERSION:3.0\n" +
                    "N:;Sasuke;;;\n" +
                    "FN:Sasuke Bot\n" +
                    "ORG:Barboza Developers\n" +
                    "TITLE:\n" +
                    "item1.TEL;waid=19709001746:+1 (970) 900-1746\n" +
                    "item1.X-ABLabel:Alien\n" +
                    "X-WA-BIZ-DESCRIPTION:🛸 Llamado grupal universal con estilo.\n" +
                    "X-WA-BIZ-NAME:Sasuke\n" +
                    "END:VCARD"
            }
        },
        participant: "0@s.whatsapp.net"
    }

    let chat = global.db.data.chats[m.chat]
    let usuario = `@${m.sender.split`@`[0]}`
    let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://files.catbox.moe/xr2m6u.jpg'

    // Mensajes predefinidos
    let nombre = `✨ ${usuario} *ha cambiado el nombre del grupo* ✨\n\n> 📝 *Nuevo nombre:* _${m.messageStubParameters[0]}_`
    let foto = `📸 *¡Nueva foto de grupo!* 📸\n\n> 💫 Acción realizada por: ${usuario}`
    let newlink = `🔗 *¡El enlace del grupo ha sido restablecido!* 🔗\n\n> 💫 Acción realizada por: ${usuario}`
    let admingp = `👑 @${m.messageStubParameters[0].split`@`[0]} *¡Ahora es administrador del grupo!* 👑\n\n> 💫 Acción realizada por: ${usuario}`
    let noadmingp = `🗑️ @${m.messageStubParameters[0].split`@`[0]} *ha dejado de ser administrador del grupo.* 🗑️\n\n> 💫 Acción realizada por: ${usuario}`

    // Permisos del grupo
    let permisoEnviar = m.messageStubParameters[0] === 'on'
        ? `🔇 ${usuario} ha cambiado la configuración: *solo los administradores pueden enviar mensajes*`
        : `💬 ${usuario} ha cambiado la configuración: *todos los miembros pueden enviar mensajes*`

    let permisoAgregar = m.messageStubParameters[0] === 'on'
        ? `🔒 ${usuario} ha cambiado la configuración: *solo los administradores pueden agregar miembros*`
        : `🔓 ${usuario} ha cambiado la configuración: *todos los miembros pueden agregar miembros*`

    let permisoEditarInfo = m.messageStubParameters[0] === 'on'
        ? `⚙️ ${usuario} ha cambiado la configuración: *solo los administradores pueden editar info del grupo*`
        : `📝 ${usuario} ha cambiado la configuración: *todos los miembros pueden editar info del grupo*`

    // Detectar los tipos de eventos
    if (!chat.detect) return

    switch (m.messageStubType) {
        case 21: // Cambio de nombre
            await this.sendMessage(m.chat, { text: nombre, mentions: [m.sender] }, { quoted: fkontak })
            break
        case 22: // Cambio de foto
            await this.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [m.sender] }, { quoted: fkontak })
            break
        case 23: // Restablecimiento de enlace
            await this.sendMessage(m.chat, { text: newlink, mentions: [m.sender] }, { quoted: fkontak })
            break
        case 25: // Cambios de configuración
            await this.sendMessage(m.chat, { text: permisoAgregar, mentions: [m.sender] }, { quoted: fkontak })
            break
        case 26: // Cerrado / abierto mensajes
            await this.sendMessage(m.chat, { text: permisoEnviar, mentions: [m.sender] }, { quoted: fkontak })
            break
        case 29: // Nuevo admin
            await this.sendMessage(m.chat, { text: admingp, mentions: [`${m.sender}`, `${m.messageStubParameters[0]}`] }, { quoted: fkontak })
            break
        case 30: // Admin eliminado
            await this.sendMessage(m.chat, { text: noadmingp, mentions: [`${m.sender}`, `${m.messageStubParameters[0]}`] }, { quoted: fkontak })
            break
        default:
            console.log({
                messageStubType: m.messageStubType,
                messageStubParameters: m.messageStubParameters,
                type: WAMessageStubType[m.messageStubType],
            })
            break
    }
}

export default handler
