import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  let text = args.join(' ');
  if (!text && !m.quoted) throw `❗ Usa: .setwelcome mensaje [linkImagen o responder a una imagen]\n\nVariables disponibles:\n- @user → menciona al nuevo\n- @group → nombre del grupo\n- @count → integrantes actuales\n- @desc → descripción del grupo`;

  let img = null;
  let msg = text;

  // 1) Si hay link de imagen en el texto
  const match = text.match(/(https?:\/\/\S+\.(jpg|jpeg|png|gif))/i);
  if (match) {
    img = match[0];
    msg = text.replace(match[0], '').trim();
  }

  // 2) Si el usuario respondió a una imagen
  if (!img && m.quoted && m.quoted.message && m.quoted.message.imageMessage) {
    const media = await conn.downloadMediaMessage(m.quoted); // descarga la imagen en buffer
    img = media; // guardamos el buffer
  }

  // Si aún no hay texto, pero sí imagen
  if (!msg && img) msg = 'Bienvenido @user a @group 🎉';

  // Guardar en la DB
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  global.db.data.chats[m.chat].welcome = { text: msg, img };

  m.reply(`✅ Mensaje de bienvenida configurado.\n\nTexto:\n${msg}\nImagen: ${img ? (typeof img === 'string' ? img : '[imagen subida]') : 'default'}`);
};

handler.command = /^setwelcome$/i;
export default handler;
