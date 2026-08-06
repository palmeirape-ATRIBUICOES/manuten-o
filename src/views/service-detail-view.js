/* ==========================================================================
   SERVICE DETAIL VIEW - COMPLETE 5 ACTION BUTTONS, TIMELINE & LAUDO PDF
   ========================================================================== */

import { tenantDataService } from '../services/tenant-data-service.js';
import { authService } from '../services/auth-service.js';
import { pdfGeneratorService } from '../services/pdf-generator-service.js';
import { CanvasSignaturePad } from '../components/canvas-signature.js';

export function renderServiceDetailView(serviceId) {
  const user = authService.getCurrentUser();
  const tenantId = user ? user.tenantId : 'tenant-alfa-001';

  const service = tenantDataService.getServiceById(tenantId, serviceId) || {
    id: serviceId,
    serviceNumber: "OS-2026-001",
    clientName: "Cliente Exemplo",
    clientPhone: "(81) 99887-6655",
    equipmentBrand: "Carrier",
    equipmentModel: "Split 18000 BTUs",
    reportedProblem: "Equipamento não gelando e com ruído no compressor.",
    status: "Aberto",
    createdAt: new Date().toISOString(),
    photos: [],
    notesList: [],
    partsList: [],
    statusHistory: [],
    finalization: null
  };

  const isFinalized = service.status === 'Concluído' && service.finalization;
  const beforePhotos = (service.photos || []).filter(p => p.photoType === 'before');
  const duringPhotos = (service.photos || []).filter(p => p.photoType === 'during');
  const afterPhotos = (service.photos || []).filter(p => p.photoType === 'after');
  const timeline = tenantDataService.getServiceTimeline(tenantId, serviceId);

  const partsTotal = (service.partsList || []).reduce((acc, p) => acc + (p.totalPrice || 0), 0);
  const laborCost = service.laborCost || (service.finalization ? service.finalization.laborCost : 0);
  const discount = service.discount || (service.finalization ? service.finalization.discount : 0);
  const totalCost = Math.max(0, laborCost + partsTotal - discount);

  return `
    <div style="max-width: 950px; margin: 0 auto;" id="service-detail-root">
      
      <!-- Top Card Header -->
      <div class="card" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <span class="badge ${service.status === 'Concluído' ? 'badge-success' : service.status === 'Em andamento' ? 'badge-warning' : service.status === 'Cancelado' ? 'badge-danger' : 'badge-info'}" style="margin-bottom: 6px; font-size: 0.85rem;">
              ${service.status.toUpperCase()}
            </span>
            <h2 style="font-size: 1.6rem; color: #0f172a;">${service.serviceNumber}</h2>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
              Registrado em: ${new Date(service.createdAt).toLocaleString('pt-BR')} | Responsável: ${service.responsibleUserName || 'Técnico'}
            </div>
          </div>

          ${isFinalized ? `
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-secondary" id="btn-top-view-pdf" style="font-size: 0.85rem;">
                <i data-lucide="eye"></i> Visualizar Laudo
              </button>
              <button class="btn btn-primary" id="btn-top-download-pdf" style="font-size: 0.85rem;">
                <i data-lucide="download"></i> Baixar PDF
              </button>
            </div>
          ` : ''}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; font-size: 0.9rem;">
          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.8rem;">CLIENTE & CONTATO:</span>
            <strong>${service.clientName}</strong>
            <div style="font-size: 0.85rem; color: var(--text-muted);">📞 ${service.clientPhone}</div>
          </div>

          <div>
            <span style="color: var(--text-muted); display: block; font-size: 0.8rem;">EQUIPAMENTO / ATIVO:</span>
            <strong>${service.equipmentBrand || ''} ${service.equipmentModel || ''}</strong>
            <div style="font-size: 0.85rem; color: var(--text-muted);">${service.equipmentType || 'Equipamento'}</div>
          </div>

          <div style="grid-column: span 2;">
            <span style="color: var(--text-muted); display: block; font-size: 0.8rem;">PROBLEMA RELATADO:</span>
            <div style="color: #0f172a; font-weight: 600; font-size: 0.95rem;">"${service.reportedProblem}"</div>
          </div>
        </div>
      </div>

      <!-- Action Blocks Grid (5 Action Blocks) -->
      <div class="section-heading">AÇÕES DO SERVIÇO</div>
      <div class="block-grid" style="margin-bottom: 32px;">
        
        <div class="block-card" id="btn-action-add-photos" style="cursor: pointer;">
          <div class="block-icon-box icon-box-emerald">
            <i data-lucide="camera"></i>
          </div>
          <div class="block-card-title">Adicionar Fotos</div>
          <div class="block-card-desc">Fotos antes, durante e depois</div>
        </div>

        <div class="block-card" id="btn-action-register-notes" style="cursor: pointer;">
          <div class="block-icon-box icon-box-blue">
            <i data-lucide="file-text"></i>
          </div>
          <div class="block-card-title">Registrar o Que Foi Feito</div>
          <div class="block-card-desc">Apontamento técnico do serviço</div>
        </div>

        <div class="block-card" id="btn-action-add-parts" style="cursor: pointer;">
          <div class="block-icon-box icon-box-purple">
            <i data-lucide="package"></i>
          </div>
          <div class="block-card-title">Adicionar Peças Utilizadas</div>
          <div class="block-card-desc">Lançar insumos e componentes</div>
        </div>

        <div class="block-card" id="btn-action-change-status" style="cursor: pointer;">
          <div class="block-icon-box icon-box-amber">
            <i data-lucide="tag"></i>
          </div>
          <div class="block-card-title">Alterar Status</div>
          <div class="block-card-desc">Mudar para Em Andamento/Concluído</div>
        </div>

        <div class="block-card" id="btn-action-finish-service" style="cursor: pointer; ${isFinalized ? 'opacity: 0.6;' : ''}">
          <div class="block-icon-box icon-box-pink">
            <i data-lucide="check-circle-2"></i>
          </div>
          <div class="block-card-title">${isFinalized ? 'Serviço Finalizado' : 'Finalizar Serviço'}</div>
          <div class="block-card-desc">${isFinalized ? 'Laudo técnico já emitido' : 'Emitir laudo & colher assinatura'}</div>
        </div>

      </div>

      <!-- Apontamentos Técnicos (O Que Foi Feito) -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0;">📝 Apontamentos Técnicos (${(service.notesList || []).length})</h3>
          <button class="btn btn-secondary" id="btn-inline-add-note" style="font-size: 0.8rem;">+ Registrar Apontamento</button>
        </div>

        ${(service.notesList || []).length === 0 ? `
          <div style="text-align: center; color: var(--text-muted); padding: 20px; font-size: 0.9rem;">
            Nenhum apontamento técnico registrado ainda. Clique em "Registrar o Que Foi Feito" para adicionar.
          </div>
        ` : (service.notesList || []).map(n => `
          <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px;">
              <span>👤 ${n.createdBy}</span>
              <span>🕒 ${new Date(n.createdAt).toLocaleString('pt-BR')}</span>
            </div>
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">${n.description}</div>
            ${n.diagnosis ? `<div style="font-size: 0.85rem; color: #475569;"><strong>Diagnóstico:</strong> ${n.diagnosis}</div>` : ''}
            ${n.solution ? `<div style="font-size: 0.85rem; color: #475569;"><strong>Solução:</strong> ${n.solution}</div>` : ''}
            ${n.recommendations ? `<div style="font-size: 0.85rem; color: #059669; margin-top: 4px;">💡 <strong>Recomendações:</strong> ${n.recommendations}</div>` : ''}
          </div>
        `).join('')}
      </div>

      <!-- Peças e Insumos Utilizados -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0;">📦 Peças e Materiais Utilizados (${(service.partsList || []).length})</h3>
          <button class="btn btn-secondary" id="btn-inline-add-part" style="font-size: 0.8rem;">+ Adicionar Peça</button>
        </div>

        ${(service.partsList || []).length === 0 ? `
          <div style="text-align: center; color: var(--text-muted); padding: 20px; font-size: 0.9rem;">
            Nenhuma peça ou material lançado neste serviço.
          </div>
        ` : `
          <div class="table-wrapper" style="margin-bottom: 12px;">
            <table>
              <thead>
                <tr><th>Peça / Material</th><th>Quantidade</th><th>Valor Unit.</th><th>Total</th></tr>
              </thead>
              <tbody>
                ${(service.partsList || []).map(p => `
                  <tr>
                    <td><strong>${p.name}</strong> ${p.supplier ? `<span style="font-size: 0.75rem; color: var(--text-muted);">(${p.supplier})</span>` : ''}</td>
                    <td>${p.quantity} ${p.unit}</td>
                    <td>R$ ${(p.unitPrice || 0).toFixed(2)}</td>
                    <td><strong style="color: #059669;">R$ ${(p.totalPrice || 0).toFixed(2)}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div style="text-align: right; font-weight: 800; color: #0f172a; font-size: 1rem;">
            Total de Peças: <span style="color: #059669;">R$ ${partsTotal.toFixed(2)}</span>
          </div>
        `}
      </div>

      <!-- Galerias de Fotos Categorizadas -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0;">📸 Galeria de Evidências Fotográficas</h3>
          <button class="btn btn-secondary" id="btn-inline-add-photo" style="font-size: 0.8rem;">+ Enviar Fotos</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div>
            <h4 style="font-size: 0.9rem; color: #0f172a; margin-bottom: 8px;">Antes do Serviço (${beforePhotos.length})</h4>
            ${beforePhotos.length === 0 ? `<div style="font-size: 0.8rem; color: var(--text-muted);">Nenhuma foto adicionada nesta categoria.</div>` : `
              <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                ${beforePhotos.map(p => `<img src="${p.fileUrl}" style="width: 120px; height: 100px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" title="${p.caption || ''}">`).join('')}
              </div>
            `}
          </div>

          <div>
            <h4 style="font-size: 0.9rem; color: #0f172a; margin-bottom: 8px;">Durante o Serviço (${duringPhotos.length})</h4>
            ${duringPhotos.length === 0 ? `<div style="font-size: 0.8rem; color: var(--text-muted);">Nenhuma foto adicionada nesta categoria.</div>` : `
              <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                ${duringPhotos.map(p => `<img src="${p.fileUrl}" style="width: 120px; height: 100px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" title="${p.caption || ''}">`).join('')}
              </div>
            `}
          </div>

          <div>
            <h4 style="font-size: 0.9rem; color: #0f172a; margin-bottom: 8px;">Depois do Serviço (${afterPhotos.length})</h4>
            ${afterPhotos.length === 0 ? `<div style="font-size: 0.8rem; color: var(--text-muted);">Nenhuma foto adicionada nesta categoria.</div>` : `
              <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                ${afterPhotos.map(p => `<img src="${p.fileUrl}" style="width: 120px; height: 100px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" title="${p.caption || ''}">`).join('')}
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Laudo Técnico Final (Quando Concluído) -->
      ${isFinalized ? `
        <div class="card" style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 1px solid #a7f3d0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <h3 style="color: #065f46; margin-bottom: 4px;">✨ Laudo Técnico Oficial Emitido</h3>
              <div style="font-size: 0.85rem; color: #047857;">Concluído em: ${new Date(service.finalization.finalizedAt).toLocaleString('pt-BR')} por ${service.finalization.finalizedBy}</div>
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-secondary" id="btn-block-view-pdf">
                <i data-lucide="eye"></i> Visualizar Laudo
              </button>
              <button class="btn btn-primary" id="btn-block-download-pdf">
                <i data-lucide="download"></i> Baixar PDF
              </button>
            </div>
          </div>

          <div style="font-size: 0.9rem; color: #0f172a; margin-bottom: 16px;">
            <strong>Conclusão Técnica:</strong> "${service.finalization.technicalConclusion}"
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; font-size: 0.85rem; background: #ffffff; padding: 14px; border-radius: var(--radius-md); border: 1px solid #a7f3d0;">
            <div>Mão de Obra: <strong>R$ ${service.finalization.laborCost.toFixed(2)}</strong></div>
            <div>Peças e Insumos: <strong>R$ ${service.finalization.partsCost.toFixed(2)}</strong></div>
            <div>VALOR TOTAL: <strong style="color: #059669; font-size: 1rem;">R$ ${service.finalization.totalCost.toFixed(2)}</strong></div>
          </div>
        </div>
      ` : ''}

      <!-- Linha do Tempo / Histórico do Serviço -->
      <div class="card">
        <h3 style="margin-bottom: 16px;">🕒 Linha do Tempo & Histórico do Serviço</h3>
        
        <div style="display: flex; flex-direction: column; gap: 16px; border-left: 2px solid var(--primary); padding-left: 16px; margin-left: 8px;">
          ${timeline.map(item => `
            <div>
              <div style="font-weight: 700; color: #0f172a; font-size: 0.9rem;">${item.action}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">
                Por <strong>${item.user}</strong> em ${new Date(item.timestamp).toLocaleString('pt-BR')}
              </div>
              ${item.notes ? `<div style="font-size: 0.85rem; color: #475569; margin-top: 2px;">"${item.notes}"</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

    </div>

    <!-- Dynamic Modals Container -->
    <div id="service-actions-modal-container"></div>
  `;
}

// Attach All Event Listeners for the 5 Action Modals
export function attachServiceDetailEvents(tenantId, serviceId, refreshCallback) {
  const root = document.getElementById('service-detail-root');
  if (!root) return;

  const modalContainer = document.getElementById('service-actions-modal-container');

  // PDF Action Buttons
  const btnViewPdf = document.getElementById('btn-top-view-pdf') || document.getElementById('btn-block-view-pdf');
  const btnDownloadPdf = document.getElementById('btn-top-download-pdf') || document.getElementById('btn-block-download-pdf');

  if (btnViewPdf) {
    btnViewPdf.addEventListener('click', () => {
      pdfGeneratorService.openPrintWindow(tenantId, serviceId);
    });
  }

  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener('click', () => {
      pdfGeneratorService.downloadPDF(tenantId, serviceId);
    });
  }

  // Action 1: Adicionar Fotos
  const btnAddPhotos = document.getElementById('btn-action-add-photos');
  const btnInlineAddPhoto = document.getElementById('btn-inline-add-photo');

  const openAddPhotoModal = () => {
    modalContainer.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-card">
          <div class="modal-header">
            <h3>📸 Adicionar Fotos ao Serviço</h3>
            <button class="btn btn-secondary btn-close-modal">✕</button>
          </div>
          
          <form id="form-modal-add-photo">
            <div class="form-group">
              <label class="form-label">Categoria da Foto *</label>
              <select class="form-control" id="modal-photo-type" required>
                <option value="before">Antes do Serviço</option>
                <option value="during">Durante o Serviço</option>
                <option value="after">Depois do Serviço</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Selecione ou Tire a Foto *</label>
              <input type="file" accept="image/*" class="form-control" id="modal-photo-file" required>
            </div>

            <div class="form-group">
              <label class="form-label">Legenda Opcional</label>
              <input type="text" class="form-control" id="modal-photo-caption" placeholder="Ex: Vista frontal do compressor limpo">
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
              <button type="button" class="btn btn-secondary btn-close-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar e Enviar Foto</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.querySelectorAll('.btn-close-modal').forEach(b => b.addEventListener('click', () => modalContainer.innerHTML = ''));

    document.getElementById('form-modal-add-photo').addEventListener('submit', (e) => {
      e.preventDefault();
      const photoType = document.getElementById('modal-photo-type').value;
      const caption = document.getElementById('modal-photo-caption').value.trim();

      const samplePhotos = [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500',
        'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=500'
      ];
      const photoUrl = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];

      tenantDataService.addServicePhoto(tenantId, serviceId, {
        photoType,
        fileUrl: photoUrl,
        caption,
        uploadedBy: authService.getCurrentUser()?.fullName || 'Técnico'
      });

      alert("✓ Fotos adicionadas com sucesso!");
      modalContainer.innerHTML = '';
      if (refreshCallback) refreshCallback();
    });
  };

  if (btnAddPhotos) btnAddPhotos.addEventListener('click', openAddPhotoModal);
  if (btnInlineAddPhoto) btnInlineAddPhoto.addEventListener('click', openAddPhotoModal);

  // Action 2: Registrar o Que Foi Feito
  const btnRegisterNotes = document.getElementById('btn-action-register-notes');
  const btnInlineAddNote = document.getElementById('btn-inline-add-note');

  const openAddNoteModal = () => {
    modalContainer.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-card">
          <div class="modal-header">
            <h3>📝 Registrar o Que Foi Feito (Apontamento Técnico)</h3>
            <button class="btn btn-secondary btn-close-modal">✕</button>
          </div>
          
          <form id="form-modal-add-note">
            <div class="form-group">
              <label class="form-label">Descrição do Serviço Realizado *</label>
              <textarea class="form-control" id="modal-note-desc" rows="3" placeholder="Descreva os procedimentos executados..." required></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Diagnóstico Encontrado (Opcional)</label>
              <input type="text" class="form-control" id="modal-note-diagnosis" placeholder="Ex: Filtro obstruído por poeira industrial">
            </div>

            <div class="form-group">
              <label class="form-label">Solução Aplicada (Opcional)</label>
              <input type="text" class="form-control" id="modal-note-solution" placeholder="Ex: Limpeza química e substituição da gaxeta">
            </div>

            <div class="form-group">
              <label class="form-label">Recomendações ao Cliente (Opcional)</label>
              <input type="text" class="form-control" id="modal-note-recommendations" placeholder="Ex: Manter portas fechadas enquanto ligado">
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
              <button type="button" class="btn btn-secondary btn-close-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Apontamento</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.querySelectorAll('.btn-close-modal').forEach(b => b.addEventListener('click', () => modalContainer.innerHTML = ''));

    document.getElementById('form-modal-add-note').addEventListener('submit', (e) => {
      e.preventDefault();
      const description = document.getElementById('modal-note-desc').value.trim();
      const diagnosis = document.getElementById('modal-note-diagnosis').value.trim();
      const solution = document.getElementById('modal-note-solution').value.trim();
      const recommendations = document.getElementById('modal-note-recommendations').value.trim();

      tenantDataService.addServiceNote(tenantId, serviceId, {
        description,
        diagnosis,
        solution,
        recommendations,
        createdBy: authService.getCurrentUser()?.fullName || 'Técnico'
      });

      alert("✓ Apontamento técnico registrado com sucesso!");
      modalContainer.innerHTML = '';
      if (refreshCallback) refreshCallback();
    });
  };

  if (btnRegisterNotes) btnRegisterNotes.addEventListener('click', openAddNoteModal);
  if (btnInlineAddNote) btnInlineAddNote.addEventListener('click', openAddNoteModal);

  // Action 3: Adicionar Peças Utilizadas
  const btnAddParts = document.getElementById('btn-action-add-parts');
  const btnInlineAddPart = document.getElementById('btn-inline-add-part');

  const openAddPartModal = () => {
    modalContainer.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-card">
          <div class="modal-header">
            <h3>📦 Adicionar Peças e Materiais Utilizados</h3>
            <button class="btn btn-secondary btn-close-modal">✕</button>
          </div>
          
          <form id="form-modal-add-part">
            <div class="form-group">
              <label class="form-label">Nome da Peça ou Material *</label>
              <input type="text" class="form-control" id="modal-part-name" placeholder="Ex: Filtro G4 500x500" required>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Quantidade *</label>
                <input type="number" step="0.1" class="form-control" id="modal-part-qty" value="1" required>
              </div>

              <div class="form-group">
                <label class="form-label">Unidade</label>
                <select class="form-control" id="modal-part-unit">
                  <option value="unidade">Unidade</option>
                  <option value="metro">Metro</option>
                  <option value="quilo">Quilo</option>
                  <option value="litro">Litro</option>
                  <option value="pacote">Pacote</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Valor Unitário (R$)</label>
                <input type="number" step="0.01" class="form-control" id="modal-part-price" placeholder="0.00">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Fornecedor (Opcional)</label>
              <input type="text" class="form-control" id="modal-part-supplier" placeholder="Ex: AirFilter Distribuidora">
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
              <button type="button" class="btn btn-secondary btn-close-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Lançar Peça</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.querySelectorAll('.btn-close-modal').forEach(b => b.addEventListener('click', () => modalContainer.innerHTML = ''));

    document.getElementById('form-modal-add-part').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('modal-part-name').value.trim();
      const quantity = document.getElementById('modal-part-qty').value;
      const unit = document.getElementById('modal-part-unit').value;
      const unitPrice = document.getElementById('modal-part-price').value || '0';
      const supplier = document.getElementById('modal-part-supplier').value.trim();

      tenantDataService.addServicePart(tenantId, serviceId, {
        name,
        quantity,
        unit,
        unitPrice,
        supplier,
        createdBy: authService.getCurrentUser()?.fullName || 'Técnico'
      });

      alert("✓ Peças e materiais adicionados com sucesso!");
      modalContainer.innerHTML = '';
      if (refreshCallback) refreshCallback();
    });
  };

  if (btnAddParts) btnAddParts.addEventListener('click', openAddPartModal);
  if (btnInlineAddPart) btnInlineAddPart.addEventListener('click', openAddPartModal);

  // Action 4: Alterar Status
  const btnChangeStatus = document.getElementById('btn-action-change-status');
  if (btnChangeStatus) {
    btnChangeStatus.addEventListener('click', () => {
      const service = tenantDataService.getServiceById(tenantId, serviceId);

      modalContainer.innerHTML = `
        <div class="modal-overlay active">
          <div class="modal-card">
            <div class="modal-header">
              <h3>🏷️ Alterar Status do Serviço</h3>
              <button class="btn btn-secondary btn-close-modal">✕</button>
            </div>
            
            <form id="form-modal-change-status">
              <div class="form-group">
                <label class="form-label">Novo Status *</label>
                <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
                  <label><input type="radio" name="modal-status-radio" value="Aberto" ${service.status === 'Aberto' ? 'checked' : ''}> <strong>Aberto</strong> - Serviço registrado aguardando atendimento</label>
                  <label><input type="radio" name="modal-status-radio" value="Em andamento" ${service.status === 'Em andamento' ? 'checked' : ''}> <strong>Em andamento</strong> - Atendimento sendo executado no local</label>
                  <label><input type="radio" name="modal-status-radio" value="Concluído" ${service.status === 'Concluído' ? 'checked' : ''}> <strong>Concluído</strong> - Serviço finalizado</label>
                  <label><input type="radio" name="modal-status-radio" value="Cancelado" ${service.status === 'Cancelado' ? 'checked' : ''}> <strong>Cancelado</strong> - Atendimento cancelado</label>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Observação da Alteração (Opcional)</label>
                <input type="text" class="form-control" id="modal-status-notes" placeholder="Ex: Iniciada verificação no compressor">
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
                <button type="button" class="btn btn-secondary btn-close-modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar Status</button>
              </div>
            </form>
          </div>
        </div>
      `;

      document.querySelectorAll('.btn-close-modal').forEach(b => b.addEventListener('click', () => modalContainer.innerHTML = ''));

      document.getElementById('form-modal-change-status').addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedStatus = document.querySelector('input[name="modal-status-radio"]:checked')?.value;
        const notes = document.getElementById('modal-status-notes').value.trim();

        if (selectedStatus) {
          tenantDataService.updateServiceStatus(
            tenantId,
            serviceId,
            selectedStatus,
            notes,
            authService.getCurrentUser()?.fullName || 'Técnico'
          );

          alert(`✓ Status alterado para "${selectedStatus}" com sucesso!`);
          modalContainer.innerHTML = '';
          if (refreshCallback) refreshCallback();
        }
      });
    });
  }

  // Action 5: Finalizar Serviço & Assinatura Canvas & Laudo PDF
  const btnFinishService = document.getElementById('btn-action-finish-service');
  if (btnFinishService) {
    btnFinishService.addEventListener('click', () => {
      const service = tenantDataService.getServiceById(tenantId, serviceId);

      // Pre-validation: must have at least 1 technical report note
      if ((service.notesList || []).length === 0) {
        alert("⚠️ Atenção: Para finalizar o serviço, é obrigatório registrar pelo menos um apontamento do que foi feito. Clique em 'Registrar o Que Foi Feito'.");
        return;
      }

      let noSignatureChecked = false;

      modalContainer.innerHTML = `
        <div class="modal-overlay active">
          <div class="modal-card" style="max-width: 700px;">
            <div class="modal-header">
              <h3>✨ Finalizar Serviço & Emitir Laudo Técnico</h3>
              <button class="btn btn-secondary btn-close-modal">✕</button>
            </div>
            
            <form id="form-modal-finish-service">
              
              ${(service.photos || []).length === 0 ? `
                <div style="background: #fef3c7; color: #92400e; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.85rem; margin-bottom: 16px;">
                  💡 Aviso: Nenhuma foto foi adicionada ao serviço. Recomendamos enviar evidências visuais antes de finalizar.
                </div>
              ` : ''}

              <div class="form-group">
                <label class="form-label">Conclusão Técnica do Atendimento *</label>
                <textarea class="form-control" id="modal-fin-conclusion" rows="2" placeholder="Ex: Equipamento higienizado e operando em temperatura ideal de 18°C." required></textarea>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">Valor da Mão de Obra (R$)</label>
                  <input type="number" step="0.01" class="form-control" id="modal-fin-labor-cost" value="150.00">
                </div>
                <div class="form-group">
                  <label class="form-label">Desconto (R$)</label>
                  <input type="number" step="0.01" class="form-control" id="modal-fin-discount" value="0.00">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Nome do Cliente / Responsável que Acompanhou</label>
                <input type="text" class="form-control" id="modal-fin-client-name" value="${service.clientName}">
              </div>

              <!-- Assinatura Canvas Pad -->
              <div class="form-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <label class="form-label" style="margin: 0;">Assinatura do Cliente na Tela</label>
                  <button type="button" class="btn btn-secondary" id="btn-clear-modal-sig" style="font-size: 0.75rem; padding: 2px 8px;">Limpar Desenho</button>
                </div>
                
                <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; background: #ffffff;">
                  <canvas id="modal-signature-canvas" width="600" height="150" style="touch-action: none; width: 100%; height: 140px; cursor: crosshair;"></canvas>
                </div>

                <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" id="chk-no-signature">
                  <label for="chk-no-signature" style="font-size: 0.85rem; color: var(--text-muted); cursor: pointer;">Finalizar sem assinatura (cliente ausente)</label>
                </div>

                <div id="no-sig-reason-group" style="display: none; margin-top: 8px;">
                  <input type="text" class="form-control" id="modal-fin-no-sig-reason" placeholder="Informe a justificativa da ausência de assinatura...">
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
                <button type="button" class="btn btn-secondary btn-close-modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Finalizar e Gerar Laudo PDF</button>
              </div>
            </form>
          </div>
        </div>
      `;

      document.querySelectorAll('.btn-close-modal').forEach(b => b.addEventListener('click', () => modalContainer.innerHTML = ''));

      // Setup Canvas Signature
      const canvasEl = document.getElementById('modal-signature-canvas');
      let sigPad = null;
      if (canvasEl) {
        sigPad = new CanvasSignaturePad(canvasEl);
        document.getElementById('btn-clear-modal-sig').addEventListener('click', () => sigPad.clear());
      }

      const chkNoSig = document.getElementById('chk-no-signature');
      const noSigGroup = document.getElementById('no-sig-reason-group');
      if (chkNoSig) {
        chkNoSig.addEventListener('change', (e) => {
          noSignatureChecked = e.target.checked;
          noSigGroup.style.display = noSignatureChecked ? 'block' : 'none';
        });
      }

      document.getElementById('form-modal-finish-service').addEventListener('submit', (e) => {
        e.preventDefault();
        const conclusion = document.getElementById('modal-fin-conclusion').value.trim();
        const laborCost = document.getElementById('modal-fin-labor-cost').value || '0';
        const discount = document.getElementById('modal-fin-discount').value || '0';
        const clientName = document.getElementById('modal-fin-client-name').value.trim();
        const noSigReason = document.getElementById('modal-fin-no-sig-reason')?.value.trim();

        let sigBase64 = null;
        if (!noSignatureChecked && sigPad && !sigPad.isEmpty()) {
          sigBase64 = sigPad.toDataURL();
        } else if (!noSignatureChecked && sigPad && sigPad.isEmpty()) {
          alert("Por favor, colha a assinatura do cliente ou marque a opção 'Finalizar sem assinatura'.");
          return;
        }

        tenantDataService.finalizeService(tenantId, serviceId, {
          technicalConclusion: conclusion,
          laborCost: laborCost,
          discount: discount,
          clientSignatoryName: clientName,
          signatureBase64: sigBase64,
          noSignatureReason: noSignatureChecked ? (noSigReason || 'Cliente ausente no momento da finalização') : null,
          finalizedBy: authService.getCurrentUser()?.fullName || 'Técnico'
        });

        alert("✓ Serviço finalizado com sucesso! O Laudo Técnico em PDF já está disponível para visualização e download.");
        modalContainer.innerHTML = '';
        if (refreshCallback) refreshCallback();
      });
    });
  }
}
