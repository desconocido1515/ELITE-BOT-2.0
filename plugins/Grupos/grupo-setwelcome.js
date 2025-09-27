let handler = async (m, { conn, text }) => {
    let fkontak = { 
        "key": { 
            "participants":"0@s.whatsapp.net", 
            "remoteJid": "status@broadcast", 
            "fromMe": false, 
            "id": "Halo" 
        }, 
        "message": { 
            "contactMessage": { 
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
            }
        }, 
        "participant": "0@s.whatsapp.net" 
    }

    // Inicializar DB si no existe
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

    if (text) {
        global.db.data.chats[m.chat].sWelcome = text
        conn.reply(m.chat, '✅ Bienvenida configurada con éxito.', fkontak, m)
    } else throw `✦ ¡Hola!
Te ayudaré a configurar la bienvenida y despedida. 

> Primeramente debes saber que al usar este símbolo (@) te ayuda a etiquetar a la persona, mencionar el grupo e incluir la descripción en este grupo. 

» (@user)
Para etiquetar a la persona.
» (@desc)
Para incluir la descripción del grupo.
» (@subject)
Para mencionar el nombre de este grupo.

💫 Ejemplo Bienvenida:

.setwelcome Bienvenido @user al mejor grupo @subject , siéntete en casa ❤️

@desc

💫 Ejemplo Despedida:

.setbye Adiós 🤡 @user.`
}

handler.command = ['setwelcome', 'bienvenida'] 
handler.botAdmin = true
handler.admin = true
handler.group = true

export default handler
