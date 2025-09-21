let handler = async (m, { conn, text, command, usedPrefix }) => {
  const warnLimit = 3;
  const img = 'https://i.imgur.com/DvHoMc3.jpg';
  const users = global.db.data.users;
  const isGroup = m.isGroup;

  if (!isGroup) return m.reply('Este comando solo está disponible en grupos.');

  let who;
  if (command !== 'listaadv') {
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted?.sender;
    if (!who) return m.reply(`*ORDENES RECIBIDAS ☑️*\nDebe etiquetar o responder a un usuario válido.`);
  }

  const user = who ? (users[who] || (users[who] = { warn: 0 })) : null;

  if (command == 'adv') {
    let motivo = text.replace(/@\d+/, '').trim() || 'Motivo no especificado';
    user.warn += 1;
    await m.reply(
      `*ORDENES RECIBIDAS ☑️*\nEl usuario *@${who.split`@`[0]}* ha sido advertido.\n\n*Motivo:* ${motivo}\n*Estado actual:* ${user.warn}/${warnLimit} advertencias.`,
      null, { mentions: [who] });

    if (user.warn >= warnLimit) {
      user.warn = 0;
      await m.reply(
        `*@${who.split`@`[0]}* TE LO ADVERTÍ 3 VECES , FUERA DE AQUI. `,
        null, { mentions: [who] });
      await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
    }
  }

  if (command == 'quitaradv') {
    if (user.warn > 0) {
      user.warn -= 1;
      await m.reply(
        `*ORDENES RECIBIDAS ☑️*\nSe eliminó una advertencia para *@${who.split`@`[0]}*.\nAdvertencias restantes: ${user.warn}/${warnLimit}`,
        null, { mentions: [who] });
    } else {
      await m.reply(
        `*ORDENES RECIBIDAS ☑️*\nEl usuario *@${who.split`@`[0]}* no tiene advertencias en este grupo.`,
        null, { mentions: [who] });
    }
  }

  if (command == 'listaadv') {
    let lista = Object.entries(users)
      .filter(([jid, u]) => u.warn > 0)
      .map(([jid, u], i) => `${i + 1}. @${jid.split`@`[0]} → ${u.warn}/${warnLimit} advertencias`)
      .join('\n');

    if (!lista) lista = 'Actualmente, ningún miembro tiene advertencias activas.';
    await m.reply(`*ORDENES RECIBIDAS ☑️*\n*Lista de miembros con advertencias:*\n\n${lista}`, null, {
      mentions: Object.keys(users).filter(jid => users[jid].warn > 0),
    });
  }
};

handler.command = /^(adv|quitaradv|listaadv)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
