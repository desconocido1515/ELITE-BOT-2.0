import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;

let handler = async (m, { conn }) => {
    const msgText = m.text?.toLowerCase();
    const groupId = m.chat;

    // Obtener la respuesta de los botones (si es que no se me crashea el juego)
    const response =
        m.message?.buttonsResponseMessage?.selectedButtonId ||
        m.message?.interactiveResponseMessage?.nativeFlowResponseButtonResponse?.id ||
        m.message?.interactiveResponseMessage?.buttonReplyMessage?.selectedId ||
        m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        msgText || '';

    // Flujo de comando .1vs1 (PA' QUE SE HUMILLEN)
    if (msgText?.startsWith('.1vs1')) {
        const buttons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "ACEPTO (PA' HUMILLARTE)", // Nadie lo hace xd
                    id: "acepto"
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "NEGADO (SOY NOOB)", // Seguro es bronce
                    id: "negado"
                })
            }
        ];

        const mensaje = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {},
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: {
                            text: `🔥 *MODO TÓXICO ACTIVADO* 🔥\n\n¿QUIÉN SE ATREVE A UN 1VS1? (O SOLO SABEN HUIR COMO RATAS?) 🐁💨\n───────────────\n*Si pierdes, borras el juego y te vas a jugar Candy Crush* 🍭💀`
                        },
                        footer: { text: "*Acepta si tienes huevos* 🥚" },
                        nativeFlowMessage: { buttons }
                    })
                }
            }
        }, {});

        await conn.relayMessage(m.chat, mensaje.message, {});
        return;
    }

    // Confirmación de respuesta "ACEPTO" (SORPRESA, ALGUIEN SE CREYÓ PRO)
    if (response === 'acepto') {
        const nombre = await conn.getName(m.sender);

        const buttons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "YO LA HAGO (PORQUE SOY PRO)", // Spoiler: No lo es
                    id: "yomismo"
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "NO TENGO SALA (SOY POBRE)", // Típico
                    id: "notengo"
                })
            }
        ];

        const mensaje = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        mentionedJid: [m.sender]
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: { text: `*¡JA! ${nombre} TE ENTERRASTE TU MISMO!* 😈\n\n*A ver, ¿quién pone la sala o solo sabes chupar experiencia?* 🍼` },
                        footer: { text: "*¿Pones sala o que?* 🐭" },
                        nativeFlowMessage: { buttons }
                    })
                }
            }
        }, {});

        await conn.relayMessage(m.chat, mensaje.message, {});
        return;
    }

    // Confirmación de respuesta "NEGADO" (COBARDES DETECTADOS)
    if (response === 'negado') {
        const nombre = await conn.getName(m.sender);
        await conn.sendMessage(m.chat, {
            text: `┏━━━━━━━━━━━━━━━━┓\n*${nombre} ES TAN NOOB QUE NI EL BOT LE JUEGA.*\n┗━━━━━━━━━━━━━━━━┛\n*Vete a practicar contra bots, baby* 🤖🍼`,
            mentions: [m.sender]
        });
        return;
    }

    // Respuesta al botón "Yomismo" (MENTIRA, NADIE TIENE SALA)
    if (response === 'yomismo') {
        await conn.sendMessage(m.chat, {
            text: `┏━━━━━━━━━━━━━━━━┓\n*FINALMENTE ALGUIEN CON HUEVOS* 🥚🔥\n\n@${m.sender.split('@')[0]}\n\n*Pero seguro se desconectan a medio juego* 📵💀\n*MANDA DATOS DE LA SALA DE UUUNA*`
        });
        return;
    }

    // Respuesta al botón "Notengo" (CLÁSICO)
    if (response === 'notengo') {
        await conn.sendMessage(m.chat, {
            text: `┏━━━━━━━━━━━━━━━━┓\n*¿PA' QUÉ ACEPTAS SI ERES POBRE?* �💸\n\n*Anda a vender dulces para que te compres una sala, rata* 🍬🐀`
        });
        return;
    }
};

handler.customPrefix = /^(acepto|negado|yomismo|notengo|\.1vs1.*)$/i;
handler.command = new RegExp;
handler.group = true;

export default handler;
