/* ==========================================================================
   APP MAIN CONTROLLER - BLOCK-BASED NAVIGATION WITH PMOC MODULE (OPTION 1)
   ========================================================================== */

import { currentTenant, assetCategories, customers, assets, workOrders, partsInventory, aiInsights, pmocPlans } from './mock-data.js';
import { CanvasSignaturePad } from './components/canvas-signature.js';

class AppController {
  constructor() {
    this.navStack = [];
    this.signaturePad = null;
    this.activeWorkOrder = null;

    this.init();
  }

  init() {
    this.setupGlobalEvents();
    this.setupModalHandlers();
    this.setupSignaturePad();
    this.setupForms();

    // Start at Level 0: Home Dashboard
    this.pushLevel(this.getLevel0Config());
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
    this.navStack = [this.getLevel0Config()];
    this.renderCurrentLevel();
  }

  renderCurrentLevel() {
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
          id: "mod-pmoc",
          title: "PMOC & Preventivas",
          desc: "Planos de manutenção & laudo sanitário",
          icon: "calendar-check",
          iconBgClass: "icon-box-indigo",
          badge: "96%",
          onClick: () => this.pushLevel(this.getPMOCLevel1Config())
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
          id: "mod-financial",
          title: "Financeiro & Peças",
          desc: "Estoque & faturamento por cliente",
          icon: "dollar-sign",
          iconBgClass: "icon-box-blue",
          badge: `${partsInventory.length}`,
          onClick: () => this.pushLevel(this.getFinancialLevel1Config())
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
        },
        {
          id: "mod-settings",
          title: "Configurações",
          desc: "Plano SaaS, RLS & regras SLA",
          icon: "settings",
          iconBgClass: "icon-box-dark",
          onClick: () => this.pushLevel(this.getSettingsLevel1Config())
        }
      ]
    };
  }

  // Level 1: PMOC & Preventives Sub-menu (Option 1)
  getPMOCLevel1Config() {
    return {
      title: "Módulo PMOC & Manutenção Preventiva",
      subtitle: "Gestão do Plano de Manutenção, Operação e Controle conforme Portaria MS 3.523/98.",
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
        },
        {
          id: "sub-pmoc-report",
          title: "Laudo de Conformidade PMOC",
          desc: "Emitir relatório sanitário com Anotação de Responsabilidade Técnica (ART)",
          icon: "file-check-2",
          iconBgClass: "icon-box-emerald",
          badge: "PDF Oficial",
          onClick: () => this.pushLevel(this.getPMOCReportContentView())
        },
        {
          id: "sub-pmoc-new-plan",
          title: "Novo Plano de Manutenção",
          desc: "Configurar periodicidade e checklist PMOC para um ativo",
          icon: "plus-circle",
          iconBgClass: "icon-box-purple",
          onClick: () => alert("Selecione um Ativo na lista de Ativos para vincular um novo Plano PMOC.")
        }
      ]
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
          onClick: () => document.getElementById('modal-add-asset').classList.add('active')
        },
        {
          id: "sub-list-assets",
          title: "Buscar & Listar Ativos",
          desc: "Todos os ativos em grade com prontuário",
          icon: "search",
          iconBgClass: "icon-box-blue",
          badge: `${assets.length}`,
          onClick: () => this.pushLevel(this.getAssetsListContentView())
        },
        {
          id: "sub-alert-assets",
          title: "Ativos em Manutenção",
          desc: "Equipamentos com falhas ativas",
          icon: "alert-triangle",
          iconBgClass: "icon-box-amber",
          badge: `${assets.filter(a => a.status === 'MAINTENANCE').length}`,
          onClick: () => this.pushLevel(this.getAssetsFilteredContentView('MAINTENANCE'))
        },
        {
          id: "sub-print-qr",
          title: "Etiquetas de QR Code",
          desc: "Imprimir etiquetas térmicas em lote",
          icon: "printer",
          iconBgClass: "icon-box-purple",
          onClick: () => window.print()
        }
      ]
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
          id: "sub-new-os",
          title: "Nova Ordem de Serviço",
          desc: "Abertura rápida de OS",
          icon: "file-plus",
          iconBgClass: "icon-box-emerald",
          onClick: () => alert("Para abrir uma nova OS, selecione um Ativo no módulo de Ativos ou escaneie o QR Code.")
        },
        {
          id: "sub-active-os",
          title: "OSs em Andamento",
          desc: "Atendimentos sendo executados",
          icon: "clock",
          iconBgClass: "icon-box-amber",
          badge: `${workOrders.filter(w => w.status !== 'FINISHED').length}`,
          onClick: () => this.pushLevel(this.getWorkOrdersContentView('IN_PROGRESS'))
        },
        {
          id: "sub-finished-os",
          title: "OSs Concluídas & Laudos",
          desc: "Histórico com fotos e assinatura",
          icon: "check-circle-2",
          iconBgClass: "icon-box-blue",
          badge: `${workOrders.filter(w => w.status === 'FINISHED').length}`,
          onClick: () => this.pushLevel(this.getWorkOrdersContentView('FINISHED'))
        }
      ]
    };
  }

  // Level 1: Financial Sub-menu
  getFinancialLevel1Config() {
    return {
      title: "Módulo Financeiro & Estoque de Peças",
      subtitle: "Controle de peças, faturamento por cliente e custos de manutenção.",
      breadcrumbTitle: "Financeiro & Peças",
      blocks: [
        {
          id: "sub-parts-stock",
          title: "Estoque de Peças",
          desc: "Catálogo de peças & vans",
          icon: "package",
          iconBgClass: "icon-box-blue",
          badge: `${partsInventory.length}`,
          onClick: () => this.pushLevel(this.getPartsInventoryContentView())
        },
        {
          id: "sub-client-billing",
          title: "Faturamento por Cliente",
          desc: "Contratos mensais & peças",
          icon: "file-text",
          iconBgClass: "icon-box-emerald",
          onClick: () => this.pushLevel(this.getClientBillingContentView())
        },
        {
          id: "sub-add-part",
          title: "Cadastrar Nova Peça",
          desc: "Adicionar item ao almoxarifado",
          icon: "package-plus",
          iconBgClass: "icon-box-purple",
          onClick: () => document.getElementById('modal-add-part').classList.add('active')
        }
      ]
    };
  }

  // Level 1: AI Sub-menu
  getAILevel1Config() {
    return {
      title: "Módulo de IA & Predição de Falhas",
      subtitle: "Inteligência artificial operacional e visão computacional.",
      breadcrumbTitle: "IA Operacional",
      blocks: [
        {
          id: "sub-predictive-matrix",
          title: "Matriz Preditiva de Falhas",
          desc: "Risco iminente nos próximos 30 dias",
          icon: "alert-octagon",
          iconBgClass: "icon-box-pink",
          badge: `${aiInsights.length}`,
          onClick: () => this.pushLevel(this.getAIPredictiveContentView())
        },
        {
          id: "sub-ai-assistant",
          title: "Assistente Inteligente IA",
          desc: "Consultas em linguagem natural",
          icon: "bot",
          iconBgClass: "icon-box-cyan",
          onClick: () => this.pushLevel(this.getAIAssistantContentView())
        }
      ]
    };
  }

  // Level 1: QR Scanner View
  getQRScannerLevel1Config() {
    return {
      title: "Leitor de QR Code em Campo",
      subtitle: "Aproxime a câmera da etiqueta no ativo para abrir seu prontuário.",
      breadcrumbTitle: "QR Code",
      renderContent: () => `
        <div style="max-width: 600px; margin: 0 auto; text-align: center;">
          <div class="card" style="padding: 36px; border: 2px dashed var(--primary);">
            <div style="width: 100%; height: 240px; background-color: #f8fafc; border-radius: var(--radius-md); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; position: relative;">
              <i data-lucide="qr-code" style="font-size: 4rem; color: var(--primary);"></i>
              <div style="font-size: 0.9rem; color: var(--text-muted);">Câmera PWA ativa. Enquadre a etiqueta...</div>
              <div style="position: absolute; width: 80%; height: 2px; background: var(--primary); box-shadow: 0 0 12px var(--primary); animation: scanAnimation 2s infinite linear;"></div>
            </div>
            <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px;">
              <div style="font-size: 0.85rem; color: var(--text-muted);">Simulação de Leitura Rápida:</div>
              <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn btn-secondary btn-quick-scan" data-hash="QR-GER-ALFA-9081">GER-500KVA-01</button>
                <button class="btn btn-secondary btn-quick-scan" data-hash="QR-CHIL-ALFA-4412">CHILLER-CARRIER-01</button>
              </div>
            </div>
          </div>
        </div>
      `,
      onContentLoaded: () => this.setupQuickScan()
    };
  }

  // Level 1: Customers View
  getCustomersLevel1Config() {
    return {
      title: "Clientes & Parques de Equipamentos",
      subtitle: "Gestão de contratos e locais de instalação.",
      breadcrumbTitle: "Clientes",
      renderContent: () => `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 20px;">
          ${customers.map(c => `
            <div class="card">
              <h3 style="margin-bottom: 6px;">${c.name}</h3>
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px;">CNPJ: ${c.document} | Contato: ${c.contactName}</div>
              <h4 style="font-size: 0.85rem; margin-bottom: 8px;">Locais de Instalação:</h4>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${c.locations.map(loc => `
                  <div style="font-size: 0.8rem; padding: 6px 10px; background: #f8fafc; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="map-pin" style="color: var(--primary);"></i>
                    <span>${loc.name}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `
    };
  }

  // Level 1: Settings View
  getSettingsLevel1Config() {
    return {
      title: "Configurações do Tenant & SaaS",
      subtitle: "Gerenciamento de plano, segurança RLS e parâmetros de SLA.",
      breadcrumbTitle: "Configurações",
      renderContent: () => `
        <div class="card" style="max-width: 600px;">
          <h3 style="margin-bottom: 12px;">Plano Ativo: Professional</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">Suporte a múltiplos técnicos, isolamento de dados RLS e predição por IA ativados.</p>
          <button class="btn btn-secondary">Gerenciar Assinatura</button>
        </div>
      `
    };
  }

  // Detailed PMOC Views (Option 1)
  getPMOCScheduleContentView() {
    return {
      title: "Cronograma de Inspeções Preventivas PMOC",
      subtitle: "Monitoramento de rotinas periódicas de manutenção técnica.",
      breadcrumbTitle: "Cronograma PMOC",
      renderContent: () => `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Ativo</th>
                <th>Cliente & Local</th>
                <th>Periodicidade</th>
                <th>Última Inspeção</th>
                <th>Próxima Inspeção</th>
                <th>Conformidade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${pmocPlans.map(plan => `
                <tr>
                  <td><strong style="color: var(--primary);">${plan.assetTag}</strong></td>
                  <td>${plan.customerName} - ${plan.locationName}</td>
                  <td><span class="badge badge-info">${plan.frequency}</span></td>
                  <td>${plan.lastInspectionDate}</td>
                  <td><strong>${plan.nextInspectionDate}</strong></td>
                  <td><strong style="color: var(--success);">${plan.compliancePercent}%</strong></td>
                  <td><span class="badge ${plan.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}">${plan.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
    };
  }

  getPMOCReportContentView() {
    return {
      title: "Laudo Oficial de Conformidade PMOC",
      subtitle: "Documento técnico com Anotação de Responsabilidade Técnica (ART) para vigilância sanitária.",
      breadcrumbTitle: "Laudo PMOC",
      renderContent: () => `
        <div class="card" style="max-width: 750px; margin: 0 auto; border: 2px solid var(--primary);">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px;">
            <div>
              <h2 style="font-size: 1.3rem; color: #0f172a;">LAUDO DE CONFORMIDADE TÉCNICA - PMOC</h2>
              <div style="font-size: 0.85rem; color: var(--text-muted);">Portaria Ministério da Saúde nº 3.523/1998 & Lei 13.589/2018</div>
            </div>
            <span class="badge badge-success" style="font-size: 0.85rem;">✓ AUDITADO & APROVADO</span>
          </div>

          <div style="font-size: 0.9rem; display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
            <div><strong>Empresa Prestadora:</strong> ${currentTenant.name} (${currentTenant.cnpj})</div>
            <div><strong>Responsável Técnico (ART):</strong> ${currentTenant.technicalResponsibilityART}</div>
            <div><strong>Índice de Conformidade Global do Parque:</strong> <span style="color: var(--success); font-weight: 800;">96.4%</span></div>
          </div>

          <h4 style="font-size: 0.95rem; margin-bottom: 10px;">Equipamentos Cobertos pelo Laudo:</h4>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;">
            ${pmocPlans.map(p => `
              <div style="padding: 10px 14px; background: #f8fafc; border-radius: var(--radius-sm); display: flex; justify-content: space-between; font-size: 0.85rem;">
                <span><strong>${p.assetTag}</strong> - ${p.customerName}</span>
                <span style="color: var(--success); font-weight: 700;">${p.compliancePercent}% Conforme (${p.frequency})</span>
              </div>
            `).join('')}
          </div>

          <button class="btn btn-primary" onclick="window.print()" style="width: 100%;">
            <i data-lucide="printer"></i> Imprimir / Baixar Laudo Oficial em PDF
          </button>
        </div>
      `
    };
  }

  // Detailed Content Views
  getAssetsListContentView() {
    return {
      title: "Prontuário de Ativos Patrimoniais",
      subtitle: "Clique em um ativo para acessar seu prontuário digital completo.",
      breadcrumbTitle: "Lista de Ativos",
      renderContent: () => `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
          ${assets.map(a => `
            <div class="card asset-card-item" style="cursor: pointer;" data-id="${a.id}">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div>
                  <h3 style="font-size: 1.1rem; color: #0f172a;">${a.tagName}</h3>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">${a.categoryName}</div>
                </div>
                <span class="badge ${a.status === 'INSTALLED' ? 'badge-success' : 'badge-warning'}">
                  ${a.status === 'INSTALLED' ? 'Instalado' : 'Manutenção'}
                </span>
              </div>
              <div style="font-size: 0.85rem; margin-bottom: 14px; display: flex; flex-direction: column; gap: 4px;">
                <div><strong>Cliente:</strong> ${a.customerName}</div>
                <div><strong>Modelo:</strong> ${a.model}</div>
                <div><strong>PMOC:</strong> <span class="badge badge-info">${a.pmocFrequency || 'MENSAL'}</span></div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; pt-3; border-top: 1px solid var(--border-color);">
                <span style="font-size: 0.75rem; color: var(--primary); font-weight: 600;">${a.qrCodeHash}</span>
                <button class="btn btn-secondary btn-icon"><i data-lucide="file-text"></i></button>
              </div>
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

  getAssetsFilteredContentView(statusFilter) {
    const filtered = assets.filter(a => a.status === statusFilter);
    return {
      title: `Ativos com Status: ${statusFilter}`,
      subtitle: "Equipamentos que requerem atenção operacional imediata.",
      breadcrumbTitle: "Filtrados",
      renderContent: () => `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
          ${filtered.map(a => `
            <div class="card asset-card-item" style="cursor: pointer;" data-id="${a.id}">
              <h3 style="font-size: 1.1rem; color: #0f172a;">${a.tagName}</h3>
              <div style="font-size: 0.85rem; margin: 10px 0;"><strong>Cliente:</strong> ${a.customerName}</div>
              <button class="btn btn-primary btn-block" style="width: 100%;">Abrir Prontuário</button>
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
              <tr>
                <th>Nº OS</th>
                <th>Ativo</th>
                <th>Cliente</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(wo => `
                <tr>
                  <td style="font-weight: 700; color: var(--primary);">${wo.osNumber}</td>
                  <td><strong>${wo.assetTag}</strong></td>
                  <td>${wo.customerName}</td>
                  <td><span class="badge ${wo.priority === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}">${wo.priority}</span></td>
                  <td><span class="badge ${wo.status === 'FINISHED' ? 'badge-success' : 'badge-info'}">${wo.status}</span></td>
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

  getPartsInventoryContentView() {
    return {
      title: "Estoque de Peças de Reposição",
      subtitle: "Peças disponíveis em estoque central e veículos de campo.",
      breadcrumbTitle: "Peças",
      renderContent: () => `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nome da Peça</th>
                <th>Categoria</th>
                <th>Preço Unit.</th>
                <th>Estoque</th>
                <th>Localização</th>
              </tr>
            </thead>
            <tbody>
              ${partsInventory.map(part => `
                <tr>
                  <td style="font-family: monospace; color: var(--primary); font-weight: 600;">${part.sku}</td>
                  <td><strong>${part.name}</strong></td>
                  <td><span class="badge badge-info">${part.category}</span></td>
                  <td style="font-weight: 600;">R$ ${part.unitPrice.toFixed(2)}</td>
                  <td><span class="badge ${part.stockQuantity <= part.minStockQuantity ? 'badge-danger' : 'badge-success'}">${part.stockQuantity} un</span></td>
                  <td>${part.location}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
    };
  }

  getClientBillingContentView() {
    return {
      title: "Faturamento Mensal por Cliente",
      subtitle: "Consolidação de contrato fixo, mão de obra e peças aplicadas.",
      breadcrumbTitle: "Faturamento",
      renderContent: () => `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contrato Fixo</th>
                <th>Mão de Obra</th>
                <th>Peças</th>
                <th>Total Faturado</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map(cust => `
                <tr>
                  <td><strong>${cust.name}</strong></td>
                  <td>R$ ${cust.contractValueMonthly.toFixed(2)}</td>
                  <td>R$ 420.00</td>
                  <td>R$ 750.00</td>
                  <td style="font-weight: 700; color: var(--success);">R$ ${(cust.contractValueMonthly + 1170).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
    };
  }

  getAIPredictiveContentView() {
    return {
      title: "Matriz Preditiva de Falhas por IA",
      subtitle: "Previsão de paradas não programadas nos próximos 30 dias.",
      breadcrumbTitle: "Predição",
      renderContent: () => `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${aiInsights.map(item => `
            <div class="card" style="border-left: 4px solid var(--danger);">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <h3 style="font-size: 1.1rem; color: #0f172a;">${item.assetTag} (${item.customerName})</h3>
                <span class="badge badge-danger">Risco Preditivo ${item.riskScore}%</span>
              </div>
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px;"><strong>Componente:</strong> ${item.predictedComponent} | <strong>Data Prevista:</strong> ${item.predictedFailureDate}</div>
              <div style="font-size: 0.9rem; margin-bottom: 8px;"><strong>Recomendação IA:</strong> ${item.recommendation}</div>
              <div style="color: var(--success); font-weight: 600; font-size: 0.85rem;">💰 Economia Preditiva: R$ ${item.financialSavingsIfPrevented.toFixed(2)}</div>
            </div>
          `).join('')}
        </div>
      `
    };
  }

  getAIAssistantContentView() {
    return {
      title: "Assistente Inteligente da Plataforma",
      subtitle: "Pergunte em linguagem natural sobre o estado de saúde dos ativos.",
      breadcrumbTitle: "Assistente",
      renderContent: () => `
        <div class="card">
          <div style="display: flex; gap: 10px; margin-bottom: 16px;">
            <input type="text" class="form-control" id="ai-query-input" placeholder="Ex: Qual o equipamento com maior risco este mês?">
            <button class="btn btn-primary" id="btn-submit-ai-query"><i data-lucide="send"></i> Consultar</button>
          </div>
          <div id="ai-query-response-box" style="display: none; padding: 14px; background: #f8fafc; border-radius: var(--radius-md); border-left: 3px solid var(--primary); font-size: 0.875rem;">
            <!-- Rendered dynamically -->
          </div>
        </div>
      `,
      onContentLoaded: () => this.setupAIQuery()
    };
  }

  // Setup Handlers
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

    const boxAfterPhoto = document.getElementById('box-after-photo');
    if (boxAfterPhoto) {
      boxAfterPhoto.addEventListener('click', () => {
        boxAfterPhoto.innerHTML = `
          <div style="position: relative;">
            <img src="https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=300&auto=format&fit=crop&q=60" style="width: 100%; height: 120px; object-fit: cover; border-radius: var(--radius-sm);">
            <span class="badge badge-success" style="position: absolute; bottom: 6px; right: 6px; font-size: 0.65rem;">✓ IA Auditado 98.4%</span>
          </div>
        `;
      });
    }

    const btnFinishOs = document.getElementById('btn-finish-os-submit');
    if (btnFinishOs) {
      btnFinishOs.addEventListener('click', () => {
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
        const tag = document.getElementById('new-asset-tag').value;
        const categoryId = document.getElementById('new-asset-category').value;
        const customerId = document.getElementById('new-asset-customer').value;
        const model = document.getElementById('new-asset-model').value;
        const serial = document.getElementById('new-asset-serial').value;

        const newAsset = {
          id: `asset-${Date.now()}`,
          tagName: tag,
          qrCodeHash: `QR-${tag}-ALFA`,
          categoryId: categoryId,
          categoryName: categoryId === 'cat-gen' ? 'Geradores & Energia' : 'HVAC & Climatização',
          customerId: customerId,
          customerName: customerId === 'cust-001' ? 'Hospital Central São Lucas' : 'Condomínio Torre Sul',
          locationName: 'Local Principal',
          model: model,
          serialNumber: serial,
          status: 'INSTALLED',
          criticality: 'MEDIUM',
          healthIndexScore: 98,
          installationDate: new Date().toISOString().split('T')[0],
          totalMaintenanceCost: 0,
          installedPartsHistory: [],
          history: [{ date: new Date().toISOString().split('T')[0], type: 'INSTALLATION', text: 'Ativo registrado e QR Code gerado.' }]
        };

        assets.unshift(newAsset);
        document.getElementById('modal-add-asset').classList.remove('active');
        formAsset.reset();
        this.renderCurrentLevel();
        alert(`Ativo ${tag} cadastrado com sucesso!`);
      });
    }

    const formPart = document.getElementById('form-add-part');
    if (formPart) {
      formPart.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-part-name').value;
        const sku = document.getElementById('new-part-sku').value;
        const category = document.getElementById('new-part-category').value;
        const price = parseFloat(document.getElementById('new-part-price').value);
        const qty = parseInt(document.getElementById('new-part-qty').value, 10);
        const warranty = parseInt(document.getElementById('new-part-warranty').value, 10);

        partsInventory.unshift({
          id: `part-${Date.now()}`,
          sku: sku,
          name: name,
          category: category,
          unitCost: price * 0.6,
          unitPrice: price,
          stockQuantity: qty,
          minStockQuantity: 3,
          location: "Almoxarifado Central",
          warrantyMonths: warranty
        });

        document.getElementById('modal-add-part').classList.remove('active');
        formPart.reset();
        this.renderCurrentLevel();
        alert(`Peça ${name} cadastrada com sucesso!`);
      });
    }
  }

  setupAIQuery() {
    const btnSubmit = document.getElementById('btn-submit-ai-query');
    const inputQuery = document.getElementById('ai-query-input');
    const responseBox = document.getElementById('ai-query-response-box');

    if (btnSubmit && inputQuery && responseBox) {
      btnSubmit.addEventListener('click', () => {
        const queryText = inputQuery.value.trim();
        if (!queryText) return;

        responseBox.style.display = 'block';
        responseBox.innerHTML = `
          <div style="color: var(--primary); font-weight: 600; margin-bottom: 6px;">🤖 Resposta do Assistente IA:</div>
          <div>Analisando parque patrimonial e histórico de serviços...</div>
          <div style="margin-top: 8px; color: var(--text-main); line-height: 1.5;">
            "O ativo de maior risco preditivo é o <strong>CHILLER-CARRIER-01</strong>. Risco de falha de 88% no compressor 1 até 25/08/2026. Recomendamos inspeção imediata das válvulas de expansão."
          </div>
        `;
      });
    }
  }

  setupQuickScan() {
    document.querySelectorAll('.btn-quick-scan').forEach(btn => {
      btn.addEventListener('click', () => {
        const hash = btn.getAttribute('data-hash');
        const foundAsset = assets.find(a => a.qrCodeHash === hash);
        if (foundAsset) {
          this.openAssetDetailModal(foundAsset);
        }
      });
    });
  }

  openAssetDetailModal(asset) {
    document.getElementById('modal-detail-tag').textContent = asset.tagName;
    document.getElementById('modal-detail-customer').textContent = `${asset.customerName} - ${asset.locationName}`;
    document.getElementById('modal-detail-model').textContent = `${asset.model} | Saúde IA: ${asset.healthIndexScore || 95}%`;
    document.getElementById('modal-detail-status').textContent = asset.status === 'INSTALLED' ? 'INSTALADO' : 'EM MANUTENÇÃO';

    const historyContainer = document.getElementById('modal-detail-history');
    historyContainer.innerHTML = asset.history.map(item => `
      <div style="font-size: 0.85rem; border-left: 2px solid var(--primary); padding-left: 10px;">
        <div style="font-weight: 600; color: var(--primary);">${item.date} - ${item.type}</div>
        <div style="color: var(--text-muted);">${item.text}</div>
      </div>
    `).join('');

    document.getElementById('print-tag-name').textContent = asset.tagName;
    document.getElementById('print-customer').textContent = asset.customerName;
    document.getElementById('print-hash').textContent = asset.qrCodeHash;

    document.getElementById('modal-asset-detail').classList.add('active');
  }

  openWorkOrderExecModal(wo) {
    this.activeWorkOrder = wo;
    document.getElementById('os-exec-title').textContent = `Execução da ${wo.osNumber}`;
    document.getElementById('os-exec-asset-tag').textContent = wo.assetTag;

    const checklistContainer = document.getElementById('os-exec-checklist-group');
    checklistContainer.innerHTML = wo.checklists.map(c => `
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
