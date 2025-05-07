
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

  // Mais seguro para adicionar/remover classes dos elementos
  const safelyManageClasses = (elements: NodeListOf<Element> | HTMLElement[] | null, addClass: string | null, removeClass: string | null) => {
    if (!elements) return;
    
    try {
      const elementsArray = Array.isArray(elements) ? elements : Array.from(elements);
      
      elementsArray.forEach(el => {
        try {
          if (removeClass && el.classList.contains(removeClass)) {
            el.classList.remove(removeClass);
          }
          if (addClass && !el.classList.contains(addClass)) {
            el.classList.add(addClass);
          }
        } catch (error) {
          console.error("Error managing classes for element:", error);
        }
      });
    } catch (error) {
      console.error("Error converting elements to array:", error);
    }
  };

  // Atualiza elementos DOM com o tema atual
  const updateDOMElements = (appliedTheme: string) => {
    try {
      // Aplicar tema para elementos de formulário e diálogos
      const isDark = appliedTheme === "dark";
      
      // Usar setTimeout para garantir que os elementos renderizados após atualização do tema sejam afetados
      setTimeout(() => {
        try {
          // Poppers e conteúdo de seleção
          const poppers = document.querySelectorAll('[data-radix-popper-content-wrapper], .select-content');
          safelyManageClasses(
            poppers,
            isDark ? 'dark-theme-element' : null,
            !isDark ? 'dark-theme-element' : null
          );

          // Todos os select e divs de dropdown
          const selects = document.querySelectorAll('.select-content, [role="listbox"], [role="menu"]');
          if (selects && selects.length > 0) {
            selects.forEach(select => {
              if (isDark) {
                select.setAttribute('data-theme', 'dark');
                select.classList.add('dark', 'bg-gray-800', 'border-gray-700', 'text-gray-100');
                select.classList.remove('light', 'bg-white');
              } else {
                select.removeAttribute('data-theme');
                select.classList.remove('dark', 'bg-gray-800', 'border-gray-700', 'text-gray-100');
                select.classList.add('light', 'bg-white');
              }
            });
          }

          // Diálogos, modais e seus conteúdos
          const dialogs = document.querySelectorAll('[role="dialog"], .dialog-content, .modal-content');
          if (dialogs && dialogs.length > 0) {
            dialogs.forEach(dialog => {
              if (isDark) {
                dialog.setAttribute('data-theme', 'dark');
                dialog.classList.add('dark', 'bg-gray-800', 'border-gray-700', 'text-gray-100');
              } else {
                dialog.removeAttribute('data-theme');
                dialog.classList.remove('dark', 'bg-gray-800', 'border-gray-700', 'text-gray-100');
              }
            });
          }

          // Inputs e campos de formulário
          const formElements = document.querySelectorAll('input, textarea, select, [role="combobox"]');
          safelyManageClasses(
            formElements,
            isDark ? 'dark-input' : null,
            !isDark ? 'dark-input' : null
          );

        } catch (error) {
          console.error("Error updating DOM elements in setTimeout:", error);
        }
      }, 50);

    } catch (error) {
      console.error("Error in updateDOMElements:", error);
    }
  };

  // Observer para monitorar mudanças no DOM e aplicar o tema aos novos elementos
  const setupMutationObserver = (appliedTheme: string) => {
    try {
      // Verificar se o browser suporta MutationObserver
      if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver((mutations) => {
          updateDOMElements(appliedTheme);
        });

        // Observar o corpo inteiro do documento para alterações
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: false,
          characterData: false
        });

        // Retornar função para desconectar o observer
        return () => {
          try {
            observer.disconnect();
          } catch (error) {
            console.error("Error disconnecting mutation observer:", error);
          }
        };
      }
    } catch (error) {
      console.error("Error setting up mutation observer:", error);
    }
    return () => {}; // Retornar função vazia se houver erro
  };

  // Handle theme application
  useEffect(() => {
    const root = window.document.documentElement;
    
    // First safely remove all theme classes
    root.classList.remove("light", "dark");
    
    // Determine the final theme to apply
    let appliedTheme: string;
    if (theme === "system") {
      appliedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      appliedTheme = theme;
    }
    
    // Apply theme class to root
    root.classList.add(appliedTheme);
    
    // Set data-theme attribute
    if (appliedTheme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }

    // Apply theme to charts safely
    const chartElements = document.querySelectorAll('.recharts-wrapper');
    safelyManageClasses(
      chartElements,
      appliedTheme === "dark" ? 'recharts-dark-theme' : null,
      appliedTheme === "light" ? 'recharts-dark-theme' : null
    );
    
    // Aplicar tema a elementos do DOM
    updateDOMElements(appliedTheme);
    
    // Configurar observador para monitorar mudanças no DOM
    const cleanup = setupMutationObserver(appliedTheme);
    
    // Cleanup
    return () => {
      cleanup();
    };
  }, [theme]);

  // Listen for changes to the user's system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement;
        const prefersDark = mediaQuery.matches;
        const systemTheme = prefersDark ? "dark" : "light";

        try {
          // Safely update root classes
          root.classList.remove("light", "dark");
          root.classList.add(systemTheme);
          
          // Update data attribute
          if (prefersDark) {
            root.setAttribute("data-theme", "dark");
          } else {
            root.removeAttribute("data-theme");
          }
          
          // Apply theme to DOM elements
          updateDOMElements(systemTheme);
          
        } catch (error) {
          console.error("Error in system theme change handler:", error);
        }
      }
    };
    
    // Initial call to handle theme
    handleChange();
    
    // Setup listener with error handling
    try {
      mediaQuery.addEventListener("change", handleChange);
    } catch (error) {
      console.error("Error adding media query listener:", error);
      // Fallback to deprecated method if needed
      try {
        mediaQuery.addListener?.(handleChange);
      } catch (fallbackError) {
        console.error("Error with fallback media query listener:", fallbackError);
      }
    }
    
    // Cleanup listener with error handling
    return () => {
      try {
        mediaQuery.removeEventListener("change", handleChange);
      } catch (error) {
        console.error("Error removing media query listener:", error);
        // Fallback to deprecated method if needed
        try {
          mediaQuery.removeListener?.(handleChange);
        } catch (fallbackError) {
          console.error("Error with fallback media query listener removal:", fallbackError);
        }
      }
    };
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      try {
        localStorage.setItem(storageKey, theme);
      } catch (error) {
        console.error("Failed to save theme preference to localStorage:", error);
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
