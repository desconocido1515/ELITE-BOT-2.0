import fetch from 'node-fetch';
import { WAMessageStubType } from '@whiskeysockets/baileys';

export async function before(m, { conn, groupMetadata }) {
  try {
    if (!m.messageStubType || !m.isGroup) return true;

    const chat = global.db?.data?.chats?.[m.chat] || {};
    if (!chat.bienvenida) return true;

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

    const IMG_PREDETERMINADA = 'https://files.catbox.moe/1lq97i.jpg';

    // Recursos
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

    // Funciones auxiliares
    const sendAudio = async (url) => {
      try {
        const audioBuffer = await fetch(url).then(res => res.buffer());
        await conn.sendMessage(m.chat, {
          audio: audioBuffer,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
        });
      } catch (err) {
        console.error('❌ Error al enviar audio:', err);
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

    // Foto del usuario o predeterminada
    let imgBuffer;
    try {
      const ppUrl = await conn.profilePictureUrl(userJid, 'image');
      imgBuffer = { url: ppUrl };
    } catch {
      imgBuffer = { url: IMG_PREDETERMINADA };
    }

    const updatedGroup = await conn.groupMetadata(m.chat);
    const memberCount = updatedGroup.participants.length;
    const user = `@${userJid.split('@')[0]}`;
    const groupName = groupMetadata.subject;
    const groupDesc = updatedGroup.desc || "Sin descripción"; // <-- Descripción añadida

    // BIENVENIDA
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      let caption;
      let img = imgBuffer;

      if (chat.welcome?.text) {
        caption = chat.welcome.text
          .replace(/@user/gi, user)
          .replace(/@group/gi, groupName)
          .replace(/@count/gi, memberCount)
          .replace(/@desc/gi, groupDesc); // <-- reemplazo @desc
        if (chat.welcome.img) img = { url: chat.welcome.img };
      } else {
        caption = `╭━━━━━━━━⋆⋆━━━━━━━━─
┃ ⏤͟͟͞͞𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗢 🌟
┃ 👤 ${user}
┃ 🏆 𝗖𝗟𝗔𝗡: ${groupName}
┃ 📊 Integrantes actuales: ${memberCount}
╰━━━━━━━━⋆⋆━━━━━━━━─`;
      }

      await conn.sendMessage(m.chat, {
        image: img,
        caption,
        mentions: [userJid]
      });

      await sendAudio(AUDIO_BIENVENIDA_URL);
    }

    // DESPEDIDA / EXPULSIÓN
    if (
      m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
      m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE
    ) {
      let caption;
      let img = imgBuffer;

      if (chat.bye?.text) {
        caption = chat.bye.text
          .replace(/@user/gi, user)
          .replace(/@group/gi, groupName)
          .replace(/@count/gi, memberCount)
          .replace(/@desc/gi, groupDesc); // <-- reemplazo @desc
        if (chat.bye.img) img = { url: chat.bye.img };
      } else {
        caption = `╭━━━━━━━━⋆⋆━━━━━━━━─
┃ 𝗦𝗘 𝗦𝗔𝗟𝗜Ó 𝗨𝗡𝗔 𝗕𝗔𝗦𝗨𝗥𝗔 🚮
┃ 💩 ${user}
┃ 📊 Integrantes actuales: ${memberCount}
╰━━━━━━━━⋆⋆━━━━━━━━─`;
      }

      await conn.sendMessage(m.chat, {
        image: img,
        caption,
        mentions: [userJid]
      });

      if (Math.random() < 0.5) {
        await sendSticker();
      } else {
        const audioUrl = AUDIO_SALIDA_URLS[Math.floor(Math.random() * AUDIO_SALIDA_URLS.length)];
        await sendAudio(audioUrl);
      }
    }
  } catch (error) {
    console.error('❌ Error en bienvenida/despedida:', error);
  }
}
