import axios from 'axios';

const handler = async (m, { conn }) => {
  // Determina quién es el usuario (mencionado o quien envió el mensaje)
  const who = m.mentionedJid && m.mentionedJid[0] 
    ? m.mentionedJid[0] 
    : m.fromMe 
      ? conn.user.jid 
      : m.sender;
  
  // Obtiene la URL de la imagen de perfil del usuario
  let avatarUrl = await conn.profilePictureUrl(who, 'image').catch((_) => 'https://telegra.ph/file/24fa902ead26340f3df2c.png');

  try {
    // Llama a la API para generar una imagen con fondo arcoíris
    const response = await axios.get(`https://some-random-api.com/canvas/rainbow?avatar=${avatarUrl}`, { responseType: 'arraybuffer' });

    // Convierte la respuesta binaria a un buffer
    const imageBuffer = Buffer.from(response.data, 'binary');

    // Envía la imagen con fondo arcoíris al chat
    await conn.sendFile(m.chat, imageBuffer, 'gay.png', '*🏳️‍🌈 𝙼𝙸𝚁𝙴𝙽 𝙰 𝙴𝚂𝚃𝙴 𝙶𝙰𝚈 🏳️‍🌈*', m);
  } catch (error) {
    console.error('Error al obtener la imagen:', error);

    // Enviar mensaje de error si algo falla
    await conn.sendMessage(m.chat, { text: 'Hubo un error al generar la imagen, por favor intenta de nuevo más tarde.' }, { quoted: m });
  }
};

handler.help = ['gay'];
handler.tags = ['maker'];
handler.command = /^(gay)$/i;

export default handler;
