import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component for graceful error handling
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2 text-danger fs-4" aria-hidden="true"></i>
            <div>
              <h5 className="alert-heading mb-2">Something went wrong</h5>
              <p className="mb-2">
                An unexpected error occurred while rendering the application.
              </p>
              <details className="mt-3">
                <summary className="btn btn-outline-danger btn-sm">Show Error Details</summary>
                <pre className="mt-2 p-2 bg-light border rounded small">
                  {this.state.error?.message}
                </pre>
              </details>
              <hr />
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
