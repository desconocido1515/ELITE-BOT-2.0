/*import { spawn } from 'child_process'
import fs from 'fs'

const handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''

  if (!/video/.test(mime)) {
    return m.reply(`✧ Responde a un video con el comando *${usedPrefix + command}* para mejorar su calidad.`)
  }

  try {
    m.reply('🎥 Procesando video con mejora de calidad...\nMe demoro unos minutos si tu proceso no fue enviado volver a intentar.')

    const videoBuffer = await q.download()
    const timestamp = Date.now()
    const inputPath = `./tmp/input_${timestamp}.mp4`
    const outputPath = `./tmp/output_${timestamp}.mp4`

    fs.writeFileSync(inputPath, videoBuffer)

    const ffmpeg = spawn('ffmpeg', [
      '-i', inputPath,
      '-vf', 'scale=1280:720,unsharp',
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '20',
      '-b:v', '2500k',
      '-y',
      outputPath
    ])

    ffmpeg.stderr.on('data', data => console.log('[FFMPEG]', data.toString()))

    await new Promise((resolve, reject) => {
      ffmpeg.on('close', code => {
        if (code === 0) resolve()
        else reject(new Error('Error al procesar video'))
      })
    })

    await conn.sendFile(m.chat, outputPath, 'video_hd.mp4', '✨ Video mejorado.', m)

    fs.unlinkSync(inputPath)
    fs.unlinkSync(outputPath)

  } catch (e) {
    console.error(e)
    m.reply('⚠️ Error al mejorar el video.')
  }
}




handler.help = ["hd2"]
handler.tags = ["tools"]
handler.command = ["hdvideo", "hd2", "hdvideos"]
handler.group = true

export default handler
*/
