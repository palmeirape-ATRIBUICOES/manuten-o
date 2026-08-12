/* ==========================================================================
   TECHNICIANS VIEW - GESTÃO DE TÉCNICOS & EQUIPE POR MÓDULO
   ========================================================================== */

import { tenantDataService } from '../services/tenant-data-service.js';
import { authService } from '../services/auth-service.js';
import { subscriptionService } from '../services/subscription-service.js';
import { SAAS_PLANS } from '../config/plans.js';

export function renderTechniciansView() {
  const user = authService.getCurrentUser();
  const tenantId = user ? user.tenantId : 'tenant-alfa-001';
  const technicians = tenantDataService.getTechnicians(tenantId);
  const sub = subscriptionService.getTenantSubscription(tenantId);
  const currentPlan = SAAS_PLANS.find(p => p.id === sub?.planId) || SAAS_PLANS[1]; // default Pro

  const maxUsersAllowed = currentPlan.maxUsers;
  const currentTechCount = technicians.length;
  const isLimitReached = currentTechCount >= maxUsersAllowed;

  return `
    <div style="max-width: 950px; margin: 0 auto;" id="technicians-root">
      
      <!-- Top Card Header -->
      <div class="card" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <span class="badge badge-info" style="margin-bottom: 6px;">EQUIPE DE CAMPO</span>
            <h2 style="font-size: 1.5rem; color: #0f172a; margin: 0;">👨‍🔧 Gestão de Técnicos & Equipe</h2>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
              Cadastre os membros da sua equipe técnica para atribuição de Ordens de Serviço.
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="text-align: right;">
              <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">PLANO ${currentPlan.name.toUpperCase()}</span>
              <strong>${currentTechCount} / ${maxUsersAllowed} Usuário(s)</strong>
            </div>
            <button class="btn btn-primary" id="btn-add-technician" style="font-size: 0.85rem;" ${isLimitReached ? 'disabled title="Limite de usuários do seu plano atingido. Faça upgrade para adicionar mais técnicos."' : ''}>
              ➕ Cadastrar Técnico
            </button>
          </div>
        </div>

        ${isLimitReached ? `
          <div style="margin-top: 16px; padding: 12px; background: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; font-size: 0.85rem; color: #c2410c; display: flex; justify-content: space-between; align-items: center;">
            <span>⚠️ Você atingiu o limite de <strong>${maxUsersAllowed} usuário(s)</strong> do plano <strong>${currentPlan.name}</strong>.</span>
            <button class="btn btn-secondary" id="btn-upgrade-plan-tech" style="font-size: 0.8rem; padding: 4px 10px;">⭐ Fazer Upgrade de Plano</button>
          </div>
        ` : ''}
      </div>

      <!-- Technicians List Card -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; font-size: 1.1rem; color: #0f172a;">📋 Quadro da Equipe Técnica (${technicians.length})</h3>
        </div>

        ${technicians.length === 0 ? `
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <div style="font-size: 2.5rem; margin-bottom: 12px;">👨‍🔧</div>
            <strong>Nenhum técnico cadastrado na sua equipe.</strong>
            <p style="font-size: 0.85rem; margin-top: 6px;">Clique no botão "+ Cadastrar Técnico" para adicionar membros da equipe.</p>
          </div>
        ` : `
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
                  <th style="padding: 12px; color: #475569;">Nome do Técnico</th>
                  <th style="padding: 12px; color: #475569;">E-mail / Login</th>
                  <th style="padding: 12px; color: #475569;">Telefone</th>
                  <th style="padding: 12px; color: #475569;">Especialidade</th>
                  <th style="padding: 12px; color: #475569;">Status</th>
                  <th style="padding: 12px; color: #475569; text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${technicians.map(t => `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px;">
                      <strong>${t.name}</strong>
                    </td>
                    <td style="padding: 12px; color: #4f46e5;">${t.email || '—'}</td>
                    <td style="padding: 12px; color: #64748b;">${t.phone || '—'}</td>
                    <td style="padding: 12px;">
                      <span style="background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">
                        ${t.specialty || 'Técnico de Campo'}
                      </span>
                    </td>
                    <td style="padding: 12px;">
                      <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">
                        🟢 ATIVO
                      </span>
                    </td>
                    <td style="padding: 12px; text-align: right;">
                      <button class="btn btn-secondary btn-delete-tech" data-tech-id="${t.id}" style="padding: 4px 8px; font-size: 0.8rem;" title="Remover Técnico">
                        🗑️ Excluir
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <div id="tech-modal-container"></div>
    </div>
  `;
}

export function attachTechniciansEvents(refreshCallback, onUpgradePlanCallback) {
  const user = authService.getCurrentUser();
  const tenantId = user ? user.tenantId : 'tenant-alfa-001';
  const modalContainer = document.getElementById('tech-modal-container');
  const btnAddTech = document.getElementById('btn-add-technician');
  const btnUpgradePlan = document.getElementById('btn-upgrade-plan-tech');

  if (btnUpgradePlan && onUpgradePlanCallback) {
    btnUpgradePlan.addEventListener('click', onUpgradePlanCallback);
  }

  if (btnAddTech) {
    btnAddTech.addEventListener('click', () => {
      modalContainer.innerHTML = `
        <div class="modal-overlay active">
          <div class="modal-card" style="max-width: 480px;">
            <div class="modal-header">
              <h3>👨‍🔧 Cadastrar Novo Técnico da Equipe</h3>
              <button class="btn btn-secondary btn-close-modal">✕</button>
            </div>

            <form id="form-modal-add-tech">
              <div class="form-group">
                <label class="form-label">Nome Completo do Técnico *</label>
                <input type="text" class="form-control" id="tech-name" placeholder="Ex: Lucas Ferreira" required>
              </div>

              <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">E-mail de Login do Técnico *</label>
                  <input type="email" class="form-control" id="tech-email" placeholder="lucas@empresa.com" required>
                </div>

                <div class="form-group">
                  <label class="form-label">Senha de Acesso do Técnico *</label>
                  <input type="password" class="form-control" id="tech-password" placeholder="Mínimo 3 caracteres" required>
                </div>
              </div>

              <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">Telefone / WhatsApp</label>
                  <input type="tel" class="form-control" id="tech-phone" placeholder="(81) 99887-1122">
                </div>

                <div class="form-group">
                  <label class="form-label">Especialidade Principal</label>
                  <select class="form-control" id="tech-specialty">
                    <option value="Climatização & HVAC">Climatização & HVAC</option>
                    <option value="Refrigeração Comercial">Refrigeração Comercial</option>
                    <option value="Elétrica & Comandos">Elétrica & Comandos</option>
                    <option value="Mecânica & Hidráulica">Mecânica & Hidráulica</option>
                    <option value="Geral & Manutenção">Geral & Manutenção</option>
                  </select>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
                <button type="button" class="btn btn-secondary btn-close-modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Criar Conta e Salvar Técnico</button>
              </div>
            </form>
          </div>
        </div>
      `;

      modalContainer.querySelectorAll('.btn-close-modal').forEach(b => b.addEventListener('click', () => modalContainer.innerHTML = ''));

      document.getElementById('form-modal-add-tech').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('tech-name').value.trim();
        const email = document.getElementById('tech-email').value.trim().toLowerCase();
        const password = document.getElementById('tech-password').value;
        const phone = document.getElementById('tech-phone').value.trim();
        const specialty = document.getElementById('tech-specialty').value;

        try {
          // Register User Account linked to this company's tenantId
          const companyName = user ? (user.companyName || 'Sua Empresa') : 'Sua Empresa';
          authService.registerTechnicianUser({
            tenantId,
            fullName: name,
            companyName: companyName,
            email: email,
            phone: phone,
            password: password
          });

          // Save Technician Record in workspace
          tenantDataService.addTechnician(tenantId, { name, email, phone, specialty });

          alert(`✓ Técnico ${name} cadastrado com sucesso! Conta de acesso criada e vinculada à sua empresa.`);
          modalContainer.innerHTML = '';
          if (refreshCallback) refreshCallback();
        } catch (err) {
          alert("Erro ao cadastrar técnico: " + err.message);
        }
      });
    });
  }

  document.querySelectorAll('.btn-delete-tech').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const techId = e.currentTarget.getAttribute('data-tech-id');
      if (confirm("Deseja realmente remover este técnico da equipe?")) {
        tenantDataService.deleteTechnician(tenantId, techId);
        if (refreshCallback) refreshCallback();
      }
    });
  });
}
