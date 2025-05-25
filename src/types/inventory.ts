// Definição de tipos para o sistema de estoque e materiais

// Enum para categorias de materiais
export enum MaterialCategory {
  ACRYLIC = 'ACRYLIC',
  CERAMIC = 'CERAMIC',
  METAL = 'METAL',
  TEETH = 'TEETH',
  GYPSUM = 'GYPSUM',
  RESIN = 'RESIN',
  IMPLANT = 'IMPLANT',
  CONSUMABLE = 'CONSUMABLE',
  OTHER = 'OTHER'
}

// Enum para unidades de medida
export enum MeasurementUnit {
  GRAM = 'g',
  KILOGRAM = 'kg',
  MILLILITER = 'ml',
  LITER = 'l',
  UNIT = 'unidade',
  PACK = 'pacote',
  BOX = 'caixa',
  SET = 'conjunto'
}

// Interface para material no estoque
export interface InventoryItem {
  id: string;
  name: string;
  category: MaterialCategory;
  description?: string;
  currentQuantity: number;
  minimumQuantity: number;
  unit: MeasurementUnit;
  price: number;
  location?: string;
  supplier?: string;
  lastRestockDate?: Date;
  expirationDate?: Date;
  batchNumber?: string;
  isActive: boolean;
}

// Interface para movimentação de estoque
export interface InventoryMovement {
  id: string;
  materialId: string;
  quantity: number; // Positivo para entrada, negativo para saída
  date: Date;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  orderId?: string; // Referência à ordem de serviço (se aplicável)
  workflowStepId?: string; // Referência à etapa do workflow (se aplicável)
  userId: string; // Quem realizou a movimentação
  notes?: string;
  automaticDeduction: boolean; // Se foi deduzido automaticamente
  confirmed: boolean; // Se a movimentação foi confirmada pelo usuário
}

// Interface para receita de materiais (materiais necessários para um procedimento)
export interface MaterialRecipe {
  id: string;
  name: string;
  procedureType: string;
  materials: MaterialRecipeItem[];
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Interface para item da receita
export interface MaterialRecipeItem {
  materialId: string;
  quantity: number;
  unit: MeasurementUnit;
  optional: boolean;
  stepType?: string; // Em qual etapa do workflow este material é usado
}

// Interface para alerta de estoque
export interface InventoryAlert {
  id: string;
  materialId: string;
  type: 'LOW_STOCK' | 'EXPIRATION' | 'REORDER';
  message: string;
  date: Date;
  isRead: boolean;
  isResolved: boolean;
}

// Interface para pedido de compra
export interface PurchaseOrder {
  id: string;
  supplierId: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  createdAt: Date;
  updatedAt?: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  totalAmount: number;
  notes?: string;
  items: PurchaseOrderItem[];
}

// Interface para item do pedido de compra
export interface PurchaseOrderItem {
  materialId: string;
  quantity: number;
  unit: MeasurementUnit;
  unitPrice: number;
  totalPrice: number;
  received?: boolean;
  receivedQuantity?: number;
}

// Interface para previsão de consumo
export interface ConsumptionForecast {
  materialId: string;
  estimatedConsumption: number;
  unit: MeasurementUnit;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  calculatedAt: Date;
  basedOnDays: number; // Número de dias usados para o cálculo
}

// Interface para integração com o workflow
export interface WorkflowMaterialUsage {
  workflowId: string;
  stepId: string;
  materialUsages: {
    materialId: string;
    quantity: number;
    unit: MeasurementUnit;
    automaticDeduction: boolean;
    deducted: boolean;
    confirmedBy?: string;
    confirmedAt?: Date;
  }[];
}
