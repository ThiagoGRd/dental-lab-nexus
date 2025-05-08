
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Certifique-se de que o React está definido globalmente para módulos de terceiros
window.React = React;

// Declare tipos para hooks que podem ser usados por bibliotecas de terceiros
declare global {
  interface Window {
    React: typeof React;
    __REACT_ERROR_OVERLAY_GLOBAL_HOOK__?: unknown;
  }
}

// Encontre o elemento root
const rootElement = document.getElementById("root");

// Verifique se o elemento existe antes de renderizar
if (rootElement) {
  const root = createRoot(rootElement);
  
  // Encapsule o aplicativo em BrowserRouter para fornecer o contexto de roteamento
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error("Elemento root não encontrado! Verifique se existe um elemento com id 'root' no seu HTML.");
}
