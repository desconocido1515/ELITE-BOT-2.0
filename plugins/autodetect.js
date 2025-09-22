import fetch from 'node-fetch'
let WAMessageStubType = (await import('@whiskeysockets/baileys')).default

const lidCache = new Map()
const handler = m => m

handler.before = async function (m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return
    const chat = global.db.data.chats[m.chat]

    // Resolver JID real del remitente
    const usuarioJid = await resolveLidToRealJid(m?.sender, conn, m?.chat)
    const usuario = await getRealName(usuarioJid, conn, participants)

    // fkontak para quotes
    let fkontak = { 
        key: { participants:"0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" }, 
        message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }},
        participant: "0@s.whatsapp.net" 
    }

    // externalAdReply
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

    // Función para enviar mensajes
    async function sendReply(text, mentions = [usuarioJid], image = null) {
        const messageOptions = {
            mentions,
            contextInfo: { externalAdReply }
        }
        if (image) messageOptions.image = { url: image }
        if (!image) messageOptions.text = text
        else messageOptions.caption = text

        await conn.sendMessage(m.chat, messageOptions, { quoted: fkontak })
    }

    if (chat.detect) {
        try {
            switch (m.messageStubType) {
                case 21:
                    await sendReply(`${usuario} HA CAMBIADO EL NOMBRE DEL GRUPO A:\n\n*${m.messageStubParameters?.[0] || 'N/A'}*`)
                    break
                case 22:
                    await sendReply(`${usuario} HA CAMBIADO LA FOTO DEL GRUPO`)
                    break
                case 24:
                    await sendReply(`${usuario} NUEVA DESCRIPCIÓN DEL GRUPO:\n\n${m.messageStubParameters?.[0] || 'N/A'}`
                    )
                    break
                case 25:
                    await sendReply(`🔒 AHORA *${m.messageStubParameters?.[0] == 'on' ? 'SOLO ADMINS' : 'TODOS'}* PUEDEN EDITAR LA INFORMACIÓN DEL GRUPO`)
                    break
                case 26:
                    await sendReply(`${m.messageStubParameters?.[0] == 'on' ? '❱❱ GRUPO CERRADO ❰❰' : '❱❱ GRUPO ABIERTO ❰❰'}\n\n ${groupMetadata?.subject || 'Grupo'}\n 👤 ${usuario}`)
                    break
                case 29: {
                    let targetJid = await resolveLidToRealJid(m.messageStubParameters?.[0], conn, m.chat)
                    let targetName = await getRealName(targetJid, conn, participants)
                    await sendReply(`❱❱ FELICIDADES\n👤 ${targetName}\nAHORA ES ADMIN.\n👤 ${usuario}`, [usuarioJid, targetJid])
                    break
                }
                case 30: {
                    let targetJid = await resolveLidToRealJid(m.messageStubParameters?.[0], conn, m.chat)
                    let targetName = await getRealName(targetJid, conn, participants)
                    await sendReply(`❱❱ INFORMACIÓN\n👤 ${targetName}\nYA NO ES ADMIN.\n👤 ${usuario}`, [usuarioJid, targetJid])
                    break
                }
                default:
                    break
            }
        } catch (e) {
            console.error('Error manejando stub:', e)
        }
    }
}

export default handler

// Función para resolver LID a JID real
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

// Función para obtener el nombre real de WhatsApp
async function getRealName(jid, conn, participants) {
    // Primero intentamos con store.contacts
    const contact = conn.store?.contacts?.[jid]
    if (contact) return contact.notify || contact.name || jid.split('@')[0]

    // Si no está en la store, buscamos en participants
    const participant = participants?.find(p => p.jid === jid)
    if (participant) return participant.name || participant.notify || jid.split('@')[0]

    // Si todo falla, fallback al número
    return jid.split('@')[0]
}
