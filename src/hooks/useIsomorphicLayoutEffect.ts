
import { useEffect, useLayoutEffect } from 'react';

// Use useLayoutEffect no navegador e useEffect no servidor
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
