import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

export function renderStudentProfileView(studentId) {
  const student = store.getStudents().find(s => s.id === studentId) || store.getActiveStudent();
  const plan = store.getPlan(student.planId) || store.getPlans()[0];
  const matricula = store.getMatriculaPorUsuario(student.id) || {
    inicio: '2026-01-10',
    termino: '2027-01-10',
    status: 'Ativa'
  };

  return `
    <div class="student-profile-module">
      <div style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 8px; color: var(--jet-emerald); font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ${Icons.user('', 16)} DADOS CADASTRAIS, PRIVACIDADE & ACESSO
        </div>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 4px 0;">Meu Perfil</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Consulte seus dados pessoais, graduação no Jiu-Jítsu, plano contratado e controles de privacidade (LGPD).
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 24px;">
        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 20px; padding: 26px;">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 22px;">
            <img src="${student.avatar}" style="width: 72px; height: 72px; border-radius: 20px; object-fit: cover; border: 2px solid var(--jet-emerald); box-shadow: 0 0 16px rgba(0, 245, 155, 0.25);" alt="Avatar">
            <div>
              <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.4rem; margin: 0; color: #fff;">
                ${student.name}
              </h3>
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">
                ${student.email}
              </div>
              <div style="margin-top: 6px; display: flex; gap: 6px; flex-wrap: wrap;">
                <span class="badge badge-cyan" style="font-weight: 700;">Aluno</span>
                <span class="badge badge-success" style="font-weight: 700;">🥋 Faixa ${student.faixaJiuJitsu || 'Branca'} (${student.grausJiuJitsu || 0}º Grau)</span>
              </div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px; border-top: 1px solid var(--jet-border); padding-top: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-muted); font-size: 0.85rem;">Telefone (WhatsApp):</span>
              <strong style="color: #fff; font-size: 0.9rem;">${student.phone || '-'}</strong>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-muted); font-size: 0.85rem;">Peso / Altura:</span>
              <strong style="color: #fff; font-size: 0.9rem;">${student.currentWeight} kg • ${student.heightCm} cm</strong>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-muted); font-size: 0.85rem;">Objetivo de Treino:</span>
              <strong style="color: var(--jet-emerald); font-size: 0.9rem;">${student.goal || 'Saúde & Performance'}</strong>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-muted); font-size: 0.85rem;">Dias de Treino:</span>
              <strong style="color: var(--jet-cyan); font-size: 0.85rem;">${(student.diasTreinoSemana || []).join(', ')}</strong>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-muted); font-size: 0.85rem;">Status da Matrícula:</span>
              <span class="badge ${student.status !== 'atrasado' ? 'badge-success' : 'badge-danger'}" style="font-weight: 700;">
                ${student.status !== 'atrasado' ? '● Regular / Ativa' : '● Mensalidade Pendente'}
              </span>
            </div>
          </div>
        </div>

        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 20px; padding: 26px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
              <div>
                <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 1px;">Plano Contratado</span>
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin: 2px 0 0 0; color: var(--jet-cyan);">
                  ${plan.name}
                </h3>
              </div>
              <span class="badge badge-success">Matrícula ${matricula.status}</span>
            </div>

            <div style="background: var(--jet-card-elevated); border-radius: 14px; padding: 16px; margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: var(--text-muted); font-size: 0.85rem;">Mensalidade:</span>
                <strong style="color: #fff; font-size: 1.1rem; font-family: 'Outfit', sans-serif;">R$ ${Number(student.monthlyAmount || plan.price || 120).toFixed(2)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted); font-size: 0.85rem;">Próximo Vencimento:</span>
                <strong style="color: #FFB800; font-size: 0.9rem;">${student.dueDate ? student.dueDate.split('-').reverse().join('/') : '-'}</strong>
              </div>
            </div>

            <div>
              <div style="font-size: 0.8rem; font-weight: 700; color: #CBD5E1; margin-bottom: 8px;">Benefícios Inclusos no seu Plano:</div>
              <ul style="margin: 0; padding-left: 20px; font-size: 0.82rem; color: #94A3B8; line-height: 1.6;">
                ${(plan.benefits || ['Acesso completo às modalidades do plano']).map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div style="margin-top: 20px; border-top: 1px solid var(--jet-border); padding-top: 16px;">
            <button id="openGymPassProfileBtn" class="btn btn-primary" style="width: 100%; padding: 12px; font-weight: 700; font-size: 0.92rem; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
              ${Icons.idCard('', 16)}
              <span>Abrir Carteirinha Digital do Aluno</span>
            </button>
          </div>
        </div>
      </div>

      <div style="background: rgba(255, 71, 87, 0.06); border: 1px solid rgba(255, 71, 87, 0.25); border-radius: 16px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div>
          <strong style="color: #FF6B7A; font-size: 0.95rem; display: block;">Privacidade & Exclusão de Conta (LGPD - Lei nº 13.709/2018)</strong>
          <span style="font-size: 0.82rem; color: var(--text-secondary);">
            Você tem o direito de solicitar a exclusão permanente da sua conta, histórico de avaliações físicas e dados cadastrais.
          </span>
        </div>
        <button type="button" id="deleteMyAccountLgpdBtn" class="btn btn-danger btn-sm" style="font-weight: 800;">
          ${Icons.trash('', 14)} Excluir Minha Conta e Dados
        </button>
      </div>
    </div>
  `;
}
