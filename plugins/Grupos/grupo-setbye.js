let handler = async (m, { args }) => {
  const text = args.join(' ');
  if (!text) throw `❗ Uso: .setbye mensaje [link de imagen]\nVariables: @user, @group, @count, @desc`;

  let msg = text;
  let img = null;

  // Detectar link de imagen
  const match = text.match(/(https?:\/\/\S+\.(jpg|jpeg|png|gif))/i);
  if (match) {
    img = match[0];
    msg = text.replace(match[0], '').trim();
  }

  // Guardar en DB
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  global.db.data.chats[m.chat].bye = { text: msg, img };

  m.reply(`✅ Mensaje de despedida configurado.\n\nTexto:\n${msg}\nImagen: ${img || 'default'}`);
};

handler.command = /^setbye$/i;
export default handler;
