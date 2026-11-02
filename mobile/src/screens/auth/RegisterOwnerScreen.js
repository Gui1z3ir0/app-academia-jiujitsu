import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

export default function RegisterOwnerScreen({ navigation }) {
  const { registerOwner, hasAdmin } = useAuth();

  const [gymName, setGymName] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cref, setCref] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasAdmin) {
      Alert.alert(
        'Acesso Bloqueado',
        'O perfil de Personal já foi cadastrado no sistema.',
        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
      );
    }
  }, [hasAdmin]);

  const handleRegister = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim() || senha.trim().length < 6) {
      Alert.alert('Campos Obrigatórios', 'Preencha Nome, E-mail e uma Senha com pelo menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      const res = await registerOwner({
        gymName,
        nome,
        email,
        senha,
        telefone,
        cref,
        sexo: 'M'
      });

      if (!res.success) {
        Alert.alert('Falha no Cadastro', res.message);
      }
    } catch (err) {
      Alert.alert('Erro', 'Ocorreu um erro ao registrar o perfil de Personal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Cadastro do Personal</Text>
          <Text style={styles.headerSubtitle}>GESTÃO DA ACADEMIA & TREINOS</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Input
          label="Nome da Academia / CT (White-Label)"
          value={gymName}
          onChangeText={setGymName}
          placeholder="Ex: Academia Iron Fit"
        />

        <Input
          label="Nome Completo do Personal"
          value={nome}
          onChangeText={setNome}
          placeholder="Seu nome completo"
          leftIcon={<Ionicons name="person" size={20} color={colors.primary} />}
        />

        <Input
          label="E-mail do Personal"
          value={email}
          onChangeText={setEmail}
          placeholder="personal@suaacademia.com"
          keyboardType="email-address"
          leftIcon={<Ionicons name="mail" size={20} color={colors.primary} />}
        />

        <Input
          label="Senha de Acesso (mín. 6 caracteres)"
          value={senha}
          onChangeText={setSenha}
          placeholder="Crie uma senha forte..."
          secureTextEntry
          leftIcon={<Ionicons name="lock-closed" size={20} color={colors.primary} />}
        />

        <Input
          label="WhatsApp Comercial"
          value={telefone}
          onChangeText={setTelefone}
          placeholder="(11) 99999-9999"
          keyboardType="phone-pad"
          leftIcon={<Ionicons name="logo-whatsapp" size={20} color={colors.whatsapp} />}
        />

        <Input
          label="CREF / Graduação Jiu-Jítsu"
          value={cref}
          onChangeText={setCref}
          placeholder="CREF 000000-G/SP"
        />

        <Button
          title="Criar Conta de Personal & Acessar"
          onPress={handleRegister}
          loading={loading}
          variant="primary"
          style={{ marginTop: 14 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 20,
    paddingTop: 50
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  backBtn: {
    marginRight: 14,
    padding: 4
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800'
  },
  headerSubtitle: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 40
  }
});
