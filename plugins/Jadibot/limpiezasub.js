import { readdirSync, unlinkSync, existsSync, promises as fs } from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  const GataBotDir = './GataJadiBot/'
  try {
    if (!existsSync(GataBotDir)) {
      return await conn.sendMessage(
        m.chat,
        { text: '⚠️ La carpeta (GataJadiBot) no existe o está vacía.' },
        { quoted: m }
      )
    }

    const files = await fs.readdir(GataBotDir)
    let filesDeleted = 0

    for (const file of files) {
      const filePath = path.join(GataBotDir, file)

      if ((await fs.stat(filePath)).isDirectory()) {
        const dirFiles = await fs.readdir(filePath)

        for (const dirFile of dirFiles) {
          // No eliminar creds.json para mantener la vinculación
          if (dirFile !== 'creds.json') {
            try {
              await fs.unlink(path.join(filePath, dirFile))
              filesDeleted++
            } catch (error) {
              console.error(`Error al eliminar ${dirFile}:`, error)
            }
          }
        }
      }
    }

    if (filesDeleted === 0) {
      await conn.sendMessage(
        m.chat,
        { text: '✅ No se encontraron archivos residuales para limpiar.' },
        { quoted: m }
      )
    } else {
      await conn.sendMessage(
        m.chat,
        {
          text: `❱❱ Entendido creador ❰❰\n———————————————\n» Se eliminaron *${filesDeleted}* archivos residuales.\n» Se mantuvo la vinculación de los subbots.`
        },
        { quoted: m }
      )
    }

    await conn.sendMessage(
      m.chat,
      { text: '🌎 Servidor limpiado correctamente.' },
      { quoted: m }
    )

  } catch (err) {
    console.error('Error al limpiar archivos residuales:', err)
    await conn.sendMessage(
      m.chat,
      { text: '❌ Ocurrió un error al limpiar los archivos residuales.' },
      { quoted: m }
    )
  }
}

handler.help = ['limpiezasub']
handler.tags = ['jadibot']
handler.command = /^(limpiezasub|limpiarsub|clearsubbot)$/i
handler.rowner = true

export default handler
