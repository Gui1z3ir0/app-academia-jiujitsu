import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

export function renderStudentPaymentView(studentId) {
  const student = store.getStudents().find(s => s.id === studentId) || store.getActiveStudent();
  const plan = store.getPlan(student.planId) || store.getPlans()[0];
  const payments = store.getStudentPayments(student.id);
  const gymConfig = store.getGymConfig();

  const pendingOrLatePayment = payments.find(p => p.status !== 'pago');

  return `
    <div class="student-payments-module">
      <div style="margin-bottom: 24px;">
        <h2>Minhas Mensalidades & Pagamentos</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Consulte suas faturas em <strong>${gymConfig.name}</strong>, copie o código PIX oficial e acompanhe a confirmação de pagamento.
        </p>
      </div>

      ${student.status === 'atrasado' ? `
        <div style="background: rgba(255, 71, 87, 0.1); border: 2px solid var(--ruby-danger); border-radius: var(--radius-md); padding: 18px 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <span style="font-size: 2rem;">⚠️</span>
            <div>
              <div style="font-weight: 800; color: #FF6B7A; font-size: 1.05rem;">Mensalidade em Atraso!</div>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">
                Sua matrícula encontra-se com pendência financeira. Efetue o pagamento via PIX para regularização.
              </p>
            </div>
          </div>
          <button class="btn btn-primary trigger-pay-btn" data-payment-id="${pendingOrLatePayment?.id || ''}" data-amount="${student.monthlyAmount}" data-plan="${plan.name}">
            <span>⚡ Pagar Agora com PIX</span>
          </button>
        </div>
      ` : ''}

      <div class="glass-panel" style="padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
          <div>
            <span class="badge ${student.status === 'em_dia' ? 'badge-success' : student.status === 'aguardando_confirmacao' ? 'badge-cyan' : student.status === 'vence_breve' ? 'badge-warning' : 'badge-danger'}">
              ${student.status === 'em_dia'
                ? '🟢 Situação: Em Dia'
                : student.status === 'aguardando_confirmacao'
                  ? '🔵 PIX em Análise pelo Personal / Webhook'
                  : student.status === 'vence_breve'
                    ? '🟡 Fatura em Aberto'
                    : '🔴 Em Atraso'}
            </span>
            <h3 style="font-size: 1.4rem; margin-top: 8px;">${plan.name}</h3>
            <div style="font-size: 0.88rem; color: var(--text-secondary);">${plan.descricao || ''}</div>
          </div>

          <div style="text-align: right;">
            <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Valor da Mensalidade</span>
            <div style="font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 900; color: var(--text-primary);">
              R$ ${Number(student.monthlyAmount || plan.price || 120).toFixed(2)}
            </div>
            <div style="font-size: 0.82rem; color: var(--text-secondary);">
              Próximo Vencimento: <strong>${student.dueDate ? student.dueDate.split('-').reverse().join('/') : '-'}</strong>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.2rem;">${student.status !== 'atrasado' ? '✅' : '⚠️'}</span>
            <span style="font-size: 0.9rem; font-weight: 700; color: ${student.status !== 'atrasado' ? 'var(--neon-green)' : 'var(--ruby-danger)'};">
              Matrícula: ${student.status !== 'atrasado' ? 'Regular / Ativa' : 'Pagamento Pendente'}
            </span>
          </div>

          ${pendingOrLatePayment ? `
            <button class="btn btn-primary trigger-pay-btn" data-payment-id="${pendingOrLatePayment.id}" data-amount="${pendingOrLatePayment.amount}" data-plan="${plan.name}">
              <span>💳 Gerar PIX / Pagar Fatura</span>
            </button>
          ` : ''}
        </div>
      </div>

      <div class="glass-panel" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <div>
            <h3 style="font-size: 1.15rem;">Histórico de Faturas</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
              Acompanhe o status de confirmação de cada mensalidade.
            </p>
          </div>
        </div>

        <div class="invoice-history-list">
          ${payments.length === 0 ? `
            <div style="text-align: center; padding: 24px; color: var(--text-muted);">
              Nenhuma fatura registrada até o momento.
            </div>
          ` : payments.map(pay => {
            const isPaid = pay.status === 'pago';
            const isWaiting = pay.status === 'aguardando_confirmacao';
            return `
              <div class="invoice-item-row" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div class="invoice-item-left" style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="invoice-item-title" style="font-weight: 700; font-size: 1rem; color: #fff;">
                      ${pay.description || pay.planName || 'Mensalidade'}
                    </div>
                    <code style="font-size: 0.72rem; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; color: var(--jet-cyan);">
                      #${pay.id}
                    </code>
                  </div>
                  <div class="invoice-item-meta" style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">
                    Vencimento: <strong>${pay.dueDate ? pay.dueDate.split('-').reverse().join('/') : '-'}</strong> • Valor: <strong>R$ ${Number(pay.amount).toFixed(2)}</strong>
                  </div>

                  ${isPaid ? `
                    <div style="margin-top: 8px; display: inline-flex; align-items: center; gap: 8px; background: rgba(0, 245, 155, 0.08); border: 1px solid rgba(0, 245, 155, 0.25); border-radius: 8px; padding: 4px 10px; font-size: 0.78rem; color: var(--jet-emerald);">
                      <span>✔ Pago via ${pay.method || 'PIX'}</span>
                      <span>• Data: ${pay.paymentDate ? pay.paymentDate.split('-').reverse().join('/') : 'Confirmado'}</span>
                    </div>
                  ` : isWaiting ? `
                    <div style="margin-top: 8px; display: inline-flex; align-items: center; gap: 6px; background: rgba(0, 229, 255, 0.1); border: 1px solid rgba(0, 229, 255, 0.3); border-radius: 8px; padding: 4px 10px; font-size: 0.78rem; color: var(--jet-cyan);">
                      <span>🔵 Pagamento informado — aguardando confirmação do Personal / Webhook</span>
                    </div>
                  ` : `
                    <div style="margin-top: 8px; display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 71, 87, 0.08); border: 1px solid rgba(255, 71, 87, 0.25); border-radius: 8px; padding: 4px 10px; font-size: 0.78rem; color: var(--ruby-danger);">
                      <span>⏳ Pendente de pagamento</span>
                    </div>
                  `}
                </div>

                <div style="display: flex; align-items: center; gap: 14px;">
                  <div style="text-align: right;">
                    <div style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.15rem; color: #fff;">
                      R$ ${Number(pay.amount).toFixed(2)}
                    </div>
                    <span class="badge ${isPaid ? 'badge-success' : isWaiting ? 'badge-cyan' : 'badge-warning'}" style="font-weight: 700;">
                      ${isPaid ? 'Pago' : isWaiting ? 'Em Análise' : 'Pendente'}
                    </span>
                  </div>

                  ${isPaid ? `
                    <button class="btn btn-secondary btn-sm receipt-toast-btn" data-student="${student.name}" data-amount="${Number(pay.amount).toFixed(2)}">
                      ${Icons.card('', 14)} <span>Recibo</span>
                    </button>
                  ` : `
                    <button class="btn btn-primary btn-sm trigger-pay-btn" data-payment-id="${pay.id}" data-amount="${pay.amount}" data-plan="${pay.planName}">
                      ${isWaiting ? 'Ver PIX' : 'Pagar'}
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}
