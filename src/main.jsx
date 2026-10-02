import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[render error]', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          color: '#fff',
          fontFamily: "'Montserrat', sans-serif",
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <p style={{ fontSize: '1.1rem' }}>Something went wrong.</p>
        <p style={{ opacity: 0.6, fontSize: '0.8rem' }}>
          {String(this.state.error?.message || this.state.error)}
        </p>
      </div>
    )
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)