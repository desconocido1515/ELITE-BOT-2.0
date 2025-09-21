let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command);
  let chat = global.db.data.chats[m.chat];
  let user = global.db.data.users[m.sender];
  let bot = global.db.data.settings[conn.user.jid] || {};
  let type = (args[0] || '').toLowerCase();
  let isAll = false, isUser = false;

  switch (type) {
    case 'welcome':
    case 'bv':
    case 'bienvenida':
      if (!m.isGroup && !isOwner) return global.dfail('group', m, conn);
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn);
      chat.bienvenida = isEnable;
      break;

    case 'antiprivado2':
      if (!m.isGroup && !isOwner) return global.dfail('group', m, conn);
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn);
      chat.antiPrivate2 = isEnable;
      break;

    case 'antilag':
      chat.antiLag = isEnable;
      m.reply(`✅ Modo Anti-Lag ${isEnable? 'activado': 'desactivado'} correctamente.`);
      break;

    case 'autoread':
    case 'autoleer':
      isAll = true;
      if (!isROwner) return global.dfail('rowner', m, conn);
      global.opts['autoread'] = isEnable;
      break;

    case 'antispam':
      isAll = true;
      if (!isOwner) return global.dfail('owner', m, conn);
      bot.antiSpam = isEnable;
      break;

    case 'antinopor':
      isAll = true;
      if (!isOwner) return global.dfail('owner', m, conn);
      chat.antiLinkxxx = isEnable;
      break;

    case 'audios':
    case 'audiosbot':
    case 'botaudios':
      if (!m.isGroup && !isOwner) return global.dfail('group', m, conn);
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn);
      chat.audios = isEnable;
      break;

    case 'detect':
    case 'avisos':
      if (!m.isGroup && !isOwner) return global.dfail('group', m, conn);
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn);
      chat.detect = isEnable;
      break;

    case 'jadibotmd':
    case 'serbot':
    case 'subbots':
      isAll = true;
      if (!isOwner) return global.dfail('rowner', m, conn);
      bot.jadibotmd = isEnable;
      break;

    case 'restrict':
    case 'restringir':
      isAll = true;
      if (!isOwner) return global.dfail('rowner', m, conn);
      bot.restrict = isEnable;
      break;

    case 'document':
    case 'documento':
      isUser = true;
      user.useDocument = isEnable;
      break;

    case 'antilink':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
      chat.antiLink = isEnable;
      break;

    case 'antibot':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
      chat.antiBot = isEnable;
      break;

    case 'modoadmin':
    case 'soloadmin':
    case 'modeadmin':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
      chat.modoadmin = isEnable;
      break;

    case 'antiprivado':
      bot.antiPrivate = isEnable;
      break;

    case 'nsfw':
    case 'modohorny':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
      chat.nsfw = isEnable;
      break;

    case 'antiarabes':
    case 'antinegros':
    case 'antifakes':
    case 'onlylatinos':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
      chat.onlyLatinos = isEnable;
      break;

    default:
      if (!/[01]/.test(command)) return m.reply(`
~ CENTRO DE CONFIGURACIÓN

🌟 ¡Hola! 

Quizás usaste mal el comando.
usar los comandos :
.guia
.guia2

𝙀𝙡𝙞𝙩𝙚 𝘽𝙤𝙩 // 𝙋𝙧𝙤𝙮𝙚𝙘𝙩𝙤 𝙓
`.trim())
      throw false
  }

  // Aquí ponemos los textos bonitos según el ámbito
  let replyText = isAll
    ? `❱❱ 𝙀𝙇𝙄𝙏𝙀 𝘽𝙊𝙏 𝙂𝙇𝙊𝘽𝘼𝙇 ❰❰

⚙️ 𝙁𝙐𝙉𝘾𝙄𝙊́𝙉 | ${type} 
⚙️ 𝙀𝙎𝙏𝘼𝘿𝙊 | ${isEnable ? '𝘼𝘾𝙏𝙄𝙑𝘼𝘿𝙊' : '𝘿𝙀𝙎𝘼𝘾𝙏𝙄𝙑𝘼𝘿𝙊'} 
⚙️ 𝙀𝙉 𝙀𝙎𝙏𝙀 | 𝘽𝙊𝙏`
    : `❱❱ 𝙀𝙇𝙄𝙏𝙀 𝘽𝙊𝙏 𝙂𝙇𝙊𝘽𝘼𝙇 ❰❰

⚙️ 𝙁𝙐𝙉𝘾𝙄𝙊́𝙉 | ${type} 
⚙️ 𝙀𝙎𝙏𝘼𝘿𝙊 | ${isEnable ? '𝘼𝘾𝙏𝙄𝙑𝘼𝘿𝙊' : '𝘿𝙀𝙎𝘼𝘾𝙏𝙄𝙑𝘿𝙊'} 
⚙️ 𝙀𝙉 𝙀𝙎𝙏𝙀 | 𝙂𝙍𝙐𝙋𝙊`;

  m.reply(replyText);
}

handler.help = ['enable', 'disable', 'on', 'off'];
handler.tags = ['nable'];
handler.command = /^(enable|disable|on|off|1|0)$/i;

export default handler;
