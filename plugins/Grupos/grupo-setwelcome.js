let handler = async (m, { conn, text, isROwner, isOwner }) => {
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
    };

    if (text) {
        global.db.data.chats[m.chat].sWelcome = text;
        // **THIS IS THE KEY FIX:** Save the database after modification
        await global.db.write(); 
        conn.reply(m.chat, '_*LA BIENVENIDA DEL GRUPO HA SIDO CONFIGURADA*_', fkontak, m);
    } else {
        conn.reply(m.chat, `
        
        
        
       ✦ ¡Hola!
Te ayudaré a configurar la bienvenida y despedida. 

> Primeramente debes saber que al usar este símbolo (@) te ayuda a etiquetar a la persona , mencionar el grupo e incluir la descripción en este grupo. 

» (@user)
Para etiquetar a la persona .
» (@desc)
Para incluir la descripción del grupo.
» (@group)
Para mencionar el nombre de este grupo.

💫 Ejemplo Bienvenida:

.setwelcome Bienvenido @user al mejor grupo @group ,  siéntete en casa. ❤️ 

@desc

💫 Ejemplo Despedida:

.setbye Adiós Popo 🤡 @user.  
        
        
        
        
        `, m);
    }
};

handler.help = ['setwelcome @user + texto'];
handler.tags = ['group'];
handler.command = ['setwelcome', 'bienvenida']; 
handler.botAdmin = true;
handler.admin = true;
handler.group = true;

export default handler;
