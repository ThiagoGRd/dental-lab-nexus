
# DentalLab Nexus - Sistema de Gestão para Laboratórios Dentais

Sistema completo para gerenciar laboratórios de próteses dentárias, incluindo ordens de serviço, clientes, produção, finanças e muito mais.

## Funcionalidades

- **Dashboard**: Visão geral de produção, finanças e ordens prioritárias
- **Ordens de Serviço**: Gerencie todo o fluxo de ordens de serviço, desde a criação até a entrega
- **Clientes**: Cadastro completo de clientes com histórico de ordens
- **Produção**: Acompanhe o status de cada trabalho em produção
- **Estoque**: Controle de materiais e insumos
- **Serviços**: Gerenciamento de catálogo de serviços oferecidos
- **Finanças**: Gestão de contas a pagar e receber
- **Relatórios**: Análise de desempenho e métricas
- **Configurações**: Personalização do sistema

## Requisitos de Sistema

- Node.js 18.x ou superior
- NPM 9.x ou superior
- Navegador moderno (Chrome, Firefox, Edge, Safari)

## Instalação Local

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/dentallab-nexus.git
cd dentallab-nexus
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Execute o projeto em modo de desenvolvimento

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

### 4. Para build de produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist`.

## Configuração do Banco de Dados

O sistema atualmente utiliza armazenamento local (localStorage) para demonstração. Para uma implementação completa, recomendamos as seguintes opções:

### Opção 1: Supabase (Recomendado)

1. Crie uma conta no [Supabase](https://supabase.com/)
2. Crie um novo projeto
3. Configure as seguintes tabelas no seu projeto Supabase:
   - clients
   - orders
   - services
   - inventory
   - finances
   - users
4. Ajuste as configurações de conexão no arquivo `src/lib/supabase.ts`

### Opção 2: Banco de Dados SQL Local

1. Instale PostgreSQL, MySQL ou SQLite
2. Execute os scripts de criação de tabelas disponíveis na pasta `db/scripts`
3. Configure a conexão no arquivo `src/lib/database.ts`

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── pages/          # Páginas principais
├── data/           # Dados mockados e constantes
├── lib/            # Utilitários e funções
├── hooks/          # React hooks customizados
└── App.tsx         # Componente raiz
```

## Personalizações

### Logo e Identidade Visual

Para personalizar a identidade visual:

1. Substitua a logo em `public/logo.png`
2. Ajuste as cores no arquivo `tailwind.config.ts`

### Configurações do Sistema

Acesse a seção de Configurações para personalizar:

- Informações da empresa
- Preferências do sistema
- Gerenciamento de usuários

## Suporte

Para dúvidas ou problemas, entre em contato em suporte@dentallabnexus.com

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.

## Créditos

Desenvolvido com React, Vite, TypeScript, TailwindCSS e ShadcnUI.
