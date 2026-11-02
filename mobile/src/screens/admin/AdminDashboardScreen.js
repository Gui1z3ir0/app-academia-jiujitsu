import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useGymData } from '../../context/GymDataContext';

export default function AdminDashboardScreen({ navigation }) {
  const { students, coachMessages, resolveCoachMessage } = useGymData();

  const paidStudents = students.filter(s => s.isPaidThisMonth);
  const pendingStudents = students.filter(s => !s.isPaidThisMonth);
  const totalRecebido = paidStudents.reduce((acc, s) => acc + (s.planoValor || 120), 0);
  const totalPendente = pendingStudents.reduce((acc, s) => acc + (s.planoValor || 120), 0);
  const mrr = students.reduce((acc, s) => acc + (s.planoValor || 120), 0);
  const studentsWithFaltas = students.filter(s => s.faltasCount > 0);
  const totalFaltas = students.reduce((acc, s) => acc + s.faltasCount, 0);

  const pendingMessages = coachMessages.filter(m => m.status === 'pendente');

  const handleWhatsAppReply = (phone, name, subject) => {
    if (!phone) {
      Alert.alert('Aviso', 'O aluno não possui telefone cadastrado.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const text = `Olá ${name}! Sou o Treinador Jefferson Calisto. Estou respondendo sua mensagem sobre "${subject}".`;
    Linking.openURL(`https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(text)}`);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Painel do Dono & Treinador"
        subtitle="CT JEFFERSON CALISTO"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="emerald" style={styles.msgSectionCard}>
          <View style={styles.msgSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.msgIconBadge}>
                <Ionicons name="flash" size={18} color="#000" />
              </View>
              <View>
                <Text style={styles.msgSectionTitle}>Mensagens dos Alunos (Personal)</Text>
                <Text style={styles.msgSectionSub}>Canal prioritário com o Treinador</Text>
              </View>
            </View>
            <Badge
              label={`${pendingMessages.length} Pendente(s)`}
              variant={pendingMessages.length > 0 ? 'danger' : 'success'}
            />
          </View>

          {pendingMessages.length === 0 ? (
            <View style={styles.emptyMessages}>
              <Text style={styles.emptyMessagesText}>✨ Nenhuma dúvida ou mensagem pendente dos alunos!</Text>
            </View>
          ) : (
            pendingMessages.map(msg => (
              <View
                key={msg.id}
                style={[
                  styles.msgItem,
                  msg.prioridade === 'alta' && styles.msgItemHigh
                ]}
              >
                <View style={styles.msgTopRow}>
                  <Text style={styles.msgStudentName}>{msg.nomeAluno}</Text>
                  <Badge
                    label={msg.prioridade === 'alta' ? '🔴 ALTA PRIORIDADE' : (msg.prioridade === 'media' ? '🟡 MÉDIA' : '🟢 GERAL')}
                    variant={msg.prioridade === 'alta' ? 'danger' : (msg.prioridade === 'media' ? 'warning' : 'success')}
                  />
                </View>

                <Text style={styles.msgSubject}>Assunto: {msg.assunto}</Text>
                <Text style={styles.msgBody}>"{msg.mensagem}"</Text>

                <View style={styles.msgActions}>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => handleWhatsAppReply(msg.telefone, msg.nomeAluno, msg.assunto)}
                    style={styles.waReplyBtn}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#000" />
                    <Text style={styles.waReplyText}>Responder no WhatsApp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => resolveCoachMessage(msg.id)}
                    style={styles.resolveBtn}
                  >
                    <Ionicons name="checkmark" size={16} color={colors.primary} />
                    <Text style={styles.resolveText}>Concluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Card>

        <Text style={styles.sectionTitle}>MÉTRICAS DO MÊS ATUAL</Text>

        <View style={styles.kpiGrid}>
          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>Pagos no Mês</Text>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            </View>
            <Text style={styles.kpiValue}>{paidStudents.length} <Text style={styles.kpiSub}>/ {students.length}</Text></Text>
            <Text style={styles.kpiMoney}>R$ {totalRecebido.toFixed(2)} recebido</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>Pendentes</Text>
              <Ionicons name="time" size={18} color={colors.danger} />
            </View>
            <Text style={[styles.kpiValue, { color: pendingStudents.length > 0 ? colors.danger : colors.primary }]}>
              {pendingStudents.length}
            </Text>
            <Text style={styles.kpiMoney}>R$ {totalPendente.toFixed(2)} a receber</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>Previsão (MRR)</Text>
              <Ionicons name="trending-up" size={18} color={colors.secondary} />
            </View>
            <Text style={styles.kpiValue}>R$ {mrr.toFixed(2)}</Text>
            <Text style={styles.kpiMoney}>Planos R$ 120 e R$ 150</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>Alunos com Faltas</Text>
              <Ionicons name="alert-circle" size={18} color={colors.warning} />
            </View>
            <Text style={styles.kpiValue}>{studentsWithFaltas.length}</Text>
            <Text style={styles.kpiMoney}>{totalFaltas} falta(s) computadas</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>GESTÃO DA ACADEMIA</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('StudentManager')}
          style={styles.menuItem}
        >
          <View style={styles.menuIconBadge}>
            <Ionicons name="people" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Controle de Alunos & Faltas</Text>
            <Text style={styles.menuSub}>Ver peso, altura, baixar pagamentos e registrar faltas</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('WorkoutBuilder')}
          style={styles.menuItem}
        >
          <View style={[styles.menuIconBadge, { backgroundColor: colors.secondary }]}>
            <Ionicons name="barbell" size={20} color="#000" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Montador de Treinos</Text>
            <Text style={styles.menuSub}>Criar e ajustar exercícios para cada aluno</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Financial')}
          style={styles.menuItem}
        >
          <View style={[styles.menuIconBadge, { backgroundColor: colors.warning }]}>
            <Ionicons name="cash" size={20} color="#000" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Relatório Financeiro & PIX</Text>
            <Text style={styles.menuSub}>Balanço de faturas de R$ 120 e R$ 150</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('GymConfig')}
          style={styles.menuItem}
        >
          <View style={[styles.menuIconBadge, { backgroundColor: colors.surfaceLight }]}>
            <Ionicons name="settings" size={20} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Configurações do CT</Text>
            <Text style={styles.menuSub}>Chave PIX, horários de funcionamento e avisos</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 16,
    paddingBottom: 40
  },
  msgSectionCard: {
    marginBottom: 16
  },
  msgSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  msgIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  msgSectionTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800'
  },
  msgSectionSub: {
    color: colors.textSecondary,
    fontSize: 11
  },
  emptyMessages: {
    padding: 16,
    backgroundColor: 'rgba(0, 245, 155, 0.05)',
    borderRadius: 12,
    alignItems: 'center'
  },
  emptyMessagesText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700'
  },
  msgItem: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  msgItemHigh: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(255, 71, 87, 0.05)'
  },
  msgTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  msgStudentName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800'
  },
  msgSubject: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4
  },
  msgBody: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12
  },
  msgActions: {
    flexDirection: 'row',
    gap: 10
  },
  waReplyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.whatsapp,
    paddingVertical: 8,
    borderRadius: 8
  },
  waReplyText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800'
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 245, 155, 0.1)',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  resolveText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700'
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  kpiCard: {
    width: '48%',
    padding: 14,
    marginBottom: 12
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  kpiTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700'
  },
  kpiValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900'
  },
  kpiSub: {
    fontSize: 11,
    color: colors.textSecondary
  },
  kpiMoney: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10
  },
  menuIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 245, 155, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  menuTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800'
  },
  menuSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2
  }
});
