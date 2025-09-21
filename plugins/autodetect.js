// Mensajes según el tipo de evento usando tus textos
if (chat.detect) {
    switch (m.messageStubType) {
        case 21: // Cambio de nombre del grupo
            rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
            await this.sendMessage(m.chat, { 
                text: `${usuario} 𝙃𝘼𝙎 𝘾𝘼𝙈𝘽𝙄𝘼𝘿𝙊 𝙀𝙇 𝙉𝙊𝙈𝘽𝙍𝙀́ 𝘿𝙀𝙇 𝙂𝙍𝙐𝙋𝙊 A:\n\n*${m.messageStubParameters[0]}*`,
                mentions: [m.sender]
            }, { quoted: fkontak })
            break
        case 22: // Cambio de foto
            rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
            await this.sendMessage(m.chat, { 
                text: `${usuario} 𝙃𝘼𝙎 𝘾𝘼𝙈𝘽𝙄𝘼𝘿𝙊 𝙇𝘼𝙎 𝙁𝙊𝙏𝙊 𝘿𝙀𝙇 𝙂𝙍𝙐𝙋𝙊`,
                mentions: [m.sender]
            }, { quoted: fkontak })
            break
        case 24: // Nueva descripción
            rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
            await this.sendMessage(m.chat, { 
                text: `${usuario} 𝙉𝙐𝙀𝙑𝘼 𝘿𝙀𝙎𝘾𝙍𝙄𝙋𝘾𝙄𝙊𝙉 𝘿𝙀𝙇 𝙂𝙍𝙐𝙋𝙊 𝙀𝙎:\n\n${m.messageStubParameters[0]}`,
                mentions: [m.sender]
            }, { quoted: fkontak })
            break
        case 25: // Solo admins pueden editar
            rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
            await this.sendMessage(m.chat, { 
                text: `🔒 𝘼𝙃𝙊𝙍𝘼 *${m.messageStubParameters[0] == 'on' ? '𝙎𝙊𝙇𝙊 𝘼𝘿𝙈𝙄𝙉𝙎' : '𝙏𝙊𝘿𝙊𝙎'}* 𝙋𝙐𝙀𝘿𝙀 𝙀𝘿𝙄𝙏𝘼𝙍 𝙇𝘼 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝘾𝙄𝙊𝙉 𝘿𝙀𝙇 𝙂𝙍𝙐𝙋𝙊`,
                mentions: [m.sender]
            }, { quoted: fkontak })
            break
        case 26: // Grupo cerrado/abierto
            rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
            await this.sendMessage(m.chat, { 
                text: `${m.messageStubParameters[0] == 'on' ? '❱❱ 𝙂𝙍𝙐𝙋𝙊 𝘾𝙀𝙍𝙍𝘼𝘿𝙊 ❰❰' : '❱❱ 𝙂𝙍𝙐𝙋𝙊 𝘼𝘽𝙄𝙀𝙍𝙏𝙊 ❰❰'}\n\n ${groupName}\n ${m.messageStubParameters[0] == 'on' ? '» 𝙄𝙉𝙃𝘼𝘽𝙄𝙇𝙄𝙏𝘼𝘿𝙊 𝙋𝙊𝙍:'  : '» 𝙃𝘼𝘽𝙄𝙇𝙄𝙏𝘼𝘿𝙊 𝙋𝙊𝙍:'} *${m.messageStubParameters[0] == 'on' ? 'ㅤ' : 'ㅤ' }*\n 👤 *${usuario}*\n\n ${m.messageStubParameters[0] == 'on' ?'» 𝙉𝘼𝘿𝙄𝙀 𝙋𝙐𝙀𝘿𝙀 𝙀𝙎𝘾𝙍𝙄𝘽𝙄𝙍 𝙀𝙉 𝙀𝙇 𝙂𝙍𝙐𝙋𝙊.' :'» 𝙏𝙊𝘿𝙊𝙎 𝙋𝙐𝙀𝘿𝙀𝙉 𝙀𝙎𝘾𝙍𝙄𝘽𝙄𝙍 𝙀𝙉 𝙀𝙇 𝙂𝙍𝙐𝙋𝙊.'}`,
                mentions: [m.sender]
            }, { quoted: fkontak })
            break
        case 29: // Usuario ahora es admin
            rcanal.contextInfo.mentionedJid = [usuario, users, ...groupAdmins.map(v => v.id)].filter(Boolean)
            await this.sendMessage(m.chat, { 
                text: `❱❱ 𝙁𝙀𝙇𝙄𝘾𝙄𝘿𝘼𝘿𝙀𝙎 ❰❰\n\n👤 *@${m.messageStubParameters[0].split`@`[0]}* \n» 𝘼𝙃𝙊𝙍𝘼 𝙀𝙎 𝘼𝘿𝙈𝙄𝙉.\n\n» 𝘼𝘾𝘾𝙄𝙊́𝙉 𝙍𝙀𝘼𝙇𝙄𝙕𝘼𝘿𝘼 𝙋𝙊𝙍: \n👤 *${usuario}*`,
                mentions: [m.sender, m.messageStubParameters[0]]
            }, { quoted: fkontak })
            break
        case 30: // Usuario deja de ser admin
            rcanal.contextInfo.mentionedJid = [usuario, users, ...groupAdmins.map(v => v.id)].filter(Boolean)
            await this.sendMessage(m.chat, { 
                text: `❱❱ 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝘾𝙄𝙊́𝙉 ❰❰\n\n👤 *@${m.messageStubParameters[0].split`@`[0]}* \n» 𝙔𝘼 𝙉𝙊 𝙀𝙎 𝘼𝘿𝙈𝙄𝙉.\n\n» 𝘼𝘾𝘾𝙄𝙊́𝙉 𝙍𝙀𝘼𝙇𝙄𝙕𝘼𝘿𝘼 𝙋𝙊𝙍:\n👤 *${usuario}*`,
                mentions: [m.sender, m.messageStubParameters[0]]
            }, { quoted: fkontak })
            break
        case 72: // Cambio de duración de mensajes temporales
            rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
            await this.sendMessage(m.chat, { 
                text: `${usuario} 𝘾𝘼𝙈𝘽𝙄𝙊 𝙇𝘼𝙎 𝘿𝙐𝙍𝘼𝘾𝙄𝙊𝙉 𝘿𝙀𝙇 𝙇𝙊𝙎 𝙈𝙀𝙉𝙎𝘼𝙅𝙀 𝙏𝙀𝙈𝙋𝙊𝙍𝘼𝙇𝙀𝙎 𝘼 *@${m.messageStubParameters[0]}*`,
                mentions: [m.sender]
            }, { quoted: fkontak })
            break
        case 123: // Desactivó mensajes temporales
            rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
            await this.sendMessage(m.chat, { 
                text: `${usuario} *𝘿𝙀𝙎𝘼𝘾𝙏𝙄𝙑𝙊́* 𝙇𝙊𝙎 𝙈𝙀𝙉𝙎𝘼𝙅𝙀 𝙏𝙀𝙈𝙋𝙊𝙍𝘼𝙇.`,
                mentions: [m.sender]
            }, { quoted: fkontak })
            break
        default:
            console.log({
                messageStubType: m.messageStubType,
                messageStubParameters: m.messageStubParameters,
                type: WAMessageStubType[m.messageStubType],
            })
    }
}
