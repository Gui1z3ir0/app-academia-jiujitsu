import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

let selectedDay = 'Segunda';

export function getSelectedDay() {
  return selectedDay;
}

export function setSelectedDay(day) {
  selectedDay = day;
}

export function renderWorkoutViewer(studentId) {
  const student = store.getStudents().find(s => s.id === studentId) || store.getActiveStudent();
  if (!student) return `<div class="glass-panel" style="padding: 24px;">Aluno não encontrado.</div>`;

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const dayAbbrs = {
    'Segunda': 'SEG',
    'Terça': 'TER',
    'Quarta': 'QUA',
    'Quinta': 'QUI',
    'Sexta': 'SEX',
    'Sábado': 'SÁB',
    'Domingo': 'DOM'
  };

  const workout = store.getWorkoutForStudent(student.id, selectedDay);
  const exercises = workout?.exercises || [];
  const completedCount = exercises.filter(e => e.completed).length;
  const progressPct = exercises.length > 0 ? Math.round((completedCount / exercises.length) * 100) : 0;
  const scheduledDays = store.getStudentTrainingDays(student.id);

  return `
    <div class="workout-viewer-module">
      <div style="background: rgba(0, 245, 155, 0.08); border: 1px solid rgba(0, 245, 155, 0.25); border-radius: 12px; padding: 10px 16px; margin-bottom: 14px; font-size: 0.82rem; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <span>📅 <strong>Seus Dias de Treino Definidos pelo Personal:</strong> ${scheduledDays.join(', ')}</span>
        <span class="badge ${scheduledDays.includes(selectedDay) ? 'badge-success' : 'badge-secondary'}">
          ${scheduledDays.includes(selectedDay) ? 'Dia de Treino' : 'Dia de Descanso'}
        </span>
      </div>
      <div class="weekdays-bar">
        ${days.map(d => {
          const dayWorkout = store.getWorkoutForStudent(student.id, d);
          const hasExercises = dayWorkout?.exercises?.length > 0;
          return `
            <button class="weekday-btn ${selectedDay === d ? 'active' : ''}" data-day="${d}">
              <span class="weekday-abbr">${dayAbbrs[d]}</span>
              <span class="weekday-label">${hasExercises ? `${dayWorkout.exercises.length} exs` : 'Descanso'}</span>
            </button>
          `;
        }).join('')}
      </div>

      <div class="workout-header-card">
        <div class="workout-header-top">
          <div>
            <div class="exercise-muscle-tag" style="margin-bottom: 4px; display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.calendar('', 13)}
              <span>Treino de ${selectedDay}</span>
            </div>
            <h2 class="workout-title">${workout?.title || 'Ficha do Dia'}</h2>
          </div>
          ${exercises.length > 0 ? `
            <div style="text-align: right;">
              <span class="badge ${progressPct === 100 ? 'badge-success' : 'badge-cyan'}" style="display: inline-flex; align-items: center; gap: 6px;">
                ${progressPct === 100 ? Icons.checkCircle('', 14) : Icons.trendingUp('', 14)}
                <span>${completedCount}/${exercises.length} Concluídos (${progressPct}%)</span>
              </span>
            </div>
          ` : ''}
        </div>
        ${workout?.notes ? `<p style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 6px;">${workout.notes}</p>` : ''}

        ${exercises.length > 0 ? `
          <div class="workout-progress-bar-container" style="margin-top: 14px;">
            <div class="workout-progress-bar-fill" style="width: ${progressPct}%;"></div>
          </div>
        ` : ''}
      </div>

      ${exercises.length === 0 ? `
        <div class="rest-day-card" style="text-align: center; padding: 40px 20px; background: var(--jet-card); border: 1px dashed var(--jet-border); border-radius: 16px;">
          <div class="rest-day-icon" style="color: var(--jet-emerald); margin-bottom: 12px; display: flex; justify-content: center;">
            ${Icons.sparkles('', 40)}
          </div>
          <h3 style="font-size: 1.3rem; margin-bottom: 6px;">Dia de Recuperação Ativa</h3>
          <p style="color: var(--jet-text-sub); max-width: 460px; margin: 0 auto; font-size: 0.92rem;">
            Nenhum exercício pesado programado para hoje. Aproveite para descansar, hidratar-se e permitir a supercompensação muscular!
          </p>
        </div>
      ` : `
        <div class="exercise-cards-list">
          ${exercises.map(ex => `
            <div class="exercise-card ${ex.completed ? 'completed' : ''}" data-exercise-id="${ex.id}">
              <div class="exercise-card-inner">
                <div class="exercise-thumb-wrap">
                  <img
                    src="${ex.imageUrl || ''}"
                    class="exercise-thumb-img"
                    alt="${ex.name}"
                    loading="lazy"
                  />
                  <div class="exercise-thumb-badge">
                    ${Icons.flame('', 12)}
                    <span>${ex.muscleGroup ? ex.muscleGroup.split(' ')[0] : 'Força'}</span>
                  </div>
                </div>

                <div class="exercise-info-col">
                  <div class="exercise-header-row">
                    <div>
                      <span class="exercise-tag-pill">${ex.muscleGroup || 'Musculação'}</span>
                      <div class="exercise-title-text">${ex.name}</div>
                      ${ex.notes ? `<div class="exercise-notes-hint">${Icons.sparkles('', 13)} ${ex.notes}</div>` : ''}
                    </div>
                    <button class="btn btn-secondary btn-sm open-exercise-modal-btn btn-posture-pro" data-exercise-name="${ex.name}" data-exercise-group="${ex.muscleGroup}">
                      ${Icons.play('', 13)}
                      <span>Ver Guia</span>
                    </button>
                  </div>

                  <div class="exercise-metrics-grid-pro">
                    <div class="metric-pill">
                      <span class="metric-pill-label">Séries</span>
                      <span class="metric-pill-val">${ex.sets}</span>
                    </div>
                    <div class="metric-pill">
                      <span class="metric-pill-label">Repetições</span>
                      <span class="metric-pill-val">${ex.reps}</span>
                    </div>
                    <div class="metric-pill">
                      <span class="metric-pill-label">Carga Atual</span>
                      <div class="load-stepper load-stepper-pro" style="margin-top: 2px;">
                        <button class="load-stepper-btn stepper-btn dec-load" data-ex-id="${ex.id}" data-day="${selectedDay}">-</button>
                        <span class="metric-pill-val" style="font-size: 0.95rem;">${ex.loadKg}kg</span>
                        <button class="load-stepper-btn stepper-btn inc-load" data-ex-id="${ex.id}" data-day="${selectedDay}">+</button>
                      </div>
                    </div>
                    <div class="metric-pill">
                      <span class="metric-pill-label">Descanso</span>
                      <span class="metric-pill-val">${ex.restSeconds || 60}s</span>
                    </div>
                  </div>

                  <div class="student-custom-load-bar" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-top: 10px; padding: 10px 12px; background: rgba(0, 245, 155, 0.06); border: 1px solid rgba(0, 245, 155, 0.2); border-radius: 10px;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                      <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">🏋️ Peso que peguei no treino:</span>
                      ${ex.recordeKg ? `<span class="badge badge-warning" style="font-size: 0.72rem;">🏆 Recorde: ${ex.recordeKg} kg</span>` : ''}
                      ${ex.ultimaCargaEm ? `<span style="font-size: 0.72rem; color: var(--text-muted);">Atualizado em ${ex.ultimaCargaEm}</span>` : ''}
                    </div>
                    <div class="student-custom-load-controls" style="display: flex; align-items: center; gap: 6px;">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        id="studentLoadInput_${ex.id}"
                        class="form-input student-load-input"
                        data-ex-id="${ex.id}"
                        data-day="${selectedDay}"
                        value="${ex.loadKg}"
                        placeholder="Kg"
                        style="width: 82px; padding: 6px 10px; font-weight: 800; text-align: center; height: 36px;"
                      />
                      <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">kg</span>
                      <button
                        type="button"
                        class="btn btn-primary btn-sm save-student-load-btn"
                        data-ex-id="${ex.id}"
                        data-day="${selectedDay}"
                        style="padding: 6px 12px; height: 36px; font-size: 0.78rem;"
                      >
                        Salvar Peso
                      </button>
                    </div>
                  </div>

                  <div class="exercise-action-footer-pro">
                    <div class="rest-timer-widget" data-rest-seconds="${ex.restSeconds || 60}" id="timer-widget-${ex.id}">
                      <div class="timer-ring-icon">${Icons.clock('', 15)}</div>
                      <span class="timer-seconds-display">${ex.restSeconds || 60}s</span>
                      <button class="timer-start-btn" data-timer-target="${ex.id}" data-seconds="${ex.restSeconds || 60}" style="display: inline-flex; align-items: center; gap: 4px;">
                        ${Icons.play('', 11)} Iniciar
                      </button>
                    </div>

                    <button class="btn-complete-toggle check-exercise-btn ${ex.completed ? 'checked' : ''}" data-toggle-done="${ex.id}" data-day="${selectedDay}">
                      ${ex.completed ? Icons.checkCircle('', 16) : Icons.check('', 16)}
                      <span>${ex.completed ? 'Concluído' : 'Marcar Feito'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}
