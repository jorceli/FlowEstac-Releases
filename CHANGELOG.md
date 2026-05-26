# FlowEstac v1.1.54 - Changelog

## Correções e Melhorias (v1.1.54)
### 💰 Cálculo de Estadia e Diárias
- **Correção no Cálculo de Períodos:** Implementada nova lógica para evitar a soma indevida de horas extras quando o veículo cruza o horário de troca de turno (Diária/Pernoite).
- **Proteção contra Cobrança Dupla:** Garantido que estadias curtas que cruzam a fronteira de horário sejam cobradas como um período único, respeitando o valor da "primeira hora" apenas uma vez.
- **Priorização de Valores Fixos:** Para estadias longas, o sistema agora prioriza corretamente os valores fixos de Diária e Pernoite sem adicionar horas avulsas desnecessárias.

---

# FlowEstac v1.1.47 - Changelog

## Novas Funcionalidades (v1.1.47)
### ⏳ Período de Teste e Assinatura
- **Trial de 14 Dias:** Implementado um período de testes gratuito de 14 dias para novas instalações. O sistema bloqueia após esse período caso não haja licença ativa.
- **Isenção Administrativa:** Licença da administração (`48.062.404/0001-36`) automaticamente isenta de bloqueios.

---

# FlowEstac v1.1.46 - Changelog
### 🚗 Gestão de Veículos
- **Modelo de Veículo no Cadastro:** Adicionado o campo 'Modelo' diretamente no cadastro do cliente (Customer).
- **Auto-preenchimento Preciso:** Ao digitar a placa de um cliente no painel, o modelo agora é resgatado permanentemente do cadastro.
- **Histórico de Todos os Veículos:** Adicionada uma nova aba "Todos os Veículos" na tela de Clientes que centraliza e contabiliza todas as passagens de placas pelo estacionamento, separando rotativos de mensalistas.

---

# FlowEstac v1.1.45 - Changelog


## Correções e Melhorias (v1.1.45)

### ⚙️ Configurações NFSE
- **Correção no Salvamento:** Corrigido problema de concorrência que impedia o salvamento correto do CNPJ e outras configurações da NFSE.
- **Feedback Visual:** O botão de salvar agora fornece confirmação visual imediata após o sucesso da operação.

### 🐛 Correções de Interface
- **Codificação de Caracteres:** Corrigido erro de codificação ("Mojibake") na palavra "atualização" em mensagens do sistema.

---

# FlowEstac v1.1.43 - Changelog

## Novas Funcionalidades (v1.1.43)

### 🌍 Suporte Multilíngue (i18n)
- **Internacionalização Base:** Implementada a estrutura para suporte a múltiplos idiomas.
- **Idiomas Disponíveis:** Adicionados Português (Brasil), Inglês e Espanhol.
- **Seletor de Idioma:** Novo seletor de idioma adicionado às Configurações Gerais.
- **Tradução Inicial:** Sidebar e Configurações Gerais já traduzidas.

### ⏳ Período de Teste (Trial)
- **Sistema de Teste de 7 Dias:** Usuários novos agora podem testar o sistema por 7 dias sem necessidade de licença imediata.
- **Gestão Local:** Data de primeiro lançamento rastreada localmente de forma segura.

### 🛠️ Melhorias Técnicas
- **Correção de Acentuação:** Strings no processo principal (`main.js`) corrigidas para exibir acentos corretamente.
- **Versão Dinâmica:** O sistema agora exibe a versão real do `package.json` em toda a interface.
- **Limpeza de Código:** Removidas duplicidades e corrigidos erros de lint no `index.tsx`.

---

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
