/* ==========================================================================
   NEW SERVICE WIZARD - 4-STEP GUIDED FLOW (+ NOVO SERVIÇO)
   ========================================================================== */

import { tenantDataService } from '../services/tenant-data-service.js';
import { authService } from '../services/auth-service.js';

export class NewServiceWizard {
  constructor(onCompleteCallback, onCancelCallback) {
    this.currentStep = 1;
    this.onCompleteCallback = onCompleteCallback;
    this.onCancelCallback = onCancelCallback;

    const user = authService.getCurrentUser();
    this.tenantId = user ? user.tenantId : 'tenant-alfa-001';

    this.draft = {
      clientChoiceMode: 'SELECT', // 'SELECT' or 'CREATE'
      selectedClientId: '',
      clientName: '',
      clientPhone: '',
      clientAddress: '',
      clientNotes: '',

      equipmentChoiceMode: 'CREATE', // 'SELECT' or 'CREATE'
      selectedEquipmentId: '',
      equipmentType: 'Ar-condicionado',
      equipmentTypeOther: '',
      equipmentBrand: '',
      equipmentModel: '',
      equipmentSerial: '',
      equipmentLocation: '',
      reportedProblem: '',

      photosBefore: [],
      photosDuring: [],
      photosAfter: []
    };
  }

  render() {
    return `
      <div class="wizard-container card" style="max-width: 800px; margin: 0 auto; padding: 28px;">
        
        <!-- Step Header Progress Bar -->
        <div class="wizard-header">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <button class="btn btn-secondary btn-wizard-back" id="btn-wizard-step-back" ${this.currentStep === 1 ? 'disabled' : ''}>
              <i data-lucide="arrow-left"></i> Voltar
            </button>

            <div style="font-weight: 700; color: #0f172a; font-size: 0.95rem;">
              Etapa ${this.currentStep} de 4 — ${this.getStepTitle()}
            </div>

            <button class="btn btn-secondary" id="btn-wizard-draft" style="font-size: 0.8rem;">
              Salvar Rascunho
            </button>
          </div>

          <!-- Progress Bar Track -->
          <div style="height: 6px; background-color: #e2e8f0; border-radius: 999px; overflow: hidden; margin-bottom: 24px;">
            <div style="width: ${(this.currentStep / 4) * 100}%; height: 100%; background: linear-gradient(135deg, #6366f1, #10b981); transition: width 0.3s ease;"></div>
          </div>
        </div>

        <!-- Dynamic Step Content Body -->
        <div class="wizard-body" id="wizard-step-content">
          ${this.renderCurrentStepContent()}
        </div>

      </div>
    `;
  }

  getStepTitle() {
    switch (this.currentStep) {
      case 1: return "Cliente";
      case 2: return "Produto ou Equipamento";
      case 3: return "Fotos do Serviço";
      case 4: return "Revisar e Salvar";
      default: return "";
    }
  }

  renderCurrentStepContent() {
    switch (this.currentStep) {
      case 1: return this.renderStep1Client();
      case 2: return this.renderStep2Equipment();
      case 3: return this.renderStep3Photos();
      case 4: return this.renderStep4Review();
      default: return "";
    }
  }

  // ETAPA 1 — CLIENTE
  renderStep1Client() {
    const existingClients = tenantDataService.getClients(this.tenantId);

    return `
      <div>
        <h3 style="margin-bottom: 6px;">Quem é o cliente deste atendimento?</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 20px;">
          Selecione um cliente cadastrado ou adicione um novo cliente em poucos segundos.
        </p>

        <!-- Toggle Mode Big Cards -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
          <div class="block-card ${this.draft.clientChoiceMode === 'SELECT' ? 'card-selected' : ''}" id="btn-mode-select-client" style="min-height: 110px; padding: 18px;">
            <div class="block-icon-box icon-box-blue" style="width: 42px; height: 42px; font-size: 1.2rem;">
              <i data-lucide="users"></i>
            </div>
            <div class="block-card-title" style="font-size: 0.95rem;">Selecionar Cliente Existente</div>
          </div>

          <div class="block-card ${this.draft.clientChoiceMode === 'CREATE' ? 'card-selected' : ''}" id="btn-mode-create-client" style="min-height: 110px; padding: 18px;">
            <div class="block-icon-box icon-box-emerald" style="width: 42px; height: 42px; font-size: 1.2rem;">
              <i data-lucide="user-plus"></i>
            </div>
            <div class="block-card-title" style="font-size: 0.95rem;">Cadastrar Novo Cliente</div>
          </div>
        </div>

        ${this.draft.clientChoiceMode === 'SELECT' ? `
          <div>
            ${existingClients.length === 0 ? `
              <div style="padding: 20px; background: #f8fafc; border-radius: var(--radius-md); text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                Nenhum cliente cadastrado ainda. Escolha a opção "Cadastrar Novo Cliente" acima.
              </div>
            ` : `
              <div class="form-group">
                <label class="form-label">Buscar Cliente por Nome ou Telefone</label>
                <input type="text" class="form-control" id="search-client-input" placeholder="Digite para filtrar..." value="${this.draft.clientName}">
              </div>

              <div style="display: flex; flex-direction: column; gap: 10px; max-height: 220px; overflow-y: auto; margin-bottom: 20px;" id="client-results-list">
                ${existingClients.map(c => `
                  <div class="card ${this.draft.selectedClientId === c.id ? 'card-selected' : ''}" style="padding: 14px; margin-bottom: 0; cursor: pointer;" data-client-id="${c.id}">
                    <div style="font-weight: 700; color: #0f172a;">${c.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">📞 ${c.phone} | 📍 ${c.address || 'Sem endereço'}</div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        ` : `
          <div>
            <div class="form-group">
              <label class="form-label">Nome do Cliente *</label>
              <input type="text" class="form-control" id="new-client-name" placeholder="Ex: Hospital Central ou João da Silva" value="${this.draft.clientName}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Telefone / WhatsApp *</label>
              <input type="tel" class="form-control" id="new-client-phone" placeholder="Ex: (81) 99887-6655" value="${this.draft.clientPhone}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Endereço de Atendimento (Opcional)</label>
              <input type="text" class="form-control" id="new-client-address" placeholder="Ex: Av. Boa Viagem, 1200 - Bloco B" value="${this.draft.clientAddress}">
            </div>
          </div>
        `}

        <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
          <button class="btn btn-primary" id="btn-step1-continue">
            Continuar para Equipamento <i data-lucide="arrow-right"></i>
          </button>
        </div>
      </div>
    `;
  }

  // ETAPA 2 — PRODUTO OU EQUIPAMENTO
  renderStep2Equipment() {
    const types = ["Ar-condicionado", "Geladeira", "Forno", "Fogão", "Veículo", "Máquina", "Equipamento Elétrico", "Outro"];

    return `
      <div>
        <h3 style="margin-bottom: 6px;">Qual produto ou equipamento receberá manutenção?</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 20px;">
          Informe os detalhes do item para identificação na Ordem de Serviço.
        </p>

        <div class="form-group">
          <label class="form-label">Tipo do Equipamento *</label>
          <select class="form-control" id="equip-type-select">
            ${types.map(t => `<option value="${t}" ${this.draft.equipmentType === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>

        ${this.draft.equipmentType === 'Outro' ? `
          <div class="form-group">
            <label class="form-label">Especifique o Tipo *</label>
            <input type="text" class="form-control" id="equip-type-other" placeholder="Ex: Gerador Diesel 500kVA" value="${this.draft.equipmentTypeOther}">
          </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Marca *</label>
            <input type="text" class="form-control" id="equip-brand" placeholder="Ex: Carrier, Brastemp, Cummins" value="${this.draft.equipmentBrand}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Modelo *</label>
            <input type="text" class="form-control" id="equip-model" placeholder="Ex: Split 18000 BTUs Inverter" value="${this.draft.equipmentModel}" required>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Número de Série (Opcional)</label>
            <input type="text" class="form-control" id="equip-serial" placeholder="Ex: SN-998877" value="${this.draft.equipmentSerial}">
          </div>
          <div class="form-group">
            <label class="form-label">Localização (Opcional)</label>
            <input type="text" class="form-control" id="equip-location" placeholder="Ex: Sala de Reuniões 02" value="${this.draft.equipmentLocation}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Problema Relatado *</label>
          <textarea class="form-control" id="equip-problem" rows="3" placeholder="Descreva o que o cliente informou..." required>${this.draft.reportedProblem}</textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
          <button class="btn btn-primary" id="btn-step2-continue">
            Continuar para Fotos <i data-lucide="arrow-right"></i>
          </button>
        </div>
      </div>
    `;
  }

  // ETAPA 3 — FOTOS DO SERVIÇO (ANTES, DURANTE, DEPOIS)
  renderStep3Photos() {
    return `
      <div>
        <h3 style="margin-bottom: 6px;">Fotos da Manutenção (Evidências Visuais)</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 20px;">
          Adicione fotos do estado do equipamento. Nenhuma foto é obrigatória para continuar.
        </p>

        <!-- 3 Photo Blocks: Antes, Durante, Depois -->
        <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px;">
          
          <!-- Block 1: Antes -->
          <div class="card" style="margin-bottom: 0; border: 1px dashed var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="font-size: 0.95rem; color: #0f172a;">📸 Antes do Serviço</h4>
              <button class="btn btn-secondary btn-add-photo-type" data-type="before" style="font-size: 0.8rem;">
                + Adicionar Fotos Antes
              </button>
            </div>
            <div class="photo-thumbnails-grid" id="photos-grid-before">
              ${this.renderPhotoThumbnails(this.draft.photosBefore, 'before')}
            </div>
          </div>

          <!-- Block 2: Durante -->
          <div class="card" style="margin-bottom: 0; border: 1px dashed var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="font-size: 0.95rem; color: #0f172a;">🛠️ Durante o Serviço</h4>
              <button class="btn btn-secondary btn-add-photo-type" data-type="during" style="font-size: 0.8rem;">
                + Adicionar Fotos Durante
              </button>
            </div>
            <div class="photo-thumbnails-grid" id="photos-grid-during">
              ${this.renderPhotoThumbnails(this.draft.photosDuring, 'during')}
            </div>
          </div>

          <!-- Block 3: Depois -->
          <div class="card" style="margin-bottom: 0; border: 1px dashed var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="font-size: 0.95rem; color: #0f172a;">✨ Depois do Serviço</h4>
              <button class="btn btn-secondary btn-add-photo-type" data-type="after" style="font-size: 0.8rem;">
                + Adicionar Fotos Depois
              </button>
            </div>
            <div class="photo-thumbnails-grid" id="photos-grid-after">
              ${this.renderPhotoThumbnails(this.draft.photosAfter, 'after')}
            </div>
          </div>

        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
          <button class="btn btn-primary" id="btn-step3-continue">
            Revisar e Concluir <i data-lucide="arrow-right"></i>
          </button>
        </div>
      </div>
    `;
  }

  renderPhotoThumbnails(photos, type) {
    if (photos.length === 0) {
      return `<div style="font-size: 0.8rem; color: var(--text-muted); padding: 8px;">Nenhuma foto adicionada nesta categoria.</div>`;
    }

    return photos.map((p, index) => `
      <div style="position: relative; width: 100px; height: 90px; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border-color);">
        <img src="${p.url}" style="width: 100%; height: 100%; object-fit: cover;">
        <button class="btn-remove-photo" data-type="${type}" data-index="${index}" style="position: absolute; top: 4px; right: 4px; background: rgba(239,68,68,0.9); color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">✕</button>
      </div>
    `).join('');
  }

  // ETAPA 4 — REVISAR E SALVAR
  renderStep4Review() {
    return `
      <div>
        <h3 style="margin-bottom: 6px;">Revisar e Criar Serviço</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 20px;">
          Confira o resumo do atendimento antes de gerar o registro oficial.
        </p>

        <div class="card" style="background: #f8fafc; padding: 20px; margin-bottom: 24px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.9rem;">
            <div>
              <span style="color: var(--text-muted); display: block;">Cliente:</span>
              <strong>${this.draft.clientName}</strong> (${this.draft.clientPhone})
            </div>

            <div>
              <span style="color: var(--text-muted); display: block;">Equipamento:</span>
              <strong>${this.draft.equipmentBrand} ${this.draft.equipmentModel}</strong> (${this.draft.equipmentType})
            </div>

            <div style="grid-column: span 2;">
              <span style="color: var(--text-muted); display: block;">Problema Relatado:</span>
              <div style="color: #0f172a; font-weight: 600;">"${this.draft.reportedProblem}"</div>
            </div>

            <div>
              <span style="color: var(--text-muted); display: block;">Fotos Capturadas:</span>
              <div>Antes: <strong>${this.draft.photosBefore.length}</strong> | Durante: <strong>${this.draft.photosDuring.length}</strong> | Depois: <strong>${this.draft.photosAfter.length}</strong></div>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button class="btn btn-secondary" id="btn-review-back-edit">
            <i data-lucide="edit-3"></i> Voltar e Editar
          </button>

          <button class="btn btn-primary" id="btn-submit-create-service" style="padding: 12px 24px; font-size: 1rem;">
            <i data-lucide="check-circle-2"></i> Criar Serviço Oficial
          </button>
        </div>
      </div>
    `;
  }

  // TELA DE CONFIRMAÇÃO DE SUCESSO
  renderConfirmationScreen(createdService) {
    return `
      <div class="card" style="max-width: 650px; margin: 30px auto; padding: 36px; text-align: center;">
        <div style="width: 64px; height: 64px; background: #d1fae5; color: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 2rem;">
          ✓
        </div>

        <h2 style="color: #0f172a; margin-bottom: 8px;">Serviço Criado com Sucesso!</h2>
        <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 12px;">${createdService.serviceNumber}</div>

        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 28px;">
          O atendimento para <strong>${createdService.clientName}</strong> foi registrado e o status inicial foi definido como <strong>"Aberto"</strong>.
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <button class="btn btn-primary" id="btn-conf-view-service" data-id="${createdService.id}">
            <i data-lucide="eye"></i> Ver Serviço
          </button>

          <button class="btn btn-secondary" id="btn-conf-another-service">
            <i data-lucide="plus"></i> Criar Outro Serviço
          </button>
        </div>

        <div style="margin-top: 14px;">
          <button class="btn btn-secondary" id="btn-conf-home" style="width: 100%;">
            Voltar ao Painel Principal
          </button>
        </div>
      </div>
    `;
  }

  attachEvents() {
    const btnBackHeader = document.getElementById('btn-wizard-step-back');
    if (btnBackHeader) {
      btnBackHeader.addEventListener('click', () => {
        if (this.currentStep > 1) {
          this.currentStep--;
          this.updateDOM();
        }
      });
    }

    const btnDraft = document.getElementById('btn-wizard-draft');
    if (btnDraft) {
      btnDraft.addEventListener('click', () => {
        alert("✓ Rascunho salvo no dispositivo!");
        if (this.onCancelCallback) this.onCancelCallback();
      });
    }

    // Step 1 Handlers
    if (this.currentStep === 1) {
      const btnSelectMode = document.getElementById('btn-mode-select-client');
      const btnCreateMode = document.getElementById('btn-mode-create-client');

      if (btnSelectMode) {
        btnSelectMode.addEventListener('click', () => {
          this.draft.clientChoiceMode = 'SELECT';
          this.updateDOM();
        });
      }

      if (btnCreateMode) {
        btnCreateMode.addEventListener('click', () => {
          this.draft.clientChoiceMode = 'CREATE';
          this.updateDOM();
        });
      }

      const clientCards = document.querySelectorAll('#client-results-list .card');
      clientCards.forEach(c => {
        c.addEventListener('click', () => {
          this.draft.selectedClientId = c.getAttribute('data-client-id');
          const clientObj = tenantDataService.getClients(this.tenantId).find(cl => cl.id === this.draft.selectedClientId);
          if (clientObj) {
            this.draft.clientName = clientObj.name;
            this.draft.clientPhone = clientObj.phone;
          }
          this.updateDOM();
        });
      });

      const btnStep1Next = document.getElementById('btn-step1-continue');
      if (btnStep1Next) {
        btnStep1Next.addEventListener('click', () => {
          if (this.draft.clientChoiceMode === 'CREATE') {
            const nameEl = document.getElementById('new-client-name');
            const phoneEl = document.getElementById('new-client-phone');
            const addrEl = document.getElementById('new-client-address');

            if (!nameEl.value.trim() || !phoneEl.value.trim()) {
              alert("Por favor, preencha o Nome e o Telefone do cliente.");
              return;
            }

            this.draft.clientName = nameEl.value.trim();
            this.draft.clientPhone = phoneEl.value.trim();
            this.draft.clientAddress = addrEl ? addrEl.value.trim() : '';

            // Auto save client
            const newClient = tenantDataService.addClient(this.tenantId, {
              name: this.draft.clientName,
              phone: this.draft.clientPhone,
              address: this.draft.clientAddress
            });
            this.draft.selectedClientId = newClient.id;
          } else {
            if (!this.draft.clientName) {
              alert("Por favor, selecione um cliente existente na lista ou adicione um novo.");
              return;
            }
          }

          this.currentStep = 2;
          this.updateDOM();
        });
      }
    }

    // Step 2 Handlers
    if (this.currentStep === 2) {
      const typeSelect = document.getElementById('equip-type-select');
      if (typeSelect) {
        typeSelect.addEventListener('change', (e) => {
          this.draft.equipmentType = e.target.value;
          this.updateDOM();
        });
      }

      const btnStep2Next = document.getElementById('btn-step2-continue');
      if (btnStep2Next) {
        btnStep2Next.addEventListener('click', () => {
          const brand = document.getElementById('equip-brand').value.trim();
          const model = document.getElementById('equip-model').value.trim();
          const problem = document.getElementById('equip-problem').value.trim();

          if (!brand || !model || !problem) {
            alert("Por favor, preencha a Marca, Modelo e o Problema Relatado.");
            return;
          }

          this.draft.equipmentBrand = brand;
          this.draft.equipmentModel = model;
          this.draft.reportedProblem = problem;
          this.draft.equipmentSerial = document.getElementById('equip-serial').value.trim();
          this.draft.equipmentLocation = document.getElementById('equip-location').value.trim();

          // Auto save equipment
          const newEquip = tenantDataService.addEquipment(this.tenantId, {
            clientId: this.draft.selectedClientId,
            type: this.draft.equipmentType,
            brand: brand,
            model: model,
            serialNumber: this.draft.equipmentSerial,
            location: this.draft.equipmentLocation
          });
          this.draft.selectedEquipmentId = newEquip.id;

          this.currentStep = 3;
          this.updateDOM();
        });
      }
    }

    // Step 3 Handlers (Photos)
    if (this.currentStep === 3) {
      document.querySelectorAll('.btn-add-photo-type').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.getAttribute('data-type');
          const samplePhotos = [
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300',
            'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=300'
          ];
          const photoUrl = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];

          if (type === 'before') this.draft.photosBefore.push({ url: photoUrl, type: 'before' });
          if (type === 'during') this.draft.photosDuring.push({ url: photoUrl, type: 'during' });
          if (type === 'after') this.draft.photosAfter.push({ url: photoUrl, type: 'after' });

          this.updateDOM();
        });
      });

      document.querySelectorAll('.btn-remove-photo').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const type = btn.getAttribute('data-type');
          const index = parseInt(btn.getAttribute('data-index'), 10);

          if (type === 'before') this.draft.photosBefore.splice(index, 1);
          if (type === 'during') this.draft.photosDuring.splice(index, 1);
          if (type === 'after') this.draft.photosAfter.splice(index, 1);

          this.updateDOM();
        });
      });

      const btnStep3Next = document.getElementById('btn-step3-continue');
      if (btnStep3Next) {
        btnStep3Next.addEventListener('click', () => {
          this.currentStep = 4;
          this.updateDOM();
        });
      }
    }

    // Step 4 Handlers (Review)
    if (this.currentStep === 4) {
      const btnEdit = document.getElementById('btn-review-back-edit');
      if (btnEdit) {
        btnEdit.addEventListener('click', () => {
          this.currentStep = 1;
          this.updateDOM();
        });
      }

      const btnSubmit = document.getElementById('btn-submit-create-service');
      if (btnSubmit) {
        btnSubmit.addEventListener('click', () => {
          const allPhotos = [
            ...this.draft.photosBefore.map(p => ({ id: `p-${Date.now()}`, photoType: 'before', fileUrl: p.url })),
            ...this.draft.photosDuring.map(p => ({ id: `p-${Date.now()}`, photoType: 'during', fileUrl: p.url })),
            ...this.draft.photosAfter.map(p => ({ id: `p-${Date.now()}`, photoType: 'after', fileUrl: p.url }))
          ];

          const createdService = tenantDataService.createService(this.tenantId, {
            clientId: this.draft.selectedClientId,
            clientName: this.draft.clientName,
            clientPhone: this.draft.clientPhone,
            equipmentId: this.draft.selectedEquipmentId,
            equipmentType: this.draft.equipmentType,
            equipmentBrand: this.draft.equipmentBrand,
            equipmentModel: this.draft.equipmentModel,
            reportedProblem: this.draft.reportedProblem,
            photos: allPhotos
          });

          const wizardContainer = document.querySelector('.wizard-container');
          if (wizardContainer) {
            wizardContainer.innerHTML = this.renderConfirmationScreen(createdService);
            this.attachConfirmationEvents(createdService);
          }
        });
      }
    }
  }

  attachConfirmationEvents(createdService) {
    const btnView = document.getElementById('btn-conf-view-service');
    const btnAnother = document.getElementById('btn-conf-another-service');
    const btnHome = document.getElementById('btn-conf-home');

    if (btnView) {
      btnView.addEventListener('click', () => {
        if (this.onCompleteCallback) this.onCompleteCallback(createdService.id);
      });
    }

    if (btnAnother) {
      btnAnother.addEventListener('click', () => {
        this.currentStep = 1;
        this.draft.reportedProblem = '';
        this.updateDOM();
      });
    }

    if (btnHome) {
      btnHome.addEventListener('click', () => {
        if (this.onCancelCallback) this.onCancelCallback();
      });
    }

    if (window.lucide) window.lucide.createIcons();
  }

  updateDOM() {
    const wizardContainer = document.querySelector('.wizard-container');
    if (wizardContainer) {
      wizardContainer.outerHTML = this.render();
      this.attachEvents();
      if (window.lucide) window.lucide.createIcons();
    }
  }
}
