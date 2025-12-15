import React from 'react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: '#0f172a',
                    color: '#ef4444',
                    padding: '2rem',
                    zIndex: 9999,
                    overflow: 'auto',
                    fontFamily: 'monospace'
                }}>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#f87171' }}>Something went wrong</h1>
                    <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{this.state.error?.toString()}</p>
                        <pre style={{ fontSize: '0.8rem', opacity: 0.8, whiteSpace: 'pre-wrap' }}>
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '2rem',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Reload App
                    </button>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        style={{
                            marginTop: '1rem',
                            marginLeft: '1rem',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Reset Data & Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
