/* ==========================================================================
   PUBLIC LANDING PAGE - SAAS ASSET MANAGEMENT (EXACT LIGHT UI MATCH)
   ========================================================================== */

import { SAAS_PLANS } from '../config/plans.js';

export function renderLandingPage() {
  return `
    <div class="public-landing-container">
      
      <!-- Public Hero Section -->
      <section class="hero-section">
        <div class="hero-badge">
          <i data-lucide="shield-check" style="width: 16px; height: 16px; color: var(--success);"></i>
          <span>Teste grátis por 30 dias • Sem cobrança no período de teste</span>
        </div>

        <h1 class="hero-title">
          A Plataforma Definitiva para Gestão do Ciclo de Vida do Ativo Patrimonial
        </h1>

        <p class="hero-description">
          Elimine a papelada, acompanhe o histórico imutável dos equipamentos com QR Code, cumpra o PMOC sanitário e audite fotos de serviços com inteligência artificial.
        </p>

        <div class="hero-actions">
          <button class="btn btn-hero-primary" id="btn-hero-trial">
            <i data-lucide="rocket"></i>
            Começar Teste Grátis de 30 Dias
          </button>
          <button class="btn btn-hero-secondary" id="btn-hero-login">
            <i data-lucide="log-in"></i>
            Já sou Cliente / Entrar
          </button>
        </div>

        <div class="hero-guarantee">
          <span>✓ Sem necessidade de cartão de crédito</span>
          <span>✓ Cancelamento a qualquer momento</span>
          <span>✓ Acesso imediato</span>
        </div>
      </section>

      <!-- Benefits in Block Grid (Exact missoes-da-loja Pattern) -->
      <section style="margin-bottom: 48px;">
        <div class="section-heading" style="text-align: center; margin-bottom: 24px;">POR QUE NOSSOS CLIENTES AMAM O SISTEMA?</div>
        
        <div class="block-grid">
          <div class="block-card">
            <div class="block-icon-box icon-box-emerald">
              <i data-lucide="qr-code"></i>
            </div>
            <div class="block-card-title">Prontuário por QR Code</div>
            <div class="block-card-desc">Escaneie a etiqueta física no equipamento e acesse instantaneamente todo o histórico de manutenção de campo.</div>
          </div>

          <div class="block-card">
            <div class="block-icon-box icon-box-purple">
              <i data-lucide="calendar-check"></i>
            </div>
            <div class="block-card-title">Conformidade PMOC</div>
            <div class="block-card-desc">Geração automática de preventivas periódicas e emissão de laudo sanitário oficial com ART do CREA.</div>
          </div>

          <div class="block-card">
            <div class="block-icon-box icon-box-pink">
              <i data-lucide="sparkles"></i>
            </div>
            <div class="block-card-title">IA Preditiva de Falhas</div>
            <div class="block-card-desc">Prevenção de paradas não programadas com cálculo de risco por MTBF e auditoria de fotos por visão computacional.</div>
          </div>

          <div class="block-card">
            <div class="block-icon-box icon-box-amber">
              <i data-lucide="wifi-off"></i>
            </div>
            <div class="block-card-title">Modo PWA Offline</div>
            <div class="block-card-desc">Trabalhe em subsolos e casas de máquinas sem sinal de celular. Transmissão automática assim que o sinal voltar.</div>
          </div>
        </div>
      </section>

      <!-- How it Works Section -->
      <section class="card" style="margin-bottom: 48px; padding: 36px;">
        <h2 style="text-align: center; margin-bottom: 28px;">Como Funciona em 3 Passos Simples</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; text-align: center;">
          <div>
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #e0e7ff; color: #4338ca; font-weight: 800; font-size: 1.3rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;">1</div>
            <h4>Crie sua Conta em 30 Segundos</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">Inicie seu teste gratuito de 30 dias. Sua empresa terá dados 100% isolados e seguros.</p>
          </div>

          <div>
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #d1fae5; color: #065f46; font-weight: 800; font-size: 1.3rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;">2</div>
            <h4>Cadastre Ativos & Cole QR Codes</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">Registre equipamentos, imprima etiquetas térmicas e vincule a seus clientes.</p>
          </div>

          <div>
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #fef3c7; color: #92400e; font-weight: 800; font-size: 1.3rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;">3</div>
            <h4>Execute Serviços Sem Papelada</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">Técnicos preenchem checklists no celular, colhem assinaturas e emitem laudos instantâneos.</p>
          </div>
        </div>
      </section>

      <!-- Plans Table Section -->
      <section style="margin-bottom: 48px;" id="public-plans-section">
        <h2 style="text-align: center; margin-bottom: 12px;">Planos Transparentes para Qualquer Tamanho de Operação</h2>
        <p style="text-align: center; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 32px;">Aproveite 30 dias totalmente grátis em qualquer plano antes de escolher sua assinatura.</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
          ${SAAS_PLANS.map(plan => `
            <div class="card plan-card ${plan.popular ? 'plan-card-popular' : ''}">
              ${plan.popular ? `<span class="popular-tag">MAIS POPULAR</span>` : ''}
              <h3 style="font-size: 1.3rem; margin-bottom: 6px;">${plan.name}</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted); min-height: 40px; margin-bottom: 16px;">${plan.description}</p>
              
              <div style="margin-bottom: 20px;">
                <span style="font-size: 2.2rem; font-weight: 800; color: #0f172a;">R$ ${plan.priceMonthly.toFixed(2)}</span>
                <span style="font-size: 0.85rem; color: var(--text-muted);">/mês</span>
              </div>

              <button class="btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} btn-choose-plan" data-plan-id="${plan.id}" style="width: 100%; margin-bottom: 20px;">
                Iniciar Teste Grátis no ${plan.name}
              </button>

              <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 10px; border-top: 1px solid var(--border-color); padding-top: 14px;">O que está incluído:</div>
              <ul class="plan-features-list">
                ${plan.features.map(f => `<li><i data-lucide="check" style="color: var(--success); width: 16px; height: 16px;"></i> <span>${f}</span></li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="card" style="margin-bottom: 48px; padding: 36px;">
        <h2 style="text-align: center; margin-bottom: 24px;">Perguntas Frequentes (FAQ)</h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="padding: 14px; background: #f8fafc; border-radius: var(--radius-md);">
            <strong style="color: #0f172a;">Preciso colocar cartão de crédito para iniciar o teste?</strong>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Não! O cadastro leva 30 segundos e você não precisa digitar nenhum dado financeiro para testar durante 30 dias.</p>
          </div>

          <div style="padding: 14px; background: #f8fafc; border-radius: var(--radius-md);">
            <strong style="color: #0f172a;">O que acontece quando os 30 dias terminarem?</strong>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Nenhum dado é excluído. Você poderá acessar o sistema em modo de visualização e escolher o plano desejado para continuar operando normalmente.</p>
          </div>

          <div style="padding: 14px; background: #f8fafc; border-radius: var(--radius-md);">
            <strong style="color: #0f172a;">Meus dados ficam seguros e isolados?</strong>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Sim! Cada empresa cadastrada possui isolamento multitenant estrito via RLS (Row Level Security). Nenhuma outra empresa visualiza seus ativos ou relatórios.</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="public-footer">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <strong>SaaS Asset Management</strong> • © 2026 Todos os direitos reservados.
          </div>
          <div style="display: flex; gap: 16px; font-size: 0.85rem;">
            <a href="#" style="color: var(--text-muted); text-decoration: none;">Termos de Uso</a>
            <a href="#" style="color: var(--text-muted); text-decoration: none;">Política de Privacidade</a>
            <a href="#" style="color: var(--text-muted); text-decoration: none;">Suporte e Contato</a>
          </div>
        </div>
      </footer>

    </div>
  `;
}
