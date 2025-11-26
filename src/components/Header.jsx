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
      <div className="container-responsive py-3 md:py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Logo e Título */}
          <div className="flex items-center space-x-3 md:space-x-6 w-full md:w-auto">
            <div className="flex items-center space-x-2 md:space-x-3 flex-1 md:flex-none">
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-glow">
                  <BarChart3 className="h-5 w-5 md:h-7 md:w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-gray-800 animate-pulse"></div>
              </div>
              <div className="text-left min-w-0">
                <button 
                  onClick={onHomeClick} 
                  className="text-lg md:text-xl font-bold text-gradient hover:scale-105 transition-transform duration-300 truncate block"
                >
                  JADNEY RANES
                </button>
                <p className="text-xs md:text-sm text-gray-400 font-medium hidden sm:block">DASHBOARD CHAMADOS GLPI</p>
                <p className="text-xs text-gray-400 font-medium sm:hidden">GLPI</p>
              </div>
            </div>
            
            {/* Separador */}
            <div className="hidden lg:block w-px h-8 bg-gradient-to-b from-transparent via-gray-600 to-transparent"></div>
            
            {/* Navegação Desktop */}
            <div className="hidden lg:flex items-center space-x-3">
              <ArrowLeft className="h-5 w-5 text-gray-400" />
              <button 
                onClick={() => onViewChange('upload')}
                className={`text-lg md:text-xl font-bold transition-colors duration-300 whitespace-nowrap ${
                  currentView === 'upload' ? 'text-blue-400' : 'text-white hover:text-blue-400'
                }`}
              >
                SLA de Atendimento
              </button>
            </div>
            
            <div className="hidden lg:flex items-center space-x-3">
              <Database className="h-5 w-5 text-gray-400" />
              <button 
                onClick={() => onViewChange('integration')}
                className={`text-base md:text-lg font-bold transition-colors duration-300 whitespace-nowrap ${
                  currentView === 'integration' ? 'text-blue-400' : 'text-white hover:text-blue-400'
                }`}
              >
                Integração GLPI
              </button>
            </div>
          </div>
          
          {/* Menu Mobile */}
          <div className="lg:hidden flex items-center space-x-2 w-full md:w-auto justify-between">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onViewChange('upload')}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  currentView === 'upload' 
                    ? 'bg-blue-600 text-white shadow-glow' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                SLA
              </button>
              <button 
                onClick={() => onViewChange('integration')}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  currentView === 'integration' 
                    ? 'bg-blue-600 text-white shadow-glow' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                GLPI
              </button>
            </div>
          </div>

          {/* Controles do lado direito */}
          <div className="flex items-center space-x-2 md:space-x-4 w-full md:w-auto justify-end">
            {/* Indicadores de status */}
            <div className="hidden xl:flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 px-2 py-1.5 bg-green-500/20 rounded-lg border border-green-400/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-300 font-medium hidden 2xl:inline">Sistema Online</span>
              </div>
              
              <div className="flex items-center space-x-1.5 px-2 py-1.5 bg-blue-500/20 rounded-lg border border-blue-400/30">
                <Database className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs text-blue-300 font-medium hidden 2xl:inline">GLPI Conectado</span>
              </div>
            </div>

            {/* Data e Hora */}
            <div className="hidden lg:flex items-center space-x-2 px-2 md:px-3 py-1.5 bg-gray-700/50 rounded-lg border border-gray-600/50">
              <Activity className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" />
              <span className="text-xs md:text-sm text-gray-300 font-mono">
                {now.toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>

            {/* Botões de ação */}
            <div className="flex items-center space-x-1.5 md:space-x-2">
              <button 
                className="w-9 h-9 md:w-10 md:h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg border border-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-105"
                title="Notificações"
                aria-label="Notificações"
              >
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
              </button>
              
              <button 
                className="w-9 h-9 md:w-10 md:h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg border border-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-105"
                title="Configurações"
                aria-label="Configurações"
              >
                <Settings className="h-4 w-4 md:h-5 md:w-5" />
              </button>
              
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Barra de progresso sutil */}
        <div className="hidden md:block mt-3 md:mt-4 h-0.5 md:h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-20"></div>
      </div>
    </header>
  )
}

export default Header 