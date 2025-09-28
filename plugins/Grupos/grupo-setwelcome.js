import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { promises as fs } from 'fs';

let handler = async (m, { conn, args }) => {
  if (!args.length && !m.quoted) {
    throw `❗ Uso: .setwelcome mensaje [link de imagen]\nPuedes mencionar una imagen para usarla`;
  }

  let text = args.join(' ');
  let img = null;

  // ----------------------- Imagen del link -----------------------
  const match = text.match(/(https?:\/\/\S+\.(jpg|jpeg|png|gif))/i);
  if (match) {
    img = match[0];
    text = text.replace(match[0], '').trim();
  }

  // ----------------------- Imagen respondida -----------------------
  if (m.quoted?.message?.imageMessage) {
    try {
      const stream = await downloadContentFromMessage(m.quoted.message.imageMessage, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      img = buffer; // Guardamos buffer directamente
    } catch (err) {
      console.error('❌ Error al descargar la imagen respondida:', err);
    }
  }

  // Guardar en DB
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  global.db.data.chats[m.chat].welcome = { text, img };

  m.reply(`✅ Mensaje de bienvenida configurado.\n\nTexto:\n${text}\nImagen: ${img ? (Buffer.isBuffer(img) ? 'imagen respondida' : img) : 'default'}`);
};

handler.command = /^setwelcome$/i;
export default handler;
