# Documentação do Controle de Estoque Automatizado

## Visão Geral

O sistema de controle de estoque automatizado do Dental Lab Nexus foi projetado para integrar-se perfeitamente ao fluxo de produção do laboratório de prótese dentária. Esta funcionalidade permite o rastreamento preciso do consumo de materiais, baixa automática ao finalizar etapas de produção e alertas de estoque baixo.

## Componentes Principais

### 1. Modelagem de Dados

#### Tipos de Materiais e Estoque
- `MaterialCategory`: Categorias de materiais (Acrílico, Cerâmica, Metal, etc.)
- `MeasurementUnit`: Unidades de medida (g, kg, ml, unidade, etc.)
- `InventoryItem`: Item no estoque com quantidade atual, mínima, preço, etc.
- `InventoryMovement`: Registro de movimentações (entrada, saída, ajuste)
- `MaterialRecipe`: Receita de materiais para cada tipo de procedimento
- `WorkflowMaterialUsage`: Uso de materiais em etapas do workflow

### 2. Hooks e Lógica de Negócio

#### useInventory
Hook principal para gerenciamento de estoque:
- `fetchInventoryItems`: Carrega itens do estoque
- `registerMovement`: Registra movimentações (entrada/saída)
- `registerWorkflowMaterialUsage`: Registra uso de materiais em workflow
- `confirmPendingDeduction`: Confirma dedução pendente
- `checkLowStock`: Verifica itens com estoque baixo

#### useWorkflowInventory
Hook de integração entre workflow e estoque:
- `advanceWorkflowWithMaterialDeduction`: Avança workflow com dedução de materiais
- `confirmMaterialDeduction`: Confirma dedução de material específico
- `confirmAllPendingDeductions`: Confirma todas as deduções pendentes
- `checkSufficientStock`: Verifica se há estoque suficiente

### 3. Componentes de Interface

#### MaterialDeductionDialog
Diálogo para confirmação e ajuste de deduções:
- Exibe lista de materiais a serem deduzidos
- Permite ajuste manual de quantidades
- Verifica disponibilidade em estoque
- Fornece feedback visual sobre status

## Fluxos de Trabalho

### 1. Baixa Automática de Materiais

1. Ao criar uma ordem de serviço, o sistema associa uma receita de materiais baseada no tipo de procedimento
2. Quando uma etapa do workflow é concluída, o sistema:
   - Verifica os materiais associados à etapa
   - Para materiais com `automaticDeduction = true`, realiza baixa imediata
   - Para outros materiais, adiciona à lista de deduções pendentes

### 2. Confirmação Manual de Deduções

1. Usuário visualiza deduções pendentes no sistema
2. Ao selecionar uma dedução, o diálogo `MaterialDeductionDialog` é exibido
3. Usuário pode ajustar quantidades se necessário
4. Após confirmação, o sistema:
   - Registra movimentação de saída no estoque
   - Atualiza status da dedução para confirmada
   - Atualiza quantidade disponível do material

### 3. Alertas de Estoque Baixo

1. Após cada movimentação, o sistema verifica se a quantidade atual está abaixo da mínima
2. Se estiver abaixo, gera um alerta de estoque baixo
3. Alertas são exibidos no dashboard e podem ser resolvidos após reposição

## Integração com Outros Módulos

### 1. Integração com Workflow de Produção
- Cada etapa do workflow pode ter materiais associados
- Ao avançar etapas, o sistema gerencia automaticamente o estoque

### 2. Integração com Relatórios
- Consumo de materiais é registrado por ordem, cliente e tipo de procedimento
- Relatórios de consumo podem ser gerados para análise de custos

### 3. Integração com Financeiro
- Valor dos materiais consumidos é considerado no custo da ordem
- Alertas de estoque podem gerar sugestões de compra

## Casos de Uso

### Caso 1: Finalização de Etapa com Dedução Automática

```typescript
// Exemplo de uso do hook
const { advanceWorkflowWithMaterialDeduction } = useWorkflowInventory(orderId);

// Ao finalizar uma etapa
await advanceWorkflowWithMaterialDeduction(
  "Etapa concluída com sucesso",
  materialsUsed
);
```

### Caso 2: Confirmação Manual de Deduções Pendentes

```typescript
// Exemplo de uso do hook
const { confirmMaterialDeduction } = useWorkflowInventory(orderId);

// Ao confirmar uma dedução específica
await confirmMaterialDeduction(
  stepId,
  materialId,
  adjustedQuantity
);
```

### Caso 3: Verificação de Estoque Suficiente

```typescript
// Exemplo de uso do hook
const { checkSufficientStock } = useWorkflowInventory(orderId);

// Verificar se há estoque suficiente
const { sufficient, insufficientItems } = checkSufficientStock(materialsNeeded);

if (!sufficient) {
  // Exibir alerta com itens insuficientes
  showAlert(insufficientItems);
}
```

## Testes Realizados

### 1. Testes de Integração
- ✅ Criação de workflow com materiais associados
- ✅ Avanço de etapa com dedução automática
- ✅ Confirmação manual de deduções pendentes
- ✅ Verificação de estoque insuficiente

### 2. Testes de Edge Cases
- ✅ Tentativa de dedução com estoque insuficiente
- ✅ Ajuste de quantidade durante confirmação
- ✅ Cancelamento de dedução pendente
- ✅ Múltiplas deduções simultâneas

### 3. Testes de Performance
- ✅ Carregamento de estoque com grande volume de itens
- ✅ Processamento de múltiplas movimentações
- ✅ Geração de alertas em tempo real

## Próximos Passos e Melhorias Futuras

1. **Previsão de Consumo**: Implementar algoritmo para prever consumo futuro baseado no histórico
2. **Sugestão de Compra**: Gerar automaticamente lista de compras baseada em estoque mínimo e consumo previsto
3. **Rastreamento por Lote**: Adicionar rastreabilidade por lote para materiais críticos
4. **Integração com Fornecedores**: API para pedidos automáticos aos fornecedores
5. **Dashboard Avançado**: Visualizações gráficas de consumo e tendências

## Considerações de Implementação

1. **Transações Atômicas**: Garantir que movimentações de estoque sejam atômicas para evitar inconsistências
2. **Cache de Estoque**: Implementar cache para consultas frequentes de estoque
3. **Validação de Dados**: Validar todas as entradas de usuário para evitar quantidades negativas ou inválidas
4. **Logs de Auditoria**: Manter logs detalhados de todas as movimentações para auditoria
5. **Backup de Dados**: Garantir backup regular dos dados de estoque

## Conclusão

O sistema de controle de estoque automatizado do Dental Lab Nexus oferece uma solução completa para gerenciamento de materiais em laboratórios de prótese dentária. A integração com o fluxo de produção permite rastreamento preciso do consumo, enquanto os alertas e relatórios fornecem insights valiosos para tomada de decisão.
