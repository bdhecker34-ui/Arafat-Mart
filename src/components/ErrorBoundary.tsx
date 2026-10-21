import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Arafat Mart UI:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f7f3ea] flex items-center justify-center p-4 text-stone-900">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-amber-200">
            <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Something went wrong</h2>
            <p className="text-stone-600 text-sm mb-6">
              We encountered an unexpected issue while loading the page.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  window.location.hash = '';
                  window.location.reload();
                }}
                className="px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
              >
                Reload Store
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
