// Vista: Historial de Entrenamientos
import { state } from '../state.js';
import { dbDelete } from '../db.js';
import { formatDateSpanish, formatTimeSpanish, triggerHaptic } from '../utils.js';
import { calculateSessionTonnage } from '../modules/volume.js';
import { calculateE1RM } from '../modules/e1rm.js';

export function renderHistoryView(container) {
  const sessions = state.sessions || [];

  if (sessions.length === 0) {
    container.innerHTML = `
      <div class="workout-empty-state">
        <svg class="workout-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <h2 style="font-size: 1.35rem; font-weight: 900;">Aún no hay sesiones registradas</h2>
        <p style="font-size: 0.9rem; color: var(--text-secondary);">Completa tu primer entrenamiento en la pestaña "Entrenar" para ver tu historial aquí.</p>
        <button type="button" class="btn btn-primary" id="btn-go-train" style="margin-top: 10px;">
          Ir a entrenar
        </button>
      </div>
    `;

    container.querySelector('#btn-go-train').addEventListener('click', () => {
      state.setTab('workout');
    });
    return;
  }

  // Ordenar por fecha descendente
  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(b.fecha || b.inicio) - new Date(a.fecha || a.inicio);
  });

  const cardsHtml = sortedSessions.map(session => {
    const sDate = new Date(session.fecha || session.inicio);
    const dateFormatted = formatDateSpanish(sDate);
    const timeFormatted = formatTimeSpanish(sDate);

    // Calcular duración si tiene inicio y fin
    let durationText = '';
    if (session.inicio && session.fin) {
      const minutes = Math.round((session.fin - session.inicio) / 60000);
      durationText = `⏱ ${minutes} min`;
    }

    const tonnage = calculateSessionTonnage(session, true);
    const totalSets = (session.exercises || []).reduce((acc, ex) => acc + (ex.sets ? ex.sets.filter(s => s.completed || s.peso > 0).length : 0), 0);

    return `
      <div class="card session-history-card" data-session-id="${session.id}" style="cursor: pointer;">
        <div class="card-header" style="margin-bottom: 6px;">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff;">${session.templateName || 'Sesión libre'}</h3>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${dateFormatted} • ${timeFormatted}</div>
          </div>
          <button type="button" class="btn btn-danger btn-icon btn-delete-history" data-id="${session.id}" style="width: 36px; height: 36px; font-size: 0.9rem;" title="Eliminar sesión">✕</button>
        </div>

        <div style="display: flex; gap: 10px; margin: 10px 0; font-size: 0.8rem; color: var(--text-secondary);">
          <span class="badge primary-muscle">${totalSets} series</span>
          <span class="badge">${tonnage.toLocaleString()} ${state.settings.unit}</span>
          ${durationText ? `<span class="badge">${durationText}</span>` : ''}
        </div>

        <!-- Detalle desplegable de ejercicios -->
        <div class="session-detail-content" style="display: none; border-top: 1px solid var(--border-subtle); margin-top: 10px; padding-top: 10px;">
          ${(session.exercises || []).map(ex => {
            const exData = state.exercises.find(e => e.id === ex.exerciseId) || { nombre: 'Ejercicio' };
            const completedSets = (ex.sets || []).filter(s => s.completed || s.peso > 0);
            return `
              <div style="margin-bottom: 8px;">
                <div style="font-weight: 700; font-size: 0.9rem; color: #e2e8f0;">${exData.nombre}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                  ${completedSets.map((s, idx) => {
                    const e1rm = calculateE1RM(s.peso, s.reps, state.settings.e1rmFormula).e1rm;
                    const rirStr = s.rir !== undefined ? `@RIR ${s.rir}` : '';
                    return `Serie ${idx + 1}: ${s.peso} ${state.settings.unit} × ${s.reps} ${rirStr} (e1RM: ${e1rm} ${state.settings.unit})`;
                  }).join('<br>')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="margin-bottom: 16px;">
      <h2 style="font-size: 1.35rem; font-weight: 900;">Historial de Entrenamientos</h2>
      <p style="font-size: 0.85rem; color: var(--text-secondary);">${sortedSessions.length} sesiones completadas</p>
    </div>
    ${cardsHtml}
  `;

  // Listeners para desplegar detalles
  container.querySelectorAll('.session-history-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-delete-history')) return;
      const detail = card.querySelector('.session-detail-content');
      if (detail) {
        const isHidden = detail.style.display === 'none';
        detail.style.display = isHidden ? 'block' : 'none';
      }
    });
  });

  // Listeners para eliminar sesión
  container.querySelectorAll('.btn-delete-history').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      triggerHaptic('heavy');
      const id = btn.getAttribute('data-id');
      if (confirm('¿Eliminar esta sesión permanentemente del historial?')) {
        await dbDelete('sessions', id);
        state.sessions = state.sessions.filter(s => s.id !== id);
        renderHistoryView(container);
      }
    });
  });
}
