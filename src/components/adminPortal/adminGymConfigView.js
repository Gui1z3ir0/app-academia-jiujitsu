import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

export function renderAdminGymConfigView() {
  const gym = store.getGymConfig();

  return `
    <div class="admin-gym-config-module">
      <div style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 8px; color: var(--jet-emerald); font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ${Icons.sliders('', 16)} CONFIGURAÇÕES WHITE-LABEL DA ACADEMIA
        </div>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 4px 0;">Marca, Asaas Recorrência & PIX</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Personalize o nome da sua academia, chave PIX oficial (EMV), gateway Asaas/Mercado Pago e horários exibidos no aplicativo.
        </p>
      </div>

      <div style="background: rgba(0, 245, 155, 0.08); border: 1px solid rgba(0, 245, 155, 0.35); border-radius: 16px; padding: 16px 20px; max-width: 820px; margin-bottom: 20px;">
        <strong style="color: var(--neon-green); font-size: 0.9rem;">💡 Conta do Gateway em Nome do Dono da Academia:</strong>
        <p style="color: var(--text-secondary); font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.5;">
          A conta e a chave de API do gateway (<strong>Asaas</strong> recomendado para cobrança recorrente via PIX, Cartão e Boleto + Sandbox) devem pertencer diretamente ao <strong>dono da academia</strong>. Assim o valor das mensalidades cai direto na conta da academia, sem intermediários e sem responsabilidade fiscal ou de chargeback para o desenvolvedor.
        </p>
      </div>

      <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 20px; padding: 28px; max-width: 820px;">
        <form id="adminGymConfigForm">
          <div style="margin-bottom: 22px;">
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.2rem; color: #fff; margin: 0 0 14px 0; display: flex; align-items: center; gap: 8px;">
              ${Icons.bolt('', 18)}
              <span>Identificação & Marca Configurável</span>
            </h3>

            <div style="display: grid; grid-template-columns: 2fr 1fr 2fr; gap: 14px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Nome da Academia / Studio / CT</label>
                <input type="text" id="gymConfigName" class="form-input" value="${gym.name || ''}" placeholder="Ex: Academia Performance Pro" required style="width: 100%; box-sizing: border-box; background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.95rem;">
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Sigla Logo</label>
                <input type="text" id="gymConfigLogoText" class="form-input" value="${gym.logoText || 'FIT'}" placeholder="FIT" style="width: 100%; box-sizing: border-box; background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.95rem;">
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Slogan / Subtítulo</label>
                <input type="text" id="gymConfigSlogan" class="form-input" value="${gym.slogan || ''}" placeholder="Ex: Treinamento, Performance & Jiu-Jítsu" required style="width: 100%; box-sizing: border-box; background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.95rem;">
              </div>
            </div>
          </div>

          <div style="margin-bottom: 22px; border-top: 1px solid var(--jet-border); padding-top: 18px;">
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.2rem; color: #fff; margin: 0 0 14px 0; display: flex; align-items: center; gap: 8px;">
              ${Icons.phone('', 18)}
              <span>Contato, Chave PIX & Gateway de Pagamento (Asaas / Mercado Pago)</span>
            </h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Telefone / Contato</label>
                <input type="tel" id="gymConfigPhone" class="form-input" value="${gym.phone || ''}" placeholder="(11) 99999-9999" style="width: 100%; box-sizing: border-box; background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.95rem;">
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">WhatsApp Oficial</label>
                <input type="tel" id="gymConfigWhatsapp" class="form-input" value="${gym.whatsapp || ''}" placeholder="(11) 99999-9999" style="width: 100%; box-sizing: border-box; background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.95rem;">
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Chave PIX Oficial (CNPJ/E-mail/Tel)</label>
                <input type="text" id="gymConfigPixKey" class="form-input" value="${gym.pixKey || ''}" placeholder="pix@suaacademia.com.br" required style="width: 100%; box-sizing: border-box; background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 10px; padding: 11px 14px; color: var(--jet-emerald); font-weight: 700; font-size: 0.95rem;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Gateway de Pagamento (Conta do Dono da Academia)</label>
                <select id="gymConfigGateway" class="form-select" style="width: 100%; box-sizing: border-box; background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.95rem;">
                  <option value="asaas" ${(!gym.paymentGateway || gym.paymentGateway === 'asaas') ? 'selected' : ''}>Asaas — Recorrência Mensal (PIX, Cartão e Boleto + Sandbox)</option>
                  <option value="mercadopago" ${gym.paymentGateway === 'mercadopago' ? 'selected' : ''}>Mercado Pago (PIX & Checkout)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Endereço Completo</label>
                <input type="text" id="gymConfigAddress" class="form-input" value="${gym.address || ''}" placeholder="Rua, Número, Bairro - Cidade/UF" style="width: 100%; box-sizing: border-box; background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.95rem;">
              </div>
            </div>
          </div>

          <div style="margin-bottom: 22px; border-top: 1px solid var(--jet-border); padding-top: 18px;">
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.2rem; color: #fff; margin: 0 0 14px 0; display: flex; align-items: center; gap: 8px;">
              ${Icons.clock('', 18)}
              <span>Horários de Funcionamento</span>
            </h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Segunda a Sexta</label>
                <input type="text" id="gymConfigWeekdays" class="form-input" value="${gym.workingHoursWeekdays || '06:00 às 22:00'}" required style="width: 100%; box-sizing: border-box; background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.95rem;">
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Sábados</label>
                <input type="text" id="gymConfigSaturdays" class="form-input" value="${gym.workingHoursSaturdays || '08:00 às 16:00'}" required style="width: 100%; box-sizing: border-box; background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.95rem;">
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Domingos & Feriados</label>
                <input type="text" id="gymConfigSundays" class="form-input" value="${gym.workingHoursSundays || '08:00 às 12:00'}" required style="width: 100%; box-sizing: border-box; background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.95rem;">
              </div>
            </div>
          </div>

          <div style="margin-bottom: 24px; border-top: 1px solid var(--jet-border); padding-top: 18px;">
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.2rem; color: #fff; margin: 0 0 14px 0; display: flex; align-items: center; gap: 8px;">
              ${Icons.sparkles('', 18)}
              <span>Avisos & Comunicados aos Alunos</span>
            </h3>

            <div class="form-group">
              <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Mensagem / Avisos Gerais</label>
              <textarea id="gymConfigAnnouncements" rows="3" class="form-input" style="width: 100%; box-sizing: border-box; background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.95rem; resize: vertical;">${gym.announcements || ''}</textarea>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="padding: 13px 28px; font-weight: 800; font-size: 1rem; border-radius: 12px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 6px 20px rgba(0, 245, 155, 0.35); cursor: pointer;">
            ${Icons.check('', 18)}
            <span>Salvar Configurações da Academia</span>
          </button>
        </form>
      </div>
    </div>
  `;
}
