
import React from 'react';

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = 'Carregando...' }: PageLoadingProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-2">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent border-primary"></div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
