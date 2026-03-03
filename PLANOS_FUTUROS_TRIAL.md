# Documentação: Sistema de Licenciamento e Plano para Teste Trial

Este documento registra o estado atual do sistema de licenciamento e o roteiro planejado para a implementação de um período de teste (trial), visando a futura disponibilização do sistema em plataformas como Hotmart.

## 1. Estado Atual do Licenciamento (v1.1.42)

O sistema já possui uma infraestrutura básica de proteção localizada principalmente em `main.js` e `index.tsx`:

- **Verificação via Asaas (API):** O sistema tenta consultar o status do cliente usando o CNPJ (`nfseConfig.cnpj`) via API do Asaas. Ele verifica se existem mensalidades com status `OVERDUE`.
- **Fallback via GitHub:** Se o Asaas não estiver configurado ou falhar, o sistema consulta um arquivo JSON hospedado em um repositório público (`jorceli/Licencas`).
- **Período de Carência (Grace Period):** Existe uma carência de **5 dias** configurada. Se o sistema estiver offline, ele permite o uso baseado na data da última verificação bem-sucedida (`lastLicenseCheck`).
- **Bloqueio de Interface:** Quando o status é retornado como `blocked`, o sistema exibe a tela `LicenseBlockedScreen`, impedindo qualquer operação.

## 2. Proposta para Teste Trial (Próximas Versões)

Para facilitar a venda em plataformas como Hotmart, o sistema precisa gerenciar usuários que ainda não pagaram, mas têm permissão para testar por tempo limitado.

### Opção A: Controle Externo (Hotmart + Webhook)
- **Como funciona:** O trial é gerenciado pela plataforma de vendas ou pelo seu controle no Asaas.
- **Implementação:** Você cadastra o cliente com um status "Trial" que o código atual entende como `active`. Ao fim do prazo, você altera manualmente (ou via automação/webhook) para `blocked`.
- **Vantagem:** Não exige novas alterações no código do desktop.

### Opção B: Controle Local (Primeiro Acesso)
- **Implementação:**
    1. No primeiro acesso pós-instalação, o sistema grava de forma oculta a `primeira_data_abertura`.
    2. Em cada inicialização, o sistema verifica: `DataAtual - primeira_data_abertura`.
    3. Se o resultado for maior que **X dias** (ex: 7 ou 15) e não houver uma licença paga vinculada, ele bloqueia.
- **Vantagem:** Funciona mesmo que o usuário não tenha sido cadastrado previamente em plataformas.

## 3. Integração com Hotmart

Para automatizar o processo:
1. **Webhook:** Configurar um Webhook na Hotmart para que, a cada nova venda ou início de trial, ele envie uma requisição para uma pequena API sua (ou script intermediário).
2. **Base de Dados de Licenças:** Esse script atualiza o arquivo JSON no GitHub ou cria o cliente no Asaas automaticamente.
3. **Identificação:** O usuário precisaria informar o CNPJ ou um Token de Ativação recebido no e-mail da compra para vincular o sistema instalado à sua licença na nuvem.

## 4. Migração para SaaS (Firebase) - **PRIORIDADE PARA VENDAS**

Para simplificar a integração com plataformas de infoprodutos (Hotmart, Eduzz, Kiwify) e abandonar o controle via Asaas:
1. **Novo Banco de Dados (Firebase):** Criar um banco de dados no Firebase (gratuito e sem risco de pausa por inatividade) para armazenar os status de licença (CNPJ -> Status).
2. **Centralização de Webhooks:** Ter um servidor simples (ex: Cloud Function/Edge Function) que recebe o sinal de pagamento da plataforma de venda e atualiza o Firebase como "Pago/Ativo". Ou, receber o sinal de cancelamento e atualizar como "Bloqueado".
3. **App Desktop:** Mudar a função `checkLicense` do `index.tsx` para consultar **somente o Firebase**, removendo as chamadas para o Asaas/GitHub.
4. **Vendas Manuais:** Clientes fechados no boca-a-boca/Pix direto podem ser cadastrados manualmente direto no painel do Firebase ou numa telinha admin separada.

---
*Nota: Estas informações foram compiladas durante a versão 1.1.42 para referência em desenvolvimento futuro.*

## 4. Padronização de Versão

Atualmente, observou-se que a versão exibida no rodapé do sistema (`index.tsx`) está fixada manualmente (ex: `v1.1.36`), enquanto o `package.json` já está na versão `1.1.42`.

- **Objetivo:** Tornar a exibição da versão dinâmica.
- **Implementação:** Utilizar o estado `version` já existente no componente `Sidebar`, que busca a informação via `window.electronAPI.getAppVersion()`.
- **Vantagem:** Evita confusão para o usuário final e garante que a versão exibida sempre corresponda ao build atual.

## 5. Suporte Multilingue (i18n)

Para expandir o sistema para outros mercados, planeja-se a implementação de suporte a múltiplos idiomas.

### Idiomas Planejados:
- **Português (PT-BR):** Já implementado como base.
- **Espanhol (ES):** Foco em mercados latinos.
- **Inglês (EN):** Foco em mercado global.

### Estratégia de Implementação:
1. **Dicionários de Tradução:** Criar arquivos JSON para cada idioma (ex: `pt.json`, `es.json`, `en.json`) contendo as chaves e textos correspondentes.
2. **Contexto de Idioma:** Criar um `LanguageContext` no React para gerenciar o idioma selecionado globalmente.
3. **Seleção de Idioma:** Adicionar uma opção na tela de Configurações para o usuário trocar o idioma.
4. **Persistência:** Salvar a preferência de idioma nas configurações do sistema (`flowestac_general_settings`) para que seja mantida após reiniciar.

## 6. Correção de Codificação (Caracteres Quebrados)

Identificou-se que diversas mensagens no sistema (especialmente no processo de atualização em `main.js`) exibem caracteres quebrados (ex: `AtualizaÃ§Ã£o` em vez de `Atualização`).

- **Problema:** Conflito de codificação (UTF-8 vs ANSI/ISO-8859-1) nos arquivos do processo principal.
- **Implementação:** Padronizar todos os arquivos do projeto para **UTF-8 sem BOM** e revisar as strings no `main.js` para usar caracteres acentuados corretamente ou sequências de escape se necessário.
- **Locais Identificados:** Listeners do `autoUpdater` no arquivo `main.js`.
