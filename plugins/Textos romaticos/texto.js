//import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

const colores = {
  rojo: ['#F44336', '#FFCDD2'],
  azul: ['#00B4DB', '#0083B0'],
  verde: ['#4CAF50', '#C8E6C9'],
  rosa: ['#E91E63', '#F8BBD0'],
  morado: ['#9C27B0', '#E1BEE7'],
  negro: ['#212121', '#9E9E9E'],
  naranja: ['#FF9800', '#FFE0B2'],
  gris: ['#607D8B', '#CFD8DC'],
  celeste: ['#00FFFF', '#E0FFFF'],
  dorado: ['#FFD700', '#FFF8DC'],
  vino: ['#800000', '#C08080'],
  lima: ['#C0FF33', '#F0FFC2'],
  cian: ['#00CED1', '#E0FFFF'],
  coral: ['#FF7F50', '#FFDAB9'],
  aguamarina: ['#7FFFD4', '#E0FFFF'],
  lavanda: ['#E6E6FA', '#F3E5F5'],
  menta: ['#98FF98', '#D0F0C0'],
  esmeralda: ['#50C878', '#A8E6A2'],
  carbón: ['#333333', '#999999'],
  azulmarino: ['#001F3F', '#003366'],
  ocre: ['#CC7722', '#FFD39B'],
  salmon: ['#FA8072', '#FFE4E1'],
  perla: ['#F8F6F0', '#EDEAE0'],
  tierra: ['#A0522D', '#D2B48C'],
  púrpura: ['#800080', '#D8BFD8'],
  acero: ['#4682B4', '#B0C4DE']
};

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const text = args.join(' ').trim();
  if (!text) {
    return m.reply(
      `✏️ Usa el comando así:\n\n*.${command} [color opcional] tu mensaje*\n\nEjemplo:\n*.${command} azul Hola grupo*\n\nColores disponibles:\n` +
      Object.keys(colores).sort().join(', ')
    );
  }

  const [colorElegido, ...contenidoArr] = text.split(' ');
  const coloresGrad = colores[colorElegido.toLowerCase()] || colores['azul'];
  const contenido = colores[colorElegido.toLowerCase()] ? contenidoArr.join(' ') : text;
  const displayName = m.pushName || 'Usuario';
  let avatarUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';
  try {
    avatarUrl = await conn.profilePictureUrl(m.sender, 'image');
  } catch {}

  if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');

  const canvas = createCanvas(1080, 1080);
  const draw = canvas.getContext('2d');

  const grad = draw.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, coloresGrad[0]);
  grad.addColorStop(1, coloresGrad[1]);
  draw.fillStyle = grad;
  draw.fillRect(0, 0, 1080, 1080);

  // Avatar circular
  const avatar = await loadImage(avatarUrl);
  draw.save();
  draw.beginPath();
  draw.arc(100, 100, 80, 0, Math.PI * 2);
  draw.clip();
  draw.drawImage(avatar, 20, 20, 160, 160);
  draw.restore();

  // Nombre del usuario
  draw.font = 'bold 42px Sans-serif';
  draw.fillStyle = '#ffffff';
  draw.shadowColor = 'rgba(0,0,0,0.4)';
  draw.shadowOffsetX = 2;
  draw.shadowOffsetY = 2;
  draw.shadowBlur = 4;
  draw.fillText(displayName, 220, 100);

  // Texto central
  draw.font = 'bold 58px Sans-serif';
  draw.fillStyle = '#ffffff';
  draw.textAlign = 'center';

  const words = contenido.split(' ');
  let line = '', lines = [];
  for (const word of words) {
    const testLine = line + word + ' ';
    if (draw.measureText(testLine).width > 900) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = testLine;
    }
  }
  if (line.trim()) lines.push(line.trim());

  const startY = 540 - (lines.length * 40);
  lines.forEach((l, i) => {
    draw.fillText(l, 540, startY + (i * 75));
  });

  // Logo
  const logo = await loadImage('https://files.catbox.moe/9o4ugy.jpg');
  draw.drawImage(logo, canvas.width - 180, canvas.height - 180, 140, 140);

  // Guardar y enviar
  const filePath = `./tmp/texto-${Date.now()}.png`;
  const out = fs.createWriteStream(filePath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', async () => {
    await conn.sendMessage(m.chat, {
      image: { url: filePath },
      caption: `🖼 *Imagen generada por EliteBot*\n\nColor: *${colorElegido.toLowerCase() || 'azul'}*\nAutor: *${displayName}*`
    }, { quoted: m });
    fs.unlinkSync(filePath);
  });
};

handler.command = ['texto'];
export default handler;
