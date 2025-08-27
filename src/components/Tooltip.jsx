import React, { useState, useRef, useEffect } from 'react'

const Tooltip = ({ 
  children, 
  content, 
  position = 'top', 
  delay = 200, 
  className = '',
  showArrow = true 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      updatePosition()
    }, delay)
  }

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current)
    setIsVisible(false)
  }

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    
    let x = 0
    let y = 0

    switch (position) {
      case 'top':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
        y = triggerRect.top - tooltipRect.height - 8
        break
      case 'bottom':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
        y = triggerRect.bottom + 8
        break
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
        break
      case 'right':
        x = triggerRect.right + 8
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
        break
    }

    // Ajustar para não sair da tela
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (x < 8) x = 8
    if (x + tooltipRect.width > viewportWidth - 8) {
      x = viewportWidth - tooltipRect.width - 8
    }
    if (y < 8) y = 8
    if (y + tooltipRect.height > viewportHeight - 8) {
      y = viewportHeight - tooltipRect.height - 8
    }

    setCoords({ x, y })
  }

  useEffect(() => {
    if (isVisible) {
      updatePosition()
      window.addEventListener('scroll', updatePosition)
      window.addEventListener('resize', updatePosition)
      
      return () => {
        window.removeEventListener('scroll', updatePosition)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isVisible])

  const getArrowPosition = () => {
    switch (position) {
      case 'top':
        return 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-t-gray-800'
      case 'bottom':
        return 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-b-gray-800'
      case 'left':
        return 'right-0 top-1/2 transform translate-x-full -translate-y-1/2 border-t-transparent border-b-transparent border-l-gray-800'
      case 'right':
        return 'left-0 top-1/2 transform -translate-x-full -translate-y-1/2 border-t-transparent border-b-transparent border-r-gray-800'
      default:
        return ''
    }
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={className}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            fixed z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-large
            border border-gray-700 backdrop-blur-sm
            transform transition-all duration-200 ease-out
            ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
          style={{
            left: coords.x,
            top: coords.y,
            pointerEvents: 'none'
          }}
        >
          {content}
          {showArrow && (
            <div className={`absolute w-0 h-0 border-4 ${getArrowPosition()}`} />
          )}
        </div>
      )}
    </>
  )
}

// Componente de tooltip com ícone de informação
export const InfoTooltip = ({ content, children, ...props }) => (
  <Tooltip content={content} {...props}>
    <div className="inline-flex items-center">
      {children}
      <div className="ml-1 w-4 h-4 bg-blue-500/20 rounded-full flex items-center justify-center cursor-help">
        <span className="text-xs text-blue-400 font-bold">i</span>
      </div>
    </div>
  </Tooltip>
)

// Componente de tooltip para status
export const StatusTooltip = ({ status, children, ...props }) => {
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return {
          text: 'Chamado em aberto',
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20'
        }
      case 'closed':
        return {
          text: 'Chamado fechado',
          color: 'text-green-400',
          bg: 'bg-green-500/20'
        }
      case 'pending':
        return {
          text: 'Chamado pendente',
          color: 'text-blue-400',
          bg: 'bg-blue-500/20'
        }
      default:
        return {
          text: 'Status desconhecido',
          color: 'text-gray-400',
          bg: 'bg-gray-500/20'
        }
    }
  }

  const statusInfo = getStatusInfo(status)

  return (
    <Tooltip 
      content={
        <div className="text-center">
          <div className={`inline-flex items-center px-2 py-1 rounded ${statusInfo.bg}`}>
            <span className={`text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>
      } 
      {...props}
    >
      {children}
    </Tooltip>
  )
}

export default Tooltip
