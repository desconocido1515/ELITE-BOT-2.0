let handler = async (m, { isAdmin, isOwner }) => {
  // ----------------- Verificar admin -----------------
  if (!(isAdmin || isOwner)) {
    return m.reply('❌ Solo los administradores pueden usar este comando.');
  }

  // ----------------- Restablecer valores -----------------
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};

  delete global.db.data.chats[m.chat].welcome;
  delete global.db.data.chats[m.chat].bye;

  m.reply(`✅ Mensajes de bienvenida y despedida restablecidos a los valores por defecto.`);
};

handler.command = /^resetwelcome$/i;
handler.group = true;
handler.admin = true; // solo admins pueden usarlo
export default handler;
