// Definição de tipos para o fluxo de trabalho do laboratório de prótese

// Enum para os tipos de procedimentos
export enum ProcedureType {
  TOTAL_PROSTHESIS = 'TOTAL_PROSTHESIS',
  PARTIAL_REMOVABLE_PROSTHESIS = 'PARTIAL_REMOVABLE_PROSTHESIS',
  IMPLANT_PROTOCOL = 'IMPLANT_PROTOCOL',
  PROVISIONAL = 'PROVISIONAL',
  CUSTOM = 'CUSTOM'
}

// Enum para as etapas do fluxo de trabalho
export enum WorkflowStepType {
  RECEPTION = 'RECEPTION',
  MODELING = 'MODELING',
  CASTING = 'CASTING',
  TESTING = 'TESTING',
  BAR_CASTING = 'BAR_CASTING', // Específico para próteses sobre implante
  TEETH_MOUNTING = 'TEETH_MOUNTING',
  ACRYLIZATION = 'ACRYLIZATION',
  FINISHING = 'FINISHING',
  QUALITY_CONTROL = 'QUALITY_CONTROL',
  SHIPPING = 'SHIPPING',
  DENTIST_TESTING = 'DENTIST_TESTING', // Quando enviado para teste no dentista
  RETURNED_FOR_ADJUSTMENTS = 'RETURNED_FOR_ADJUSTMENTS', // Quando retorna do dentista
  COMPLETED = 'COMPLETED'
}

// Enum para o status da etapa
export enum StepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
  DELAYED = 'DELAYED'
}

// Enum para arcada
export enum ArchType {
  UPPER = 'UPPER',
  LOWER = 'LOWER',
  BOTH = 'BOTH'
}

// Enum para escala de cor
export enum ColorScale {
  VITA_CLASSIC = 'VITA_CLASSIC',
  VITA_3D_MASTER = 'VITA_3D_MASTER',
  CHROMASCOP = 'CHROMASCOP',
  OTHER = 'OTHER'
}

// Enum para materiais
export enum MaterialType {
  ZIRCONIA = 'ZIRCONIA',
  LITHIUM_DISILICATE = 'LITHIUM_DISILICATE',
  PMMA = 'PMMA',
  ACRYLIC = 'ACRYLIC',
  METAL = 'METAL',
  COMPOSITE = 'COMPOSITE',
  OTHER = 'OTHER'
}

// Interface para etapa do workflow
export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  status: StepStatus;
  assignedTo?: string; // ID do técnico responsável
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  estimatedDuration?: number; // Em horas
  actualDuration?: number; // Em horas
  materialsUsed?: MaterialUsage[]; // Materiais utilizados nesta etapa
}

// Interface para uso de material
export interface MaterialUsage {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  automaticDeduction: boolean; // Se deve ser deduzido automaticamente do estoque
}

// Interface para configuração de workflow por tipo de procedimento
export interface WorkflowTemplate {
  id: string;
  name: string;
  procedureType: ProcedureType;
  steps: WorkflowStepType[]; // Etapas ordenadas para este tipo de procedimento
  estimatedTotalDuration: number; // Em horas
  defaultMaterials?: MaterialUsage[]; // Materiais padrão para este tipo de procedimento
}

// Interface para instância de workflow associada a uma ordem
export interface WorkflowInstance {
  id: string;
  orderId: string;
  templateId: string;
  currentStepIndex: number;
  steps: WorkflowStep[];
  startDate: Date;
  estimatedEndDate: Date;
  actualEndDate?: Date;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  urgent: boolean;
  sentToDentist: boolean;
  dentistFeedback?: string;
  returnedFromDentist?: Date;
}

// Interface para detalhes específicos de prótese
export interface ProsthesisDetails {
  procedureType: ProcedureType;
  archType: ArchType;
  toothColor: string;
  colorScale: ColorScale;
  materialType: MaterialType;
  teethNumbers?: string[]; // Números dos dentes envolvidos
  customProcedureName?: string; // Para procedimentos personalizados
}

// Interface estendida para ordem de serviço com workflow
export interface OrderWithWorkflow {
  id: string;
  clientId: string;
  patientName: string;
  creationDate: Date;
  dueDate: Date;
  urgent: boolean;
  prosthesisDetails: ProsthesisDetails;
  workflow: WorkflowInstance;
  price: number;
  notes?: string;
  attachments?: string[]; // URLs ou caminhos para arquivos anexados
}
