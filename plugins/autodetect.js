import fetch from 'node-fetch'
let WAMessageStubType = (await import('@whiskeysockets/baileys')).default

let handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return

    const chat = global.db.data.chats[m.chat]

    // Obtener JID y nombre del usuario que hizo la acción
    const usuarioJid = m.sender
    const usuarioName = await conn.getName(usuarioJid)

    // Admins del grupo
    const groupAdmins = participants.filter(p => p.admin)

    // fkontak para mensajes citados
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "AlienMenu"
        },
        message: {
            locationMessage: {
                name: "*Sasuke Bot MD 🌀*",
                jpegThumbnail: await (await fetch('https://files.catbox.moe/1j784p.jpg')).buffer(),
                vcard: `BEGIN:VCARD
VERSION:3.0
N:;Sasuke;;;
FN:Sasuke Bot
ORG:Barboza Developers
TITLE:
item1.TEL;waid=${m.sender.split('@')[0]}:+${m.sender.split('@')[0]}
item1.X-ABLabel:Alien
X-WA-BIZ-DESCRIPTION:🛸 Llamado grupal universal con estilo.
X-WA-BIZ-NAME:Sasuke
END:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    }

    let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://files.catbox.moe/xr2m6u.jpg'

    // Textos de notificación
    const nombre = `✨ @${usuarioName} *ha cambiado el nombre del grupo* ✨\n\n> 📝 *Nuevo nombre:* _${m.messageStubParameters[0]}_`
    const foto = `📸 *¡Nueva foto de grupo!* 📸\n\n> 💫 Acción realizada por: @${usuarioName}`
    const edit = `⚙️ @${usuarioName} ha ajustado la configuración del grupo.\n\n> 🔒 Ahora *${m.messageStubParameters[0] == 'on'? 'solo los administradores': 'todos'}* pueden configurar el grupo.`
    const newlink = `🔗 *¡El enlace del grupo ha sido restablecido!* 🔗\n\n> 💫 Acción realizada por: @${usuarioName}`
    const status = `🗣️ El grupo ha sido *${m.messageStubParameters[0] == 'on'? 'cerrado': 'abierto'}* por @${usuarioName}!\n\n> 💬 Ahora *${m.messageStubParameters[0] == 'on'? 'solo los administradores': 'todos'}* pueden enviar mensajes.`
    const admingp = `👑 @${m.messageStubParameters[0].split`@`[0]} *¡Ahora es administrador del grupo!* 👑\n\n> 💫 Acción realizada por: @${usuarioName}`
    const noadmingp = `🗑️ @${m.messageStubParameters[0].split`@`[0]} *ha dejado de ser administrador del grupo.* 🗑️\n\n> 💫 Acción realizada por: @${usuarioName}`

    // Función para enviar mensaje con mención
    async function sendMention(text, mentions = [usuarioJid], image = null) {
        const messageOptions = { mentions }
        if (image) messageOptions.image = { url: image }, messageOptions.caption = text
        else messageOptions.text = text
        await conn.sendMessage(m.chat, messageOptions, { quoted: fkontak })
    }

    if (!chat.detect) return

    switch (m.messageStubType) {
        case 21: await sendMention(nombre, [usuarioJid]); break // Cambio de nombre
        case 22: await sendMention(foto, [usuarioJid], pp); break // Cambio de foto
        case 23: await sendMention(newlink, [usuarioJid]); break // Nuevo enlace
        case 25: await sendMention(edit, [usuarioJid]); break // Configuración de info
        case 26: await sendMention(status, [usuarioJid]); break // Grupo abierto/cerrado
        case 29: { // Usuario hecho admin
            const targetJid = m.messageStubParameters[0]
            await sendMention(admingp, [usuarioJid, targetJid])
            break
        }
        case 30: { // Usuario removido de admin
            const targetJid = m.messageStubParameters[0]
            await sendMention(noadmingp, [usuarioJid, targetJid])
            break
        }
        case 72: // Cambio duración mensajes temporales
            await sendMention(`@${usuarioName} CAMBIÓ LA DURACIÓN DE LOS MENSAJES TEMPORALES A @${m.messageStubParameters[0]}`, [usuarioJid])
            break
        case 123: // Mensajes temporales desactivados
            await sendMention(`@${usuarioName} DESACTIVÓ LOS MENSAJES TEMPORALES`, [usuarioJid])
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
