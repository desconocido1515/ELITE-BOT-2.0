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
const maxAttempts = 10 // 🔼 AUMENTADO PARA MÁS INTENTOS
const cooldownMap = new Map()
const COOLDOWN_TIME = 10000

// 🛡️ SISTEMA ROBUSTO DE MONITOREO
if (global.conns instanceof Array) console.log()
else global.conns = []

// 🕐 SISTEMA DE UPTIME PARA SUBBOTS
if (!global.botUptimes) global.botUptimes = new Map()
if (!global.subBotStatus) global.subBotStatus = new Map()

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

// 🛡️ FUNCIÓN MEJORADA PARA REINICIAR SUB-BOTS
async function restartAllSubBots() {
    console.log(chalk.bold.cyanBright(`🔄 INICIANDO REINICIO AUTOMÁTICO DE TODOS LOS SUB-BOTS...`));
    
    let successCount = 0
    let errorCount = 0
    
    // Desconectar todos los sub-bots existentes de forma segura
    for (let i = global.conns.length - 1; i >= 0; i--) {
        const conn = global.conns[i];
        if (conn && conn.ws && conn.user && conn.user.jid !== global.conn.user.jid) {
            try {
                console.log(chalk.bold.yellowBright(`⏹️ Desconectando: +${conn.user.jid.split('@')[0]}`));
                // Limpiar eventos primero
                if (conn.ev) {
                    conn.ev.removeAllListeners();
                }
                // Cerrar conexión
                if (conn.ws && conn.ws.socket) {
                    conn.ws.socket.close();
                }
                // Actualizar estado
                global.subBotStatus.set(conn.user.jid, 'disconnected');
            } catch (e) {
                console.error(chalk.redBright(`❌ Error al desconectar sub-bot:`), e);
                errorCount++;
            }
            // Remover de la lista
            global.conns.splice(i, 1);
        }
    }

    // Esperar para que se cierren las conexiones
    await sleep(3000);

    // Reconectar todos los sub-bots
    await checkSubBots(true);
    
    // Verificar resultados
    const activeBots = global.conns.filter(conn => 
        conn && conn.user && conn.user.jid !== global.conn.user.jid &&
        conn.ws && conn.ws.socket && conn.ws.socket.readyState === 1
    ).length;
    
    console.log(chalk.bold.greenBright(`✅ REINICIO COMPLETADO: ${activeBots} sub-bots activos, ${errorCount} errores`));
    return { success: activeBots, errors: errorCount };
}

// 🛡️ SISTEMA ROBUSTO DE VERIFICACIÓN Y RECONEXIÓN
async function checkSubBots(forceRestart = false) {
    const subBotDir = path.resolve("./GataJadiBot");
    if (!fs.existsSync(subBotDir)) {
        console.log(chalk.bold.yellow(`📁 No se encontró directorio de sub-bots`));
        return { reconnected: 0, errors: 0 };
    }

    const subBotFolders = fs.readdirSync(subBotDir).filter(folder => 
        fs.statSync(path.join(subBotDir, folder)).isDirectory() &&
        fs.existsSync(path.join(subBotDir, folder, "creds.json"))
    );

    if (forceRestart) {
        console.log(chalk.bold.cyanBright(`🔄 REINICIO FORZADO DE ${subBotFolders.length} SUB-BOTS...`));
    } else {
        console.log(chalk.bold.cyanBright(`🔍 MONITOREANDO ${subBotFolders.length} SUB-BOTS...`));
    }

    let reconnectedCount = 0;
    let errorCount = 0;

    // Solo limpiar conexiones si es reinicio forzado
    if (forceRestart) {
        for (const conn of global.conns) {
            if (conn && conn.user && conn.user.jid !== global.conn.user.jid) {
                try {
                    console.log(chalk.bold.yellowBright(`⏹️ Limpiando: +${conn.user.jid.split('@')[0]}`));
                    if (conn.ev) conn.ev.removeAllListeners();
                    if (conn.ws && conn.ws.socket) conn.ws.socket.close();
                    global.subBotStatus.set(conn.user.jid, 'disconnected');
                } catch (e) {
                    console.error(chalk.redBright(`❌ Error al limpiar:`), e);
                    errorCount++;
                }
            }
        }
        // Limpiar array de conexiones (excepto el bot principal)
        global.conns = global.conns.filter(conn => 
            conn && conn.user && conn.user.jid === global.conn.user.jid
        );
        await sleep(2000);
    }

    for (const folder of subBotFolders) {
        const pathGataJadiBot = path.join(subBotDir, folder);
        const credsPath = path.join(pathGataJadiBot, "creds.json");

        if (!fs.existsSync(credsPath)) {
            console.log(chalk.bold.yellowBright(`📂 Sub-bot (+${folder}) sin creds.json`));
            continue;
        }

        // 🎯 VERIFICACIÓN INTELIGENTE DE ESTADO
        const existingConn = global.conns.find(conn => 
            conn && conn.user && conn.user.jid === `${folder}@s.whatsapp.net`
        );

        if (existingConn && !forceRestart) {
            // Verificar si realmente está conectado
            const isAlive = existingConn.ws && 
                           existingConn.ws.socket && 
                           existingConn.ws.socket.readyState === 1;
            
            if (isAlive) {
                console.log(chalk.bold.greenBright(`✅ Sub-bot (+${folder}) CONECTADO Y ACTIVO`));
                global.subBotStatus.set(`${folder}@s.whatsapp.net`, 'connected');
                continue;
            } else {
                console.log(chalk.bold.yellowBright(`⚠️ Sub-bot (+${folder}) REGISTRADO PERO DESCONECTADO`));
                // Limpiar conexión fantasma
                const index = global.conns.indexOf(existingConn);
                if (index > -1) global.conns.splice(index, 1);
                global.subBotStatus.set(`${folder}@s.whatsapp.net`, 'disconnected');
            }
        }

        try {
            console.log(chalk.bold.blueBright(`🚀 CONECTANDO SUB-BOT (+${folder})...`));
            
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
            global.subBotStatus.set(`${folder}@s.whatsapp.net`, 'connected');
            console.log(chalk.bold.greenBright(`✅ Sub-bot (+${folder}) CONECTADO EXITOSAMENTE`));
            
            await sleep(3000); // Esperar entre conexiones
            
        } catch (e) {
            console.error(chalk.redBright(`❌ ERROR AL CONECTAR SUB-BOT (+${folder}):`), e);
            global.subBotStatus.set(`${folder}@s.whatsapp.net`, 'error');
            errorCount++;
        }
    }

    const activeCount = global.conns.filter(conn => 
        conn && conn.user && conn.user.jid !== global.conn.user.jid &&
        conn.ws && conn.ws.socket && conn.ws.socket.readyState === 1
    ).length;

    console.log(chalk.bold.greenBright(`🎯 RESUMEN: ${activeCount} activos, ${reconnectedCount} reconectados, ${errorCount} errores`));
    return { reconnected: reconnectedCount, errors: errorCount, active: activeCount };
}

// 🛡️ SISTEMA DE MONITOREO EN TIEMPO REAL
function startHealthMonitoring() {
    setInterval(async () => {
        try {
            if (!global.conns || global.conns.length <= 1) return;
            
            let deadBots = 0;
            let healthyBots = 0;
            
            for (const conn of global.conns) {
                if (conn && conn.user && conn.user.jid !== global.conn.user.jid) {
                    const isHealthy = conn.ws && 
                                    conn.ws.socket && 
                                    conn.ws.socket.readyState === 1;
                    
                    if (isHealthy) {
                        healthyBots++;
                        global.subBotStatus.set(conn.user.jid, 'connected');
                    } else {
                        deadBots++;
                        global.subBotStatus.set(conn.user.jid, 'disconnected');
                        console.log(chalk.bold.redBright(`💀 SUB-BOT MUERTO DETECTADO: +${conn.user.jid.split('@')[0]}`));
                        
                        // Reconexión automática para bots muertos
                        setTimeout(async () => {
                            await checkSubBots(false);
                        }, 10000);
                    }
                }
            }
            
            if (deadBots > 0) {
                console.log(chalk.bold.yellowBright(`📊 ESTADO: ${healthyBots} sanos, ${deadBots} muertos - Reconectando automáticamente...`));
            }
            
        } catch (error) {
            console.error(chalk.redBright('❌ Error en monitoreo de salud:'), error);
        }
    }, 45000); // Verificar cada 45 segundos
}

// 🛡️ FUNCIÓN GATAJADIBOT MEJORADA CON SISTEMA DE RESILIENCIA
export async function gataJadiBot(options) {
    let { pathGataJadiBot, m, conn, args, usedPrefix, command } = options
    
    if (command === 'code') {
        command = 'jadibot'; 
        args.unshift('code')
    }

    const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false;
    let txtCode, codeBot, txtQR
    
    if (mcode) {
        args[0] = args[0]?.replace(/^--code$|^code$/, "").trim()
        if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
        if (args[0] == "") args[0] = undefined
    }
    
    const pathCreds = path.join(pathGataJadiBot, "creds.json")
    if (!fs.existsSync(pathGataJadiBot)){
        fs.mkdirSync(pathGataJadiBot, { recursive: true })
    }
    
    try {
        args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
    } catch {
        conn.reply(m.chat, `*Use correctamente el comando:* \`${usedPrefix + command} code\``, m)
        return
    }

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
        generateHighQualityLinkPreview: true,
        // 🛡️ CONFIGURACIONES PARA ESTABILIDAD
        keepAliveIntervalMs: 30000,
        connectTimeoutMs: 60000,
        maxRetries: 10,
        emitOwnEvents: true,
        defaultQueryTimeoutMs: 60000,
    };

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true
    let reconnectAttempts = 0;

    // 🛡️ SISTEMA MEJORADO DE ACTUALIZACIÓN DE CONEXIÓN
    async function connectionUpdate(update) {
        const { connection, lastDisconnect, isNewLogin, qr } = update
        
        if (isNewLogin) sock.isInit = false
        
        if (qr && !mcode) {
            if (m?.chat) {
                txtQR = await conn.sendMessage(m.chat, { 
                    image: await qrcode.toBuffer(qr, { scale: 8 }), 
                    caption: rtx.trim() + '\n' + drmer.toString("utf-8")
                }, { quoted: m })
            }
            if (txtQR && txtQR.key) {
                setTimeout(() => { 
                    conn.sendMessage(m.chat, { delete: txtQR.key }).catch(() => {})
                }, 30000)
            }
            return
        } 
        
        if (qr && mcode) {
            let secret = await sock.requestPairingCode(m.sender.split('@')[0]);
            secret = secret.match(/.{1,4}/g)?.join("-") || '';
            console.log(chalk.bold.green(`🔑 CÓDIGO GENERADO: ${secret}`));

            await m.reply(`${secret}`);

            txtCode = await conn.sendMessage(m.chat, {
                text: `${rtx2.trim()}\n\n${drmer.toString("utf-8")}`,
                buttons: [{ buttonId: secret, buttonText: { displayText: 'Copiar código' }, type: 1 }],
                footer: wm,
                headerType: 1
            }, { quoted: m });

            if (txtCode) {
                setTimeout(() => { 
                    conn.sendMessage(m.chat, { delete: txtCode.key }).catch(() => {})
                }, 30000)
            }
        }

        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
        
        if (connection === 'close') {
            console.log(chalk.bold.redBright(`🔴 SUB-BOT DESCONECTADO: +${path.basename(pathGataJadiBot)} - Razón: ${reason}`));
            
            // 🛡️ SISTEMA INTELIGENTE DE RECONEXIÓN
            if (reason === DisconnectReason.connectionClosed || 
                reason === DisconnectReason.connectionLost ||
                reason === DisconnectReason.timedOut ||
                reason === 428 || reason === 408 || reason === 500 || reason === 515) {
                
                if (reconnectAttempts < maxAttempts) {
                    const delay = Math.min(30000, 2000 * Math.pow(2, reconnectAttempts)); // Backoff con límite
                    console.log(chalk.bold.magentaBright(`🔄 RECONEXIÓN AUTOMÁTICA EN ${delay/1000}s (Intento ${reconnectAttempts + 1}/${maxAttempts})`));
                    
                    reconnectAttempts++;
                    setTimeout(async () => {
                        try {
                            await creloadHandler(true);
                        } catch (error) {
                            console.error(chalk.redBright(`❌ FALLA EN RECONEXIÓN AUTOMÁTICA:`), error);
                        }
                    }, delay);
                } else {
                    console.log(chalk.bold.redBright(`💀 MÁXIMO DE INTENTOS ALCANZADO PARA +${path.basename(pathGataJadiBot)}`));
                    global.subBotStatus.set(`${path.basename(pathGataJadiBot)}@s.whatsapp.net`, 'dead');
                }
            }
            
            // Manejo de otros códigos de error
            if (reason === DisconnectReason.loggedOut || reason === 401) {
                console.log(chalk.bold.yellowBright(`🔒 SESIÓN CERRADA: +${path.basename(pathGataJadiBot)}`));
                try {
                    if (fs.existsSync(pathGataJadiBot)) {
                        fs.rmSync(pathGataJadiBot, { recursive: true, force: true });
                    }
                } catch (e) {
                    console.error(chalk.redBright(`❌ Error limpiando directorio:`), e);
                }
            }
        }

        if (connection == `open`) {
            reconnectAttempts = 0; // Resetear contador
            console.log(chalk.bold.greenBright(`🟢 SUB-BOT CONECTADO: +${path.basename(pathGataJadiBot)}`));
            
            if (!global.db.data?.users) loadDatabase()
            if (global.db.data.settings[conn.user.jid]?.jadibotmd) {
                global.db.data.settings[sock.user.jid] = {
                    ...global.db.data.settings[sock.user.jid] || {},
                    jadibotmd: true
                }
            }

            let userName = sock.authState.creds.me?.name || 'Anónimo'
            let userJid = sock.authState.creds.me?.jid || `${path.basename(pathGataJadiBot)}@s.whatsapp.net`
            
            // 🕐 REGISTRAR UPTIME
            global.botUptimes.set(userJid, Date.now());
            global.subBotStatus.set(userJid, 'connected');
            
            console.log(chalk.bold.cyanBright(`🤖 SUB-BOT ${userName} (+${path.basename(pathGataJadiBot)}) CONECTADO Y ESTABLE`));
            sock.isInit = true
            
            // Agregar a conexiones globales si no existe
            if (!global.conns.includes(sock)) {
                global.conns.push(sock);
            }

            // Notificación de conexión exitosa
            if (m?.chat) {
                await conn.sendMessage(m.chat, {
                    text: `✅ *SUB-BOT CONECTADO EXITOSAMENTE*\n\n` +
                          `👤 *Usuario:* ${userName}\n` +
                          `🔧 *Estado:* Conectado y monitoreado\n` +
                          `⏰ *Modo:* Siempre activo`
                }, { quoted: m }).catch(() => {});
            }

            // Unirse a canales
            await joinChannels(sock);
        }
    }

    // 🛡️ MONITOREO DE ESTADO CONTINUO
    const healthCheck = setInterval(() => {
        if (!sock.user) {
            clearInterval(healthCheck);
            try { 
                if (sock.ws) sock.ws.close() 
            } catch (e) {      
                console.error(chalk.redBright(`❌ Error en health check:`), e);
            }
            sock.ev.removeAllListeners();
            let i = global.conns.indexOf(sock);		
            if (i < 0) return;
            delete global.conns[i];
            global.conns.splice(i, 1);
        }
    }, 45000);

    let handler = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
        try {
            let Handler = await import(`../handler.js?update=${Date.now()}`)
            if (Object.keys(Handler || {}).length) handler = Handler
        } catch (e) {
            console.error('Error cargando handler: ', e)
        }
        
        if (restatConn) {
            const oldChats = sock.chats
            try { 
                if (sock.ws) sock.ws.close() 
            } catch { }
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
        
        // Configuración del handler
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
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function joinChannels(conn) {
    if (!global.ch) return
    for (const channelId of Object.values(global.ch)) {
        try {
            await conn.newsletterFollow(channelId).catch((err) => {
                if (err.output?.statusCode === 408) {
                    console.log(chalk.bold.yellow(`⏰ Timeout al seguir canal ${channelId}`));
                } else {
                    console.log(chalk.bold.red(`❌ Error siguiendo canal ${channelId}: ${err.message}`));
                }
            });
        } catch (e) {
            console.log(chalk.bold.red(`❌ Error inesperado con canales: ${e.message}`));
        }
    }
}

// 🚀 INICIALIZACIÓN DEL SISTEMA ROBUSTO
console.log(chalk.bold.magenta('🤖 INICIANDO SISTEMA ROBUSTO DE SUB-BOTS...'));

// 1. MONITOREO DE SALUD CONTINUO
startHealthMonitoring();
console.log(chalk.bold.green('🔍 MONITOREO DE SALUD ACTIVADO'));

// 2. VERIFICACIÓN PERIÓDICA (solo reconecta los desconectados)
setInterval(() => checkSubBots(false), 60000); // 🔼 CADA 1 MINUTO
console.log(chalk.bold.green('⏰ VERIFICACIÓN PERIÓDICA ACTIVADA'));

// 3. RECONEXIÓN INMEDIATA AL INICIAR
async function immediateSubBotReconnect() {
    console.log(chalk.bold.magenta('🚀 ACTIVANDO RECONEXIÓN INMEDIATA DE SUB-BOTS'));
    
    try {
        await checkSubBots(true);
        console.log(chalk.bold.green('✅ RECONEXIÓN INMEDIATA COMPLETADA'));
        
        // Verificación adicional después de 30 segundos
        setTimeout(async () => {
            console.log(chalk.bold.blue('🔍 VERIFICACIÓN POST-RECONEXIÓN...'));
            await checkSubBots(false);
        }, 30000);
        
    } catch (error) {
        console.error(chalk.bold.red('❌ ERROR EN RECONEXIÓN INMEDIATA:'), error);
    }
}

// EJECUTAR RECONEXIÓN INMEDIATA
setTimeout(async () => {
    await immediateSubBotReconnect();
}, 3000);

// Exportar funciones para uso global
global.restartAllSubBots = restartAllSubBots;
global.checkSubBots = checkSubBots;
global.immediateSubBotReconnect = immediateSubBotReconnect;

console.log(chalk.bold.cyan('🎯 SISTEMA ROBUSTO DE SUB-BOTS ACTIVADO Y OPERATIVO'));
