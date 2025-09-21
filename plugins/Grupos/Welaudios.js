/*let WAMessageStubType = (await import('@whiskeysockets/baileys')).default;
import fetch from 'node-fetch';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;

  let vn = ['./media/Bienvenido.mp3','./media/Bebito.mp3'].getRandom()
  let vn2 = ['./media/basura.mp3','./media/verga.mp3'].getRandom()
  let chat = global.db.data.chats[m.chat];
  const getMentionedJid = () => {
    return m.messageStubParameters.map(param => `${param}@s.whatsapp.net`);
  };

  let who = m.messageStubParameters[0] + '@s.whatsapp.net';
  let user = global.db.data.users[who];

  let userName = user ? user.name : await conn.getName(who);

 if (chat.welcome && m.messageStubType === 27) {
    this.sendMessage(m.chat, { audio: { url: vn }, 
    contextInfo: { forwardedNewsletterMessageInfo: { 
    newsletterJid: channelRD.id,
    serverMessageId: '', 
    newsletterName: channelRD.name }, forwardingScore: 9999999, isForwarded: true, mentionedJid: getMentionedJid(), "externalAdReply": { 
"title": `𝙱𝚒𝚎𝚗𝚟𝚎𝚗𝚒𝚍𝚘`, 
    "body": [`𝙴𝚛𝚎𝚜 𝚎𝚕 𝚖𝚎𝚓𝚘𝚛♥️`, `𝚂𝚒𝚎́𝚗𝚝𝚎𝚝𝚎 𝚌𝚘́𝚖𝚘𝚍𝚘♥️`].getRandom(),
 "previewType": "PHOTO", 
   "thumbnailUrl": null,
    "thumbnail":gataImg, 
   "sourceUrl": redesMenu, 
    "showAdAttribution": true}}, 
     seconds: '4556', ptt: true, mimetype: 'audio/mpeg', fileName: `error.mp3` }, { quoted: fkontak, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})
}

  if (chat.welcome && (m.messageStubType === 28 || m.messageStubType === 32)) {
    this.sendMessage(m.chat, { audio: { url: vn2 }, 
    contextInfo: { forwardedNewsletterMessageInfo: { 
    newsletterJid: channelRD.id,
    serverMessageId: '', 
    newsletterName: channelRD.name }, forwardingScore: 9999999, isForwarded: true, mentionedJid: getMentionedJid(), "externalAdReply": { 
    "title": [`𝙰𝚍𝚒𝚘𝚜 𝙱𝚒𝚗𝚊𝚛𝚒𝚘`, `𝙿𝚎𝚍𝚊𝚣𝚘 𝚍𝚎 𝚋𝚊𝚜𝚞𝚛𝚊`].getRandom(),
    "body": `𝙽𝚊𝚍𝚒𝚎 𝚝𝚎 𝚚𝚞𝚎𝚛𝚒𝚊 𝚊𝚚𝚞𝚒`,
    "previewType": "PHOTO", 
    "thumbnailUrl": null,
    "thumbnail": gataImg, 
    "sourceUrl": redesMenu, 
    "showAdAttribution": true}}, 
     seconds: '4556', ptt: true, mimetype: 'audio/mpeg', fileName: `error.mp3` }, { quoted: fkontak, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})
  }
}
*/
