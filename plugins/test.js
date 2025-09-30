let handler = async (m, { conn }) => {
    console.log('✅ COMANDO TEST EJECUTADO');
    await m.reply('✅ El comando test funciona correctamente');
}

handler.help = ['test']
handler.tags = ['info']
handler.command = ['test', 'prueba']

export default handler
