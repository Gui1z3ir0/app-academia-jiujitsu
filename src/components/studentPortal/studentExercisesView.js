import { exerciseCatalog } from '../../data/exerciseCatalog.js';
import { Icons } from '../icons.js';
import { populateAndOpenExerciseModal } from './exerciseModal.js';

let selectedMuscleGroup = 'all';
let searchQuery = '';

export function setCatalogFilter(group) {
  selectedMuscleGroup = group;
}

export function setCatalogSearch(query) {
  searchQuery = query.toLowerCase();
}

export function renderStudentExercisesView() {
  const groups = [
    { id: 'all', label: 'Todos os Músculos' },
    { id: 'Peitoral', label: 'Peito' },
    { id: 'Dorsais', label: 'Costas / Dorsal' },
    { id: 'Quadríceps', label: 'Pernas & Glúteos' },
    { id: 'Ombros', label: 'Ombros' },
    { id: 'Bíceps', label: 'Bíceps & Braços' },
    { id: 'Abdômen', label: 'Abdômen & Core' }
  ];

  const filtered = exerciseCatalog.filter(ex => {
    if (selectedMuscleGroup !== 'all') {
      if (!ex.muscleGroup.toLowerCase().includes(selectedMuscleGroup.toLowerCase())) {
        return false;
      }
    }
    if (searchQuery) {
      const matchName = ex.name.toLowerCase().includes(searchQuery);
      const matchMuscle = ex.muscleGroup.toLowerCase().includes(searchQuery);
      const matchEquip = (ex.equipment || '').toLowerCase().includes(searchQuery);
      return matchName || matchMuscle || matchEquip;
    }
    return true;
  });

  return `
    <div class="student-exercises-module">
      <div style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 8px; color: var(--jet-emerald); font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ${Icons.dumbbell('', 16)} CONSULTA DE EXERCÍCIOS
        </div>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 4px 0;">Biblioteca de Exercícios & Execução</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Aprenda a biomecânica correta, postura ideal e músculos ativados para maximizar seus resultados.
        </p>
      </div>

      <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 18px 20px; margin-bottom: 24px;">
        <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 14px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 260px; position: relative;">
            <input
              type="text"
              id="studentCatalogSearchInput"
              class="form-input"
              placeholder="Buscar exercício por nome, músculo ou equipamento..."
              value="${searchQuery}"
              style="width: 100%; box-sizing: border-box; background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 10px; padding: 11px 16px; color: #fff; font-size: 0.9rem;"
            >
          </div>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${groups.map(g => `
            <button
              type="button"
              class="btn btn-sm ${selectedMuscleGroup === g.id ? 'btn-primary' : 'btn-secondary'} catalog-filter-btn"
              data-group="${g.id}"
              style="border-radius: 8px; font-weight: 700; font-size: 0.82rem; padding: 6px 12px;"
            >
              ${g.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px;">
        ${filtered.length === 0 ? `
          <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; color: var(--text-muted);">
            Nenhum exercício encontrado com estes critérios de busca.
          </div>
        ` : filtered.map(ex => `
          <div class="exercise-catalog-card" style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s, border-color 0.2s;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 10px;">
                <span class="badge badge-cyan" style="font-size: 0.75rem; font-weight: 700;">
                  ${ex.muscleGroup}
                </span>
                <span class="badge ${ex.difficulty === 'Iniciante' ? 'badge-success' : ex.difficulty === 'Avançado' ? 'badge-danger' : 'badge-warning'}" style="font-size: 0.72rem;">
                  ${ex.difficulty || 'Geral'}
                </span>
              </div>

              <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0 0 8px 0;">
                ${ex.name}
              </h3>

              <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                <span style="color: var(--text-muted);">Equipamento:</span>
                <strong>${ex.equipment || 'Livre'}</strong>
              </div>

              <p style="font-size: 0.84rem; color: #94A3B8; line-height: 1.45; margin: 0 0 16px 0;">
                ${(ex.instructions && ex.instructions[0]) ? ex.instructions[0] : 'Execução biomecânica completa com foco no pico de contração muscular.'}
              </p>
            </div>

            <div style="border-top: 1px solid var(--jet-border); padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 0.78rem; color: var(--jet-emerald); font-weight: 700;">
                Padrão: ${ex.defaultSets || 4}x ${ex.defaultReps || '10-12'}
              </div>
              <button
                type="button"
                class="btn btn-secondary btn-sm view-exercise-details-btn"
                data-exercise-name="${ex.name}"
                data-exercise-muscle="${ex.muscleGroup}"
                data-exercise-notes="${ex.tips || ''}"
                style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;"
              >
                ${Icons.eye('', 14)}
                <span>Ver Execução</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
