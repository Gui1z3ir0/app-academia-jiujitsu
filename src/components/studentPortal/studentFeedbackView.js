import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

export function renderStudentFeedbackView(studentId) {
  const student = store.getStudents().find(s => s.id === studentId) || store.getActiveStudent();
  const feedbacks = store.getFeedbacks(student.id);

  return `
    <div class="student-feedback-module">
      <div style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 8px; color: var(--jet-emerald); font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ${Icons.sparkles('', 16)} CANAL DIRETO COM A ACADEMIA
        </div>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 4px 0;">Enviar Feedback & Avaliação</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Sua opinião é fundamental para aprimorarmos seus treinos, atendimento dos instrutores e estrutura da academia.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 20px; padding: 26px;">
          <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.3rem; margin: 0 0 16px 0; color: #fff;">
            Deixar Nova Avaliação
          </h3>

          <form id="studentFeedbackForm">
            <input type="hidden" id="feedbackStudentId" value="${student.id}">

            <div style="margin-bottom: 18px;">
              <label class="form-label" style="display: block; font-size: 0.85rem; font-weight: 700; color: #CBD5E1; margin-bottom: 8px;">
                Como você avalia sua experiência geral?
              </label>
              <div class="star-rating-selector" style="display: flex; gap: 10px; font-size: 1.8rem; cursor: pointer;">
                <span class="feedback-star-btn" data-rating="1" style="color: #FFB800;">★</span>
                <span class="feedback-star-btn" data-rating="2" style="color: #FFB800;">★</span>
                <span class="feedback-star-btn" data-rating="3" style="color: #FFB800;">★</span>
                <span class="feedback-star-btn" data-rating="4" style="color: #FFB800;">★</span>
                <span class="feedback-star-btn" data-rating="5" style="color: #FFB800;">★</span>
              </div>
              <input type="hidden" id="feedbackRatingVal" value="5">
              <span id="feedbackRatingLabel" style="display: block; font-size: 0.8rem; color: var(--jet-emerald); font-weight: 700; margin-top: 6px;">
                5 Estrelas - Excelente!
              </span>
            </div>

            <div style="margin-bottom: 20px;">
              <label class="form-label" style="display: block; font-size: 0.85rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">
                Seus comentários ou sugestões
              </label>
              <textarea
                id="feedbackCommentInput"
                rows="4"
                class="form-input"
                placeholder="Conte o que achou dos treinos, dos aparelhos ou do suporte dos professores..."
                required
                style="width: 100%; box-sizing: border-box; background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 12px; padding: 12px 14px; color: #fff; font-size: 0.9rem; resize: vertical;"
              ></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 13px; font-weight: 800; font-size: 0.95rem; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 6px 20px rgba(0, 245, 155, 0.35);">
              ${Icons.check('', 18)}
              <span>Enviar Feedback para a Gerência</span>
            </button>
          </form>
        </div>

        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 20px; padding: 26px;">
          <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.3rem; margin: 0 0 16px 0; color: #fff; display: flex; align-items: center; justify-content: space-between;">
            <span>Meus Feedbacks Recentes</span>
            <span class="badge badge-cyan">${feedbacks.length} enviados</span>
          </h3>

          ${feedbacks.length === 0 ? `
            <div style="text-align: center; padding: 40px 16px; color: var(--text-muted); font-size: 0.9rem;">
              Você ainda não enviou nenhum feedback. Sua primeira avaliação ajudará a melhorar nosso atendimento!
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 12px; max-height: 420px; overflow-y: auto; padding-right: 4px;">
              ${feedbacks.map(f => `
                <div style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 14px; padding: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: #FFB800; font-size: 1.1rem; letter-spacing: 2px;">
                      ${'★'.repeat(f.nota)}${'☆'.repeat(5 - f.nota)}
                    </span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">
                      ${f.data ? f.data.split('-').reverse().join('/') : 'Recente'}
                    </span>
                  </div>
                  <p style="font-size: 0.88rem; color: #CBD5E1; margin: 0; line-height: 1.45;">
                    "${f.comentario}"
                  </p>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}
