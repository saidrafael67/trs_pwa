// Módulo puro de cálculo de 1RM estimado (e1RM)
// Soporta fórmulas Epley y Brzycki con validación de repeticiones (óptimo para reps <= 12)

/**
 * Calcula el 1RM estimado (e1RM).
 * 
 * Fórmulas:
 * - Epley: peso * (1 + reps / 30)
 * - Brzycki: peso * 36 / (37 - reps)
 * 
 * Limitación fisiológica:
 * Por encima de 12 repeticiones, las ecuaciones basadas en cargas submáximas
 * pierden precisión debido a la componente de resistencia muscular anaeróbica láctica.
 * Por ello, si reps > 12, se marca `reliable: false` o se desaconseja su uso para toma de decisiones.
 *
 * @param {number} weight - Peso levantado (kg o lb)
 * @param {number} reps - Repeticiones válidas realizadas
 * @param {'epley'|'brzycki'} [formula='epley'] - Fórmula a emplear
 * @returns {{ e1rm: number, reliable: boolean, formula: string, warning?: string }}
 */
export function calculateE1RM(weight, reps, formula = 'epley') {
  const w = Number(weight);
  const r = Number(reps);

  if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) {
    return { e1rm: 0, reliable: false, formula, warning: 'Peso o repeticiones no válidas' };
  }

  // 1 repetición es directamente el 1RM real
  if (r === 1) {
    return { e1rm: Math.round(w * 10) / 10, reliable: true, formula };
  }

  const reliable = r <= 12;
  const warning = !reliable ? 'Cálculo de e1RM poco fiable para series de más de 12 repeticiones' : undefined;

  let rawE1RM = 0;
  if (formula === 'brzycki') {
    if (r >= 37) {
      rawE1RM = w; // evitar división por cero o negativo
    } else {
      rawE1RM = (w * 36) / (37 - r);
    }
  } else {
    // Epley por defecto
    rawE1RM = w * (1 + r / 30);
  }

  return {
    e1rm: Math.round(rawE1RM * 10) / 10,
    reliable,
    formula,
    warning
  };
}

/**
 * Obtiene el mejor e1RM de un conjunto de series efectivas de un ejercicio
 * @param {Array<{ peso: number, reps: number, tipo: string }>} sets 
 * @param {'epley'|'brzycki'} [formula='epley']
 * @returns {{ bestE1rm: number, bestSet: object | null }}
 */
export function getBestE1RMFromSets(sets, formula = 'epley') {
  if (!Array.isArray(sets) || sets.length === 0) {
    return { bestE1rm: 0, bestSet: null };
  }

  let best = 0;
  let bestSet = null;

  for (const s of sets) {
    // Solo series efectivas (o dropset / myoreps), ignorar calentamientos
    if (s.tipo === 'calentamiento') continue;
    if (s.reps > 12) continue; // no considerar para récord de e1RM fiable

    const { e1rm } = calculateE1RM(s.peso, s.reps, formula);
    if (e1rm > best) {
      best = e1rm;
      bestSet = s;
    }
  }

  return { bestE1rm: best, bestSet };
}
