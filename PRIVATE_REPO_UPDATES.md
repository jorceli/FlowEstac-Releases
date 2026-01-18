# Solução: Repositório Público para Releases

## Problema
- Repositório privado = clientes não conseguem baixar atualizações
- GitHub não tem opção de "releases públicas apenas"
- Não queremos expor o código-fonte

## Solução Recomendada: Dois Repositórios

### Repositório 1: `FlowEstac` (PRIVADO) - Código-fonte
- Mantém todo o código privado
- Desenvolvimento acontece aqui
- Usa `GH_TOKEN` para build

### Repositório 2: `FlowEstac-Releases` (PÚBLICO) - Apenas executáveis
- Contém apenas os executáveis compilados
- Público para permitir downloads
- Auto-update aponta para este repositório

---

## Passo a Passo

### 1. Criar Repositório Público de Releases
1. No GitHub, crie um novo repositório: `FlowEstac-Releases`
2. Marque como **Público**
3. Adicione apenas um README.md explicando que é para releases

### 2. Atualizar package.json
```json
"publish": [
  {
    "provider": "github",
    "owner": "jorceli",
    "repo": "FlowEstac-Releases"
  }
],
```

### 3. Fazer o Build
```bash
$env:GH_TOKEN = "seu_token_aqui"
npm run build -- --publish always
```

O build vai:
- ✅ Compilar do repo privado `FlowEstac`
- ✅ Publicar a release no repo público `FlowEstac-Releases`
- ✅ Clientes conseguem baixar do repo público

### 4. Configurar .gitignore no Repo Público
No `FlowEstac-Releases`, adicione ao `.gitignore`:
```
*
!.gitignore
!README.md
```

Isso impede que o código-fonte seja commitado acidentalmente, mantendo apenas as releases.

---

## Vantagens
- ✅ Código-fonte permanece 100% privado
- ✅ Clientes conseguem baixar atualizações
- ✅ Sem necessidade de tokens nos clientes
- ✅ Controle total sobre o que é público

## Desvantagens
- ⚠️ Precisa gerenciar dois repositórios
- ⚠️ Os executáveis ficam públicos (mas sem código-fonte)

---

## Alternativa Mais Simples

Se você não se importa que os **executáveis** sejam públicos (sem o código):

1. Mantenha só um repositório **privado**
2. Ao criar cada release manualmente no GitHub:
   - Marque **"Set as a pre-release"** ou **"Set as the latest release"**
   - Os assets (executáveis) da release ficam públicos automaticamente
   - O código continua privado

Teste: Crie uma release manualmente e veja se os clientes conseguem baixar o `.exe` mesmo com repo privado.
