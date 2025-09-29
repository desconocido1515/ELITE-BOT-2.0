let handler = async (m, { isAdmin, isOwner, args }) => {
  // ----------------- Verificar admin -----------------
  if (!(isAdmin || isOwner)) {
    return m.reply('❌ Solo los administradores pueden usar este comando.');
  }

  const textoPredeterminado = `
✦ ¡Hola!
Te ayudaré a configurar la despedida.

> *PASO 1*: debes saber que al usar este símbolo (@) te ayuda a etiquetar a la persona, mencionar el grupo e incluir la descripción en este grupo.

» @user
Para etiquetar a la persona.
» @desc
Para incluir la descripción del grupo.
» @group
Para mencionar el nombre de este grupo.
» @count
Para incluir los números de integrantes del grupo.

════════ ⋆★⋆ ════════
💫 Ejemplo:

.setbye Adiós @user, esperamos verte pronto en @group 💜
@count 
@desc
(Link de la imagen Obligatorio) 
════════ ⋆★⋆ ════════
💫 Otros comandos opcionales:

.resetwelcome
Restablece la bienvenida y despedida por defecto.
.setwelcome Selecciona la bienvenida de tu grupo.
`;

  // ----------------- Detectar argumentos -----------------
  const text = args.join(' ');

  if (!text) {
    // Si no ponen texto, enviar la guía
    return m.reply(textoPredeterminado);
  }

  // ----------------- Detectar link de imagen -----------------
  const match = text.match(/(https?:\/\/\S+\.(jpg|jpeg|png|gif))/i);
  if (!match) return m.reply('!Hola humano! ⭐️\n\nTe falta incluir el link de la imagen personalizada.\n\nEn .setbye te doy todas las indicaciones.\n\n2023 Elite Bot Global');

  const img = match[0];
  const msg = text.replace(match[0], '').trim();

  // ----------------- Guardar en DB -----------------
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  global.db.data.chats[m.chat].bye = { text: msg, img };

  m.reply(`✅ Mensaje de despedida configurado.\n\nTexto:\n${msg}\nImagen: ${img}`);
};

handler.command = /^setbye$/i;
handler.group = true;
handler.admin = true; // solo admins pueden usarlo
export default handler;
