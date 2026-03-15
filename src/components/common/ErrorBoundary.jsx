import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    handleReset = () => {
        localStorage.clear();
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F3F4F6',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    padding: '20px',
                    textAlign: 'center',
                    color: '#333'
                }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                        Something went wrong
                    </h2>
                    <p style={{ color: '#666', marginBottom: '24px', maxWidth: '500px' }}>
                        {this.state.error?.message || 'An unexpected error occurred.'}
                    </p>
                    <button
                        onClick={this.handleReset}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '500'
                        }}
                    >
                        Reset App & Reload
                    </button>
                    <div style={{ marginTop: '20px', padding: '10px', background: '#e5e7eb', borderRadius: '4px', textAlign: 'left', overflow: 'auto', maxHeight: '200px', width: '100%', maxWidth: '800px' }}>
                        <pre style={{ fontSize: '12px', margin: 0 }}>{this.state.error?.stack}</pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
