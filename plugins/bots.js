let handler = async (m, { conn }) => {
    try {
        console.log('🔧 Comando subbots ejecutándose...');
        
        // Verificar conexiones
        if (!global.conns || !Array.isArray(global.conns)) {
            console.log('❌ global.conns no configurado');
            return m.reply('❌ Sistema de subbots no configurado');
        }

        console.log(`📊 Conexiones encontradas: ${global.conns.length}`);
        
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
            const uptime = bot.uptime ? formatUptime(Date.now() - bot.uptime) : 'Recién conectado';
            
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

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(' ') || '0s';
}

handler.help = ['subbots', 'bots', 'sub']
handler.tags = ['subbots']
handler.command = ['subbots', 'bots', 'sub']

export default handler
