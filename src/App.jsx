import React, { useState, useEffect } from 'react'
import CSVUploader from './components/CSVUploader'
import Dashboard from './components/Dashboard'
import Header from './components/Header'
import { useNotifications, NotificationContainer } from './components/Notification'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const [data, setData] = useState(null)
  const [columns, setColumns] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { notifications, addNotification, removeNotification } = useNotifications()

  const handleDataLoaded = (parsedData, columnNames) => {
    setIsLoading(true)
    
    // Simular carregamento para mostrar animações
    setTimeout(() => {
      setData(parsedData)
      setColumns(columnNames)
      setIsLoading(false)
      
      addNotification({
        type: 'success',
        title: 'Dados Carregados!',
        message: `${parsedData.length} registros foram carregados com sucesso.`,
        duration: 3000
      })
    }, 1500)
  }

  const handleReset = () => {
    setData(null)
    setColumns([])
    addNotification({
      type: 'info',
      title: 'Dashboard Resetado',
      message: 'Você pode carregar um novo arquivo CSV.',
      duration: 2000
    })
  }

  // Efeito para aplicar tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard-theme') || 'dark'
    const root = document.documentElement
    const body = document.body
    
    if (savedTheme === 'light') {
      root.classList.add('light')
      body.classList.add('light')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header onHomeClick={handleReset} />
      
      <main className="container-responsive py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner 
              size="xl" 
              text="Processando dados..." 
              variant="primary" 
            />
          </div>
        ) : !data ? (
          <div className="animate-fade-in">
            <CSVUploader onDataLoaded={handleDataLoaded} />
          </div>
        ) : (
          <div className="animate-slide-up">
            <Dashboard 
              data={data} 
              columns={columns} 
              onReset={handleReset} 
            />
          </div>
        )}
      </main>

      {/* Sistema de Notificações */}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />

      {/* Botão flutuante de ajuda */}
      <button 
        className="btn-floating"
        title="Ajuda"
        onClick={() => {
          addNotification({
            type: 'info',
            title: 'Ajuda',
            message: 'Use os controles no topo para navegar entre as diferentes visualizações.',
            duration: 5000
          })
        }}
      >
        ?
      </button>
    </div>
  )
}

export default App 