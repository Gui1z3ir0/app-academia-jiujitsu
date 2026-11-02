import { store } from '../../data/store.js';

export function renderScheduleBooking(studentId) {
  const student = store.getStudents().find(s => s.id === studentId) || store.getActiveStudent();
  const personals = store.getPersonals();
  const appointments = store.getAppointments().filter(a => a.studentId === student.id && a.status !== 'cancelado');

  const dateOptions = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' });
    const formatted = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    dateOptions.push({ value: dateStr, label: `${dayName}, ${formatted}`, isToday: i === 0 });
  }

  const selectedPersonal = personals[0];

  return `
    <div class="schedule-booking-module">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2>Agenda com Personal Trainer</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Escolha o profissional, selecione o horário livre e garanta seu acompanhamento individualizado.
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 30px;">
        <div class="glass-panel" style="padding: 24px;">
          <h3 style="font-size: 1.15rem; margin-bottom: 18px; display: flex; align-items: center; gap: 8px;">
            <span>📅</span> Nova Sessão
          </h3>

          <form id="bookingForm">
            <div class="form-group">
              <label class="form-label">Profissional / Personal</label>
              <select id="bookingPersonalSelect" class="form-select">
                ${personals.map(p => `
                  <option value="${p.id}" ${p.id === student.personalId ? 'selected' : ''}>
                    ${p.name} (CREF: ${p.cref}) - ${p.specialty}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Data do Treino</label>
              <select id="bookingDateSelect" class="form-select">
                ${dateOptions.map(d => `
                  <option value="${d.value}">${d.label} ${d.isToday ? '(Hoje)' : ''}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Horário Disponível</label>
              <div id="timeSlotsGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                ${['07:00', '08:00', '10:00', '16:00', '18:00', '19:00'].map((slot, idx) => `
                  <button type="button" class="btn btn-secondary btn-sm time-slot-pill ${idx === 1 ? 'active' : ''}" data-slot="${slot}" style="font-size: 0.85rem; padding: 10px 4px;">
                    ${slot}
                  </button>
                `).join('')}
              </div>
              <input type="hidden" id="selectedTimeSlot" value="08:00">
            </div>

            <div class="form-group">
              <label class="form-label">Observações / Foco do Treino (Opcional)</label>
              <input type="text" id="bookingNotesInput" class="form-input" placeholder="Ex: Avaliação de postura no agachamento...">
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">
              <span>✓ Confirmar Agendamento</span>
            </button>
          </form>
        </div>

        <div class="glass-panel" style="padding: 24px;">
          <h3 style="font-size: 1.15rem; margin-bottom: 18px; display: flex; align-items: center; gap: 8px;">
            <span>📋</span> Suas Sessões Marcadas
          </h3>

          ${appointments.length === 0 ? `
            <div style="text-align: center; padding: 40px 16px; color: var(--text-muted);">
              <div style="font-size: 2.5rem; margin-bottom: 10px;">📆</div>
              <p>Você não possui nenhum agendamento pendente.</p>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${appointments.map(apt => `
                <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 16px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                      <span class="badge badge-success">Confirmado</span>
                      <span style="font-size: 0.78rem; color: var(--text-muted);">${apt.date.split('-').reverse().join('/')} às ${apt.time}</span>
                    </div>
                    <div style="font-weight: 700; font-size: 1rem;">${apt.personalName}</div>
                    ${apt.notes ? `<div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">📝 ${apt.notes}</div>` : ''}
                  </div>
                  <button class="btn btn-danger btn-sm cancel-apt-btn" data-apt-id="${apt.id}" title="Cancelar Sessão">
                    Cancelar
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}
