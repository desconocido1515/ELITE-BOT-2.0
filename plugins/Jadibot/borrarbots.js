/* Codigo adaptado del plugin de limpieza original por @Fabri115 y BrunoSobrino */
import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs';
import path from 'path';

const handler = async (m, { conn, usedPrefix }) => {
    if (global.conn.user.jid !== conn.user.jid) {
        return conn.sendMessage(
            m.chat,
            { text: `${lenguajeGB['smsAvisoAG']()}𝙐𝙏𝙄𝙇𝙄𝙕𝘼 𝙀𝙎𝙏𝙀 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 𝘿𝙄𝙍𝙀𝘾𝙏𝘼𝙈𝙀𝙉𝙏𝙀 𝙀𝙉 𝙀𝙇 𝙉𝙐́𝙈𝙀𝙍𝙊 𝙋𝙍𝙄𝙉𝘾𝙄𝙋𝘼𝙇 𝘿𝙀𝙇 𝘽𝙊𝙏` },
            { quoted: m }
        );
    }

    const GataBotDir = './GataJadiBot/';
    try {
        if (!existsSync(GataBotDir)) {
            return await conn.sendMessage(
                m.chat,
                { text: `${lenguajeGB['smsAvisoFG']()} 𝙇𝘼 𝘾𝘼𝙍𝙋𝙀𝙏𝘼 (GataJadiBot) 𝙉𝙊 𝙀𝙓𝙄𝙎𝙏𝙀 𝙊 𝙀𝙎𝙏𝘼 𝙑𝘼𝘾𝙄́𝘼.` },
                { quoted: m }
            );
        }

        const files = await fs.readdir(GataBotDir);
        let sessionsDeleted = 0;

        for (const file of files) {
            const filePath = path.join(GataBotDir, file);
            
            if ((await fs.stat(filePath)).isDirectory()) {
                const credsPath = path.join(filePath, 'creds.json');
                
                if (existsSync(credsPath)) {
                    try {
                        await fs.unlink(credsPath);
                        await fs.rm(filePath, { recursive: true, force: true });
                        sessionsDeleted++;
                    } catch (error) {
                        console.error(`Error al eliminar ${filePath}:`, error);
                    }
                }
            }
        }

        if (sessionsDeleted === 0) {
            await conn.sendMessage(
                m.chat,
                { text: `${lenguajeGB['smsAvisoFG']()}𝙉𝙊 𝙎𝙀 𝙀𝙉𝘾𝙊𝙉𝙏𝙍𝘼𝙍𝙊𝙉 𝙎𝙀𝙎𝙄𝙊𝙉𝙀𝙎 𝘿𝙀 𝙎𝙐𝘽𝘽𝙊𝙏𝙎 𝙋𝘼𝙍𝘼 𝙀𝙇𝙄𝙈𝙄𝙉𝘼𝙍` },
                { quoted: m }
            );
        } else {
            await conn.sendMessage(
                m.chat,
                { text: `❱❱ 𝙀𝙉𝙏𝙀𝙉𝘿𝙄𝘿𝙊 𝘾𝙍𝙀𝘼𝘿𝙊𝙍 ❰❰\n﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘\n» 𝙎𝙀 𝙀𝙇𝙄𝙈𝙄𝙉𝘼𝙍𝙊𝙉 *${sessionsDeleted}* 𝙎𝙀𝙎𝙄𝙊𝙉𝙀𝙎 𝘿𝙀 𝙎𝙐𝘽𝘽𝙊𝙏𝙎\n» 𝙇𝙊𝙎 𝙎𝙐𝘽𝘽𝙊𝙏𝙎 𝘿𝙀𝘽𝙀𝙍𝘼́𝙉 𝙑𝙊𝙇𝙑𝙀𝙍 𝘼 𝙀𝙎𝘾𝘼𝙉𝙀𝘼𝙍 𝙀𝙇 𝘾𝙊́𝘿𝙄𝙂𝙊 𝙌𝙍` },
                { quoted: m }
            );
        }

        await conn.sendMessage(
            m.chat,
            { text: `» 𝙎𝙀𝙍𝙑𝙄𝘿𝙊𝙍 𝙇𝙄𝙈𝙋𝙄𝘼𝘿𝙊 𝘾𝙊𝙍𝙍𝙀𝘾𝙏𝘼𝙈𝙀𝙉𝙏𝙀 🌎` },
            { quoted: m }
        );

    } catch (err) {
        console.error('Error al limpiar sesiones de SubBots:', err);
        await conn.sendMessage(
            m.chat,
            { text: `${lenguajeGB['smsAvisoFG']()}𝙊𝘾𝙐𝙍𝙍𝙄𝙊́ 𝙐𝙉 𝙀𝙍𝙍𝙊𝙍 𝘼𝙇 𝙀𝙇𝙄𝙈𝙄𝙉𝘼𝙍 𝙇𝘼𝙎 𝙎𝙀𝙎𝙄𝙊𝙉𝙀𝙎 𝘿𝙀 𝙎𝙐𝘽𝘽𝙊𝙏𝙎` },
            { quoted: m }
        );
    }
};

handler.help = ['borrarbots'];
handler.tags = ['jadibot'];
handler.command = /^(borrarbots)$/i;
handler.rowner = true;

export default handler;
