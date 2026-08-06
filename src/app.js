/* ==========================================================================
   APP MAIN CONTROLLER - PUBLIC LANDING, AUTH, TRIAL ENGINE & BLOCK NAVIGATION
   ========================================================================== */

import { currentTenant, assetCategories, customers, assets, workOrders, partsInventory, aiInsights, pmocPlans, offlineSyncQueue } from './mock-data.js';
import { CanvasSignaturePad } from './components/canvas-signature.js';
import { authService } from './services/auth-service.js';
import { subscriptionService } from './services/subscription-service.js';
import { billingService } from './services/billing-service.js';
import { renderLandingPage } from './views/landing-page.js';
import { renderRegisterPage, renderLoginPage, renderForgotPasswordPage } from './views/auth-pages.js';
import { renderSubscriptionManagementPage } from './views/subscription-page.js';

class AppController {
  constructor() {
    this.navStack = [];
    this.signaturePad = null;
    this.activeWorkOrder = null;
    this.isOnline = navigator.onLine;

    this.currentViewMode = 'PUBLIC_LANDING'; // 'PUBLIC_LANDING', 'REGISTER', 'LOGIN', 'FORGOT', 'ADMIN_PANEL'

    this.init();
  }

  init() {
    this.setupGlobalEvents();
    this.setupNetworkStatusListener();
    this.setupModalHandlers();
    this.setupSignaturePad();
    this.setupForms();

    // Check if user is already logged in
    const user = authService.getCurrentUser();
    if (user) {
      this.currentViewMode = 'ADMIN_PANEL';
    }

    this.renderRouterView();
  }

  renderRouterView() {
    const publicContainer = document.getElementById('public-view-container');
    const privateContainer = document.getElementById('private-view-container');
    const trialBannerContainer = document.getElementById('trial-banner-container');
    const topbarRight = document.getElementById('header-topbar-right');
    const companyTitleEl = document.getElementById('header-company-name');

    const currentUser = authService.getCurrentUser();

    if (this.currentViewMode === 'ADMIN_PANEL' && currentUser) {
      publicContainer.style.display = 'none';
      publicContainer.innerHTML = '';
      privateContainer.style.display = 'block';

      const tenant = authService.getTenantById(currentUser.tenantId) || { name: currentUser.companyName || "Sua Empresa" };
      const sub = subscriptionService.getTenantSubscription(currentUser.tenantId);
      const trialConfig = subscriptionService.getTrialBannerConfig(sub);

      companyTitleEl.textContent = tenant.name;

      // Render Trial Top Banner
      if (trialConfig) {
        trialBannerContainer.innerHTML = `
          <div class="trial-banner" style="${trialConfig.messageStyle}">
            <span>💡 <strong>Aviso de Teste Grátis:</strong> ${trialConfig.text}</span>
            <button class="btn-trial-action" id="btn-trial-upgrade-now">Conhecer Planos</button>
          </div>
        `;
        document.getElementById('btn-trial-upgrade-now').addEventListener('click', () => {
          this.pushLevel(this.getSubscriptionManagementLevel1Config());
        });
      } else {
        trialBannerContainer.innerHTML = '';
      }

      // Update Topbar Right
      topbarRight.innerHTML = `
        <div class="tenant-pill" id="pwa-status-pill">
          <i data-lucide="wifi"></i> <span>ONLINE</span>
        </div>
        <div class="tenant-pill" style="background-color: #f1f5f9; color: #334155;">
          🏢 ${tenant.name}
        </div>
        <div class="user-role-badge">
          <span>👑 ${currentUser.fullName}</span>
        </div>
        <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.85rem;" id="btn-app-logout">
          Sair
        </button>
      `;

      document.getElementById('btn-app-logout').addEventListener('click', () => {
        authService.logout();
        this.currentViewMode = 'PUBLIC_LANDING';
        this.renderRouterView();
      });

      // Update KPI days
      const kpiSubDays = document.getElementById('kpi-sub-days');
      const kpiSubStatus = document.getElementById('kpi-sub-status');
      if (kpiSubDays && kpiSubStatus) {
        kpiSubDays.textContent = `${sub.remainingDays} dias`;
        kpiSubDays.style.color = sub.remainingDays <= 3 ? 'var(--danger)' : '#3b82f6';
        kpiSubStatus.textContent = sub.subscriptionStatus === 'trial' ? 'período gratuito' : 'assinatura ativa';
      }

      // If expired, auto-redirect to subscription block
      if (sub.subscriptionStatus === 'expired' || sub.subscriptionStatus === 'blocked') {
        this.navStack = [];
        this.pushLevel(this.getSubscriptionManagementLevel1Config());
      } else if (this.navStack.length === 0) {
        this.pushLevel(this.getLevel0Config());
      } else {
        this.renderCurrentLevel();
      }

    } else {
      // Public Views
      privateContainer.style.display = 'none';
      trialBannerContainer.innerHTML = '';
      publicContainer.style.display = 'block';

      companyTitleEl.textContent = "Plataforma de Manutenção & Ativos";

      topbarRight.innerHTML = `
        <button class="btn btn-secondary" id="btn-top-login">Entrar</button>
        <button class="btn btn-primary" id="btn-top-register">Começar Teste Grátis</button>
      `;

      document.getElementById('btn-top-login').addEventListener('click', () => {
        this.currentViewMode = 'LOGIN';
        this.renderRouterView();
      });

      document.getElementById('btn-top-register').addEventListener('click', () => {
        this.currentViewMode = 'REGISTER';
        this.renderRouterView();
      });

      if (this.currentViewMode === 'REGISTER') {
        publicContainer.innerHTML = renderRegisterPage();
        this.attachRegisterFormEvents();
      } else if (this.currentViewMode === 'LOGIN') {
        publicContainer.innerHTML = renderLoginPage();
        this.attachLoginFormEvents();
      } else if (this.currentViewMode === 'FORGOT') {
        publicContainer.innerHTML = renderForgotPasswordPage();
        this.attachForgotPasswordEvents();
      } else {
        // Default PUBLIC_LANDING
        publicContainer.innerHTML = renderLandingPage();
        this.attachLandingPageEvents();
      }
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  attachLandingPageEvents() {
    const btnHeroTrial = document.getElementById('btn-hero-trial');
    const btnHeroLogin = document.getElementById('btn-hero-login');

    if (btnHeroTrial) {
      btnHeroTrial.addEventListener('click', () => {
        this.currentViewMode = 'REGISTER';
        this.renderRouterView();
      });
    }

    if (btnHeroLogin) {
      btnHeroLogin.addEventListener('click', () => {
        this.currentViewMode = 'LOGIN';
        this.renderRouterView();
      });
    }

    document.querySelectorAll('.btn-choose-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentViewMode = 'REGISTER';
        this.renderRouterView();
      });
    });
  }

  attachRegisterFormEvents() {
    const form = document.getElementById('form-register');
    const errBox = document.getElementById('register-error-box');
    const linkLogin = document.getElementById('link-go-login');

    if (linkLogin) {
      linkLogin.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentViewMode = 'LOGIN';
        this.renderRouterView();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        errBox.style.display = 'none';

        const fullName = document.getElementById('reg-fullname').value.trim();
        const companyName = document.getElementById('reg-company').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        if (password !== confirmPassword) {
          errBox.style.display = 'block';
          errBox.textContent = "As senhas não coincidem. Digite novamente.";
          return;
        }

        try {
          authService.registerUser({ fullName, companyName, email, phone, password });
          alert(`Conta criada com sucesso para ${companyName}! Seu período gratuito de 30 dias foi iniciado.`);
          this.currentViewMode = 'ADMIN_PANEL';
          this.navStack = [];
          this.renderRouterView();
        } catch (err) {
          errBox.style.display = 'block';
          errBox.textContent = err.message;
        }
      });
    }
  }

  attachLoginFormEvents() {
    const form = document.getElementById('form-login');
    const errBox = document.getElementById('login-error-box');
    const linkReg = document.getElementById('link-go-register');
    const linkForgot = document.getElementById('link-forgot-password');

    if (linkReg) {
      linkReg.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentViewMode = 'REGISTER';
        this.renderRouterView();
      });
    }

    if (linkForgot) {
      linkForgot.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentViewMode = 'FORGOT';
        this.renderRouterView();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        errBox.style.display = 'none';

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        try {
          authService.login(email, password);
          this.currentViewMode = 'ADMIN_PANEL';
          this.navStack = [];
          this.renderRouterView();
        } catch (err) {
          errBox.style.display = 'block';
          errBox.textContent = err.message;
        }
      });
    }
  }

  attachForgotPasswordEvents() {
    const form = document.getElementById('form-forgot');
    const msgBox = document.getElementById('forgot-msg-box');
    const linkBack = document.getElementById('link-back-login');

    if (linkBack) {
      linkBack.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentViewMode = 'LOGIN';
        this.renderRouterView();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value.trim();
        try {
          const msg = authService.recoverPassword(email);
          msgBox.style.display = 'block';
          msgBox.style.backgroundColor = '#ecfdf5';
          msgBox.style.color = '#065f46';
          msgBox.textContent = msg;
        } catch (err) {
          msgBox.style.display = 'block';
          msgBox.style.backgroundColor = '#fef2f2';
          msgBox.style.color = '#991b1b';
          msgBox.textContent = err.message;
        }
      });
    }
  }

  setupNetworkStatusListener() {
    const updatePill = () => {
      this.isOnline = navigator.onLine;
      const pill = document.getElementById('pwa-status-pill');
      if (!pill) return;

      if (this.isOnline) {
        pill.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
        pill.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        pill.style.color = '#059669';
        pill.innerHTML = `<i data-lucide="wifi"></i> <span>ONLINE</span>`;
      } else {
        pill.style.backgroundColor = 'rgba(245, 158, 11, 0.15)';
        pill.style.borderColor = 'rgba(245, 158, 11, 0.3)';
        pill.style.color = '#d97706';
        pill.innerHTML = `<i data-lucide="wifi-off"></i> <span>MODO OFFLINE</span>`;
      }

      if (window.lucide) window.lucide.createIcons();
    };

    window.addEventListener('online', updatePill);
    window.addEventListener('offline', updatePill);
  }

  pushLevel(levelConfig) {
    this.navStack.push(levelConfig);
    this.renderCurrentLevel();
  }

  popLevel() {
    if (this.navStack.length > 1) {
      this.navStack.pop();
      this.renderCurrentLevel();
    }
  }

  resetToHome() {
    if (this.currentViewMode !== 'ADMIN_PANEL') {
      this.currentViewMode = 'PUBLIC_LANDING';
      this.renderRouterView();
      return;
    }
    this.navStack = [this.getLevel0Config()];
    this.renderCurrentLevel();
  }

  renderCurrentLevel() {
    if (this.navStack.length === 0) return;

    const current = this.navStack[this.navStack.length - 1];

    const navBar = document.getElementById('navigation-bar');
    const kpiRow = document.getElementById('kpi-summary-row');
    const sectionHeading = document.getElementById('section-heading');
    const btnBack = document.getElementById('btn-nav-back');
    const breadcrumbTrail = document.getElementById('breadcrumb-trail');

    if (this.navStack.length > 1) {
      navBar.style.display = 'flex';
      btnBack.style.display = 'inline-flex';
      kpiRow.style.display = 'none';
      sectionHeading.textContent = current.title.toUpperCase();
    } else {
      navBar.style.display = 'none';
      btnBack.style.display = 'none';
      kpiRow.style.display = 'grid';
      sectionHeading.textContent = "MÓDULOS";
    }

    breadcrumbTrail.innerHTML = this.navStack.map((item, index) => {
      const isLast = index === this.navStack.length - 1;
      return `<span class="${isLast ? 'active' : ''}">${item.breadcrumbTitle || item.title}</span>`;
    }).join(' <span style="color: var(--text-muted);">/</span> ');

    const blockGridContainer = document.getElementById('block-grid-container');
    const contentViewContainer = document.getElementById('content-view-container');

    if (current.blocks && current.blocks.length > 0) {
      blockGridContainer.style.display = 'grid';
      contentViewContainer.style.display = 'none';
      contentViewContainer.innerHTML = '';

      const displayBlocks = current.blocks.slice(0, 8);

      blockGridContainer.innerHTML = displayBlocks.map(block => `
        <div class="block-card" data-block-id="${block.id}">
          ${block.badge ? `<div class="notification-badge">${block.badge}</div>` : ''}
          <div class="block-icon-box ${block.iconBgClass || 'icon-box-emerald'}">
            <i data-lucide="${block.icon}"></i>
          </div>
          <div class="block-card-title">${block.title}</div>
          ${block.desc ? `<div class="block-card-desc">${block.desc}</div>` : ''}
        </div>
      `).join('');

      blockGridContainer.querySelectorAll('.block-card').forEach(card => {
        card.addEventListener('click', () => {
          const blockId = card.getAttribute('data-block-id');
          const targetBlock = displayBlocks.find(b => b.id === blockId);
          if (targetBlock && targetBlock.onClick) {
            targetBlock.onClick();
          }
        });
      });

    } else if (current.renderContent) {
      blockGridContainer.style.display = 'none';
      contentViewContainer.style.display = 'block';
      contentViewContainer.innerHTML = current.renderContent();

      if (current.onContentLoaded) {
        current.onContentLoaded();
      }
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Level 0: Home Dashboard (Exact missoes-da-loja module cards & icon boxes)
  getLevel0Config() {
    const user = authService.getCurrentUser();
    const sub = user ? subscriptionService.getTenantSubscription(user.tenantId) : null;

    return {
      title: "Painel do Gestor",
      subtitle: "Módulos de gestão de ativos e serviços",
      breadcrumbTitle: "Painel Principal",
      blocks: [
        {
          id: "mod-assets",
          title: "Ativos Patrimoniais",
          desc: "Gestão do ciclo de vida & QR Code",
          icon: "box",
          iconBgClass: "icon-box-teal",
          badge: `${assets.length}`,
          onClick: () => this.pushLevel(this.getAssetsLevel1Config())
        },
        {
          id: "mod-work-orders",
          title: "Ordens de Serviço",
          desc: "Preventiva, corretiva & checklists",
          icon: "wrench",
          iconBgClass: "icon-box-purple",
          badge: `${workOrders.filter(w => w.status !== 'FINISHED').length}`,
          onClick: () => this.pushLevel(this.getWorkOrdersLevel1Config())
        },
        {
          id: "mod-subscription",
          title: "Plano e Assinatura",
          desc: "Período gratuito & gestão de planos",
          icon: "credit-card",
          iconBgClass: "icon-box-blue",
          badge: sub ? `${sub.remainingDays} dias` : "30 dias",
          onClick: () => this.pushLevel(this.getSubscriptionManagementLevel1Config())
        },
        {
          id: "mod-pmoc",
          title: "PMOC & Preventivas",
          desc: "Planos de manutenção & laudo sanitário",
          icon: "calendar-check",
          iconBgClass: "icon-box-indigo",
          badge: "96%",
          onClick: () => this.pushLevel(this.getPMOCLevel1Config())
        },
        {
          id: "mod-pwa-offline",
          title: "PWA & Offline Sync",
          desc: "Modo sem internet & fila de sincronização",
          icon: "wifi-off",
          iconBgClass: "icon-box-amber",
          badge: `${offlineSyncQueue.filter(q => q.status === 'PENDING_SYNC').length}`,
          onClick: () => this.pushLevel(this.getPWAOfflineLevel1Config())
        },
        {
          id: "mod-qr-scanner",
          title: "Leitor QR Code",
          desc: "Escaneamento de ativos em campo",
          icon: "qr-code",
          iconBgClass: "icon-box-emerald",
          badge: "PWA",
          onClick: () => this.pushLevel(this.getQRScannerLevel1Config())
        },
        {
          id: "mod-ai-insights",
          title: "IA & Predição",
          desc: "Risco de falhas & auditoria visual",
          icon: "sparkles",
          iconBgClass: "icon-box-pink",
          badge: `${aiInsights.length}`,
          onClick: () => this.pushLevel(this.getAILevel1Config())
        },
        {
          id: "mod-customers",
          title: "Clientes & Locais",
          desc: "Parques de equipamentos por cliente",
          icon: "building-2",
          iconBgClass: "icon-box-orange",
          badge: `${customers.length}`,
          onClick: () => this.pushLevel(this.getCustomersLevel1Config())
        }
      ]
    };
  }

  // Level 1: Subscription Management View (Plano e Assinatura)
  getSubscriptionManagementLevel1Config() {
    const user = authService.getCurrentUser();
    const tenantId = user ? user.tenantId : "tenant-alfa-001";

    return {
      title: "Plano e Assinatura SaaS",
      subtitle: "Gestão do período gratuito de 30 dias e planos contratados.",
      breadcrumbTitle: "Plano e Assinatura",
      renderContent: () => renderSubscriptionManagementPage(tenantId),
      onContentLoaded: () => {
        document.querySelectorAll('.btn-activate-plan').forEach(btn => {
          btn.addEventListener('click', () => {
            const planId = btn.getAttribute('data-plan-id');
            billingService.processSubscriptionPayment({ tenantId, planId, billingCycle: "MONTHLY" });
            alert(`✓ Assinatura ativada com sucesso! O plano ${planId.toUpperCase()} já está em vigor.`);
            this.renderRouterView();
          });
        });
      }
    };
  }

  // Level 1: PWA Sub-menu
  getPWAOfflineLevel1Config() {
    return {
      title: "Módulo PWA & Sincronização Offline",
      subtitle: "Suporte a execução de serviços em locais sem sinal de celular.",
      breadcrumbTitle: "PWA Offline",
      blocks: [
        {
          id: "sub-pwa-queue",
          title: "Fila de Sincronização Pendente",
          desc: "Registros salvos localmente aguardando reconexão",
          icon: "refresh-cw",
          iconBgClass: "icon-box-amber",
          badge: `${offlineSyncQueue.filter(q => q.status === 'PENDING_SYNC').length} Pendente`,
          onClick: () => this.pushLevel(this.getPWASyncQueueContentView())
        }
      ]
    };
  }

  getPWASyncQueueContentView() {
    return {
      title: "Fila de Sincronização Offline (IndexedDB)",
      subtitle: "Lista de atendimentos realizados sem internet.",
      breadcrumbTitle: "Fila de Sincronização",
      renderContent: () => `
        <div class="card">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr><th>Nº OS</th><th>Ativo</th><th>Horário</th><th>Detalhes</th><th>Status</th></tr>
              </thead>
              <tbody>
                ${offlineSyncQueue.map(item => `
                  <tr>
                    <td><strong>${item.osNumber}</strong></td>
                    <td><strong>${item.assetTag}</strong></td>
                    <td>${item.timestamp}</td>
                    <td>${item.details}</td>
                    <td><span class="badge badge-success">${item.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `
    };
  }

  // Level 1: PMOC Sub-menu
  getPMOCLevel1Config() {
    return {
      title: "Módulo PMOC & Manutenção Preventiva",
      subtitle: "Gestão do Plano de Manutenção, Operação e Controle.",
      breadcrumbTitle: "PMOC & Preventivas",
      blocks: [
        {
          id: "sub-pmoc-schedule",
          title: "Cronograma de Preventivas",
          desc: "Visualizar inspeções periódicas agendadas",
          icon: "calendar",
          iconBgClass: "icon-box-indigo",
          badge: `${pmocPlans.length} Planos`,
          onClick: () => this.pushLevel(this.getPMOCScheduleContentView())
        }
      ]
    };
  }

  getPMOCScheduleContentView() {
    return {
      title: "Cronograma PMOC",
      subtitle: "Rotinas preventivas periódicas.",
      breadcrumbTitle: "Cronograma PMOC",
      renderContent: () => `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr><th>Ativo</th><th>Cliente</th><th>Periodicidade</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${pmocPlans.map(plan => `
                <tr>
                  <td><strong>${plan.assetTag}</strong></td>
                  <td>${plan.customerName}</td>
                  <td><span class="badge badge-info">${plan.frequency}</span></td>
                  <td><span class="badge badge-success">${plan.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
    };
  }

  // Level 1: Assets Sub-menu
  getAssetsLevel1Config() {
    return {
      title: "Módulo de Ativos Patrimoniais",
      subtitle: "Escolha uma ação para gerenciar o parque tecnológico.",
      breadcrumbTitle: "Ativos",
      blocks: [
        {
          id: "sub-add-asset",
          title: "Cadastrar Novo Ativo",
          desc: "Registrar equipamento & QR Code",
          icon: "plus-circle",
          iconBgClass: "icon-box-emerald",
          badge: "Novo",
          onClick: () => {
            const user = authService.getCurrentUser();
            if (user && subscriptionService.isAccessBlocked(user.tenantId)) {
              alert("Seu período gratuito de 30 dias terminou. Escolha um plano para cadastrar novos registros.");
              this.pushLevel(this.getSubscriptionManagementLevel1Config());
              return;
            }
            document.getElementById('modal-add-asset').classList.add('active');
          }
        },
        {
          id: "sub-list-assets",
          title: "Buscar & Listar Ativos",
          desc: "Todos os ativos em grade com prontuário",
          icon: "search",
          iconBgClass: "icon-box-blue",
          badge: `${assets.length}`,
          onClick: () => this.pushLevel(this.getAssetsListContentView())
        }
      ]
    };
  }

  getAssetsListContentView() {
    return {
      title: "Prontuário de Ativos Patrimoniais",
      subtitle: "Clique em um ativo para acessar seu prontuário digital completo.",
      breadcrumbTitle: "Lista de Ativos",
      renderContent: () => `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
          ${assets.map(a => `
            <div class="card asset-card-item" style="cursor: pointer;" data-id="${a.id}">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <div>
                  <h3 style="font-size: 1.1rem; color: #0f172a;">${a.tagName}</h3>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">${a.categoryName}</div>
                </div>
                <span class="badge badge-success">Instalado</span>
              </div>
              <div style="font-size: 0.85rem;"><strong>Cliente:</strong> ${a.customerName}</div>
            </div>
          `).join('')}
        </div>
      `,
      onContentLoaded: () => {
        document.querySelectorAll('.asset-card-item').forEach(card => {
          card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            const asset = assets.find(a => a.id === id);
            if (asset) this.openAssetDetailModal(asset);
          });
        });
      }
    };
  }

  // Level 1: Work Orders Sub-menu
  getWorkOrdersLevel1Config() {
    return {
      title: "Módulo de Ordens de Serviço",
      subtitle: "Gerencie chamados de campo, preventivas e checklists.",
      breadcrumbTitle: "Ordens de Serviço",
      blocks: [
        {
          id: "sub-active-os",
          title: "OSs em Andamento",
          desc: "Atendimentos sendo executados",
          icon: "clock",
          iconBgClass: "icon-box-amber",
          badge: `${workOrders.filter(w => w.status !== 'FINISHED').length}`,
          onClick: () => this.pushLevel(this.getWorkOrdersContentView('IN_PROGRESS'))
        }
      ]
    };
  }

  getWorkOrdersContentView(statusFilter) {
    const filtered = statusFilter ? workOrders.filter(w => w.status === statusFilter) : workOrders;
    return {
      title: "Ordens de Serviço",
      subtitle: "Lista de chamados técnicos e manutenções.",
      breadcrumbTitle: "Lista de OS",
      renderContent: () => `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr><th>Nº OS</th><th>Ativo</th><th>Cliente</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              ${filtered.map(wo => `
                <tr>
                  <td><strong>${wo.osNumber}</strong></td>
                  <td>${wo.assetTag}</td>
                  <td>${wo.customerName}</td>
                  <td><span class="badge badge-info">${wo.status}</span></td>
                  <td>
                    <button class="btn btn-secondary btn-open-os" data-id="${wo.id}">
                      <i data-lucide="play"></i> Executar OS
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `,
      onContentLoaded: () => {
        document.querySelectorAll('.btn-open-os').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const wo = workOrders.find(w => w.id === id);
            if (wo) this.openWorkOrderExecModal(wo);
          });
        });
      }
    };
  }

  getFinancialLevel1Config() {
    return {
      title: "Módulo Financeiro & Peças",
      subtitle: "Estoque de peças e faturamento.",
      breadcrumbTitle: "Financeiro & Peças",
      blocks: [
        {
          id: "sub-parts-stock",
          title: "Estoque de Peças",
          desc: "Catálogo de peças & almoxarifado",
          icon: "package",
          iconBgClass: "icon-box-blue",
          badge: `${partsInventory.length}`,
          onClick: () => alert("Visualizando catálogo de peças.")
        }
      ]
    };
  }

  getAILevel1Config() {
    return {
      title: "Módulo IA & Predição",
      subtitle: "Inteligência artificial operacioanl.",
      breadcrumbTitle: "IA Operacional",
      blocks: [
        {
          id: "sub-ai-insights",
          title: "Matriz Preditiva IA",
          desc: "Alertas de risco",
          icon: "sparkles",
          iconBgClass: "icon-box-pink",
          badge: `${aiInsights.length}`,
          onClick: () => alert("Visualizando matriz preditiva.")
        }
      ]
    };
  }

  getQRScannerLevel1Config() {
    return {
      title: "Leitor de QR Code",
      subtitle: "Câmera PWA ativa.",
      breadcrumbTitle: "QR Code",
      renderContent: () => `<div class="card" style="text-align: center; padding: 40px;">Câmera PWA ativa para leitura de QR Code.</div>`
    };
  }

  getCustomersLevel1Config() {
    return {
      title: "Clientes & Locais",
      subtitle: "Gestão de parques de equipamentos por cliente.",
      breadcrumbTitle: "Clientes",
      renderContent: () => `<div class="card">Lista de Clientes Cadastrados</div>`
    };
  }

  // Modals Setup
  setupGlobalEvents() {
    const btnHome = document.getElementById('btn-go-home');
    if (btnHome) btnHome.addEventListener('click', () => this.resetToHome());

    const btnBack = document.getElementById('btn-nav-back');
    if (btnBack) btnBack.addEventListener('click', () => this.popLevel());
  }

  setupModalHandlers() {
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.remove('active'));
      });
    });

    const btnPrintQr = document.getElementById('btn-print-qr-modal');
    if (btnPrintQr) btnPrintQr.addEventListener('click', () => window.print());
  }

  setupSignaturePad() {
    const canvasEl = document.getElementById('signature-canvas');
    if (canvasEl) {
      this.signaturePad = new CanvasSignaturePad(canvasEl);
      const btnClear = document.getElementById('btn-clear-signature');
      if (btnClear) btnClear.addEventListener('click', () => this.signaturePad.clear());
    }

    const btnFinishOs = document.getElementById('btn-finish-os-submit');
    if (btnFinishOs) {
      btnFinishOs.addEventListener('click', () => {
        const user = authService.getCurrentUser();
        if (user && subscriptionService.isAccessBlocked(user.tenantId)) {
          alert("Seu período gratuito de 30 dias terminou. Escolha um plano para concluir Ordens de Serviço.");
          document.getElementById('modal-os-exec').classList.remove('active');
          this.pushLevel(this.getSubscriptionManagementLevel1Config());
          return;
        }

        if (this.activeWorkOrder) {
          this.activeWorkOrder.status = 'FINISHED';
          alert(`Ordem de Serviço ${this.activeWorkOrder.osNumber} concluída com sucesso! Laudo emitido.`);
          document.getElementById('modal-os-exec').classList.remove('active');
          this.renderCurrentLevel();
        }
      });
    }
  }

  setupForms() {
    const formAsset = document.getElementById('form-add-asset');
    if (formAsset) {
      formAsset.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = authService.getCurrentUser();
        if (user && subscriptionService.isAccessBlocked(user.tenantId)) {
          alert("Seu período gratuito de 30 dias terminou. Escolha um plano para cadastrar novos registros.");
          document.getElementById('modal-add-asset').classList.remove('active');
          this.pushLevel(this.getSubscriptionManagementLevel1Config());
          return;
        }

        const tag = document.getElementById('new-asset-tag').value;
        const categoryId = document.getElementById('new-asset-category').value;
        const customerId = document.getElementById('new-asset-customer').value;
        const model = document.getElementById('new-asset-model').value;
        const serial = document.getElementById('new-asset-serial').value;

        assets.unshift({
          id: `asset-${Date.now()}`,
          tagName: tag,
          qrCodeHash: `QR-${tag}-ALFA`,
          categoryId: categoryId,
          categoryName: 'Equipamento Geral',
          customerId: customerId,
          customerName: 'Cliente Cadastrado',
          locationName: 'Local Principal',
          model: model,
          serialNumber: serial,
          status: 'INSTALLED',
          history: [{ date: new Date().toISOString().split('T')[0], type: 'INSTALLATION', text: 'Ativo cadastrado.' }]
        });

        document.getElementById('modal-add-asset').classList.remove('active');
        formAsset.reset();
        this.renderCurrentLevel();
        alert(`Ativo ${tag} cadastrado com sucesso!`);
      });
    }
  }

  openAssetDetailModal(asset) {
    document.getElementById('modal-detail-tag').textContent = asset.tagName;
    document.getElementById('modal-detail-customer').textContent = `${asset.customerName} - ${asset.locationName || 'Local Principal'}`;
    document.getElementById('modal-detail-model').textContent = `${asset.model}`;
    document.getElementById('modal-detail-status').textContent = 'INSTALADO';

    const historyContainer = document.getElementById('modal-detail-history');
    historyContainer.innerHTML = (asset.history || []).map(item => `
      <div style="font-size: 0.85rem; border-left: 2px solid var(--primary); padding-left: 10px;">
        <div style="font-weight: 600; color: var(--primary);">${item.date} - ${item.type}</div>
        <div style="color: var(--text-muted);">${item.text}</div>
      </div>
    `).join('');

    document.getElementById('modal-asset-detail').classList.add('active');
  }

  openWorkOrderExecModal(wo) {
    this.activeWorkOrder = wo;
    document.getElementById('os-exec-title').textContent = `Execução da ${wo.osNumber}`;
    document.getElementById('os-exec-asset-tag').textContent = wo.assetTag;

    const checklistContainer = document.getElementById('os-exec-checklist-group');
    checklistContainer.innerHTML = (wo.checklists || []).map(c => `
      <label style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #f8fafc; border-radius: var(--radius-sm); cursor: pointer;">
        <input type="checkbox" ${c.isChecked ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--primary);">
        <span style="font-size: 0.85rem;">${c.label}</span>
      </label>
    `).join('');

    if (this.signaturePad) {
      this.signaturePad.resizeCanvas();
    }

    document.getElementById('modal-os-exec').classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
