import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const botname = command.charAt(0).toUpperCase() + command.slice(1) // Nombre del bot basado en el comando
  const vs = '1.0.0'
  const emoji = '✨'
  const emoji2 = '⌛'
  const done = '✅'
  const error = '❌'
  const msm = '[Sistema]'

  const username = await conn.getName(m.sender)
  const basePrompt = `Tu nombre es ${botname} y parece haber sido creada por kevin. Tu versión actual es ${vs}, tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser divertida, y te encanta aprender. Lo más importante es que debes ser amigable con la persona con la que estás hablando. ${username}`

  const quoted = m.quoted || m.msg
  const isQuotedImage = quoted?.mimetype?.startsWith('image/')

  if (isQuotedImage) {
    try {
      const img = await quoted.download()
      if (!img) throw 'No se pudo descargar la imagen'

      const content = `${emoji} ¿Qué se observa en la imagen?`
      const imageAnalysis = await fetchImageBuffer(content, img)

      if (!imageAnalysis?.result) throw 'Análisis vacío'

      const query = `${emoji} Descríbeme la imagen y detalla por qué actúan así. También dime quién eres`
      const prompt = `${basePrompt}. La imagen que se analiza es: ${imageAnalysis.result}`
      const description = await luminsesi(query, username, prompt)

      await conn.reply(m.chat, description, m)
    } catch (e) {
      console.error(e)
      await m.react(error)
      await conn.reply(m.chat, '✘ No se pudo analizar la imagen.', m)
    }
  } else {
    if (!text) {
      return conn.reply(m.chat, `${emoji} Ingresa una petición para que ${botname} la responda.`, m)
    }

    await m.react('🗣️')
    try {
      const { key } = await conn.sendMessage(m.chat, {
        text: `${emoji2} ${botname} está procesando tu petición, espera unos segundos...`
      }, { quoted: m })

      const query = text
      const prompt = `${basePrompt}. Responde lo siguiente: ${query}`
      const response = await luminsesi(query, username, prompt)

      await conn.sendMessage(m.chat, { text: response, edit: key })
      await m.react(done)
    } catch (e) {
      console.error(e)
      await m.react(error)
      await conn.reply(m.chat, `✘ ${botname} no puede responder a esa pregunta.`, m)
    }
  }
}

handler.help = ['ia', 'chatgpt', 'luminai', 'meta', 'gemini', 'alexa', 'deepseek']
handler.tags = ['ai']
handler.command = ['ia', 'chatgpt', 'luminai', 'meta', 'gemini', 'alexa', 'deepseek']
handler.register = true
handler.group = false // Puedes cambiarlo a true si solo deseas que se use en grupos

export default handler

// Función para enviar una imagen y obtener el análisis (base64)
async function fetchImageBuffer(content, imageBuffer) {
  try {
    const response = await axios.post('https://Luminai.my.id', {
      content,
      imageBase64: imageBuffer.toString('base64')
    }, {
      headers: { 'Content-Type': 'application/json' }
    })
    return response.data
  } catch (error) {
    console.error('Error al analizar imagen:', error)
    throw error
  }
}

// Función para interactuar con la IA usando prompts
async function luminsesi(content, user, prompt) {
  try {
    const response = await axios.post("https://Luminai.my.id", {
      content,
      user,
      prompt,
      webSearchMode: false
    })
    return response.data.result
  } catch (error) {
    console.error('Error al obtener respuesta IA:', error)
    throw error
  }
                }
