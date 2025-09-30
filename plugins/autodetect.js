import chalk from 'chalk'
import fetch from 'node-fetch'
import { promises as fs, existsSync, mkdirSync } from 'fs'
import path from 'path'
import { WAMessageStubType } from '@whiskeysockets/baileys'

let handler = m => m

handler.before = async function (m, { conn }) {
    if (!m.isGroup) return

    const chat = global.db.data.chats[m.chat]
    if (!chat.detect) return

    // Contacto para citar
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "AlienMenu"
        },
        message: {
            locationMessage: {
                name: "𝙀𝙡𝙞𝙩𝙚 𝘽𝙤𝙩 𝙂𝙡𝙤𝙗𝙖𝙡 2023 -",
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

    const usuario = '@' + m.sender.split('@')[0]
    let pp = await conn.profilePictureUrl(m.chat, 'image').catch(() => null) || 'https://files.catbox.moe/xr2m6u.jpg'

    // Mensajes predefinidos
    const nombre = `✨ ${usuario} *ha cambiado el nombre del grupo* ✨\n\n> 📝 *Nuevo nombre:* _${m.messageStubParameters?.[0] || ''}_`
    const foto = `📸 *¡Nueva foto de grupo!* 📸\n\n> 💫 Acción realizada por: ${usuario}`
    const edit = `⚙️ ${usuario} ha ajustado la configuración del grupo.\n\n> 🔒 Ahora *${m.messageStubParameters?.[0] == 'on'? 'solo los administradores': 'todos'}* pueden configurar el grupo.`
    const newlink = `🔗 *¡El enlace del grupo ha sido restablecido!* 🔗\n\n> 💫 Acción realizada por: ${usuario}`
    const status = `❱❱ 𝗢́𝗥𝗗𝗘𝗡𝗘𝗦 𝗥𝗘𝗖𝗜𝗕𝗜𝗗𝗔𝗦 ❰❰\n\n👤 ${m.messageStubParameters?.[0] == 'on'? '𝗖𝗘𝗥𝗥𝗔𝗗𝗢': '𝗔𝗕𝗜𝗘𝗥𝗧𝗢'} 𝗣𝗢𝗥 ${usuario}\n\n> 💬 Ahora *${m.messageStubParameters?.[0] == 'on'? 'solo los administradores': 'todos'}* pueden enviar mensajes.`
    const admingp = `❱❱ 𝙁𝙀𝙇𝙄𝘾𝙄𝘿𝘼𝘿𝙀𝙎 ❰❰\n\n👤 @${((m.messageStubParameters?.[0]?.split('@')[0]) || '')}\n» 𝘼𝙃𝙊𝙍𝘼 𝙀𝙎 𝘼𝘿𝙈𝙄𝙉.\n\n» 𝘼𝘾𝘾𝙄𝙊́𝙉 𝙍𝙀𝘼𝙇𝙄𝙕𝘼𝘿𝘼 𝙋𝙊𝙍:\n${usuario}`
    const noadmingp = `❱❱ 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝘾𝙄𝙊́𝙉 ❰❰\n\n👤 @${((m.messageStubParameters?.[0]?.split('@')[0]) || '')}\n» 𝙔𝘼 𝙉𝙊 𝙀𝙎 𝘼𝘿𝙈𝙄𝙉.\n\n» 𝘼𝘾𝘾𝙄𝙊́𝙉 𝙍𝙀𝘼𝙇𝙄𝙕𝘼𝘿𝘼 𝙋𝙊𝙍:\n${usuario}`

    // Limpiar sesiones antiguas
    const uniqid = (m.isGroup ? m.chat : m.sender).split('@')[0]
    const sessionPath = './GataBotSession/'

    // Crear carpeta si no existe
    if (!existsSync(sessionPath)) {
        mkdirSync(sessionPath, { recursive: true })
    }

    for (const file of await fs.readdir(sessionPath)) {
        if (file.includes(uniqid)) {
            await fs.unlink(path.join(sessionPath, file))
            console.log(
                `${chalk.yellow.bold('[ ⚠️ Archivo Eliminado ]')} ${chalk.greenBright(`'${file}'`)}\n` +
                `${chalk.blue('(Session PreKey)')} ${chalk.redBright('que provoca el "undefined" en el chat')}`
            )
        }
    }

    // Detectar tipos de stubs
    switch (m.messageStubType) {
        case WAMessageStubType.GROUP_CHANGE_NAME:
            await conn.sendMessage(m.chat, { text: nombre, mentions: [m.sender] }, { quoted: fkontak })
            break
        case WAMessageStubType.GROUP_CHANGE_ICON:
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [m.sender] }, { quoted: fkontak })
            break
        case WAMessageStubType.GROUP_CHANGE_ANNOUNCE:
            await conn.sendMessage(m.chat, { text: status, mentions: [m.sender] }, { quoted: fkontak })
            break
        case WAMessageStubType.GROUP_CHANGE_RESTRICT:
            await conn.sendMessage(m.chat, { text: edit, mentions: [m.sender] }, { quoted: fkontak })
            break
        case WAMessageStubType.GROUP_CHANGE_INVITE_LINK:
            await conn.sendMessage(m.chat, { text: newlink, mentions: [m.sender] }, { quoted: fkontak })
            break
        case WAMessageStubType.GROUP_PARTICIPANT_ADD:
            await conn.sendMessage(m.chat, { text: admingp, mentions: [m.sender] }, { quoted: fkontak })
            break
        case WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
            await conn.sendMessage(m.chat, { text: noadmingp, mentions: [m.sender] }, { quoted: fkontak })
            break
        default:
            console.log({
                messageStubType: m.messageStubType,
                messageStubParameters: m.messageStubParameters,
                type: WAMessageStubType[m.messageStubType],
            })
    }
}

export default handler
