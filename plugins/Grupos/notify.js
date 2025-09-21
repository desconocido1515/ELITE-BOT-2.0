import * as fs from 'fs';

const handler = async (m, { conn, text, participants }) => {
  try {
    const users = participants.map(u => conn.decodeJid(u.id));
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || '';
    const isMedia = /image|video|sticker|audio/.test(mime);

    const finalText = (text || quoted?.text || '').trim();
    const fullMessage = finalText + '\nㅤㅤㅤㅤㅤㅤㅤㅤ𝔈𝔩𝔦𝔱𝔢 𝔅𝔬𝔱 𝔊𝔩𝔬𝔟𝔞𝔩';

    const options = {
      mentions: users,
      quoted: m
    };

    if (isMedia) {
      const media = await quoted.download?.();
      const caption = fullMessage;

      if (quoted.mtype === 'imageMessage') {
        await conn.sendMessage(m.chat, { image: media, caption, ...options });
      } else if (quoted.mtype === 'videoMessage') {
        await conn.sendMessage(m.chat, { video: media, caption, mimetype: 'video/mp4', ...options });
      } else if (quoted.mtype === 'audioMessage') {
        await conn.sendMessage(m.chat, { audio: media, mimetype: 'audio/mpeg', ptt: true, ...options });
      } else if (quoted.mtype === 'stickerMessage') {
        await conn.sendMessage(m.chat, { sticker: media, ...options });
      }
    } else {
      await conn.sendMessage(m.chat, {
        text: fullMessage,
        mentions: users
      }, { quoted: m });
    }

    // Reacción al mensaje original del usuario
    await conn.sendMessage(m.chat, {
      react: {
        text: '🗣️',
        key: m.key
      }
    });

  } catch (e) {
    console.error('Error en el comando hidetag:', e);
    const usersFallback = participants.map(u => conn.decodeJid(u.id));
    await conn.sendMessage(m.chat, {
      text: (text || '') + '\nㅤㅤㅤㅤㅤㅤㅤㅤ𝔈𝔩𝔦𝔱𝔢 𝔅𝔬𝔱 𝔊𝔩𝔬𝔟𝔞𝔩',
      mentions: usersFallback
    }, { quoted: m });
  }
};

handler.help = ['hidetag'];
handler.tags = ['group'];
handler.command = /^(hidetag|notify|notificar|noti|n|avisos|aviso)$/i;
handler.group = true;
handler.admin = true;

export default handler;
