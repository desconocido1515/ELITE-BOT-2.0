import { promises as fs, existsSync } from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  const ownerNumber = '593993370003@s.whatsapp.net';

  if (m.sender !== ownerNumber) {
    return await conn.sendMessage(m.chat, {
      text: 'Solo el Owner autorizado puede ejecutar este comando.',
    }, { quoted: m });
  }

  const sessionPath = './GataBotSession/';
  let filesDeleted = 0;

  try {
    if (existsSync(sessionPath)) {
      const files = await fs.readdir(sessionPath);

      for (const file of files) {
        const fullPath = path.join(sessionPath, file);
        if (file !== 'creds.json' && file.endsWith('.json') && existsSync(fullPath)) {
          await fs.unlink(fullPath);
          filesDeleted++;
        }
      }
    }

    // Limpia claves internas directamente desde el objeto
    if (conn?.authState?.keys?.data?.session) {
      delete conn.authState.keys.data.session;
    }

    await conn.sendMessage(m.chat, {
      text: `✅ Limpieza completada.\n\n» Archivos eliminados: *${filesDeleted}*\n» Claves internas limpiadas.`,
    }, { quoted: m });

  } catch (err) {
    console.error('Error durante la limpieza de sesión:', err);
    await conn.sendMessage(m.chat, {
      text: `⚠️ Error durante la limpieza:\n${err.message}`,
    }, { quoted: m });
  }
};

handler.help = ['resetsession'];
handler.tags = ['owner'];
handler.command = /^(resetsession|limpiezatotal)$/i;
export default handler;
