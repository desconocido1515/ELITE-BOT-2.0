import yts from 'yt-search'
import ytdl from 'ytdl-core'
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text?.trim()) return conn.reply(m.chat, `❀ Por favor, ingresa el nombre de la música a descargar.`, m)
        await m.react('🕒')

        // Buscar video en YouTube
        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
        const search = await yts(query)
        const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]

        if (!result) throw 'ꕥ No se encontraron resultados.'

        const { title, thumbnail, timestamp, views, ago, url, author, seconds } = result
        if (seconds > 1800) throw '⚠ El video supera el límite de duración (30 minutos).'

        const vistas = formatViews(views)
        const info = `「✦」Descargando *<${title}>*\n\n> ❑ Canal » *${author.name}*\n> ♡ Vistas » *${vistas}*\n> ✧︎ Duración » *${timestamp}*\n> ☁︎ Publicado » *${ago}*\n> ➪ Link » ${url}`

        // Enviar miniatura
        const thumbResp = await fetch(thumbnail)
        const thumbBuffer = Buffer.from(await thumbResp.arrayBuffer())
        await conn.sendMessage(m.chat, { image: thumbBuffer, caption: info }, { quoted: m })

        // Carpeta temporal
        const tempDir = './downloads'
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir)

        if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
            const filePath = path.join(tempDir, `${title}.mp3`)
            await downloadAudio(url, filePath)
            await conn.sendMessage(m.chat, { audio: fs.readFileSync(filePath), fileName: `${title}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m })
            await m.react('✔️')
            fs.unlinkSync(filePath) // borrar temporal
        } else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
            const filePath = path.join(tempDir, `${title}.mp4`)
            await downloadVideo(url, filePath)
            await conn.sendFile(m.chat, fs.readFileSync(filePath), `${title}.mp4`, `> ❀ ${title}`, m)
            await m.react('✔️')
            fs.unlinkSync(filePath)
        }

    } catch (e) {
        await m.react('✖️')
        return conn.reply(m.chat, typeof e === 'string' ? e : '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + (e.message || e), m)
    }
}

handler.command = handler.help = ['play', 'yta', 'ytmp3', 'play2', 'ytv', 'ytmp4', 'playaudio', 'mp4']
handler.tags = ['descargas']
handler.group = true
export default handler

// ---------------- FUNCIONES AUXILIARES ----------------

function formatViews(views) {
    if (views === undefined) return "No disponible"
    if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
    return views.toString()
}

async function downloadAudio(url, filePath) {
    return new Promise((resolve, reject) => {
        const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' })
        stream.pipe(fs.createWriteStream(filePath))
        stream.on('end', () => resolve(filePath))
        stream.on('error', reject)
    })
}

async function downloadVideo(url, filePath) {
    return new Promise((resolve, reject) => {
        const stream = ytdl(url, { quality: 'highestvideo' })
        stream.pipe(fs.createWriteStream(filePath))
        stream.on('end', () => resolve(filePath))
        stream.on('error', reject)
    })
}
