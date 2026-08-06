# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

---

## [1.3.0] - Sprint 3 (Inteligência Artificial Operacional & Predição de Falhas) - 2026-08-05

### Added
- **Motor de Análise Preditiva de Falhas (`src/app.js`)**: Algoritmo de cálculo de risco e saúde preditiva (Score de 0 a 100%) por ativo baseado em MTBF, horímetro e histórico.
- **Auditoria de Evidências Fotográficas com Visão Computacional**: Carimbo de conformidade e auditoria por IA em fotos de serviços concluídos (`✓ IA Auditado 98.4%`).
- **Assistente Inteligente de Plataforma (Smart AI Query Assistant)**: Interface de consulta em linguagem natural sobre a saúde dos ativos e paradas iminentes.
- **Aba de IA Operacional (`index.html`)**: Nova visão `/ai-insights` exibindo a Matriz Preditiva de Risco de Falhas nos próximos 30 dias e a economia financeira estimada ao evitar quebras não programadas.

---

## [1.2.0] - Sprint 2 (Módulo Financeiro & Controle de Peças em Estoque) - 2026-08-05

### Added
- **Estoque & Catálogo de Peças (`src/mock-data.js`)**: Controle de peças de reposição (SKU, filtro, óleo, compressores, válvulas), controle de estoque mínimo e rastreabilidade por localização (Almoxarifado vs Van do Técnico).
- **Precificação & Custos de Manutenção (`src/app.js`)**: Cálculo automático de custo de mão de obra (Tabela de R$ 120,00/h) + peças aplicadas por Ordem de Serviço.
- **Relatório de Faturamento Mensal por Cliente**: Cálculo consolidado de contrato fixo mensal + custo adicional de mão de obra e peças aplicadas nas OSs.
- **Interface Financeira & Estoque (`index.html`)**: Nova aba `Financeiro & Peças` com KPIs de faturamento, valor total de estoque e modal de cadastro de novas peças.
- **Rastreabilidade de Garantia de Peças**: Registro de garantia de peças instaladas nos ativos com indicação de custo zero em caso de troca por defeito dentro do prazo.

---

## [1.1.0] - Sprint 1 (UI/UX App MVP Baseline) - 2026-08-05

### Added
- **Design System CSS Core (`src/assets/styles/main.css`)**: Tokens de cores HSL, tema escuro elegante, Glassmorphism, badges de status, botões com gradiente e layout responsivo.
- **App Shell SPA (`index.html` e `src/app.js`)**: Navegação fluida sem recarregamento de página entre Dashboard, Ativos, Leitor de QR Code, Ordens de Serviço, Clientes e Configurações.
- **Prontuário Digital do Ativo com QR Code (`src/mock-data.js`)**: Leitura instantânea via QR Code, detalhes técnicos do ativo, histórico imutável de eventos e gerador de etiqueta térmica para impressão.
- **Módulo PWA Técnico & Ordens de Serviço**: Execução de checklist da categoria, simulação de upload visual de fotos (Antes / Depois) e **Canvas de Assinatura Digital Touch** em campo (`src/components/canvas-signature.js`).
- **Dashboard de Gestão**: Métricas de KPIs (Total de Ativos, OS Abertas, Ativos em Alerta, Conformidade PMOC) e gráficos de distribuição por categoria.

---

## [1.0.0] - 2026-08-05

### Added
- Repositório inicial estruturado e conectado ao repositório GitHub `palmeirape-ATRIBUICOES/manuten-o`.
- README.md completo com arquitetura visual, visão geral e instruções de execução.
- Convenção de commits no padrão **Conventional Commits**.
- Bíblia do Produto (`docs/17-product-bible.md`) e 16 documentos técnicos em `docs/`.
