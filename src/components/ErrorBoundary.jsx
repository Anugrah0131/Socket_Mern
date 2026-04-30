import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // eslint-disable-next-line no-unused-vars
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Glide App Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-bg flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '24px', textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '64px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f9fafb', margin: 0 }}>Connection Interrupted</h2>
          <p style={{ color: '#9ca3af', maxWidth: '400px', lineHeight: 1.6, margin: 0 }}>
            Something went wrong. Please reload to reconnect.
          </p>
          <button
            className="action-pill start"
            onClick={() => window.location.reload()}
          >
            Reload Glide
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;