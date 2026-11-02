import { store } from '../data/store.js';
import { Icons } from './icons.js';
import { createInitialsAvatar } from '../utils/security.js';

export function renderNavbar(activeTab = 'workouts') {
  const isPersonal = store.isPersonal();
  const currentUser = store.getCurrentUser();
  const gym = store.getGymConfig();

  const activeStudent = store.getActiveStudent();
  const allNotifications = store.getNotifications(!isPersonal ? activeStudent?.id : null);
  const unreadCount = allNotifications.filter(n => !n.read).length;

  return `
    <header class="app-header">
      <div class="header-left">
        <button id="openMobileDrawerBtn" class="mobile-drawer-toggle-btn" title="Abrir Menu Completo">
          ${Icons.sliders('', 20)}
        </button>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="user-role-header-badge" style="display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: var(--radius-full); font-size: 0.82rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; ${
            isPersonal
              ? 'background: rgba(255, 184, 0, 0.12); color: #FFB800; border: 1px solid rgba(255, 184, 0, 0.35);'
              : 'background: rgba(0, 245, 155, 0.12); color: var(--jet-emerald); border: 1px solid rgba(0, 245, 155, 0.35);'
          }">
            ${isPersonal ? Icons.sliders('', 14) : Icons.user('', 14)}
            <span class="role-badge-text">${isPersonal ? 'Painel do Personal' : 'Área do Aluno'}</span>
          </div>

          <span class="gym-brand-top" style="font-size: 0.85rem; color: var(--text-muted);">
            ${gym.name}
          </span>
        </div>
      </div>

      <div class="header-actions">
        ${!isPersonal ? `
          <button id="openFeedbackModalBtn" class="btn btn-secondary btn-sm header-action-btn" title="Avaliar treino e atendimento">
            ${Icons.sparkles('', 15)}
            <span class="btn-text">Avaliar</span>
          </button>

          <button id="openGymPassBtn" class="btn btn-primary btn-sm header-action-btn" style="box-shadow: 0 0 14px rgba(0, 245, 155, 0.35); font-weight: 700;" title="Abrir Carteirinha Digital do Aluno">
            ${Icons.idCard('', 16)}
            <span class="btn-text">Carteirinha</span>
          </button>
        ` : `
          <button id="adminQuickNewStudentBtn" class="btn btn-primary btn-sm header-action-btn" style="font-weight: 700;">
            ${Icons.plus('', 15)}
            <span class="btn-text">Novo Aluno</span>
          </button>
        `}

        <button id="enablePushNotificationsBtn" class="btn btn-secondary btn-sm header-action-btn" title="Ativar Notificações Push no Dispositivo">
          ${Icons.bell('', 15)}
          <span class="btn-text">Push</span>
        </button>

        <div style="position: relative;">
          <button id="notificationBellBtn" class="notification-bell-btn" title="Notificações">
            ${Icons.bell('', 18)}
            ${unreadCount > 0 ? `<span class="notification-badge">${unreadCount}</span>` : ''}
          </button>

          <div id="notificationDropdown" class="notification-dropdown">
            <div class="notif-dropdown-header">
              <div class="notif-title" style="display: flex; align-items: center; gap: 8px;">
                ${Icons.bell('', 16)}
                <span>Notificações (${unreadCount} não lidas)</span>
              </div>
              <button id="markAllReadBtn" class="btn btn-secondary btn-sm" style="font-size: 0.72rem; padding: 3px 8px;">
                Marcar lidas
              </button>
            </div>
            <div class="notif-list">
              ${allNotifications.length === 0 ? `
                <div class="notif-empty-state">Nenhuma notificação recebida no momento.</div>
              ` : allNotifications.map(notif => `
                <div class="notif-item ${!notif.read ? 'unread' : ''} ${notif.type}" data-notif-id="${notif.id}">
                  <div class="notif-item-icon ${
                    notif.type === 'alert_overdue' ? 'danger' :
                    notif.type.includes('alert') ? 'warning' :
                    notif.type === 'payment_success' ? 'success' : 'info'
                  }">
                    ${
                      notif.type === 'alert_overdue' ? Icons.clock('', 16) :
                      notif.type.includes('alert') ? Icons.clock('', 16) :
                      notif.type === 'payment_success' ? Icons.checkCircle('', 16) : Icons.calendar('', 16)
                    }
                  </div>
                  <div class="notif-content">
                    <div class="notif-heading">${notif.title}</div>
                    <div class="notif-text">${notif.message}</div>
                    <div class="notif-time">${notif.date ? notif.date.replace('T', ' ').slice(0, 16) : 'Agora'}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </header>
  `;
}

function getRoleNavItems(isPersonal) {
  if (!isPersonal) {
    return [
      { id: 'workouts', label: 'Meus Treinos', iconSvg: Icons.dumbbell('', 18) },
      { id: 'jiujitsu', label: 'Jiu-Jítsu & Faixa', iconSvg: Icons.shield('', 18) },
      { id: 'chat', label: 'Chat com Personal', iconSvg: Icons.bolt('', 18) },
      { id: 'student_exercises', label: 'Biblioteca de Exercícios', iconSvg: Icons.eye('', 18) },
      { id: 'evolution', label: 'Minha Evolução & Medidas', iconSvg: Icons.trendingUp('', 18) },
      { id: 'payments', label: 'Mensalidades & PIX', iconSvg: Icons.card('', 18) },
      { id: 'schedule', label: 'Agenda com Personal', iconSvg: Icons.calendar('', 18) },
      { id: 'student_gym_info', label: 'Minha Academia', iconSvg: Icons.sparkles('', 18) },
      { id: 'student_profile', label: 'Meu Perfil & LGPD', iconSvg: Icons.user('', 18) }
    ];
  }

  return [
    { id: 'admin_dashboard', label: 'Painel do Personal', iconSvg: Icons.trendingUp('', 18) },
    { id: 'admin_students', label: 'Gestão de Alunos', iconSvg: Icons.users('', 18) },
    { id: 'personal_workouts', label: 'Prescrever & Copiar Treinos', iconSvg: Icons.dumbbell('', 18) },
    { id: 'jiujitsu', label: 'Jiu-Jítsu (Turmas & Faixas)', iconSvg: Icons.shield('', 18) },
    { id: 'chat', label: 'Chat com Alunos', iconSvg: Icons.bolt('', 18) },
    { id: 'personal_evolution', label: 'Avaliações & Bioimpedância', iconSvg: Icons.sparkles('', 18) },
    { id: 'personal_schedule', label: 'Minha Agenda', iconSvg: Icons.calendar('', 18) },
    { id: 'admin_plans', label: 'Os 3 Planos Oficiais', iconSvg: Icons.idCard('', 18) },
    { id: 'admin_finances', label: 'Financeiro & PIX', iconSvg: Icons.card('', 18) },
    { id: 'admin_gym_config', label: 'Configurações da Academia', iconSvg: Icons.sliders('', 18) }
  ];
}

export function renderSidebar(activeTab = 'workouts') {
  const isPersonal = store.isPersonal();
  const currentUser = store.getCurrentUser();
  const activeStudent = store.getActiveStudent();
  const gym = store.getGymConfig();
  const navItems = getRoleNavItems(isPersonal);

  const user = currentUser || (!isPersonal ? activeStudent : store.getActivePersonal());
  const avatarSrc = user?.avatar || createInitialsAvatar(user?.nome || user?.name || 'U');

  return `
    <aside class="app-sidebar">
      <div class="sidebar-header">
        <div class="brand-logo-badge" style="background: linear-gradient(135deg, #00F59B 0%, #00E5FF 100%); color: #06090F; display: flex; align-items: center; justify-content: center; border-radius: 12px; width: 40px; height: 40px; box-shadow: 0 4px 14px rgba(0, 245, 155, 0.3);">
          ${Icons.bolt('', 22)}
        </div>
        <div class="brand-info">
          <div class="brand-name" style="letter-spacing: 0.5px; font-weight: 900; font-size: 1rem;">${gym.logoText || gym.name}</div>
          <div class="brand-tag" style="letter-spacing: 1.2px; font-size: 0.65rem; color: var(--jet-emerald); font-weight: 800;">
            ${isPersonal ? 'PERFIL PERSONAL' : 'ÁREA DO ALUNO'}
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">
          ${isPersonal ? 'Gestão do Personal' : 'Minha Rotina'}
        </div>
        ${navItems.map(item => `
          <a class="nav-item ${activeTab === item.id ? 'active' : ''}" data-nav-target="${item.id}">
            <span class="nav-item-icon" style="display: flex; align-items: center;">${item.iconSvg}</span>
            <span>${item.label}</span>
          </a>
        `).join('')}

        ${isPersonal ? `
          <div class="nav-section-title" style="margin-top: 24px;">Opções do Sistema</div>
          <a class="nav-item" id="resetDataBtn" title="Restaurar dados padrão do sistema">
            <span class="nav-item-icon" style="display: flex; align-items: center;">${Icons.sparkles('', 18)}</span>
            <span>Restaurar Padrões</span>
          </a>
        ` : ''}
      </nav>

      <div class="sidebar-user" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${avatarSrc}" class="user-avatar" alt="Avatar">
          <div class="user-details">
            <div class="user-name">${user?.nome || user?.name || 'Usuário'}</div>
            <div class="user-role-label" style="color: ${isPersonal ? '#FFB800' : 'var(--jet-emerald)'}; font-weight: 700;">
              ${isPersonal ? 'Personal' : 'Aluno'}
            </div>
          </div>
        </div>
        <button class="logout-action-btn btn btn-secondary btn-sm" title="Sair da Conta" style="padding: 4px 8px; font-size: 0.72rem;">
          Sair
        </button>
      </div>
    </aside>
  `;
}

export function renderMobileBottomNav(activeTab = 'workouts') {
  const isPersonal = store.isPersonal();
  const mobileItems = !isPersonal
    ? [
        { id: 'workouts', label: 'Treinos', iconSvg: Icons.dumbbell('', 18) },
        { id: 'jiujitsu', label: 'Jiu-Jítsu', iconSvg: Icons.shield('', 18) },
        { id: 'chat', label: 'Chat', iconSvg: Icons.bolt('', 18) },
        { id: 'payments', label: 'PIX', iconSvg: Icons.card('', 18) },
        { id: 'open_mobile_drawer_action', label: 'Mais', iconSvg: Icons.sliders('', 18) }
      ]
    : [
        { id: 'admin_dashboard', label: 'Painel', iconSvg: Icons.trendingUp('', 18) },
        { id: 'admin_students', label: 'Alunos', iconSvg: Icons.users('', 18) },
        { id: 'personal_workouts', label: 'Treinos', iconSvg: Icons.dumbbell('', 18) },
        { id: 'jiujitsu', label: 'Jiu-Jítsu', iconSvg: Icons.shield('', 18) },
        { id: 'open_mobile_drawer_action', label: 'Mais', iconSvg: Icons.sliders('', 18) }
      ];

  return `
    <nav class="mobile-bottom-nav">
      ${mobileItems.map(item => `
        <a class="mobile-nav-link ${activeTab === item.id ? 'active' : ''}" data-nav-target="${item.id}">
          <span class="mobile-nav-icon" style="display: flex; align-items: center; justify-content: center;">${item.iconSvg}</span>
          <span>${item.label}</span>
        </a>
      `).join('')}
    </nav>
  `;
}

export function renderMobileDrawer(activeTab = 'workouts') {
  const isPersonal = store.isPersonal();
  const currentUser = store.getCurrentUser();
  const activeStudent = store.getActiveStudent();
  const gym = store.getGymConfig();
  const user = currentUser || (!isPersonal ? activeStudent : store.getActivePersonal());
  const avatarSrc = user?.avatar || createInitialsAvatar(user?.nome || user?.name || 'U');
  const items = getRoleNavItems(isPersonal);

  return `
    <div id="mobileDrawerOverlay" class="mobile-drawer-overlay">
      <div class="mobile-drawer-content">
        <div class="mobile-drawer-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #00F59B, #00E5FF); display: flex; align-items: center; justify-content: center; color: #06090F;">
              ${Icons.bolt('', 22)}
            </div>
            <div>
              <div style="font-weight: 900; font-size: 1.02rem; letter-spacing: 0.5px;">${gym.name}</div>
              <div style="font-size: 0.65rem; color: var(--jet-emerald); font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                ${isPersonal ? 'PAINEL DO PERSONAL' : 'ÁREA DO ALUNO'}
              </div>
            </div>
          </div>
          <button id="closeMobileDrawerBtn" class="btn btn-secondary btn-sm" style="padding: 6px 10px; font-size: 1.1rem;">&times;</button>
        </div>

        <div class="mobile-drawer-user-card">
          <img src="${avatarSrc}" alt="Avatar" class="user-avatar" style="width: 46px; height: 46px;">
          <div style="flex: 1; overflow: hidden;">
            <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
              ${user?.nome || user?.name || 'Usuário'}
            </div>
            <div style="font-size: 0.75rem; color: ${isPersonal ? '#FFB800' : 'var(--jet-emerald)'}; font-weight: 700;">
              ${isPersonal ? 'Personal Trainer' : 'Aluno Registrado'}
            </div>
          </div>
        </div>

        <div class="mobile-drawer-links">
          <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 8px; padding-left: 8px;">
            Navegação Geral
          </div>
          ${items.map(item => `
            <a class="mobile-drawer-link ${activeTab === item.id ? 'active' : ''}" data-nav-target="${item.id}">
              <span style="display: flex; align-items: center;">${item.iconSvg}</span>
              <span>${item.label}</span>
            </a>
          `).join('')}

          ${!isPersonal ? `
            <div style="height: 1px; background: rgba(255, 255, 255, 0.08); margin: 12px 0;"></div>
            <a id="drawerOpenGymPassBtn" class="mobile-drawer-link">
              <span style="display: flex; align-items: center;">${Icons.idCard('', 18)}</span>
              <span>Carteirinha Digital</span>
            </a>
          ` : `
            <div style="height: 1px; background: rgba(255, 255, 255, 0.08); margin: 12px 0;"></div>
            <a id="resetDataBtnMobile" class="mobile-drawer-link" style="color: var(--amber-warning);">
              <span style="display: flex; align-items: center;">${Icons.sparkles('', 18)}</span>
              <span>Restaurar Dados Padrão</span>
            </a>
          `}
        </div>

        <div class="mobile-drawer-footer">
          <button class="logout-action-btn btn btn-danger btn-sm" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; font-weight: 700;">
            ${Icons.user('', 16)}
            <span>Sair da Conta (Logout)</span>
          </button>
        </div>
      </div>
    </div>
  `;
}
