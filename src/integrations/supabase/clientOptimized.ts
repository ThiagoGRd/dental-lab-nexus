import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verificação de segurança para garantir que as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variáveis de ambiente do Supabase não estão configuradas corretamente.');
  
  // Em produção, não exibir mensagens de erro detalhadas
  if (import.meta.env.PROD) {
    throw new Error('Erro de configuração do sistema. Entre em contato com o suporte.');
  } else {
    throw new Error('VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem ser definidos no arquivo .env');
  }
}

// Criação do cliente Supabase com configurações otimizadas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    // Configurações para melhorar a performance e segurança
    headers: {
      'X-Client-Info': 'dental-lab-nexus'
    },
    // Timeout para requisições (10 segundos)
    fetch: (url, options) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      return fetch(url, {
        ...options,
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
    }
  },
  // Configurações para melhorar a experiência offline
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

/**
 * Função utilitária para lidar com erros do Supabase de forma consistente
 * @param error Erro retornado pelo Supabase
 * @param customMessage Mensagem personalizada para o usuário
 * @returns Objeto com mensagem de erro formatada
 */
export const handleSupabaseError = (error: any, customMessage?: string) => {
  // Registrar erro no console para debugging
  console.error('Erro Supabase:', error);
  
  // Mensagens de erro amigáveis para o usuário
  let userMessage = customMessage || 'Ocorreu um erro ao processar sua solicitação.';
  
  // Mapear códigos de erro comuns para mensagens mais específicas
  if (error?.code) {
    switch (error.code) {
      case '23505': // Unique violation
        userMessage = 'Este registro já existe no sistema.';
        break;
      case '23503': // Foreign key violation
        userMessage = 'Não é possível realizar esta operação pois o registro está sendo usado em outro lugar.';
        break;
      case '23502': // Not null violation
        userMessage = 'Todos os campos obrigatórios devem ser preenchidos.';
        break;
      case '42P01': // Undefined table
        userMessage = 'Erro de configuração do sistema. Entre em contato com o suporte.';
        break;
      case 'PGRST116': // No permission to execute function
        userMessage = 'Você não tem permissão para realizar esta operação.';
        break;
      case 'P0001': // Raised exception
        userMessage = error.message || userMessage;
        break;
      // Erros de autenticação
      case 'auth/invalid-email':
        userMessage = 'Email inválido.';
        break;
      case 'auth/user-not-found':
        userMessage = 'Usuário não encontrado.';
        break;
      case 'auth/wrong-password':
        userMessage = 'Senha incorreta.';
        break;
      case 'auth/email-already-in-use':
        userMessage = 'Este email já está sendo usado.';
        break;
      case 'auth/weak-password':
        userMessage = 'A senha deve ter pelo menos 6 caracteres.';
        break;
      case 'auth/too-many-requests':
        userMessage = 'Muitas tentativas. Tente novamente mais tarde.';
        break;
    }
  }
  
  // Verificar mensagens de erro específicas
  if (error?.message) {
    if (error.message.includes('JWT expired')) {
      userMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
    } else if (error.message.includes('No connection')) {
      userMessage = 'Sem conexão com o servidor. Verifique sua internet.';
    }
  }
  
  return {
    message: userMessage,
    originalError: error,
    code: error?.code || 'unknown'
  };
};

/**
 * Função para verificar se o sistema está online
 * @returns Promise que resolve para true se online, false se offline
 */
export const checkOnlineStatus = async (): Promise<boolean> => {
  try {
    // Tenta fazer uma requisição simples para verificar a conexão
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    
    return !error;
  } catch (error) {
    console.error('Erro ao verificar status online:', error);
    return false;
  }
};

/**
 * Função para sincronizar dados offline quando a conexão for restaurada
 * @param tableName Nome da tabela para sincronizar
 * @param offlineData Dados armazenados offline
 * @returns Promise que resolve quando a sincronização for concluída
 */
export const syncOfflineData = async (tableName: string, offlineData: any[]): Promise<void> => {
  try {
    if (!offlineData || offlineData.length === 0) {
      return;
    }
    
    // Para cada item nos dados offline
    for (const item of offlineData) {
      // Verificar se o item já existe no servidor
      const { data: existingData, error: checkError } = await supabase
        .from(tableName)
        .select('id')
        .eq('id', item.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`Erro ao verificar item existente em ${tableName}:`, checkError);
        continue;
      }
      
      // Se o item já existe, atualizar
      if (existingData) {
        const { error: updateError } = await supabase
          .from(tableName)
          .update(item)
          .eq('id', item.id);
        
        if (updateError) {
          console.error(`Erro ao atualizar item em ${tableName}:`, updateError);
        }
      } 
      // Se o item não existe, inserir
      else {
        const { error: insertError } = await supabase
          .from(tableName)
          .insert(item);
        
        if (insertError) {
          console.error(`Erro ao inserir item em ${tableName}:`, insertError);
        }
      }
    }
  } catch (error) {
    console.error(`Erro ao sincronizar dados offline para ${tableName}:`, error);
    throw error;
  }
};

/**
 * Função para realizar upload de arquivo para o storage do Supabase
 * @param bucket Nome do bucket de armazenamento
 * @param path Caminho do arquivo no bucket
 * @param file Arquivo a ser enviado
 * @returns URL pública do arquivo ou null em caso de erro
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<string | null> => {
  try {
    // Verificar tamanho do arquivo (limite de 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('O arquivo deve ter no máximo 5MB.');
    }
    
    // Verificar tipo do arquivo (apenas imagens e PDFs)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Apenas imagens (JPG, PNG, WebP) e PDFs são permitidos.');
    }
    
    // Upload do arquivo
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      throw error;
    }
    
    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Erro ao fazer upload de arquivo:', error);
    
    // Mensagem amigável para o usuário
    let errorMessage = 'Erro ao fazer upload do arquivo.';
    
    if (error.message) {
      if (error.message.includes('maximum 5MB')) {
        errorMessage = 'O arquivo deve ter no máximo 5MB.';
      } else if (error.message.includes('allowed')) {
        errorMessage = 'Tipo de arquivo não permitido.';
      }
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Função para excluir arquivo do storage do Supabase
 * @param bucket Nome do bucket de armazenamento
 * @param path Caminho do arquivo no bucket
 * @returns true se o arquivo foi excluído com sucesso, false caso contrário
 */
export const deleteFile = async (
  bucket: string,
  path: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    return false;
  }
};

/**
 * Função para buscar dados com paginação
 * @param table Nome da tabela
 * @param page Número da página (começando em 1)
 * @param pageSize Tamanho da página
 * @param filters Filtros adicionais (opcional)
 * @returns Dados paginados e informações de paginação
 */
export const fetchPaginatedData = async (
  table: string,
  page: number = 1,
  pageSize: number = 10,
  filters: Record<string, any> = {}
) => {
  try {
    // Calcular o offset com base na página
    const offset = (page - 1) * pageSize;
    
    // Construir a consulta base
    let query = supabase.from(table).select('*', { count: 'exact' });
    
    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && value.includes('%')) {
          // Busca com LIKE para strings com %
          query = query.ilike(key, value);
        } else {
          // Busca exata para outros casos
          query = query.eq(key, value);
        }
      }
    });
    
    // Aplicar paginação
    query = query.range(offset, offset + pageSize - 1).order('created_at', { ascending: false });
    
    // Executar a consulta
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    // Calcular informações de paginação
    const totalPages = count ? Math.ceil(count / pageSize) : 0;
    
    return {
      data: data || [],
      pagination: {
        page,
        pageSize,
        totalItems: count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error(`Erro ao buscar dados paginados de ${table}:`, error);
    throw handleSupabaseError(error, `Erro ao buscar dados de ${table}`);
  }
};

export default supabase;
