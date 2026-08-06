/* ==========================================================================
   SERVICE DETAIL VIEW - SERVICE CARD & 5 QUICK ACTION BLOCKS
   ========================================================================== */

import { tenantDataService } from '../services/tenant-data-service.js';
import { authService } from '../services/auth-service.js';

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
    photos: []
  };

  const beforePhotos = (service.photos || []).filter(p => p.photoType === 'before');
  const duringPhotos = (service.photos || []).filter(p => p.photoType === 'during');
  const afterPhotos = (service.photos || []).filter(p => p.photoType === 'after');

  return `
    <div style="max-width: 900px; margin: 0 auto;">
      
      <!-- Top Card Header -->
      <div class="card" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <span class="badge ${service.status === 'Concluído' ? 'badge-success' : service.status === 'Em andamento' ? 'badge-warning' : 'badge-info'}" style="margin-bottom: 6px;">
              ${service.status.toUpperCase()}
            </span>
            <h2 style="font-size: 1.5rem; color: #0f172a;">${service.serviceNumber}</h2>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
              Criado em: ${new Date(service.createdAt).toLocaleString('pt-BR')} | Responsável: ${service.responsibleUserName || 'Técnico'}
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; font-size: 0.9rem;">
          <div>
            <span style="color: var(--text-muted); display: block;">Cliente & Contato:</span>
            <strong>${service.clientName}</strong>
            <div style="font-size: 0.85rem; color: var(--text-muted);">📞 ${service.clientPhone}</div>
          </div>

          <div>
            <span style="color: var(--text-muted); display: block;">Equipamento:</span>
            <strong>${service.equipmentBrand || ''} ${service.equipmentModel || ''}</strong>
            <div style="font-size: 0.85rem; color: var(--text-muted);">${service.equipmentType || 'Equipamento'}</div>
          </div>

          <div style="grid-column: span 2;">
            <span style="color: var(--text-muted); display: block;">Problema Relatado:</span>
            <div style="color: #0f172a; font-weight: 600; font-size: 0.95rem;">"${service.reportedProblem}"</div>
          </div>
        </div>
      </div>

      <!-- Action Blocks Grid (5 Action Blocks) -->
      <div class="section-heading">AÇÕES DO SERVIÇO</div>
      <div class="block-grid" style="margin-bottom: 32px;">
        
        <div class="block-card" id="btn-action-add-photos">
          <div class="block-icon-box icon-box-emerald">
            <i data-lucide="camera"></i>
          </div>
          <div class="block-card-title">Adicionar Fotos</div>
          <div class="block-card-desc">Anexar mais evidências visuais</div>
        </div>

        <div class="block-card" id="btn-action-register-notes">
          <div class="block-icon-box icon-box-blue">
            <i data-lucide="file-text"></i>
          </div>
          <div class="block-card-title">Registrar o Que Foi Feito</div>
          <div class="block-card-desc">Apontamento técnico do serviço</div>
        </div>

        <div class="block-card" id="btn-action-add-parts">
          <div class="block-icon-box icon-box-purple">
            <i data-lucide="package"></i>
          </div>
          <div class="block-card-title">Adicionar Peças Utilizadas</div>
          <div class="block-card-desc">Lançar insumos e componentes</div>
        </div>

        <div class="block-card" id="btn-action-change-status">
          <div class="block-icon-box icon-box-amber">
            <i data-lucide="tag"></i>
          </div>
          <div class="block-card-title">Alterar Status</div>
          <div class="block-card-desc">Mudar para Em Andamento/Concluído</div>
        </div>

        <div class="block-card" id="btn-action-finish-service">
          <div class="block-icon-box icon-box-pink">
            <i data-lucide="check-circle-2"></i>
          </div>
          <div class="block-card-title">Finalizar Serviço</div>
          <div class="block-card-desc">Emitir laudo final e colher assinatura</div>
        </div>

      </div>

      <!-- Organized Photo Gallery Section -->
      <div class="card">
        <h3 style="margin-bottom: 16px;">Galeria de Evidências Fotográficas</h3>
        
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <div>
            <h4 style="font-size: 0.9rem; color: #0f172a; margin-bottom: 8px;">📸 Fotos Antes (${beforePhotos.length})</h4>
            ${beforePhotos.length === 0 ? `<div style="font-size: 0.8rem; color: var(--text-muted);">Nenhuma foto enviada nesta fase.</div>` : `
              <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                ${beforePhotos.map(p => `<img src="${p.fileUrl}" style="width: 120px; height: 100px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">`).join('')}
              </div>
            `}
          </div>

          <div>
            <h4 style="font-size: 0.9rem; color: #0f172a; margin-bottom: 8px;">🛠️ Fotos Durante (${duringPhotos.length})</h4>
            ${duringPhotos.length === 0 ? `<div style="font-size: 0.8rem; color: var(--text-muted);">Nenhuma foto enviada nesta fase.</div>` : `
              <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                ${duringPhotos.map(p => `<img src="${p.fileUrl}" style="width: 120px; height: 100px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">`).join('')}
              </div>
            `}
          </div>

          <div>
            <h4 style="font-size: 0.9rem; color: #0f172a; margin-bottom: 8px;">✨ Fotos Depois (${afterPhotos.length})</h4>
            ${afterPhotos.length === 0 ? `<div style="font-size: 0.8rem; color: var(--text-muted);">Nenhuma foto enviada nesta fase.</div>` : `
              <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                ${afterPhotos.map(p => `<img src="${p.fileUrl}" style="width: 120px; height: 100px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">`).join('')}
              </div>
            `}
          </div>

        </div>
      </div>

    </div>
  `;
}
