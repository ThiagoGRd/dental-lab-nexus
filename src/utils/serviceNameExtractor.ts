
/**
 * Extracts the service name from a notes string, using multiple strategies
 * to accurately identify dental service names
 */
export function extractServiceName(serviceInfo: string | undefined): string | null {
  if (!serviceInfo) return null;
  
  // Prioritize specific dental services
  if (serviceInfo.toLowerCase().includes('placa de clareamento')) {
    return 'Placa de Clareamento';
  } else if (serviceInfo.toLowerCase().includes('contenção estética')) {
    return 'Contenção Estética';
  } else if (serviceInfo.toLowerCase().includes('prótese')) {
    if (serviceInfo.toLowerCase().includes('provisória') || serviceInfo.toLowerCase().includes('provisoria')) {
      return 'Prótese Provisória';
    } else if (serviceInfo.toLowerCase().includes('definitiva')) {
      return 'Prótese Definitiva';
    }
    return 'Prótese';
  } else if (serviceInfo.toLowerCase().includes('guia cirúrgico') || serviceInfo.toLowerCase().includes('guia cirurgico')) {
    return 'Guia Cirúrgico';
  } else if (serviceInfo.toLowerCase().includes('implante')) {
    return 'Implante Dentário';
  }
  
  // Look for obvious service names using dental keywords
  const serviceKeywords = [
    'placa', 'coroa', 'aparelho', 'tratamento', 'exame', 'consulta', 
    'limpeza', 'clareamento', 'restauração', 'extração', 'contenção'
  ];
  
  for (const keyword of serviceKeywords) {
    if (serviceInfo.toLowerCase().includes(keyword)) {
      // Extract the phrase containing the keyword
      const regex = new RegExp(`([\\w\\s]*${keyword}[\\w\\s]*)`, 'i');
      const match = serviceInfo.match(regex);
      if (match && match[1] && !match[1].toLowerCase().includes('finalizada')) {
        return match[1].trim();
      }
    }
  }
  
  // Try pattern matching for service declarations
  let serviceMatch = serviceInfo.match(/servi[çc]o:?\s*([^.,;()\n]+)/i);
  if (serviceMatch && serviceMatch[1] && !serviceMatch[1].toLowerCase().includes('finalizada')) {
    return serviceMatch[1].trim();
  }
  
  // Try to find service name in "tipo: X" pattern
  serviceMatch = serviceInfo.match(/tipo:?\s*([^.,;()\n]+)/i);
  if (serviceMatch && serviceMatch[1] && !serviceMatch[1].toLowerCase().includes('finalizada')) {
    return serviceMatch[1].trim();
  }
  
  // Explicitly avoid using "finalizada" as the service name
  if (serviceInfo.toLowerCase().includes('finalizada')) {
    // Try to find what was finalized instead of using "finalizada" itself
    const beforeFinalizada = serviceInfo.split(/finalizada:?/i)[0].trim();
    if (beforeFinalizada && beforeFinalizada.length > 3) {
      // Use the last phrase before "finalizada" as the service name
      const phrases = beforeFinalizada.split(/[.,;:\n]/);
      if (phrases.length > 0) {
        const possibleService = phrases[phrases.length - 1].trim();
        if (possibleService && !possibleService.toLowerCase().includes('finalizada')) {
          return possibleService;
        }
      }
    }
  }
  
  // As last resort, look for any capitalized words that might indicate service names
  const capitalizedWords = serviceInfo.match(/\b[A-Z][a-zA-Z]{2,}\b/g);
  if (capitalizedWords && capitalizedWords.length) {
    // Use the first capitalized word that's not common or status-related
    const commonWords = ['Ordem', 'Servico', 'Serviço', 'Finalizada', 'Tipo', 'Status', 'Pendente', 'Entregue'];
    for (const word of capitalizedWords) {
      if (!commonWords.includes(word)) {
        return word;
      }
    }
  }
  
  return null;
}
