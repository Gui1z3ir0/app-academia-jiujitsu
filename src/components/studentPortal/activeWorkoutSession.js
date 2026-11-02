import { store } from '../../data/store.js';
import { soundManager } from '../../utils/audio.js';

let activeWorkoutState = {
  isOpen: false,
  studentId: 'aluno_1',
  day: 'Segunda',
  exerciseIndex: 0,
  currentSet: 1,
  totalSets: 4,
  isResting: false,
  restRemaining: 60,
  restTotal: 60,
  timerInterval: null,
  workoutSeconds: 0,
  workoutInterval: null,
  totalKgMoved: 0,
  isFinished: false
};

import { showToast } from '../toast.js';

export function openActiveWorkout(studentId, day = 'Segunda') {
  const workout = store.getWorkoutForStudent(studentId, day);
  const exercises = workout?.exercises || [];

  if (exercises.length === 0) {
    showToast('warning', 'Sem Exercícios', 'Nenhum exercício programado para este dia.');
    return;
  }

  activeWorkoutState = {
    isOpen: true,
    studentId,
    day,
    exerciseIndex: 0,
    currentSet: 1,
    totalSets: exercises[0].sets || 4,
    isResting: false,
    restRemaining: exercises[0].restSeconds || 60,
    restTotal: exercises[0].restSeconds || 60,
    timerInterval: null,
    workoutSeconds: 0,
    workoutInterval: setInterval(() => {
      activeWorkoutState.workoutSeconds++;
      updateTimerDisplays();
    }, 1000),
    totalKgMoved: 0,
    isFinished: false
  };

  renderActiveWorkoutOverlay();
}

export function closeActiveWorkout() {
  if (activeWorkoutState.timerInterval) clearInterval(activeWorkoutState.timerInterval);
  if (activeWorkoutState.workoutInterval) clearInterval(activeWorkoutState.workoutInterval);
  activeWorkoutState.isOpen = false;

  const overlay = document.getElementById('activeWorkoutOverlay');
  if (overlay) overlay.classList.remove('active');
}

export function renderActiveWorkoutOverlay() {
  let overlay = document.getElementById('activeWorkoutOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'activeWorkoutOverlay';
    overlay.className = 'active-workout-overlay';
    document.body.appendChild(overlay);
  }

  if (!activeWorkoutState.isOpen) {
    overlay.classList.remove('active');
    return;
  }

  overlay.classList.add('active');

  const workout = store.getWorkoutForStudent(activeWorkoutState.studentId, activeWorkoutState.day);
  const exercises = workout?.exercises || [];
  const currentEx = exercises[activeWorkoutState.exerciseIndex] || exercises[0];

  if (activeWorkoutState.isFinished) {
    const minutes = Math.floor(activeWorkoutState.workoutSeconds / 60);
    const calories = Math.round(activeWorkoutState.workoutSeconds * 0.16) + 120;

    overlay.innerHTML = `
      <div class="active-workout-body" style="justify-content: center; align-items: center;">
        <div class="victory-screen-card" style="width: 100%;">
          <div class="victory-trophy">🏆</div>
          <h2 style="font-size: 1.8rem; margin-bottom: 6px;">TREINO CONCLUÍDO!</h2>
          <p style="color: var(--neon-green); font-weight: 700; font-size: 1.1rem; margin-bottom: 24px;">
            Sensacional! Mais um dia de vitória pra conta! 🔥
          </p>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
            <div style="background: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Volume Total</div>
              <div style="font-family: 'Outfit', sans-serif; font-size: 1.4rem; font-weight: 800; color: var(--neon-green);">
                ${activeWorkoutState.totalKgMoved} kg
              </div>
            </div>
            <div style="background: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Tempo Total</div>
              <div style="font-family: 'Outfit', sans-serif; font-size: 1.4rem; font-weight: 800; color: var(--neon-cyan);">
                ${minutes} min
              </div>
            </div>
            <div style="background: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Calorias</div>
              <div style="font-family: 'Outfit', sans-serif; font-size: 1.4rem; font-weight: 800; color: #FFB800;">
                ~${calories} kcal
              </div>
            </div>
          </div>

          <button id="finishWorkoutExitBtn" class="btn btn-primary" style="width: 100%; padding: 16px; font-size: 1.05rem;">
            <span>✓ Salvar e Voltar ao Início</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById('finishWorkoutExitBtn')?.addEventListener('click', () => {
      closeActiveWorkout();
      exercises.forEach(e => {
        store.updateExercise(activeWorkoutState.studentId, activeWorkoutState.day, e.id, { completed: true });
      });
      window.dispatchEvent(new CustomEvent('fitmanager:statechange'));
    });
    return;
  }

  const formatMinSec = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  overlay.innerHTML = `
    <header class="active-workout-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span class="badge badge-success">● TREINO ATIVO</span>
        <span id="activeWorkoutDuration" style="font-family: monospace; font-size: 1rem; color: var(--text-secondary);">
          ${formatMinSec(activeWorkoutState.workoutSeconds)}
        </span>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 0.85rem; color: var(--text-muted);">
          Ex. ${activeWorkoutState.exerciseIndex + 1} de ${exercises.length}
        </span>
        <button id="abortActiveWorkoutBtn" class="btn btn-danger btn-sm">
          Encerrar
        </button>
      </div>
    </header>

    <div class="active-workout-body">
      <div class="glass-panel" style="padding: 24px; text-align: center;">
        <span class="badge badge-cyan" style="margin-bottom: 8px;">${currentEx.muscleGroup || currentEx.grupo_muscular || 'Musculação'}</span>
        <h1 style="font-size: 1.7rem; margin-bottom: 6px;">${currentEx.name || currentEx.nome || 'Exercício'}</h1>
        ${(currentEx.notes || currentEx.descricao) ? `<p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">💡 ${currentEx.notes || currentEx.descricao}</p>` : ''}

        <div style="display: flex; justify-content: center; gap: 8px; margin: 16px 0;">
          ${Array.from({ length: currentEx.sets || 4 }).map((_, idx) => `
            <div style="
              width: 38px;
              height: 38px;
              border-radius: var(--radius-full);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-family: 'Outfit', sans-serif;
              font-size: 0.95rem;
              background: ${idx + 1 < activeWorkoutState.currentSet ? 'var(--neon-green)' : idx + 1 === activeWorkoutState.currentSet ? 'var(--neon-cyan)' : 'var(--bg-surface-elevated)'};
              color: ${idx + 1 <= activeWorkoutState.currentSet ? '#090D16' : 'var(--text-muted)'};
              border: 2px solid ${idx + 1 === activeWorkoutState.currentSet ? 'var(--neon-cyan)' : 'transparent'};
            ">
              ${idx + 1 < activeWorkoutState.currentSet ? '✓' : idx + 1}
            </div>
          `).join('')}
        </div>

        <div style="display: flex; justify-content: center; align-items: center; gap: 24px; margin-top: 10px;">
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Meta de Reps</div>
            <div style="font-family: 'Outfit', sans-serif; font-size: 1.6rem; font-weight: 800;">${currentEx.reps}</div>
          </div>
          <div style="width: 1px; height: 36px; background: var(--border-subtle);"></div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Carga Utilizada</div>
            <div style="font-family: 'Outfit', sans-serif; font-size: 1.6rem; font-weight: 800; color: var(--neon-green);">${currentEx.loadKg} kg</div>
          </div>
        </div>
      </div>

      ${activeWorkoutState.isResting ? `
        <div class="active-workout-timer-hero">
          <span style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; color: var(--neon-green); letter-spacing: 1px;">
            TEMPO DE DESCANSO
          </span>
          <div id="hugeCountdownDisplay" class="huge-countdown-number">${activeWorkoutState.restRemaining}s</div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 14px;">
            Respire fundo e hidrate-se para a próxima série!
          </p>
          <div style="display: flex; gap: 10px;">
            <button id="skipRestTimerBtn" class="btn btn-secondary">
              Pular Descanso ➔
            </button>
            <button id="add30sRestBtn" class="btn btn-secondary">
              + 30s
            </button>
          </div>
        </div>
      ` : `
        <button id="completeActiveSetBtn" class="btn btn-primary" style="padding: 20px; font-size: 1.15rem; box-shadow: 0 8px 30px rgba(0, 245, 155, 0.4);">
          <span>✓ Concluir Série ${activeWorkoutState.currentSet} de ${currentEx.sets || 4}</span>
        </button>
      `}

      ${exercises[activeWorkoutState.exerciseIndex + 1] ? `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.8rem; color: var(--text-muted);">A seguir:</span>
          <strong style="font-size: 0.9rem; color: var(--neon-cyan);">${exercises[activeWorkoutState.exerciseIndex + 1].name || exercises[activeWorkoutState.exerciseIndex + 1].nome || 'Próximo Exercício'}</strong>
        </div>
      ` : ''}

      <button id="finishWorkoutNowBtn" class="btn btn-secondary btn-sm" style="margin-top: auto;">
        <span>🏁 Finalizar Treino Completo</span>
      </button>
    </div>
  `;

  attachActiveWorkoutListeners(currentEx, exercises);
}

function attachActiveWorkoutListeners(currentEx, exercises) {
  document.getElementById('completeActiveSetBtn')?.addEventListener('click', () => {
    soundManager.playNotificationPop();
    const repsNumber = parseInt(currentEx.reps, 10) || 10;
    activeWorkoutState.totalKgMoved += (currentEx.loadKg || 20) * repsNumber;

    if (activeWorkoutState.currentSet < (currentEx.sets || 4)) {
      activeWorkoutState.currentSet++;
      startRestCountdown(currentEx.restSeconds || 60);
    } else {
      if (activeWorkoutState.exerciseIndex < exercises.length - 1) {
        activeWorkoutState.exerciseIndex++;
        activeWorkoutState.currentSet = 1;
        startRestCountdown(currentEx.restSeconds || 60);
      } else {
        finishWorkout();
      }
    }
  });

  document.getElementById('skipRestTimerBtn')?.addEventListener('click', () => {
    if (activeWorkoutState.timerInterval) clearInterval(activeWorkoutState.timerInterval);
    activeWorkoutState.isResting = false;
    renderActiveWorkoutOverlay();
  });

  document.getElementById('add30sRestBtn')?.addEventListener('click', () => {
    activeWorkoutState.restRemaining += 30;
    const el = document.getElementById('hugeCountdownDisplay');
    if (el) el.textContent = `${activeWorkoutState.restRemaining}s`;
  });

  document.getElementById('abortActiveWorkoutBtn')?.addEventListener('click', () => {
    if (confirm('Deseja realmente sair do treino em andamento?')) {
      closeActiveWorkout();
    }
  });

  document.getElementById('finishWorkoutNowBtn')?.addEventListener('click', () => {
    if (confirm('Deseja finalizar o treino agora e ver o resumo de resultados?')) {
      finishWorkout();
    }
  });
}

function startRestCountdown(seconds) {
  activeWorkoutState.isResting = true;
  activeWorkoutState.restRemaining = seconds;
  activeWorkoutState.restTotal = seconds;

  if (activeWorkoutState.timerInterval) clearInterval(activeWorkoutState.timerInterval);

  renderActiveWorkoutOverlay();

  activeWorkoutState.timerInterval = setInterval(() => {
    activeWorkoutState.restRemaining--;
    const el = document.getElementById('hugeCountdownDisplay');
    if (el) el.textContent = `${activeWorkoutState.restRemaining}s`;

    if (activeWorkoutState.restRemaining <= 0) {
      clearInterval(activeWorkoutState.timerInterval);
      activeWorkoutState.isResting = false;
      soundManager.playTimerChime();
      renderActiveWorkoutOverlay();
    }
  }, 1000);
}

function finishWorkout() {
  if (activeWorkoutState.timerInterval) clearInterval(activeWorkoutState.timerInterval);
  if (activeWorkoutState.workoutInterval) clearInterval(activeWorkoutState.workoutInterval);
  activeWorkoutState.isFinished = true;
  soundManager.playSuccessSound();
  renderActiveWorkoutOverlay();
}

function updateTimerDisplays() {
  const el = document.getElementById('activeWorkoutDuration');
  if (el) {
    const mins = Math.floor(activeWorkoutState.workoutSeconds / 60);
    const secs = activeWorkoutState.workoutSeconds % 60;
    el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}
