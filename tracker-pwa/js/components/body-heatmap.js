// Componente: Mapa de calor corporal en SVG interactivo (Vista Frontal y Posterior)
import { calculateWeeklyMuscleVolume, getMondayOfWeek } from '../modules/volume.js';
import { formatDateSpanish, triggerHaptic } from '../utils.js';
import { state } from '../state.js';

/**
 * Genera el color según el volumen de series efectivas en los últimos 7 días
 * @param {number} sets 
 * @param {number} min 
 * @param {number} max 
 * @returns {string} Color hex
 */
function getMuscleHeatmapColor(sets, min = 10, max = 20) {
  if (!sets || sets <= 0) return '#1e2638'; // Inactivo / Sin entrenar
  if (sets < 5) return '#ffb300'; // Volumen bajo (ámbar)
  if (sets < min) return '#c6ff00'; // Moderado (lima claro)
  if (sets <= max) return '#00e676'; // Rango hipertrofia óptimo (verde neón)
  return '#ff5252'; // Alto volumen / sobrecarga extrema (rojo)
}

/**
 * Renderiza el mapa de calor corporal con figura frontal y posterior
 * @param {HTMLElement} container 
 * @param {'sets'|'tonnage'} [metricMode='sets']
 */
export function renderBodyHeatmap(container, metricMode = 'sets') {
  if (!container) return;

  // Mapa de ejercicios por id
  const exerciseMap = new Map();
  for (const ex of state.exercises) {
    exerciseMap.set(ex.id, ex);
  }

  // Calcular volumen de los últimos 7 días
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const volData = calculateWeeklyMuscleVolume(state.sessions, exerciseMap, {
    weekStart: sevenDaysAgo,
    secondaryFactor: state.settings.secondaryFactor || 0.5,
    targetRange: {
      min: state.settings.weeklyTargetMin || 10,
      max: state.settings.weeklyTargetMax || 20
    }
  });

  const m = volData.muscles;
  const targetMin = state.settings.weeklyTargetMin || 10;
  const targetMax = state.settings.weeklyTargetMax || 20;

  // Obtener colores por grupo
  const cPecho = getMuscleHeatmapColor(m.pecho.sets, targetMin, targetMax);
  const cEspalda = getMuscleHeatmapColor(m.espalda.sets, targetMin, targetMax);
  const cHombros = getMuscleHeatmapColor(m.hombros.sets, targetMin, targetMax);
  const cBiceps = getMuscleHeatmapColor(m.bíceps.sets, targetMin, targetMax);
  const cTriceps = getMuscleHeatmapColor(m.tríceps.sets, targetMin, targetMax);
  const cCuads = getMuscleHeatmapColor(m.cuádriceps.sets, targetMin, targetMax);
  const cIsquios = getMuscleHeatmapColor(m.isquios.sets, targetMin, targetMax);
  const cGluteos = getMuscleHeatmapColor(m.glúteos.sets, targetMin, targetMax);
  const cGemelos = getMuscleHeatmapColor(m.pantorrillas.sets, targetMin, targetMax);
  const cAbdomen = getMuscleHeatmapColor(m.abdomen.sets, targetMin, targetMax);
  const cAntebrazos = getMuscleHeatmapColor(m.antebrazos.sets, targetMin, targetMax);
  const cTrapecio = getMuscleHeatmapColor(m.trapecio.sets, targetMin, targetMax);

  container.innerHTML = `
    <div class="heatmap-container">
      <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 0.95rem; font-weight: 800;">Mapa Anatómico (Últimos 7 días)</span>
        <span style="font-size: 0.75rem; color: var(--accent-primary); font-weight: 700;">Toca un músculo</span>
      </div>

      <div class="heatmap-svg-wrapper">
        <!-- VISTA FRONTAL -->
        <svg class="heatmap-figure" viewBox="0 0 160 360" xmlns="http://www.w3.org/2000/svg">
          <text x="80" y="22" text-anchor="middle" fill="#64748b" font-size="11" font-weight="700">FRONTAL</text>
          
          <!-- Cabeza silueta -->
          <ellipse cx="80" cy="46" rx="15" ry="19" fill="#2d3748" />
          <rect x="74" y="63" width="12" height="12" fill="#2d3748" />

          <!-- Hombros (Deltoides anterior/lateral) -->
          <path id="front-hombro-izq" class="heatmap-muscle-path" data-muscle="hombros" d="M 52,76 C 45,78 40,88 42,98 C 45,102 52,100 56,92 C 58,86 58,80 52,76 Z" fill="${cHombros}" />
          <path id="front-hombro-der" class="heatmap-muscle-path" data-muscle="hombros" d="M 108,76 C 115,78 120,88 118,98 C 115,102 108,100 104,92 C 102,86 102,80 108,76 Z" fill="${cHombros}" />

          <!-- Trapecio frontal superior -->
          <path id="front-trapecio" class="heatmap-muscle-path" data-muscle="trapecio" d="M 66,74 L 74,68 L 86,68 L 94,74 L 88,78 L 72,78 Z" fill="${cTrapecio}" />

          <!-- Pectoral (Pecho) -->
          <path id="front-pecho-izq" class="heatmap-muscle-path" data-muscle="pecho" d="M 58,80 L 78,80 L 78,105 C 72,108 58,104 56,94 Z" fill="${cPecho}" />
          <path id="front-pecho-der" class="heatmap-muscle-path" data-muscle="pecho" d="M 102,80 L 82,80 L 82,105 C 88,108 102,104 104,94 Z" fill="${cPecho}" />

          <!-- Bíceps -->
          <path id="front-biceps-izq" class="heatmap-muscle-path" data-muscle="bíceps" d="M 40,102 C 37,112 38,124 43,130 C 47,130 51,124 50,112 C 49,104 45,100 40,102 Z" fill="${cBiceps}" />
          <path id="front-biceps-der" class="heatmap-muscle-path" data-muscle="bíceps" d="M 120,102 C 123,112 122,124 117,130 C 113,130 109,124 110,112 C 111,104 115,100 120,102 Z" fill="${cBiceps}" />

          <!-- Antebrazos -->
          <path id="front-antebrazo-izq" class="heatmap-muscle-path" data-muscle="antebrazos" d="M 37,134 C 32,145 28,160 32,175 C 35,176 39,173 42,160 C 44,148 43,138 37,134 Z" fill="${cAntebrazos}" />
          <path id="front-antebrazo-der" class="heatmap-muscle-path" data-muscle="antebrazos" d="M 123,134 C 128,145 132,160 128,175 C 125,176 121,173 118,160 C 116,148 117,138 123,134 Z" fill="${cAntebrazos}" />

          <!-- Abdomen (Recto abdominal y oblicuos) -->
          <path id="front-abdomen" class="heatmap-muscle-path" data-muscle="abdomen" d="M 62,110 L 98,110 L 96,155 L 80,165 L 64,155 Z" fill="${cAbdomen}" />

          <!-- Cuádriceps -->
          <path id="front-cuad-izq" class="heatmap-muscle-path" data-muscle="cuádriceps" d="M 58,168 C 54,180 52,215 56,242 C 63,245 74,242 75,225 C 76,200 76,175 68,168 Z" fill="${cCuads}" />
          <path id="front-cuad-der" class="heatmap-muscle-path" data-muscle="cuádriceps" d="M 102,168 C 106,180 108,215 104,242 C 97,245 86,242 85,225 C 84,200 84,175 92,168 Z" fill="${cCuads}" />

          <!-- Pantorrillas / Tibial anterior -->
          <path id="front-pantorrilla-izq" class="heatmap-muscle-path" data-muscle="pantorrillas" d="M 57,255 C 53,270 55,305 60,325 C 64,325 68,318 69,300 C 70,280 68,260 62,255 Z" fill="${cGemelos}" />
          <path id="front-pantorrilla-der" class="heatmap-muscle-path" data-muscle="pantorrillas" d="M 103,255 C 107,270 105,305 100,325 C 96,325 92,318 91,300 C 90,280 92,260 98,255 Z" fill="${cGemelos}" />
        </svg>

        <!-- VISTA DORSAL / POSTERIOR -->
        <svg class="heatmap-figure" viewBox="0 0 160 360" xmlns="http://www.w3.org/2000/svg">
          <text x="80" y="22" text-anchor="middle" fill="#64748b" font-size="11" font-weight="700">DORSAL</text>
          
          <!-- Cabeza silueta -->
          <ellipse cx="80" cy="46" rx="15" ry="19" fill="#2d3748" />
          <rect x="74" y="63" width="12" height="12" fill="#2d3748" />

          <!-- Trapecio dorsal (cuello a mitad de espalda en rombo) -->
          <path id="back-trapecio" class="heatmap-muscle-path" data-muscle="trapecio" d="M 74,68 L 86,68 L 98,78 L 80,118 L 62,78 Z" fill="${cTrapecio}" />

          <!-- Hombros posteriores (deltoides posterior) -->
          <path id="back-hombro-izq" class="heatmap-muscle-path" data-muscle="hombros" d="M 52,76 C 44,79 38,88 40,98 C 45,102 52,98 56,90 Z" fill="${cHombros}" />
          <path id="back-hombro-der" class="heatmap-muscle-path" data-muscle="hombros" d="M 108,76 C 116,79 122,88 120,98 C 115,102 108,98 104,90 Z" fill="${cHombros}" />

          <!-- Tríceps -->
          <path id="back-triceps-izq" class="heatmap-muscle-path" data-muscle="tríceps" d="M 38,100 C 35,112 37,126 42,132 C 47,132 50,124 48,110 Z" fill="${cTriceps}" />
          <path id="back-triceps-der" class="heatmap-muscle-path" data-muscle="tríceps" d="M 122,100 C 125,112 123,126 118,132 C 113,132 110,124 112,110 Z" fill="${cTriceps}" />

          <!-- Espalda (Dorsal ancho y erectores espinales) -->
          <path id="back-espalda-izq" class="heatmap-muscle-path" data-muscle="espalda" d="M 60,88 C 56,105 56,128 66,155 L 78,155 L 78,118 Z" fill="${cEspalda}" />
          <path id="back-espalda-der" class="heatmap-muscle-path" data-muscle="espalda" d="M 100,88 C 104,105 104,128 94,155 L 82,155 L 82,118 Z" fill="${cEspalda}" />

          <!-- Glúteos -->
          <path id="back-gluteo-izq" class="heatmap-muscle-path" data-muscle="glúteos" d="M 60,158 C 55,168 56,192 65,200 C 74,204 78,195 78,162 Z" fill="${cGluteos}" />
          <path id="back-gluteo-der" class="heatmap-muscle-path" data-muscle="glúteos" d="M 100,158 C 105,168 104,192 95,200 C 86,204 82,195 82,162 Z" fill="${cGluteos}" />

          <!-- Isquiotibiales (Femoral posterior) -->
          <path id="back-isquios-izq" class="heatmap-muscle-path" data-muscle="isquios" d="M 60,204 C 56,218 55,236 58,252 C 66,252 74,248 76,228 C 77,215 76,204 68,204 Z" fill="${cIsquios}" />
          <path id="back-isquios-der" class="heatmap-muscle-path" data-muscle="isquios" d="M 100,204 C 104,218 105,236 102,252 C 94,252 86,248 84,228 C 83,215 84,204 92,204 Z" fill="${cIsquios}" />

          <!-- Pantorrillas (Gemelos / Sóleo) -->
          <path id="back-gemelos-izq" class="heatmap-muscle-path" data-muscle="pantorrillas" d="M 56,260 C 50,274 52,305 58,326 C 64,326 69,318 70,296 C 71,278 68,260 62,260 Z" fill="${cGemelos}" />
          <path id="back-gemelos-der" class="heatmap-muscle-path" data-muscle="pantorrillas" d="M 104,260 C 110,274 108,305 102,326 C 96,326 91,318 90,296 C 89,278 92,260 98,260 Z" fill="${cGemelos}" />
        </svg>
      </div>

      <!-- Leyenda y escala de color -->
      <div class="heatmap-legend">
        <span>0</span>
        <div class="heatmap-legend-gradient"></div>
        <span>20+ series</span>
      </div>

      <!-- Detalle emergente del músculo tocado -->
      <div id="heatmap-detail-card" style="width: 100%; margin-top: 14px; display: none;"></div>
    </div>
  `;

  const detailCard = container.querySelector('#heatmap-detail-card');

  // Interacción táctil en los músculos
  container.querySelectorAll('.heatmap-muscle-path').forEach((path) => {
    path.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerHaptic('light');

      const muscleName = path.getAttribute('data-muscle');
      const data = m[muscleName];
      if (!data) return;

      const capitalized = muscleName.charAt(0).toUpperCase() + muscleName.slice(1);
      const statusMap = {
        below: { label: 'Por debajo del objetivo (<10)', color: '#ffb300' },
        optimal: { label: 'En rango óptimo hipertrofia (10-20)', color: '#00e676' },
        above: { label: 'Por encima del rango (>20)', color: '#ff5252' }
      };
      const statusInfo = statusMap[data.status] || statusMap.below;

      const lastDate = data.lastTrained ? formatDateSpanish(data.lastTrained) : 'Sin registro reciente';

      detailCard.style.display = 'block';
      detailCard.innerHTML = `
        <div style="background-color: var(--bg-surface-2); border-left: 4px solid ${statusInfo.color}; border-radius: var(--radius-sm); padding: 12px 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-size: 1.05rem; color: #fff;">${capitalized}</strong>
            <span style="font-size: 0.75rem; font-weight: 800; color: ${statusInfo.color};">${statusInfo.label}</span>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
            <div>Series efectivas: <strong>${data.sets}</strong> (Primarias: ${data.primarySets}, Secundarias: ${data.secondarySets})</div>
            <div>Tonelaje total: <strong>${data.tonnage.toLocaleString()} ${state.settings.unit}</strong></div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">Última vez: ${lastDate}</div>
          </div>
        </div>
      `;
    });
  });
}
