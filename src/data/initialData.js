export const initialData = {
  gymConfig: {
    name: 'Academia & Jiu-Jítsu Pro',
    slogan: 'Treinamento, Performance & Artes Marciais',
    logoText: 'ACADEMIA PRO',
    primaryColor: '#00F59B',
    phone: '',
    whatsapp: '',
    email: '',
    pixKey: '',
    pixMerchantName: 'ACADEMIA PRO',
    pixMerchantCity: 'SAO PAULO',
    paymentGateway: 'mercadopago',
    address: '',
    workingHoursWeekdays: '06:00 às 22:00',
    workingHoursSaturdays: '08:00 às 16:00',
    workingHoursSundays: '08:00 às 12:00',
    announcements: 'Confira a grade atualizada de Musculação e as turmas de Jiu-Jítsu diretamente pelo aplicativo.'
  },

  usuarios: [],

  planos: [
    {
      id: 'plan_academia',
      nome: 'Plano Musculação',
      modalidade: 'musculacao',
      valor: 120.00,
      duracao: 'Mensal',
      beneficios: [
        'Acesso livre à sala de musculação e equipamentos',
        'Ficha de treino digital personalizada por dias da semana',
        'Avaliação física, bioimpedância e chat direto com o Personal'
      ],
      popular: false,
      active: true
    },
    {
      id: 'plan_jiujitsu',
      nome: 'Plano Jiu-Jítsu',
      modalidade: 'jiujitsu',
      valor: 130.00,
      duracao: 'Mensal',
      beneficios: [
        'Acesso a todas as turmas de Jiu-Jítsu (Gi e No-Gi)',
        'Controle de graduação (faixa, graus e presenças nas aulas)',
        'Grade de horários de turmas e chat direto com o Personal'
      ],
      popular: false,
      active: true
    },
    {
      id: 'plan_academia_jiujitsu',
      nome: 'Plano Completo (Musculação + Jiu-Jítsu)',
      modalidade: 'completo',
      valor: 150.00,
      duracao: 'Mensal',
      beneficios: [
        'Acesso total à Musculação + todas as turmas de Jiu-Jítsu (Gi e No-Gi)',
        'Ficha de musculação + controle de faixa, graus e chamada no tatame',
        'Acompanhamento prioritário e chat integrado no aplicativo'
      ],
      popular: true,
      active: true
    }
  ],

  turmas_jiujitsu: [
    {
      id: 'turma_jj_1',
      nome: 'Jiu-Jítsu Fundamentos (Gi)',
      modalidade: 'Gi (Com Kimono)',
      dias: ['Segunda', 'Quarta', 'Sexta'],
      horario: '19:00',
      professor: 'Personal / Instrutor Chefe',
      capacidade: 25
    },
    {
      id: 'turma_jj_2',
      nome: 'Jiu-Jítsu Todos os Níveis & Sparring (Gi)',
      modalidade: 'Gi (Com Kimono)',
      dias: ['Segunda', 'Quarta', 'Sexta'],
      horario: '20:30',
      professor: 'Personal / Instrutor Chefe',
      capacidade: 30
    },
    {
      id: 'turma_jj_3',
      nome: 'Submission & No-Gi (Sem Kimono)',
      modalidade: 'No-Gi (Sem Kimono)',
      dias: ['Terça', 'Quinta'],
      horario: '19:30',
      professor: 'Personal / Instrutor Chefe',
      capacidade: 25
    },
    {
      id: 'turma_jj_4',
      nome: 'Open Mat & Treino Livre',
      modalidade: 'Todos os Níveis',
      dias: ['Sábado'],
      horario: '10:00',
      professor: 'Personal / Instrutor Chefe',
      capacidade: 40
    }
  ],

  presencas_jiujitsu: [],

  matriculas: [],

  treinos: [],

  exercicios: [],

  avaliacoes_fisicas: [],

  faturas: [],

  pagamentos: [],

  frequencias: [],

  mensagens_personal: [],

  mensagens_chat: [],

  feedbacks: [],

  appointments: [],

  notifications: []
};
