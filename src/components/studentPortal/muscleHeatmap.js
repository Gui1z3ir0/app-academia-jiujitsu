export function renderMuscleHeatmap(day = 'Segunda') {
  const muscleConfigs = {
    'Segunda': {
      title: 'Peitoral, Tríceps & Deltoide Anterior',
      primary: 'Peitoral Maior',
      secondary: 'Tríceps Braquial & Ombros',
      chestActive: true,
      tricepsActive: true,
      backActive: false,
      bicepsActive: false,
      quadsActive: false,
      glutesActive: false,
      shouldersActive: true,
      absActive: false
    },
    'Terça': {
      title: 'Dorsais, Trapézio & Bíceps',
      primary: 'Latíssimo do Dorso (Costas)',
      secondary: 'Bíceps & Trapézio',
      chestActive: false,
      tricepsActive: false,
      backActive: true,
      bicepsActive: true,
      quadsActive: false,
      glutesActive: false,
      shouldersActive: false,
      absActive: false
    },
    'Quarta': {
      title: 'Quadríceps, Glúteos & Panturrilhas',
      primary: 'Quadríceps & Glúteos',
      secondary: 'Posterior & Panturrilhas',
      chestActive: false,
      tricepsActive: false,
      backActive: false,
      bicepsActive: false,
      quadsActive: true,
      glutesActive: true,
      shouldersActive: false,
      absActive: false
    },
    'Quinta': {
      title: 'Deltoides, Trapézio & Abdômen',
      primary: 'Deltoides (Ombros)',
      secondary: 'Abdômen & Core',
      chestActive: false,
      tricepsActive: false,
      backActive: false,
      bicepsActive: false,
      quadsActive: false,
      glutesActive: false,
      shouldersActive: true,
      absActive: true
    },
    'Sexta': {
      title: 'Superiores Completo & Funcional',
      primary: 'Peitoral & Costas',
      secondary: 'Braços & Core',
      chestActive: true,
      tricepsActive: true,
      backActive: true,
      bicepsActive: true,
      quadsActive: false,
      glutesActive: false,
      shouldersActive: false,
      absActive: true
    },
    'Sábado': {
      title: 'Cardio & Mobilidade Geral',
      primary: 'Sistema Cardiovascular',
      secondary: 'Core & Articulações',
      chestActive: false,
      tricepsActive: false,
      backActive: false,
      bicepsActive: false,
      quadsActive: false,
      glutesActive: false,
      shouldersActive: false,
      absActive: false
    },
    'Domingo': {
      title: 'Recuperação Muscular (Rest Day)',
      primary: 'Regeneração das Fibras',
      secondary: 'Descanso e Nutrição',
      chestActive: false,
      tricepsActive: false,
      backActive: false,
      bicepsActive: false,
      quadsActive: false,
      glutesActive: false,
      shouldersActive: false,
      absActive: false
    }
  };

  const cfg = muscleConfigs[day] || muscleConfigs['Segunda'];

  const activeColor = '#00F59B';
  const inactiveColor = '#1C273C';
  const secondaryColor = '#00E5FF';

  return `
    <div class="glass-panel" style="padding: 20px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 14px;">
        <div>
          <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--neon-cyan); font-weight: 700; letter-spacing: 1px;">
            MAPA DE ATIVAÇÃO MUSCULAR
          </span>
          <h3 style="font-size: 1.15rem; margin-top: 2px;">${cfg.title}</h3>
        </div>
        <div style="display: flex; gap: 6px;">
          <span class="badge badge-success">${cfg.primary}</span>
          <span class="badge badge-cyan">${cfg.secondary}</span>
        </div>
      </div>

      <div style="background: var(--bg-surface-elevated); border-radius: var(--radius-md); padding: 16px; border: 1px solid var(--border-subtle); display: flex; justify-content: space-around; align-items: center; position: relative;">
        <div style="text-align: center;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 6px;">VISÃO ANTERIOR</div>
          <svg viewBox="0 0 120 200" width="100" height="170" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glowF" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="b"/>
                <feComposite in="SourceGraphic" in2="b" operator="over"/>
              </filter>
            </defs>
            <circle cx="60" cy="20" r="10" fill="#2E3C56"/>
            <path d="M54 28 L66 28 L72 38 L48 38 Z" fill="#2E3C56"/>
            <ellipse cx="44" cy="42" rx="7" ry="6" fill="${cfg.shouldersActive ? activeColor : inactiveColor}" ${cfg.shouldersActive ? 'filter="url(#glowF)"' : ''}/>
            <ellipse cx="76" cy="42" rx="7" ry="6" fill="${cfg.shouldersActive ? activeColor : inactiveColor}" ${cfg.shouldersActive ? 'filter="url(#glowF)"' : ''}/>
            <path d="M48 40 Q60 44 72 40 L70 56 Q60 60 50 56 Z" fill="${cfg.chestActive ? activeColor : inactiveColor}" ${cfg.chestActive ? 'filter="url(#glowF)"' : ''}/>
            <rect x="52" y="58" width="16" height="26" rx="3" fill="${cfg.absActive ? secondaryColor : inactiveColor}" ${cfg.absActive ? 'filter="url(#glowF)"' : ''}/>
            <ellipse cx="38" cy="56" rx="5" ry="10" fill="${cfg.bicepsActive ? secondaryColor : inactiveColor}" ${cfg.bicepsActive ? 'filter="url(#glowF)"' : ''}/>
            <ellipse cx="82" cy="56" rx="5" ry="10" fill="${cfg.bicepsActive ? secondaryColor : inactiveColor}" ${cfg.bicepsActive ? 'filter="url(#glowF)"' : ''}/>
            <ellipse cx="34" cy="80" rx="4" ry="11" fill="#243048"/>
            <ellipse cx="86" cy="80" rx="4" ry="11" fill="#243048"/>
            <polygon points="50,86 70,86 66,98 54,98" fill="#243048"/>
            <ellipse cx="52" cy="120" rx="7" ry="18" fill="${cfg.quadsActive ? activeColor : inactiveColor}" ${cfg.quadsActive ? 'filter="url(#glowF)"' : ''}/>
            <ellipse cx="68" cy="120" rx="7" ry="18" fill="${cfg.quadsActive ? activeColor : inactiveColor}" ${cfg.quadsActive ? 'filter="url(#glowF)"' : ''}/>
            <ellipse cx="52" cy="162" rx="5" ry="16" fill="${cfg.quadsActive ? secondaryColor : inactiveColor}"/>
            <ellipse cx="68" cy="162" rx="5" ry="16" fill="${cfg.quadsActive ? secondaryColor : inactiveColor}"/>
          </svg>
        </div>

        <div style="text-align: center;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 6px;">VISÃO POSTERIOR</div>
          <svg viewBox="0 0 120 200" width="100" height="170" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="20" r="10" fill="#2E3C56"/>
            <path d="M52 28 L68 28 L76 46 L60 52 L44 46 Z" fill="${cfg.backActive ? secondaryColor : inactiveColor}"/>
            <path d="M46 48 L74 48 L68 76 L52 76 Z" fill="${cfg.backActive ? activeColor : inactiveColor}" ${cfg.backActive ? 'filter="url(#glowF)"' : ''}/>
            <ellipse cx="38" cy="56" rx="5" ry="11" fill="${cfg.tricepsActive ? activeColor : inactiveColor}" ${cfg.tricepsActive ? 'filter="url(#glowF)"' : ''}/>
            <ellipse cx="82" cy="56" rx="5" ry="11" fill="${cfg.tricepsActive ? activeColor : inactiveColor}" ${cfg.tricepsActive ? 'filter="url(#glowF)"' : ''}/>
            <ellipse cx="53" cy="94" rx="8" ry="9" fill="${cfg.glutesActive ? activeColor : inactiveColor}" ${cfg.glutesActive ? 'filter="url(#glowF)"' : ''}/>
            <ellipse cx="67" cy="94" rx="8" ry="9" fill="${cfg.glutesActive ? activeColor : inactiveColor}" ${cfg.glutesActive ? 'filter="url(#glowF)"' : ''}/>
            <ellipse cx="52" cy="122" rx="6" ry="17" fill="${cfg.glutesActive ? secondaryColor : inactiveColor}"/>
            <ellipse cx="68" cy="122" rx="6" ry="17" fill="${cfg.glutesActive ? secondaryColor : inactiveColor}"/>
            <ellipse cx="52" cy="162" rx="6" ry="15" fill="${cfg.quadsActive ? activeColor : inactiveColor}"/>
            <ellipse cx="68" cy="162" rx="6" ry="15" fill="${cfg.quadsActive ? activeColor : inactiveColor}"/>
          </svg>
        </div>
      </div>
    </div>
  `;
}
