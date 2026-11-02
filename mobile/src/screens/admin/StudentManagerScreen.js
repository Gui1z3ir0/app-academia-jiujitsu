import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { useGymData } from '../../context/GymDataContext';
import { dataService } from '../../services/dataService';

export default function StudentManagerScreen({ navigation }) {
  const { students, refreshStudents, addFalta, removeFalta, markPaymentPaid } = useGymData();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [newStudentModalVisible, setNewStudentModalVisible] = useState(false);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('123456');
  const [newPhone, setNewPhone] = useState('');
  const [newWeight, setNewWeight] = useState('75.0');
  const [newHeight, setNewHeight] = useState('175');
  const [newPlanId, setNewPlanId] = useState('plan_academia');
  const [modalLoading, setModalLoading] = useState(false);

  const filteredStudents = students.filter(s => {
    const matchesSearch = !search ||
      s.nome.toLowerCase().includes(search.toLowerCase()) ||
      (s.telefone && s.telefone.includes(search)) ||
      s.email.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'pagos') return s.isPaidThisMonth;
    if (filter === 'pendentes') return !s.isPaidThisMonth;
    if (filter === 'faltas') return s.faltasCount > 0;
    return true;
  });

  const handleAddFalta = async (studentId, studentName) => {
    await addFalta(studentId);
    Alert.alert('Falta Registrada', `1 falta adicionada para ${studentName}.`);
  };

  const handleRemoveFalta = async (studentId, studentName) => {
    await removeFalta(studentId);
    Alert.alert('Falta Estornada', `1 falta removida de ${studentName}.`);
  };

  const handleMarkPaid = async (faturaId, studentName) => {
    if (!faturaId) {
      Alert.alert('Aviso', 'Nenhuma fatura pendente localizada.');
      return;
    }
    await markPaymentPaid(faturaId);
    Alert.alert('Pagamento Baixado', `Mensalidade de ${studentName} foi dada como PAGA.`);
  };

  const handleCreateStudent = async () => {
    if (!newName.trim() || !newEmail.trim()) {
      Alert.alert('Erro', 'Preencha Nome Completo e E-mail.');
      return;
    }

    try {
      setModalLoading(true);
      const res = await dataService.registerStudent({
        nome: newName,
        email: newEmail,
        senha: newPass || '123456',
        telefone: newPhone,
        peso: Number(newWeight) || 75,
        altura: Number(newHeight) || 175,
        planoId: newPlanId,
        objetivoPrincipal: 'Treino no CT Jefferson Calisto'
      });

      if (res.success) {
        await refreshStudents();
        setNewStudentModalVisible(false);
        setNewName('');
        setNewEmail('');
        Alert.alert('Sucesso', `${newName} foi cadastrado(a) com sucesso!`);
      } else {
        Alert.alert('Falha', res.message);
      }
    } catch (e) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o aluno.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleWhatsApp = (phone, name, planVal) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const text = `Olá ${name}! Passando para falar sobre seus treinos e mensalidade (R$ ${planVal || 120},00) no CT Jefferson Calisto.`;
    Linking.openURL(`https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(text)}`);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Gestão de Alunos"
        subtitle="MEDIDAS, PAGAMENTOS & FALTAS"
        showBack
        navigation={navigation}
        rightAction={
          <TouchableOpacity
            style={styles.addStudentHeaderBtn}
            onPress={() => setNewStudentModalVisible(true)}
          >
            <Ionicons name="person-add" size={18} color="#000" />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchBarContainer}>
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nome, telefone ou e-mail..."
          leftIcon={<Ionicons name="search" size={18} color={colors.textSecondary} />}
          style={{ marginBottom: 10 }}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Todos ({students.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'pagos' && styles.filterChipActive]}
            onPress={() => setFilter('pagos')}
          >
            <Text style={[styles.filterText, filter === 'pagos' && styles.filterTextActive]}>✓ Pagos no Mês</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'pendentes' && styles.filterChipActive]}
            onPress={() => setFilter('pendentes')}
          >
            <Text style={[styles.filterText, filter === 'pendentes' && styles.filterTextActive]}>● Pendentes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'faltas' && styles.filterChipActive]}
            onPress={() => setFilter('faltas')}
          >
            <Text style={[styles.filterText, filter === 'faltas' && styles.filterTextActive]}>Com Faltas</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filteredStudents.map(st => (
          <Card key={st.id} style={styles.studentCard}>
            <View style={styles.cardTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{st.nome}</Text>
                <Text style={styles.studentPhone}>{st.telefone || st.email}</Text>
              </View>

              {st.telefone && (
                <TouchableOpacity
                  style={styles.waBtn}
                  onPress={() => handleWhatsApp(st.telefone, st.nome, st.planoValor)}
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#000" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.metricsBadgeRow}>
              <View style={styles.metricBadge}>
                <Ionicons name="speedometer-outline" size={14} color={colors.primary} />
                <Text style={styles.metricBadgeText}>{st.currentWeight || st.peso || 75} kg</Text>
              </View>

              <View style={styles.metricBadge}>
                <Ionicons name="resize-outline" size={14} color={colors.secondary} />
                <Text style={styles.metricBadgeText}>{st.heightCm || st.altura || 175} cm</Text>
              </View>

              <Badge
                label={st.plano_id === 'plan_academia_jiujitsu' ? 'Jiu-Jítsu (R$ 150)' : 'Musculação (R$ 120)'}
                variant={st.plano_id === 'plan_academia_jiujitsu' ? 'danger' : 'cyan'}
              />
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.actionSectionRow}>
              <View>
                <Text style={styles.subLabel}>MENSALIDADE DO MÊS</Text>
                <Badge
                  label={st.isPaidThisMonth ? '✓ PAGO NO MÊS' : '● PENDENTE'}
                  variant={st.isPaidThisMonth ? 'success' : 'danger'}
                  style={{ marginTop: 4 }}
                />
              </View>

              {!st.isPaidThisMonth && (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => handleMarkPaid(st.pendingFaturaId, st.nome)}
                  style={styles.darBaixaBtn}
                >
                  <Ionicons name="checkmark-done" size={14} color="#000" />
                  <Text style={styles.darBaixaText}>Dar Baixa</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.actionSectionRow}>
              <View>
                <Text style={styles.subLabel}>FALTAS NO MÊS</Text>
                <Text style={[styles.faltasCountText, { color: st.faltasCount > 0 ? colors.danger : colors.primary }]}>
                  {st.faltasCount} {st.faltasCount === 1 ? 'Falta' : 'Faltas'} registradas
                </Text>
              </View>

              <View style={styles.faltasButtonsRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleAddFalta(st.id, st.nome)}
                  style={styles.addFaltaBtn}
                >
                  <Ionicons name="add" size={14} color="#FFF" />
                  <Text style={styles.addFaltaText}>Falta</Text>
                </TouchableOpacity>

                {st.faltasCount > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleRemoveFalta(st.id, st.nome)}
                    style={styles.removeFaltaBtn}
                  >
                    <Ionicons name="remove" size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>
        ))}

        {filteredStudents.length === 0 && (
          <View style={styles.emptyView}>
            <Ionicons name="people-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhum aluno encontrado</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={newStudentModalVisible} transparent animationType="slide" onRequestClose={() => setNewStudentModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBody}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cadastrar Novo Aluno</Text>
              <TouchableOpacity onPress={() => setNewStudentModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input label="Nome Completo" value={newName} onChangeText={setNewName} placeholder="Ex: Lucas Silva" />
              <Input label="E-mail" value={newEmail} onChangeText={setNewEmail} placeholder="lucas@email.com" keyboardType="email-address" />
              <Input label="WhatsApp / Telefone" value={newPhone} onChangeText={setNewPhone} placeholder="(11) 99999-9999" keyboardType="phone-pad" />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Input label="Peso (kg)" value={newWeight} onChangeText={setNewWeight} placeholder="75.0" keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Altura (cm)" value={newHeight} onChangeText={setNewHeight} placeholder="175" keyboardType="numeric" />
                </View>
              </View>

              <Text style={styles.modalPlanLabel}>Selecione o Plano</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                <TouchableOpacity
                  style={[styles.modalPlanBtn, newPlanId === 'plan_academia' && styles.modalPlanBtnActive]}
                  onPress={() => setNewPlanId('plan_academia')}
                >
                  <Text style={[styles.modalPlanBtnText, newPlanId === 'plan_academia' && { color: '#000' }]}>Academia R$ 120</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalPlanBtn, newPlanId === 'plan_academia_jiujitsu' && styles.modalPlanBtnActive]}
                  onPress={() => setNewPlanId('plan_academia_jiujitsu')}
                >
                  <Text style={[styles.modalPlanBtnText, newPlanId === 'plan_academia_jiujitsu' && { color: '#000' }]}>+ Jiu-Jítsu R$ 150</Text>
                </TouchableOpacity>
              </View>

              <Button title="Salvar e Cadastrar Aluno" onPress={handleCreateStudent} loading={modalLoading} variant="primary" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  addStudentHeaderBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchBarContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  filterScroll: {
    gap: 8
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700'
  },
  filterTextActive: {
    color: '#000',
    fontWeight: '800'
  },
  content: {
    padding: 16,
    paddingBottom: 40
  },
  studentCard: {
    marginBottom: 12
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  studentName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800'
  },
  studentPhone: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  waBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.whatsapp,
    alignItems: 'center',
    justifyContent: 'center'
  },
  metricsBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border
  },
  metricBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700'
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10
  },
  actionSectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  subLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  darBaixaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  darBaixaText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800'
  },
  faltasCountText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2
  },
  faltasButtonsRow: {
    flexDirection: 'row',
    gap: 6
  },
  addFaltaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 71, 87, 0.2)',
    borderWidth: 1,
    borderColor: colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  addFaltaText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800'
  },
  removeFaltaBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6
  },
  emptyView: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 10
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end'
  },
  modalBody: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderEmerald,
    padding: 20,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800'
  },
  modalPlanLabel: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8
  },
  modalPlanBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center'
  },
  modalPlanBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  modalPlanBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800'
  }
});
