import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

export function renderPersonalDashboard() {
  const activePersonal = store.getActivePersonal();
  const allStudents = store.getStudents();
  const personalStudents = allStudents.filter(s => s.personalId === activePersonal.id);
  const students = personalStudents.length > 0 ? personalStudents : allStudents;
  const allAppointments = store.getAppointments();
  const personalAppointments = allAppointments.filter(a => a.personalId === activePersonal.id);
  const appointments = personalAppointments.length > 0 ? personalAppointments : allAppointments;
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmado');

  return `
    <div class="personal-dashboard-module">
      <div class="personal-header-card">
        <div class="personal-profile-info">
          <img src="${activePersonal.avatar}" class="personal-avatar" alt="Personal">
          <div>
            <div style="font-size: 0.8rem; color: var(--jet-cyan); font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
              ÁREA DO PROFISSIONAL
            </div>
            <h1 style="font-size: 1.5rem; margin: 2px 0; font-family: 'Outfit', sans-serif;">${activePersonal.name}</h1>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="cref-tag">CREF: ${activePersonal.cref}</span>
              <span class="badge badge-cyan">${activePersonal.specialty}</span>
              <span style="color: #FFB800; font-size: 0.85rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                ★ ${activePersonal.rating}
              </span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-primary btn-sm jump-to-tab-btn" data-target="personal_workouts" style="display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.dumbbell('', 15)}
            <span>Montar Treinos</span>
          </button>
          <button class="btn btn-secondary btn-sm jump-to-tab-btn" data-target="personal_evolution" style="display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.sparkles('', 15)}
            <span>Avaliações Físicas</span>
          </button>
          <button class="btn btn-secondary btn-sm jump-to-tab-btn" data-target="personal_schedule" style="display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.calendar('', 15)}
            <span>Minha Agenda (${confirmedAppointments.length})</span>
          </button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 24px;">
        <div class="glass-panel" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
            <h3 style="font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
              ${Icons.users('', 18)}
              <span>Meus Alunos (${students.length})</span>
            </h3>
            <span class="badge badge-success">Ativos</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${students.length === 0 ? `
              <div style="text-align: center; padding: 24px; color: var(--text-muted);">
                Nenhum aluno vinculado a este personal no momento.
              </div>
            ` : students.map(st => `
              <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img src="${st.avatar}" style="width: 44px; height: 44px; border-radius: var(--radius-full); object-fit: cover;" alt="">
                  <div>
                    <div style="font-weight: 700; font-size: 0.95rem;">${st.name}</div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">${st.goal}</div>
                  </div>
                </div>

                <div style="display: flex; gap: 6px;">
                  <button class="btn btn-primary btn-sm quick-edit-workout-btn" data-student-id="${st.id}" title="Montar/Editar Treino do Aluno" style="display: inline-flex; align-items: center; gap: 5px;">
                    ${Icons.dumbbell('', 13)}
                    <span>Treinos</span>
                  </button>
                  <button class="btn btn-secondary btn-sm quick-view-evo-btn" data-student-id="${st.id}" title="Acompanhar Evolução Física" style="display: inline-flex; align-items: center; gap: 5px;">
                    ${Icons.sparkles('', 13)}
                    <span>Evolução</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="glass-panel" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
            <h3 style="font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
              ${Icons.calendar('', 18)}
              <span>Próximas Sessões</span>
            </h3>
            <span class="badge badge-cyan">${confirmedAppointments.length} Confirmadas</span>
          </div>

          ${confirmedAppointments.length === 0 ? `
            <div style="text-align: center; padding: 30px; color: var(--text-muted);">
              <div style="display: flex; justify-content: center; margin-bottom: 8px;">${Icons.calendar('', 32)}</div>
              <p>Nenhum atendimento pendente na agenda.</p>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${confirmedAppointments.map(apt => `
                <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                      <span class="badge badge-cyan">${apt.time}</span>
                      <strong style="font-size: 0.95rem;">${apt.studentName}</strong>
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">
                      Data: ${apt.date.split('-').reverse().join('/')} ${apt.notes ? `• ${apt.notes}` : ''}
                    </div>
                  </div>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn btn-secondary btn-sm complete-apt-btn" data-apt-id="${apt.id}" style="padding: 4px 8px; font-size: 0.75rem;">
                      ${Icons.check('', 12)} Concluir
                    </button>
                    <button class="btn btn-danger btn-sm cancel-apt-btn" data-apt-id="${apt.id}" style="padding: 4px 8px; font-size: 0.75rem;">
                      Cancelar
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>

      <div class="glass-panel" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
              ${Icons.sparkles('', 18)}
              <span>Feedbacks & Avaliações dos Alunos</span>
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
              Notas de 1 a 5 estrelas, comentários pedagógicos e datas das avaliações recebidas.
            </p>
          </div>
          <span class="badge badge-success" style="font-weight: 700;">
            Satisfação Média: ★ ${activePersonal.rating || '4.9'}
          </span>
        </div>

        <div class="feedbacks-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px;">
          ${(() => {
            const feedbacks = store.getFeedbacks(null, activePersonal.id);
            const displayFeedbacks = feedbacks.length > 0 ? feedbacks : store.getFeedbacks();

            if (displayFeedbacks.length === 0) {
              return `
                <div style="text-align: center; padding: 24px; color: var(--text-muted); grid-column: 1 / -1;">
                  Nenhum feedback registrado pelos alunos até o momento.
                </div>
              `;
            }

            return displayFeedbacks.map(fb => {
              const aluno = store.getUsuario(fb.usuario_id) || { nome: 'Aluno JetFit', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' };
              const treino = store.getTreinos().find(t => t.id === fb.treino_id);
              const stars = '★'.repeat(fb.nota) + '☆'.repeat(Math.max(0, 5 - fb.nota));

              return `
                <div style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 14px; padding: 18px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <img src="${aluno.avatar}" style="width: 40px; height: 40px; border-radius: var(--radius-full); object-fit: cover;" alt="">
                      <div>
                        <strong style="color: #fff; font-size: 0.95rem; display: block;">${aluno.nome}</strong>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${treino?.nome ? `Treino: ${treino.nome}` : 'Treinamento Presencial'}</span>
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <div style="color: #FFB800; font-size: 1.1rem; letter-spacing: 2px;">${stars}</div>
                      <span style="font-size: 0.72rem; color: var(--text-muted);">${fb.data ? fb.data.split('-').reverse().join('/') : 'Recente'}</span>
                    </div>
                  </div>
                  <p style="font-size: 0.86rem; color: var(--text-secondary); line-height: 1.5; font-style: italic; background: rgba(0,0,0,0.25); padding: 10px 14px; border-radius: 8px; border-left: 3px solid var(--jet-emerald); margin: 0;">
                    "${fb.comentario}"
                  </p>
                </div>
              `;
            }).join('');
          })()}
        </div>
      </div>
    </div>
  `;
}
