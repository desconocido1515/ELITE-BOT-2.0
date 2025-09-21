import { readdirSync, unlinkSync, existsSync, promises as fs } from 'fs'
import path from 'path'

const handler = async (m, { conn, usedPrefix }) => {
    const GataBotDir = './GataJadiBot/'
    try {
        if (!existsSync(GataBotDir)) {
            return await conn.sendMessage(
                m.chat,
                { text: `${lenguajeGB['smsAvisoFG']()} 𝙇𝘼 𝘾𝘼𝙍𝙋𝙀𝙏𝘼 (GataJadiBot) 𝙉𝙊 𝙀𝙓𝙄𝙎𝙏𝙀 𝙊 𝙀𝙎𝙏𝘼 𝙑𝘼𝘾𝙄́𝘼.` },
                { quoted: m }
            )
        }

        const files = await fs.readdir(GataBotDir)
        let filesDeleted = 0

        for (const file of files) {
            const filePath = path.join(GataBotDir, file)
            
            if ((await fs.stat(filePath)).isDirectory()) {
                const dirFiles = await fs.readdir(filePath)
                
                for (const dirFile of dirFiles) {
                    // No eliminar creds.json para mantener la vinculación
                    if (dirFile !== 'creds.json') {
                        try {
                            await fs.unlink(path.join(filePath, dirFile))
                            filesDeleted++
                        } catch (error) {
                            console.error(`Error al eliminar ${dirFile}:`, error)
                        }
                    }
                }
            }
        }

        if (filesDeleted === 0) {
            await conn.sendMessage(
                m.chat,
                { text: `${lenguajeGB['smsAvisoFG']()}𝙉𝙊 𝙎𝙀 𝙀𝙉𝘾𝙊𝙉𝙏𝘼𝙍𝙊𝙉 𝘼𝙍𝘾𝙃𝙄𝙑𝙊𝙎 𝙍𝙀𝙎𝙄𝘿𝙐𝘼𝙇𝙀𝙎 𝙋𝘼𝙍𝘼 𝙇𝙄𝙈𝙋𝙄𝘼𝙍` },
                { quoted: m }
            )
        } else {
            await conn.sendMessage(
                m.chat,
                { text: `❱❱ 𝙀𝙉𝙏𝙀𝙉𝘿𝙄𝘿𝙊 𝘾𝙍𝙀𝘼𝘿𝙊𝙍 ❰❰\n﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘\n» 𝙎𝙀 𝙀𝙇𝙄𝙈𝙄𝙉𝘼𝙍𝙊𝙉 *${filesDeleted}* 𝘼𝙍𝘾𝙃𝙄𝙑𝙊𝙎 𝙍𝙀𝙎𝙄𝘿𝙐𝘼𝙇𝙀𝙎\n» 𝙎𝙀 𝙈𝘼𝙉𝙏𝙐𝙑𝙊 𝙇𝘼 𝙑𝙄𝙉𝘾𝙐𝙇𝘼𝘾𝙄𝙊́𝙉 𝘿𝙀 𝙇𝙊𝙎 𝙎𝙐𝘽𝘽𝙊𝙏𝙎` },
                { quoted: m }
            )
        }

        await conn.sendMessage(
            m.chat,
            { text: `» 𝙎𝙀𝙍𝙑𝙄𝘿𝙊𝙍 𝙇𝙄𝙈𝙋𝙄𝘼𝘿𝙊 𝘾𝙊𝙍𝙍𝙀𝘾𝙏𝘼𝙈𝙀𝙉𝙏𝙀 🌎` },
            { quoted: m }
        )

    } catch (err) {
        console.error('Error al limpiar archivos residuales:', err)
        await conn.sendMessage(
            m.chat,
            { text: `${lenguajeGB['smsAvisoFG']()}𝙊𝘾𝙐𝙍𝙍𝙄𝙊́ 𝙐𝙉 𝙀𝙍𝙍𝙊𝙍 𝘼𝙇 𝙇𝙄𝙈𝙋𝙄𝘼𝙍 𝙇𝙊𝙎 𝘼𝙍𝘾𝙃𝙄𝙑𝙊𝙎 𝙍𝙀𝙎𝙄𝘿𝙐𝘼𝙇𝙀𝙎` },
            { quoted: m }
        )
    }
}

handler.help = ['limpiezasub']
handler.tags = ['jadibot']
handler.command = /^(limpiezasub|limpiarsub|clearsubbot)$/i
handler.rowner = true

export default handler
