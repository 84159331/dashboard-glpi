import React, { useState, useMemo, useEffect } from 'react'
import {
  User, TrendingUp, TrendingDown, Target, Award, Clock, AlertTriangle,
  CheckCircle, XCircle, BarChart3, Activity, Zap, Shield, Trophy,
  Users, Calendar, Star, Lightbulb, Minus, ArrowUp, ArrowDown,
  PieChart, Gauge, Percent, Sparkles, Gift
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import GamificationService, { BADGES, LEVELS } from '../services/GamificationService'
import IntelligentAlerts from './IntelligentAlerts'
import PerformanceReport from './PerformanceReport'
import PredictiveAnalysisComponent from './PredictiveAnalysis'
import BehavioralAnalysis from './BehavioralAnalysis'
import PersonalGoals from './PersonalGoals'
import WellnessMonitor from './WellnessMonitor'
import DashboardCustomizer from './DashboardCustomizer'
import ActivityFeed from './ActivityFeed'
import AdvancedRecommendations from '../services/AdvancedRecommendations'

const TechnicianPerformance = ({ data }) => {
  const [selectedTechnician, setSelectedTechnician] = useState(null)
  const [timeRange, setTimeRange] = useState('all') // 'week', 'month', 'quarter', 'year', 'all'
  const [visibleWidgets, setVisibleWidgets] = useState(null) // null = todos visíveis
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

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
    
    const avgResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, t) => sum + t, 0) / resolutionTimes.length
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
      total,
      resolved,
      open,
      slaMet,
      slaExceeded,
      slaCompliance,
      avgResolutionTime,
      categoryStats,
      monthlyData
    }
  }, [technicianTickets, selectedTechnician])

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
    
    const avgResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, t) => sum + t, 0) / resolutionTimes.length
      : 0

    return {
      total,
      slaCompliance,
      avgResolutionTime
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
    if (technicianStats.avgResolutionTime > teamStats.avgResolutionTime * 1.2) {
      recs.push({
        type: 'warning',
        priority: 'alta',
        title: 'Tempo Médio de Resolução Elevado',
        message: `Seu tempo médio de resolução (${Math.round(technicianStats.avgResolutionTime)} min) está ${Math.round(((technicianStats.avgResolutionTime / teamStats.avgResolutionTime) - 1) * 100)}% acima da média da equipe. Analise categorias problemáticas para identificar gargalos.`,
        metric: 'avgResolutionTime',
        current: technicianStats.avgResolutionTime,
        target: teamStats.avgResolutionTime
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

  // Cálculo de Gamificação (XP, Níveis, Badges)
  const gamification = useMemo(() => {
    if (!selectedTechnician || !technicianStats) return null

    // Carregar progresso salvo
    const savedProgress = GamificationService.loadTechnicianProgress(selectedTechnician)
    
    // Preparar dados para cálculo de XP
    const xpData = {
      tickets: technicianTickets,
      slaCompliance: technicianStats.slaCompliance,
      resolved: technicianStats.resolved,
      total: technicianStats.total,
      avgResolutionTime: technicianStats.avgResolutionTime
    }
    
    // Calcular XP ganho neste período
    const xpEarned = GamificationService.calculateXP(xpData)
    
    // Total XP (salvo + novo)
    const totalXP = savedProgress.totalXP + xpEarned
    
    // Obter nível atual
    const currentLevel = GamificationService.getCurrentLevel(totalXP)
    
    // Progresso para próximo nível
    const levelProgress = GamificationService.getLevelProgress(totalXP, currentLevel)
    
    // Verificar badges
    const newBadges = GamificationService.checkBadges(
      selectedTechnician,
      {
        tickets: technicianTickets,
        slaCompliance: technicianStats.slaCompliance,
        avgResolutionTime: technicianStats.avgResolutionTime,
        total: technicianStats.total,
        resolved: technicianStats.resolved
      },
      null // histórico (pode ser expandido depois)
    )
    
    // Filtrar badges já concedidas
    const existingBadgeIds = savedProgress.badges.map(b => b.id)
    const earnedBadges = newBadges.filter(b => !existingBadgeIds.includes(b.id))
    
    // Combinar badges antigas e novas
    const allBadges = [
      ...savedProgress.badges.map(saved => {
        const badgeInfo = Object.values(BADGES).find(b => b.id === saved.id)
        return badgeInfo ? { ...badgeInfo, earnedDate: saved.earnedDate } : null
      }).filter(Boolean),
      ...earnedBadges
    ]
    
    // Salvar progresso atualizado
    if (earnedBadges.length > 0 || xpEarned > 0) {
      GamificationService.saveTechnicianProgress(
        selectedTechnician,
        totalXP,
        allBadges,
        currentLevel
      )
    }
    
    return {
      totalXP,
      xpEarned,
      currentLevel,
      levelProgress,
      badges: allBadges,
      newBadges: earnedBadges
    }
  }, [selectedTechnician, technicianStats, technicianTickets])

  // Função helper para verificar se widget deve ser exibido
  const isWidgetVisible = (widgetId) => {
    if (visibleWidgets === null) return true // Se null, mostrar todos
    return visibleWidgets.includes(widgetId)
  }

  // Efeito para mostrar notificações de novos badges
  useEffect(() => {
    if (gamification && gamification.newBadges && gamification.newBadges.length > 0) {
      gamification.newBadges.forEach(badge => {
        // Aqui pode ser adicionado um sistema de notificações
        console.log(`Novo badge desbloqueado: ${badge.name}`)
      })
    }
  }, [gamification?.newBadges])

  // Preparar dados para gráficos
  const chartData = useMemo(() => {
    if (!technicianStats) return { monthly: [], categories: [], radar: [] }

    const monthly = technicianStats.monthlyData.map(month => ({
      mês: month.month,
      'SLA Compliance': month.compliance.toFixed(1),
      'Tempo Médio (min)': Math.round(month.avgResolutionTime),
      'Total Chamados': month.total,
      'SLA Atendido': month.slaMet,
      'SLA Excedido': month.slaExceeded
    }))

    const categories = Object.entries(technicianStats.categoryStats)
      .sort(([_, a], [__, b]) => b.total - a.total)
      .slice(0, 8)
      .map(([name, stats]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        total: stats.total,
        compliance: stats.compliance,
        'Tempo Médio': Math.round(stats.avgTime)
      }))

    // Dados para gráfico radar - Top 6 categorias
    const radarData = Object.entries(technicianStats.categoryStats)
      .sort(([_, a], [__, b]) => b.total - a.total)
      .slice(0, 6)
      .map(([name, stats]) => {
        // Score baseado em compliance e volume (normalizado para 0-100)
        const complianceScore = stats.compliance // já está em %
        const volumeScore = Math.min((stats.total / 20) * 100, 100) // máximo 100 para 20+ chamados
        const avgScore = (complianceScore + volumeScore) / 2
        
        return {
          category: name.length > 15 ? name.substring(0, 15) + '...' : name,
          compliance: Math.round(stats.compliance),
          volume: Math.round(volumeScore),
          efficiency: Math.round(avgScore)
        }
      })

    // Formatar para Recharts Radar (precisa de formato específico)
    const radarChartData = radarData.length > 0 ? [
      {
        subject: 'Compliance',
        ...radarData.reduce((acc, item, idx) => {
          acc[item.category] = item.compliance
          return acc
        }, {})
      },
      {
        subject: 'Volume',
        ...radarData.reduce((acc, item, idx) => {
          acc[item.category] = item.volume
          return acc
        }, {})
      },
      {
        subject: 'Eficiência',
        ...radarData.reduce((acc, item, idx) => {
          acc[item.category] = item.efficiency
          return acc
        }, {})
      }
    ] : []

    return { monthly, categories, radar: radarData, radarChart: radarChartData }
  }, [technicianStats])

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
              <p className="text-sm text-gray-300 mb-1">Tempo Médio Resolução</p>
              <p className="text-3xl font-bold text-white mb-2">
                {Math.round(technicianStats.avgResolutionTime)} min
              </p>
              {teamStats && (
                <div className="flex items-center gap-2 text-xs">
                  {technicianStats.avgResolutionTime <= teamStats.avgResolutionTime ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-green-400" />
                      <span className="text-green-400">
                        {Math.round(teamStats.avgResolutionTime - technicianStats.avgResolutionTime)} min mais rápido
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 text-red-400" />
                      <span className="text-red-400">
                        {Math.round(technicianStats.avgResolutionTime - teamStats.avgResolutionTime)} min mais lento
                      </span>
                    </>
                  )}
                </div>
              )}
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

          {/* Monitor de Bem-Estar */}
          {isWidgetVisible('wellness') && (
            <WellnessMonitor
              technicianTickets={technicianTickets}
              technicianStats={technicianStats}
              historicalData={technicianStats?.monthlyData || []}
            />
          )}

          {/* Gamificação - Níveis, XP e Badges */}
          {isWidgetVisible('gamification') && gamification && (
            <div className="bg-gradient-to-br from-yellow-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-500/30 shadow-md">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-400" />
                Progresso e Conquistas
              </h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Nível e XP */}
                <div className="lg:col-span-2 bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Nível Atual</p>
                      <p className="text-3xl font-bold text-white">
                        {gamification.currentLevel.level} - {gamification.currentLevel.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400 mb-1">Total de XP</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {gamification.totalXP.toLocaleString('pt-BR')}
                      </p>
                      {gamification.xpEarned > 0 && (
                        <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                          <ArrowUp className="h-3 w-3" />
                          +{gamification.xpEarned} XP hoje
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Barra de Progresso do Nível */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span>Progresso para Nível {gamification.currentLevel.level + 1}</span>
                      <span>
                        {gamification.levelProgress.xpInLevel.toLocaleString('pt-BR')} / {gamification.levelProgress.xpNeededForNext.toLocaleString('pt-BR')} XP
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${gamification.levelProgress.progress}%` }}
                      >
                        {gamification.levelProgress.progress > 15 && (
                          <span className="text-xs font-bold text-white">
                            {gamification.levelProgress.progress.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    {gamification.levelProgress.xpNeeded > 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        Faltam {gamification.levelProgress.xpNeeded.toLocaleString('pt-BR')} XP para o próximo nível
                      </p>
                    )}
                  </div>
                </div>

                {/* Badges Conquistadas */}
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-400">Badges Conquistadas</p>
                    <span className="text-2xl font-bold text-purple-400">
                      {gamification.badges.length}
                    </span>
                  </div>
                  
                  {gamification.badges.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {gamification.badges.slice(0, 5).map((badge, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg border-2 flex items-center gap-2 ${
                            GamificationService.getRarityColor(badge.rarity)
                          }`}
                        >
                          <span className="text-2xl">{badge.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{badge.name}</p>
                            <p className="text-xs text-gray-300 truncate">{badge.description}</p>
                          </div>
                        </div>
                      ))}
                      {gamification.badges.length > 5 && (
                        <p className="text-xs text-gray-400 text-center">
                          +{gamification.badges.length - 5} badges adicionais
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Nenhum badge conquistado ainda</p>
                      <p className="text-xs text-gray-500 mt-1">Continue melhorando para desbloquear badges!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Novos Badges Desbloqueados */}
              {gamification.newBadges && gamification.newBadges.length > 0 && (
                <div className="mt-6 p-4 bg-green-500/20 border-2 border-green-500/50 rounded-lg animate-pulse">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-green-400" />
                    <p className="font-bold text-green-400">Novos Badges Desbloqueados!</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {gamification.newBadges.map((badge, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border-2 flex items-center gap-3 ${
                          GamificationService.getRarityColor(badge.rarity)
                        }`}
                      >
                        <span className="text-3xl">{badge.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">{badge.name}</p>
                          <p className="text-xs text-gray-300">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Alertas Inteligentes */}
          {isWidgetVisible('alerts') && (
            <IntelligentAlerts
            technicianStats={technicianStats}
            teamStats={teamStats}
            technicianTickets={technicianTickets}
              percentileRank={percentileRank}
            />
          )}

          {/* Análise Preditiva */}
          {isWidgetVisible('predictive') && (
            <PredictiveAnalysisComponent
            technicianStats={technicianStats}
            historicalData={technicianStats?.monthlyData || []}
              openTickets={technicianTickets.filter(t => t.Status !== 'Solucionado' && t.Status !== 'Fechado')}
            />
          )}

          {/* Análise Comportamental */}
          {isWidgetVisible('behavioral') && (
            <BehavioralAnalysis
            technicianTickets={technicianTickets}
              technicianStats={technicianStats}
            />
          )}

          {/* Sistema de Metas */}
          {isWidgetVisible('goals') && (
            <PersonalGoals
            technicianName={selectedTechnician}
            technicianStats={technicianStats}
              historicalData={technicianStats?.monthlyData || []}
            />
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

          {/* Evolução Temporal */}
          {isWidgetVisible('timeline') && chartData.monthly.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-md">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-purple-400" />
                Evolução Mensal
              </h4>
              <ResponsiveContainer width="100%" height={350}>
                <RechartsLineChart data={chartData.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="mês" stroke="#9ca3af" />
                  <YAxis yAxisId="left" stroke="#9ca3af" label={{ value: 'SLA Compliance (%)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" label={{ value: 'Tempo (min)', angle: 90, position: 'insideRight', style: { fill: '#f59e0b' } }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="SLA Compliance"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#3b82f6' }}
                    name="SLA Compliance (%)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="Tempo Médio (min)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#f59e0b' }}
                    name="Tempo Médio (min)"
                    strokeDasharray="5 5"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Performance por Categoria */}
          {isWidgetVisible('categories') && chartData.categories.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-md">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <PieChart className="h-6 w-6 text-pink-400" />
                Performance por Categoria
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={chartData.categories}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="total" fill="#3b82f6" name="Total Chamados" />
                      <Bar dataKey="compliance" fill="#10b981" name="SLA Compliance (%)" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {chartData.categories.slice(0, 5).map((cat, idx) => (
                    <div key={idx} className="p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">{cat.name}</span>
                        <span className={`text-sm font-bold ${
                          cat.compliance >= 90 ? 'text-green-400' :
                          cat.compliance >= 70 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {cat.compliance.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{cat.total} chamados</span>
                        <span>Tempo médio: {cat['Tempo Médio']} min</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-600/50 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            cat.compliance >= 90 ? 'bg-green-500' :
                            cat.compliance >= 70 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${cat.compliance}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Análise de Habilidades por Categoria - Gráfico Radar */}
          {isWidgetVisible('radar') && chartData.radar && chartData.radar.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-md">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="h-6 w-6 text-purple-400" />
                Análise de Habilidades por Categoria
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico Radar */}
                <div className="bg-gray-900/50 rounded-lg p-4">
                  {chartData.radar && chartData.radar.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart data={chartData.radar}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis 
                          dataKey="category" 
                          tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 100]}
                          tick={{ fill: '#9ca3af', fontSize: 10 }}
                        />
                        <Radar
                          name="Compliance"
                          dataKey="compliance"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.6}
                        />
                        <Radar
                          name="Eficiência"
                          dataKey="efficiency"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.4}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-96 text-gray-400">
                      <p>Dados insuficientes para o gráfico radar</p>
                    </div>
                  )}
                </div>

                {/* Legenda e Detalhes */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-500/30">
                    <h5 className="font-bold text-white mb-3 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-400" />
                      Interpretação do Gráfico
                    </h5>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-semibold text-blue-400">Compliance:</span> Percentual de SLA atendido em cada categoria
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-semibold text-green-400">Eficiência:</span> Score combinado de compliance e volume
                        </div>
                      </li>
                      <li className="text-xs text-gray-400 mt-3">
                        Categorias mais próximas do centro (0) precisam de mais atenção. Categorias mais externas (100) são seus pontos fortes.
                      </li>
                    </ul>
                  </div>

                  {/* Detalhes por Categoria */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-white mb-3">Pontuações por Categoria</h5>
                    {chartData.radar.map((item, idx) => (
                      <div key={idx} className="bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold text-sm">{item.category}</span>
                          <span className={`text-xs font-bold ${
                            item.efficiency >= 80 ? 'text-green-400' :
                            item.efficiency >= 60 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {item.efficiency}/100
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-400">
                          <span>Compliance: <span className="text-blue-400 font-semibold">{item.compliance}%</span></span>
                          <span>Volume: <span className="text-purple-400 font-semibold">{item.volume}%</span></span>
                        </div>
                        <div className="mt-2 w-full bg-gray-600/50 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              item.efficiency >= 80 ? 'bg-green-500' :
                              item.efficiency >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${item.efficiency}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feed de Atividades */}
          {isWidgetVisible('activity') && (
            <ActivityFeed
              technicianName={selectedTechnician}
              technicianStats={technicianStats}
              gamification={gamification}
            />
          )}

          {/* Relatório Personalizado */}
          {isWidgetVisible('report') && (
            <PerformanceReport
              technicianName={selectedTechnician}
              technicianStats={technicianStats}
              teamStats={teamStats}
              gamification={gamification}
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

