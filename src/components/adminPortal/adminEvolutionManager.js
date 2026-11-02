import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

let adminSelectedStudentId = 'usr_aluno_1';

export function setAdminEvolutionStudent(id) {
  adminSelectedStudentId = id;
}

export function renderAdminEvolutionManager() {
  const students = store.getStudents();

  if (students.length === 0) {
    return `
      <div class="admin-evolution-manager-module">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 24px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; color: var(--jet-emerald); font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
              ${Icons.trendingUp('', 16)} AVALIAÇÕES FÍSICAS & BIOIMPEDÂNCIA
            </div>
            <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 4px 0;">Histórico & Evolução Corporal dos Alunos</h2>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">
              Registre pesagens, percentual de gordura, medidas e acompanhe gráficos biométricos.
            </p>
          </div>
        </div>

        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 48px 24px; text-align: center;">
          <div style="width: 64px; height: 64px; border-radius: 20px; background: rgba(0, 245, 155, 0.1); color: var(--jet-emerald); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            ${Icons.sparkles('', 32)}
          </div>
          <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.3rem; margin-bottom: 8px;">Nenhum Aluno para Avaliar</h3>
          <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 20px; font-size: 0.9rem;">
            O banco de dados de alunos está vazio. Cadastre o primeiro aluno para registrar pesagens e relatórios de bioimpedância.
          </p>
          <button class="btn btn-primary jump-to-tab-btn" data-target="admin_students" style="padding: 10px 22px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px;">
            ${Icons.userPlus('', 16)} <span>Ir para Gestão de Alunos</span>
          </button>
        </div>
      </div>
    `;
  }

  const currentStudent = students.find(s => s.id === adminSelectedStudentId) || students[0];
  const evolutions = store.getEvolutions(currentStudent ? currentStudent.id : 'usr_aluno_1');

  const latest = evolutions.length > 0 ? evolutions[evolutions.length - 1] : {
    weightKg: currentStudent?.currentWeight || 76,
    heightCm: currentStudent?.heightCm || 178,
    imc: 24.0,
    bodyFat: 14.5,
    muscleMassKg: 42.0,
    chestCm: 102,
    armsCm: 37,
    waistCm: 81,
    thighsCm: 58,
    benchPressKg: 80,
    squatKg: 100,
    deadliftKg: 130,
    date: '2026-09-01'
  };

  const initial = evolutions.length > 0 ? evolutions[0] : latest;
  const weightDiff = (latest.weightKg - initial.weightKg).toFixed(1);
  const bfDiff = (latest.bodyFat - initial.bodyFat).toFixed(1);

  const imcVal = Number(latest.imc || (latest.weightKg / Math.pow((latest.heightCm || 178)/100, 2)).toFixed(1));
  let imcBadgeClass = 'badge-success';
  let imcStatusLabel = 'Peso Normal (OMS)';
  if (imcVal < 18.5) {
    imcBadgeClass = 'badge-warning';
    imcStatusLabel = 'Abaixo do Peso';
  } else if (imcVal >= 25 && imcVal < 30) {
    imcBadgeClass = 'badge-warning';
    imcStatusLabel = 'Sobrepeso Leve';
  } else if (imcVal >= 30) {
    imcBadgeClass = 'badge-danger';
    imcStatusLabel = 'Obesidade';
  }

  const chartPoints = evolutions.map((e, index) => {
    const x = evolutions.length === 1 ? 250 : 50 + (index * (400 / (evolutions.length - 1)));
    const minW = 55;
    const maxW = 95;
    const y = 180 - (((e.weightKg - minW) / (maxW - minW)) * 140);
    return { x, y, weight: e.weightKg, date: e.date };
  });
  const polylineStr = chartPoints.map(p => `${p.x},${p.y}`).join(' ');

  return `
    <div class="admin-evolution-manager-module">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 24px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; color: var(--jet-emerald); font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
            ${Icons.sparkles('', 16)} BIOMETRIA & PERFORMANCE
          </div>
          <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 4px 0;">Acompanhamento de Progresso & Bioimpedância</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Consulte dados de composição corporal e registre novas avaliações físicas para os alunos.
          </p>
        </div>

        <button id="openNewEvaluationModalBtn" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 700;">
          ${Icons.plus('', 16)}
          <span>Nova Avaliação Física</span>
        </button>
      </div>

      <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 18px 22px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <img src="${currentStudent?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" style="width: 44px; height: 44px; border-radius: 12px; object-fit: cover; border: 2px solid var(--jet-cyan);" alt="">
          <div>
            <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--jet-cyan); font-weight: 800; letter-spacing: 0.5px;">Selecionar Aluno para Consulta</span>
            <select id="adminEvolutionStudentSelect" class="form-select" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; padding: 6px 12px; color: #fff; font-size: 0.9rem; font-weight: 700; cursor: pointer;">
              ${students.map(s => `
                <option value="${s.id}" ${s.id === currentStudent?.id ? 'selected' : ''}>
                  ${s.name} (${s.goal || 'Saúde'})
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <div style="font-size: 0.82rem; color: var(--text-muted);">
          Total de Avaliações Registradas: <strong style="color: var(--jet-emerald); font-size: 1rem;">${evolutions.length}</strong>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px;">
          <span style="color: var(--text-muted); font-size: 0.78rem; font-weight: 700; text-transform: uppercase;">1. Peso Corporal</span>
          <div style="margin: 6px 0; display: flex; align-items: baseline; justify-content: space-between;">
            <span style="font-size: 1.8rem; font-weight: 800; color: #fff; font-family: 'Outfit', sans-serif;">
              ${latest.weightKg} <span style="font-size: 1rem; color: var(--text-muted);">kg</span>
            </span>
            <span class="badge ${Number(weightDiff) <= 0 ? 'badge-success' : 'badge-warning'}" style="font-weight: 700;">
              ${Number(weightDiff) > 0 ? `+${weightDiff}` : weightDiff} kg
            </span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Início: ${initial.weightKg} kg</span>
        </div>

        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px;">
          <span style="color: var(--text-muted); font-size: 0.78rem; font-weight: 700; text-transform: uppercase;">2. Altura & IMC</span>
          <div style="margin: 6px 0; display: flex; align-items: baseline; justify-content: space-between;">
            <span style="font-size: 1.8rem; font-weight: 800; color: var(--jet-cyan); font-family: 'Outfit', sans-serif;">
              ${imcVal} <span style="font-size: 0.9rem; color: var(--text-muted);">kg/m²</span>
            </span>
            <span class="badge ${imcBadgeClass}" style="font-size: 0.72rem; font-weight: 700;">
              ${imcStatusLabel}
            </span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Estatura: ${latest.heightCm || 178} cm</span>
        </div>

        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px;">
          <span style="color: var(--text-muted); font-size: 0.78rem; font-weight: 700; text-transform: uppercase;">3. Gordura Corporal (% BF)</span>
          <div style="margin: 6px 0; display: flex; align-items: baseline; justify-content: space-between;">
            <span style="font-size: 1.8rem; font-weight: 800; color: #FFB800; font-family: 'Outfit', sans-serif;">
              ${latest.bodyFat}%
            </span>
            <span class="badge ${Number(bfDiff) <= 0 ? 'badge-success' : 'badge-warning'}" style="font-weight: 700;">
              ${Number(bfDiff) > 0 ? `+${bfDiff}` : bfDiff}%
            </span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Início: ${initial.bodyFat}%</span>
        </div>

        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px;">
          <span style="color: var(--text-muted); font-size: 0.78rem; font-weight: 700; text-transform: uppercase;">4. Massa Muscular</span>
          <div style="margin: 6px 0; display: flex; align-items: baseline; justify-content: space-between;">
            <span style="font-size: 1.8rem; font-weight: 800; color: var(--jet-emerald); font-family: 'Outfit', sans-serif;">
              ${latest.muscleMassKg || (latest.weightKg * 0.55).toFixed(1)} <span style="font-size: 1rem; color: var(--text-muted);">kg</span>
            </span>
            <span class="badge badge-success" style="font-size: 0.72rem;">Massa Magra</span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Última avaliação: ${latest.date ? latest.date.split('-').reverse().join('/') : '-'}</span>
        </div>
      </div>

      <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 22px; margin-bottom: 24px; overflow-x: auto;">
        <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.25rem; margin-bottom: 14px; color: #fff;">
          Histórico Completo de Avaliações Físicas
        </h3>

        <table class="app-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Peso</th>
              <th>Altura</th>
              <th>IMC</th>
              <th>Gordura Corporal</th>
              <th>Massa Muscular</th>
              <th>Medidas (Tórax/Cintura)</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            ${evolutions.length === 0 ? `
              <tr>
                <td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted);">
                  Nenhuma avaliação registrada para este aluno.
                </td>
              </tr>
            ` : evolutions.map(evo => {
              const h = evo.heightCm || 178;
              const calcImc = Number(evo.imc || (evo.weightKg / Math.pow(h/100, 2)).toFixed(1));
              return `
                <tr>
                  <td><strong>${evo.date ? evo.date.split('-').reverse().join('/') : '-'}</strong></td>
                  <td><span style="color: #fff; font-weight: 800;">${evo.weightKg} kg</span></td>
                  <td>${h} cm</td>
                  <td>
                    <span class="badge ${calcImc < 25 ? 'badge-success' : 'badge-warning'}">
                      ${calcImc} kg/m²
                    </span>
                  </td>
                  <td><span style="color: #FFB800; font-weight: 700;">${evo.bodyFat || '-'}%</span></td>
                  <td><span style="color: var(--jet-emerald); font-weight: 700;">${evo.muscleMassKg ? `${evo.muscleMassKg} kg` : '-'}</span></td>
                  <td>${evo.chestCm ? `${evo.chestCm}cm / ${evo.waistCm}cm` : '-'}</td>
                  <td style="font-size: 0.82rem; color: var(--text-secondary); max-width: 220px;">
                    ${evo.notes || 'Avaliação biométrica regular'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div id="newEvaluationModal" class="modal-overlay">
        <div class="modal-content" style="max-width: 600px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 20px;">
          <div class="modal-header" style="border-bottom: 1px solid var(--jet-border); padding-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${Icons.sparkles('', 20)}
              <h3 class="modal-title" style="font-family: 'Outfit', sans-serif;">Nova Avaliação Física & Bioimpedância</h3>
            </div>
            <button id="closeNewEvoModalBtn" class="modal-close">&times;</button>
          </div>
          <form id="adminNewEvaluationForm">
            <input type="hidden" id="newEvoStudentId" value="${currentStudent?.id}">

            <div class="modal-body" style="padding: 16px 0;">
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div class="form-group">
                  <label class="form-label">Data da Avaliação</label>
                  <input type="date" id="newEvoDate" class="form-input" required value="${new Date().toISOString().split('T')[0]}" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Peso Corporal (kg)</label>
                  <input type="number" step="0.1" id="newEvoWeight" class="form-input" placeholder="Ex: 78.5" required value="${latest.weightKg}" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Altura (cm)</label>
                  <input type="number" id="newEvoHeight" class="form-input" placeholder="Ex: 178" required value="${latest.heightCm || 178}" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div class="form-group">
                  <label class="form-label">Gordura Corporal (% BF)</label>
                  <input type="number" step="0.1" id="newEvoBodyFat" class="form-input" placeholder="Ex: 14.5" required value="${latest.bodyFat}" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Massa Muscular (kg)</label>
                  <input type="number" step="0.1" id="newEvoMuscleMass" class="form-input" placeholder="Ex: 42.0" required value="${latest.muscleMassKg || 40}" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
              </div>

              <div style="font-size: 0.8rem; font-weight: 700; color: #CBD5E1; margin: 12px 0 6px 0;">Circunferências Corporais (cm)</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div class="form-group">
                  <label class="form-label" style="font-size: 0.75rem;">Tórax</label>
                  <input type="number" id="newEvoChest" class="form-input" value="${latest.chestCm || 100}" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size: 0.75rem;">Bíceps</label>
                  <input type="number" id="newEvoArms" class="form-input" value="${latest.armsCm || 37}" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size: 0.75rem;">Cintura</label>
                  <input type="number" id="newEvoWaist" class="form-input" value="${latest.waistCm || 80}" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size: 0.75rem;">Coxa</label>
                  <input type="number" id="newEvoThighs" class="form-input" value="${latest.thighsCm || 58}" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Parecer / Observações do Avaliador</label>
                <input type="text" id="newEvoNotes" class="form-input" placeholder="Ex: Excelente ganho de massa magra e redução de 1.2% de gordura." style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
              </div>
            </div>

            <div class="modal-footer" style="border-top: 1px solid var(--jet-border); padding-top: 14px;">
              <button type="button" id="closeNewEvoModalBtn2" class="btn btn-secondary">Cancelar</button>
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
