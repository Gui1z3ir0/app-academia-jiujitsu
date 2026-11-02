export function getExerciseIllustration(type = 'bench_press') {
  switch (type) {
    case 'bench_press':
    case 'bench-press':
    case 'dumbbell-press':
    case 'cable-fly':
      return `
        <svg viewBox="0 0 320 200" class="exercise-svg-art" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="benchGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#00F59B" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#00B4D8" stop-opacity="0.8"/>
            </linearGradient>
            <filter id="neonFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <line x1="20" y1="180" x2="300" y2="180" stroke="#2A364F" stroke-width="2" stroke-dasharray="4"/>
          <rect x="50" y="130" width="220" height="12" rx="4" fill="#1E293B" stroke="#334155" stroke-width="2"/>
          <line x1="80" y1="142" x2="80" y2="180" stroke="#334155" stroke-width="4"/>
          <line x1="240" y1="142" x2="240" y2="180" stroke="#334155" stroke-width="4"/>
          <path d="M70 142 L70 95 L65 85 L75 85 L70 95" stroke="#475569" stroke-width="3" fill="none"/>
          <path d="M250 142 L250 95 L245 85 L255 85 L250 95" stroke="#475569" stroke-width="3" fill="none"/>
          <ellipse cx="90" cy="120" rx="12" ry="12" fill="#94A3B8"/>
          <line x1="102" y1="124" x2="210" y2="124" stroke="#64748B" stroke-width="14" stroke-linecap="round"/>
          <ellipse cx="140" cy="122" rx="16" ry="7" fill="url(#benchGlow)" filter="url(#neonFilter)" class="pulse-muscle"/>
          <g class="animated-barbell-press">
            <path d="M125 124 L145 90 L160 82" stroke="#CBD5E1" stroke-width="6" stroke-linecap="round" fill="none"/>
            <path d="M155 124 L175 90 L160 82" stroke="#CBD5E1" stroke-width="6" stroke-linecap="round" fill="none"/>
            <line x1="40" y1="80" x2="280" y2="80" stroke="#F1F5F9" stroke-width="5"/>
            <rect x="50" y="62" width="8" height="36" rx="2" fill="#00F59B"/>
            <rect x="60" y="66" width="6" height="28" rx="2" fill="#00D26A"/>
            <rect x="254" y="66" width="6" height="28" rx="2" fill="#00D26A"/>
            <rect x="262" y="62" width="8" height="36" rx="2" fill="#00F59B"/>
          </g>
          <text x="160" y="32" text-anchor="middle" fill="#00F59B" font-size="12" font-weight="700" letter-spacing="1.5">FOCO: PEITORAL & TRÍCEPS</text>
        </svg>
      `;

    case 'squat':
    case 'leg-press':
    case 'leg-curl':
      return `
        <svg viewBox="0 0 320 200" class="exercise-svg-art" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="legGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#FFB800" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#FF5252" stop-opacity="0.9"/>
            </linearGradient>
            <filter id="neonLeg" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <line x1="30" y1="180" x2="290" y2="180" stroke="#334155" stroke-width="3"/>
          <line x1="70" y1="40" x2="70" y2="180" stroke="#1E293B" stroke-width="6"/>
          <line x1="250" y1="40" x2="250" y2="180" stroke="#1E293B" stroke-width="6"/>
          <g class="animated-squat-motion">
            <circle cx="160" cy="55" r="12" fill="#CBD5E1"/>
            <line x1="160" y1="67" x2="152" y2="115" stroke="#94A3B8" stroke-width="14" stroke-linecap="round"/>
            <path d="M152 115 L185 125 L160 175" stroke="url(#legGlow)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#neonLeg)"/>
            <rect x="145" y="172" width="28" height="8" rx="3" fill="#64748B"/>
            <line x1="90" y1="65" x2="230" y2="65" stroke="#F8FAFC" stroke-width="5"/>
            <rect x="95" y="45" width="10" height="40" rx="3" fill="#FFB800"/>
            <rect x="215" y="45" width="10" height="40" rx="3" fill="#FFB800"/>
          </g>
          <text x="160" y="28" text-anchor="middle" fill="#FFB800" font-size="12" font-weight="700" letter-spacing="1.5">FOCO: QUADRÍCEPS & GLÚTEOS</text>
        </svg>
      `;

    case 'lat_pulldown':
    case 'lat-pulldown':
    case 'barbell-row':
    case 'seated-row':
      return `
        <svg viewBox="0 0 320 200" class="exercise-svg-art" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="backGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.9"/>
            </linearGradient>
          </defs>
          <line x1="30" y1="180" x2="290" y2="180" stroke="#334155" stroke-width="2"/>
          <line x1="160" y1="15" x2="160" y2="70" stroke="#00E5FF" stroke-width="2" stroke-dasharray="2"/>
          <circle cx="160" cy="15" r="7" fill="#475569"/>
          <rect x="130" y="135" width="60" height="12" rx="3" fill="#1E293B"/>
          <line x1="160" y1="147" x2="160" y2="180" stroke="#334155" stroke-width="4"/>
          <circle cx="160" cy="85" r="11" fill="#94A3B8"/>
          <path d="M160 96 L145 130 L175 130 Z" fill="url(#backGlow)" opacity="0.9"/>
          <path d="M100 55 Q160 45 220 55" stroke="#F1F5F9" stroke-width="5" fill="none"/>
          <line x1="105" y1="56" x2="148" y2="92" stroke="#CBD5E1" stroke-width="6" stroke-linecap="round"/>
          <line x1="215" y1="56" x2="172" y2="92" stroke="#CBD5E1" stroke-width="6" stroke-linecap="round"/>
          <text x="160" y="32" text-anchor="middle" fill="#00E5FF" font-size="12" font-weight="700" letter-spacing="1.5">FOCO: DORSAIS (COSTAS)</text>
        </svg>
      `;

    default:
      return `
        <svg viewBox="0 0 320 200" class="exercise-svg-art" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="genericGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#00F59B"/>
              <stop offset="100%" stop-color="#00E5FF"/>
            </linearGradient>
          </defs>
          <line x1="40" y1="170" x2="280" y2="170" stroke="#334155" stroke-width="2"/>
          <circle cx="160" cy="80" r="28" fill="#1E293B" stroke="url(#genericGlow)" stroke-width="3"/>
          <path d="M150 70 L175 80 L150 90 Z" fill="url(#genericGlow)"/>
          <text x="160" y="130" text-anchor="middle" fill="#F1F5F9" font-size="14" font-weight="700">EXECUÇÃO TÉCNICA GUIADA</text>
          <text x="160" y="150" text-anchor="middle" fill="#94A3B8" font-size="11">Biomecânica & Postura Correta</text>
        </svg>
      `;
  }
}
