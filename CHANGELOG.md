# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao USer [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

---

## [1.5.0] - Sprint 5 (Módulo PMOC & Manutenções Preventivas Automáticas) - 2026-08-06

### Added
- **Módulo PMOC (`src/mock-data.js` & `src/app.js`)**: Gestão completa do Plano de Manutenção, Operação e Controle (Portaria MS 3.523/1998 & Lei 13.589/2018).
- **Cronograma de Inspeções Periódicas**: Monitoramento de rotinas (Mensal, Trimestral, Semestral, Anual), datas de vigência e índices de conformidade por cliente.
- **Gerador de Laudo Técnico Oficial PMOC**: Emissão e simulação para impressão do laudo com Anotação de Responsabilidade Técnica (ART - CREA).
- **Bloco PMOC no Painel Principal (`index.html`)**: Novo bloco `PMOC & Preventivas` no Nível 0 com selo de conformidade de 96%.

---

## [1.4.0] - Sprint 4 (Arquitetura Visual & Navegação por Blocos em Níveis - Padrão missoes-da-loja) - 2026-08-06

### Added / Changed
- **Reestruturação Geral de UI/UX**: Eliminação completa de menu lateral (sidebar) e menu hambúrguer. Adoção da **Navegação por Blocos (Cards)** em níveis inspirada no projeto de referência `missoes-da-loja`.
- **Barra de Navegação em Níveis (`index.html`)**: Botão `← Voltar ao Nível Anterior` e rastro de navegabilidade (`Breadcrumbs`).
- **Cards com Squircles e Notificação Vermelha**: Design de cartões brancos idênticos à captura de tela enviada com badges de notificação vermelhas no canto superior direito.

---

## [1.3.0] - Sprint 3 (Inteligência Artificial Operacional & Predição de Falhas) - 2026-08-05

### Added
- **Motor de Análise Preditiva de Falhas (`src/app.js`)**: Algoritmo de cálculo de risco e saúde preditiva (Score de 0 a 100%) por ativo.
- **Auditoria de Evidências Fotográficas com Visão Computacional**: Carimbo de conformidade e auditoria por IA em fotos de serviços concluídos.

---

## [1.2.0] - Sprint 2 (Módulo Financeiro & Controle de Peças em Estoque) - 2026-08-05

### Added
- **Estoque & Catálogo de Peças (`src/mock-data.js`)**: Controle de peças de reposição (SKU, filtro, óleo, compressores, válvulas) e faturamento por cliente.

---

## [1.1.0] - Sprint 1 (UI/UX App MVP Baseline) - 2026-08-05

### Added
- **Design System & Prontuário Digital**: QR Codes, etiquetas térmicas e PWA para campo.
