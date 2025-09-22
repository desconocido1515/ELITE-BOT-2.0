import chalk from 'chalk'
import fetch from 'node-fetch'
import ws from 'ws'
let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync} from 'fs'
import path from 'path'

let handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata}) {
    if (!m.messageStubType || !m.isGroup) return

    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "EliteGamingBot"
        },
        message: {
            locationMessage: {
                name: "Elite Gaming Bot",
                jpegThumbnail: await (await fetch('https://files.catbox.moe/1j784p.jpg')).buffer(),
                vcard:
                    "BEGIN:VCARD\n" +
                    "VERSION:3.0\n" +
                    "N:;EliteGaming;;;\n" +
                    "FN:Elite Gaming Bot\n" +
                    "ORG:Barboza Developers\n" +
                    "TITLE:\n" +
                    "item1.TEL;waid=19709001746:+1 (970) 900-1746\n" +
                    "item1.X-ABLabel:Elite\n" +
                    "X-WA-BIZ-DESCRIPTION:Bot de gestión de grupo profesional.\n" +
                    "X-WA-BIZ-NAME:Elite Gaming\n" +
                    "END:VCARD"
            }
        },
        participant: "0@s.whatsapp.net"
    }

    let chat = global.db.data.chats[m.chat]
    let usuario = `@${m.sender.split`@`[0]}`
    let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg')

    // Textos profesionales estilo gaming
    let nombre = `📌 El usuario ${usuario} ha actualizado el nombre del grupo.\n\n> Nuevo nombre del grupo: _${m.messageStubParameters[0]}_`
    let foto = `📷 Se ha cambiado la foto del grupo.\n\n> Acción realizada por: ${usuario}`
    let edit = `⚙️ ${usuario} ha modificado la configuración del grupo.\n\n> Ahora ${m.messageStubParameters[0] == 'on'? 'solo los administradores': 'todos'} pueden ajustar la configuración.`
    let newlink = `🔗 El enlace de invitación del grupo ha sido restablecido.\n\n> Acción realizada por: ${usuario}`
    let status = `🛡️ El estado del grupo ha sido actualizado por ${usuario}.\n\n> El grupo ahora está ${m.messageStubParameters[0] == 'on'? 'cerrado': 'abierto'} y ${m.messageStubParameters[0] == 'on'? 'solo administradores': 'todos'} pueden enviar mensajes.`
    let admingp = `👑 ${m.messageStubParameters[0].split`@`[0]} ha sido promovido a administrador.\n\n> Acción realizada por: ${usuario}`
    let noadmingp = `❌ ${m.messageStubParameters[0].split`@`[0]} ha sido removido como administrador.\n\n> Acción realizada por: ${usuario}`

    // Envió de mensajes según tipo
    if (chat.detect && m.messageStubType == 21) {
        await this.sendMessage(m.chat, { text: nombre, mentions: [m.sender]}, { quoted: fkontak})
    } else if (chat.detect && m.messageStubType == 22) {
        await this.sendMessage(m.chat, { image: { url: pp}, caption: foto, mentions: [m.sender]}, { quoted: fkontak})
    } else if (chat.detect && m.messageStubType == 23) {
        await this.sendMessage(m.chat, { text: newlink, mentions: [m.sender]}, { quoted: fkontak})
    } else if (chat.detect && m.messageStubType == 25) {
        await this.sendMessage(m.chat, { text: edit, mentions: [m.sender]}, { quoted: fkontak})
    } else if (chat.detect && m.messageStubType == 26) {
        await this.sendMessage(m.chat, { text: status, mentions: [m.sender]}, { quoted: fkontak})
    } else if (chat.detect && m.messageStubType == 29) {
        await this.sendMessage(m.chat, { text: admingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`]}, { quoted: fkontak})
    } else if (chat.detect && m.messageStubType == 30) {
        await this.sendMessage(m.chat, { text: noadmingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`]}, { quoted: fkontak})
    } else {
        console.log({
            messageStubType: m.messageStubType,
            messageStubParameters: m.messageStubParameters,
            type: WAMessageStubType[m.messageStubType],
        })
    }
}

export default handler
