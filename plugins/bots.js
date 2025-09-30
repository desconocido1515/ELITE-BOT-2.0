import ws from 'ws';
import fs, { readdirSync } from 'fs';
import path from 'path';

let confirm = {}

let handler = async (m, { conn, usedPrefix, args, participants }) => {
  try {
    // Verificar que global.conns existe y es un array
    const conns = global.conns || [];
    
    // Filtrar conexiones activas de manera más segura
    const users = conns.filter((connInstance) => {
      try {
        return connInstance && 
               connInstance.user && 
               connInstance.user.jid &&
               connInstance.ws && 
               connInstance.ws.socket && 
               connInstance.ws.socket.readyState !== ws.CLOSED;
      } catch (error) {
        return false;
      }
    });

    // Generar la información de cada subbot
    const txto = await Promise.all(users.map(async (v, index) => {
      try {
        // Calcular uptime de manera segura
        const uptimeMs = v.uptime ? (Date.now() - v.uptime) : 0;
        const uptime = await ajusteTiempo(uptimeMs);
        const jidNumber = v.user.jid.replace(/[^0-9]/g, '');
        
        return `*${index + 1}. 💻* @${jidNumber}\n*Activo :* ${uptime}`;
      } catch (error) {
        return `*${index + 1}. 💻* Error obteniendo datos`;
      }
    }));

    let message = txto.join('\n\n');
    const replyMessage = message.length === 0 ? '*No hay subbots conectados*' : message;
    
    let totalUsers = users.length;

    let SB = `*ProyectoX // EBG*\n*Conectados: ${totalUsers}*\n\n${replyMessage}`;

    // Enviar mensaje con menciones
    let q = await conn.sendMessage(m.chat, { 
      text: SB, 
      mentions: conn.parseMention(SB) 
    }, { 
      quoted: m 
    });

    // Guardar confirmación
    confirm[m.sender] = {
      sender: m.sender,
      q: q,
      totalUsers: totalUsers,
      time: setTimeout(() => {
        delete confirm[m.sender];
      }, 60 * 1000) // 1 minuto
    }
    
    console.log('SubbotsInfo: ', Object.keys(confirm).length, 'usuarios consultaron');

  } catch (error) {
    console.error('Error en handler de subbots:', error);
    await conn.reply(m.chat, '❌ Error al obtener información de los subbots', m);
  }
}

handler.command = handler.help = ['sub', 'bots', 'subsbots'];
handler.tags = ['jadibot'];

handler.before = async function before(m, { conn }) {
  if (m.text.toLowerCase() === 'botsmain') {
    try {
      const confirmacion = Object.values(confirm).find(c => c.sender === m.sender);
      if (!confirmacion) {
        await conn.reply(m.chat, '❌ Primero usa el comando *.subbots* para ver la información', m);
        return;
      }

      // Verificar que la carpeta existe antes de leerla
      let bots = '';
      try {
        if (global.authFolderAniMX && fs.existsSync(global.authFolderAniMX)) {
          const files = readdirSync(global.authFolderAniMX);
          for (let i of files) {
            const bot = i.match(/\d+/g);
            if (bot && bot[0]) {
              bots += `@${bot[0]}\n`;
            }
          }
        } else {
          bots = 'Carpeta de auth no configurada';
        }
      } catch (folderError) {
        bots = 'Error leyendo carpeta de auth';
      }

      bots = bots.trim() || 'No se encontraron bots';

      await conn.sendMessage(m.chat, {
        text: `*Bots actuales:*\n${bots}`,
        mentions: conn.parseMention(bots)
      }, { 
        quoted: m 
      });

    } catch (error) {
      console.error('Error en before de subbots:', error);
      await conn.reply(m.chat, '❌ Error al obtener lista de bots', m);
    }
  }
}

export default handler;

async function ajusteTiempo(ms) {
  if (ms <= 0) return '0 segundos';
  
  const segundos = Math.floor(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const días = Math.floor(horas / 24);

  const segs = segundos % 60;
  const mins = minutos % 60;
  const hrs = horas % 24;

  let resultado = "";
  if (días > 0) resultado += `${días} día${días > 1 ? 's' : ''}, `;
  if (hrs > 0) resultado += `${hrs} hora${hrs > 1 ? 's' : ''}, `;
  if (mins > 0) resultado += `${mins} minuto${mins > 1 ? 's' : ''}, `;
  if (segs > 0) resultado += `${segs} segundo${segs > 1 ? 's' : ''}`;

  // Eliminar coma final si existe
  resultado = resultado.replace(/,\s*$/, '');
  
  return resultado || '0 segundos';
}
