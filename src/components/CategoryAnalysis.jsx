import React, { useState, useMemo } from 'react'
import { FolderOpen, TrendingUp, TrendingDown, Clock, Users, Star } from 'lucide-react'
import TicketDetails from './TicketDetails'

const CategoryAnalysis = ({ data }) => {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const categoryStats = useMemo(() => {
    if (!data || data.length === 0) return []

    const stats = data.reduce((acc, ticket) => {
      const category = ticket.Categoria || 'Não categorizado'
      
      if (!acc[category]) {
        acc[category] = {
          name: category,
          total: 0,
          resolved: 0,
          open: 0,
          avgResolutionTime: 0,
          slaExceeded: 0,
          tickets: []
        }
      }
      
      acc[category].total++
      acc[category].tickets.push(ticket)
      
      if (ticket.Status === 'Solucionado' || ticket.Status === 'Fechado') {
        acc[category].resolved++
      } else {
        acc[category].open++
      }
      
      if (ticket['Tempo para resolver excedido'] === 'Sim') {
        acc[category].slaExceeded++
      }
      
      return acc
    }, {})

    // Calcular tempo médio de resolução para cada categoria
    Object.values(stats).forEach(category => {
      const resolutionTimes = category.tickets
        .filter(ticket => ticket['Tempo para solução'])
        .map(ticket => {
          const timeStr = ticket['Tempo para solução']
          const hoursMatch = timeStr.match(/(\d+)\s*hora/)
          const minutesMatch = timeStr.match(/(\d+)\s*minuto/)
          const secondsMatch = timeStr.match(/(\d+)\s*segundo/)
          
          let totalMinutes = 0
          if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60
          if (minutesMatch) totalMinutes += parseInt(minutesMatch[1])
          if (secondsMatch) totalMinutes += parseInt(secondsMatch[1]) / 60
          
          return totalMinutes
        })
        .filter(time => time > 0)

      category.avgResolutionTime = resolutionTimes.length > 0 
        ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length 
        : 0
    })

    return Object.values(stats)
      .sort((a, b) => b.total - a.total)
      .map(category => ({
        ...category,
        resolutionRate: category.total > 0 
          ? ((category.resolved / category.total) * 100).toFixed(1)
          : 0,
        slaCompliance: category.total > 0 
          ? (((category.total - category.slaExceeded) / category.total) * 100).toFixed(1)
          : 100
      }))
  }, [data])

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket)
    setIsDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setSelectedTicket(null)
  }

  const handleEvaluate = (ticketId, evaluation, comment) => {
    console.log('Avaliação:', { ticketId, evaluation, comment })
    
    const evaluations = JSON.parse(localStorage.getItem('ticketEvaluations') || '{}')
    evaluations[ticketId] = {
      evaluation,
      comment,
      date: new Date().toISOString()
    }
    localStorage.setItem('ticketEvaluations', JSON.stringify(evaluations))
    
    alert(`Avaliação ${evaluation === 'positive' ? 'positiva' : 'negativa'} registrada para o chamado #${ticketId}`)
  }

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = Math.round(minutes % 60)
      return `${hours}h ${mins}min`
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Análise por Categoria
        </h3>
        <p className="text-gray-600">
          Clique em uma categoria para analisar os chamados e avaliar as soluções
        </p>
      </div>

      {/* Cards de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryStats.map((category, index) => (
          <div 
            key={category.name}
            className="dashboard-card cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FolderOpen className="h-5 w-5 text-primary-600" />
                <h4 className="font-semibold text-gray-900">
                  {category.name.length > 30 
                    ? category.name.substring(0, 30) + '...' 
                    : category.name
                  }
                </h4>
              </div>
              <span className="text-sm text-gray-500">#{index + 1}</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total:</span>
                <span className="font-semibold text-gray-900">{category.total}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Resolvidos:</span>
                <span className="font-semibold text-green-600">{category.resolved}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Taxa Resolução:</span>
                <span className="font-semibold text-blue-600">{category.resolutionRate}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SLA Compliance:</span>
                <span className="font-semibold text-indigo-600">{category.slaCompliance}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tempo Médio:</span>
                <span className="font-semibold text-purple-600">
                  {formatTime(category.avgResolutionTime)}
                </span>
              </div>
            </div>

            {selectedCategory === category.name && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-gray-900 mb-3">Chamados Recentes</h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {category.tickets.slice(0, 5).map((ticket, ticketIndex) => (
                    <div 
                      key={ticketIndex}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          #{ticket.ID} - {ticket.Título}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ticket.Status} • {ticket.Prioridade}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewTicket(ticket)
                        }}
                        className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs hover:bg-primary-200 transition-colors"
                      >
                        Ver
                      </button>
                    </div>
                  ))}
                </div>
                {category.tickets.length > 5 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    +{category.tickets.length - 5} mais chamados
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lista Detalhada da Categoria Selecionada */}
      {selectedCategory && (
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Chamados da Categoria: {selectedCategory}
            </h3>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Fechar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requerente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryStats
                  .find(cat => cat.name === selectedCategory)
                  ?.tickets.map((ticket, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {ticket.ID}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {ticket.Título}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ticket.Status === 'Solucionado' ? 'bg-green-100 text-green-800' :
                          ticket.Status === 'Fechado' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {ticket.Status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ticket.Prioridade === 'Alta' ? 'bg-red-100 text-red-800' :
                          ticket.Prioridade === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {ticket.Prioridade}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {ticket['Requerente - Requerente']}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {ticket['Data de abertura']}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleViewTicket(ticket)}
                          className="flex items-center space-x-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm"
                        >
                          <Star className="h-3 w-3" />
                          <span>Analisar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      <TicketDetails
        ticket={selectedTicket}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        onEvaluate={handleEvaluate}
      />
    </div>
  )
}

export default CategoryAnalysis 