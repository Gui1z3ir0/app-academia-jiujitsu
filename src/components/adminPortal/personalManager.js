import { store } from '../../data/store.js';

export function renderPersonalManager() {
  const personals = store.getPersonals();

  return `
    <div class="admin-personal-manager">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 24px;">
        <div>
          <h2>Corpo Técnico & Personal Trainers</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Cadastre novos profissionais, acompanhe credenciamento CREF e avaliações dos alunos.
          </p>
        </div>
        <button id="openNewPersonalModalBtn" class="btn btn-primary">
          <span>+ Cadastrar Personal Trainer</span>
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 30px;">
        ${personals.length === 0 ? `
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px;">
            <p style="color: var(--text-secondary); max-width: 440px; margin: 0 auto 16px; font-size: 0.92rem;">
              Nenhum professor ou personal trainer cadastrado no momento.
            </p>
            <button class="btn btn-primary" onclick="document.getElementById('openNewPersonalModalBtn')?.click()" style="padding: 9px 18px; font-weight: 700;">
              + Cadastrar Primeiro Personal
            </button>
          </div>
        ` : personals.map(p => `
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
                <img src="${p.avatar}" style="width: 58px; height: 58px; border-radius: var(--radius-full); border: 2px solid var(--neon-cyan); object-fit: cover;" alt="">
                <div>
                  <h3 style="font-size: 1.15rem;">${p.name}</h3>
                  <span class="cref-tag">CREF: ${p.cref}</span>
                </div>
              </div>

              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 14px;">
                <strong>Especialidade:</strong> ${p.specialty}
              </div>

              <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 16px;">
                ${p.bio || 'Treinador credenciado.'}
              </p>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
              <div>
                <span style="color: #FFB800;">★ ${p.rating || '5.0'}</span>
                <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 6px;">(${p.studentsCount || 0} alunos)</span>
              </div>
              <span style="font-size: 0.8rem; color: var(--neon-cyan); font-weight: 700;">${p.phone}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div id="newPersonalModal" class="modal-overlay">
        <div class="modal-content" style="max-width: 500px;">
          <div class="modal-header">
            <h3 class="modal-title">Cadastrar Personal Trainer</h3>
            <button id="closeNewPersonalModalBtn" class="modal-close">&times;</button>
          </div>
          <form id="newPersonalForm">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Nome Completo do Profissional</label>
                <input type="text" id="addPersonalName" class="form-input" placeholder="Ex: Prof. Roberto Albuquerque" required>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">Registro CREF</label>
                  <input type="text" id="addPersonalCref" class="form-input" placeholder="054321-G/SP" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Telefone / WhatsApp</label>
                  <input type="text" id="addPersonalPhone" class="form-input" placeholder="(11) 97777-6666" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Especialidade / Foco</label>
                <input type="text" id="addPersonalSpecialty" class="form-input" placeholder="Ex: Hipertrofia, Treinamento Funcional..." required>
              </div>

              <div class="form-group">
                <label class="form-label">E-mail Profissional</label>
                <input type="email" id="addPersonalEmail" class="form-input" placeholder="personal@jetfit.com.br" required>
              </div>

              <div class="form-group">
                <label class="form-label">Breve Apresentação (Bio)</label>
                <textarea id="addPersonalBio" class="form-textarea" placeholder="Experiência, formação e metodologia..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" id="closeNewPersonalModalBtn2" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary">Cadastrar Profissional</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
