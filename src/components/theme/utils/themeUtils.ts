
import { safelyManageClasses, safelyApplyAttributes } from "./domUtils";

/**
 * Update theme-related DOM elements safely
 */
export const updateDOMElements = (appliedTheme: string) => {
  try {
    const isDark = appliedTheme === "dark";
    
    // Apply theme to popper content and select menus
    safelyManageClasses(
      '[data-radix-popper-content-wrapper], .select-content, [role="listbox"], [role="menu"]',
      isDark ? 'dark' : 'light',
      isDark ? 'light' : 'dark'
    );

    // Apply specific background and border colors to select content
    safelyManageClasses(
      '.select-content, [role="listbox"], [role="menu"], [data-radix-popper-content-wrapper] > div',
      isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200',
      isDark ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700 text-gray-100'
    );

    // Apply theme attribute to dropdowns and dialogs
    safelyApplyAttributes(
      '.select-content, [role="listbox"], [role="menu"], [role="dialog"], .dialog-content, .modal-content',
      isDark ? { 'data-theme': 'dark' } : { 'data-theme': null }
    );
    
    // Apply theme to inputs and form fields
    safelyManageClasses(
      'input, textarea, select, [role="combobox"]',
      isDark ? 'dark-input' : null,
      !isDark ? 'dark-input' : null
    );

    // Apply theme to dialogs and modals
    safelyManageClasses(
      '[role="dialog"], .dialog-content, .modal-content',
      isDark ? 'dark bg-gray-800 border-gray-700 text-gray-100' : null,
      !isDark ? 'dark bg-gray-800 border-gray-700 text-gray-100' : null
    );
    
    // Apply theme to charts
    safelyManageClasses(
      '.recharts-wrapper',
      appliedTheme === "dark" ? 'recharts-dark-theme' : null,
      appliedTheme === "light" ? 'recharts-dark-theme' : null
    );
    
    // Apply dark theme to table elements
    safelyManageClasses(
      'table, tbody, thead, tr, th, td',
      isDark ? 'dark-table-element' : null,
      !isDark ? 'dark-table-element' : null
    );
    
    // Apply theme to specific sections that might retain light backgrounds
    safelyManageClasses(
      '.services-container, .services-table, .content-container, .page-container',
      isDark ? 'dark-content' : null,
      !isDark ? 'dark-content' : null
    );
    
    // Force update all main content areas
    document.querySelectorAll('.p-6, main, [role="main"], .content-area').forEach(el => {
      if (isDark) {
        el.classList.add('bg-background');
      } else {
        el.classList.remove('bg-background');
      }
    });
    
  } catch (error) {
    console.debug("Error updating DOM elements:", error);
  }
};

/**
 * Setup mutation observer for dynamic content
 */
export const setupMutationObserver = (appliedTheme: string) => {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return () => {};
  
  try {
    // Create observer instance with error handling
    const observer = new MutationObserver((mutations) => {
      try {
        // Throttle observer callbacks to prevent excessive DOM operations
        if (!window.requestAnimationFrame) {
          updateDOMElements(appliedTheme);
          return;
        }
        
        // Use requestAnimationFrame to batch DOM updates
        window.requestAnimationFrame(() => {
          updateDOMElements(appliedTheme);
        });
      } catch (error) {
        console.debug("Error in mutation observer callback:", error);
      }
    });
    
    // Start observing with a more focused approach
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
    
    return () => {
      try {
        observer.disconnect();
      } catch (error) {
        console.debug("Error disconnecting observer:", error);
      }
    };
  } catch (error) {
    console.debug("Error setting up mutation observer:", error);
    return () => {};
  }
};

/**
 * Get the system theme preference
 */
export const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

/**
 * Apply the theme to the root element
 */
export const applyThemeToRoot = (theme: string) => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // First safely remove all theme classes
  root.classList.remove("light", "dark");
  
  // Add the theme class
  root.classList.add(theme);
  
  // Update data-theme attribute
  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }
};

/**
 * Apply initial theme to prevent theme flickering
 */
export const applyInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  
  try {
    // Check for stored theme
    const storageKey = 'protech-ui-theme';
    const storedTheme = localStorage.getItem(storageKey);
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    let initialTheme;
    
    // Determine which theme to use
    if (storedTheme === 'dark' || (storedTheme === 'system' && systemPrefersDark) || (!storedTheme && systemPrefersDark)) {
      initialTheme = 'dark';
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      initialTheme = 'light';
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
    }
    
    return initialTheme;
  } catch (error) {
    console.debug("Error applying initial theme:", error);
    return 'light'; // Fallback to light theme
  }
};
