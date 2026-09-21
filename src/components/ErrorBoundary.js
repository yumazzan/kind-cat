import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] 렌더링 중 오류 발생:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '24px',
          textAlign: 'center',
          background: '#0f0f14',
          color: '#fff'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>일시적인 오류가 발생했습니다</div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>화면이 깨졌다면 새로고침하면 대부분 복구됩니다.</div>
          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: '#6c5ce7',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
