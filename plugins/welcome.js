
import { WAMessageStubType} from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, groupMetadata}) {
  try {
    if (!m.messageStubType ||!m.isGroup) return true;

    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat ||!chat.bienvenida) return true;

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

    let imgBuffer;

    // Imagen personalizada para bienvenida
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      imgBuffer = await fetch(
        'https://canvas-8zhi.onrender.com/api/welcome?title=Bienvenido&desc=al%20grupo%20Sasuke%20Bot&background=https://qu.ax/gcBQF.jpg'
).then(res => res.buffer());
}

    // Imagen personalizada para salida o expulsión
    if (
      m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE ||
      m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE
) {
      imgBuffer = await fetch(
        'https://canvas-8zhi.onrender.com/api/welcome?title=Te%20extrañaremos%20pendejo%20🖕🏻😂&desc=&background=https://qu.ax/gcBQF.jpg'
).then(res => res.buffer());
}

    const { customWelcome, customBye, customKick} = chat;

    const sendAudio = async (url) => {
      try {
        const audioBuffer = await fetch(url).then(res => res.buffer());
        await conn.sendMessage(m.chat, {
          audio: audioBuffer,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: false
}, { quoted: fkontak});
} catch (err) {
        console.error('❌ Error al enviar el audio:', err);
}
};

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      const welcomeText = customWelcome
? customWelcome.replace(/@user/gi, user).replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc)
: `🎉 *¡HOLA ${user}!* 🎉\n\nBienvenido/a a *${groupName}*.\n\n📚 *Sobre nosotros:*\n_${groupDesc}_\n\n🌟 ¡Esperamos que disfrutes tu estancia!`;

      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: welcomeText,
        mentions: [userJid]
}, { quoted: fkontak});

      await sendAudio('https://cdn.russellxz.click/42514214.mp3');
}

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      const goodbyeText = customBye
? customBye.replace(/@user/gi, user).replace(/@group/gi, groupName)
: `😂 *Te extrañaremos pendejo* 🖕🏻\n\nGracias por haber formado parte de *${groupName}*`;

      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: goodbyeText,
        mentions: [userJid]
}, { quoted: fkontak});

      await sendAudio('https://cdn.russellxz.click/42514214.mp3');
}
if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      const kickText = customKick
? customKick.replace(/@user/gi, user).replace(/@group/gi, groupName)
: `😂 *Te extrañaremos pendejo* 🖕🏻\n\n*${user}* ha sido expulsado de *${groupName}*`;

      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: kickText,
        mentions: [userJid]
}, { quoted: fkontak});

      await sendAudio('https://cdn.russellxz.click/5c471e35.mp3');
}
} catch (error) {
    console.error('❌ Error general en la función de bienvenida/despedida/expulsión:', error);
}
}
