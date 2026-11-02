import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import CoachMessageModal from '../../components/CoachMessageModal';
import { useAuth } from '../../context/AuthContext';
import { useGymData } from '../../context/GymDataContext';
import { dataService } from '../../services/dataService';
import { pushNotificationService } from '../../services/pushNotificationService';

export default function StudentDashboardScreen({ navigation }) {
  const { currentUser, logout } = useAuth();
  const { dailyWater, addWater, gymConfig } = useGymData();
  const [coachModalVisible, setCoachModalVisible] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      pushNotificationService.registerForPushNotificationsAsync(currentUser.id);
    }
  }, [currentUser?.id]);

  const waterGoal = 2500;
  const waterProgress = Math.min(100, Math.round((dailyWater / waterGoal) * 100));

  const planPrices = {
    plan_academia: 'R$ 120/mês',
    plan_jiujitsu: 'R$ 130/mês',
    plan_academia_jiujitsu: 'R$ 150/mês'
  };
  const planBadge = planPrices[currentUser?.plano_id] || 'R$ 120/mês';
  const trainDays = Array.isArray(currentUser?.diasTreinoSemana)
    ? currentUser.diasTreinoSemana.join(', ')
    : 'Segunda a Sexta';

  const handleDeleteOwnAccountLgpd = () => {
    Alert.alert(
      'Excluir Conta e Dados (LGPD)',
      'Deseja excluir permanentemente sua conta e todos os seus dados pessoais, medidas e histórico? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Definitivamente',
          style: 'destructive',
          onPress: async () => {
            await dataService.deleteStudentAccount(currentUser?.id);
            await logout();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={`Olá, ${currentUser?.nome?.split(' ')[0] || 'Aluno'}!`}
        subtitle={(gymConfig?.name || 'ACADEMIA & JIU-JÍTSU').toUpperCase()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.getParent()?.navigate('Chat')}
          style={styles.coachCard}
        >
          <View style={styles.coachCardHeader}>
            <View style={styles.coachIconBadge}>
              <Ionicons name="chatbubbles" size={22} color="#000" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.coachCardBadge}>CHAT EM TEMPO REAL NO APP</Text>
              <Text style={styles.coachCardTitle}>Falar com o Personal</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
          </View>
          <Text style={styles.coachCardText}>
            Converse diretamente com o Personal dentro do aplicativo (com notificações Push via Expo Notifications).
          </Text>
        </TouchableOpacity>

        <Card variant="emerald" style={styles.measuresCard}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="body-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionHeading}>MEDIDAS, FAIXA & PLANO</Text>
            </View>
            <Badge label={planBadge} variant="cyan" />
          </View>

          <View style={styles.measuresGrid}>
            <View style={styles.measureItem}>
              <Text style={styles.measureValue}>{currentUser?.peso || 75} <Text style={styles.measureUnit}>kg</Text></Text>
              <Text style={styles.measureLabel}>Peso</Text>
            </View>
            <View style={styles.measureDivider} />
            <View style={styles.measureItem}>
              <Text style={styles.measureValue}>{currentUser?.altura || 175} <Text style={styles.measureUnit}>cm</Text></Text>
              <Text style={styles.measureLabel}>Altura</Text>
            </View>
            <View style={styles.measureDivider} />
            <View style={styles.measureItem}>
              <Text style={styles.measureValue}>🥋 {currentUser?.faixaJiuJitsu || 'Branca'}</Text>
              <Text style={styles.measureLabel}>{currentUser?.grausJiuJitsu || 0}º Grau</Text>
            </View>
          </View>

          <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 10, textAlign: 'center' }}>
            Dias de treino na semana: <Text style={{ color: colors.primary, fontWeight: '800' }}>{trainDays}</Text>
          </Text>
        </Card>

        <Card style={styles.waterCard}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="water-outline" size={18} color={colors.secondary} />
              <Text style={styles.sectionHeading}>HIDRATAÇÃO DIÁRIA</Text>
            </View>
            <Text style={styles.waterPercentage}>{waterProgress}% da Meta</Text>
          </View>

          <View style={styles.waterRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.waterValue}>{dailyWater} <Text style={{ fontSize: 13, color: colors.textSecondary }}>/ {waterGoal} ml</Text></Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${waterProgress}%` }]} />
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => addWater(250)}
              style={styles.addWaterBtn}
            >
              <Ionicons name="add" size={18} color={colors.secondary} />
              <Text style={styles.addWaterBtnText}>+250ml</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <View style={styles.bottomShortcuts}>
          <TouchableOpacity
            style={styles.halfShortcut}
            onPress={() => navigation.navigate('GymPass')}
          >
            <Ionicons name="qr-code-outline" size={24} color={colors.primary} />
            <Text style={styles.shortcutTitle}>Carteirinha Digital</Text>
            <Text style={styles.shortcutSub}>Check-in na recepção</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.halfShortcut}
            onPress={() => navigation.navigate('Evolução')}
          >
            <Ionicons name="trending-up-outline" size={24} color={colors.secondary} />
            <Text style={styles.shortcutTitle}>Evolução Física</Text>
            <Text style={styles.shortcutSub}>Bioimpedância e medidas</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.bottomShortcuts, { marginTop: 12 }]}>
          <Button
            title="Sair da Conta"
            onPress={logout}
            variant="secondary"
            style={{ flex: 1 }}
          />
          <Button
            title="Excluir Conta (LGPD)"
            onPress={handleDeleteOwnAccountLgpd}
            variant="outline"
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>

      <CoachMessageModal
        visible={coachModalVisible}
        onClose={() => setCoachModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  coachCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14
  },
  coachCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  coachIconBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  coachCardBadge: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  coachCardTitle: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  coachCardText: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  measuresCard: { marginBottom: 14 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionHeading: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  measuresGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 4 },
  measureItem: { alignItems: 'center' },
  measureValue: { color: colors.primary, fontSize: 17, fontWeight: '900' },
  measureUnit: { fontSize: 11, color: colors.textSecondary },
  measureLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  measureDivider: { width: 1, height: 30, backgroundColor: colors.border },
  waterCard: { marginBottom: 14 },
  waterPercentage: { color: colors.secondary, fontSize: 12, fontWeight: '800' },
  waterRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  waterValue: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  progressBarBg: { height: 8, backgroundColor: colors.surfaceElevated, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.secondary, borderRadius: 4 },
  addWaterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0, 229, 255, 0.12)', borderWidth: 1, borderColor: colors.secondary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  addWaterBtnText: { color: colors.secondary, fontSize: 13, fontWeight: '800' },
  bottomShortcuts: { flexDirection: 'row', gap: 12 },
  halfShortcut: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, alignItems: 'center' },
  shortcutTitle: { color: '#FFF', fontSize: 13, fontWeight: '800', marginTop: 8 },
  shortcutSub: { color: colors.textSecondary, fontSize: 11, marginTop: 2 }
});
