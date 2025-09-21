import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs';
import path from 'path';

let handler = m => m;
handler.before = async function (m, { conn, participants }) {
    if (!m.messageStubType || !m.isGroup) return;
    
    let chat = global.db.data.chats[m.chat];
    if (!chat.detect) return; // Si la detección está desactivada, no hacer nada
    
    let usuario = `@${m.sender.split`@`[0]}`;
    
    // Mensaje personalizado para fkontak
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

    // Detectar cambios en el modo de agregar participantes
    if (m.messageStubType == 171) {
        const modo = m.messageStubParameters[0];
        let texto = '';
        
        if (modo === 'all_member_add') {
            texto = `*⚠️ CONFIGURACIÓN DEL GRUPO MODIFICADA ⚠️*\n\n*El administrador ${usuario} ha activado la opción:*\n*"Todos pueden agregar participantes"* ✅\n\n*Ahora cualquier miembro puede añadir nuevos participantes al grupo.*`;
        } else if (modo === 'admin_add') {
            texto = `*⚠️ CONFIGURACIÓN DEL GRUPO MODIFICADA ⚠️*\n\n*El administrador ${usuario} ha activado la opción:*\n*"Solo admins pueden agregar participantes"* 👑\n\n*Ahora solo los administradores pueden añadir nuevos participantes al grupo.*`;
        }
        
        if (texto) {
            await conn.sendMessage(m.chat, { text: texto, mentions: [m.sender] }, { quoted: fkontak });
        }
    }

    // Detectar cambios en el modo de aprobación
    if (m.messageStubType == 145) {
        const modo = m.messageStubParameters[0];
        let texto = '';
        
        if (modo === 'off') {
            texto = `*⚠️ CONFIGURACIÓN DEL GRUPO MODIFICADA ⚠️*\n\n*El administrador ${usuario} ha desactivado la opción de "Aprobar nuevos participantes".*\n\n*Ahora cualquier persona puede unirse al grupo directamente.*`;
        } else if (modo === 'on') {
            texto = `*⚠️ CONFIGURACIÓN DEL GRUPO MODIFICADA ⚠️*\n\n*El administrador ${usuario} ha activado la opción de "Aprobar nuevos participantes".*\n\n*Ahora se requiere aprobación para unirse al grupo.*`;
        }
        
        if (texto) {
            await conn.sendMessage(m.chat, { text: texto, mentions: [m.sender] }, { quoted: fkontak });
        }
    }
    
    // Detectar solicitudes rechazadas
    if (m.messageStubType == 172) {
        if (m.messageStubParameters[1] === 'rejected') {
            const userRejected = m.messageStubParameters[0].split('@')[0];
            const texto = `*❌ SOLICITUD RECHAZADA ❌*\n\n*El administrador ${usuario} ha rechazado la solicitud de ingreso del número:* wa.me/${userRejected}\n\n*El usuario no podrá unirse al grupo.*`;
            
            await conn.sendMessage(m.chat, { text: texto, mentions: [m.sender] }, { quoted: fkontak });
        }
    }
}

export default handler; 
