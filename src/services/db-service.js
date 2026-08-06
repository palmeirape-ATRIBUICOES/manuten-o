/* ==========================================================================
   DB SERVICE - SUPABASE POSTGRESQL CLOUD REST ADAPTER & DUAL PERSISTENCE
   ========================================================================== */

const STORAGE_KEYS = {
  SUPABASE_URL: 'saas_asset_supabase_url',
  SUPABASE_KEY: 'saas_asset_supabase_anon_key'
};

class DBService {
  constructor() {
    this.supabaseUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '';
    this.supabaseKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || '';
    this.isConnected = false;
  }

  getCredentials() {
    return {
      url: this.supabaseUrl,
      key: this.supabaseKey,
      hasCredentials: Boolean(this.supabaseUrl && this.supabaseKey)
    };
  }

  saveCredentials(url, key) {
    this.supabaseUrl = url.trim();
    this.supabaseKey = key.trim();
    localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, this.supabaseUrl);
    localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, this.supabaseKey);
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

      if (response.ok || response.status === 206) {
        this.isConnected = true;
        return { success: true, message: "🟢 Conexão com o Supabase PostgreSQL Cloud estabelecida com sucesso!" };
      } else {
        this.isConnected = false;
        return { success: false, message: `Erro ao conectar (HTTP ${response.status}). Verifique a URL e a Chave.` };
      }
    } catch (err) {
      this.isConnected = false;
      return { success: false, message: `Erro de rede ao conectar: ${err.message}` };
    }
  }

  async syncTableToCloud(tableName, records) {
    if (!this.supabaseUrl || !this.supabaseKey || records.length === 0) return false;

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
        body: JSON.stringify(records)
      });
      return response.ok;
    } catch (err) {
      console.warn(`Erro ao sincronizar tabela ${tableName} com Supabase Cloud:`, err);
      return false;
    }
  }

  async fetchTableFromCloud(tableName, companyId) {
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
      console.warn(`Erro ao buscar dados remotos da tabela ${tableName}:`, err);
      return null;
    }
  }
}

export const dbService = new DBService();
