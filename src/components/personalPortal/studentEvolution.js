import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

let personalEvoSelectedStudentId = 'aluno_1';

export function setPersonalEvoStudentId(id) {
  personalEvoSelectedStudentId = id;
}

export function renderPersonalStudentEvolution() {
  const students = store.getStudents();
  const currentStudent = students.find(s => s.id === personalEvoSelectedStudentId) || students[0];
  if (!currentStudent) {
    return `
      <div class="personal-evolution-module">
        <div class="glass-panel" style="padding: 32px; text-align: center; color: var(--text-muted);">
          Nenhum aluno cadastrado no sistema para acompanhamento de evolução.
        </div>
      </div>
    `;
  }
  const evolutions = store.getEvolutions(currentStudent.id);

  const firstEvo = evolutions[0];
  const latestEvo = evolutions[evolutions.length - 1];

  const weightDelta = (firstEvo && latestEvo)
    ? (latestEvo.weightKg - firstEvo.weightKg).toFixed(1)
    : 0;

  const bfDelta = (firstEvo && latestEvo && firstEvo.bodyFat && latestEvo.bodyFat)
    ? (latestEvo.bodyFat - firstEvo.bodyFat).toFixed(1)
    : 0;

  const maxBench = evolutions.reduce((max, e) => Math.max(max, e.benchPressKg || 0), 0);
  const maxSquat = evolutions.reduce((max, e) => Math.max(max, e.squatKg || 0), 0);
  const maxDeadlift = evolutions.reduce((max, e) => Math.max(max, e.deadliftKg || 0), 0);

  return `
    <div class="personal-evolution-module">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 24px;">
        <div>
          <h2>Acompanhamento de Evolução & Bioimpedância</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Registre pesagens periódicas, medidas corporais e progressão de cargas de ${currentStudent.name}.
          </p>
        </div>
        <button id="openNewMeasurementModalBtn" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 700;">
          ${Icons.plus('', 16)}
          <span>Nova Avaliação Física</span>
        </button>
      </div>

      <div class="student-selector-bar" style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 14px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 20px;">
        <div class="student-picker-group" style="display: flex; align-items: center; gap: 12px;">
          <img src="${currentStudent.avatar}" style="width: 40px; height: 40px; border-radius: var(--radius-full); object-fit: cover;" alt="">
          <div>
            <label class="form-label" style="margin-bottom: 2px; font-size: 0.72rem; text-transform: uppercase; color: var(--jet-cyan); font-weight: 700;">Aluno Selecionado:</label>
            <select id="evoStudentSelect" class="student-dropdown-select" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; padding: 6px 12px; color: #fff; font-size: 0.9rem; font-weight: 600;">
              ${students.map(s => `
                <option value="${s.id}" ${s.id === currentStudent.id ? 'selected' : ''}>
                  ${s.name} (${s.goal})
                </option>
              `).join('')}
            </select>
          </div>
        </div>
        <div>
          <span class="badge badge-success" style="display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.sparkles('', 13)}
            <span>${evolutions.length} Avaliações Registradas</span>
          </span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 24px;">
        <div class="kpi-card" style="padding: 16px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 14px;">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Peso Atual</div>
          <div style="font-family: 'Outfit', sans-serif; font-size: 1.6rem; font-weight: 800; color: #fff; margin: 4px 0;">
            ${latestEvo ? latestEvo.weightKg : currentStudent.currentWeight} kg
          </div>
          <div style="font-size: 0.78rem; color: ${weightDelta >= 0 ? 'var(--jet-emerald)' : 'var(--jet-cyan)'}; font-weight: 700;">
            ${weightDelta > 0 ? `+${weightDelta} kg desde o início` : weightDelta < 0 ? `${weightDelta} kg desde o início` : 'Sem alteração'}
          </div>
        </div>

        <div class="kpi-card" style="padding: 16px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 14px;">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Altura & IMC</div>
          <div style="font-family: 'Outfit', sans-serif; font-size: 1.6rem; font-weight: 800; color: var(--jet-cyan); margin: 4px 0;">
            ${latestEvo ? (latestEvo.imc || (latestEvo.weightKg / Math.pow((latestEvo.heightCm || currentStudent.heightCm || 178)/100, 2)).toFixed(1)) : '23.8'}
          </div>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">
            Estatura: ${latestEvo?.heightCm || currentStudent.heightCm || 178} cm
          </div>
        </div>

        <div class="kpi-card" style="padding: 16px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 14px;">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Gordura Corporal (% BF)</div>
          <div style="font-family: 'Outfit', sans-serif; font-size: 1.6rem; font-weight: 800; color: #FFB800; margin: 4px 0;">
            ${latestEvo?.bodyFat ? `${latestEvo.bodyFat}%` : '14.2%'}
          </div>
          <div style="font-size: 0.78rem; color: ${bfDelta <= 0 ? 'var(--jet-emerald)' : 'var(--jet-amber)'}; font-weight: 700;">
            ${bfDelta !== 0 ? `${bfDelta > 0 ? '+' : ''}${bfDelta}% de variação` : 'Meta controlada'}
          </div>
        </div>

        <div class="kpi-card" style="padding: 16px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 14px;">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Massa Muscular</div>
          <div style="font-family: 'Outfit', sans-serif; font-size: 1.6rem; font-weight: 800; color: var(--jet-emerald); margin: 4px 0;">
            ${latestEvo?.muscleMassKg ? `${latestEvo.muscleMassKg} kg` : (latestEvo ? `${(latestEvo.weightKg * 0.55).toFixed(1)} kg` : '42.0 kg')}
          </div>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">
            Massa magra estimada
          </div>
        </div>
      </div>

      <div class="measurements-table-card" style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px; overflow-x: auto;">
        <h3 style="font-size: 1.15rem; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
          ${Icons.trendingUp('', 18)}
          <span>Histórico Detalhado de Avaliações Físicas</span>
        </h3>

        <table class="app-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Peso</th>
              <th>Altura</th>
              <th>IMC</th>
              <th>Gordura Corp.</th>
              <th>Massa Muscular</th>
              <th>Tórax / Braço</th>
              <th>Cargas (S/A/T)</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            ${evolutions.length === 0 ? `
              <tr>
                <td colspan="9" style="text-align: center; padding: 36px; color: var(--text-muted);">
                  Nenhuma avaliação física cadastrada para este aluno ainda.
                </td>
              </tr>
            ` : evolutions.map(evo => {
              const h = evo.heightCm || currentStudent.heightCm || 178;
              const calcImc = Number(evo.imc || (evo.weightKg / Math.pow(h/100, 2)).toFixed(1));
              return `
                <tr>
                  <td><strong>${evo.date.split('-').reverse().join('/')}</strong></td>
                  <td><span style="color: #fff; font-weight: 800;">${evo.weightKg} kg</span></td>
                  <td>${h} cm</td>
                  <td>
                    <span class="badge ${calcImc < 25 ? 'badge-success' : 'badge-warning'}" style="font-weight: 700;">
                      ${calcImc}
                    </span>
                  </td>
                  <td><span style="color: #FFB800; font-weight: 700;">${evo.bodyFat || '-'}%</span></td>
                  <td><span style="color: var(--jet-emerald); font-weight: 700;">${evo.muscleMassKg ? `${evo.muscleMassKg} kg` : '-'}</span></td>
                  <td>${evo.chestCm ? `${evo.chestCm}cm` : '-'} / ${evo.armsCm ? `${evo.armsCm}cm` : '-'}</td>
                  <td><strong>${evo.benchPressKg || 0} / ${evo.squatKg || 0} / ${evo.deadliftKg || 0} kg</strong></td>
                  <td style="font-size: 0.8rem; color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${evo.notes || '-'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div id="newMeasurementModal" class="modal-overlay">
        <div class="modal-content" style="max-width: 580px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 20px;">
          <div class="modal-header" style="border-bottom: 1px solid var(--jet-border); padding-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${Icons.sparkles('', 20)}
              <h3 class="modal-title" style="font-family: 'Outfit', sans-serif;">Registrar Nova Avaliação Física</h3>
            </div>
            <button id="closeNewMeasureModalBtn" class="modal-close">&times;</button>
          </div>
          <form id="newMeasurementForm">
            <div class="modal-body" style="padding: 16px 0;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div class="form-group">
                  <label class="form-label">Data da Avaliação</label>
                  <input type="date" id="measureDate" class="form-input" value="${new Date().toISOString().split('T')[0]}" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Peso Corporal (kg)</label>
                  <input type="number" step="0.1" id="measureWeight" class="form-input" placeholder="Ex: 78.5" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: var(--jet-emerald); font-weight: 800;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px;">
                <div class="form-group">
                  <label class="form-label">Altura (cm)</label>
                  <input type="number" id="measureHeight" class="form-input" value="${currentStudent.heightCm || 178}" placeholder="Ex: 178" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Gordura Corp. (% BF)</label>
                  <input type="number" step="0.1" id="measureBf" class="form-input" placeholder="Ex: 14.5" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Massa Muscular (kg)</label>
                  <input type="number" step="0.1" id="measureMuscleMass" class="form-input" placeholder="Ex: 42.0" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: var(--jet-cyan); font-weight: 700;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px;">
                <div class="form-group">
                  <label class="form-label">Tórax (cm)</label>
                  <input type="number" step="0.5" id="measureChest" class="form-input" placeholder="104" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Braço (cm)</label>
                  <input type="number" step="0.5" id="measureArms" class="form-input" placeholder="38.5" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Cintura (cm)</label>
                  <input type="number" step="0.5" id="measureWaist" class="form-input" placeholder="82" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Coxas (cm)</label>
                  <input type="number" step="0.5" id="measureThighs" class="form-input" placeholder="59" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
              </div>

              <div style="font-size: 0.8rem; font-weight: 700; color: var(--jet-cyan); margin-bottom: 8px; text-transform: uppercase;">
                Cargas nos Levantamentos (kg):
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px;">
                <div class="form-group">
                  <label class="form-label">Supino Reto</label>
                  <input type="number" id="measureBench" class="form-input" placeholder="Ex: 84" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Agachamento</label>
                  <input type="number" id="measureSquat" class="form-input" placeholder="Ex: 110" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Levant. Terra</label>
                  <input type="number" id="measureDeadlift" class="form-input" placeholder="Ex: 140" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Feedback & Prescrições do Personal</label>
                <textarea id="measureNotes" class="form-textarea" placeholder="Observações sobre percentual de gordura, postura, recuperação e evolução geral..." style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;"></textarea>
              </div>
            </div>
            <div class="modal-footer" style="border-top: 1px solid var(--jet-border); padding-top: 14px;">
              <button type="button" id="closeNewMeasureModalBtn2" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
                ${Icons.check('', 16)}
                <span>Salvar Avaliação Física</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
