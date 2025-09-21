import fetch from 'node-fetch'

let handler = m => m

handler.before = async function (m, { conn }) {
  if (!m.messageStubType || !m.isGroup) return

  let chat = global.db.data.chats[m.chat]
  if (!chat?.welcome) return  // Verifica si welcome está activado

  const MAIN_BOT_NUMBER = '593959158585'
  const currentBotNumber = conn.user.jid.split('@')[0]
  if (currentBotNumber !== MAIN_BOT_NUMBER) return

  const STICKER_URLS = [
    'https://files.catbox.moe/o58tbw.webp',
    'https://files.catbox.moe/0boonh.webp'
  ]

  const AUDIO_SALIDA_URLS = [
    'https://files.catbox.moe/2olqg1.ogg',
    'https://files.catbox.moe/k8znal.ogg',
    'https://files.catbox.moe/oj61hq.ogg'
  ]
  const AUDIO_BIENVENIDA_URL = 'https://files.catbox.moe/kgykxt.ogg'

  try {
    if ([28, 32].includes(m.messageStubType)) {
      // Usuario salió del grupo
      setTimeout(async () => {
        const isSticker = Math.random() < 0.5
        if (isSticker) {
          const url = STICKER_URLS[Math.floor(Math.random() * STICKER_URLS.length)]
          const sticker = await (await fetch(url)).buffer()
          await conn.sendMessage(m.chat, { sticker })
        } else {
          const url = AUDIO_SALIDA_URLS[Math.floor(Math.random() * AUDIO_SALIDA_URLS.length)]
          const audio = await (await fetch(url)).buffer()
          await conn.sendMessage(m.chat, {
            audio,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
          })
        }
      }, 2000)
    }

    if (m.messageStubType === 27) {
      // Usuario entró al grupo
      setTimeout(async () => {
        const audio = await (await fetch(AUDIO_BIENVENIDA_URL)).buffer()
        await conn.sendMessage(m.chat, {
          audio,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
        })
      }, 2000)
    }
  } catch (e) {
    console.error('Error manejando entrada/salida de grupo:', e)
  }
}

export default handler
