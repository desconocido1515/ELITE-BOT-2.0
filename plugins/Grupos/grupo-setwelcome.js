let handler = async (m, { conn, args }) => {
  const text = args.join(' ');
  if (!text) throw `❗ Usa: .setwelcome mensaje [linkImagen]\n\nVariables: @user, @group, @count`;

  let img = null;
  let msg = text;

  const match = text.match(/(https?:\/\/\S+\.(jpg|jpeg|png|gif))/i);
  if (match) {
    img = match[0];
    msg = text.replace(match[0], '').trim();
  }

  global.db.data.chats[m.chat].welcome = { text: msg, img };
  m.reply(`✅ Mensaje de bienvenida configurado.\n\nTexto: ${msg}\nImagen: ${img || 'default'}`);
};
handler.command = /^setwelcome$/i;
export default handler;
