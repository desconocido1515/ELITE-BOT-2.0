import fetch from 'node-fetch';

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    // Limpiar timeout anterior si existe
    if (conn.tebakff?.[m.sender]) {
      clearTimeout(conn.tebakff[m.sender].timeout);
      delete conn.tebakff[m.sender];
    }

    const res = await fetch('https://api.vreden.my.id/api/tebakff');
    if (!res.ok) throw new Error('API no responde');
    const json = await res.json();
    const { jawaban, img } = json.result;

    conn.tebakff = conn.tebakff || {};
    conn.tebakff[m.sender] = {
      jawaban: jawaban.toLowerCase(),
      timeout: setTimeout(() => {
        m.reply(`🕒 ¡Tiempo agotado, noob! La respuesta era: *${jawaban.toUpperCase()}* 🔥`);
        delete conn.tebakff[m.sender];
      }, 30000)
    };

    await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } });

    const buttons = [
      {
        buttonId: `.${command}`,
        buttonText: { displayText: 'Menufreefire' },
        type: 1,
      }
    ];

    await conn.sendMessage(m.chat, {
      image: { url: img },
      caption: `🔥 *DESAFÍO FREE FIRE* 🔥

🎮 ¡ADIVINA EL PERSONAJE! 🎮

Estás frente a un legendario de Free Fire...
¿Serás capaz de reconocerlo?

⏱️ *Tienes 30 segundos* para responder
💀 Dificultad: *PRO*

📌 Escribe el nombre del personaje en el chat`,
      buttons,
      footer: "FREE FIRE BATTLEGROUNDS | © GARENA",
      viewOnce: true,
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply("💢 ¡ERROR EN EL SISTEMA! Vuelve a intentarlo más tarde...");
  }
};

// Manejador específico para el botón
handler.button = async (m, { conn, usedPrefix, command }) => {
  if (m.text === '🔄 VOLVER A INTENTAR') {
    await handler(m, { conn, usedPrefix, command });
  }
};

handler.before = async (m, { conn, usedPrefix }) => {
  if (m.text.startsWith(usedPrefix) || m.text === '🔄 VOLVER A INTENTAR') return;

  if (conn.tebakff?.[m.sender]) {
    const { jawaban, timeout } = conn.tebakff[m.sender];
    const userAnswer = m.text.toLowerCase().trim();
    
    if (userAnswer === jawaban) {
      clearTimeout(timeout);
      delete conn.tebakff[m.sender];
      await conn.sendMessage(m.chat, { 
        text: `🎉 *¡BOOYAH!* Respuesta correcta\n\nEres un verdadero PRO de Free Fire! 🏆\n\nPersonaje: *${jawaban.toUpperCase()}*`,
        quoted: m
      });
    } else if (userAnswer) {
      await conn.sendMessage(m.chat, { 
        text: "❌ *¡FALLISTE!* Sigue intentándolo, rookie...",
        quoted: m
      });
    }
  }
};

handler.help = ["tebakff"];
handler.tags = ["juegos"];
handler.command = /^tebakff|adivinaff$/i;
handler.exp = 20;

export default handler;
