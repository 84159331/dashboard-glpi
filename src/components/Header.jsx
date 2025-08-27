import React, { useEffect, useState } from 'react'
import { ArrowLeft, BarChart3, Database, Headphones, Activity, Bell, Settings } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const Header = ({ onHomeClick, onViewChange, currentView }) => {
  const [now, setNow] = useState(new Date())
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    setIsVisible(true)
    return () => clearInterval(id)
  }, [])

  return (
    <header className={`
      bg-gradient-to-r from-gray-800/95 to-gray-900/95 backdrop-blur-md 
      shadow-large border-b border-gray-700/50 sticky top-0 z-40
      transition-all duration-500 ${isVisible ? 'animate-slide-down' : 'opacity-0'}
    `}>
      <div className="container-responsive py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-glow">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800 animate-pulse"></div>
                </div>
                <div className="text-left">
                  <button 
                    onClick={onHomeClick} 
                    className="text-xl font-bold text-gradient hover:scale-105 transition-transform duration-300"
                  >
                    JADNEY RANES
                  </button>
                  <p className="text-sm text-gray-400 font-medium">DASHBOARD CHAMADOS GLPI</p>
                </div>
              </div>
            </div>
            
            {/* Separador */}
            <div className="hidden md:block w-px h-8 bg-gradient-to-b from-transparent via-gray-600 to-transparent"></div>
            
            <div className="flex items-center space-x-3">
              <ArrowLeft className="h-6 w-6 text-gray-400" />
              <button 
                onClick={() => onViewChange('upload')}
                className={`text-2xl font-bold transition-colors duration-300 ${
                  currentView === 'upload' ? 'text-blue-400' : 'text-white hover:text-blue-400'
                }`}
              >
                SLA de Atendimento
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Database className="h-6 w-6 text-gray-400" />
              <button 
                onClick={() => onViewChange('integration')}
                className={`text-lg font-bold transition-colors duration-300 ${
                  currentView === 'integration' ? 'text-blue-400' : 'text-white hover:text-blue-400'
                }`}
              >
                Integração Coreplan
              </button>
            </div>
          </div>

          {/* Controles do lado direito */}
          <div className="flex items-center space-x-4">
            {/* Indicadores de status */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-400/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-300 font-medium">Sistema Online</span>
              </div>
              
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
                <Database className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-300 font-medium">GLPI Conectado</span>
              </div>
            </div>

            {/* Data e Hora */}
            <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600/50">
              <Activity className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300 font-mono">
                {now.toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>

            {/* Botões de ação */}
            <div className="flex items-center space-x-2">
              <button className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg border border-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-105">
                <Bell className="h-5 w-5" />
              </button>
              
              <button className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg border border-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-105">
                <Settings className="h-5 w-5" />
              </button>
              
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Barra de progresso sutil */}
        <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-20"></div>
      </div>
    </header>
  )
}

export default Header 