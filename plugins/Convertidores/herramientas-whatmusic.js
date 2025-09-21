import fs from 'fs';
import acrcloud from 'acrcloud';
const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu',
});

const handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  
  if (/audio|video/.test(mime)) {
    const media = await q.download();
    const ext = mime.split('/')[1];
    fs.writeFileSync(`./tmp/${m.sender}.${ext}`, media);
    
    try {
      const res = await acr.identify(fs.readFileSync(`./tmp/${m.sender}.${ext}`));
      const {code, msg} = res.status;
      if (code !== 0) throw msg;
      
      const {title, artists, album, genres, release_date} = res.metadata.music[0];
      const txt = `
╭━━━━━━━━━━━━━━━━━━━╮
┃  🎧 *𝐈𝐃𝐄𝐍𝐓𝐈𝐅𝐈𝐂𝐀𝐃𝐎𝐑 𝐃𝐄 𝐌𝐔𝐒𝐈𝐂𝐀* 🎼
┃━━━━━━━━━━━━━━━━━━━
┃
┃  🎶 *Título:* ${title}
┃  🎤 *Artista:* ${artists !== undefined ? artists.map((v) => v.name).join(', ') : 'No encontrado'}
┃  💿 *Álbum:* ${album.name || 'No encontrado'}
┃  🎹 *Género:* ${genres !== undefined ? genres.map((v) => v.name).join(', ') : 'No encontrado'}
┃  📅 *Fecha:* ${release_date || 'No encontrado'}
┃
╰━━━━━━━━━━━━━━━━━━━╯
`.trim();
      
      fs.unlinkSync(`./tmp/${m.sender}.${ext}`);
      await m.reply(txt);
    } catch (error) {
      fs.unlinkSync(`./tmp/${m.sender}.${ext}`);
      await m.reply('❌ *Error al identificar la música. Por favor, intenta con otro audio.*');
    }
  } else {
    await m.reply('⚠️ *Responde a un audio o video para identificar la música*');
  }
};

handler.help = ['musicc']
handler.tags = ['tools']
handler.command = /^(musicc|quemusica|quemusicaes|whatmusic)$/i;
handler.register = true;

export default handler; 
