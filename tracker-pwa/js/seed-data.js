// Biblioteca inicial de ejercicios (Seed) y plantillas predeterminadas para Fuerza PWA
export const DEFAULT_EXERCISES = [
  // --- PECHO ---
  {
    id: 'bench-press-barbell',
    nombre: 'Press de banca plano con barra',
    grupoPrimario: 'pecho',
    musculosSecundarios: ['tríceps', 'hombros'],
    tipo: 'multiarticular',
    equipo: 'barra',
    descansoPorDefecto: 180,
    notasPersistentes: 'Retracción escapular, pies firmes en el suelo, barra a la altura del esternón.',
    custom: false
  },
  {
    id: 'incline-bench-barbell',
    nombre: 'Press inclinado con barra (30°)',
    grupoPrimario: 'pecho',
    musculosSecundarios: ['hombros', 'tríceps'],
    tipo: 'multiarticular',
    equipo: 'barra',
    descansoPorDefecto: 180,
    notasPersistentes: 'Inclinación de 30° a 45°. No rebotar en el pecho superior.',
    custom: false
  },
  {
    id: 'dumbbell-bench-press',
    nombre: 'Press de banca con mancuernas',
    grupoPrimario: 'pecho',
    musculosSecundarios: ['tríceps', 'hombros'],
    tipo: 'multiarticular',
    equipo: 'mancuerna',
    descansoPorDefecto: 150,
    notasPersistentes: 'Bajar controladamente buscando buen estiramiento en el pectoral.',
    custom: false
  },
  {
    id: 'incline-dumbbell-press',
    nombre: 'Press inclinado con mancuernas',
    grupoPrimario: 'pecho',
    musculosSecundarios: ['hombros', 'tríceps'],
    tipo: 'multiarticular',
    equipo: 'mancuerna',
    descansoPorDefecto: 150,
    notasPersistentes: 'Banca a 30°. Recorrido profundo y convergente sin chocar las mancuernas.',
    custom: false
  },
  {
    id: 'chest-dips',
    nombre: 'Fondos en paralelas para pecho',
    grupoPrimario: 'pecho',
    musculosSecundarios: ['tríceps', 'hombros'],
    tipo: 'multiarticular',
    equipo: 'peso corporal',
    descansoPorDefecto: 150,
    notasPersistentes: 'Inclinar el torso 30° hacia adelante y abrir codos ligeramente.',
    custom: false
  },
  {
    id: 'cable-crossover',
    nombre: 'Cruces de poleas en cable',
    grupoPrimario: 'pecho',
    musculosSecundarios: ['hombros'],
    tipo: 'aislamiento',
    equipo: 'polea',
    descansoPorDefecto: 90,
    notasPersistentes: 'Aguantar 1 segundo la contracción al cruzar las manos.',
    custom: false
  },
  {
    id: 'pec-deck-machine',
    nombre: 'Aperturas en máquina Pec Deck',
    grupoPrimario: 'pecho',
    musculosSecundarios: ['hombros'],
    tipo: 'aislamiento',
    equipo: 'máquina',
    descansoPorDefecto: 90,
    notasPersistentes: 'Asiento a la altura en que los codos queden alineados con el pectoral medio.',
    custom: false
  },
  {
    id: 'chest-press-machine',
    nombre: 'Press de pecho en máquina de placas',
    grupoPrimario: 'pecho',
    musculosSecundarios: ['tríceps', 'hombros'],
    tipo: 'multiarticular',
    equipo: 'máquina',
    descansoPorDefecto: 120,
    notasPersistentes: 'Altura de agarre a media altura del pectoral.',
    custom: false
  },

  // --- ESPALDA ---
  {
    id: 'pull-up',
    nombre: 'Dominadas pronas',
    grupoPrimario: 'espalda',
    musculosSecundarios: ['bíceps', 'antebrazos'],
    tipo: 'multiarticular',
    equipo: 'peso corporal',
    descansoPorDefecto: 180,
    notasPersistentes: 'Rango completo: colgarse muerto abajo y subir hasta barbilla sobre la barra.',
    custom: false
  },
  {
    id: 'lat-pulldown',
    nombre: 'Jalón al pecho en polea alta',
    grupoPrimario: 'espalda',
    musculosSecundarios: ['bíceps', 'antebrazos'],
    tipo: 'multiarticular',
    equipo: 'polea',
    descansoPorDefecto: 120,
    notasPersistentes: 'Torso ligeramente inclinado hacia atrás. Llevar la barra a la clavícula.',
    custom: false
  },
  {
    id: 'barbell-row',
    nombre: 'Remo con barra inclinado',
    grupoPrimario: 'espalda',
    musculosSecundarios: ['bíceps', 'trapecio', 'isquios'],
    tipo: 'multiarticular',
    equipo: 'barra',
    descansoPorDefecto: 180,
    notasPersistentes: 'Torso a ~45°, espalda neutra, tirar con los codos hacia la cadera.',
    custom: false
  },
  {
    id: 'one-arm-dumbbell-row',
    nombre: 'Remo con mancuerna a una mano',
    grupoPrimario: 'espalda',
    musculosSecundarios: ['bíceps', 'antebrazos'],
    tipo: 'multiarticular',
    equipo: 'mancuerna',
    descansoPorDefecto: 120,
    notasPersistentes: 'Apoyo en banco, tirar hacia la cresta ilíaca sin rotar el torso.',
    custom: false
  },
  {
    id: 'seated-cable-row',
    nombre: 'Remo en polea baja (Gironda)',
    grupoPrimario: 'espalda',
    musculosSecundarios: ['bíceps', 'trapecio'],
    tipo: 'multiarticular',
    equipo: 'polea',
    descansoPorDefecto: 120,
    notasPersistentes: 'Pecho erguido, juntar escápulas al final de la tracción.',
    custom: false
  },
  {
    id: 'lat-pulldown-wide',
    nombre: 'Jalón al pecho agarre abierto',
    grupoPrimario: 'espalda',
    musculosSecundarios: ['bíceps', 'antebrazos'],
    tipo: 'multiarticular',
    equipo: 'polea',
    descansoPorDefecto: 120,
    notasPersistentes: 'Agarre prono ligeramente más ancho que los hombros. Llevar la barra a la clavícula.',
    custom: false
  },
  {
    id: 't-bar-row',
    nombre: 'Remo T',
    grupoPrimario: 'espalda',
    musculosSecundarios: ['bíceps', 'trapecio'],
    tipo: 'multiarticular',
    equipo: 'máquina',
    descansoPorDefecto: 120,
    notasPersistentes: 'Agarre neutro cerrado, pecho firme contra el apoyo, tirar con los codos.',
    custom: false
  },
  {
    id: 'lat-pulldown-neutral',
    nombre: 'Jalón al pecho agarre neutro',
    grupoPrimario: 'espalda',
    musculosSecundarios: ['bíceps', 'antebrazos'],
    tipo: 'multiarticular',
    equipo: 'polea',
    descansoPorDefecto: 120,
    notasPersistentes: 'Agarre neutro con maneral en V o agarre paralelo, trayectoria vertical.',
    custom: false
  },
  {
    id: 'deadlift-conventional',
    nombre: 'Peso muerto convencional con barra',
    grupoPrimario: 'espalda',
    musculosSecundarios: ['glúteos', 'isquios', 'cuádriceps', 'antebrazos', 'trapecio'],
    tipo: 'multiarticular',
    equipo: 'barra',
    descansoPorDefecto: 240,
    notasPersistentes: 'Barra pegada a las espinillas, lats compactados, empujar el suelo.',
    custom: false
  },
  {
    id: 'chest-supported-row',
    nombre: 'Remo apoyado en banco con mancuernas',
    grupoPrimario: 'espalda',
    musculosSecundarios: ['bíceps', 'trapecio'],
    tipo: 'multiarticular',
    equipo: 'mancuerna',
    descansoPorDefecto: 120,
    notasPersistentes: 'Banco a 30°, elimina la fatiga lumbar.',
    custom: false
  },
  {
    id: 'straight-arm-pulldown',
    nombre: 'Pullover en polea alta con brazos rectos',
    grupoPrimario: 'espalda',
    musculosSecundarios: ['tríceps'],
    tipo: 'aislamiento',
    equipo: 'polea',
    descansoPorDefecto: 90,
    notasPersistentes: 'Codos ligeramente flexionados fijos, sentir el dorsal ancho en todo el recorrido.',
    custom: false
  },

  // --- HOMBROS ---
  {
    id: 'overhead-press-barbell',
    nombre: 'Press militar de pie con barra',
    grupoPrimario: 'hombros',
    musculosSecundarios: ['tríceps', 'trapecio', 'abdomen'],
    tipo: 'multiarticular',
    equipo: 'barra',
    descansoPorDefecto: 180,
    notasPersistentes: 'Glúteos y core apretados, trayectoria recta pasando la cabeza al bloquear.',
    custom: false
  },
  {
    id: 'seated-dumbbell-shoulder-press',
    nombre: 'Press militar sentado con mancuernas',
    grupoPrimario: 'hombros',
    musculosSecundarios: ['tríceps', 'trapecio'],
    tipo: 'multiarticular',
    equipo: 'mancuerna',
    descansoPorDefecto: 150,
    notasPersistentes: 'Respaldo a 75°-80°, no hiper-extender la zona lumbar.',
    custom: false
  },
  {
    id: 'lateral-raise-dumbbell',
    nombre: 'Elevaciones laterales con mancuernas',
    grupoPrimario: 'hombros',
    musculosSecundarios: ['trapecio'],
    tipo: 'aislamiento',
    equipo: 'mancuerna',
    descansoPorDefecto: 90,
    notasPersistentes: 'Plano escapular (brazos 30° hacia adelante), elevar hasta la horizontal.',
    custom: false
  },
  {
    id: 'cable-lateral-raise',
    nombre: 'Elevaciones laterales en polea',
    grupoPrimario: 'hombros',
    musculosSecundarios: ['trapecio'],
    tipo: 'aislamiento',
    equipo: 'polea',
    descansoPorDefecto: 90,
    notasPersistentes: 'Polea a la altura de la rodilla, tensión constante en todo el arco.',
    custom: false
  },
  {
    id: 'face-pull',
    nombre: 'Face pull en polea alta con cuerda',
    grupoPrimario: 'hombros',
    musculosSecundarios: ['trapecio', 'espalda'],
    tipo: 'aislamiento',
    equipo: 'polea',
    descansoPorDefecto: 90,
    notasPersistentes: 'Tirar hacia los ojos rotando externamente los hombros.',
    custom: false
  },
  {
    id: 'rear-delt-fly-dumbbell',
    nombre: 'Pájaros para deltoides posterior con mancuernas',
    grupoPrimario: 'hombros',
    musculosSecundarios: ['trapecio', 'espalda'],
    tipo: 'aislamiento',
    equipo: 'mancuerna',
    descansoPorDefecto: 90,
    notasPersistentes: 'Torso paralelo al suelo, mover desde los codos sin juntar escápulas.',
    custom: false
  },
  {
    id: 'rear-delt-reverse-pec-deck',
    nombre: 'Deltoides posterior en contractora invertida',
    grupoPrimario: 'hombros',
    musculosSecundarios: ['trapecio'],
    tipo: 'aislamiento',
    equipo: 'máquina',
    descansoPorDefecto: 90,
    notasPersistentes: 'Agarre neutro o prono, evitar tirar con trapecios.',
    custom: false
  },
  {
    id: 'rear-delt-extension',
    nombre: 'Extensión de hombro posterior',
    grupoPrimario: 'hombros',
    musculosSecundarios: ['trapecio', 'espalda'],
    tipo: 'aislamiento',
    equipo: 'máquina',
    descansoPorDefecto: 90,
    notasPersistentes: 'Apertura posterior en máquina o polea con codos bloqueados.',
    custom: false
  },

  // --- CUÁDRICEPS ---
  {
    id: 'barbell-back-squat',
    nombre: 'Sentadilla trasera con barra (Back Squat)',
    grupoPrimario: 'cuádriceps',
    musculosSecundarios: ['glúteos', 'isquios', 'abdomen'],
    tipo: 'multiarticular',
    equipo: 'barra',
    descansoPorDefecto: 210,
    notasPersistentes: 'Profundidad mínima: pliegue de cadera por debajo de la rodilla (paralela).',
    custom: false
  },
  {
    id: 'leg-press-45',
    nombre: 'Prensa inclinada a 45°',
    grupoPrimario: 'cuádriceps',
    musculosSecundarios: ['glúteos'],
    tipo: 'multiarticular',
    equipo: 'máquina',
    descansoPorDefecto: 180,
    notasPersistentes: 'Pies a media altura de plataforma, no bloquear rodillas ni despegar la pelvis.',
    custom: false
  },
  {
    id: 'hack-squat-machine',
    nombre: 'Sentadilla Hack en máquina',
    grupoPrimario: 'cuádriceps',
    musculosSecundarios: ['glúteos'],
    tipo: 'multiarticular',
    equipo: 'máquina',
    descansoPorDefecto: 180,
    notasPersistentes: 'Permite flexión máxima de rodilla con soporte lumbar estable.',
    custom: false
  },
  {
    id: 'leg-extension-machine',
    nombre: 'Extensiones de cuádriceps en máquina',
    grupoPrimario: 'cuádriceps',
    musculosSecundarios: [],
    tipo: 'aislamiento',
    equipo: 'máquina',
    descansoPorDefecto: 90,
    notasPersistentes: 'Pausa de 1 seg arriba en máxima extensión, bajar en 2-3 seg.',
    custom: false
  },
  {
    id: 'bulgarian-split-squat',
    nombre: 'Sentadilla búlgara con mancuernas',
    grupoPrimario: 'cuádriceps',
    musculosSecundarios: ['glúteos', 'isquios'],
    tipo: 'multiarticular',
    equipo: 'mancuerna',
    descansoPorDefecto: 120,
    notasPersistentes: 'Pie trasero elevado en banco, torso erguido para enfatizar cuádriceps.',
    custom: false
  },
  {
    id: 'walking-lunges',
    nombre: 'Zancadas caminando con mancuernas',
    grupoPrimario: 'cuádriceps',
    musculosSecundarios: ['glúteos', 'pantorrillas'],
    tipo: 'multiarticular',
    equipo: 'mancuerna',
    descansoPorDefecto: 120,
    notasPersistentes: 'Paso firme de longitud media, rodilla delantera sin colapsar en valgo.',
    custom: false
  },

  // --- ISQUIOS ---
  {
    id: 'romanian-deadlift-barbell',
    nombre: 'Peso muerto rumano con barra (RDL)',
    grupoPrimario: 'isquios',
    musculosSecundarios: ['glúteos', 'espalda', 'antebrazos'],
    tipo: 'multiarticular',
    equipo: 'barra',
    descansoPorDefecto: 180,
    notasPersistentes: 'Bisagra de cadera pura, rodillas ligeramente flexionadas fijas, sentir estiramiento.',
    custom: false
  },
  {
    id: 'romanian-deadlift-dumbbell',
    nombre: 'Peso muerto rumano con mancuernas',
    grupoPrimario: 'isquios',
    musculosSecundarios: ['glúteos', 'antebrazos'],
    tipo: 'multiarticular',
    equipo: 'mancuerna',
    descansoPorDefecto: 150,
    notasPersistentes: 'Mancuernas pegadas a los muslos, cadera viaja hacia atrás.',
    custom: false
  },
  {
    id: 'seated-leg-curl',
    nombre: 'Curl femoral sentado en máquina',
    grupoPrimario: 'isquios',
    musculosSecundarios: ['pantorrillas'],
    tipo: 'aislamiento',
    equipo: 'máquina',
    descansoPorDefecto: 90,
    notasPersistentes: 'Cadera en flexión produce mayor estiramiento y reclutamiento del isquiosural.',
    custom: false
  },
  {
    id: 'lying-leg-curl',
    nombre: 'Curl femoral tumbado en máquina',
    grupoPrimario: 'isquios',
    musculosSecundarios: ['pantorrillas'],
    tipo: 'aislamiento',
    equipo: 'máquina',
    descansoPorDefecto: 90,
    notasPersistentes: 'No despegar la pelvis del tapizado durante la flexión.',
    custom: false
  },

  // --- GLÚTEOS ---
  {
    id: 'hip-thrust-barbell',
    nombre: 'Hip Thrust con barra en banco',
    grupoPrimario: 'glúteos',
    musculosSecundarios: ['isquios', 'cuádriceps'],
    tipo: 'multiarticular',
    equipo: 'barra',
    descansoPorDefecto: 180,
    notasPersistentes: 'Bloquear pelvis en retroversión arriba, mentón pegado al pecho, espinillas verticales.',
    custom: false
  },
  {
    id: 'cable-glute-kickback',
    nombre: 'Patada de glúteo en polea baja',
    grupoPrimario: 'glúteos',
    musculosSecundarios: ['isquios'],
    tipo: 'aislamiento',
    equipo: 'polea',
    descansoPorDefecto: 90,
    notasPersistentes: 'Tobillera, trayectoria a 30° hacia afuera para alinear con fibras del glúteo mayor.',
    custom: false
  },
  {
    id: 'hip-abduction-machine',
    nombre: 'Abducción de cadera en máquina',
    grupoPrimario: 'glúteos',
    musculosSecundarios: [],
    tipo: 'aislamiento',
    equipo: 'máquina',
    descansoPorDefecto: 90,
    notasPersistentes: 'Inclinarse ligeramente hacia adelante para reclutar glúteo medio y superior.',
    custom: false
  },

  // --- BÍCEPS ---
  {
    id: 'barbell-bicep-curl',
    nombre: 'Curl de bíceps con barra recta',
    grupoPrimario: 'bíceps',
    musculosSecundarios: ['antebrazos'],
    tipo: 'aislamiento',
    equipo: 'barra',
    descansoPorDefecto: 90,
    notasPersistentes: 'Codos pegados al costado, evitar balanceo lumbar.',
    custom: false
  },
  {
    id: 'ez-bar-bicep-curl',
    nombre: 'Curl de bíceps con barra Z',
    grupoPrimario: 'bíceps',
    musculosSecundarios: ['antebrazos'],
    tipo: 'aislamiento',
    equipo: 'barra',
    descansoPorDefecto: 90,
    notasPersistentes: 'Menor tensión sobre la muñeca que la barra recta.',
    custom: false
  },
  {
    id: 'incline-dumbbell-curl',
    nombre: 'Curl inclinado con mancuernas en banco (45°)',
    grupoPrimario: 'bíceps',
    musculosSecundarios: ['antebrazos'],
    tipo: 'aislamiento',
    equipo: 'mancuerna',
    descansoPorDefecto: 90,
    notasPersistentes: 'Excelente estiramiento de la cabeza larga del bíceps.',
    custom: false
  },
  {
    id: 'hammer-curl-dumbbell',
    nombre: 'Curl martillo con mancuernas',
    grupoPrimario: 'bíceps',
    musculosSecundarios: ['antebrazos'],
    tipo: 'aislamiento',
    equipo: 'mancuerna',
    descansoPorDefecto: 90,
    notasPersistentes: 'Agarre neutro: gran estímulo para el braquiorradial y braquial anterior.',
    custom: false
  },
  {
    id: 'preacher-curl-machine',
    nombre: 'Curl predicador en máquina / banco Scott',
    grupoPrimario: 'bíceps',
    musculosSecundarios: ['antebrazos'],
    tipo: 'aislamiento',
    equipo: 'máquina',
    descansoPorDefecto: 90,
    notasPersistentes: 'Tensión máxima en la porción inicial del recorrido.',
    custom: false
  },
  {
    id: 'bayesian-cable-curl',
    nombre: 'Curl bayesiano en polea (brazo por detrás)',
    grupoPrimario: 'bíceps',
    musculosSecundarios: [],
    tipo: 'aislamiento',
    equipo: 'polea',
    descansoPorDefecto: 90,
    notasPersistentes: 'Polea baja a la espalda, brazo extendido atrás con tensión continua.',
    custom: false
  },

  // --- TRÍCEPS ---
  {
    id: 'tricep-pushdown-rope',
    nombre: 'Extensiones de tríceps en polea alta con cuerda',
    grupoPrimario: 'tríceps',
    musculosSecundarios: [],
    tipo: 'aislamiento',
    equipo: 'polea',
    descansoPorDefecto: 90,
    notasPersistentes: 'Separar los cabos de la cuerda abajo para contracción completa.',
    custom: false
  },
  {
    id: 'tricep-pushdown-bar',
    nombre: 'Extensiones de tríceps en polea con barra recta',
    grupoPrimario: 'tríceps',
    musculosSecundarios: [],
    tipo: 'aislamiento',
    equipo: 'polea',
    descansoPorDefecto: 90,
    notasPersistentes: 'Permite sobrecargar más peso que la cuerda.',
    custom: false
  },
  {
    id: 'skull-crushers-ez-bar',
    nombre: 'Press francés en banco con barra Z',
    grupoPrimario: 'tríceps',
    musculosSecundarios: [],
    tipo: 'aislamiento',
    equipo: 'barra',
    descansoPorDefecto: 90,
    notasPersistentes: 'Bajar hacia la coronilla o detrás de la cabeza para proteger los codos.',
    custom: false
  },
  {
    id: 'overhead-cable-tricep-extension',
    nombre: 'Extensiones de tríceps sobre la cabeza en polea',
    grupoPrimario: 'tríceps',
    musculosSecundarios: [],
    tipo: 'aislamiento',
    equipo: 'polea',
    descansoPorDefecto: 90,
    notasPersistentes: 'Máximo estiramiento de la cabeza larga del tríceps.',
    custom: false
  },
  {
    id: 'close-grip-bench-press',
    nombre: 'Press de banca con agarre cerrado',
    grupoPrimario: 'tríceps',
    musculosSecundarios: ['pecho', 'hombros'],
    tipo: 'multiarticular',
    equipo: 'barra',
    descansoPorDefecto: 150,
    notasPersistentes: 'Manos a la anchura de hombros (no más juntas para proteger muñecas).',
    custom: false
  },

  // --- PANTORRILLAS ---
  {
    id: 'standing-calf-raise-machine',
    nombre: 'Elevación de talones de pie en máquina',
    grupoPrimario: 'pantorrillas',
    musculosSecundarios: [],
    tipo: 'aislamiento',
    equipo: 'máquina',
    descansoPorDefecto: 90,
    notasPersistentes: 'Rodillas rectas bloqueadas, pausa de 2 seg en el estiramiento profundo.',
    custom: false
  },
  {
    id: 'seated-calf-raise-machine',
    nombre: 'Elevación de talones sentado en máquina',
    grupoPrimario: 'pantorrillas',
    musculosSecundarios: [],
    tipo: 'aislamiento',
    equipo: 'máquina',
    descansoPorDefecto: 90,
    notasPersistentes: 'Rodillas a 90° enfatizan el músculo sóleo.',
    custom: false
  },
  {
    id: 'leg-press-calf-raise',
    nombre: 'Elevación de gemelos en prensa de piernas',
    grupoPrimario: 'pantorrillas',
    musculosSecundarios: [],
    tipo: 'aislamiento',
    equipo: 'máquina',
    descansoPorDefecto: 90,
    notasPersistentes: 'Puntas de los pies en el borde inferior, frenos de seguridad listos.',
    custom: false
  },

  // --- ABDOMEN ---
  {
    id: 'cable-kneeling-crunch',
    nombre: 'Crunch abdominal de rodillas en polea alta',
    grupoPrimario: 'abdomen',
    musculosSecundarios: [],
    tipo: 'aislamiento',
    equipo: 'polea',
    descansoPorDefecto: 90,
    notasPersistentes: 'Flexionar la columna enrollándola hacia la pelvis, sin mover la cadera.',
    custom: false
  },
  {
    id: 'hanging-leg-raise',
    nombre: 'Elevaciones de piernas colgado en barra',
    grupoPrimario: 'abdomen',
    musculosSecundarios: ['antebrazos'],
    tipo: 'aislamiento',
    equipo: 'peso corporal',
    descansoPorDefecto: 90,
    notasPersistentes: 'Elevar la pelvis al final para reclutar el recto abdominal inferior.',
    custom: false
  },
  {
    id: 'ab-wheel-rollout',
    nombre: 'Rueda abdominal (Ab Wheel Rollout)',
    grupoPrimario: 'abdomen',
    musculosSecundarios: ['espalda', 'tríceps'],
    tipo: 'multiarticular',
    equipo: 'peso corporal',
    descansoPorDefecto: 90,
    notasPersistentes: 'Pelvis en retroversión, no permitir colapso ni arqueo lumbar.',
    custom: false
  },
  {
    id: 'cable-woodchopper',
    nombre: 'Leñador en polea (Woodchopper oblicuos)',
    grupoPrimario: 'abdomen',
    musculosSecundarios: ['hombros'],
    tipo: 'aislamiento',
    equipo: 'polea',
    descansoPorDefecto: 90,
    notasPersistentes: 'Rotación controlada del torso resistiendo con los oblicuos.',
    custom: false
  },

  // --- ANTEBRAZOS ---
  {
    id: 'wrist-curl-barbell',
    nombre: 'Curl de muñeca con barra (flexores)',
    grupoPrimario: 'antebrazos',
    musculosSecundarios: [],
    tipo: 'aislamiento',
    equipo: 'barra',
    descansoPorDefecto: 60,
    notasPersistentes: 'Antebrazos apoyados sobre las piernas o el banco.',
    custom: false
  },
  {
    id: 'reverse-wrist-curl-barbell',
    nombre: 'Curl de muñeca invertido con barra (extensores)',
    grupoPrimario: 'antebrazos',
    musculosSecundarios: [],
    tipo: 'aislamiento',
    equipo: 'barra',
    descansoPorDefecto: 60,
    notasPersistentes: 'Peso ligero, movimiento estricto.',
    custom: false
  },
  {
    id: 'farmers-walk-dumbbells',
    nombre: 'Paseo del granjero con mancuernas pesadas',
    grupoPrimario: 'antebrazos',
    musculosSecundarios: ['trapecio', 'abdomen', 'pantorrillas'],
    tipo: 'multiarticular',
    equipo: 'mancuerna',
    descansoPorDefecto: 120,
    notasPersistentes: 'Postura erguida, pasos cortos y controlados, agarre firme.',
    custom: false
  },

  // --- TRAPECIO ---
  {
    id: 'barbell-shrug',
    nombre: 'Encogimientos de hombros con barra',
    grupoPrimario: 'trapecio',
    musculosSecundarios: ['antebrazos'],
    tipo: 'aislamiento',
    equipo: 'barra',
    descansoPorDefecto: 90,
    notasPersistentes: 'Elevar los hombros hacia las orejas verticalmente, no rotar.',
    custom: false
  },
  {
    id: 'dumbbell-shrug',
    nombre: 'Encogimientos de hombros con mancuernas',
    grupoPrimario: 'trapecio',
    musculosSecundarios: ['antebrazos'],
    tipo: 'aislamiento',
    equipo: 'mancuerna',
    descansoPorDefecto: 90,
    notasPersistentes: 'Pausa isométrica de 1 a 2 segundos en el punto más alto.',
    custom: false
  }
];

// Plantillas predeterminadas (incluye rutinas PUSH, PULL, LEG, BRAZOS solicitadas)
export const DEFAULT_TEMPLATES = [
  {
    id: 'custom-push-2s',
    nombre: 'PUSH',
    descripcion: 'Press inclinado, press militar, pec deck, elevaciones laterales, tríceps polea alta y tras nuca (2 series c/u).',
    ejercicios: [
      { exerciseId: 'incline-dumbbell-press', targetSets: 2, minReps: 8, maxReps: 10, targetRir: 2 },
      { exerciseId: 'overhead-press-barbell', targetSets: 2, minReps: 6, maxReps: 8, targetRir: 2 },
      { exerciseId: 'pec-deck-machine', targetSets: 2, minReps: 10, maxReps: 12, targetRir: 1 },
      { exerciseId: 'cable-lateral-raise', targetSets: 2, minReps: 12, maxReps: 15, targetRir: 1 },
      { exerciseId: 'tricep-pushdown-rope', targetSets: 2, minReps: 10, maxReps: 12, targetRir: 1 },
      { exerciseId: 'overhead-cable-tricep-extension', targetSets: 2, minReps: 10, maxReps: 12, targetRir: 1 }
    ]
  },
  {
    id: 'custom-pull-2s',
    nombre: 'PULL',
    descripcion: 'Jalón abierto, remo T, jalón neutro, curl predicador, curl martillo y extensión de hombro posterior (2 series c/u).',
    ejercicios: [
      { exerciseId: 'lat-pulldown-wide', targetSets: 2, minReps: 8, maxReps: 10, targetRir: 2 },
      { exerciseId: 't-bar-row', targetSets: 2, minReps: 8, maxReps: 10, targetRir: 2 },
      { exerciseId: 'lat-pulldown-neutral', targetSets: 2, minReps: 8, maxReps: 12, targetRir: 1 },
      { exerciseId: 'preacher-curl-machine', targetSets: 2, minReps: 10, maxReps: 12, targetRir: 1 },
      { exerciseId: 'hammer-curl-dumbbell', targetSets: 2, minReps: 10, maxReps: 12, targetRir: 1 },
      { exerciseId: 'rear-delt-extension', targetSets: 2, minReps: 12, maxReps: 15, targetRir: 1 }
    ]
  },
  {
    id: 'custom-leg-2s',
    nombre: 'LEG',
    descripcion: 'Abductores, sentadilla, RDL, extensión de cuádriceps, curl femoral y pantorrillas (2 series c/u).',
    ejercicios: [
      { exerciseId: 'hip-abduction-machine', targetSets: 2, minReps: 12, maxReps: 15, targetRir: 1 },
      { exerciseId: 'barbell-back-squat', targetSets: 2, minReps: 6, maxReps: 8, targetRir: 2 },
      { exerciseId: 'romanian-deadlift-barbell', targetSets: 2, minReps: 8, maxReps: 10, targetRir: 2 },
      { exerciseId: 'leg-extension-machine', targetSets: 2, minReps: 10, maxReps: 12, targetRir: 1 },
      { exerciseId: 'seated-leg-curl', targetSets: 2, minReps: 10, maxReps: 12, targetRir: 1 },
      { exerciseId: 'standing-calf-raise-machine', targetSets: 2, minReps: 12, maxReps: 15, targetRir: 0 }
    ]
  },
  {
    id: 'custom-brazos-2s',
    nombre: 'BRAZOS',
    descripcion: 'Press militar, curl predicador, tríceps polea alta, elevaciones laterales, curl martillo y tríceps tras nuca (2 series c/u).',
    ejercicios: [
      { exerciseId: 'overhead-press-barbell', targetSets: 2, minReps: 6, maxReps: 8, targetRir: 2 },
      { exerciseId: 'preacher-curl-machine', targetSets: 2, minReps: 10, maxReps: 12, targetRir: 1 },
      { exerciseId: 'tricep-pushdown-rope', targetSets: 2, minReps: 10, maxReps: 12, targetRir: 1 },
      { exerciseId: 'cable-lateral-raise', targetSets: 2, minReps: 12, maxReps: 15, targetRir: 1 },
      { exerciseId: 'hammer-curl-dumbbell', targetSets: 2, minReps: 10, maxReps: 12, targetRir: 1 },
      { exerciseId: 'overhead-cable-tricep-extension', targetSets: 2, minReps: 10, maxReps: 12, targetRir: 1 }
    ]
  },
  {
    id: 'ppl-push',
    nombre: 'Empuje (Push) - PPL',
    descripcion: 'Pectoral, deltoides anterior y lateral, y tríceps.',
    ejercicios: [
      { exerciseId: 'bench-press-barbell', targetSets: 4, minReps: 6, maxReps: 8, targetRir: 2 },
      { exerciseId: 'incline-dumbbell-press', targetSets: 3, minReps: 8, maxReps: 10, targetRir: 2 },
      { exerciseId: 'chest-dips', targetSets: 3, minReps: 8, maxReps: 12, targetRir: 1 },
      { exerciseId: 'cable-lateral-raise', targetSets: 4, minReps: 12, maxReps: 15, targetRir: 1 },
      { exerciseId: 'overhead-cable-tricep-extension', targetSets: 3, minReps: 10, maxReps: 12, targetRir: 1 },
      { exerciseId: 'tricep-pushdown-rope', targetSets: 3, minReps: 12, maxReps: 15, targetRir: 0 }
    ]
  },
  {
    id: 'ppl-pull',
    nombre: 'Tirón (Pull) - PPL',
    descripcion: 'Espalda completa, deltoides posterior, trapecios y bíceps.',
    ejercicios: [
      { exerciseId: 'barbell-row', targetSets: 4, minReps: 6, maxReps: 8, targetRir: 2 },
      { exerciseId: 'pull-up', targetSets: 3, minReps: 6, maxReps: 10, targetRir: 2 },
      { exerciseId: 'seated-cable-row', targetSets: 3, minReps: 10, maxReps: 12, targetRir: 1 },
      { exerciseId: 'face-pull', targetSets: 4, minReps: 12, maxReps: 15, targetRir: 1 },
      { exerciseId: 'incline-dumbbell-curl', targetSets: 3, minReps: 10, maxReps: 12, targetRir: 1 },
      { exerciseId: 'hammer-curl-dumbbell', targetSets: 3, minReps: 10, maxReps: 12, targetRir: 0 }
    ]
  },
  {
    id: 'ppl-legs',
    nombre: 'Pierna (Legs) - PPL',
    descripcion: 'Cuádriceps, isquiotibiales, glúteos y pantorrillas.',
    ejercicios: [
      { exerciseId: 'barbell-back-squat', targetSets: 4, minReps: 6, maxReps: 8, targetRir: 2 },
      { exerciseId: 'romanian-deadlift-barbell', targetSets: 3, minReps: 8, maxReps: 10, targetRir: 2 },
      { exerciseId: 'leg-press-45', targetSets: 3, minReps: 10, maxReps: 12, targetRir: 1 },
      { exerciseId: 'seated-leg-curl', targetSets: 3, minReps: 10, maxReps: 12, targetRir: 1 },
      { exerciseId: 'standing-calf-raise-machine', targetSets: 4, minReps: 12, maxReps: 15, targetRir: 0 }
    ]
  },
  {
    id: 'upper-lower-upper',
    nombre: 'Torso - Enfoque Fuerza',
    descripcion: 'Todo el tren superior con énfasis en básicos multiarticulares.',
    ejercicios: [
      { exerciseId: 'bench-press-barbell', targetSets: 4, minReps: 5, maxReps: 8, targetRir: 2 },
      { exerciseId: 'lat-pulldown', targetSets: 4, minReps: 8, maxReps: 10, targetRir: 2 },
      { exerciseId: 'overhead-press-barbell', targetSets: 3, minReps: 6, maxReps: 8, targetRir: 2 },
      { exerciseId: 'one-arm-dumbbell-row', targetSets: 3, minReps: 8, maxReps: 10, targetRir: 1 },
      { exerciseId: 'ez-bar-bicep-curl', targetSets: 3, minReps: 10, maxReps: 12, targetRir: 1 },
      { exerciseId: 'skull-crushers-ez-bar', targetSets: 3, minReps: 10, maxReps: 12, targetRir: 1 }
    ]
  },
  {
    id: 'fullbody-a',
    nombre: 'Fullbody - Sesión Integral',
    descripcion: 'Cuerpo completo balanceado en una sola sesión.',
    ejercicios: [
      { exerciseId: 'barbell-back-squat', targetSets: 3, minReps: 6, maxReps: 8, targetRir: 2 },
      { exerciseId: 'bench-press-barbell', targetSets: 3, minReps: 6, maxReps: 8, targetRir: 2 },
      { exerciseId: 'seated-cable-row', targetSets: 3, minReps: 8, maxReps: 10, targetRir: 2 },
      { exerciseId: 'romanian-deadlift-dumbbell', targetSets: 3, minReps: 8, maxReps: 10, targetRir: 2 },
      { exerciseId: 'cable-lateral-raise', targetSets: 3, minReps: 12, maxReps: 15, targetRir: 1 },
      { exerciseId: 'cable-kneeling-crunch', targetSets: 3, minReps: 12, maxReps: 15, targetRir: 1 }
    ]
  }
];
