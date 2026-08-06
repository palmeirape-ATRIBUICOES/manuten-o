# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

---

## [2.0.0] - Sprint 10 (Integração de Banco de Dados Cloud PostgreSQL / Supabase com RLS) - 2026-08-06

### Added
- **Script SQL Completo de Produção (`database/schema.sql`)**: DDL de criação de todas as 10 tabelas relacionais (`tenants`, `users`, `subscriptions`, `clients`, `equipment`, `services`, `service_photos`, `service_notes`, `service_parts`, `service_status_history`) com políticas de Row Level Security (RLS) para isolamento por `company_id`.
- **Adaptador de Banco de Dados Híbrido (`src/services/db-service.js`)**: Conectores REST/SQL com gerenciador de credenciais do Supabase e modo de persistência dupla (Cloud + Fallback Local IndexedDB).
- **Módulo de Configuração de Banco de Dados (`src/views/database-config-view.js`)**: Tela de gerenciamento no Painel Principal com status da conexão em tempo real (`🟢 Conectado ao Supabase Cloud` / `🟡 Modo Persistente Local`), formulário de credenciais e copiador do script SQL.
- **Documentação & Testes (`docs/21-integracao-banco-de-dados-postgresql.md` & `tests/db-integration.test.js`)**: Guia passo a passo para conectar o Supabase e bateria de testes automatizados.

---

## [1.9.0] - Sprint 9 (Ativação Real das 5 Ações do Serviço, Assinatura Digital & Laudo PDF) - 2026-08-06

### Added
- **Ativação Real das 5 Ações**: Fotos, Apontamentos Técnicos, Peças Utilizadas, Alterar Status, Finalizar Serviço com Assinatura em tela.
