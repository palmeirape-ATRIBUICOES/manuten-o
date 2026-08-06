/* ==========================================================================
   TENANT DATA SERVICE - MULTITENANT ISOLATION & AUTOMATIC SUPABASE CLOUD SYNC
   ========================================================================== */

import { assets as demoAssets, workOrders as demoWorkOrders, pmocPlans as demoPmocPlans, partsInventory as demoParts, aiInsights as demoAiInsights, customers as demoCustomers } from '../mock-data.js';
import { dbService } from './db-service.js';

const TENANT_DATA_PREFIX = 'saas_asset_tenant_data_';

class TenantDataService {

  getTenantData(tenantId) {
    const key = `${TENANT_DATA_PREFIX}${tenantId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {
        console.warn('[TenantDataService] Recovering from invalid tenant JSON:', e);
      }
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

  // Clients CRUD + Cloud Sync
  getClients(tenantId) { return this.getTenantData(tenantId).clients || []; }

  addClient(tenantId, clientData) {
    const data = this.getTenantData(tenantId);
    if (!data.clients) data.clients = [];
    const newClient = {
      id: `client-${Date.now()}`,
      company_id: tenantId,
      companyId: tenantId,
      name: clientData.name,
      phone: clientData.phone,
      address: clientData.address || '',
      notes: clientData.notes || '',
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    data.clients.unshift(newClient);
    this.saveTenantData(tenantId, data);

    // Auto sync background to Supabase Cloud
    dbService.syncRecordToCloud('clients', {
      id: newClient.id,
      company_id: tenantId,
      name: newClient.name,
      phone: newClient.phone,
      address: newClient.address,
      notes: newClient.notes
    });

    return newClient;
  }

  // Equipment CRUD + Cloud Sync
  getEquipment(tenantId, clientId = null) {
    const list = this.getTenantData(tenantId).equipment || [];
    return clientId ? list.filter(e => e.clientId === clientId) : list;
  }

  addEquipment(tenantId, equipData) {
    const data = this.getTenantData(tenantId);
    if (!data.equipment) data.equipment = [];
    const newEquip = {
      id: `equip-${Date.now()}`,
      company_id: tenantId,
      companyId: tenantId,
      client_id: equipData.clientId,
      clientId: equipData.clientId,
      type: equipData.type,
      brand: equipData.brand,
      model: equipData.model,
      serial_number: equipData.serialNumber || '',
      serialNumber: equipData.serialNumber || '',
      location: equipData.location || 'Local Principal',
      notes: equipData.notes || '',
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    data.equipment.unshift(newEquip);
    this.saveTenantData(tenantId, data);

    // Auto sync background to Supabase Cloud
    dbService.syncRecordToCloud('equipment', {
      id: newEquip.id,
      company_id: tenantId,
      client_id: equipData.clientId,
      type: newEquip.type,
      brand: newEquip.brand,
      model: newEquip.model,
      serial_number: newEquip.serial_number,
      location: newEquip.location
    });

    return newEquip;
  }

  // Services CRUD + Cloud Sync
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
      company_id: tenantId,
      companyId: tenantId,
      service_number: serviceNumber,
      serviceNumber: serviceNumber,
      client_id: servicePayload.clientId,
      clientId: servicePayload.clientId,
      client_name: servicePayload.clientName,
      clientName: servicePayload.clientName,
      client_phone: servicePayload.clientPhone,
      clientPhone: servicePayload.clientPhone,
      equipment_id: servicePayload.equipmentId,
      equipmentId: servicePayload.equipmentId,
      equipmentTag: servicePayload.equipmentTag || `${servicePayload.equipmentBrand} ${servicePayload.equipmentModel}`,
      equipmentType: servicePayload.equipmentType,
      equipmentBrand: servicePayload.equipmentBrand,
      equipmentModel: servicePayload.equipmentModel,
      reported_problem: servicePayload.reportedProblem,
      reportedProblem: servicePayload.reportedProblem,
      status: "Aberto",
      responsible_user_name: servicePayload.responsibleUserName || "Técnico Responsável",
      responsibleUserName: servicePayload.responsibleUserName || "Técnico Responsável",
      photos: servicePayload.photos || [],
      notesList: [],
      partsList: [],
      statusHistory: [
        { id: `sh-${Date.now()}`, companyId: tenantId, serviceId: `serv-${Date.now()}`, previousStatus: 'Novo', newStatus: 'Aberto', notes: 'Serviço registrado no sistema.', changedBy: servicePayload.responsibleUserName || 'Técnico', createdAt: new Date().toISOString() }
      ],
      finalization: null,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.services.unshift(newService);
    this.saveTenantData(tenantId, data);

    // Auto sync background to Supabase Cloud
    dbService.syncRecordToCloud('services', {
      id: newService.id,
      company_id: tenantId,
      service_number: serviceNumber,
      client_id: servicePayload.clientId,
      client_name: servicePayload.clientName,
      client_phone: servicePayload.clientPhone,
      equipment_id: servicePayload.equipmentId,
      equipment_brand: servicePayload.equipmentBrand,
      equipment_model: servicePayload.equipmentModel,
      equipment_type: servicePayload.equipmentType,
      reported_problem: servicePayload.reportedProblem,
      status: 'Aberto',
      responsible_user_name: newService.responsible_user_name
    });

    return newService;
  }

  addServicePhoto(tenantId, serviceId, photoData) {
    const data = this.getTenantData(tenantId);
    const service = (data.services || []).find(s => s.id === serviceId);
    if (!service) throw new Error("Serviço não encontrado.");

    if (!service.photos) service.photos = [];

    const newPhoto = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      company_id: tenantId,
      companyId: tenantId,
      service_id: serviceId,
      serviceId: serviceId,
      photo_type: photoData.photoType,
      photoType: photoData.photoType,
      file_url: photoData.fileUrl,
      fileUrl: photoData.fileUrl,
      caption: photoData.caption || '',
      uploaded_by: photoData.uploadedBy || 'Técnico Responsável',
      uploadedBy: photoData.uploadedBy || 'Técnico Responsável',
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    service.photos.unshift(newPhoto);
    service.updatedAt = new Date().toISOString();
    this.saveTenantData(tenantId, data);

    dbService.syncRecordToCloud('service_photos', {
      id: newPhoto.id,
      company_id: tenantId,
      service_id: serviceId,
      photo_type: newPhoto.photo_type,
      file_url: newPhoto.file_url,
      caption: newPhoto.caption,
      uploaded_by: newPhoto.uploaded_by
    });

    return newPhoto;
  }

  addServiceNote(tenantId, serviceId, noteData) {
    const data = this.getTenantData(tenantId);
    const service = (data.services || []).find(s => s.id === serviceId);
    if (!service) throw new Error("Serviço não encontrado.");

    if (!service.notesList) service.notesList = [];

    const newNote = {
      id: `note-${Date.now()}`,
      company_id: tenantId,
      companyId: tenantId,
      service_id: serviceId,
      serviceId: serviceId,
      description: noteData.description,
      diagnosis: noteData.diagnosis || '',
      solution: noteData.solution || '',
      recommendations: noteData.recommendations || '',
      created_by: noteData.createdBy || 'Técnico Responsável',
      createdBy: noteData.createdBy || 'Técnico Responsável',
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    service.notesList.unshift(newNote);
    service.updatedAt = new Date().toISOString();
    this.saveTenantData(tenantId, data);

    dbService.syncRecordToCloud('service_notes', {
      id: newNote.id,
      company_id: tenantId,
      service_id: serviceId,
      description: newNote.description,
      diagnosis: newNote.diagnosis,
      solution: newNote.solution,
      recommendations: newNote.recommendations,
      created_by: newNote.created_by
    });

    return newNote;
  }

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
      company_id: tenantId,
      companyId: tenantId,
      service_id: serviceId,
      serviceId: serviceId,
      name: partData.name,
      quantity: qty,
      unit: partData.unit || 'unidade',
      unit_price: unitPrice,
      unitPrice: unitPrice,
      total_price: totalPrice,
      totalPrice: totalPrice,
      supplier: partData.supplier || '',
      created_by: partData.createdBy || 'Técnico Responsável',
      createdBy: partData.createdBy || 'Técnico Responsável',
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    service.partsList.unshift(newPart);

    const partsSum = service.partsList.reduce((acc, p) => acc + (p.totalPrice || 0), 0);
    service.partsCost = partsSum;
    service.totalCost = (service.laborCost || 0) + partsSum - (service.discount || 0);

    service.updatedAt = new Date().toISOString();
    this.saveTenantData(tenantId, data);

    dbService.syncRecordToCloud('service_parts', {
      id: newPart.id,
      company_id: tenantId,
      service_id: serviceId,
      name: newPart.name,
      quantity: qty,
      unit: newPart.unit,
      unit_price: unitPrice,
      total_price: totalPrice,
      supplier: newPart.supplier,
      created_by: newPart.created_by
    });

    return newPart;
  }

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
      company_id: tenantId,
      companyId: tenantId,
      service_id: serviceId,
      serviceId: serviceId,
      previous_status: previousStatus,
      previousStatus: previousStatus,
      new_status: newStatus,
      newStatus: newStatus,
      notes: statusNotes,
      changed_by: userName,
      changedBy: userName,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    service.statusHistory.unshift(historyEntry);
    this.saveTenantData(tenantId, data);

    dbService.syncRecordToCloud('services', {
      id: serviceId,
      company_id: tenantId,
      status: newStatus,
      updated_at: new Date().toISOString()
    });

    dbService.syncRecordToCloud('service_status_history', {
      id: historyEntry.id,
      company_id: tenantId,
      service_id: serviceId,
      previous_status: previousStatus,
      new_status: newStatus,
      notes: statusNotes,
      changed_by: userName
    });

    return service;
  }

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

    dbService.syncRecordToCloud('services', {
      id: serviceId,
      company_id: tenantId,
      status: 'Concluído',
      labor_cost: laborCost,
      parts_cost: partsCost,
      discount: discount,
      total_cost: totalCost,
      updated_at: new Date().toISOString()
    });

    return service;
  }

  getServiceTimeline(tenantId, serviceId) {
    const service = this.getServiceById(tenantId, serviceId);
    if (!service) return [];

    const timeline = [];

    timeline.push({
      action: "Criou o registro do serviço",
      user: service.responsibleUserName || "Técnico",
      timestamp: service.createdAt,
      type: "create",
      notes: `Problema relatado: "${service.reportedProblem}"`
    });

    (service.statusHistory || []).forEach(sh => {
      timeline.push({
        action: `Alterou o status para "${sh.newStatus}"`,
        user: sh.changedBy,
        timestamp: sh.createdAt,
        type: "status",
        notes: sh.notes
      });
    });

    (service.notesList || []).forEach(n => {
      timeline.push({
        action: "Registrou apontamento técnico",
        user: n.createdBy,
        timestamp: n.createdAt,
        type: "note",
        notes: n.description
      });
    });

    (service.photos || []).forEach(p => {
      timeline.push({
        action: `Adicionou foto (${p.photoType === 'before' ? 'Antes' : p.photoType === 'during' ? 'Durante' : 'Depois'})`,
        user: p.uploadedBy,
        timestamp: p.createdAt,
        type: "photo",
        notes: p.caption
      });
    });

    (service.partsList || []).forEach(pt => {
      timeline.push({
        action: `Lançou peça: ${pt.name} (${pt.quantity} ${pt.unit})`,
        user: pt.createdBy,
        timestamp: pt.createdAt,
        type: "part",
        notes: pt.totalPrice ? `R$ ${pt.totalPrice.toFixed(2)}` : 'Sem valor'
      });
    });

    if (service.finalization) {
      timeline.push({
        action: "Finalizou o serviço e emitiu o Laudo Técnico",
        user: service.finalization.finalizedBy,
        timestamp: service.finalization.finalizedAt,
        type: "finalize",
        notes: `Valor Total: R$ ${service.finalization.totalCost.toFixed(2)}`
      });
    }

    return timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

export const tenantDataService = new TenantDataService();
