import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;

let listasGrupos = new Map();
let mensajesGrupos = new Map();
let parejasConfirmadas = new Map();

// --- FUNCIONES AUXILIARES --- (se mantienen igual)
const getListasGrupo = (groupId) => {
    if (!listasGrupos.has(groupId)) {
        listasGrupos.set(groupId, { aceptar: ['➤'], rechazar: ['➤'] });
    }
    return listasGrupos.get(groupId);
};

const reiniciarListas = (groupId) => {
    listasGrupos.set(groupId, { aceptar: ['➤'], rechazar: ['➤'] });
};

// --- HANDLER PRINCIPAL ---
let handler = async (m, { conn }) => {
    const msgText = m.text?.toLowerCase();
    const groupId = m.chat;

    // Detectar respuesta de botones (se mantiene igual)
    const response = m.message?.buttonsResponseMessage?.selectedButtonId || 
                    m.message?.interactiveResponseMessage?.nativeFlowResponseButtonResponse?.id || 
                    msgText || '';

    // --- COMANDO TERMINAR ---
    if (response === 'terminar' || msgText === 'terminar') {
        const parejas = parejasConfirmadas.get(groupId) || [];
        const pareja = parejas.find(p => p[0] === m.sender || p[1] === m.sender);
        
        if (pareja) {
            parejasConfirmadas.set(groupId, parejas.filter(p => p[0] !== m.sender && p[1] !== m.sender));
            await conn.sendMessage(m.chat, {
                text: `💔 *¡SE ACABÓ!*\n» "Adiós, espero no verte... aunque sé que volverás 😈\n» Gracias por los recuerdos (y los dramas)."`,
                mentions: pareja
            });
        } else {
            await conn.sendMessage(m.chat, { 
                text: "❌ *¿Terminar qué?*\nNi novio/a tienes, mi ciela. 😂" 
            });
        }
        return;
    }

    // --- COMANDO ACEPTAR/RECHAZAR ---
    if (['aceptar', 'rechazar'].includes(response)) {
        const tag = m.sender;
        const mensajeGuardado = mensajesGrupos.get(groupId);
        const proponente = mensajeGuardado?.proponente;
        
        if (!proponente || tag !== mensajeGuardado?.propuesto) {
            await conn.sendMessage(m.chat, { 
                text: "🚫 *Oops*\nEsta declaración no es para ti, sapito. 🐸" 
            });
            return;
        }

        if (proponente === tag) {
            await conn.sendMessage(m.chat, { 
                text: response === 'aceptar' 
                    ? "🤡 *¿Auto-aceptarse?*\nNo seas triste, sal a conocer gente." 
                    : "💢 *¿Auto-rechazo?*\nAl menos date una oportunidad." 
            });
            return;
        }

        if (response === 'aceptar') {
            if (!parejasConfirmadas.has(groupId)) parejasConfirmadas.set(groupId, []);
            parejasConfirmadas.get(groupId).push([proponente, tag]);
            
            const nombre1 = await conn.getName(tag);
            const nombre2 = await conn.getName(proponente);

            const buttons = [
                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Terminar", id: "terminar" }) },
                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Parejas", id: "parejas" }) }
            ];

            const mensaje = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: { deviceListMetadata: {}, mentionedJid: [proponente, tag] },
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            body: { 
                                text: `🎉 *¡NOVIOS!*\n» ${nombre1} y ${nombre2} ahora son pareja.\n» Si rompen, el grupo los funa. 🔫` 
                            },
                            footer: { text: "💌 Usa *terminar* cuando te aburras" },
                            nativeFlowMessage: { buttons }
                        })
                    }
                }
            }, {});

            await conn.relayMessage(m.chat, mensaje.message, {});
        } else {
            await conn.sendMessage(m.chat, { 
                text: `💔 *RECHAZADO/A*\n» ${await conn.getName(tag)} dijo NO.\n» A llorar al rincón, ${await conn.getName(proponente)}. 😢`,
                mentions: [proponente]
            });
        }

        mensajesGrupos.delete(groupId);
        return;
    }

    // --- COMANDO .SERNOVIOS ---
    if (msgText?.startsWith('.sernovios')) {
        const mentionedJid = m.mentionedJid?.[0];
        if (!mentionedJid) {
            await conn.sendMessage(m.chat, { 
                text: "❌ *Menciona a alguien*\nEjemplo: .sernovios @usuario" 
            });
            return;
        }

        if (mentionedJid === m.sender) {
            await conn.sendMessage(m.chat, { 
                text: "🤡 *Auto-amor*\nNo puedes ser tu propio novio, eso es deprimente." 
            });
            return;
        }

        const parejas = parejasConfirmadas.get(groupId) || [];
        if (parejas.some(par => par.includes(m.sender) || par.includes(mentionedJid))) {
            await conn.sendMessage(m.chat, { 
                text: "⚡ *Infiel detectado*\nYa tienes pareja, ¿o te gusta el drama? 👀" 
            });
            return;
        }

        const nombreRemitente = await conn.getName(m.sender);
        const nombreMencionado = await conn.getName(mentionedJid);

        mensajesGrupos.set(groupId, { proponente: m.sender, propuesto: mentionedJid });

        const buttons = [
            { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Aceptar", id: "aceptar" }) },
            { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Rechazar", id: "rechazar" }) }
        ];

        const mensaje = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, mentionedJid: [mentionedJid] },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: { 
                            text: `💘 *¡DECLARACIÓN!*\n» ${nombreRemitente} quiere ser tu novio/a.\n» Si aceptas, serás suyo/a... si no, igual. 😏` 
                        },
                        footer: { text: "💌 Responde con *aceptar* o *rechazar*" },
                        nativeFlowMessage: { buttons }
                    })
                }
            }
        }, {});

        await conn.relayMessage(m.chat, mensaje.message, {});
        return;
    }

    // --- COMANDO PAREJAS ---
    if (response === 'parejas' || msgText === 'parejas') {
        const parejas = parejasConfirmadas.get(groupId) || [];
        if (parejas.length === 0) {
            await conn.sendMessage(m.chat, { 
                text: "💔 *No hay parejas*\nEn este grupo solo hay solteros desesperados. 😂" 
            });
            return;
        }

        let lista = "💑 *Parejas del grupo:*\n";
        for (const [p1, p2] of parejas) {
            lista += `» ${await conn.getName(p1)} 💕 ${await conn.getName(p2)}\n`;
        }

        await conn.sendMessage(m.chat, { text: lista.trim() });
        return;
    }
};

handler.customPrefix = /^(aceptar|rechazar|terminar|parejas|\.sernovios.*)$/i;
handler.command = new RegExp;
handler.group = true;

export default handler;
