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

    // Evitar expulsar si el enlace es del mismo grupo
    try {
      const thisGroupCode = await conn.groupInviteCode(m.chat);
      const thisGroupLink = `https://chat.whatsapp.com/${thisGroupCode}`;
      if (m.text.includes(thisGroupLink)) return true;
    } catch (e) {
      console.log('Error obteniendo código de invitación:', e);
    }

    // Aviso general
    let aviso = `⚠️ *Enlace externo detectado*\n\n*@${m.sender.split('@')[0]}*, no compartas enlaces de otros grupos o canales.`;
    
    // Si es admin, se muestra aviso especial
    if (isAdmin) {
      aviso += `\n\n❌ Eres admin, por lo que no serás expulsado.`;
    }

    // Enviar aviso
    await conn.reply(
      m.chat,
      aviso,
      m,
      { mentions: [m.sender] }
    );

    // Eliminar el mensaje del enlace
    await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {});

    // Expulsar al usuario solo si no es admin
    if (!isAdmin) {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
    }

  } catch (err) {
    console.error('Error en AntiLink:', err);
  }

  return true;
}
