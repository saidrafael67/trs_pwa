import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getProgressionAdvice } from '../js/modules/progression.js';

describe('Sugerencias de progresión (Doble Progresión)', () => {
  it('Sugiere subir peso cuando se alcanza el tope de reps con RIR >= objetivo', () => {
    const sets = [
      { peso: 80, reps: 10, tipo: 'efectiva', rir: 2 },
      { peso: 80, reps: 10, tipo: 'efectiva', rir: 2 },
      { peso: 80, reps: 10, tipo: 'efectiva', rir: 2 }
    ];
    const res = getProgressionAdvice(sets, { min: 8, max: 10 }, 2, { increment: 2.5, unit: 'kg' });
    assert.strictEqual(res.action, 'increase_weight');
    assert.strictEqual(res.recommendedWeight, 82.5);
    assert.strictEqual(res.suggestedChange, 2.5);
    assert.match(res.message, /Sube \+2\.5 kg/);
  });

  it('Sugiere mantener peso y buscar repeticiones si no se llegó al tope del rango', () => {
    const sets = [
      { peso: 80, reps: 10, tipo: 'efectiva', rir: 2 },
      { peso: 80, reps: 9, tipo: 'efectiva', rir: 1 },
      { peso: 80, reps: 8, tipo: 'efectiva', rir: 1 }
    ];
    const res = getProgressionAdvice(sets, { min: 8, max: 10 }, 2, { increment: 2.5, unit: 'kg' });
    assert.strictEqual(res.action, 'add_reps');
    assert.strictEqual(res.recommendedWeight, 80);
    assert.match(res.message, /busca sumar repeticiones/);
  });

  it('Sugiere consolidar o descargar si cayó por debajo del mínimo de reps', () => {
    const sets = [
      { peso: 80, reps: 8, tipo: 'efectiva', rir: 1 },
      { peso: 80, reps: 6, tipo: 'efectiva', rir: 0 }, // cayó a 6 cuando el min es 8
      { peso: 80, reps: 5, tipo: 'efectiva', rir: 0 }
    ];
    const res = getProgressionAdvice(sets, { min: 8, max: 10 }, 2, { increment: 2.5, unit: 'kg' });
    assert.strictEqual(res.action, 'deload_or_consolidate');
    assert.match(res.message, /por debajo del mínimo/);
  });

  it('Utiliza el incremento configurable de tren inferior (ej. 5 kg) si se indica', () => {
    const sets = [
      { peso: 100, reps: 8, tipo: 'efectiva', rir: 2 },
      { peso: 100, reps: 8, tipo: 'efectiva', rir: 2 }
    ];
    const res = getProgressionAdvice(sets, { min: 6, max: 8 }, 2, {
      isLowerBody: true,
      lowerBodyIncrement: 5,
      unit: 'kg'
    });
    assert.strictEqual(res.action, 'increase_weight');
    assert.strictEqual(res.recommendedWeight, 105);
    assert.strictEqual(res.suggestedChange, 5);
  });
});
