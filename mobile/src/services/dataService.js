import { storage } from './storage';
import { initialData } from '../data/initialData';
import { hashPasswordSync, verifyPasswordSync, createInitialsAvatar } from '../utils/security';

const DB_KEY = 'fitmanager_mobile_database_v3';

export const dataService = {
  async getState() {
    let state = await storage.get(DB_KEY, null);
    if (!state) {
      state = JSON.parse(JSON.stringify(initialData));
      await storage.set(DB_KEY, state);
    }
    if (!state.planos || state.planos.length < 3) {
      state.planos = JSON.parse(JSON.stringify(initialData.planos));
      await storage.set(DB_KEY, state);
    }
    if (!state.turmas_jiujitsu || state.turmas_jiujitsu.length === 0) {
      state.turmas_jiujitsu = JSON.parse(JSON.stringify(initialData.turmas_jiujitsu));
    }
    if (!state.presencas_jiujitsu) state.presencas_jiujitsu = [];
    if (!state.frequencias) state.frequencias = [];
    if (!state.mensagens_personal) state.mensagens_personal = [];
    if (!state.mensagens_chat) state.mensagens_chat = [];

    if (Array.isArray(state.usuarios)) {
      state.usuarios = state.usuarios.filter(u => (u.email || '').toLowerCase() !== 'barbosaguilherme573@gmail.com');
      state.usuarios.forEach(u => {
        if (u.senha && !u.senha_hash) {
          u.senha_hash = hashPasswordSync(u.senha);
          delete u.senha;
        }
        if (u.tipo_usuario === 'ADMIN' || u.tipo_usuario === 'ADM' || u.tipo_usuario === 'PROFESSOR') {
          u.role = 'personal';
          u.tipo_usuario = 'PERSONAL';
        } else if (!u.role) {
          u.role = 'aluno';
        }
      });
    }
    return state;
  },

  async saveState(state) {
    return await storage.set(DB_KEY, state);
  },

  async hasAdmin() {
    const state = await this.getState();
    return (state.usuarios || []).some(u => u.role === 'personal' || u.tipo_usuario === 'PERSONAL' || u.tipo_usuario === 'ADMIN');
  },

  async getAdminUser() {
    const state = await this.getState();
    return (state.usuarios || []).find(u => u.role === 'personal' || u.tipo_usuario === 'PERSONAL' || u.tipo_usuario === 'ADMIN') || null;
  },

  async registerOwnerAccount({ nome, email, senha, telefone, cref = '', gymName = '', sexo = 'M' }) {
    const state = await this.getState();
    if (await this.hasAdmin()) {
      return {
        success: false,
        message: 'O perfil de Personal já está cadastrado no sistema.'
      };
    }

    if (!nome || !email || !senha || senha.trim().length < 6) {
      return { success: false, message: 'Preencha Nome, E-mail e uma Senha com pelo menos 6 caracteres.' };
    }

    const cleanEmail = email.toLowerCase().trim();
    if (state.usuarios.some(u => (u.email || '').toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Este e-mail já está sendo utilizado no sistema.' };
    }

    const newOwner = {
      id: 'personal_' + Date.now(),
      nome: nome.trim(),
      email: cleanEmail,
      senha_hash: hashPasswordSync(senha.trim()),
      telefone: (telefone || '').trim(),
      cref: (cref || '').trim(),
      sexo,
      role: 'personal',
      tipo_usuario: 'PERSONAL',
      avatar: createInitialsAvatar(nome.trim()),
      objetivoPrincipal: 'Personal Trainer & Responsável Técnico',
      lgpdConsent: true,
      dataCadastro: new Date().toISOString()
    };

    if (gymName && gymName.trim()) {
      state.gymConfig.name = gymName.trim();
    }

    state.usuarios.push(newOwner);
    await this.saveState(state);
    return { success: true, user: newOwner, role: 'admin' };
  },

  async registerStudent({ nome, email, senha, telefone, sexo = 'M', peso, altura, planoId, faixaJiuJitsu = 'Branca', lgpdAccepted = true, objetivoPrincipal }) {
    const state = await this.getState();
    if (!nome || !email || !senha || senha.trim().length < 6) {
      return { success: false, message: 'Preencha Nome, E-mail e Senha (mínimo 6 caracteres).' };
    }
    if (!lgpdAccepted) {
      return { success: false, message: 'É necessário aceitar os Termos de Uso e Política de Privacidade (LGPD).' };
    }

    const cleanEmail = email.toLowerCase().trim();
    if (state.usuarios.some(u => (u.email || '').toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Este e-mail já está cadastrado no sistema.' };
    }

    const numPeso = Number(peso) > 0 ? Number(peso) : 70;
    const numAltura = Number(altura) > 0 ? Number(altura) : 170;
    const validPlans = ['plan_academia', 'plan_jiujitsu', 'plan_academia_jiujitsu'];
    const selectedPlanId = validPlans.includes(planoId) ? planoId : 'plan_academia';
    const plano = (state.planos || []).find(p => p.id === selectedPlanId) || { valor: 120.00, nome: 'Plano Musculação' };

    const newStudent = {
      id: 'usr_' + Date.now(),
      nome: nome.trim(),
      email: cleanEmail,
      senha_hash: hashPasswordSync(senha.trim()),
      telefone: (telefone || '').trim(),
      sexo,
      role: 'aluno',
      tipo_usuario: 'ALUNO',
      peso: numPeso,
      altura: numAltura,
      plano_id: selectedPlanId,
      faixaJiuJitsu: faixaJiuJitsu || 'Branca',
      grausJiuJitsu: 0,
      diasTreinoSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      avatar: createInitialsAvatar(nome.trim()),
      objetivoPrincipal: objetivoPrincipal || 'Saúde e Condicionamento',
      lgpdConsent: true,
      lgpdConsentAt: new Date().toISOString(),
      dataCadastro: new Date().toISOString()
    };

    state.usuarios.push(newStudent);

    state.matriculas.push({
      id: 'mat_' + Date.now(),
      usuario_id: newStudent.id,
      plano_id: selectedPlanId,
      status: 'Ativa',
      inicio: new Date().toISOString().split('T')[0],
      termino: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]
    });

    state.faturas.push({
      id: 'fat_' + Date.now(),
      usuario_id: newStudent.id,
      valor: plano.valor,
      status: 'Pendente',
      descricao: `Mensalidade Inicial - ${plano.nome}`,
      dataVencimento: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      dataPagamento: null
    });

    state.avaliacoesFisicas.push({
      id: 'av_' + Date.now(),
      usuario_id: newStudent.id,
      data_avaliacao: new Date().toISOString().split('T')[0],
      peso: numPeso,
      altura: numAltura,
      gordura_corporal: 15.0,
      massa_muscular: 36.0,
      torax_cm: 95,
      braco_cm: 32,
      cintura_cm: 78,
      coxa_cm: 54,
      notes: 'Cadastro inicial do aluno'
    });

    const defaultW = initialData.workouts.default_template || {};
    if (!state.workouts[newStudent.id]) {
      state.workouts[newStudent.id] = JSON.parse(JSON.stringify(defaultW));
    }

    await this.saveState(state);
    return { success: true, user: newStudent, role: 'student' };
  },

  async loginUser(email, senha) {
    const state = await this.getState();
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPass = (senha || '').trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, message: 'Informe seu e-mail e senha.' };
    }

    const user = (state.usuarios || []).find(u => (u.email || '').toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'E-mail ou senha inválidos.' };
    }

    const valid = user.senha_hash ? verifyPasswordSync(cleanPass, user.senha_hash) : (user.senha === cleanPass);
    if (!valid) {
      return { success: false, message: 'E-mail ou senha inválidos.' };
    }

    const isPersonal = user.role === 'personal' || user.tipo_usuario === 'PERSONAL' || user.tipo_usuario === 'ADMIN';
    const role = isPersonal ? 'admin' : 'student';

    return { success: true, user, role };
  },

  async recoverPassword({ email, telefone, novaSenha }) {
    const state = await this.getState();
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPhone = (telefone || '').replace(/\D/g, '');

    if (!cleanEmail || !novaSenha || novaSenha.trim().length < 6) {
      return { success: false, message: 'Informe o e-mail, o telefone cadastrado e uma nova senha (mín. 6 caracteres).' };
    }

    const user = (state.usuarios || []).find(u => (u.email || '').toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'Não encontramos conta com este e-mail.' };
    }

    const userPhone = (user.telefone || '').replace(/\D/g, '');
    if (userPhone && cleanPhone && userPhone.slice(-4) !== cleanPhone.slice(-4)) {
      return { success: false, message: 'Os últimos dígitos do telefone não conferem com o cadastro.' };
    }

    user.senha_hash = hashPasswordSync(novaSenha.trim());
    delete user.senha;
    await this.saveState(state);
    return { success: true, message: 'Sua senha foi redefinida com sucesso!' };
  },

  async deleteStudentAccount(studentId) {
    const state = await this.getState();
    state.usuarios = (state.usuarios || []).filter(u => u.id !== studentId);
    state.matriculas = (state.matriculas || []).filter(m => m.usuario_id !== studentId);
    state.faturas = (state.faturas || []).filter(f => f.usuario_id !== studentId);
    state.avaliacoesFisicas = (state.avaliacoesFisicas || []).filter(a => a.usuario_id !== studentId);
    state.presencas_jiujitsu = (state.presencas_jiujitsu || []).filter(p => p.usuario_id !== studentId);
    state.mensagens_chat = (state.mensagens_chat || []).filter(m => m.studentId !== studentId);
    delete state.workouts[studentId];
    await this.saveState(state);
    return { success: true };
  },

  async getStudents() {
    const state = await this.getState();
    const currentMonthStr = new Date().toISOString().substring(0, 7);

    return (state.usuarios || [])
      .filter(u => u.role === 'aluno' || u.tipo_usuario === 'ALUNO' || u.tipo_usuario === 'ALUNOS')
      .map(u => {
        const mat = (state.matriculas || []).find(m => m.usuario_id === u.id);
        const planoId = mat ? mat.plano_id : (u.plano_id || 'plan_academia');
        const plano = (state.planos || []).find(p => p.id === planoId) || { nome: 'Plano Musculação', valor: 120.00 };

        const faturas = (state.faturas || []).filter(f => f.usuario_id === u.id);
        const hasPaidThisMonth = faturas.some(f => f.status === 'Pago' && f.dataPagamento && f.dataPagamento.startsWith(currentMonthStr));
        const pendingFatura = faturas.find(f => f.status === 'Pendente' || f.status === 'Aguardando Confirmação');

        const faltas = (state.frequencias || []).filter(f => f.usuario_id === u.id && f.status === 'falta');
        const presencasJJ = (state.presencas_jiujitsu || []).filter(p => p.usuario_id === u.id);
        const avaliacoes = (state.avaliacoesFisicas || []).filter(a => a.usuario_id === u.id);
        const ultimaAv = avaliacoes[avaliacoes.length - 1];

        return {
          ...u,
          currentWeight: u.peso || (ultimaAv ? ultimaAv.peso : 75),
          heightCm: u.altura || (ultimaAv ? ultimaAv.altura : 175),
          planoNome: plano.nome,
          planoValor: plano.valor,
          faixaJiuJitsu: u.faixaJiuJitsu || 'Branca',
          grausJiuJitsu: Number(u.grausJiuJitsu || 0),
          presencasJiuJitsuCount: presencasJJ.length,
          diasTreinoSemana: Array.isArray(u.diasTreinoSemana) ? u.diasTreinoSemana : ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
          isPaidThisMonth: hasPaidThisMonth || !pendingFatura,
          pendingFaturaId: pendingFatura ? pendingFatura.id : null,
          faltasCount: faltas.length
        };
      });
  },

  async setStudentTrainingDays(studentId, daysArray) {
    const state = await this.getState();
    const u = (state.usuarios || []).find(item => item.id === studentId);
    if (u && Array.isArray(daysArray)) {
      u.diasTreinoSemana = daysArray;
      await this.saveState(state);
      return u.diasTreinoSemana;
    }
    return [];
  },

  async getTurmasJiuJitsu() {
    const state = await this.getState();
    return state.turmas_jiujitsu || [];
  },

  async addTurmaJiuJitsu({ nome, dias, horario, faixa = 'Todas as Faixas' }) {
    const state = await this.getState();
    if (!state.turmas_jiujitsu) state.turmas_jiujitsu = [];
    const novaTurma = {
      id: 'turma_jj_' + Date.now(),
      nome: (nome || 'Turma Jiu-Jítsu').trim(),
      dias: (dias || 'Segunda, Quarta e Sexta').trim(),
      horario: (horario || '19:30 - 21:00').trim(),
      professor: 'Personal / Mestre',
      faixa
    };
    state.turmas_jiujitsu.push(novaTurma);
    await this.saveState(state);
    return novaTurma;
  },

  async registrarPresencaJiuJitsu({ usuario_id, turma_id, data = null }) {
    const state = await this.getState();
    if (!state.presencas_jiujitsu) state.presencas_jiujitsu = [];
    const turma = (state.turmas_jiujitsu || []).find(t => t.id === turma_id);
    const nova = {
      id: 'pres_jj_' + Date.now(),
      usuario_id,
      turma_id,
      turma_nome: turma ? turma.nome : 'Treino de Jiu-Jítsu',
      data: data || new Date().toISOString().split('T')[0],
      confirmado: true
    };
    state.presencas_jiujitsu.unshift(nova);
    await this.saveState(state);
    return nova;
  },

  async getPresencasJiuJitsu(studentId = null) {
    const state = await this.getState();
    const list = state.presencas_jiujitsu || [];
    if (!studentId) return list;
    return list.filter(p => p.usuario_id === studentId);
  },

  async atualizarGraduacaoJiuJitsu(studentId, faixa, graus) {
    const state = await this.getState();
    const u = (state.usuarios || []).find(item => item.id === studentId);
    if (u) {
      u.faixaJiuJitsu = faixa;
      u.grausJiuJitsu = Math.max(0, Math.min(4, Number(graus) || 0));
      await this.saveState(state);
      return true;
    }
    return false;
  },

  async getChatMessages(studentId) {
    const state = await this.getState();
    const all = state.mensagens_chat || [];
    if (!studentId) return all;
    return all
      .filter(m => m.studentId === studentId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  async sendChatMessage({ studentId, senderRole, senderName, text }) {
    const state = await this.getState();
    if (!state.mensagens_chat) state.mensagens_chat = [];
    const msg = {
      id: 'chat_' + Date.now(),
      studentId,
      senderRole: senderRole === 'admin' || senderRole === 'personal' ? 'personal' : 'aluno',
      senderName: senderName || 'Usuário',
      text: (text || '').trim(),
      createdAt: new Date().toISOString()
    };
    state.mensagens_chat.push(msg);
    await this.saveState(state);
    return msg;
  },

  async addFalta(studentId, date = null, motivo = 'Falta no treino') {
    const state = await this.getState();
    if (!state.frequencias) state.frequencias = [];

    const novaFalta = {
      id: 'freq_' + Date.now(),
      usuario_id: studentId,
      data: date || new Date().toISOString().split('T')[0],
      status: 'falta',
      motivo
    };

    state.frequencias.push(novaFalta);
    await this.saveState(state);
    return novaFalta;
  },

  async removeFalta(studentId) {
    const state = await this.getState();
    if (!state.frequencias) return false;

    const idx = [...state.frequencias].reverse().findIndex(f => f.usuario_id === studentId && f.status === 'falta');
    if (idx !== -1) {
      const realIndex = state.frequencias.length - 1 - idx;
      state.frequencias.splice(realIndex, 1);
      await this.saveState(state);
      return true;
    }
    return false;
  },

  async informarPagamentoPix(faturaId) {
    const state = await this.getState();
    const fatura = (state.faturas || []).find(f => f.id === faturaId);
    if (fatura) {
      fatura.status = 'Aguardando Confirmação';
      await this.saveState(state);
      return true;
    }
    return false;
  },

  async markPaymentPaid(faturaId) {
    const state = await this.getState();
    const fatura = (state.faturas || []).find(f => f.id === faturaId);
    if (fatura) {
      fatura.status = 'Pago';
      fatura.dataPagamento = new Date().toISOString().split('T')[0];
      await this.saveState(state);
      return true;
    }
    return false;
  },

  async copyWorkoutToStudent(sourceStudentId, targetStudentId, dayScope = 'ALL') {
    const state = await this.getState();
    if (!sourceStudentId || !targetStudentId || sourceStudentId === targetStudentId) {
      return { success: false, message: 'Selecione um aluno de destino diferente do aluno de origem.' };
    }
    const sourceWorkouts = state.workouts[sourceStudentId];
    if (!sourceWorkouts) {
      return { success: false, message: 'O aluno de origem ainda não possui treino cadastrado.' };
    }
    if (!state.workouts[targetStudentId]) {
      state.workouts[targetStudentId] = {};
    }
    if (dayScope === 'ALL') {
      state.workouts[targetStudentId] = JSON.parse(JSON.stringify(sourceWorkouts));
    } else if (sourceWorkouts[dayScope]) {
      state.workouts[targetStudentId][dayScope] = JSON.parse(JSON.stringify(sourceWorkouts[dayScope]));
    }
    await this.saveState(state);
    return { success: true, message: 'Treino copiado e aplicado com sucesso!' };
  },

  async getCoachMessages(filter = 'all') {
    const state = await this.getState();
    let msgs = [...(state.mensagens_personal || [])];

    if (filter === 'pendentes') {
      msgs = msgs.filter(m => m.status === 'pendente');
    } else if (filter === 'respondidas') {
      msgs = msgs.filter(m => m.status === 'respondida');
    }

    const prioridadePeso = { alta: 3, media: 2, baixa: 1 };
    return msgs.sort((a, b) => {
      const diff = (prioridadePeso[b.prioridade] || 1) - (prioridadePeso[a.prioridade] || 1);
      if (diff !== 0) return diff;
      return new Date(b.data) - new Date(a.data);
    });
  },

  async sendCoachMessage({ usuario_id, nomeAluno, telefone, assunto, prioridade = 'media', mensagem }) {
    const state = await this.getState();
    if (!state.mensagens_personal) state.mensagens_personal = [];

    const now = new Date();
    const dataFormatada = 'Hoje às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: 'msg_' + Date.now(),
      usuario_id,
      nomeAluno: nomeAluno || 'Aluno',
      telefone: telefone || '',
      assunto: assunto || 'Dúvida com o Personal',
      prioridade,
      mensagem: mensagem.trim(),
      status: 'pendente',
      data: now.toISOString(),
      dataFormatada
    };

    state.mensagens_personal.unshift(newMsg);
    await this.saveState(state);
    return newMsg;
  },

  async resolveCoachMessage(msgId) {
    const state = await this.getState();
    const msg = (state.mensagens_personal || []).find(m => m.id === msgId);
    if (msg) {
      msg.status = 'respondida';
      msg.respondidaEm = new Date().toISOString();
      await this.saveState(state);
      return true;
    }
    return false;
  },

  async getWorkoutForStudent(studentId, day = 'Segunda') {
    const state = await this.getState();
    const defaultW = initialData.workouts.default_template || {};
    const userWorkouts = state.workouts[studentId] || defaultW;
    return userWorkouts[day] || { title: `Treino de ${day}`, exercises: [] };
  },

  async toggleExerciseDone(studentId, day, exerciseId) {
    const state = await this.getState();
    if (!state.workouts[studentId]) {
      state.workouts[studentId] = JSON.parse(JSON.stringify(initialData.workouts.default_template || {}));
    }
    const dayWorkout = state.workouts[studentId][day];
    if (dayWorkout) {
      const ex = dayWorkout.exercises.find(e => e.id === exerciseId);
      if (ex) {
        ex.done = !ex.done;
        await this.saveState(state);
        return ex.done;
      }
    }
    return false;
  },

  async updateExerciseLoad(studentId, day, exerciseId, newLoadKg) {
    const state = await this.getState();
    if (!state.workouts[studentId]) {
      state.workouts[studentId] = JSON.parse(JSON.stringify(initialData.workouts.default_template || {}));
    }
    if (state.workouts[studentId] && state.workouts[studentId][day]) {
      const ex = state.workouts[studentId][day].exercises.find(e => e.id === exerciseId);
      if (ex) {
        const parsed = Number(String(newLoadKg).replace(',', '.'));
        const validLoad = Number.isFinite(parsed) ? Math.max(0, Number(parsed.toFixed(1))) : ex.loadKg;
        const prevRecord = Number(ex.recordeKg || ex.loadKg || 0);
        ex.loadKg = validLoad;
        ex.recordeKg = Math.max(prevRecord, validLoad);
        ex.ultimaCargaEm = new Date().toLocaleDateString('pt-BR');
        await this.saveState(state);
        return ex.loadKg;
      }
    }
    return null;
  },

  async getGymConfig() {
    const state = await this.getState();
    return state.gymConfig || initialData.gymConfig;
  },

  async updateGymConfig(newConfig) {
    const state = await this.getState();
    state.gymConfig = { ...state.gymConfig, ...newConfig };
    await this.saveState(state);
    return state.gymConfig;
  }
};
