let handler = async (m, { conn, text, usedPrefix, command, args }) => {
  conn.aventure = conn.aventure ? conn.aventure : {}
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let username = conn.getName(who)
  let users = global.db.data.users[m.sender]
  let daño = 10

  if (command == 'empezarapocalypto') {
    await m.reply(`Hola ${username}, estas a punto de empezar a vivir un apocalypto!`)
    await m.reply(`Segun los noticieros en la ciudad de "Brooksdale" esta en una crisis sanitaria debido a un virus llamado "CioVirus". Este virus es de contagio entre seres humanos y consiste en una enfermedad que te convierte en zombie, empezando un insomio, hambruna, ojos rojos. El estado recomienda abandonar la ciudad cuanto antes.\n*Tienes dos opciones, irte de la ciudad o quedarte a esperar que la ciudad calme o empeore.*\n\n${usedPrefix}apocalypto irse\n${usedPrefix}apocalypto esperar`)
    return
  }

  if (command == 'apocalypto') {
    if (!args[0]) {
      await m.reply(`*Opciones disponibles:*\n\n${usedPrefix}apocalypto irse\n${usedPrefix}apocalypto esperar`)
      return
    }

    if (args[0] == "esperar") {
      await m.reply(`Has decidido esperar a que se calme la ciudad, por ahora la ciudad tiene 10,000 contagiados de CioVirus, tu vida esta corriendo peligro en la ciudad. El departamento de salud recomienda irse a zonas apartadas de la ciudad para evitar riesgo de contagio.\n\n${usedPrefix}apocalypto irse\n${usedPrefix}apocalypto quedarse`)
      return
    }

    if (args[0] == "quedarse") {
      await m.reply(`Apesar de las advertencias que hizo el estado decides quedarte, el virus se apodero de el mundo. Todo es un caos, ya no hay recursos, y el estado anuncia un virus mortal de propagacion extrema.\n*Tienes solo una opcion y es irte.*\n\n${usedPrefix}apocalypto irse`)
      return
    }

    if (args[0] == "irse") {
      await m.reply(`Ante la inminente propagacion del virus, tomas la dificil decision de abandonar tu hogar en busca de un refugio seguro. Empacas lo esencial y emprendes un viaje incierto hacia lo desconocido. El mundo esta en caos, pero tu determinacion te impulsa a buscar una oportunidad para sobrevivir.\n*Tienes dos opciones, hay 2 ciudades, en Crestview hay personas con el virus, pero mas recursos para sobrevivir. En Rivertown no hay casos del virus, pero es una ciudad lejana y por lo tanto no tiene muchos recursos.*\n\n${usedPrefix}apocalypto crestview\n${usedPrefix}apocalypto rivertown`)
      return
    }

    if (args[0].toLowerCase() == "crestview") {
      await m.reply(`Has tomado una decision importante para tu supervivencia, la ciudad Crestview esta contagiada en su 50%, pero hay mas recursos que Rivertown. Esto te ayudara en una cierta parte para sobrevivir, pero los medios estan recomendando encerrarse en casa con los recursos necesarios.\n*Tienes dos opciones: explorar para encontrar un refugio mejor, o quedarte en casa.*\n\n${usedPrefix}apocalypto explorar\n${usedPrefix}apocalypto casa`)
      return
    }

    if (args[0].toLowerCase() == "rivertown") {
      await m.reply(`Has tomado una decision importante para tu supervivencia, aqui no hay muchos recursos, pero no hay casos del virus. estas solo en la ciudad sin ningun recurso, esto no te podria beneficiar mucho, ya que sin recursos el nivel se pondra cada vez mas peor.\n*Tienes dos opciones: explorar para encontrar un refugio mejor, o quedarte en casa.*\n\n${usedPrefix}apocalypto explorar\n${usedPrefix}apocalypto casa`)
      return
    }

    if (args[0] == "explorar") {
      await m.reply(`La decision de explorar ha tomado un rumbo de supervivencia, haciendote estar mas lejos de las ciudades para evitar el virus. Explorando has llegado a un bosque extenso, y has encontrado un gato dentro del bosque y decides llevartelo, luego de 3 horas caminando y que cayera la noche, encuentras una casa abandonada donde puedes quedarte a dormir o seguir tu camino.\n\n${usedPrefix}apocalypto dormir\n${usedPrefix}apocalypto caminar`)
      return
    }

    if (args[0] == "dormir") {
      users.hp = (users.hp || 100) + 20
      await m.reply(`Te has refugiado en la casa abandonada. Después de una buena noche de sueño, te sientes revitalizado. Tu salud ha aumentado.\nVida actual: ${users.hp}%\n\n${usedPrefix}apocalypto continuar`)
      return
    }

    if (args[0] == "caminar") {
      await m.reply(`Decides seguir explorando el bosque. Mientras avanzas, escuchas ruidos extraños a tu alrededor. De repente, te encuentras con un grupo de zombies. Tienes dos opciones:\n\n${usedPrefix}apocalypto luchar\n${usedPrefix}apocalypto correr`)
      return
    }

    if (args[0] == "luchar") {
      users.hp = (users.hp || 100) - 30
      await m.reply(`Te decides a luchar contra los zombies. Aunque logras eliminar algunos, sufres heridas en el proceso.\nVida actual: ${users.hp}%\n\n${usedPrefix}apocalypto continuar`)
      return
    }

    if (args[0] == "correr") {
      await m.reply(`Decides correr para evitar el enfrentamiento directo con los zombies. Logras escapar temporalmente y te alejas del peligro. Sin embargo, el esfuerzo te ha agotado.\nVida actual: ${users.hp}%\n\n${usedPrefix}apocalypto continuar`)
      return
    }

    if (args[0] == "continuar") {
      await m.reply(`Continuas tu viaje en el apocalipsis. A medida que avanzas, te das cuenta de que la situación empeora. ¿Cuál será tu próximo paso?\n\n${usedPrefix}apocalypto buscar refugio\n${usedPrefix}apocalypto buscar alimentos`)
      return
    }

    if (args[0] == "buscar" && args[1] == "refugio") {
      await m.reply(`Decides buscar un refugio más seguro. Después de caminar durante horas, encuentras una antigua fábrica abandonada. Parece ser un lugar tranquilo, pero sientes que no estás solo. ¿Qué harás?\n\n${usedPrefix}apocalypto explorar_fabrica\n${usedPrefix}apocalypto descansar`)
      return
    }

    if (args[0] == "explorar_fabrica") {
      await m.reply(`Te aventuras a explorar la fábrica. Encuentras suministros útiles y un lugar para descansar. Sin embargo, escuchas ruidos sospechosos. Tienes dos opciones:\n\n${usedPrefix}apocalypto investigar_ruidos\n${usedPrefix}apocalypto descansar_fabrica`)
      return
    }

    if (args[0] == "investigar_ruidos") {
      await m.reply(`Decides investigar los ruidos y te encuentras con otro sobreviviente. Se llama Carlos y también busca refugio. ¿Le permitirás unirse a ti en tu viaje?\n\n${usedPrefix}apocalypto aceptar_carlos\n${usedPrefix}apocalypto rechazar_carlos`)
      return
    }

    if (args[0] == "aceptar_carlos") {
      await m.reply(`Decides aceptar a Carlos como compañero. Juntos fortalecen sus posibilidades de supervivencia. ¿Cuál será su próximo destino?\n\n${usedPrefix}apocalypto ciudad_cerca\n${usedPrefix}apocalypto bosque_oscuro`)
      return
    }

    if (args[0] == "rechazar_carlos") {
      await m.reply(`Prefieres seguir solo y le agradeces a Carlos, quien continúa su camino. ¿Cuál será tu próximo destino?\n\n${usedPrefix}apocalypto ciudad_cerca\n${usedPrefix}apocalypto bosque_oscuro`)
      return
    }

    if (args[0] == "descansar_fabrica") {
      users.hp = (users.hp || 100) + 15
      await m.reply(`Decides descansar en la fábrica abandonada. Tu salud mejora con el descanso.\nVida actual: ${users.hp}%\n\n${usedPrefix}apocalypto continuar_viaje`)
      return
    }

    if (args[0] == "buscar" && args[1] == "alimentos") {
      await m.reply(`Sales en busca de alimentos. Encuentras un supermercado abandonado. ¿Qué harás?\n\n${usedPrefix}apocalypto explorar_supermercado\n${usedPrefix}apocalypto saquear_supermercado`)
      return
    }

    if (args[0] == "explorar_supermercado") {
      await m.reply(`Decides explorar el supermercado con cautela. Encuentras algunos alimentos no perecederos y suministros útiles. Sin embargo, escuchas ruidos provenientes de la trastienda. ¿Qué harás?\n\n${usedPrefix}apocalypto investigar_ruidos_supermercado\n${usedPrefix}apocalypto salir_supermercado`)
      return
    }

    if (args[0] == "investigar_ruidos_supermercado") {
      await m.reply(`Decides investigar los ruidos y te encuentras con un grupo de zombis en la trastienda. ¡Estás en peligro! Tienes dos opciones:\n\n${usedPrefix}apocalypto enfrentar_zombis\n${usedPrefix}apocalypto escapar_supermercado`)
      return
    }

    if (args[0] == "enfrentar_zombis") {
      users.hp = (users.hp || 100) - 40
      await m.reply(`Te decides a enfrentar a los zombis. Logras eliminar algunos, pero sufres heridas graves en el proceso.\nVida actual: ${users.hp}%\n\n${usedPrefix}apocalypto continuar_viaje`)
      return
    }

    if (args[0] == "escapar_supermercado") {
      await m.reply(`Decides escapar del supermercado antes de que sea demasiado tarde. Logras salir a salvo, pero te das cuenta de que estás agotado.\nVida actual: ${users.hp}%\n\n${usedPrefix}apocalypto continuar_viaje`)
      return
    }

    if (args[0] == "saquear_supermercado") {
      users.recursos = (users.recursos || 0) + 30
      await m.reply(`Decides saquear el supermercado y encuentras una buena cantidad de alimentos y suministros.\nRecursos actuales: ${users.recursos}\n\n${usedPrefix}apocalypto continuar_viaje`)
      return
    }

    if (args[0] == "continuar_viaje") {
      await m.reply(`Continúas tu viaje en el apocalipsis. La situación se vuelve más intensa a medida que avanzas. ¿Qué decisiones tomarás a continuación?\n\n${usedPrefix}apocalypto enfrentar_desafio\n${usedPrefix}apocalypto buscar_refugio_noche`)
      return
    }

    if (args[0] == "enfrentar_nuevos_desafios") {
      await m.reply(`El camino te presenta nuevos desafíos. ¿Estás listo para enfrentarlos?\n\n${usedPrefix}apocalypto superar_desafio\n${usedPrefix}apocalypto evitar_desafio`)
      return
    }

    if (args[0] == "explorar_ciudad") {
      await m.reply(`Decides explorar una ciudad devastada en busca de suministros. Mientras te aventuras entre los edificios en ruinas, encuentras signos de actividad zombi. ¿Qué harás?\n\n${usedPrefix}apocalypto infiltrar_zombis\n${usedPrefix}apocalypto esquivar_zombis`)
      return
    }

    if (args[0] == "infiltrar_zombis") {
      await m.reply(`Decides infiltrarte entre los zombis para evitar ser detectado. Sin embargo, te encuentras con un grupo de zombis particularmente peligrosos. ¿Cómo manejarás la situación?\n\n${usedPrefix}apocalypto luchar_zombis_peligrosos\n${usedPrefix}apocalypto huir_zombis_peligrosos`)
      return
    }

    if (args[0] == "luchar_zombis_peligrosos") {
      users.hp = (users.hp || 100) - 50
      await m.reply(`Te enfrentas a los zombis peligrosos y logras eliminar algunos, pero sufres heridas graves en el proceso.\nVida actual: ${users.hp}%\n\n${usedPrefix}apocalypto continuar_viaje`)
      return
    }

    if (args[0] == "huir_zombis_peligrosos") {
      await m.reply(`Decides huir de los zombis peligrosos. Logras escapar, pero te das cuenta de que tu camino se vuelve más complicado.\nVida actual: ${users.hp}%\n\n${usedPrefix}apocalypto continuar_viaje`)
      return
    }
  }
}

handler.help = ['empezarapocalypto', 'apocalypto']
handler.tags = ['game']
handler.command = /^(empezarapocalypto|apocalypto)$/i
handler.register = false

export default handler
