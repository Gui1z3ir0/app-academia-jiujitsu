import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { useGymData } from '../../context/GymDataContext';
import { dataService } from '../../services/dataService';
import { exerciseCatalog } from '../../data/exercises';

export default function WorkoutBuilderScreen({ navigation }) {
  const { students } = useGymData();

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || 'aluno_1');
  const [selectedDay, setSelectedDay] = useState('Segunda');
  const [workout, setWorkout] = useState({ title: '', exercises: [] });

  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState('4');
  const [newExReps, setNewExReps] = useState('10-12');
  const [newExLoad, setNewExLoad] = useState('20');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students]);

  useEffect(() => {
    loadWorkout();
  }, [selectedStudentId, selectedDay]);

  const loadWorkout = async () => {
    const w = await dataService.getWorkoutForStudent(selectedStudentId, selectedDay);
    setWorkout(w);
  };

  const handleAddExercise = async () => {
    if (!newExName.trim()) {
      Alert.alert('Erro', 'Informe o nome do exercício.');
      return;
    }

    const state = await dataService.getState();
    if (!state.workouts[selectedStudentId]) {
      state.workouts[selectedStudentId] = {};
    }
    if (!state.workouts[selectedStudentId][selectedDay]) {
      state.workouts[selectedStudentId][selectedDay] = { title: `Treino de ${selectedDay}`, exercises: [] };
    }

    state.workouts[selectedStudentId][selectedDay].exercises.push({
      id: 'ex_' + Date.now(),
      name: newExName,
      sets: Number(newExSets) || 4,
      reps: newExReps || '10-12',
      loadKg: Number(newExLoad) || 20,
      restSeconds: 60,
      done: false
    });

    await dataService.saveState(state);
    setNewExName('');
    setShowAddForm(false);
    await loadWorkout();
    Alert.alert('Sucesso', 'Exercício adicionado à ficha do aluno!');
  };

  const handleRemoveExercise = async (exId) => {
    const state = await dataService.getState();
    if (state.workouts[selectedStudentId] && state.workouts[selectedStudentId][selectedDay]) {
      state.workouts[selectedStudentId][selectedDay].exercises =
        state.workouts[selectedStudentId][selectedDay].exercises.filter(e => e.id !== exId);
      await dataService.saveState(state);
      await loadWorkout();
    }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <View style={styles.container}>
      <Header title="Montador de Treinos" subtitle="PRESCRIÇÃO PERSONALIZADA" showBack navigation={navigation} />

      <View style={styles.studentSelectorSection}>
        <Text style={styles.selectorLabel}>SELECIONE O ALUNO:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.studentScroll}>
          {students.map(s => {
            const isSelected = selectedStudentId === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.studentChip, isSelected && styles.studentChipActive]}
                onPress={() => setSelectedStudentId(s.id)}
              >
                <Text style={[styles.studentChipText, isSelected && { color: '#000', fontWeight: '800' }]}>{s.nome}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.daySelectorSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
          {days.map(d => {
            const isSelected = selectedDay === d;
            return (
              <TouchableOpacity
                key={d}
                style={[styles.dayTab, isSelected && styles.dayTabActive]}
                onPress={() => setSelectedDay(d)}
              >
                <Text style={[styles.dayTabText, isSelected && { color: '#000', fontWeight: '800' }]}>{d}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerInfoRow}>
          <View>
            <Text style={styles.sheetTitle}>{selectedStudent?.nome || 'Aluno'}</Text>
            <Text style={styles.sheetSubtitle}>{workout.title || `Ficha de ${selectedDay}`}</Text>
          </View>

          <TouchableOpacity
            style={styles.addExToggleBtn}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Ionicons name={showAddForm ? 'close' : 'add'} size={18} color="#000" />
            <Text style={styles.addExToggleText}>{showAddForm ? 'Cancelar' : 'Adicionar'}</Text>
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <Card variant="emerald" style={styles.addFormCard}>
            <Text style={styles.addFormTitle}>Novo Exercício para {selectedDay}</Text>
            <Input label="Nome do Exercício" value={newExName} onChangeText={setNewExName} placeholder="Ex: Supino Reto com Barra" />

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Input label="Séries" value={newExSets} onChangeText={setNewExSets} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Reps" value={newExReps} onChangeText={setNewExReps} placeholder="10-12" />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Carga (kg)" value={newExLoad} onChangeText={setNewExLoad} keyboardType="numeric" />
              </View>
            </View>

            <Button title="Salvar Exercício na Ficha" onPress={handleAddExercise} variant="primary" style={{ marginTop: 8 }} />
          </Card>
        )}

        {workout.exercises.map((ex, idx) => (
          <Card key={ex.id || idx} style={styles.exCard}>
            <View style={styles.exCardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.exTitle}>{idx + 1}. {ex.name}</Text>
                <Text style={styles.exMeta}>{ex.sets} séries × {ex.reps} reps • {ex.loadKg} kg</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleRemoveExercise(ex.id)}
                style={styles.deleteExBtn}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        {workout.exercises.length === 0 && !showAddForm && (
          <View style={styles.emptyView}>
            <Ionicons name="barbell-outline" size={42} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhum exercício montado para {selectedDay}</Text>
            <Text style={styles.emptySubtitle}>Clique no botão "+ Adicionar" acima para prescrever os exercícios.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  studentSelectorSection: { backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  selectorLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 6 },
  studentScroll: { gap: 8, paddingBottom: 8 },
  studentChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  studentChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  studentChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  daySelectorSection: { backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  dayScroll: { gap: 6 },
  dayTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  dayTabActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  dayTabText: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  headerInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sheetTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  sheetSubtitle: { color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: 2 },
  addExToggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addExToggleText: { color: '#000', fontSize: 12, fontWeight: '800' },
  addFormCard: { marginBottom: 16 },
  addFormTitle: { color: '#FFF', fontSize: 14, fontWeight: '800', marginBottom: 10 },
  exCard: { marginBottom: 10 },
  exCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exTitle: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  exMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  deleteExBtn: { padding: 6 },
  emptyView: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { color: '#FFF', fontSize: 15, fontWeight: '800', marginTop: 10 },
  emptySubtitle: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 4 }
});
