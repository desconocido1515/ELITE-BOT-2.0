let handler = async (m, { conn }) => {
    try {
        console.log('🔧 Comando subbots ejecutándose...');
        
        // Verificar conexiones
        if (!global.conns || !Array.isArray(global.conns)) {
            console.log('❌ global.conns no configurado');
            return m.reply('❌ Sistema de subbots no configurado');
        }

        console.log(`📊 Conexiones encontradas: ${global.conns.length}`);
        
        // Inicializar uptime si no existe
        initializeUptime();
        
        // Filtrar conexiones activas
        let activeBots = [];
        
        for (let bot of global.conns) {
            if (bot && bot.user && bot.user.jid) {
                // Verificar estado simple
                const isActive = bot.ws && bot.ws.socket && bot.ws.socket.readyState === 1; // 1 = OPEN
                
                if (isActive) {
                    activeBots.push(bot);
                }
            }
        }

        console.log(`✅ Subbots activos: ${activeBots.length}`);
        
        // =============================================
        // 🤖 BOT PRINCIPAL
        // =============================================
        let message = `*ProyectoX // EBG*
*Conectados: ${activeBots.length + 1}*\n\n`;

        // Agregar bot principal primero
        if (conn && conn.user && conn.user.jid) {
            const mainBotNumber = conn.user.jid.split('@')[0];
            const mainUptime = getBotUptime(conn.user.jid, true);
            
            message += `Elite Bot Global 2023
👑 @${mainBotNumber}
*Activo:* ${mainUptime}\n`;
        }

        // =============================================
        // 🔄 SUBBOTS CONECTADOS
        // =============================================
        if (activeBots.length > 0) {
            message += `\n`;

            activeBots.forEach((bot, index) => {
                const number = bot.user.jid.split('@')[0];
                const uptime = getBotUptime(bot.user.jid);
                const status = getBotStatus(bot);
                
 message += `${index + 1}. 💻 @${number}
*Activo:* ${uptime}
${index < activeBots.length - 1 ? '\n' : ''}`;
            });
        } else {
            message += `*╭─「 🔄 𝐒𝐔𝐁𝐁𝐎𝐓𝐒 」─*
*│* ❌ *No hay subbots conectados*
*│* 💡 *Usa .serbot para activar*
*╰─────────────────*\n\n`;
        }

        // =============================================
        // 📊 ESTADÍSTICAS DEL SISTEMA
        // =============================================
        message += `*🔊 _Sistema de bots funcionando óptimamente_*`;

        await conn.sendMessage(m.chat, { 
            text: message, 
            mentions: conn.parseMention(message) 
        }, { quoted: m });

    } catch (error) {
        console.error('❌ Error en comando subbots:', error);
        m.reply('❌ Error al obtener información de subbots');
    }
}

// =============================================
// 🕐 SISTEMA DE UPTIME PARA SUBBOTS
// =============================================

// Objeto para almacenar los tiempos de conexión
if (!global.botUptimes) {
    global.botUptimes = new Map();
}

// Función para inicializar uptime de los bots
function initializeUptime() {
    if (!global.conns || !Array.isArray(global.conns)) return;
    
    // Registrar bot principal
    if (global.conn && global.conn.user && global.conn.user.jid) {
        const mainJid = global.conn.user.jid;
        if (!global.botUptimes.has(mainJid)) {
            global.botUptimes.set(mainJid, Date.now());
            console.log(`⏰ Uptime inicializado para BOT PRINCIPAL: ${mainJid}`);
        }
    }
    
    // Registrar subbots
    global.conns.forEach(bot => {
        if (bot && bot.user && bot.user.jid) {
            const botJid = bot.user.jid;
            
            if (!global.botUptimes.has(botJid)) {
                global.botUptimes.set(botJid, Date.now());
                console.log(`⏰ Uptime inicializado para: ${botJid}`);
            }
            
            if (!bot.uptime) {
                bot.uptime = Date.now();
            }
        }
    });
}

// Función para obtener el uptime formateado
function getBotUptime(botJid, isMainBot = false) {
    if (!global.botUptimes.has(botJid)) {
        global.botUptimes.set(botJid, Date.now());
        return isMainBot ? '𝗦𝗜𝗦𝗧𝗘𝗠𝗔 𝗜𝗡𝗜𝗖𝗜𝗔𝗗𝗢' : '𝗜𝗡𝗜𝗖𝗜𝗔𝗡𝗗𝗢 𝗦𝗜𝗦𝗧𝗘𝗠𝗔';
    }
    
    const startTime = global.botUptimes.get(botJid);
    const uptimeMs = Date.now() - startTime;
    
    return formatUptimeRobotic(uptimeMs);
}

// Función para obtener estado del bot
function getBotStatus(bot) {
    if (!bot.ws || !bot.ws.socket) return '𝗗𝗘𝗦𝗖𝗢𝗡𝗘𝗖𝗧𝗔𝗗𝗢';
    
    switch(bot.ws.socket.readyState) {
        case 0: return '𝗖𝗢𝗡𝗘𝗖𝗧𝗔𝗡𝗗𝗢';
        case 1: return '𝗢𝗣𝗘𝗥𝗔𝗧𝗜𝗩𝗢';
        case 2: return '𝗖𝗘𝗥𝗥𝗔𝗡𝗗𝗢';
        case 3: return '𝗗𝗘𝗦𝗖𝗢𝗡𝗘𝗖𝗧𝗔𝗗𝗢';
        default: return '𝗘𝗦𝗧𝗔𝗗𝗢 𝗗𝗘𝗦𝗖𝗢𝗡𝗢𝗖𝗜𝗗𝗢';
    }
}

// Función mejorada para formatear tiempo con estilo robótico
function formatUptimeRobotic(ms) {
    if (ms < 1000) return '𝟬 𝗦𝗘𝗚𝗨𝗡𝗗𝗢𝗦';
    
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    const parts = [];
    if (days > 0) parts.push(`${days} ${days > 1 ? '𝗗𝗜́𝗔𝗦' : '𝗗𝗜́𝗔'}`);
    if (hours > 0) parts.push(`${hours} ${hours > 1 ? '𝗛𝗢𝗥𝗔𝗦' : '𝗛𝗢𝗥𝗔'}`);
    if (minutes > 0) parts.push(`${minutes} ${minutes > 1 ? '𝗠𝗜𝗡𝗨𝗧𝗢𝗦' : '𝗠𝗜𝗡𝗨𝗧𝗢'}`);
    if (seconds > 0) parts.push(`${seconds} ${seconds > 1 ? '𝗦𝗘𝗚𝗨𝗡𝗗𝗢𝗦' : '𝗦𝗘𝗚𝗨𝗡𝗗𝗢'}`);

    return parts.join(', ') || '𝟬 𝗦𝗘𝗚𝗨𝗡𝗗𝗢𝗦';
}

// =============================================
// 🔄 DETECTOR DE NUEVAS CONEXIONES
// =============================================

// Función para registrar cuando un bot se conecta
export function registerBotConnection(botInstance) {
    if (botInstance && botInstance.user && botInstance.user.jid) {
        const botJid = botInstance.user.jid;
        
        // Registrar tiempo de conexión
        global.botUptimes.set(botJid, Date.now());
        botInstance.uptime = Date.now();
        
        console.log(`🟢 Bot conectado: ${botJid} - Uptime registrado`);
    }
}

// Función para limpiar cuando un bot se desconecta
export function removeBotConnection(botJid) {
    if (global.botUptimes.has(botJid)) {
        global.botUptimes.delete(botJid);
        console.log(`🔴 Bot desconectado: ${botJid} - Uptime eliminado`);
    }
}

handler.help = ['subbots', 'bots', 'sub']
handler.tags = ['subbots']
handler.command = ['subbots', 'bots', 'sub']

export default handler
