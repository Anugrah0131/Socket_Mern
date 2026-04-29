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
        <div className="app-bg" style={{ display: 'flex', textAlign: 'center' }}>
          <div className="app-card" style={{ border: '1px solid #ef4444' }}>
            <h1 style={{ fontSize: '4rem' }}>⚠️</h1>
            <h2 className="logo">Connection Interrupted</h2>
            <p style={{ opacity: 0.7, margin: '20px 0' }}>
              Something went wrong with the video feed.
            </p>
            <button 
              className="btn-skip" 
              onClick={() => window.location.reload()}
            >
              RELOAD GLIDE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;