import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { apiAdapter } from './apiAdapter';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});

export const pushNotificationService = {
  async registerForPushNotificationsAsync(userId) {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Alertas da Academia & Jiu-Jítsu',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00F59B'
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const pushToken = tokenData?.data || null;

      if (pushToken && userId && apiAdapter.isConfigured) {
        await apiAdapter.update('usuarios', `id=eq.${userId}`, { push_token: pushToken });
      }

      return pushToken;
    } catch (e) {
      return null;
    }
  },

  async scheduleLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          data
        },
        trigger: null
      });
    } catch (e) {}
  },

  async notifyPersonalNewMessage({ studentName, text }) {
    const title = `💬 Nova mensagem de ${studentName}`;
    await this.scheduleLocalNotification(title, text, { type: 'chat' });

    if (apiAdapter.isConfigured) {
      await apiAdapter.sendPushNotification({
        targetRole: 'personal',
        title,
        message: text,
        data: { type: 'chat' }
      });
    }
  },

  async notifyPersonalOverdueStudents(overdueCount) {
    if (overdueCount <= 0) return;
    const title = '⚠️ Alunos Inadimplentes no Mês';
    const body = `Existem ${overdueCount} mensalidade(s) em atraso aguardando regularização.`;
    await this.scheduleLocalNotification(title, body, { type: 'cobranca' });

    if (apiAdapter.isConfigured) {
      await apiAdapter.sendPushNotification({
        targetRole: 'personal',
        title,
        message: body,
        data: { type: 'cobranca' }
      });
    }
  },

  async notifyStudent({ studentId, title, message, type = 'sistema' }) {
    await this.scheduleLocalNotification(title, message, { type });

    if (apiAdapter.isConfigured && studentId) {
      await apiAdapter.sendPushNotification({
        targetUserId: studentId,
        title,
        message,
        data: { type }
      });
    }
  }
};

