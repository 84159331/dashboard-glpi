import React, { useMemo } from 'react'
import { Bell, AlertCircle, TrendingUp, TrendingDown, Clock, Target, Zap, Info } from 'lucide-react'

const IntelligentAlerts = ({ technicianStats, teamStats, technicianTickets, percentileRank }) => {
  const alerts = useMemo(() => {
    if (!technicianStats || !technicianTickets) return []

    const alertList = []

    // 1. Alerta de Risco de SLA
    if (technicianStats.slaCompliance < 80) {
      alertList.push({
        type: 'critical',
        icon: AlertCircle,
        title: 'Atenção: SLA Compliance Baixo',
        message: `Seu SLA compliance está em ${technicianStats.slaCompliance.toFixed(1)}%, abaixo do ideal (80%+). Considere revisar chamados pendentes e priorizar resoluções.`,
        action: 'Revisar chamados pendentes',
        priority: 1
      })
    }

    // 2. Alerta de Tendência de Degradação
    if (teamStats && technicianStats.slaCompliance < teamStats.slaCompliance - 10) {
      alertList.push({
        type: 'warning',
        icon: TrendingDown,
        title: 'Desempenho Abaixo da Equipe',
        message: `Você está ${(teamStats.slaCompliance - technicianStats.slaCompliance).toFixed(1)}% abaixo da média da equipe. Analise áreas de melhoria nas categorias problemáticas.`,
        action: 'Ver análise por categoria',
        priority: 2
      })
    }

    // 3. Alerta de Oportunidade - Bom Desempenho
    if (teamStats && technicianStats.slaCompliance > teamStats.slaCompliance + 10) {
      alertList.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Excelente Desempenho!',
        message: `Parabéns! Você está ${(technicianStats.slaCompliance - teamStats.slaCompliance).toFixed(1)}% acima da média da equipe. Continue mantendo esse padrão!`,
        action: null,
        priority: 5
      })
    }

    // 4. Alerta de Tempo de Resolução Elevado
    if (teamStats && technicianStats.avgResolutionTime > teamStats.avgResolutionTime * 1.3) {
      const diff = technicianStats.avgResolutionTime - teamStats.avgResolutionTime
      alertList.push({
        type: 'warning',
        icon: Clock,
        title: 'Tempo de Resolução Elevado',
        message: `Seu tempo médio de resolução (${Math.round(technicianStats.avgResolutionTime)} min) está ${Math.round(diff)} minutos acima da média da equipe. Considere otimizar processos.`,
        action: 'Ver análise de tempo',
        priority: 2
      })
    }

    // 5. Alerta de Risco de Exceder SLA em Chamados Abertos
    const openTickets = technicianTickets.filter(t => 
      t.Status !== 'Solucionado' && t.Status !== 'Fechado'
    )
    
    if (openTickets.length > 0) {
      // Calcular quantos chamados estão próximos do SLA
      const riskyTickets = openTickets.filter(ticket => {
        const slaStr = ticket['SLA - SLA Tempo para solução'] || ''
        const timeStr = ticket['Tempo para solução'] || ''
        
        if (!slaStr || !timeStr) return false
        
        // Parsear SLA e tempo usado (simplificado)
        const slaMatch = slaStr.match(/(\d+)\s*h/i)
        const timeMatch = timeStr.match(/(\d+)\s*hora|(\d+)\s*minuto/)
        
        if (!slaMatch || !timeMatch) return false
        
        const slaHours = parseInt(slaMatch[1])
        const timeHours = timeMatch[1] ? parseInt(timeMatch[1]) : (timeMatch[2] ? parseInt(timeMatch[2]) / 60 : 0)
        
        // Se já usou mais de 80% do SLA
        return timeHours / slaHours >= 0.8
      }).length

      if (riskyTickets > 0) {
        alertList.push({
          type: 'critical',
          icon: Target,
          title: `${riskyTickets} Chamado(s) com Risco de SLA`,
          message: `${riskyTickets} chamado(s) aberto(s) estão próximos de exceder o SLA. Priorize a resolução desses chamados.`,
          action: 'Ver chamados em risco',
          priority: 1
        })
      }
    }

    // 6. Alerta de Melhoria de Performance
    if (percentileRank !== null && percentileRank >= 90) {
      alertList.push({
        type: 'success',
        icon: Zap,
        title: 'Top Performer!',
        message: `Você está no top ${100 - percentileRank}% da equipe! Seu excelente desempenho está sendo reconhecido.`,
        action: null,
        priority: 4
      })
    }

    // 7. Alerta de Carga de Trabalho
    if (openTickets.length > 15) {
      alertList.push({
        type: 'info',
        icon: Info,
        title: 'Alta Carga de Trabalho',
        message: `Você tem ${openTickets.length} chamados em aberto. Considere priorizar por SLA e complexidade para otimizar seu tempo.`,
        action: 'Ver chamados prioritários',
        priority: 3
      })
    }

    // Ordenar por prioridade (menor número = maior prioridade)
    return alertList.sort((a, b) => a.priority - b.priority)
  }, [technicianStats, teamStats, technicianTickets, percentileRank])

  if (!alerts || alerts.length === 0) {
    return null
  }

  const getAlertStyles = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-500/20 border-red-500/50 text-red-300'
      case 'warning':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-300'
      case 'success':
        return 'bg-green-500/20 border-green-500/50 text-green-300'
      default:
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300'
    }
  }

  const getIconStyles = (type) => {
    switch (type) {
      case 'critical':
        return 'text-red-400'
      case 'warning':
        return 'text-orange-400'
      case 'success':
        return 'text-green-400'
      default:
        return 'text-blue-400'
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-md">
      <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Bell className="h-6 w-6 text-blue-400" />
        Alertas Inteligentes
      </h4>
      
      <div className="space-y-4">
        {alerts.map((alert, idx) => {
          const IconComponent = alert.icon
          return (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${getAlertStyles(alert.type)} animate-slide-up`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-gray-900/50 ${getIconStyles(alert.type)}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-white mb-1">{alert.title}</h5>
                  <p className="text-sm mb-2">{alert.message}</p>
                  {alert.action && (
                    <button className="text-xs font-semibold hover:underline flex items-center gap-1">
                      {alert.action} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default IntelligentAlerts

