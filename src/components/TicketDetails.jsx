import React, { useState, useMemo } from 'react'
import { X, ThumbsUp, ThumbsDown, Clock, User, Tag, MessageSquare, Star, AlertTriangle, TrendingUp, TrendingDown, Target, Timer, CheckCircle2, XCircle } from 'lucide-react'

const TicketDetails = ({ ticket, isOpen, onClose, onEvaluate }) => {
  const [evaluation, setEvaluation] = useState(null)
  const [comment, setComment] = useState('')
  const [starRating, setStarRating] = useState(0)
  const [starHover, setStarHover] = useState(null)
  const [starComment, setStarComment] = useState('')

  // Funções auxiliares (definidas fora dos hooks mas usadas dentro)
  // Função para converter tempo em minutos
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0
    
    const hoursMatch = timeStr.match(/(\d+)\s*hora/)
    const minutesMatch = timeStr.match(/(\d+)\s*minuto/)
    const secondsMatch = timeStr.match(/(\d+)\s*segundo/)
    
    let totalMinutes = 0
    if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60
    if (minutesMatch) totalMinutes += parseInt(minutesMatch[1])
    if (secondsMatch) totalMinutes += parseInt(secondsMatch[1]) / 60
    
    return totalMinutes
  }

  // Função para converter SLA definido em minutos
  const parseSLAToMinutes = (slaStr) => {
    if (!slaStr) return 0
    
    // Tenta diferentes formatos: "8 horas", "8h", "480 minutos", etc.
    const hoursMatch = slaStr.match(/(\d+)\s*h/i)
    const minutesMatch = slaStr.match(/(\d+)\s*min/i)
    const daysMatch = slaStr.match(/(\d+)\s*d/i)
    
    let totalMinutes = 0
    if (daysMatch) totalMinutes += parseInt(daysMatch[1]) * 24 * 60
    if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60
    if (minutesMatch) totalMinutes += parseInt(minutesMatch[1])
    
    return totalMinutes
  }

  // Preservar todos os campos originais do ticket e normalizar apenas os campos necessários
  // IMPORTANTE: Criar objeto seguro mesmo quando ticket é null/undefined para não quebrar os hooks
  const normalizedTicket = useMemo(() => {
    if (!ticket || typeof ticket !== 'object') {
      return {
        ID: 'N/A',
        Título: 'Sem título',
        Descrição: '',
        Status: 'Não definido',
        Prioridade: 'Não definida',
        Categoria: 'Não categorizado',
        'Requerente - Requerente': 'Não informado',
        'Atribuído - Técnico': 'Não atribuído',
        'Data de abertura': 'Não informada',
        'Data da solução': null,
        'Tempo para solução': '',
        'SLA - SLA Tempo para solução': '',
        'Tempo para resolver excedido': 'Não',
        'Estatísticas - Tempo de espera': '',
        'Estatísticas - Tempo de atribuição': '',
        'Estatísticas - Tempo de solução': '',
        'Solução - Solução': ''
      }
    }

    return {
      // Preservar todos os campos originais
      ...ticket,
      // Sobrescrever com valores normalizados apenas se necessário
      ID: ticket.ID || ticket.id || ticket['ID'] || 'N/A',
      Título: ticket.Título || ticket.título || ticket.title || ticket['Título'] || 'Sem título',
      Descrição: ticket.Descrição || ticket.descrição || ticket.description || ticket['Descrição'] || '',
      Status: ticket.Status || ticket.status || ticket['Status'] || 'Não definido',
      Prioridade: ticket.Prioridade || ticket.prioridade || ticket.priority || ticket['Prioridade'] || 'Não definida',
      Categoria: ticket.Categoria || ticket.categoria || ticket.category || ticket['Categoria'] || ticket['Motivo'] || 'Não categorizado',
      'Requerente - Requerente': ticket['Requerente - Requerente'] || ticket.requerente || ticket.requester || 'Não informado',
      'Atribuído - Técnico': ticket['Atribuído - Técnico'] || ticket['Técnico responsável'] || ticket.assignedTo || ticket.assigned_to || 'Não atribuído',
      'Data de abertura': ticket['Data de abertura'] || ticket.dataAbertura || ticket.created_at || 'Não informada',
      'Data da solução': ticket['Data da solução'] || ticket.dataSolucao || ticket.closed_at || null,
      'Tempo para solução': ticket['Tempo para solução'] || ticket.tempoSolucao || ticket.timeToResolve || '',
      'SLA - SLA Tempo para solução': ticket['SLA - SLA Tempo para solução'] || ticket.sla || ticket.slaTime || '',
      'Tempo para resolver excedido': ticket['Tempo para resolver excedido'] || ticket.slaExceeded || 'Não',
      'Estatísticas - Tempo de espera': ticket['Estatísticas - Tempo de espera'] || ticket.waitTime || '',
      'Estatísticas - Tempo de atribuição': ticket['Estatísticas - Tempo de atribuição'] || ticket.assignmentTime || '',
      'Estatísticas - Tempo de solução': ticket['Estatísticas - Tempo de solução'] || ticket.resolutionTime || '',
      'Solução - Solução': ticket['Solução - Solução'] || ticket.solucao || ticket.solution || ''
    }
  }, [ticket])

  const handleEvaluate = (rating) => {
    setEvaluation(rating)
  }

  const handleSubmitEvaluation = () => {
    if (evaluation && onEvaluate) {
      onEvaluate(normalizedTicket.ID, evaluation, comment)
      setEvaluation(null)
      setComment('')
      onClose()
    }
  }

  const handleSubmitStarReview = () => {
    // Salva avaliação por estrelas no localStorage (lista cumulativa)
    const existing = JSON.parse(localStorage.getItem('starEvaluations') || '[]')
    const newReview = {
      id: Date.now(),
      ticketId: normalizedTicket.ID,
      stars: starRating,
      comment: starComment.trim(),
      date: new Date().toISOString()
    }
    const updated = [newReview, ...existing]
    localStorage.setItem('starEvaluations', JSON.stringify(updated))
    setStarRating(0)
    setStarHover(null)
    setStarComment('')
    onClose()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Solucionado':
        return 'bg-green-100 text-green-800'
      case 'Fechado':
        return 'bg-gray-100 text-gray-800'
      case 'Em andamento':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-100 text-red-800'
      case 'Média':
        return 'bg-yellow-100 text-yellow-800'
      case 'Baixa':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Cálculos detalhados de SLA - deve ser chamado antes de qualquer early return
  const slaDetails = useMemo(() => {
    const slaDefined = normalizedTicket['SLA - SLA Tempo para solução'] || ''
    const timeToResolve = normalizedTicket['Tempo para solução'] || ''
    const isExceeded = normalizedTicket['Tempo para resolver excedido'] === 'Sim'
    const waitTime = normalizedTicket['Estatísticas - Tempo de espera'] || ''
    const assignmentTime = normalizedTicket['Estatísticas - Tempo de atribuição'] || ''
    const resolutionTime = normalizedTicket['Estatísticas - Tempo de solução'] || ''
    
    const slaMinutes = parseSLAToMinutes(slaDefined)
    const usedMinutes = parseTimeToMinutes(timeToResolve)
    const waitMinutes = parseTimeToMinutes(waitTime)
    const assignmentMinutes = parseTimeToMinutes(assignmentTime)
    const resolutionMinutes = parseTimeToMinutes(resolutionTime)
    
    const percentageUsed = slaMinutes > 0 ? Math.min((usedMinutes / slaMinutes) * 100, 100) : 0
    const remainingMinutes = Math.max(0, slaMinutes - usedMinutes)
    const exceededMinutes = isExceeded ? Math.max(0, usedMinutes - slaMinutes) : 0
    
    // Determinar status visual
    let statusColor = 'green'
    let statusText = 'No Prazo'
    let statusIcon = CheckCircle2
    
    if (isExceeded) {
      statusColor = 'red'
      statusText = 'SLA Excedido'
      statusIcon = XCircle
    } else if (percentageUsed >= 90) {
      statusColor = 'orange'
      statusText = 'Crítico'
      statusIcon = AlertTriangle
    } else if (percentageUsed >= 75) {
      statusColor = 'yellow'
      statusText = 'Atenção'
      statusIcon = AlertTriangle
    }
    
    return {
      slaDefined,
      timeToResolve,
      isExceeded,
      slaMinutes,
      usedMinutes,
      waitMinutes,
      assignmentMinutes,
      resolutionMinutes,
      percentageUsed: Math.round(percentageUsed),
      remainingMinutes,
      exceededMinutes,
      statusColor,
      statusText,
      statusIcon
    }
  }, [normalizedTicket])

  // Função para formatar tempo (não é um hook, pode estar aqui)
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A'
    
    const hoursMatch = timeStr.match(/(\d+)\s*hora/)
    const minutesMatch = timeStr.match(/(\d+)\s*minuto/)
    const secondsMatch = timeStr.match(/(\d+)\s*segundo/)
    
    let totalMinutes = 0
    if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60
    if (minutesMatch) totalMinutes += parseInt(minutesMatch[1])
    if (secondsMatch) totalMinutes += parseInt(secondsMatch[1]) / 60
    
    if (totalMinutes < 60) {
      return `${Math.round(totalMinutes)} min`
    } else {
      const hours = Math.floor(totalMinutes / 60)
      const minutes = Math.round(totalMinutes % 60)
      return `${hours}h ${minutes}min`
    }
  }

  // Early returns DEPOIS de todos os hooks
  if (!isOpen) return null

  // Se não houver ticket, mostrar mensagem de erro
  if (!ticket || typeof ticket !== 'object') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar chamado</h2>
            <p className="text-gray-600 mb-4">Não foi possível carregar as informações do chamado.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Debug: verificar se o ticket está sendo recebido
  console.log('Ticket recebido no TicketDetails:', ticket)
  if (ticket) {
    console.log('Chaves do ticket:', Object.keys(ticket))
    console.log('Tipo do ticket:', typeof ticket)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Tag className="h-6 w-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Chamado #{normalizedTicket.ID}
              </h2>
              <p className="text-sm text-gray-600">
                {normalizedTicket.Categoria}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {normalizedTicket.Título}
                </h3>
                <p className="text-gray-600 text-sm">
                  {normalizedTicket.Descrição || 'Sem descrição disponível'}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(normalizedTicket.Status)}`}>
                  {normalizedTicket.Status}
                </span>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(normalizedTicket.Prioridade)}`}>
                  {normalizedTicket.Prioridade}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  <strong>Requerente:</strong> {normalizedTicket['Requerente - Requerente']}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  <strong>Técnico:</strong> {normalizedTicket['Atribuído - Técnico']}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  <strong>Abertura:</strong> {normalizedTicket['Data de abertura']}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  <strong>Solução:</strong> {normalizedTicket['Data da solução'] || 'Pendente'}
                </span>
              </div>
            </div>
          </div>

          {/* Métricas de Tempo */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Métricas de Tempo</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Tempo de Espera</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatTime(normalizedTicket['Estatísticas - Tempo de espera'])}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Tempo de Atribuição</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatTime(normalizedTicket['Estatísticas - Tempo de atribuição'])}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Tempo de Solução</p>
                <p className="text-lg font-semibold text-purple-600">
                  {formatTime(normalizedTicket['Estatísticas - Tempo de solução'])}
                </p>
              </div>
            </div>
          </div>

          {/* Solução */}
          {normalizedTicket['Solução - Solução'] && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Solução Implementada</span>
              </h4>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {normalizedTicket['Solução - Solução']}
                </p>
              </div>
            </div>
          )}

          {/* SLA Detalhado */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>Análise Detalhada de SLA</span>
              </h4>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                slaDetails.statusColor === 'green' ? 'bg-green-100 text-green-800' :
                slaDetails.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                slaDetails.statusColor === 'orange' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {React.createElement(slaDetails.statusIcon, { className: 'h-4 w-4' })}
                <span className="text-sm font-semibold">{slaDetails.statusText}</span>
              </div>
            </div>

            {/* Barra de Progresso Visual */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Utilização do SLA</span>
                <span className={`text-sm font-bold ${
                  slaDetails.percentageUsed >= 90 ? 'text-red-600' :
                  slaDetails.percentageUsed >= 75 ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {slaDetails.percentageUsed}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    slaDetails.percentageUsed >= 90 ? 'bg-red-500' :
                    slaDetails.percentageUsed >= 75 ? 'bg-orange-500' :
                    slaDetails.percentageUsed >= 50 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(slaDetails.percentageUsed, 100)}%` }}
                />
              </div>
            </div>

            {/* Grid de Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Timer className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-gray-600">SLA Definido</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{slaDetails.slaDefined || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {slaDetails.slaMinutes > 0 ? `(${Math.round(slaDetails.slaMinutes)} minutos)` : ''}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-gray-600">Tempo Utilizado</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatTime(normalizedTicket['Tempo para solução'])}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {slaDetails.usedMinutes > 0 ? `(${Math.round(slaDetails.usedMinutes)} minutos)` : ''}
                </p>
              </div>

              {!slaDetails.isExceeded ? (
                <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-gray-600">Tempo Restante</span>
                  </div>
                  <p className="text-lg font-bold text-green-700">
                    {slaDetails.remainingMinutes >= 60 
                      ? `${Math.floor(slaDetails.remainingMinutes / 60)}h ${Math.round(slaDetails.remainingMinutes % 60)}min`
                      : `${Math.round(slaDetails.remainingMinutes)} min`
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {slaDetails.remainingMinutes > 0 ? 'Disponível' : 'No limite'}
                  </p>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg border border-red-200 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-red-600" />
                    <span className="text-xs font-medium text-gray-600">Tempo Excedido</span>
                  </div>
                  <p className="text-lg font-bold text-red-700">
                    {slaDetails.exceededMinutes >= 60 
                      ? `${Math.floor(slaDetails.exceededMinutes / 60)}h ${Math.round(slaDetails.exceededMinutes % 60)}min`
                      : `${Math.round(slaDetails.exceededMinutes)} min`
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Acima do prazo</p>
                </div>
              )}

              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-medium text-gray-600">Status</span>
                </div>
                <p className={`text-lg font-bold ${
                  slaDetails.isExceeded ? 'text-red-700' : 'text-green-700'
                }`}>
                  {slaDetails.isExceeded ? 'Excedido' : 'No Prazo'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {slaDetails.isExceeded ? 'Ação necessária' : 'Conforme'}
                </p>
              </div>
            </div>

            {/* Breakdown de Tempos por Fase */}
            <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm mb-4">
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Breakdown de Tempos por Fase</span>
              </h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <span className="text-sm text-gray-700">Tempo de Espera</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatTime(normalizedTicket['Estatísticas - Tempo de espera'])}
                    </span>
                    {slaDetails.waitMinutes > 0 && slaDetails.slaMinutes > 0 && (
                      <span className="text-xs text-gray-500">
                        ({Math.round((slaDetails.waitMinutes / slaDetails.slaMinutes) * 100)}% do SLA)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-sm text-gray-700">Tempo de Atribuição</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatTime(normalizedTicket['Estatísticas - Tempo de atribuição'])}
                    </span>
                    {slaDetails.assignmentMinutes > 0 && slaDetails.slaMinutes > 0 && (
                      <span className="text-xs text-gray-500">
                        ({Math.round((slaDetails.assignmentMinutes / slaDetails.slaMinutes) * 100)}% do SLA)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                    <span className="text-sm text-gray-700">Tempo de Solução</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatTime(normalizedTicket['Estatísticas - Tempo de solução'])}
                    </span>
                    {slaDetails.resolutionMinutes > 0 && slaDetails.slaMinutes > 0 && (
                      <span className="text-xs text-gray-500">
                        ({Math.round((slaDetails.resolutionMinutes / slaDetails.slaMinutes) * 100)}% do SLA)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <h5 className="font-semibold text-gray-900 mb-2 text-sm">Informações do SLA</h5>
                <div className="space-y-1 text-xs">
                  <p className="text-gray-600">
                    <strong>Prazo Acordado:</strong> {slaDetails.slaDefined || 'Não definido'}
                  </p>
                  <p className="text-gray-600">
                    <strong>Tempo Total:</strong> {formatTime(normalizedTicket['Tempo para solução'])}
                  </p>
                  <p className="text-gray-600">
                    <strong>Data de Abertura:</strong> {normalizedTicket['Data de abertura']}
                  </p>
                  {normalizedTicket['Data da solução'] && (
                    <p className="text-gray-600">
                      <strong>Data de Solução:</strong> {normalizedTicket['Data da solução']}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <h5 className="font-semibold text-gray-900 mb-2 text-sm">Análise de Performance</h5>
                <div className="space-y-1 text-xs">
                  <p className="text-gray-600">
                    <strong>Eficiência:</strong> 
                    <span className={`ml-1 font-semibold ${
                      slaDetails.percentageUsed <= 50 ? 'text-green-600' :
                      slaDetails.percentageUsed <= 75 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {slaDetails.percentageUsed <= 50 ? 'Excelente' :
                       slaDetails.percentageUsed <= 75 ? 'Boa' :
                       slaDetails.percentageUsed <= 90 ? 'Atenção' : 'Crítica'}
                    </span>
                  </p>
                  {slaDetails.isExceeded && (
                    <p className="text-red-600">
                      <strong>⚠️ Ação Necessária:</strong> SLA foi excedido em {
                        slaDetails.exceededMinutes >= 60 
                          ? `${Math.floor(slaDetails.exceededMinutes / 60)}h ${Math.round(slaDetails.exceededMinutes % 60)}min`
                          : `${Math.round(slaDetails.exceededMinutes)} min`
                      }
                    </p>
                  )}
                  {!slaDetails.isExceeded && slaDetails.remainingMinutes > 0 && (
                    <p className="text-green-600">
                      <strong>✓ Status:</strong> Chamado dentro do prazo acordado
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Avaliação por Estrelas */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Responda com o número que melhor representa sua satisfação: 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ em uma escala de 1 (muito insatisfeito) 😩 a 5 (muito satisfeito)😁.</span>
            </h4>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onMouseEnter={() => setStarHover(value)}
                    onMouseLeave={() => setStarHover(null)}
                    onClick={() => setStarRating(value)}
                    className="p-1"
                  >
                    <Star
                      className={`h-6 w-6 ${ (starHover ?? starRating) >= value ? 'text-yellow-400' : 'text-gray-300' }`}
                      fill={(starHover ?? starRating) >= value ? '#FBBF24' : 'none'}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">{starRating} / 5</span>
                <button
                  type="button"
                  onClick={() => setStarRating(0)}
                  className="ml-3 text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Zerar (0)
                </button>
              </div>

              <textarea
                value={starComment}
                onChange={(e) => setStarComment(e.target.value)}
                placeholder="Escreva sua avaliação (opcional)"
                className="w-full px -3 py -2 border border-black-400 rounded-lg focus:ring-2 focus:ring-primary -500 focus:border-primary-500"
                rows="3"
              />

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSubmitStarReview}
                  className="px-4 py-2 bg-primary-600 text-black rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Salvar Avaliação por Estrelas
                </button>
              </div>
            </div>
          </div>

          {/* Avaliação Positiva/Negativa */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Avaliar Atendimento</span>
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleEvaluate('positive')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    evaluation === 'positive'
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-green-50'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Avaliar Positivamente</span>
                </button>
                
                <button
                  onClick={() => handleEvaluate('negative')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    evaluation === 'negative'
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-red-50'
                  }`}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>Avaliar Negativamente</span>
                </button>
              </div>

              {evaluation && (
                <div className="space-y-3">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Adicione um comentário sobre a avaliação (opcional)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows="3"
                  />
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSubmitEvaluation}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Enviar Avaliação
                    </button>
                    
                    <button
                      onClick={() => {
                        setEvaluation(null)
                        setComment('')
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketDetails 