import { store } from '../../data/store.js';
import { Icons } from '../icons.js';
import { renderWorkoutViewer, getSelectedDay } from './workoutViewer.js';
import { renderMuscleHeatmap } from './muscleHeatmap.js';

let dailyWaterMl = parseInt(localStorage.getItem('fitmanager_water_ml') || '1750', 10);
const dailyWaterGoalMl = 3000;

export function addWater(amount = 250) {
  dailyWaterMl = Math.max(0, Math.min(dailyWaterMl + amount, 5000));
  localStorage.setItem('fitmanager_water_ml', String(dailyWaterMl));
}

export function renderStudentDashboard(studentId) {
  const student = store.getStudents().find(s => s.id === studentId) || store.getActiveStudent();
  if (!student) {
    return `<div style="padding: 32px; text-align: center; color: var(--text-muted);">Nenhum aluno encontrado.</div>`;
  }
  const gymConfig = store.getGymConfig();
  const plan = store.getPlan(student.planId) || store.getPlans()[0];
  const matriculas = store.getMatriculas(student.id);
  const matricula = matriculas[0] || {
    inicio: '2026-01-10',
    termino: '2027-01-10',
    status: 'Ativa'
  };
  const payments = store.getStudentPayments(student.id);
  const pendingPayment = payments.find(p => p.status === 'pendente' || p.status === 'atrasado');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateStr = (student?.dueDate && student.dueDate.includes('-') && student.dueDate.length >= 8) ? student.dueDate : '2026-10-30';
  const [y, m, d] = dueDateStr.split('-').map(Number);
  const target = new Date(y, (m || 1) - 1, d || 1);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let statusLabel = 'Em Dia';
  let statusBadgeClass = 'badge-success';
  let diffText = `Vence em ${diffDays} dias (${dueDateStr.split('-').reverse().join('/')})`;

  if (diffDays < 0) {
    statusLabel = 'Em Atraso';
    statusBadgeClass = 'badge-danger';
    diffText = `Atrasado há ${Math.abs(diffDays)} dias (${dueDateStr.split('-').reverse().join('/')})`;
  } else if (diffDays <= 3) {
    statusLabel = 'Vence em Breve';
    statusBadgeClass = 'badge-warning';
    diffText = diffDays === 0 ? 'Vence HOJE!' : `Vence em ${diffDays} dias (${dueDateStr.split('-').reverse().join('/')})`;
  }

  const currentSelectedDay = getSelectedDay();
  const dayWorkout = store.getWorkoutForStudent(student.id, currentSelectedDay);
  const totalExercises = dayWorkout?.exercises?.length || 0;

  const estimatedVolumeKg = (dayWorkout?.exercises || []).reduce((acc, ex) => {
    const reps = parseInt(ex.reps, 10) || 10;
    return acc + ((ex.sets || 4) * reps * (ex.loadKg || 20));
  }, 0);

  const waterPct = Math.min(Math.round((dailyWaterMl / dailyWaterGoalMl) * 100), 100);
  const trainingDays = store.getStudentTrainingDays(student.id);

  return `
    <div class="student-dashboard-module">
      <div class="student-hero-card">
        <div class="student-profile-summary">
          <img src="${student.avatar}" class="student-big-avatar" alt="Avatar do Aluno">
          <div>
            <div style="font-size: 0.85rem; color: var(--jet-emerald); font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; display: flex; align-items: center; gap: 6px;">
              ${Icons.flame('', 14)} ${gymConfig?.name || 'ACADEMIA & JIU-JÍTSU'}
            </div>
            <h1 class="student-greeting" style="margin-top: 2px;">Olá, ${student.name.split(' ')[0]}!</h1>
            <div class="student-meta-tags">
              <span class="badge badge-cyan">${plan.name}</span>
              <span class="badge ${statusBadgeClass}">${statusLabel}</span>
              <span class="badge" style="background: rgba(255,255,255,0.08); color: #E2E8F0;">🥋 Faixa ${student.faixaJiuJitsu || 'Branca'} (${student.grausJiuJitsu || 0}º Grau)</span>
            </div>
          </div>
        </div>

        <div class="student-finance-pill">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Mensalidade</div>
          <div style="font-family: 'Outfit', sans-serif; font-size: 1.6rem; font-weight: 800; color: var(--text-primary);">
            R$ ${student.monthlyAmount.toFixed(2)}
          </div>
          <div class="finance-due-date">${diffText}</div>
          <button class="btn btn-primary btn-sm trigger-pay-btn" data-payment-id="${pendingPayment?.id || ''}" data-amount="${student.monthlyAmount}" data-plan="${plan.name}" style="margin-top: 4px; display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.card('', 15)}
            <span>Ver Fatura / PIX</span>
          </button>
        </div>
      </div>

      <div class="matricula-status-card" style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 16px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="background: rgba(0, 245, 155, 0.12); color: var(--jet-emerald); border-radius: 12px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            ${Icons.idCard('', 22)}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <strong style="color: #fff; font-size: 0.95rem;">Contrato: ${plan.name}</strong>
              <span class="badge ${matricula.status === 'Ativa' ? 'badge-success' : 'badge-danger'}" style="font-size: 0.72rem;">
                ● Matrícula ${matricula.status}
              </span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
              Dias de treino definidos pelo Personal: <strong style="color: var(--neon-green);">${trainingDays.join(', ')}</strong>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button id="enablePushNotificationsBtn" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
            ${Icons.bell('', 14)}
            <span>Ativar Notificações Push</span>
          </button>
          <button id="openFeedbackModalBtn" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
            ${Icons.sparkles('', 14)}
            <span>Avaliar Treino</span>
          </button>
        </div>
      </div>

      <div class="student-quick-modules-banner" style="background: linear-gradient(135deg, rgba(0, 245, 155, 0.08), rgba(0, 229, 255, 0.04)); border: 1px solid rgba(0, 245, 155, 0.25); border-radius: 16px; padding: 16px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0;">
          <div style="background: linear-gradient(135deg, #00F59B 0%, #00E5FF 100%); color: #06090F; border-radius: 12px; width: 44px; height: 44px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 900;">
            💬
          </div>
          <div style="min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <strong style="font-size: 1rem; color: #fff;">Chat Interno com o Personal</strong>
              <span class="badge badge-success" style="font-size: 0.72rem;">No App</span>
            </div>
            <div style="font-size: 0.82rem; color: #94A3B8; margin-top: 2px;">
              Suas medidas atuais: <strong>${student.currentWeight || 75} kg</strong> • <strong>${student.heightCm || 175} cm</strong> | Converse diretamente com o Personal sem sair do aplicativo.
            </div>
          </div>
        </div>
        <div class="student-quick-modules-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-primary btn-sm" data-nav-target="chat" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 800; padding: 10px 16px; border-radius: 10px; cursor: pointer;">
            <span>💬 Abrir Chat Interno</span>
          </button>
          <button class="btn btn-secondary btn-sm" data-nav-target="jiujitsu" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 800; padding: 10px 16px; border-radius: 10px; cursor: pointer;">
            <span>🥋 Jiu-Jítsu & Presença</span>
          </button>
        </div>
      </div>

      <div class="daily-habits-strip">
        <div class="habit-card">
          <div class="habit-icon" style="color: #FF5722; background: rgba(255, 87, 34, 0.12); display: flex; align-items: center; justify-content: center;">
            ${Icons.flame('', 20)}
          </div>
          <div>
            <div class="habit-title">Dias/Semana</div>
            <div class="habit-value">${trainingDays.length} Dias</div>
          </div>
        </div>

        <div class="habit-card habit-card-hydration" style="flex: 1.2;">
          <div class="habit-icon" style="color: #00E5FF; background: rgba(0, 229, 255, 0.12); display: flex; align-items: center; justify-content: center;">
            ${Icons.droplet('', 20)}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span class="habit-title">Hidratação</span>
              <div class="hydration-btn-group" style="display: flex; gap: 6px; align-items: center;">
                <button id="removeWaterBtn" class="btn btn-secondary btn-sm" style="padding: 2px 8px; font-size: 0.72rem;" title="Retirar 250ml">
                  - 250ml
                </button>
                <button id="addWaterBtn" class="btn btn-secondary btn-sm" style="padding: 2px 8px; font-size: 0.72rem;" title="Adicionar 250ml">
                  + 250ml
                </button>
              </div>
            </div>
            <div class="habit-value" style="font-size: 1.05rem;">
              ${dailyWaterMl} <span style="font-size: 0.75rem; color: var(--text-muted);">/ ${dailyWaterGoalMl} ml (${waterPct}%)</span>
            </div>
          </div>
        </div>

        <div class="habit-card">
          <div class="habit-icon" style="color: var(--jet-emerald); background: rgba(0, 245, 155, 0.12); display: flex; align-items: center; justify-content: center;">
            ${Icons.dumbbell('', 20)}
          </div>
          <div>
            <div class="habit-title">Volume Hoje</div>
            <div class="habit-value">${estimatedVolumeKg > 0 ? `${(estimatedVolumeKg / 1000).toFixed(1)}k kg` : '0 kg'}</div>
          </div>
        </div>

        <div class="habit-card" style="cursor: pointer; border-color: rgba(0, 245, 155, 0.35);" id="quickGymPassCard">
          <div class="habit-icon" style="color: var(--jet-emerald); background: rgba(0, 245, 155, 0.15); display: flex; align-items: center; justify-content: center;">
            ${Icons.idCard('', 20)}
          </div>
          <div>
            <div class="habit-title">Carteirinha Digital</div>
            <div class="habit-value" style="font-size: 0.95rem; color: var(--jet-emerald); display: flex; align-items: center; gap: 4px;">
              Visualizar ${Icons.chevronRight('', 14)}
            </div>
          </div>
        </div>
      </div>

      ${totalExercises > 0 ? `
        <div style="background: linear-gradient(135deg, rgba(0, 245, 155, 0.12) 0%, rgba(0, 229, 255, 0.08) 100%); border: 1px solid var(--jet-border-active); border-radius: var(--radius-md); padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 24px; box-shadow: 0 8px 28px rgba(0, 245, 155, 0.18);">
          <div>
            <div style="font-size: 0.78rem; font-weight: 800; color: var(--jet-emerald); text-transform: uppercase; letter-spacing: 1.2px; display: flex; align-items: center; gap: 6px;">
              ${Icons.sparkles('', 14)} ROTINA PRONTA PARA COMEÇAR
            </div>
            <h3 style="font-size: 1.25rem; margin-top: 3px; font-family: 'Outfit', sans-serif;">${dayWorkout.title}</h3>
            <span style="font-size: 0.84rem; color: var(--text-secondary);">${totalExercises} exercícios • ~45 min estimados</span>
          </div>
          <button id="startActiveWorkoutBtn" class="btn btn-primary" style="padding: 12px 24px; font-size: 1rem; font-weight: 800; letter-spacing: 0.5px; box-shadow: 0 6px 24px rgba(0, 245, 155, 0.4); display: inline-flex; align-items: center; gap: 8px;">
            ${Icons.play('', 16)}
            <span>INICIAR TREINO AGORA</span>
          </button>
        </div>
      ` : ''}

      ${renderMuscleHeatmap(dayWorkout?.exercises || [])}

      ${renderWorkoutViewer(student.id)}
    </div>
  `;
}
