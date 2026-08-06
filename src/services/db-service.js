/* ==========================================================================
   DB SERVICE - SUPABASE POSTGRESQL CLOUD REST ADAPTER & AUTOMATIC CREDENTIALS
   ========================================================================== */

import { ENV } from '../config/env.js?v=2.2.7';

const STORAGE_KEYS = {
  SUPABASE_URL: 'saas_asset_supabase_url',
  SUPABASE_KEY: 'saas_asset_supabase_anon_key'
};

class DBService {
  constructor() {
    try {
      this.supabaseUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || ENV.SUPABASE_URL;
      this.supabaseKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || ENV.SUPABASE_ANON_KEY;
    } catch(e) {
      this.supabaseUrl = ENV.SUPABASE_URL;
      this.supabaseKey = ENV.SUPABASE_ANON_KEY;
    }
    
    this.isConnected = false;

    // Auto save default credentials if empty
    try {
      if (!localStorage.getItem(STORAGE_KEYS.SUPABASE_URL)) {
        localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, this.supabaseUrl);
        localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, this.supabaseKey);
      }
    } catch(e) {}

    // Non-blocking background connectivity test
    setTimeout(() => {
      this.testConnection().catch(() => {});
    }, 100);
  }

  getCredentials() {
    return {
      url: this.supabaseUrl,
      key: this.supabaseKey,
      hasCredentials: Boolean(this.supabaseUrl && this.supabaseKey)
    };
  }

  saveCredentials(url, key) {
    this.supabaseUrl = (url || ENV.SUPABASE_URL).trim();
    this.supabaseKey = (key || ENV.SUPABASE_ANON_KEY).trim();
    try {
      localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, this.supabaseUrl);
      localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, this.supabaseKey);
    } catch(e) {}
    this.testConnection().catch(() => {});
  }

  async testConnection() {
    if (!this.supabaseUrl || !this.supabaseKey) {
      this.isConnected = false;
      return { success: false, message: "URL ou Chave do Supabase não configuradas." };
    }

    try {
      const endpoint = `${this.supabaseUrl.replace(/\/$/, '')}/rest/v1/services?select=count`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Range': '0-0'
        }
      });

      if (response.ok || response.status === 206 || response.status === 200) {
        this.isConnected = true;
        return { success: true, message: "🟢 Conexão com o Supabase PostgreSQL Cloud estabelecida com sucesso!" };
      } else {
        this.isConnected = false;
        return { success: false, message: `Erro ao conectar (HTTP ${response.status}). Verifique se as tabelas foram criadas via schema.sql.` };
      }
    } catch (err) {
      this.isConnected = false;
      return { success: false, message: `Erro de rede ao conectar: ${err.message}` };
    }
  }

  async syncRecordToCloud(tableName, record) {
    if (!this.supabaseUrl || !this.supabaseKey) return false;

    try {
      const endpoint = `${this.supabaseUrl.replace(/\/$/, '')}/rest/v1/${tableName}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(record)
      });
      return response.ok;
    } catch (err) {
      console.warn(`Erro ao sincronizar registro na tabela ${tableName}:`, err);
      return false;
    }
  }

  async fetchRecordsFromCloud(tableName, companyId) {
    if (!this.supabaseUrl || !this.supabaseKey) return null;

    try {
      const endpoint = `${this.supabaseUrl.replace(/\/$/, '')}/rest/v1/${tableName}?company_id=eq.${companyId}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        }
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (err) {
      console.warn(`Erro ao buscar dados da tabela ${tableName}:`, err);
      return null;
    }
  }
}

export const dbService = new DBService();
