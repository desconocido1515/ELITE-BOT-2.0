var handler = async (m, {conn, args, usedPrefix, command}) => {
  // Obtenemos el comando completo y lo convertimos a minúsculas
  const fullCommand = m.text.toLowerCase().replace(usedPrefix.toLowerCase(), '').trim();
  
  // Mapeo de comandos a acciones
  const commandMap = {
    // Comandos para abrir
    'grupoabrir': 'not_announcement',
    'abrirgrupo': 'not_announcement',
    'grupo abrir': 'not_announcement',
    'abrir grupo': 'not_announcement',
    'grupo open': 'not_announcement',
    'open grupo': 'not_announcement',
    'abrir': 'not_announcement',
    'open': 'not_announcement',
    
    // Comandos para cerrar
    'grupocerrar': 'announcement',
    'cerrargrupo': 'announcement',
    'grupo cerrar': 'announcement',
    'cerrar grupo': 'announcement',
    'grupo close': 'announcement',
    'close grupo': 'announcement',
    'cerrar': 'announcement',
    'close': 'announcement',
    
    // Comandos adicionales
    'bloquear': 'locked',
    'desbloquear': 'unlocked'
  };

  // Buscamos el comando en el mapeo
  const action = commandMap[fullCommand] || 
                commandMap[fullCommand.split(' ')[0]]; // Para comandos con argumentos

  if (!action) {
    // Solo muestra ayuda si no se reconoce ningún comando
    return conn.reply(m.chat, `*Comandos válidos:*\n\nAbrir:\n○ .grupoabrir\n○ .abrir grupo\n\nCerrar:\n○ .grupocerrar\n○ .cerrar grupo`, m);
  }

  // Actualizamos la configuración del grupo
  await conn.groupSettingUpdate(m.chat, action);
  await m.react('✅');

  // Enviamos mensaje según la acción
  if (action === 'announcement') {
    await conn.sendMessage(m.chat, { text: 'ORDENES RECIBIDAS ☑️\n> Nadie puede escribir en el grupo' }, { quoted: m });
  } else if (action === 'not_announcement') {
    await conn.sendMessage(m.chat, { text: 'ORDENES RECIBIDAS ☑️\n> Todos pueden escribir en el grupo' }, { quoted: m });
  }
}

handler.help = ['grupo [abrir/cerrar]'];
handler.tags = ['grupo'];
handler.command = /^(grupo|group|abrirgrupo|grupoabrir|cerrargrupo|grupocerrar|abrir|cerrar)$/i;
handler.admin = true;
handler.botAdmin = true;

export default handler;
