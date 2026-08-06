# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

---

## [1.9.0] - Sprint 9 (Ativação Real das 5 Ações do Serviço, Assinatura Digital & Laudo PDF) - 2026-08-06

### Added
- **Ativação Real das 5 Ações**:
  - **📸 Adicionar Fotos**: Upload categorizado (*Antes*, *Durante*, *Depois*) com preview de miniaturas, exclusão e legendas.
  - **📝 Registrar o Que Foi Feito**: Formulário de Apontamentos Técnicos (descrição realizada obrigatória, diagnóstico, solução e recomendações).
  - **📦 Adicionar Peças Utilizadas**: Lançamento de insumos com cálculo automático de `valor total = quantidade × valor unitário`, unidades flexíveis e soma dos custos.
  - **🏷️ Alterar Status**: Seleção de status (`Aberto`, `Em andamento`, `Concluído`, `Cancelado`) com histórico de auditoria `service_status_history`.
  - **✨ Finalizar Serviço**: Validação prévia de apontamento técnico, formulário de valores/descontos, **Assinatura Digital em tela** ou justificativa de ausência, transição para `Concluído` e geração de Laudo PDF.
- **Motor de Laudo Técnico em PDF (`src/services/pdf-generator-service.js`)**: Documento oficial formatado com todos os dados da empresa, cliente, problema, fotos, apontamentos, peças, valores e assinatura. Botões para **Visualizar**, **Baixar PDF** e **Compartilhar**.
- **Linha do Tempo Auditável (`src/services/tenant-data-service.js`)**: Exibição em ordem cronológica de todas as ações executadas no atendimento.
- **Documentação & Testes (`docs/20-acoes-do-servico-e-laudo-pdf.md` & `tests/service-actions.test.js`)**: Bateria automatizada testando 100% dos 20 cenários exigidos.

---

## [1.8.0] - Sprint 8 (Fluxo Guiado de Manutenção "+ Novo Serviço" em 4 Etapas & Fotos Organizadas) - 2026-08-06

### Added
- **Botão Principal `+ Novo serviço`**: Ação primária em destaque verde no topo do Painel Principal.
- **Assistente Guiado em 4 Etapas**: Cliente, Equipamento, Fotos e Revisão.
