import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// Componente de teste visual para validar responsividade e aparência
const VisualTester = () => {
  const [viewport, setViewport] = useState('desktop');
  const [theme, setTheme] = useState('light');
  const [component, setComponent] = useState('all');
  
  // Definições de viewport para teste
  const viewports = {
    mobile: { width: '375px', height: '667px' },
    tablet: { width: '768px', height: '1024px' },
    desktop: { width: '1280px', height: '800px' },
    widescreen: { width: '1920px', height: '1080px' }
  };
  
  // Lista de componentes para testar
  const components = {
    all: 'Aplicação Completa',
    dashboard: 'Dashboard',
    orders: 'Ordens de Serviço',
    clients: 'Clientes',
    production: 'Produção',
    workflows: 'Fluxo de Trabalho',
    inventory: 'Estoque',
    finances: 'Finanças',
    reports: 'Relatórios',
    settings: 'Configurações'
  };
  
  // Alternar tema
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };
  
  // Aplicar tema inicial
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
  // Gerar URL para o componente selecionado
  const getComponentUrl = () => {
    if (component === 'all') {
      return '/';
    }
    return `/${component}`;
  };
  
  return (
    <div className="visual-tester">
      <div className="controls" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        padding: '12px', 
        background: theme === 'light' ? '#f8fafc' : '#1e293b', 
        color: theme === 'light' ? '#0f172a' : '#f8fafc',
        borderBottom: `1px solid ${theme === 'light' ? '#e2e8f0' : '#334155'}`,
        zIndex: 9999,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <label style={{ marginRight: '8px', fontSize: '14px' }}>Viewport: </label>
          <select 
            value={viewport} 
            onChange={(e) => setViewport(e.target.value)}
            style={{ 
              padding: '6px 8px', 
              borderRadius: '4px',
              border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#334155'}`,
              background: theme === 'light' ? '#ffffff' : '#1e293b',
              color: theme === 'light' ? '#0f172a' : '#f8fafc',
            }}
          >
            {Object.keys(viewports).map(size => (
              <option key={size} value={size}>{size} ({viewports[size].width} x {viewports[size].height})</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ marginRight: '8px', fontSize: '14px' }}>Componente: </label>
          <select 
            value={component} 
            onChange={(e) => setComponent(e.target.value)}
            style={{ 
              padding: '6px 8px', 
              borderRadius: '4px',
              border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#334155'}`,
              background: theme === 'light' ? '#ffffff' : '#1e293b',
              color: theme === 'light' ? '#0f172a' : '#f8fafc',
            }}
          >
            {Object.entries(components).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={toggleTheme}
          style={{ 
            padding: '6px 12px', 
            borderRadius: '4px', 
            background: theme === 'light' ? '#1e40af' : '#3b82f6',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
        </button>
        
        <div style={{ marginLeft: 'auto', fontSize: '14px' }}>
          <span>Dimensões atuais: {viewports[viewport].width} x {viewports[viewport].height}</span>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '60px', 
        padding: '16px',
        display: 'flex',
        justifyContent: 'center',
        background: theme === 'light' ? '#f1f5f9' : '#0f172a',
        minHeight: 'calc(100vh - 60px)'
      }}>
        <div style={{ 
          width: viewports[viewport].width,
          height: viewports[viewport].height,
          border: `2px solid ${theme === 'light' ? '#cbd5e1' : '#475569'}`,
          borderRadius: '8px',
          overflow: 'hidden',
          resize: 'both',
          boxShadow: theme === 'light' 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease'
        }}>
          <iframe 
            src={getComponentUrl()}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            title="Visual Test"
          />
        </div>
      </div>
      
      <div style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        background: theme === 'light' ? '#ffffff' : '#1e293b',
        border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#334155'}`,
        borderRadius: '8px',
        padding: '12px',
        boxShadow: theme === 'light' 
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        color: theme === 'light' ? '#0f172a' : '#f8fafc',
        fontSize: '14px'
      }}>
        <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>Verificação Visual</h3>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li>Verifique se o layout está correto</li>
          <li>Verifique se todos os elementos estão visíveis</li>
          <li>Verifique se as cores e contrastes estão adequados</li>
          <li>Verifique se os textos estão legíveis</li>
          <li>Verifique se os controles são utilizáveis</li>
        </ul>
      </div>
    </div>
  );
};

// Função para iniciar o teste visual
export function startVisualTest() {
  // Criar um container para o teste
  const container = document.createElement('div');
  container.id = 'visual-test-root';
  document.body.appendChild(container);
  
  // Renderizar o componente de teste
  const root = createRoot(container);
  root.render(<VisualTester />);
  
  return {
    stop: () => {
      root.unmount();
      container.remove();
    }
  };
}

export default VisualTester;
