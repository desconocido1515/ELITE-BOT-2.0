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
        
        if (activeBots.length === 0) {
            return m.reply('🤖 No hay subbots conectados en este momento');
        }

        // Generar información
        let message = `*🤖 SUBBOTS CONECTADOS*\n*Total:* ${activeBots.length}\n\n`;
        
        activeBots.forEach((bot, index) => {
            const number = bot.user.jid.split('@')[0];
            const uptime = getBotUptime(bot.user.jid);
            
            message += `*${index + 1}.* @${number}\n   ⏰ *Uptime:* ${uptime}\n\n`;
        });

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
    
    global.conns.forEach(bot => {
        if (bot && bot.user && bot.user.jid) {
            const botJid = bot.user.jid;
            
            // Si el bot no tiene uptime registrado, inicializarlo
            if (!global.botUptimes.has(botJid)) {
                global.botUptimes.set(botJid, Date.now());
                console.log(`⏰ Uptime inicializado para: ${botJid}`);
            }
            
            // También asignar al bot directamente por si acaso
            if (!bot.uptime) {
                bot.uptime = Date.now();
            }
        }
    });
}

// Función para obtener el uptime formateado
function getBotUptime(botJid) {
    if (!global.botUptimes.has(botJid)) {
        // Si no existe, inicializar
        global.botUptimes.set(botJid, Date.now());
        return 'Recién conectado';
    }
    
    const startTime = global.botUptimes.get(botJid);
    const uptimeMs = Date.now() - startTime;
    
    return formatUptime(uptimeMs);
}

// Función mejorada para formatear tiempo
function formatUptime(ms) {
    if (ms < 1000) return '0 segundos';
    
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    const parts = [];
    if (days > 0) parts.push(`${days} día${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
    if (seconds > 0) parts.push(`${seconds} segundo${seconds > 1 ? 's' : ''}`);

    return parts.join(', ') || '0 segundos';
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
