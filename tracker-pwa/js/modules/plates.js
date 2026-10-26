// Módulo puro de calculadora de discos para barra olímpica o estándar
// Algoritmo voraz (greedy) con cálculo de peso alcanzable y metadatos visuales

export const DEFAULT_PLATE_INVENTORY = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5];

export const PLATE_COLOR_MAP = {
  25: { color: '#e53935', textColor: '#ffffff', label: '25', heightRatio: 1.0 },
  20: { color: '#1e88e5', textColor: '#ffffff', label: '20', heightRatio: 0.95 },
  15: { color: '#fbc02d', textColor: '#1a1a1a', label: '15', heightRatio: 0.85 },
  10: { color: '#43a047', textColor: '#ffffff', label: '10', heightRatio: 0.75 },
  5: { color: '#f5f5f5', textColor: '#1a1a1a', label: '5', heightRatio: 0.60 },
  2.5: { color: '#37474f', textColor: '#ffffff', label: '2.5', heightRatio: 0.50 },
  1.25: { color: '#90a4ae', textColor: '#1a1a1a', label: '1.25', heightRatio: 0.42 },
  0.5: { color: '#ff9800', textColor: '#ffffff', label: '0.5', heightRatio: 0.35 }
};

/**
 * Calcula los discos necesarios por cada lado de la barra.
 *
 * @param {number} targetWeight - Peso total objetivo
 * @param {number} [barWeight=20] - Peso de la barra vacía
 * @param {number[]} [availablePlates=DEFAULT_PLATE_INVENTORY] - Discos disponibles ordenados o desordenados
 * @param {Record<number, number>} [plateCounts] - Opcional: cantidad máxima disponible de pares de cada disco
 * @returns {{
 *   platesPerSide: number[],
 *   totalAchieved: number,
 *   targetWeight: number,
 *   barWeight: number,
 *   difference: number,
 *   exact: boolean,
 *   platesWithMeta: Array<{ weight: number, count: number, color: string, textColor: string, heightRatio: number }>
 * }}
 */
export function calculatePlates(
  targetWeight,
  barWeight = 20,
  availablePlates = DEFAULT_PLATE_INVENTORY,
  plateCounts = null
) {
  const target = Number(targetWeight);
  const bar = Number(barWeight);

  if (isNaN(target) || target <= bar) {
    return {
      platesPerSide: [],
      totalAchieved: bar,
      targetWeight: target,
      barWeight: bar,
      difference: target > 0 ? Math.round((bar - target) * 100) / 100 : 0,
      exact: target === bar,
      platesWithMeta: []
    };
  }

  // Ordenar discos de mayor a menor
  const sortedPlates = [...availablePlates].sort((a, b) => b - a);

  let remainingPerSide = (target - bar) / 2;
  const platesPerSide = [];
  const plateCountMap = {};

  // Copia de inventario si se proporcionó conteo
  const inventory = plateCounts ? { ...plateCounts } : null;

  for (const plate of sortedPlates) {
    if (plate <= 0) continue;

    // Redondear para evitar errores de coma flotante (ej. 0.1 + 0.2)
    const roundedRem = Math.round(remainingPerSide * 1000) / 1000;
    const canFit = Math.floor(roundedRem / plate);

    if (canFit > 0) {
      let toAdd = canFit;
      if (inventory && inventory[plate] !== undefined) {
        toAdd = Math.min(canFit, inventory[plate]);
      }

      for (let i = 0; i < toAdd; i++) {
        platesPerSide.push(plate);
      }

      plateCountMap[plate] = (plateCountMap[plate] || 0) + toAdd;
      remainingPerSide -= toAdd * plate;
    }
  }

  const weightPerSide = platesPerSide.reduce((sum, p) => sum + p, 0);
  const totalAchieved = Math.round((bar + weightPerSide * 2) * 100) / 100;
  const difference = Math.round((target - totalAchieved) * 100) / 100;
  const exact = Math.abs(difference) < 0.001;

  // Enriquecer con metadatos para UI y renderizado visual
  const platesWithMeta = Object.entries(plateCountMap)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([pStr, count]) => {
      const p = Number(pStr);
      const meta = PLATE_COLOR_MAP[p] || {
        color: '#78909c',
        textColor: '#ffffff',
        label: String(p),
        heightRatio: 0.5
      };
      return {
        weight: p,
        count,
        color: meta.color,
        textColor: meta.textColor,
        heightRatio: meta.heightRatio
      };
    });

  return {
    platesPerSide,
    totalAchieved,
    targetWeight: target,
    barWeight: bar,
    difference,
    exact,
    platesWithMeta
  };
}
