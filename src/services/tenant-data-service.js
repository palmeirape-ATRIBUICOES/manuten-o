/* ==========================================================================
   TENANT DATA SERVICE - EXTENDED FOR SERVICE ACTIONS, TIMELINE & LAUDO PDF
   ========================================================================== */

import { assets as demoAssets, workOrders as demoWorkOrders, pmocPlans as demoPmocPlans, partsInventory as demoParts, aiInsights as demoAiInsights, customers as demoCustomers } from '../mock-data.js';

const TENANT_DATA_PREFIX = 'saas_asset_tenant_data_';

class TenantDataService {

  getTenantData(tenantId) {
    const key = `${TENANT_DATA_PREFIX}${tenantId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      return JSON.parse(stored);
    }

    if (tenantId === 'tenant-alfa-001') {
      const demoClients = demoCustomers.map(c => ({
        id: c.id,
        companyId: tenantId,
        name: c.name,
        phone: c.phone,
        address: c.locations[0] ? c.locations[0].name : 'Endereço Principal',
        notes: 'Cliente em contrato mensal',
        createdAt: new Date().toISOString()
      }));

      const demoEquipment = demoAssets.map(a => ({
        id: a.id,
        companyId: tenantId,
        clientId: a.customerId,
        type: a.categoryName,
        brand: a.model.split(' ')[0],
        model: a.model,
        serialNumber: a.serialNumber,
        location: a.locationName,
        notes: a.tagName,
        createdAt: new Date().toISOString()
      }));

      const demoServicesList = demoWorkOrders.map(w => ({
        id: w.id,
        companyId: tenantId,
        serviceNumber: w.osNumber,
        clientId: w.customerId === 'Condomínio Empresarial Torre Sul' ? 'cust-002' : 'cust-001',
        clientName: w.customerName,
        clientPhone: '(81) 99887-6655',
        equipmentId: w.assetId,
        equipmentTag: w.assetTag,
        equipmentBrand: 'Carrier',
        equipmentModel: w.assetTag,
        equipmentType: 'Ar-condicionado',
        reportedProblem: w.notes,
        status: w.status === 'FINISHED' ? 'Concluído' : w.status === 'IN_PROGRESS' ? 'Em andamento' : 'Aberto',
        responsibleUserId: 'user-001',
        responsibleUserName: w.technicianName,
        totalCost: w.totalCost || 0,
        createdAt: w.openedAt,
        photos: [
          { id: 'p1', companyId: tenantId, serviceId: w.id, photoType: 'before', fileUrl: w.photos.beforeUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400', caption: 'Estado inicial', uploadedBy: 'Eng. Marcos', createdAt: w.openedAt },
          { id: 'p2', companyId: tenantId, serviceId: w.id, photoType: 'after', fileUrl: w.photos.afterUrl || 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400', caption: 'Serviço concluído', uploadedBy: 'Eng. Marcos', createdAt: w.openedAt }
        ],
        notesList: [
          { id: 'n1', companyId: tenantId, serviceId: w.id, description: 'Higienização química e desinfecção dos filtros de ar.', diagnosis: 'Filtro saturado com sujeira acumulada.', solution: 'Aplicação de produto sanitizante homologado.', recommendations: 'Troca preventiva de filtros em 90 dias.', createdBy: 'Eng. Marcos', createdAt: w.openedAt }
        ],
        partsList: [
          { id: 'pt1', companyId: tenantId, serviceId: w.id, name: 'Filtro de Ar G4 500x500', quantity: 2, unit: 'unidade', unitPrice: 45.00, totalPrice: 90.00, supplier: 'AirFilter Ltda', createdAt: w.openedAt }
        ],
        statusHistory: [
          { id: 'sh1', companyId: tenantId, serviceId: w.id, previousStatus: 'Aberto', newStatus: 'Em andamento', notes: 'Início do atendimento no local.', changedBy: 'Eng. Marcos', createdAt: w.openedAt }
        ],
        finalization: null
      }));

      const demoData = {
        assets: demoAssets,
        workOrders: demoWorkOrders,
        pmocPlans: demoPmocPlans,
        partsInventory: demoParts,
        aiInsights: demoAiInsights,
        customers: demoCustomers,
        clients: demoClients,
        equipment: demoEquipment,
        services: demoServicesList
      };
      localStorage.setItem(key, JSON.stringify(demoData));
      return demoData;
    }

    const cleanData = {
      assets: [],
      workOrders: [],
      pmocPlans: [],
      partsInventory: [],
      aiInsights: [],
      customers: [],
      clients: [],
      equipment: [],
      services: []
    };
    localStorage.setItem(key, JSON.stringify(cleanData));
    return cleanData;
  }

  saveTenantData(tenantId, data) {
    const key = `${TENANT_DATA_PREFIX}${tenantId}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Clients & Equipment CRUD
  getClients(tenantId) { return this.getTenantData(tenantId).clients || []; }

  addClient(tenantId, clientData) {
    const data = this.getTenantData(tenantId);
    if (!data.clients) data.clients = [];
    const newClient = {
      id: `client-${Date.now()}`,
      companyId: tenantId,
      name: clientData.name,
      phone: clientData.phone,
      address: clientData.address || '',
      notes: clientData.notes || '',
      createdAt: new Date().toISOString()
    };
    data.clients.unshift(newClient);
    this.saveTenantData(tenantId, data);
    return newClient;
  }

  getEquipment(tenantId, clientId = null) {
    const list = this.getTenantData(tenantId).equipment || [];
    return clientId ? list.filter(e => e.clientId === clientId) : list;
  }

  addEquipment(tenantId, equipData) {
    const data = this.getTenantData(tenantId);
    if (!data.equipment) data.equipment = [];
    const newEquip = {
      id: `equip-${Date.now()}`,
      companyId: tenantId,
      clientId: equipData.clientId,
      type: equipData.type,
      brand: equipData.brand,
      model: equipData.model,
      serialNumber: equipData.serialNumber || '',
      location: equipData.location || 'Local Principal',
      notes: equipData.notes || '',
      createdAt: new Date().toISOString()
    };
    data.equipment.unshift(newEquip);
    this.saveTenantData(tenantId, data);
    return newEquip;
  }

  // Services CRUD
  getServices(tenantId) { return this.getTenantData(tenantId).services || []; }

  getServiceById(tenantId, serviceId) {
    const services = this.getServices(tenantId);
    return services.find(s => s.id === serviceId);
  }

  createService(tenantId, servicePayload) {
    const data = this.getTenantData(tenantId);
    if (!data.services) data.services = [];

    const serviceCount = data.services.length + 1;
    const serviceNumber = `OS-${new Date().getFullYear()}-${String(serviceCount).padStart(3, '0')}`;

    const newService = {
      id: `serv-${Date.now()}`,
      companyId: tenantId,
      serviceNumber: serviceNumber,
      clientId: servicePayload.clientId,
      clientName: servicePayload.clientName,
      clientPhone: servicePayload.clientPhone,
      equipmentId: servicePayload.equipmentId,
      equipmentTag: servicePayload.equipmentTag || `${servicePayload.equipmentBrand} ${servicePayload.equipmentModel}`,
      equipmentType: servicePayload.equipmentType,
      equipmentBrand: servicePayload.equipmentBrand,
      equipmentModel: servicePayload.equipmentModel,
      reportedProblem: servicePayload.reportedProblem,
      status: "Aberto",
      responsibleUserId: servicePayload.responsibleUserId || "user-001",
      responsibleUserName: servicePayload.responsibleUserName || "Técnico Responsável",
      photos: servicePayload.photos || [],
      notesList: [],
      partsList: [],
      statusHistory: [
        { id: `sh-${Date.now()}`, companyId: tenantId, serviceId: `serv-${Date.now()}`, previousStatus: 'Novo', newStatus: 'Aberto', notes: 'Serviço registrado no sistema.', changedBy: servicePayload.responsibleUserName || 'Técnico', createdAt: new Date().toISOString() }
      ],
      finalization: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.services.unshift(newService);
    this.saveTenantData(tenantId, data);
    return newService;
  }

  // Action 1: Add Service Photo
  addServicePhoto(tenantId, serviceId, photoData) {
    const data = this.getTenantData(tenantId);
    const service = (data.services || []).find(s => s.id === serviceId);
    if (!service) throw new Error("Serviço não encontrado.");

    if (!service.photos) service.photos = [];

    const newPhoto = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      companyId: tenantId,
      serviceId: serviceId,
      photoType: photoData.photoType, // 'before', 'during', 'after'
      fileUrl: photoData.fileUrl,
      caption: photoData.caption || '',
      uploadedBy: photoData.uploadedBy || 'Técnico Responsável',
      createdAt: new Date().toISOString()
    };

    service.photos.unshift(newPhoto);
    service.updatedAt = new Date().toISOString();
    this.saveTenantData(tenantId, data);
    return newPhoto;
  }

  // Action 2: Add Technical Report Note ("O Que Foi Feito")
  addServiceNote(tenantId, serviceId, noteData) {
    const data = this.getTenantData(tenantId);
    const service = (data.services || []).find(s => s.id === serviceId);
    if (!service) throw new Error("Serviço não encontrado.");

    if (!service.notesList) service.notesList = [];

    const newNote = {
      id: `note-${Date.now()}`,
      companyId: tenantId,
      serviceId: serviceId,
      description: noteData.description,
      diagnosis: noteData.diagnosis || '',
      solution: noteData.solution || '',
      recommendations: noteData.recommendations || '',
      notes: noteData.notes || '',
      performedAt: noteData.performedAt || new Date().toISOString(),
      createdBy: noteData.createdBy || 'Técnico Responsável',
      createdAt: new Date().toISOString()
    };

    service.notesList.unshift(newNote);
    service.updatedAt = new Date().toISOString();
    this.saveTenantData(tenantId, data);
    return newNote;
  }

  // Action 3: Add Service Part / Material
  addServicePart(tenantId, serviceId, partData) {
    const data = this.getTenantData(tenantId);
    const service = (data.services || []).find(s => s.id === serviceId);
    if (!service) throw new Error("Serviço não encontrado.");

    if (!service.partsList) service.partsList = [];

    const qty = parseFloat(partData.quantity) || 1;
    const unitPrice = parseFloat(partData.unitPrice) || 0;
    const totalPrice = qty * unitPrice;

    const newPart = {
      id: `part-${Date.now()}`,
      companyId: tenantId,
      serviceId: serviceId,
      name: partData.name,
      quantity: qty,
      unit: partData.unit || 'unidade',
      unitPrice: unitPrice,
      totalPrice: totalPrice,
      supplier: partData.supplier || '',
      referenceCode: partData.referenceCode || '',
      notes: partData.notes || '',
      createdBy: partData.createdBy || 'Técnico Responsável',
      createdAt: new Date().toISOString()
    };

    service.partsList.unshift(newPart);

    // Update total parts cost in service
    const partsSum = service.partsList.reduce((acc, p) => acc + (p.totalPrice || 0), 0);
    service.partsCost = partsSum;
    service.totalCost = (service.laborCost || 0) + partsSum - (service.discount || 0);

    service.updatedAt = new Date().toISOString();
    this.saveTenantData(tenantId, data);
    return newPart;
  }

  // Action 4: Change Service Status
  updateServiceStatus(tenantId, serviceId, newStatus, statusNotes = '', userName = 'Técnico') {
    const data = this.getTenantData(tenantId);
    const service = (data.services || []).find(s => s.id === serviceId);
    if (!service) throw new Error("Serviço não encontrado.");

    const previousStatus = service.status;
    service.status = newStatus;
    service.updatedAt = new Date().toISOString();

    if (!service.statusHistory) service.statusHistory = [];

    const historyEntry = {
      id: `sh-${Date.now()}`,
      companyId: tenantId,
      serviceId: serviceId,
      previousStatus: previousStatus,
      newStatus: newStatus,
      notes: statusNotes,
      changedBy: userName,
      createdAt: new Date().toISOString()
    };

    service.statusHistory.unshift(historyEntry);
    this.saveTenantData(tenantId, data);
    return service;
  }

  // Action 5: Finalize Service & Signature
  finalizeService(tenantId, serviceId, finalPayload) {
    const data = this.getTenantData(tenantId);
    const service = (data.services || []).find(s => s.id === serviceId);
    if (!service) throw new Error("Serviço não encontrado.");

    const laborCost = parseFloat(finalPayload.laborCost) || 0;
    const discount = parseFloat(finalPayload.discount) || 0;
    const partsCost = (service.partsList || []).reduce((acc, p) => acc + (p.totalPrice || 0), 0);
    const totalCost = Math.max(0, laborCost + partsCost - discount);

    const finalizationRecord = {
      id: `fin-${Date.now()}`,
      companyId: tenantId,
      serviceId: serviceId,
      technicalConclusion: finalPayload.technicalConclusion,
      futureRecommendations: finalPayload.futureRecommendations || '',
      nextMaintenanceDate: finalPayload.nextMaintenanceDate || '',
      laborCost: laborCost,
      partsCost: partsCost,
      discount: discount,
      totalCost: totalCost,
      paymentMethod: finalPayload.paymentMethod || 'A combinar',
      clientSignatoryName: finalPayload.clientSignatoryName || '',
      clientSignatoryDoc: finalPayload.clientSignatoryDoc || '',
      signatureBase64: finalPayload.signatureBase64 || null,
      noSignatureReason: finalPayload.noSignatureReason || null,
      finalizedBy: finalPayload.finalizedBy || 'Técnico Responsável',
      finalizedAt: new Date().toISOString()
    };

    service.finalization = finalizationRecord;
    service.status = 'Concluído';
    service.laborCost = laborCost;
    service.partsCost = partsCost;
    service.discount = discount;
    service.totalCost = totalCost;
    service.updatedAt = new Date().toISOString();

    if (!service.statusHistory) service.statusHistory = [];
    service.statusHistory.unshift({
      id: `sh-${Date.now()}`,
      companyId: tenantId,
      serviceId: serviceId,
      previousStatus: 'Em andamento',
      newStatus: 'Concluído',
      notes: 'Serviço finalizado com emissão de laudo técnico.',
      changedBy: finalPayload.finalizedBy || 'Técnico Responsável',
      createdAt: new Date().toISOString()
    });

    this.saveTenantData(tenantId, data);
    return service;
  }

  // Get Chronological Timeline for Service
  getServiceTimeline(tenantId, serviceId) {
    const service = this.getServiceById(tenantId, serviceId);
    if (!service) return [];

    const timeline = [];

    // 1. Service Creation
    timeline.push({
      action: "Criou o registro do serviço",
      user: service.responsibleUserName || "Técnico",
      timestamp: service.createdAt,
      type: "create",
      notes: `Problema relatado: "${service.reportedProblem}"`
    });

    // 2. Status History
    (service.statusHistory || []).forEach(sh => {
      timeline.push({
        action: `Alterou o status para "${sh.newStatus}"`,
        user: sh.changedBy,
        timestamp: sh.createdAt,
        type: "status",
        notes: sh.notes
      });
    });

    // 3. Technical Notes
    (service.notesList || []).forEach(n => {
      timeline.push({
        action: "Registrou apontamento técnico",
        user: n.createdBy,
        timestamp: n.createdAt,
        type: "note",
        notes: n.description
      });
    });

    // 4. Photos
    (service.photos || []).forEach(p => {
      timeline.push({
        action: `Adicionou foto (${p.photoType === 'before' ? 'Antes' : p.photoType === 'during' ? 'Durante' : 'Depois'})`,
        user: p.uploadedBy,
        timestamp: p.createdAt,
        type: "photo",
        notes: p.caption
      });
    });

    // 5. Parts
    (service.partsList || []).forEach(pt => {
      timeline.push({
        action: `Lançou peça: ${pt.name} (${pt.quantity} ${pt.unit})`,
        user: pt.createdBy,
        timestamp: pt.createdAt,
        type: "part",
        notes: pt.totalPrice ? `R$ ${pt.totalPrice.toFixed(2)}` : 'Sem valor'
      });
    });

    // 6. Finalization
    if (service.finalization) {
      timeline.push({
        action: "Finalizou o serviço e emitiu o Laudo Técnico",
        user: service.finalization.finalizedBy,
        timestamp: service.finalization.finalizedAt,
        type: "finalize",
        notes: `Valor Total: R$ ${service.finalization.totalCost.toFixed(2)}`
      });
    }

    // Sort chronologically descending
    return timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

export const tenantDataService = new TenantDataService();
