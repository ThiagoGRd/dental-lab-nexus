
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Otimizações de build
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true
      }
    },
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Improved chunking strategy
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts';
            }
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            if (id.includes('lucide')) {
              return 'vendor-icons';
            }
            if (id.includes('sonner') || id.includes('toast')) {
              return 'vendor-notifications';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui-primitives';
            }
            return 'vendor-other'; // Other dependencies
          }
          
          // Split UI components
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
          
          // Split large pages
          if (id.includes('/pages/ReportsPage')) {
            return 'page-reports';
          }
          if (id.includes('/pages/FinancePage')) {
            return 'page-finance';
          }
          if (id.includes('/pages/OrdersPage')) {
            return 'page-orders';
          }
          if (id.includes('/pages/ProductionPage')) {
            return 'page-production';
          }
        }
      }
    },
    // Comprimir assets estáticos
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    // Incluir dependências para pré-bundling
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'recharts',
      'sonner',
      'date-fns'
    ]
  }
}));
