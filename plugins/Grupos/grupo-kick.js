let handler = async (m, { conn, participants, usedPrefix, command }) => {
  if (!global.db.data.settings[conn.user.jid].restrict) 
    throw '*[ ⚠️ ] MI CREADOR TIENE DESACTIVADO ESTA FUNCIÓN.*\n💻 593993370003';

  let kicktext = `⚠️ *ETIQUETA A LA PERSONA O RESPONDE SU MENSAJE PARA ELIMINARLO DE ESTE GRUPO.*`;
  if (!m.mentionedJid[0] && !m.quoted) 
    return m.reply(kicktext, m.chat, { mentions: conn.parseMention(kicktext) });

  let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;
  let owr = m.chat.split`-`[0];

  // Mensaje de cuenta regresiva
  await conn.sendMessage(
    m.chat,
    { 
      text: `*ADIOS BASURA🤮*\n@${user.split('@')[0]}\n\n *¡Tienes 15 segundos para decir tus últimas palabras!* ⏳`,
      mentions: [user]
    }
  );

  // Espera 15 segundos antes de kickear
  setTimeout(async () => {
    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
      await conn.sendMessage(
        m.chat,
        { 
          text: `Le mandamos botando a esta basura\n@${user.split('@')[0]}\n\nOjalá no vuelva.`,
          mentions: [user]
        }
      );
    } catch (error) {
      console.error("Error al kickear:", error);
    }
  }, 15000); // 15 segundos
};

handler.command = /^(kick|echar|hechar|ban|rip|basura)$/i;
handler.admin = true;
handler.group = true;
handler.botAdmin = true;
handler.register = false;
export default handler;
