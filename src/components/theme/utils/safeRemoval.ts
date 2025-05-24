
/**
 * Safely remove DOM elements with comprehensive error handling
 */

/**
 * Safely remove a DOM element with all possible checks
 */
export const safeRemoveElement = (element: Element | null): boolean => {
  if (!element) {
    console.debug('Element is null, nothing to remove');
    return false;
  }

  try {
    // Check if element is still connected to the DOM
    if (!element.isConnected) {
      console.debug('Element is not connected to DOM, already removed');
      return false;
    }

    // Get the parent node
    const parent = element.parentNode;
    
    if (!parent) {
      console.debug('Element has no parent, cannot remove');
      return false;
    }

    // Verify the element is actually a child of the parent
    if (!parent.contains(element)) {
      console.debug('Element is not a child of its parent node');
      return false;
    }

    // Remove the element
    parent.removeChild(element);
    console.debug('Element removed successfully');
    return true;

  } catch (error) {
    console.debug('Error removing element:', error);
    return false;
  }
};

/**
 * Safely remove multiple elements
 */
export const safeRemoveElements = (elements: NodeListOf<Element> | Element[]): number => {
  let removedCount = 0;
  
  const elementsArray = Array.from(elements);
  
  elementsArray.forEach(element => {
    if (safeRemoveElement(element)) {
      removedCount++;
    }
  });
  
  return removedCount;
};

/**
 * Clean up portal elements safely
 */
export const cleanupPortalElements = (): void => {
  try {
    // Find all potential portal containers
    const portalSelectors = [
      '[data-radix-portal]',
      '[data-radix-popper-content-wrapper]',
      '.radix-dialog-overlay',
      '[data-state="open"]',
      '[data-side]',
      '[data-align]'
    ];

    portalSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      console.debug(`Found ${elements.length} elements with selector: ${selector}`);
      
      elements.forEach(element => {
        // Check if element looks like a stale portal
        if (element.isConnected && !element.closest('[data-dialog-root]')) {
          safeRemoveElement(element);
        }
      });
    });

  } catch (error) {
    console.debug('Error during portal cleanup:', error);
  }
};

/**
 * Safe mutation observer cleanup
 */
export const createSafeMutationObserver = (callback: MutationCallback): MutationObserver => {
  const observer = new MutationObserver((mutations) => {
    try {
      callback(mutations);
    } catch (error) {
      console.debug('Mutation observer callback error:', error);
    }
  });

  // Return a wrapped observer with safe disconnect
  return {
    observe: observer.observe.bind(observer),
    disconnect: () => {
      try {
        observer.disconnect();
      } catch (error) {
        console.debug('Error disconnecting observer:', error);
      }
    },
    takeRecords: observer.takeRecords.bind(observer)
  } as MutationObserver;
};
