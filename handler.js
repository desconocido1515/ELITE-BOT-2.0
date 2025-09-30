import { smsg } from './lib/simple.js'
import { format } from 'util' 
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
    clearTimeout(this)
    resolve()
}, ms))

export async function handler(chatUpdate) {
    // DEBUG: Ver todos los mensajes que llegan con stubs
    if (chatUpdate.messages && chatUpdate.messages.length > 0) {
        const lastMessage = chatUpdate.messages[chatUpdate.messages.length - 1]
        if (lastMessage.messageStubType) {
            console.log('📨 MENSAJE CON STUB RECIBIDO:', {
                stubType: lastMessage.messageStubType,
                stubName: WAMessageStubType[lastMessage.messageStubType],
                params: lastMessage.messageStubParameters,
                chat: lastMessage.key?.remoteJid,
                isGroup: lastMessage.key?.remoteJid?.endsWith('@g.us')
            })
        }
    }

    this.msgqueque = this.msgqueque || []
    if (!chatUpdate)
        return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m)
        return
    if (global.db.data == null)
        await global.loadDatabase()
    try {
        m = smsg(this, m) || m
        if (!m)
            return
        m.exp = 0
        m.limit = false
        try {
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object')
                global.db.data.users[m.sender] = {}
            if (user) {
                if (!isNumber(user.exp))
                    user.exp = 0
                if (!isNumber(user.limit))
                    user.limit = 10
                if (!('premium' in user)) 
                    user.premium = false
                if (!user.premium) 
                    user.premiumTime = 0
                if (!('registered' in user))
                    user.registered = false
                if (!user.registered) {
                    if (!('name' in user))
                        user.name = m.name
                    if (!isNumber(user.age))
                        user.age = -1
                    if (!isNumber(user.regTime))
                        user.regTime = -1
                }
                if (!isNumber(user.afk))
                    user.afk = -1
                if (!('afkReason' in user))
                    user.afkReason = ''
                if (!('banned' in user))
                    user.banned = false
                if (!('useDocument' in user))
                    user.useDocument = false
                if (!isNumber(user.level))
                    user.level = 0
                if (!isNumber(user.bank))
                    user.bank = 0
            } else 
                global.db.data.users[m.sender] = {
                    exp: 0,
                    limit: 10,
                    registered: false,
                    name: m.name,
                    age: -1,
                    regTime: -1,
                    afk: -1,
                    afkReason: '',
                    banned: false,
                    useDocument: true,
                    bank: 0,
                    level: 0,
                }
            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object')
                global.db.data.chats[m.chat] = {}
            if (chat) {
                if (!('isBanned' in chat))
                    chat.isBanned = false
                if (!('bienvenida' in chat))
                    chat.bienvenida = true 
                if (!('antiLink' in chat))
                    chat.antiLink = false
                if (!('antilinkxxx' in chat))
                    chat.antiLinkxxx = false
                if (!('detect' in chat)) 
                    chat.detect = true
                if (!('onlyLatinos' in chat))
                    chat.onlyLatinos = false
                if (!('audios' in chat))
                    chat.audios = false
                if (!('modoadmin' in chat))
                    chat.modoadmin = false
                if (!('nsfw' in chat))
                    chat.nsfw = false
                if (!isNumber(chat.expired))
                    chat.expired = 0
                if (!('antiLag' in chat))
                    chat.antiLag = false
                if (!('per' in chat))
                    chat.per = []
            } else
                global.db.data.chats[m.chat] = {
                    isBanned: false,
                    bienvenida: true,
                    antiLink: false,
                    antilinkxxx: false,
                    detect: true,
                    onlyLatinos: false,
                    nsfw: false,
                    audios: false,
                    modoadmin: false, 
                    expired: 0, 
                    antiLag: false,
                    per: [],
                }
            var settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
            if (settings) {
                if (!('self' in settings)) settings.self = false
                if (!('autoread' in settings)) settings.autoread = true
                if (!('antiPrivate' in settings)) settings.antiPrivate = true
                if (!('antiPrivate2' in settings)) settings.antiPrivate2 = true
                if (!('antiBot' in settings)) settings.antiBot2 = true
                if (!('antiSpam' in settings)) settings.antiSpam = false
            } else global.db.data.settings[this.user.jid] = {
                self: false,
                autoread: true,
                antiPrivate: true,
                antiPrivate2: true,
                antiBot: true,
                antiSpam: false,
                status: 0
            }
        } catch (e) {
            console.error(e)
        }

        // Tesis estuvo aquí 🤤
       const mainBot = global?.conn?.user?.jid
       const chat = global.db.data.chats[m.chat] || {}
       const isSubbs = chat.antiLag === true
       const allowedBots = chat.per || []
       if (!allowedBots.includes(mainBot)) allowedBots.push(mainBot)
       const isAllowed = allowedBots.includes(this?.user?.jid)
       if (isSubbs && !isAllowed) 
            return
        // --
        if (opts['nyimak'])  return
        if (!m.fromMe && opts['self'])  return
        if (opts['swonly'] && m.chat !== 'status@broadcast')  return
        if (typeof m.text !== 'string')
            m.text = ''


        let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]
        //- Tesis estuvo aquí 🙀🙀
        const sendNum = m?.sender?.replace(/[^0-9]/g, '')
        const isROwner = [conn.decodeJid(global.conn?.user?.id), ...global.owner?.map(([number]) => number)].map(v => (v || '').replace(/[^0-9]/g, '')).includes(sendNum)

// WillZek Estuvo Por Acá 
const dbsubsprems = global.db.data.settings[this.user.jid] || {}
const subsactivos = dbsubsprems.actives || []

const botIds = [this?.user?.id, this?.user?.lid, ...(global.owner?.map(([n]) => n) || [])
].map(jid => jid?.replace(/[^0-9]/g, '')).filter(Boolean)

const isPremSubs = subsactivos.some(jid => jid.replace(/[^0-9]/g, '') === sendNum) || botIds.includes(sendNum) || (global.conns || []).some(conn => conn?.user?.jid?.replace(/[^0-9]/g, '') === sendNum && conn?.ws?.socket?.readyState !== 3
  )

        const isOwner = isROwner || m.fromMe
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || _user.prem == true

        if (opts['queque'] && m.text && !(isMods || isPrems)) {
            let queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }

        if (m.isBaileys)
            return
        m.exp += Math.ceil(Math.random() * 10)

        let usedPrefix

// =============================================
// 🔧 SECCIÓN CORREGIDA - VERIFICACIÓN DE ADMINISTRADORES
// =============================================

let isRAdmin = false
let isAdmin = false
let isBotAdmin = false
let participants = []
let groupMetadata = {}

if (m.isGroup) {
    try {
        // Obtener metadatos actualizados del grupo
        groupMetadata = await this.groupMetadata(m.chat).catch(_ => null) || {}
        participants = groupMetadata.participants || []
        
        // Buscar al usuario que envió el mensaje
        const user = participants.find(p => p.id === m.sender || p.jid === m.sender)
        
        // Verificar si es administrador
        if (user) {
            isRAdmin = user.admin === 'superadmin'
            isAdmin = isRAdmin || user.admin === 'admin'
        }
        
        // Buscar al bot en los participantes
        const botParticipant = participants.find(p => 
            p.id === this.user.jid || p.jid === this.user.jid
        )
        
        // Verificar si el bot es administrador
        if (botParticipant) {
            isBotAdmin = botParticipant.admin === 'superadmin' || botParticipant.admin === 'admin'
        }
        
        // DEBUG: Mostrar información de administradores (SOLO PARA TESTING)
        if (m.text && typeof m.text === 'string') {
            const currentPrefix = conn.prefix || global.prefix
            if (typeof currentPrefix === 'string' && m.text.startsWith(currentPrefix)) {
                console.log(chalk.cyan('🔍 DEBUG ADMIN:'), {
                    sender: m.sender,
                    userAdmin: user?.admin,
                    isAdmin: isAdmin,
                    isRAdmin: isRAdmin,
                    isBotAdmin: isBotAdmin,
                    command: m.text.split(' ')[0],
                    totalParticipants: participants.length
                })
            }
        }
        
    } catch (error) {
        console.error(chalk.red('❌ Error al verificar administradores:'), error)
        // En caso de error, asumir que no es admin para seguridad
        isAdmin = false
        isRAdmin = false
        isBotAdmin = false
    }
}

// =============================================
// FIN DE SECCIÓN CORREGIDA
// =============================================

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        
        // DEBUG: Contar plugins con before
        let pluginsWithBefore = 0
        for (let name in global.plugins) {
            if (global.plugins[name]?.before) pluginsWithBefore++
        }
        console.log(`🔧 Plugins cargados: ${Object.keys(global.plugins).length}, con before: ${pluginsWithBefore}`)

        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin)
                continue
            if (plugin.disabled)
                continue
            const __filename = join(___dirname, name)
            
            // 🔧 EJECUTAR plugin.all (si existe)
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, {
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename
                    })
                } catch (e) {
                    console.error(e)
                }
            }
            
            // 🔧 EJECUTAR plugin.before PARA DETECTORES (CORRECIÓN CRÍTICA)
            if (typeof plugin.before === 'function') {
                try {
                    const beforeResult = await plugin.before.call(this, m, {
                        conn: this,
                        participants,
                        groupMetadata,
                        user: participants.find(p => p.id === m.sender || p.jid === m.sender),
                        bot: participants.find(p => p.id === this.user.jid || p.jid === this.user.jid),
                        isROwner,
                        isOwner,
                        isRAdmin,
                        isAdmin,
                        isBotAdmin,
                        isPrems,
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename
                    })
                    
                    // DEBUG: Verificar si se ejecutó el detector para stubs
                    if (m.messageStubType && name.includes('detect')) {
                        console.log(`🎯 Plugin before ejecutado: ${name}`, {
                            stubType: m.messageStubType,
                            stubName: WAMessageStubType[m.messageStubType],
                            result: beforeResult
                        })
                    }
                    
                    // Si plugin.before retorna true, saltar el procesamiento de comandos
                    if (beforeResult === true) {
                        continue
                    }
                } catch (e) {
                    console.error(`❌ Error en plugin.before de ${name}:`, e)
                }
            }
            
            if (!opts['restrict'])
                if (plugin.tags && plugin.tags.includes('admin')) {
                    continue
                }
            
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
            
            // CORRECCIÓN: Manejar correctamente los prefijos RegExp
            let match
            if (_prefix instanceof RegExp) {
                match = [_prefix.exec(m.text), _prefix]
            } else if (Array.isArray(_prefix)) {
                match = _prefix.map(p => {
                    let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
                    return [re.exec(m.text), re]
                }).find(p => p[0])
            } else if (typeof _prefix === 'string') {
                const regex = new RegExp(str2Regex(_prefix))
                match = [regex.exec(m.text), regex]
            } else {
                match = [[], new RegExp]
            }

            if (!match || !match[0]) continue

            // Este before es diferente - es para comandos específicos
            if (typeof plugin.before === 'function') {
                // Ya ejecutamos plugin.before arriba, así que saltamos
                continue
            }
            
            if (typeof plugin !== 'function')
                continue
                
            if ((usedPrefix = (match[0] || '')[0])) {
                let noPrefix = m.text.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                args = args || []
                let _args = noPrefix.trim().split` `.slice(1)
                
                // Tesis estuvo aquí 🙀
                let text = _args.join` `  
                command = (command || '').toLowerCase()  
                
                const gruposPermitidos = ['120363420992965884@g.us','120363404767596170@g.us']
                const comandosPermitidos = ['serbot', 'bots', 'kick', 'code', 's', 'delsession', 'on', 'off', 'tutosub']

                if (gruposPermitidos.includes(m.chat) && !comandosPermitidos.includes(command)) {
                    return
                }

                let fail = plugin.fail || global.dfail
                let isAccept = plugin.command instanceof RegExp ? 
                    plugin.command.test(command) :
                    Array.isArray(plugin.command) ?
                        plugin.command.some(cmd => cmd instanceof RegExp ? 
                            cmd.test(command) :
                            cmd === command
                        ) :
                        typeof plugin.command === 'string' ? 
                            plugin.command === command :
                            false

                if (!isAccept)
                    continue
                    
                m.plugin = name
                if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                    let chat = global.db.data.chats[m.chat]
                    let user = global.db.data.users[m.sender]
                    let setting = global.db.data.settings[this.user.jid]
                    if (name != 'group-unbanchat.js' && chat?.isBanned)
                        return 
                    if (name != 'owner-unbanuser.js' && user?.banned)
                        return
                    if (name != 'owner-unbanbot.js' && setting?.banned)
                        return
                }
                
                let adminMode = global.db.data.chats[m.chat].modoadmin

                if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin) return
                if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { 
                    fail('owner', m, this)
                    continue
                }
                if (plugin.rowner && !isROwner) { 
                    fail('rowner', m, this)
                    continue
                }
                if (plugin.owner && !isOwner) { 
                    fail('owner', m, this)
                    continue
                }
                if (plugin.mods && !isMods) { 
                    fail('mods', m, this)
                    continue
                }
                if (plugin.premium && !isPrems) { 
                    fail('premium', m, this)
                    continue
                }
                if (plugin.group && !m.isGroup) { 
                    fail('group', m, this)
                    continue
                } else if (plugin.botAdmin && !isBotAdmin) { 
                    fail('botAdmin', m, this)
                    continue
                } else if (plugin.admin && !isAdmin) { 
                    fail('admin', m, this)
                    continue
                }
                if (plugin.premsub && !isPremSubs) {
                    fail('premsubs', m, this)
                    continue
                }
                if (plugin.private && m.isGroup) {
                    fail('private', m, this)
                    continue
                }
                if (plugin.register == true && _user.registered == false) { 
                    fail('unreg', m, this)
                    continue
                }
                
                m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17 
                if (xp > 200)
                    m.reply('chirrido -_-')
                else
                    m.exp += xp
                    
                if (!isPrems && plugin.limit && global.db.data.users[m.sender].limit < plugin.limit * 1) {
                    conn.reply(m.chat, `Se agotaron tus *✳️ Eris*`, m, rcanal)
                    continue
                }
                
                let extra = {
                    match,
                    usedPrefix,
                    noPrefix,
                    _args,
                    args,
                    command,
                    text,
                    conn: this,
                    participants,
                    groupMetadata,
                    user: participants.find(p => p.id === m.sender || p.jid === m.sender),
                    bot: participants.find(p => p.id === this.user.jid || p.jid === this.user.jid),
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isPremSubs,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                }
                
                try {
                    await plugin.call(this, m, extra)
                    if (!isPrems)
                        m.limit = m.limit || plugin.limit || false
                } catch (e) {
                    m.error = e
                    console.error(e)
                    if (e) {
                        let text = format(e)
                        for (let key of Object.values(global.APIKeys))
                            text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
                        m.reply(text)
                    }
                } finally {
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra)
                        } catch (e) {
                            console.error(e)
                        }
                    }
                    if (m.limit)
                        conn.reply(m.chat, `Utilizaste *${+m.limit}* ✳️`, m, rcanal)
                }
                break
            }
        }
    } catch (e) {
        console.error(e)
    } finally {
        if (opts['queque'] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1)
                this.msgqueque.splice(quequeIndex, 1)
        }
        let user, stats = global.db.data.stats
        if (m) {
            if (m.sender && (user = global.db.data.users[m.sender])) {
                user.exp += m.exp
                user.limit -= m.limit * 1
            }

            let stat
            if (m.plugin) {
                let now = +new Date
                if (m.plugin in stats) {
                    stat = stats[m.plugin]
                    if (!isNumber(stat.total))
                        stat.total = 1
                    if (!isNumber(stat.success))
                        stat.success = m.error != null ? 0 : 1
                    if (!isNumber(stat.last))
                        stat.last = now
                    if (!isNumber(stat.lastSuccess))
                        stat.lastSuccess = m.error != null ? 0 : now
                } else
                    stat = stats[m.plugin] = {
                        total: 1,
                        success: m.error != null ? 0 : 1,
                        last: now,
                        lastSuccess: m.error != null ? 0 : now
                    }
                stat.total += 1
                stat.last = now
                if (m.error == null) {
                    stat.success += 1
                    stat.lastSuccess = now
                }
            }
        }

        try {
            if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
        } catch (e) {
            console.log(m, m.quoted, e)
        }
        const settingsREAD = global.db.data.settings[this.user.jid] || {}
        if (opts['autoread']) await this.readMessages([m.key])
        if (settingsREAD.autoread) await this.readMessages([m.key])
    }
}

global.dfail = async (type, m, conn, usedPrefix) => {
    let msg = {
        rowner: "¡𝘏𝘰𝘭𝘢 𝘏𝘶𝘮𝘢𝘯𝘰! ✨\n» 𝘛𝘦 𝘪𝘯𝘧𝘰𝘳𝘮𝘰 𝘲𝘶𝘦 𝘦𝘴𝘵𝘦 𝘤𝘰𝘮𝘢𝘯𝘥𝘰 𝘴𝘰𝘭𝘰 𝘱𝘶𝘦𝘥𝘦 𝘶𝘴𝘢𝘳 𝘮𝘪 𝘱𝘳𝘰𝘱𝘪𝘦𝘵𝘢𝘳𝘪𝘰 𝘒𝘦𝘷𝘷.",
        owner: "¡𝘏𝘰𝘭𝘢 𝘏𝘶𝘮𝘢𝘯𝘰! ✨\n» 𝘛𝘦 𝘪𝘯𝘧𝘰𝘳𝘮𝘰 𝘲𝘶𝘦 𝘦𝘴𝘵𝘦 𝘤𝘰𝘮𝘢𝘯𝘥𝘰 𝘴𝘰𝘭𝘰 𝘱𝘶𝘦𝘥𝘦 𝘶𝘴𝘢𝘳 𝘮𝘪 𝘱𝘳𝘰𝘱𝘪𝘦𝘵𝘢𝘳𝘪𝘰 𝘒𝘦𝘷𝘷.",
        mods: "¡𝘏𝘰𝘭𝘢 𝘏𝘶𝘮𝘢𝘯𝘰! ✨\n» 𝘛𝘦 𝘪𝘯𝘧𝘰𝘳𝘮𝘰 𝘲𝘶𝘦 𝘦𝘴𝘵𝘦 𝘤𝘰𝘮𝘢𝘯𝘣𝘰 𝘴𝘰𝘭𝘰 𝘱𝘶𝘦𝘥𝘦 𝘶𝘴𝘢𝘳 𝘮𝘪 𝘱𝘳𝘰𝘱𝘪𝘦𝘵𝘢𝘳𝘪𝘰 𝘒𝘦𝘷𝘷.",
        premium: " |𝐀𝐯𝐢𝐬𝐨| *`🔑 𝐍𝐎 𝐄𝐑𝐄𝐒 𝐔𝐒𝐔𝐀𝐑𝐈𝐎 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 𝐇𝐀𝐁𝐋𝐀 𝐂𝐎𝐍 𝐌𝐈 𝐂𝐑𝐄𝐀𝐃𝐎𝐑⚡`*_",
        premsubs: '《★》Esta función solo puede ser usada por subbots premiums.', 
        group: "¡𝘏𝘰𝘭𝘢 𝘏𝘶𝘮𝘢𝘯𝘰! 📢» 𝘌𝘴𝘵𝘦 𝘤𝘰𝘮𝘢𝘯𝘥𝘰 𝘴𝘰𝘭𝘰 𝘱𝘶𝘦𝘥𝘦𝘴 𝘶𝘴𝘢𝘳𝘭𝘰 𝘦𝘯 𝘨𝘳𝘶𝘱𝘰𝘴.",
        private: " |𝐀𝐯𝐢𝐬𝐨|  _*`💬 𝐔𝐒𝐀 𝐄𝐋 𝐂𝐇𝐀𝐓 𝐏𝐑𝐈𝐕𝐀𝐃𝐎 𝐏𝐀𝐑𝐀 𝐄𝐒𝐓𝐄 𝐂𝐎𝐌𝐀𝐍𝐃𝐎⚡`*_",
        admin: "¡𝘏𝘰𝘭𝘢 𝘏𝘶𝘮𝘢𝘯𝘰! ✨\n» 𝘛𝘦 𝘪𝘯𝘛𝘰𝘳𝘮𝘰 𝘲𝘶𝘦 𝘦𝘴𝘵𝘦 𝘤𝘰𝘮𝘢𝘯𝘥𝘰 𝘴𝘰𝘭𝘰 𝘱𝘶𝘦𝘥𝘦𝘯 𝘶𝘴𝘢𝘳 𝘭𝘰𝘴 𝘢𝘥𝘮𝘪𝘯𝘪𝘴𝘵𝘳𝘢𝘥𝘰𝘳𝘦𝘴 𝘥𝘦 𝘦𝘴𝘵𝘦 𝘨𝘳𝘶𝘱𝘰.",
        botAdmin: "¡𝘏𝘰𝘭𝘢 𝘏𝘶𝘮𝘢𝘯𝘰! 👤\n» 𝘕𝘦𝘤𝘦𝘴𝘪𝘵𝘰 𝘴𝘦𝘳 𝘢𝘥𝘮𝘪𝘯𝘪𝘴𝘵𝘳𝘢𝘥𝘰𝘳 𝘱𝘢𝘳𝘢 𝘶𝘴𝘢𝘳 𝘦𝘴𝘵𝘦 𝘤𝘰𝘮𝘢𝘯𝘥𝘰.",
        unreg: "¡𝘏𝘰𝘭𝘢 𝘏𝘶𝘮𝘢𝘯𝘰! ⭐\n» 𝘗𝘢𝘳𝘢 𝘶𝘵𝘪𝘭𝘪𝘻𝘢𝘳 𝘦𝘴𝘵𝘦 𝘤𝘰𝘮𝘢𝘯𝘥𝘰 𝘥𝘦𝘣𝘦𝘴 𝘷𝘦𝘳𝘪𝘧𝘪𝘤𝘢𝘳𝘵𝘦 𝘦𝘯 𝘮𝘪 𝘣𝘢𝘴𝘦 𝘥𝘦 𝘥𝘢𝘵𝘰𝘴. 𝘜𝘴𝘢 el comando .𝘷𝘦𝘳𝘪𝘧𝘪𝘤𝘢𝘳\n𝘌𝘭𝘪𝘵𝘦𝘉𝘰𝘵𝘎𝘭𝘰𝘣𝘢𝘭",
        restrict: "¡𝘏𝘰𝘭𝘢 𝘏𝘶𝘮𝘢𝘯𝘰! ⭐\n» 𝘌𝘴𝘵𝘦 𝘤𝘰𝘮𝘢𝘯𝘥𝘰 𝘦𝘴𝘵𝘢́ 𝘥𝘦𝘴𝘢𝘤𝘵𝘪𝘷𝘢𝘥𝘰 𝘱𝘰𝘳 𝘮𝘪 𝘤𝘳𝘦𝘢𝘥𝘰𝘳 𝘒𝘦𝘷𝘷."
    }[type]

    if (msg) {
        await conn.reply(m.chat, msg, m)
        await m.react('✖️')
    }
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("Se actualizo 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})
