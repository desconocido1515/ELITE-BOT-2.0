const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = await import('@whiskeysockets/baileys')
import qrcode from 'qrcode'
import NodeCache from 'node-cache'
import fs from 'fs'
import path from 'path'
import pino from 'pino'
import chalk from 'chalk'
import util from 'util'
import * as ws from 'ws'
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

const wm = global.wm || 'EliteBot'
const accountsgb = global.channel || ''
const gataMenu = global.catalogo || null
const { CONNECTING } = ws

let crm1 = "Y2QgcGx1Z2lucys"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = "CkphZGlib3QsIEhlY2hv"
let drm2 = "IHBvciBAQWlkZW5fTm90TG9naWM="
let rtx = `Escanea este QR para convertirte en sub-bot.`
let rtx2 = `Usa este código de 8 dígitos para emparejar.`

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gataJBOptions = {}
const retryMap = new Map()
const maxAttempts = 5
const cooldownMap = new Map()
const COOLDOWN_TIME = 10000

if (global.conns instanceof Array) console.log()
else global.conns = []

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
if (!global.db.data.settings[conn.user.jid]?.jadibotmd) return m.reply(`Esta función solo está disponible para el propietario.`)
if (m.fromMe || conn.user.jid === m.sender) return

const now = Date.now();
const lastUse = cooldownMap.get(m.sender) || 0;
const remainingTime = COOLDOWN_TIME - (now - lastUse);
if (remainingTime > 0) {
return m.reply(`*⏳ Por favor espera ${Math.ceil(remainingTime / 1000)} segundos antes de usar el comando nuevamente.*`);
}
cooldownMap.set(m.sender, now);

let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let id = `${who.split`@`[0]}`
let pathGataJadiBot = path.join("./GataJadiBot/", id)
if (!fs.existsSync(pathGataJadiBot)){
fs.mkdirSync(pathGataJadiBot, { recursive: true })
}
gataJBOptions.pathGataJadiBot = pathGataJadiBot
gataJBOptions.m = m
gataJBOptions.conn = conn
gataJBOptions.args = args
gataJBOptions.usedPrefix = usedPrefix
gataJBOptions.command = command
gataJBOptions.fromCommand = true
gataJadiBot(gataJBOptions)
}
handler.command = /^(jadibot|serbot|rentbot|code)/i
export default handler 

// Función para reiniciar todos los sub-bots
async function restartAllSubBots() {
    console.log(chalk.bold.cyanBright(`🔄 Iniciando reinicio de todos los sub-bots...`));
    
    // Desconectar todos los sub-bots existentes
    for (let i = global.conns.length - 1; i >= 0; i--) {
        const conn = global.conns[i];
        if (conn && conn.ws && conn.user && conn.user.jid !== global.conn.user.jid) {
            try {
                console.log(chalk.bold.yellowBright(`Desconectando sub-bot: +${conn.user.jid.split('@')[0]}`));
                conn.ws.close();
                conn.ev.removeAllListeners();
            } catch (e) {
                console.error(chalk.redBright(`Error al desconectar sub-bot:`), e);
            }
            // Remover de la lista
            global.conns.splice(i, 1);
        }
    }

    // Esperar un momento para que se cierren las conexiones
    await sleep(2000);

    // Reconectar todos los sub-bots
    await checkSubBots(true);
    
    console.log(chalk.bold.greenBright(`✅ Reinicio de sub-bots completado`));
}

// Función mejorada para verificar y reconectar sub-bots
async function checkSubBots(forceRestart = false) {
    const subBotDir = path.resolve("./GataJadiBot");
    if (!fs.existsSync(subBotDir)) {
        console.log(chalk.bold.yellow(`📁 No se encontró directorio de sub-bots`));
        return;
    }

    const subBotFolders = fs.readdirSync(subBotDir).filter(folder => 
        fs.statSync(path.join(subBotDir, folder)).isDirectory()
    );

    if (forceRestart) {
        console.log(chalk.bold.cyanBright(`🔄 Reinicio forzado de ${subBotFolders.length} sub-bots...`));
    } else {
        console.log(chalk.bold.cyanBright(`🔍 Verificando ${subBotFolders.length} sub-bots...`));
    }

    // Solo limpiar conexiones si es reinicio forzado
    if (forceRestart) {
        for (const conn of global.conns) {
            if (conn && conn.ws && conn.user && conn.user.jid !== global.conn.user.jid) {
                try {
                    console.log(chalk.bold.yellowBright(`⏹️ Desconectando: +${conn.user.jid.split('@')[0]}`));
                    conn.ws.close();
                    conn.ev.removeAllListeners();
                } catch (e) {
                    console.error(chalk.redBright(`❌ Error al desconectar:`), e);
                }
            }
        }
        // Limpiar array de conexiones (excepto el bot principal)
        global.conns = global.conns.filter(conn => 
            conn && conn.user && conn.user.jid === global.conn.user.jid
        );
        await sleep(1000);
    }

    let reconnectedCount = 0;
    
    for (const folder of subBotFolders) {
        const pathGataJadiBot = path.join(subBotDir, folder);
        const credsPath = path.join(pathGataJadiBot, "creds.json");

        if (!fs.existsSync(credsPath)) {
            console.log(chalk.bold.yellowBright(`📂 Sub-bot (+${folder}) sin creds.json`));
            continue;
        }

        // Verificar si ya está conectado
        const isAlreadyConnected = global.conns.some(conn => 
            conn && conn.user && conn.user.jid === `${folder}@s.whatsapp.net`
        );

        if (isAlreadyConnected && !forceRestart) {
            console.log(chalk.bold.greenBright(`✅ Sub-bot (+${folder}) ya está conectado`));
            continue;
        }

        try {
            console.log(chalk.bold.blueBright(`🔄 Conectando sub-bot (+${folder})...`));
            await gataJadiBot({
                pathGataJadiBot,
                m: null,
                conn: global.conn,
                args: [],
                usedPrefix: '#',
                command: 'jadibot',
                fromCommand: false
            });
            reconnectedCount++;
            console.log(chalk.bold.greenBright(`✅ Sub-bot (+${folder}) conectado`));
            await sleep(2000); // Esperar entre conexiones
        } catch (e) {
            console.error(chalk.redBright(`❌ Error al conectar sub-bot (+${folder}):`), e);
        }
    }

    console.log(chalk.bold.greenBright(`🎯 ${reconnectedCount} sub-bots reconectados exitosamente`));
}

export async function gataJadiBot(options) {
let { pathGataJadiBot, m, conn, args, usedPrefix, command } = options
if (command === 'code') {
command = 'jadibot'; 
args.unshift('code')}

const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false;
let txtCode, codeBot, txtQR
if (mcode) {
args[0] = args[0]?.replace(/^--code$|^code$/, "").trim()
if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
if (args[0] == "") args[0] = undefined
}
const pathCreds = path.join(pathGataJadiBot, "creds.json")
if (!fs.existsSync(pathGataJadiBot)){
fs.mkdirSync(pathGataJadiBot, { recursive: true })}
try {
args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
} catch {
conn.reply(m.chat, `*Use correctamente el comando:* \`${usedPrefix + command} code\``, m)
return
}

// Nota: Se eliminó la ejecución ofuscada para evitar bloqueos
const drmer = Buffer.from(drm1 + drm2, `base64`)

let { version, isLatest } = await fetchLatestBaileysVersion()
const msgRetry = (MessageRetryMap) => { }
const msgRetryCache = new NodeCache()
const { state, saveState, saveCreds } = await useMultiFileAuthState(pathGataJadiBot)

const connectionOptions = {
logger: pino({ level: "fatal" }),
printQRInTerminal: false,
auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
msgRetry,
msgRetryCache,
browser: mcode ? ['Windows', 'Chrome', '110.0.5585.95'] : ['EliteBotGlobal', 'Chrome','2.0.0'],
version: version,
generateHighQualityLinkPreview: true
};

let sock = makeWASocket(connectionOptions)
sock.isInit = false
let isInit = true
let reconnectAttempts = 0;

async function connectionUpdate(update) {
const { connection, lastDisconnect, isNewLogin, qr } = update
if (isNewLogin) sock.isInit = false
if (qr && !mcode) {
if (m?.chat) {
txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim() + '\n' + drmer.toString("utf-8")}, { quoted: m})
} else {
return 
}
if (txtQR && txtQR.key) {
setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key })}, 30000)
}
return
} 
if (qr && mcode) {
let secret = await sock.requestPairingCode(m.sender.split('@')[0]);
secret = secret.match(/.{1,4}/g)?.join("-") || '';
console.log(chalk.bold.green(`Código generado: ${secret}`));

await m.reply(`${secret}`);

txtCode = await conn.sendMessage(m.chat, {
text: `${rtx2.trim()}\n\n${drmer.toString("utf-8")}`,
buttons: [{ buttonId: secret, buttonText: { displayText: 'Copiar código' }, type: 1 }],
footer: wm,
headerType: 1
}, { quoted: m });

if (txtCode) {
setTimeout(() => { 
conn.sendMessage(m.chat, { delete: txtCode.key })
}, 30000)
}
}

const endSesion = async (loaded) => {
if (!loaded) {
try {
sock.ws.close()
} catch {
}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)		
if (i < 0) return 
delete global.conns[i]
global.conns.splice(i, 1)
}}

const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (connection === 'close') {
    if (reason === 428) {
        if (reconnectAttempts < maxAttempts) {
            const delay = 1000 * Math.pow(2, reconnectAttempts); 
            console.log(chalk.bold.magentaBright(`Intentando reconectar en ${delay / 1000} segundos... (Intento ${reconnectAttempts + 1}/${maxAttempts})`))
            await sleep(1000);
            reconnectAttempts++;
            await creloadHandler(true).catch(console.error);
        } else {
            console.log(chalk.redBright(`Sub-bot (+${path.basename(pathGataJadiBot)}) agotó intentos de reconexión.`));
        }            
    }
    if (reason === 408) {
    try {
    if (options.fromCommand && m?.chat) {
    await conn.sendMessage(m.chat, {text : '*CONEXIÓN EXPIRADA*\n\n> *ESPERANDO 15 SEGUNDOS PARA RECONECTAR*' }, { quoted: m })
    await sleep(15000)
    await creloadHandler(true).catch(console.error)
    }
    } catch (error) {
    console.error(chalk.bold.yellow(`Error al reconectar: +${path.basename(pathGataJadiBot)}`))
    }
    }
    if (reason === 440) {
    try {
    if (options.fromCommand && m?.chat) {
    await conn.sendMessage(m.chat, {text : '*SESIÓN PENDIENTE*\n\n> *SI HAY ALGÚN PROBLEMA VUELVA A CONECTARSE*' }, { quoted: m })
    }
    } catch (error) {
    console.error(chalk.bold.yellow(`Error 440 no se pudo enviar mensaje a: +${path.basename(pathGataJadiBot)}`))
    }}
    if (reason == 405 || reason == 401) {
    const lastErrorTime = retryMap.get(pathGataJadiBot) || 0;
    const currentTime = Date.now();
    const timeSinceLastError = currentTime - lastErrorTime;
    if (timeSinceLastError > 30000) {
    try {
    if (options.fromCommand) {
    await creloadHandler(true).catch(console.error)
    }
    } catch (error) {
    console.error(chalk.bold.yellow(`Error al reconectar: +${path.basename(pathGataJadiBot)}`))
    }
    retryMap.set(pathGataJadiBot, currentTime);
    }
    try {
    if (fs.existsSync(pathGataJadiBot)) {
    fs.rmdirSync(pathGataJadiBot, { recursive: true })
    }
    } catch (e) {
    console.error(chalk.bold.yellow(`Error al eliminar directorio: ${e.message}`))
    }
    }
    if (reason === 500) {
    if (options.fromCommand) {
    m?.chat ? await conn.sendMessage(m.chat, {text: '*CONEXIÓN PÉRDIDA*\n\n> *INTENTÉ MANUALMENTE VOLVER A SER SUB-BOT*' }, { quoted: m || null }) : ""
    }
    }
    if (reason === 515) {
    await creloadHandler(true).catch(console.error)
    }
    if (reason === 403) {
    fs.rmdirSync(pathGataJadiBot, { recursive: true })
    }}

if (global.db.data == null) loadDatabase()
if (connection == `open`) {
reconnectAttempts = 0; 
if (!global.db.data?.users) loadDatabase()
if (global.db.data.settings[conn.user.jid]?.jadibotmd) {
global.db.data.settings[sock.user.jid] = {
...global.db.data.settings[sock.user.jid] || {},
jadibotmd: true
}
}

let userName, userJid 
userName = sock.authState.creds.me?.name || 'Anónimo'
userJid = sock.authState.creds.me?.jid || `${path.basename(pathGataJadiBot)}@s.whatsapp.net`
console.log(chalk.bold.cyanBright(`SUB-BOT ${userName} (+${path.basename(pathGataJadiBot)}) conectado.`))
sock.isInit = true
global.conns.push(sock)

let user = global.db.data?.users[`${path.basename(pathGataJadiBot)}@s.whatsapp.net`]
 m?.chat ? await conn.sendMessage(m.chat, {text : args[0] ? `Conectando... si falla, intenta de nuevo con ${usedPrefix}code` : `Sub-bot conectado. Para reconectar luego usa ${usedPrefix + command}`}, { quoted: m }) : ''
let chtxt = `
👤 *Usuario:* ${userName} ✅
🔑 *Método de conexión:* ${mcode ? 'Código de 8 dígitos' : 'Código QR'} ✅
`.trim()
let ppch = await sock.profilePictureUrl(userJid, 'image').catch(_ => gataMenu)
await sleep(3000)
try {
if (global.ch?.ch1 && global.conn) {
await global.conn.sendMessage(global.ch.ch1, { text: chtxt, contextInfo: {
externalAdReply: {
title: "【 🔔 Notificación General 🔔 】",
body: '🙀 ¡Nuevo sub-bot encontrado!',
thumbnailUrl: ppch,
sourceUrl: accountsgb,
mediaType: 1,
showAdAttribution: false,
renderLargerThumbnail: false
}}}, { quoted: null })
}
} catch {}
await sleep(3000)
await joinChannels(sock)
m?.chat ? await conn.sendMessage(m.chat, {text : `Conexión exitosa. Ahora eres un sub-bot.`}, { quoted: m }) : ''
}}
setInterval(async () => {
if (!sock.user) {
try { sock.ws.close() } catch (e) {      
}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)		
if (i < 0) return
delete global.conns[i]
global.conns.splice(i, 1)
}}, 60000)

let handler = await import('../handler.js')
let creloadHandler = async function (restatConn) {
try {
let Handler = await import(`../handler.js?update=${Date.now()}`)
if (Object.keys(Handler || {}).length) handler = Handler

} catch (e) {
console.error('Nuevo error: ', e)
}
if (restatConn) {
const oldChats = sock.chats
try { sock.ws.close() } catch { }
sock.ev.removeAllListeners()
sock = makeWASocket(connectionOptions, { chats: oldChats })
isInit = true
}
if (!isInit) {
 sock.ev.off('messages.upsert', sock.handler)
 if (typeof sock.participantsUpdate === 'function') sock.ev.off('group-participants.update', sock.participantsUpdate)
 if (typeof sock.groupsUpdate === 'function') sock.ev.off('groups.update', sock.groupsUpdate)
 if (typeof sock.onDelete === 'function') sock.ev.off('message.delete', sock.onDelete)
 if (typeof sock.onCall === 'function') sock.ev.off('call', sock.onCall)
 sock.ev.off('connection.update', sock.connectionUpdate)
 sock.ev.off('creds.update', sock.credsUpdate)
}
sock.welcome = '👋 Bienvenido'
sock.bye = '👋 Adiós'
sock.spromote = 'Usuario promovido a admin.'
sock.sdemote = 'Usuario degradado de admin.'
sock.sDesc = 'Descripción de grupo actualizada.'
sock.sSubject = 'Nombre del grupo actualizado.'
sock.sIcon = 'Icono de grupo actualizado.'
sock.sRevoke = 'Enlace de invitación restablecido.'

sock.handler = handler.handler.bind(sock)
sock.participantsUpdate = typeof handler.participantsUpdate === 'function' ? handler.participantsUpdate.bind(sock) : undefined
sock.groupsUpdate = typeof handler.groupsUpdate === 'function' ? handler.groupsUpdate.bind(sock) : undefined
sock.onDelete = typeof handler.deleteUpdate === 'function' ? handler.deleteUpdate.bind(sock) : undefined
sock.onCall = typeof handler.callUpdate === 'function' ? handler.callUpdate.bind(sock) : undefined
sock.connectionUpdate = connectionUpdate.bind(sock)
sock.credsUpdate = saveCreds.bind(sock, true)

sock.ev.on(`messages.upsert`, sock.handler)
if (typeof sock.participantsUpdate === 'function') sock.ev.on(`group-participants.update`, sock.participantsUpdate)
if (typeof sock.groupsUpdate === 'function') sock.ev.on(`groups.update`, sock.groupsUpdate)
if (typeof sock.onDelete === 'function') sock.ev.on(`message.delete`, sock.onDelete)
if (typeof sock.onCall === 'function') sock.ev.on(`call`, sock.onCall)
sock.ev.on(`connection.update`, sock.connectionUpdate)
sock.ev.on(`creds.update`, sock.credsUpdate)
isInit = false
return true
}
creloadHandler(false)
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));}

async function joinChannels(conn) {
if (!global.ch) return
for (const channelId of Object.values(global.ch)) {
try {
await conn.newsletterFollow(channelId).catch((err) => {
if (err.output?.statusCode === 408) {
console.log(chalk.bold.yellow(`Timeout al seguir el canal ${channelId}, continuando...`));
} else {
console.log(chalk.bold.red(`Error al seguir el canal ${channelId}: ${err.message}`));
}
});
} catch (e) {
console.log(chalk.bold.red(`Error inesperado al seguir canales: ${e.message}`));
}
}}

// Verificación periódica (solo reconecta los desconectados)
setInterval(() => checkSubBots(false), 120000);

// Exportar función de reinicio para uso global
global.restartAllSubBots = restartAllSubBots;
