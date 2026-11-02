import { store } from '../data/store.js';

class NotificationEngine {
  constructor() {
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.checkAllDueDates();
  }

  async requestPushPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { granted: false, reason: 'Navegador não suporta notificações Web Push.' };
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await this.sendNativePushNotification(
        store.getGymConfig()?.name || 'Academia & Jiu-Jítsu',
        'Notificações Push ativadas! Você receberá alertas de mensagens do chat, treinos e vencimento de mensalidades.'
      );
      return { granted: true };
    }
    return { granted: false, reason: 'Permissão de notificação negada pelo navegador.' };
  }

  async sendNativePushNotification(title, body, url = '/') {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            vibrate: [150, 80, 150],
            data: { url }
          });
          return;
        }
      }
      new Notification(title, { body, icon: '/favicon.svg' });
    } catch (e) {}
  }

  getDaysDifference(targetDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = targetDateStr.split('-').map(Number);
    const target = new Date(year, month - 1, day);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  checkAllDueDates() {
    const students = store.getStudents();

    students.forEach(student => {
      if (!student.dueDate) return;

      const pendingPayment = store.getPayments().find(
        p => p.studentId === student.id && (p.status === 'pendente' || p.status === 'atrasado')
      );

      if (!pendingPayment) return;

      const daysRemaining = this.getDaysDifference(student.dueDate);
      this.evaluateRules(student, daysRemaining, pendingPayment.amount);
    });
  }

  evaluateRules(student, daysRemaining, amount) {
    const formattedAmount = `R$ ${amount.toFixed(2)}`;

    if (daysRemaining === 7) {
      this.dispatchIfNew(
        student.id,
        'alert_7_days',
        'Lembrete de Vencimento (7 dias)',
        `Olá ${student.name}, sua mensalidade de ${formattedAmount} vence em 7 dias. Pague com antecedência pelo PIX!`
      );
    } else if (daysRemaining === 3) {
      this.dispatchIfNew(
        student.id,
        'alert_3_days',
        'Atenção ao Vencimento (3 dias)',
        `Olá ${student.name}, sua mensalidade vence em 3 dias (${this.formatBrDate(student.dueDate)}). Não esqueça de realizar o pagamento!`
      );
    } else if (daysRemaining === 1) {
      this.dispatchIfNew(
        student.id,
        'alert_1_day',
        'Sua mensalidade vence amanhã!',
        `Olá ${student.name}, sua mensalidade de ${formattedAmount} vence amanhã. Gere seu código PIX no aplicativo.`
      );
    } else if (daysRemaining === 0) {
      this.dispatchIfNew(
        student.id,
        'alert_due_today',
        'Sua mensalidade vence HOJE!',
        `Olá ${student.name}, sua mensalidade vence hoje (${this.formatBrDate(student.dueDate)}). Efetue o pagamento para garantir acesso sem bloqueios.`
      );
    } else if (daysRemaining < 0) {
      const diasAtraso = Math.abs(daysRemaining);
      this.dispatchIfNew(
        student.id,
        'alert_overdue',
        'Mensalidade em Atraso!',
        `Olá ${student.name}, sua mensalidade está em atraso há ${diasAtraso} ${diasAtraso === 1 ? 'dia' : 'dias'}. Regularize seu pagamento para manter sua matrícula ativa.`
      );
    }
  }

  dispatchIfNew(studentId, type, title, message) {
    const existing = store.getNotifications(studentId);
    const todayStr = new Date().toISOString().split('T')[0];

    const alreadySentToday = existing.some(n => {
      return n.type === type && n.date.startsWith(todayStr);
    });

    if (!alreadySentToday) {
      store.addNotification({
        studentId,
        type,
        title,
        message,
        priority: type === 'alert_overdue' ? 'high' : 'normal'
      });
      this.sendNativePushNotification(title, message, '/');
    }
  }

  simulateScenario(studentId, scenario) {
    const student = store.getStudents().find(s => s.id === studentId) || store.getActiveStudent();
    if (!student) return { priority: 'normal', title: 'Aviso', message: 'Nenhum aluno selecionado.' };
    const amountStr = `R$ ${(student.monthlyAmount || 120).toFixed(2)}`;

    let type = '';
    let title = '';
    let message = '';
    let priority = 'normal';

    switch (scenario) {
      case '7_days':
        type = 'alert_7_days';
        title = 'Mensalidade vence em 7 dias';
        message = `${student.name}, sua mensalidade no valor de ${amountStr} vence em 7 dias. Aproveite para pagar com PIX!`;
        break;
      case '3_days':
        type = 'alert_3_days';
        title = 'Mensalidade vence em 3 dias';
        message = `${student.name}, sua mensalidade vence em 3 dias. Não esqueça de realizar o pagamento.`;
        break;
      case '1_day':
        type = 'alert_1_day';
        title = 'Mensalidade vence amanhã';
        message = `${student.name}, sua mensalidade vence amanhã (${this.formatBrDate(student.dueDate)}).`;
        priority = 'medium';
        break;
      case 'today':
        type = 'alert_due_today';
        title = 'Mensalidade vence hoje';
        message = `${student.name}, sua mensalidade vence hoje (${amountStr}). Clique para pagar agora.`;
        priority = 'high';
        break;
      case 'overdue':
        type = 'alert_overdue';
        title = 'Mensalidade em Atraso';
        message = `${student.name}, sua mensalidade está em atraso. Regularize seu pagamento para manter sua matrícula ativa.`;
        priority = 'high';
        break;
      default:
        type = 'system_info';
        title = 'Lembrete da Academia';
        message = `Treino programado para hoje! Lembre-se de manter-se hidratado.`;
    }

    const notif = store.addNotification({
      studentId: student.id,
      type,
      title,
      message,
      priority
    });

    this.sendNativePushNotification(title, message, '/');

    if (scenario === 'overdue') {
      store.updateStudent(student.id, { status: 'atrasado' });
    } else if (scenario === 'today' || scenario === '1_day' || scenario === '3_days') {
      store.updateStudent(student.id, { status: 'vence_breve' });
    }

    return notif;
  }

  formatBrDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }
}

export const notificationEngine = new NotificationEngine();
