import React, { useState, useMemo, useEffect } from 'react'
import {
  User, TrendingUp, TrendingDown, Target, Award, Clock, AlertTriangle,
  CheckCircle, XCircle, BarChart3, Activity, Zap, Shield,
  Users, Calendar, Star, Lightbulb, Minus, ArrowUp, ArrowDown,
  PieChart, Gauge, Percent, Trophy
} from 'lucide-react'
import PerformanceReport from './PerformanceReport'
import DashboardCustomizer from './DashboardCustomizer'
import AdvancedRecommendations from '../services/AdvancedRecommendations'
import AIInsightsService from '../services/AIInsightsService'

const TechnicianPerformance = ({ data }) => {
  const [selectedTechnician, setSelectedTechnician] = useState(null)
  const [timeRange, setTimeRange] = useState('all') // 'week', 'month', 'quarter', 'year', 'all'
  const [visibleWidgets, setVisibleWidgets] = useState(null) // null = todos visíveis
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const defaultVisibleWidgetIds = useMemo(() => {
    return new Set(['kpis', 'insights', 'recommendations', 'comparison', 'report'])
  }, [])

  // Validação de dados
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhum dado disponível</h3>
            <p className="text-gray-300">Carregue um arquivo CSV com dados de chamados para usar esta funcionalidade.</p>
          </div>
        </div>
      </div>
    )
  }

  // Se houver erro, mostrar mensagem
  if (hasError) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-300 mb-4">{errorMessage || 'Ocorreu um erro inesperado.'}</p>
            <button
              onClick={() => {
                setHasError(false)
                setErrorMessage(null)
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Obter lista única de técnicos
  const technicians = useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    const techSet = new Set()
    data.forEach(ticket => {
      if (!ticket || typeof ticket !== 'object') return
      const tech = ticket['Técnico responsável'] || ticket['Atribuído - Técnico'] || ticket.assignedTo
      if (tech && tech !== 'Não atribuído' && tech !== 'Não informado') {
        techSet.add(tech)
      }
    })
    return Array.from(techSet).sort()
  }, [data])

  // Função para parsear tempo em minutos
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

  // Função para parsear SLA em minutos
  const parseSLAToMinutes = (slaStr) => {
    if (!slaStr) return 0
    const hoursMatch = slaStr.match(/(\d+)\s*h/i)
    const minutesMatch = slaStr.match(/(\d+)\s*min/i)
    const daysMatch = slaStr.match(/(\d+)\s*d/i)
    let totalMinutes = 0
    if (daysMatch) totalMinutes += parseInt(daysMatch[1]) * 24 * 60
    if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60
    if (minutesMatch) totalMinutes += parseInt(minutesMatch[1])
    return totalMinutes
  }

  // Filtrar tickets por técnico e período
  const technicianTickets = useMemo(() => {
    if (!selectedTechnician || !data || !Array.isArray(data)) return []
    
    let filtered = data.filter(ticket => {
      if (!ticket || typeof ticket !== 'object') return false
      const tech = ticket['Técnico responsável'] || ticket['Atribuído - Técnico'] || ticket.assignedTo
      return tech === selectedTechnician
    })

    // Filtrar por período se necessário
    if (timeRange !== 'all') {
      const now = new Date()
      let cutoffDate = new Date()
      
      switch (timeRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3)
          break
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filtered = filtered.filter(ticket => {
        const openDate = ticket['Data de abertura']
        if (!openDate) return false
        try {
          const [day, month, year] = openDate.split(' ')[0].split('/')
          const ticketDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          return ticketDate >= cutoffDate
        } catch {
          return false
        }
      })
    }

    return filtered
  }, [data, selectedTechnician, timeRange])

  // Calcular estatísticas do técnico selecionado
  const technicianStats = useMemo(() => {
    if (!selectedTechnician || technicianTickets.length === 0) {
      return null
    }

    const tickets = technicianTickets
    const total = tickets.length
    const resolved = tickets.filter(t => t.Status === 'Solucionado' || t.Status === 'Fechado').length
    const open = total - resolved
    const slaExceeded = tickets.filter(t => t['Tempo para resolver excedido'] === 'Sim').length
    const slaMet = total - slaExceeded
    const slaCompliance = total > 0 ? (slaMet / total) * 100 : 0

    // Tempo médio de resolução
    const resolutionTimes = tickets
      .filter(t => t['Tempo para solução'])
      .map(t => parseTimeToMinutes(t['Tempo para solução']))
      .filter(t => t > 0)

    const sortedResolutionTimes = [...resolutionTimes].sort((a, b) => a - b)
    const avgResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, t) => sum + t, 0) / resolutionTimes.length
      : 0

    const medianResolutionTime = sortedResolutionTimes.length > 0
      ? (sortedResolutionTimes.length % 2 === 1
        ? sortedResolutionTimes[Math.floor(sortedResolutionTimes.length / 2)]
        : (sortedResolutionTimes[(sortedResolutionTimes.length / 2) - 1] + sortedResolutionTimes[sortedResolutionTimes.length / 2]) / 2)
      : 0

    const p90ResolutionTime = sortedResolutionTimes.length > 0
      ? sortedResolutionTimes[Math.min(sortedResolutionTimes.length - 1, Math.floor(sortedResolutionTimes.length * 0.9))]
      : 0

    // Análise por categoria
    const categoryStats = tickets.reduce((acc, ticket) => {
      const category = ticket.Categoria || ticket['Motivo'] || 'Não categorizado'
      if (!acc[category]) {
        acc[category] = { total: 0, resolved: 0, slaExceeded: 0, totalTime: 0, count: 0 }
      }
      acc[category].total++
      if (ticket.Status === 'Solucionado' || ticket.Status === 'Fechado') {
        acc[category].resolved++
      }
      if (ticket['Tempo para resolver excedido'] === 'Sim') {
        acc[category].slaExceeded++
      }
      const time = parseTimeToMinutes(ticket['Tempo para solução'])
      if (time > 0) {
        acc[category].totalTime += time
        acc[category].count++
      }
      return acc
    }, {})

    // Calcular médias por categoria
    Object.keys(categoryStats).forEach(cat => {
      const stats = categoryStats[cat]
      stats.avgTime = stats.count > 0 ? stats.totalTime / stats.count : 0
      stats.compliance = stats.total > 0 ? ((stats.total - stats.slaExceeded) / stats.total) * 100 : 0
    })

    // Análise temporal (evolução mensal)
    const monthlyStats = tickets.reduce((acc, ticket) => {
      const openDate = ticket['Data de abertura']
      if (!openDate) return acc
      
      try {
        const [day, month, year] = openDate.split(' ')[0].split('/')
        const monthKey = `${month}/${year}`
        
        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: monthKey,
            total: 0,
            resolved: 0,
            slaMet: 0,
            slaExceeded: 0,
            avgResolutionTime: 0,
            resolutionTimes: []
          }
        }
        
        acc[monthKey].total++
        if (ticket.Status === 'Solucionado' || ticket.Status === 'Fechado') {
          acc[monthKey].resolved++
        }
        if (ticket['Tempo para resolver excedido'] === 'Sim') {
          acc[monthKey].slaExceeded++
        } else {
          acc[monthKey].slaMet++
        }
        
        const time = parseTimeToMinutes(ticket['Tempo para solução'])
        if (time > 0) {
          acc[monthKey].resolutionTimes.push(time)
        }
        
        return acc
      } catch {
        return acc
      }
    }, {})

    // Calcular médias mensais
    Object.values(monthlyStats).forEach(stats => {
      if (stats.resolutionTimes.length > 0) {
        stats.avgResolutionTime = stats.resolutionTimes.reduce((sum, t) => sum + t, 0) / stats.resolutionTimes.length
        const sortedResolutionTimes = [...stats.resolutionTimes].sort((a, b) => a - b)
        stats.medianResolutionTime = sortedResolutionTimes.length > 0
          ? (sortedResolutionTimes.length % 2 === 1
            ? sortedResolutionTimes[Math.floor(sortedResolutionTimes.length / 2)]
            : (sortedResolutionTimes[(sortedResolutionTimes.length / 2) - 1] + sortedResolutionTimes[sortedResolutionTimes.length / 2]) / 2)
          : 0
        stats.p90ResolutionTime = sortedResolutionTimes.length > 0
          ? sortedResolutionTimes[Math.min(sortedResolutionTimes.length - 1, Math.floor(sortedResolutionTimes.length * 0.9))]
          : 0
      } else {
        stats.medianResolutionTime = 0
        stats.p90ResolutionTime = 0
      }
      stats.compliance = stats.total > 0 ? (stats.slaMet / stats.total) * 100 : 0
    })

    const monthlyData = Object.values(monthlyStats)
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/').map(Number)
        const [bMonth, bYear] = b.month.split('/').map(Number)
        if (aYear !== bYear) return aYear - bYear
        return aMonth - bMonth
      })

    return {
      technician: selectedTechnician,
      total,
      resolved,
      open,
      slaMet,
      slaExceeded,
      slaCompliance,
      avgResolutionTime,
      medianResolutionTime,
      p90ResolutionTime,
      categoryStats,
      monthlyData
    }
  }, [selectedTechnician, technicianTickets])

  // Calcular estatísticas da equipe para comparação
  const teamStats = useMemo(() => {
    if (!selectedTechnician || !data || !Array.isArray(data)) return null

    // Estatísticas gerais da equipe (excluindo o técnico selecionado)
    const teamTickets = data.filter(ticket => {
      if (!ticket || typeof ticket !== 'object') return false
      const tech = ticket['Técnico responsável'] || ticket['Atribuído - Técnico'] || ticket.assignedTo
      return tech && tech !== selectedTechnician && tech !== 'Não atribuído' && tech !== 'Não informado'
    })

    if (teamTickets.length === 0) return null

    const total = teamTickets.length
    const slaExceeded = teamTickets.filter(t => t['Tempo para resolver excedido'] === 'Sim').length
    const slaMet = total - slaExceeded
    const slaCompliance = (slaMet / total) * 100

    const resolutionTimes = teamTickets
      .filter(t => t['Tempo para solução'])
      .map(t => parseTimeToMinutes(t['Tempo para solução']))
      .filter(t => t > 0)

    const sortedResolutionTimes = [...resolutionTimes].sort((a, b) => a - b)
    const avgResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, t) => sum + t, 0) / resolutionTimes.length
      : 0

    const medianResolutionTime = sortedResolutionTimes.length > 0
      ? (sortedResolutionTimes.length % 2 === 1
        ? sortedResolutionTimes[Math.floor(sortedResolutionTimes.length / 2)]
        : (sortedResolutionTimes[(sortedResolutionTimes.length / 2) - 1] + sortedResolutionTimes[sortedResolutionTimes.length / 2]) / 2)
      : 0

    const p90ResolutionTime = sortedResolutionTimes.length > 0
      ? sortedResolutionTimes[Math.min(sortedResolutionTimes.length - 1, Math.floor(sortedResolutionTimes.length * 0.9))]
      : 0

    return {
      total,
      slaCompliance,
      avgResolutionTime,
      medianResolutionTime,
      p90ResolutionTime
    }
  }, [data, selectedTechnician])

  // Calcular percentil do técnico
  const percentileRank = useMemo(() => {
    if (!selectedTechnician || !technicianStats || !teamStats) return null

    // Calcular SLA compliance de cada técnico
    const allTechnicians = {}
    
    technicians.forEach(tech => {
      const techTickets = data.filter(ticket => {
        const t = ticket['Técnico responsável'] || ticket['Atribuído - Técnico'] || ticket.assignedTo
        return t === tech
      })
      
      if (techTickets.length === 0) return
      
      const slaExceeded = techTickets.filter(t => t['Tempo para resolver excedido'] === 'Sim').length
      const compliance = ((techTickets.length - slaExceeded) / techTickets.length) * 100
      
      allTechnicians[tech] = compliance
    })

    const compliances = Object.values(allTechnicians).sort((a, b) => b - a)
    const techCompliance = allTechnicians[selectedTechnician]
    
    const rank = compliances.findIndex(c => c <= techCompliance)
    const percentile = compliances.length > 0 ? ((compliances.length - rank - 1) / compliances.length) * 100 : 0

    return Math.round(percentile)
  }, [selectedTechnician, technicians, data, technicianStats])

  // Gerar recomendações básicas
  const recommendations = useMemo(() => {
    if (!selectedTechnician || !technicianStats || !teamStats) return []

    const recs = []

    // Comparação de SLA compliance
    if (technicianStats.slaCompliance < teamStats.slaCompliance - 5) {
      recs.push({
        type: 'warning',
        priority: 'alta',
        title: 'SLA Compliance Abaixo da Média',
        message: `Seu SLA compliance (${technicianStats.slaCompliance.toFixed(1)}%) está abaixo da média da equipe (${teamStats.slaCompliance.toFixed(1)}%). Considere revisar chamados próximos ao prazo e priorizar melhor.`,
        metric: 'slaCompliance',
        current: technicianStats.slaCompliance,
        target: teamStats.slaCompliance
      })
    } else if (technicianStats.slaCompliance > teamStats.slaCompliance + 5) {
      recs.push({
        type: 'success',
        priority: 'baixa',
        title: 'Excelente SLA Compliance!',
        message: `Parabéns! Seu SLA compliance (${technicianStats.slaCompliance.toFixed(1)}%) está acima da média da equipe (${teamStats.slaCompliance.toFixed(1)}%). Continue mantendo esse padrão!`,
        metric: 'slaCompliance'
      })
    }

    // Tempo de resolução
    if (technicianStats.medianResolutionTime > teamStats.medianResolutionTime * 1.2) {
      recs.push({
        type: 'warning',
        priority: 'alta',
        title: 'Tempo Médio de Resolução Elevado',
        message: `Sua mediana de resolução (${Math.round(technicianStats.medianResolutionTime)} min) está ${Math.round(((technicianStats.medianResolutionTime / teamStats.medianResolutionTime) - 1) * 100)}% acima da mediana da equipe. Analise categorias problemáticas para identificar gargalos.`,
        metric: 'medianResolutionTime',
        current: technicianStats.medianResolutionTime,
        target: teamStats.medianResolutionTime
      })
    }

    // Categorias problemáticas
    const problematicCategories = Object.entries(technicianStats.categoryStats)
      .filter(([_, stats]) => stats.compliance < 70 && stats.total >= 3)
      .sort(([_, a], [__, b]) => a.compliance - b.compliance)
      .slice(0, 3)

    problematicCategories.forEach(([category, stats]) => {
      recs.push({
        type: 'info',
        priority: 'média',
        title: `Melhorar em: ${category}`,
        message: `Esta categoria apresenta apenas ${stats.compliance.toFixed(1)}% de SLA compliance (${stats.slaExceeded}/${stats.total} chamados excederam). Considere estudar casos similares bem-sucedidos ou buscar treinamento.`,
        metric: 'category',
        category: category
      })
    })

    // Categorias de destaque
    const strongCategories = Object.entries(technicianStats.categoryStats)
      .filter(([_, stats]) => stats.compliance >= 95 && stats.total >= 5)
      .sort(([_, a], [__, b]) => b.compliance - a.compliance)
      .slice(0, 2)

    strongCategories.forEach(([category, stats]) => {
      recs.push({
        type: 'success',
        priority: 'baixa',
        title: `Destaque em: ${category}`,
        message: `Excelente desempenho! Você tem ${stats.compliance.toFixed(1)}% de SLA compliance nesta categoria (${stats.resolved}/${stats.total} chamados resolvidos). Considere compartilhar suas técnicas com a equipe.`,
        metric: 'category',
        category: category
      })
    })

    // Combinar com recomendações avançadas
    const advancedRecs = AdvancedRecommendations.generateAdvancedRecommendations(
      technicianStats,
      teamStats,
      technicianStats?.monthlyData || [],
      technicianStats?.categoryStats || {},
      technicianTickets.filter(t => t.Status !== 'Solucionado' && t.Status !== 'Fechado')
    )

    const allRecs = [...recs, ...advancedRecs]
    
    // Remover duplicatas baseado no título
    const uniqueRecs = []
    const seenTitles = new Set()
    allRecs.forEach(rec => {
      if (!seenTitles.has(rec.title)) {
        seenTitles.add(rec.title)
        uniqueRecs.push(rec)
      }
    })

    return uniqueRecs.sort((a, b) => {
      const priorityOrder = { 'alta': 0, 'média': 1, 'baixa': 2 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      const typeOrder = { 'critical': 0, 'warning': 1, 'info': 2, 'success': 3 }
      return (typeOrder[a.type] || 2) - (typeOrder[b.type] || 2)
    })
  }, [selectedTechnician, technicianStats, teamStats, technicianTickets])

  const aiInsights = useMemo(() => {
    if (!selectedTechnician || !technicianStats) return null

    const generated = AIInsightsService.generateRecommendations({
      technicianName: selectedTechnician,
      technicianStats,
      teamStats,
      tickets: technicianTickets
    })

    return {
      score: generated.score,
      recommendations: generated.recommendations,
      topRisks: AIInsightsService.topTicketRisks(technicianTickets, 10)
    }
  }, [selectedTechnician, technicianStats, teamStats, technicianTickets])

  // Função helper para verificar se widget deve ser exibido
  const isWidgetVisible = (widgetId) => {
    if (visibleWidgets === null) return defaultVisibleWidgetIds.has(widgetId)
    return visibleWidgets.includes(widgetId)
  }

  // Se nenhum técnico selecionado, mostrar seleção
  if (!selectedTechnician) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-8 md:p-12 border border-blue-500/30 shadow-glow">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full shadow-lg mb-6">
              <User className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4">
              Análise Individual de Desempenho
            </h3>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Selecione um técnico para visualizar análises detalhadas de desempenho, comparações com a equipe e recomendações personalizadas.
            </p>

            {technicians.length === 0 ? (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6 max-w-md mx-auto">
                <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <p className="text-yellow-300 font-semibold">Nenhum técnico encontrado</p>
                <p className="text-yellow-200 text-sm mt-2">Não há técnicos atribuídos aos chamados disponíveis.</p>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <label className="block text-left text-gray-300 font-semibold mb-3">
                  Selecione o Técnico:
                </label>
                <select
                  value={selectedTechnician || ''}
                  onChange={(e) => setSelectedTechnician(e.target.value || null)}
                  className="w-full px-4 py-3 bg-gray-800/50 border-2 border-blue-500/50 rounded-lg text-white text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-800 transition-colors"
                >
                  <option value="">-- Selecione um técnico --</option>
                  {technicians.map(tech => (
                    <option key={tech} value={tech} className="bg-gray-800">
                      {tech}
                    </option>
                  ))}
                </select>
                <p className="text-gray-400 text-sm mt-3">
                  {technicians.length} técnico(s) disponível(is) para análise
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Dashboard do técnico selecionado
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com Seletor */}
      <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30 shadow-glow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                {selectedTechnician}
              </h3>
            </div>
            <p className="text-gray-300 text-sm md:text-base ml-12">
              Análise individual de desempenho e recomendações personalizadas
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value || null)}
              className="px-4 py-2 bg-gray-800/50 border border-blue-500/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-800 transition-colors"
            >
              {technicians.map(tech => (
                <option key={tech} value={tech} className="bg-gray-800">
                  {tech}
                </option>
              ))}
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-blue-500/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-800 transition-colors"
            >
              <option value="all">Todo o Período</option>
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
              <option value="quarter">Últimos 3 Meses</option>
              <option value="year">Último Ano</option>
            </select>
            {selectedTechnician && (
              <DashboardCustomizer
                technicianName={selectedTechnician}
                onLayoutChange={setVisibleWidgets}
                currentLayout={visibleWidgets}
              />
            )}
          </div>
        </div>
      </div>

      {!technicianStats ? (
        <div className="bg-gray-800/50 rounded-xl p-12 text-center">
          <Clock className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Carregando estatísticas...</p>
        </div>
      ) : (
        <>
          {/* KPIs Principais */}
          {isWidgetVisible('kpis') && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-xl p-6 border-2 border-blue-500/30 shadow-md hover:shadow-glow transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-blue-400 bg-blue-500/20 px-2 py-1 rounded">
                  {percentileRank ? `Top ${100 - percentileRank}%` : 'N/A'}
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-1">SLA Compliance</p>
              <p className="text-3xl font-bold text-white mb-2">
                {technicianStats.slaCompliance.toFixed(1)}%
              </p>
              {teamStats && (
                <div className="flex items-center gap-2 text-xs">
                  {technicianStats.slaCompliance >= teamStats.slaCompliance ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-green-400">
                        +{(technicianStats.slaCompliance - teamStats.slaCompliance).toFixed(1)}% vs equipe
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-400" />
                      <span className="text-red-400">
                        {(technicianStats.slaCompliance - teamStats.slaCompliance).toFixed(1)}% vs equipe
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-500/30 shadow-md hover:shadow-glow transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-1">Tempo de Resolução (Mediana)</p>
              <p className="text-3xl font-bold text-white mb-2">
                {Math.round(technicianStats.medianResolutionTime ?? technicianStats.avgResolutionTime)} min
              </p>
              {teamStats && (
                <div className="flex items-center gap-2 text-xs">
                  {(technicianStats.medianResolutionTime ?? technicianStats.avgResolutionTime) <= (teamStats.medianResolutionTime ?? teamStats.avgResolutionTime) ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-green-400" />
                      <span className="text-green-400">
                        {Math.round((teamStats.medianResolutionTime ?? teamStats.avgResolutionTime) - (technicianStats.medianResolutionTime ?? technicianStats.avgResolutionTime))} min mais rápido
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 text-red-400" />
                      <span className="text-red-400">
                        {Math.round((technicianStats.medianResolutionTime ?? technicianStats.avgResolutionTime) - (teamStats.medianResolutionTime ?? teamStats.avgResolutionTime))} min mais lento
                      </span>
                    </>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                p90: {Math.round(technicianStats.p90ResolutionTime ?? technicianStats.avgResolutionTime)} min
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 border-2 border-green-500/30 shadow-md hover:shadow-glow transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-1">Chamados Resolvidos</p>
              <p className="text-3xl font-bold text-white mb-2">
                {technicianStats.resolved}
              </p>
              <p className="text-xs text-gray-400">
                de {technicianStats.total} total
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-sm rounded-xl p-6 border-2 border-orange-500/30 shadow-md hover:shadow-glow transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-1">SLA Excedido</p>
              <p className="text-3xl font-bold text-white mb-2">
                {technicianStats.slaExceeded}
              </p>
              <p className="text-xs text-gray-400">
                {technicianStats.total > 0 ? ((technicianStats.slaExceeded / technicianStats.total) * 100).toFixed(1) : 0}% do total
              </p>
            </div>
          </div>
          )}

          {/* Insights (IA) */}
          {isWidgetVisible('insights') && aiInsights && (
            <div className="bg-gradient-to-br from-emerald-600/20 via-cyan-600/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 border-2 border-emerald-500/30 shadow-md">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-emerald-400" />
                Insights (IA)
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-2">Score de Performance</p>
                  <p className="text-4xl font-bold text-white">
                    {aiInsights.score?.performance ?? 'N/A'}
                    <span className="text-sm text-gray-400">/100</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Baseado em SLA, tempo médio e backlog
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-2">Score de Risco</p>
                  <p className="text-4xl font-bold text-white">
                    {aiInsights.score?.risk ?? 'N/A'}
                    <span className="text-sm text-gray-400">/100</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Maior = mais risco operacional (backlog + SLA excedido)
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-2">Resumo</p>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div className="flex items-center justify-between">
                      <span>Abertos</span>
                      <span className="font-semibold text-white">{aiInsights.score?.summary?.open ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SLAs excedidos</span>
                      <span className="font-semibold text-white">{aiInsights.score?.summary?.exceeded ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Chamado mais antigo (aberto)</span>
                      <span className="font-semibold text-white">{aiInsights.score?.summary?.oldestOpenDays ?? 0}d</span>
                    </div>
                  </div>
                </div>
              </div>

              {aiInsights.topRisks && aiInsights.topRisks.length > 0 && (
                <div className="mt-6">
                  <h5 className="text-lg font-bold text-white mb-3">Top chamados críticos</h5>
                  <div className="space-y-3">
                    {aiInsights.topRisks.slice(0, 5).map((t, idx) => (
                      <div key={idx} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">#{t.id} - {t.title}</p>
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              {(t.factors || []).slice(0, 3).map(f => f.label).join(' • ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Risco</p>
                            <p className="text-lg font-bold text-red-400">{t.risk}/100</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recomendações */}
          {isWidgetVisible('recommendations') && recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border-2 border-yellow-500/30 shadow-md">
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-yellow-400" />
                Recomendações Personalizadas
              </h4>
              <div className="space-y-3">
                {recommendations.slice(0, 5).map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${
                      rec.type === 'warning' ? 'bg-orange-500/20 border-orange-500/30' :
                      rec.type === 'success' ? 'bg-green-500/20 border-green-500/30' :
                      'bg-blue-500/20 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {rec.type === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                      ) : rec.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Lightbulb className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white">{rec.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            rec.priority === 'alta' ? 'bg-red-500/20 text-red-400' :
                            rec.priority === 'média' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            Prioridade: {rec.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{rec.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comparação com Equipe */}
          {isWidgetVisible('comparison') && teamStats && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-md">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-400" />
                Comparação com a Equipe
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-medium">SLA Compliance</span>
                    <span className="text-white font-bold">{technicianStats.slaCompliance.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-4 mb-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        technicianStats.slaCompliance >= teamStats.slaCompliance
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-red-500 to-orange-500'
                      }`}
                      style={{ width: `${Math.min(technicianStats.slaCompliance, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Você</span>
                    <span>Equipe: {teamStats.slaCompliance.toFixed(1)}%</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-medium">Tempo Médio de Resolução</span>
                    <span className="text-white font-bold">{Math.round(technicianStats.avgResolutionTime)} min</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-4 mb-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        technicianStats.avgResolutionTime <= teamStats.avgResolutionTime
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-red-500 to-orange-500'
                      }`}
                      style={{ width: `${Math.min((technicianStats.avgResolutionTime / (teamStats.avgResolutionTime * 2)) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Você</span>
                    <span>Equipe: {Math.round(teamStats.avgResolutionTime)} min</span>
                  </div>
                </div>
              </div>

              {percentileRank !== null && (
                <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-blue-400" />
                    <div>
                      <p className="text-white font-semibold">Posicionamento na Equipe</p>
                      <p className="text-sm text-gray-300">
                        Você está no percentil {percentileRank}, o que significa que está entre os{' '}
                        <span className="text-blue-400 font-bold">top {100 - percentileRank}%</span> da equipe em SLA compliance.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Relatório Personalizado */}
          {isWidgetVisible('report') && (
            <PerformanceReport
              technicianName={selectedTechnician}
              technicianStats={technicianStats}
              teamStats={teamStats}
              insights={aiInsights}
              recommendations={recommendations}
              percentileRank={percentileRank}
            />
          )}
        </>
      )}
    </div>
  )
}

export default TechnicianPerformance
