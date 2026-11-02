import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

let scheduleFilter = 'all';

export function setScheduleFilter(filter) {
  scheduleFilter = filter;
}

export function renderPersonalSchedule() {
  const activePersonal = store.getActivePersonal();
  const rawAppointments = store.getAppointments();
  const personalAppointments = rawAppointments.filter(a => a.personalId === activePersonal.id);
  const allAppointments = personalAppointments.length > 0 ? personalAppointments : rawAppointments;
  const rawStudents = store.getStudents();
  const personalStudents = rawStudents.filter(s => s.personalId === activePersonal.id);
  const students = personalStudents.length > 0 ? personalStudents : rawStudents;

  const filteredAppointments = allAppointments.filter(a => {
    if (scheduleFilter === 'all') return true;
    return a.status === scheduleFilter;
  });

  return `
    <div class="personal-schedule-module">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 24px;">
        <div>
          <h2>Minha Agenda de Aulas & Treinos</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Acompanhe suas sessões com alunos, confirme atendimentos e agende novos treinos.
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="openPersonalBookingModalBtn" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 700;">
            ${Icons.plus('', 16)}
            <span>Agendar Novo Treino</span>
          </button>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
        <div class="admin-filter-tabs">
          <button class="admin-filter-btn ${scheduleFilter === 'all' ? 'active' : ''}" data-schedule-filter="all">
            Todas as Sessões (${allAppointments.length})
          </button>
          <button class="admin-filter-btn ${scheduleFilter === 'confirmado' ? 'active' : ''}" data-schedule-filter="confirmado">
            Confirmadas (${allAppointments.filter(a => a.status === 'confirmado').length})
          </button>
          <button class="admin-filter-btn ${scheduleFilter === 'concluido' ? 'active' : ''}" data-schedule-filter="concluido">
            Concluídas (${allAppointments.filter(a => a.status === 'concluido').length})
          </button>
        </div>

        <span class="badge badge-cyan" style="display: inline-flex; align-items: center; gap: 6px;">
          ${Icons.calendar('', 14)}
          <span>${filteredAppointments.length} Sessões Exibidas</span>
        </span>
      </div>

      <div class="glass-panel" style="padding: 24px; margin-bottom: 24px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px;">
        <h3 style="font-size: 1.15rem; margin-bottom: 18px; display: flex; align-items: center; gap: 8px;">
          ${Icons.clock('', 18)}
          <span>Horários Marcados</span>
        </h3>

        ${filteredAppointments.length === 0 ? `
          <div style="text-align: center; padding: 48px 16px; color: var(--jet-text-sub);">
            <div style="display: flex; justify-content: center; margin-bottom: 12px; color: var(--jet-cyan);">
              ${Icons.calendar('', 42)}
            </div>
            <h4 style="color: #fff; font-size: 1.1rem; margin-bottom: 4px;">Nenhum atendimento encontrado</h4>
            <p style="font-size: 0.9rem;">Não há sessões registradas com o filtro selecionado.</p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${filteredAppointments.map(apt => `
              <div style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                  <div style="background: rgba(0, 229, 255, 0.12); color: var(--jet-cyan); border: 1px solid rgba(0, 229, 255, 0.3); border-radius: 10px; padding: 10px 14px; text-align: center; font-family: 'Outfit', sans-serif;">
                    <div style="font-size: 1.2rem; font-weight: 800;">${apt.time}</div>
                    <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700;">${apt.date.split('-').reverse().slice(0, 2).join('/')}</div>
                  </div>
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <strong style="font-size: 1.1rem; color: #fff;">${apt.studentName}</strong>
                      <span class="badge ${apt.status === 'confirmado' ? 'badge-success' : apt.status === 'concluido' ? 'badge-cyan' : 'badge-danger'}">
                        ${apt.status === 'confirmado' ? '● Confirmado' : apt.status === 'concluido' ? '✓ Concluído' : 'Cancelado'}
                      </span>
                    </div>
                    ${apt.notes ? `<div style="font-size: 0.82rem; color: var(--jet-text-sub); margin-top: 4px;">${apt.notes}</div>` : ''}
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 8px;">
                  ${apt.status === 'confirmado' ? `
                    <button class="btn btn-secondary btn-sm complete-apt-btn" data-apt-id="${apt.id}" style="display: inline-flex; align-items: center; gap: 5px; font-weight: 700;">
                      ${Icons.check('', 13)}
                      <span>Concluir Sessão</span>
                    </button>
                    <button class="btn btn-danger btn-sm cancel-apt-btn" data-apt-id="${apt.id}" style="font-weight: 700;">
                      Cancelar
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div class="glass-panel" style="padding: 24px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px;">
        <h3 style="font-size: 1.15rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          ${Icons.sparkles('', 18)}
          <span>Sua Grade Padrão de Horários Disponíveis</span>
        </h3>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          ${(activePersonal.availableSlots || []).map(s => `
            <div style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); padding: 10px 16px; border-radius: 10px; font-size: 0.88rem;">
              <strong style="color: var(--jet-cyan); font-size: 0.95rem;">${s.time}</strong> • <span style="color: var(--jet-text-sub);">${s.days.join(', ')}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div id="personalBookingModal" class="modal-overlay">
        <div class="modal-content" style="max-width: 480px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 20px;">
          <div class="modal-header" style="border-bottom: 1px solid var(--jet-border); padding-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${Icons.calendar('', 20)}
              <h3 class="modal-title" style="font-family: 'Outfit', sans-serif;">Agendar Nova Sessão com Aluno</h3>
            </div>
            <button id="closePersonalBookingModalBtn" class="modal-close">&times;</button>
          </div>
          <form id="personalBookingForm">
            <div class="modal-body" style="padding: 16px 0;">
              <div class="form-group" style="margin-bottom: 14px;">
                <label class="form-label">Selecionar Aluno</label>
                <select id="pBookingStudentSelect" class="form-select" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff; padding: 10px 12px;">
                  ${students.map(s => `
                    <option value="${s.id}">${s.name} (${s.goal})</option>
                  `).join('')}
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
                <div class="form-group">
                  <label class="form-label">Data</label>
                  <input type="date" id="pBookingDate" class="form-input" value="${new Date().toISOString().split('T')[0]}" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Horário</label>
                  <select id="pBookingTime" class="form-select" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff; padding: 10px 12px;">
                    <option value="07:00">07:00</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00" selected>18:00</option>
                    <option value="19:00">19:00</option>
                    <option value="20:00">20:00</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Observações da Sessão (Opcional)</label>
                <textarea id="pBookingNotes" class="form-textarea" placeholder="Ex: Avaliação de força, teste de carga máxima ou treino funcional..." style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;"></textarea>
              </div>
            </div>
            <div class="modal-footer" style="border-top: 1px solid var(--jet-border); padding-top: 14px;">
              <button type="button" id="closePersonalBookingModalBtn2" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
                ${Icons.check('', 16)}
                <span>Confirmar Agendamento</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
