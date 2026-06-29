import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '1.5rem 2rem',
            maxWidth: '400px',
          }}>
            <h2 style={{ color: '#dc2626', margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
              页面渲染出错
            </h2>
            <p style={{ color: '#666', margin: '0 0 1rem 0', fontSize: '0.875rem' }}>
              抱歉，页面在渲染时遇到了错误。
            </p>
            {this.state.error && (
              <details style={{
                background: '#f5f5f5',
                padding: '0.75rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                fontSize: '0.75rem',
                textAlign: 'left',
                wordBreak: 'break-all',
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 500, marginBottom: '0.25rem' }}>
                  错误详情
                </summary>
                {this.state.error.message}
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              重新加载页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
