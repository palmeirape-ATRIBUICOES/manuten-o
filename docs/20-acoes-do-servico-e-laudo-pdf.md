# 20 - Ativação Real das 5 Ações do Serviço, Assinatura Digital e Laudo PDF

Este documento descreve detalhadamente o funcionamento técnico da ativação operacional dos 5 botões da seção **"Ações do Serviço"**, do motor de assinatura digital em tela, da linha do tempo auditável e do motor de emissão de Laudos Técnicos em PDF.

---

## 1. Visão Geral das 5 Ações Operacionais

| Ação | Modal / Componente | O Que Executa |
|---|---|---|
| **📸 Adicionar Fotos** | `form-modal-add-photo` | Upload categorizado (*Antes*, *Durante*, *Depois*) com preview de miniaturas, exclusão e legendas. Persiste em `service_photos`. |
| **📝 Registrar o Que Foi Feito** | `form-modal-add-note` | Formulário de Apontamento Técnico (descrição realizada obrigatória, diagnóstico, solução e recomendações). Persiste em `service_notes`. |
| **📦 Adicionar Peças Utilizadas** | `form-modal-add-part` | Lançamento de insumos com cálculo de `total_price = quantity * unit_price`, unidades flexíveis e recálculo automático dos custos. |
| **🏷️ Alterar Status** | `form-modal-change-status` | Seleção de status (`Aberto`, `Em andamento`, `Concluído`, `Cancelado`), registro de observações e histórico de auditoria `service_status_history`. |
| **✨ Finalizar Serviço** | `form-modal-finish-service` | Validação prévia de apontamento técnico, formulário de valores/descontos, **Assinatura Digital em tela** ou justificativa de ausência, transição para `Concluído` e geração de Laudo PDF. |

---

## 2. Estrutura de Tabelas e Entidades

```sql
-- Fotos do Serviço
CREATE TABLE service_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    photo_type VARCHAR(20) NOT NULL, -- 'before', 'during', 'after'
    file_url TEXT NOT NULL,
    caption VARCHAR(255),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Apontamentos Técnicos
CREATE TABLE service_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    diagnosis TEXT,
    solution TEXT,
    recommendations TEXT,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Peças e Materiais Utilizados
CREATE TABLE service_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit VARCHAR(30) DEFAULT 'unidade',
    unit_price NUMERIC(10,2) DEFAULT 0.00,
    total_price NUMERIC(10,2) DEFAULT 0.00,
    supplier VARCHAR(255),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de Status (Linha do Tempo)
CREATE TABLE service_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    notes TEXT,
    changed_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Finalização do Serviço, Assinatura e Laudo
CREATE TABLE service_finalizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    technical_conclusion TEXT NOT NULL,
    future_recommendations TEXT,
    labor_cost NUMERIC(10,2) DEFAULT 0.00,
    parts_cost NUMERIC(10,2) DEFAULT 0.00,
    discount NUMERIC(10,2) DEFAULT 0.00,
    total_cost NUMERIC(10,2) DEFAULT 0.00,
    client_signatory_name VARCHAR(255),
    signature_base64 TEXT,
    no_signature_reason TEXT,
    finalized_by UUID NOT NULL REFERENCES users(id),
    finalized_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Linha do Tempo Auditável

A função `tenantDataService.getServiceTimeline(companyId, serviceId)` reúne em ordem cronológica decrescente todos os eventos gravados do serviço:
1. Registro do serviço
2. Envio de fotos
3. Registro de apontamentos técnicos
4. Lançamento de peças e materiais
5. Histórico de alterações de status
6. Finalização, colheita de assinatura e emissão do Laudo PDF

---

## 4. Emissão de Laudo Técnico em PDF (`src/services/pdf-generator-service.js`)

O motor `pdfGeneratorService` gera um layout limpo, profissional e otimizado para impressão/exportação em PDF contendo:
- Dados da empresa prestadora de serviço
- Identificação do cliente e ativo
- Problema relatado e diagnóstico técnico
- Peças e insumos utilizados com valores
- Fotos do atendimento (*Antes* e *Depois*)
- Resumo de custos (Mão de Obra + Peças - Desconto = Total)
- Assinatura em tela do cliente e responsável técnico
