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
            squad2: ['➤', '➤', '➤', '➤'],
            squad3: ['➤', '➤', '➤', '➤'],
            squad4: ['➤', '➤', '➤', '➤'],
            squad5: ['➤', '➤', '➤', '➤'],
            suplente: ['➤', '➤', '➤', '➤']
        });
    }
    return listasGrupos.get(groupId);
};

// Función para reiniciar las listas
const reiniciarListas = (groupId) => {
    listasGrupos.set(groupId, {
        squad1: ['➤', '➤', '➤', '➤'],
        squad2: ['➤', '➤', '➤', '➤'],
        squad3: ['➤', '➤', '➤', '➤'],
        squad4: ['➤', '➤', '➤', '➤'],
        squad5: ['➤', '➤', '➤', '➤'],
        suplente: ['➤', '➤', '➤', '➤']
    });
};

let handler = async (m, { conn, text, args }) => {
    const msgText = m.text;
    const groupId = m.chat;
    let listas = getListasGrupo(groupId);
    
    if (msgText.toLowerCase().startsWith('.20vs20')) {
        const mensaje = msgText.substring(7).trim();
        if (!mensaje) {
            await conn.sendMessage(m.chat, { 
                text: `🕓 𝗜𝗡𝗚𝗥𝗘𝗦𝗔 𝗨𝗡 𝗛𝗢𝗥𝗔𝗥𝗜𝗢.\n𝗘𝗷𝗲𝗺𝗽𝗹𝗼:\n.20vs20 4pm🇪🇨/3pm🇲🇽` 
            });
            return;
        }
        reiniciarListas(groupId);
        listas = getListasGrupo(groupId);
        mensajesGrupos.set(groupId, mensaje);

        await mostrarLista(conn, m.chat, listas, [], mensaje);
        return;
    }

    if (!['escuadra   1', 'escuadra   2', 'escuadra   3', 'escuadra   4', 'escuadra   5', 'suplente20vs20'].includes(msgText.toLowerCase())) return;
    
    const usuario = m.sender.split('@')[0];
    const nombreUsuario = m.pushName || usuario;
    
    let squadType;
    let mentions = [];
    
    switch(msgText.toLowerCase()) {
        case 'escuadra   1':
            squadType = 'squad1';
            break;
        case 'escuadra   2':
            squadType = 'squad2';
            break;
        case 'escuadra   3':
            squadType = 'squad3';
            break;
        case 'escuadra   4':
            squadType = 'squad4';
            break;
        case 'escuadra   5':
            squadType = 'squad5';
            break;
        case 'suplente20vs20':
            squadType = 'suplente';
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
    const texto = `🕓 𝗛𝗢𝗥𝗔: ${mensajeUsuario ? `*${mensajeUsuario}*\n` : ''} 🗣️ 𝗜𝗡𝗗𝗜𝗖𝗔𝗖𝗜𝗢𝗡𝗘𝗦 :
» Reglas y color se avisa al llenar este listado.

╭──────⚔──────╮
         20 𝗩𝗘𝗥𝗦𝗨𝗦 20
╰──────⚔──────╯
╭─────────────╮
│ 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 1
│👑 ${listas.squad1[0]}
│🥷🏻 ${listas.squad1[1]}
│🥷🏻 ${listas.squad1[2]}
│🥷🏻 ${listas.squad1[3]}
╰─────────────╯
╭─────────────╮
│ 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 2
│👑 ${listas.squad2[0]}
│🥷🏻 ${listas.squad2[1]}
│🥷🏻 ${listas.squad2[2]}
│🥷🏻 ${listas.squad2[3]}
╰─────────────╯
╭─────────────╮
│ 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 3
│👑 ${listas.squad3[0]}
│🥷🏻 ${listas.squad3[1]}
│🥷🏻 ${listas.squad3[2]}
│🥷🏻 ${listas.squad3[3]}
╰─────────────╯
╭─────────────╮
│ 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 4
│👑 ${listas.squad4[0]}
│🥷🏻 ${listas.squad4[1]}
│🥷🏻 ${listas.squad4[2]}
│🥷🏻 ${listas.squad4[3]}
╰─────────────╯
╭─────────────╮
│ 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 5
│👑 ${listas.squad5[0]}
│🥷🏻 ${listas.squad5[1]}
│🥷🏻 ${listas.squad5[2]}
│🥷🏻 ${listas.squad5[3]}
╰─────────────╯
╭─────────────╮
│ 𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘𝗦
│🥷🏻 ${listas.suplente[0]}
│🥷🏻 ${listas.suplente[1]}
│🥷🏻 ${listas.suplente[2]}
│🥷🏻 ${listas.suplente[3]}
╰─────────────╯
©EliteBotGlobal 2023 `;

    const buttons = [
        {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "Escuadra   1",
                id: "escuadra   1"
            })
        },
        {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "Escuadra   2",
                id: "escuadra   2"
            })
        },
        {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "Escuadra   3",
                id: "escuadra   3"
            })
        },
        {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "Escuadra   4",
                id: "escuadra   4"
            })
        },
        {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "Escuadra   5",
                id: "escuadra   5"
            })
        },
        {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "Suplente20vs20",
                id: "suplente20vs20"
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
            case 'escuadra   1':
                squadType = 'squad1';
                break;
            case 'escuadra   2':
                squadType = 'squad2';
                break;
            case 'escuadra   3':
                squadType = 'squad3';
                break;
            case 'escuadra   4':
                squadType = 'squad4';
                break;
            case 'escuadra   5':
                squadType = 'squad5';
                break;
            case 'suplente20vs20':
                squadType = 'suplente';
                break;
        }

        if (squadType) {
            const libre = listas[squadType].findIndex(p => p === '➤');
            if (libre !== -1) {
                listas[squadType][libre] = `@${nombreUsuario}`;
                await conn.sendMessage(m.chat, {
                    text: `✅ @${nombreUsuario} agregado a ${squadType === 'suplente' ? 'Suplentes' : `Escuadra ${squadType.slice(-1)}`}`,
                    mentions: [tag]
                });
            } else {
                await conn.sendMessage(m.chat, {
                    text: `⚠️ ${squadType === 'suplente' ? 'Suplentes' : `Escuadra ${squadType.slice(-1)}`} está llena`,
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

handler.customPrefix = /^(escuadra   1|escuadra   2|escuadra   3|escuadra   4|escuadra   5|suplente20vs20|\.20vs20.*)$/i
handler.command = new RegExp
handler.group = true

export default handler
