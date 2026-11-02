import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { useGymData } from '../../context/GymDataContext';
import { dataService } from '../../services/dataService';
import { apiAdapter } from '../../services/apiAdapter';
import { pushNotificationService } from '../../services/pushNotificationService';

export default function ChatScreen() {
  const { currentUser, currentRole } = useAuth();
  const { students } = useGymData();
  const isPersonal = currentRole === 'admin' || currentRole === 'personal';

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || currentUser?.id);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const targetStudentId = isPersonal ? (selectedStudentId || students[0]?.id) : currentUser?.id;

  useEffect(() => {
    loadMessages();
    const unsubscribe = apiAdapter.subscribeToRealtime(() => {
      loadMessages();
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [targetStudentId]);

  const loadMessages = async () => {
    if (!targetStudentId) return;
    const list = await dataService.getChatMessages(targetStudentId);
    setMessages(list);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !targetStudentId) return;
    const text = inputText.trim();
    setInputText('');

    await dataService.sendChatMessage({
      studentId: targetStudentId,
      senderRole: isPersonal ? 'personal' : 'aluno',
      senderName: currentUser?.nome || (isPersonal ? 'Personal' : 'Aluno'),
      text
    });

    await loadMessages();

    if (isPersonal) {
      await pushNotificationService.notifyStudent({
        studentId: targetStudentId,
        title: '💬 Nova mensagem do Personal',
        message: text,
        type: 'chat'
      });
    } else {
      await pushNotificationService.notifyPersonalNewMessage({
        studentName: currentUser?.nome || 'Aluno',
        text
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="Chat Interno (Realtime)"
        subtitle={isPersonal ? 'CONVERSA DIRETA COM OS ALUNOS' : 'FALE DIRETO COM O PERSONAL NO APP'}
      />

      {isPersonal && students.length > 0 && (
        <View style={styles.selectorBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {students.map(st => {
              const active = st.id === targetStudentId;
              return (
                <TouchableOpacity
                  key={st.id}
                  onPress={() => setSelectedStudentId(st.id)}
                  style={[styles.studentChip, active && styles.studentChipActive]}
                >
                  <Text style={[styles.studentChipText, active && { color: '#000', fontWeight: '800' }]}>
                    {st.nome}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubbles-outline" size={42} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhuma mensagem ainda</Text>
            <Text style={styles.emptySub}>
              As mensagens enviadas aqui sincronizam em tempo real (Supabase Realtime) e disparam Push via Expo Notifications.
            </Text>
          </View>
        ) : (
          messages.map(m => {
            const isMine = (isPersonal && m.senderRole === 'personal') || (!isPersonal && m.senderRole === 'aluno');
            return (
              <View
                key={m.id}
                style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}
              >
                <Text style={[styles.senderLabel, isMine && { color: '#06090F' }]}>
                  {m.senderRole === 'personal' ? '🏋️ Personal' : `👤 ${m.senderName}`}
                </Text>
                <Text style={[styles.msgText, isMine && { color: '#06090F', fontWeight: '600' }]}>
                  {m.text}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite sua mensagem no chat..."
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
          <Ionicons name="send" size={18} color="#06090F" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  selectorBar: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  studentChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  studentChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  studentChipText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  messagesContainer: { padding: 16, gap: 10, flexGrow: 1 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { color: '#FFF', fontSize: 15, fontWeight: '800', marginTop: 10 },
  emptySub: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
  bubble: { maxWidth: '82%', padding: 12, borderRadius: 14 },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  senderLabel: { fontSize: 10, fontWeight: '800', color: colors.primary, marginBottom: 3 },
  msgText: { fontSize: 13, color: '#FFF', lineHeight: 18 },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 },
  textInput: { flex: 1, backgroundColor: colors.surfaceElevated, color: '#FFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, borderWidth: 1, borderColor: colors.border },
  sendBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }
});

