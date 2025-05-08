
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console
    console.error("Uncaught error:", error);
    console.error("Component stack:", errorInfo.componentStack);
    
    this.setState({
      errorInfo
    });
    
    // You can also log the error to an error reporting service here
  }

  handleReload = () => {
    // Clear local error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Reload the page
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-destructive">Oops, ocorreu um erro!</h2>
          <p className="mb-6 text-muted-foreground">
            Tente recarregar a página. Se o problema persistir, entre em contato com o suporte.
          </p>
          {this.state.error && (
            <pre className="max-w-md overflow-auto rounded bg-muted p-4 text-sm mb-4">
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={this.handleReload}
            className="mt-6 rounded bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Recarregar página
          </button>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}
