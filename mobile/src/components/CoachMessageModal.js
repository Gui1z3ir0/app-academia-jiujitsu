import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Linking, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import Input from './Input';
import Button from './Button';
import PriorityChip from './PriorityChip';
import { useAuth } from '../context/AuthContext';
import { useGymData } from '../context/GymDataContext';

export default function CoachMessageModal({ visible, onClose }) {
  const { currentUser } = useAuth();
  const { sendCoachMessage, gymConfig } = useGymData();

  const [prioridade, setPrioridade] = useState('media');
  const [assunto, setAssunto] = useState('Dúvida em Exercício');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!mensagem.trim()) {
      Alert.alert('Atenção', 'Por favor, escreva a sua dúvida ou mensagem para o Personal.');
      return;
    }

    try {
      setLoading(true);
      await sendCoachMessage({
        usuario_id: currentUser?.id,
        nomeAluno: currentUser?.nome,
        telefone: currentUser?.telefone,
        assunto,
        prioridade,
        mensagem
      });

      Alert.alert(
        'Mensagem Enviada!',
        'O Treinador Jefferson Calisto recebeu sua dúvida com a prioridade selecionada.',
        [{ text: 'OK', onPress: () => { setMensagem(''); onClose(); } }]
      );
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível enviar a mensagem.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const phone = gymConfig?.whatsapp || '11988887777';
    const cleanPhone = phone.replace(/\D/g, '');
    const text = `Olá Treinador Jefferson! Sou seu aluno ${currentUser?.nome || 'Aluno'} do CT Jefferson Calisto e gostaria de tirar uma dúvida sobre meu treino.`;
    Linking.openURL(`https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(text)}`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconBadge}>
                <Ionicons name="flash" size={18} color="#000" />
              </View>
              <View>
                <Text style={styles.title}>Canal com o Personal Jefferson</Text>
                <Text style={styles.subtitle}>ATENDIMENTO & SUPORTE PRIORITÁRIO</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.description}>
              Como o proprietário é também o seu Personal Trainer, envie sua dúvida com a prioridade correta para atendimento no painel.
            </Text>

            <Text style={styles.sectionLabel}>Nível de Prioridade da Dúvida</Text>
            <PriorityChip selected={prioridade} onSelect={setPrioridade} />

            <Input
              label="Assunto Principal"
              value={assunto}
              onChangeText={setAssunto}
              placeholder="Ex: Dúvida em Exercício, Dor, Cargas..."
            />

            <Input
              label="Sua Mensagem para o Treinador"
              value={mensagem}
              onChangeText={setMensagem}
              placeholder="Descreva aqui sua dúvida com clareza para o Personal Jefferson..."
              multiline
              numberOfLines={4}
            />

            <Button
              title="Enviar com Prioridade ao Personal"
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              style={{ marginTop: 8 }}
            />

            <Button
              title="Conversar Direto no WhatsApp"
              onPress={handleOpenWhatsApp}
              variant="whatsapp"
              icon={<Ionicons name="logo-whatsapp" size={18} color="#000" />}
              style={{ marginTop: 10 }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderEmerald,
    padding: 20,
    maxHeight: '90%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800'
  },
  subtitle: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  closeBtn: {
    padding: 4
  },
  description: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14
  },
  sectionLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6
  }
});
