import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Search, Filter, Clock, AlertTriangle, Eye } from 'lucide-react'
import TicketDetails from './TicketDetails'

// filterMode: 'none' | 'open' | 'all' | 'slaMet' | 'slaExceeded'
const TicketTable = ({ data, filterMode = 'none' }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const itemsPerPage = 15

  useEffect(() => {
    setCurrentPage(1)
  }, [filterMode])

  // Filtrar dados
  const filteredData = data.filter(ticket => {
    const matchesSearch = Object.values(ticket).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    const isOpen = ticket.Status !== 'Solucionado' && ticket.Status !== 'Fechado'
    const isSlaExceeded = ticket['Tempo para resolver excedido'] === 'Sim'
    const matchesByMode = (() => {
      switch (filterMode) {
        case 'open':
          return isOpen
        case 'all':
          return true
        case 'slaMet':
          return !isSlaExceeded
        case 'slaExceeded':
          return isSlaExceeded
        default:
          return statusFilter === 'all' || ticket.Status === statusFilter
      }
    })()

    const matchesStatus = matchesByMode
    const matchesPriority = priorityFilter === 'all' || ticket.Prioridade === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Ordenar dados
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0
    
    let aValue = a[sortColumn] || ''
    let bValue = b[sortColumn] || ''
    
    // Tratamento especial para datas
    if (sortColumn === 'Data de abertura') {
      aValue = new Date(aValue.split(' ')[0].split('/').reverse().join('-'))
      bValue = new Date(bValue.split(' ')[0].split('/').reverse().join('-'))
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Paginação
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = sortedData.slice(startIndex, endIndex)

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket)
    setIsDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setSelectedTicket(null)
  }

  const handleEvaluate = (ticketId, evaluation, comment) => {
    // Aqui você pode implementar a lógica para salvar a avaliação
    console.log('Avaliação:', { ticketId, evaluation, comment })
    
    // Exemplo de como você poderia salvar em localStorage
    const evaluations = JSON.parse(localStorage.getItem('ticketEvaluations') || '{}')
    evaluations[ticketId] = {
      evaluation,
      comment,
      date: new Date().toISOString()
    }
    localStorage.setItem('ticketEvaluations', JSON.stringify(evaluations))
    
    // Mostrar feedback ao usuário
    alert(`Avaliação ${evaluation === 'positive' ? 'positiva' : 'negativa'} registrada para o chamado #${ticketId}`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Solucionado':
        return 'bg-green-900/20 text-green-400'
      case 'Fechado':
        return 'bg-gray-700 text-gray-300'
      case 'Em andamento':
        return 'bg-blue-900/20 text-blue-400'
      default:
        return 'bg-yellow-900/20 text-yellow-400'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-900/20 text-red-400'
      case 'Média':
        return 'bg-yellow-900/20 text-yellow-400'
      case 'Baixa':
        return 'bg-green-900/20 text-green-400'
      default:
        return 'bg-gray-700 text-gray-300'
    }
  }

  const getSLAStatus = (ticket) => {
    const exceeded = ticket['Tempo para resolver excedido'] === 'Sim'
    return exceeded ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-900/20 text-red-400 rounded-full text-xs">
        <AlertTriangle className="h-3 w-3" />
        SLA Excedido
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/20 text-green-400 rounded-full text-xs">
        <Clock className="h-3 w-3" />
        No Prazo
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controles da tabela */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar nos chamados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="Solucionado">Solucionado</option>
              <option value="Fechado">Fechado</option>
              <option value="Em andamento">Em andamento</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>
        </div>
        
        <div className="text-sm text-gray-400">
          Mostrando {startIndex + 1}-{Math.min(endIndex, sortedData.length)} de {sortedData.length} chamados
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th
                onClick={() => handleSort('ID')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
              >
                ID
                {sortColumn === 'ID' && (
                  <span className="text-blue-400 ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort('Título')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
              >
                Título
                {sortColumn === 'Título' && (
                  <span className="text-blue-400 ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Prioridade
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Requerente
              </th>
              <th
                onClick={() => handleSort('Data de abertura')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
              >
                Data Abertura
                {sortColumn === 'Data de abertura' && (
                  <span className="text-blue-400 ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                SLA
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {currentData.map((ticket, index) => (
              <tr key={index} className="hover:bg-gray-800">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {ticket.ID}
                </td>
                <td className="px-4 py-4 text-sm text-gray-300 max-w-xs truncate">
                  {ticket.Título}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.Status)}`}>
                    {ticket.Status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.Prioridade)}`}>
                    {ticket.Prioridade}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-300 max-w-xs truncate">
                  {ticket['Requerente - Requerente']}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                  {ticket['Data de abertura']}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getSLAStatus(ticket)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleViewDetails(ticket)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-900/20 text-blue-400 rounded-lg hover:bg-blue-800/30 transition-colors text-sm"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Ver</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Página {currentPage} de {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              )
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
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

export default TicketTable 