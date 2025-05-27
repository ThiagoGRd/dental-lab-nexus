
// Enums para tipos de etapas de workflow
export enum WorkflowStepType {
  RECEPTION = 'RECEPTION',
  MODELING = 'MODELING',
  TEETH_MOUNTING = 'TEETH_MOUNTING',
  DENTIST_TESTING = 'DENTIST_TESTING',
  ACRYLIZATION = 'ACRYLIZATION',
  FINISHING = 'FINISHING',
  QUALITY_CONTROL = 'QUALITY_CONTROL',
  SHIPPING = 'SHIPPING',
  CASTING = 'CASTING',
  BAR_CASTING = 'BAR_CASTING',
  TESTING = 'TESTING',
  RETURNED_FOR_ADJUSTMENTS = 'RETURNED_FOR_ADJUSTMENTS',
  COMPLETED = 'COMPLETED'
}

// Enum para status de etapas
export enum StepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  BLOCKED = 'BLOCKED',
  DELAYED = 'DELAYED'
}

// Enum para tipos de procedimentos
export enum ProcedureType {
  TOTAL_PROSTHESIS = 'TOTAL_PROSTHESIS',
  PARTIAL_REMOVIBLE_PROSTHESIS = 'PARTIAL_REMOVIBLE_PROSTHESIS',
  IMPLANT_PROTOCOL = 'IMPLANT_PROTOCOL',
  PROVISIONAL = 'PROVISIONAL',
  CUSTOM = 'CUSTOM'
}

// Enum para status do workflow
export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Interface para uso de materiais
export interface MaterialUsage {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  automaticDeduction: boolean;
  cost?: number;
  notes?: string;
}

// Interface para etapa do workflow
export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  name: string;
  description: string;
  status: StepStatus;
  estimatedDuration: number; // em horas
  actualDuration?: number;
  startedAt?: Date;
  completedAt?: Date;
  assignedTo?: string;
  notes?: string;
  materialsUsed?: MaterialUsage[];
  requiresApproval?: boolean;
  isOptional?: boolean;
}

// Interface para template de workflow
export interface WorkflowTemplate {
  id: string;
  name: string;
  procedureType: ProcedureType;
  steps: WorkflowStepType[];
  estimatedTotalDuration: number; // em horas
  defaultMaterials?: MaterialUsage[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para instância de workflow
export interface WorkflowInstance {
  id: string;
  orderId: string;
  templateId: string;
  currentStepIndex: number;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  startDate: Date;
  estimatedEndDate: Date;
  actualEndDate?: Date;
  urgent: boolean;
  priority?: number;
  assignedTechnician?: string;
  sentToDentist: boolean;
  dentistFeedback?: string;
  returnedFromDentist?: Date;
  qualityCheckPassed?: boolean;
  finalNotes?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para histórico de workflow
export interface WorkflowHistory {
  id: string;
  workflowId: string;
  stepId?: string;
  action: string;
  description: string;
  performedBy: string;
  performedAt: Date;
  previousValue?: any;
  newValue?: any;
}

// Interface para métricas de performance
export interface WorkflowMetrics {
  totalWorkflows: number;
  completedWorkflows: number;
  averageCompletionTime: number;
  onTimeCompletionRate: number;
  mostCommonDelayReasons: string[];
  averageStepDuration: { [stepType: string]: number };
  technicianPerformance: { [technicianId: string]: number };
}

// Tipos adicionais para compatibilidade
export type Workflow = WorkflowInstance;
export type WorkflowStepStatus = StepStatus;

// Re-exportar ProcedureType como string union para compatibilidade
export type ProcedureTypeString = 'TOTAL_PROSTHESIS' | 'PARTIAL_REMOVIBLE_PROSTHESIS' | 'IMPLANT_PROTOCOL' | 'PROVISIONAL';
