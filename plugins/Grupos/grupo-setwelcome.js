let handler = async (m, { isAdmin, isOwner, args }) => {
  // ----------------- Verificar admin -----------------
  if (!(isAdmin || isOwner)) {
    return m.reply('❌ Solo los administradores pueden usar este comando.');
  }

  const text = args.join(' ');
  if (!text) return m.reply('❗ Uso: .setwelcome mensaje [link de imagen]\nVariables: @user, @group, @count, @desc');

  // ----------------- Detectar link de imagen -----------------
  const match = text.match(/(https?:\/\/\S+\.(jpg|jpeg|png|gif))/i);
  if (!match) return m.reply('❌ Debes incluir un **link de imagen** al final del mensaje.');

  const img = match[0];
  const msg = text.replace(match[0], '').trim();

  // ----------------- Guardar en DB -----------------
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  global.db.data.chats[m.chat].welcome = { text: msg, img };

  m.reply(`✅ Mensaje de bienvenida configurado.\n\nTexto:\n${msg}\nImagen: ${img}`);
};

handler.command = /^setwelcome$/i;
handler.group = true;
handler.admin = true; // asegura que solo admins puedan usarlo
export default handler;
