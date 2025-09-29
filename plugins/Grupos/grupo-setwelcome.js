let handler = async (m, { isAdmin, isOwner, args }) => {
  // ----------------- Verificar admin -----------------
  if (!(isAdmin || isOwner)) {
    return m.reply('❌ Solo los administradores pueden usar este comando.');
  }

  const textoPredeterminado = `
✦ ¡Hola!
Te ayudaré a configurar la bienvenida.

> *PASO 1*: debes saber que al usar este símbolo (@) te ayuda a etiquetar a la persona, mencionar el grupo e incluir la descripción en este grupo.
> *PASO 2*: Debes usar el comando .tourl para seleccionar la imagen de Bienvenida. 

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

.setwelcome Bienvenido @user al mejor grupo @group, siéntete en casa. 💜
@count 
@desc
(Link de la imagen Obligatorio) 
════════ ⋆★⋆ ════════
💫 Otros comandos opcionales:

.resetwelcome
Restablece cambios por defecto. 
.setbye Selecciona la despedida de tu grupo.
`;

  // ----------------- Detectar argumentos -----------------
  const text = args.join(' ');

  if (!text) {
    // Si no ponen texto, enviar la guía
    return m.reply(textoPredeterminado);
  }

  // ----------------- Detectar link de imagen -----------------
  const match = text.match(/(https?:\/\/\S+\.(jpg|jpeg|png|gif))/i);
  if (!match) return m.reply('!Hola humano! ⭐️\n\nTe falta incluir el link de la imagen personalizada.\n\nEn .setwelcome te doy todas las indicaciones.\n\n2023 Elite Bot Global');

  const img = match[0];
  const msg = text.replace(match[0], '').trim();

  // ----------------- Guardar en DB -----------------
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  global.db.data.chats[m.chat].welcome = { text: msg, img };

  m.reply(`✅ Mensaje de bienvenida configurado.\n\nTexto:\n${msg}\nImagen: ${img}`);
};

handler.command = /^setwelcome$/i;
handler.group = true;
handler.admin = true;
export default handler;
