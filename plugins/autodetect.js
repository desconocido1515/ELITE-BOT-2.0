let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import fetch from 'node-fetch'

const lidCache = new Map()
const handler = m => m

handler.before = async function (m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return
    const chat = global.db.data.chats[m.chat]
    const usuario = await resolveLidToRealJid(m?.sender, conn, m?.chat)
    const groupAdmins = participants.filter(p => p.admin)
    const users = m.messageStubParameters?.[0] ? [m.messageStubParameters[0]] : []

    // Configuración del externalAdReply
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

    // fkontak para quotes
    let fkontak = { 
        key: { participants:"0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" }, 
        message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }},
        participant: "0@s.whatsapp.net" 
    }

    // Función para enviar mensajes con externalAdReply
    async function sendReply(text, mentions = [m.sender], image = null) {
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
        if (m.messageStubType == 21) await sendReply(`@${usuario.split('@')[0]} 𝙃𝘼𝙎 𝘾𝘼𝙈𝘽𝙄𝘼𝘿𝙊 𝙀𝙇 𝙉𝙊𝙈𝘽𝙍𝙀́ 𝘿𝙀𝙇 𝙂𝙍𝙐𝙋𝙊 A:\n\n*${m.messageStubParameters[0]}*`)
        else if (m.messageStubType == 22) await sendReply(`@${usuario.split('@')[0]} 𝙃𝘼𝙎 𝘾𝘼𝙈𝘽𝙄𝘼𝘿𝙊 𝙇𝘼𝙎 𝙁𝙊𝙏𝙊 𝘿𝙀𝙇 𝙂𝙍𝙐𝙋𝙊`)
        else if (m.messageStubType == 24) await sendReply(`@${usuario.split('@')[0]} 𝙉𝙐𝙀𝙑𝘼 𝘿𝙀𝙎𝘾𝙍𝙄𝙋𝘾𝙄𝙊𝙉 𝘿𝙀𝙇 𝙂𝙍𝙐𝙋𝙊 𝙀𝙎:\n\n${m.messageStubParameters[0]}`)
        else if (m.messageStubType == 25) await sendReply(`🔒 𝘼𝙃𝙊𝙍𝘼 *${m.messageStubParameters[0] == 'on' ? '𝙎𝙊𝙇𝙊 𝘼𝘿𝙈𝙄𝙉𝙎' : '𝙏𝙊𝘿𝙊𝙎'}* 𝙋𝙐𝙀𝘿𝙀 𝙀𝘿𝙄𝙏𝘼𝙍 𝙇𝘼 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝘾𝙄𝙊𝙉 𝘿𝙀𝙇 𝙂𝙍𝙐𝙋𝙊`)
        else if (m.messageStubType == 26) await sendReply(`${m.messageStubParameters[0] == 'on' ? '❱❱ 𝙂𝙍𝙐𝙋𝙊 𝘾𝙀𝙍𝙍𝘼𝘿𝙊 ❰❰' : '❱❱ 𝙂𝙍𝙐𝙋𝙊 𝘼𝘽𝙄𝙀𝙍𝙏𝙊 ❰❰'}\n\n ${groupMetadata?.subject || 'Grupo'}\n 👤 *${usuario}*`)
        else if (m.messageStubType == 29) await sendReply(`❱❱ 𝙁𝙀𝙇𝙄𝘾𝙄𝘿𝘼𝘿𝙀𝙎\n👤 *@${m.messageStubParameters[0].split('@')[0]}* \n» 𝘼𝙃𝙊𝙍𝘼 𝙀𝙎 𝘼𝘿𝙈𝙄𝙉.\n👤 *${usuario}*`, [m.sender, m.messageStubParameters[0]])
        else if (m.messageStubType == 30) await sendReply(`❱❱ 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝘾𝙄𝙊́𝙉\n👤 *@${m.messageStubParameters[0].split('@')[0]}* \n» 𝙔𝘼 𝙉𝙊 𝙀𝙎 𝘼𝘿𝙈𝙄𝙉.\n👤 *${usuario}*`, [m.sender, m.messageStubParameters[0]])
    }
}

export default handler

async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 60000) {
    const inputJid = lid.toString()
    if (!inputJid.endsWith("@lid") || !groupChatId?.endsWith("@g.us")) return inputJid.includes("@") ? inputJid : `${inputJid}@s.whatsapp.net`
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
