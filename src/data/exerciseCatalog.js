export const exerciseCatalog = [
  {
    id: "catalog_bench_press",
    name: "Supino Reto com Barra",
    muscleGroup: "Peitoral",
    secondaryMuscles: ["Tríceps Braquial", "Deltoide Anterior"],
    category: "Composto",
    difficulty: "Intermediário",
    equipment: "Barra e Banco Plano",
    defaultSets: 4,
    defaultReps: "8-10",
    defaultRest: 90,
    instructions: [
      "Deite-se no banco com os olhos diretamente alinhados abaixo da barra.",
      "Aduza e deprima as escápulas ('trave os ombros para trás e para baixo').",
      "Segure a barra com uma pegada um pouco mais larga que a largura dos ombros.",
      "Desça a barra controladamente inspirando até tocar de leve na altura dos mamilos.",
      "Empurre a barra expirando o ar, estendendo os cotovelos sem hiperextender."
    ],
    tips: "Mantenha os pés firmemente plantados no chão para estabilização de glúteos e core.",
    mistakes: ["Abrir demais os cotovelos a 90° (risco de lesão no manguito)", "Bater a barra no peito para ganhar impulso", "Tirar o quadril do banco"],
    illustrationType: "bench_press"
  },
  {
    id: "catalog_squat",
    name: "Agachamento Livre com Barra",
    muscleGroup: "Quadríceps & Glúteos",
    secondaryMuscles: ["Posteriores de Coxa", "Eretores da Espinha", "Core"],
    category: "Composto",
    difficulty: "Avançado",
    equipment: "Gaiola de Agachamento e Barra Olímpica",
    defaultSets: 4,
    defaultReps: "8-10",
    defaultRest: 120,
    instructions: [
      "Apoie a barra sobre o trapézio (posição high bar ou low bar) com pegada firme.",
      "Posicione os pés na largura dos ombros ou ligeiramente mais afastados, pontas levemente apontadas para fora.",
      "Inspire fundo, trave o abdômen (manobra de Valsalva).",
      "Inicie o movimento projetando o quadril para trás e flexionando os joelhos em direção à ponta dos pés.",
      "Desça até que o quadril fique na mesma linha ou ligeiramente abaixo dos joelhos (quebrar o paralelo).",
      "Empurre o chão através dos calcanhares para retornar à posição inicial."
    ],
    tips: "Não deixe os joelhos desabarem para dentro (valgo dinâmico). Empurre os joelhos para fora durante a subida.",
    mistakes: ["Tirar os calcanhares do solo", "Arredondar a coluna lombar (butt wink excessivo)", "Descer com tronco excessivamente inclinado à frente"],
    illustrationType: "squat"
  },
  {
    id: "catalog_lat_pulldown",
    name: "Puxada Alta no Pulley",
    muscleGroup: "Dorsais",
    secondaryMuscles: ["Bíceps Braquial", "Romboides", "Deltoide Posterior"],
    category: "Composto",
    difficulty: "Iniciante/Intermediário",
    equipment: "Aparelho Pulley / Puxador",
    defaultSets: 4,
    defaultReps: "10-12",
    defaultRest: 75,
    instructions: [
      "Ajuste os roletes da coxa para fixar bem as pernas no banco.",
      "Segure a barra com pegada pronada aberta.",
      "Incline o tronco levemente para trás (10° a 15°) e abra o peito.",
      "Puxe a barra em direção à clavícula focando em esmagar as escápulas para trás e para baixo.",
      "Suba controlando o peso até estender os braços e alongar as dorsais."
    ],
    tips: "Pense em puxar com os cotovelos para baixo e para trás, e não com a força dos braços.",
    mistakes: ["Jogar o tronco excessivamente para trás usando embalo", "Puxar a barra atrás da nuca", "Subir os ombros perto das orelhas"],
    illustrationType: "lat_pulldown"
  },
  {
    id: "catalog_deadlift",
    name: "Levantamento Terra (Deadlift)",
    muscleGroup: "Cadeia Posterior",
    secondaryMuscles: ["Glúteos", "Posteriores", "Dorsais", "Trapézio", "Antebraços"],
    category: "Composto",
    difficulty: "Avançado",
    equipment: "Barra e Anilhas Olímpicas",
    defaultSets: 3,
    defaultReps: "6-8",
    defaultRest: 150,
    instructions: [
      "Posicione-se com os pés na largura do quadril, barra tocando as canelas.",
      "Incline o tronco flexionando o quadril mantendo a coluna 100% alinhada.",
      "Segure a barra com pegada pronada ou mista por fora das pernas.",
      "Contraia as dorsais e empurre o chão com os pés estendendo quadril e joelhos simultaneamente.",
      "Finalize em posição vertical com peito aberto sem hiperestender a lombar."
    ],
    tips: "A barra deve viajar em linha reta colada nas pernas o tempo todo.",
    mistakes: ["Curvar as costas (lombar de gato)", "Puxar a barra longe do corpo", "Agachar o movimento transformando em agachamento"],
    illustrationType: "deadlift"
  },
  {
    id: "catalog_shoulder_press",
    name: "Desenvolvimento com Halteres",
    muscleGroup: "Deltoide Anterior & Lateral",
    secondaryMuscles: ["Tríceps Braquial", "Trapézio Superior"],
    category: "Composto",
    difficulty: "Intermediário",
    equipment: "Banco a 75°-80° e Halteres",
    defaultSets: 4,
    defaultReps: "10-12",
    defaultRest: 75,
    instructions: [
      "Sente-se no banco com o encosto ajustado quase vertical.",
      "Eleve os halteres até a altura das orelhas com cotovelos em ângulo de cerca de 75° em relação ao tronco.",
      "Empurre os halteres para cima até os braços ficarem estendidos acima da cabeça em um arco suave.",
      "Desça de forma controlada até os halteres atingirem a linha do queixo/orelhas."
    ],
    tips: "Não deixe a lombar descolar excessivamente do encosto do banco.",
    mistakes: ["Bater os halteres com força no topo", "Alinhar os cotovelos a 90° retos para o lado gerando atrito no ombro"],
    illustrationType: "shoulder_press"
  },
  {
    id: "catalog_leg_press",
    name: "Leg Press 45°",
    muscleGroup: "Quadríceps",
    secondaryMuscles: ["Glúteos", "Posteriores"],
    category: "Composto",
    difficulty: "Iniciante/Intermediário",
    equipment: "Aparelho Leg Press 45°",
    defaultSets: 4,
    defaultReps: "12-15",
    defaultRest: 90,
    instructions: [
      "Sente-se no aparelho com o quadril e costas firmemente colados no encosto.",
      "Posicione os pés na plataforma na largura dos ombros.",
      "Destrave a máquina e desça a plataforma flexionando os joelhos em direção aos ombros até formar ângulo de 90°.",
      "Empurre a plataforma usando toda a sola dos pés sem esticar os joelhos até travar a articulação."
    ],
    tips: "Segure firme nas alças laterais para impedir que o quadril levante do assento durante a descida.",
    mistakes: ["Tirar o cóccix/lombar do banco no ponto mais baixo", "Trancar os joelhos (hiperextensão)", "Colocar as mãos sobre os joelhos"],
    illustrationType: "leg_press"
  },
  {
    id: "catalog_biceps_curl",
    name: "Rosca Direta com Barra W",
    muscleGroup: "Bíceps",
    secondaryMuscles: ["Braquiorradial", "Flexores do Punho"],
    category: "Isolador",
    difficulty: "Iniciante",
    equipment: "Barra W e Anilhas",
    defaultSets: 3,
    defaultReps: "10-12",
    defaultRest: 60,
    instructions: [
      "Fique em pé com os pés na largura dos ombros, segurando a barra W nas curvaturas confortáveis.",
      "Mantenha os cotovelos colados junto ao tronco.",
      "Flexione os cotovelos trazendo a barra em direção ao peito.",
      "Aperte o bíceps no topo da contração por 1 segundo.",
      "Desça lentamente controlando a fase excêntrica até a extensão quase completa."
    ],
    tips: "Evite jogar o quadril para frente para roubar o peso.",
    mistakes: ["Balançar o tronco", "Projetar os cotovelos para frente durante a subida", "Deixar os punhos flexionarem para trás"],
    illustrationType: "biceps_curl"
  },
  {
    id: "catalog_triceps_rope",
    name: "Tríceps Corda no Crossover",
    muscleGroup: "Tríceps (Cabeça Lateral)",
    secondaryMuscles: ["Antebraços"],
    category: "Isolador",
    difficulty: "Iniciante",
    equipment: "Polia Alta e Corda",
    defaultSets: 4,
    defaultReps: "12-15",
    defaultRest: 45,
    instructions: [
      "Prenda a corda na polia alta. Dê um passo atrás e incline o tronco ligeiramente para frente.",
      "Fixe os cotovelos colados às costelas.",
      "Empurre a corda para baixo estendendo os braços.",
      "Na parte mais baixa, abra as pontas da corda para fora para máxima contração da cabeça lateral do tríceps.",
      "Retorne até os antebraços formarem ângulo de 90°."
    ],
    tips: "Mantenha o ombro estático: apenas a articulação do cotovelo deve se mover.",
    mistakes: ["Mexer os braços inteiros para frente e para trás", "Subir o peso até os ombros perdendo a tensão"],
    illustrationType: "triceps_rope"
  }
];
