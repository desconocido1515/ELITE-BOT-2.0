import axios from 'axios'

const flagMap = [
  ['598', '🇺🇾'], ['595', '🇵🇾'], ['593', '🇪🇨'], ['591', '🇧🇴'],
  ['590', '🇧🇶'], ['509', '🇭🇹'], ['507', '🇵🇦'], ['506', '🇨🇷'],
  ['505', '🇳🇮'], ['504', '🇭🇳'], ['503', '🇸🇻'], ['502', '🇬🇹'],
  ['501', '🇧🇿'], ['599', '🇨🇼'], ['597', '🇸🇷'], ['596', '🇬🇫'],
  ['594', '🇬🇫'], ['592', '🇬🇾'], ['590', '🇬🇵'], ['549', '🇦🇷'],
  ['58', '🇻🇪'], ['57', '🇨🇴'], ['56', '🇨🇱'], ['55', '🇧🇷'],
  ['54', '🇦🇷'], ['53', '🇨🇺'], ['52', '🇲🇽'], ['51', '🇵🇪'],
  ['34', '🇪🇸'], ['1', '🇺🇸']
]

function numberWithFlag(num) {
  const clean = num.replace(/[^0-9]/g, '');
  for (const [code, flag] of flagMap) {
    if (clean.startsWith(code)) return `${num} ${flag}`;
  }
  return num;
}

const colors = {
  rojo: '#FF0000',
  azul: '#0000FF',
  morado: '#800080',
  verde: '#008000',
  amarillo: '#FFFF00',
  naranja: '#FFA500',
  celeste: '#00FFFF',
  rosado: '#FFC0CB',
  negro: '#000000',
  blanco: '#FFFFFF',
  gris: '#808080',
  marron: '#8B4513',
  aqua: '#00CED1',
  lima: '#32CD32',
  coral: '#FF7F50',
  dorado: '#FFD700',
  plata: '#C0C0C0'
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const chatId = m.chat;
  const quoted = m.quoted;
  let targetJid = m.sender;
  let quotedText = '';
  let qPush = '';

  if (quoted) {
    targetJid = quoted.sender;
    quotedText = quoted.text || '';
    qPush = quoted.name || '';
  }

  let text = args.join(' ').trim();
  if (!text && !quotedText) {
    return m.reply(
      `✏️ *Crea una imagen tipo sticker con un mensaje personalizado*\n\n` +
      `📌 *Ejemplo:*\n` +
      `• ${usedPrefix + command} [color] [texto]\n` +
      `• .opnion2 morado Elite Bot\n\n` +
      `🎨 *Colores disponibles:*\n` +
      `${Object.keys(colors).map(c => `- ${c}`).join('\n')}`
    )
  }

  const firstWord = text.split(' ')[0].toLowerCase();
  const bgColor = colors[firstWord] || colors['negro'];
  let content = colors[firstWord] ? text.split(' ').slice(1).join(' ').trim() : text;
  if (!content) content = quotedText || ' ';

  const displayName = qPush || (await conn.getName(targetJid)) || numberWithFlag(targetJid.split('@')[0]);

  let avatar = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';
  try {
    avatar = await conn.profilePictureUrl(targetJid, 'image');
  } catch {}

  await conn.sendMessage(chatId, { react: { text: '🖼️', key: m.key } });

  const quoteData = {
    type: 'quote',
    format: 'png',
    backgroundColor: bgColor,
    width: 600,
    height: 900,
    scale: 3,
    messages: [{
      entities: [],
      avatar: true,
      from: {
        id: 1,
        name: displayName,
        photo: { url: avatar }
      },
      text: content,
      replyMessage: {}
    }]
  };

  try {
    const { data } = await axios.post('https://bot.lyo.su/quote/generate', quoteData, {
      headers: { 'Content-Type': 'application/json' }
    });

    const imgBuffer = Buffer.from(data.result.image, 'base64');

    await conn.sendMessage(chatId, {
      image: imgBuffer,
      caption: displayName
    }, { quoted: m });

    await conn.sendMessage(chatId, { react: { text: '✅', key: m.key } });

  } catch (e) {
    console.error('❌ Error en qc2:', e);
    await m.reply('❌ Ocurrió un error al generar la imagen.');
  }
}

handler.command = /^qc2|opinión2|opinion2$/i
handler.help = ['qc2']
handler.tags = ['sticker']

export default handler
