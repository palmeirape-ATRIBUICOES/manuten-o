# 13 - Padrões de Código e Convenção de Commits

Para manter o código limpo, legível e manutenível por múltiplos desenvolvedores, todos os colaboradores devem seguir as diretrizes descritas neste documento.

---

## 1. Convenção de Commits (Conventional Commits)

Todas as mensagens de commit devem seguir estritamente o padrão [Conventional Commits](https://www.conventionalcommits.org/).

### Formato da Mensagem:
```text
<tipo>(<escopo opcional>): <descrição curta e clara no presente/imperativo>

[corpo opcional explicativo]
```

### Tipos Permitidos:
- `feat`: Nova funcionalidade para o usuário ou sistema.
- `fix`: Correção de um erro/bug.
- `refactor`: Alteração de código que não altera comportamento nem adiciona funcionalidade.
- `docs`: Alteração exclusivamente na documentação (`/docs` ou `README.md`).
- `style`: Ajustes de formatação, espaços, ponto e vírgula, sem alteração lógica.
- `test`: Adição ou correção de testes automatizados.
- `build`: Alterações que afetam o sistema de build ou dependências externas.
- `chore`: Atualização de tarefas de rotina, scripts de automação ou configurações.

### Exemplos Válidos:
```bash
git commit -m "feat(asset): adiciona suporte a atributos dinâmicos em JSONB"
git commit -m "fix(qr-code): corrige falha de validação no escaneamento em campo"
git commit -m "docs(product-bible): atualiza princípios imutáveis do produto"
git commit -m "refactor(work-order): simplifica fluxo de encerramento da OS"
```

---

## 2. Regras de Estilo de Código (Code Style)

1. **Indentação**: 2 espaços (nunca utilizar Tabs).
2. **Aspas**: Aspas simples `'string'` para JS/TS; aspas duplas `"string"` para JSON/HTML.
3. **Ponto e Vírgula**: Utilizar ponto e vírgula `;` explicitamente ao final das instruções.
4. **Nomes de Variáveis**: `camelCase` para variáveis e funções; `PascalCase` para componentes e classes.
5. **Funções Pequenas**: Cada função deve realizar apenas **uma única tarefa** (Single Responsibility Principle).

---

## 3. Tratamento de Exceções

- **Nunca engolir exceções**: É proibido utilizar `catch (e) {}` vazio.
- **Errors Customizados**: Lançar classes de erro de domínio estendendo `DomainError` (ex: `AssetNotFoundError`, `InvalidOSStateError`).
