import React, { useState, useMemo } from 'react'
import { FolderOpen, TrendingUp, TrendingDown, Clock, Users, Star, Award, Target, X, Sparkles, BarChart3 } from 'lucide-react'
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
    if (!ticket) {
      console.error('Ticket não encontrado')
      return
    }
    
    // Garantir que estamos passando uma cópia completa do objeto ticket com todos os campos
    const ticketCopy = { ...ticket }
    
    console.log('Abrindo detalhes do ticket ID:', ticketCopy.ID || ticketCopy.id)
    console.log('Ticket completo:', ticketCopy)
    console.log('Campos do ticket:', Object.keys(ticketCopy))
    
    setSelectedTicket(ticketCopy)
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
    <div className="space-y-6 animate-fade-in">
      {/* Header Modernizado */}
      <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-purple-500/30 shadow-glow">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <FolderOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Análise por Categoria
            </h3>
          </div>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
            Clique em uma categoria para analisar os chamados detalhadamente e avaliar as soluções implementadas
          </p>
          {categoryStats.length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>{categoryStats.length} categorias disponíveis</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-pink-400" />
                <span>{categoryStats.reduce((sum, cat) => sum + cat.total, 0)} chamados no total</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cards de Categorias Modernizados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {categoryStats.map((category, index) => {
          const colors = [
            'from-blue-600/20 to-cyan-600/20 border-blue-500/30',
            'from-purple-600/20 to-pink-600/20 border-purple-500/30',
            'from-orange-600/20 to-red-600/20 border-orange-500/30',
            'from-green-600/20 to-emerald-600/20 border-green-500/30',
            'from-indigo-600/20 to-blue-600/20 border-indigo-500/30',
            'from-pink-600/20 to-rose-600/20 border-pink-500/30',
          ]
          const colorClass = colors[index % colors.length]
          const isSelected = selectedCategory === category.name
          
          return (
            <div 
              key={category.name}
              className={`relative bg-gradient-to-br ${colorClass} backdrop-blur-sm rounded-xl p-5 md:p-6 border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow ${
                isSelected ? 'ring-2 ring-purple-400 ring-opacity-50 shadow-xl' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedCategory(isSelected ? null : category.name)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Badge de Ranking */}
              <div className="absolute top-3 right-3">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg">
                  #{index + 1}
                </div>
              </div>

              {/* Header do Card */}
              <div className="mb-5 pr-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <FolderOpen className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-base md:text-lg leading-tight">
                    {category.name.length > 25 
                      ? category.name.substring(0, 25) + '...' 
                      : category.name
                    }
                  </h4>
                </div>
              </div>

              {/* Métricas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-sm text-gray-300">Total:</span>
                  </div>
                  <span className="font-bold text-white text-lg">{category.total}</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-sm text-gray-300">Resolvidos:</span>
                  </div>
                  <span className="font-bold text-green-400 text-lg">{category.resolved}</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-sm text-gray-300">Taxa:</span>
                  </div>
                  <span className="font-bold text-blue-400 text-lg">{category.resolutionRate}%</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Award className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-sm text-gray-300">SLA:</span>
                  </div>
                  <span className={`font-bold text-lg ${
                    parseFloat(category.slaCompliance) >= 90 ? 'text-green-400' :
                    parseFloat(category.slaCompliance) >= 70 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {category.slaCompliance}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-sm text-gray-300">Tempo Médio:</span>
                  </div>
                  <span className="font-bold text-purple-400 text-lg">
                    {formatTime(category.avgResolutionTime)}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="mt-5 pt-5 border-t border-white/10 animate-slide-down">
                  <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    Chamados Recentes
                  </h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {category.tickets.slice(0, 5).map((ticket, ticketIndex) => (
                      <div 
                        key={ticketIndex}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 backdrop-blur-sm border border-white/5"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            <span className="text-purple-400 font-bold">#{ticket.ID}</span> - {ticket.Título}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {ticket.Status} • {ticket.Prioridade}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewTicket(ticket)
                          }}
                          className="ml-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 active:scale-95 font-semibold shadow-md"
                        >
                          Ver
                        </button>
                      </div>
                    ))}
                  </div>
                  {category.tickets.length > 5 && (
                    <p className="text-xs text-gray-400 mt-3 text-center font-medium">
                      +{category.tickets.length - 5} mais chamados disponíveis
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lista Detalhada da Categoria Selecionada */}
      {selectedCategory && (
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-purple-500/30 shadow-xl animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-purple-500/20">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Chamados da Categoria
              </h3>
              <p className="text-lg text-white font-semibold">{selectedCategory}</p>
              {(() => {
                const selectedCat = categoryStats.find(cat => cat.name === selectedCategory)
                return selectedCat && (
                  <p className="text-sm text-gray-400 mt-1">
                    {selectedCat.total} chamado{selectedCat.total !== 1 ? 's' : ''} encontrado{selectedCat.total !== 1 ? 's' : ''}
                  </p>
                )
              })()}
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 border border-gray-600/50"
            >
              <X className="h-4 w-4" />
              <span className="font-medium">Fechar</span>
            </button>
          </div>

          {/* Visualização em Cards (Mobile/Tablet) */}
          <div className="lg:hidden space-y-3">
            {categoryStats
              .find(cat => cat.name === selectedCategory)
              ?.tickets.map((ticket, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-4 hover:border-purple-500/40 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">#{ticket.ID}</span>
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${
                            ticket.Status === 'Solucionado' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            ticket.Status === 'Fechado' ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' :
                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}>
                            {ticket.Status}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${
                            ticket.Prioridade === 'Alta' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            ticket.Prioridade === 'Média' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-green-500/20 text-green-400 border-green-500/30'
                          }`}>
                            {ticket.Prioridade}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-medium text-white mb-1 line-clamp-2">{ticket.Título}</h3>
                      {ticket['Requerente - Requerente'] && (
                        <p className="text-xs text-gray-400 truncate">
                          Por: {ticket['Requerente - Requerente']}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-xs text-gray-400">
                      {ticket['Data de abertura']}
                    </span>
                    <button
                      onClick={() => handleViewTicket(ticket)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 active:scale-95 text-sm font-semibold shadow-md"
                    >
                      <Star className="h-4 w-4" />
                      <span>Analisar</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Tabela Desktop Modernizada */}
          <div className="hidden lg:block overflow-hidden rounded-lg border border-purple-500/20">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-purple-500/20">
                <thead className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-wider">#</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-wider">Título</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-wider">Status/Prioridade</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-wider">Requerente</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-wider">Data</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-purple-300 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/50 divide-y divide-purple-500/10">
                  {categoryStats
                    .find(cat => cat.name === selectedCategory)
                    ?.tickets.map((ticket, index) => (
                      <tr key={index} className="hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-pink-600/10 transition-all duration-200">
                        <td className="px-4 py-4 text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          #{ticket.ID}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="max-w-xs">
                            <span className="font-medium text-white truncate block" title={ticket.Título}>
                              {ticket.Título}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                              ticket.Status === 'Solucionado' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              ticket.Status === 'Fechado' ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' :
                              'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}>
                              {ticket.Status}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                              ticket.Prioridade === 'Alta' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              ticket.Prioridade === 'Média' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              'bg-green-500/20 text-green-400 border-green-500/30'
                            }`}>
                              {ticket.Prioridade}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-300">
                          <span className="truncate max-w-[150px] block" title={ticket['Requerente - Requerente']}>
                            {ticket['Requerente - Requerente']}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-300 whitespace-nowrap">
                          {ticket['Data de abertura']?.split(' ')[0] || ticket['Data de abertura']}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleViewTicket(ticket)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 active:scale-95 text-sm font-semibold shadow-md mx-auto"
                          >
                            <Star className="h-4 w-4" />
                            <span className="hidden xl:inline">Analisar</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
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