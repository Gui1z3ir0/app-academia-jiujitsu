import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

export function renderCoachMessageModal() {
  const activeStudent = store.getActiveStudent();
  const activePersonal = store.getActivePersonal();
  const gym = store.getGymConfig();
  const personalPhone = gym.phone || gym.whatsapp || activePersonal.phone || '';
  const history = store.getChatMessages(activeStudent.id).slice(-5);

  return `
    <div id="coachMessageModal" class="modal-overlay">
      <div class="modal-content" style="max-width: 520px; background: #0D131F; border: 1px solid rgba(0, 245, 155, 0.3); border-radius: 20px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 245, 155, 0.1);">
        <div class="modal-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding: 18px 22px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #00F59B, #00E5FF); display: flex; align-items: center; justify-content: center; color: #06090F;">
              ${Icons.bolt('', 20)}
            </div>
            <div>
              <h3 class="modal-title" style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 1.15rem; color: #fff;">
                Chat Direto com ${activePersonal.name}
              </h3>
              <div style="font-size: 0.75rem; color: var(--jet-emerald, #00F59B); font-weight: 700;">
                CHAT INTEGRADO NO APLICATIVO
              </div>
            </div>
          </div>
          <button id="closeCoachMessageModalBtn" class="modal-close" style="background: none; border: none; font-size: 1.5rem; color: #94A3B8; cursor: pointer;">&times;</button>
        </div>

        <form id="studentCoachMessageForm">
          <div class="modal-body" style="padding: 20px 22px;">
            ${history.length > 0 ? `
              <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px; margin-bottom: 14px; max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                ${history.map(m => `
                  <div style="font-size: 0.8rem; padding: 6px 10px; border-radius: 8px; background: ${m.remetente_role === 'aluno' ? 'rgba(0, 245, 155, 0.12)' : 'rgba(0, 229, 255, 0.12)'};">
                    <strong style="color: ${m.remetente_role === 'aluno' ? '#00F59B' : '#00E5FF'};">${m.remetente_nome}:</strong>
                    <span style="color: #fff;"> ${m.conteudo}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label" style="display: block; font-size: 0.82rem; font-weight: 800; color: #CBD5E1; margin-bottom: 6px;">
                Nível de Prioridade
              </label>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                <label style="cursor: pointer;">
                  <input type="radio" name="msgPrioridade" value="alta" style="display: none;" class="priority-radio">
                  <div class="priority-chip" data-val="alta" style="padding: 10px 8px; border-radius: 10px; border: 1px solid rgba(255, 71, 87, 0.3); background: rgba(255, 71, 87, 0.08); text-align: center; font-size: 0.8rem; font-weight: 700; color: #FF6B7A; transition: all 0.2s;">
                    🔴 Alta (Dor / Lesão)
                  </div>
                </label>
                <label style="cursor: pointer;">
                  <input type="radio" name="msgPrioridade" value="media" checked style="display: none;" class="priority-radio">
                  <div class="priority-chip active" data-val="media" style="padding: 10px 8px; border-radius: 10px; border: 1px solid rgba(255, 184, 0, 0.4); background: rgba(255, 184, 0, 0.15); text-align: center; font-size: 0.8rem; font-weight: 700; color: #FFB800; transition: all 0.2s;">
                    🟡 Média (Treino)
                  </div>
                </label>
                <label style="cursor: pointer;">
                  <input type="radio" name="msgPrioridade" value="baixa" style="display: none;" class="priority-radio">
                  <div class="priority-chip" data-val="baixa" style="padding: 10px 8px; border-radius: 10px; border: 1px solid rgba(0, 245, 155, 0.3); background: rgba(0, 245, 155, 0.08); text-align: center; font-size: 0.8rem; font-weight: 700; color: #00F59B; transition: all 0.2s;">
                    🟢 Geral
                  </div>
                </label>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label" style="display: block; font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">
                Assunto
              </label>
              <select id="coachMsgAssunto" class="form-select" required style="width: 100%; box-sizing: border-box; background: #0F172A; border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.9rem;">
                <option value="Dúvida em Exercício">Dúvida na execução de um exercício</option>
                <option value="Dor ou Desconforto">Senti dor ou desconforto durante o treino</option>
                <option value="Ajuste de Cargas / Séries">Ajuste de cargas, séries ou repetições</option>
                <option value="Treino de Jiu-Jítsu">Dúvida ou orientação sobre aula de Jiu-Jítsu</option>
                <option value="Orientação Geral / Dúvida">Outro assunto com o Personal</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
              <label class="form-label" style="display: block; font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">
                Sua Mensagem no Chat
              </label>
              <textarea id="coachMsgTexto" class="form-input" rows="3" placeholder="Escreva sua mensagem para o Personal..." required style="width: 100%; box-sizing: border-box; background: #0F172A; border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 12px 14px; color: #fff; font-size: 0.9rem; resize: vertical;"></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 13px; font-weight: 800; font-size: 0.95rem; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 6px 20px rgba(0, 245, 155, 0.35); cursor: pointer;">
              ${Icons.bolt('', 18)}
              <span>Enviar no Chat do Aplicativo</span>
            </button>

            ${personalPhone ? `
              <button type="button" id="coachDirectWhatsappBtn" class="btn btn-secondary" data-coach-phone="${personalPhone}" style="width: 100%; margin-top: 10px; padding: 11px; font-weight: 700; font-size: 0.85rem; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; background: rgba(37, 211, 102, 0.15); border: 1px solid #25D366; color: #25D366; cursor: pointer;">
                ${Icons.whatsapp('', 18)}
                <span>Opcional: Chamar também no WhatsApp</span>
              </button>
            ` : ''}
          </div>
        </form>
      </div>
    </div>
  `;
}
