/* ==========================================================================
   SUBSCRIPTION PAGE - SUBSCRIPTION MANAGEMENT & TRIAL EXPIRATION SCREEN
   ========================================================================== */

import { subscriptionService } from '../services/subscription-service.js';
import { billingService } from '../services/billing-service.js';
import { SAAS_PLANS } from '../config/plans.js';

export function renderSubscriptionManagementPage(tenantId) {
  const sub = subscriptionService.getTenantSubscription(tenantId);
  const currentPlan = subscriptionService.getPlanDetails(sub.planId);
  const paymentHistory = billingService.getPaymentHistory(tenantId);

  const isExpired = sub.subscriptionStatus === 'expired' || sub.subscriptionStatus === 'blocked';

  return `
    <div style="max-width: 900px; margin: 0 auto;">
      
      ${isExpired ? `
        <div class="card" style="border: 2px solid var(--danger); background-color: #fef2f2; padding: 24px; margin-bottom: 24px; text-align: center;">
          <i data-lucide="lock" style="font-size: 3rem; color: var(--danger); margin-bottom: 12px;"></i>
          <h2 style="color: #991b1b; margin-bottom: 8px;">Seu período gratuito de 30 dias terminou</h2>
          <p style="color: #7f1d1d; font-size: 0.95rem; margin-bottom: 16px;">
            Seus dados continuam salvos com total segurança. Escolha um plano abaixo para reativar o acesso total e continuar utilizando o sistema normalmente.
          </p>
        </div>
      ` : ''}

      <!-- Subscription Overview Card -->
      <div class="card" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h3 style="font-size: 1.2rem; color: #0f172a;">Plano Atual: ${currentPlan.name}</h3>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
              Status: <span class="badge ${sub.subscriptionStatus === 'active' ? 'badge-success' : sub.subscriptionStatus === 'trial' ? 'badge-info' : 'badge-danger'}">
                ${sub.subscriptionStatus === 'trial' ? 'PERÍODO GRATUITO (TRIAL)' : sub.subscriptionStatus === 'active' ? 'ASSINATURA ATIVA' : 'EXPIRADO'}
              </span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.4rem; font-weight: 800; color: #0f172a;">R$ ${currentPlan.priceMonthly.toFixed(2)}/mês</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Cobrança recorrente mensal</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; font-size: 0.85rem;">
          <div>
            <span style="color: var(--text-muted); display: block;">Início do Teste Grátis:</span>
            <strong>${new Date(sub.trialStartedAt).toLocaleDateString('pt-BR')}</strong>
          </div>

          <div>
            <span style="color: var(--text-muted); display: block;">Término do Teste Grátis:</span>
            <strong>${new Date(sub.trialEndsAt).toLocaleDateString('pt-BR')}</strong>
          </div>

          <div>
            <span style="color: var(--text-muted); display: block;">Dias Restantes do Teste:</span>
            <strong style="color: ${sub.remainingDays <= 3 ? 'var(--danger)' : 'var(--success)'}; font-size: 1.1rem;">
              ${sub.remainingDays} dias
            </strong>
          </div>

          <div>
            <span style="color: var(--text-muted); display: block;">Status de Acesso:</span>
            <span class="badge ${sub.accessStatus === 'FULL_ACCESS' ? 'badge-success' : 'badge-danger'}">
              ${sub.accessStatus === 'FULL_ACCESS' ? 'Acesso Total Liberado' : 'Leitura (Bloqueado)'}
            </span>
          </div>
        </div>
      </div>

      <!-- Upgrade / Plan Selector -->
      <div class="card" style="margin-bottom: 24px;">
        <h3 style="margin-bottom: 16px;">Escolher ou Alterar Plano</h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
          ${SAAS_PLANS.map(plan => `
            <div style="border: 1px solid ${plan.id === sub.planId ? 'var(--primary)' : 'var(--border-color)'}; border-radius: var(--radius-md); padding: 18px; background: ${plan.id === sub.planId ? '#f0f9ff' : '#ffffff'};">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h4 style="font-size: 1.1rem; color: #0f172a;">${plan.name}</h4>
                ${plan.id === sub.planId ? `<span class="badge badge-info">PLANO ATUAL</span>` : ''}
              </div>
              <div style="font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-bottom: 12px;">R$ ${plan.priceMonthly.toFixed(2)}/mês</div>
              
              <button class="btn ${plan.id === sub.planId ? 'btn-secondary' : 'btn-primary'} btn-activate-plan" data-plan-id="${plan.id}" style="width: 100%; font-size: 0.85rem;" ${plan.id === sub.planId ? 'disabled' : ''}>
                ${plan.id === sub.planId ? 'Plano Ativo' : `Assinar ${plan.name}`}
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Payment History Table -->
      <div class="card">
        <h3 style="margin-bottom: 16px;">Histórico de Pagamentos</h3>
        ${paymentHistory.length === 0 ? `
          <div style="color: var(--text-muted); font-size: 0.85rem; padding: 16px; text-align: center; background: #f8fafc; border-radius: var(--radius-md);">
            Nenhum pagamento efetuado ainda. Você está utilizando o período de 30 dias de teste gratuito.
          </div>
        ` : `
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Gateway</th>
                  <th>ID Transação</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${paymentHistory.map(pay => `
                  <tr>
                    <td>${new Date(pay.paidAt).toLocaleDateString('pt-BR')}</td>
                    <td><span class="badge badge-info">${pay.gateway}</span></td>
                    <td style="font-family: monospace;">${pay.transactionId}</td>
                    <td style="font-weight: 700;">R$ ${pay.amount.toFixed(2)}</td>
                    <td><span class="badge badge-success">${pay.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

    </div>
  `;
}
