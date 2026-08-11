/* ==========================================================================
   PDF GENERATOR SERVICE - LAUDO TÉCNICO OFICIAL PMOC / CERTIFICADO DE SERVIÇO
   ========================================================================== */

import { tenantDataService } from './tenant-data-service.js';
import { authService } from './auth-service.js';

class PDFGeneratorService {

  generateServiceReportHTML(tenantId, serviceId) {
    const service = tenantDataService.getServiceById(tenantId, serviceId);
    if (!service) throw new Error("Serviço não encontrado para geração do laudo.");

    const tenant = authService.getTenantById(tenantId) || { name: "Alfa Climatização & Soluções", cnpj: "12.345.678/0001-90" };
    const fin = service.finalization || {};

    const beforePhotos = (service.photos || []).filter(p => p.photoType === 'before');
    const duringPhotos = (service.photos || []).filter(p => p.photoType === 'during');
    const afterPhotos = (service.photos || []).filter(p => p.photoType === 'after');

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Laudo Técnico - ${service.serviceNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 40px; line-height: 1.5; font-size: 14px; background: #fff; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 22px; font-weight: 800; color: #0f172a; text-transform: uppercase; }
          .report-title { font-size: 20px; font-weight: 700; color: #4f46e5; text-align: right; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; letter-spacing: 0.05em; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
          .label { color: #64748b; font-size: 12px; font-weight: 600; }
          .value { font-weight: 700; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 12px; color: #475569; font-weight: 700; border-bottom: 1px solid #cbd5e1; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .photo-grid { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
          .photo-img { width: 130px; height: 110px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1; }
          .total-row { display: flex; justify-content: flex-end; gap: 20px; font-size: 16px; font-weight: 800; margin-top: 16px; padding: 12px; background: #f0fdf4; border-radius: 8px; color: #166534; }
          .signature-area { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
          .sig-box { text-align: center; width: 45%; }
          .sig-line { border-top: 1px solid #0f172a; margin-top: 40px; padding-top: 6px; font-weight: 700; }
        </style>
      </head>
      <body>

        <!-- Header -->
        <div class="header">
          <div style="display: flex; align-items: center; gap: 16px;">
            ${(() => {
              const logo = tenantDataService.getTenantLogo(tenantId);
              return logo ? `<img src="${logo}" style="max-height: 55px; max-width: 170px; object-fit: contain;">` : '';
            })()}
            <div>
              <div class="company-name">${tenant.name}</div>
              <div style="font-size: 12px; color: #64748b;">CNPJ: ${tenant.cnpj || '12.345.678/0001-90'} | Prestação de Serviços Técnicos</div>
            </div>
          </div>
          <div>
            <div class="report-title">LAUDO TÉCNICO OFICIAL</div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${service.serviceNumber}</div>
            <div style="font-size: 11px; color: #64748b;">Data: ${new Date(fin.finalizedAt || service.createdAt).toLocaleDateString('pt-BR')}</div>
          </div>
        </div>

        <!-- Client & Equipment Info -->
        <div class="section grid-2">
          <div class="info-box">
            <div class="label">CLIENTE ATENDIDO</div>
            <div class="value">${service.clientName}</div>
            <div style="font-size: 12px;">📞 ${service.clientPhone}</div>
          </div>
          <div class="info-box">
            <div class="label">EQUIPAMENTO / ATIVO</div>
            <div class="value">${service.equipmentBrand || ''} ${service.equipmentModel || ''}</div>
            <div style="font-size: 12px;">Tipo: ${service.equipmentType || 'Geral'}</div>
          </div>
        </div>

        <!-- Reported Problem -->
        <div class="section info-box" style="background: #fff; border-left: 4px solid #4f46e5;">
          <div class="label">PROBLEMA RELATADO PELO CLIENTE</div>
          <div class="value">"${service.reportedProblem}"</div>
        </div>

        <!-- Technical Notes -->
        <div class="section">
          <div class="section-title">SERVIÇOS EXECUTADOS & DIAGNÓSTICO TÉCNICO</div>
          ${(service.notesList || []).length === 0 ? '<div style="color: #64748b;">Nenhum apontamento técnico registrado.</div>' : (service.notesList || []).map(n => `
            <div style="margin-bottom: 12px; padding: 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
              <div><strong>Descrição:</strong> ${n.description}</div>
              ${n.diagnosis ? `<div><strong>Diagnóstico:</strong> ${n.diagnosis}</div>` : ''}
              ${n.solution ? `<div><strong>Solução Aplicada:</strong> ${n.solution}</div>` : ''}
              ${n.recommendations ? `<div><strong>Recomendações:</strong> ${n.recommendations}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Parts Used -->
        <div class="section">
          <div class="section-title">PEÇAS E MATERIAIS UTILIZADOS</div>
          ${(service.partsList || []).length === 0 ? '<div style="color: #64748b;">Nenhuma peça utilizada.</div>' : `
            <table>
              <thead>
                <tr><th>Item / Material</th><th>Qtd</th><th>Unid</th><th>Valor Unit.</th><th>Total</th></tr>
              </thead>
              <tbody>
                ${(service.partsList || []).map(pt => `
                  <tr>
                    <td><strong>${pt.name}</strong></td>
                    <td>${pt.quantity}</td>
                    <td>${pt.unit}</td>
                    <td>R$ ${(pt.unitPrice || 0).toFixed(2)}</td>
                    <td><strong>R$ ${(pt.totalPrice || 0).toFixed(2)}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>

        <!-- Photos -->
        <div class="section">
          <div class="section-title">EVIDÊNCIAS FOTOGRÁFICAS</div>
          <div class="grid-2">
            <div>
              <div class="label">📸 Fotos Antes (${beforePhotos.length})</div>
              <div class="photo-grid">
                ${beforePhotos.map(p => `<img src="${p.fileUrl}" class="photo-img">`).join('')}
              </div>
            </div>
            <div>
              <div class="label">✨ Fotos Depois (${afterPhotos.length})</div>
              <div class="photo-grid">
                ${afterPhotos.map(p => `<img src="${p.fileUrl}" class="photo-img">`).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Cost Summary -->
        <div class="section">
          <div class="total-row">
            <div>Mão de Obra: R$ ${(service.laborCost || fin.laborCost || 0).toFixed(2)}</div>
            <div>Peças: R$ ${(service.partsCost || fin.partsCost || 0).toFixed(2)}</div>
            <div>VALOR TOTAL: R$ ${(service.totalCost || fin.totalCost || 0).toFixed(2)}</div>
          </div>
        </div>

        <!-- Signatures -->
        <div class="signature-area">
          <div class="sig-box">
            <div class="sig-line">${service.responsibleUserName || 'Técnico Responsável'}</div>
            <div style="font-size: 11px; color: #64748b;">Prestador de Serviços</div>
          </div>

          <div class="sig-box">
            ${fin.signatureBase64 ? `
              <img src="${fin.signatureBase64}" style="max-height: 60px; margin-bottom: -10px;">
            ` : fin.noSignatureReason ? `
              <div style="font-size: 11px; color: #991b1b; font-style: italic;">Finalizado sem assinatura: ${fin.noSignatureReason}</div>
            ` : ''}
            <div class="sig-line">${fin.clientSignatoryName || service.clientName}</div>
            <div style="font-size: 11px; color: #64748b;">Cliente / Responsável</div>
          </div>
        </div>

      </body>
      </html>
    `;
  }

  openPrintWindow(tenantId, serviceId) {
    const html = this.generateServiceReportHTML(tenantId, serviceId);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    } else {
      alert("Por favor, permita que o seu navegador abra janelas pop-up para visualizar e imprimir o laudo.");
    }
  }

  downloadPDF(tenantId, serviceId) {
    this.openPrintWindow(tenantId, serviceId);
  }
}

export const pdfGeneratorService = new PDFGeneratorService();
