// Módulo puro de sugerencias de sobrecarga progresiva (Doble Progresión)

/**
 * Analiza las series efectivas de la última sesión para un ejercicio y genera una
 * recomendación clara de sobrecarga progresiva en lenguaje natural.
 *
 * @param {Array<{ peso: number, reps: number, tipo: string, rir?: number, rpe?: number }>} sets 
 * @param {{ min: number, max: number }} repsRange - Rango objetivo (ej. { min: 8, max: 10 })
 * @param {number} [targetRir=2] - RIR objetivo
 * @param {object} [options]
 * @param {number} [options.increment=2.5] - Incremento estándar
 * @param {boolean} [options.isLowerBody=false] - Si es tren inferior (permite incrementos mayores)
 * @param {'kg'|'lb'} [options.unit='kg'] - Unidad de peso
 * @returns {{
 *   action: 'increase_weight' | 'add_reps' | 'maintain' | 'deload_or_consolidate' | 'init',
 *   recommendedWeight: number,
 *   suggestedChange: number,
 *   message: string,
 *   summary: string
 * }}
 */
export function getProgressionAdvice(
  sets,
  repsRange = { min: 8, max: 10 },
  targetRir = 2,
  options = {}
) {
  const minReps = Number(repsRange.min) || 8;
  const maxReps = Number(repsRange.max) || 10;
  const unit = options.unit || 'kg';
  const defaultIncrement = options.isLowerBody ? (options.lowerBodyIncrement || 5) : (options.increment || 2.5);

  // Filtrar solo series efectivas (excluyendo calentamiento)
  const effectiveSets = (sets || []).filter(s => s.tipo !== 'calentamiento');

  if (effectiveSets.length === 0) {
    return {
      action: 'init',
      recommendedWeight: 0,
      suggestedChange: 0,
      message: `Objetivo: ${minReps}-${maxReps} reps con RIR ${targetRir}. Elige un peso cómodo que te permita cumplir el rango.`,
      summary: 'Sin series previas'
    };
  }

  // Peso de referencia (última serie o promedio si varió)
  const baseWeight = effectiveSets[effectiveSets.length - 1].peso || 0;
  const totalSets = effectiveSets.length;

  // Resumen tipo "3x10 a 80kg"
  const repsArray = effectiveSets.map(s => s.reps);
  const minRepsDone = Math.min(...repsArray);
  const maxRepsDone = Math.max(...repsArray);
  const allReachedTop = effectiveSets.every(s => s.reps >= maxReps);
  const allAboveMin = effectiveSets.every(s => s.reps >= minReps);

  // Evaluar RIR si está disponible
  const rirValues = effectiveSets.filter(s => s.rir !== undefined && s.rir !== null).map(s => Number(s.rir));
  const minRir = rirValues.length > 0 ? Math.min(...rirValues) : null;
  const rirConditionMet = minRir === null || minRir >= targetRir;

  const setsSummary = `${totalSets} series (${repsArray.join(', ')} reps) con ${baseWeight} ${unit}`;

  // Caso 1: Todas las series alcanzaron el tope del rango con RIR adecuado
  if (allReachedTop && rirConditionMet) {
    const nextWeight = Math.round((baseWeight + defaultIncrement) * 10) / 10;
    const rirText = minRir !== null ? ` con RIR ${minRir}` : '';
    return {
      action: 'increase_weight',
      recommendedWeight: nextWeight,
      suggestedChange: defaultIncrement,
      message: `¡Gran trabajo! Completaste ${totalSets}x${maxReps}${rirText}. Sube +${defaultIncrement} ${unit} a ${nextWeight} ${unit} en la siguiente sesión.`,
      summary: setsSummary
    };
  }

  // Caso 2: Cayeron por debajo del mínimo del rango
  if (!allAboveMin) {
    // Sugerir mantener para consolidar o reducir ~5% si hay fatiga
    const deloadStep = Math.round((baseWeight * 0.05) / 2.5) * 2.5 || defaultIncrement;
    const deloadWeight = Math.max(0, Math.round((baseWeight - deloadStep) * 10) / 10);
    return {
      action: 'deload_or_consolidate',
      recommendedWeight: baseWeight,
      suggestedChange: -deloadStep,
      message: `Quedaste por debajo del mínimo (${minRepsDone} reps < ${minReps}). Mantén ${baseWeight} ${unit} para consolidar la técnica, o reduce a ${deloadWeight} ${unit} si acumulas fatiga.`,
      summary: setsSummary
    };
  }

  // Caso 3: En el rango medio (entre min y max)
  return {
    action: 'add_reps',
    recommendedWeight: baseWeight,
    suggestedChange: 0,
    message: `Estás en rango (${minRepsDone}-${maxRepsDone} reps). Mantén ${baseWeight} ${unit} y busca sumar repeticiones hasta completar todas a ${maxReps}.`,
    summary: setsSummary
  };
}
