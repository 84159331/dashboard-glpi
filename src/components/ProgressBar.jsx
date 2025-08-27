import React from 'react'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'

const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  variant = 'primary', 
  size = 'md',
  showLabel = true,
  showIcon = false,
  animated = true,
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-green-500/20',
          bar: 'bg-gradient-to-r from-green-500 to-emerald-500',
          text: 'text-green-400',
          icon: CheckCircle
        }
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          bar: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          text: 'text-yellow-400',
          icon: AlertCircle
        }
      case 'danger':
        return {
          bg: 'bg-red-500/20',
          bar: 'bg-gradient-to-r from-red-500 to-pink-500',
          text: 'text-red-400',
          icon: AlertCircle
        }
      case 'info':
        return {
          bg: 'bg-blue-500/20',
          bar: 'bg-gradient-to-r from-blue-500 to-purple-500',
          text: 'text-blue-400',
          icon: Clock
        }
      case 'accent':
        return {
          bg: 'bg-purple-500/20',
          bar: 'bg-gradient-to-r from-purple-500 to-pink-500',
          text: 'text-purple-400',
          icon: Clock
        }
      default:
        return {
          bg: 'bg-gray-500/20',
          bar: 'bg-gradient-to-r from-gray-500 to-gray-600',
          text: 'text-gray-400',
          icon: Clock
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'h-2',
          text: 'text-xs'
        }
      case 'lg':
        return {
          container: 'h-4',
          text: 'text-base'
        }
      case 'xl':
        return {
          container: 'h-6',
          text: 'text-lg'
        }
      default:
        return {
          container: 'h-3',
          text: 'text-sm'
        }
    }
  }

  const styles = getVariantStyles()
  const sizeStyles = getSizeStyles()
  const IconComponent = styles.icon

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label e ícone */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {showIcon && (
              <IconComponent className={`h-4 w-4 ${styles.text}`} />
            )}
            <span className={`font-medium ${sizeStyles.text} ${styles.text}`}>
              Progresso
            </span>
          </div>
          <span className={`font-mono ${sizeStyles.text} ${styles.text}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      {/* Barra de progresso */}
      <div className={`relative ${sizeStyles.container} ${styles.bg} rounded-full overflow-hidden`}>
        <div 
          className={`
            h-full ${styles.bar} rounded-full transition-all duration-1000 ease-out
            ${animated ? 'animate-pulse' : ''}
          `}
          style={{ 
            width: `${percentage}%`,
            transition: animated ? 'width 1s ease-out' : 'none'
          }}
        >
          {/* Efeito de brilho */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
        
        {/* Indicador de progresso */}
        {percentage > 0 && (
          <div className="absolute inset-0 flex items-center justify-end pr-1">
            <div className="w-1 h-1 bg-white rounded-full animate-ping" />
          </div>
        )}
      </div>

      {/* Valor atual */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{value}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

// Componente de progresso circular
export const CircularProgress = ({ 
  value = 0, 
  max = 100, 
  size = 100, 
  strokeWidth = 8,
  variant = 'primary',
  showLabel = true,
  animated = true
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return '#10b981'
      case 'warning':
        return '#f59e0b'
      case 'danger':
        return '#ef4444'
      case 'info':
        return '#3b82f6'
      case 'accent':
        return '#8b5cf6'
      default:
        return '#6b7280'
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Círculo de fundo */}
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#374151"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getVariantColor()}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${animated ? 'animate-pulse' : ''}`}
          />
        </svg>
        
        {/* Valor central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {showLabel && (
        <span className="text-sm text-gray-400 font-medium">
          {value} / {max}
        </span>
      )}
    </div>
  )
}

// Componente de progresso com etapas
export const StepProgress = ({ 
  steps = [], 
  currentStep = 0, 
  variant = 'primary',
  className = ''
}) => {
  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'danger':
        return 'text-red-400'
      case 'info':
        return 'text-blue-400'
      case 'accent':
        return 'text-purple-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isPending = index > currentStep

        return (
          <div key={index} className="flex items-center">
            {/* Círculo do passo */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center border-2
              ${isCompleted 
                ? 'bg-green-500 border-green-500 text-white' 
                : isCurrent 
                  ? `bg-transparent border-current ${getVariantColor()}` 
                  : 'bg-transparent border-gray-600 text-gray-600'
              }
            `}>
              {isCompleted ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>

            {/* Linha conectora */}
            {index < steps.length - 1 && (
              <div className={`
                w-12 h-0.5 mx-2
                ${isCompleted ? 'bg-green-500' : 'bg-gray-600'}
              `} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ProgressBar
