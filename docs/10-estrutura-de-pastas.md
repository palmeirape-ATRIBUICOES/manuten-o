# 10 - Estrutura de Pastas e Mapeamento do Código

## 1. Mapeamento da Árvore de Diretórios

A estrutura física do repositório é organizada da seguinte forma:

```
.
├── docs/                       # Documentação técnica oficial (17 arquivos MD)
├── src/                        # Código-fonte principal da aplicação
│   ├── assets/                 # Estilos globais CSS, fontes e imagens estáticas
│   │   ├── styles/
│   │   │   ├── main.css        # Tokens CSS, variáveis de tema e reset
│   │   │   ├── components.css  # Estilos base de componentes
│   │   │   └── utilities.css   # Classes utilitárias
│   │   └── images/
│   ├── components/             # Componentes de interface reutilizáveis (UI)
│   │   ├── asset/              # Componentes específicos de Ativos (AssetCard, AssetHeader)
│   │   ├── work-order/         # Componentes de OS (ChecklistGroup, SignaturePad)
│   │   ├── qr-code/            # Badge e scanner de QR Code
│   │   └── ui/                 # Componentes básicos (Button, Modal, StatusPill)
│   ├── core/                   # Camada de Domínio Puro (Clean Architecture)
│   │   ├── entities/           # Entidades (Asset, WorkOrder, Tenant, Customer)
│   │   ├── use-cases/          # Casos de uso da aplicação (CreateAsset, CloseWorkOrder)
│   │   └── validators/         # Validadores de regras de negócio
│   ├── services/               # Serviços de Infraestrutura
│   │   ├── api/                # Cliente HTTP / Axios / Fetch Wrapper
│   │   ├── auth/               # Provedor de autenticação Supabase / JWT
│   │   ├── storage/            # Serviço de upload S3/Storage
│   │   └── qr/                 # Gerador e parser de QR Code
│   ├── pages/                  # Páginas / Views da aplicação
│   │   ├── admin/              # Dashboard de Gestão
│   │   ├── tech/               # App PWA móvel do técnico
│   │   └── client/             # Portal de Transparência do Cliente Final
│   ├── router/                 # Configuração de rotas e navegação
│   └── app.js                  # Ponto de entrada (Entrypoint) da aplicação JavaScript
├── public/                     # Arquivos públicos servidos diretamente (manifest.json, icons)
├── .env.example                # Template de variáveis de ambiente
├── CHANGELOG.md                # Registro de alterações do projeto
├── LICENSE                     # Licença MIT do software
└── README.md                   # Documentação inicial da raiz
```

---

## 2. Convenções de Nomenclatura

1. **Arquivos de Componente**: `kebab-case` (ex: `asset-card.js`, `signature-pad.js`).
2. **Entidades de Domínio**: `PascalCase` para a classe e `kebab-case` para o arquivo (ex: `Asset.js` em `src/core/entities/asset.entity.js`).
3. **Casos de Uso (Use Cases)**: Verbo no infinitivo + Objeto em `kebab-case` (ex: `create-asset.use-case.js`).
4. **Constantes e Interfaces**: `UPPER_SNAKE_CASE` para constantes exportadas.
