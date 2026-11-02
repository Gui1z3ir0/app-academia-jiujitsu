import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

export function renderFeedbackModal() {
  const activeStudent = store.getActiveStudent();
  const personals = store.getPersonals();
  const treinos = store.getTreinos(activeStudent?.id);

  return `
    <div id="feedbackModal" class="modal-overlay">
      <div class="modal-content" style="max-width: 500px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 20px;">
        <div class="modal-header" style="border-bottom: 1px solid var(--jet-border); padding-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${Icons.sparkles('', 20)}
            <h3 class="modal-title" style="font-family: 'Outfit', sans-serif;">Deixar Avaliação & Feedback</h3>
          </div>
          <button id="closeFeedbackModalBtn" class="modal-close">&times;</button>
        </div>
        <form id="studentFeedbackForm">
          <div class="modal-body" style="padding: 16px 0;">
            <p style="font-size: 0.88rem; color: var(--jet-text-sub); margin-bottom: 16px;">
              Sua avaliação ajuda seu professor e a academia a melhorarem a qualidade do seu treino.
            </p>

            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label">Professor Avaliado</label>
              <select id="fbkProfessorSelect" class="form-select" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff; padding: 10px 12px;">
                ${personals.map(p => `
                  <option value="${p.id}">${p.nome || p.name} (${p.specialty ? p.specialty.split('&')[0].trim() : 'Professor'})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label">Treino Relacionado</label>
              <select id="fbkTreinoSelect" class="form-select" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff; padding: 10px 12px;">
                ${treinos.map(t => `
                  <option value="${t.id}">${t.nome}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
              <label class="form-label">Nota (1 a 5 Estrelas)</label>
              <div class="rating-stars-group" style="display: flex; gap: 10px; font-size: 1.8rem; cursor: pointer;">
                <span class="star-rating-btn" data-star="1" style="color: #FFB800;">★</span>
                <span class="star-rating-btn" data-star="2" style="color: #FFB800;">★</span>
                <span class="star-rating-btn" data-star="3" style="color: #FFB800;">★</span>
                <span class="star-rating-btn" data-star="4" style="color: #FFB800;">★</span>
                <span class="star-rating-btn" data-star="5" style="color: #FFB800;">★</span>
              </div>
              <input type="hidden" id="fbkRatingInput" value="5">
            </div>

            <div class="form-group">
              <label class="form-label">Comentário</label>
              <textarea
                id="fbkCommentInput"
                class="form-textarea"
                placeholder="Conte o que achou da intensidade, das explicações posturais, da estrutura ou da carga..."
                required
                style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff; min-height: 90px;"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer" style="border-top: 1px solid var(--jet-border); padding-top: 14px;">
            <button type="button" id="closeFeedbackModalBtn2" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.check('', 16)}
              <span>Enviar Feedback</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
