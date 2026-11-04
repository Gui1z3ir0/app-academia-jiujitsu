import { store } from './data/store.js';
import { notificationEngine } from './services/notificationEngine.js';
import { soundManager } from './utils/audio.js';

import { renderNavbar, renderSidebar, renderMobileBottomNav, renderMobileDrawer } from './components/navbar.js';
import { showToast, renderToastContainer } from './components/toast.js';
import { renderDeviceFrameToggle, toggleDeviceFrame, openPwaInstallModal, triggerPwaNativeInstall } from './components/deviceFrameToggle.js';
import { renderAuthView, setAuthActiveTab } from './components/auth/authView.js';

import { renderStudentDashboard, addWater } from './components/studentPortal/studentDashboard.js';
import { renderWorkoutViewer, getSelectedDay, setSelectedDay } from './components/studentPortal/workoutViewer.js';
import { renderStudentExercisesView, setCatalogFilter, setCatalogSearch } from './components/studentPortal/studentExercisesView.js';
import { renderStudentEvolution } from './components/studentPortal/studentEvolutionView.js';
import { renderStudentFeedbackView } from './components/studentPortal/studentFeedbackView.js';
import { renderStudentProfileView } from './components/studentPortal/studentProfileView.js';
import { renderStudentGymInfoView } from './components/studentPortal/studentGymInfoView.js';
import { renderScheduleBooking } from './components/studentPortal/scheduleBooking.js';
import { renderExerciseModal, populateAndOpenExerciseModal } from './components/studentPortal/exerciseModal.js';
import { renderGymPassModal } from './components/studentPortal/gymPassModal.js';
import { renderFeedbackModal } from './components/studentPortal/feedbackModal.js';
import { renderCoachMessageModal } from './components/studentPortal/coachMessageModal.js';
import { openActiveWorkout } from './components/studentPortal/activeWorkoutSession.js';

import { renderStudentPaymentView } from './components/paymentPortal/studentPaymentView.js';
import { renderCheckoutModal, openCheckoutModal } from './components/paymentPortal/checkoutModal.js';

import { renderPersonalDashboard } from './components/personalPortal/personalDashboard.js';
import { renderWorkoutBuilder, getBuilderSelectedDay, setBuilderSelectedDay, setBuilderSelectedStudentId } from './components/personalPortal/workoutBuilder.js';
import { renderPersonalStudentEvolution, setPersonalEvoStudentId } from './components/personalPortal/studentEvolution.js';
import { renderPersonalSchedule, setScheduleFilter } from './components/personalPortal/personalSchedule.js';

import { renderAdminDashboard } from './components/adminPortal/adminDashboard.js';
import { renderStudentManager, setStudentFilter, setSearchQuery } from './components/adminPortal/studentManager.js';
import { renderAdminWorkoutManager, setAdminWorkoutStudent, setAdminWorkoutDay } from './components/adminPortal/adminWorkoutManager.js';
import { renderAdminEvolutionManager, setAdminEvolutionStudent } from './components/adminPortal/adminEvolutionManager.js';
import { renderAdminFeedbackView } from './components/adminPortal/adminFeedbackView.js';
import { renderAdminGymConfigView } from './components/adminPortal/adminGymConfigView.js';
import { renderMatriculaManager } from './components/adminPortal/matriculaManager.js';
import { renderPersonalManager } from './components/adminPortal/personalManager.js';
import { renderPlanManager } from './components/adminPortal/planManager.js';
import { renderFinancialReports, setPaymentStatusFilter } from './components/adminPortal/financialReports.js';

import { renderJiuJitsuView } from './components/jiuJitsuPortal/jiuJitsuView.js';
import { renderChatView, setSelectedChatStudentId } from './components/chatPortal/chatView.js';

let currentTab = 'workouts';

const activeTimers = {};

function initApp() {
  notificationEngine.init();

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const isOwnerParam = urlParams.has('dono') || urlParams.has('admin') || urlParams.has('personal') ||
                         window.location.hash.toLowerCase().includes('dono') ||
                         window.location.hash.toLowerCase().includes('admin') ||
                         window.location.hash.toLowerCase().includes('personal');
    if (isOwnerParam) {
      if (!store.hasAdmin()) {
        setAuthActiveTab('owner_register');
      } else {
        setAuthActiveTab('login');
      }
    }
  } catch (e) {}

  const role = store.getCurrentRole();
  if (role === 'student') currentTab = 'workouts';
  else currentTab = 'admin_dashboard';

  store.subscribe(() => {
    renderApp();
  });

  renderApp();
  setupGlobalEventListeners();
}

function renderApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  if (!store.isLoggedIn()) {
    appContainer.innerHTML = renderAuthView();
    attachDynamicListeners();
    return;
  }

  const currentRole = store.getCurrentRole();
  const activeStudent = store.getActiveStudent();

  let tabContentHtml = '';

  if (currentRole === 'student') {
    if (currentTab.startsWith('admin_') || currentTab.startsWith('personal_')) {
      currentTab = 'workouts';
    }

    switch (currentTab) {
      case 'workouts':
        tabContentHtml = renderStudentDashboard(activeStudent?.id);
        break;
      case 'jiujitsu':
        tabContentHtml = renderJiuJitsuView();
        break;
      case 'chat':
        tabContentHtml = renderChatView();
        break;
      case 'student_exercises':
        tabContentHtml = renderStudentExercisesView();
        break;
      case 'evolution':
        tabContentHtml = renderStudentEvolution(activeStudent?.id);
        break;
      case 'student_feedback':
        tabContentHtml = renderStudentFeedbackView(activeStudent?.id);
        break;
      case 'student_profile':
        tabContentHtml = renderStudentProfileView(activeStudent?.id);
        break;
      case 'student_gym_info':
        tabContentHtml = renderStudentGymInfoView();
        break;
      case 'payments':
        tabContentHtml = renderStudentPaymentView(activeStudent?.id);
        break;
      case 'gympass_nav':
        tabContentHtml = renderStudentDashboard(activeStudent?.id);
        setTimeout(() => {
          const modal = document.getElementById('gymPassModal');
          if (modal) modal.classList.add('active');
        }, 50);
        break;
      case 'schedule':
        tabContentHtml = renderScheduleBooking(activeStudent?.id);
        break;
      default:
        tabContentHtml = renderStudentDashboard(activeStudent?.id);
    }
  } else {
    switch (currentTab) {
      case 'admin_dashboard':
        tabContentHtml = renderAdminDashboard();
        break;
      case 'personal_dashboard':
        tabContentHtml = renderPersonalDashboard();
        break;
      case 'jiujitsu':
        tabContentHtml = renderJiuJitsuView();
        break;
      case 'chat':
        tabContentHtml = renderChatView();
        break;
      case 'admin_students':
        tabContentHtml = renderStudentManager();
        break;
      case 'admin_workouts':
        tabContentHtml = renderAdminWorkoutManager();
        break;
      case 'personal_workouts':
        tabContentHtml = renderWorkoutBuilder();
        break;
      case 'admin_evolution':
        tabContentHtml = renderAdminEvolutionManager();
        break;
      case 'personal_evolution':
        tabContentHtml = renderPersonalStudentEvolution();
        break;
      case 'personal_schedule':
        tabContentHtml = renderPersonalSchedule();
        break;
      case 'admin_feedbacks':
        tabContentHtml = renderAdminFeedbackView();
        break;
      case 'admin_gym_config':
        tabContentHtml = renderAdminGymConfigView();
        break;
      case 'admin_finances':
        tabContentHtml = renderFinancialReports();
        break;
      case 'admin_matriculas':
        tabContentHtml = renderMatriculaManager();
        break;
      case 'admin_personals':
        tabContentHtml = renderPersonalManager();
        break;
      case 'admin_plans':
        tabContentHtml = renderPlanManager();
        break;
      default:
        tabContentHtml = renderAdminDashboard();
    }
  }

  appContainer.innerHTML = `
    <div class="app-wrapper">
      ${renderSidebar(currentTab)}

      <div class="app-main">
        ${renderNavbar(currentTab)}

        <main class="content-container">
          ${tabContentHtml}
        </main>
      </div>

      ${renderMobileBottomNav(currentTab)}

      ${renderMobileDrawer(currentTab)}

      ${renderCheckoutModal()}
      ${renderExerciseModal()}
      ${renderGymPassModal()}
      ${renderFeedbackModal()}
      ${renderCoachMessageModal()}
      ${renderDeviceFrameToggle()}
      ${renderToastContainer()}
    </div>
  `;

  attachDynamicListeners();
}

function attachDynamicListeners() {
  const addStudentDueDate = document.getElementById('addStudentDueDate');
  if (addStudentDueDate && !addStudentDueDate.value) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    addStudentDueDate.value = d.toISOString().split('T')[0];
  }

  const chatList = document.getElementById('inAppChatMessagesList');
  if (chatList) {
    chatList.scrollTop = chatList.scrollHeight;
  }
}

function setupGlobalEventListeners() {
  const body = document.body;

  body.addEventListener('click', async (e) => {
    if (e.target.closest('button, a, .btn, .mobile-nav-link, .nav-item, input[type="checkbox"]')) {
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(6);
        }
      } catch (err) {}
    }

    const authRegTabBtn = e.target.closest('#authTabRegisterBtn');
    if (authRegTabBtn) {
      setAuthActiveTab('register');
      renderApp();
      return;
    }

    const authLoginTabBtn = e.target.closest('#authTabLoginBtn');
    if (authLoginTabBtn) {
      setAuthActiveTab('login');
      renderApp();
      return;
    }

    const backToLoginBtn = e.target.closest('#authBackToLoginBtn');
    if (backToLoginBtn) {
      setAuthActiveTab('login');
      renderApp();
      return;
    }

    const forgotPassBtn = e.target.closest('#authForgotPasswordBtn');
    if (forgotPassBtn) {
      setAuthActiveTab('recover');
      renderApp();
      return;
    }

    const triggerOwnerBtn = e.target.closest('#authTriggerOwnerSetupBtn');
    if (triggerOwnerBtn) {
      setAuthActiveTab('owner_register');
      renderApp();
      return;
    }

    const openLgpdModalBtn = e.target.closest('#openLgpdPolicyModalBtn');
    if (openLgpdModalBtn) {
      const modal = document.getElementById('lgpdPolicyModal');
      if (modal) modal.classList.add('active');
      return;
    }

    const closeLgpdModalBtn = e.target.closest('#closeLgpdPolicyModalBtn, #closeLgpdPolicyModalBtn2');
    if (closeLgpdModalBtn) {
      const modal = document.getElementById('lgpdPolicyModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const deleteMyAccountBtn = e.target.closest('#deleteMyAccountLgpdBtn');
    if (deleteMyAccountBtn) {
      if (confirm('ATENÇÃO (LGPD): Deseja realmente excluir permanentemente sua conta e todos os seus dados pessoais, treinos, avaliações e histórico? Esta ação não pode ser desfeita.')) {
        const res = store.deleteOwnAccount();
        if (res.success) {
          setAuthActiveTab('login');
          showToast('info', 'Conta Excluída (LGPD)', res.message);
          renderApp();
        } else {
          showToast('error', 'Operação Não Permitida', res.message);
        }
      }
      return;
    }

    const enablePushBtn = e.target.closest('#enablePushNotificationsBtn');
    if (enablePushBtn) {
      const res = await notificationEngine.requestPushPermission();
      if (res.granted) {
        soundManager.playSuccessSound();
        showToast('success', 'Push Ativado', 'As notificações push foram ativadas neste aparelho.');
      } else {
        showToast('warning', 'Push Não Ativado', res.reason);
      }
      return;
    }

    const toggleTrainDayBtn = e.target.closest('.toggle-student-train-day-btn');
    if (toggleTrainDayBtn) {
      const studentId = toggleTrainDayBtn.getAttribute('data-student-id');
      const day = toggleTrainDayBtn.getAttribute('data-day');
      const currentDays = store.getStudentTrainingDays(studentId);
      let updatedDays;
      if (currentDays.includes(day)) {
        updatedDays = currentDays.filter(d => d !== day);
      } else {
        updatedDays = [...currentDays, day];
      }
      store.setStudentTrainingDays(studentId, updatedDays);
      soundManager.playNotificationPop();
      showToast('info', 'Agenda Atualizada', `Dias de treino da semana atualizados (${updatedDays.length} dias/semana).`);
      renderApp();
      return;
    }

    const saveJjGraduationBtn = e.target.closest('.save-jj-graduation-btn');
    if (saveJjGraduationBtn) {
      const studentId = saveJjGraduationBtn.getAttribute('data-student-id');
      const beltSelect = document.querySelector(`.jj-belt-select[data-student-id="${studentId}"]`);
      const stripesSelect = document.querySelector(`.jj-stripes-select[data-student-id="${studentId}"]`);
      const belt = beltSelect?.value || 'Branca';
      const stripes = Number(stripesSelect?.value ?? 0);
      store.atualizarGraduacaoJiuJitsu(studentId, belt, stripes);
      soundManager.playSuccessSound();
      showToast('success', 'Graduação Atualizada', `Faixa ${belt} (${stripes}º grau) salva com sucesso.`);
      renderApp();
      return;
    }

    const removeJjClassBtn = e.target.closest('.remove-jj-class-btn');
    if (removeJjClassBtn) {
      const turmaId = removeJjClassBtn.getAttribute('data-turma-id');
      if (confirm('Deseja remover este horário de turma de Jiu-Jítsu?')) {
        store.removeTurmaJiuJitsu(turmaId);
        renderApp();
      }
      return;
    }

    const logoBadge = e.target.closest('#authLogoBadge');
    if (logoBadge) {
      window._ownerClicks = (window._ownerClicks || 0) + 1;
      if (window._ownerClickTimer) clearTimeout(window._ownerClickTimer);
      window._ownerClickTimer = setTimeout(() => { window._ownerClicks = 0; }, 1200);

      if (window._ownerClicks >= 3) {
        window._ownerClicks = 0;
        if (!store.hasAdmin()) {
          setAuthActiveTab('owner_register');
          renderApp();
          showToast('info', 'Configuração do Personal', 'Cadastre o perfil principal de Personal Trainer da academia.');
        } else {
          setAuthActiveTab('login');
          renderApp();
        }
      }
      return;
    }

    const logoutBtn = e.target.closest('#logoutBtn, .logout-action-btn');
    if (logoutBtn) {
      if (confirm('Deseja realmente sair da sua conta?')) {
        store.logoutUser();
        setAuthActiveTab('login');
        renderApp();
      }
      return;
    }

    const openPwaBtn = e.target.closest('#openPwaModalTriggerBtn');
    if (openPwaBtn) {
      openPwaInstallModal();
      return;
    }

    const closePwaBtn = e.target.closest('#closePwaModalBtn, #closePwaModalBtn2');
    if (closePwaBtn) {
      const modal = document.getElementById('pwaInstallModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const nativeInstallBtn = e.target.closest('#triggerNativeInstallBtn');
    if (nativeInstallBtn) {
      triggerPwaNativeInstall();
      return;
    }

    const openPassBtn = e.target.closest('#openGymPassBtn, #quickGymPassCard, [data-nav-target="gympass_nav"], #drawerOpenGymPassBtn, #openGymPassProfileBtn');
    if (openPassBtn) {
      const drawer = document.getElementById('mobileDrawerOverlay');
      if (drawer) drawer.classList.remove('active');
      const modal = document.getElementById('gymPassModal');
      if (modal) modal.classList.add('active');
      return;
    }

    const closePassBtn = e.target.closest('#closeGymPassBtn, #closeGymPassBtnBottom');
    if (closePassBtn) {
      const modal = document.getElementById('gymPassModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const openDrawerBtn = e.target.closest('#openMobileDrawerBtn');
    if (openDrawerBtn) {
      const drawer = document.getElementById('mobileDrawerOverlay');
      if (drawer) drawer.classList.add('active');
      return;
    }

    const closeDrawerBtn = e.target.closest('#closeMobileDrawerBtn');
    if (closeDrawerBtn) {
      const drawer = document.getElementById('mobileDrawerOverlay');
      if (drawer) drawer.classList.remove('active');
      return;
    }

    if (e.target.id === 'mobileDrawerOverlay') {
      e.target.classList.remove('active');
      return;
    }

    const drawerFeedbackBtn = e.target.closest('#drawerOpenFeedbackBtn');
    if (drawerFeedbackBtn) {
      const drawer = document.getElementById('mobileDrawerOverlay');
      if (drawer) drawer.classList.remove('active');
      const modal = document.getElementById('feedbackModal');
      if (modal) modal.classList.add('active');
      return;
    }

    const openCoachMsgBtn = e.target.closest('#openStudentCoachMessageModalBtn, #openPersonalMessageTriggerBtn');
    if (openCoachMsgBtn) {
      const modal = document.getElementById('coachMessageModal');
      if (modal) modal.classList.add('active');
      return;
    }

    const closeCoachMsgBtn = e.target.closest('#closeCoachMessageModalBtn, #closeCoachMessageModalBtn2');
    if (closeCoachMsgBtn) {
      const modal = document.getElementById('coachMessageModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const coachChip = e.target.closest('.priority-chip');
    if (coachChip) {
      const modal = coachChip.closest('#coachMessageModal');
      if (modal) {
        modal.querySelectorAll('.priority-chip').forEach(c => {
          c.classList.remove('active');
          const val = c.getAttribute('data-val');
          if (val === 'alta') {
            c.style.borderColor = 'rgba(255, 71, 87, 0.3)';
            c.style.background = 'rgba(255, 71, 87, 0.08)';
          } else if (val === 'media') {
            c.style.borderColor = 'rgba(255, 184, 0, 0.4)';
            c.style.background = 'rgba(255, 184, 0, 0.08)';
          } else {
            c.style.borderColor = 'rgba(0, 245, 155, 0.3)';
            c.style.background = 'rgba(0, 245, 155, 0.08)';
          }
        });
        coachChip.classList.add('active');
        const radio = coachChip.parentElement?.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        const val = coachChip.getAttribute('data-val');
        if (val === 'alta') {
          coachChip.style.borderColor = '#FF4757';
          coachChip.style.background = 'rgba(255, 71, 87, 0.25)';
        } else if (val === 'media') {
          coachChip.style.borderColor = '#FFB800';
          coachChip.style.background = 'rgba(255, 184, 0, 0.25)';
        } else {
          coachChip.style.borderColor = '#00F59B';
          coachChip.style.background = 'rgba(0, 245, 155, 0.25)';
        }
      }
    }

    const resetMobileBtn = e.target.closest('#resetDataBtnMobile');
    if (resetMobileBtn) {
      const drawer = document.getElementById('mobileDrawerOverlay');
      if (drawer) drawer.classList.remove('active');
      if (confirm('Deseja restaurar a base de dados para os padrões do sistema?')) {
        store.resetToDefaults();
        showToast('info', 'Restauração Concluída', 'Dados do sistema restaurados com sucesso.');
      }
      return;
    }

    const startWorkoutBtn = e.target.closest('#startActiveWorkoutBtn');
    if (startWorkoutBtn) {
      const activeStudent = store.getActiveStudent();
      if (activeStudent) {
        openActiveWorkout(activeStudent.id, getSelectedDay());
      }
      return;
    }

    const addWaterBtn = e.target.closest('#addWaterBtn');
    if (addWaterBtn) {
      addWater(250);
      soundManager.playNotificationPop();
      renderApp();
      return;
    }

    const removeWaterBtn = e.target.closest('#removeWaterBtn');
    if (removeWaterBtn) {
      addWater(-250);
      soundManager.playNotificationPop();
      renderApp();
      return;
    }

    const roleBtn = e.target.closest('.role-tab-btn');
    if (roleBtn) {
      if (!store.isPersonal()) {
        showToast('error', 'Acesso Negado', 'Esta ação requer permissão de Personal.');
        return;
      }
      const newRole = roleBtn.getAttribute('data-role');
      store.setRole(newRole);
      if (newRole === 'student') currentTab = 'workouts';
      else currentTab = 'admin_dashboard';
      renderApp();
      return;
    }

    const navItem = e.target.closest('[data-nav-target]');
    if (navItem) {
      const target = navItem.getAttribute('data-nav-target');
      if (target === 'open_mobile_drawer_action') {
        const drawer = document.getElementById('mobileDrawerOverlay');
        if (drawer) drawer.classList.add('active');
        return;
      }
      if (store.getCurrentRole() === 'student' && (target.startsWith('admin_') || target.startsWith('personal_'))) {
        showToast('error', 'Acesso Restrito', 'Área restrita exclusivamente ao Personal.');
        return;
      }
      const drawer = document.getElementById('mobileDrawerOverlay');
      if (drawer) drawer.classList.remove('active');

      currentTab = target;
      renderApp();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const jumpBtn = e.target.closest('.jump-to-tab-btn');
    if (jumpBtn) {
      const target = jumpBtn.getAttribute('data-target');
      if (store.getCurrentRole() === 'student' && (target.startsWith('admin_') || target.startsWith('personal_'))) {
        showToast('error', 'Acesso Restrito', 'Área restrita exclusivamente ao Personal.');
        return;
      }
      currentTab = target;
      renderApp();
      return;
    }

    const notifBell = e.target.closest('#notificationBellBtn');
    if (notifBell) {
      const dropdown = document.getElementById('notificationDropdown');
      if (dropdown) dropdown.classList.toggle('active');
      return;
    }

    if (!e.target.closest('#notificationBellBtn') && !e.target.closest('#notificationDropdown')) {
      const dropdown = document.getElementById('notificationDropdown');
      if (dropdown && dropdown.classList.contains('active')) {
        dropdown.classList.remove('active');
      }
    }

    const markAllBtn = e.target.closest('#markAllReadBtn');
    if (markAllBtn) {
      store.markAllNotificationsAsRead();
      return;
    }

    const notifItem = e.target.closest('.notif-item');
    if (notifItem) {
      const id = notifItem.getAttribute('data-notif-id');
      if (id) store.markNotificationAsRead(id);
      return;
    }

    const simChip = e.target.closest('[data-simulate], .trigger-sim-scenario');
    if (simChip) {
      const scenario = simChip.getAttribute('data-simulate') || simChip.getAttribute('data-scenario');
      const activeStudent = store.getActiveStudent();
      if (activeStudent) {
        const notif = notificationEngine.simulateScenario(activeStudent.id, scenario);
        soundManager.playNotificationPop();
        showToast(notif.priority === 'high' ? 'warning' : 'info', notif.title, notif.message);
      }
      return;
    }

    const dayBtn = e.target.closest('.weekday-btn');
    if (dayBtn) {
      const day = dayBtn.getAttribute('data-day');
      setSelectedDay(day);
      renderApp();
      return;
    }

    const checkBtn = e.target.closest('.check-exercise-btn');
    if (checkBtn) {
      const exId = checkBtn.getAttribute('data-toggle-done');
      const day = checkBtn.getAttribute('data-day');
      const student = store.getActiveStudent();
      if (student) {
        store.toggleExerciseDone(student.id, day, exId);
        soundManager.playNotificationPop();
      }
      return;
    }

    const saveStudentLoadBtn = e.target.closest('.save-student-load-btn');
    if (saveStudentLoadBtn) {
      const exId = saveStudentLoadBtn.getAttribute('data-ex-id');
      const day = saveStudentLoadBtn.getAttribute('data-day');
      const student = store.getActiveStudent();
      const inputEl = document.getElementById(`studentLoadInput_${exId}`);
      if (student && inputEl) {
        const parsed = Number(String(inputEl.value || '').replace(',', '.'));
        if (Number.isFinite(parsed) && parsed >= 0) {
          store.updateExercise(student.id, day, exId, { loadKg: parsed });
          soundManager.playNotificationPop();
          showToast('success', 'Peso Salvo! 💪', `Você registrou ${parsed} kg neste exercício.`);
        } else {
          showToast('warning', 'Peso Inválido', 'Informe um peso válido em kg.');
        }
      }
      return;
    }

    const incBtn = e.target.closest('.inc-load');
    if (incBtn) {
      const exId = incBtn.getAttribute('data-ex-id');
      const day = incBtn.getAttribute('data-day');
      const student = store.getActiveStudent();
      if (student) {
        const workout = store.getWorkoutForStudent(student.id, day);
        const ex = workout.exercises.find(item => item.id === exId);
        if (ex) {
          store.updateExercise(student.id, day, exId, { loadKg: ex.loadKg + 2 });
        }
      }
      return;
    }

    const decBtn = e.target.closest('.dec-load');
    if (decBtn) {
      const exId = decBtn.getAttribute('data-ex-id');
      const day = decBtn.getAttribute('data-day');
      const student = store.getActiveStudent();
      if (student) {
        const workout = store.getWorkoutForStudent(student.id, day);
        const ex = workout.exercises.find(item => item.id === exId);
        if (ex && ex.loadKg > 2) {
          store.updateExercise(student.id, day, exId, { loadKg: ex.loadKg - 2 });
        }
      }
      return;
    }

    const timerBtn = e.target.closest('.timer-start-btn');
    if (timerBtn) {
      const exId = timerBtn.getAttribute('data-timer-target');
      const totalSeconds = Number(timerBtn.getAttribute('data-seconds')) || 60;
      handleRestTimer(exId, totalSeconds, timerBtn);
      return;
    }

    const openModalBtn = e.target.closest('.open-exercise-modal-btn');
    if (openModalBtn) {
      const exName = openModalBtn.getAttribute('data-exercise-name');
      const exGroup = openModalBtn.getAttribute('data-exercise-group');
      populateAndOpenExerciseModal(exName, exGroup);
      return;
    }

    const closeModalBtn = e.target.closest('#closeExerciseModalBtn, #closeExerciseModalBtn2');
    if (closeModalBtn) {
      const modal = document.getElementById('exerciseModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const payTriggerBtn = e.target.closest('.trigger-pay-btn');
    if (payTriggerBtn) {
      const paymentId = payTriggerBtn.getAttribute('data-payment-id');
      const amount = Number(payTriggerBtn.getAttribute('data-amount')) || 120.00;
      const planName = payTriggerBtn.getAttribute('data-plan') || 'Plano Musculação';
      const student = store.getActiveStudent();

      openCheckoutModal({
        id: paymentId,
        studentName: student?.name || 'Aluno',
        planName: planName,
        amount: amount,
        dueDate: student?.dueDate || ''
      });
      return;
    }

    const closeCheckoutBtn = e.target.closest('#closeCheckoutModalBtn');
    if (closeCheckoutBtn) {
      const modal = document.getElementById('checkoutModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const methodTab = e.target.closest('.pay-method-tab');
    if (methodTab) {
      const method = methodTab.getAttribute('data-method');
      document.querySelectorAll('.pay-method-tab').forEach(b => b.classList.remove('active'));
      methodTab.classList.add('active');

      const pixSec = document.getElementById('pixPaymentSection');
      const cardSec = document.getElementById('cardPaymentSection');
      const boletoSec = document.getElementById('boletoPaymentSection');

      if (pixSec) pixSec.style.display = method === 'PIX' ? 'flex' : 'none';
      if (cardSec) cardSec.style.display = method === 'Cartao' ? 'block' : 'none';
      if (boletoSec) boletoSec.style.display = method === 'Boleto' ? 'block' : 'none';
      return;
    }

    const copyPixBtn = e.target.closest('#copyPixBtn');
    if (copyPixBtn) {
      const pixCode = document.getElementById('pixCodeString')?.textContent?.trim();
      if (pixCode && navigator.clipboard) {
        navigator.clipboard.writeText(pixCode);
        const toast = document.getElementById('copyToastMessage');
        if (toast) {
          toast.style.display = 'block';
          setTimeout(() => { toast.style.display = 'none'; }, 3000);
        }
      }
      return;
    }

    const approvePaymentBtn = e.target.closest('#simulateApprovePaymentBtn');
    if (approvePaymentBtn) {
      const modal = document.getElementById('checkoutModal');
      const paymentId = modal?.getAttribute('data-target-payment-id') || 'pay_101';
      const result = store.processPayment(paymentId, 'PIX');
      soundManager.playSuccessSound();

      if (modal) modal.classList.remove('active');
      if (result && result.status === 'aguardando_confirmacao') {
        showToast('info', 'Pagamento Informado', 'O Personal foi notificado e o status aguarda confirmação bancária/webhook.');
      } else {
        showToast('success', 'Pagamento Liquidado', 'Mensalidade confirmada e matrícula regularizada.');
      }
      renderApp();
      return;
    }

    const timeSlotBtn = e.target.closest('.time-slot-pill');
    if (timeSlotBtn) {
      document.querySelectorAll('.time-slot-pill').forEach(b => b.classList.remove('active'));
      timeSlotBtn.classList.add('active');
      const hiddenInput = document.getElementById('selectedTimeSlot');
      if (hiddenInput) hiddenInput.value = timeSlotBtn.getAttribute('data-slot');
      return;
    }

    const cancelAptBtn = e.target.closest('.cancel-apt-btn');
    if (cancelAptBtn) {
      const aptId = cancelAptBtn.getAttribute('data-apt-id');
      if (confirm('Deseja realmente cancelar este agendamento?')) {
        store.cancelAppointment(aptId);
        renderApp();
      }
      return;
    }

    const completeAptBtn = e.target.closest('.complete-apt-btn');
    if (completeAptBtn) {
      const aptId = completeAptBtn.getAttribute('data-apt-id');
      store.completeAppointment(aptId);
      soundManager.playSuccessSound();
      renderApp();
      return;
    }

    const schedFilterBtn = e.target.closest('[data-schedule-filter]');
    if (schedFilterBtn) {
      setScheduleFilter(schedFilterBtn.getAttribute('data-schedule-filter'));
      renderApp();
      return;
    }

    const openPBookingBtn = e.target.closest('#openPersonalBookingModalBtn');
    if (openPBookingBtn) {
      const modal = document.getElementById('personalBookingModal');
      if (modal) modal.classList.add('active');
      return;
    }

    const closePBookingBtn = e.target.closest('#closePersonalBookingModalBtn, #closePersonalBookingModalBtn2');
    if (closePBookingBtn) {
      const modal = document.getElementById('personalBookingModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const editWorkoutBtn = e.target.closest('.quick-edit-workout-btn');
    if (editWorkoutBtn) {
      const stId = editWorkoutBtn.getAttribute('data-student-id');
      setBuilderSelectedStudentId(stId);
      currentTab = 'personal_workouts';
      renderApp();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const viewEvoBtn = e.target.closest('.quick-view-evo-btn');
    if (viewEvoBtn) {
      const stId = viewEvoBtn.getAttribute('data-student-id');
      setPersonalEvoStudentId(stId);
      currentTab = 'personal_evolution';
      renderApp();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const builderDayBtn = e.target.closest('.builder-day-btn');
    if (builderDayBtn) {
      const day = builderDayBtn.getAttribute('data-builder-day');
      setBuilderSelectedDay(day);
      renderApp();
      return;
    }

    const openAddExBtn = e.target.closest('#openAddExerciseModalBtn, #openAddExerciseModalBtn2');
    if (openAddExBtn) {
      const modal = document.getElementById('addExerciseModal');
      if (modal) modal.classList.add('active');
      return;
    }

    const closeAddExBtn = e.target.closest('#closeAddExModalBtn, #closeAddExModalBtn2');
    if (closeAddExBtn) {
      const modal1 = document.getElementById('addExerciseModal');
      if (modal1) modal1.classList.remove('active');
      const modal2 = document.getElementById('addExerciseAdminModal');
      if (modal2) modal2.classList.remove('active');
      return;
    }

    const saveNewExBtn = e.target.closest('#saveNewExerciseBtn');
    if (saveNewExBtn) {
      const name = document.getElementById('newExName')?.value?.trim();
      const group = document.getElementById('newExGroup')?.value?.trim();
      const sets = document.getElementById('newExSets')?.value;
      const reps = document.getElementById('newExReps')?.value;
      const loadKg = document.getElementById('newExLoad')?.value;
      const restSeconds = document.getElementById('newExRest')?.value;
      const notes = document.getElementById('newExNotes')?.value;
      const imageUrl = document.getElementById('newExImage')?.value || '';
      const videoUrl = document.getElementById('newExVideo')?.value || '';

      if (!name) {
        showToast('warning', 'Campo Obrigatório', 'Por favor, informe o nome do exercício.');
        return;
      }

      const studentSelect = document.getElementById('builderStudentSelect');
      const studentId = studentSelect?.value || store.getStudents()[0]?.id;
      const day = getBuilderSelectedDay();

      store.addExerciseToWorkout(studentId, day, {
        name,
        muscleGroup: group || 'Geral',
        sets,
        reps,
        loadKg,
        restSeconds,
        notes,
        imageUrl,
        videoUrl
      });

      const modal = document.getElementById('addExerciseModal');
      if (modal) modal.classList.remove('active');
      soundManager.playSuccessSound();
      showToast('success', 'Exercício Adicionado', `"${name}" adicionado à ficha de ${day} com sucesso.`);
      renderApp();
      return;
    }

    const removeExBtn = e.target.closest('.remove-ex-btn');
    if (removeExBtn) {
      const exId = removeExBtn.getAttribute('data-ex-id');
      const studentSelect = document.getElementById('builderStudentSelect');
      const studentId = studentSelect?.value || store.getStudents()[0]?.id;
      const day = getBuilderSelectedDay();

      if (confirm('Deseja excluir este exercício da ficha?')) {
        store.removeExerciseFromWorkout(studentId, day, exId);
        renderApp();
      }
      return;
    }

    const openMeasureBtn = e.target.closest('#openNewMeasurementModalBtn');
    if (openMeasureBtn) {
      const modal = document.getElementById('newMeasurementModal');
      if (modal) modal.classList.add('active');
      return;
    }

    const closeMeasureBtn = e.target.closest('#closeNewMeasureModalBtn, #closeNewMeasureModalBtn2');
    if (closeMeasureBtn) {
      const modal = document.getElementById('newMeasurementModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const stFilterBtn = e.target.closest('[data-student-filter]');
    if (stFilterBtn) {
      setStudentFilter(stFilterBtn.getAttribute('data-student-filter'));
      renderApp();
      return;
    }

    const payFilterBtn = e.target.closest('[data-pay-filter]');
    if (payFilterBtn) {
      setPaymentStatusFilter(payFilterBtn.getAttribute('data-pay-filter'));
      renderApp();
      return;
    }

    const waBtn = e.target.closest('.send-whatsapp-reminder');
    if (waBtn) {
      const phone = waBtn.getAttribute('data-phone');
      const name = waBtn.getAttribute('data-name');
      const amount = Number(waBtn.getAttribute('data-amount')).toFixed(2);
      const gym = store.getGymConfig();
      const text = `Olá ${name}! Passando para lembrar da sua mensalidade da ${gym.name || 'Academia'} no valor de R$ ${amount}. Chave PIX: ${gym.pixKey || 'financeiro@sua-academia.com.br'}. Qualquer dúvida estamos à disposição!`;
      const url = `https://api.whatsapp.com/send?phone=55${phone.replace(/\D/g, '')}&text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
      return;
    }

    const markPaidBtn = e.target.closest('.mark-payment-paid-btn');
    if (markPaidBtn) {
      const payId = markPaidBtn.getAttribute('data-payment-id');
      store.confirmarPagamentoPersonal(payId, 'Confirmado pelo Personal');
      soundManager.playSuccessSound();
      showToast('success', 'Fatura Liquidada', 'Mensalidade confirmada e baixada no financeiro.');
      return;
    }

    const addFaltaBtn = e.target.closest('.admin-add-falta-btn');
    if (addFaltaBtn) {
      const studentId = addFaltaBtn.getAttribute('data-student-id');
      const studentName = addFaltaBtn.getAttribute('data-student-name') || 'Aluno';
      const today = new Date().toISOString().split('T')[0];
      store.adicionarFalta(studentId, today, 'Falta no treino');
      soundManager.playNotificationPop();
      showToast('warning', 'Falta Registrada', `Falta computada para ${studentName}.`);
      renderApp();
      return;
    }

    const removeFaltaBtn = e.target.closest('.admin-remove-falta-btn');
    if (removeFaltaBtn) {
      const studentId = removeFaltaBtn.getAttribute('data-student-id');
      store.removerFalta(studentId);
      soundManager.playNotificationPop();
      showToast('info', 'Falta Removida', 'Falta estornada com sucesso.');
      renderApp();
      return;
    }

    const resolveCoachMsgBtn = e.target.closest('.mark-coach-msg-resolved-btn');
    if (resolveCoachMsgBtn) {
      const msgId = resolveCoachMsgBtn.getAttribute('data-msg-id');
      store.marcarMensagemRespondida(msgId);
      soundManager.playSuccessSound();
      showToast('success', 'Atendimento Concluído', 'Mensagem do aluno marcada como resolvida.');
      renderApp();
      return;
    }

    const openNewStModalBtn = e.target.closest('#openNewStudentModalBtn, #openNewStudentModalBtn2, #adminQuickNewStudentBtn');
    if (openNewStModalBtn) {
      let modal = document.getElementById('newStudentModal');
      if (!modal) {
        currentTab = 'admin_students';
        renderApp();
        modal = document.getElementById('newStudentModal');
      }
      if (modal) modal.classList.add('active');
      return;
    }

    const closeNewStModalBtn = e.target.closest('#closeNewStudentModalBtn, #closeNewStudentModalBtn2');
    if (closeNewStModalBtn) {
      const modal = document.getElementById('newStudentModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const openNewPersonalBtn = e.target.closest('#openNewPersonalModalBtn');
    if (openNewPersonalBtn) {
      const modal = document.getElementById('newPersonalModal');
      if (modal) modal.classList.add('active');
      return;
    }

    const closeNewPersonalBtn = e.target.closest('#closeNewPersonalModalBtn, #closeNewPersonalModalBtn2');
    if (closeNewPersonalBtn) {
      const modal = document.getElementById('newPersonalModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const openNewPlanBtn = e.target.closest('#openNewPlanModalBtn, #openNewPlanModalBtn2');
    if (openNewPlanBtn) {
      const modal = document.getElementById('newPlanModal');
      if (modal) modal.classList.add('active');
      return;
    }

    const closeNewPlanBtn = e.target.closest('#closeNewPlanModalBtn, #closeNewPlanModalBtn2');
    if (closeNewPlanBtn) {
      const modal = document.getElementById('newPlanModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const openNewMatBtn = e.target.closest('#openNewMatriculaModalBtn');
    if (openNewMatBtn) {
      const modal = document.getElementById('newMatriculaModal');
      if (modal) modal.classList.add('active');
      return;
    }

    const closeNewMatBtn = e.target.closest('#closeNewMatriculaModalBtn, #closeNewMatriculaModalBtn2');
    if (closeNewMatBtn) {
      const modal = document.getElementById('newMatriculaModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const toggleMatBtn = e.target.closest('.toggle-mat-status-btn');
    if (toggleMatBtn) {
      const matId = toggleMatBtn.getAttribute('data-mat-id');
      const currentSt = toggleMatBtn.getAttribute('data-current-status');
      const newSt = currentSt === 'Ativa' ? 'Suspensa' : 'Ativa';
      store.updateMatricula(matId, { status: newSt });
      soundManager.playNotificationPop();
      renderApp();
      return;
    }

    const openFeedbackBtn = e.target.closest('#openFeedbackModalBtn');
    if (openFeedbackBtn) {
      const modal = document.getElementById('feedbackModal');
      if (modal) modal.classList.add('active');
      return;
    }

    const closeFeedbackBtn = e.target.closest('#closeFeedbackModalBtn, #closeFeedbackModalBtn2');
    if (closeFeedbackBtn) {
      const modal = document.getElementById('feedbackModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const starBtn = e.target.closest('.star-rating-btn');
    if (starBtn) {
      const starVal = Number(starBtn.getAttribute('data-star')) || 5;
      const ratingInput = document.getElementById('fbkRatingInput');
      if (ratingInput) ratingInput.value = starVal;
      document.querySelectorAll('.star-rating-btn').forEach(btn => {
        const bStar = Number(btn.getAttribute('data-star')) || 1;
        btn.style.color = bStar <= starVal ? '#FFB800' : 'var(--text-muted)';
      });
      return;
    }

    const userFilterBtn = e.target.closest('[data-user-filter]');
    if (userFilterBtn) {
      setStudentFilter(userFilterBtn.getAttribute('data-user-filter'));
      renderApp();
      return;
    }

    const resetBtn = e.target.closest('#resetDataBtn');
    if (resetBtn) {
      if (confirm('Deseja restaurar a base de dados para os padrões do sistema?')) {
        store.resetToDefaults();
        showToast('info', 'Restauração Concluída', 'Dados do sistema restaurados com sucesso.');
      }
      return;
    }

    const exportBtn = e.target.closest('#exportDataBtn');
    if (exportBtn) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(store.exportDataJson());
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "academia_backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return;
    }

    const catFilterBtn = e.target.closest('.catalog-filter-btn');
    if (catFilterBtn) {
      setCatalogFilter(catFilterBtn.getAttribute('data-group'));
      renderApp();
      return;
    }

    const viewExBtn = e.target.closest('.view-exercise-details-btn');
    if (viewExBtn) {
      const name = viewExBtn.getAttribute('data-exercise-name');
      const muscle = viewExBtn.getAttribute('data-exercise-muscle');
      const notes = viewExBtn.getAttribute('data-exercise-notes');
      populateAndOpenExerciseModal(name, muscle, notes);
      return;
    }

    const starEl = e.target.closest('.feedback-star-btn');
    if (starEl) {
      const rating = Number(starEl.getAttribute('data-rating')) || 5;
      const input = document.getElementById('feedbackRatingVal');
      const label = document.getElementById('feedbackRatingLabel');
      if (input) input.value = rating;
      if (label) {
        const texts = {
          1: '1 Estrela - Precisa melhorar muito',
          2: '2 Estrelas - Regular',
          3: '3 Estrelas - Bom',
          4: '4 Estrelas - Muito bom!',
          5: '5 Estrelas - Excelente!'
        };
        label.textContent = texts[rating] || `${rating} Estrelas`;
      }
      document.querySelectorAll('.feedback-star-btn').forEach(btn => {
        const r = Number(btn.getAttribute('data-rating')) || 1;
        btn.style.color = r <= rating ? '#FFB800' : 'var(--text-muted)';
      });
      return;
    }

    const openGymPassProfile = e.target.closest('#openGymPassProfileBtn');
    if (openGymPassProfile) {
      const modal = document.getElementById('gymPassModal');
      if (modal) modal.classList.add('active');
      return;
    }

    const editStBtn = e.target.closest('.edit-student-btn');
    if (editStBtn) {
      const studentId = editStBtn.getAttribute('data-student-id');
      const student = store.getUsuario(studentId);
      if (student) {
        const idInput = document.getElementById('editStudentId');
        const nameInput = document.getElementById('editStudentName');
        const emailInput = document.getElementById('editStudentEmail');
        const phoneInput = document.getElementById('editStudentPhone');
        const sexoInput = document.getElementById('editStudentSexo');
        const goalInput = document.getElementById('editStudentGoal');
        if (idInput) idInput.value = student.id;
        if (nameInput) nameInput.value = student.nome;
        if (emailInput) emailInput.value = student.email;
        if (phoneInput) phoneInput.value = student.telefone || '';
        if (sexoInput) sexoInput.value = student.sexo || 'M';
        if (goalInput) goalInput.value = student.objetivoPrincipal || '';
        const modal = document.getElementById('editStudentModal');
        if (modal) modal.classList.add('active');
      }
      return;
    }

    const closeEditStBtn = e.target.closest('#closeEditStudentModalBtn, #closeEditStudentModalBtn2');
    if (closeEditStBtn) {
      const modal = document.getElementById('editStudentModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const delStBtn = e.target.closest('.delete-student-btn');
    if (delStBtn) {
      const stId = delStBtn.getAttribute('data-student-id');
      const u = store.getUsuario(stId);
      if (confirm(`Tem certeza que deseja excluir o usuário "${u ? u.nome : stId}" do sistema?`)) {
        store.deleteStudent(stId);
        soundManager.playNotificationPop();
        showToast('info', 'Cadastro Removido', `O usuário ${u ? u.nome : ''} foi excluído do sistema.`);
        renderApp();
      }
      return;
    }

    const adminDayBtn = e.target.closest('.admin-workout-day-btn');
    if (adminDayBtn) {
      setAdminWorkoutDay(adminDayBtn.getAttribute('data-day'));
      renderApp();
      return;
    }

    const openAddExAdmin = e.target.closest('#openAddExerciseAdminModalBtn, .trigger-open-add-ex-modal');
    if (openAddExAdmin) {
      const modal = document.getElementById('addExerciseAdminModal');
      if (modal) modal.classList.add('active');
      return;
    }

    const closeAddExAdmin = e.target.closest('#closeAddExModalBtn, #closeAddExModalBtn2');
    if (closeAddExAdmin) {
      const modal = document.getElementById('addExerciseAdminModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const removeAdminEx = e.target.closest('.admin-remove-exercise-btn');
    if (removeAdminEx) {
      const stId = removeAdminEx.getAttribute('data-student-id');
      const day = removeAdminEx.getAttribute('data-day');
      const exId = removeAdminEx.getAttribute('data-exercise-id');
      if (confirm('Deseja excluir este exercício da ficha do aluno?')) {
        store.removeExerciseFromWorkout(stId, day, exId);
        renderApp();
      }
      return;
    }

    const openNewEvoBtn = e.target.closest('#openNewEvaluationModalBtn');
    if (openNewEvoBtn) {
      const modal = document.getElementById('newEvaluationModal');
      if (modal) modal.classList.add('active');
      return;
    }

    const closeNewEvoBtn = e.target.closest('#closeNewEvoModalBtn, #closeNewEvoModalBtn2');
    if (closeNewEvoBtn) {
      const modal = document.getElementById('newEvaluationModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const openReportBtn = e.target.closest('#openGymReportModalBtn');
    if (openReportBtn) {
      const modal = document.getElementById('gymReportModal');
      if (modal) modal.classList.add('active');
      return;
    }

    const closeReportBtn = e.target.closest('#closeGymReportModalBtn, #closeGymReportModalBtn2');
    if (closeReportBtn) {
      const modal = document.getElementById('gymReportModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const printRepBtn = e.target.closest('#printReportBtn');
    if (printRepBtn) {
      window.print();
      return;
    }

    const exportCsvBtn = e.target.closest('#exportReportCsvBtn, #exportCsvFaturasBtn');
    if (exportCsvBtn) {
      const payments = store.getPayments();
      let csvContent = "data:text/csv;charset=utf-8,ID,Transacao,Aluno,Plano,Valor,Vencimento,DataPagamento,Metodo,Status\n";
      payments.forEach(p => {
        csvContent += `"${p.id}","${p.transactionId || p.id}","${p.studentName}","${p.planName}","${p.amount}","${p.dueDate}","${p.paymentDate || ''}","${p.method || 'PIX'}","${p.status}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }

    const openReceiptBtn = e.target.closest('.open-receipt-btn');
    if (openReceiptBtn) {
      const tx = openReceiptBtn.getAttribute('data-tx');
      const student = openReceiptBtn.getAttribute('data-student');
      const plan = openReceiptBtn.getAttribute('data-plan');
      const date = openReceiptBtn.getAttribute('data-date');
      const method = openReceiptBtn.getAttribute('data-method');
      const amount = Number(openReceiptBtn.getAttribute('data-amount')).toFixed(2);

      const elTx = document.getElementById('rcptTxId');
      const elSt = document.getElementById('rcptStudent');
      const elPl = document.getElementById('rcptPlan');
      const elDt = document.getElementById('rcptDate');
      const elMt = document.getElementById('rcptMethod');
      const elAm = document.getElementById('rcptAmount');

      if (elTx) elTx.textContent = tx;
      if (elSt) elSt.textContent = student;
      if (elPl) elPl.textContent = plan;
      if (elDt) elDt.textContent = date ? date.split('-').reverse().join('/') : '-';
      if (elMt) elMt.textContent = method;
      if (elAm) elAm.textContent = `R$ ${amount}`;

      const modal = document.getElementById('receiptModal');
      if (modal) modal.classList.add('active');
      return;
    }

    const closeReceiptBtn = e.target.closest('#closeReceiptModalBtn, #closeReceiptModalBtn2');
    if (closeReceiptBtn) {
      const modal = document.getElementById('receiptModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const printRcptBtn = e.target.closest('#printReceiptBtn');
    if (printRcptBtn) {
      window.print();
      return;
    }
  });

  body.addEventListener('input', (e) => {
    if (e.target.id === 'studentCatalogSearchInput') {
      setCatalogSearch(e.target.value);
      renderApp();
    } else if (e.target.id === 'adminStudentSearchInput') {
      setSearchQuery(e.target.value);
      renderApp();
    } else if (e.target.classList.contains('edit-ex-field')) {
      const exId = e.target.getAttribute('data-ex-id');
      const field = e.target.getAttribute('data-field');
      let val = e.target.value;
      if (field === 'sets' || field === 'loadKg' || field === 'restSeconds') {
        val = Number(val) || 0;
      }
      const studentSelect = document.getElementById('builderStudentSelect');
      const studentId = studentSelect?.value || store.getStudents()[0]?.id;
      const day = getBuilderSelectedDay();
      store.updateExercise(studentId, day, exId, { [field]: val });
    }
  });

  body.addEventListener('change', (e) => {
    if (e.target.id === 'adminWorkoutStudentSelect') {
      setAdminWorkoutStudent(e.target.value);
      renderApp();
    } else if (e.target.id === 'chatStudentSelector') {
      setSelectedChatStudentId(e.target.value);
      renderApp();
    } else if (e.target.id === 'adminEvolutionStudentSelect') {
      setAdminEvolutionStudent(e.target.value);
      renderApp();
    } else if (e.target.id === 'adminCatalogPresetSelect') {
      const opt = e.target.selectedOptions[0];
      if (opt && opt.value) {
        const nameInput = document.getElementById('adminNewExName');
        const muscleInput = document.getElementById('adminNewExMuscle');
        const setsInput = document.getElementById('adminNewExSets');
        const repsInput = document.getElementById('adminNewExReps');
        const restInput = document.getElementById('adminNewExRest');
        if (nameInput) nameInput.value = opt.getAttribute('data-name') || '';
        if (muscleInput) muscleInput.value = opt.getAttribute('data-muscle') || '';
        if (setsInput) setsInput.value = opt.getAttribute('data-sets') || '4';
        if (repsInput) repsInput.value = opt.getAttribute('data-reps') || '10-12';
        if (restInput) restInput.value = opt.getAttribute('data-rest') || '60';
      }
    } else if (e.target.id === 'quickStudentSwitch') {
      store.setActiveStudent(e.target.value);
    } else if (e.target.id === 'quickPersonalSwitch') {
      store.setActivePersonal(e.target.value);
    } else if (e.target.id === 'builderStudentSelect') {
      setBuilderSelectedStudentId(e.target.value);
      renderApp();
    } else if (e.target.id === 'evoStudentSelect') {
      setPersonalEvoStudentId(e.target.value);
      renderApp();
    } else if (e.target.id === 'quickCatalogSelect') {
      const opt = e.target.selectedOptions[0];
      if (opt && opt.value) {
        const nameInput = document.getElementById('newExName');
        const groupInput = document.getElementById('newExGroup');
        const setsInput = document.getElementById('newExSets');
        const repsInput = document.getElementById('newExReps');
        const restInput = document.getElementById('newExRest');
        const imageInput = document.getElementById('newExImage');
        const videoInput = document.getElementById('newExVideo');

        if (nameInput) nameInput.value = opt.getAttribute('data-name') || '';
        if (groupInput) groupInput.value = opt.getAttribute('data-group') || '';
        if (setsInput) setsInput.value = opt.getAttribute('data-sets') || '4';
        if (repsInput) repsInput.value = opt.getAttribute('data-reps') || '10-12';
        if (restInput) restInput.value = opt.getAttribute('data-rest') || '60';
        if (imageInput) imageInput.value = opt.getAttribute('data-image') || '';
        if (videoInput) videoInput.value = opt.getAttribute('data-video') || '';
      }
    } else if (e.target.classList.contains('edit-ex-field')) {
      const exId = e.target.getAttribute('data-ex-id');
      const field = e.target.getAttribute('data-field');
      let val = e.target.value;
      if (field === 'sets' || field === 'loadKg' || field === 'restSeconds') {
        val = Number(val) || 0;
      }
      const studentSelect = document.getElementById('builderStudentSelect');
      const studentId = studentSelect?.value || store.getStudents()[0]?.id;
      const day = getBuilderSelectedDay();
      store.updateExercise(studentId, day, exId, { [field]: val });
    }
  });

  body.addEventListener('submit', (e) => {
    if (e.target.id === 'authRegisterForm') {
      e.preventDefault();
      const nome = document.getElementById('authRegNome')?.value;
      const email = document.getElementById('authRegEmail')?.value;
      const senha = document.getElementById('authRegSenha')?.value;
      const telefone = document.getElementById('authRegTelefone')?.value;
      const sexo = document.getElementById('authRegSexo')?.value;
      const objetivo = document.getElementById('authRegObjetivo')?.value;
      const peso = document.getElementById('authRegPeso')?.value;
      const altura = document.getElementById('authRegAltura')?.value;
      const planoId = document.getElementById('authRegPlano')?.value;
      const faixaJiuJitsu = document.getElementById('authRegFaixa')?.value || 'Branca';
      const lgpdAccepted = document.getElementById('authRegLgpdConsent')?.checked;

      const result = store.registerUser({
        nome,
        email,
        senha,
        telefone,
        sexo,
        peso,
        altura,
        planoId,
        faixaJiuJitsu,
        lgpdAccepted,
        role: 'aluno',
        tipo_usuario: 'ALUNO',
        objetivoPrincipal: objetivo
      });

      if (!result.success) {
        const alertBox = document.getElementById('authAlertBox');
        if (alertBox) {
          alertBox.textContent = result.message;
          alertBox.style.display = 'block';
        }
        showToast('error', 'Falha no Cadastro', result.message);
        return;
      }

      soundManager.playSuccessSound();
      currentTab = 'workouts';
      showToast('success', 'Cadastro Realizado', `Bem-vindo(a), ${result.user.nome}!`);
      renderApp();
      return;
    }

    if (e.target.id === 'authRecoverPasswordForm') {
      e.preventDefault();
      const email = document.getElementById('authRecEmail')?.value;
      const telefone = document.getElementById('authRecTelefone')?.value;
      const novaSenha = document.getElementById('authRecNovaSenha')?.value;

      const res = store.recoverPassword({ email, telefone, novaSenha });
      if (!res.success) {
        const alertBox = document.getElementById('authAlertBox');
        if (alertBox) {
          alertBox.textContent = res.message;
          alertBox.style.display = 'block';
        }
        showToast('error', 'Recuperação de Senha', res.message);
        return;
      }

      soundManager.playSuccessSound();
      setAuthActiveTab('login');
      showToast('success', 'Senha Redefinida', res.message);
      renderApp();
      return;
    }

    if (e.target.id === 'inAppChatSendForm') {
      e.preventDefault();
      const studentId = document.getElementById('chatTargetStudentId')?.value;
      const textInput = document.getElementById('chatMessageTextInput');
      const text = textInput?.value?.trim();
      if (!studentId || !text) return;

      const res = store.sendChatMessage({ studentId, text });
      if (res.success) {
        if (textInput) textInput.value = '';
        soundManager.playNotificationPop();
        notificationEngine.sendNativePushNotification('Nova mensagem no Chat', text, '/');
        renderApp();
      } else {
        showToast('error', 'Erro no Chat', res.message || 'Não foi possível enviar a mensagem.');
      }
      return;
    }

    if (e.target.id === 'copyWorkoutToStudentForm') {
      e.preventDefault();
      const sourceStudentId = document.getElementById('copyWorkoutSourceStudentId')?.value;
      const targetStudentId = document.getElementById('copyWorkoutTargetStudentSelect')?.value;
      const dayScope = document.getElementById('copyWorkoutScopeSelect')?.value || 'ALL';

      const res = store.copyWorkoutToStudent(sourceStudentId, targetStudentId, dayScope);
      if (res.success) {
        soundManager.playSuccessSound();
        showToast('success', 'Treino Copiado!', res.message);
        renderApp();
      } else {
        showToast('warning', 'Atenção', res.message);
      }
      return;
    }

    if (e.target.id === 'jjAttendanceForm') {
      e.preventDefault();
      const studentId = document.getElementById('jjCheckinStudentSelect')?.value;
      const turmaId = document.getElementById('jjCheckinTurmaSelect')?.value;
      const date = document.getElementById('jjCheckinDateInput')?.value;

      if (!studentId || !turmaId) {
        showToast('warning', 'Campos Obrigatórios', 'Selecione o aluno e a turma de Jiu-Jítsu.');
        return;
      }

      store.registrarPresencaJiuJitsu({ usuario_id: studentId, turma_id: turmaId, data: date });
      soundManager.playSuccessSound();
      showToast('success', 'Presença Confirmada', 'Presença no tatame registrada com sucesso!');
      renderApp();
      return;
    }

    if (e.target.id === 'jjNewClassForm') {
      e.preventDefault();
      const nome = document.getElementById('jjClassNameInput')?.value;
      const dias = document.getElementById('jjClassDaysInput')?.value;
      const horario = document.getElementById('jjClassTimeInput')?.value;
      const faixa = document.getElementById('jjClassBeltSelect')?.value || 'Todas as Faixas';

      store.addTurmaJiuJitsu({ nome, dias, horario, faixa });
      soundManager.playSuccessSound();
      showToast('success', 'Turma Criada', `Turma "${nome}" adicionada ao quadro de horários.`);
      renderApp();
      return;
    }

    if (e.target.id === 'studentCoachMessageForm') {
      e.preventDefault();
      const activeStudent = store.getActiveStudent();
      if (!activeStudent) {
        showToast('error', 'Atenção', 'Você precisa estar conectado como aluno para enviar mensagem.');
        return;
      }
      const prioridade = document.querySelector('input[name="msgPrioridade"]:checked')?.value || 'media';
      const assunto = document.getElementById('coachMsgAssunto')?.value || 'Dúvida com o Personal';
      const mensagem = document.getElementById('coachMsgTexto')?.value || '';

      store.enviarMensagemPersonal({
        usuario_id: activeStudent.id,
        nomeAluno: activeStudent.nome || activeStudent.name,
        telefone: activeStudent.telefone || activeStudent.phone || '',
        assunto,
        prioridade,
        mensagem
      });

      const modal = document.getElementById('coachMessageModal');
      if (modal) modal.classList.remove('active');
      soundManager.playSuccessSound();
      notificationEngine.sendNativePushNotification(`Mensagem para o Personal (${assunto})`, mensagem, '/');
      showToast('success', 'Mensagem Enviada no Chat!', 'Sua mensagem foi entregue no chat interno do Personal.');
      renderApp();
      return;
    }

    if (e.target.id === 'authLoginForm') {
      e.preventDefault();
      const email = document.getElementById('authLoginEmail')?.value;
      const senha = document.getElementById('authLoginSenha')?.value;

      const result = store.loginUser(email, senha);
      if (!result.success) {
        const alertBox = document.getElementById('authAlertBox');
        if (alertBox) {
          alertBox.textContent = result.message;
          alertBox.style.display = 'block';
        }
        showToast('error', 'Falha na Autenticação', result.message);
        return;
      }

      soundManager.playSuccessSound();
      currentTab = result.role === 'student' ? 'workouts' : 'admin_dashboard';
      renderApp();
      return;
    }

    if (e.target.id === 'authOwnerRegisterForm' || e.target.id === 'authSetupAdminForm') {
      e.preventDefault();
      const gymName = document.getElementById('authOwnerGymName')?.value;
      const nome = document.getElementById('authOwnerNome')?.value || document.getElementById('authAdminNome')?.value;
      const email = document.getElementById('authOwnerEmail')?.value || document.getElementById('authAdminEmail')?.value;
      const senha = document.getElementById('authOwnerSenha')?.value || document.getElementById('authAdminSenha')?.value;
      const telefone = document.getElementById('authOwnerTelefone')?.value;
      const cref = document.getElementById('authOwnerCref')?.value;

      const result = store.registerOwnerAccount({
        gymName,
        nome,
        email,
        senha,
        telefone,
        cref,
        sexo: 'M'
      });

      if (!result.success) {
        const alertBox = document.getElementById('authAlertBox');
        if (alertBox) {
          alertBox.textContent = result.message;
          alertBox.style.display = 'block';
        }
        showToast('error', 'Falha no Cadastro', result.message);
        return;
      }

      soundManager.playSuccessSound();
      currentTab = 'admin_dashboard';
      showToast('success', 'Personal Configurado!', `Bem-vindo ao Painel do Personal, ${result.user.nome}!`);
      renderApp();
      return;
    }

    if (e.target.id === 'editStudentForm') {
      e.preventDefault();
      const id = document.getElementById('editStudentId')?.value;
      const nome = document.getElementById('editStudentName')?.value;
      const email = document.getElementById('editStudentEmail')?.value;
      const senha = document.getElementById('editStudentSenha')?.value;
      const telefone = document.getElementById('editStudentPhone')?.value;
      const sexo = document.getElementById('editStudentSexo')?.value;
      const goal = document.getElementById('editStudentGoal')?.value;

      store.editStudent(id, {
        nome,
        email,
        senha: senha && senha.trim() ? senha.trim() : undefined,
        telefone,
        sexo,
        goal
      });

      const modal = document.getElementById('editStudentModal');
      if (modal) modal.classList.remove('active');
      soundManager.playSuccessSound();
      showToast('success', 'Cadastro Atualizado', 'Os dados do aluno foram salvos com sucesso.');
      renderApp();
      return;
    }

    if (e.target.id === 'adminAddExerciseForm') {
      e.preventDefault();
      const studentId = document.getElementById('addExStudentId')?.value;
      const day = document.getElementById('addExDay')?.value || 'Segunda';
      const name = document.getElementById('adminNewExName')?.value;
      const muscle = document.getElementById('adminNewExMuscle')?.value;
      const sets = Number(document.getElementById('adminNewExSets')?.value) || 4;
      const reps = document.getElementById('adminNewExReps')?.value || '10-12';
      const loadKg = Number(document.getElementById('adminNewExLoad')?.value) || 20;
      const restSeconds = Number(document.getElementById('adminNewExRest')?.value) || 60;
      const notes = document.getElementById('adminNewExNotes')?.value || '';

      store.addExerciseToWorkout(studentId, day, {
        name,
        muscleGroup: muscle,
        sets,
        reps,
        loadKg,
        restSeconds,
        notes
      });

      const modal = document.getElementById('addExerciseAdminModal');
      if (modal) modal.classList.remove('active');
      soundManager.playSuccessSound();
      showToast('success', 'Exercício Adicionado', `"${name}" incluído na ficha de ${day}.`);
      renderApp();
      return;
    }

    if (e.target.id === 'adminNewEvaluationForm') {
      e.preventDefault();
      const studentId = document.getElementById('newEvoStudentId')?.value;
      const date = document.getElementById('newEvoDate')?.value;
      const weightKg = Number(document.getElementById('newEvoWeight')?.value) || 75;
      const heightCm = Number(document.getElementById('newEvoHeight')?.value) || 178;
      const bodyFat = Number(document.getElementById('newEvoBodyFat')?.value) || 15;
      const muscleMassKg = Number(document.getElementById('newEvoMuscleMass')?.value) || 38;
      const chestCm = Number(document.getElementById('newEvoChest')?.value) || 0;
      const armsCm = Number(document.getElementById('newEvoArms')?.value) || 0;
      const waistCm = Number(document.getElementById('newEvoWaist')?.value) || 0;
      const thighsCm = Number(document.getElementById('newEvoThighs')?.value) || 0;
      const notes = document.getElementById('newEvoNotes')?.value || '';

      store.addAvaliacaoFisica({
        usuario_id: studentId,
        peso: weightKg,
        altura: heightCm,
        gordura_corporal: bodyFat,
        massa_muscular: muscleMassKg,
        torax_cm: chestCm,
        braco_cm: armsCm,
        cintura_cm: waistCm,
        coxa_cm: thighsCm,
        data_avaliacao: date,
        notes
      });

      const modal = document.getElementById('newEvaluationModal');
      if (modal) modal.classList.remove('active');
      soundManager.playSuccessSound();
      showToast('success', 'Avaliação Salva', 'Nova avaliação física e bioimpedância registrada com sucesso.');
      renderApp();
      return;
    }

    if (e.target.id === 'adminGymConfigForm') {
      e.preventDefault();
      const name = document.getElementById('gymConfigName')?.value;
      const logoText = document.getElementById('gymConfigLogoText')?.value;
      const slogan = document.getElementById('gymConfigSlogan')?.value;
      const phone = document.getElementById('gymConfigPhone')?.value;
      const whatsapp = document.getElementById('gymConfigWhatsapp')?.value;
      const pixKey = document.getElementById('gymConfigPixKey')?.value;
      const paymentGateway = document.getElementById('gymConfigGateway')?.value || 'mercadopago';
      const supportEmail = document.getElementById('gymConfigSupportEmail')?.value;
      const address = document.getElementById('gymConfigAddress')?.value;
      const workingHoursWeekdays = document.getElementById('gymConfigWeekdays')?.value;
      const workingHoursSaturdays = document.getElementById('gymConfigSaturdays')?.value;
      const workingHoursSundays = document.getElementById('gymConfigSundays')?.value;
      const announcements = document.getElementById('gymConfigAnnouncements')?.value;

      store.updateGymConfig({
        name,
        logoText,
        slogan,
        phone,
        whatsapp,
        pixKey,
        paymentGateway,
        supportEmail,
        address,
        workingHoursWeekdays,
        workingHoursSaturdays,
        workingHoursSundays,
        announcements
      });

      soundManager.playSuccessSound();
      showToast('success', 'Configurações White-Label Salvas', 'Nome da academia, chave PIX e gateway atualizados.');
      renderApp();
      return;
    }

    if (e.target.id === 'personalBookingForm') {
      e.preventDefault();
      const studentId = document.getElementById('pBookingStudentSelect')?.value;
      const date = document.getElementById('pBookingDate')?.value;
      const time = document.getElementById('pBookingTime')?.value;
      const notes = document.getElementById('pBookingNotes')?.value;
      const personal = store.getActivePersonal();

      store.bookAppointment(studentId, personal.id, date, time, notes);
      soundManager.playSuccessSound();
      const modal = document.getElementById('personalBookingModal');
      if (modal) modal.classList.remove('active');
      showToast('success', 'Sessão Agendada', `Horário reservado para ${date.split('-').reverse().join('/')} às ${time}.`);
      renderApp();
      return;
    }

    if (e.target.id === 'bookingForm') {
      e.preventDefault();
      const personalId = document.getElementById('bookingPersonalSelect')?.value;
      const date = document.getElementById('bookingDateSelect')?.value;
      const time = document.getElementById('selectedTimeSlot')?.value || '08:00';
      const notes = document.getElementById('bookingNotesInput')?.value;
      const student = store.getActiveStudent();

      if (student) {
        store.bookAppointment(student.id, personalId, date, time, notes);
        soundManager.playNotificationPop();
        showToast('success', 'Agendamento Confirmado', `Sua sessão foi agendada para ${date.split('-').reverse().join('/')} às ${time}.`);
        renderApp();
      }
      return;
    }

    if (e.target.id === 'newMeasurementForm') {
      e.preventDefault();
      const studentSelect = document.getElementById('evoStudentSelect');
      const studentId = studentSelect?.value || store.getStudents()[0]?.id;

      const date = document.getElementById('measureDate')?.value;
      const weightKg = document.getElementById('measureWeight')?.value;
      const bodyFat = document.getElementById('measureBf')?.value;
      const chestCm = document.getElementById('measureChest')?.value;
      const armsCm = document.getElementById('measureArms')?.value;
      const waistCm = document.getElementById('measureWaist')?.value;
      const thighsCm = document.getElementById('measureThighs')?.value;
      const benchPressKg = document.getElementById('measureBench')?.value;
      const squatKg = document.getElementById('measureSquat')?.value;
      const deadliftKg = document.getElementById('measureDeadlift')?.value;
      const notes = document.getElementById('measureNotes')?.value;

      const heightCm = document.getElementById('measureHeight')?.value;
      const muscleMassKg = document.getElementById('measureMuscleMass')?.value;

      store.addEvolution(studentId, {
        date,
        weightKg,
        heightCm,
        bodyFat,
        muscleMassKg,
        chestCm,
        armsCm,
        waistCm,
        thighsCm,
        benchPressKg,
        squatKg,
        deadliftKg,
        notes
      });

      const modal = document.getElementById('newMeasurementModal');
      if (modal) modal.classList.remove('active');
      soundManager.playNotificationPop();
      showToast('success', 'Avaliação Física', 'Medições corporais registradas com sucesso.');
      renderApp();
      return;
    }

    if (e.target.id === 'newStudentForm') {
      e.preventDefault();
      const name = document.getElementById('addStudentName')?.value;
      const email = document.getElementById('addStudentEmail')?.value;
      const senha = document.getElementById('addStudentSenha')?.value;
      const phone = document.getElementById('addStudentPhone')?.value;
      const sexo = document.getElementById('addStudentSexo')?.value || 'M';
      const tipo_usuario = document.getElementById('addStudentTipo')?.value || 'ALUNO';
      const goal = document.getElementById('addStudentGoal')?.value || '';
      const peso = Number(document.getElementById('addStudentWeight')?.value) || 75;
      const altura = Number(document.getElementById('addStudentHeight')?.value) || 175;
      const planoId = document.getElementById('addStudentPlanId')?.value || 'plan_academia';
      const faixaJiuJitsu = document.getElementById('addStudentFaixa')?.value || 'Branca';

      const user = store.addUsuario({
        nome: name,
        email,
        senha,
        telefone: phone,
        sexo,
        tipo_usuario,
        peso,
        altura,
        plano_id: planoId,
        faixaJiuJitsu,
        goal
      });

      if (user.role === 'aluno') {
        store.addMatricula({
          usuario_id: user.id,
          plano_id: planoId,
          status: 'Ativa'
        });
        const plano = store.getPlano(planoId) || { valor: 120.00, nome: 'Plano Musculação' };
        store.addFatura({
          usuario_id: user.id,
          valor: plano.valor,
          status: 'Pendente',
          descricao: `Mensalidade Inicial - ${plano.nome}`
        });
        store.addAvaliacaoFisica({
          usuario_id: user.id,
          peso,
          altura,
          gordura_corporal: 15,
          massa_muscular: 36,
          notes: 'Cadastro inicial realizado pelo Personal'
        });
      }

      const modal = document.getElementById('newStudentModal');
      if (modal) modal.classList.remove('active');
      soundManager.playSuccessSound();
      if (user._generatedTemporaryPassword) {
        showToast('info', 'Senha Provisória Gerada', `Anote a senha provisória de ${name}: ${user._generatedTemporaryPassword}`);
      } else {
        showToast('success', 'Usuário Cadastrado', `${name} cadastrado com sucesso.`);
      }
      renderApp();
      return;
    }

    if (e.target.id === 'newMatriculaForm') {
      e.preventDefault();
      const usuario_id = document.getElementById('newMatUsuarioSelect')?.value;
      const plano_id = document.getElementById('newMatPlanoSelect')?.value;
      const inicio = document.getElementById('newMatInicio')?.value;
      const termino = document.getElementById('newMatTermino')?.value;
      const status = document.getElementById('newMatStatus')?.value || 'Ativa';

      store.addMatricula({
        usuario_id,
        plano_id,
        inicio,
        termino,
        status
      });

      const modal = document.getElementById('newMatriculaModal');
      if (modal) modal.classList.remove('active');
      soundManager.playSuccessSound();
      showToast('success', 'Matrícula Vinculada', 'Novo contrato registrado com sucesso.');
      renderApp();
      return;
    }

    if (e.target.id === 'studentFeedbackForm') {
      e.preventDefault();
      const form = e.target;
      const studentId = form.querySelector('#feedbackStudentId')?.value || store.getActiveStudent()?.id;
      const profId = form.querySelector('#fbkProfessorSelect')?.value || 'usr_prof_1';
      const treinoId = form.querySelector('#fbkTreinoSelect')?.value || 'trn_1';
      const nota = Number(form.querySelector('#feedbackRatingVal')?.value || form.querySelector('#fbkRatingInput')?.value) || 5;
      const comentario = form.querySelector('#feedbackCommentInput')?.value || form.querySelector('#fbkCommentInput')?.value || 'Avaliação registrada com sucesso';
      const today = new Date().toISOString().split('T')[0];

      store.addFeedback({
        usuario_id: studentId,
        professor_id: profId,
        treino_id: treinoId,
        nota,
        comentario,
        data: today
      });

      const modal = document.getElementById('feedbackModal');
      if (modal) modal.classList.remove('active');
      soundManager.playSuccessSound();
      showToast('success', 'Feedback Enviado', 'Agradecemos sua avaliação! Ela foi enviada para o Personal.');
      renderApp();
      return;
    }

    if (e.target.id === 'newPersonalForm') {
      e.preventDefault();
      const name = document.getElementById('addPersonalName')?.value;
      const cref = document.getElementById('addPersonalCref')?.value;
      const phone = document.getElementById('addPersonalPhone')?.value;
      const specialty = document.getElementById('addPersonalSpecialty')?.value;
      const email = document.getElementById('addPersonalEmail')?.value;
      const bio = document.getElementById('addPersonalBio')?.value;

      store.addPersonal({
        name,
        cref,
        phone,
        specialty,
        email,
        bio
      });

      const modal = document.getElementById('newPersonalModal');
      if (modal) modal.classList.remove('active');
      showToast('success', 'Personal Cadastrado', `${name} adicionado à equipe técnica.`);
      renderApp();
      return;
    }

    if (e.target.id === 'newPlanForm') {
      e.preventDefault();
      const name = document.getElementById('addPlanName')?.value;
      const price = document.getElementById('addPlanPrice')?.value;
      const period = document.getElementById('addPlanPeriod')?.value;
      const description = document.getElementById('addPlanDesc')?.value;
      const benefits = document.getElementById('addPlanBenefits')?.value;
      const popular = document.getElementById('addPlanPopular')?.checked;

      store.addPlan({
        name,
        price,
        period,
        description,
        benefits,
        popular
      });

      const modal = document.getElementById('newPlanModal');
      if (modal) modal.classList.remove('active');
      showToast('success', 'Plano Cadastrado', `Plano ${name} adicionado ao catálogo.`);
      renderApp();
      return;
    }
  });
}

function handleRestTimer(exId, totalSeconds, buttonEl) {
  const widget = document.getElementById(`timer-widget-${exId}`);
  const display = widget?.querySelector('.timer-seconds-display');

  if (activeTimers[exId]) {
    clearInterval(activeTimers[exId].interval);
    delete activeTimers[exId];
    if (buttonEl) buttonEl.textContent = '▶ Iniciar';
    if (display) display.textContent = `${totalSeconds}s`;
    return;
  }

  let remaining = totalSeconds;
  buttonEl.textContent = '⏸ Pausar';

  activeTimers[exId] = {
    remaining,
    interval: setInterval(() => {
      remaining--;
      if (display) display.textContent = `${remaining}s`;

      if (remaining <= 0) {
        clearInterval(activeTimers[exId].interval);
        delete activeTimers[exId];
        soundManager.playTimerChime();
        if (display) display.textContent = '0s';
        if (buttonEl) buttonEl.textContent = '▶ Reiniciar';
        showToast('info', 'Descanso Concluído', 'Tempo de intervalo encerrado. Prepare-se para a próxima série!');
      }
    }, 1000)
  };
}

window.addEventListener('DOMContentLoaded', initApp);
