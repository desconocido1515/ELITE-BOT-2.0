import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, groupMetadata }) {
  try {
    if (!m.messageStubType || !m.isGroup) return true;

    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat?.bienvenida) return true;

    const fkontak = {
      key: {
        participants: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast',
        fromMe: false,
        id: 'Halo'
      },
      message: {
        contactMessage: {
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${
            conn.user.jid.split('@')[0]
          }:${conn.user.jid.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
        }
      },
      participant: '0@s.whatsapp.net'
    };

    let userJid;
    switch (m.messageStubType) {
      case WAMessageStubType.GROUP_PARTICIPANT_ADD:
      case WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
        userJid = m.messageStubParameters?.[0];
        break;
      case WAMessageStubType.GROUP_PARTICIPANT_LEAVE:
        userJid = m.key.participant;
        break;
      default:
        return true;
    }

    if (!userJid) return true;

    const user = `@${userJid.split('@')[0]}`;
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || '📜 Sin descripción disponible';
    const IMG_PREDETERMINADA = 'https://n.uguu.se/vldhWGbB.jpg';

    // Intentar obtener foto de perfil del usuario
    let imgBuffer;
    try {
      const ppUrl = await conn.profilePictureUrl(userJid, 'image');
      imgBuffer = { url: ppUrl };
    } catch {
      imgBuffer = { url: IMG_PREDETERMINADA };
    }

    const { customWelcome, customBye, customKick } = chat;

    // Stickers y audios aleatorios
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

    const sendAudio = async (url) => {
      try {
        const audioBuffer = await fetch(url).then(res => res.buffer());
        await conn.sendMessage(m.chat, {
          audio: audioBuffer,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
        }, { quoted: fkontak });
      } catch (err) {
        console.error('❌ Error al enviar el audio:', err);
      }
    };

    // Función para enviar sticker aleatorio
    const sendSticker = async () => {
      try {
        const url = STICKER_URLS[Math.floor(Math.random() * STICKER_URLS.length)];
        const sticker = await (await fetch(url)).buffer();
        await conn.sendMessage(m.chat, { sticker });
      } catch (err) {
        console.error('❌ Error al enviar sticker:', err);
      }
    };

    // RETRASO para asegurar que WhatsApp procese los mensajes
    setTimeout(async () => {
      // BIENVENIDA
      if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
        const welcomeText = customWelcome
          ? customWelcome.replace(/@user/gi, user).replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc)
          : `🎉 *¡HOLA ${user}!* 🎉\n\nBienvenido/a a *${groupName}*.\n\n📚 *Sobre nosotros:*\n_${groupDesc}_\n\n🌟 ¡Esperamos que disfrutes tu estancia!`;

        // Primero enviar imagen + texto
        await conn.sendMessage(m.chat, {
          image: imgBuffer,
          caption: welcomeText,
          mentions: [userJid]
        }, { quoted: fkontak });

        // Después enviar audio de bienvenida
        await sendAudio(AUDIO_BIENVENIDA_URL);
      }

      // DESPEDIDA
      if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
        const goodbyeText = customBye
          ? customBye.replace(/@user/gi, user).replace(/@group/gi, groupName)
          : `😂 *Te extrañaremos pendejo* 🖕🏻\n\nGracias por haber formado parte de *${groupName}*`;

        // Primero enviar imagen + texto
        await conn.sendMessage(m.chat, {
          image: imgBuffer,
          caption: goodbyeText,
          mentions: [userJid]
        }, { quoted: fkontak });

        // Después enviar sticker o audio aleatorio
        if (Math.random() < 0.5) {
          await sendSticker();
        } else {
          const audioUrl = AUDIO_SALIDA_URLS[Math.floor(Math.random() * AUDIO_SALIDA_URLS.length)];
          await sendAudio(audioUrl);
        }
      }

      // EXPULSIÓN
      if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
        const kickText = customKick
          ? customKick.replace(/@user/gi, user).replace(/@group/gi, groupName)
          : `😂 *Te extrañaremos pendejo* 🖕🏻\n\n*${user}* ha sido expulsado de *${groupName}*`;

        // Primero enviar imagen + texto
        await conn.sendMessage(m.chat, {
          image: imgBuffer,
          caption: kickText,
          mentions: [userJid]
        }, { quoted: fkontak });

        // Después enviar sticker o audio aleatorio
        if (Math.random() < 0.5) {
          await sendSticker();
        } else {
          const audioUrl = AUDIO_SALIDA_URLS[Math.floor(Math.random() * AUDIO_SALIDA_URLS.length)];
          await sendAudio(audioUrl);
        }
      }
    }, 2000);

  } catch (error) {
    console.error('❌ Error general en la función de bienvenida/despedida/expulsión:', error);
  }
}
