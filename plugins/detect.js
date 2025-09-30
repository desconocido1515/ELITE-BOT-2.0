import fetch from 'node-fetch'
import { WAMessageStubType } from '@whiskeysockets/baileys'

let handler = m => m

// FUNCIÓN MEJORADA para obtener el jid real dentro del grupo
const getRealJid = async (jid, chatId, conn) => {
  if (!jid) return jid
  
  try {
    // Si ya es un JID normal (@s.whatsapp.net), retornarlo directamente
    if (jid.includes('@s.whatsapp.net')) {
      return jid
    }
    
    // Si es @lid, necesitamos buscar el JID real en los participantes
    if (jid.endsWith('@lid')) {
      const lidNumber = jid.replace('@lid', '') // Extraer solo el número
      console.log(`🔍 Buscando JID real para @lid: ${lidNumber}`)
      
      const group = await conn.groupMetadata(chatId)
      
      // Buscar por el número en los participantes
      const member = group.participants.find(p => {
        if (!p.jid) return false
        const participantNumber = p.jid.replace('@s.whatsapp.net', '')
        return participantNumber === lidNumber
      })
      
      if (member) {
        console.log(`✅ JID encontrado: ${member.jid} para @lid: ${lidNumber}`)
        return member.jid
      } else {
        console.log(`❌ No se encontró JID para @lid: ${lidNumber}`)
        // Si no encontramos el JID, al menos mostrar el número
        return `${lidNumber}@s.whatsapp.net`
      }
    }
    
    return jid
    
  } catch (e) {
    console.error('❌ Error en getRealJid:', e)
    return jid
  }
}

handler.before = async function (m, { conn }) {
  // DEBUG: Ver todos los stubs que llegan
  if (m.messageStubType && m.isGroup) {
    console.log('🔍 STUB DETECTADO:', {
      type: m.messageStubType,
      name: WAMessageStubType[m.messageStubType],
      params: m.messageStubParameters,
      chat: m.chat,
      sender: m.sender
    })
  }

  if (!m.isGroup || !m.messageStubType) return

  // FILTRO IMPORTANTE: Ignorar mensajes cifrados y otros stubs no deseados
  if (m.messageStubType === WAMessageStubType.CIPHERTEXT || 
      m.messageStubType === 2 || // CIPHERTEXT
      m.messageStubParameters?.some(param => 
        typeof param === 'string' && param.includes('decrypt')
      )) {
    return // Ignorar completamente estos mensajes
  }

  const chat = global.db.data.chats[m.chat]
  
  // VERIFICAR SI LA DETECCIÓN ESTÁ ACTIVADA EN ESTE GRUPO
  if (!chat?.detect) {
    console.log(`❌ Detector desactivado en: ${m.chat}`)
    return
  }

  console.log(`✅ Detector ACTIVADO en: ${m.chat}`)

  const usuario = '@' + m.sender.split('@')[0]
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch(() => null) || 'https://files.catbox.moe/xr2m6u.jpg'

  // Contacto para citar
  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "AlienMenu"
    },
    message: {
      locationMessage: {
        name: "𝙀𝙡𝙞𝙩𝙚 𝘽𝙤𝙩 𝙂𝙡𝙤𝙗𝙖𝙡 2023 -",
        jpegThumbnail: Buffer.from(await (await fetch('https://files.catbox.moe/1j784p.jpg')).arrayBuffer()),
        vcard:
          "BEGIN:VCARD\n" +
          "VERSION:3.0\n" +
          "N:;Sasuke;;;\n" +
          "FN:Sasuke Bot\n" +
          "ORG:Barboza Developers\n" +
          "TITLE:\n" +
          "item1.TEL;waid=19709001746:+1 (970) 900-1746\n" +
          "item1.X-ABLabel:Alien\n" +
          "X-WA-BIZ-DESCRIPTION:🛸 Llamado grupal universal con estilo.\n" +
          "X-WA-BIZ-NAME:Sasuke\n" +
          "END:VCARD"
      }
    },
    participant: "0@s.whatsapp.net"
  }

  try {
    // Obtener jid real del participante si aplica - MEJORADO
    let stubUser = null
    if (m.messageStubParameters?.[0] && !m.messageStubParameters[0].includes('decrypt')) {
      stubUser = await getRealJid(m.messageStubParameters[0], m.chat, conn)
      console.log(`👤 Usuario procesado: ${m.messageStubParameters[0]} -> ${stubUser}`)
    }

    // Mensajes MEJORADOS - Con manejo de usuarios no encontrados
    const nombre = `✨ ${usuario} *ha cambiado el nombre del grupo* ✨\n\n> 📝 *Nuevo nombre:* _${m.messageStubParameters?.[0] || ''}_`
    const foto = `📸 *¡Nueva foto de grupo!* 📸\n\n> 💫 Acción realizada por: ${usuario}`
    const edit = `⚙️ ${usuario} ha ajustado la configuración del grupo.\n\n> 🔒 Ahora *${m.messageStubParameters?.[0] == 'on' ? 'solo los administradores' : 'todos'}* pueden configurar el grupo.`
    const newlink = `🔗 *¡El enlace del grupo ha sido restablecido!* 🔗\n\n> 💫 Acción realizada por: ${usuario}`
    const status = `❱❱ 𝗢́𝗥𝗗𝗘𝗡𝗘𝗦 𝗥𝗘𝗖𝗜𝗕𝗜𝗗𝗔𝗦 ❰❰\n\n👤 ${m.messageStubParameters?.[0] == 'on' ? '𝗖𝗘𝗥𝗥𝗔𝗗𝗢' : '𝗔𝗕𝗜𝗘𝗥𝗧𝗢'} 𝗣𝗢𝗥 ${usuario}\n\n> 💬 Ahora *${m.messageStubParameters?.[0] == 'on' ? 'solo los administradores' : 'todos'}* pueden enviar mensajes.`
    
    // Mensajes para promoción/degradación MEJORADOS
    const userDisplay = stubUser ? `@${stubUser.split('@')[0]}` : 'Usuario'
    const admingp = `❱❱ 𝙁𝙀𝙇𝙄𝘾𝙄𝘿𝘼𝘿𝙀𝙎 ❰❰\n\n👤 ${userDisplay}\n» 𝘼𝙃𝙊𝙍𝘼 𝙀𝙎 𝘼𝘿𝙈𝙄𝙉.\n\n» 𝘼𝘾𝘾𝙄𝙊́𝙉 𝙍𝙀𝘼𝙇𝙄𝙕𝘼𝘿𝘰 𝙋𝙊𝙍:\n${usuario}`
    const noadmingp = `❱❱ 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝘾𝙄𝙊́𝙉 ❰❰\n\n👤 ${userDisplay}\n» 𝙔𝘼 𝙉𝙊 𝙀𝙎 𝘼𝘿𝙈𝙄𝙉.\n\n» 𝘼𝘾𝘾𝙄𝙊́𝙉 𝙍𝙀𝘼𝙇𝙄𝙕𝘼𝘿𝘼 𝙋𝙊𝙍:\n${usuario}`
    
    const descChange = `📝 ${usuario} ha cambiado la descripción del grupo.\n\n> 🔹 Nueva descripción: _${m.messageStubParameters?.[0] || ''}_`
    const memberAddMode = `👥 ${usuario} ha cambiado el modo de adición de miembros.\n\n> 🔹 Nuevo modo: _${m.messageStubParameters?.[0] || ''}_`
    const joinApprovalMode = `🔐 ${usuario} ha cambiado el modo de aprobación para unirse al grupo.\n\n> 🔹 Nuevo modo: _${m.messageStubParameters?.[0] || ''}_`

    console.log(`🎯 PROCESANDO STUB: ${WAMessageStubType[m.messageStubType]}`, m.messageStubParameters)

    // Detectar tipos de stubs válidos
    switch (m.messageStubType) {
      case WAMessageStubType.GROUP_CHANGE_NAME:
        console.log('📝 Cambio de nombre detectado')
        await conn.sendMessage(m.chat, { text: nombre, mentions: [m.sender] }, { quoted: fkontak })
        break
      case WAMessageStubType.GROUP_CHANGE_ICON:
        console.log('🖼️ Cambio de foto detectado')
        await conn.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [m.sender] }, { quoted: fkontak })
        break
      case WAMessageStubType.GROUP_CHANGE_ANNOUNCE:
        console.log('🔊 Cambio de anuncios detectado')
        await conn.sendMessage(m.chat, { text: status, mentions: [m.sender] }, { quoted: fkontak })
        break
      case WAMessageStubType.GROUP_CHANGE_RESTRICT:
        console.log('⚙️ Cambio de restricciones detectado')
        await conn.sendMessage(m.chat, { text: edit, mentions: [m.sender] }, { quoted: fkontak })
        break
      case WAMessageStubType.GROUP_CHANGE_INVITE_LINK:
        console.log('🔗 Cambio de enlace detectado')
        await conn.sendMessage(m.chat, { text: newlink, mentions: [m.sender] }, { quoted: fkontak })
        break
      case WAMessageStubType.GROUP_PARTICIPANT_PROMOTE:
        console.log('⬆️ Usuario promovido a admin')
        // SIEMPRE enviar mensaje, aunque no encontremos el JID exacto
        const mentionsPromote = stubUser && stubUser.includes('@s.whatsapp.net') ? [m.sender, stubUser] : [m.sender]
        await conn.sendMessage(m.chat, { text: admingp, mentions: mentionsPromote }, { quoted: fkontak })
        break
      case WAMessageStubType.GROUP_PARTICIPANT_DEMOTE:
        console.log('⬇️ Usuario degradado de admin')
        // SIEMPRE enviar mensaje, aunque no encontremos el JID exacto
        const mentionsDemote = stubUser && stubUser.includes('@s.whatsapp.net') ? [m.sender, stubUser] : [m.sender]
        await conn.sendMessage(m.chat, { text: noadmingp, mentions: mentionsDemote }, { quoted: fkontak })
        break
      case WAMessageStubType.GROUP_CHANGE_DESCRIPTION:
        console.log('📄 Cambio de descripción detectado')
        await conn.sendMessage(m.chat, { text: descChange, mentions: [m.sender] }, { quoted: fkontak })
        break
      case 171: // GROUP_MEMBER_ADD_MODE
        console.log('👥 Cambio modo adición miembros')
        await conn.sendMessage(m.chat, { text: memberAddMode, mentions: [m.sender] }, { quoted: fkontak })
        break
      case 145: // GROUP_MEMBERSHIP_JOIN_APPROVAL_MODE
        console.log('🔐 Cambio modo aprobación ingreso')
        await conn.sendMessage(m.chat, { text: joinApprovalMode, mentions: [m.sender] }, { quoted: fkontak })
        break
      default:
        console.log('❓ Stub no manejado:', {
          messageStubType: m.messageStubType,
          messageStubParameters: m.messageStubParameters,
          type: WAMessageStubType[m.messageStubType],
        })
    }
    
    console.log('✅ Stub procesado exitosamente')
    
  } catch (error) {
    console.error('❌ Error en detector de cambios de grupo:', error)
  }
}

export default handler
