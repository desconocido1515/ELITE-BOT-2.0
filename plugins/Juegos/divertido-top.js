async function handler(m, { groupMetadata, command, conn, text, usedPrefix }) {
    if (!text) return m.reply(`🎮 *Uso:*\n${usedPrefix}top <texto>\nEjemplo: ${usedPrefix}top feos`)

    let participants = groupMetadata.participants
    if (participants.length < 10) return m.reply('🚫 No hay suficientes miembros para hacer un top 10.')

    let shuffled = participants.sort(() => 0.5 - Math.random())
    let winners = shuffled.slice(0, 10)

    let user = id => '@' + id.split('@')[0] // Creamos la función user()

    let emoji = pickRandom(['🏆', '🔥', '💀', '👀', '🤡', '🎮', '👑', '💩', '🍑', '😂'])
    let groupName = groupMetadata.subject || "este grupo"

    const frasesTop = {
        1: ["¡El/La nº1 indiscutible! 👑", "¡Insuperable! 😎", "¡Leyenda viviente! 🏆"],
        2: ["¡Por poco le gana al primero! 😅", "¡Seguro el próximo mes es suyo! 🥈", "¡Merecido segundo lugar! 🔥"],
        3: ["¡No está mal para ser bronce! 🥉", "¡Casi, casi! 😂", "¡Top 3, felicidades! 🎉"]
    }

    // Aquí usamos @user directamente
    let top = `*${emoji} TOP 10 ${text.toUpperCase()}*\n*DE ${groupName.toUpperCase()} ${emoji}*

*_1.- 👑 ${user(winners[0].id)}_* ${pickRandom(frasesTop[1])}
*_2.- 🥈 ${user(winners[1].id)}_* ${pickRandom(frasesTop[2])}
*_3.- 🥉 ${user(winners[2].id)}_* ${pickRandom(frasesTop[3])}
*_4.- 🔥 ${user(winners[3].id)}_*
*_5.- 🔥 ${user(winners[4].id)}_*
*_6.- 🔥 ${user(winners[5].id)}_*
*_7.- 🔥 ${user(winners[6].id)}_*
*_8.- 🔥 ${user(winners[7].id)}_*
*_9.- 🔥 ${user(winners[8].id)}_*
*_10.- 🔥 ${user(winners[9].id)}_*

*¡Ranking oficial del grupo!* 🎮`.trim()

    await m.reply(top, null, { mentions: winners.map(u => u.id) })
}

handler.help = handler.command = ['top']
handler.tags = ['fun', 'games']
handler.group = true
export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}
