import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  isChunkError: boolean;
}

function isChunkLoadError(error: Error | null): boolean {
  if (!error) return false;
  return (
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed') ||
    error.message.includes('Cannot read properties of null') ||
    error.message.includes('Invalid hook call')
  );
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isChunkError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      isChunkError: isChunkLoadError(error),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    console.error('ErrorBoundary caught an error:', error);

    // Auto-recover from chunk/hook errors by reloading once
    if (isChunkLoadError(error)) {
      const hasAutoReloaded = sessionStorage.getItem('error-boundary-reloaded');
      if (!hasAutoReloaded) {
        sessionStorage.setItem('error-boundary-reloaded', 'true');
        // Give a brief moment for the error to be logged, then reload
        setTimeout(() => window.location.reload(), 1500);
      }
    }
  }

  handleReset = () => {
    sessionStorage.removeItem('error-boundary-reloaded');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isChunkError: false,
    });
  };

  handleFullReload = () => {
    sessionStorage.removeItem('error-boundary-reloaded');
    const reload = () => window.location.reload();
    if ('caches' in window) {
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).finally(reload);
    } else {
      reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { isChunkError, error } = this.state;
      const wasAutoReloaded = !!sessionStorage.getItem('error-boundary-reloaded');

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-lg w-full border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                {isChunkError ? (
                  <WifiOff className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                {isChunkError ? 'Page failed to load' : 'Application Error'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/80">
                {isChunkError
                  ? wasAutoReloaded
                    ? 'The app tried to auto-recover but still failed. Please reload manually to get the latest version.'
                    : 'A module failed to load. This usually happens after an update. Reloading automatically...'
                  : 'Something went wrong while rendering this section.'}
              </p>
              {error && (
                <details className="mt-2 group border rounded-xl overflow-hidden bg-background/50">
                  <summary className="cursor-pointer font-medium p-3 hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                    Technical Details
                  </summary>
                  <pre className="p-4 bg-muted/30 text-xs overflow-auto font-mono text-muted-foreground border-t">
                    {error.toString()}
                    {'\n\nComponent Stack:\n'}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              <div className="flex gap-3 pt-2">
                <Button onClick={this.handleReset} variant="outline" className="rounded-xl">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleFullReload} variant="default" className="rounded-xl shadow-lg shadow-primary/20">
                  Clear Cache & Reload
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
