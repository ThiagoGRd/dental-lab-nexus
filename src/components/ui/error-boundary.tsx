
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-destructive">Oops, ocorreu um erro!</h2>
          <p className="mb-6 text-muted-foreground">
            Tente recarregar a página. Se o problema persistir, entre em contato com o suporte.
          </p>
          <pre className="max-w-md overflow-auto rounded bg-muted p-4 text-sm">
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
