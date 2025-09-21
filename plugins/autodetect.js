let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import fetch from 'node-fetch'

const lidCache = new Map()
const handler = m => m

handler.before = async function (m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return
    const chat = global.db.data.chats[m.chat]

    // Obtener JID y nombre real del usuario que hizo la acción
    const usuarioJid = await resolveLidToRealJid(m?.sender, conn, m?.chat)
    const usuarioName = await conn.getName(usuarioJid)

    // Admins del grupo
    const groupAdmins = participants.filter(p => p.admin)

    // fkontak para mensajes citados
    let fkontak = { 
        key: { participants:"0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" }, 
        message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }},
        participant: "0@s.whatsapp.net" 
    }

    // externalAdReply para todos los mensajes
    const externalAdReply = {
        title: "𐔌 . ⋮ ᗩ ᐯ I Տ O .ᐟ ֹ ₊ ꒱",
        body: "¡Bot activo!",
        mediaUrl: null,
        description: "Sistema de notificaciones de grupo",
        previewType: "PHOTO",
        thumbnail: await (await fetch('https://files.catbox.moe/xr2m6u.jpg')).buffer(),
        sourceUrl: "https://tumejemplo.com",
        mediaType: 1,
        renderLargerThumbnail: false
    }

    // Función para enviar mensajes con mención y externalAdReply
    async function sendReply(text, mentions = [usuarioJid], image = null) {
        const messageOptions = { mentions, contextInfo: { externalAdReply } }
        if (image) messageOptions.image = { url: image }
        if (!image) messageOptions.text = text
        else messageOptions.caption = text

        await conn.sendMessage(m.chat, messageOptions, { quoted: fkontak })
    }

    if (!chat.detect) return

    switch (m.messageStubType) {
        case 21: // Cambio de nombre del grupo
            await sendReply(`@${usuarioName} HA CAMBIADO EL NOMBRE DEL GRUPO A:\n\n*${m.messageStubParameters[0]}*`, [usuarioJid])
            break
        case 22: // Cambio de foto del grupo
            await sendReply(`@${usuarioName} HA CAMBIADO LA FOTO DEL GRUPO`, [usuarioJid])
            break
        case 24: // Cambio de descripción
            await sendReply(`@${usuarioName} NUEVA DESCRIPCIÓN DEL GRUPO:\n\n${m.messageStubParameters[0]}`, [usuarioJid])
            break
        case 25: // Restricción edición de info
            await sendReply(`🔒 AHORA *${m.messageStubParameters[0] == 'on' ? 'SOLO ADMINS' : 'TODOS'}* PUEDEN EDITAR LA INFORMACIÓN DEL GRUPO\n\nAcción realizada por: @${usuarioName}`, [usuarioJid])
            break
        case 26: // Estado del grupo abierto/cerrado
            await sendReply(`${m.messageStubParameters[0] == 'on' ? '❱❱ GRUPO CERRADO ❰❰' : '❱❱ GRUPO ABIERTO ❰❰'}\n\n${groupMetadata?.subject || 'Grupo'}\n👤 @${usuarioName}`, [usuarioJid])
            break
        case 29: { // Usuario hecho admin
            const targetJid = m.messageStubParameters[0]
            const targetName = await conn.getName(targetJid)
            await sendReply(`❱❱ FELICIDADES\n👤 @${targetName}\nAHORA ES ADMIN.\n👤 @${usuarioName}`, [usuarioJid, targetJid])
            break
        }
        case 30: { // Usuario removido de admin
            const targetJid = m.messageStubParameters[0]
            const targetName = await conn.getName(targetJid)
            await sendReply(`❱❱ INFORMACIÓN\n👤 @${targetName}\nYA NO ES ADMIN.\n👤 @${usuarioName}`, [usuarioJid, targetJid])
            break
        }
        case 72: // Cambio de duración de mensajes temporales
            await sendReply(`@${usuarioName} CAMBIÓ LA DURACIÓN DE LOS MENSAJES TEMPORALES A @${m.messageStubParameters[0]}`, [usuarioJid])
            break
        case 123: // Mensajes temporales desactivados
            await sendReply(`@${usuarioName} DESACTIVÓ LOS MENSAJES TEMPORALES`, [usuarioJid])
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

async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 60000) {
    const inputJid = lid.toString()
    if (!inputJid.endsWith("@lid") || !groupChatId?.endsWith("@g.us")) 
        return inputJid.includes("@") ? inputJid : `${inputJid}@s.whatsapp.net`
    if (lidCache.has(inputJid)) return lidCache.get(inputJid)

    const lidToFind = inputJid.split("@")[0]
    let attempts = 0
    while (attempts < maxRetries) {
        try {
            const metadata = await conn?.groupMetadata(groupChatId)
            if (!metadata?.participants) throw new Error("No se obtuvieron participantes")
            for (const participant of metadata.participants) {
                try {
                    if (!participant?.jid) continue
                    const contactDetails = await conn?.onWhatsApp(participant.jid)
                    if (!contactDetails?.[0]?.lid) continue
                    const possibleLid = contactDetails[0].lid.split("@")[0]
                    if (possibleLid === lidToFind) {
                        lidCache.set(inputJid, participant.jid)
                        return participant.jid
                    }
                } catch (e) { continue }
            }
            lidCache.set(inputJid, inputJid)
            return inputJid
        } catch (e) {
            if (++attempts >= maxRetries) {
                lidCache.set(inputJid, inputJid)
                return inputJid
            }
            await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
    }
    return inputJid
}
