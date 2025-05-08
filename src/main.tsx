
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import App from './App.tsx';
import './index.css';
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from './components/ui/error-boundary';

// Create a SafeCreateRoot function to handle potential DOM issues
const SafeCreateRoot = (container: HTMLElement | null) => {
  // Ensure we have a container to render into
  if (!container) {
    console.error('Root container not found');
    
    // Create fallback container
    const fallbackRoot = document.createElement('div');
    fallbackRoot.id = 'root';
    document.body.appendChild(fallbackRoot);
    return createRoot(fallbackRoot);
  }
  
  try {
    // Try to create root with the provided container
    return createRoot(container);
  } catch (error) {
    console.error('Failed to create root:', error);
    
    // Fallback: clear container and try again
    container.innerHTML = '';
    return createRoot(container);
  }
};

// More robust root element finding with fallback
const rootElement = document.getElementById('root');
const root = SafeCreateRoot(rootElement);

// Setup error handling for React lifecycle and effects
window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = { 
  handleRuntimeError: (error) => {
    console.error('React runtime error:', error);
  }
};

// Initialize rendering with error handling
try {
  console.log('Initializing application...');
  
  // Add global error handlers
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
  
  // Set up a specific shim for useLayoutEffect in SSR environments
  if (typeof window === 'undefined' || 
      window.navigator?.userAgent?.includes('ServerSideRendering')) {
    // eslint-disable-next-line no-inner-declarations
    function noopLayoutEffect() {}
    React.useLayoutEffect = noopLayoutEffect;
  }
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <ThemeProvider defaultTheme="light" storageKey="ui-theme">
            <App />
            <Toaster />
          </ThemeProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('Application successfully rendered');
} catch (error) {
  console.error('Failed to render the application:', error);
  
  // Fallback rendering in case of critical error
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>Ocorreu um erro ao inicializar a aplicação</h2>
        <p>Por favor, atualize a página ou tente novamente mais tarde.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #0066ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Recarregar página
        </button>
      </div>
    `;
  }
}
