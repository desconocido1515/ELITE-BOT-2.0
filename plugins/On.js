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

    // Aquí van los demás casos según tu código original...
    // ...manteniendo toda la lógica que ya tenías

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

  // Texto adaptado al estilo que pasaste
  let replyText = '';

  if (isAll) {
    replyText = `
❱❱ 𝙀𝙇𝙄𝙏𝙀 𝘽𝙊𝙏 𝙂𝙇𝙊𝘽𝘼𝙇 ❰❰

⚙️ 𝙁𝙐𝙉𝘾𝙄𝙊́𝙉 | ${type} 
⚙️ 𝙀𝙎𝙏𝘼𝘿𝙊 | ${isEnable ? '𝘼𝘾𝙏𝙄𝙑𝘼𝘿𝙊' : '𝘿𝙀𝙎𝘼𝘾𝙏𝙄𝙑𝘼𝘿𝙊'} 
⚙️ 𝙀𝙉 𝙀𝙎𝙏𝙀 | 𝘽𝙊𝙏
❰❰ 𝙀𝙇𝙄𝙏𝙀 𝘽𝙊𝙏 𝙂𝙇𝙊𝘽𝘼𝙇 ❱❱
`.trim();
  } else {
    replyText = `
❱❱ 𝙀𝙇𝙄𝙏𝙀 𝘽𝙊𝙏 𝙂𝙇𝙊𝘽𝘼𝙇 ❰❰

⚙️ 𝙁𝙐𝙉𝘾𝙄𝙊́𝙉 | ${type} 
⚙️ 𝙀𝙎𝙏𝘼𝘿𝙊 | ${isEnable ? '𝘼𝘾𝙏𝙄𝙑𝘼𝘿𝙊' : '𝘿𝙀𝙎𝘼𝘾𝙏𝙄𝙑𝘼𝘿𝙊'} 
⚙️ 𝙀𝙉 𝙀𝙎𝙏𝙀 | 𝙂𝙍𝙐𝙋𝙊
❰❰ 𝙀𝙇𝙄𝙏𝙀 𝘽𝙊𝙏 𝙂𝙇𝙊𝘽𝘼𝙇 ❱❱
`.trim();
  }

  m.reply(replyText);
}

handler.help = ['enable', 'disable', 'on', 'off'];
handler.tags = ['nable'];
handler.command = /^(enable|disable|on|off|1|0)$/i;

export default handler;
