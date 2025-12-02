import React, { useState, useMemo } from 'react'
import { X, ThumbsUp, ThumbsDown, Clock, User, Tag, MessageSquare, Star, AlertTriangle, TrendingUp, TrendingDown, Target, Timer, CheckCircle2, XCircle, Activity, Gauge, Shield, Zap, BarChart3, GaugeCircle, Award, Info, Lightbulb, AlertCircle, Minus } from 'lucide-react'

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

  // Cálculos detalhados e avançados de SLA - deve ser chamado antes de qualquer early return
  const slaDetails = useMemo(() => {
    const slaDefined = normalizedTicket['SLA - SLA Tempo para solução'] || ''
    const timeToResolve = normalizedTicket['Tempo para solução'] || ''
    const isExceeded = normalizedTicket['Tempo para resolver excedido'] === 'Sim'
    const waitTime = normalizedTicket['Estatísticas - Tempo de espera'] || ''
    const assignmentTime = normalizedTicket['Estatísticas - Tempo de atribuição'] || ''
    const resolutionTime = normalizedTicket['Estatísticas - Tempo de solução'] || ''
    const openDate = normalizedTicket['Data de abertura']
    const solutionDate = normalizedTicket['Data da solução']
    
    const slaMinutes = parseSLAToMinutes(slaDefined)
    const usedMinutes = parseTimeToMinutes(timeToResolve)
    const waitMinutes = parseTimeToMinutes(waitTime)
    const assignmentMinutes = parseTimeToMinutes(assignmentTime)
    const resolutionMinutes = parseTimeToMinutes(resolutionTime)
    
    // Calcular tempo total real (somando todas as fases para validação)
    const totalCalculatedMinutes = waitMinutes + assignmentMinutes + resolutionMinutes
    
    // Percentual de utilização (mais preciso)
    const percentageUsed = slaMinutes > 0 ? Math.min((usedMinutes / slaMinutes) * 100, 100) : 0
    const remainingMinutes = Math.max(0, slaMinutes - usedMinutes)
    const exceededMinutes = isExceeded ? Math.max(0, usedMinutes - slaMinutes) : 0
    
    // Calcular datas para análise temporal
    let openDateTime = null
    let solutionDateTime = null
    if (openDate) {
      try {
        const dateParts = openDate.split(' ')[0].split('/')
        const timeParts = openDate.split(' ')[1] ? openDate.split(' ')[1].split(':') : ['00', '00']
        openDateTime = new Date(
          parseInt(dateParts[2]), 
          parseInt(dateParts[1]) - 1, 
          parseInt(dateParts[0]),
          parseInt(timeParts[0]) || 0,
          parseInt(timeParts[1]) || 0
        )
      } catch (e) {
        console.warn('Erro ao parsear data de abertura:', openDate)
      }
    }
    
    if (solutionDate) {
      try {
        const dateParts = solutionDate.split(' ')[0].split('/')
        const timeParts = solutionDate.split(' ')[1] ? solutionDate.split(' ')[1].split(':') : ['00', '00']
        solutionDateTime = new Date(
          parseInt(dateParts[2]), 
          parseInt(dateParts[1]) - 1, 
          parseInt(dateParts[0]),
          parseInt(timeParts[0]) || 0,
          parseInt(timeParts[1]) || 0
        )
      } catch (e) {
        console.warn('Erro ao parsear data de solução:', solutionDate)
      }
    }
    
    // Calcular tempo real decorrido (em minutos)
    let realElapsedMinutes = 0
    if (openDateTime && solutionDateTime && !isNaN(openDateTime.getTime()) && !isNaN(solutionDateTime.getTime())) {
      realElapsedMinutes = Math.round((solutionDateTime - openDateTime) / (1000 * 60))
    }
    
    // Calcular tempo decorrido até agora (se ainda não resolvido)
    let currentElapsedMinutes = 0
    if (openDateTime && !isNaN(openDateTime.getTime())) {
      if (solutionDateTime && !isNaN(solutionDateTime.getTime())) {
        currentElapsedMinutes = realElapsedMinutes
      } else {
        // Chamado ainda aberto - calcular até agora
        currentElapsedMinutes = Math.round((new Date() - openDateTime) / (1000 * 60))
      }
    }
    
    // Calcular percentuais por fase (mais preciso)
    const waitPercentage = slaMinutes > 0 ? (waitMinutes / slaMinutes) * 100 : 0
    const assignmentPercentage = slaMinutes > 0 ? (assignmentMinutes / slaMinutes) * 100 : 0
    const resolutionPercentage = slaMinutes > 0 ? (resolutionMinutes / slaMinutes) * 100 : 0
    
    // Calcular eficiência por fase (0-100%, onde 100% é ideal)
    const idealWaitTime = slaMinutes * 0.2 // Ideal: 20% do SLA em espera
    const idealAssignmentTime = slaMinutes * 0.1 // Ideal: 10% em atribuição
    const idealResolutionTime = slaMinutes * 0.7 // Ideal: 70% em resolução
    
    const waitEfficiency = idealWaitTime > 0 ? Math.max(0, 100 - ((waitMinutes - idealWaitTime) / idealWaitTime * 100)) : 100
    const assignmentEfficiency = idealAssignmentTime > 0 ? Math.max(0, 100 - ((assignmentMinutes - idealAssignmentTime) / idealAssignmentTime * 100)) : 100
    const resolutionEfficiency = idealResolutionTime > 0 ? Math.max(0, 100 - ((resolutionMinutes - idealResolutionTime) / idealResolutionTime * 100)) : 100
    
    // Calcular velocidade de resposta (tempo médio por fase)
    const responseSpeed = assignmentMinutes + waitMinutes > 0 ? (assignmentMinutes + waitMinutes) : 0
    
    // Calcular previsão de tempo restante baseado na velocidade atual
    let predictedRemainingTime = 0
    let riskLevel = 'baixo'
    let riskMessage = ''
    
    if (openDateTime && !solutionDateTime && slaMinutes > 0) {
      const timeElapsedSinceOpen = currentElapsedMinutes
      const averageSpeed = timeElapsedSinceOpen > 0 ? timeElapsedSinceOpen : 1
      const remainingWork = slaMinutes - timeElapsedSinceOpen
      
      // Previsão conservadora (assumindo velocidade constante ou pior)
      predictedRemainingTime = remainingWork
      
      // Análise de risco
      const riskPercentage = (timeElapsedSinceOpen / slaMinutes) * 100
      
      if (riskPercentage >= 90) {
        riskLevel = 'crítico'
        riskMessage = 'Risco crítico de exceder SLA. Ação imediata necessária.'
      } else if (riskPercentage >= 75) {
        riskLevel = 'alto'
        riskMessage = 'Alto risco de exceder SLA. Priorizar resolução.'
      } else if (riskPercentage >= 50) {
        riskLevel = 'médio'
        riskMessage = 'Risco moderado. Monitorar progresso.'
      } else {
        riskLevel = 'baixo'
        riskMessage = 'Baixo risco. Mantenha o ritmo atual.'
      }
    }
    
    // Calcular taxa de consumo do SLA por hora
    const consumptionRatePerHour = currentElapsedMinutes > 0 && slaMinutes > 0
      ? (currentElapsedMinutes / slaMinutes) * 60 / Math.max(1, Math.round(currentElapsedMinutes / 60))
      : 0
    
    // Projeção de quando o SLA será atingido (se continuar no ritmo atual)
    let projectedSlaReach = null
    if (consumptionRatePerHour > 0 && !solutionDateTime) {
      const hoursToReachSLA = (slaMinutes / 60) / Math.max(0.01, consumptionRatePerHour)
      if (hoursToReachSLA > 0 && hoursToReachSLA < 720) { // Menos de 30 dias
        const projectedDate = new Date(openDateTime.getTime() + (hoursToReachSLA * 60 * 60 * 1000))
        projectedSlaReach = projectedDate
      }
    }
    
    // Calcular margem de segurança
    const safetyMargin = slaMinutes > 0 ? ((remainingMinutes / slaMinutes) * 100) : 0
    const safetyMarginStatus = safetyMargin >= 25 ? 'excelente' : safetyMargin >= 10 ? 'boa' : safetyMargin >= 5 ? 'baixa' : 'crítica'
    
    // Determinar status visual com mais granularidade
    let statusColor = 'green'
    let statusText = 'No Prazo'
    let statusIcon = CheckCircle2
    
    if (isExceeded) {
      statusColor = 'red'
      statusText = 'SLA Excedido'
      statusIcon = XCircle
    } else if (percentageUsed >= 95) {
      statusColor = 'red'
      statusText = 'Crítico (95%+)'
      statusIcon = AlertTriangle
    } else if (percentageUsed >= 90) {
      statusColor = 'orange'
      statusText = 'Muito Crítico (90%+)'
      statusIcon = AlertTriangle
    } else if (percentageUsed >= 80) {
      statusColor = 'orange'
      statusText = 'Crítico (80%+)'
      statusIcon = AlertTriangle
    } else if (percentageUsed >= 75) {
      statusColor = 'yellow'
      statusText = 'Atenção (75%+)'
      statusIcon = AlertTriangle
    } else if (percentageUsed >= 60) {
      statusColor = 'yellow'
      statusText = 'Monitorar (60%+)'
      statusIcon = AlertTriangle
    }
    
    // Recomendações baseadas em análise
    const recommendations = []
    if (waitPercentage > 40) {
      recommendations.push({
        type: 'warning',
        message: 'Tempo de espera alto. Considere melhorar processo de triagem.',
        priority: 'alta'
      })
    }
    if (assignmentPercentage > 20) {
      recommendations.push({
        type: 'warning',
        message: 'Tempo de atribuição acima do ideal. Otimizar distribuição de chamados.',
        priority: 'média'
      })
    }
    if (resolutionPercentage > 70) {
      recommendations.push({
        type: 'info',
        message: 'Maior parte do tempo em resolução. Verificar complexidade do chamado.',
        priority: 'baixa'
      })
    }
    if (isExceeded) {
      recommendations.push({
        type: 'error',
        message: 'SLA excedido. Revisar processo e implementar ações preventivas.',
        priority: 'crítica'
      })
    }
    if (percentageUsed >= 90 && !isExceeded) {
      recommendations.push({
        type: 'error',
        message: 'Risco crítico. Priorizar resolução imediatamente.',
        priority: 'crítica'
      })
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
      totalCalculatedMinutes,
      realElapsedMinutes,
      currentElapsedMinutes,
      percentageUsed: Math.round(percentageUsed * 10) / 10, // 1 casa decimal
      remainingMinutes: Math.round(remainingMinutes * 10) / 10,
      exceededMinutes: Math.round(exceededMinutes * 10) / 10,
      waitPercentage: Math.round(waitPercentage * 10) / 10,
      assignmentPercentage: Math.round(assignmentPercentage * 10) / 10,
      resolutionPercentage: Math.round(resolutionPercentage * 10) / 10,
      waitEfficiency: Math.round(waitEfficiency * 10) / 10,
      assignmentEfficiency: Math.round(assignmentEfficiency * 10) / 10,
      resolutionEfficiency: Math.round(resolutionEfficiency * 10) / 10,
      responseSpeed: Math.round(responseSpeed * 10) / 10,
      consumptionRatePerHour: Math.round(consumptionRatePerHour * 100) / 100,
      safetyMargin: Math.round(safetyMargin * 10) / 10,
      safetyMarginStatus,
      riskLevel,
      riskMessage,
      predictedRemainingTime: Math.round(predictedRemainingTime * 10) / 10,
      projectedSlaReach,
      openDateTime,
      solutionDateTime,
      statusColor,
      statusText,
      statusIcon,
      recommendations
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

          {/* SLA Detalhado - Versão Expandida e Aprimorada */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-blue-300 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h4 className="text-2xl font-bold text-gray-900 flex items-center space-x-2 mb-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  <span>Análise Detalhada de SLA</span>
                </h4>
                <p className="text-sm text-gray-600 ml-8">Análise completa e fidedigna de Service Level Agreement com métricas avançadas</p>
              </div>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-md ${
                slaDetails.statusColor === 'green' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                slaDetails.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' :
                slaDetails.statusColor === 'orange' ? 'bg-orange-100 text-orange-800 border-2 border-orange-300' :
                'bg-red-100 text-red-800 border-2 border-red-300'
              }`}>
                {React.createElement(slaDetails.statusIcon, { className: 'h-5 w-5' })}
                <span className="text-base font-bold">{slaDetails.statusText}</span>
              </div>
            </div>

            {/* Barra de Progresso Visual Aprimorada */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-blue-600" />
                  Utilização do SLA
                </span>
                <span className={`text-lg font-bold px-3 py-1 rounded-lg ${
                  slaDetails.percentageUsed >= 90 ? 'bg-red-100 text-red-700' :
                  slaDetails.percentageUsed >= 75 ? 'bg-orange-100 text-orange-700' :
                  slaDetails.percentageUsed >= 50 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {slaDetails.percentageUsed.toFixed(1)}%
                </span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                <div 
                  className={`h-full transition-all duration-700 ease-out relative ${
                    slaDetails.percentageUsed >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                    slaDetails.percentageUsed >= 75 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                    slaDetails.percentageUsed >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                    'bg-gradient-to-r from-green-500 to-green-600'
                  }`}
                  style={{ width: `${Math.min(slaDetails.percentageUsed, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                </div>
                {/* Marcadores de alerta */}
                {slaDetails.percentageUsed < 100 && (
                  <>
                    <div className="absolute left-0 top-0 w-1 h-full bg-gray-400 opacity-50"></div>
                    <div className="absolute left-[75%] top-0 w-0.5 h-full bg-yellow-600"></div>
                    <div className="absolute left-[90%] top-0 w-0.5 h-full bg-orange-600"></div>
                    <div className="absolute right-0 top-0 w-1 h-full bg-red-600 opacity-50"></div>
                  </>
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span className="text-yellow-600 font-semibold">75%</span>
                <span className="text-orange-600 font-semibold">90%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Grid de Métricas Principais Expandido */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-5 rounded-lg border-2 border-blue-300 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-2 mb-3">
                  <Timer className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">SLA Definido</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{slaDetails.slaDefined || 'N/A'}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-500">Total em minutos:</span>
                  <span className="text-xs font-bold text-gray-700">
                    {slaDetails.slaMinutes > 0 ? `${Math.round(slaDetails.slaMinutes)} min` : 'N/A'}
                  </span>
                </div>
                {slaDetails.slaMinutes > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {Math.round(slaDetails.slaMinutes / 60)} horas acordadas
                  </div>
                )}
              </div>

              <div className="bg-white p-5 rounded-lg border-2 border-purple-300 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">Tempo Utilizado</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{formatTime(normalizedTicket['Tempo para solução'])}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-500">Minutos utilizados:</span>
                  <span className="text-xs font-bold text-gray-700">
                    {slaDetails.usedMinutes > 0 ? `${Math.round(slaDetails.usedMinutes)} min` : 'N/A'}
                  </span>
                </div>
                {slaDetails.currentElapsedMinutes > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    Tempo real: {Math.round(slaDetails.currentElapsedMinutes)} min
                  </div>
                )}
              </div>

              {!slaDetails.isExceeded ? (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-lg border-2 border-green-300 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-semibold text-gray-700">Tempo Restante</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700 mb-1">
                    {slaDetails.remainingMinutes >= 60 
                      ? `${Math.floor(slaDetails.remainingMinutes / 60)}h ${Math.round(slaDetails.remainingMinutes % 60)}min`
                      : `${Math.round(slaDetails.remainingMinutes)} min`
                    }
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-green-200">
                    <span className="text-xs text-gray-600">Margem de segurança:</span>
                    <span className={`text-xs font-bold ${
                      slaDetails.safetyMarginStatus === 'excelente' ? 'text-green-600' :
                      slaDetails.safetyMarginStatus === 'boa' ? 'text-blue-600' :
                      slaDetails.safetyMarginStatus === 'baixa' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {slaDetails.safetyMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Status: {slaDetails.safetyMarginStatus === 'excelente' ? 'Excelente' :
                             slaDetails.safetyMarginStatus === 'boa' ? 'Boa' :
                             slaDetails.safetyMarginStatus === 'baixa' ? 'Baixa' : 'Crítica'}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-5 rounded-lg border-2 border-red-300 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-semibold text-gray-700">Tempo Excedido</span>
                  </div>
                  <p className="text-2xl font-bold text-red-700 mb-1">
                    {slaDetails.exceededMinutes >= 60 
                      ? `${Math.floor(slaDetails.exceededMinutes / 60)}h ${Math.round(slaDetails.exceededMinutes % 60)}min`
                      : `${Math.round(slaDetails.exceededMinutes)} min`
                    }
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-red-200">
                    <span className="text-xs text-red-700">Percentual excedido:</span>
                    <span className="text-xs font-bold text-red-700">
                      {slaDetails.slaMinutes > 0 ? `${((slaDetails.exceededMinutes / slaDetails.slaMinutes) * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-red-700 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Ação imediata necessária
                  </div>
                </div>
              )}

              <div className="bg-white p-5 rounded-lg border-2 border-indigo-300 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-2 mb-3">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm font-semibold text-gray-700">Status Geral</span>
                </div>
                <p className={`text-2xl font-bold mb-1 ${
                  slaDetails.isExceeded ? 'text-red-700' : 'text-green-700'
                }`}>
                  {slaDetails.isExceeded ? 'Excedido' : 'No Prazo'}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-500">Utilização:</span>
                  <span className={`text-xs font-bold ${
                    slaDetails.percentageUsed >= 90 ? 'text-red-600' :
                    slaDetails.percentageUsed >= 75 ? 'text-orange-600' :
                    'text-green-600'
                  }`}>
                    {slaDetails.percentageUsed.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {slaDetails.isExceeded ? 'Ação necessária' : 'Conforme SLA'}
                </div>
              </div>
            </div>

            {/* Breakdown de Tempos por Fase Expandido */}
            <div className="bg-white p-5 rounded-lg border-2 border-blue-300 shadow-md mb-6">
              <h5 className="font-bold text-gray-900 mb-4 flex items-center space-x-2 text-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>Análise Detalhada por Fase</span>
              </h5>
              <div className="space-y-4">
                {/* Fase 1: Espera */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></div>
                      <span className="text-base font-semibold text-gray-800">Tempo de Espera</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatTime(normalizedTicket['Estatísticas - Tempo de espera'])}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-blue-200">
                    <div>
                      <span className="text-xs text-gray-600">Percentual do SLA:</span>
                      <p className="text-sm font-bold text-gray-900">{slaDetails.waitPercentage.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Minutos:</span>
                      <p className="text-sm font-bold text-gray-900">{Math.round(slaDetails.waitMinutes)} min</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Eficiência:</span>
                      <p className={`text-sm font-bold ${
                        slaDetails.waitEfficiency >= 80 ? 'text-green-600' :
                        slaDetails.waitEfficiency >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {slaDetails.waitEfficiency.toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Status:</span>
                      <p className={`text-xs font-semibold ${
                        slaDetails.waitPercentage <= 20 ? 'text-green-600' :
                        slaDetails.waitPercentage <= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {slaDetails.waitPercentage <= 20 ? '✓ Ótimo' :
                         slaDetails.waitPercentage <= 40 ? '⚠ Atenção' : '✗ Crítico'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fase 2: Atribuição */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
                      <span className="text-base font-semibold text-gray-800">Tempo de Atribuição</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatTime(normalizedTicket['Estatísticas - Tempo de atribuição'])}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-green-200">
                    <div>
                      <span className="text-xs text-gray-600">Percentual do SLA:</span>
                      <p className="text-sm font-bold text-gray-900">{slaDetails.assignmentPercentage.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Minutos:</span>
                      <p className="text-sm font-bold text-gray-900">{Math.round(slaDetails.assignmentMinutes)} min</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Eficiência:</span>
                      <p className={`text-sm font-bold ${
                        slaDetails.assignmentEfficiency >= 80 ? 'text-green-600' :
                        slaDetails.assignmentEfficiency >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {slaDetails.assignmentEfficiency.toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Status:</span>
                      <p className={`text-xs font-semibold ${
                        slaDetails.assignmentPercentage <= 10 ? 'text-green-600' :
                        slaDetails.assignmentPercentage <= 20 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {slaDetails.assignmentPercentage <= 10 ? '✓ Ótimo' :
                         slaDetails.assignmentPercentage <= 20 ? '⚠ Atenção' : '✗ Crítico'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fase 3: Solução */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-purple-500 shadow-sm"></div>
                      <span className="text-base font-semibold text-gray-800">Tempo de Solução</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatTime(normalizedTicket['Estatísticas - Tempo de solução'])}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-purple-200">
                    <div>
                      <span className="text-xs text-gray-600">Percentual do SLA:</span>
                      <p className="text-sm font-bold text-gray-900">{slaDetails.resolutionPercentage.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Minutos:</span>
                      <p className="text-sm font-bold text-gray-900">{Math.round(slaDetails.resolutionMinutes)} min</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Eficiência:</span>
                      <p className={`text-sm font-bold ${
                        slaDetails.resolutionEfficiency >= 80 ? 'text-green-600' :
                        slaDetails.resolutionEfficiency >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {slaDetails.resolutionEfficiency.toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Status:</span>
                      <p className={`text-xs font-semibold ${
                        slaDetails.resolutionPercentage <= 70 ? 'text-green-600' :
                        slaDetails.resolutionPercentage <= 85 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {slaDetails.resolutionPercentage <= 70 ? '✓ Ótimo' :
                         slaDetails.resolutionPercentage <= 85 ? '⚠ Atenção' : '✗ Crítico'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Análise Avançada e Métricas Adicionais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Informações Detalhadas do SLA */}
              <div className="bg-white p-5 rounded-lg border-2 border-blue-300 shadow-md">
                <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
                  <Info className="h-5 w-5 text-blue-600" />
                  Informações Detalhadas do SLA
                </h5>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Prazo Acordado:</span>
                    <span className="text-gray-900 font-bold">{slaDetails.slaDefined || 'Não definido'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Tempo Total Utilizado:</span>
                    <span className="text-gray-900 font-bold">{formatTime(normalizedTicket['Tempo para solução'])}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Data de Abertura:</span>
                    <span className="text-gray-900 font-semibold">{normalizedTicket['Data de abertura'] || 'N/A'}</span>
                  </div>
                  {normalizedTicket['Data da solução'] && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Data de Solução:</span>
                      <span className="text-gray-900 font-semibold">{normalizedTicket['Data da solução']}</span>
                    </div>
                  )}
                  {slaDetails.openDateTime && !slaDetails.solutionDateTime && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Tempo Decorrido:</span>
                      <span className="text-gray-900 font-bold">
                        {slaDetails.currentElapsedMinutes >= 1440 
                          ? `${Math.floor(slaDetails.currentElapsedMinutes / 1440)} dias`
                          : slaDetails.currentElapsedMinutes >= 60
                          ? `${Math.floor(slaDetails.currentElapsedMinutes / 60)}h ${slaDetails.currentElapsedMinutes % 60}min`
                          : `${slaDetails.currentElapsedMinutes} min`
                        }
                      </span>
                    </div>
                  )}
                  {slaDetails.totalCalculatedMinutes > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">Tempo Total Calculado:</span>
                      <span className="text-gray-900 font-semibold">
                        {Math.round(slaDetails.totalCalculatedMinutes)} min
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Análise de Risco e Previsões */}
              <div className="bg-white p-5 rounded-lg border-2 border-orange-300 shadow-md">
                <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
                  <AlertTriangle className={`h-5 w-5 ${
                    slaDetails.riskLevel === 'crítico' ? 'text-red-600' :
                    slaDetails.riskLevel === 'alto' ? 'text-orange-600' :
                    slaDetails.riskLevel === 'médio' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                  Análise de Risco e Previsões
                </h5>
                <div className="space-y-3 text-sm">
                  <div className={`p-3 rounded-lg ${
                    slaDetails.riskLevel === 'crítico' ? 'bg-red-50 border-2 border-red-200' :
                    slaDetails.riskLevel === 'alto' ? 'bg-orange-50 border-2 border-orange-200' :
                    slaDetails.riskLevel === 'médio' ? 'bg-yellow-50 border-2 border-yellow-200' :
                    'bg-green-50 border-2 border-green-200'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">Nível de Risco:</span>
                      <span className={`font-bold text-lg ${
                        slaDetails.riskLevel === 'crítico' ? 'text-red-700' :
                        slaDetails.riskLevel === 'alto' ? 'text-orange-700' :
                        slaDetails.riskLevel === 'médio' ? 'text-yellow-700' :
                        'text-green-700'
                      }`}>
                        {slaDetails.riskLevel.charAt(0).toUpperCase() + slaDetails.riskLevel.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700">{slaDetails.riskMessage}</p>
                  </div>
                  {slaDetails.consumptionRatePerHour > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Taxa de Consumo:</span>
                      <span className="text-gray-900 font-bold">
                        {slaDetails.consumptionRatePerHour.toFixed(2)}x por hora
                      </span>
                    </div>
                  )}
                  {slaDetails.projectedSlaReach && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Previsão de Atingimento SLA:</span>
                      <span className="text-gray-900 font-semibold text-xs">
                        {slaDetails.projectedSlaReach.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Velocidade de Resposta:</span>
                    <span className="text-gray-900 font-bold">
                      {slaDetails.responseSpeed > 0 ? `${Math.round(slaDetails.responseSpeed)} min` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Eficiência Geral:</span>
                    <span className={`font-bold ${
                      slaDetails.percentageUsed <= 50 ? 'text-green-600' :
                      slaDetails.percentageUsed <= 75 ? 'text-yellow-600' :
                      slaDetails.percentageUsed <= 90 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {slaDetails.percentageUsed <= 50 ? 'Excelente' :
                       slaDetails.percentageUsed <= 75 ? 'Boa' :
                       slaDetails.percentageUsed <= 90 ? 'Atenção' : 'Crítica'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recomendações e Ações */}
            {slaDetails.recommendations && slaDetails.recommendations.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-5 rounded-lg border-2 border-yellow-300 shadow-md mb-6">
                <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Recomendações e Ações Sugeridas
                </h5>
                <div className="space-y-3">
                  {slaDetails.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-2 ${
                        rec.type === 'error' ? 'bg-red-50 border-red-300' :
                        rec.type === 'warning' ? 'bg-orange-50 border-orange-300' :
                        'bg-blue-50 border-blue-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {rec.type === 'error' ? (
                          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        ) : rec.type === 'warning' ? (
                          <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              rec.priority === 'crítica' ? 'bg-red-200 text-red-800' :
                              rec.priority === 'alta' ? 'bg-orange-200 text-orange-800' :
                              rec.priority === 'média' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-blue-200 text-blue-800'
                            }`}>
                              Prioridade: {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800">{rec.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumo Executivo */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-lg border-2 border-indigo-300 shadow-md">
              <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
                <Award className="h-5 w-5 text-indigo-600" />
                Resumo Executivo
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <GaugeCircle className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-gray-600">PERFORMANCE</span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    slaDetails.percentageUsed <= 50 ? 'text-green-600' :
                    slaDetails.percentageUsed <= 75 ? 'text-yellow-600' :
                    slaDetails.percentageUsed <= 90 ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {slaDetails.percentageUsed.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Utilização do SLA</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-gray-600">SEGURANÇA</span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    slaDetails.safetyMarginStatus === 'excelente' ? 'text-green-600' :
                    slaDetails.safetyMarginStatus === 'boa' ? 'text-blue-600' :
                    slaDetails.safetyMarginStatus === 'baixa' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {slaDetails.safetyMargin.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Margem de Segurança</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-gray-600">STATUS</span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    slaDetails.isExceeded ? 'text-red-600' :
                    slaDetails.statusColor === 'green' ? 'text-green-600' :
                    slaDetails.statusColor === 'yellow' ? 'text-yellow-600' :
                    'text-orange-600'
                  }`}>
                    {slaDetails.isExceeded ? 'EXCEDIDO' : 'OK'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Status Geral</p>
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