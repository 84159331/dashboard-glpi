import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl border-2 border-red-500/50 shadow-2xl max-w-2xl w-full p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-4 bg-red-500/20 rounded-full mb-6">
                <AlertTriangle className="h-12 w-12 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Oops! Algo deu errado
              </h2>
              <p className="text-gray-300 mb-6">
                Ocorreu um erro inesperado. Por favor, recarregue a página ou tente novamente.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-900/50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-red-400 font-semibold mb-2">Erro:</p>
                  <pre className="text-xs text-gray-400 overflow-auto max-h-48">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <>
                      <p className="text-red-400 font-semibold mb-2 mt-4">Stack Trace:</p>
                      <pre className="text-xs text-gray-400 overflow-auto max-h-48">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={this.handleReset}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-semibold"
                >
                  <RefreshCw className="h-5 w-5" />
                  Recarregar Página
                </button>
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: null, errorInfo: null })
                    window.history.back()
                  }}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all font-semibold"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

