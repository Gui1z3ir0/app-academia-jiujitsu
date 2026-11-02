import { store } from '../../data/store.js';
import { createInitialsAvatar } from '../../utils/security.js';

export function renderGymPassModal() {
  const student = store.getActiveStudent();
  const gymConfig = store.getGymConfig();
  const plan = store.getPlan(student?.planId) || store.getPlans()[0];
  const isAuthorized = student?.status !== 'atrasado';

  return `
    <div id="gymPassModal" class="modal-overlay">
      <div class="modal-content" style="max-width: 440px; background: #0C111C;">
        <div class="modal-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.2rem;">🎫</span>
            <h3 class="modal-title" style="font-size: 1.15rem;">Carteirinha Digital do Aluno</h3>
          </div>
          <button id="closeGymPassBtn" class="modal-close">&times;</button>
        </div>

        <div class="modal-body" style="padding: 24px 20px; display: flex; flex-direction: column; align-items: center;">
          <div id="digitalMemberCard" style="
            width: 100%;
            background: linear-gradient(145deg, #141C2B 0%, #0A0E17 100%);
            border: 1px solid rgba(0, 245, 155, 0.35);
            border-radius: var(--radius-lg);
            padding: 22px;
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 245, 155, 0.15);
            position: relative;
            overflow: hidden;
            margin-bottom: 20px;
          ">
            <div style="
              position: absolute;
              top: -80%;
              left: -40%;
              width: 180%;
              height: 180%;
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, transparent 40%, rgba(0, 245, 155, 0.08) 60%, transparent 100%);
              transform: rotate(25deg);
              pointer-events: none;
            "></div>

            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #00F59B, #00B4D8); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #090D16;">
                  ${gymConfig?.logoText || 'FIT'}
                </div>
                <div>
                  <div style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 0.92rem; letter-spacing: 0.5px;">${(gymConfig?.name || 'ACADEMIA').toUpperCase()}</div>
                  <div style="font-size: 0.68rem; color: var(--neon-green); text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">MEMBER PASS</div>
                </div>
              </div>
              <span class="badge ${isAuthorized ? 'badge-success' : 'badge-danger'}">
                ${isAuthorized ? '● ATIVO' : '● PENDENTE'}
              </span>
            </div>

            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
              <img src="${student?.avatar || createInitialsAvatar(student?.name || 'Aluno')}" style="width: 58px; height: 58px; border-radius: var(--radius-full); border: 2px solid var(--neon-green); object-fit: cover;" alt="">
              <div>
                <div style="font-family: 'Outfit', sans-serif; font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">
                  ${student?.name || 'Aluno'}
                </div>
                <div style="font-size: 0.8rem; color: var(--neon-cyan); font-weight: 700;">
                  ${plan?.name || 'Plano Musculação'} • 🥋 Faixa ${student?.faixaJiuJitsu || 'Branca'}
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
                  Matrícula: <strong>#ID-${student?.id ? student.id.slice(-5).toUpperCase() : '84920'}</strong> • Vencimento: ${student?.dueDate ? student.dueDate.split('-').reverse().join('/') : '30/10/2026'}
                </div>
              </div>
            </div>

            <div id="barcodeContainer" style="
              background: #FFFFFF;
              border-radius: var(--radius-sm);
              padding: 12px 16px;
              display: flex;
              flex-direction: column;
              align-items: center;
              position: relative;
              overflow: hidden;
            ">
              <svg viewBox="0 0 260 50" style="width: 100%; height: 50px;" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="0" width="4" height="50" fill="#090D16"/>
                <rect x="12" y="0" width="2" height="50" fill="#090D16"/>
                <rect x="18" y="0" width="6" height="50" fill="#090D16"/>
                <rect x="28" y="0" width="3" height="50" fill="#090D16"/>
                <rect x="35" y="0" width="8" height="50" fill="#090D16"/>
                <rect x="47" y="0" width="2" height="50" fill="#090D16"/>
                <rect x="53" y="0" width="5" height="50" fill="#090D16"/>
                <rect x="62" y="0" width="7" height="50" fill="#090D16"/>
                <rect x="73" y="0" width="3" height="50" fill="#090D16"/>
                <rect x="80" y="0" width="6" height="50" fill="#090D16"/>
                <rect x="90" y="0" width="2" height="50" fill="#090D16"/>
                <rect x="96" y="0" width="8" height="50" fill="#090D16"/>
                <rect x="108" y="0" width="4" height="50" fill="#090D16"/>
                <rect x="116" y="0" width="3" height="50" fill="#090D16"/>
                <rect x="123" y="0" width="7" height="50" fill="#090D16"/>
                <rect x="134" y="0" width="2" height="50" fill="#090D16"/>
                <rect x="140" y="0" width="6" height="50" fill="#090D16"/>
                <rect x="150" y="0" width="4" height="50" fill="#090D16"/>
                <rect x="158" y="0" width="8" height="50" fill="#090D16"/>
                <rect x="170" y="0" width="3" height="50" fill="#090D16"/>
                <rect x="177" y="0" width="5" height="50" fill="#090D16"/>
                <rect x="186" y="0" width="7" height="50" fill="#090D16"/>
                <rect x="197" y="0" width="2" height="50" fill="#090D16"/>
                <rect x="203" y="0" width="6" height="50" fill="#090D16"/>
                <rect x="213" y="0" width="4" height="50" fill="#090D16"/>
                <rect x="221" y="0" width="3" height="50" fill="#090D16"/>
                <rect x="228" y="0" width="8" height="50" fill="#090D16"/>
                <rect x="240" y="0" width="3" height="50" fill="#090D16"/>
                <rect x="247" y="0" width="5" height="50" fill="#090D16"/>
              </svg>
              <div style="font-family: monospace; font-size: 0.75rem; color: #1E293B; letter-spacing: 3px; margin-top: 4px; font-weight: 700;">
                ${student?.id ? student.id.replace(/[^0-9]/g, '').padEnd(16, '0').slice(0, 16) : '8492018492051849'}
              </div>
            </div>
          </div>

          <div style="
            width: 100%;
            background: ${isAuthorized ? 'rgba(0, 245, 155, 0.1)' : 'rgba(255, 71, 87, 0.1)'};
            border: 1px solid ${isAuthorized ? 'rgba(0, 245, 155, 0.3)' : 'rgba(255, 71, 87, 0.3)'};
            border-radius: var(--radius-sm);
            padding: 14px 18px;
            text-align: center;
            margin-bottom: 16px;
          ">
            <div style="font-weight: 800; font-size: 0.95rem; color: ${isAuthorized ? 'var(--neon-green)' : 'var(--ruby-danger)'};">
              ${isAuthorized ? '● MATRÍCULA ATIVA & REGULAR' : '⚠️ MENSALIDADE PENDENTE'}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
              ${isAuthorized ? 'Apresente esta carteirinha para identificação na recepção da academia.' : 'Efetue o pagamento via PIX para regularizar sua situação.'}
            </div>
          </div>

          <button id="closeGymPassBtnBottom" class="btn btn-secondary" style="width: 100%; padding: 12px; font-weight: 700;">
            <span>Fechar Carteirinha</span>
          </button>
        </div>
      </div>
    </div>
  `;
}
