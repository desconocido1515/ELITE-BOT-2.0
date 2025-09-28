let handler = async (m, { args }) => {
  const text = args.join(' ');
  if (!text) throw `❗ Usa: .setwelcome mensaje [linkImagen]\n\nVariables disponibles:\n- @user → menciona al nuevo\n- @group → nombre del grupo\n- @count → integrantes actuales\n- @desc → descripción del grupo`;

  let img = null;
  let msg = text;

  // Detectar link de imagen en el mensaje
  const match = text.match(/(https?:\/\/\S+\.(jpg|jpeg|png|gif))/i);
  if (match) {
    img = match[0];
    msg = text.replace(match[0], '').trim();
  }

  // Guardar en base de datos
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  global.db.data.chats[m.chat].welcome = { text: msg, img };

  m.reply(`✅ Mensaje de bienvenida configurado.\n\nTexto:\n${msg}\nImagen: ${img || 'default'}`);
};

handler.command = /^setwelcome$/i;
export default handler;
