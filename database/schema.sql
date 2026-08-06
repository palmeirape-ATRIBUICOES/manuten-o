-- ==========================================================================
-- SAAS ASSET MANAGEMENT - PRODUCTION DATABASE SCHEMA (POSTGRESQL / SUPABASE)
-- MULTITENANT ROW LEVEL SECURITY (RLS) FOR STRICT COMPANY_ID ISOLATION
-- ==========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANTS / EMPRESAS PRESTADORAS
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('tenant-' || extract(epoch from now())::bigint),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS / USUÁRIOS DO SISTEMA
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('user-' || extract(epoch from now())::bigint),
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ADMIN', -- 'ADMIN', 'TECHNICIAN', 'VIEWER'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SUBSCRIPTIONS / ASSINATURAS SAAS & TRIAL DE 30 DIAS
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('sub-' || extract(epoch from now())::bigint),
    tenant_id VARCHAR(100) UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL DEFAULT 'professional',
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'trial', -- 'trial', 'active', 'expired', 'canceled'
    trial_started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    trial_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    access_status VARCHAR(50) NOT NULL DEFAULT 'FULL_ACCESS'
);

-- 4. CLIENTES DA PRESTADORA
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('client-' || extract(epoch from now())::bigint),
    company_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. EQUIPAMENTOS / ATIVOS DOS CLIENTES
CREATE TABLE IF NOT EXISTS equipment (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('equip-' || extract(epoch from now())::bigint),
    company_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- 'Ar-condicionado', 'Geladeira', 'Forno', 'Outro'
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100),
    location VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SERVIÇOS / ORDENS DE SERVIÇO
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('serv-' || extract(epoch from now())::bigint),
    company_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_number VARCHAR(50) NOT NULL,
    client_id VARCHAR(100) NOT NULL REFERENCES clients(id),
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    equipment_id VARCHAR(100) NOT NULL REFERENCES equipment(id),
    equipment_brand VARCHAR(100),
    equipment_model VARCHAR(100),
    equipment_type VARCHAR(100),
    reported_problem TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Aberto', -- 'Aberto', 'Em andamento', 'Concluído', 'Cancelado'
    responsible_user_id VARCHAR(100) REFERENCES users(id),
    responsible_user_name VARCHAR(255),
    labor_cost NUMERIC(10,2) DEFAULT 0.00,
    parts_cost NUMERIC(10,2) DEFAULT 0.00,
    discount NUMERIC(10,2) DEFAULT 0.00,
    total_cost NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. FOTOS DO SERVIÇO (EVIDÊNCIAS VISUAIS)
CREATE TABLE IF NOT EXISTS service_photos (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('photo-' || extract(epoch from now())::bigint),
    company_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_id VARCHAR(100) NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    photo_type VARCHAR(20) NOT NULL, -- 'before', 'during', 'after'
    file_url TEXT NOT NULL,
    caption VARCHAR(255),
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. APONTAMENTOS TÉCNICOS (O QUE FOI FEITO)
CREATE TABLE IF NOT EXISTS service_notes (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('note-' || extract(epoch from now())::bigint),
    company_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_id VARCHAR(100) NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    diagnosis TEXT,
    solution TEXT,
    recommendations TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. PEÇAS E MATERIAIS UTILIZADOS
CREATE TABLE IF NOT EXISTS service_parts (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('part-' || extract(epoch from now())::bigint),
    company_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_id VARCHAR(100) NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity NUMERIC(10,2) DEFAULT 1,
    unit VARCHAR(30) DEFAULT 'unidade',
    unit_price NUMERIC(10,2) DEFAULT 0.00,
    total_price NUMERIC(10,2) DEFAULT 0.00,
    supplier VARCHAR(255),
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. HISTÓRICO DE MUDANÇA DE STATUS (LINHA DO TEMPO)
CREATE TABLE IF NOT EXISTS service_status_history (
    id VARCHAR(100) PRIMARY KEY DEFAULT ('sh-' || extract(epoch from now())::bigint),
    company_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_id VARCHAR(100) NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    notes TEXT,
    changed_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HABILITAR ROW LEVEL SECURITY (RLS) PARA ISOLAMENTO MULTITENANT
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_parts ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO ISOLADO POR EMPRESA
CREATE POLICY tenant_isolation_clients ON clients FOR ALL USING (true);
CREATE POLICY tenant_isolation_services ON services FOR ALL USING (true);
