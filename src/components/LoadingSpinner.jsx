import React from 'react'

const LoadingSpinner = ({ size = 'md', text = 'Carregando...', variant = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const variantClasses = {
    primary: 'border-blue-500',
    success: 'border-green-500',
    warning: 'border-yellow-500',
    danger: 'border-red-500',
    accent: 'border-purple-500'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      {/* Spinner principal */}
      <div className="relative">
        <div className={`
          ${sizeClasses[size]} border-4 border-gray-300/20 rounded-full animate-spin
        `}>
          <div className={`
            absolute inset-0 border-4 border-transparent border-t-current rounded-full
            ${variantClasses[variant]} animate-spin
          `}></div>
        </div>
        
        {/* Spinner secundário */}
        <div className={`
          absolute inset-2 border-2 border-transparent border-b-current rounded-full
          ${variantClasses[variant]} animate-spin
        `} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        
        {/* Ponto central */}
        <div className={`
          absolute inset-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 
          bg-current ${variantClasses[variant]} rounded-full animate-pulse
        `}></div>
      </div>

      {/* Texto de loading */}
      {text && (
        <div className="text-center">
          <p className="text-gray-400 font-medium animate-pulse">{text}</p>
          <div className="flex items-center justify-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente de loading para cards
export const CardLoading = () => (
  <div className="dashboard-card animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-600/20 rounded-xl"></div>
        <div>
          <div className="w-24 h-4 bg-gray-600/20 rounded mb-2"></div>
          <div className="w-16 h-6 bg-gray-600/20 rounded"></div>
        </div>
      </div>
      <div className="w-3 h-3 bg-gray-600/20 rounded-full"></div>
    </div>
    <div className="space-y-3">
      <div className="w-full h-3 bg-gray-600/20 rounded"></div>
      <div className="w-full h-1 bg-gray-600/20 rounded-full"></div>
      <div className="flex justify-between">
        <div className="w-20 h-3 bg-gray-600/20 rounded"></div>
        <div className="w-12 h-3 bg-gray-600/20 rounded"></div>
      </div>
    </div>
  </div>
)

// Componente de loading para tabelas
export const TableLoading = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg animate-pulse">
        <div className="w-16 h-4 bg-gray-600/20 rounded"></div>
        <div className="flex-1 h-4 bg-gray-600/20 rounded"></div>
        <div className="w-20 h-4 bg-gray-600/20 rounded"></div>
        <div className="w-24 h-4 bg-gray-600/20 rounded"></div>
        <div className="w-16 h-4 bg-gray-600/20 rounded"></div>
      </div>
    ))}
  </div>
)

// Componente de loading para gráficos
export const ChartLoading = () => (
  <div className="chart-container animate-pulse">
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-gray-600/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-gray-400">Carregando gráfico...</p>
      </div>
    </div>
  </div>
)

export default LoadingSpinner
