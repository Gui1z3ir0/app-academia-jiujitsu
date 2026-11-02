import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import RestTimerModal from '../../components/RestTimerModal';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';

export default function WorkoutScreen({ navigation }) {
  const { currentUser } = useAuth();

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const [selectedDay, setSelectedDay] = useState('Segunda');
  const [workout, setWorkout] = useState({ title: '', exercises: [] });
  const [customLoads, setCustomLoads] = useState({});
  const [timerVisible, setTimerVisible] = useState(false);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(60);

  useEffect(() => {
    loadWorkout();
  }, [selectedDay]);

  const loadWorkout = async () => {
    const data = await dataService.getWorkoutForStudent(currentUser?.id, selectedDay);
    setWorkout(data);
    const initialInputs = {};
    (data.exercises || []).forEach(ex => {
      initialInputs[ex.id] = String(ex.loadKg ?? 0);
    });
    setCustomLoads(initialInputs);
  };

  const handleToggleExercise = async (exId) => {
    await dataService.toggleExerciseDone(currentUser?.id, selectedDay, exId);
    await loadWorkout();
  };

  const handleAdjustLoad = async (exId, delta) => {
    const ex = workout.exercises.find(e => e.id === exId);
    if (!ex) return;
    const newLoad = Math.max(0, Number((Number(ex.loadKg || 0) + delta).toFixed(1)));
    await dataService.updateExerciseLoad(currentUser?.id, selectedDay, exId, newLoad);
    await loadWorkout();
  };

  const handleSaveCustomLoad = async (exId) => {
    const rawVal = customLoads[exId];
    const parsed = Number(String(rawVal || '').replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed < 0) {
      Alert.alert('Peso inválido', 'Digite um valor numérico válido em kg (ex: 25 ou 32.5).');
      return;
    }
    await dataService.updateExerciseLoad(currentUser?.id, selectedDay, exId, parsed);
    await loadWorkout();
    Alert.alert('Peso Registrado! 💪', `Carga atualizada para ${parsed} kg com sucesso.`);
  };

  const openTimer = (seconds) => {
    setActiveTimerSeconds(seconds || 60);
    setTimerVisible(true);
  };

  const completedCount = workout.exercises.filter(e => e.done).length;
  const totalExercises = workout.exercises.length;
  const progressPercent = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  return (
    <View style={styles.container}>
      <Header
        title="Ficha de Treino"
        subtitle={workout.title || `Treino de ${selectedDay}`}
      />

      <View style={styles.daySelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
          {days.map(d => {
            const isSelected = selectedDay === d;
            return (
              <TouchableOpacity
                key={d}
                activeOpacity={0.75}
                onPress={() => setSelectedDay(d)}
                style={[styles.dayTab, isSelected && styles.dayTabActive]}
              >
                <Text style={[styles.dayTabText, isSelected && styles.dayTabTextActive]}>{d}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.progressCard}>
          <View style={styles.progressRow}>
            <View>
              <Text style={styles.progressTitle}>Progresso de {selectedDay}</Text>
              <Text style={styles.progressSub}>{completedCount} de {totalExercises} exercícios concluídos</Text>
            </View>
            <Badge
              label={`${progressPercent}%`}
              variant={progressPercent === 100 ? 'success' : 'cyan'}
            />
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </Card>

        {workout.exercises.map((ex, index) => (
          <Card
            key={ex.id || index}
            style={[styles.exerciseCard, ex.done && styles.exerciseCardDone]}
          >
            <View style={styles.exerciseTopRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleToggleExercise(ex.id)}
                style={[styles.checkCircle, ex.done && styles.checkCircleActive]}
              >
                {ex.done && <Ionicons name="checkmark" size={16} color="#000" />}
              </TouchableOpacity>

              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={[styles.exerciseName, ex.done && styles.exerciseNameDone]}>
                  {index + 1}. {ex.name}
                </Text>
                <Text style={styles.exerciseMeta}>
                  {ex.sets} séries × {ex.reps} repetições
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => openTimer(ex.restSeconds)}
                style={styles.timerBtn}
              >
                <Ionicons name="timer-outline" size={16} color={colors.primary} />
                <Text style={styles.timerBtnText}>{ex.restSeconds || 60}s</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.loadControlsRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={styles.loadLabel}>Carga Atual:</Text>
                <Text style={styles.loadValue}>{ex.loadKg} kg</Text>
                {ex.recordeKg ? (
                  <View style={styles.prBadge}>
                    <Text style={styles.prBadgeText}>🏆 Recorde: {ex.recordeKg} kg</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.loadButtons}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleAdjustLoad(ex.id, -2)}
                  style={styles.loadAdjustBtn}
                >
                  <Text style={styles.loadAdjustText}>-2kg</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleAdjustLoad(ex.id, 2)}
                  style={styles.loadAdjustBtn}
                >
                  <Text style={styles.loadAdjustText}>+2kg</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.customLoadRow}>
              <Text style={styles.customLoadLabel}>Peso que peguei no treino (kg):</Text>
              <View style={styles.customLoadInputGroup}>
                <TextInput
                  style={styles.customLoadInput}
                  keyboardType="numeric"
                  placeholder="Ex: 30"
                  placeholderTextColor={colors.textMuted}
                  value={customLoads[ex.id] !== undefined ? String(customLoads[ex.id]) : String(ex.loadKg || 0)}
                  onChangeText={(val) => setCustomLoads(prev => ({ ...prev, [ex.id]: val }))}
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleSaveCustomLoad(ex.id)}
                  style={styles.saveLoadBtn}
                >
                  <Ionicons name="barbell-outline" size={14} color="#000" />
                  <Text style={styles.saveLoadBtnText}>Salvar Peso</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))}

        {workout.exercises.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Dia de Descanso Ativo</Text>
            <Text style={styles.emptyText}>Nenhum exercício programado para {selectedDay}. Aproveite para recuperar a musculatura!</Text>
          </View>
        )}
      </ScrollView>

      <RestTimerModal
        visible={timerVisible}
        seconds={activeTimerSeconds}
        onClose={() => setTimerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  daySelectorContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  dayScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8
  },
  dayTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border
  },
  dayTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  dayTabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700'
  },
  dayTabTextActive: {
    color: '#000',
    fontWeight: '800'
  },
  content: {
    padding: 16,
    paddingBottom: 40
  },
  progressCard: {
    marginBottom: 14
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  progressTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800'
  },
  progressSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3
  },
  exerciseCard: {
    marginBottom: 10
  },
  exerciseCardDone: {
    opacity: 0.65,
    borderColor: 'rgba(0, 245, 155, 0.4)'
  },
  exerciseTopRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  exerciseName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800'
  },
  exerciseNameDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary
  },
  exerciseMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 245, 155, 0.1)',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  timerBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800'
  },
  loadControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  loadLabel: {
    color: colors.textSecondary,
    fontSize: 12
  },
  loadValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800'
  },
  loadButtons: {
    flexDirection: 'row',
    gap: 8
  },
  loadAdjustBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6
  },
  loadAdjustText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700'
  },
  prBadge: {
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  prBadgeText: {
    color: '#FFB800',
    fontSize: 10,
    fontWeight: '800'
  },
  customLoadRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8
  },
  customLoadLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700'
  },
  customLoadInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  customLoadInput: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    paddingVertical: 5,
    paddingHorizontal: 10,
    minWidth: 70,
    textAlign: 'center'
  },
  saveLoadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  saveLoadBtnText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30
  }
});
