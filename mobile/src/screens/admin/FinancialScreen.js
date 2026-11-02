import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useGymData } from '../../context/GymDataContext';
import { dataService } from '../../services/dataService';
import { pushNotificationService } from '../../services/pushNotificationService';

export default function FinancialScreen({ navigation }) {
  const { students, markPaymentPaid } = useGymData();
  const [faturas, setFaturas] = useState([]);
  const [filterMode, setFilterMode] = useState('all');

  useEffect(() => {
    loadFaturas();
  }, [students]);

  const loadFaturas = async () => {
    const state = await dataService.getState();
    setFaturas(state.faturas || []);
  };

  const paidFaturas = faturas.filter(f => f.status === 'Pago');
  const pendingFaturas = faturas.filter(f => f.status !== 'Pago');

  const totalRecebido = paidFaturas.reduce((acc, f) => acc + (f.valor || 0), 0);
  const totalPendente = pendingFaturas.reduce((acc, f) => acc + (f.valor || 0), 0);

  const handleDarBaixa = async (faturaId, desc, studentId) => {
    await markPaymentPaid(faturaId);
    await loadFaturas();
    if (studentId) {
      await pushNotificationService.notifyStudent({
        studentId,
        title: '✅ Mensalidade Confirmada!',
        message: `Sua fatura (${desc}) foi confirmada pelo Personal.`,
        type: 'cobranca'
      });
    }
    Alert.alert('Sucesso', `Fatura "${desc}" liquidada com sucesso.`);
  };

  const handleAlertOverduePush = async () => {
    await pushNotificationService.notifyPersonalOverdueStudents(pendingFaturas.length);
    for (const fat of pendingFaturas) {
      await pushNotificationService.notifyStudent({
        studentId: fat.usuario_id,
        title: '⚠️ Lembrete de Mensalidade',
        message: `Olá! Sua mensalidade (${fat.descricao}) de R$ ${Number(fat.valor).toFixed(2)} está pendente. Pague via PIX ou Asaas no app.`,
        type: 'cobranca'
      });
    }
    Alert.alert('Push Enviado (Expo Notifications)', `Alerta enviado para ${pendingFaturas.length} aluno(s) com mensalidade pendente.`);
  };

  const visibleFaturas = filterMode === 'inadimplentes'
    ? pendingFaturas
    : filterMode === 'pagos'
      ? paidFaturas
      : faturas;

  return (
    <View style={styles.container}>
      <Header title="Financeiro (Asaas & PIX)" subtitle="RELATÓRIO SQL & INADIMPLENTES" showBack navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.kpiRow}>
          <Card variant="emerald" style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>TOTAL RECEBIDO</Text>
            <Text style={styles.kpiValGreen}>R$ {totalRecebido.toFixed(2)}</Text>
            <Text style={styles.kpiSub}>{paidFaturas.length} faturas quitadas</Text>
          </Card>

          <Card variant="danger" style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>EM ABERTO / ATRASO</Text>
            <Text style={styles.kpiValRed}>R$ {totalPendente.toFixed(2)}</Text>
            <Text style={styles.kpiSub}>{pendingFaturas.length} pendentes</Text>
          </Card>
        </View>

        <Card style={styles.plansCard}>
          <Text style={styles.sectionHeading}>OS 3 PLANOS OFICIAIS DA ACADEMIA</Text>
          <View style={styles.planLine}>
            <Text style={styles.planLineName}>🏋️ Plano Musculação</Text>
            <Text style={styles.planLineVal}>R$ 120,00</Text>
          </View>
          <View style={styles.planLine}>
            <Text style={styles.planLineName}>🥋 Plano Jiu-Jítsu</Text>
            <Text style={styles.planLineVal}>R$ 130,00</Text>
          </View>
          <View style={[styles.planLine, { borderBottomWidth: 0 }]}>
            <Text style={styles.planLineName}>🔥 Completo (Musculação + Jiu-Jítsu)</Text>
            <Text style={styles.planLineVal}>R$ 150,00</Text>
          </View>
        </Card>

        {pendingFaturas.length > 0 && (
          <Button
            title={`Enviar Push de Cobrança (${pendingFaturas.length} pendentes)`}
            onPress={handleAlertOverduePush}
            variant="secondary"
            style={{ marginBottom: 14 }}
          />
        )}

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'inadimplentes', label: `Não Pagaram (${pendingFaturas.length})` },
            { id: 'pagos', label: `Pagas (${paidFaturas.length})` }
          ].map(tab => {
            const active = filterMode === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setFilterMode(tab.id)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, active && { color: '#000', fontWeight: '800' }]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {visibleFaturas.map(fat => {
          const student = students.find(s => s.id === fat.usuario_id);
          const isPaid = fat.status === 'Pago';

          return (
            <Card key={fat.id} style={styles.fatCard}>
              <View style={styles.fatRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fatStudent}>{student?.nome || 'Aluno'}</Text>
                  <Text style={styles.fatDesc}>{fat.descricao}</Text>
                  <Text style={styles.fatDate}>Vencimento: {fat.dataVencimento}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.fatAmount}>R$ {fat.valor.toFixed(2)}</Text>
                  <Badge
                    label={isPaid ? '✓ PAGO' : fat.status === 'Aguardando Confirmação' ? '⏳ CONFIRMAR' : '● PENDENTE'}
                    variant={isPaid ? 'success' : 'danger'}
                    style={{ marginTop: 4 }}
                  />

                  {!isPaid && (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => handleDarBaixa(fat.id, fat.descricao, fat.usuario_id)}
                      style={styles.baixaBtn}
                    >
                      <Text style={styles.baixaBtnText}>Confirmar Baixa</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  kpiBox: { flex: 1, padding: 14 },
  kpiLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  kpiValGreen: { color: colors.primary, fontSize: 20, fontWeight: '900', marginVertical: 4 },
  kpiValRed: { color: colors.danger, fontSize: 20, fontWeight: '900', marginVertical: 4 },
  kpiSub: { color: colors.textSecondary, fontSize: 11 },
  plansCard: { marginBottom: 14, padding: 14 },
  sectionHeading: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.8, marginBottom: 10 },
  planLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  planLineName: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  planLineVal: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  filterChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  fatCard: { marginBottom: 10, padding: 14 },
  fatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fatStudent: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  fatDesc: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  fatDate: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  fatAmount: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  baixaBtn: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginTop: 6 },
  baixaBtnText: { color: '#000', fontSize: 11, fontWeight: '800' }
});
