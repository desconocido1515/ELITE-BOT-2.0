import fetch from 'node-fetch'
import yts from 'yt-search'
import ytdl from 'ytdl-core'
import axios from 'axios'

let tempStorage = {}

let handler = async (m, { conn, args }) => {
    try {
        if (!args[0]) return m.reply('❗ Ingresa el nombre o link del video')

        let query = args.join(' ')
        let videos = await search(query)

        if (!videos || videos.length === 0) 
            return m.reply('❌ No se encontraron resultados')

        let video = videos[0]
        let mediaData = await ytMp4(video.url)

        if (mediaData && mediaData.result2) {
            const messageOptions = {
                caption: `🎬 *${mediaData.title}*`,
                ...tempStorage[m.sender]
            }

            if (mediaData.result2) {
                // Enviar como documento
                await conn.sendMessage(
                    m.chat,
                    { document: mediaData.result2, mimetype: 'video/mp4', ...messageOptions },
                    { quoted: m }
                )
            } else {
                // Enviar como video
                await conn.sendMessage(
                    m.chat,
                    { video: mediaData.result2, mimetype: 'video/mp4', ...messageOptions },
                    { quoted: m }
                )
            }
        } else {
            await conn.reply(m.chat, '❌ No se pudo descargar el video', m)
        }

    } catch (error) {
        console.error(error)
        await m.reply('❌ Ocurrió un error al procesar el video')
    } finally {
        delete tempStorage[m.sender]
    }
}

handler.command = /^(play|play2)$/i
handler.register = true
export default handler

// ===== Funciones auxiliares =====
async function search(query, options = {}) {
    const searchResult = await yts.search({ query, hl: 'es', gl: 'ES', ...options })
    return searchResult.videos
}

function MilesNumber(number) {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g
    const rep = '$1.'
    const arr = number.toString().split('.')
    arr[0] = arr[0].replace(exp, rep)
    return arr[1] ? arr.join('.') : arr[0]
}

function secondString(seconds) {
    seconds = Number(seconds)
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor((seconds % (3600 * 24)) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const dDisplay = d > 0 ? d + (d === 1 ? ' día, ' : ' días, ') : ''
    const hDisplay = h > 0 ? h + (h === 1 ? ' hora, ' : ' horas, ') : ''
    const mDisplay = m > 0 ? m + (m === 1 ? ' minuto, ' : ' minutos, ') : ''
    const sDisplay = s > 0 ? s + (s === 1 ? ' segundo' : ' segundos') : ''
    return dDisplay + hDisplay + mDisplay + sDisplay
}

const getBuffer = async (url) => {
    try {
        const response = await fetch(url)
        const buffer = await response.arrayBuffer()
        return Buffer.from(buffer)
    } catch (error) {
        console.error('Error al obtener el buffer', error)
        throw new Error('Error al obtener el buffer')
    }
}

async function getFileSize(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' })
        return parseInt(response.headers.get('content-length') || 0)
    } catch {
        return 0
    }
}

async function fetchInvidious(url) {
    const apiUrl = 'https://invidious.io/api/v1/get_video_info'
    const response = await fetch(`${apiUrl}?url=${encodeURIComponent(url)}`)
    const data = await response.json()
    if (data && data.video) return data.video
    throw new Error('No se pudo obtener información del video desde Invidious')
}

function getBestVideoQuality(videoData) {
    const preferredQualities = ['720p', '360p', 'auto']
    const availableQualities = Object.keys(videoData.video || {})
    for (let quality of preferredQualities) {
        if (availableQualities.includes(quality)) return videoData.video[quality].quality
    }
    return '360p'
}

// ===== Descarga de YouTube =====
async function ytMp3(url) {
    return new Promise((resolve, reject) => {
        ytdl.getInfo(url).then(async getUrl => {
            let result = []
            for (let i = 0; i < getUrl.formats.length; i++) {
                let item = getUrl.formats[i]
                if (item.mimeType === 'audio/webm; codecs="opus"') {
                    let bytes = item.contentLength ? await bytesToSize(item.contentLength) : 'Desconocido'
                    result[i] = { audio: item.url, size: bytes }
                }
            }
            let resultFix = result.filter(x => x.audio && x.size)
            if (!resultFix[0]) return reject('No se encontró audio compatible')
            let tiny = await axios.get(`https://tinyurl.com/api-create.php?url=${resultFix[0].audio}`)
            resolve({ title: getUrl.videoDetails.title, result: tiny.data, result2: resultFix, thumb: getUrl.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url })
        }).catch(reject)
    })
}

async function ytMp4(url) {
    return new Promise(async (resolve, reject) => {
        ytdl.getInfo(url).then(async getUrl => {
            let result = []
            for (let i = 0; i < getUrl.formats.length; i++) {
                let item = getUrl.formats[i]
                if (item.container === 'mp4' && item.hasVideo && item.hasAudio) {
                    let bytes = item.contentLength ? await bytesToSize(item.contentLength) : 'Desconocido'
                    result[i] = { video: item.url, quality: item.qualityLabel, size: bytes }
                }
            }
            let resultFix = result.filter(x => x.video && x.size && x.quality)
            if (!resultFix[0]) return reject('No se encontró video compatible')
            let tiny = await axios.get(`https://tinyurl.com/api-create.php?url=${resultFix[0].video}`)
            resolve({ title: getUrl.videoDetails.title, result: tiny.data, result2: resultFix[0].video, thumb: getUrl.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url })
        }).catch(reject)
    })
}

// ===== Función auxiliar para tamaño =====
async function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes == 0) return '0 Byte'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}
