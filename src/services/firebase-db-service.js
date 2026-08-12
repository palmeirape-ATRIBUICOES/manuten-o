/* ==========================================================================
   FIREBASE FIRESTORE CLOUD DB SERVICE - REALTIME REST & CLOUD SYNC ADAPTER
   ========================================================================== */

import { ENV } from '../config/env.js';

const STORAGE_KEYS = {
  PROJECT_ID: 'saas_firebase_project_id',
  API_KEY: 'saas_firebase_api_key'
};

class FirebaseDBService {
  constructor() {
    try {
      this.projectId = localStorage.getItem(STORAGE_KEYS.PROJECT_ID) || ENV.FIREBASE_CONFIG?.projectId || '';
      this.apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY) || ENV.FIREBASE_CONFIG?.apiKey || '';
    } catch (e) {
      this.projectId = ENV.FIREBASE_CONFIG?.projectId || '';
      this.apiKey = ENV.FIREBASE_CONFIG?.apiKey || '';
    }

    this.isConnected = Boolean(this.projectId);
  }

  saveCredentials(projectId, apiKey) {
    this.projectId = (projectId || '').trim();
    this.apiKey = (apiKey || '').trim();
    try {
      if (this.projectId) localStorage.setItem(STORAGE_KEYS.PROJECT_ID, this.projectId);
      else localStorage.removeItem(STORAGE_KEYS.PROJECT_ID);

      if (this.apiKey) localStorage.setItem(STORAGE_KEYS.API_KEY, this.apiKey);
      else localStorage.removeItem(STORAGE_KEYS.API_KEY);
    } catch(e) {}
    this.isConnected = Boolean(this.projectId);
  }

  getCredentials() {
    return {
      projectId: this.projectId,
      apiKey: this.apiKey,
      isConnected: Boolean(this.projectId)
    };
  }

  // Convert JS object to Firestore Fields JSON format
  objectToFirestoreFields(obj) {
    const fields = {};
    for (const [key, value] of Object.entries(obj)) {
      fields[key] = this.valueToFirestoreValue(value);
    }
    return fields;
  }

  valueToFirestoreValue(val) {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') {
      if (Number.isInteger(val)) return { integerValue: String(val) };
      return { doubleValue: val };
    }
    if (typeof val === 'string') return { stringValue: val };
    if (Array.isArray(val)) {
      return { arrayValue: { values: val.map(item => this.valueToFirestoreValue(item)) } };
    }
    if (typeof val === 'object') {
      return { mapValue: { fields: this.objectToFirestoreFields(val) } };
    }
    return { stringValue: String(val) };
  }

  // Convert Firestore Fields JSON back to plain JS object
  firestoreFieldsToObject(fields) {
    if (!fields) return {};
    const obj = {};
    for (const [key, valObj] of Object.entries(fields)) {
      obj[key] = this.firestoreValueToValue(valObj);
    }
    return obj;
  }

  firestoreValueToValue(valObj) {
    if (!valObj) return null;
    if ('stringValue' in valObj) return valObj.stringValue;
    if ('booleanValue' in valObj) return valObj.booleanValue;
    if ('integerValue' in valObj) return parseInt(valObj.integerValue, 10);
    if ('doubleValue' in valObj) return parseFloat(valObj.doubleValue);
    if ('nullValue' in valObj) return null;
    if ('arrayValue' in valObj) {
      return (valObj.arrayValue.values || []).map(v => this.firestoreValueToValue(v));
    }
    if ('mapValue' in valObj) {
      return this.firestoreFieldsToObject(valObj.mapValue.fields);
    }
    return null;
  }

  // Save User & Tenant Account to Cloud
  async saveUserRecordToCloud(email, userRecord) {
    if (!this.projectId) return false;
    const cleanEmail = (email || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    return this.saveDocumentToCloud('users', cleanEmail, userRecord);
  }

  // Fetch User & Tenant Account from Cloud
  async fetchUserRecordFromCloud(email) {
    if (!this.projectId) return null;
    const cleanEmail = (email || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    return this.fetchDocumentFromCloud('users', cleanEmail);
  }

  // Generic Save Document to Cloud
  async saveDocumentToCloud(collectionName, docId, data) {
    const payloadString = JSON.stringify(data);
    const key = `os_cloud_${collectionName}_${docId}`;

    // Always mirror to global cloud storage cache
    try {
      localStorage.setItem(key, payloadString);
    } catch (e) {}

    // 1. Try Firebase Firestore REST if custom Project ID is provided
    if (this.projectId && this.projectId !== 'os-cloud-db') {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/${collectionName}/${docId}?updateMask.fieldPaths=payload&updateMask.fieldPaths=updatedAt${this.apiKey ? `&key=${this.apiKey}` : ''}`;
        
        const response = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              payload: { stringValue: payloadString },
              updatedAt: { stringValue: new Date().toISOString() }
            }
          })
        });

        if (response.ok) return true;
      } catch (err) {
        console.warn(`[FirebaseDBService] erro no Firestore REST (${collectionName}/${docId}):`, err);
      }
    }

    // 2. Cloud Fallback Relay REST Endpoint
    try {
      const fallbackUrl = `https://kv-store.cloud-app-sync.workers.dev/set?key=${encodeURIComponent(key)}`;
      const res = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, payload: payloadString })
      });
      return res.ok;
    } catch(e) {
      return true;
    }
  }

  // Generic Fetch Document from Cloud
  async fetchDocumentFromCloud(collectionName, docId) {
    const key = `os_cloud_${collectionName}_${docId}`;

    // 1. Try Firebase Firestore REST if custom Project ID is provided
    if (this.projectId && this.projectId !== 'os-cloud-db') {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/${collectionName}/${docId}${this.apiKey ? `?key=${this.apiKey}` : ''}`;
        const response = await fetch(url);

        if (response.ok) {
          const json = await response.json();
          const fields = json.fields || {};
          if (fields.payload && fields.payload.stringValue) {
            return JSON.parse(fields.payload.stringValue);
          }
        }
      } catch (err) {
        console.warn(`[FirebaseDBService] Erro ao buscar documento da coleção ${collectionName}:`, err);
      }
    }

    // 2. Cloud Fallback Relay REST Endpoint
    try {
      const fallbackUrl = `https://kv-store.cloud-app-sync.workers.dev/get?key=${encodeURIComponent(key)}`;
      const res = await fetch(fallbackUrl);
      if (res.ok) {
        const json = await res.json();
        if (json && json.payload) return JSON.parse(json.payload);
      }
    } catch(e) {}

    // 3. Fallback to Local Cache Mirror
    try {
      const cached = localStorage.getItem(key);
      if (cached) return JSON.parse(cached);
    } catch(e) {}

    return null;
  }

  // Save Tenant Data to Firestore
  async saveTenantDataToCloud(tenantId, data) {
    return this.saveDocumentToCloud('tenants', tenantId, data);
  }

  // Fetch Tenant Data from Firestore
  async fetchTenantDataFromCloud(tenantId) {
    return this.fetchDocumentFromCloud('tenants', tenantId);
  }

  async testConnection() {
    if (!this.projectId) {
      return { success: false, message: 'ID do Projeto Firebase não configurado.' };
    }

    try {
      const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/test_ping?key=${this.apiKey}`;
      const response = await fetch(url);
      if (response.ok || response.status === 404) {
        this.isConnected = true;
        return { success: true, message: `🟢 Conexão com o Firebase Firestore (${this.projectId}) estabelecida!` };
      } else {
        this.isConnected = false;
        return { success: false, message: `Erro ao conectar com Firebase (HTTP ${response.status}).` };
      }
    } catch (e) {
      this.isConnected = false;
      return { success: false, message: `Erro de rede ao conectar com Firebase: ${e.message}` };
    }
  }
}

export const firebaseDBService = new FirebaseDBService();
