let handler = async (m, { conn, usedPrefix, command, text }) => {
  // Base de datos completa con los 12 signos
  const horoscopos = {
    aries: {
      simbolo: '♈️',
      elemento: '🔥 Fuego',
      color: 'Rojo pasión',
      predicciones: [
        "Hoy tu energía estará al máximo, perfecto para iniciar proyectos audaces.",
        "Un desafío laboral revelará tu verdadero potencial de liderazgo.",
        "El amor llegará de forma inesperada con alguien que comparte tu pasión.",
        "Una discusión familiar se resolverá favorablemente si controlas tu temperamento.",
        "Tu creatividad estará en su punto más alto, aprovecha para innovar."
      ],
      consejos: [
        "Canaliza tu energía en actividades físicas para mantener el equilibrio.",
        "Escucha antes de reaccionar en conversaciones delicadas hoy.",
        "Toma la iniciativa en ese proyecto que has estado posponiendo.",
        "Date tiempo para relajarte, incluso los guerreros necesitan descanso.",
        "Aprovecha tu magnetismo natural para conectar con personas influyentes."
      ],
      fraseCosmica: '"El valor abre caminos donde otros solo ven obstáculos"'
    },
    tauro: {
      simbolo: '♉️',
      elemento: '🌍 Tierra',
      color: 'Verde esmeralda',
      predicciones: [
        "Tus finanzas mejorarán notablemente gracias a decisiones pasadas.",
        "Una relación antigua resurgirá con nuevos significados.",
        "Descubrirás un talento oculto relacionado con el arte culinario.",
        "La paciencia que has mostrado finalmente dará sus frutos.",
        "Un cambio en tu espacio vital traerá mayor armonía."
      ],
      consejos: [
        "Invierte en algo duradero en lugar de gastar en lo inmediato.",
        "Prueba una nueva experiencia gastronómica para estimular tus sentidos.",
        "Reorganiza tu espacio de trabajo para aumentar tu productividad.",
        "Sé honesto acerca de tus necesidades emocionales con tu pareja.",
        "Dedica tiempo a disfrutar de la naturaleza para recargar energías."
      ],
      fraseCosmica: '"La paciencia construye catedrales donde la prisa solo hace chozas"'
    },
    geminis: {
      simbolo: '♊️',
      elemento: '💨 Aire',
      color: 'Amarillo brillante',
      predicciones: [
        "Una conversación casual podría convertirse en una gran oportunidad laboral.",
        "Viajes cortos traerán perspectivas reveladoras sobre tu vida.",
        "Resolverás un conflicto con tu elocuencia característica.",
        "Dos opciones interesantes se presentarán simultáneamente.",
        "Tu ingenio te sacará de un apuro económico inesperado."
      ],
      consejos: [
        "Lleva un registro de tus ideas brillantes que suelen olvidarse.",
        "Equilibra tu lado social con momentos de introspección hoy.",
        "No comprometas tu verdad para agradar a los demás.",
        "Explora ese tema intelectual que ha captado tu curiosidad.",
        "Comparte tus conocimientos con alguien que los necesita."
      ],
      fraseCosmica: '"Dos mentes ven más lejos que una, pero un corazón verdadero ve más profundo"'
    },
    cancer: {
      simbolo: '♋️',
      elemento: '💧 Agua',
      color: 'Blanco plateado',
      predicciones: [
        "Un sueño revelador te dará claridad sobre una situación confusa.",
        "La energía lunar intensificará tu intuición esta semana.",
        "Un reencuentro familiar traerá sanación emocional.",
        "Tu hogar se convertirá en un centro de armonía y creatividad.",
        "Una oportunidad laboral surgirá a través de conexiones personales."
      ],
      consejos: [
        "Protege tu energía emocional estableciendo límites saludables.",
        "Cocina algo especial para tus seres queridos hoy.",
        "Escucha tu intuición acerca de esa decisión financiera.",
        "Renueva algún espacio de tu casa para mejorar el flujo energético.",
        "Expresa tus sentimientos a esa persona especial sin miedo."
      ],
      fraseCosmica: '"La luna conoce tus mareas internas mejor que el sol"'
    },
    leo: {
      simbolo: '♌️',
      elemento: '🔥 Fuego',
      color: 'Dorado',
      predicciones: [
        "Tu carisma atraerá oportunidades profesionales importantes.",
        "Una inversión creativa dará resultados sorprendentes.",
        "El reconocimiento por tus talentos llegará de forma inesperada.",
        "Un romance apasionado comenzará bajo cielos favorables.",
        "Tu liderazgo inspirará a otros a superarse."
      ],
      consejos: [
        "Comparte el protagonismo, deja que otros también brillen.",
        "Usa tu influencia para promover una causa noble hoy.",
        "Invierte en tu apariencia, tu confianza se disparará.",
        "Escribe tus metas audaces donde puedas verlas diariamente.",
        "Dedica tiempo a actividades puramente divertidas."
      ],
      fraseCosmica: '"Brilla con la fuerza de mil estrellas, pero calienta con la constancia de una"'
    },
    virgo: {
      simbolo: '♍️',
      elemento: '🌍 Tierra',
      color: 'Verde menta',
      predicciones: [
        "Tu atención al detalle evitará un error costoso en el trabajo.",
        "Un hábito saludable que inicies hoy tendrá efectos duraderos.",
        "Ayudarás a alguien cercano a resolver un problema práctico.",
        "Descubrirás una solución elegante a un problema complejo.",
        "Tu organización financiera te dará una ventaja inesperada."
      ],
      consejos: [
        "Practica la autocompasión, no solo la autodisciplina.",
        "Aprende algo nuevo sobre salud y bienestar hoy.",
        "Organiza ese espacio desordenado que te molesta tanto.",
        "Comparte tus conocimientos prácticos con alguien necesitado.",
        "Date permiso para relajar tus altos estándares ocasionalmente."
      ],
      fraseCosmica: '"En los detalles más pequeños habitan las verdades más grandes"'
    },
    libra: {
      simbolo: '♎️',
      elemento: '💨 Aire',
      color: 'Rosa suave',
      predicciones: [
        "Resolverás un conflicto con tu diplomacia característica.",
        "Una colaboración artística traerá satisfacción creativa.",
        "El equilibrio entre trabajo y vida personal mejorará notablemente.",
        "Una decisión importante sobre relaciones se clarificará.",
        "Tu buen gusto atraerá oportunidades sociales interesantes."
      ],
      consejos: [
        "Busca la belleza en lo simple hoy, te inspirará.",
        "Toma esa decisión pendiente usando lógica y corazón por igual.",
        "Rodéate de colores y objetos que te generen armonía.",
        "Expresa tu aprecio a alguien que ha sido justo contigo.",
        "Medita sobre el equilibrio entre dar y recibir en tu vida."
      ],
      fraseCosmica: '"El equilibrio no es punto fijo, sino danza constante"'
    },
    escorpio: {
      simbolo: '♏️',
      elemento: '💧 Agua',
      color: 'Morado intenso',
      predicciones: [
        "Descubrirás información oculta que cambiará tu perspectiva.",
        "Tu intensidad emocional atraerá a alguien especial hoy.",
        "Un proyecto secreto comenzará a dar frutos inesperados.",
        "Transformarás una debilidad percibida en tu mayor fortaleza.",
        "Tu determinación superará obstáculos que parecían imposibles."
      ],
      consejos: [
        "Usa tu poder de observación para entender antes de actuar.",
        "Escribe tus pensamientos más profundos para liberar emociones.",
        "No dejes que los celos nublen tu juicio hoy.",
        "Aprovecha tu magnetismo para causas positivas.",
        "Perdona un resentimiento antiguo para liberarte."
      ],
      fraseCosmica: '"Las transformaciones más profundas ocurren en la oscuridad silenciosa"'
    },
    sagitario: {
      simbolo: '♐️',
      elemento: '🔥 Fuego',
      color: 'Púrpura real',
      predicciones: [
        "Una oportunidad de viaje se presentará inesperadamente.",
        "Tu optimismo inspirará a alguien que pasa por dificultades.",
        "Aprenderás algo que expandirá significativamente tus horizontes.",
        "Una aventura romántica exótica está en tu futuro cercano.",
        "Tu filosofía de vida atraerá a personas afines importantes."
      ],
      consejos: [
        "Explora una cultura o filosofía diferente a la tuya hoy.",
        "Mantén tus promesas, especialmente las que hiciste a ti mismo.",
        "Planifica ese viaje que has estado posponiendo por responsabilidades.",
        "Comparte tu sabiduría con alguien más joven que la necesita.",
        "Busca el significado más profundo en experiencias cotidianas."
      ],
      fraseCosmica: '"Cada horizonte alcanzado revela nuevos horizontes por explorar"'
    },
    capricornio: {
      simbolo: '♑️',
      elemento: '🌍 Tierra',
      color: 'Negro elegante',
      predicciones: [
        "Tu disciplina dará resultados tangibles en el trabajo.",
        "Un mentor te ofrecerá consejos valiosos para tu carrera.",
        "La estabilidad financiera que buscas está más cerca de lo que crees.",
        "Un proyecto a largo plazo finalmente mostrará progreso.",
        "Tu reputación profesional alcanzará nuevos niveles."
      ],
      consejos: [
        "Revisa tus metas a largo plazo y ajusta lo necesario.",
        "Date permiso para disfrutar de un lujo bien merecido.",
        "Reconecta con un colega o mentor del pasado.",
        "Invierte en educación o herramientas que mejoren tus habilidades.",
        "Equilibra tu ambición con momentos de simple disfrute."
      ],
      fraseCosmica: '"Las montañas se escalan paso a paso, pero la vista vale cada esfuerzo"'
    },
    acuario: {
      simbolo: '♒️',
      elemento: '💨 Aire',
      color: 'Azul eléctrico',
      predicciones: [
        "Una idea revolucionaria cambiará tu perspectiva hoy.",
        "Conectarás con alguien que comparte tus ideales más elevados.",
        "Lo inesperado será tu aliado en situaciones importantes.",
        "Tu círculo social se expandirá con personas influyentes.",
        "Un proyecto humanitario te traerá profunda satisfacción."
      ],
      consejos: [
        "Comparte tus ideas más innovadoras sin miedo al rechazo.",
        "Desconéctate de la tecnología para reconectar contigo mismo.",
        "Únete a una causa que refleje tus valores más profundos.",
        "Experimenta con nuevas formas de expresión creativa.",
        "Rodéate de personas que desafíen tu pensamiento."
      ],
      fraseCosmica: '"El futuro pertenece a quienes sueñan con los ojos abiertos"'
    },
    piscis: {
      simbolo: '♓️',
      elemento: '💧 Agua',
      color: 'Turquesa marino',
      predicciones: [
        "Tu intuición te guiará hacia una decisión crucial.",
        "El arte o la música jugarán un papel sanador en tu vida.",
        "Un sueño revelador contendrá mensajes importantes.",
        "Ayudarás a alguien de manera significativa sin esperar nada a cambio.",
        "Una conexión espiritual se profundizará esta semana."
      ],
      consejos: [
        "Confía en tus corazonadas sobre esa situación confusa.",
        "Expresa tus emociones a través del arte o la escritura.",
        "Pasa tiempo cerca del agua para recargar energías.",
        "Practica la meditación para clarificar tus sentimientos.",
        "Sé compasivo contigo mismo tanto como con los demás."
      ],
      fraseCosmica: '"El océano del alma no tiene fronteras, solo conexiones infinitas"'
    }
  };

  // Obtener signo del texto (ej: ".horoscopo libra" -> "libra")
  const signo = text.toLowerCase().trim();
  
  if (!horoscopos[signo]) {
    let listaSignos = '✨ *SIGNOS DISPONIBLES:*\n\n';
    for (const [s, data] of Object.entries(horoscopos)) {
      listaSignos += `▸ ${usedPrefix}horoscopo ${s} ${data.simbolo} (${data.elemento})\n`;
    }
    return m.reply(`${listaSignos}\n📌 Ejemplo: ${usedPrefix}horoscopo libra`);
  }

  // Datos del signo
  const { simbolo, elemento, color, predicciones, consejos, fraseCosmica } = horoscopos[signo];
  
  // Selección aleatoria
  const prediccion = predicciones[Math.floor(Math.random() * predicciones.length)];
  const consejo = consejos[Math.floor(Math.random() * consejos.length)];
  const numeroSuerte = Math.floor(Math.random() * 9) + 1;
  const fecha = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Mensaje formateado (sin enlace superior)
  const mensaje = `
*${simbolo} ${signo.toUpperCase()}* (${elemento})

📅 *Fecha:* ${fecha}

🔮 *Predicción:* ${prediccion}

💡 *Consejo:* ${consejo}

✨ *Número de la suerte:* ${numeroSuerte}
🎨 *Color favorable:* ${color}

🌙 *Frase cósmica:*
${fraseCosmica}
  `;

  // Envío sin previsualización de enlace
  await m.reply(mensaje);
};

handler.help = ['horoscopo <signo>'];
handler.tags = ['horoscope'];
handler.command = /^hor[óo]scopo$/i;
export default handler;
