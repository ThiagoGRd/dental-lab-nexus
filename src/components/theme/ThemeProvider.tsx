
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "protech-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  // Safely check if an element exists before manipulating it
  const elementExists = (el: Element | null): boolean => {
    return el !== null && el !== undefined && el.isConnected !== false;
  };

  // Safely handle DOM operations with error catching
  const safelyManageClasses = (selector: string, addClass: string | null, removeClass: string | null) => {
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

  // Safely apply attributes to elements
  const safelyApplyAttributes = (selector: string, attributes: Record<string, string>) => {
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

  // Update theme-related DOM elements safely
  const updateDOMElements = (appliedTheme: string) => {
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
      
    } catch (error) {
      console.debug("Error updating DOM elements:", error);
    }
  };

  // Setup mutation observer for dynamic content
  const setupMutationObserver = (appliedTheme: string) => {
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

  // Apply theme to document root
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    
    try {
      // First safely remove all theme classes
      root.classList.remove("light", "dark");
      
      // Determine the final theme to apply
      let appliedTheme: string;
      if (theme === "system") {
        appliedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } else {
        appliedTheme = theme;
      }
      
      // Apply theme class and data attribute to root
      root.classList.add(appliedTheme);
      
      if (appliedTheme === "dark") {
        root.setAttribute("data-theme", "dark");
      } else {
        root.removeAttribute("data-theme");
      }
      
      // Apply theme to charts
      safelyManageClasses(
        '.recharts-wrapper',
        appliedTheme === "dark" ? 'recharts-dark-theme' : null,
        appliedTheme === "light" ? 'recharts-dark-theme' : null
      );
      
      // Apply theme to DOM elements
      updateDOMElements(appliedTheme);
      
      // Setup observer for dynamic content
      return setupMutationObserver(appliedTheme);
    } catch (error) {
      console.debug("Error applying theme:", error);
      return () => {};
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      const handleChange = () => {
        if (theme !== "system") return;
        
        const root = window.document.documentElement;
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        
        try {
          // Safely update root classes
          root.classList.remove("light", "dark");
          root.classList.add(systemTheme);
          
          // Update data attribute
          if (systemTheme === "dark") {
            root.setAttribute("data-theme", "dark");
          } else {
            root.removeAttribute("data-theme");
          }
          
          // Apply theme to DOM elements
          updateDOMElements(systemTheme);
        } catch (error) {
          console.debug("Error in system theme handler:", error);
        }
      };
      
      // Initial handling
      handleChange();
      
      // Use safer event listener approach
      const listenerOptions = { once: false, passive: true };
      
      try {
        // Modern event listener
        mediaQuery.addEventListener("change", handleChange, listenerOptions);
        
        return () => {
          mediaQuery.removeEventListener("change", handleChange, listenerOptions);
        };
      } catch (listenerError) {
        // Fallback for older browsers
        try {
          mediaQuery.addListener?.(handleChange);
          return () => {
            mediaQuery.removeListener?.(handleChange);
          };
        } catch (fallbackError) {
          console.debug("Media query listener error:", fallbackError);
          return () => {};
        }
      }
    } catch (error) {
      console.debug("System theme detection error:", error);
      return () => {};
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      try {
        localStorage.setItem(storageKey, theme);
      } catch (error) {
        console.debug("LocalStorage error:", error);
      }
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
    
  return context;
};
