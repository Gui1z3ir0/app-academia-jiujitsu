import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

export function renderAdminDashboard() {
  const students = store.getStudents();
  const personals = store.getPersonals();
  const payments = store.getPayments();
  const plans = store.getPlans();
  const coachMessages = store.getMensagensPersonal();
  const pendingCoachMessages = coachMessages.filter(m => m.status === 'pendente');

  const totalStudents = students.length;
  const paidThisMonthStudents = students.filter(s => s.isPaidThisMonth);
  const pendingThisMonthStudents = students.filter(s => !s.isPaidThisMonth);
  const lateStudents = students.filter(s => s.status === 'atrasado');

  const mrr = students.reduce((acc, s) => acc + (s.monthlyAmount || 0), 0);
  const totalRecebidoMes = paidThisMonthStudents.reduce((acc, s) => acc + (s.monthlyAmount || 0), 0);
  const totalPendenteMes = pendingThisMonthStudents.reduce((acc, s) => acc + (s.monthlyAmount || 0), 0);

  const studentsWithFaltas = students.filter(s => s.faltasCount > 0);

  return `
    <div class="admin-dashboard-module">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 24px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; color: var(--jet-emerald, #00F59B); font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
            ${Icons.bolt('', 16)} CT JEFFERSON CALISTO — GESTÃO & PERSONAL
          </div>
          <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 4px 0;">Painel de Controle do Dono & Treinador</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Acompanhe novos cadastros, pagamentos do mês, faltas de alunos e mensagens com prioridade.
          </p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button id="openNewStudentModalBtn" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
            ${Icons.plus('', 16)}
            <span>Novo Aluno</span>
          </button>
          <button class="btn btn-secondary btn-sm jump-to-tab-btn" data-target="admin_students" style="display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.users('', 16)}
            <span>Gerenciar Alunos</span>
          </button>
          <button class="btn btn-secondary btn-sm jump-to-tab-btn" data-target="admin_finances" style="display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.card('', 16)}
            <span>Financeiro & PIX</span>
          </button>
        </div>
      </div>

      <div class="glass-panel" style="padding: 22px; margin-bottom: 24px; border: 1px solid rgba(0, 245, 155, 0.35); background: linear-gradient(135deg, rgba(13, 19, 31, 0.98), rgba(15, 23, 42, 0.95));">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #00F59B, #00E5FF); display: flex; align-items: center; justify-content: center; color: #06090F;">
              ${Icons.bolt('', 22)}
            </div>
            <div>
              <h3 style="margin: 0; font-size: 1.15rem; color: #fff; font-family: 'Outfit', sans-serif;">
                Mensagens Diretas dos Alunos (Treinador Jefferson)
              </h3>
              <div style="font-size: 0.78rem; color: #94A3B8;">
                Canal prioritário onde você atua diretamente como Personal Trainer dos seus alunos.
              </div>
            </div>
          </div>
          <span class="badge ${pendingCoachMessages.length > 0 ? 'badge-danger' : 'badge-success'}" style="font-size: 0.82rem; font-weight: 800; padding: 6px 12px;">
            ${pendingCoachMessages.length} Mensagem(ns) Pendente(s)
          </span>
        </div>

        ${pendingCoachMessages.length === 0 ? `
          <div style="text-align: center; padding: 24px; background: rgba(0, 245, 155, 0.04); border-radius: 12px; border: 1px dashed rgba(0, 245, 155, 0.2);">
            <p style="color: var(--jet-emerald, #00F59B); font-weight: 700; margin: 0;">
              ✨ Todas as dúvidas e mensagens prioritárias dos alunos foram atendidas!
            </p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${pendingCoachMessages.map(msg => `
              <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid ${msg.prioridade === 'alta' ? 'rgba(255, 71, 87, 0.4)' : 'rgba(255, 255, 255, 0.1)'}; border-radius: 14px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
                <div style="flex: 1; min-width: 240px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <strong style="color: #fff; font-size: 0.95rem;">${msg.nomeAluno}</strong>
                    <span class="badge ${msg.prioridade === 'alta' ? 'badge-danger' : (msg.prioridade === 'media' ? 'badge-warning' : 'badge-cyan')}" style="font-weight: 800; font-size: 0.72rem;">
                      ${msg.prioridade === 'alta' ? '🔴 ALTA PRIORIDADE (DOR/LESÃO)' : (msg.prioridade === 'media' ? '🟡 MÉDIA (TREINO)' : '🟢 GERAL')}
                    </span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${msg.dataFormatada}</span>
                  </div>
                  <div style="font-size: 0.85rem; font-weight: 700; color: var(--jet-emerald, #00F59B); margin-bottom: 2px;">
                    Assunto: ${msg.assunto}
                  </div>
                  <p style="font-size: 0.86rem; color: #CBD5E1; margin: 0; line-height: 1.4;">
                    "${msg.mensagem}"
                  </p>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  ${msg.telefone ? `
                    <button class="btn btn-primary btn-sm send-whatsapp-reminder" data-phone="${msg.telefone}" data-name="${msg.nomeAluno}" data-amount="" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; background: #25D366; border-color: #25D366; color: #000;">
                      ${Icons.whatsapp('', 15)}
                      <span>Responder no WhatsApp</span>
                    </button>
                  ` : ''}
                  <button class="btn btn-secondary btn-sm mark-coach-msg-resolved-btn" data-msg-id="${msg.id}" style="display: inline-flex; align-items: center; gap: 6px;">
                    ${Icons.check('', 14)}
                    <span>Concluir</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div class="kpi-metrics-grid" style="margin-bottom: 24px;">
        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-title">Pagos no Mês Atual</span>
            <div class="kpi-icon-badge green">${Icons.checkCircle('', 18)}</div>
          </div>
          <div class="kpi-value">${paidThisMonthStudents.length} <span style="font-size: 1.1rem; color: var(--text-muted);">/ ${totalStudents} alunos</span></div>
          <div class="kpi-trend">
            <span class="trend-badge up">R$ ${totalRecebidoMes.toFixed(2)}</span>
            <span>recebido no mês</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-title">Pendentes no Mês</span>
            <div class="kpi-icon-badge ruby">${Icons.clock('', 18)}</div>
          </div>
          <div class="kpi-value" style="color: ${pendingThisMonthStudents.length > 0 ? '#FF6B7A' : 'var(--jet-emerald)'};">
            ${pendingThisMonthStudents.length} <span style="font-size: 1rem; color: var(--text-muted);">(R$ ${totalPendenteMes.toFixed(2)})</span>
          </div>
          <div class="kpi-trend">
            <span class="trend-badge ${pendingThisMonthStudents.length > 0 ? 'down' : 'up'}">${pendingThisMonthStudents.length} a receber</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-title">Previsão Mensal (MRR)</span>
            <div class="kpi-icon-badge cyan">${Icons.trendingUp('', 18)}</div>
          </div>
          <div class="kpi-value">R$ ${mrr.toFixed(2)}</div>
          <div class="kpi-trend">
            <span class="trend-badge up">Planos R$ 120 e R$ 150</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top-row">
            <span class="kpi-title">Alunos com Faltas</span>
            <div class="kpi-icon-badge amber">${Icons.calendar('', 18)}</div>
          </div>
          <div class="kpi-value">${studentsWithFaltas.length}</div>
          <div class="kpi-trend">
            <span class="trend-badge down">${studentsWithFaltas.reduce((acc, s) => acc + s.faltasCount, 0)} falta(s) registradas</span>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px; margin-bottom: 24px;">
        <div class="glass-panel" style="padding: 22px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 1.15rem; display: flex; align-items: center; gap: 8px; margin: 0;">
              <span style="color: var(--jet-emerald); display: flex;">${Icons.card('', 18)}</span>
              <span>Status de Pagamento do Mês</span>
            </h3>
            <span class="badge badge-cyan">${paidThisMonthStudents.length} de ${totalStudents} Pagos</span>
          </div>

          ${totalStudents === 0 ? `
            <p style="color: var(--text-muted); text-align: center; padding: 20px;">Nenhum aluno cadastrado ainda.</p>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto;">
              ${students.map(st => `
                <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="color: #fff; font-size: 0.9rem;">${st.name}</strong>
                    <div style="font-size: 0.75rem; color: #94A3B8;">
                      ${st.planName} • R$ ${st.monthlyAmount.toFixed(2)}
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge ${st.isPaidThisMonth ? 'badge-success' : 'badge-danger'}" style="font-weight: 700; font-size: 0.75rem;">
                      ${st.isPaidThisMonth ? '✓ Pago no Mês' : '● Pendente'}
                    </span>
                    ${!st.isPaidThisMonth && st.phone ? `
                      <button class="btn btn-primary btn-sm send-whatsapp-reminder" data-phone="${st.phone}" data-name="${st.name}" data-amount="${st.monthlyAmount}" title="Cobrar WhatsApp" style="padding: 6px 8px;">
                        ${Icons.whatsapp('', 14)}
                      </button>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <div class="glass-panel" style="padding: 22px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 1.15rem; display: flex; align-items: center; gap: 8px; margin: 0;">
              <span style="color: #FFB800; display: flex;">${Icons.calendar('', 18)}</span>
              <span>Faltas e Frequência de Treino</span>
            </h3>
            <span class="badge badge-warning">${studentsWithFaltas.length} com Faltas</span>
          </div>

          ${totalStudents === 0 ? `
            <p style="color: var(--text-muted); text-align: center; padding: 20px;">Nenhum aluno cadastrado ainda.</p>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto;">
              ${students.map(st => `
                <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="color: #fff; font-size: 0.9rem;">${st.name}</strong>
                    <div style="font-size: 0.75rem; color: #94A3B8;">
                      Peso: ${st.currentWeight || 75} kg • Altura: ${st.heightCm || 175} cm
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge ${st.faltasCount > 0 ? 'badge-danger' : 'badge-success'}" style="font-weight: 700; font-size: 0.75rem;">
                      ${st.faltasCount} Falta(s)
                    </span>
                    <button class="btn btn-secondary btn-sm admin-add-falta-btn" data-student-id="${st.id}" data-student-name="${st.name}" title="Registrar Falta" style="padding: 4px 8px; font-size: 0.72rem; font-weight: 700;">
                      + Falta
                    </button>
                    ${st.faltasCount > 0 ? `
                      <button class="btn btn-secondary btn-sm admin-remove-falta-btn" data-student-id="${st.id}" title="Remover Falta" style="padding: 4px 8px; font-size: 0.72rem;">
                        -
                      </button>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}
