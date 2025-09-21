import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!args[0]) throw `✳️ Ingresa el número del subbot.\n\nEjemplo: *${usedPrefix + command} 5219991234567*`
  
  let numero = args[0].replace(/\D/g, '') // Solo números
  if (!numero) throw `⚠️ El número es inválido.`

  let ruta = path.join('./GataJadiBot/', numero)
  
  if (!fs.existsSync(ruta)) {
    throw `❌ No se encontró la carpeta para el número ${numero}.`
  }

  try {
    fs.rmSync(ruta, { recursive: true, force: true })
    m.reply(`✅ Carpeta del subbot *${numero}* eliminada exitosamente.`)
  } catch (e) {
    console.error(e)
    m.reply(`⚠️ Hubo un error al intentar eliminar la carpeta.`)
  }
}

handler.command = /^borrarsub$/i
handler.rowner = true // Solo el dueño del bot puede usarlo

export default handler
