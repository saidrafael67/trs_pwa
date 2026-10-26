// Vista: Analítica, Sobrecarga Progresiva, Gráficos SVG y Mapa de Calor
import { state } from '../state.js';
import { calculateWeeklyMuscleVolume, getMondayOfWeek } from '../modules/volume.js';
import { calculateE1RM, getBestE1RMFromSets } from '../modules/e1rm.js';
import { renderBodyHeatmap } from '../components/body-heatmap.js';
import { formatDateSpanish, triggerHaptic } from '../utils.js';

export function renderProgressView(container) {
  const sessions = state.sessions || [];

  // Mapa de ejercicios por id
  const exerciseMap = new Map();
  for (const ex of state.exercises) {
    exerciseMap.set(ex.id, ex);
  }

  // 1. Métricas de resumen general
  const totalSessions = sessions.length;
  const monday = getMondayOfWeek(new Date());

  const currentWeekVolume = calculateWeeklyMuscleVolume(sessions, exerciseMap, {
    weekStart: monday,
    secondaryFactor: state.settings.secondaryFactor || 0.5,
    targetRange: {
      min: state.settings.weeklyTargetMin || 10,
      max: state.settings.weeklyTargetMax || 20
    }
  });

  container.innerHTML = `
    <div style="margin-bottom: 16px;">
      <h2 style="font-size: 1.35rem; font-weight: 900;">Progreso y Analítica</h2>
      <p style="font-size: 0.85rem; color: var(--text-secondary);">Métricas de hipertrofia y sobrecarga progresiva</p>
    </div>

    <!-- Grid de métricas clave -->
    <div class="progress-metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Sesiones totales</div>
        <div class="metric-value">${totalSessions}</div>
        <div class="metric-sub">Histórico acumulado</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Tonelaje semanal</div>
        <div class="metric-value">${currentWeekVolume.totalTonnage.toLocaleString()}</div>
        <div class="metric-sub">${state.settings.unit} en esta semana</div>
      </div>
    </div>

    <!-- Mapa Anatómico de Calor SVG -->
    <div id="progress-heatmap-mount"></div>

    <!-- Panel semanal de series por grupo muscular -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Series Efectivas Semanales</h3>
        <span style="font-size: 0.75rem; color: var(--text-muted);">Meta: ${state.settings.weeklyTargetMin}-${state.settings.weeklyTargetMax} series</span>
      </div>
      <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 14px;">
        Series efectivas (RIR ≤ 3). Músculos secundarios ponderados a 0.5.
      </p>
      <div id="weekly-volume-bars-container"></div>
    </div>

    <!-- Gráfico de tendencia de e1RM por ejercicio -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Tendencia de Fuerza (e1RM)</h3>
      </div>
      <div style="margin-bottom: 12px;">
        <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Seleccionar ejercicio</label>
        <select id="e1rm-exercise-select" class="settings-select" style="width: 100%; margin-top: 4px;"></select>
      </div>
      <div id="e1rm-chart-container" style="min-height: 200px;"></div>
    </div>

    <!-- Gráfico de Tonelaje Semanal SVG -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Tonelaje por Semana</h3>
        <span style="font-size: 0.75rem; color: var(--accent-secondary); font-weight: 700;">Últimas 6 semanas</span>
      </div>
      <div id="weekly-tonnage-chart-container" style="min-height: 180px;"></div>
    </div>
  `;

  // Montar Mapa de calor
  const heatmapMount = container.querySelector('#progress-heatmap-mount');
  renderBodyHeatmap(heatmapMount, 'sets');

  // Renderizar Barras de Volumen
  const barsContainer = container.querySelector('#weekly-volume-bars-container');
  renderVolumeBars(barsContainer, currentWeekVolume);

  // Renderizar Selector y Gráfico de e1RM
  const exSelect = container.querySelector('#e1rm-exercise-select');
  const e1rmChartContainer = container.querySelector('#e1rm-chart-container');
  setupE1RMSelectorAndChart(exSelect, e1rmChartContainer, sessions);

  // Renderizar Gráfico de Tonelaje Semanal
  const tonnageChartContainer = container.querySelector('#weekly-tonnage-chart-container');
  renderTonnageWeeklyChart(tonnageChartContainer, sessions);
}

function renderVolumeBars(container, volumeData) {
  const muscles = volumeData.muscles;
  const targetMin = state.settings.weeklyTargetMin || 10;
  const targetMax = state.settings.weeklyTargetMax || 20;

  const html = Object.entries(muscles).map(([name, data]) => {
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    // Porcentaje de barra escalado a targetMax * 1.3
    const maxBarScale = targetMax * 1.35;
    const pct = Math.min(100, Math.round((data.sets / maxBarScale) * 100));

    const statusClass = `status-${data.status}`;
    const statusText = data.status === 'optimal' ? 'Óptimo' : (data.status === 'below' ? 'Bajo' : 'Exceso');

    return `
      <div class="volume-bar-row">
        <div class="volume-bar-info">
          <span>${capitalized}</span>
          <span style="color: var(--text-secondary); font-size: 0.8rem;">
            <strong>${data.sets}</strong> / ${targetMin}-${targetMax} series (${statusText})
          </span>
        </div>
        <div class="volume-bar-track">
          <!-- Zona óptima marcada -->
          <div class="volume-target-zone" style="left: ${(targetMin / maxBarScale) * 100}%; width: ${((targetMax - targetMin) / maxBarScale) * 100}%;"></div>
          <!-- Relleno de la barra -->
          <div class="volume-bar-fill ${statusClass}" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

function setupE1RMSelectorAndChart(selectEl, chartContainer, sessions) {
  // Encontrar qué ejercicios tienen al menos una serie en el historial
  const exercisesWithSets = new Set();
  for (const sess of sessions) {
    for (const ex of sess.exercises || []) {
      if (ex.sets && ex.sets.some(s => s.peso > 0)) {
        exercisesWithSets.add(ex.exerciseId);
      }
    }
  }

  const availableExs = state.exercises.filter(e => exercisesWithSets.has(e.id));

  if (availableExs.length === 0) {
    selectEl.innerHTML = '<option value="">Sin datos de ejercicios aún</option>';
    chartContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 30px;">Registra ejercicios con peso y reps para visualizar tu curva de fuerza e1RM.</div>';
    return;
  }

  selectEl.innerHTML = availableExs.map(e => `
    <option value="${e.id}">${e.nombre}</option>
  `).join('');

  const renderSelectedChart = () => {
    const selectedId = selectEl.value;
    renderE1RMChart(chartContainer, selectedId, sessions);
  };

  selectEl.addEventListener('change', () => {
    triggerHaptic('light');
    renderSelectedChart();
  });

  renderSelectedChart();
}

function renderE1RMChart(container, exerciseId, sessions) {
  // Filtrar sesiones en orden cronológico que incluyan este ejercicio
  const dataPoints = [];
  const formula = state.settings.e1rmFormula || 'epley';

  const chronological = [...sessions].sort((a, b) => new Date(a.fecha || a.inicio) - new Date(b.fecha || b.inicio));

  for (const sess of chronological) {
    const exEntry = sess.exercises && sess.exercises.find(e => e.exerciseId === exerciseId);
    if (exEntry && exEntry.sets) {
      const { bestE1rm } = getBestE1RMFromSets(exEntry.sets, formula);
      if (bestE1rm > 0) {
        dataPoints.push({
          date: new Date(sess.fecha || sess.inicio),
          e1rm: bestE1rm
        });
      }
    }
  }

  if (dataPoints.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 30px;">No hay series efectivas válidas (≤ 12 reps) para este ejercicio.</div>';
    return;
  }

  // Generar gráfico SVG interactivo propio
  const svgWidth = 320;
  const svgHeight = 160;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const minE1RM = Math.max(0, Math.floor(Math.min(...dataPoints.map(p => p.e1rm)) * 0.9));
  const maxE1RM = Math.ceil(Math.max(...dataPoints.map(p => p.e1rm)) * 1.1) || 100;

  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const getX = (idx) => padLeft + (dataPoints.length > 1 ? (idx / (dataPoints.length - 1)) * plotW : plotW / 2);
  const getY = (val) => padTop + plotH - ((val - minE1RM) / (maxE1RM - minE1RM)) * plotH;

  const points = dataPoints.map((p, i) => `${getX(i)},${getY(p.e1rm)}`).join(' ');

  // Área con gradiente debajo de la línea
  const areaPoints = `${getX(0)},${padTop + plotH} ${points} ${getX(dataPoints.length - 1)},${padTop + plotH}`;

  const circlesSvg = dataPoints.map((p, i) => `
    <circle cx="${getX(i)}" cy="${getY(p.e1rm)}" r="4.5" fill="var(--accent-primary)" stroke="#0a0c10" stroke-width="2"/>
    <text x="${getX(i)}" y="${getY(p.e1rm) - 8}" text-anchor="middle" fill="#fff" font-size="9" font-weight="800">${p.e1rm}</text>
  `).join('');

  container.innerHTML = `
    <div style="width: 100%; overflow-x: auto;">
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: auto; min-width: 280px;">
        <defs>
          <linearGradient id="e1rm-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#00e676" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#00e676" stop-opacity="0.0"/>
          </linearGradient>
        </defs>

        <!-- Ejes guía horizontales -->
        <line x1="${padLeft}" y1="${padTop}" x2="${svgWidth - padRight}" y2="${padTop}" stroke="#2a3040" stroke-dasharray="3"/>
        <line x1="${padLeft}" y1="${padTop + plotH / 2}" x2="${svgWidth - padRight}" y2="${padTop + plotH / 2}" stroke="#2a3040" stroke-dasharray="3"/>
        <line x1="${padLeft}" y1="${padTop + plotH}" x2="${svgWidth - padRight}" y2="${padTop + plotH}" stroke="#2a3040"/>

        <text x="${padLeft - 6}" y="${padTop + 4}" text-anchor="end" fill="#64748b" font-size="9">${maxE1RM}</text>
        <text x="${padLeft - 6}" y="${padTop + plotH + 4}" text-anchor="end" fill="#64748b" font-size="9">${minE1RM}</text>

        <!-- Área y línea -->
        <polygon points="${areaPoints}" fill="url(#e1rm-grad)" />
        <polyline points="${points}" fill="none" stroke="var(--accent-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

        <!-- Puntos y valores -->
        ${circlesSvg}
      </svg>
    </div>
    <div style="font-size: 0.72rem; color: var(--text-muted); text-align: center; margin-top: 6px;">
      e1RM calculado con fórmula ${formula.toUpperCase()} (series efectivas ≤ 12 reps)
    </div>
  `;
}

function renderTonnageWeeklyChart(container, sessions) {
  // Agrupar tonelaje de las últimas 6 semanas
  const weeks = [];
  const currentMonday = getMondayOfWeek(new Date());

  for (let i = 5; i >= 0; i--) {
    const wStart = new Date(currentMonday);
    wStart.setDate(wStart.getDate() - (i * 7));
    const wEnd = new Date(wStart);
    wEnd.setDate(wEnd.getDate() + 7);

    // Sumar tonelaje de sesiones en este rango
    let ton = 0;
    for (const s of sessions) {
      const sDate = new Date(s.fecha || s.inicio);
      if (sDate >= wStart && sDate < wEnd) {
        for (const set of s.sets || (s.exercises || []).flatMap(e => e.sets || [])) {
          if (set.tipo !== 'calentamiento') {
            ton += (Number(set.peso) || 0) * (Number(set.reps) || 0);
          }
        }
      }
    }

    const label = `${wStart.getDate()}/${wStart.getMonth() + 1}`;
    weeks.push({ label, tonnage: ton });
  }

  const maxTonnage = Math.max(...weeks.map(w => w.tonnage), 1000);
  const svgW = 320;
  const svgH = 140;
  const padL = 35;
  const padR = 15;
  const padB = 25;
  const padT = 15;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;
  const barW = Math.round(plotW / weeks.length) - 8;

  const barsSvg = weeks.map((w, idx) => {
    const x = padL + idx * (plotW / weeks.length) + 4;
    const h = (w.tonnage / maxTonnage) * plotH;
    const y = padT + plotH - h;
    return `
      <rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" fill="var(--accent-secondary)" opacity="0.85"/>
      <text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle" fill="#fff" font-size="8" font-weight="700">${w.tonnage > 0 ? (w.tonnage > 999 ? Math.round(w.tonnage / 1000) + 'k' : w.tonnage) : ''}</text>
      <text x="${x + barW / 2}" y="${padT + plotH + 14}" text-anchor="middle" fill="#64748b" font-size="9">${w.label}</text>
    `;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; overflow-x: auto;">
      <svg viewBox="0 0 ${svgW} ${svgH}" style="width: 100%; height: auto; min-width: 280px;">
        <line x1="${padL}" y1="${padT + plotH}" x2="${svgW - padR}" y2="${padT + plotH}" stroke="#2a3040"/>
        ${barsSvg}
      </svg>
    </div>
  `;
}
