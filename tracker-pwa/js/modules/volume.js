// Módulo puro de cálculo de volumen y tonelaje semanal por grupo muscular

export const DEFAULT_MUSCLE_GROUPS = [
  'pecho',
  'espalda',
  'hombros',
  'cuádriceps',
  'isquios',
  'glúteos',
  'bíceps',
  'tríceps',
  'pantorrillas',
  'abdomen',
  'antebrazos',
  'trapecio'
];

/**
 * Obtiene el lunes de la semana (inicio de semana ISO) para una fecha dada
 * @param {Date|string|number} d 
 * @returns {Date}
 */
export function getMondayOfWeek(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  // En JS: 0 es Domingo, 1 es Lunes... 6 es Sábado
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Determina si una serie califica como serie efectiva para hipertrofia
 * @param {{ tipo: string, rir?: number, rpe?: number }} set 
 * @param {object} [options]
 * @param {number} [options.maxRir=3] - RIR máximo (ej. RIR <= 3)
 * @param {number} [options.minRpe=7] - RPE mínimo (ej. RPE >= 7)
 * @returns {boolean}
 */
export function isEffectiveSet(set, options = {}) {
  if (!set || set.tipo === 'calentamiento') return false;

  const maxRir = options.maxRir !== undefined ? options.maxRir : 3;
  const minRpe = options.minRpe !== undefined ? options.minRpe : 7;

  if (set.rir !== undefined && set.rir !== null && set.rir !== '') {
    if (Number(set.rir) > maxRir) return false;
  }

  if (set.rpe !== undefined && set.rpe !== null && set.rpe !== '') {
    if (Number(set.rpe) < minRpe) return false;
  }

  return true;
}

/**
 * Calcula el tonelaje total de una sesión
 * @param {{ sets: Array<{ peso: number, reps: number, tipo: string }> }} session 
 * @param {boolean} [excludeWarmups=true]
 * @returns {number} Tonelaje total (kg o lb)
 */
export function calculateSessionTonnage(session, excludeWarmups = true) {
  if (!session || !Array.isArray(session.sets)) return 0;

  return session.sets.reduce((total, s) => {
    if (excludeWarmups && s.tipo === 'calentamiento') return total;
    const w = Number(s.peso) || 0;
    const r = Number(s.reps) || 0;
    return total + (w * r);
  }, 0);
}

/**
 * Calcula el volumen semanal por grupo muscular ponderando primarios y secundarios
 *
 * @param {Array<object>} sessions - Sesiones en el rango de fecha
 * @param {Map<string, object>|Record<string, object>} exerciseMap - Mapa de ejercicios indexados por id
 * @param {object} [options]
 * @param {number} [options.secondaryFactor=0.5] - Ponderación de músculos secundarios
 * @param {{ min: number, max: number }} [options.targetRange={ min: 10, max: 20 }] - Rango óptimo de series
 * @param {Date} [options.weekStart] - Fecha del lunes de la semana a consultar (por defecto semana actual)
 * @returns {{
 *   totalSets: number,
 *   totalTonnage: number,
 *   muscles: Record<string, {
 *     sets: number,
 *     tonnage: number,
 *     status: 'below' | 'optimal' | 'above',
 *     primarySets: number,
 *     secondarySets: number,
 *     lastTrained: string | null
 *   }>
 * }}
 */
export function calculateWeeklyMuscleVolume(sessions, exerciseMap, options = {}) {
  const secondaryFactor = options.secondaryFactor !== undefined ? options.secondaryFactor : 0.5;
  const targetRange = options.targetRange || { min: 10, max: 20 };
  const weekStart = options.weekStart ? new Date(options.weekStart) : getMondayOfWeek();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Inicializar acumuladores para todos los grupos musculares
  const muscles = {};
  for (const group of DEFAULT_MUSCLE_GROUPS) {
    muscles[group] = {
      sets: 0,
      tonnage: 0,
      primarySets: 0,
      secondarySets: 0,
      lastTrained: null,
      status: 'below'
    };
  }

  let totalSets = 0;
  let totalTonnage = 0;

  for (const session of sessions || []) {
    const sDate = new Date(session.fecha || session.inicio);
    // Filtrar sesiones dentro de la semana
    if (sDate < weekStart || sDate >= weekEnd) continue;

    for (const set of session.sets || []) {
      const isEffective = isEffectiveSet(set, options);
      const isWarmup = set.tipo === 'calentamiento';
      const weight = Number(set.peso) || 0;
      const reps = Number(set.reps) || 0;
      const tonnage = weight * reps;

      const exercise = exerciseMap instanceof Map ? exerciseMap.get(set.exerciseId) : exerciseMap[set.exerciseId];
      if (!exercise) continue;

      const prim = exercise.grupoPrimario;
      const secs = exercise.musculosSecundarios || [];

      // Si es efectiva, suma al volumen
      if (isEffective) {
        if (prim && muscles[prim]) {
          muscles[prim].sets += 1;
          muscles[prim].primarySets += 1;
          muscles[prim].lastTrained = session.fecha || new Date(session.inicio).toISOString();
        }
        for (const sec of secs) {
          if (muscles[sec]) {
            muscles[sec].sets += secondaryFactor;
            muscles[sec].secondarySets += 1;
            muscles[sec].lastTrained = session.fecha || new Date(session.inicio).toISOString();
          }
        }
        totalSets += 1;
      }

      // Tonelaje (excluyendo calentamiento por defecto)
      if (!isWarmup) {
        if (prim && muscles[prim]) {
          muscles[prim].tonnage += tonnage;
        }
        totalTonnage += tonnage;
      }
    }
  }

  // Redondear y calcular estado frente al rango objetivo (10 - 20 series)
  for (const group of DEFAULT_MUSCLE_GROUPS) {
    const m = muscles[group];
    m.sets = Math.round(m.sets * 10) / 10;
    m.tonnage = Math.round(m.tonnage);

    if (m.sets < targetRange.min) {
      m.status = 'below'; // Por debajo (amarillo/naranja suave)
    } else if (m.sets <= targetRange.max) {
      m.status = 'optimal'; // En rango óptimo (verde)
    } else {
      m.status = 'above'; // Por encima del rango (rojo/púrpura fatiga)
    }
  }

  return {
    totalSets,
    totalTonnage,
    muscles
  };
}
