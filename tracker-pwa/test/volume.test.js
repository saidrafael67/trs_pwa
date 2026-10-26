import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getMondayOfWeek,
  isEffectiveSet,
  calculateSessionTonnage,
  calculateWeeklyMuscleVolume
} from '../js/modules/volume.js';

describe('Cálculo de volumen y tonelaje', () => {
  it('Identifica series efectivas respetando RIR <= 3 y descartando calentamiento', () => {
    assert.strictEqual(isEffectiveSet({ tipo: 'calentamiento', peso: 50, reps: 10 }), false);
    assert.strictEqual(isEffectiveSet({ tipo: 'efectiva', peso: 100, reps: 8, rir: 2 }), true);
    assert.strictEqual(isEffectiveSet({ tipo: 'efectiva', peso: 100, reps: 8, rir: 4 }), false); // RIR 4 > 3
  });

  it('Calcula el tonelaje de sesión excluyendo calentamientos', () => {
    const session = {
      sets: [
        { tipo: 'calentamiento', peso: 50, reps: 10 }, // 500 (ignorado)
        { tipo: 'efectiva', peso: 100, reps: 8 },      // 800
        { tipo: 'efectiva', peso: 100, reps: 8 }       // 800
      ]
    };
    const tonnage = calculateSessionTonnage(session, true);
    assert.strictEqual(tonnage, 1600);
  });

  it('Pondera músculos primarios como 1 y secundarios como 0.5', () => {
    const monday = getMondayOfWeek(new Date());
    const sessionDate = new Date(monday);
    sessionDate.setHours(10, 0, 0, 0);

    const exerciseMap = {
      'bench-press': {
        id: 'bench-press',
        nombre: 'Press banca',
        grupoPrimario: 'pecho',
        musculosSecundarios: ['tríceps', 'hombros']
      }
    };

    const sessions = [
      {
        fecha: sessionDate.toISOString(),
        sets: [
          { exerciseId: 'bench-press', tipo: 'efectiva', peso: 100, reps: 10, rir: 2 },
          { exerciseId: 'bench-press', tipo: 'efectiva', peso: 100, reps: 10, rir: 2 }
        ]
      }
    ];

    const vol = calculateWeeklyMuscleVolume(sessions, exerciseMap, {
      weekStart: monday,
      targetRange: { min: 10, max: 20 },
      secondaryFactor: 0.5
    });

    assert.strictEqual(vol.muscles.pecho.sets, 2); // 2 x 1.0 = 2 series
    assert.strictEqual(vol.muscles.tríceps.sets, 1); // 2 x 0.5 = 1 serie
    assert.strictEqual(vol.muscles.hombros.sets, 1); // 2 x 0.5 = 1 serie
    assert.strictEqual(vol.muscles.pecho.status, 'below'); // 2 series < min 10
  });

  it('Clasifica el estado muscular: below (<10), optimal (10-20), above (>20)', () => {
    const monday = getMondayOfWeek(new Date());
    const sessionDate = new Date(monday);

    const exerciseMap = {
      squat: { id: 'squat', grupoPrimario: 'cuádriceps', musculosSecundarios: [] }
    };

    // Crear 12 series efectivas para cuádriceps
    const sets = Array.from({ length: 12 }, () => ({
      exerciseId: 'squat',
      tipo: 'efectiva',
      peso: 100,
      reps: 5,
      rir: 2
    }));

    const vol = calculateWeeklyMuscleVolume([{ fecha: sessionDate.toISOString(), sets }], exerciseMap, {
      weekStart: monday,
      targetRange: { min: 10, max: 20 }
    });

    assert.strictEqual(vol.muscles.cuádriceps.sets, 12);
    assert.strictEqual(vol.muscles.cuádriceps.status, 'optimal');
  });
});
