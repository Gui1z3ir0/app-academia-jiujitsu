export const initialData = {
  gymConfig: {
    name: 'Sua Academia & Jiu-Jítsu',
    slogan: 'Força, Técnica & Alta Performance',
    logoText: 'FIT',
    primaryColor: '#00F59B',
    secondaryColor: '#00E5FF',
    phone: '(11) 99999-9999',
    whatsapp: '11999999999',
    email: 'contato@sua-academia.com.br',
    supportEmail: 'suporte@sua-academia.com.br',
    pixKey: 'financeiro@sua-academia.com.br',
    paymentGateway: 'mercadopago',
    address: 'Configure o endereço da sua unidade no painel do Personal',
    workingHoursWeekdays: '06:00 às 22:00',
    workingHoursSaturdays: '08:00 às 16:00',
    workingHoursSundays: '09:00 às 13:00',
    announcements: 'Horários de treinos de Musculação e Jiu-Jítsu disponíveis no aplicativo.'
  },

  planos: [
    {
      id: 'plan_academia',
      nome: 'Plano Musculação',
      modalidade: 'musculacao',
      valor: 120.00,
      periodo: 'Mensal',
      descricao: 'Acesso completo e ilimitado à sala de musculação, ficha personalizada e acompanhamento do Personal.',
      features: ['Musculação livre todos os dias', 'Ficha de treino por dias da semana', 'Avaliação e bioimpedância', 'Chat interno com o Personal']
    },
    {
      id: 'plan_jiujitsu',
      nome: 'Plano Jiu-Jítsu',
      modalidade: 'jiujitsu',
      valor: 130.00,
      periodo: 'Mensal',
      descricao: 'Treinamento completo de Jiu-Jítsu (Gi e No-Gi), controle de presença nas turmas e evolução de faixa e graus.',
      features: ['Todas as turmas de Jiu-Jítsu (Gi e No-Gi)', 'Controle de presença e graduação de faixa', 'Horários de turmas no app', 'Chat direto com o Mestre / Personal']
    },
    {
      id: 'plan_academia_jiujitsu',
      nome: 'Plano Completo (Musculação + Jiu-Jítsu)',
      modalidade: 'completo',
      valor: 150.00,
      periodo: 'Mensal',
      descricao: 'O pacote completo: musculação ilimitada + todas as turmas de Jiu-Jítsu e controle de graduação.',
      features: ['Musculação livre todos os dias', 'Todas as aulas de Jiu-Jítsu (Gi e No-Gi)', 'Controle de faixa, graus e presença', 'Suporte prioritário no chat do app']
    }
  ],

  turmas_jiujitsu: [
    { id: 'turma_jj_1', nome: 'Jiu-Jítsu Fundamentos (Gi)', dias: 'Segunda, Quarta e Sexta', horario: '19:00 - 20:15', professor: 'Personal / Mestre', faixa: 'Todas as Faixas' },
    { id: 'turma_jj_2', nome: 'Jiu-Jítsu Avançado & Competição (Gi)', dias: 'Segunda, Quarta e Sexta', horario: '20:30 - 22:00', professor: 'Personal / Mestre', faixa: 'Azul a Preta' },
    { id: 'turma_jj_3', nome: 'Submission / No-Gi', dias: 'Terça e Quinta', horario: '19:30 - 21:00', professor: 'Personal / Mestre', faixa: 'Todas as Faixas' },
    { id: 'turma_jj_4', nome: 'Treino Livre & Randori (Tatame Aberto)', dias: 'Sábado', horario: '10:00 - 12:00', professor: 'Personal / Mestre', faixa: 'Todas as Faixas' }
  ],

  presencas_jiujitsu: [],
  usuarios: [],
  matriculas: [],
  faturas: [],
  frequencias: [],
  mensagens_personal: [],
  mensagens_chat: [],
  avaliacoesFisicas: [],

  workouts: {
    default_template: {
      Segunda: {
        title: 'Treino A - Peitoral, Tríceps & Ombros',
        exercises: [
          { id: 'ex_1', name: 'Supino Reto com Barra', sets: 4, reps: '10-12', loadKg: 60, restSeconds: 60, done: false },
          { id: 'ex_2', name: 'Supino Inclinado com Halteres', sets: 3, reps: '10-12', loadKg: 22, restSeconds: 60, done: false },
          { id: 'ex_3', name: 'Crucifixo na Polia (Cross)', sets: 3, reps: '12-15', loadKg: 18, restSeconds: 45, done: false },
          { id: 'ex_4', name: 'Desenvolvimento Militar Halteres', sets: 4, reps: '10-12', loadKg: 16, restSeconds: 60, done: false },
          { id: 'ex_5', name: 'Tríceps Corda na Polia', sets: 4, reps: '12-15', loadKg: 25, restSeconds: 45, done: false }
        ]
      },
      Terça: {
        title: 'Treino B - Dorsais, Bíceps & Antebraço',
        exercises: [
          { id: 'ex_6', name: 'Puxada Frontal Alta', sets: 4, reps: '10-12', loadKg: 55, restSeconds: 60, done: false },
          { id: 'ex_7', name: 'Remada Baixa Triângulo', sets: 4, reps: '10-12', loadKg: 50, restSeconds: 60, done: false },
          { id: 'ex_8', name: 'Rosca Direta Barra W', sets: 3, reps: '10-12', loadKg: 20, restSeconds: 60, done: false },
          { id: 'ex_9', name: 'Rosca Martelo com Halteres', sets: 3, reps: '12-15', loadKg: 14, restSeconds: 45, done: false }
        ]
      },
      Quarta: {
        title: 'Treino C - Membros Inferiores & Abdômen',
        exercises: [
          { id: 'ex_10', name: 'Agachamento Livre', sets: 4, reps: '8-10', loadKg: 70, restSeconds: 90, done: false },
          { id: 'ex_11', name: 'Leg Press 45°', sets: 4, reps: '10-12', loadKg: 180, restSeconds: 75, done: false },
          { id: 'ex_12', name: 'Cadeira Extensora', sets: 3, reps: '12-15', loadKg: 50, restSeconds: 45, done: false },
          { id: 'ex_13', name: 'Mesa Flexora', sets: 4, reps: '10-12', loadKg: 40, restSeconds: 45, done: false }
        ]
      },
      Quinta: {
        title: 'Treino de Jiu-Jítsu (Técnica & Sparring)',
        exercises: [
          { id: 'ex_14', name: 'Aquecimento Específico & Drills de Passagem', sets: 3, reps: '5 min', loadKg: 0, restSeconds: 60, done: false },
          { id: 'ex_15', name: 'Posição do Dia: Raspagem da Meia Guarda', sets: 5, reps: '10 reps', loadKg: 0, restSeconds: 45, done: false },
          { id: 'ex_16', name: 'Rola / Sparring Controlado (5 rounds x 5 min)', sets: 5, reps: '5 min', loadKg: 0, restSeconds: 60, done: false }
        ]
      },
      Sexta: {
        title: 'Treino A2 - Peito, Deltoides & Tríceps',
        exercises: [
          { id: 'ex_17', name: 'Supino Reto Halteres', sets: 4, reps: '10-12', loadKg: 24, restSeconds: 60, done: false },
          { id: 'ex_18', name: 'Elevação Lateral Halteres', sets: 4, reps: '12-15', loadKg: 10, restSeconds: 45, done: false },
          { id: 'ex_19', name: 'Tríceps Testa com Barra W', sets: 3, reps: '10-12', loadKg: 18, restSeconds: 60, done: false }
        ]
      },
      Sábado: {
        title: 'Treino Livre / Sparring de Jiu-Jítsu',
        exercises: [
          { id: 'ex_20', name: 'Treino de Defesa Pessoal e Finalizações', sets: 4, reps: '10 min', loadKg: 0, restSeconds: 60, done: false },
          { id: 'ex_21', name: 'Alongamento & Mobilidade Articular', sets: 1, reps: '20 min', loadKg: 0, restSeconds: 0, done: false }
        ]
      }
    }
  }
};
