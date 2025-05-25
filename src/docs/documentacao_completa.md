# Documentação do Dental Lab Nexus

## Visão Geral

O Dental Lab Nexus é um sistema completo para gerenciamento de laboratórios de prótese dentária, oferecendo funcionalidades para controle de ordens de serviço, fluxo de produção, estoque de materiais, financeiro e relatórios.

Esta documentação abrange todas as funcionalidades implementadas, incluindo o fluxo de produção personalizado, controle de estoque automatizado e sistema financeiro com suporte a parcelamentos.

## Módulos Principais

### 1. Fluxo de Produção Personalizado

O sistema implementa um fluxo de trabalho específico para laboratórios de prótese, permitindo o acompanhamento detalhado de cada etapa da produção.

#### Características:
- Fluxos personalizados por tipo de procedimento (Prótese Total, PPR, Protocolo, etc.)
- Transição entre etapas com registro de responsáveis e datas
- Suporte para envio/retorno do dentista e ajustes
- Integração com controle de estoque para baixa automática de materiais

#### Componentes:
- `useWorkflow`: Hook para gerenciamento do fluxo de trabalho
- `WorkflowView`: Componente visual para acompanhamento de etapas
- `WorkflowsPage`: Página de listagem e detalhes de fluxos

### 2. Controle de Estoque Automatizado

Sistema de controle de estoque integrado ao fluxo de produção, permitindo baixa automática de materiais ao finalizar etapas.

#### Características:
- Categorização de materiais por tipo (Acrílico, Cerâmica, Metal, etc.)
- Rastreamento de quantidade atual, mínima e localização
- Baixa automática ao finalizar etapas do workflow
- Alertas de estoque baixo
- Histórico de movimentações

#### Componentes:
- `useInventory`: Hook para gerenciamento de estoque
- `useWorkflowInventory`: Hook de integração entre workflow e estoque
- `MaterialDeductionDialog`: Interface para confirmação de deduções

### 3. Sistema Financeiro com Parcelamentos

Controle financeiro completo com suporte a contas a receber, contas a pagar e parcelamentos.

#### Características:
- Registro de transações por tipo (Receita, Despesa, A Receber, A Pagar)
- Suporte a parcelamentos com juros e multas
- Relatórios financeiros personalizados
- Integração com ordens de serviço

#### Componentes:
- `useFinancial`: Hook para gerenciamento financeiro
- `FinancePage`: Interface completa para controle financeiro
- `InstallmentsList`: Componente para visualização de parcelas

## Guia de Uso

### Fluxo de Produção

1. **Criar Nova Ordem de Serviço**:
   - Acesse "Ordens de Serviço" > "Nova Ordem"
   - Preencha os dados do cliente, tipo de procedimento e detalhes técnicos
   - Marque como urgente se necessário (prazo de 3 dias úteis)

2. **Acompanhar Fluxo de Produção**:
   - Acesse "Fluxos de Trabalho" para ver todos os trabalhos em andamento
   - Clique em um trabalho para ver detalhes e etapas
   - Use o botão "Avançar Etapa" para registrar conclusão

3. **Enviar para Dentista / Receber do Dentista**:
   - Na tela de detalhes do fluxo, use os botões específicos
   - Ao receber do dentista, registre o feedback e indique se são necessários ajustes

### Controle de Estoque

1. **Visualizar Estoque**:
   - Acesse "Estoque" para ver todos os materiais
   - Filtre por categoria ou use a busca para encontrar itens específicos

2. **Registrar Movimentação Manual**:
   - Use o botão "Nova Movimentação" para entrada ou saída manual
   - Selecione o material, quantidade e motivo

3. **Confirmar Deduções Automáticas**:
   - Ao avançar etapas no fluxo de produção, confirme as deduções sugeridas
   - Ajuste quantidades se necessário antes de confirmar

4. **Verificar Alertas de Estoque**:
   - Alertas de estoque baixo aparecem no dashboard
   - Use a seção "Alertas" para ver todos os itens com estoque abaixo do mínimo

### Sistema Financeiro

1. **Registrar Transações**:
   - Acesse "Financeiro" > "Nova Transação"
   - Selecione o tipo (Receita, Despesa, A Receber, A Pagar)
   - Preencha os detalhes e indique se é parcelado

2. **Gerenciar Parcelamentos**:
   - Ao criar transação parcelada, defina número de parcelas e primeira data de vencimento
   - Visualize parcelas na tela de detalhes da transação
   - Registre pagamentos individuais de parcelas

3. **Gerar Relatórios**:
   - Acesse "Financeiro" > "Relatórios"
   - Selecione o tipo de relatório e período
   - Use os botões para exportar ou imprimir

## Integrações entre Módulos

### Workflow + Estoque
- Ao avançar etapas no workflow, o sistema sugere materiais a serem deduzidos
- Materiais podem ser configurados para dedução automática ou confirmação manual
- Histórico de uso de materiais é registrado por ordem de serviço

### Workflow + Financeiro
- Ao criar ordem de serviço, o sistema gera automaticamente conta a receber
- Suporte a parcelamento do valor total da ordem
- Relatórios financeiros podem ser filtrados por ordem de serviço

### Estoque + Financeiro
- Valor dos materiais consumidos é considerado no custo da ordem
- Alertas de estoque podem gerar sugestões de compra
- Compras de materiais são registradas como contas a pagar

## Configurações do Sistema

### Usuários e Permissões
- **Administrador**: Acesso completo a todas as funcionalidades
- **Técnico**: Acesso ao fluxo de produção e estoque, sem acesso ao financeiro
- **Recepção**: Acesso a clientes e ordens de serviço, sem acesso à produção

### Tabela de Preços
- Configuração de preços por tipo de procedimento
- Suporte a variações por material e características específicas
- Histórico de alterações de preços

### Notificações
- Notificações de prioridades diárias exibidas no login
- E-mail de resumo enviado ao final do dia
- Alertas de estoque baixo e contas a vencer

## Próximos Passos e Melhorias Futuras

1. **Aplicativo Mobile**: Desenvolvimento de app para acompanhamento remoto
2. **Integração com Fornecedores**: API para pedidos automáticos
3. **Portal do Cliente**: Área para dentistas acompanharem seus trabalhos
4. **BI Avançado**: Dashboard com indicadores de desempenho e lucratividade
5. **Integração com Sistemas Odontológicos**: Conexão com softwares de clínicas

## Suporte e Contato

Para suporte técnico ou dúvidas sobre o sistema, entre em contato através do e-mail suporte@dentallabnexus.com.br ou pelo telefone (XX) XXXX-XXXX.

---

Documentação v1.0 - Maio/2025
