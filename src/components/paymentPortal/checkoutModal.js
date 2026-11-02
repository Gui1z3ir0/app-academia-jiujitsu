import { store } from '../../data/store.js';
import { generatePixBrCode } from '../../utils/security.js';
import { supabaseClient } from '../../services/supabaseClient.js';

let activePaymentMethod = 'PIX';

export function renderCheckoutModal() {
  const gymConfig = store.getGymConfig();
  const isPersonal = store.isPersonal();
  const pixKeyConfigured = Boolean(gymConfig.pixKey && gymConfig.pixKey.trim());

  return `
    <div id="checkoutModal" class="modal-overlay">
      <div class="modal-content" style="max-width: 520px;">
        <div class="modal-header">
          <div>
            <span class="badge badge-cyan" style="font-size: 0.7rem;">CHECKOUT SEGURO</span>
            <h3 class="modal-title" style="margin-top: 4px;">Mensalidade — ${gymConfig.name}</h3>
          </div>
          <button id="closeCheckoutModalBtn" class="modal-close">&times;</button>
        </div>

        <div class="modal-body" style="padding: 20px;">
          <div class="checkout-amount-hero">
            <span id="checkoutPlanName" class="checkout-plan-tag">Plano</span>
            <div id="checkoutAmountDisplay" class="checkout-value-display">R$ 120,00</div>
            <div id="checkoutDueDateInfo" class="checkout-due-info">Vencimento: -</div>
          </div>

          <div class="payment-methods-selector">
            <button type="button" class="pay-method-tab ${activePaymentMethod === 'PIX' ? 'active' : ''}" data-method="PIX">
              <span style="font-size: 1.3rem;">⚡</span>
              <span style="font-weight: 700; font-size: 0.85rem;">PIX Copia e Cola</span>
            </button>
            <button type="button" class="pay-method-tab ${activePaymentMethod === 'Cartao' ? 'active' : ''}" data-method="Cartao">
              <span style="font-size: 1.3rem;">💳</span>
              <span style="font-weight: 700; font-size: 0.85rem;">Checkout Cartão</span>
            </button>
          </div>

          <div id="pixPaymentSection" class="pix-container" style="display: ${activePaymentMethod === 'PIX' ? 'flex' : 'none'};">
            <div style="width: 100%; background: rgba(0, 245, 155, 0.06); border: 1px solid rgba(0, 245, 155, 0.25); border-radius: 12px; padding: 14px; text-align: left;">
              <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Favorecido / Chave PIX Oficial</div>
              <div style="font-size: 0.98rem; font-weight: 800; color: #fff; margin-top: 4px;">${gymConfig.name}</div>
              <div id="checkoutPixKeyDisplay" style="font-size: 0.88rem; color: var(--neon-green); font-family: monospace; margin-top: 2px;">
                ${pixKeyConfigured ? `Chave PIX: ${gymConfig.pixKey}` : 'Chave PIX ainda não configurada pelo Personal nas Configurações da Academia'}
              </div>
            </div>

            <p style="font-size: 0.84rem; color: var(--text-secondary); margin: 8px 0;">
              Copie o código <strong>PIX Copia e Cola (padrão Banco Central EMV)</strong> ou a chave PIX oficial acima e realize a transferência no aplicativo do seu banco.
            </p>

            <div class="pix-copia-cola-box">
              <span id="pixCodeString" class="pix-code-text">
                ${pixKeyConfigured ? 'Gerando payload PIX EMV...' : 'Configure a chave PIX nas configurações da academia'}
              </span>
              <button id="copyPixBtn" type="button" class="btn btn-secondary btn-sm" style="flex-shrink: 0;">
                <span>📋 Copiar PIX</span>
              </button>
            </div>
            <div id="copyToastMessage" style="display: none; font-size: 0.78rem; color: var(--neon-green); font-weight: 700;">
              ✓ Código PIX copiado para a área de transferência!
            </div>
          </div>

          <div id="cardPaymentSection" style="display: ${activePaymentMethod === 'Cartao' ? 'block' : 'none'};">
            <div style="background: var(--bg-surface-elevated); padding: 20px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); text-align: center;">
              <div style="font-size: 2rem; margin-bottom: 8px;">🔒</div>
              <div style="font-weight: 800; font-size: 1rem; color: #fff; margin-bottom: 6px;">Checkout Externo Criptografado (PCI-DSS)</div>
              <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">
                Por segurança, este aplicativo <strong>nunca armazena dados de cartão de crédito</strong>. O pagamento por cartão é processado diretamente pelo gateway (${(gymConfig.paymentGateway || 'Mercado Pago / Asaas').toUpperCase()}) com confirmação automática via Webhook.
              </p>
              <div id="gatewayCheckoutLinkBox" style="font-size: 0.8rem; color: var(--neon-cyan);">
                Solicite o link de pagamento com cartão ou utilize o PIX Copia e Cola para compensação imediata.
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="flex-direction: column; gap: 8px;">
          <button id="simulateApprovePaymentBtn" type="button" class="btn btn-primary" style="width: 100%; padding: 14px;">
            <span>${isPersonal ? '✓ Confirmar Recebimento (Dar Baixa na Fatura)' : '📤 Já Realizei o PIX — Enviar para Confirmação'}</span>
          </button>
          <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center;">
            ${isPersonal
              ? 'Como Personal, esta ação confirma o pagamento e emite o recibo ao aluno.'
              : 'A baixa definitiva ocorre automaticamente via Webhook do gateway ou após conferência do Personal.'}
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function openCheckoutModal(paymentData) {
  const modal = document.getElementById('checkoutModal');
  if (!modal) return;

  const gymConfig = store.getGymConfig();
  const planEl = document.getElementById('checkoutPlanName');
  const amountEl = document.getElementById('checkoutAmountDisplay');
  const dueEl = document.getElementById('checkoutDueDateInfo');
  const pixCodeEl = document.getElementById('pixCodeString');
  const pixKeyEl = document.getElementById('checkoutPixKeyDisplay');

  const amount = Number(paymentData.amount) || 120.0;
  if (planEl) planEl.textContent = paymentData.planName || 'Plano Musculação';
  if (amountEl) amountEl.textContent = `R$ ${amount.toFixed(2)}`;
  if (dueEl) dueEl.textContent = `Vencimento: ${paymentData.dueDate ? paymentData.dueDate.split('-').reverse().join('/') : 'A vencer'}`;

  if (pixKeyEl) {
    pixKeyEl.textContent = gymConfig.pixKey
      ? `Chave PIX: ${gymConfig.pixKey}`
      : 'Chave PIX não configurada pelo Personal';
  }

  if (pixCodeEl) {
    if (gymConfig.pixKey) {
      const brCode = generatePixBrCode({
        pixKey: gymConfig.pixKey,
        merchantName: gymConfig.pixMerchantName || gymConfig.name || 'ACADEMIA',
        merchantCity: gymConfig.pixMerchantCity || 'SAO PAULO',
        amount,
        txid: paymentData.id || 'MENSALIDADE'
      });
      pixCodeEl.textContent = brCode || gymConfig.pixKey;
    } else {
      pixCodeEl.textContent = 'Solicite a chave PIX ao seu Personal Trainer.';
    }
  }

  modal.setAttribute('data-target-payment-id', paymentData.id || '');
  modal.classList.add('active');

  if (supabaseClient.isConfigured() && paymentData.id) {
    try {
      const charge = await supabaseClient.createGatewayCharge({
        faturaId: paymentData.id,
        method: 'pix',
        provider: gymConfig.paymentGateway || 'mercadopago'
      });
      if (charge?.pixCopiaCola && pixCodeEl) {
        pixCodeEl.textContent = charge.pixCopiaCola;
      }
    } catch (e) {}
  }
}
