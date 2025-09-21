let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`*[❗] Ingrese el ID del grupo*\n\n*Ejemplo:*\n${usedPrefix + command} 123xxxxx@g.us`)
  
  if (!args[0].endsWith('@g.us')) {
    return m.reply(`*[❗] Ingrese un ID válido*\n\n*Ejemplo:*\n${usedPrefix + command} 123xxxxx@g.us`)
  }
  
  try {
    await conn.sendMessage(args[0], { text: 'Adiós, el bot abandonará el grupo...' })
    await conn.groupLeave(args[0])
    await m.reply(`*[✅] El bot salió exitosamente del grupo:*\n${args[0]}`)
  } catch (error) {
    console.error(error)
    await m.reply('*[❗] Error al salir del grupo*')
  }
}

handler.help = ['salir <grupo>']
handler.tags = ['owner']
handler.command = /^(salirgrupo|leavegc|leavegroup)$/i
handler.owner = true
handler.group = false

export default handler
