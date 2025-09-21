/*import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, args }) => {
if (!args[0]) return m.reply(`⚠️ 𝙄𝙉𝙂𝙍𝙀𝙎𝘼 𝙀𝙇 𝙇𝙄𝙉𝙆 𝘿𝙀 𝙇𝘼 𝙄𝙈𝘼𝙂𝙀𝙉 𝙊 𝙑𝙄𝘿𝙀𝙊 𝘿𝙀 𝙄𝙉𝙎𝙏𝘼𝙂𝙍𝘼𝙈.
𝙀𝙟𝙚𝙢𝙥𝙡𝙤: .ig https://www.instagram.com/p/CYHeKxyMj-J/?igshid=YmMyMTA2M2Y=`)
    
try {
let api = await fetch(`https://deliriussapi-oficial.vercel.app/download/instagram?url=${args[0]}`)
let json = await api.json()
let { data } = json
let JT = data
for (let i = 0; i < JT.length; i++) {
let HFC = JT[i];
if (HFC.type === "image") {
await conn.sendMessage(m.chat, { image: { url: HFC.url } }, { quoted: m })
} else if (HFC.type === "video") {
await conn.sendMessage(m.chat, { video: { url: HFC.url } }, { quoted: m })
}}
} catch (error) {
console.error(error)
}}

handler.command = /^(igdl|ig|instagramdl|instagram)$/i

export default handler
*/
import { igdl } from "ruhend-scraper";

let handler = async (m, { args, conn }) => { 
    if (!args[0]) {
        return conn.reply(m.chat, '*\`Ingresa El link Del vídeo a descargar 🤍\`*', m);
    }

    try {
        await m.react('🕑');

        let res = await igdl(args[0]);
        let data = res.data; 

        for (let media of data) {
            await new Promise(resolve => setTimeout(resolve, 2000));

            await m.react('✅');
            await conn.sendFile(m.chat, media.url, 'instagram.mp4', dev, null, m); 
        }
    } catch {
        await m.react('❌');
    }
}

handler.corazones = 2
handler.command = ['ig', 'igdl', 'instagram'];
handler.tags = ['dl'];
handler.help = ['ig *<link>*'];

export default handler;
