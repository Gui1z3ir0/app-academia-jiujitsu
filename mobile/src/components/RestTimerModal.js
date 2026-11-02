import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import Button from './Button';

export default function RestTimerModal({ visible, seconds = 60, onClose }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (visible) {
      setTimeLeft(seconds);
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [visible, seconds]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="timer-outline" size={22} color={colors.primary} />
              <Text style={styles.title}>Descanso entre Séries</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.timerLabel}>
              {timeLeft === 0 ? 'Fim do Descanso! 🔥' : 'Respire e hidrate-se'}
            </Text>
          </View>

          <View style={styles.actions}>
            <Button
              title={isActive ? 'Pausar' : 'Continuar'}
              onPress={() => setIsActive(!isActive)}
              variant={isActive ? 'secondary' : 'primary'}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="+30s"
              onPress={() => setTimeLeft(prev => prev + 30)}
              variant="outline"
              style={{ width: 80, marginRight: 8 }}
            />
            <Button
              title="Fechar"
              onPress={onClose}
              variant="secondary"
              style={{ width: 80 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderEmerald,
    padding: 20,
    alignItems: 'center'
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800'
  },
  closeBtn: {
    padding: 4
  },
  timerCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 4,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  timerText: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 2
  },
  timerLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4
  },
  actions: {
    flexDirection: 'row',
    width: '100%'
  }
});
