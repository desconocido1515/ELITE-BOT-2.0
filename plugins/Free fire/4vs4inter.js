import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;

// Estado global de las listas por grupo
let listasGrupos = new Map();
let mensajesGrupos = new Map();

// Función para obtener o crear las listas de un grupo
const getListasGrupo = (groupId) => {
    if (!listasGrupos.has(groupId)) {
        listasGrupos.set(groupId, {
            squad1: ['➤', '➤', '➤', '➤'],
            squad2: ['➤', '➤', '➤', '➤']
        });
    }
    return listasGrupos.get(groupId);
};

// Función para reiniciar las listas
const reiniciarListas = (groupId) => {
    listasGrupos.set(groupId, {
        squad1: ['➤', '➤', '➤', '➤'],
        squad2: ['➤', '➤', '➤', '➤']
    });
};

let handler = async (m, { conn, text, args }) => {
    const msgText = m.text;
    const groupId = m.chat;
    let listas = getListasGrupo(groupId);
    
    if (msgText.toLowerCase().startsWith('.interna4vs4')) {
        const mensaje = msgText.substring(12).trim();
        if (!mensaje) {
            await conn.sendMessage(m.chat, { 
                text: `🕓 𝗜𝗡𝗚𝗥𝗘𝗦𝗔 𝗨𝗡 𝗛𝗢𝗥𝗔𝗥𝗜𝗢.\n𝗘𝗷𝗲𝗺𝗽𝗹𝗼:\n.interna4vs4 4pm🇪🇨/3pm🇲🇽` 
            });
            return;
        }
        reiniciarListas(groupId);
        listas = getListasGrupo(groupId);
        mensajesGrupos.set(groupId, mensaje);

        await mostrarLista(conn, m.chat, listas, [], mensaje);
        return;
    }

    if (!['squad 1', 'squad 2'].includes(msgText.toLowerCase())) return;
    
    const usuario = m.sender.split('@')[0];
    const nombreUsuario = m.pushName || usuario;
    
    let squadType;
    let mentions = [];
    
    switch(msgText.toLowerCase()) {
        case 'squad 1':
            squadType = 'squad1';
            break;
        case 'squad 2':
            squadType = 'squad2';
            break;
    }
    
    // Borrar al usuario de otras escuadras
    Object.keys(listas).forEach(key => {
        const index = listas[key].findIndex(p => p.includes(`@${nombreUsuario}`));
        if (index !== -1) {
            listas[key][index] = '➤';
        }
    });
    
    const libre = listas[squadType].findIndex(p => p === '➤');
    if (libre !== -1) {
        listas[squadType][libre] = `@${nombreUsuario}`;
        mentions.push(m.sender);
    }

    Object.values(listas).forEach(squad => {
        squad.forEach(member => {
            if (member !== '➤') {
                const userName = member.slice(1);
                const userJid = Object.keys(m.message.extendedTextMessage?.contextInfo?.mentionedJid || {}).find(jid => 
                    jid.split('@')[0] === userName || 
                    conn.getName(jid) === userName
                );
                if (userJid) mentions.push(userJid);
            }
        });
    });

    const mensajeGuardado = mensajesGrupos.get(groupId);
    await mostrarLista(conn, m.chat, listas, mentions, mensajeGuardado);
    return;
}

async function mostrarLista(conn, chat, listas, mentions = [], mensajeUsuario = '') {
    const texto = `🕓 𝗛𝗢𝗥𝗔: ${mensajeUsuario ? `*${mensajeUsuario}*\n` : ''} 
╭──────⚔──────╮
    𝗘𝗡𝗙𝗥𝗘𝗡𝗧𝗔𝗠𝗜𝗘𝗡𝗧𝗢
            𝗜𝗡𝗧𝗘𝗥𝗡𝗢 
╰──────⚔──────╯
╭─────────────╮
│ 𝗦𝗤𝗨𝗔𝗗 1
│👑 ${listas.squad1[0]}
│🥷🏻 ${listas.squad1[1]}
│🥷🏻 ${listas.squad1[2]}
│🥷🏻 ${listas.squad1[3]}
╰─────────────╯
---------------- 🆚 ----------------
╭─────────────╮
│ 𝗦𝗤𝗨𝗔𝗗 2
│👑 ${listas.squad2[0]}
│🥷🏻 ${listas.squad2[1]}
│🥷🏻 ${listas.squad2[2]}
│🥷🏻 ${listas.squad2[3]}
╰─────────────╯
©EliteBotGlobal 2023 `;

    const buttons = [
        {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "Squad 1",
                id: "squad 1"
            })
        },
        {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "Squad 2",
                id: "squad 2"
            })
        }
    ];

    const mensaje = generateWAMessageFromContent(chat, {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    mentionedJid: mentions
                },
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: { text: texto },
                    footer: { text: "Selecciona una opción:" },
                    nativeFlowMessage: { buttons }
                })
            }
        }
    }, {});

    await conn.relayMessage(chat, mensaje.message, { messageId: mensaje.key.id });
}

export async function after(m, { conn }) {
    try {
        const button = m?.message?.buttonsResponseMessage;
        if (!button) return;

        const id = button.selectedButtonId;
        const groupId = m.chat;
        let listas = getListasGrupo(groupId);
        const numero = m.sender.split('@')[0];
        const nombreUsuario = m.pushName || numero;
        const tag = m.sender;

        Object.keys(listas).forEach(key => {
            const index = listas[key].findIndex(p => p.includes(`@${nombreUsuario}`));
            if (index !== -1) {
                listas[key][index] = '➤';
            }
        });

        let squadType;
        switch(id) {
            case 'squad 1':
                squadType = 'squad1';
                break;
            case 'squad 2':
                squadType = 'squad2';
                break;
        }

        if (squadType) {
            const libre = listas[squadType].findIndex(p => p === '➤');
            if (libre !== -1) {
                listas[squadType][libre] = `@${nombreUsuario}`;
                await conn.sendMessage(m.chat, {
                    text: `✅ @${nombreUsuario} agregado a Squad ${squadType.slice(-1)}`,
                    mentions: [tag]
                });
            } else {
                await conn.sendMessage(m.chat, {
                    text: `⚠️ Squad ${squadType.slice(-1)} está lleno`,
                    mentions: [tag]
                });
            }
        }
        
        const mensajeGuardado = mensajesGrupos.get(groupId);
        await mostrarLista(conn, m.chat, listas, [tag], mensajeGuardado);
    } catch (error) {
        console.error('Error en after:', error);
        await conn.sendMessage(m.chat, { text: '❌ Error al procesar tu selección' });
    }
}

handler.customPrefix = /^(squad 1|squad 2|\.interna4vs4.*)$/i
handler.command = new RegExp
handler.group = true

export default handler
