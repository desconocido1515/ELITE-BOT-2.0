import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk'; // Importación añadida

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (m, { conn, usedPrefix, command }) => {
  const number = m.sender;
  const sessionDir = path.join(__dirname, '../GataJadiBot');
  const sessionPath = path.join(sessionDir, number.split('@')[0]);

  try {
    if (fs.existsSync(sessionPath)) {
      // Eliminar la sesión de manera recursiva
      fs.rmSync(sessionPath, { recursive: true, force: true });
      
      // Eliminar de la lista de conexiones activas si existe
      const index = global.conns.findIndex(conn => conn.user?.jid === number);
      if (index !== -1) {
        global.conns.splice(index, 1);
      }

      await conn.reply(m.chat, 
        `🗑️ *Sesión eliminada correctamente*\n\n` +
        `✔ Se ha borrado la sesión asociada a tu número.\n` +
        `Puedes volver a registrar un sub-bot usando:\n` +
        `\`\`\`${usedPrefix}serbot\`\`\``, 
      m);

      console.log(`[✓] Sesión eliminada para ${number}`);
    } else {
      await conn.reply(m.chat, 
        `⚠️ *No se encontró sesión activa*\n\n` +
        `No existe una sesión de sub-bot asociada a tu número.\n` +
        `Para crear una nueva sesión usa:\n` +
        `\`\`\`${usedPrefix}serbot\`\`\``, 
      m);
    }
  } catch (error) {
    console.error('[×] Error al eliminar sesión:', error);
    await conn.reply(m.chat, 
      `❌ *Error al eliminar la sesión*\n\n` +
      `Ocurrió un error al intentar borrar los datos. Por favor intenta nuevamente.\n` +
      `Si el problema persiste, contacta al soporte.`, 
    m);
  }
};

// Configuración del comando
handler.help = ['delbot'];
handler.tags = ['subbots'];
handler.command = /^(deletesesion|borrarsesion|eliminarsesion)$/i;

export default handler;
