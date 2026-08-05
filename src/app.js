/* ==========================================================================
   APP MAIN CONTROLLER - SAAS ASSET MANAGEMENT
   ========================================================================== */

import { currentTenant, assetCategories, customers, assets, workOrders } from './mock-data.js';
import { CanvasSignaturePad } from './components/canvas-signature.js';

class AppController {
  constructor() {
    this.currentView = 'dashboard';
    this.signaturePad = null;
    this.activeWorkOrder = null;

    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupModalHandlers();
    this.setupSignaturePad();
    this.setupAssetForm();
    this.setupQuickScan();
    this.renderAll();

    // Refresh icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // SPA Navigation Router
  setupNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const viewTarget = item.getAttribute('data-view');
        this.switchView(viewTarget);
      });
    });
  }

  switchView(viewName) {
    this.currentView = viewName;

    // Update active nav item
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Hide all views, show targeted view
    document.querySelectorAll('.app-view').forEach(view => {
      view.style.display = 'none';
    });

    const targetViewEl = document.getElementById(`view-${viewName}`);
    if (targetViewEl) {
      targetViewEl.style.display = 'block';
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Modal Controllers
  setupModalHandlers() {
    // Close modal buttons
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
          modal.classList.remove('active');
        });
      });
    });

    // Open add asset modal
    const btnAddAsset = document.getElementById('btn-add-asset');
    if (btnAddAsset) {
      btnAddAsset.addEventListener('click', () => {
        document.getElementById('modal-add-asset').classList.add('active');
      });
    }

    // Quick OS Button
    const btnQuickOs = document.getElementById('btn-quick-os');
    if (btnQuickOs) {
      btnQuickOs.addEventListener('click', () => {
        this.switchView('work-orders');
      });
    }

    // Print QR Button in detail modal
    const btnPrintQr = document.getElementById('btn-print-qr-modal');
    if (btnPrintQr) {
      btnPrintQr.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // Canvas Signature Pad Initialization
  setupSignaturePad() {
    const canvasEl = document.getElementById('signature-canvas');
    if (canvasEl) {
      this.signaturePad = new CanvasSignaturePad(canvasEl);

      const btnClear = document.getElementById('btn-clear-signature');
      if (btnClear) {
        btnClear.addEventListener('click', () => {
          this.signaturePad.clear();
        });
      }
    }

    // Simular upload de foto "Depois"
    const boxAfterPhoto = document.getElementById('box-after-photo');
    if (boxAfterPhoto) {
      boxAfterPhoto.addEventListener('click', () => {
        boxAfterPhoto.innerHTML = `
          <img src="https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=300&auto=format&fit=crop&q=60" style="width: 100%; height: 120px; object-fit: cover; border-radius: var(--radius-sm);">
        `;
      });
    }

    // Encerramento da OS
    const btnFinishOs = document.getElementById('btn-finish-os-submit');
    if (btnFinishOs) {
      btnFinishOs.addEventListener('click', () => {
        if (this.activeWorkOrder) {
          this.activeWorkOrder.status = 'FINISHED';
          alert(`Ordem de Serviço ${this.activeWorkOrder.osNumber} concluída com sucesso! Laudo técnico PDF enviado ao cliente.`);
          document.getElementById('modal-os-exec').classList.remove('active');
          this.renderAll();
        }
      });
    }
  }

  // Add Asset Form Handler
  setupAssetForm() {
    const form = document.getElementById('form-add-asset');
    if (form) {
      form.addEventListener('submit', (e) => {
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
          installationDate: new Date().toISOString().split('T')[0],
          history: [
            { date: new Date().toISOString().split('T')[0], type: 'INSTALLATION', text: 'Ativo registrado e QR Code gerado.' }
          ]
        };

        assets.unshift(newAsset);
        document.getElementById('modal-add-asset').classList.remove('active');
        form.reset();
        this.renderAll();
        alert(`Ativo ${tag} cadastrado com sucesso! Etiquetas prontas para impressão.`);
      });
    }
  }

  // Quick QR Scan Simulator
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

  // Open Asset Prontuário Modal
  openAssetDetailModal(asset) {
    document.getElementById('modal-detail-tag').textContent = asset.tagName;
    document.getElementById('modal-detail-customer').textContent = `${asset.customerName} - ${asset.locationName}`;
    document.getElementById('modal-detail-model').textContent = `${asset.model} | Série: ${asset.serialNumber}`;
    document.getElementById('modal-detail-status').textContent = asset.status === 'INSTALLED' ? 'INSTALADO' : 'EM MANUTENÇÃO';

    const historyContainer = document.getElementById('modal-detail-history');
    historyContainer.innerHTML = asset.history.map(item => `
      <div style="font-size: 0.85rem; border-left: 2px solid var(--primary); padding-left: 10px;">
        <div style="font-weight: 600; color: var(--primary);">${item.date} - ${item.type}</div>
        <div style="color: var(--text-muted);">${item.text}</div>
      </div>
    `).join('');

    // Thermal Label text preview
    document.getElementById('print-tag-name').textContent = asset.tagName;
    document.getElementById('print-customer').textContent = asset.customerName;
    document.getElementById('print-hash').textContent = asset.qrCodeHash;

    document.getElementById('modal-asset-detail').classList.add('active');
  }

  // Open OS Execution Modal
  openWorkOrderExecModal(wo) {
    this.activeWorkOrder = wo;
    document.getElementById('os-exec-title').textContent = `Execução da ${wo.osNumber}`;
    document.getElementById('os-exec-asset-tag').textContent = wo.assetTag;

    const checklistContainer = document.getElementById('os-exec-checklist-group');
    checklistContainer.innerHTML = wo.checklists.map(c => `
      <label style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--bg-card); border-radius: var(--radius-sm); cursor: pointer;">
        <input type="checkbox" ${c.isChecked ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--primary);">
        <span style="font-size: 0.85rem;">${c.label}</span>
      </label>
    `).join('');

    if (this.signaturePad) {
      this.signaturePad.resizeCanvas();
    }

    document.getElementById('modal-os-exec').classList.add('active');
  }

  // Render All Views
  renderAll() {
    this.renderDashboardOS();
    this.renderCategoryDistribution();
    this.renderAssetsGrid();
    this.renderWorkOrdersTable();
    this.renderCustomersList();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderDashboardOS() {
    const tbody = document.getElementById('table-dashboard-os');
    if (!tbody) return;

    tbody.innerHTML = workOrders.slice(0, 5).map(wo => `
      <tr>
        <td style="font-weight: 600; color: var(--primary);">${wo.osNumber}</td>
        <td><strong>${wo.assetTag}</strong></td>
        <td>${wo.customerName}</td>
        <td><span class="badge ${wo.type === 'CORRECTIVE' ? 'badge-danger' : 'badge-info'}">${wo.type}</span></td>
        <td><span class="badge ${wo.status === 'FINISHED' ? 'badge-success' : 'badge-warning'}">${wo.status}</span></td>
        <td>
          <button class="btn btn-secondary btn-icon btn-open-os" data-id="${wo.id}" title="Executar OS">
            <i data-lucide="play-circle"></i>
          </button>
        </td>
      </tr>
    `).join('');

    // Bind click handlers for OS execution buttons
    tbody.querySelectorAll('.btn-open-os').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const wo = workOrders.find(w => w.id === id);
        if (wo) this.openWorkOrderExecModal(wo);
      });
    });
  }

  renderCategoryDistribution() {
    const container = document.getElementById('category-distribution-list');
    if (!container) return;

    container.innerHTML = assetCategories.map(cat => {
      const count = assets.filter(a => a.categoryId === cat.id).length;
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background-color: var(--bg-primary); border-radius: var(--radius-md);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i data-lucide="${cat.icon}" style="color: var(--primary);"></i>
            <span style="font-size: 0.9rem; font-weight: 500;">${cat.name}</span>
          </div>
          <span class="badge badge-info">${count} Ativos</span>
        </div>
      `;
    }).join('');
  }

  renderAssetsGrid() {
    const grid = document.getElementById('assets-grid');
    if (!grid) return;

    grid.innerHTML = assets.map(a => `
      <div class="card asset-card-item" data-id="${a.id}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <h3 style="font-size: 1.1rem; color: #fff;">${a.tagName}</h3>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${a.categoryName}</div>
          </div>
          <span class="badge ${a.status === 'INSTALLED' ? 'badge-success' : 'badge-warning'}">
            ${a.status === 'INSTALLED' ? 'Instalado' : 'Manutenção'}
          </span>
        </div>

        <div style="font-size: 0.85rem; margin-bottom: 14px; display: flex; flex-direction: column; gap: 4px;">
          <div><strong>Cliente:</strong> ${a.customerName}</div>
          <div><strong>Local:</strong> ${a.locationName}</div>
          <div><strong>Modelo:</strong> ${a.model}</div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; pt-3; border-top: var(--glass-border);">
          <span style="font-size: 0.75rem; color: var(--primary); font-weight: 600;">${a.qrCodeHash}</span>
          <button class="btn btn-secondary btn-icon btn-view-asset-detail" data-id="${a.id}">
            <i data-lucide="file-text"></i>
          </button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.btn-view-asset-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const asset = assets.find(a => a.id === id);
        if (asset) this.openAssetDetailModal(asset);
      });
    });
  }

  renderWorkOrdersTable() {
    const tbody = document.getElementById('table-full-os');
    if (!tbody) return;

    tbody.innerHTML = workOrders.map(wo => `
      <tr>
        <td style="font-weight: 700; color: var(--primary);">${wo.osNumber}</td>
        <td><strong>${wo.assetTag}</strong></td>
        <td>${wo.customerName}</td>
        <td><span class="badge ${wo.priority === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}">${wo.priority}</span></td>
        <td><span class="badge ${wo.status === 'FINISHED' ? 'badge-success' : 'badge-info'}">${wo.status}</span></td>
        <td>
          <button class="btn btn-secondary btn-open-os" data-id="${wo.id}">
            <i data-lucide="play"></i> Abrir
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-open-os').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const wo = workOrders.find(w => w.id === id);
        if (wo) this.openWorkOrderExecModal(wo);
      });
    });
  }

  renderCustomersList() {
    const container = document.getElementById('customers-list');
    if (!container) return;

    container.innerHTML = customers.map(c => `
      <div class="card">
        <h3 style="margin-bottom: 6px;">${c.name}</h3>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px;">CNPJ: ${c.document} | Contato: ${c.contactName}</div>
        
        <h4 style="font-size: 0.85rem; margin-bottom: 8px;">Locais & Parques de Ativos:</h4>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${c.locations.map(loc => `
            <div style="font-size: 0.8rem; padding: 6px 10px; background: var(--bg-primary); border-radius: var(--radius-sm); display: flex; align-items: center; gap: 8px;">
              <i data-lucide="map-pin" style="font-size: 0.8rem; color: var(--primary);"></i>
              <span>${loc.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }
}

// Instantiate App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
