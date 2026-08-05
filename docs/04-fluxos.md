# 04 - Diagramas de Fluxo do Sistema

Este documento apresenta todos os fluxos operacionais e técnicos da aplicação representados graficamente com **Mermaid.js**.

---

## 1. Fluxo Geral de Navegação do Usuário

```mermaid
graph TD
    Login[Tela de Login / Autenticação] --> AuthCheck{Autenticado?}
    AuthCheck -- Não --> Login
    AuthCheck -- Sim --> RoleCheck{Perfil do Usuário}

    RoleCheck -- Admin / Gestor --> DashboardAdmin[Dashboard de Gestão & Indicadores]
    RoleCheck -- Técnico --> DashboardTech[App Técnico / Fila de OS]
    RoleCheck -- Cliente Final --> PortalClient[Portal do Cliente / Prontuários]

    DashboardAdmin --> ManageAssets[Gestão de Ativos & QR Codes]
    DashboardAdmin --> ManageOS[Abertura e Despacho de OS]
    DashboardAdmin --> ManageCustomers[Cadastro de Clientes & Locais]

    DashboardTech --> ScanQR[Escanea QR Code no Equipamento]
    ScanQR --> AssetDetails[Detalhes do Ativo & Histórico]
    AssetDetails --> StartOS[Iniciar Atendimento / Checklist]
    StartOS --> AttachPhotos[Anexar Fotos Antes / Depois]
    AttachPhotos --> CollectSign[Coletar Assinatura do Cliente]
    CollectSign --> CloseOS[Concluir OS]
```

---

## 2. Fluxo de Autenticação e Multitenancy

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuário (Técnico / Gestor)
    participant Auth as Serviço de Autenticação
    participant Middleware as Tenant Middleware
    participant DB as PostgreSQL (RLS)

    U->>Auth: Envia credenciais (E-mail + Senha)
    Auth->>DB: Valida credenciais e busca user_id e tenant_id
    DB-->>Auth: Retorna dados válidos + Tenant ID
    Auth-->>U: Retorna Token JWT assinado (com claim tenant_id)
    
    Note over U, Middleware: Requisições subsequentes passam o JWT no Header

    U->>Middleware: Requisição GET /api/assets
    Middleware->>Middleware: Valida JWT e extrai tenant_id
    Middleware->>DB: Configura sessão SET LOCAL app.current_tenant_id
    DB-->>U: Retorna APENAS os dados daquele Tenant (RLS Ativo)
```

---

## 3. Fluxo de Leitura e Validação de QR Code em Campo

```mermaid
graph TD
    Start[Técnico aciona a câmera no PWA] --> Scan[Leitura da etiqueta QR Code]
    Scan --> ExtractHash[Extrai hash do QR Code da URL]
    ExtractHash --> APICall[Consulta API /api/qr/:hash]
    APICall --> CheckExists{QR Code encontrado?}
    
    CheckExists -- Não --> AlertNotFound[Exibe aviso: QR Code não cadastrado]
    AlertNotFound --> OptionRegister[Opção de Vincular a um Novo Ativo]
    
    CheckExists -- Sim --> DisplayAsset[Exibe Prontuário do Ativo]
    DisplayAsset --> ShowActions[Ações: Iniciar OS / Ver Histórico / Informar Defeito]
```

---

## 4. Fluxo do Ciclo de Vida da Ordem de Serviço (OS)

```mermaid
stateDiagram-v2
    [*] --> ABERTA: Chamado criado ou Preventiva agendada
    ABERTA --> EM_ANDAMENTO: Técnico inicia atendimento em campo
    EM_ANDAMENTO --> AGUARDANDO_PECAS: Necessita peça não disponível no estoque
    AGUARDANDO_PECAS --> EM_ANDAMENTO: Peça entregue ao técnico
    EM_ANDAMENTO --> CONCLUIDA: Checklist finalizado, fotos enviadas e assinatura colhida
    CONCLUIDA --> FATURADA: Enviada para cobrança / financeiro
    ABERTA --> CANCELADA: Chamado duplicado ou cancelado pelo cliente
    CONCLUIDA --> [*]
    FATURADA --> [*]
```

---

## 5. Fluxo das Visitas Técnicas

```mermaid
sequenceDiagram
    autonumber
    actor G as Gestor de Manutenção
    actor T as Técnico de Campo
    actor C as Cliente Final

    G->>T: Agenda Visita Técnica para Ativo específico
    T->>C: Chega ao Local do Cliente & Notifica Check-in GPS
    T->>T: Escaneia QR Code do Ativo no local
    T->>T: Preenche Checklist + Fotos de Evidência
    T->>C: Apresenta resumo do serviço na tela do PWA
    C->>T: Assina digitalmente na tela do celular/tablet
    T->>G: Finaliza Visita & Envia Laudo PDF por WhatsApp/E-mail
```
