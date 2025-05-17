
import { toast as sonnerToast } from "sonner";

// Re-export the sonner toast function
export const toast = sonnerToast;

// Create a compatibility hook for components that expect the toast hook format
export const useToast = () => {
  return {
    toast: sonnerToast,
    // Add an empty toasts array to avoid the 'map' error in toaster.tsx
    toasts: []
  };
};
