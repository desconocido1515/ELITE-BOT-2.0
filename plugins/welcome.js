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
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL=${
            conn.user.jid.split('@')[0]
          }:${conn.user.jid.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
        }
      },
      participant: '0@s.whatsapp.net'
    };

    let userJid;
    switch (m.messageStubType) {
      // ----------------------------
      // ENUMERACIÓN DE EVENTOS
      // ----------------------------
      case WAMessageStubType.GROUP_PARTICIPANT_ADD: // 27 → Usuario entró al grupo
      case WAMessageStubType.GROUP_PARTICIPANT_REMOVE: // 29 → Usuario expulsado
        userJid = m.messageStubParameters?.[0];
        break;
      case WAMessageStubType.GROUP_PARTICIPANT_LEAVE: // 28 → Usuario salió voluntariamente
        userJid = m.key.participant;
        break;
      default:
        return true;
    }

    if (!userJid) return true;

    const user = `@${userJid.split('@')[0]}`;
    const groupName = groupMetadata.subject;
    const IMG_PREDETERMINADA = 'https://n.uguu.se/vldhWGbB.jpg';

    // Obtener foto de perfil del usuario o imagen predeterminada
    let imgBuffer;
    try {
      const ppUrl = await conn.profilePictureUrl(userJid, 'image');
      imgBuffer = { url: ppUrl };
    } catch {
      imgBuffer = { url: IMG_PREDETERMINADA };
    }

    // Stickers y audios
    const STICKER_URLS = [
      'https://files.catbox.moe/o58tbw.webp',
      'https://files.catbox.moe/0boonh.webp'
    ];

    const AUDIO_BIENVENIDA_URL = 'https://files.catbox.moe/kgykxt.ogg';
    const AUDIO_SALIDA_URLS = [
      'https://files.catbox.moe/2olqg1.ogg',
      'https://files.catbox.moe/k8znal.ogg',
      'https://files.catbox.moe/oj61hq.ogg'
    ];

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

    const sendSticker = async () => {
      try {
        const url = STICKER_URLS[Math.floor(Math.random() * STICKER_URLS.length)];
        const sticker = await (await fetch(url)).buffer();
        await conn.sendMessage(m.chat, { sticker });
      } catch (err) {
        console.error('❌ Error al enviar sticker:', err);
      }
    };

    setTimeout(async () => {
      // Actualizar metadata del grupo en tiempo real
      const updatedGroup = await conn.groupMetadata(m.chat);
      const memberCount = updatedGroup.participants.length;

      // ----------------------------
      // BIENVENIDA
      // ----------------------------
      if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
        const welcomeText = `╭━━━━━━━━⋆⋆━━━━━━━━─
┃ ⏤͟͟͞͞𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗢 🌟
┃ 👤 ${user}
┃ 🏆 𝗖𝗟𝗔𝗡 : 
┃ ${groupName}
┃ 📊 Integrantes actuales: ${memberCount}
╰━━━━━━━━⋆⋆━━━━━━━━─`;

        await conn.sendMessage(m.chat, { image: imgBuffer, caption: welcomeText, mentions: [userJid] }, { quoted: fkontak });
        await sendAudio(AUDIO_BIENVENIDA_URL);
      }

      // ----------------------------
      // DESPEDIDA
      // ----------------------------
      if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
        const goodbyeText = `╭━━━━━━━━⋆⋆━━━━━━━━─
┃ 𝗦𝗘 𝗦𝗔𝗟𝗜𝗢 𝗨𝗡𝗔 𝗕𝗔𝗦𝗨𝗥𝗔.
┃ -1 𝗜𝗡𝗦𝗘𝗥𝗩𝗜𝗕𝗟𝗘 🚮
┃ ${user}
┃ 𝗘𝗦𝗖𝗨𝗣𝗔𝗡𝗟𝗘 𝗘𝗡 𝗘𝗦𝗔 𝗖𝗔𝗥𝗔. 
┃ 📊 Integrantes actuales: ${memberCount}
╰━━━━━━━━⋆⋆━━━━━━━━─`;

        await conn.sendMessage(m.chat, { image: imgBuffer, caption: goodbyeText, mentions: [userJid] }, { quoted: fkontak });

        if (Math.random() < 0.5) {
          await sendSticker();
        } else {
          const audioUrl = AUDIO_SALIDA_URLS[Math.floor(Math.random() * AUDIO_SALIDA_URLS.length)];
          await sendAudio(audioUrl);
        }
      }

      // ----------------------------
      // EXPULSIÓN
      // ----------------------------
      if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
        const kickText = `╭━━━━━━━━⋆⋆━━━━━━━━─
┃ 𝗦𝗘 𝗦𝗔𝗟𝗜𝗢 𝗨𝗡𝗔 𝗕𝗔𝗦𝗨𝗥𝗔.
┃ -1 𝗜𝗡𝗦𝗘𝗥𝗩𝗜𝗕𝗟𝗘 🚮
┃ ${user}
┃ 𝗘𝗦𝗖𝗨𝗣𝗔𝗡𝗟𝗘 𝗘𝗡 𝗘𝗦𝗔 𝗖𝗔𝗥𝗔. 
┃ 📊 Integrantes actuales: ${memberCount}
╰━━━━━━━━⋆⋆━━━━━━━━─`;

        await conn.sendMessage(m.chat, { image: imgBuffer, caption: kickText, mentions: [userJid] }, { quoted: fkontak });

        if (Math.random() < 0.5) {
          await sendSticker();
        } else {
          const audioUrl = AUDIO_SALIDA_URLS[Math.floor(Math.random() * AUDIO_SALIDA_URLS.length)];
          await sendAudio(audioUrl);
        }
      }

    }, 2000);

  } catch (error) {
    console.error('❌ Error en bienvenida/despedida/expulsión:', error);
  }
}
