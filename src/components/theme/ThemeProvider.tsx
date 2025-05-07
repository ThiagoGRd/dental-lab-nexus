
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

  // Safer function to add/remove class from elements
  const safelyManageClasses = (elements: NodeListOf<Element> | null, addClass: string | null, removeClass: string | null) => {
    if (!elements) return;
    
    elements.forEach(el => {
      try {
        if (removeClass && el.classList.contains(removeClass)) {
          el.classList.remove(removeClass);
        }
        if (addClass && !el.classList.contains(addClass)) {
          el.classList.add(addClass);
        }
      } catch (error) {
        console.error("Error managing classes:", error);
      }
    });
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
    
    // Apply theme to dialogs, forms and other components safely
    // We use a try-catch block to prevent errors if elements don't exist
    try {
      // Target modal backgrounds and form elements
      const dialogElements = document.querySelectorAll('.bg-white, .bg-background, [data-radix-popper-content-wrapper], .select-content');
      safelyManageClasses(
        dialogElements,
        appliedTheme === "dark" ? 'dark-theme-element' : null,
        appliedTheme === "light" ? 'dark-theme-element' : null
      );
      
      // Target form inputs and selects
      const formElements = document.querySelectorAll('input, select, textarea, [role="combobox"]');
      safelyManageClasses(
        formElements,
        appliedTheme === "dark" ? 'dark-input' : null,
        appliedTheme === "light" ? 'dark-input' : null
      );

      // Target dropdowns and popovers
      const dropdownElements = document.querySelectorAll('[role="listbox"], [role="menu"]');
      safelyManageClasses(
        dropdownElements,
        appliedTheme === "dark" ? 'dark-dropdown' : null,
        appliedTheme === "light" ? 'dark-dropdown' : null
      );
    } catch (error) {
      console.error("Error updating theme for DOM elements:", error);
    }
    
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
          
          // Apply theme to charts safely
          const chartElements = document.querySelectorAll('.recharts-wrapper');
          safelyManageClasses(
            chartElements,
            prefersDark ? 'recharts-dark-theme' : null,
            !prefersDark ? 'recharts-dark-theme' : null
          );

          // Apply theme to modals and other elements safely
          const dialogElements = document.querySelectorAll('.bg-white, .bg-background, [data-radix-popper-content-wrapper], .select-content');
          safelyManageClasses(
            dialogElements,
            prefersDark ? 'dark-theme-element' : null,
            !prefersDark ? 'dark-theme-element' : null
          );
          
          // Apply theme to form elements
          const formElements = document.querySelectorAll('input, select, textarea, [role="combobox"]');
          safelyManageClasses(
            formElements,
            prefersDark ? 'dark-input' : null,
            !prefersDark ? 'dark-input' : null
          );
          
          // Apply theme to dropdowns
          const dropdownElements = document.querySelectorAll('[role="listbox"], [role="menu"]');
          safelyManageClasses(
            dropdownElements,
            prefersDark ? 'dark-dropdown' : null,
            !prefersDark ? 'dark-dropdown' : null
          );
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
