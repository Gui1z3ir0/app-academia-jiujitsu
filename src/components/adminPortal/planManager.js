import { store } from '../../data/store.js';

export function renderPlanManager() {
  const plans = store.getPlans();

  return `
    <div class="admin-plan-manager">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 24px;">
        <div>
          <h2>Planos & Assinaturas da Academia</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Configure os planos oferecidos pela academia, valores de mensalidade e benefícios inclusos.
          </p>
        </div>
        <button id="openNewPlanModalBtn2" class="btn btn-primary">
          <span>+ Criar Novo Plano</span>
        </button>
      </div>

      <div class="plans-grid">
        ${plans.map(plan => `
          <div class="plan-card ${plan.popular ? 'popular' : ''}">
            ${plan.popular ? `<div class="plan-popular-ribbon">MAIS POPULAR</div>` : ''}

            <h3 style="font-size: 1.35rem;">${plan.name}</h3>
            <p style="font-size: 0.82rem; color: var(--text-muted); min-height: 40px; margin-top: 6px;">
              ${plan.description || 'Acesso completo às instalações da academia.'}
            </p>

            <div class="plan-price-block">
              <span class="plan-currency">R$</span>
              <span class="plan-amount">${plan.price.toFixed(2)}</span>
              <span class="plan-period">/ ${plan.period.toLowerCase()}</span>
            </div>

            <ul class="plan-benefits-list">
              ${(plan.benefits || []).map(b => `
                <li class="plan-benefit-item">
                  <span class="plan-check-icon">✓</span>
                  <span>${b}</span>
                </li>
              `).join('')}
            </ul>

            <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="window.showToast ? window.showToast('info', 'Catálogo de Planos', 'Edição do plano ${plan.name} em atualização.') : null;">
              Editar Plano
            </button>
          </div>
        `).join('')}
      </div>

      <div id="newPlanModal" class="modal-overlay">
        <div class="modal-content" style="max-width: 500px;">
          <div class="modal-header">
            <h3 class="modal-title">Cadastrar Novo Plano</h3>
            <button id="closeNewPlanModalBtn" class="modal-close">&times;</button>
          </div>
          <form id="newPlanForm">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Nome do Plano</label>
                <input type="text" id="addPlanName" class="form-input" placeholder="Ex: Plano Semestral Gold" required>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">Valor Mensal (R$)</label>
                  <input type="number" step="0.01" id="addPlanPrice" class="form-input" placeholder="99.90" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Periodicidade</label>
                  <select id="addPlanPeriod" class="form-select">
                    <option value="Mensal">Mensal</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Semestral">Semestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Descrição Breve</label>
                <input type="text" id="addPlanDesc" class="form-input" placeholder="Ex: Para quem busca resultados a médio prazo...">
              </div>

              <div class="form-group">
                <label class="form-label">Benefícios (Um por linha)</label>
                <textarea id="addPlanBenefits" class="form-textarea" placeholder="Acesso livre à musculação&#10;Aulas coletivas inclusas&#10;Acompanhamento no App" rows="4"></textarea>
              </div>

              <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="addPlanPopular">
                <label for="addPlanPopular" style="font-size: 0.9rem; cursor: pointer;">Destacar como Plano Mais Popular</label>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" id="closeNewPlanModalBtn2" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Plano</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
