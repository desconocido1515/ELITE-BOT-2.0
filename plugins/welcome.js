import fetch from 'node-fetch';

export async function participantsUpdate({ id, participants, action }, conn) {
  try {
    const chat = global.db?.data?.chats?.[id];
    if (!chat?.bienvenida) return;

    const IMG_PREDETERMINADA = 'https://n.uguu.se/vldhWGbB.jpg';

    // Stickers y audios
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

    const sendAudio = async (jid, url) => {
      try {
        const audioBuffer = await fetch(url).then(res => res.buffer());
        await conn.sendMessage(jid, {
          audio: audioBuffer,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
        });
      } catch (err) {
        console.error('❌ Error al enviar audio:', err);
      }
    };

    const sendSticker = async (jid) => {
      try {
        const url = STICKER_URLS[Math.floor(Math.random() * STICKER_URLS.length)];
        const sticker = await (await fetch(url)).buffer();
        await conn.sendMessage(jid, { sticker });
      } catch (err) {
        console.error('❌ Error al enviar sticker:', err);
      }
    };

    for (const userJid of participants) {
      let imgBuffer;
      try {
        const ppUrl = await conn.profilePictureUrl(userJid, 'image');
        imgBuffer = { url: ppUrl };
      } catch {
        imgBuffer = { url: IMG_PREDETERMINADA };
      }

      const groupMetadata = await conn.groupMetadata(id);
      const memberCount = groupMetadata.participants.length;
      const user = `@${userJid.split('@')[0]}`;

      // BIENVENIDA
      if (action === 'add') {
        const welcomeText = `╭━━━━━━━━⋆⋆━━━━━━━━─
┃ ⏤͟͟͞͞𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗢 🌟
┃ 👤 ${user}
┃ 🏆 𝗖𝗟𝗔𝗡: ${groupMetadata.subject}
┃ 📊 Integrantes actuales: ${memberCount}
╰━━━━━━━━⋆⋆━━━━━━━━─`;

        await conn.sendMessage(id, {
          image: imgBuffer,
          caption: welcomeText,
          mentions: [userJid]
        });

        await sendAudio(id, AUDIO_BIENVENIDA_URL);
      }

      // DESPEDIDA (remove cubre expulsión + salida)
      if (action === 'remove') {
        const goodbyeText = `╭━━━━━━━━⋆⋆━━━━━━━━─
┃ 𝗦𝗘 𝗦𝗔𝗟𝗜Ó 𝗨𝗡𝗔 𝗕𝗔𝗦𝗨𝗥𝗔 🚮
┃ 👋 ${user}
┃ 📊 Integrantes actuales: ${memberCount}
╰━━━━━━━━⋆⋆━━━━━━━━─`;

        await conn.sendMessage(id, {
          image: imgBuffer,
          caption: goodbyeText,
          mentions: [userJid]
        });

        if (Math.random() < 0.5) {
          await sendSticker(id);
        } else {
          const audioUrl = AUDIO_SALIDA_URLS[Math.floor(Math.random() * AUDIO_SALIDA_URLS.length)];
          await sendAudio(id, audioUrl);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error en bienvenida/despedida:', error);
  }
}
