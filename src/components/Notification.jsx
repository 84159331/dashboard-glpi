import React, { useState, useEffect } from 'react'
import { X, CheckCircle, AlertTriangle, Info, XCircle, Bell } from 'lucide-react'

const Notification = ({ 
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose, 
  id 
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.(id)
    }, 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-400" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-400/30',
          iconBg: 'bg-green-500/20'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-400/30',
          iconBg: 'bg-yellow-500/20'
        }
      case 'error':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-400/30',
          iconBg: 'bg-red-500/20'
        }
      case 'info':
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-400/30',
          iconBg: 'bg-blue-500/20'
        }
    }
  }

  const styles = getStyles()

  if (!isVisible) return null

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      transform transition-all duration-300 ease-out
      ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
    `}>
      <div className={`
        ${styles.bg} ${styles.border} border rounded-xl p-4 shadow-large backdrop-blur-sm
        hover:shadow-glow transition-all duration-300
      `}>
        <div className="flex items-start space-x-3">
          {/* Ícone */}
          <div className={`
            ${styles.iconBg} p-2 rounded-lg flex-shrink-0
          `}>
            {getIcon()}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-sm font-semibold text-white mb-1">
                {title}
              </h4>
            )}
            {message && (
              <p className="text-sm text-gray-300 leading-relaxed">
                {message}
              </p>
            )}
          </div>

          {/* Botão fechar */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-6 h-6 bg-gray-700/50 hover:bg-gray-600/50 
                     rounded-lg flex items-center justify-center text-gray-400 
                     hover:text-white transition-all duration-200 hover:scale-110"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Barra de progresso */}
        {duration > 0 && (
          <div className="mt-3 w-full bg-gray-700/30 rounded-full h-1 overflow-hidden">
            <div 
              className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-100 ease-linear"
              style={{ 
                width: isExiting ? '0%' : '100%',
                transitionDuration: `${duration}ms`
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Hook para gerenciar notificações
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([])

  const addNotification = (notification) => {
    const id = Date.now() + Math.random()
    const newNotification = { ...notification, id }
    setNotifications(prev => [...prev, newNotification])
    return id
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  }
}

// Componente container para múltiplas notificações
export const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={onRemove}
        />
      ))}
    </div>
  )
}

// Funções helper para criar notificações rapidamente
export const notify = {
  success: (title, message, duration = 5000) => ({
    type: 'success',
    title,
    message,
    duration
  }),
  
  warning: (title, message, duration = 5000) => ({
    type: 'warning',
    title,
    message,
    duration
  }),
  
  error: (title, message, duration = 7000) => ({
    type: 'error',
    title,
    message,
    duration
  }),
  
  info: (title, message, duration = 5000) => ({
    type: 'info',
    title,
    message,
    duration
  })
}

export default Notification
