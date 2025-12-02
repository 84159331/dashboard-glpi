import React, { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Search, Filter, Clock, AlertTriangle, Eye, Download, User, Tag, Calendar, TrendingUp, Info, Table, Sparkles, BarChart3 } from 'lucide-react'
import TicketDetails from './TicketDetails'

// filterMode: 'none' | 'open' | 'all' | 'slaMet' | 'slaExceeded'
const TicketTable = ({ data, filterMode = 'none', initialSearchTerm = '' }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [technicianFilter, setTechnicianFilter] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const itemsPerPage = 50

  useEffect(() => {
    setCurrentPage(1)
  }, [filterMode])

  useEffect(() => {
    if (typeof initialSearchTerm === 'string') {
      setSearchTerm(initialSearchTerm)
      setCurrentPage(1)
    }
  }, [initialSearchTerm])

  // Obter lista única de técnicos para filtro
  const technicians = useMemo(() => {
    const techSet = new Set()
    data.forEach(ticket => {
      const tech = ticket['Técnico responsável'] || ticket['Atribuído - Técnico']
      if (tech) techSet.add(tech)
    })
    return Array.from(techSet).sort()
  }, [data])

  const filteredData = data.filter(ticket => {
    const matchesSearch = Object.values(ticket).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    const isOpen = ticket.Status !== 'Solucionado' && ticket.Status !== 'Fechado'
    const isSlaExceeded = ticket['Tempo para resolver excedido'] === 'Sim'
    const technician = ticket['Técnico responsável'] || ticket['Atribuído - Técnico'] || 'Não atribuído'
    
    // Filtro por data
    const ticketDate = ticket['Data de abertura']
    const matchesDate = (() => {
      if (dateFilter === 'all') return true
      if (!ticketDate) return false
      
      const date = new Date(ticketDate.split(' ')[0].split('/').reverse().join('-'))
      const now = new Date()
      
      switch (dateFilter) {
        case 'today':
          return date.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return date >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          return date >= monthAgo
        default:
          return true
      }
    })()
    
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
    const matchesTechnician = technicianFilter === 'all' || technician === technicianFilter
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDate && matchesTechnician
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
    if (!ticket) {
      console.error('Ticket não encontrado')
      return
    }
    
    // Tentar encontrar o ticket completo no array original de dados
    const fullTicket = data.find(t => t.ID === ticket.ID || t.id === ticket.ID || t['ID'] === ticket.ID) || ticket
    
    // Garantir que estamos passando uma cópia completa do objeto ticket com todos os campos
    const ticketCopy = { ...fullTicket }
    
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

  const handleExportData = () => {
    setIsExporting(true)
    
    // Simular processamento
    setTimeout(() => {
      const csvContent = [
        Object.keys(filteredData[0] || {}).join(';'),
        ...filteredData.map(row => 
          Object.values(row).map(val => `"${val || ''}"`).join(';')
        )
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `chamados_filtrados_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setIsExporting(false)
    }, 1000)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Solucionado':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Fechado':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      case 'Em andamento':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'Média':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Baixa':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  // Função para formatar tempo
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A'
    const hoursMatch = timeStr.match(/(\d+)\s*hora/)
    const minutesMatch = timeStr.match(/(\d+)\s*minuto/)
    if (hoursMatch && minutesMatch) {
      return `${hoursMatch[1]}h ${minutesMatch[1]}min`
    } else if (hoursMatch) {
      return `${hoursMatch[1]}h`
    } else if (minutesMatch) {
      return `${minutesMatch[1]}min`
    }
    return timeStr
  }

  // Função para calcular tempo decorrido
  const getTimeElapsed = (dateStr) => {
    if (!dateStr) return null
    try {
      const [day, month, year] = dateStr.split(' ')[0].split('/')
      const date = new Date(Number(year), Number(month) - 1, Number(day))
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Hoje'
      if (diffDays === 1) return 'Ontem'
      if (diffDays < 7) return `${diffDays} dias`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem`
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`
      return `${Math.floor(diffDays / 365)} anos`
    } catch {
      return null
    }
  }

  const getSLAStatus = (ticket) => {
    const exceeded = ticket['Tempo para resolver excedido'] === 'Sim'
    const timeToResolve = ticket['Tempo para solução'] || ''
    
    return (
      <div className="flex flex-col gap-1">
        {exceeded ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-900/30 text-red-400 rounded-full text-xs font-semibold border border-red-500/30">
            <AlertTriangle className="h-3 w-3" />
            Excedido
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">
            <Clock className="h-3 w-3" />
            No Prazo
          </span>
        )}
        {timeToResolve && (
          <span className="text-xs text-gray-500" title={timeToResolve}>
            {formatTime(timeToResolve)}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Modernizado */}
      <div className="bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-cyan-500/30 shadow-glow">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg">
              <Table className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Tabela de Chamados
            </h3>
          </div>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
            Visualize, filtre e analise todos os chamados com busca avançada e múltiplos filtros
          </p>
          {sortedData.length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>{sortedData.length.toLocaleString('pt-BR')} chamados encontrados</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                <span>{Math.ceil(sortedData.length / itemsPerPage)} página{Math.ceil(sortedData.length / itemsPerPage) !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resumo de Filtros */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 mb-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-300">Total:</span>
            <span className="text-white font-semibold">{sortedData.length.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-300">No Prazo:</span>
            <span className="text-green-400 font-semibold">
              {sortedData.filter(t => t['Tempo para resolver excedido'] !== 'Sim').length.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-300">Excedidos:</span>
            <span className="text-red-400 font-semibold">
              {sortedData.filter(t => t['Tempo para resolver excedido'] === 'Sim').length.toLocaleString('pt-BR')}
            </span>
          </div>
          {(statusFilter !== 'all' || priorityFilter !== 'all' || dateFilter !== 'all' || technicianFilter !== 'all') && (
            <button
              onClick={() => {
                setStatusFilter('all')
                setPriorityFilter('all')
                setDateFilter('all')
                setTechnicianFilter('all')
                setSearchTerm('')
              }}
              className="ml-auto text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Controles da tabela */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar em todos os campos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-700 transition-colors"
            >
              <option value="all">📊 Todos os Status</option>
              <option value="Solucionado">✅ Solucionado</option>
              <option value="Fechado">🔒 Fechado</option>
              <option value="Em andamento">⚙️ Em andamento</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-700 transition-colors"
            >
              <option value="all">🎯 Todas as Prioridades</option>
              <option value="Alta">🔴 Alta</option>
              <option value="Média">🟡 Média</option>
              <option value="Baixa">🟢 Baixa</option>
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-700 transition-colors"
            >
              <option value="all">📅 Todas as Datas</option>
              <option value="today">📆 Hoje</option>
              <option value="week">📆 Última Semana</option>
              <option value="month">📆 Último Mês</option>
            </select>
            
            <select
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-700 transition-colors min-w-[150px]"
            >
              <option value="all">👤 Todos os Técnicos</option>
              {technicians.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            Mostrando {startIndex + 1}-{Math.min(endIndex, sortedData.length)} de {sortedData.length} chamados
          </div>
          <button
            onClick={handleExportData}
            disabled={isExporting || filteredData.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exportar CSV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visualização em Cards (Mobile/Tablet) */}
      <div className="lg:hidden space-y-3">
        {currentData.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <Filter className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">Nenhum chamado encontrado</p>
            <p className="text-gray-500 text-sm">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          currentData.map((ticket, index) => {
            const timeElapsed = getTimeElapsed(ticket['Data de abertura'])
            const technician = ticket['Técnico responsável'] || ticket['Atribuído - Técnico'] || 'Não atribuído'
            const category = ticket.Categoria || ticket['Motivo'] || 'Não categorizado'
            
            return (
              <div
                key={index}
                className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-4 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-blue-400">#{ticket.ID}</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded border ${getStatusColor(ticket.Status)}`}>
                          {ticket.Status}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded border ${getPriorityColor(ticket.Prioridade)}`}>
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
                
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-900/20 text-purple-300 rounded text-xs font-medium border border-purple-500/20">
                    <Tag className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">{category}</span>
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <User className="h-3 w-3" />
                    <span className="truncate max-w-[100px]" title={technician}>{technician}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>{ticket['Data de abertura']?.split(' ')[0] || 'N/A'}</span>
                  </div>
                  {getSLAStatus(ticket)}
                </div>
                
                <div className="flex justify-end pt-2 border-t border-gray-700/50">
                  <button
                    onClick={() => handleViewDetails(ticket)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 hover:text-blue-300 transition-all duration-200 text-sm font-medium border border-blue-500/20"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Detalhes</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Tabela Desktop (oculta em mobile) */}
      <div className="hidden lg:block overflow-hidden rounded-lg border border-gray-700/50 shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700/50">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-800/80 backdrop-blur-sm">
              <tr>
                <th
                  onClick={() => handleSort('ID')}
                  className="px-3 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>#</span>
                    {sortColumn === 'ID' && (
                      <span className="text-blue-400 text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Título')}
                  className="px-3 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Título</span>
                    {sortColumn === 'Título' && (
                      <span className="text-blue-400 text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    <span>Info</span>
                  </div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>Responsável</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Data de abertura')}
                  className="px-3 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Data/SLA</span>
                    {sortColumn === 'Data de abertura' && (
                      <span className="text-blue-400 text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900/50 divide-y divide-gray-700/30">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Filter className="h-12 w-12 text-gray-600" />
                      <p className="text-gray-400 font-medium">Nenhum chamado encontrado</p>
                      <p className="text-gray-500 text-sm">Tente ajustar os filtros de busca</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((ticket, index) => {
                  const timeElapsed = getTimeElapsed(ticket['Data de abertura'])
                  const technician = ticket['Técnico responsável'] || ticket['Atribuído - Técnico'] || 'Não atribuído'
                  const category = ticket.Categoria || ticket['Motivo'] || 'Não categorizado'
                  
                  return (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-800/50 transition-colors group border-b border-gray-700/30"
                    >
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-bold text-blue-400">
                        #{ticket.ID}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-200">
                        <div className="flex flex-col gap-1 max-w-xs">
                          <span className="font-medium text-white truncate" title={ticket.Título}>
                            {ticket.Título}
                          </span>
                          {ticket['Requerente - Requerente'] && (
                            <span className="text-xs text-gray-500 truncate">
                              Por: {ticket['Requerente - Requerente']}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex flex-wrap gap-1">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold rounded border ${getStatusColor(ticket.Status)}`}>
                              {ticket.Status}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold rounded border ${getPriorityColor(ticket.Prioridade)}`}>
                              {ticket.Prioridade}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-900/20 text-purple-300 rounded text-xs font-medium border border-purple-500/20 max-w-fit">
                            <Tag className="h-2.5 w-2.5" />
                            <span className="truncate max-w-[150px]" title={category}>
                              {category}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-300 truncate max-w-[140px]" title={technician}>
                            {technician}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-300">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="whitespace-nowrap">{ticket['Data de abertura']?.split(' ')[0] || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {getSLAStatus(ticket)}
                          </div>
                          {timeElapsed && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <TrendingUp className="h-2.5 w-2.5" />
                              {timeElapsed}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleViewDetails(ticket)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 hover:text-blue-300 transition-all duration-200 text-xs font-medium border border-blue-500/20 hover:border-blue-500/40 hover:scale-105 active:scale-95 mx-auto"
                          title="Ver detalhes completos"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden xl:inline">Detalhes</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
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