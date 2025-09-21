import fetch from 'node-fetch';

const linkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,30})/i;

const STICKER_WARNING_URLS = [
  'https://files.catbox.moe/o58tbw.webp',
  'https://files.catbox.moe/0boonh.webp'
];

const AUDIO_WARNING_URLS = [
  'https://files.catbox.moe/2olqg1.ogg',
  'https://files.catbox.moe/k8znal.ogg',
  'https://files.catbox.moe/oj61hq.ogg'
];

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  try {
    if (m.isBaileys || m.fromMe) return true; // Ignorar mensajes del bot
    if (!m.isGroup) return true; // Solo en grupos
    if (!m.text) return true; // Ignorar mensajes sin texto

    const chat = global.db.data.chats[m.chat];
    if (!chat?.antiLink) return true; // AntiLink desactivado

    const isGroupLink = linkRegex.exec(m.text);
    const isChannelLink = channelLinkRegex.exec(m.text);
    if (!isGroupLink && !isChannelLink) return true; // No es enlace
    if (isAdmin) return true; // Ignorar admins

    if (!isBotAdmin) {
      await conn.reply(
        m.chat,
        `⚠️ Enlace detectado, pero necesito ser administrador para tomar acción.`,
        m,
        { mentions: [m.sender] }
      );
      return true;
    }

    // Evitar expulsar si el enlace es del mismo grupo
    try {
      const thisGroupCode = await conn.groupInviteCode(m.chat);
      const thisGroupLink = `https://chat.whatsapp.com/${thisGroupCode}`;
      if (m.text.includes(thisGroupLink)) return true;
    } catch (e) {
      console.log('Error obteniendo código de invitación:', e);
    }

    // Enviar advertencia primero
    await conn.reply(
      m.chat,
      `⚠️ *Enlace externo detectado*\n\n*@${m.sender.split('@')[0]}*, no compartas enlaces de otros grupos o canales.`,
      m,
      { mentions: [m.sender] }
    );

    // Después de 2 segundos, enviar audio o sticker aleatorio
    setTimeout(async () => {
      const sendSticker = Math.random() < 0.5; // 50% chance
      if (sendSticker) {
        const url = STICKER_WARNING_URLS[Math.floor(Math.random() * STICKER_WARNING_URLS.length)];
        const stickerBuffer = await (await fetch(url)).buffer();
        await conn.sendMessage(m.chat, { sticker: stickerBuffer });
      } else {
        const url = AUDIO_WARNING_URLS[Math.floor(Math.random() * AUDIO_WARNING_URLS.length)];
        const audioBuffer = await (await fetch(url)).buffer();
        await conn.sendMessage(m.chat, {
          audio: audioBuffer,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
        });
      }
    }, 2000);

    // Eliminar el mensaje del enlace
    await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {});

    // Expulsar usuario
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});

  } catch (err) {
    console.error('Error en AntiLink:', err);
  }

  return true;
}
