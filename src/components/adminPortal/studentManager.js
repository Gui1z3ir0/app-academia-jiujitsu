import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

let userTypeFilter = 'all';
let searchQuery = '';

export function setStudentFilter(filter) {
  userTypeFilter = filter;
}

export function setSearchQuery(query) {
  searchQuery = query.toLowerCase();
}

export function renderStudentManager() {
  const allUsers = store.getUsuarios();
  const plans = store.getPlanos();

  const filteredUsers = allUsers.filter(u => {
    const tipo = (u.tipo_usuario || '').toUpperCase();
    const isAluno = tipo === 'ALUNO' || tipo === 'ALUNOS';
    const isPersonal = tipo === 'PERSONAL' || tipo === 'ADMIN' || tipo === 'ADM' || tipo === 'PROFESSOR';

    if (userTypeFilter !== 'all') {
      if (userTypeFilter === 'ALUNO' && !isAluno) return false;
      if ((userTypeFilter === 'PERSONAL' || userTypeFilter === 'ADMIN') && !isPersonal) return false;
    }
    if (searchQuery) {
      const matchName = (u.nome || '').toLowerCase().includes(searchQuery);
      const matchEmail = (u.email || '').toLowerCase().includes(searchQuery);
      const matchPhone = (u.telefone || '').includes(searchQuery);
      return matchName || matchEmail || matchPhone;
    }
    return true;
  });

  return `
    <div class="admin-student-manager">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 24px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; color: var(--jet-emerald); font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
            ${Icons.users('', 16)} GESTÃO DE ALUNOS
          </div>
          <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 4px 0;">Alunos, Planos & Frequência</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Cadastre novos alunos, defina um dos 3 planos, registre faltas e confirme pagamentos.
          </p>
        </div>
        <button id="openNewStudentModalBtn2" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 700;">
          ${Icons.plus('', 16)}
          <span>Cadastrar Novo Aluno</span>
        </button>
      </div>

      <div class="admin-toolbar">
        <div class="admin-search-box">
          <span style="display: flex; align-items: center; color: var(--text-muted);">${Icons.eye('', 16)}</span>
          <input type="text" id="adminStudentSearchInput" class="admin-search-input" placeholder="Buscar por nome, e-mail ou telefone..." value="${searchQuery}">
        </div>

        <div class="admin-filter-tabs">
          <button class="admin-filter-btn ${userTypeFilter === 'all' ? 'active' : ''}" data-user-filter="all">
            Todos (${allUsers.length})
          </button>
          <button class="admin-filter-btn ${userTypeFilter === 'ALUNO' ? 'active' : ''}" data-user-filter="ALUNO">
            ● Alunos (${allUsers.filter(u => (u.tipo_usuario || '').toUpperCase() === 'ALUNO').length})
          </button>
          <button class="admin-filter-btn ${userTypeFilter === 'PERSONAL' ? 'active' : ''}" data-user-filter="PERSONAL">
            ● Personal (${allUsers.filter(u => (u.tipo_usuario || '').toUpperCase() !== 'ALUNO').length})
          </button>
        </div>
      </div>

      <div class="measurements-table-card" style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px; overflow-x: auto;">
        <table class="app-table">
          <thead>
            <tr>
              <th>Aluno / Perfil</th>
              <th>WhatsApp</th>
              <th>Medidas & Faixa JJ</th>
              <th>Plano Contratado</th>
              <th>Pagamento do Mês</th>
              <th>Faltas</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${filteredUsers.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                  Nenhum registro encontrado.
                </td>
              </tr>
            ` : filteredUsers.map(u => {
              const isAluno = (u.tipo_usuario || '').toUpperCase() === 'ALUNO';
              const mat = store.getMatriculaPorUsuario(u.id);
              const planoId = mat ? mat.plano_id : (u.plano_id || 'plan_academia');
              const plano = store.getPlano(planoId) || plans[0];
              const faltas = store.getFaltas(u.id);
              const ultimaAv = store.getUltimaAvaliacao(u.id);
              const peso = u.peso || (ultimaAv ? ultimaAv.peso : 75);
              const altura = u.altura || (ultimaAv ? ultimaAv.altura : 175);

              const payments = store.getPayments(u.id);
              const currentMonthStr = new Date().toISOString().substring(0, 7);
              const isPaid = payments.some(p => (p.status || '').toLowerCase() === 'pago' && p.paymentDate && p.paymentDate.startsWith(currentMonthStr));
              const faturas = store.getFaturas(u.id);
              const faturaPendente = faturas.find(f => f.status !== 'Paga');

              return `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <img src="${u.avatar}" style="width: 38px; height: 38px; border-radius: var(--radius-full); object-fit: cover;" alt="">
                      <div>
                        <strong style="color: var(--text-primary); display: block;">${u.nome}</strong>
                        <span style="font-size: 0.78rem; color: var(--text-muted);">${u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style="font-weight: 700; color: #CBD5E1;">${u.telefone || '-'}</span>
                  </td>
                  <td>
                    ${isAluno ? `
                      <div>
                        <span style="font-weight: 700; color: #00F59B;">${peso} kg</span>
                        <span style="color: #94A3B8; font-size: 0.8rem;"> • ${altura} cm</span>
                      </div>
                      <span style="font-size: 0.74rem; color: var(--jet-cyan);">🥋 Faixa ${u.faixa_jiujitsu || 'Branca'} (${u.graus_jiujitsu || 0}ºG)</span>
                    ` : '<span style="color: #94A3B8;">Personal Trainer</span>'}
                  </td>
                  <td>
                    ${isAluno ? `
                      <span class="badge ${planoId === 'plan_academia_jiujitsu' ? 'badge-cyan' : planoId === 'plan_jiujitsu' ? 'badge-success' : 'badge-warning'}" style="font-weight: 800;">
                        ${plano.nome} (R$ ${Number(plano.valor).toFixed(2)})
                      </span>
                    ` : `
                      <span class="badge badge-success">PERSONAL</span>
                    `}
                  </td>
                  <td>
                    ${isAluno ? `
                      <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        <span class="badge ${isPaid || !faturaPendente ? 'badge-success' : faturaPendente?.status === 'Aguardando Confirmação' ? 'badge-cyan' : 'badge-danger'}" style="font-weight: 700;">
                          ${isPaid || !faturaPendente ? '✓ Pago no Mês' : faturaPendente?.status === 'Aguardando Confirmação' ? '🔵 PIX Informado' : '● Pendente'}
                        </span>
                        ${faturaPendente ? `
                          <button class="btn btn-secondary btn-sm mark-payment-paid-btn" data-payment-id="${faturaPendente.id}" title="Confirmar recebimento da mensalidade" style="padding: 3px 8px; font-size: 0.72rem; font-weight: 700;">
                            Confirmar Pago
                          </button>
                        ` : ''}
                      </div>
                    ` : '<span style="color: #00F59B; font-weight: 700; font-size: 0.8rem;">Responsável</span>'}
                  </td>
                  <td>
                    ${isAluno ? `
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span class="badge ${faltas.length > 0 ? 'badge-danger' : 'badge-success'}" style="font-weight: 800;">
                          ${faltas.length} Falta(s)
                        </span>
                        <button class="btn btn-secondary btn-sm admin-add-falta-btn" data-student-id="${u.id}" data-student-name="${u.nome}" title="Registrar Falta no Treino" style="padding: 3px 7px; font-size: 0.72rem; font-weight: 800;">
                          + Falta
                        </button>
                        ${faltas.length > 0 ? `
                          <button class="btn btn-secondary btn-sm admin-remove-falta-btn" data-student-id="${u.id}" title="Remover Falta" style="padding: 3px 7px; font-size: 0.72rem;">
                            -
                          </button>
                        ` : ''}
                      </div>
                    ` : '<span style="color: #94A3B8;">-</span>'}
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-secondary btn-sm edit-student-btn" data-student-id="${u.id}" title="Editar Dados do Aluno" style="display: inline-flex; align-items: center; gap: 4px;">
                        ${Icons.sliders('', 14)}
                        <span style="font-size: 0.75rem;">Editar</span>
                      </button>
                      ${u.telefone ? `
                        <button class="btn btn-primary btn-sm send-whatsapp-reminder" data-phone="${u.telefone}" data-name="${u.nome}" data-amount="${plano.valor}" title="Contato via WhatsApp" style="display: inline-flex; align-items: center; background: #25D366; border-color: #25D366; color: #000; padding: 6px 8px;">
                          ${Icons.whatsapp('', 14)}
                        </button>
                      ` : ''}
                      <button class="btn btn-danger btn-sm delete-student-btn" data-student-id="${u.id}" title="Excluir Usuário" style="display: inline-flex; align-items: center; padding: 6px 8px;">
                        ${Icons.trash('', 14)}
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div id="newStudentModal" class="modal-overlay">
        <div class="modal-content" style="max-width: 540px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 20px;">
          <div class="modal-header" style="border-bottom: 1px solid var(--jet-border); padding-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${Icons.user('', 20)}
              <h3 class="modal-title" style="font-family: 'Outfit', sans-serif;">Cadastrar Novo Aluno</h3>
            </div>
            <button id="closeNewStudentModalBtn" class="modal-close">&times;</button>
          </div>
          <form id="newStudentForm">
            <div class="modal-body" style="padding: 16px 0;">
              <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label">Nome Completo</label>
                <input type="text" id="addStudentName" class="form-input" placeholder="Ex: Lucas Silva" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div class="form-group">
                  <label class="form-label">E-mail</label>
                  <input type="email" id="addStudentEmail" class="form-input" placeholder="aluno@email.com" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Senha Inicial (ou deixe vazio p/ gerar)</label>
                  <input type="password" id="addStudentSenha" class="form-input" placeholder="Gerar senha automática..." style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div class="form-group">
                  <label class="form-label">Telefone (WhatsApp)</label>
                  <input type="tel" id="addStudentPhone" class="form-input" placeholder="(11) 99999-9999" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Sexo</label>
                  <select id="addStudentSexo" class="form-select" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                    <option value="M">Masculino (M)</option>
                    <option value="F">Feminino (F)</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Faixa Jiu-Jítsu</label>
                  <select id="addStudentFaixa" class="form-select" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff; font-weight: 700;">
                    <option value="Branca" selected>Faixa Branca</option>
                    <option value="Azul">Faixa Azul</option>
                    <option value="Roxa">Faixa Roxa</option>
                    <option value="Marrom">Faixa Marrom</option>
                    <option value="Preta">Faixa Preta</option>
                  </select>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div class="form-group">
                  <label class="form-label" style="color: #00F59B; font-weight: 700;">Peso Inicial (kg)</label>
                  <input type="number" step="0.1" id="addStudentWeight" class="form-input" placeholder="Ex: 75.5" value="75" required style="background: var(--jet-card-elevated); border: 1px solid rgba(0, 245, 155, 0.35); border-radius: 8px; color: #fff; font-weight: 700;">
                </div>
                <div class="form-group">
                  <label class="form-label" style="color: #00F59B; font-weight: 700;">Altura (cm)</label>
                  <input type="number" id="addStudentHeight" class="form-input" placeholder="Ex: 175" value="175" required style="background: var(--jet-card-elevated); border: 1px solid rgba(0, 245, 155, 0.35); border-radius: 8px; color: #fff; font-weight: 700;">
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label" style="color: #00E5FF; font-weight: 800;">Plano do Aluno (3 Opções)</label>
                <select id="addStudentPlanId" class="form-select" required style="background: var(--jet-card-elevated); border: 1px solid rgba(0, 229, 255, 0.4); border-radius: 8px; color: #fff; font-weight: 700;">
                  ${plans.map(p => `
                    <option value="${p.id}">${p.nome} — R$ ${Number(p.valor).toFixed(2)}/mês</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Objetivo de Treino</label>
                <input type="text" id="addStudentGoal" class="form-input" placeholder="Ex: Hipertrofia, Jiu-Jítsu, Emagrecimento..." style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
              </div>
            </div>
            <div class="modal-footer" style="border-top: 1px solid var(--jet-border); padding-top: 14px;">
              <button type="button" id="closeNewStudentModalBtn2" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 800;">
                ${Icons.check('', 16)}
                <span>Cadastrar Aluno</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div id="editStudentModal" class="modal-overlay">
        <div class="modal-content" style="max-width: 540px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 20px;">
          <div class="modal-header" style="border-bottom: 1px solid var(--jet-border); padding-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${Icons.sliders('', 20)}
              <h3 class="modal-title" style="font-family: 'Outfit', sans-serif;">Editar Aluno</h3>
            </div>
            <button id="closeEditStudentModalBtn" class="modal-close">&times;</button>
          </div>
          <form id="editStudentForm">
            <input type="hidden" id="editStudentId">
            <div class="modal-body" style="padding: 16px 0;">
              <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label">Nome Completo</label>
                <input type="text" id="editStudentName" class="form-input" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div class="form-group">
                  <label class="form-label">E-mail</label>
                  <input type="email" id="editStudentEmail" class="form-input" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Alterar Senha (Opcional)</label>
                  <input type="password" id="editStudentSenha" class="form-input" placeholder="Manter atual se vazio" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div class="form-group">
                  <label class="form-label">Telefone (WhatsApp)</label>
                  <input type="tel" id="editStudentPhone" class="form-input" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Sexo</label>
                  <select id="editStudentSexo" class="form-select" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                    <option value="M">Masculino (M)</option>
                    <option value="F">Feminino (F)</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Objetivo Principal</label>
                <input type="text" id="editStudentGoal" class="form-input" placeholder="Ex: Hipertrofia, Jiu-Jítsu..." style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
              </div>
            </div>
            <div class="modal-footer" style="border-top: 1px solid var(--jet-border); padding-top: 14px;">
              <button type="button" id="closeEditStudentModalBtn2" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
                ${Icons.check('', 16)}
                <span>Salvar Alterações</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
