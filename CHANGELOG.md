# FlowEstac v1.1.34 - Changelog

## Correções Críticas e Definitivas

### 🐛 Hotfix v1.1.34
- **Correção Geral no main.js:**
    - Corrigida a leitura da API Key (agora lê corretamente do `.env` e não dos argumentos).
    - Corrigidos todos os erros de sintaxe (aspas faltando) nas requisições HTTP do Asaas.
    - O código foi auditado e agora a verificação de licença está robusta.

### 🐛 Hotfix v1.1.33
- **Correção da Tela NFSE:** Corrigido erro que travava o aplicativo ao abrir a aba "NFSE".
- **Correção da Mensagem "Offline":** Corrigido bug na verificação de licença.

## Mudanças da v1.1.30

### ✅ Ordenação Alfabética
- Lista de clientes agora exibida em ordem alfabética por nome

### ✅ Integração NFSE
- Nova aba de configurações NFSE
- Validação de certificado digital (.pfx)
- Status de conexão em tempo real

### ✅ Sistema de Licenciamento via Asaas
- Verificação automática via Asaas (API protegida)
