import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(_error: any, _errorInfo: any) {
    // You can log errorInfo here if needed
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, color: 'red' }}>
          <h2>Something went wrong in the app.</h2>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
