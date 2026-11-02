import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

export function renderAdminFeedbackView() {
  const feedbacks = store.getFeedbacks();
  const students = store.getStudents();

  const total = feedbacks.length;
  const avgRating = total > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.nota || 5), 0) / total).toFixed(1)
    : '5.0';

  const count5 = feedbacks.filter(f => f.nota === 5).length;
  const count4 = feedbacks.filter(f => f.nota === 4).length;
  const count3 = feedbacks.filter(f => f.nota === 3).length;
  const countLow = feedbacks.filter(f => f.nota < 3).length;

  return `
    <div class="admin-feedback-view-module">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 24px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; color: var(--jet-emerald); font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
            ${Icons.sparkles('', 16)} GESTÃO DA QUALIDADE
          </div>
          <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 4px 0;">Feedbacks & Avaliações dos Alunos</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Acompanhe o nível de satisfação dos alunos com relação a treinos, instrutores e infraestrutura.
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px;">
          <span style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Média de Satisfação</span>
          <div style="margin: 6px 0; display: flex; align-items: baseline; justify-content: space-between;">
            <span style="font-size: 2rem; font-weight: 900; color: #FFB800; font-family: 'Outfit', sans-serif;">
              ${avgRating} <span style="font-size: 1.1rem; color: var(--text-muted);">/ 5.0</span>
            </span>
            <span style="color: #FFB800; font-size: 1.2rem;">★★★★★</span>
          </div>
          <span style="font-size: 0.78rem; color: var(--jet-emerald); font-weight: 700;">Excelente índice de NPS</span>
        </div>

        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px;">
          <span style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Total de Avaliações</span>
          <div style="margin: 6px 0; font-size: 2rem; font-weight: 900; color: #fff; font-family: 'Outfit', sans-serif;">
            ${total}
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Enviadas pelos alunos</span>
        </div>

        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px;">
          <span style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Avaliações 5 Estrelas</span>
          <div style="margin: 6px 0; font-size: 2rem; font-weight: 900; color: var(--jet-emerald); font-family: 'Outfit', sans-serif;">
            ${count5}
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">${total > 0 ? Math.round((count5/total)*100) : 100}% de aprovação máxima</span>
        </div>

        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px;">
          <span style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Pontos de Atenção</span>
          <div style="margin: 6px 0; font-size: 2rem; font-weight: 900; color: ${countLow > 0 ? 'var(--ruby-danger)' : 'var(--jet-cyan)'}; font-family: 'Outfit', sans-serif;">
            ${countLow}
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">${countLow === 0 ? 'Nenhuma queixa pendente' : 'Críticas recebidas'}</span>
        </div>
      </div>

      <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 18px; padding: 24px;">
        <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.3rem; margin: 0 0 18px 0; color: #fff;">
          Todas as Avaliações Enviadas
        </h3>

        ${feedbacks.length === 0 ? `
          <div style="text-align: center; padding: 48px; color: var(--text-muted);">
            Nenhum feedback foi enviado pelos alunos até o momento.
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${feedbacks.map(f => {
              const student = students.find(s => s.id === f.usuario_id);
              return `
                <div style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 14px; padding: 18px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
                  <div style="display: flex; align-items: flex-start; gap: 14px; flex: 1; min-width: 280px;">
                    <img src="${student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" style="width: 44px; height: 44px; border-radius: 12px; object-fit: cover;" alt="">
                    <div>
                      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                        <strong style="color: #fff; font-size: 1rem;">${student?.name || 'Aluno da Academia'}</strong>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">
                          ${f.data ? f.data.split('-').reverse().join('/') : 'Data recente'}
                        </span>
                      </div>
                      <div style="color: #FFB800; font-size: 1.1rem; letter-spacing: 2px; margin-bottom: 8px;">
                        ${'★'.repeat(f.nota || 5)}${'☆'.repeat(5 - (f.nota || 5))}
                      </div>
                      <p style="font-size: 0.9rem; color: #CBD5E1; margin: 0; line-height: 1.45;">
                        "${f.comentario || 'Sem comentários adicionais.'}"
                      </p>
                    </div>
                  </div>

                  <span class="badge ${f.nota >= 4 ? 'badge-success' : f.nota === 3 ? 'badge-warning' : 'badge-danger'}" style="font-weight: 700;">
                    Nota ${f.nota || 5} / 5
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}
