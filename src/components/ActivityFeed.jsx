import React, { useMemo } from 'react'
import { Activity, Award, TrendingUp, Clock, CheckCircle } from 'lucide-react'

const ActivityFeed = ({ technicianName, technicianStats, gamification }) => {
  const activities = useMemo(() => {
    if (!technicianName || !technicianStats) return []

    const feed = []

    // Atividades recentes baseadas em dados
    if (technicianStats.resolved > 0) {
      feed.push({
        type: 'resolution',
        icon: CheckCircle,
        color: 'text-green-400',
        message: `${technicianStats.resolved} chamado(s) resolvido(s)`,
        timestamp: new Date().toISOString(),
        priority: 1
      })
    }

    // Novos badges
    if (gamification && gamification.newBadges && gamification.newBadges.length > 0) {
      gamification.newBadges.forEach(badge => {
        feed.push({
          type: 'badge',
          icon: Award,
          color: 'text-yellow-400',
          message: `Novo badge desbloqueado: ${badge.name}`,
          timestamp: badge.earnedDate || new Date().toISOString(),
          priority: 0
        })
      })
    }


    // Melhorias de performance
    if (technicianStats.slaCompliance >= 95) {
      feed.push({
        type: 'improvement',
        icon: TrendingUp,
        color: 'text-green-400',
        message: 'Excelente SLA compliance alcançado!',
        timestamp: new Date().toISOString(),
        priority: 2
      })
    }

    // Ordenar por prioridade e data
    return feed.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority
      return new Date(b.timestamp) - new Date(a.timestamp)
    }).slice(0, 10) // Limitar a 10 atividades mais recentes
  }, [technicianName, technicianStats, gamification])

  if (activities.length === 0) {
    return null
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins} min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays} dias atrás`
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-md">
      <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Activity className="h-6 w-6 text-blue-400" />
        Feed de Atividades
      </h4>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {activities.map((activity, idx) => {
          const IconComponent = activity.icon
          return (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50 hover:bg-gray-700/50 transition-colors"
            >
              <div className={`p-2 rounded-lg bg-gray-800/50 ${activity.color}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{activity.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ActivityFeed

