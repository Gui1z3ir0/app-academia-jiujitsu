import { exerciseCatalog } from '../../data/exerciseCatalog.js';
import { getExerciseIllustration } from '../exerciseIllustrations.js';

export function renderExerciseModal() {
  return `
    <div id="exerciseModal" class="modal-overlay">
      <div class="modal-content" style="max-width: 640px;">
        <div class="modal-header">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <span id="modalMuscleGroup" class="exercise-muscle-tag">Peitoral</span>
            <h3 id="modalExerciseTitle" class="modal-title">Supino Reto com Barra</h3>
          </div>
          <button id="closeExerciseModalBtn" class="modal-close">&times;</button>
        </div>

        <div class="modal-body" style="padding: 20px;">
          <div id="modalIllustrationContainer" style="background: var(--bg-surface-elevated); border-radius: var(--radius-md); padding: 12px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-subtle);">
          </div>

          <div style="margin-bottom: 18px;">
            <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">
              Músculos Trabalhados
            </div>
            <div id="modalMusclesList" style="display: flex; gap: 8px; flex-wrap: wrap;">
              <span class="badge badge-success">Peitoral Maior</span>
              <span class="badge badge-cyan">Tríceps</span>
              <span class="badge badge-purple">Deltoide Anterior</span>
            </div>
          </div>

          <div style="margin-bottom: 18px;">
            <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">
              Instruções de Execução
            </div>
            <ol id="modalInstructionsList" style="padding-left: 20px; font-size: 0.9rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px;">
              <li>Mantenha escápulas aduzidas no banco.</li>
            </ol>
          </div>

          <div style="background: rgba(255, 71, 87, 0.08); border: 1px solid rgba(255, 71, 87, 0.25); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 14px;">
            <div style="font-size: 0.82rem; font-weight: 700; color: #FF6B7A; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <span>⚠️</span> Erros Comuns a Evitar:
            </div>
            <ul id="modalMistakesList" style="padding-left: 20px; font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 4px;">
              <li>Não abra os cotovelos em 90°.</li>
            </ul>
          </div>

          <div style="background: rgba(0, 245, 155, 0.08); border: 1px solid rgba(0, 245, 155, 0.25); border-radius: var(--radius-sm); padding: 14px;">
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--neon-green); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <span>💡</span> Dica do Personal:
            </div>
            <div id="modalTrainerTip" style="font-size: 0.85rem; color: var(--text-secondary);">
              Foque na cadência excêntrica de 3 segundos para maximizar o recrutamento de fibras hipertróficas.
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button id="closeExerciseModalBtn2" class="btn btn-secondary">Fechar</button>
        </div>
      </div>
    </div>
  `;
}

export function populateAndOpenExerciseModal(exerciseName = '', muscleGroup = '', customNotes = '') {
  const modal = document.getElementById('exerciseModal');
  if (!modal) return;

  const safeName = String(exerciseName || 'Exercício');
  const matched = exerciseCatalog.find(e =>
    e.name.toLowerCase().includes(safeName.toLowerCase()) ||
    safeName.toLowerCase().includes(e.name.toLowerCase())
  );

  const titleEl = document.getElementById('modalExerciseTitle');
  const groupEl = document.getElementById('modalMuscleGroup');
  const illustrationContainer = document.getElementById('modalIllustrationContainer');
  const musclesList = document.getElementById('modalMusclesList');
  const instructionsList = document.getElementById('modalInstructionsList');
  const mistakesList = document.getElementById('modalMistakesList');
  const trainerTip = document.getElementById('modalTrainerTip');

  if (titleEl) titleEl.textContent = safeName;
  if (groupEl) groupEl.textContent = muscleGroup || (matched ? matched.muscleGroup : 'Musculação');

  const illType = matched ? matched.illustrationType : 'default';
  if (illustrationContainer) {
    illustrationContainer.innerHTML = getExerciseIllustration(illType);
  }

  if (musclesList) {
    const primary = matched ? matched.muscleGroup : (muscleGroup || 'Peitoral');
    const secondary = matched ? matched.secondaryMuscles : ['Estabilizadores do Core'];
    musclesList.innerHTML = `
      <span class="badge badge-success">${primary} (Primário)</span>
      ${secondary.map(m => `<span class="badge badge-cyan">${m}</span>`).join('')}
    `;
  }

  if (instructionsList) {
    const instrs = matched ? matched.instructions : [
      'Posicione-se confortavelmente no equipamento com coluna alinhada.',
      'Execute a fase concêntrica expirando o ar.',
      'Retorne controladamente sentindo o músculo alongar sem perder a tensão.'
    ];
    instructionsList.innerHTML = instrs.map(i => `<li>${i}</li>`).join('');
  }

  if (mistakesList) {
    const mistakes = matched ? matched.mistakes : [
      'Usar carga excessiva comprometendo a amplitude articular.',
      'Movimentar o pescoço ou coluna durante o esforço.'
    ];
    mistakesList.innerHTML = mistakes.map(m => `<li>${m}</li>`).join('');
  }

  if (trainerTip) {
    trainerTip.textContent = customNotes || (matched ? matched.tips : 'Mantenha a respiração ritmada e não trave as articulações no final da extensão.');
  }

  modal.classList.add('active');
}
