
import React, { createContext, useContext, useEffect, useState } from "react";
import { Theme, ThemeProviderProps, ThemeProviderState, initialThemeState } from "./types";
import { 
  updateDOMElements, 
  setupMutationObserver, 
  applyThemeToRoot,
  getSystemTheme,
  applyInitialTheme
} from "./utils/themeUtils";
import { useMediaQuery } from "./hooks/useMediaQuery";

const ThemeProviderContext = createContext<ThemeProviderState>(initialThemeState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "protech-ui-theme",
  ...props
}: ThemeProviderProps) {
  // Get the theme from localStorage or use the default
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  // Use the media query hook to detect system preferences
  const systemIsDark = useMediaQuery("(prefers-color-scheme: dark)");
  
  // Apply theme to document root
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Determine the final theme to apply
      let appliedTheme: string;
      if (theme === "system") {
        appliedTheme = systemIsDark ? "dark" : "light";
      } else {
        appliedTheme = theme;
      }
      
      // Apply theme to root element
      applyThemeToRoot(appliedTheme);
      
      // Update DOM elements with the theme
      updateDOMElements(appliedTheme);
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', appliedTheme === 'dark' ? '#1A1625' : '#ffffff');
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = 'theme-color';
        newMeta.content = appliedTheme === 'dark' ? '#1A1625' : '#ffffff';
        document.head.appendChild(newMeta);
      }
      
      // Setup observer for dynamic content
      return setupMutationObserver(appliedTheme);
    } catch (error) {
      console.debug("Error applying theme:", error);
      return () => {};
    }
  }, [theme, systemIsDark]);
  
  // Add global styling for theme consistency
  useEffect(() => {
    try {
      const styleId = 'global-theme-styles';
      let style = document.getElementById(styleId) as HTMLStyleElement;
      
      // Create the style element if it doesn't exist
      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
      }
      
      style.textContent = `
        /* Theme-specific styling for shadow DOM elements */
        html.dark [data-radix-popper-content-wrapper] > div,
        html[data-theme="dark"] [data-radix-popper-content-wrapper] > div,
        .dark [data-radix-popper-content-wrapper] > div {
          background-color: #1A1625 !important;
          border-color: #2D2A3A !important;
          color: #f3f4f6 !important;
        }
        
        /* Select content styling */
        html.dark .select-content,
        html[data-theme="dark"] .select-content,
        .dark .select-content {
          background-color: #1A1625 !important;
          border-color: #2D2A3A !important;
          color: #f3f4f6 !important;
        }
        
        /* Theme attribute styling */
        .select-content[data-theme="dark"] {
          background-color: #1A1625 !important;
          border-color: #2D2A3A !important;
          color: #f3f4f6 !important;
        }
        
        /* Dialog content styling */
        [role="dialog"][data-theme="dark"],
        .dialog-content[data-theme="dark"],
        .modal-content[data-theme="dark"] {
          background-color: #1A1625 !important;
          border-color: #2D2A3A !important;
          color: #f3f4f6 !important;
        }
        
        /* Form elements styling */
        html.dark input, 
        html.dark textarea, 
        html.dark select,
        html[data-theme="dark"] input,
        html[data-theme="dark"] textarea,
        html[data-theme="dark"] select,
        .dark input,
        .dark textarea,
        .dark select {
          background-color: #2D2A3A !important;
          border-color: #3D3A4B !important;
          color: #f3f4f6 !important;
        }
        
        /* Menu items styling */
        html.dark [role="menuitem"],
        html[data-theme="dark"] [role="menuitem"],
        .dark [role="menuitem"] {
          background-color: #1A1625 !important;
          color: #f3f4f6 !important;
        }
        
        /* SVG elements styling */
        html.dark .select-content svg,
        html[data-theme="dark"] .select-content svg,
        .dark .select-content svg {
          color: #f3f4f6 !important;
        }
        
        /* Table styling for dark mode */
        html.dark table,
        html[data-theme="dark"] table,
        .dark table {
          background-color: #1A1625 !important;
          color: #f3f4f6 !important;
          border-color: #2D2A3A !important;
        }
        
        html.dark th,
        html[data-theme="dark"] th,
        .dark th {
          background-color: #2D2A3A !important;
          color: #f3f4f6 !important;
          border-color: #3D3A4B !important;
        }
        
        html.dark td,
        html[data-theme="dark"] td,
        .dark td {
          border-color: #2D2A3A !important;
          color: #f3f4f6 !important;
        }
        
        /* Services page specific styling */
        html.dark .p-6,
        html[data-theme="dark"] .p-6,
        .dark .p-6 {
          background-color: #1A1625 !important;
        }
        
        /* Override any light background containers */
        html.dark div[class*="bg-white"],
        html[data-theme="dark"] div[class*="bg-white"],
        .dark div[class*="bg-white"] {
          background-color: #1A1625 !important;
        }
      `;
      
      return () => {
        if (style && style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    } catch (error) {
      console.debug("Error setting up global styles:", error);
    }
  }, []);
  
  // Expose theme context value
  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (error) {
        console.debug("LocalStorage error:", error);
      }
      setTheme(newTheme);
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
