const handler = async (m, { conn, args, command, isOwner, isROwner }) => {
  if (!isOwner && !isROwner) {
    return m.reply('Este comando es solo para el owner.');
  }

  if (!args[0]) {
    return m.reply(`Ejemplo:\n.blo 593993370003\n.unblo 593993370003`);
  }

  const numero = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';

  try {
    if (command === 'block') {
      await conn.updateBlockStatus(numero, 'block');
      m.reply(`Usuario ${args[0]} bloqueado correctamente.`);
    } else if (command === 'unblock') {
      await conn.updateBlockStatus(numero, 'unblock');
      m.reply(`Usuario ${args[0]} desbloqueado correctamente.`);
    }
  } catch (e) {
    m.reply('Ocurrió un error al intentar bloquear/desbloquear.');
  }
};

handler.command = ['block', 'unblock'];
handler.owner = true;
handler.group = false;
handler.private = false;

export default handler;
