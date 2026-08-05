# 15 - Pipeline de Deploy e Infraestrutura CI/CD

## 1. Ambientes de Execução

| Ambiente | Branch | URL de Acesso | Banco de Dados |
|---|---|---|---|
| **Development** | `develop` | `http://localhost:3000` | Local / Supabase Local |
| **Staging** | `staging` | `https://staging.saas.com` | Supabase Staging DB |
| **Production** | `main` | `https://app.saas.com` | Supabase Production DB (HA) |

---

## 2. Pipeline de CI/CD (GitHub Actions)

Todo Push ou Pull Request para as branches `main` e `staging` dispara automaticamente o workflow de integração contínua:

```mermaid
graph LR
    Push[Git Push / PR] --> Lint[1. Lint & Format Check]
    Lint --> Test[2. Execução de Testes Unitários]
    Test --> Build[3. Build do Bundle Production]
    Build --> DeployStaging[4. Deploy em Staging]
    DeployStaging --> SmokeTest[5. Smoke Test Automatizado]
    SmokeTest --> Approval{Aprovação Manual?}
    Approval -- Sim --> DeployProd[6. Deploy em Produção]
```

---

## 3. Checklist Pré-Deploy

- [ ] Todas as migrações DDL do banco de dados foram testadas retrocompativelmente.
- [ ] O arquivo `CHANGELOG.md` foi atualizado.
- [ ] Nenhuma credencial de API ou segredo foi commitado no código.
