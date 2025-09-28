let handler = async (m, { conn, usedPrefix, command, text }) => {
    let user = null;

    if (m.quoted) {
        user = m.quoted.sender;
    } else if (text) {
     
        let numberMatch = text.match(/\d+/);
        if (numberMatch && numberMatch[0].length >= 11 && numberMatch[0].length <= 13) {
            user = numberMatch[0] + '@s.whatsapp.net';
        } else {
            return conn.reply(m.chat, `*🌀 Por favor, responda al mensaje de un aquel usuario que le quitarás admin* .`, m,rcanal);
        }
    } else if (m.mentionedJid && m.mentionedJid[0]) {
        user = m.mentionedJid[0];
    } else {
        return conn.reply(m.chat, `*🌀 Por favor, responda al mensaje de un usuario aquel que le quitaras admin.*`, m,rcanal);
    }

    if (!user) {
        return conn.reply(m.chat, `*🌀 No se pudo identificar al usuario.*`, m);
    }

    try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
        m.reply(`✅ Usuario degradado con éxito.`);
    } catch (e) {
        console.error(e);
        m.reply(`❌ Ha ocurrido un error al intentar degradar al usuario.`);
    }
};

handler.help = ['demote'];
handler.tags = ['group'];
handler.command = ['demote', 'degradar'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.fail = null;

export default handler;
