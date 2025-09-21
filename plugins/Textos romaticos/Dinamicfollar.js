import fs, { promises } from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
 if (!text && !m.mentionedJid[0] && !m.quoted) 
   throw `⚠️ 𝙀𝙏𝙄𝙌𝙐𝙀𝙏𝘼 𝘼 𝙇𝘼 𝙋𝙀𝙍𝙎𝙊𝙉𝘼 𝙌𝙐𝙀 𝙏𝙀 𝙌𝙐𝙄𝙀𝙍𝙀𝙎 𝙁𝙊𝙇𝙇𝘼𝙍.`

 try {
   // ✅ Obtener el usuario real
   let user = m.mentionedJid[0] 
      ? m.mentionedJid[0] 
      : m.quoted 
        ? m.quoted.sender 
        : false

   if (!user) throw `⚠️ No encontré a quién mencionas.`

   let fkontak = { 
     key: { participants:"0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" }, 
     message: { contactMessage: { 
       vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
     }}, 
     participant: "0@s.whatsapp.net" 
   }

   // ✅ Aquí ahora sí usamos el jid real (user) en el texto
   let menu = `
*@${m.sender.split("@")[0]}* 𝙏𝙀 𝘼𝘾𝘼𝘽𝘼𝙎 𝘿𝙀 𝙁𝙊𝙇𝙇𝘼𝙍 𝘼 𝙇𝘼 𝙋𝙀𝙍𝙍𝘼 𝘿𝙀 *@${user.split("@")[0]}* 𝙀𝙉 4 𝙈𝙄𝙀𝙉𝙏𝙍𝘼𝙎 𝙏𝙀 𝙂𝙀𝙈𝙄𝘼 𝘾𝙊𝙈𝙊 𝙐𝙉𝘼 𝙈𝘼𝙇𝘿𝙄𝙏𝘼 𝙋𝙀𝙍𝙍𝘼 "𝘼𝙖𝙖𝙝 ... 𝘼𝙖𝙖𝙝, 𝙨𝙞𝙜𝙪𝙚 𝙣𝙤 𝙥𝙖𝙧𝙚𝙨 𝙣𝙤 𝙥𝙖𝙧𝙚𝙨 ... 𝙔 𝙇𝘼 𝙃𝘼𝙕 𝘿𝙀𝙅𝘼𝘿𝙊 𝙏𝘼𝙉 𝙍𝙀𝙑𝙀𝙉𝙏𝘼𝘿𝘼 𝙌𝙐𝙀 𝙉𝙊 𝙋𝙐𝙀𝘿𝙀 𝙎𝙊𝙎𝙏𝙀𝙉𝙀𝙍 𝙉𝙄 𝙎𝙐 𝙋𝙍𝙊𝙋𝙄𝙊 𝘾𝙐𝙀𝙍𝙋𝙊 𝙇𝘼 𝙈𝘼𝙇𝘿𝙄𝙏𝘼 𝙕𝙊𝙍𝙍𝘼.
━━━━━━━━━━━━━━━
*@${user.split("@")[0]}*
 𝙏𝙀 𝘼𝘾𝘼𝘽𝘼𝙉 𝘿𝙀 𝙁𝙊𝙇𝙇𝘼𝙍.
 💦💦😈😈💦💦
 `.trim()

   const vi = [
     'https://telegra.ph/file/fe0acdba609a470e8e406.mp4',
     'https://telegra.ph/file/80b860fc52f0fe957f102.mp4',
     'https://telegra.ph/file/b76da2b6aa919cadc55cc.mp4',
     'https://telegra.ph/file/dff739bf4ceed628729a4.mp4',
     'https://telegra.ph/file/1d22d042fb123425af5aa.mp4'
   ]

   await conn.sendMessage(m.chat, { 
     video: { url: vi[Math.floor(Math.random() * vi.length)] }, 
     gifPlayback: true, 
     caption: menu, 
     mentions: [m.sender, user] 
   }, { quoted: fkontak })

 } catch (e) {
   console.log('❌ Error en el comando follar:', e)
   await m.reply(`❌ Hubo un error ejecutando el comando.`)
 }
}

handler.command = /^(follar)$/i
handler.register = false
handler.group = true
export default handler
