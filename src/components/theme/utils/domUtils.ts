
import { safeRemoveElement, cleanupPortalElements } from './safeRemoval';

/**
 * Safely check if an element exists and is connected to the DOM
 */
export const elementExists = (el: Element | null): boolean => {
  return el !== null && el !== undefined && el.isConnected !== false;
};

/**
 * Safely manage CSS classes on DOM elements with error recovery
 */
export const safelyManageClasses = (
  selector: string, 
  addClass: string | null, 
  removeClass: string | null
) => {
  try {
    // Use querySelectorAll for better compatibility
    const elements = document.querySelectorAll(selector);
    if (!elements || elements.length === 0) return;

    elements.forEach(el => {
      // Verify element is actually in the DOM before manipulating
      if (!elementExists(el)) return;

      try {
        if (removeClass && el.classList.contains(removeClass)) {
          el.classList.remove(removeClass);
        }
        if (addClass && !el.classList.contains(addClass)) {
          el.classList.add(addClass);
        }
      } catch (error) {
        // Silent fail for individual elements to prevent breaking the whole operation
        console.debug("Element class manipulation error:", error);
      }
    });
  } catch (error) {
    console.debug("DOM selection error:", error);
  }
};

/**
 * Safely apply attributes to DOM elements with error recovery
 */
export const safelyApplyAttributes = (
  selector: string, 
  attributes: Record<string, string | null>
) => {
  try {
    const elements = document.querySelectorAll(selector);
    if (!elements || elements.length === 0) return;

    elements.forEach(el => {
      if (!elementExists(el)) return;

      try {
        Object.entries(attributes).forEach(([attr, value]) => {
          if (value === null) {
            el.removeAttribute(attr);
          } else {
            el.setAttribute(attr, value);
          }
        });
      } catch (error) {
        console.debug("Element attribute manipulation error:", error);
      }
    });
  } catch (error) {
    console.debug("DOM attribute selection error:", error);
  }
};

/**
 * Safe DOM element removal with parent verification - now using improved version
 */
export const safelyRemoveElement = safeRemoveElement;

/**
 * Check if a node is safely removable from its parent
 */
export const isNodeRemovable = (node: Node | null, parent: Node | null): boolean => {
  if (!node || !parent) return false;
  
  try {
    return parent.contains(node);
  } catch (error) {
    console.debug("Node removability check error:", error);
    return false;
  }
};

/**
 * Safely clean up portal-related DOM elements - now using improved version
 */
export { cleanupPortalElements };

/**
 * Enhanced portal cleanup with retry mechanism
 */
export const enhancedCleanupPortals = () => {
  let attempts = 0;
  const maxAttempts = 3;
  
  const cleanup = () => {
    attempts++;
    try {
      cleanupPortalElements();
      
      // Check if there are still problematic elements and retry
      const remainingPortals = document.querySelectorAll('[data-radix-portal], [data-radix-popper-content-wrapper]');
      
      if (remainingPortals.length > 0 && attempts < maxAttempts) {
        setTimeout(cleanup, 50 * attempts); // Exponential backoff
      }
    } catch (error) {
      console.debug(`Portal cleanup attempt ${attempts} failed:`, error);
      
      if (attempts < maxAttempts) {
        setTimeout(cleanup, 100 * attempts);
      }
    }
  };
  
  cleanup();
};
