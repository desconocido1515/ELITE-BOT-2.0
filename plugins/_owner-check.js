const handler = async (m, { conn, usedPrefix, command }) => {
  const isOwner = global.owner.some(([id]) => id === m.sender)
  if (!isOwner) {
    return m.reply('No eres mi dueño. No puedes usar este comando.')
  }
  return m.reply('¡Perfecto! El bot te reconoce como OWNER.')
}

handler.command = ['testowner']
handler.owner = false  // No usamos la propiedad, hacemos la validación manual
export default handler
