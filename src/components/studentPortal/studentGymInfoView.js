import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

export function renderStudentGymInfoView() {
  const gym = store.getGymConfig();

  return `
    <div class="student-gym-info-module">
      <div style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 8px; color: var(--jet-emerald); font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          ${Icons.bolt('', 16)} INFORMAÇÕES DA UNIDADE
        </div>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 4px 0;">Sobre a Academia</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Consulte horários de funcionamento, canais de atendimento, regras e comunicados oficiais.
        </p>
      </div>

      <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 9, 15, 0.98) 100%), radial-gradient(circle at 100% 0%, rgba(0, 245, 155, 0.15) 0%, transparent 60%); border: 1px solid var(--jet-border); border-radius: 20px; padding: 28px; margin-bottom: 24px; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 14px;">
          <div style="background: linear-gradient(135deg, #00F59B 0%, #00E5FF 100%); width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #06090F; font-size: 1.5rem; font-weight: 900; box-shadow: 0 4px 16px rgba(0, 245, 155, 0.3);">
            ${Icons.bolt('', 24)}
          </div>
          <div>
            <h1 style="font-family: 'Outfit', sans-serif; font-size: 1.6rem; font-weight: 900; margin: 0; color: #fff;">
              ${gym.name || 'JetFit Academia & Performance'}
            </h1>
            <div style="font-size: 0.85rem; color: var(--jet-emerald); font-weight: 700; margin-top: 2px;">
              ${gym.slogan || 'Treinamento de alta performance & Gestão inteligente'}
            </div>
          </div>
        </div>

        <p style="color: #CBD5E1; font-size: 0.92rem; line-height: 1.5; margin: 0; max-width: 680px;">
          Nossa estrutura conta com equipamentos biomecânicos de última geração, climatização completa, acompanhamento profissional e vestiários premium.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 18px; padding: 22px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: var(--jet-cyan);">
            ${Icons.clock('', 20)}
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.15rem; margin: 0; color: #fff;">Horários de Treino</h3>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.88rem;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
              <span style="color: var(--text-muted);">Segunda a Sexta:</span>
              <strong style="color: #fff;">${gym.workingHoursWeekdays || '06:00 às 23:00'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
              <span style="color: var(--text-muted);">Sábados:</span>
              <strong style="color: #fff;">${gym.workingHoursSaturdays || '08:00 às 18:00'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Domingos & Feriados:</span>
              <strong style="color: #fff;">${gym.workingHoursSundays || '09:00 às 14:00'}</strong>
            </div>
          </div>
        </div>

        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 18px; padding: 22px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: var(--jet-emerald);">
            ${Icons.phone('', 20)}
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.15rem; margin: 0; color: #fff;">Endereço & Contato</h3>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.88rem;">
            <div>
              <div style="color: var(--text-muted); font-size: 0.78rem; text-transform: uppercase; font-weight: 700;">Endereço:</div>
              <div style="color: #fff; margin-top: 2px; line-height: 1.4;">${gym.address || 'Av. Paulista, 1842 - Bela Vista, São Paulo - SP'}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
              <span style="color: var(--text-muted);">Telefone / Recepção:</span>
              <strong style="color: #fff;">${gym.phone || '(11) 3456-7890'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-muted);">WhatsApp de Suporte:</span>
              <strong style="color: var(--jet-emerald);">${gym.whatsapp || '(11) 98888-7777'}</strong>
            </div>
          </div>
        </div>

        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 18px; padding: 22px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: #FFB800;">
            ${Icons.card('', 20)}
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.15rem; margin: 0; color: #fff;">Chave PIX Oficial</h3>
          </div>

          <div style="background: var(--jet-card-elevated); border-radius: 12px; padding: 14px; margin-bottom: 12px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Chave Oficial da Academia:</div>
            <code style="display: block; font-size: 0.95rem; color: var(--jet-emerald); font-weight: 700; margin-top: 4px; word-break: break-all;">
              ${gym.pixKey || 'financeiro@academia.com'}
            </code>
          </div>

          <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.4;">
            Ao pagar suas faturas via PIX com esta chave, o sistema baixa a pendência e regulariza sua matrícula em instantes.
          </p>
        </div>

        <div style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 18px; padding: 22px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: var(--ruby-danger);">
            ${Icons.sparkles('', 20)}
            <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.15rem; margin: 0; color: #fff;">Comunicados & Avisos</h3>
          </div>

          <div style="background: rgba(0, 245, 155, 0.08); border-left: 3px solid var(--jet-emerald); padding: 12px 14px; border-radius: 0 10px 10px 0;">
            <p style="font-size: 0.88rem; color: #CBD5E1; margin: 0; line-height: 1.45;">
              ${gym.announcements || 'Lembre-se de trazer sua toalha e garrafinha de água. Consultas e reavaliações de bioimpedância disponíveis para agendamento!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}
