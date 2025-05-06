
/**
 * Extracts the service name from a notes string, using multiple strategies
 * to accurately identify dental service names
 */
export function extractServiceName(serviceInfo: string | undefined): string | null {
  if (!serviceInfo) return null;
  
  // Convert to lowercase for case-insensitive matching but preserve original case for return
  const serviceInfoLower = serviceInfo.toLowerCase();
  
  // First strategy: Look for specific common dental services with exact keyword matching
  const dentalServices = [
    { keyword: 'placa de clareamento', name: 'Placa de Clareamento' },
    { keyword: 'placa clareamento', name: 'Placa de Clareamento' },
    { keyword: 'contenção estética', name: 'Contenção Estética' },
    { keyword: 'guia cirúrgico', name: 'Guia Cirúrgico' },
    { keyword: 'guia cirurgico', name: 'Guia Cirúrgico' },
    { keyword: 'implante dentário', name: 'Implante Dentário' },
    { keyword: 'implante dentario', name: 'Implante Dentário' },
    { keyword: 'coroa dentária', name: 'Coroa Dentária' },
    { keyword: 'coroa dentaria', name: 'Coroa Dentária' },
    { keyword: 'prótese provisória', name: 'Prótese Provisória' },
    { keyword: 'protese provisoria', name: 'Prótese Provisória' },
    { keyword: 'prótese definitiva', name: 'Prótese Definitiva' },
    { keyword: 'protese definitiva', name: 'Prótese Definitiva' }
  ];
  
  // Check for exact keyword matches
  for (const service of dentalServices) {
    if (serviceInfoLower.includes(service.keyword)) {
      return service.name;
    }
  }
  
  // Second strategy: Handle generic prótese/protese with no specific type
  if (serviceInfoLower.includes('prótese') || serviceInfoLower.includes('protese')) {
    if (!serviceInfoLower.includes('provisória') && 
        !serviceInfoLower.includes('provisoria') && 
        !serviceInfoLower.includes('definitiva')) {
      return 'Prótese';
    }
  }
  
  // Third strategy: Look for dental service patterns using keywords
  const serviceKeywords = [
    'placa', 'coroa', 'aparelho', 'tratamento', 'exame', 'consulta', 
    'limpeza', 'clareamento', 'restauração', 'restauracao', 'extração', 'extracao',
    'contenção', 'contencao', 'modelo', 'moldagem', 'ortodontia'
  ];
  
  // Explicitly exclude status keywords often mistaken for services
  const statusKeywords = [
    'finalizada', 'finalizado', 'pendente', 'em andamento', 'concluído', 
    'concluido', 'cancelado', 'cancelada', 'entregue'
  ];
  
  // Filter out notes entries that only contain status keywords without service information
  let serviceFound = false;
  
  for (const keyword of serviceKeywords) {
    if (serviceInfoLower.includes(keyword)) {
      serviceFound = true;
      
      // Extract phrase containing the service keyword (up to 5 words surrounding it)
      const regex = new RegExp(`.{0,30}${keyword}.{0,30}`, 'i');
      const match = serviceInfo.match(regex);
      
      if (match && match[0]) {
        // Make sure the extracted phrase doesn't primarily consist of a status keyword
        let extractedPhrase = match[0].trim();
        let containsStatusKeyword = false;
        
        for (const statusWord of statusKeywords) {
          if (extractedPhrase.toLowerCase().includes(statusWord)) {
            // If status word is present, try to find the service part before it
            const parts = extractedPhrase.split(new RegExp(`\\b${statusWord}\\b`, 'i'));
            if (parts[0] && parts[0].trim().length > 3 && parts[0].toLowerCase().includes(keyword)) {
              return parts[0].trim();
            }
            containsStatusKeyword = true;
          }
        }
        
        if (!containsStatusKeyword) {
          return extractedPhrase;
        }
      }
    }
  }
  
  // Fourth strategy: Look for service declarations in specific formats
  const servicePatterns = [
    /serviço:?\s*([^.,;()\n]+)/i,
    /servico:?\s*([^.,;()\n]+)/i,
    /tipo:?\s*([^.,;()\n]+)/i,
    /procedimento:?\s*([^.,;()\n]+)/i
  ];
  
  for (const pattern of servicePatterns) {
    const match = serviceInfo.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Verify the matched service name doesn't contain status words
      let isValid = true;
      for (const statusWord of statusKeywords) {
        if (candidate.toLowerCase().includes(statusWord)) {
          isValid = false;
          break;
        }
      }
      
      if (isValid) {
        return candidate;
      }
    }
  }
  
  // Fifth strategy: If "Placa" is mentioned anywhere with other context, prioritize it as service
  if (serviceInfoLower.includes('placa')) {
    return 'Placa de Clareamento';
  }
  
  // As last resort, look for capitalized phrases that might indicate service names
  const capitalizedPhrases = serviceInfo.match(/\b[A-Z][a-zA-Zçãõáéíóúâêîôû]{2,}(\s+[A-Za-zçãõáéíóúâêîôû]+){0,3}\b/g);
  if (capitalizedPhrases && capitalizedPhrases.length) {
    const ignoredWords = ['Ordem', 'Servico', 'Serviço', 'Finalizada', 'Tipo', 'Status', 'Pendente', 'Entregue'];
    
    for (const phrase of capitalizedPhrases) {
      // Check if the phrase is not just a common word to ignore
      let isValid = true;
      for (const ignored of ignoredWords) {
        if (phrase === ignored) {
          isValid = false;
          break;
        }
      }
      
      if (isValid) {
        return phrase;
      }
    }
  }
  
  return null;
}
