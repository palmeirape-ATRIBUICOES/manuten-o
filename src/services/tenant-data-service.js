/* ==========================================================================
   TENANT DATA SERVICE - MULTITENANT ISOLATION & AUTOMATIC SUPABASE CLOUD SYNC
   ========================================================================== */

import { assets as demoAssets, workOrders as demoWorkOrders, pmocPlans as demoPmocPlans, partsInventory as demoParts, aiInsights as demoAiInsights, customers as demoCustomers } from '../mock-data.js?v=2.7.0';
import { dbService } from './db-service.js?v=2.7.0';
import { firebaseDBService } from './firebase-db-service.js?v=2.7.0';

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

    // Try background initial fetch from Firebase Cloud DB
    this.syncTenantDataFromFirebase(tenantId);

    return cleanData;
  }

  saveTenantData(tenantId, data) {
    const key = `${TENANT_DATA_PREFIX}${tenantId}`;
    localStorage.setItem(key, JSON.stringify(data));
    
    // Auto sync background to Firebase Cloud DB
    firebaseDBService.saveTenantDataToCloud(tenantId, data).catch(() => {});
  }

  async syncTenantDataFromFirebase(tenantId) {
    try {
      const cloudData = await firebaseDBService.fetchTenantDataFromCloud(tenantId);
      if (cloudData && typeof cloudData === 'object') {
        const key = `${TENANT_DATA_PREFIX}${tenantId}`;
        localStorage.setItem(key, JSON.stringify(cloudData));
        return cloudData;
      }
    } catch(e) {}
    return null;
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

  // Tenant Custom Logo
  getTenantLogo(tenantId) {
    try {
      return localStorage.getItem(`saas_asset_logo_${tenantId}`) || null;
    } catch(e) {
      return null;
    }
  }

  saveTenantLogo(tenantId, logoDataUrl) {
    try {
      localStorage.setItem(`saas_asset_logo_${tenantId}`, logoDataUrl);
    } catch(e) {
      console.warn('[TenantDataService] Falha ao salvar logotipo localmente:', e);
    }
  }

  removeTenantLogo(tenantId) {
    try {
      localStorage.removeItem(`saas_asset_logo_${tenantId}`);
    } catch(e) {}
  }
}

export const tenantDataService = new TenantDataService();
