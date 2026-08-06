# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

---

## [1.4.0] - Sprint 4 (Arquitetura Visual & Navegação por Blocos em Níveis - Padrão missoes-da-loja) - 2026-08-06

### Added / Changed
- **Reestruturação Geral de UI/UX**: Eliminação completa de menul lateral (sidebar) e menu hambúrguer. Adoção da **Navegação por Blocos (Cards)** em níveis inspirada no projeto de referência `missoes-da-loja`.
- **Barra de Navegação em Níveis (`index.html`)**: Botão `← Voltar ao Nível Anterior` e rastro de navegabilidade (`Breadcrumbs`) ativado dinamicamente em todas as sub-telas.
- **Regra dos 8 Blocos & 3 Clicks (`src/app.js`)**: Máquinas de estado de nível onde nenhuma tela exibe mais de 8 botões/cards principais e qualquer funcionalidade é alcançada em no máximo 3 cliques.
- **Visual & Tokens Preservados (`src/assets/styles/main.css`)**: Manutenção da paleta de cores HSL, gradientes, botões elevados, suporte a Dark Mode e componentes modais.
- **Documentação Atualizada**:
  - `docs/17-product-bible.md`: Registro da Arquitetura Visual por Blocos e Princípios Imutáveis de UX.
  - `docs/12-decisoes-tecnicas.md`: Adição do **ADR-005** (Block-Based Navigation Architecture).

---

## [1.3.0] - Sprint 3 (Inteligência Artificial Operacional & Predição de Falhas) - 2026-08-05

### Added
- **Motor de Análise Preditiva de Falhas (`src/app.js`)**: Algoritmo de cálculo de risco e saúde preditiva (Score de 0 a 100%) por ativo baseado em MTBF, horímetro e histórico.
- **Auditoria de Evidências Fotográficas com Visão Computacional**: Carimbo de conformidade e auditoria por IA em fotos de serviços concluídos (`✓ IA Auditado 98.4%`).
- **Assistente Inteligente de Plataforma (Smart AI Query Assistant)**: Interface de consulta em linguagem natural sobre a saúde dos ativos e paradas iminentes.

---

## [1.2.0] - Sprint 2 (Módulo Financeiro & Controle de Peças em Estoque) - 2026-08-05

### Added
- **Estoque & Catálogo de Peças (`src/mock-data.js`)**: Controle de peças de reposição (SKU, filtro, óleo, compressores, válvulas), controle de estoque mínimo e localização.
- **Precificação & Custos de Manutenção (`src/app.js`)**: Cálculo automático de custo de mão de obra + peças aplicadas por Ordem de Serviço.
- **Relatório de Faturamento Mensal por Cliente**: Cálculo consolidado de contrato fixo mensal + custo adicional de mão de obra e peças aplicadas nas OSs.

---

## [1.1.0] - Sprint 1 (UI/UX App MVP Baseline) - 2026-08-05

### Added
- **Design System CSS Core (`src/assets/styles/main.css`)**: Tokens de cores HSL, tema escuro elegante, Glassmorphism e layout responsivo.
- **Prontuário Digital do Ativo com QR Code**: Leitura instantânea via QR Code, detalhes técnicos do ativo, histórico imutável de eventos e gerador de etiqueta térmica para impressão.

---

## [1.0.0] - 2026-08-05

### Added
- Repositório inicial estruturado e conectado ao repositório GitHub `palmeirape-ATRIBUICOES/manuten-o`.
- Bíblia do Produto (`docs/17-product-bible.md`) e 16 documentos técnicos em `docs/`.
