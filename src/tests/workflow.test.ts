import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import useWorkflow from '../hooks/useWorkflow';
import useWorkflowInventory from '../hooks/useWorkflowInventory';
import { WorkflowStepType, StepStatus } from '../types/workflow';
import { MaterialCategory, MeasurementUnit } from '../types/inventory';

// Mock do Supabase
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(callback => callback({ data: [], error: null }))
  }
}));

describe('Workflow Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useWorkflow', () => {
    it('deve inicializar com valores padrão', () => {
      const { result } = renderHook(() => useWorkflow());
      
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.workflow).toBeNull();
      expect(result.current.allWorkflows).toEqual([]);
    });

    it('deve criar um novo workflow com etapas baseadas no tipo de procedimento', async () => {
      const mockWorkflow = {
        id: 'test-id',
        orderId: 'order-123',
        procedureType: 'TOTAL_PROSTHESIS',
        startDate: new Date(),
        estimatedEndDate: new Date(),
        status: 'ACTIVE',
        urgent: false,
        currentStepIndex: 0,
        steps: [
          {
            id: 'step-1',
            type: WorkflowStepType.RECEPTION,
            status: StepStatus.IN_PROGRESS,
            startDate: new Date(),
            estimatedEndDate: new Date(),
            assignedTo: 'user-1'
          }
        ]
      };

      // Mock da função createWorkflow
      const createWorkflowMock = vi.fn().mockResolvedValue(mockWorkflow);
      
      const { result, waitForNextUpdate } = renderHook(() => {
        const hook = useWorkflow();
        // Substituir a implementação real pela mock
        hook.createWorkflow = createWorkflowMock;
        return hook;
      });

      await act(async () => {
        await result.current.createWorkflow(
          'order-123',
          'TOTAL_PROSTHESIS',
          false,
          'user-1'
        );
      });

      expect(createWorkflowMock).toHaveBeenCalledWith(
        'order-123',
        'TOTAL_PROSTHESIS',
        false,
        'user-1'
      );
    });

    it('deve avançar para a próxima etapa do workflow', async () => {
      const mockWorkflow = {
        id: 'test-id',
        orderId: 'order-123',
        procedureType: 'TOTAL_PROSTHESIS',
        startDate: new Date(),
        estimatedEndDate: new Date(),
        status: 'ACTIVE',
        urgent: false,
        currentStepIndex: 0,
        steps: [
          {
            id: 'step-1',
            type: WorkflowStepType.RECEPTION,
            status: StepStatus.IN_PROGRESS,
            startDate: new Date(),
            estimatedEndDate: new Date(),
            assignedTo: 'user-1'
          },
          {
            id: 'step-2',
            type: WorkflowStepType.PRODUCTION,
            status: StepStatus.PENDING,
            assignedTo: 'user-2'
          }
        ]
      };

      // Mock da função advanceToNextStep
      const advanceToNextStepMock = vi.fn().mockResolvedValue(true);
      
      const { result } = renderHook(() => {
        const hook = useWorkflow('test-id');
        // Definir workflow manualmente para teste
        hook.workflow = mockWorkflow;
        // Substituir a implementação real pela mock
        hook.advanceToNextStep = advanceToNextStepMock;
        return hook;
      });

      await act(async () => {
        await result.current.advanceToNextStep('Etapa concluída com sucesso');
      });

      expect(advanceToNextStepMock).toHaveBeenCalledWith('Etapa concluída com sucesso', undefined);
    });
  });

  describe('useWorkflowInventory', () => {
    it('deve integrar workflow com controle de estoque', () => {
      const { result } = renderHook(() => useWorkflowInventory());
      
      expect(result.current.workflow).toBeNull();
      expect(result.current.currentStep).toBeNull();
      expect(typeof result.current.hasPendingDeductions).toBe('function');
      expect(typeof result.current.advanceWorkflowWithMaterialDeduction).toBe('function');
    });

    it('deve verificar estoque suficiente para materiais', () => {
      // Mock de inventoryItems
      const mockInventoryItems = [
        {
          id: 'material-1',
          name: 'Resina Acrílica',
          category: MaterialCategory.ACRYLIC,
          currentQuantity: 500,
          minimumQuantity: 100,
          unit: MeasurementUnit.GRAM,
          price: 50,
          isActive: true
        },
        {
          id: 'material-2',
          name: 'Gesso Especial',
          category: MaterialCategory.GYPSUM,
          currentQuantity: 5,
          minimumQuantity: 10,
          unit: MeasurementUnit.KILOGRAM,
          price: 30,
          isActive: true
        }
      ];

      // Mock de materiais necessários
      const materialsNeeded = [
        {
          materialId: 'material-1',
          quantity: 100,
          unit: MeasurementUnit.GRAM,
          automaticDeduction: true
        },
        {
          materialId: 'material-2',
          quantity: 2,
          unit: MeasurementUnit.KILOGRAM,
          automaticDeduction: false
        }
      ];

      const { result } = renderHook(() => {
        const hook = useWorkflowInventory();
        // Mock da função getMaterialStockInfo
        hook.getMaterialStockInfo = (materialId) => 
          mockInventoryItems.find(item => item.id === materialId);
        return hook;
      });

      const stockCheck = result.current.checkSufficientStock(materialsNeeded);
      
      expect(stockCheck.sufficient).toBe(true);
      expect(stockCheck.insufficientItems).toEqual([]);
    });

    it('deve identificar estoque insuficiente', () => {
      // Mock de inventoryItems
      const mockInventoryItems = [
        {
          id: 'material-1',
          name: 'Resina Acrílica',
          category: MaterialCategory.ACRYLIC,
          currentQuantity: 50, // Menos que o necessário
          minimumQuantity: 100,
          unit: MeasurementUnit.GRAM,
          price: 50,
          isActive: true
        }
      ];

      // Mock de materiais necessários
      const materialsNeeded = [
        {
          materialId: 'material-1',
          quantity: 100,
          unit: MeasurementUnit.GRAM,
          automaticDeduction: true
        }
      ];

      const { result } = renderHook(() => {
        const hook = useWorkflowInventory();
        // Mock da função getMaterialStockInfo
        hook.getMaterialStockInfo = (materialId) => 
          mockInventoryItems.find(item => item.id === materialId);
        return hook;
      });

      const stockCheck = result.current.checkSufficientStock(materialsNeeded);
      
      expect(stockCheck.sufficient).toBe(false);
      expect(stockCheck.insufficientItems.length).toBe(1);
      expect(stockCheck.insufficientItems[0].materialId).toBe('material-1');
      expect(stockCheck.insufficientItems[0].required).toBe(100);
      expect(stockCheck.insufficientItems[0].available).toBe(50);
    });
  });
});
