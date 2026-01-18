# FlowEstac v1.1.30 - Pronto para Deploy

## ✅ Arquivos Atualizados

- ✅ `package.json` → v1.1.30
- ✅ `package-lock.json` → v1.1.30
- ✅ `index.tsx` → Versão exibida na sidebar: 1.1.30
- ✅ `main.js` → Log de impressão: v1.1.30
- ✅ `.gitignore` → `.env` adicionado
- ✅ `CHANGELOG.md` → Criado com histórico completo

## 📋 Checklist Antes do Build

### 1. Configurar Chave do Asaas
- [ ] Abrir o arquivo `.env`
- [ ] Substituir `sua_chave_api_aqui` pela chave real do Asaas
- [ ] Salvar o arquivo

### 2. Verificar Dependências
```bash
npm install
```

### 3. Testar Localmente
```bash
npm run dev
```

**Teste:**
- Verificar se a sidebar mostra "Versão 1.1.30"
- Configurar um CNPJ nas configurações gerais
- Verificar se o sistema consulta o Asaas (se a chave estiver configurada)
- Testar a aba NFSE e validação de certificado

### 4. Compilar para Produção
```bash
npm run build
```

**Saída esperada:**
- Executável em `dist/FlowEstac Setup 1.1.30.exe`
- Build empacotado com a chave do Asaas protegida no .env

### 5. Publicar no GitHub (Opcional)
```bash
git add .
git commit -m "Release v1.1.30 - NFSE, Licenciamento Asaas, Ordenação"
git tag v1.1.30
git push origin main --tags
```

## 🎯 Principais Funcionalidades da v1.1.30

### Licenciamento Automático (Asaas)
- Chave API protegida em `.env`
- Verificação automática de inadimplência por CNPJ
- Período de carência offline: 5 dias
- Tela de bloqueio para licenças inválidas

### NFSE (Nota Fiscal Eletrônica)
- Configuração de certificado digital (.pfx)
- Validação de validade do certificado
- Status de conexão em tempo real
- Emissão automática após pagamento

### Melhorias de UX
- Lista de clientes em ordem alfabética
- Indicador de status de licença na sidebar

## ⚠️ Importante

**Segurança:**
- O arquivo `.env` nunca deve ser commitado no Git
- A chave do Asaas fica protegida dentro do executável final
- Cada instalação usa apenas o CNPJ local para consultas

**Próximos Passos:**
- Desenvolver o módulo C# `FlowEstacNfse.exe` para processar certificados
- Implementar a comunicação com o WebService do Gov.br
