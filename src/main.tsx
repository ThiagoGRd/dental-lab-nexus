
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import App from './App.tsx';
import './index.css';
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from './components/ui/error-boundary';

// More robust root element finding with fallback
const rootElement = document.getElementById('root');
if (!rootElement) {
  // Create root element if it doesn't exist (sometimes needed in production)
  console.warn('Root element not found, creating a fallback element');
  const fallbackRoot = document.createElement('div');
  fallbackRoot.id = 'root';
  document.body.appendChild(fallbackRoot);
}

// Get the root element again (original or fallback)
const finalRootElement = document.getElementById('root');

// Create root with extensive error handling
try {
  console.log('Initializing application...');
  const root = createRoot(finalRootElement!);
  
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
  
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
  if (finalRootElement) {
    finalRootElement.innerHTML = `
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
