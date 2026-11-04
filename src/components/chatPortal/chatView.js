import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

let selectedChatStudentId = null;

export function setSelectedChatStudentId(id) {
  selectedChatStudentId = id;
}

export function renderChatView() {
  const isPersonal = store.isPersonal();
  const students = store.getStudents();
  const activePersonal = store.getActivePersonal();

  const currentStudent = isPersonal
    ? (students.find(s => s.id === selectedChatStudentId) || students[0])
    : store.getActiveStudent();

  if (isPersonal && !currentStudent) {
    return `
      <div class="glass-panel" style="padding: 32px; text-align: center; color: var(--text-muted);">
        Nenhum aluno cadastrado para iniciar conversa no chat.
      </div>
    `;
  }

  const messages = store.getChatMessages(currentStudent.id);

  return `
    <div class="inapp-chat-module">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
        <div>
          <div style="font-size: 0.78rem; font-weight: 800; color: var(--jet-emerald); text-transform: uppercase; letter-spacing: 1px;">
            💬 CHAT INTERNO EM TEMPO REAL
          </div>
          <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.75rem; margin: 4px 0;">
            ${isPersonal ? `Conversa com ${currentStudent.name}` : `Chat com ${activePersonal.name}`}
          </h2>
          <p style="color: var(--text-secondary); font-size: 0.88rem;">
            Tire dúvidas de execução, relate dores/lesões ou alinhe ajustes de treino diretamente pelo aplicativo.
          </p>
        </div>

        ${isPersonal && students.length > 0 ? `
          <div style="display: flex; align-items: center; gap: 10px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 12px; padding: 10px 14px;">
            <span style="font-size: 0.78rem; color: var(--jet-cyan); font-weight: 700;">Aluno:</span>
            <select id="chatStudentSelector" class="form-select" style="min-width: 210px; padding: 6px 10px;">
              ${students.map(s => `
                <option value="${s.id}" ${s.id === currentStudent.id ? 'selected' : ''}>${s.name}</option>
              `).join('')}
            </select>
          </div>
        ` : ''}
      </div>

      <div class="glass-panel inapp-chat-panel" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; height: 520px;">
        <div class="inapp-chat-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; background: rgba(0,0,0,0.25);">
          <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
            <img src="${isPersonal ? currentStudent.avatar : activePersonal.avatar}" style="width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;" alt="">
            <div style="min-width: 0;">
              <strong style="color: #fff; font-size: 0.96rem; display: block;">
                ${isPersonal ? currentStudent.name : activePersonal.name}
              </strong>
              <span style="font-size: 0.76rem; color: var(--jet-emerald);">
                ● Canal Oficial Integrado ao App
              </span>
            </div>
          </div>
          <span class="badge badge-cyan">${messages.length} mensagens</span>
        </div>

        <div id="chatMessagesThread" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
          ${messages.length === 0 ? `
            <div style="margin: auto; text-align: center; color: var(--text-muted); max-width: 340px;">
              <div style="font-size: 2rem; margin-bottom: 8px;">💬</div>
              <strong style="color: #fff; display: block; margin-bottom: 4px;">Nenhuma mensagem ainda</strong>
              <span style="font-size: 0.84rem;">Envie uma mensagem abaixo para iniciar o atendimento direto no aplicativo.</span>
            </div>
          ` : messages.map(msg => {
            const isMine = (isPersonal && msg.remetente_role === 'personal') || (!isPersonal && msg.remetente_role === 'aluno');
            const prioBadge = msg.prioridade === 'alta'
              ? '<span class="badge badge-danger" style="font-size: 0.65rem;">Urgente / Lesão</span>'
              : msg.prioridade === 'media'
                ? '<span class="badge badge-warning" style="font-size: 0.65rem;">Dúvida de Treino</span>'
                : '';
            return `
              <div style="align-self: ${isMine ? 'flex-end' : 'flex-start'}; max-width: 78%; background: ${isMine ? 'rgba(0, 245, 155, 0.14)' : 'var(--bg-surface-elevated)'}; border: 1px solid ${isMine ? 'rgba(0, 245, 155, 0.35)' : 'var(--border-subtle)'}; border-radius: 14px; padding: 12px 16px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 4px;">
                  <strong style="font-size: 0.76rem; color: ${isMine ? 'var(--jet-emerald)' : 'var(--jet-cyan)'};">
                    ${msg.remetente_nome || (msg.remetente_role === 'personal' ? 'Personal' : 'Aluno')}
                  </strong>
                  ${prioBadge}
                </div>
                <div style="font-size: 0.9rem; color: #fff; line-height: 1.45; white-space: pre-wrap;">${msg.conteudo}</div>
                <div style="font-size: 0.68rem; color: var(--text-muted); text-align: right; margin-top: 6px;">
                  ${msg.dataFormatada || ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <form id="inAppChatSendForm" data-student-id="${currentStudent.id}" style="padding: 14px 18px; border-top: 1px solid var(--border-subtle); background: rgba(0,0,0,0.3); display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          ${!isPersonal ? `
            <select id="inAppChatPriority" class="form-select" style="width: 150px; padding: 10px;">
              <option value="baixa">🟢 Geral</option>
              <option value="media" selected>🟡 Treino</option>
              <option value="alta">🔴 Dor / Lesão</option>
            </select>
          ` : ''}
          <input type="text" id="inAppChatInput" class="form-input" placeholder="Digite sua mensagem aqui..." required style="flex: 1; min-width: 200px; padding: 11px 14px;">
          <button type="submit" class="btn btn-primary" style="padding: 11px 20px; font-weight: 800;">
            Enviar
          </button>
        </form>
      </div>
    </div>
  `;
}
