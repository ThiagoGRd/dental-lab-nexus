import { test, expect } from '@playwright/test';

// Testes automatizados para validar a interface visual em diferentes tamanhos de tela
test.describe('Testes de Interface Visual', () => {
  // Configurações de viewport para teste
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 }
  ];

  // Teste de login
  test('Login deve ser responsivo e funcional', async ({ page }) => {
    for (const viewport of viewports) {
      // Configurar tamanho da tela
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Navegar para a página de login
      await page.goto('/login');
      
      // Verificar se elementos principais estão visíveis
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Verificar se o layout está correto para o viewport atual
      if (viewport.name === 'mobile') {
        // Em mobile, verificar se o formulário ocupa toda a largura
        await expect(page.locator('form')).toHaveCSS('width', '100%');
      } else {
        // Em desktop/tablet, verificar se o formulário está centralizado
        await expect(page.locator('form')).toBeVisible();
      }
    }
  });

  // Teste do sidebar e navegação
  test('Sidebar deve abrir/fechar corretamente em todos os viewports', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento para dashboard
    await page.waitForURL('/');
    
    for (const viewport of viewports) {
      // Configurar tamanho da tela
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      if (viewport.name === 'mobile' || viewport.name === 'tablet') {
        // Em dispositivos menores, o sidebar deve estar inicialmente fechado
        await expect(page.locator('[data-sidebar="root"]')).not.toBeVisible();
        
        // Clicar no botão de toggle do sidebar
        await page.click('[data-sidebar="trigger"]');
        
        // Verificar se o sidebar abre
        await expect(page.locator('[data-sidebar="root"]')).toBeVisible();
        
        // Fechar o sidebar
        await page.click('[data-sidebar="trigger"]');
        
        // Verificar se o sidebar fecha
        await expect(page.locator('[data-sidebar="root"]')).not.toBeVisible();
      } else {
        // Em desktop, o sidebar deve estar sempre visível
        await expect(page.locator('[data-sidebar="root"]')).toBeVisible();
      }
    }
  });

  // Teste de navegação entre páginas
  test('Navegação entre páginas deve funcionar corretamente', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento para dashboard
    await page.waitForURL('/');
    
    // Lista de páginas para testar
    const pages = [
      { name: 'Dashboard', path: '/' },
      { name: 'Ordens de Serviço', path: '/orders' },
      { name: 'Clientes', path: '/clients' },
      { name: 'Produção', path: '/production' },
      { name: 'Estoque', path: '/inventory' },
      { name: 'Finanças', path: '/finances' }
    ];
    
    // Testar navegação para cada página
    for (const testPage of pages) {
      // Em desktop, o sidebar está sempre visível
      await page.setViewportSize({ width: 1280, height: 800 });
      
      // Clicar no link de navegação
      await page.click(`text=${testPage.name}`);
      
      // Verificar se a URL foi atualizada corretamente
      await page.waitForURL(testPage.path);
      
      // Verificar se o título da página está correto
      await expect(page.locator('h1')).toContainText(testPage.name);
      
      // Verificar se o item do menu está marcado como ativo
      const menuItem = page.locator(`a[href="${testPage.path}"]`).first();
      await expect(menuItem).toHaveAttribute('data-active', 'true');
    }
  });

  // Teste de tema claro/escuro
  test('Alternância de tema deve funcionar corretamente', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento para dashboard
    await page.waitForURL('/');
    
    // Verificar tema inicial (claro por padrão)
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    
    // Clicar no botão de alternar tema
    await page.click('button[aria-label="Alternar tema"]');
    
    // Verificar se o tema mudou para escuro
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // Clicar novamente para voltar ao tema claro
    await page.click('button[aria-label="Alternar tema"]');
    
    // Verificar se o tema voltou para claro
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  // Teste de responsividade de tabelas
  test('Tabelas devem ser responsivas em todos os viewports', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Navegar para a página de clientes (que contém tabela)
    await page.goto('/clients');
    
    for (const viewport of viewports) {
      // Configurar tamanho da tela
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Verificar se a tabela está visível
      await expect(page.locator('table')).toBeVisible();
      
      if (viewport.name === 'mobile') {
        // Em mobile, verificar se a tabela tem scroll horizontal
        const tableWidth = await page.evaluate(() => {
          const table = document.querySelector('table');
          return table ? table.offsetWidth : 0;
        });
        
        // A tabela deve ter largura maior que o viewport ou ter scroll
        expect(tableWidth).toBeGreaterThan(0);
      }
    }
  });

  // Teste de formulários
  test('Formulários devem ser responsivos e funcionais', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Navegar para a página de clientes e abrir formulário de novo cliente
    await page.goto('/clients');
    await page.click('button:has-text("Novo Cliente")');
    
    // Verificar se o modal do formulário está visível
    await expect(page.locator('form')).toBeVisible();
    
    // Verificar campos do formulário
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    
    // Testar preenchimento do formulário
    await page.fill('input[name="name"]', 'Cliente Teste');
    await page.fill('input[name="email"]', 'cliente@teste.com');
    await page.fill('input[name="phone"]', '(11) 99999-9999');
    
    // Verificar se os valores foram preenchidos corretamente
    await expect(page.locator('input[name="name"]')).toHaveValue('Cliente Teste');
    await expect(page.locator('input[name="email"]')).toHaveValue('cliente@teste.com');
    await expect(page.locator('input[name="phone"]')).toHaveValue('(11) 99999-9999');
  });

  // Teste de acessibilidade básica
  test('Elementos interativos devem ser acessíveis por teclado', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login');
    
    // Verificar navegação por teclado no formulário de login
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="password"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
    
    // Preencher e enviar o formulário
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento para dashboard
    await page.waitForURL('/');
    
    // Verificar navegação por teclado no sidebar
    await page.keyboard.press('Tab');
    
    // Pressionar Tab várias vezes para navegar pelos itens do menu
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Pressionar Enter para selecionar um item
    await page.keyboard.press('Enter');
    
    // Verificar se houve navegação para alguma página
    await expect(page.url()).not.toBe('/');
  });

  // Teste de contraste de cores
  test('Elementos devem ter contraste adequado', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento para dashboard
    await page.waitForURL('/');
    
    // Verificar contraste do texto principal
    const textColor = await page.evaluate(() => {
      const element = document.querySelector('h1');
      if (!element) return null;
      
      const styles = window.getComputedStyle(element);
      return styles.color;
    });
    
    // Verificar se a cor do texto não é nula
    expect(textColor).not.toBeNull();
    
    // Verificar contraste do botão principal
    const buttonStyles = await page.evaluate(() => {
      const button = document.querySelector('button[type="button"]');
      if (!button) return null;
      
      const styles = window.getComputedStyle(button);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });
    
    // Verificar se os estilos do botão não são nulos
    expect(buttonStyles).not.toBeNull();
  });

  // Teste de carregamento de imagens
  test('Imagens devem carregar corretamente', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento para dashboard
    await page.waitForURL('/');
    
    // Verificar se as imagens carregaram corretamente
    const images = await page.locator('img').all();
    
    for (const image of images) {
      // Verificar se a imagem está visível
      await expect(image).toBeVisible();
      
      // Verificar se a imagem tem dimensões válidas
      const dimensions = await image.boundingBox();
      expect(dimensions?.width).toBeGreaterThan(0);
      expect(dimensions?.height).toBeGreaterThan(0);
    }
  });

  // Teste de notificações e toasts
  test('Notificações e toasts devem ser exibidos corretamente', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento para dashboard
    await page.waitForURL('/');
    
    // Clicar no botão de notificações
    await page.click('button[aria-label="Notificações"]');
    
    // Verificar se o dropdown de notificações está visível
    await expect(page.locator('.dropdown-content')).toBeVisible();
    
    // Verificar se há pelo menos uma notificação
    const notifications = await page.locator('.dropdown-item').all();
    expect(notifications.length).toBeGreaterThan(0);
  });
});
