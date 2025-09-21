import fetch from 'node-fetch';

let handler = m => m;

handler.before = async function (m, { conn }) {
  if (!m.messageStubType || !m.isGroup) return;

  let chat = global.db.data.chats[m.chat];
  if (!chat?.welcome) return; // Verifica si welcome está activado

  const STICKER_URLS = [
    'https://files.catbox.moe/o58tbw.webp',
    'https://files.catbox.moe/0boonh.webp'
  ];

  const AUDIO_SALIDA_URLS = [
    'https://files.catbox.moe/2olqg1.ogg',
    'https://files.catbox.moe/k8znal.ogg',
    'https://files.catbox.moe/oj61hq.ogg'
  ];
  const AUDIO_BIENVENIDA_URL = 'https://files.catbox.moe/kgykxt.ogg';
  const IMG_PREDETERMINADA = 'https://n.uguu.se/vldhWGbB.jpg';

  try {
    let userJid;
    if ([28, 32].includes(m.messageStubType)) {
      // Usuario salió
      userJid = m.key.participant;
    } else if (m.messageStubType === 27) {
      // Usuario entró
      userJid = m.messageStubParameters?.[0];
    } else {
      return;
    }

    const user = `@${userJid.split('@')[0]}`;

    // Obtener foto de perfil del usuario o predeterminada
    let imgBuffer;
    try {
      const ppUrl = await conn.profilePictureUrl(userJid, 'image');
      imgBuffer = { url: ppUrl };
    } catch {
      imgBuffer = { url: IMG_PREDETERMINADA };
    }

    // RETRASO para que WhatsApp procese correctamente
    setTimeout(async () => {
      if ([28, 32].includes(m.messageStubType)) {
        // SALIDA: sticker o audio aleatorio
        const isSticker = Math.random() < 0.5;
        if (isSticker) {
          const url = STICKER_URLS[Math.floor(Math.random() * STICKER_URLS.length)];
          const sticker = await (await fetch(url)).buffer();
          await conn.sendMessage(m.chat, { sticker });
        } else {
          const url = AUDIO_SALIDA_URLS[Math.floor(Math.random() * AUDIO_SALIDA_URLS.length)];
          const audio = await (await fetch(url)).buffer();
          await conn.sendMessage(m.chat, {
            audio,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
          });
        }

        // También enviar imagen de despedida
        await conn.sendMessage(m.chat, {
          image: imgBuffer,
          caption: `🚶‍♂️ ${user} ha salido del grupo.`
        });
      }

      if (m.messageStubType === 27) {
        // ENTRADA: enviar imagen + audio de bienvenida
        await conn.sendMessage(m.chat, {
          image: imgBuffer,
          caption: `🎉 ¡Bienvenido/a ${user}! 🎉`
        });

        const audio = await (await fetch(AUDIO_BIENVENIDA_URL)).buffer();
        await conn.sendMessage(m.chat, {
          audio,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
        });
      }
    }, 2000);

  } catch (e) {
    console.error('Error manejando entrada/salida de grupo:', e);
  }
};

export default handler;
