const linkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,30})/i;

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

    // Eliminar mensaje
    await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {});

    // Notificar expulsión
    await conn.reply(
      m.chat,
      `⚠️ *Enlace externo detectado*\n\n*@${m.sender.split('@')[0]}* ha sido eliminado por compartir enlaces externos.`,
      m,
      { mentions: [m.sender] }
    );

    // Expulsar usuario
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});

  } catch (err) {
    console.error('Error en antiLink:', err);
  }

  return true;
}
