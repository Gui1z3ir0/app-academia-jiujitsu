import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

const BELT_COLORS = {
  Branca: { bg: '#F8FAFC', text: '#0F172A', border: '#CBD5E1', tip: '#090D16' },
  Azul: { bg: '#1D4ED8', text: '#FFFFFF', border: '#3B82F6', tip: '#090D16' },
  Roxa: { bg: '#6D28D9', text: '#FFFFFF', border: '#8B5CF6', tip: '#090D16' },
  Marrom: { bg: '#78350F', text: '#FFFFFF', border: '#92400E', tip: '#090D16' },
  Preta: { bg: '#111827', text: '#FFFFFF', border: '#EF4444', tip: '#DC2626' }
};

function renderBeltVisual(faixa = 'Branca', graus = 0) {
  const style = BELT_COLORS[faixa] || BELT_COLORS.Branca;
  const stripeCount = Math.max(0, Math.min(4, Number(graus) || 0));

  return `
    <div style="display: flex; align-items: center; width: 100%; max-width: 360px; height: 34px; border-radius: 6px; overflow: hidden; border: 2px solid ${style.border}; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
      <div style="flex: 1; height: 100%; background: ${style.bg}; color: ${style.text}; display: flex; align-items: center; padding: 0 12px; font-weight: 900; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px;">
        FAIXA ${faixa.toUpperCase()}
      </div>
      <div style="width: 82px; height: 100%; background: ${style.tip}; display: flex; align-items: center; justify-content: flex-start; gap: 6px; padding: 0 10px;">
        ${Array.from({ length: 4 }).map((_, i) => `
          <div style="width: 7px; height: 100%; background: ${i < stripeCount ? '#FFFFFF' : 'rgba(255,255,255,0.12)'};"></div>
        `).join('')}
      </div>
    </div>
  `;
}

export function renderJiuJitsuView() {
  const isPersonal = store.isPersonal();
  const turmas = store.getTurmasJiuJitsu();
  const students = store.getStudents();
  const activeStudent = store.getActiveStudent();
  const presencas = isPersonal
    ? store.getPresencasJiuJitsu()
    : store.getPresencasJiuJitsu(activeStudent.id);

  if (!isPersonal) {
    const pct = Math.min(100, Math.round(((activeStudent.aulasJiuJitsu || 0) / (activeStudent.metaAulasGraduacao || 40)) * 100));
    return `
      <div class="jiujitsu-student-module">
        <div style="margin-bottom: 24px;">
          <div style="font-size: 0.78rem; font-weight: 800; color: var(--jet-emerald); text-transform: uppercase; letter-spacing: 1px;">
            🥋 JIU-JÍTSU & GRADUAÇÃO
          </div>
          <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 4px 0;">Minha Evolução no Tatame</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Acompanhe sua faixa, graus conquistados, frequência nas aulas e os horários das turmas.
          </p>
        </div>

        <div class="glass-panel" style="padding: 24px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 18px; margin-bottom: 18px;">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">
                Sua Graduação Atual
              </div>
              ${renderBeltVisual(activeStudent.faixaJiuJitsu, activeStudent.grausJiuJitsu)}
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;">
                Faixa <strong>${activeStudent.faixaJiuJitsu || 'Branca'}</strong> • <strong>${activeStudent.grausJiuJitsu || 0}º Grau</strong>
              </div>
            </div>

            <div style="min-width: 240px; flex: 1; max-width: 340px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                <span style="color: var(--text-secondary); font-weight: 700;">Progresso p/ Próximo Grau</span>
                <strong style="color: var(--jet-emerald);">${activeStudent.aulasJiuJitsu || 0} / ${activeStudent.metaAulasGraduacao || 40} aulas (${pct}%)</strong>
              </div>
              <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #00F59B, #00E5FF);"></div>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">
                Presenças confirmadas pelo Personal contam automaticamente para sua graduação.
              </div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
          <div class="glass-panel" style="padding: 24px;">
            <h3 style="font-size: 1.15rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
              ${Icons.calendar('', 18)}
              <span>Grade de Turmas de Jiu-Jítsu</span>
            </h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${turmas.map(t => `
                <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 14px 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="color: #fff; font-size: 0.96rem;">${t.nome}</strong>
                    <span class="badge badge-cyan">${t.horario}</span>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--jet-emerald); font-weight: 700;">
                    ${t.modalidade} • ${(t.dias || []).join(', ')}
                  </div>
                  <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 4px;">
                    Instrutor: ${t.professor} • Capacidade: ${t.capacidade} alunos
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="glass-panel" style="padding: 24px;">
            <h3 style="font-size: 1.15rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
              ${Icons.check('', 18)}
              <span>Minhas Presenças no Tatame (${presencas.length})</span>
            </h3>
            ${presencas.length === 0 ? `
              <div style="text-align: center; padding: 28px; color: var(--text-muted);">
                Nenhuma presença registrada ainda. Compareça às aulas para acumular presenças!
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${presencas.slice(0, 12).map(p => `
                  <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong style="color: #fff; font-size: 0.9rem; display: block;">${p.turmaNome}</strong>
                      <span style="font-size: 0.76rem; color: var(--text-muted);">${p.modalidade || 'Jiu-Jítsu'} • ${p.horario || ''}</span>
                    </div>
                    <span class="badge badge-success">${p.data ? p.data.split('-').reverse().join('/') : 'Presente'}</span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="jiujitsu-personal-module">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 24px;">
        <div>
          <div style="font-size: 0.78rem; font-weight: 800; color: var(--jet-emerald); text-transform: uppercase; letter-spacing: 1px;">
            🥋 GESTÃO DE JIU-JÍTSU & TATAME
          </div>
          <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 4px 0;">Turmas, Chamada & Graduação (Faixas)</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Controle a presença dos alunos nas turmas, atualize faixas/graus e gerencie os horários de aula.
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px; margin-bottom: 24px;">
        <div class="glass-panel" style="padding: 24px;">
          <h3 style="font-size: 1.15rem; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
            ${Icons.check('', 18)}
            <span>Registrar Presença na Turma (Chamada)</span>
          </h3>
          ${students.length === 0 ? `
            <p style="color: var(--text-muted); font-size: 0.88rem;">Cadastre alunos primeiro para registrar presenças no Jiu-Jítsu.</p>
          ` : `
            <form id="jjAttendanceForm">
              <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label">Selecionar Aluno</label>
                <select id="jjAttStudentSelect" class="form-select" required>
                  ${students.map(s => `
                    <option value="${s.id}">${s.name} — Faixa ${s.faixaJiuJitsu} (${s.grausJiuJitsu}º Grau)</option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label">Turma / Horário</label>
                <select id="jjAttClassSelect" class="form-select" required>
                  ${turmas.map(t => `
                    <option value="${t.id}">${t.nome} (${t.horario} - ${(t.dias || []).join('/')})</option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 14px;">
                <label class="form-label">Data da Aula</label>
                <input type="date" id="jjAttDate" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">
                ✓ Confirmar Presença no Tatame (+1 Aula)
              </button>
            </form>
          `}
        </div>

        <div class="glass-panel" style="padding: 24px;">
          <h3 style="font-size: 1.15rem; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
            ${Icons.plus('', 18)}
            <span>Nova Turma / Horário de Jiu-Jítsu</span>
          </h3>
          <form id="jjNewClassForm">
            <div class="form-group" style="margin-bottom: 10px;">
              <label class="form-label">Nome da Turma</label>
              <input type="text" id="jjClassName" class="form-input" placeholder="Ex: Jiu-Jítsu Competição (Gi)" required>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
              <div class="form-group">
                <label class="form-label">Modalidade</label>
                <select id="jjClassModality" class="form-select">
                  <option value="Gi (Com Kimono)">Gi (Com Kimono)</option>
                  <option value="No-Gi (Sem Kimono)">No-Gi (Sem Kimono)</option>
                  <option value="Fundamentos">Fundamentos</option>
                  <option value="Todos os Níveis">Todos os Níveis</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Horário</label>
                <input type="time" id="jjClassTime" class="form-input" value="19:30" required>
              </div>
            </div>
            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label">Dias da Semana (separados por vírgula)</label>
              <input type="text" id="jjClassDays" class="form-input" value="Segunda, Quarta, Sexta" required>
            </div>
            <button type="submit" class="btn btn-secondary" style="width: 100%;">
              + Adicionar Turma à Grade
            </button>
          </form>
        </div>
      </div>

      <div class="glass-panel" style="padding: 24px; margin-bottom: 24px;">
        <h3 style="font-size: 1.15rem; margin-bottom: 16px;">Graduação & Faixas dos Alunos (${students.length})</h3>
        ${students.length === 0 ? `
          <div style="text-align: center; padding: 24px; color: var(--text-muted);">Nenhum aluno cadastrado.</div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${students.map(s => `
              <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 14px; min-width: 240px;">
                  <img src="${s.avatar}" style="width: 44px; height: 44px; border-radius: 50%;" alt="">
                  <div>
                    <strong style="font-size: 1rem; color: #fff; display: block;">${s.name}</strong>
                    <span style="font-size: 0.78rem; color: var(--jet-emerald); font-weight: 700;">
                      ${s.aulasJiuJitsu || 0} / ${s.metaAulasGraduacao || 40} aulas concluídas
                    </span>
                  </div>
                </div>

                <div style="flex: 1; min-width: 240px;">
                  ${renderBeltVisual(s.faixaJiuJitsu, s.grausJiuJitsu)}
                </div>

                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <select class="form-select jj-belt-select" data-student-id="${s.id}" style="width: 130px; padding: 6px 10px; font-size: 0.85rem;">
                    ${['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'].map(f => `
                      <option value="${f}" ${s.faixaJiuJitsu === f ? 'selected' : ''}>Faixa ${f}</option>
                    `).join('')}
                  </select>
                  <select class="form-select jj-stripes-select" data-student-id="${s.id}" style="width: 105px; padding: 6px 10px; font-size: 0.85rem;">
                    ${[0, 1, 2, 3, 4].map(g => `
                      <option value="${g}" ${Number(s.grausJiuJitsu) === g ? 'selected' : ''}>${g}º Grau</option>
                    `).join('')}
                  </select>
                  <button type="button" class="btn btn-primary btn-sm save-jj-graduation-btn" data-student-id="${s.id}">
                    Salvar Faixa
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div class="glass-panel" style="padding: 24px;">
        <h3 style="font-size: 1.15rem; margin-bottom: 14px;">Grade de Turmas Configuradas (${turmas.length})</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
          ${turmas.map(t => `
            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #fff; font-size: 0.95rem; display: block;">${t.nome}</strong>
                <span style="font-size: 0.8rem; color: var(--jet-cyan);">${t.horario} • ${(t.dias || []).join(', ')}</span>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${t.modalidade}</div>
              </div>
              <button type="button" class="btn btn-danger btn-sm remove-jj-class-btn" data-turma-id="${t.id}">
                ${Icons.trash('', 14)}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
