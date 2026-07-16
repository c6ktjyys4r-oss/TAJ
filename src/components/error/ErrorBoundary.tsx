import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State { hasError: boolean; message: string; }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Gold accent line */}
          <div className="w-full h-0.5 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-100 rounded-full" />

          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
            <AlertTriangle size={26} className="text-red-500" aria-hidden="true" />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-ink-primary font-serif">Something went wrong</h1>
            <p className="text-sm text-ink-secondary mt-2 leading-relaxed">
              An unexpected error occurred. The team has been notified.
            </p>
            {this.state.message && (
              <pre className="mt-3 text-[10px] text-ink-muted bg-gray-50 rounded-lg px-4 py-3 text-left overflow-auto max-h-32 border border-border">
                {this.state.message}
              </pre>
            )}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Reload application
          </button>
        </div>
      </div>
    );
  }
}
