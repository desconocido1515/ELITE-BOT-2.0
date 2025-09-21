import * as fs from 'fs';
import { readFile } from 'fs/promises';
import fetch from 'node-fetch';

let handler = async (m, { conn, participants }) => {
    // Imagen épica de respaldo (FF estilo)
    let img = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://i.imgur.com/3pZ9X7L.jpg');
    let imgBuffer = await (await fetch(img)).buffer().catch(() => null);

    // Seleccionar víctima (excluyendo al bot)
    let targets = participants.filter(u => !u.id.startsWith(conn.user.jid.split(':')[0])).map(u => u.id);
    if (!targets.length) return m.reply("No hay noobs para banear 😔");
    let victim = targets[Math.floor(Math.random() * targets.length)];

    // Mensaje ULTRA-TÓXICO (formato FF)
    await conn.sendMessage(m.chat, {
        text: `🔥*¡ATENCIÓN! SE VA UN NOOB*🔥

@${victim.split('@')[0]} 
*DETECTADO COMO:*
📛 Rango: Hierro V (Bot)
💀 K/D: 0.0 (Muerto al spawn)
🐀 Actividad: Inactivo 
________________________

TIENES *30 SEGUNDOS* PARA:
☑️ CONFESAR TUS HACKS
☑️ PEDIR PERDÓN EN VOZ
☑️ ACEPTAR QUE ERES NOOB
________________________

*O SERÁS BANEADO COMO:*
🚮 Jugador fantasma
💣 Team killer
🤖 Bot de farmeo
________________________`,
        mentions: [victim]
    }, { quoted: m });

    // Ban después de 30 segundos
    setTimeout(async () => {
        try {
            await conn.groupParticipantsUpdate(m.chat, [victim], 'remove');
            await conn.sendMessage(m.chat, {
                text: `________________________
                
*@${victim.split('@')[0]}* ELIMINADO! 🚫

RAZÓN: *Más inútil que caja vacía* 📦
KDA: *0.0 (Patético)*
LOBBY: *Limpiado de noobs* 🧹

________________________`,
                mentions: [victim]
            }, { quoted: m });
        } catch {
            m.reply("Error: Seguro usaste VPN como campero 🛡️");
        }
    }, 30000);
};

handler.help = ['ffban'];
handler.tags = ['games'];
handler.command = /^(ffban|inactivoff|freefiretoxic)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
