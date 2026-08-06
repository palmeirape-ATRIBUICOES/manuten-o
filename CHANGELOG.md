# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

---

## [1.8.0] - Sprint 8 (Fluxo Guiado de Manutenção "+ Novo Serviço" em 4 Etapas & Fotos Organizadas) - 2026-08-06

### Added
- **Botão Principal `+ Novo serviço`**: Ação primária em destaque verde no topo do Painel Principal.
- **Assistente Guiado em 4 Etapas (`src/views/new-service-wizard.js`)**:
  - **Etapa 1 — Cliente**: Seleção por busca rápida de existentes ou cadastro simples de novo cliente (apenas Nome e Telefone obrigatórios).
  - **Etapa 2 — Produto ou Equipamento**: Seleção de existente ou cadastro de novo (Tipo, Marca, Modelo, Série, Localização, Problema Relatado).
  - **Etapa 3 — Fotos do Serviço**: 3 blocos independentes (*Antes*, *Durante*, *Depois*) com upload, miniaturas com exclusão e legendas. Nenhuma foto é obrigatória para avançar.
  - **Etapa 4 — Revisar e Salvar**: Resumo completo com confirmação e emissão da Ordem de Serviço com status inicial `Aberto`.
- **Tela de Confirmação**: Mensagem *"Serviço criado com sucesso"* com opções (*Ver serviço*, *Adicionar detalhes*, *Criar outro serviço*, *Voltar ao painel*).
- **Prontuário Detalhado do Serviço (`src/views/service-detail-view.js`)**:
  - Exibição de Nº OS, Status (`Aberto`, `Em andamento`, `Concluído`, `Cancelado`), Cliente, Equipamento, Fotos categorizadas e 5 Blocos de Ação Rápida.
- **Estruturas Isoladas por Tenant (`src/services/tenant-data-service.js`)**: Tabelas `clients`, `equipment`, `services`, `service_photos` isoladas por `company_id`.
- **Documentação & Testes (`docs/19-fluxo-novo-servico-e-fotos.md` & `tests/new-service-wizard.test.js`)**: Bateria automatizada testando o fluxo guiado de ponta a ponta.

---

## [1.7.1] - Sprint 7.1 (Workspace Limpo & Isolamento Estrito no Primeiro Cadastro) - 2026-08-06

### Added
- **Isolamento de Dados por Tenant**: Ao criar uma nova conta, o espaço de trabalho do novo cliente nasce **100% limpo**.
