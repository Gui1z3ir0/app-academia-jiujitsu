import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

let paymentStatusFilter = 'all';

export function setPaymentStatusFilter(filter) {
  paymentStatusFilter = filter;
}

export function renderFinancialReports() {
  const payments = store.getPayments();
  const students = store.getStudents();
  const gym = store.getGymConfig();
  const feedbacks = store.getFeedbacks();
  const plans = store.getPlans();

  const filtered = payments.filter(p => {
    if (paymentStatusFilter === 'all') return true;
    return p.status === paymentStatusFilter;
  });

  const totalPaid = payments.filter(p => p.status === 'pago').reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status === 'pendente').reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalOverdue = payments.filter(p => p.status === 'atrasado').reduce((acc, p) => acc + (p.amount || 0), 0);

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status !== 'atrasado').length;
  const lateStudents = students.filter(s => s.status === 'atrasado').length;
  const adimplenciaRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 100;
  const mrr = students.reduce((acc, s) => acc + (s.monthlyAmount || 0), 0);
  const avgTicket = totalStudents > 0 ? (mrr / totalStudents).toFixed(2) : '119.90';
  const avgNps = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.nota || 5), 0) / feedbacks.length).toFixed(1)
    : '5.0';

  return `
    <div class="financial-reports-module">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 24px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; color: var(--jet-emerald); font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
            ${Icons.card('', 16)} GESTÃO FINANCEIRA & RELATÓRIOS
          </div>
          <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 4px 0;">Controle Financeiro & Mensalidades</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Acompanhe o status de pagamentos, faturamento recebido, inadimplência e gere relatórios gerenciais da academia.
          </p>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button id="openGymReportModalBtn" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 700;">
            ${Icons.sparkles('', 16)}
            <span>Gerar Relatório Executivo</span>
          </button>
          <button id="exportCsvFaturasBtn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 700;">
            ${Icons.trendingUp('', 16)}
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <div class="kpi-metrics-grid">
        <div class="kpi-card">
          <span class="kpi-title">Total Recebido (Pago)</span>
          <div class="kpi-value" style="color: var(--neon-green);">R$ ${totalPaid.toFixed(2)}</div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">${payments.filter(p => p.status === 'pago').length} faturas quitadas</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-title">A Receber (No Prazo)</span>
          <div class="kpi-value" style="color: var(--amber-warning);">R$ ${totalPending.toFixed(2)}</div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">${payments.filter(p => p.status === 'pendente').length} faturas aguardando</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-title">Em Atraso (Inadimplência)</span>
          <div class="kpi-value" style="color: var(--ruby-danger);">R$ ${totalOverdue.toFixed(2)}</div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">${payments.filter(p => p.status === 'atrasado').length} faturas vencidas</span>
        </div>
      </div>

      <div class="admin-toolbar">
        <div class="admin-filter-tabs">
          <button class="admin-filter-btn ${paymentStatusFilter === 'all' ? 'active' : ''}" data-pay-filter="all">
            Todas as Faturas (${payments.length})
          </button>
          <button class="admin-filter-btn ${paymentStatusFilter === 'pago' ? 'active' : ''}" data-pay-filter="pago">
            🟢 Pagas (${payments.filter(p => p.status === 'pago').length})
          </button>
          <button class="admin-filter-btn ${paymentStatusFilter === 'pendente' ? 'active' : ''}" data-pay-filter="pendente">
            🟡 Pendentes (${payments.filter(p => p.status === 'pendente').length})
          </button>
          <button class="admin-filter-btn ${paymentStatusFilter === 'atrasado' ? 'active' : ''}" data-pay-filter="atrasado">
            🔴 Em Atraso (${payments.filter(p => p.status === 'atrasado').length})
          </button>
        </div>
      </div>

      <div class="measurements-table-card" style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px; overflow-x: auto;">
        <table class="app-table">
          <thead>
            <tr>
              <th>Transação</th>
              <th>Aluno</th>
              <th>Plano</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Data Pagamento</th>
              <th>Método</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="9" style="text-align: center; padding: 32px; color: var(--text-muted);">
                  Nenhum registro encontrado para este filtro.
                </td>
              </tr>
            ` : filtered.map(pay => {
              const student = students.find(s => s.id === pay.studentId);
              return `
                <tr>
                  <td><code style="color: var(--jet-cyan); font-size: 0.8rem; background: rgba(0,0,0,0.3); padding: 3px 6px; border-radius: 4px;">${pay.transactionId || pay.id}</code></td>
                  <td><strong>${pay.studentName}</strong></td>
                  <td>${pay.planName}</td>
                  <td><strong>R$ ${pay.amount.toFixed(2)}</strong></td>
                  <td>${pay.dueDate ? pay.dueDate.split('-').reverse().join('/') : '-'}</td>
                  <td>${pay.paymentDate ? pay.paymentDate.split('-').reverse().join('/') : '-'}</td>
                  <td><span class="badge badge-cyan">${pay.method || 'PIX'}</span></td>
                  <td>
                    <span class="badge ${pay.status === 'pago' ? 'badge-success' : pay.status === 'pendente' ? 'badge-warning' : 'badge-danger'}">
                      ${pay.status === 'pago' ? 'Pago' : pay.status === 'pendente' ? 'Pendente' : 'Atrasado'}
                    </span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      ${pay.status !== 'pago' ? `
                        <button class="btn btn-primary btn-sm mark-payment-paid-btn" data-payment-id="${pay.id}" title="Dar baixa manual nesta fatura">
                          ✓ Baixar
                        </button>
                        ${student?.phone ? `
                          <button class="btn btn-secondary btn-sm send-whatsapp-reminder" data-phone="${student.phone}" data-name="${student.name}" data-amount="${pay.amount}" title="Cobrança via WhatsApp">
                            ${Icons.whatsapp('', 14)}
                          </button>
                        ` : ''}
                      ` : `
                        <button class="btn btn-secondary btn-sm open-receipt-btn" data-payment-id="${pay.id}" data-student="${pay.studentName}" data-amount="${pay.amount}" data-plan="${pay.planName}" data-date="${pay.paymentDate || pay.dueDate}" data-method="${pay.method || 'PIX'}" data-tx="${pay.transactionId || pay.id}" title="Visualizar recibo oficial de quitação">
                          📄 Recibo
                        </button>
                      `}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div id="gymReportModal" class="modal-overlay">
        <div class="modal-content" style="max-width: 780px; background: #0D131F; border: 1px solid var(--jet-border); border-radius: 20px; color: #fff;">
          <div class="modal-header" style="border-bottom: 1px solid var(--jet-border); padding-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="background: linear-gradient(135deg, #00F59B 0%, #00E5FF 100%); color: #06090F; padding: 6px 10px; border-radius: 8px; font-weight: 900; font-size: 0.9rem;">
                CTJC
              </div>
              <div>
                <h3 class="modal-title" style="font-family: 'Outfit', sans-serif; font-size: 1.3rem; margin: 0;">
                  Relatório Executivo Geral
                </h3>
                <span style="font-size: 0.78rem; color: var(--text-muted);">
                  Unidade: ${gym.name || 'CT Jefferson Calisto'} • Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <button id="closeGymReportModalBtn" class="modal-close">&times;</button>
          </div>

          <div class="modal-body" id="printableReportContent" style="padding: 20px 0; max-height: 70vh; overflow-y: auto;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 22px;">
              <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--jet-border); border-radius: 12px; padding: 14px;">
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Total de Alunos</div>
                <div style="font-size: 1.6rem; font-weight: 800; color: #fff; font-family: 'Outfit', sans-serif; margin-top: 4px;">
                  ${totalStudents}
                </div>
                <span style="font-size: 0.75rem; color: var(--jet-emerald); font-weight: 700;">${adimplenciaRate}% Adimplentes</span>
              </div>

              <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--jet-border); border-radius: 12px; padding: 14px;">
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">MRR (Faturamento)</div>
                <div style="font-size: 1.6rem; font-weight: 800; color: var(--jet-emerald); font-family: 'Outfit', sans-serif; margin-top: 4px;">
                  R$ ${mrr.toFixed(2)}
                </div>
                <span style="font-size: 0.75rem; color: var(--text-muted);">Ticket Médio: R$ ${avgTicket}</span>
              </div>

              <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--jet-border); border-radius: 12px; padding: 14px;">
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Inadimplência</div>
                <div style="font-size: 1.6rem; font-weight: 800; color: ${lateStudents > 0 ? 'var(--ruby-danger)' : 'var(--jet-emerald)'}; font-family: 'Outfit', sans-serif; margin-top: 4px;">
                  ${lateStudents} <span style="font-size: 0.9rem; color: var(--text-muted);">aluno(s)</span>
                </div>
                <span style="font-size: 0.75rem; color: var(--ruby-danger);">R$ ${totalOverdue.toFixed(2)} em atraso</span>
              </div>

              <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--jet-border); border-radius: 12px; padding: 14px;">
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Satisfação (NPS)</div>
                <div style="font-size: 1.6rem; font-weight: 800; color: #FFB800; font-family: 'Outfit', sans-serif; margin-top: 4px;">
                  ${avgNps} ★
                </div>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${feedbacks.length} avaliações registradas</span>
              </div>
            </div>

            <div style="margin-bottom: 22px;">
              <h4 style="font-family: 'Outfit', sans-serif; font-size: 1.05rem; margin: 0 0 10px 0; color: #fff;">
                Distribuição dos Alunos por Plano
              </h4>
              <table class="app-table" style="font-size: 0.85rem;">
                <thead>
                  <tr>
                    <th>Plano</th>
                    <th>Valor Mensal</th>
                    <th>Alunos Matriculados</th>
                    <th>Subtotal Faturado</th>
                  </tr>
                </thead>
                <tbody>
                  ${plans.map(p => {
                    const count = students.filter(s => s.planId === p.id || s.planName === p.name).length;
                    const subtotal = count * p.price;
                    return `
                      <tr>
                        <td><strong>${p.name}</strong></td>
                        <td>R$ ${p.price.toFixed(2)}</td>
                        <td><span class="badge badge-cyan">${count} aluno(s)</span></td>
                        <td><strong style="color: var(--jet-emerald);">R$ ${subtotal.toFixed(2)}</strong></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div style="background: rgba(0, 245, 155, 0.05); border-left: 3px solid var(--jet-emerald); padding: 14px 16px; border-radius: 0 10px 10px 0; font-size: 0.85rem; color: #CBD5E1; line-height: 1.5;">
              <strong>Parecer da Gestão:</strong> A unidade opera com <strong>${adimplenciaRate}% de adimplência</strong> e índice de satisfação de <strong>${avgNps} / 5.0</strong>. O controle de matrículas e faturas está sincronizado em tempo real com base nos pagamentos recebidos.
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--jet-border); padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
            <button type="button" id="closeGymReportModalBtn2" class="btn btn-secondary">Fechar</button>
            <div style="display: flex; gap: 8px;">
              <button type="button" id="exportReportCsvBtn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 6px;">
                ${Icons.card('', 14)}
                <span>Exportar CSV</span>
              </button>
              <button type="button" id="printReportBtn" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
                ${Icons.sparkles('', 14)}
                <span>Imprimir / Salvar PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="receiptModal" class="modal-overlay">
        <div class="modal-content" style="max-width: 480px; background: #0D131F; border: 1px solid var(--jet-border); border-radius: 20px; color: #fff;">
          <div class="modal-header" style="border-bottom: 1px solid var(--jet-border); padding-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="background: var(--jet-emerald); color: #06090F; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.85rem;">✓</div>
              <h3 class="modal-title" style="font-family: 'Outfit', sans-serif;">Recibo Oficial de Pagamento</h3>
            </div>
            <button id="closeReceiptModalBtn" class="modal-close">&times;</button>
          </div>

          <div class="modal-body" id="printableReceiptContent" style="padding: 20px 0;">
            <div style="text-align: center; margin-bottom: 18px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 14px;">
              <h4 style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 1.3rem; color: #fff;">
                ${gym.name || 'CT Jefferson Calisto'}
              </h4>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                ${gym.address || 'Av. Paulista, 1842 - São Paulo - SP'}
              </div>
              <div style="font-size: 0.78rem; color: var(--jet-emerald); font-weight: 700; margin-top: 4px;">
                COMPROVANTE DE QUITAÇÃO DE MENSALIDADE
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.88rem;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Identificador:</span>
                <code id="rcptTxId" style="color: var(--jet-cyan); font-weight: 700;">-</code>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Aluno:</span>
                <strong id="rcptStudent" style="color: #fff;">-</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Plano Contratado:</span>
                <span id="rcptPlan" style="color: #CBD5E1;">-</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Data do Pagamento:</span>
                <span id="rcptDate" style="color: #fff;">-</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Método:</span>
                <span id="rcptMethod" class="badge badge-success">PIX</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--jet-border); padding-top: 10px; margin-top: 4px;">
                <span style="color: #fff; font-weight: 800; font-size: 1rem;">Valor Pago:</span>
                <strong id="rcptAmount" style="color: var(--jet-emerald); font-size: 1.25rem; font-family: 'Outfit', sans-serif;">R$ 0,00</strong>
              </div>
            </div>

            <div style="margin-top: 18px; padding: 10px; background: rgba(0,245,155,0.06); border-radius: 8px; text-align: center; font-size: 0.75rem; color: var(--text-muted);">
              Autenticação Digital: <span style="font-family: monospace; color: var(--jet-cyan);">CTJC-AUT-994827-OK</span>
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--jet-border); padding-top: 14px; display: flex; justify-content: space-between;">
            <button type="button" id="closeReceiptModalBtn2" class="btn btn-secondary">Fechar</button>
            <button type="button" id="printReceiptBtn" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
              <span>🖨️ Imprimir Recibo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
