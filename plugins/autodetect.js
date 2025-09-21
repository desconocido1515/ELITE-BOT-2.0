let WAMessageStubType = (await import(global.baileys)).default

export async function before(m, { conn, participants }) {
    if (!m.messageStubType || !m.isGroup) return

    const groupName = (await conn.groupMetadata(m.chat)).subject
    let usuario = `@${m.sender.split`@`[0]}`
    let fkontak = { 
        key: { participants:"0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" },
        message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }},
        participant: "0@s.whatsapp.net"
    }

    // Usuarios del grupo
    let users = participants.map(u => conn.decodeJid(u.id))

    // Mensajes de permisos
    let permisoEditarInfo = m.messageStubParameters && m.messageStubType == 25
        ? `🔒 𝘼𝙃𝙊𝙍𝘼 *${m.messageStubParameters[0] == 'on' ? '𝙎𝙊𝙇𝙊 𝘼𝘿𝙈𝙄𝙉𝙎' : '𝙏𝙊𝘿𝙊𝙎'}* 𝙋𝙐𝙀𝘿𝙀 𝙀𝘿𝙄𝙏𝘼𝙍 𝙇𝘼 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝘾𝙄𝙊𝙉 𝘿𝙀𝙇 𝙂𝙍𝙐𝙋𝙊\n> 💫 Acción realizada por: ${usuario}`
        : null

    let permisoEnviar = m.messageStubParameters && m.messageStubType == 26
        ? `${m.messageStubParameters[0] == 'on' ? '❱❱ 𝙂𝙍𝙐𝙋𝙊 𝘾𝙀𝙍𝙍𝘼𝘿𝙊 ❰❰' : '❱❱ 𝙂𝙍𝙐𝙋𝙊 𝘼𝘽𝙄𝙀𝙍𝙏𝙊 ❰❰'}\n\n${groupName}\n👤 *${usuario}*\n${m.messageStubParameters[0] == 'on' ? '» 𝙉𝘼𝘿𝙄𝙀 𝙋𝙐𝙀𝘿𝙀 𝙀𝙎𝘾𝙍𝙄𝘽𝙄𝙍 𝙀𝙉 𝙀𝙇 𝙂𝙍𝙐𝙋𝙊.' :'» 𝙏𝙊𝘿𝙊𝙎 𝙋𝙐𝙀𝘿𝙀𝙉 𝙀𝙎𝘾𝙍𝙄𝘽𝙄𝙍 𝙀𝙉 𝙀𝙇 𝙂𝙍𝙐𝙋𝙊.'}`

    let permisoAgregar = m.messageStubParameters && m.messageStubType == 27
        ? `${m.messageStubParameters[0] == 'on' ? '🔒 𝙎𝙊𝙇𝙊 𝘼𝘿𝙈𝙄𝙉𝙎 𝙋𝙐𝙀𝘿𝙀𝙉 𝘼𝘿𝘿 𝙈𝙄𝙀𝙈𝘽𝙍𝙊𝙎' : '🔓 𝙏𝙊𝘿𝙊𝙎 𝙋𝙐𝙀𝘿𝙀𝙉 𝘼𝘿𝘿 𝙈𝙄𝙀𝙈𝘽𝙍𝙊𝙎'}\n> 💫 Acción realizada por: ${usuario}`
        : null

    switch (m.messageStubType) {
        case 21: // Cambio de nombre
            await this.sendMessage(m.chat, { text: `${usuario} 𝙃𝘼𝙎 𝘾𝘼𝙈𝘽𝙄𝘼𝘿𝙊 𝙀𝙇 𝙉𝙊𝙈𝘽𝙍𝙀́ 𝘿𝙀𝙇 𝙂𝙍𝙐𝙋𝙊 𝘼:\n\n*${m.messageStubParameters[0]}*`, mentions: [m.sender]}, { quoted: fkontak })
            break
        case 22: // Cambio de foto
            await this.sendMessage(m.chat, { text: `${usuario} 𝙃𝘼𝙎 𝘾𝘼𝙈𝘽𝙄𝘼𝘿𝙊 𝙇𝘼𝙎 𝙁𝙊𝙏𝙊 𝘿𝙀𝙇 𝙂𝙍𝙐𝙋𝙊`, mentions: [m.sender] }, { quoted: fkontak })
            break
        case 24: // Cambio de descripción
            await this.sendMessage(m.chat, { text: `${usuario} 𝙉𝙐𝙀𝙑𝘼 𝘿𝙀𝙎𝘾𝙍𝙄𝙋𝘾𝙄𝙊𝙉 𝘿𝙀𝙇 𝙂𝙍𝙐𝙋𝙊 𝙀𝙎:\n\n${m.messageStubParameters[0]}`, mentions: [m.sender] }, { quoted: fkontak })
            break
        case 25: // Permiso editar info
            await this.sendMessage(m.chat, { text: permisoEditarInfo, mentions: [m.sender] }, { quoted: fkontak })
            break
        case 26: // Permiso enviar mensajes
            await this.sendMessage(m.chat, { text: permisoEnviar, mentions: [m.sender] }, { quoted: fkontak })
            break
        case 29: // Nuevo admin
            await this.sendMessage(m.chat, { text: `❱❱ 𝙁𝙀𝙇𝙄𝘾𝙄𝘿𝘼𝘿𝙀𝙎 ❰❰\n\n👤 *@${m.messageStubParameters[0].split`@`[0]}* \n» 𝘼𝙃𝙊𝙍𝘼 𝙀𝙎 𝘼𝘿𝙈𝙄𝙉.\n\n» 𝘼𝘾𝘾𝙄𝙊́𝙉 𝙍𝙀𝘼𝙇𝙄𝙕𝘼𝘿𝘼 𝙋𝙊𝙍: \n👤 *${usuario}*`, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }, { quoted: fkontak })
            break
        case 30: // Admin eliminado
            await this.sendMessage(m.chat, { text: `❱❱ 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝘾𝙄𝙊́𝙉 ❰❰\n\n👤 *@${m.messageStubParameters[0].split`@`[0]}* \n» 𝙔𝘼 𝙉𝙊 𝙀𝙎 𝘼𝘿𝙈𝙄𝙉.\n\n» 𝘼𝘾𝘾𝙄𝙊́𝙉 𝙍𝙀𝘼𝙇𝙄𝙕𝘼𝘿𝘼 𝙋𝙊𝙍:\n👤 *${usuario}*`, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }, { quoted: fkontak })
            break
        case 72: // Cambio duración mensajes temporales
            await this.sendMessage(m.chat, { text: `${usuario} 𝘾𝘼𝙈𝘽𝙄𝙊 𝙇𝘼𝙎 𝘿𝙐𝙍𝘼𝘾𝙄𝙊𝙉 𝘿𝙀𝙇 𝙇𝙊𝙎 𝙈𝙀𝙉𝙎𝘼𝙅𝙀 𝙏𝙀𝙈𝙋𝙊𝙍𝘼𝙇𝙀𝙎 𝘼 *@${m.messageStubParameters[0]}*`, mentions: [m.sender] }, { quoted: fkontak })
            break
        case 123: // Mensajes temporales desactivados
            await this.sendMessage(m.chat, { text: `${usuario} *𝘿𝙀𝙎𝘼𝘾𝙏𝙄𝙑𝙊́* 𝙇𝙊𝙎 𝙈𝙀𝙉𝙎𝘼𝙅𝙀 𝙏𝙀𝙈𝙋𝙊𝙍𝘼𝙇.`, mentions: [m.sender] }, { quoted: fkontak })
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
