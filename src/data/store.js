import { initialData } from './initialData.js';
import {
  hashPasswordSync,
  verifyPasswordSync,
  generateTemporaryPassword,
  createInitialsAvatar
} from '../utils/security.js';
import { supabaseClient } from '../services/supabaseClient.js';

const STORAGE_KEY = 'academia_pro_state_v2';
const ROLE_STORAGE_KEY = 'academia_pro_role_v2';
const SESSION_USER_KEY = 'academia_pro_session_user_v2';

try {
  if (typeof localStorage !== 'undefined') {
    const legacyKeys = [
      'jetfit_clean_prod_v1',
      'jetfit_erd_db_v5',
      'jetfit_erd_db_v4',
      'fitmanager_state_v3',
      'fitmanager_db_v2'
    ];
    legacyKeys.forEach(k => localStorage.removeItem(k));
  }
} catch (e) {}

function getStorage(key, defaultVal = null) {
  try {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem(key);
      return val !== null ? val : defaultVal;
    }
  } catch (e) {}
  return defaultVal;
}

function setStorage(key, val) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
    }
  } catch (e) {}
}

function removeStorage(key) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (e) {}
}

class Store {
  constructor() {
    this.state = this.loadState();
    this.currentUserId = getStorage(SESSION_USER_KEY, null);
    this.currentRole = getStorage(ROLE_STORAGE_KEY, 'student');
    this.currentStudentId = getStorage('academia_active_student', null);
    this.currentPersonalId = getStorage('academia_active_personal', null);
    this.listeners = new Set();

    if (supabaseClient.isConfigured()) {
      this.syncFromSupabase();
    }
  }

  async syncFromSupabase() {
    try {
      const [remoteConfig, remotePlans, remoteTurmas] = await Promise.all([
        supabaseClient.select('gym_config', 'select=*&limit=1'),
        supabaseClient.select('planos', 'select=*&ativo=eq.true'),
        supabaseClient.select('turmas_jiujitsu', 'select=*&ativa=eq.true')
      ]);

      if (Array.isArray(remoteConfig) && remoteConfig[0]) {
        const rc = remoteConfig[0];
        this.state.gymConfig = {
          ...this.state.gymConfig,
          name: rc.name || this.state.gymConfig.name,
          slogan: rc.slogan || this.state.gymConfig.slogan,
          logoText: rc.logo_text || this.state.gymConfig.logoText,
          primaryColor: rc.primary_color || this.state.gymConfig.primaryColor,
          phone: rc.phone || this.state.gymConfig.phone,
          whatsapp: rc.whatsapp || this.state.gymConfig.whatsapp,
          email: rc.email || this.state.gymConfig.email,
          pixKey: rc.pix_key || this.state.gymConfig.pixKey,
          pixMerchantName: rc.pix_merchant_name || this.state.gymConfig.pixMerchantName,
          pixMerchantCity: rc.pix_merchant_city || this.state.gymConfig.pixMerchantCity,
          paymentGateway: rc.payment_gateway_provider || this.state.gymConfig.paymentGateway,
          address: rc.address || this.state.gymConfig.address,
          workingHoursWeekdays: rc.working_hours_weekdays || this.state.gymConfig.workingHoursWeekdays,
          workingHoursSaturdays: rc.working_hours_saturdays || this.state.gymConfig.workingHoursSaturdays,
          workingHoursSundays: rc.working_hours_sundays || this.state.gymConfig.workingHoursSundays,
          announcements: rc.announcements || this.state.gymConfig.announcements
        };
      }

      if (Array.isArray(remotePlans) && remotePlans.length >= 3) {
        this.state.planos = remotePlans.map(p => ({
          id: p.id,
          nome: p.nome,
          modalidade: p.modalidade || 'musculacao',
          valor: Number(p.valor),
          duracao: 'Mensal',
          beneficios: Array.isArray(p.beneficios) ? p.beneficios : [],
          popular: p.id === 'plan_academia_jiujitsu',
          active: p.ativo !== false
        }));
      }

      if (Array.isArray(remoteTurmas) && remoteTurmas.length > 0) {
        this.state.turmas_jiujitsu = remoteTurmas.map(t => ({
          id: String(t.id),
          nome: t.nome,
          modalidade: t.modalidade,
          dias: t.dias_semana || [],
          horario: t.horario,
          professor: t.professor,
          capacidade: t.capacidade_maxima || 30
        }));
      }

      this.notify();
    } catch (e) {}
  }

  isLoggedIn() {
    return !!this.currentUserId && !!this.getCurrentUser();
  }

  getCurrentUser() {
    if (!this.currentUserId) return null;
    return this.getUsuario(this.currentUserId) || null;
  }

  hasPersonal() {
    return this.getUsuarios('PERSONAL').length > 0;
  }

  hasAdmin() {
    return this.hasPersonal();
  }

  getPersonalUser() {
    const personals = this.getUsuarios('PERSONAL');
    return personals.length > 0 ? personals[0] : null;
  }

  getAdminUser() {
    return this.getPersonalUser();
  }

  loginUser(email, senha) {
    const usuarios = this.getUsuarios();
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPass = (senha || '').trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Informe um endereço de e-mail válido.' };
    }

    const user = usuarios.find(u => (u.email || '').toLowerCase().trim() === cleanEmail);

    if (!user) {
      return { success: false, message: 'Conta não encontrada com este e-mail.' };
    }

    if (!verifyPasswordSync(cleanPass, user.senha_hash)) {
      return { success: false, message: 'Credenciais inválidas. Verifique sua senha.' };
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.signIn({ email: cleanEmail, password: cleanPass }).catch(() => {});
    }

    this.currentUserId = user.id;
    setStorage(SESSION_USER_KEY, user.id);

    const tipo = (user.tipo_usuario || '').toUpperCase();
    if (tipo === 'PERSONAL' || tipo === 'ADMIN' || tipo === 'ADM' || tipo === 'PROFESSOR') {
      this.currentRole = 'personal';
      this.currentPersonalId = user.id;
      setStorage('academia_active_personal', user.id);
    } else {
      this.currentRole = 'student';
      this.currentStudentId = user.id;
      setStorage('academia_active_student', user.id);
    }

    setStorage(ROLE_STORAGE_KEY, this.currentRole);
    this.notify();
    return { success: true, user, role: this.currentRole };
  }

  registerUser({
    nome,
    email,
    senha,
    telefone,
    sexo,
    peso,
    altura,
    planoId,
    objetivoPrincipal,
    faixaJiuJitsu = 'Branca',
    grausJiuJitsu = 0,
    lgpdAccepted = false
  }) {
    if (!nome || !email || !senha) {
      return { success: false, message: 'Por favor, preencha Nome, E-mail e Senha.' };
    }

    if (String(senha).trim().length < 6) {
      return { success: false, message: 'A senha deve ter pelo menos 6 caracteres.' };
    }

    if (!lgpdAccepted) {
      return {
        success: false,
        message: 'É necessário aceitar a Política de Privacidade e os Termos de Uso (LGPD) para criar sua conta.'
      };
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail.includes('@')) {
      return { success: false, message: 'Informe um e-mail válido.' };
    }

    if (this.getUsuarios().some(u => (u.email || '').toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Este e-mail já está cadastrado no sistema.' };
    }

    const numPeso = Number(peso) > 0 ? Number(peso) : 70;
    const numAltura = Number(altura) > 0 ? Number(altura) : 170;
    const validPlanIds = ['plan_academia', 'plan_jiujitsu', 'plan_academia_jiujitsu'];
    const selectedPlanId = validPlanIds.includes(planoId) ? planoId : 'plan_academia';
    const plano = this.getPlano(selectedPlanId) || this.getPlanos()[0];

    const newUser = this.addUsuario({
      nome: nome.trim(),
      email: cleanEmail,
      senha: senha.trim(),
      telefone: (telefone || '').trim(),
      sexo: sexo || 'M',
      tipo_usuario: 'ALUNO',
      peso: numPeso,
      altura: numAltura,
      plano_id: selectedPlanId,
      faixa_jiujitsu: faixaJiuJitsu || 'Branca',
      graus_jiujitsu: Number(grausJiuJitsu) || 0,
      aulas_jiujitsu_acumuladas: 0,
      meta_aulas_graduacao: 40,
      dias_treino_semana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      lgpdAccepted: true,
      lgpdAcceptedAt: new Date().toISOString(),
      dataCadastro: new Date().toISOString(),
      avatar: createInitialsAvatar(nome.trim(), '#0D9488', '#FFFFFF'),
      objetivoPrincipal: objetivoPrincipal || 'Saúde & Condicionamento Físico'
    });

    if (supabaseClient.isConfigured()) {
      supabaseClient.signUp({
        email: cleanEmail,
        password: senha.trim(),
        data: { nome: nome.trim(), role: 'aluno', plano_id: selectedPlanId }
      }).catch(() => {});
    }

    this.addMatricula({
      usuario_id: newUser.id,
      plano_id: selectedPlanId,
      status: 'Ativa'
    });

    this.addFatura({
      usuario_id: newUser.id,
      valor: plano.valor,
      status: 'Pendente',
      descricao: `Mensalidade Inicial - ${plano.nome}`
    });

    this.addAvaliacaoFisica({
      usuario_id: newUser.id,
      peso: numPeso,
      altura: numAltura,
      gordura_corporal: 15,
      massa_muscular: Number((numPeso * 0.48).toFixed(1)),
      notes: 'Avaliação inicial no ato da matrícula'
    });

    this.currentUserId = newUser.id;
    setStorage(SESSION_USER_KEY, newUser.id);
    this.currentRole = 'student';
    this.currentStudentId = newUser.id;
    setStorage('academia_active_student', newUser.id);
    setStorage(ROLE_STORAGE_KEY, 'student');
    this.notify();
    return { success: true, user: newUser, role: 'student' };
  }

  registerOwnerAccount({ nome, email, senha, telefone, cref = '', specialty = '', sexo = 'M', gymName = '' }) {
    if (this.hasPersonal()) {
      return {
        success: false,
        message: 'A conta de Personal já está cadastrada no sistema. Apenas 1 conta principal de Personal é permitida.'
      };
    }

    if (!nome || !email || !senha) {
      return { success: false, message: 'Por favor, preencha Nome Completo, E-mail e Senha.' };
    }

    if (String(senha).trim().length < 6) {
      return { success: false, message: 'A senha deve conter no mínimo 6 caracteres.' };
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail.includes('@')) {
      return { success: false, message: 'Informe um e-mail válido.' };
    }

    if (this.getUsuarios().some(u => (u.email || '').toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Este e-mail já está sendo utilizado no sistema.' };
    }

    if (gymName && gymName.trim()) {
      this.updateGymConfig({
        name: gymName.trim(),
        logoText: gymName.trim().toUpperCase().slice(0, 24),
        pixMerchantName: gymName.trim().toUpperCase().slice(0, 25)
      });
    }

    const personalUser = this.addUsuario({
      nome: nome.trim(),
      email: cleanEmail,
      senha: senha.trim(),
      telefone: (telefone || '').trim(),
      sexo: sexo || 'M',
      tipo_usuario: 'PERSONAL',
      cref: cref.trim() || 'CREF Ativo',
      specialty: specialty.trim() || 'Musculação & Jiu-Jítsu',
      avatar: createInitialsAvatar(nome.trim(), '#0284C7', '#FFFFFF'),
      objetivoPrincipal: 'Personal Trainer & Responsável Técnico',
      lgpdAccepted: true,
      lgpdAcceptedAt: new Date().toISOString()
    });

    if (supabaseClient.isConfigured()) {
      supabaseClient.signUp({
        email: cleanEmail,
        password: senha.trim(),
        data: { nome: nome.trim(), role: 'personal' }
      }).catch(() => {});
    }

    this.currentUserId = personalUser.id;
    setStorage(SESSION_USER_KEY, personalUser.id);
    this.currentRole = 'personal';
    this.currentPersonalId = personalUser.id;
    setStorage('academia_active_personal', personalUser.id);
    setStorage(ROLE_STORAGE_KEY, 'personal');

    this.notify();
    return { success: true, user: personalUser, role: 'personal' };
  }

  createAdminAccount(params) {
    return this.registerOwnerAccount(params);
  }

  recoverPassword(email, novaSenha) {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Informe um e-mail cadastrado válido.' };
    }
    if (!novaSenha || String(novaSenha).trim().length < 6) {
      return { success: false, message: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }

    const user = this.getUsuarios().find(u => (u.email || '').toLowerCase().trim() === cleanEmail);
    if (!user) {
      return { success: false, message: 'Nenhuma conta localizada com este e-mail.' };
    }

    user.senha_hash = hashPasswordSync(novaSenha.trim());
    delete user.senha;

    if (supabaseClient.isConfigured()) {
      supabaseClient.resetPassword(cleanEmail).catch(() => {});
    }

    this.notify();
    return {
      success: true,
      message: 'Sua senha foi redefinida com sucesso! Você já pode acessar com a nova senha.'
    };
  }

  deleteOwnAccount(userId = this.currentUserId) {
    if (!userId) return { success: false, message: 'Nenhum usuário autenticado.' };
    const user = this.getUsuario(userId);
    if (!user) return { success: false, message: 'Conta não encontrada.' };

    this.state.usuarios = (this.state.usuarios || []).filter(u => u.id !== userId);
    this.state.matriculas = (this.state.matriculas || []).filter(m => m.usuario_id !== userId);
    this.state.faturas = (this.state.faturas || []).filter(f => f.usuario_id !== userId);
    this.state.avaliacoes_fisicas = (this.state.avaliacoes_fisicas || []).filter(a => a.usuario_id !== userId);
    this.state.treinos = (this.state.treinos || []).filter(t => t.usuario_id !== userId);
    this.state.frequencias = (this.state.frequencias || []).filter(f => f.usuario_id !== userId);
    this.state.presencas_jiujitsu = (this.state.presencas_jiujitsu || []).filter(p => p.usuario_id !== userId);
    this.state.mensagens_personal = (this.state.mensagens_personal || []).filter(m => m.usuario_id !== userId);
    this.state.mensagens_chat = (this.state.mensagens_chat || []).filter(m => m.aluno_id !== userId);
    this.state.notifications = (this.state.notifications || []).filter(n => n.studentId !== userId);

    if (supabaseClient.isConfigured()) {
      supabaseClient.remove('usuarios', `id=eq.${userId}`).catch(() => {});
    }

    if (this.currentUserId === userId) {
      this.logoutUser();
    } else {
      this.notify();
    }

    return { success: true, message: 'Sua conta e todos os seus dados pessoais foram excluídos permanentemente (LGPD).' };
  }

  logoutUser() {
    this.currentUserId = null;
    removeStorage(SESSION_USER_KEY);
    this.notify();
  }

  loadState() {
    try {
      const data = getStorage(STORAGE_KEY, null);
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.gymConfig) {
          parsed.gymConfig = JSON.parse(JSON.stringify(initialData.gymConfig));
        }
        if (!Array.isArray(parsed.usuarios)) {
          parsed.usuarios = [];
        }

        parsed.usuarios = parsed.usuarios.map(u => {
          const copy = { ...u };
          if (copy.senha && !copy.senha_hash) {
            copy.senha_hash = hashPasswordSync(copy.senha);
            delete copy.senha;
          }
          const t = (copy.tipo_usuario || '').toUpperCase();
          if (t === 'ADMIN' || t === 'ADM' || t === 'PROFESSOR') {
            copy.tipo_usuario = 'PERSONAL';
          }
          if (!copy.avatar || copy.avatar.includes('unsplash.com')) {
            copy.avatar = createInitialsAvatar(copy.nome || 'U', copy.tipo_usuario === 'PERSONAL' ? '#0284C7' : '#0D9488');
          }
          if (!copy.faixa_jiujitsu) copy.faixa_jiujitsu = 'Branca';
          if (copy.graus_jiujitsu === undefined) copy.graus_jiujitsu = 0;
          if (copy.aulas_jiujitsu_acumuladas === undefined) copy.aulas_jiujitsu_acumuladas = 0;
          if (!copy.meta_aulas_graduacao) copy.meta_aulas_graduacao = 40;
          if (!Array.isArray(copy.dias_treino_semana) || copy.dias_treino_semana.length === 0) {
            copy.dias_treino_semana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
          }
          return copy;
        });

        const hasThreePlans =
          Array.isArray(parsed.planos) &&
          parsed.planos.some(p => p.id === 'plan_academia') &&
          parsed.planos.some(p => p.id === 'plan_jiujitsu') &&
          parsed.planos.some(p => p.id === 'plan_academia_jiujitsu');

        if (!hasThreePlans) {
          parsed.planos = JSON.parse(JSON.stringify(initialData.planos));
        }

        if (!Array.isArray(parsed.turmas_jiujitsu) || parsed.turmas_jiujitsu.length === 0) {
          parsed.turmas_jiujitsu = JSON.parse(JSON.stringify(initialData.turmas_jiujitsu));
        }
        if (!Array.isArray(parsed.presencas_jiujitsu)) parsed.presencas_jiujitsu = [];
        if (!Array.isArray(parsed.frequencias)) parsed.frequencias = [];
        if (!Array.isArray(parsed.mensagens_personal)) parsed.mensagens_personal = [];
        if (!Array.isArray(parsed.mensagens_chat)) parsed.mensagens_chat = [];
        return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar estado local, iniciando base limpa:', e);
    }
    const fresh = JSON.parse(JSON.stringify(initialData));
    this.saveState(fresh);
    return fresh;
  }

  saveState(stateToSave = this.state) {
    try {
      setStorage(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Falha ao salvar no LocalStorage:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.saveState();
    this.listeners.forEach(fn => fn(this.state));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jetfit:statechange', { detail: this.state }));
      window.dispatchEvent(new CustomEvent('fitmanager:statechange', { detail: this.state }));
    }
  }

  getUsuarios(tipo = null) {
    if (!this.state.usuarios) this.state.usuarios = [];
    if (tipo) {
      const target = tipo.toUpperCase();
      return this.state.usuarios.filter(u => {
        const t = (u.tipo_usuario || '').toUpperCase();
        if (target === 'ALUNO' || target === 'ALUNOS') return t === 'ALUNO' || t === 'ALUNOS';
        if (target === 'PERSONAL' || target === 'ADMIN' || target === 'ADM' || target === 'PROFESSOR') {
          return t === 'PERSONAL' || t === 'ADMIN' || t === 'ADM' || t === 'PROFESSOR';
        }
        return t === target;
      });
    }
    return this.state.usuarios;
  }

  getUsuario(id) {
    return this.getUsuarios().find(u => u.id === id);
  }

  addUsuario(data) {
    const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const rawTipo = (data.tipo_usuario || 'ALUNO').toUpperCase();
    const tipoFinal = rawTipo === 'PERSONAL' || rawTipo === 'ADMIN' || rawTipo === 'ADM' || rawTipo === 'PROFESSOR'
      ? 'PERSONAL'
      : 'ALUNO';

    const rawPassword = data.senha || generateTemporaryPassword();
    const senhaHash = data.senha_hash || hashPasswordSync(rawPassword);

    const novoUsuario = {
      id,
      nome: data.nome,
      email: data.email,
      senha_hash: senhaHash,
      telefone: data.telefone || '',
      sexo: data.sexo || 'M',
      tipo_usuario: tipoFinal,
      peso: data.peso ? Number(data.peso) : (data.sexo === 'F' ? 60 : 75),
      altura: data.altura ? Number(data.altura) : 175,
      plano_id: data.plano_id || 'plan_academia',
      faixa_jiujitsu: data.faixa_jiujitsu || 'Branca',
      graus_jiujitsu: Number(data.graus_jiujitsu) || 0,
      aulas_jiujitsu_acumuladas: Number(data.aulas_jiujitsu_acumuladas) || 0,
      meta_aulas_graduacao: Number(data.meta_aulas_graduacao) || 40,
      dias_treino_semana: Array.isArray(data.dias_treino_semana) && data.dias_treino_semana.length > 0
        ? data.dias_treino_semana
        : ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      lgpdAccepted: Boolean(data.lgpdAccepted),
      lgpdAcceptedAt: data.lgpdAcceptedAt || new Date().toISOString(),
      dataCadastro: data.dataCadastro || new Date().toISOString(),
      avatar: data.avatar || createInitialsAvatar(data.nome || 'Aluno', tipoFinal === 'PERSONAL' ? '#0284C7' : '#0D9488'),
      objetivoPrincipal: data.objetivoPrincipal || 'Saúde & Condicionamento',
      cref: data.cref || '',
      specialty: data.specialty || ''
    };

    if (!this.state.usuarios) this.state.usuarios = [];
    this.state.usuarios.push(novoUsuario);
    this.notify();
    return novoUsuario;
  }

  updateUsuario(id, data) {
    const idx = this.state.usuarios.findIndex(u => u.id === id);
    if (idx !== -1) {
      const patch = { ...data };
      if (patch.senha) {
        patch.senha_hash = hashPasswordSync(patch.senha);
        delete patch.senha;
      }
      this.state.usuarios[idx] = { ...this.state.usuarios[idx], ...patch };
      this.notify();
      return this.state.usuarios[idx];
    }
    return null;
  }

  deleteUsuario(id) {
    this.deleteOwnAccount(id);
  }

  getGymConfig() {
    if (!this.state.gymConfig) {
      this.state.gymConfig = JSON.parse(JSON.stringify(initialData.gymConfig));
    }
    return this.state.gymConfig;
  }

  updateGymConfig(newConfig) {
    if (!this.state.gymConfig) {
      this.state.gymConfig = JSON.parse(JSON.stringify(initialData.gymConfig));
    }
    this.state.gymConfig = {
      ...this.state.gymConfig,
      ...newConfig
    };
    if (supabaseClient.isConfigured()) {
      supabaseClient.update('gym_config', 'id=eq.1', {
        name: this.state.gymConfig.name,
        slogan: this.state.gymConfig.slogan,
        logo_text: this.state.gymConfig.logoText,
        phone: this.state.gymConfig.phone,
        whatsapp: this.state.gymConfig.whatsapp,
        pix_key: this.state.gymConfig.pixKey,
        address: this.state.gymConfig.address,
        working_hours_weekdays: this.state.gymConfig.workingHoursWeekdays,
        working_hours_saturdays: this.state.gymConfig.workingHoursSaturdays,
        working_hours_sundays: this.state.gymConfig.workingHoursSundays,
        announcements: this.state.gymConfig.announcements
      }).catch(() => {});
    }
    this.notify();
    return this.state.gymConfig;
  }

  getStudents() {
    return this.getUsuarios('ALUNO').map(u => {
      const mat = this.getMatriculaPorUsuario(u.id);
      const faturas = this.getFaturas(u.id);
      const fat = faturas.find(f => f.status !== 'Paga') || faturas[0];
      const plano = mat ? this.getPlano(mat.plano_id) : (u.plano_id ? this.getPlano(u.plano_id) : this.getPlanos()[0]);
      const ultimaAv = this.getUltimaAvaliacao(u.id);
      const faltas = this.getFaltas(u.id);
      const presencasJJ = this.getPresencasJiuJitsu(u.id);

      const payments = this.getPayments(u.id);
      const currentMonthStr = new Date().toISOString().substring(0, 7);
      const paidThisMonth = payments.some(p => (p.status || '').toLowerCase() === 'pago' && p.paymentDate && p.paymentDate.startsWith(currentMonthStr));
      const hasPendingFatura = fat && fat.status !== 'Paga';

      return {
        ...u,
        name: u.nome,
        phone: u.telefone,
        goal: u.objetivoPrincipal,
        planId: mat ? mat.plano_id : (u.plano_id || 'plan_academia'),
        planName: plano ? plano.nome : 'Plano Musculação',
        modalidadePlano: plano ? plano.modalidade : 'musculacao',
        status: fat?.status === 'Atrasada' ? 'atrasado' : (fat?.status === 'Aguardando Confirmação' ? 'aguardando_confirmacao' : (fat?.status === 'Pendente' ? 'vence_breve' : 'em_dia')),
        isPaidThisMonth: paidThisMonth || (!hasPendingFatura && payments.length > 0),
        dueDate: fat ? fat.vencimento : this.formatFutureDate(30),
        monthlyAmount: fat ? fat.valor : (plano ? plano.valor : 120.00),
        currentWeight: u.peso || (ultimaAv ? ultimaAv.peso : 75),
        heightCm: u.altura || (ultimaAv ? ultimaAv.altura : 175),
        faixaJiuJitsu: u.faixa_jiujitsu || 'Branca',
        grausJiuJitsu: Number(u.graus_jiujitsu) || 0,
        aulasJiuJitsu: Number(u.aulas_jiujitsu_acumuladas) || presencasJJ.length,
        metaAulasGraduacao: Number(u.meta_aulas_graduacao) || 40,
        diasTreinoSemana: Array.isArray(u.dias_treino_semana) ? u.dias_treino_semana : ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
        faltasCount: faltas.length,
        faltas
      };
    });
  }

  addStudent(studentData) {
    const tempPassword = (studentData.senha && String(studentData.senha).trim()) || generateTemporaryPassword();
    const validPlanIds = ['plan_academia', 'plan_jiujitsu', 'plan_academia_jiujitsu'];
    const chosenPlanId = validPlanIds.includes(studentData.planId) ? studentData.planId : 'plan_academia';
    const plano = this.getPlano(chosenPlanId) || this.getPlanos()[0];

    const user = this.addUsuario({
      nome: studentData.name || studentData.nome,
      email: studentData.email,
      telefone: studentData.phone || studentData.telefone,
      sexo: studentData.sexo || 'M',
      tipo_usuario: 'ALUNO',
      senha: tempPassword,
      peso: Number(studentData.currentWeight) || 75,
      altura: Number(studentData.heightCm) || 175,
      plano_id: chosenPlanId,
      faixa_jiujitsu: studentData.faixaJiuJitsu || 'Branca',
      graus_jiujitsu: Number(studentData.grausJiuJitsu) || 0,
      dias_treino_semana: studentData.diasTreinoSemana || ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      objetivoPrincipal: studentData.goal || studentData.objetivoPrincipal || 'Saúde & Condicionamento',
      lgpdAccepted: true
    });

    this.addMatricula({
      usuario_id: user.id,
      plano_id: chosenPlanId,
      status: 'Ativa'
    });

    this.addFatura({
      usuario_id: user.id,
      valor: Number(studentData.monthlyAmount) || plano.valor || 120.00,
      vencimento: studentData.dueDate || this.formatFutureDate(30),
      status: 'Pendente',
      descricao: `Mensalidade Inicial - ${plano.nome}`
    });

    this.addAvaliacaoFisica({
      usuario_id: user.id,
      peso: Number(studentData.currentWeight) || 75,
      altura: Number(studentData.heightCm) || 175,
      gordura_corporal: 15,
      massa_muscular: 38,
      notes: 'Avaliação física inicial'
    });

    return { ...user, generatedPassword: tempPassword };
  }

  updateStudent(studentId, updates) {
    const patch = {
      ...updates,
      nome: updates.name !== undefined ? updates.name : (updates.nome !== undefined ? updates.nome : undefined),
      telefone: updates.phone !== undefined ? updates.phone : (updates.telefone !== undefined ? updates.telefone : undefined),
      objetivoPrincipal: updates.goal !== undefined ? updates.goal : (updates.objetivoPrincipal !== undefined ? updates.objetivoPrincipal : undefined)
    };
    if (updates.faixaJiuJitsu !== undefined) patch.faixa_jiujitsu = updates.faixaJiuJitsu;
    if (updates.grausJiuJitsu !== undefined) patch.graus_jiujitsu = Number(updates.grausJiuJitsu);
    if (updates.diasTreinoSemana !== undefined) patch.dias_treino_semana = updates.diasTreinoSemana;
    return this.updateUsuario(studentId, patch);
  }

  editStudent(studentId, updates) {
    return this.updateStudent(studentId, updates);
  }

  deleteStudent(studentId) {
    return this.deleteUsuario(studentId);
  }

  getPersonals() {
    const list = this.getUsuarios('PERSONAL');
    return list.map(u => ({
      ...u,
      name: u.nome,
      phone: u.telefone,
      cref: u.cref || 'CREF Ativo',
      specialty: u.specialty || 'Musculação & Jiu-Jítsu',
      rating: u.rating || '5.0',
      studentsCount: this.getUsuarios('ALUNOS').length,
      availableSlots: u.availableSlots || [
        { time: '07:00', days: ['Seg', 'Qua', 'Sex'] },
        { time: '09:00', days: ['Ter', 'Qui'] },
        { time: '18:00', days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'] },
        { time: '19:30', days: ['Seg', 'Qua', 'Sex'] }
      ]
    }));
  }

  addPersonal(personalData) {
    const tempPassword = personalData.senha || generateTemporaryPassword();
    const created = this.addUsuario({
      nome: personalData.name,
      email: personalData.email,
      telefone: personalData.phone,
      sexo: personalData.sexo || 'M',
      senha: tempPassword,
      tipo_usuario: 'PERSONAL',
      cref: personalData.cref || 'CREF Ativo',
      specialty: personalData.specialty || 'Musculação e Jiu-Jítsu',
      bio: personalData.bio || 'Personal Trainer certificado.'
    });
    return { ...created, generatedPassword: tempPassword };
  }

  isPersonal() {
    const user = this.getCurrentUser();
    if (!user) return false;
    const tipo = (user.tipo_usuario || '').toUpperCase();
    return tipo === 'PERSONAL' || tipo === 'ADMIN' || tipo === 'ADM' || tipo === 'PROFESSOR';
  }

  isAdmin() {
    return this.isPersonal();
  }

  getActiveStudent() {
    const user = this.getCurrentUser();
    if (user && (user.tipo_usuario || '').toUpperCase() === 'ALUNO') {
      const selfStudent = this.getStudents().find(s => s.id === user.id);
      if (selfStudent) return selfStudent;
    }
    const students = this.getStudents();
    if (students && students.length > 0) {
      const student = students.find(s => s.id === this.currentStudentId);
      return student || students[0];
    }
    return {
      id: 'aluno_placeholder',
      name: 'Nenhum Aluno Cadastrado',
      nome: 'Nenhum Aluno Cadastrado',
      email: '',
      phone: '',
      goal: 'Aguardando primeiro cadastro',
      planId: 'plan_academia',
      planName: 'Sem Plano Ativo',
      status: 'em_dia',
      dueDate: this.formatFutureDate(30),
      monthlyAmount: 0,
      currentWeight: 70,
      heightCm: 175,
      faixaJiuJitsu: 'Branca',
      grausJiuJitsu: 0,
      aulasJiuJitsu: 0,
      metaAulasGraduacao: 40,
      diasTreinoSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      avatar: createInitialsAvatar('NA', '#475569')
    };
  }

  setActiveStudent(studentId) {
    const user = this.getCurrentUser();
    if (user && (user.tipo_usuario || '').toUpperCase() === 'ALUNO') {
      this.currentStudentId = user.id;
      return;
    }
    this.currentStudentId = studentId;
    setStorage('academia_active_student', studentId);
    this.notify();
  }

  getActivePersonal() {
    const personals = this.getPersonals();
    if (personals && personals.length > 0) {
      const personal = personals.find(p => p.id === this.currentPersonalId);
      return personal || personals[0];
    }
    return {
      id: 'personal_placeholder',
      name: 'Personal Trainer',
      nome: 'Personal Trainer',
      email: '',
      phone: '',
      cref: 'CREF Ativo',
      rating: '5.0',
      specialty: 'Musculação & Jiu-Jítsu',
      avatar: createInitialsAvatar('PT', '#0284C7'),
      availableSlots: [
        { time: '07:00', days: ['Seg', 'Qua', 'Sex'] },
        { time: '18:00', days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'] },
        { time: '19:30', days: ['Seg', 'Qua', 'Sex'] }
      ]
    };
  }

  setActivePersonal(personalId) {
    this.currentPersonalId = personalId;
    setStorage('academia_active_personal', personalId);
    this.notify();
  }

  getCurrentRole() {
    const user = this.getCurrentUser();
    if (!user) return 'student';
    if (this.isPersonal()) return 'personal';
    return 'student';
  }

  setRole(role) {
    if (!this.isPersonal()) return;
    this.currentRole = role === 'student' ? 'student' : 'personal';
    setStorage(ROLE_STORAGE_KEY, this.currentRole);
    this.notify();
  }

  getPlanos() {
    if (!this.state.planos || this.state.planos.length < 3) {
      this.state.planos = JSON.parse(JSON.stringify(initialData.planos));
    }
    return this.state.planos;
  }

  getPlano(id) {
    return this.getPlanos().find(p => p.id === id);
  }

  addPlano(data) {
    const id = 'plan_' + Date.now();
    const rawBenefits = data.beneficios !== undefined ? data.beneficios : data.benefits;
    const parsedBenefits = Array.isArray(rawBenefits)
      ? rawBenefits
      : (typeof rawBenefits === 'string' && rawBenefits.trim()
          ? rawBenefits.split('\n').map(s => s.trim()).filter(Boolean)
          : ['Acesso completo']);
    const novoPlano = {
      id,
      nome: data.nome || data.name,
      modalidade: data.modalidade || 'completo',
      valor: Number(data.valor !== undefined ? data.valor : data.price) || 120.00,
      duracao: data.duracao || data.period || 'Mensal',
      descricao: data.descricao || data.description || 'Acesso às modalidades contratadas.',
      beneficios: parsedBenefits,
      popular: Boolean(data.popular),
      active: true
    };
    this.state.planos.push(novoPlano);
    this.notify();
    return novoPlano;
  }

  getPlans() {
    return this.getPlanos().map(p => ({
      ...p,
      name: p.nome,
      price: p.valor,
      period: p.duracao,
      benefits: p.beneficios
    }));
  }

  getPlan(id) {
    const p = this.getPlano(id);
    if (!p) return null;
    return {
      ...p,
      name: p.nome,
      price: p.valor,
      period: p.duracao,
      benefits: p.beneficios
    };
  }

  addPlan(planData) {
    return this.addPlano(planData);
  }

  getMatriculas(usuarioId = null) {
    if (!this.state.matriculas) this.state.matriculas = [];
    if (usuarioId) {
      return this.state.matriculas.filter(m => m.usuario_id === usuarioId);
    }
    return this.state.matriculas;
  }

  getMatriculaPorUsuario(usuarioId) {
    return this.getMatriculas(usuarioId).find(m => m.status === 'Ativa') || this.getMatriculas(usuarioId)[0];
  }

  addMatricula(data) {
    const id = 'mat_' + Date.now();
    const novaMatricula = {
      id,
      usuario_id: data.usuario_id,
      plano_id: data.plano_id,
      inicio: data.inicio || this.formatDate(new Date()),
      termino: data.termino || this.formatFutureDate(365),
      status: data.status || 'Ativa'
    };
    this.state.matriculas.push(novaMatricula);
    this.notify();
    return novaMatricula;
  }

  updateMatricula(id, data) {
    const idx = this.state.matriculas.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.state.matriculas[idx] = { ...this.state.matriculas[idx], ...data };
      this.notify();
    }
  }

  getStudentTrainingDays(studentId) {
    const u = this.getUsuario(studentId);
    if (u && Array.isArray(u.dias_treino_semana) && u.dias_treino_semana.length > 0) {
      return u.dias_treino_semana;
    }
    return ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  }

  setStudentTrainingDays(studentId, daysArray) {
    const u = this.getUsuario(studentId);
    if (u && Array.isArray(daysArray)) {
      u.dias_treino_semana = daysArray;
      this.notify();
      return u.dias_treino_semana;
    }
    return [];
  }

  copyWorkoutToStudent(sourceStudentId, targetStudentId, scopeDay = 'all') {
    if (!sourceStudentId || !targetStudentId || sourceStudentId === targetStudentId) {
      return { success: false, message: 'Selecione um aluno de destino diferente do aluno de origem.' };
    }

    const daysToCopy = scopeDay === 'all'
      ? ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
      : [scopeDay];

    let copiedCount = 0;

    daysToCopy.forEach(day => {
      const sourceWorkout = this.getTreinoPorDia(sourceStudentId, day);
      const sourceExercises = this.getExercicios(sourceWorkout.id);
      if (sourceExercises.length === 0 && scopeDay === 'all') return;

      const targetWorkout = this.getTreinoPorDia(targetStudentId, day);
      targetWorkout.nome = sourceWorkout.nome || `Treino de ${day}`;
      targetWorkout.notes = sourceWorkout.notes || '';

      this.state.exercicios = (this.state.exercicios || []).filter(e => e.treino_id !== targetWorkout.id);

      sourceExercises.forEach(ex => {
        this.state.exercicios.push({
          ...ex,
          id: 'ex_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          treino_id: targetWorkout.id,
          completed: false
        });
        copiedCount++;
      });
    });

    if (supabaseClient.isConfigured()) {
      supabaseClient.rpc('copiar_treino_aluno', {
        p_origem_usuario_id: sourceStudentId,
        p_destino_usuario_id: targetStudentId,
        p_dia_semana: scopeDay === 'all' ? null : scopeDay
      }).catch(() => {});
    }

    this.addNotification({
      studentId: targetStudentId,
      type: 'treino',
      title: 'Nova Ficha de Treino Prescrita!',
      message: scopeDay === 'all'
        ? 'Seu Personal atualizou sua rotina completa de treinos da semana.'
        : `Seu Personal atualizou seu treino de ${scopeDay}.`,
      priority: 'normal'
    });

    this.notify();
    return {
      success: true,
      copiedCount,
      message: scopeDay === 'all'
        ? `Ficha semanal copiada com sucesso (${copiedCount} exercícios aplicados).`
        : `Treino de ${scopeDay} copiado com sucesso (${copiedCount} exercícios aplicados).`
    };
  }

  getTurmasJiuJitsu() {
    if (!Array.isArray(this.state.turmas_jiujitsu)) {
      this.state.turmas_jiujitsu = JSON.parse(JSON.stringify(initialData.turmas_jiujitsu));
    }
    return this.state.turmas_jiujitsu;
  }

  addTurmaJiuJitsu(data) {
    const novaTurma = {
      id: 'turma_jj_' + Date.now(),
      nome: (data.nome || 'Turma de Jiu-Jítsu').trim(),
      modalidade: data.modalidade || 'Gi (Com Kimono)',
      dias: Array.isArray(data.dias) ? data.dias : ['Segunda', 'Quarta', 'Sexta'],
      horario: data.horario || '19:30',
      professor: data.professor || this.getActivePersonal().name || 'Personal / Instrutor',
      capacidade: Number(data.capacidade) || 30
    };
    this.getTurmasJiuJitsu().push(novaTurma);
    this.notify();
    return novaTurma;
  }

  removeTurmaJiuJitsu(turmaId) {
    this.state.turmas_jiujitsu = this.getTurmasJiuJitsu().filter(t => t.id !== turmaId);
    this.notify();
  }

  getPresencasJiuJitsu(studentId = null) {
    if (!Array.isArray(this.state.presencas_jiujitsu)) {
      this.state.presencas_jiujitsu = [];
    }
    if (studentId) {
      return this.state.presencas_jiujitsu.filter(p => p.usuario_id === studentId);
    }
    return this.state.presencas_jiujitsu;
  }

  registrarPresencaJiuJitsu(studentId, turmaId, dataAula = null) {
    if (!Array.isArray(this.state.presencas_jiujitsu)) {
      this.state.presencas_jiujitsu = [];
    }
    const turma = this.getTurmasJiuJitsu().find(t => t.id === turmaId) || {
      id: turmaId || 'turma_jj_1',
      nome: 'Treino de Jiu-Jítsu',
      modalidade: 'Gi (Com Kimono)',
      horario: '19:30'
    };
    const student = this.getUsuario(studentId);
    const dateStr = dataAula || this.formatDate(new Date());

    const novaPresenca = {
      id: 'pres_jj_' + Date.now(),
      usuario_id: studentId,
      alunoNome: student ? student.nome : 'Aluno',
      turma_id: turma.id,
      turmaNome: turma.nome,
      modalidade: turma.modalidade,
      horario: turma.horario,
      data: dateStr,
      status: 'presente'
    };

    this.state.presencas_jiujitsu.unshift(novaPresenca);

    if (student) {
      student.aulas_jiujitsu_acumuladas = (Number(student.aulas_jiujitsu_acumuladas) || 0) + 1;
    }

    this.addNotification({
      studentId,
      type: 'jiujitsu',
      title: 'Presença Confirmada no Tatame!',
      message: `Presença registrada na turma "${turma.nome}" (${dateStr.split('-').reverse().join('/')}). Total: ${student?.aulas_jiujitsu_acumuladas || 1} aulas.`,
      priority: 'normal'
    });

    this.notify();
    return novaPresenca;
  }

  atualizarGraduacaoJiuJitsu(studentId, { faixa, graus, metaAulas }) {
    const student = this.getUsuario(studentId);
    if (!student) return null;

    if (faixa) student.faixa_jiujitsu = faixa;
    if (graus !== undefined) student.graus_jiujitsu = Math.max(0, Math.min(4, Number(graus) || 0));
    if (metaAulas !== undefined) student.meta_aulas_graduacao = Math.max(10, Number(metaAulas) || 40);

    this.addNotification({
      studentId,
      type: 'jiujitsu',
      title: 'Graduação de Jiu-Jítsu Atualizada!',
      message: `Parabéns! Sua graduação atual é Faixa ${student.faixa_jiujitsu} (${student.graus_jiujitsu}º Grau). Oss!`,
      priority: 'high'
    });

    this.notify();
    return student;
  }

  getTreinos(usuarioId = null) {
    if (!this.state.treinos) this.state.treinos = [];
    if (usuarioId) {
      return this.state.treinos.filter(t => t.usuario_id === usuarioId);
    }
    return this.state.treinos;
  }

  getExercicios(treinoId = null) {
    if (!this.state.exercicios) this.state.exercicios = [];
    const list = treinoId
      ? this.state.exercicios.filter(e => e.treino_id === treinoId)
      : this.state.exercicios;
    return list.map(e => ({
      ...e,
      nome: e.nome || e.name || 'Exercício',
      name: e.name || e.nome || 'Exercício',
      grupo_muscular: e.grupo_muscular || e.muscleGroup || 'Geral',
      muscleGroup: e.muscleGroup || e.grupo_muscular || 'Geral',
      descricao: e.descricao !== undefined ? e.descricao : (e.notes || 'Execução controlada mantendo postura adequada.'),
      notes: e.notes !== undefined ? e.notes : (e.descricao || 'Execução controlada mantendo postura adequada.')
    }));
  }

  getTreinoPorDia(usuarioId, diaSemana = 'Segunda') {
    const treinos = this.getTreinos(usuarioId);
    let treino = treinos.find(t => t.dia_semana === diaSemana);
    if (!treino) {
      treino = {
        id: 'trn_' + usuarioId + '_' + diaSemana,
        usuario_id: usuarioId,
        professor_id: this.getActivePersonal().id,
        nome: `Treino de ${diaSemana}`,
        objetivo: 'Condicionamento e Força',
        frequencia: diaSemana,
        dia_semana: diaSemana,
        notes: 'Realize aquecimento articular prévio.'
      };
      this.state.treinos.push(treino);
    }
    const exercicios = this.getExercicios(treino.id);
    return {
      ...treino,
      title: treino.nome,
      exercises: exercicios
    };
  }

  getWorkoutForStudent(studentId, day = 'Segunda') {
    return this.getTreinoPorDia(studentId, day);
  }

  addExerciseToWorkout(studentId, day, exerciseData) {
    const treino = this.getTreinoPorDia(studentId, day);
    const nome = exerciseData.name || exerciseData.nome || 'Novo Exercício';
    const grupo = exerciseData.muscleGroup || exerciseData.grupo_muscular || 'Geral';
    const desc = exerciseData.notes || exerciseData.descricao || 'Execução controlada mantendo postura adequada.';
    const newEx = {
      id: 'ex_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
      treino_id: treino.id,
      nome,
      name: nome,
      grupo_muscular: grupo,
      muscleGroup: grupo,
      descricao: desc,
      notes: desc,
      sets: Number(exerciseData.sets) || 4,
      reps: exerciseData.reps || '10-12',
      loadKg: Number(exerciseData.loadKg) || 20,
      restSeconds: Number(exerciseData.restSeconds) || 60,
      imageUrl: exerciseData.imageUrl || createInitialsAvatar(nome, '#1E293B', '#00F59B'),
      videoUrl: exerciseData.videoUrl || '',
      completed: false
    };

    if (!this.state.exercicios) this.state.exercicios = [];
    this.state.exercicios.push(newEx);
    this.notify();
    return newEx;
  }

  updateExercise(studentId, day, exerciseId, exerciseData) {
    if (!this.state.exercicios) this.state.exercicios = [];
    const idx = this.state.exercicios.findIndex(e => e.id === exerciseId);
    if (idx !== -1) {
      const current = this.state.exercicios[idx];
      const nextName = exerciseData.name !== undefined ? exerciseData.name : (exerciseData.nome !== undefined ? exerciseData.nome : (current.nome || current.name));
      const nextGroup = exerciseData.muscleGroup !== undefined ? exerciseData.muscleGroup : (exerciseData.grupo_muscular !== undefined ? exerciseData.grupo_muscular : (current.grupo_muscular || current.muscleGroup));
      const nextNotes = exerciseData.notes !== undefined ? exerciseData.notes : (exerciseData.descricao !== undefined ? exerciseData.descricao : (current.descricao || current.notes));
      let nextLoadKg = current.loadKg;
      let nextRecordeKg = Number(current.recordeKg || current.loadKg || 0);
      let nextUltimaCargaEm = current.ultimaCargaEm || null;
      if (exerciseData.loadKg !== undefined) {
        const parsed = Number(String(exerciseData.loadKg).replace(',', '.'));
        if (Number.isFinite(parsed) && parsed >= 0) {
          nextLoadKg = Number(parsed.toFixed(1));
          nextRecordeKg = Math.max(nextRecordeKg, nextLoadKg);
          nextUltimaCargaEm = new Date().toLocaleDateString('pt-BR');
        }
      }
      this.state.exercicios[idx] = {
        ...current,
        ...exerciseData,
        loadKg: nextLoadKg,
        recordeKg: nextRecordeKg,
        ultimaCargaEm: nextUltimaCargaEm,
        nome: nextName,
        name: nextName,
        grupo_muscular: nextGroup,
        muscleGroup: nextGroup,
        descricao: nextNotes,
        notes: nextNotes
      };
      this.notify();
    }
  }

  removeExerciseFromWorkout(studentId, day, exerciseId) {
    if (!this.state.exercicios) this.state.exercicios = [];
    this.state.exercicios = this.state.exercicios.filter(e => e.id !== exerciseId);
    this.notify();
  }

  toggleExerciseDone(studentId, day, exerciseId) {
    if (!this.state.exercicios) this.state.exercicios = [];
    const ex = this.state.exercicios.find(e => e.id === exerciseId);
    if (ex) {
      ex.completed = !ex.completed;
      this.notify();
    }
  }

  getAvaliacoesFisicas(usuarioId = null) {
    if (!this.state.avaliacoes_fisicas) this.state.avaliacoes_fisicas = [];
    if (usuarioId) {
      return this.state.avaliacoes_fisicas.filter(a => a.usuario_id === usuarioId);
    }
    return this.state.avaliacoes_fisicas;
  }

  getUltimaAvaliacao(usuarioId) {
    const avs = this.getAvaliacoesFisicas(usuarioId);
    return avs[avs.length - 1];
  }

  addAvaliacaoFisica(data) {
    const id = 'av_' + Date.now();
    const peso = Number(data.peso || data.weightKg) || 70;
    const altura = Number(data.altura || data.heightCm) || 175;
    const alturaM = altura / 100;
    const imc = Number((peso / (alturaM * alturaM)).toFixed(2));

    const novaAv = {
      id,
      usuario_id: data.usuario_id,
      peso,
      altura,
      imc,
      gordura_corporal: Number(data.gordura_corporal !== undefined ? data.gordura_corporal : data.bodyFat) || 15.0,
      massa_muscular: Number(data.massa_muscular !== undefined ? data.massa_muscular : data.muscleMass) || 38.0,
      data_avaliacao: data.data_avaliacao || data.date || this.formatDate(new Date()),
      torax_cm: Number(data.torax_cm || data.chestCm) || 0,
      braco_cm: Number(data.braco_cm || data.armsCm) || 0,
      cintura_cm: Number(data.cintura_cm || data.waistCm) || 0,
      coxa_cm: Number(data.coxa_cm || data.thighsCm) || 0,
      benchPressKg: Number(data.benchPressKg) || 0,
      squatKg: Number(data.squatKg) || 0,
      deadliftKg: Number(data.deadliftKg) || 0,
      notes: data.notes || ''
    };

    if (!this.state.avaliacoes_fisicas) this.state.avaliacoes_fisicas = [];
    this.state.avaliacoes_fisicas.push(novaAv);

    const u = this.getUsuario(data.usuario_id);
    if (u) {
      u.peso = peso;
      u.altura = altura;
      u.currentWeight = peso;
      u.heightCm = altura;
    }

    this.notify();
    return novaAv;
  }

  getEvolutions(studentId) {
    return this.getAvaliacoesFisicas(studentId).map(a => ({
      ...a,
      date: a.data_avaliacao,
      weightKg: a.peso,
      heightCm: a.altura,
      bodyFat: a.gordura_corporal,
      muscleMass: a.massa_muscular,
      muscleMassKg: a.massa_muscular,
      chestCm: a.torax_cm,
      armsCm: a.braco_cm,
      waistCm: a.cintura_cm,
      thighsCm: a.coxa_cm
    }));
  }

  addEvolution(studentId, data) {
    return this.addAvaliacaoFisica({
      ...data,
      usuario_id: studentId,
      peso: data.weightKg,
      altura: data.heightCm || 178,
      gordura_corporal: data.bodyFat,
      massa_muscular: data.muscleMass || data.muscleMassKg || (data.weightKg ? (data.weightKg * 0.52).toFixed(1) : 40),
      data_avaliacao: data.date,
      torax_cm: data.chestCm,
      braco_cm: data.armsCm,
      cintura_cm: data.waistCm,
      coxa_cm: data.thighsCm
    });
  }

  getFaturas(usuarioId = null) {
    if (!this.state.faturas) this.state.faturas = [];
    if (usuarioId) {
      return this.state.faturas.filter(f => f.usuario_id === usuarioId);
    }
    return this.state.faturas;
  }

  getFatura(id) {
    return this.getFaturas().find(f => f.id === id);
  }

  getPagamentos(faturaId = null) {
    if (!this.state.pagamentos) this.state.pagamentos = [];
    if (faturaId) {
      return this.state.pagamentos.filter(p => p.fatura_id === faturaId);
    }
    return this.state.pagamentos;
  }

  addFatura(data) {
    const id = 'fat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);
    const novaFatura = {
      id,
      usuario_id: data.usuario_id,
      matricula_id: data.matricula_id || 'mat_1',
      valor: Number(data.valor) || 120.00,
      vencimento: data.vencimento || this.formatFutureDate(30),
      status: data.status || 'Pendente',
      descricao: data.descricao || `Mensalidade - ${this.getGymConfig().name}`
    };
    if (!this.state.faturas) this.state.faturas = [];
    this.state.faturas.push(novaFatura);
    this.notify();
    return novaFatura;
  }

  addPagamento(data) {
    const id = 'pag_' + Date.now();
    const novoPagamento = {
      id,
      fatura_id: data.fatura_id,
      forma: data.forma || 'PIX',
      valor: Number(data.valor) || 0,
      data: data.data || this.formatDate(new Date())
    };

    if (!this.state.pagamentos) this.state.pagamentos = [];
    this.state.pagamentos.push(novoPagamento);

    const fatura = this.getFatura(data.fatura_id);
    if (fatura) {
      fatura.status = 'Paga';
    }

    this.notify();
    return novoPagamento;
  }

  informarPagamentoPix(paymentId) {
    let fatura = this.getFatura(paymentId);
    if (!fatura) {
      const activeStudent = this.getActiveStudent();
      const studentFaturas = activeStudent ? this.getFaturas(activeStudent.id) : [];
      fatura = studentFaturas.find(f => f.status !== 'Paga') || studentFaturas[0];
    }
    if (!fatura) return null;

    fatura.status = 'Aguardando Confirmação';
    fatura.notificadoEm = new Date().toISOString();

    const aluno = this.getUsuario(fatura.usuario_id);
    this.addNotification({
      studentId: fatura.usuario_id,
      type: 'cobranca',
      title: 'Comprovante Pix em Análise',
      message: `O pagamento da fatura "${fatura.descricao}" (R$ ${Number(fatura.valor).toFixed(2)}) de ${aluno?.nome || 'Aluno'} aguarda confirmação do webhook/Personal.`,
      priority: 'high'
    });

    this.notify();
    return fatura;
  }

  confirmarPagamentoPersonal(paymentId, method = 'PIX') {
    if (!this.isPersonal()) {
      return this.informarPagamentoPix(paymentId);
    }
    let fatura = this.getFatura(paymentId);
    if (!fatura) return null;

    const pag = this.addPagamento({
      fatura_id: fatura.id,
      forma: method,
      valor: fatura.valor,
      data: this.formatDate(new Date())
    });

    this.addNotification({
      studentId: fatura.usuario_id,
      type: 'cobranca',
      title: 'Pagamento Confirmado!',
      message: `Sua mensalidade (${fatura.descricao}) no valor de R$ ${Number(fatura.valor).toFixed(2)} foi confirmada.`,
      priority: 'normal'
    });

    return pag;
  }

  processPayment(paymentId, method = 'PIX') {
    if (this.isPersonal()) {
      return this.confirmarPagamentoPersonal(paymentId, method);
    }
    return this.informarPagamentoPix(paymentId);
  }

  getPayments(studentId = null) {
    const faturas = studentId ? this.getFaturas(studentId) : this.getFaturas();
    return faturas.map(f => {
      const pag = this.getPagamentos(f.id)[0];
      const usuario = this.getUsuario(f.usuario_id);
      const mat = this.getMatriculaPorUsuario(f.usuario_id);
      const planoId = mat ? mat.plano_id : (usuario?.plano_id || 'plan_academia');
      const plano = this.getPlano(planoId);
      let normalizedStatus = 'pendente';
      if (f.status === 'Paga') normalizedStatus = 'pago';
      else if (f.status === 'Atrasada') normalizedStatus = 'atrasado';
      else if (f.status === 'Aguardando Confirmação') normalizedStatus = 'aguardando_confirmacao';

      return {
        id: f.id,
        studentId: f.usuario_id,
        studentName: usuario ? usuario.nome : 'Aluno',
        planName: plano ? plano.nome : (f.descricao || 'Plano Musculação'),
        amount: f.valor,
        dueDate: f.vencimento,
        status: normalizedStatus,
        method: pag ? pag.forma : 'PIX',
        paymentDate: pag ? pag.data : null,
        description: f.descricao
      };
    });
  }

  getStudentPayments(studentId) {
    return this.getPayments(studentId);
  }

  getChatMessages(studentId = null) {
    if (!Array.isArray(this.state.mensagens_chat)) {
      this.state.mensagens_chat = [];
    }
    if (studentId) {
      return this.state.mensagens_chat
        .filter(m => m.aluno_id === studentId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return [...this.state.mensagens_chat].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  sendChatMessage({ studentId, senderRole = 'aluno', content, subject = 'Chat com o Personal', priority = 'media' }) {
    if (!Array.isArray(this.state.mensagens_chat)) {
      this.state.mensagens_chat = [];
    }
    const cleanText = String(content || '').trim();
    if (!cleanText) return null;

    const targetStudentId = studentId || this.getActiveStudent().id;
    const student = this.getUsuario(targetStudentId);
    const personal = this.getActivePersonal();
    const now = new Date();
    const timeFormatted = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const chatMsg = {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
      aluno_id: targetStudentId,
      alunoNome: student ? student.nome : 'Aluno',
      alunoTelefone: student ? student.telefone : '',
      remetente_id: senderRole === 'personal' ? personal.id : targetStudentId,
      remetente_nome: senderRole === 'personal' ? personal.name : (student ? student.nome : 'Aluno'),
      remetente_role: senderRole,
      assunto: subject,
      prioridade: priority,
      conteudo: cleanText,
      lida: false,
      createdAt: now.toISOString(),
      dataFormatada: timeFormatted
    };

    this.state.mensagens_chat.push(chatMsg);

    if (senderRole === 'aluno') {
      if (!Array.isArray(this.state.mensagens_personal)) this.state.mensagens_personal = [];
      this.state.mensagens_personal.unshift({
        id: chatMsg.id,
        usuario_id: targetStudentId,
        nomeAluno: chatMsg.alunoNome,
        telefone: chatMsg.alunoTelefone,
        assunto: subject,
        prioridade,
        mensagem: cleanText,
        status: 'pendente',
        data: chatMsg.createdAt,
        dataFormatada: timeFormatted
      });
    } else {
      const pending = (this.state.mensagens_personal || []).filter(
        m => m.usuario_id === targetStudentId && m.status === 'pendente'
      );
      pending.forEach(m => {
        m.status = 'respondida';
        m.resposta = cleanText;
        m.respondidaEm = now.toISOString();
      });
    }

    this.addNotification({
      studentId: targetStudentId,
      type: 'chat',
      title: senderRole === 'personal' ? `Nova resposta de ${personal.name}` : `Nova mensagem de ${chatMsg.alunoNome}`,
      message: cleanText.slice(0, 90),
      priority: priority === 'alta' ? 'high' : 'normal'
    });

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(
          senderRole === 'personal' ? `Mensagem do Personal (${personal.name})` : `Mensagem de ${chatMsg.alunoNome}`,
          { body: cleanText.slice(0, 100), icon: '/favicon.svg' }
        );
      } catch (e) {}
    }

    this.notify();
    return chatMsg;
  }

  getFeedbacks(usuarioId = null, professorId = null) {
    if (!this.state.feedbacks) this.state.feedbacks = [];
    let list = this.state.feedbacks;
    if (usuarioId) {
      list = list.filter(f => f.usuario_id === usuarioId);
    }
    if (professorId) {
      list = list.filter(f => f.professor_id === professorId);
    }
    return list;
  }

  addFeedback(data) {
    const id = 'fbk_' + Date.now();
    const novoFeedback = {
      id,
      usuario_id: data.usuario_id,
      professor_id: data.professor_id || this.getActivePersonal().id,
      treino_id: data.treino_id || 'trn_1',
      nota: Number(data.nota) || 5,
      comentario: data.comentario || '',
      data: data.data || this.formatDate(new Date())
    };

    if (!this.state.feedbacks) this.state.feedbacks = [];
    this.state.feedbacks.unshift(novoFeedback);

    this.addNotification({
      studentId: data.usuario_id,
      type: 'feedback_received',
      title: 'Novo Feedback Recebido!',
      message: `Aluno(a) avaliou com nota ${novoFeedback.nota} estrelas: "${novoFeedback.comentario.substring(0, 60)}"`,
      priority: 'normal'
    });

    this.notify();
    return novoFeedback;
  }

  getAppointments() {
    if (!this.state.appointments) this.state.appointments = [];
    return this.state.appointments;
  }

  bookAppointment(studentId, personalId, date, time, notes = '') {
    const student = this.getUsuario(studentId);
    const personal = this.getUsuario(personalId) || this.getActivePersonal();
    const id = 'apt_' + Date.now();

    const newAppointment = {
      id,
      studentId,
      studentName: student ? student.nome : 'Aluno',
      personalId: personal.id,
      personalName: personal.nome || personal.name || 'Personal',
      date,
      time,
      status: 'confirmado',
      notes
    };

    if (!this.state.appointments) this.state.appointments = [];
    this.state.appointments.push(newAppointment);

    this.addNotification({
      studentId,
      type: 'schedule_confirmed',
      title: 'Horário Agendado!',
      message: `Sua sessão com ${newAppointment.personalName} foi confirmada para ${date} às ${time}.`,
      priority: 'normal'
    });

    this.notify();
    return newAppointment;
  }

  cancelAppointment(appointmentId) {
    const apt = this.getAppointments().find(a => a.id === appointmentId);
    if (apt) {
      apt.status = 'cancelado';
      this.notify();
    }
  }

  completeAppointment(appointmentId) {
    const apt = this.getAppointments().find(a => a.id === appointmentId);
    if (apt) {
      apt.status = 'concluido';
      this.notify();
    }
  }

  getNotifications(studentId = null) {
    if (!this.state.notifications) this.state.notifications = [];
    if (studentId) {
      return this.state.notifications.filter(n => n.studentId === studentId);
    }
    return this.state.notifications;
  }

  getFrequencias(usuarioId = null) {
    if (!this.state.frequencias) this.state.frequencias = [];
    if (usuarioId) {
      return this.state.frequencias.filter(f => f.usuario_id === usuarioId);
    }
    return this.state.frequencias;
  }

  getFaltas(usuarioId, mesAno = null) {
    const freqs = this.getFrequencias(usuarioId);
    return freqs.filter(f => {
      if (f.status !== 'falta') return false;
      if (mesAno && f.data && !f.data.startsWith(mesAno)) return false;
      return true;
    });
  }

  adicionarFalta(usuarioId, data = null, motivo = '') {
    if (!this.state.frequencias) this.state.frequencias = [];
    const dataFalta = data || new Date().toISOString().split('T')[0];
    const novaFalta = {
      id: 'freq_' + Date.now(),
      usuario_id: usuarioId,
      data: dataFalta,
      status: 'falta',
      motivo: motivo || 'Falta registrada no treino'
    };
    this.state.frequencias.push(novaFalta);
    this.notify();
    return novaFalta;
  }

  removerFalta(usuarioId, faltaId = null) {
    if (!this.state.frequencias) this.state.frequencias = [];
    if (faltaId) {
      this.state.frequencias = this.state.frequencias.filter(f => f.id !== faltaId);
    } else {
      const idx = this.state.frequencias.findLastIndex(f => f.usuario_id === usuarioId && f.status === 'falta');
      if (idx !== -1) {
        this.state.frequencias.splice(idx, 1);
      }
    }
    this.notify();
  }

  getMensagensPersonal(filter = 'all') {
    if (!this.state.mensagens_personal) this.state.mensagens_personal = [];
    let list = [...this.state.mensagens_personal];
    if (filter === 'pendentes') {
      list = list.filter(m => m.status === 'pendente');
    } else if (filter === 'respondidas') {
      list = list.filter(m => m.status === 'respondida');
    }
    return list.sort((a, b) => {
      const prioridadePeso = { alta: 3, media: 2, baixa: 1 };
      const diff = (prioridadePeso[b.prioridade] || 1) - (prioridadePeso[a.prioridade] || 1);
      if (diff !== 0) return diff;
      return new Date(b.data) - new Date(a.data);
    });
  }

  enviarMensagemPersonal({ usuario_id, nomeAluno, nome_aluno, telefone, assunto, prioridade = 'media', mensagem }) {
    const targetId = usuario_id || this.currentUserId;
    this.sendChatMessage({
      studentId: targetId,
      senderRole: 'aluno',
      content: mensagem,
      subject: assunto || 'Dúvida de Treino',
      priority: prioridade || 'media'
    });
    return this.state.mensagens_personal[0];
  }

  marcarMensagemRespondida(msgId, respostaTexto = '') {
    if (!this.state.mensagens_personal) return;
    const msg = this.state.mensagens_personal.find(m => m.id === msgId);
    if (msg) {
      msg.status = 'respondida';
      msg.respondidaEm = new Date().toISOString();
      if (respostaTexto && respostaTexto.trim()) {
        this.sendChatMessage({
          studentId: msg.usuario_id,
          senderRole: 'personal',
          content: respostaTexto.trim(),
          subject: `Re: ${msg.assunto || 'Atendimento'}`,
          priority: msg.prioridade || 'media'
        });
      } else {
        this.notify();
      }
    }
  }

  addNotification(notif) {
    if (!this.state.notifications) this.state.notifications = [];
    const newNotif = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      studentId: notif.studentId,
      type: notif.type || 'system_info',
      title: notif.title,
      message: notif.message,
      date: notif.date || new Date().toISOString(),
      read: false,
      priority: notif.priority || 'normal'
    };
    this.state.notifications.unshift(newNotif);
    this.notify();
    return newNotif;
  }

  markNotificationAsRead(id) {
    const notif = (this.state.notifications || []).find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.notify();
    }
  }

  markAllNotificationsAsRead(studentId = null) {
    (this.state.notifications || []).forEach(n => {
      if (!studentId || n.studentId === studentId) {
        n.read = true;
      }
    });
    this.notify();
  }

  resetToDefaults() {
    removeStorage(STORAGE_KEY);
    this.state = JSON.parse(JSON.stringify(initialData));
    this.saveState();
    this.notify();
  }

  exportDataJson() {
    return JSON.stringify(this.state, null, 2);
  }

  formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatFutureDate(daysAhead) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return this.formatDate(d);
  }
}

export const store = new Store();
