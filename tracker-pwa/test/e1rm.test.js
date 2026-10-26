import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateE1RM, getBestE1RMFromSets } from '../js/modules/e1rm.js';

describe('Cálculo de e1RM', () => {
  it('1 repetición equivale exactamente al peso levantado', () => {
    const res = calculateE1RM(100, 1, 'epley');
    assert.strictEqual(res.e1rm, 100);
    assert.strictEqual(res.reliable, true);
  });

  it('Fórmula Epley calcula 100kg x 10 reps = 133.3 kg', () => {
    // 100 * (1 + 10/30) = 133.333
    const res = calculateE1RM(100, 10, 'epley');
    assert.strictEqual(res.e1rm, 133.3);
    assert.strictEqual(res.reliable, true);
  });

  it('Fórmula Brzycki calcula 100kg x 10 reps = 133.3 kg', () => {
    // 100 * 36 / (37 - 10) = 3600 / 27 = 133.333
    const res = calculateE1RM(100, 10, 'brzycki');
    assert.strictEqual(res.e1rm, 133.3);
    assert.strictEqual(res.reliable, true);
  });

  it('Marca como no fiable si reps > 12', () => {
    const res = calculateE1RM(80, 15, 'epley');
    assert.strictEqual(res.reliable, false);
    assert.ok(res.warning);
  });

  it('Calcula el mejor e1RM excluyendo calentamientos y series > 12 reps', () => {
    const sets = [
      { peso: 60, reps: 10, tipo: 'calentamiento' },
      { peso: 100, reps: 5, tipo: 'efectiva' }, // 100 * (1 + 5/30) = 116.7
      { peso: 105, reps: 5, tipo: 'efectiva' }, // 105 * (1 + 5/30) = 122.5
      { peso: 70, reps: 20, tipo: 'efectiva' }   // reps > 12, se excluye
    ];
    const { bestE1rm } = getBestE1RMFromSets(sets, 'epley');
    assert.strictEqual(bestE1rm, 122.5);
  });
});
