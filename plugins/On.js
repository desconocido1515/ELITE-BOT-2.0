
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
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn);
          throw false;
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn);
        throw false;
      }
      chat.bienvenida = isEnable;
      break;

    case 'antiprivado2':
  if (!m.isGroup) {
    if (!isOwner) {
      global.dfail('group', m, conn);
      throw false;
}
} else if (!isAdmin) {
    global.dfail('admin', m, conn);
    throw false;
}
  chat.antiPrivate2 = isEnable;
  break;

    case 'antilag':
  chat.antiLag = isEnable;
  m.reply(`✅ Modo Anti-Lag ${isEnable? 'activado': 'desactivado'} correctamente.`);
  break;

    case 'autoread':
    case 'autoleer':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['autoread'] = isEnable;
      break;

    case 'antispam':
      isAll = true;
      if (!isOwner) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.antiSpam = isEnable;
      break;

     case 'antinopor':
      isAll = true;
      if (!isOwner) {
        global.dfail('owner', m, conn);
        throw false;
      }
      chat.antiLinkxxx = isEnable;
      break;

    case 'audios':
    case 'audiosbot':
    case 'botaudios':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn);
          throw false;
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn);
        throw false;
      }
      chat.audios = isEnable;
      break;

    case 'detect':
    case 'avisos':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn);
          throw false;
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn);
        throw false;
      }
      chat.detect = isEnable;
      break;

    case 'jadibotmd':
    case 'serbot':
    case 'subbots':
      isAll = true;
      if (!isOwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      bot.jadibotmd = isEnable;
      break;

    case 'restrict':
    case 'restringir':
      isAll = true;
      if (!isOwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      bot.restrict = isEnable;
      break;

    case 'document':
    case 'documento':
      isUser = true;
      user.useDocument = isEnable;
      break;

    case 'antilink':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiLink = isEnable;
      break;

    case 'antibot':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiBot = isEnable;
      break;

    case 'modoadmin':
    case 'soloadmin':
    case 'modeadmin':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.modoadmin = isEnable;
      break;

    case 'antiprivado':
      // Ahora cualquiera puede activarlo o desactivarlo
      bot.antiPrivate = isEnable;
      break;

    case 'nsfw':
    case 'modohorny':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.nsfw = isEnable;
      break;

    case 'antiarabes':
    case 'antinegros':
    case 'antifakes':
    case 'onlylatinos':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
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

m.reply(`⚠️ *sᥲsᥙkᥱ ᑲ᥆𝗍 mძ 🌀 Notificación* ⚠️

💎 *Comando ejecutado:* *${type}*
👤 *Estado actual:* *${isEnable? 'Activado ✅': 'Desactivado ❌'}*
📍 *Ámbito:* ${isAll? '*Todo el Bot* 🌐': isUser? '*Usuario específico* 👥': '*Este Chat* 💬'}

🚀 *Muchas gracias por usar sᥲsᥙkᥱ ᑲ᥆𝗍 mძ 🌀*🎖️`)
}

handler.help = ['enable', 'disable', 'on', 'off']
handler.tags = ['nable']
handler.command = /^(enable|disable|on|off|1|0)$/i

export default handler
