import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

export function renderStudentEvolution(studentId) {
  const student = store.getStudents().find(s => s.id === studentId) || store.getActiveStudent();
  const evolutions = store.getEvolutions(student.id);

  const latest = evolutions.length > 0 ? evolutions[evolutions.length - 1] : {
    weightKg: student.currentWeight || 76,
    heightCm: student.heightCm || 178,
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
  let imcStatusLabel = 'Peso Ideal (OMS)';
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
    <div class="student-evolution-module">
      <div style="margin-bottom: 24px;">
        <h2>Minha Avaliação Física & Bioimpedância</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Conforme acompanhamento do seu professor: Peso, Altura, IMC, Gordura Corporal e Massa Muscular.
        </p>
      </div>

      <div class="evolution-dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="evolution-metric-card" style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px;">
          <span class="evolution-metric-title" style="color: var(--text-muted); font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">1. Peso Corporal</span>
          <div class="evolution-values-row" style="margin: 6px 0; display: flex; align-items: baseline; justify-content: space-between;">
            <span class="evolution-current-val" style="font-size: 1.8rem; font-weight: 800; color: #fff; font-family: 'Outfit', sans-serif;">
              ${latest.weightKg} <span style="font-size: 1rem; color: var(--text-muted);">kg</span>
            </span>
            <span class="evolution-diff-tag ${Number(weightDiff) <= 0 ? 'positive' : 'negative'}" style="font-size: 0.8rem; font-weight: 700;">
              ${Number(weightDiff) > 0 ? `+${weightDiff}` : weightDiff} kg
            </span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Início: ${initial.weightKg} kg</span>
        </div>

        <div class="evolution-metric-card" style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px;">
          <span class="evolution-metric-title" style="color: var(--text-muted); font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">2. Altura & IMC</span>
          <div class="evolution-values-row" style="margin: 6px 0; display: flex; align-items: baseline; justify-content: space-between;">
            <span class="evolution-current-val" style="font-size: 1.8rem; font-weight: 800; color: var(--jet-cyan); font-family: 'Outfit', sans-serif;">
              ${imcVal} <span style="font-size: 0.9rem; color: var(--text-muted);">kg/m²</span>
            </span>
            <span class="badge ${imcBadgeClass}" style="font-size: 0.72rem; font-weight: 700;">
              ${imcStatusLabel}
            </span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Estatura Cadastrada: ${latest.heightCm || student.heightCm || 178} cm</span>
        </div>

        <div class="evolution-metric-card" style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px;">
          <span class="evolution-metric-title" style="color: var(--text-muted); font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">3. Gordura Corporal (% BF)</span>
          <div class="evolution-values-row" style="margin: 6px 0; display: flex; align-items: baseline; justify-content: space-between;">
            <span class="evolution-current-val" style="font-size: 1.8rem; font-weight: 800; color: #FFB800; font-family: 'Outfit', sans-serif;">
              ${latest.bodyFat}%
            </span>
            <span class="evolution-diff-tag ${Number(bfDiff) <= 0 ? 'positive' : 'negative'}" style="font-size: 0.8rem; font-weight: 700;">
              ${Number(bfDiff) > 0 ? `+${bfDiff}` : bfDiff}%
            </span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Início: ${initial.bodyFat}%</span>
        </div>

        <div class="evolution-metric-card" style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px;">
          <span class="evolution-metric-title" style="color: var(--text-muted); font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">4. Massa Muscular</span>
          <div class="evolution-values-row" style="margin: 6px 0; display: flex; align-items: baseline; justify-content: space-between;">
            <span class="evolution-current-val" style="font-size: 1.8rem; font-weight: 800; color: var(--jet-emerald); font-family: 'Outfit', sans-serif;">
              ${latest.muscleMassKg || (latest.weightKg * 0.55).toFixed(1)} <span style="font-size: 1rem; color: var(--text-muted);">kg</span>
            </span>
            <span class="badge badge-success" style="font-size: 0.72rem;">
              Massa Magra
            </span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Última avaliação: ${latest.date ? latest.date.split('-').reverse().join('/') : '-'}</span>
        </div>
      </div>

      <div class="chart-container-card" style="margin-bottom: 24px;">
        <div class="chart-header">
          <div>
            <h3 style="font-size: 1.15rem;">Curva de Peso Corporal (kg)</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Progresso ao longo das avaliações físicas</span>
          </div>
          <span class="badge badge-success">Em Constante Evolução</span>
        </div>

        <div class="svg-chart-wrapper">
          <svg viewBox="0 0 500 220" style="width: 100%; height: 100%;" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#00F59B" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#00F59B" stop-opacity="0.0"/>
              </linearGradient>
            </defs>

            <line x1="40" y1="40" x2="480" y2="40" stroke="#1E293B" stroke-width="1" stroke-dasharray="4"/>
            <line x1="40" y1="90" x2="480" y2="90" stroke="#1E293B" stroke-width="1" stroke-dasharray="4"/>
            <line x1="40" y1="140" x2="480" y2="140" stroke="#1E293B" stroke-width="1" stroke-dasharray="4"/>
            <line x1="40" y1="190" x2="480" y2="190" stroke="#334155" stroke-width="1"/>

            <text x="30" y="45" text-anchor="end" fill="#64748B" font-size="10">90kg</text>
            <text x="30" y="95" text-anchor="end" fill="#64748B" font-size="10">80kg</text>
            <text x="30" y="145" text-anchor="end" fill="#64748B" font-size="10">70kg</text>
            <text x="30" y="195" text-anchor="end" fill="#64748B" font-size="10">60kg</text>

            ${chartPoints.length > 1 ? `
              <polygon points="40,190 ${polylineStr} 480,190" fill="url(#chartGradient)"/>
              <polyline points="${polylineStr}" fill="none" stroke="#00F59B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            ` : ''}

            ${chartPoints.map(p => `
              <circle cx="${p.x}" cy="${p.y}" r="6" fill="#090D16" stroke="#00F59B" stroke-width="3"/>
              <text x="${p.x}" y="${p.y - 12}" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="700">${p.weight} kg</text>
              <text x="${p.x}" y="208" text-anchor="middle" fill="#64748B" font-size="9">${p.date.split('-').reverse().slice(0, 2).join('/')}</text>
            `).join('')}
          </svg>
        </div>
      </div>

      <div class="measurements-table-card" style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px; overflow-x: auto; margin-bottom: 24px;">
        <h3 style="font-size: 1.15rem; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
          ${Icons.sparkles('', 18)}
          <span>Histórico das Avaliações Físicas</span>
        </h3>

        <table class="app-table">
          <thead>
            <tr>
              <th>Data da Avaliação</th>
              <th>Peso</th>
              <th>Altura</th>
              <th>IMC</th>
              <th>Gordura Corporal</th>
              <th>Massa Muscular</th>
              <th>Observações do Professor</th>
            </tr>
          </thead>
          <tbody>
            ${evolutions.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">
                  Nenhuma avaliação física cadastrada até o momento.
                </td>
              </tr>
            ` : evolutions.map(evo => {
              const h = evo.heightCm || student.heightCm || 178;
              const calcImc = Number(evo.imc || (evo.weightKg / Math.pow(h/100, 2)).toFixed(1));
              return `
                <tr>
                  <td><strong>${evo.date.split('-').reverse().join('/')}</strong></td>
                  <td><span style="color: #fff; font-weight: 800;">${evo.weightKg} kg</span></td>
                  <td>${h} cm</td>
                  <td>
                    <span class="badge ${calcImc < 25 ? 'badge-success' : 'badge-warning'}" style="font-weight: 700;">
                      ${calcImc} kg/m²
                    </span>
                  </td>
                  <td><span style="color: #FFB800; font-weight: 700;">${evo.bodyFat || '-'}%</span></td>
                  <td><span style="color: var(--jet-emerald); font-weight: 700;">${evo.muscleMassKg ? `${evo.muscleMassKg} kg` : '-'}</span></td>
                  <td style="font-size: 0.82rem; color: var(--text-secondary); max-width: 250px;">
                    ${evo.notes || 'Avaliação biométrica de rotina'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="glass-panel" style="padding: 24px;">
        <h3 style="font-size: 1.15rem; margin-bottom: 16px;">Cargas Máximas nos Levantamentos</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px;">
          <div style="background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); text-align: center;">
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Supino Reto</div>
            <div style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; font-weight: 800; color: var(--neon-green); margin: 4px 0;">
              ${latest.benchPressKg || 80} kg
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Peito & Tríceps</div>
          </div>

          <div style="background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); text-align: center;">
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Agachamento Livre</div>
            <div style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; font-weight: 800; color: var(--amber-warning); margin: 4px 0;">
              ${latest.squatKg || 100} kg
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Quadríceps & Glúteos</div>
          </div>

          <div style="background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); text-align: center;">
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Levantamento Terra</div>
            <div style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; font-weight: 800; color: var(--neon-cyan); margin: 4px 0;">
              ${latest.deadliftKg || 130} kg
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Cadeia Posterior</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
