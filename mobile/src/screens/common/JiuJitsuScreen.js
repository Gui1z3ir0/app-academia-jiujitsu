import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Input from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { useGymData } from '../../context/GymDataContext';
import { dataService } from '../../services/dataService';
import { pushNotificationService } from '../../services/pushNotificationService';

const BELTS = ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'];
const BELT_COLORS = {
  Branca: '#F8FAFC',
  Azul: '#2563EB',
  Roxa: '#7C3AED',
  Marrom: '#78350F',
  Preta: '#0F172A'
};

export default function JiuJitsuScreen() {
  const { currentUser, currentRole } = useAuth();
  const { students, refreshStudents } = useGymData();
  const isPersonal = currentRole === 'admin' || currentRole === 'personal';

  const [turmas, setTurmas] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || currentUser?.id);
  const [selectedTurmaId, setSelectedTurmaId] = useState('');
  const [newTurmaNome, setNewTurmaNome] = useState('');
  const [newTurmaDias, setNewTurmaDias] = useState('');
  const [newTurmaHorario, setNewTurmaHorario] = useState('');

  useEffect(() => {
    loadJiuJitsuData();
  }, [currentUser, selectedStudentId]);

  const loadJiuJitsuData = async () => {
    const tList = await dataService.getTurmasJiuJitsu();
    setTurmas(tList);
    if (!selectedTurmaId && tList[0]?.id) {
      setSelectedTurmaId(tList[0].id);
    }
    const targetId = isPersonal ? selectedStudentId : currentUser?.id;
    const pList = await dataService.getPresencasJiuJitsu(targetId);
    setPresencas(pList);
  };

  const handleCheckIn = async () => {
    if (!selectedStudentId || !selectedTurmaId) {
      Alert.alert('Atenção', 'Selecione o aluno e a turma para registrar presença.');
      return;
    }
    await dataService.registrarPresencaJiuJitsu({
      usuario_id: selectedStudentId,
      turma_id: selectedTurmaId
    });
    await refreshStudents();
    await loadJiuJitsuData();
    const st = students.find(s => s.id === selectedStudentId);
    await pushNotificationService.notifyStudent({
      studentId: selectedStudentId,
      title: '🥋 Presença Confirmada no Tatame!',
      message: `${st?.nome || 'Aluno'}, sua presença na aula de Jiu-Jítsu foi registrada pelo Personal.`,
      type: 'jiujitsu'
    });
    Alert.alert('Presença Confirmada', 'Presença registrada no tatame com sucesso!');
  };

  const handleUpdateBelt = async (studentId, belt, stripes) => {
    await dataService.atualizarGraduacaoJiuJitsu(studentId, belt, stripes);
    await refreshStudents();
    await pushNotificationService.notifyStudent({
      studentId,
      title: '🥋 Graduação de Jiu-Jítsu Atualizada!',
      message: `Parabéns! Sua graduação foi atualizada para Faixa ${belt} (${stripes}º Grau).`,
      type: 'jiujitsu'
    });
    Alert.alert('Graduação Salva', `Faixa ${belt} (${stripes}º Grau) atualizada.`);
  };

  const handleAddTurma = async () => {
    if (!newTurmaNome.trim() || !newTurmaDias.trim() || !newTurmaHorario.trim()) {
      Alert.alert('Campos Obrigatórios', 'Preencha nome, dias da semana e horário da turma.');
      return;
    }
    await dataService.addTurmaJiuJitsu({
      nome: newTurmaNome,
      dias: newTurmaDias,
      horario: newTurmaHorario
    });
    setNewTurmaNome('');
    setNewTurmaDias('');
    setNewTurmaHorario('');
    await loadJiuJitsuData();
    Alert.alert('Turma Criada', 'Novo horário de Jiu-Jítsu adicionado.');
  };

  const activeStudent = isPersonal
    ? students.find(s => s.id === selectedStudentId) || students[0]
    : students.find(s => s.id === currentUser?.id) || currentUser;

  const currentBelt = activeStudent?.faixaJiuJitsu || 'Branca';
  const currentStripes = Number(activeStudent?.grausJiuJitsu || 0);
  const beltColor = BELT_COLORS[currentBelt] || '#F8FAFC';

  return (
    <View style={styles.container}>
      <Header
        title="Jiu-Jítsu & Graduação"
        subtitle={isPersonal ? 'CONTROLE DE FAIXAS, TURMAS E CHAMADA' : 'SUA FAIXA, GRAUS E PRESENÇAS'}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isPersonal && students.length > 0 && (
          <View style={{ marginBottom: 14 }}>
            <Text style={styles.sectionTitle}>SELECIONE O ALUNO NO TATAME:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {students.map(st => {
                const active = st.id === selectedStudentId;
                return (
                  <TouchableOpacity
                    key={st.id}
                    onPress={() => setSelectedStudentId(st.id)}
                    style={[styles.studentChip, active && styles.studentChipActive]}
                  >
                    <Text style={[styles.studentChipText, active && { color: '#000', fontWeight: '800' }]}>
                      {st.nome} ({st.faixaJiuJitsu || 'Branca'})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <Card variant="emerald" style={styles.beltCard}>
          <View style={styles.beltRow}>
            <View>
              <Text style={styles.beltLabel}>GRADUAÇÃO ATUAL ({activeStudent?.nome || 'Aluno'})</Text>
              <Text style={styles.beltTitle}>🥋 Faixa {currentBelt} • {currentStripes}º Grau</Text>
              <Text style={styles.beltSub}>{presencas.length} presenças confirmadas no tatame</Text>
            </View>
            <Badge label={`${presencas.length % 30}/30 p/ próx. grau`} variant="success" />
          </View>

          <View style={[styles.beltVisual, { backgroundColor: beltColor }]}>
            <View style={styles.beltBlackTip}>
              {[0, 1, 2, 3].map(idx => (
                <View
                  key={idx}
                  style={[
                    styles.stripeBar,
                    { backgroundColor: idx < currentStripes ? '#FFFFFF' : 'rgba(255,255,255,0.2)' }
                  ]}
                />
              ))}
            </View>
          </View>

          {isPersonal && activeStudent && (
            <View style={{ marginTop: 14 }}>
              <Text style={styles.sectionTitle}>ATUALIZAR FAIXA E GRAUS DO ALUNO:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {BELTS.map(b => (
                  <TouchableOpacity
                    key={b}
                    onPress={() => handleUpdateBelt(activeStudent.id, b, currentStripes)}
                    style={[styles.smallBtn, currentBelt === b && styles.smallBtnActive]}
                  >
                    <Text style={[styles.smallBtnText, currentBelt === b && { color: '#000' }]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[0, 1, 2, 3, 4].map(g => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => handleUpdateBelt(activeStudent.id, currentBelt, g)}
                    style={[styles.smallBtn, currentStripes === g && styles.smallBtnActive]}
                  >
                    <Text style={[styles.smallBtnText, currentStripes === g && { color: '#000' }]}>{g}º Grau</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </Card>

        {isPersonal && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>CHAMADA / PRESENÇA NA TURMA</Text>
            <View style={{ gap: 8, marginBottom: 12 }}>
              {turmas.map(t => {
                const selected = selectedTurmaId === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setSelectedTurmaId(t.id)}
                    style={[styles.turmaSelectRow, selected && styles.turmaSelectRowActive]}
                  >
                    <Ionicons
                      name={selected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={selected ? colors.primary : colors.textSecondary}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>{t.nome}</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{t.dias} • {t.horario}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Button
              title={`Confirmar Presença de ${activeStudent?.nome || 'Aluno'}`}
              onPress={handleCheckIn}
              variant="primary"
            />
          </Card>
        )}

        <Text style={styles.sectionTitle}>QUADRO DE HORÁRIOS DAS TURMAS DE JIU-JÍTSU</Text>
        {turmas.map(t => (
          <Card key={t.id} style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>{t.nome}</Text>
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12, marginTop: 2 }}>
                  📅 {t.dias} • ⏰ {t.horario}
                </Text>
              </View>
              <Badge label={t.faixa || 'Todas'} variant="cyan" />
            </View>
          </Card>
        ))}

        {isPersonal && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>CADASTRAR NOVA TURMA DE JIU-JÍTSU</Text>
            <Input label="Nome da Turma" value={newTurmaNome} onChangeText={setNewTurmaNome} placeholder="Ex: Jiu-Jítsu No-Gi Competição" />
            <Input label="Dias da Semana" value={newTurmaDias} onChangeText={setNewTurmaDias} placeholder="Ex: Terça e Quinta" />
            <Input label="Horário" value={newTurmaHorario} onChangeText={setNewTurmaHorario} placeholder="Ex: 20:00 - 21:30" />
            <Button title="Adicionar Turma" onPress={handleAddTurma} variant="secondary" />
          </Card>
        )}

        <Text style={styles.sectionTitle}>HISTÓRICO DE PRESENÇAS NO TATAME</Text>
        {presencas.length === 0 ? (
          <Card style={styles.card}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center' }}>
              Nenhuma presença registrada ainda.
            </Text>
          </Card>
        ) : (
          presencas.slice(0, 12).map(p => (
            <Card key={p.id} style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>{p.turma_nome}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Data: {p.data}</Text>
                </View>
                <Badge label="✓ Presente" variant="success" />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 8, marginTop: 6 },
  studentChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  studentChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  studentChipText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  beltCard: { marginBottom: 14 },
  beltRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  beltLabel: { color: colors.primary, fontSize: 10, fontWeight: '800' },
  beltTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', marginTop: 2 },
  beltSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  beltVisual: { height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  beltBlackTip: { width: 84, height: '100%', backgroundColor: '#111827', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: 6 },
  stripeBar: { width: 7, height: '80%', borderRadius: 2 },
  smallBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  smallBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  smallBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  card: { marginBottom: 12 },
  turmaSelectRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  turmaSelectRowActive: { borderColor: colors.primary, backgroundColor: 'rgba(0,245,155,0.08)' }
});
