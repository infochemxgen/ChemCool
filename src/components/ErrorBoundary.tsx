import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Permission Denied: You don't have access to ${parsed.operationType} this resource at ${parsed.path || 'unknown path'}.`;
            isFirestoreError = true;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-industrial-950 flex items-center justify-center p-6">
          <div className="glass-panel max-w-md w-full p-8 rounded-3xl text-center shadow-2xl border-red-500/20">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">
              System Interruption
            </h1>
            
            <div className="bg-industrial-900/50 border border-zinc-border rounded-xl p-4 mb-8 text-left">
              <p className="text-sm text-zinc-muted font-mono break-words">
                {errorMessage}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-white text-industrial-950 font-black py-3 rounded-xl uppercase tracking-widest flex items-center justify-center hover:bg-zinc-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Restart Session
              </button>
              
              <a
                href="/"
                className="w-full bg-industrial-900 text-white font-black py-3 rounded-xl uppercase tracking-widest flex items-center justify-center border border-zinc-border hover:bg-industrial-800 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </a>
            </div>

            {isFirestoreError && (
              <p className="mt-6 text-[10px] text-zinc-muted uppercase tracking-widest font-bold">
                Security Policy Violation Detected
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
