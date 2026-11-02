import { store } from '../../data/store.js';
import { exerciseCatalog } from '../../data/exerciseCatalog.js';
import { Icons } from '../icons.js';

let builderSelectedDay = 'Segunda';
let builderSelectedStudentId = 'aluno_1';

export function getBuilderSelectedDay() {
  return builderSelectedDay;
}

export function setBuilderSelectedDay(day) {
  builderSelectedDay = day;
}

export function setBuilderSelectedStudentId(id) {
  builderSelectedStudentId = id;
}

export function renderWorkoutBuilder() {
  const students = store.getStudents();
  const currentStudent = students.find(s => s.id === builderSelectedStudentId) || students[0];
  if (!currentStudent) {
    return `
      <div class="workout-builder-module">
        <div class="glass-panel" style="padding: 32px; text-align: center; color: var(--text-muted);">
          Nenhum aluno cadastrado no sistema. Cadastre um aluno antes de prescrever fichas de treino.
        </div>
      </div>
    `;
  }
  const workout = store.getWorkoutForStudent(currentStudent.id, builderSelectedDay);
  const exercises = workout?.exercises || [];
  const otherStudents = students.filter(s => s.id !== currentStudent.id);
  const activeTrainDays = store.getStudentTrainingDays(currentStudent.id);

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  return `
    <div class="workout-builder-module">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 24px;">
        <div>
          <h2>Montar & Prescrever Ficha de Treino</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Defina os dias de treino na semana, monte os exercícios e copie fichas prontas para outros alunos.
          </p>
        </div>
      </div>

      <div class="student-selector-bar" style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 14px; padding: 16px 20px;">
        <div class="student-picker-group" style="display: flex; align-items: center; gap: 12px;">
          <img src="${currentStudent.avatar}" style="width: 38px; height: 38px; border-radius: var(--radius-full); object-fit: cover;" alt="">
          <div>
            <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--jet-emerald); font-weight: 700; letter-spacing: 0.5px;">Aluno Selecionado</span>
            <select id="builderStudentSelect" class="student-dropdown-select" style="display: block; background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; padding: 6px 12px; color: #fff; font-size: 0.9rem; font-weight: 600;">
              ${students.map(s => `
                <option value="${s.id}" ${s.id === currentStudent.id ? 'selected' : ''}>
                  ${s.name} (${s.planName})
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 6px; overflow-x: auto; padding: 4px 0;">
          ${days.map(d => {
            const dayW = store.getWorkoutForStudent(currentStudent.id, d);
            const count = dayW?.exercises?.length || 0;
            const isSelected = builderSelectedDay === d;
            return `
              <button type="button" class="btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'} builder-day-btn" data-builder-day="${d}" style="font-size: 0.82rem; padding: 6px 12px; border-radius: 8px; font-weight: 700;">
                <span>${d.substring(0, 3)}</span>
                ${count > 0 ? `<span style="opacity: 0.8; font-size: 0.72rem; margin-left: 2px;">(${count})</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 16px;">
        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 14px; padding: 16px 20px;">
          <div style="font-size: 0.78rem; font-weight: 800; color: var(--jet-cyan); text-transform: uppercase; margin-bottom: 8px;">
            📅 Dias da Semana em que ${currentStudent.name.split(' ')[0]} Treina
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${days.map(d => {
              const isDayActive = activeTrainDays.includes(d);
              return `
                <button
                  type="button"
                  class="btn btn-sm toggle-student-train-day-btn ${isDayActive ? 'btn-primary' : 'btn-secondary'}"
                  data-student-id="${currentStudent.id}"
                  data-train-day="${d}"
                  style="font-size: 0.76rem; padding: 5px 10px; border-radius: 8px;"
                >
                  ${isDayActive ? '✓ ' : ''}${d.substring(0, 3)}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 14px; padding: 16px 20px;">
          <div style="font-size: 0.78rem; font-weight: 800; color: var(--jet-emerald); text-transform: uppercase; margin-bottom: 8px;">
            📋 Copiar / Aplicar Este Treino para Outro Aluno
          </div>
          ${otherStudents.length === 0 ? `
            <div style="font-size: 0.82rem; color: var(--text-muted);">
              Cadastre mais de 1 aluno para copiar fichas de treino entre alunos.
            </div>
          ` : `
            <form id="copyWorkoutToStudentForm" data-source-student-id="${currentStudent.id}" style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
              <select id="copyTargetStudentSelect" class="form-select" required style="flex: 1; min-width: 150px; padding: 7px 10px; font-size: 0.84rem;">
                ${otherStudents.map(s => `
                  <option value="${s.id}">Para: ${s.name}</option>
                `).join('')}
              </select>
              <select id="copyWorkoutScopeSelect" class="form-select" style="width: 155px; padding: 7px 10px; font-size: 0.84rem;">
                <option value="all">Semana Completa</option>
                <option value="${builderSelectedDay}">Só ${builderSelectedDay}</option>
              </select>
              <button type="submit" class="btn btn-primary btn-sm" style="padding: 8px 14px; font-weight: 800;">
                Aplicar Treino
              </button>
            </form>
          `}
        </div>
      </div>

      <div class="builder-card" style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 24px; margin-top: 20px;">
        <div class="builder-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--jet-emerald); font-weight: 700; text-transform: uppercase;">
              ${Icons.calendar('', 13)}
              <span>Treino de ${builderSelectedDay}</span>
            </div>
            <h3 style="font-size: 1.3rem; margin-top: 2px; font-family: 'Outfit', sans-serif;">${workout.title || `Treino de ${builderSelectedDay}`}</h3>
          </div>
          <button id="openAddExerciseModalBtn" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
            ${Icons.plus('', 16)}
            <span>Adicionar Exercício</span>
          </button>
        </div>

        ${exercises.length === 0 ? `
          <div style="text-align: center; padding: 48px 16px; color: var(--jet-text-sub); border: 2px dashed var(--jet-border); border-radius: 14px; background: rgba(0,0,0,0.15);">
            <div style="display: flex; justify-content: center; margin-bottom: 12px; color: var(--jet-emerald);">
              ${Icons.dumbbell('', 42)}
            </div>
            <h4 style="font-size: 1.1rem; margin-bottom: 4px; color: #fff;">Nenhum exercício programado para ${builderSelectedDay}</h4>
            <p style="font-size: 0.88rem; max-width: 420px; margin: 0 auto 16px auto;">
              Adicione exercícios do catálogo ou crie movimentos personalizados com repetições e cargas adaptadas para ${currentStudent.name}.
            </p>
            <button id="openAddExerciseModalBtn2" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.plus('', 15)}
              <span>Adicionar Primeiro Exercício</span>
            </button>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${exercises.map(ex => `
              <div class="builder-exercise-item" data-exercise-id="${ex.id}" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
                <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 240px;">
                  <img
                    src="${ex.imageUrl}"
                    style="width: 54px; height: 54px; border-radius: 10px; object-fit: cover; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.1);"
                    alt="${ex.name}"
                  />
                  <div>
                    <span class="exercise-tag-pill" style="font-size: 0.68rem;">${ex.muscleGroup || 'Musculação'}</span>
                    <strong style="font-size: 1.05rem; display: block; color: var(--jet-text-main); margin-top: 2px;">${ex.name}</strong>
                    ${ex.notes ? `<div style="font-size: 0.78rem; color: var(--jet-text-sub); margin-top: 2px;">${ex.notes}</div>` : ''}
                  </div>
                </div>

                <div class="builder-exercise-inputs" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                  <div>
                    <span style="font-size: 0.68rem; color: var(--jet-text-muted); display: block; text-transform: uppercase; font-weight: 700;">Séries</span>
                    <input type="number" class="form-input builder-input-compact edit-ex-field" data-ex-id="${ex.id}" data-field="sets" value="${ex.sets}" style="width: 58px; text-align: center; font-weight: 700; background: rgba(0,0,0,0.3); border: 1px solid var(--jet-border); padding: 4px; border-radius: 6px; color: #fff;">
                  </div>
                  <div>
                    <span style="font-size: 0.68rem; color: var(--jet-text-muted); display: block; text-transform: uppercase; font-weight: 700;">Reps</span>
                    <input type="text" class="form-input builder-input-compact edit-ex-field" data-ex-id="${ex.id}" data-field="reps" value="${ex.reps}" style="width: 72px; text-align: center; font-weight: 700; background: rgba(0,0,0,0.3); border: 1px solid var(--jet-border); padding: 4px; border-radius: 6px; color: #fff;">
                  </div>
                  <div>
                    <span style="font-size: 0.68rem; color: var(--jet-text-muted); display: block; text-transform: uppercase; font-weight: 700;">Carga (kg)</span>
                    <input type="number" class="form-input builder-input-compact edit-ex-field" data-ex-id="${ex.id}" data-field="loadKg" value="${ex.loadKg}" style="width: 64px; text-align: center; font-weight: 700; background: rgba(0,0,0,0.3); border: 1px solid var(--jet-border); padding: 4px; border-radius: 6px; color: var(--jet-emerald);">
                  </div>
                  <div>
                    <span style="font-size: 0.68rem; color: var(--jet-text-muted); display: block; text-transform: uppercase; font-weight: 700;">Descanso (s)</span>
                    <input type="number" class="form-input builder-input-compact edit-ex-field" data-ex-id="${ex.id}" data-field="restSeconds" value="${ex.restSeconds || 60}" style="width: 64px; text-align: center; font-weight: 700; background: rgba(0,0,0,0.3); border: 1px solid var(--jet-border); padding: 4px; border-radius: 6px; color: #fff;">
                  </div>

                  <div style="align-self: flex-end; margin-bottom: 2px;">
                    <button class="btn btn-danger btn-sm remove-ex-btn" data-ex-id="${ex.id}" title="Excluir exercício" style="padding: 7px 10px; border-radius: 8px;">
                      ${Icons.trash('', 14)}
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div id="addExerciseModal" class="modal-overlay">
        <div class="modal-content" style="max-width: 520px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 20px;">
          <div class="modal-header" style="border-bottom: 1px solid var(--jet-border); padding-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${Icons.plus('', 20)}
              <h3 class="modal-title" style="font-family: 'Outfit', sans-serif;">Novo Exercício na Ficha</h3>
            </div>
            <button id="closeAddExModalBtn" class="modal-close">&times;</button>
          </div>
          <div class="modal-body" style="padding: 16px 0;">
            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label" style="font-weight: 700; color: var(--jet-emerald); display: flex; align-items: center; gap: 6px;">
                ${Icons.sparkles('', 14)}
                <span>Preencher do Catálogo Inteligente</span>
              </label>
              <select id="quickCatalogSelect" class="form-select" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 10px; color: #fff; padding: 10px 14px; font-weight: 600;">
                <option value="">-- Escolha um exercício ou preencha manualmente --</option>
                ${exerciseCatalog.map(c => `
                  <option
                    value="${c.id}"
                    data-name="${c.name}"
                    data-group="${c.muscleGroup}"
                    data-sets="${c.defaultSets}"
                    data-reps="${c.defaultReps}"
                    data-rest="${c.defaultRest}"
                    data-image="${c.imageUrl || ''}"
                    data-video="${c.videoUrl || ''}"
                  >
                    ${c.name} (${c.muscleGroup})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Nome do Exercício</label>
              <input type="text" id="newExName" class="form-input" placeholder="Ex: Supino Reto com Barra..." style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
            </div>

            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label">Grupo Muscular</label>
              <input type="text" id="newExGroup" class="form-input" placeholder="Ex: Peitoral, Dorsais, Quadríceps..." style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
            </div>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label">Séries</label>
                <input type="number" id="newExSets" class="form-input" value="4" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
              </div>
              <div class="form-group">
                <label class="form-label">Reps</label>
                <input type="text" id="newExReps" class="form-input" value="10-12" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
              </div>
              <div class="form-group">
                <label class="form-label">Carga (kg)</label>
                <input type="number" id="newExLoad" class="form-input" value="20" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: var(--jet-emerald); font-weight: 700;">
              </div>
              <div class="form-group">
                <label class="form-label">Descanso (s)</label>
                <input type="number" id="newExRest" class="form-input" value="60" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
              </div>
            </div>

            <input type="hidden" id="newExImage" value="">
            <input type="hidden" id="newExVideo" value="">

            <div class="form-group">
              <label class="form-label">Observações Técnicas / Dica de Execução</label>
              <textarea id="newExNotes" class="form-textarea" placeholder="Dicas de postura, cadência e segurança..." style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;"></textarea>
            </div>
          </div>
          <div class="modal-footer" style="border-top: 1px solid var(--jet-border); padding-top: 14px;">
            <button id="closeAddExModalBtn2" class="btn btn-secondary">Cancelar</button>
            <button id="saveNewExerciseBtn" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.check('', 16)}
              <span>Salvar na Ficha</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
