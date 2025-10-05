import path from 'path'
import { toAudio } from './converter.js'
import chalk from 'chalk'
import fetch from 'node-fetch'
import PhoneNumber from 'awesome-phonenumber'
import fs from 'fs'
import util from 'util'
import { fileTypeFromBuffer } from 'file-type'
import { format } from 'util'
import { fileURLToPath } from 'url'
import store from './store.js'
import Jimp from 'jimp'  
import pino from 'pino'
import * as baileys from "@whiskeysockets/baileys" 

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const {
    default: _makeWaSocket,
    makeWALegacySocket,
    proto,
    downloadContentFromMessage,
    jidDecode,
    areJidsSameUser,
    generateWAMessage,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    WAMessageStubType,
    extractMessageContent,
    makeInMemoryStore,
    getAggregateVotesInPollMessage, 
    prepareWAMessageMedia,
    WA_DEFAULT_EPHEMERAL
} = baileys

export function makeWASocket(connectionOptions, options = {}) {
    let conn = (global.opts?.['legacy'] ? makeWALegacySocket : _makeWaSocket)(connectionOptions)

    let sock = Object.defineProperties(conn, {
        chats: {
            value: { ...(options.chats || {}) },
            writable: true
        },
        decodeJid: {
            value(jid) {
                if (!jid || typeof jid !== 'string') return jid
                const decoded = jidDecode(jid)
                return decoded ? `${decoded.user}@${decoded.server}` : jid
            }
        },
        logger: {
            get() {
                return {
                    info(...args) {
                        console.log(
                            chalk.bold.bgRgb(51, 204, 51)('INFO '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.cyan(format(...args))
                        )
                    },
                    error(...args) {
                        console.log(
                            chalk.bold.bgRgb(247, 38, 33)('ERROR '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.rgb(255, 38, 0)(format(...args))
                        )
                    },
                    warn(...args) {
                        console.log(
                            chalk.bold.bgRgb(255, 153, 0)('WARNING '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.redBright(format(...args))
                        )
                    },
                    trace(...args) {
                        console.log(
                            chalk.grey('TRACE '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.white(format(...args))
                        )
                    },
                    debug(...args) {
                        console.log(
                            chalk.bold.bgRgb(66, 167, 245)('DEBUG '),
                            `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                            chalk.white(format(...args))
                        )
                    }
                }
            }
        },
        sendSylph: {
            async value(jid, text = '', buffer, title, body, url, quoted, options) {
                try {
                    if (buffer) {
                        try { 
                            const type = await conn.getFile(buffer)
                            buffer = type.data 
                        } catch { 
                            // Mantener buffer original si hay error
                        }
                    }
                    let prep = generateWAMessageFromContent(jid, { 
                        extendedTextMessage: { 
                            text: text, 
                            contextInfo: { 
                                externalAdReply: { 
                                    title: title, 
                                    body: body, 
                                    thumbnail: buffer, 
                                    sourceUrl: url 
                                }, 
                                mentionedJid: await conn.parseMention(text) 
                            }
                        }
                    }, { quoted: quoted })
                    return conn.relayMessage(jid, prep.message, { messageId: prep.key.id })
                } catch (error) {
                    console.error('Error en sendSylph:', error)
                    throw error
                }
            }
        },
        getFile: {
            async value(PATH, saveToFile = false) {
                try {
                    let res, filename
                    let data
                    
                    if (Buffer.isBuffer(PATH)) {
                        data = PATH
                    } else if (PATH instanceof ArrayBuffer) {
                        data = Buffer.from(PATH)
                    } else if (typeof PATH === 'string' && PATH.startsWith('data:')) {
                        data = Buffer.from(PATH.split(',')[1], 'base64')
                    } else if (typeof PATH === 'string' && PATH.startsWith('http')) {
                        res = await fetch(PATH)
                        data = await res.buffer()
                    } else if (fs.existsSync(PATH)) {
                        filename = PATH
                        data = fs.readFileSync(PATH)
                    } else if (typeof PATH === 'string') {
                        data = Buffer.from(PATH)
                    } else {
                        data = Buffer.alloc(0)
                    }

                    if (!Buffer.isBuffer(data)) {
                        throw new TypeError('Result is not a buffer')
                    }

                    const type = await fileTypeFromBuffer(data) || {
                        mime: 'application/octet-stream',
                        ext: '.bin'
                    }

                    if (data && saveToFile && !filename) {
                        filename = path.join(__dirname, '../tmp/' + Date.now() + '.' + type.ext)
                        await fs.promises.writeFile(filename, data)
                    }

                    return {
                        res,
                        filename,
                        ...type,
                        data,
                        deleteFile() {
                            return filename && fs.promises.unlink(filename).catch(() => {})
                        }
                    }
                } catch (error) {
                    console.error('Error en getFile:', error)
                    throw error
                }
            }
        },
        sendContact: {
            async value(jid, data, quoted, options) {
                try {
                    if (!Array.isArray(data[0]) && typeof data[0] === 'string') {
                        data = [data]
                    }

                    let contacts = []
                    for (let [number, name] of data) {
                        number = number.replace(/[^0-9]/g, '')
                        let njid = number + '@s.whatsapp.net'
                        let biz = await conn.getBusinessProfile(njid).catch(() => null) || {}
                        
                        let vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name.replace(/\n/g, '\\n')};;;
FN:${name.replace(/\n/g, '\\n')}
TEL;type=CELL;type=VOICE;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}${biz.description ? `
X-WA-BIZ-NAME:${(conn.chats[njid]?.vname || conn.getName(njid) || name).replace(/\n/, '\\n')}
X-WA-BIZ-DESCRIPTION:${biz.description.replace(/\n/g, '\\n')}
`.trim() : ''}
END:VCARD`.trim()

                        contacts.push({ vcard, displayName: name })
                    }

                    return await conn.sendMessage(jid, {
                        ...options,
                        contacts: {
                            ...options,
                            displayName: contacts.length >= 2 ? `${contacts.length} contacts` : contacts[0]?.displayName || null,
                            contacts,
                        }
                    }, { quoted, ...options })
                } catch (error) {
                    console.error('Error en sendContact:', error)
                    throw error
                }
            }
        },
        resize: {
            async value(buffer, width, height) {
                try {
                    const image = await Jimp.read(buffer)
                    const resized = await image.resize(width, height).getBufferAsync(Jimp.MIME_JPEG)
                    return resized
                } catch (error) {
                    console.error('Error en resize:', error)
                    throw error
                }
            }
        },
        reply: {
            value(jid, text = '', quoted, options) {
                try {
                    if (Buffer.isBuffer(text)) {
                        return conn.sendFile(jid, text, 'file', '', quoted, false, options)
                    }
                    return conn.sendMessage(jid, { ...options, text }, { quoted, ...options })
                } catch (error) {
                    console.error('Error en reply:', error)
                    throw error
                }
            }
        },
        sendFile: {
            async value(jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) {
                try {
                    let type = await conn.getFile(path, true)
                    let { data: file, filename: pathFile } = type

                    let opt = {}
                    if (quoted) opt.quoted = quoted
                    if (!type) options.asDocument = true

                    let mtype = ''
                    let mimetype = options.mimetype || type.mime
                    let convert

                    if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) {
                        mtype = 'sticker'
                    } else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) {
                        mtype = 'image'
                    } else if (/video/.test(type.mime)) {
                        mtype = 'video'
                    } else if (/audio/.test(type.mime)) {
                        convert = await toAudio(file, type.ext)
                        file = convert.data
                        pathFile = convert.filename
                        mtype = 'audio'
                        mimetype = options.mimetype || 'audio/ogg; codecs=opus'
                    } else {
                        mtype = 'document'
                    }

                    if (options.asDocument) mtype = 'document'

                    // Limpiar opciones
                    const cleanOptions = { ...options }
                    delete cleanOptions.asSticker
                    delete cleanOptions.asLocation
                    delete cleanOptions.asVideo
                    delete cleanOptions.asDocument
                    delete cleanOptions.asImage

                    let message = {
                        ...cleanOptions,
                        caption,
                        ptt,
                        [mtype]: { url: pathFile },
                        mimetype,
                        fileName: filename || pathFile.split('/').pop()
                    }

                    let m
                    try {
                        m = await conn.sendMessage(jid, message, { ...opt, ...cleanOptions })
                    } catch (e) {
                        console.error('Error sending message, trying alternative:', e)
                        m = await conn.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...cleanOptions })
                    }

                    return m
                } catch (error) {
                    console.error('Error en sendFile:', error)
                    throw error
                }
            }
        },
        parseMention: {
            value(text = '') {
                try {
                    const mentions = [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
                    return mentions
                } catch (error) {
                    console.error('Error en parseMention:', error)
                    return []
                }
            }
        },
        getName: {
            value(jid = '', withoutContact = false) {
                try {
                    jid = conn.decodeJid(jid)
                    withoutContact = conn.withoutContact || withoutContact

                    if (jid.endsWith('@g.us')) {
                        return new Promise(async (resolve) => {
                            let v = conn.chats[jid] || {}
                            if (!(v.name || v.subject)) {
                                v = await conn.groupMetadata(jid).catch(() => ({})) || {}
                            }
                            resolve(v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international'))
                        })
                    } else {
                        let v = jid === '0@s.whatsapp.net' ? {
                            jid,
                            vname: 'WhatsApp'
                        } : areJidsSameUser(jid, conn.user?.id) ? conn.user : (conn.chats[jid] || {})
                        
                        let userName = global.db?.data?.users?.[jid.replace('@s.whatsapp.net', '')]?.name
                        if (!userName) {
                            userName = PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
                        }
                        return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || userName
                    }
                } catch (error) {
                    console.error('Error en getName:', error)
                    return jid
                }
            }
        },
        sendButton: {
            async value(jid, text = '', footer = '', buffer, buttons, quoted, options = {}) {
                try {
                    if (Array.isArray(buffer)) {
                        options = quoted
                        quoted = buttons
                        buttons = buffer
                        buffer = null
                    } else if (buffer) {
                        try {
                            const type = await conn.getFile(buffer)
                            buffer = type.data
                        } catch {
                            buffer = null
                        }
                    }

                    if (!Array.isArray(buttons[0]) && typeof buttons[0] === 'string') {
                        buttons = [buttons]
                    }

                    let message = {
                        ...options,
                        text: text || '',
                        footer,
                        buttons: buttons.map(btn => ({
                            buttonId: btn[1] || btn[0] || '',
                            buttonText: {
                                displayText: btn[0] || btn[1] || ''
                            }
                        }))
                    }

                    if (buffer) {
                        const type = buffer ? await conn.getFile(buffer).catch(() => null) : null
                        if (type && /image/.test(type.mime)) {
                            message.image = buffer
                        } else if (type && /video/.test(type.mime)) {
                            message.video = buffer
                        } else {
                            message.document = buffer
                        }
                    }

                    return await conn.sendMessage(jid, message, {
                        quoted,
                        ...options
                    })
                } catch (error) {
                    console.error('Error en sendButton:', error)
                    throw error
                }
            }
        },
        cMod: {
            value(jid, message, text = '', sender = conn.user?.jid, options = {}) {
                try {
                    if (options.mentions && !Array.isArray(options.mentions)) {
                        options.mentions = [options.mentions]
                    }

                    let copy = JSON.parse(JSON.stringify(message))
                    delete copy.message?.messageContextInfo
                    delete copy.message?.senderKeyDistributionMessage

                    let mtype = Object.keys(copy.message || {})[0]
                    if (!mtype) return message

                    let msg = copy.message[mtype]
                    let content = msg

                    if (typeof content === 'string') {
                        copy.message[mtype] = text || content
                    } else if (content?.caption) {
                        content.caption = text || content.caption
                    } else if (content?.text) {
                        content.text = text || content.text
                    }

                    if (typeof content !== 'string') {
                        copy.message[mtype] = { ...content, ...options }
                        copy.message[mtype].contextInfo = {
                            ...(content.contextInfo || {}),
                            mentionedJid: options.mentions || content.contextInfo?.mentionedJid || []
                        }
                    }

                    if (copy.participant) {
                        sender = copy.participant = sender || copy.participant
                    } else if (copy.key?.participant) {
                        sender = copy.key.participant = sender || copy.key.participant
                    }

                    if (copy.key?.remoteJid?.includes('@s.whatsapp.net')) {
                        sender = sender || copy.key.remoteJid
                    } else if (copy.key?.remoteJid?.includes('@broadcast')) {
                        sender = sender || copy.key.remoteJid
                    }

                    copy.key = copy.key || {}
                    copy.key.remoteJid = jid
                    copy.key.fromMe = areJidsSameUser(sender, conn.user?.id) || false

                    return proto.WebMessageInfo.fromObject(copy)
                } catch (error) {
                    console.error('Error en cMod:', error)
                    return message
                }
            }
        }
    })

    if (sock.user?.id) {
        sock.user.jid = sock.decodeJid(sock.user.id)
    }

    store.bind(sock)
    return sock
}

// Función smsg corregida y optimizada
export function smsg(conn, m) {
    if (!m) return m
    
    try {
        // Si ya está procesado, retornar directamente
        if (m.mtype && m.conn) return m
        
        let mtype = m.mtype
        if (!mtype) {
            const messageObj = m.message || (m.messages && m.messages[0]?.message) || {}
            mtype = Object.keys(messageObj)[0]
        }
        
        if (!mtype) {
            return {
                ...m,
                text: m.text || '',
                mentionedJid: [],
                isGroup: false,
                fromMe: m.key?.fromMe || false,
                isBaileys: false,
                quoted: null,
                conn: conn
            }
        }

        let msg = m.message?.[mtype] || (m.messages && m.messages[0]?.message?.[mtype])
        
        // Crear objeto base mejorado
        const simplified = {
            ...m,
            mtype,
            text: m.text || msg?.text || msg?.caption || msg?.contentText || '',
            mentionedJid: msg?.contextInfo?.mentionedJid || [],
            isGroup: typeof m.chat === 'string' && m.chat.endsWith('@g.us') || false,
            sender: m.sender || (m.key?.fromMe && conn.user?.id) || m.key?.participant || m.key?.remoteJid,
            fromMe: m.key?.fromMe || false,
            id: m.key?.id,
            isBaileys: typeof m.id === 'string' && m.id.startsWith('BAE5') && m.id.length === 16,
            chat: m.chat || m.key?.remoteJid,
            pushName: m.pushName || '',
            isCmd: false,
            body: m.text || '',
            conn: conn
        }

        // Manejar mensajes citados de forma segura
        if (msg?.contextInfo?.quotedMessage) {
            const quotedMsg = msg.contextInfo.quotedMessage
            const quotedType = Object.keys(quotedMsg)[0]
            const quotedContent = quotedMsg[quotedType]
            
            simplified.quoted = {
                mtype: quotedType,
                text: quotedContent?.text || quotedContent?.caption || '',
                mentionedJid: quotedContent?.contextInfo?.mentionedJid || [],
                sender: msg.contextInfo.participant,
                fromMe: msg.contextInfo.participant === (conn.user?.id || conn.user?.jid),
                key: {
                    id: msg.contextInfo.stanzaId,
                    remoteJid: msg.contextInfo.remoteJid,
                    fromMe: msg.contextInfo.participant === (conn.user?.id || conn.user?.jid)
                }
            }
        } else {
            simplified.quoted = null
        }

        return simplified

    } catch (error) {
        console.error('❌ Error en smsg:', error)
        // Devolver el mensaje original en caso de error
        return {
            ...m,
            text: m.text || '',
            mentionedJid: [],
            isGroup: false,
            fromMe: m.key?.fromMe || false,
            isBaileys: false,
            quoted: null,
            conn: conn
        }
    }
}

export default smsg
