/* ==========================================================================
   DATABASE CONFIG VIEW - SUPABASE POSTGRESQL CLOUD SETTINGS
   ========================================================================== */

import { dbService } from '../services/db-service.js';

export function renderDatabaseConfigView() {
  const creds = dbService.getCredentials();

  return `
    <div style="max-width: 850px; margin: 0 auto;">
      
      <!-- Top Card Header -->
      <div class="card" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 1.5rem; color: #0f172a; margin-bottom: 4px;">🐘 Banco de Dados Cloud (Supabase / PostgreSQL)</h2>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Conecte sua plataforma ao banco de dados relacional em nuvem.</div>
          </div>
          
          <div id="db-status-badge">
            <span class="badge ${creds.hasCredentials ? 'badge-success' : 'badge-warning'}" style="padding: 6px 12px; font-size: 0.85rem;">
              ${creds.hasCredentials ? '🟢 CREDENCIAIS CONFIGURADAS' : '🟡 PERSISTÊNCIA LOCAL (OFFLINE-FIRST)'}
            </span>
          </div>
        </div>

        <!-- Supabase Credentials Form -->
        <form id="form-db-credentials">
          <div class="form-group">
            <label class="form-label">URL do Projeto Supabase (Project URL) *</label>
            <input type="url" class="form-control" id="db-supabase-url" placeholder="Ex: https://xyzcompany.supabase.co" value="${creds.url}" required>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Encontrada em: Supabase Dashboard -> Project Settings -> API -> Project URL</div>
          </div>

          <div class="form-group">
            <label class="form-label">Chave Pública Anon (Anon Public Key) *</label>
            <input type="password" class="form-control" id="db-supabase-key" placeholder="Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value="${creds.key}" required>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Encontrada em: Supabase Dashboard -> Project Settings -> API -> Project API Keys (anon public)</div>
          </div>

          <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button type="button" class="btn btn-secondary" id="btn-test-db-connection">
              <i data-lucide="refresh-cw"></i> Testar Conexão com a Nuvem
            </button>

            <button type="submit" class="btn btn-primary">
              <i data-lucide="save"></i> Salvar Credenciais do Banco
            </button>
          </div>
        </form>

        <div id="db-connection-result" style="display: none; margin-top: 16px; padding: 12px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600;"></div>
      </div>

      <!-- SQL Migration Script Instructions -->
      <div class="card">
        <h3 style="margin-bottom: 12px;">📄 Script de Criação das Tabelas PostgreSQL (`schema.sql`)</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px;">
          Copie o script SQL abaixo e execute-o no <strong>SQL Editor</strong> do seu projeto Supabase para criar as 10 tabelas relacionais com Row Level Security (RLS).
        </p>

        <div style="position: relative;">
          <textarea class="form-control" id="sql-script-area" rows="8" readonly style="font-family: monospace; font-size: 0.8rem; background: #0f172a; color: #38bdf8; border: none; padding: 14px;">
-- SAAS ASSET MANAGEMENT - PRODUCTION DATABASE SCHEMA
CREATE TABLE IF NOT EXISTS tenants ( id VARCHAR(100) PRIMARY KEY, name VARCHAR(255) NOT NULL, cnpj VARCHAR(50), created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP );
CREATE TABLE IF NOT EXISTS users ( id VARCHAR(100) PRIMARY KEY, tenant_id VARCHAR(100) REFERENCES tenants(id), full_name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role VARCHAR(50) DEFAULT 'ADMIN', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP );
CREATE TABLE IF NOT EXISTS clients ( id VARCHAR(100) PRIMARY KEY, company_id VARCHAR(100) REFERENCES tenants(id), name VARCHAR(255) NOT NULL, phone VARCHAR(50) NOT NULL, address TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP );
CREATE TABLE IF NOT EXISTS equipment ( id VARCHAR(100) PRIMARY KEY, company_id VARCHAR(100) REFERENCES tenants(id), client_id VARCHAR(100) REFERENCES clients(id), type VARCHAR(100), brand VARCHAR(100), model VARCHAR(100), created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP );
CREATE TABLE IF NOT EXISTS services ( id VARCHAR(100) PRIMARY KEY, company_id VARCHAR(100) REFERENCES tenants(id), service_number VARCHAR(50) NOT NULL, client_name VARCHAR(255), reported_problem TEXT, status VARCHAR(30) DEFAULT 'Aberto', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP );
CREATE TABLE IF NOT EXISTS service_photos ( id VARCHAR(100) PRIMARY KEY, company_id VARCHAR(100) REFERENCES tenants(id), service_id VARCHAR(100) REFERENCES services(id), photo_type VARCHAR(20), file_url TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP );
CREATE TABLE IF NOT EXISTS service_notes ( id VARCHAR(100) PRIMARY KEY, company_id VARCHAR(100) REFERENCES tenants(id), service_id VARCHAR(100) REFERENCES services(id), description TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP );
CREATE TABLE IF NOT EXISTS service_parts ( id VARCHAR(100) PRIMARY KEY, company_id VARCHAR(100) REFERENCES tenants(id), service_id VARCHAR(100) REFERENCES services(id), name VARCHAR(255) NOT NULL, quantity NUMERIC(10,2), unit_price NUMERIC(10,2), total_price NUMERIC(10,2), created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP );
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
          </textarea>

          <button class="btn btn-secondary" id="btn-copy-sql" style="position: absolute; top: 10px; right: 10px; font-size: 0.75rem; background: rgba(255,255,255,0.15); color: #ffffff; border: none;">
            📋 Copiar Script SQL
          </button>
        </div>
      </div>

    </div>
  `;
}

export function attachDatabaseConfigEvents() {
  const form = document.getElementById('form-db-credentials');
  const btnTest = document.getElementById('btn-test-db-connection');
  const btnCopy = document.getElementById('btn-copy-sql');
  const resultBox = document.getElementById('db-connection-result');

  if (btnTest) {
    btnTest.addEventListener('click', async () => {
      const url = document.getElementById('db-supabase-url').value;
      const key = document.getElementById('db-supabase-key').value;
      dbService.saveCredentials(url, key);

      resultBox.style.display = 'block';
      resultBox.style.backgroundColor = '#eff6ff';
      resultBox.style.color = '#1e40af';
      resultBox.textContent = "Testando conexão com o Supabase Cloud...";

      const res = await dbService.testConnection();
      if (res.success) {
        resultBox.style.backgroundColor = '#ecfdf5';
        resultBox.style.color = '#065f46';
        resultBox.textContent = res.message;
      } else {
        resultBox.style.backgroundColor = '#fef2f2';
        resultBox.style.color = '#991b1b';
        resultBox.textContent = res.message;
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = document.getElementById('db-supabase-url').value;
      const key = document.getElementById('db-supabase-key').value;
      dbService.saveCredentials(url, key);
      alert("✓ Credenciais do Supabase salvas com sucesso!");
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const sqlText = document.getElementById('sql-script-area').value;
      navigator.clipboard.writeText(sqlText);
      alert("✓ Script SQL copiado para a área de transferência! Cole no SQL Editor do Supabase.");
    });
  }
}
