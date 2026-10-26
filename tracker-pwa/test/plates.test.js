import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculatePlates } from '../js/modules/plates.js';

describe('Calculadora de discos', () => {
  it('Para 100 kg con barra de 20 kg calcula 40 kg por lado (20+20)', () => {
    const res = calculatePlates(100, 20);
    assert.strictEqual(res.totalAchieved, 100);
    assert.strictEqual(res.exact, true);
    assert.deepStrictEqual(res.platesPerSide, [25, 15]); // o 25 + 15 = 40 kg
    assert.strictEqual(res.difference, 0);
  });

  it('Para 82.5 kg con barra de 20 kg calcula 31.25 kg por lado (25 + 5 + 1.25)', () => {
    // 82.5 - 20 = 62.5 / 2 = 31.25 -> 25 + 5 + 1.25
    const res = calculatePlates(82.5, 20);
    assert.strictEqual(res.totalAchieved, 82.5);
    assert.strictEqual(res.exact, true);
    assert.deepStrictEqual(res.platesPerSide, [25, 5, 1.25]);
  });

  it('Si el peso objetivo es inferior o igual a la barra vacía, no añade discos', () => {
    const res = calculatePlates(20, 20);
    assert.strictEqual(res.totalAchieved, 20);
    assert.strictEqual(res.exact, true);
    assert.deepStrictEqual(res.platesPerSide, []);
  });

  it('Si no es alcanzable exactamente con el inventario, calcula el más cercano inferior y la diferencia', () => {
    // Objetivo 103 kg con discos estándar mínimos de 0.5 kg (incrementos de 1 kg en total)
    // 103 - 20 = 83 / 2 = 41.5 -> 25 + 15 + 1.25 = 41.25 -> total 102.5 kg, dif 0.5 kg
    const res = calculatePlates(103.2, 20);
    assert.strictEqual(res.exact, false);
    assert.ok(res.difference > 0);
    assert.ok(res.totalAchieved <= 103.2);
  });

  it('Respeta el límite de pares del inventario configurado', () => {
    // Si solo tenemos 1 par de discos de 25 kg:
    const res = calculatePlates(120, 20, [25, 20, 15, 10, 5], { 25: 1, 20: 2 });
    // Necesitamos 50 kg por lado. 1x25 + 1x20 + 1x5 = 50 kg por lado
    assert.strictEqual(res.totalAchieved, 120);
    assert.deepStrictEqual(res.platesPerSide, [25, 20, 5]);
  });
});
