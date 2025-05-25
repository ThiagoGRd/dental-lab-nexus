// Arquivo de teste visual para validar componentes em diferentes tamanhos de tela
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// Importar componentes principais
import App from './App-fixed';
import '../global-styles.css';

// Componente de teste visual
const VisualTester = () => {
  const [viewport, setViewport] = useState('desktop');
  const [theme, setTheme] = useState('light');
  
  // Definições de viewport para teste
  const viewports = {
    mobile: { width: '375px', height: '667px' },
    tablet: { width: '768px', height: '1024px' },
    desktop: { width: '1280px', height: '800px' },
    widescreen: { width: '1920px', height: '1080px' }
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
  
  return (
    <div className="visual-tester">
      <div className="controls" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        padding: '8px', 
        background: '#f0f0f0', 
        borderBottom: '1px solid #ccc',
        zIndex: 9999,
        display: 'flex',
        gap: '8px'
      }}>
        <div>
          <label>Viewport: </label>
          <select 
            value={viewport} 
            onChange={(e) => setViewport(e.target.value)}
            style={{ padding: '4px', borderRadius: '4px' }}
          >
            {Object.keys(viewports).map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={toggleTheme}
          style={{ 
            padding: '4px 8px', 
            borderRadius: '4px', 
            background: theme === 'light' ? '#333' : '#fff',
            color: theme === 'light' ? '#fff' : '#333',
            border: '1px solid #ccc'
          }}
        >
          {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
        </button>
      </div>
      
      <div style={{ 
        marginTop: '40px', 
        padding: '16px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{ 
          width: viewports[viewport].width,
          height: viewports[viewport].height,
          border: '2px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden',
          resize: 'both'
        }}>
          <iframe 
            src="/"
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            title="Visual Test"
          />
        </div>
      </div>
    </div>
  );
};

// Renderizar o componente de teste visual
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<VisualTester />);

export default VisualTester;
