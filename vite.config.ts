
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
        manualChunks: {
          // Divide o código em chunks para carregamento mais rápido
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom', 
            '@tanstack/react-query',
            'recharts',
            'sonner',
            'date-fns'
          ],
          ui: [
            '@/components/ui/button',
            '@/components/ui/toast',
            '@/components/ui/toaster',
            '@/components/ui/dialog',
            '@/components/ui/select',
            '@/components/ui/form',
            '@/components/ui/input'
          ]
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
      'sonner'
    ]
  }
}));
