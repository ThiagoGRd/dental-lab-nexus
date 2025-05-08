
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import App from './App.tsx';
import './index.css';
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from './components/ui/error-boundary';

// More robust root element finding
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Create root with error handling
try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <App />
          <Toaster />
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
  console.log('Application successfully rendered');
} catch (error) {
  console.error('Failed to render the application:', error);
}
