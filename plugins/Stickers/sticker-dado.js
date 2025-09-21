let handler = async (m, { conn }) => {
let dados = ['https://tinyurl.com/gdd01',
'https://tinyurl.com/gdd02',
'https://tinyurl.com/gdd003',
'https://tinyurl.com/gdd004',
'https://tinyurl.com/gdd05',
'https://tinyurl.com/gdd006']
let url = dados[Math.floor(Math.random() * dados.length)]
m.react("🎲")
conn.sendFile(m.chat, url, 'sticker.webp', '', m, true, { 
contextInfo: { 
'forwardingScore': 200, 
'isForwarded': false, 
externalAdReply: { 
showAdAttribution: false, 
title: m.pushName, 
body: 'EliteBotGlobal', 
mediaType: 2, 
sourceUrl: '', 
thumbnail: null
}
}}, { quoted: m })
}

handler.help = ['dados']
handler.tags = ['juegos']
handler.command = ['dado', 'dados', 'dadu'] 
handler.register = true
export default handler 
