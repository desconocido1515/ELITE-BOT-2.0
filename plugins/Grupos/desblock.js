import fs from 'fs';

let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) {
    return m.reply('Solo el dueño puede usar este comando.');
  }

  try {
    const bloqueados = await conn.fetchBlocklist() || [];

    if (!bloqueados.length) {
      return m.reply('No tienes usuarios bloqueados actualmente.');
    }

    let desbloqueados = 0;

    for (let jid of bloqueados) {
      if (!jid.endsWith('@s.whatsapp.net')) {
        console.log(`JID inválido ignorado: ${jid}`);
        continue;
      }

      try {
        await conn.updateBlockStatus(jid, 'unblock');
        console.log(`Desbloqueado: ${jid}`);
        desbloqueados++;
        await new Promise(resolve => setTimeout(resolve, 300)); // Pequeña pausa entre cada desbloqueo
      } catch (e) {
        console.error(`Error al desbloquear ${jid}:`, e.message || e);
      }
    }

    // Esperamos un poco y volvemos a comprobar
    await new Promise(r => setTimeout(r, 2000));
    const bloqueadosFinal = await conn.fetchBlocklist();

    m.reply(`Proceso finalizado.\n\nTotal desbloqueados: ${desbloqueados}\nAún bloqueados: ${bloqueadosFinal.length}`);
  } catch (err) {
    console.error('Error general en el comando .desblock:', err);
    m.reply('Ocurrió un error inesperado al intentar desbloquear.');
  }
};

handler.command = /^\.?desblock$/i;
handler.owner = true;

export default handler;
