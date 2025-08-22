import React, { useMemo } from 'react'
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Calendar,
  Zap,
  Target
} from 'lucide-react'

const TicketStats = ({ data }) => {
  const stats = useMemo(() => {
    if (!data || data.length === 0) return {}

    const totalTickets = data.length
    const resolvedTickets = data.filter(ticket => 
      ticket.Status === 'Solucionado' || ticket.Status === 'Fechado'
    ).length
    const openTickets = totalTickets - resolvedTickets
    
    // Calcular tempo médio de resolução
    const resolutionTimes = data
      .filter(ticket => ticket['Tempo para solução'])
      .map(ticket => {
        const timeStr = ticket['Tempo para solução']
        // Extrair horas e minutos do formato "X horas Y minutos"
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

    const avgResolutionTime = resolutionTimes.length > 0 
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length 
      : 0

    // Calcular SLA compliance
    const slaExceeded = data.filter(ticket => 
      ticket['Tempo para resolver excedido'] === 'Sim'
    ).length
    const slaCompliance = totalTickets > 0 
      ? ((totalTickets - slaExceeded) / totalTickets * 100).toFixed(1)
      : 100

    // Análise por prioridade
    const priorityStats = data.reduce((acc, ticket) => {
      const priority = ticket.Prioridade || 'Não definida'
      acc[priority] = (acc[priority] || 0) + 1
      return acc
    }, {})

    // Análise por categoria
    const categoryStats = data.reduce((acc, ticket) => {
      const category = ticket.Categoria || 'Não categorizado'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})

    // Top categorias
    const topCategories = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    return {
      totalTickets,
      resolvedTickets,
      openTickets,
      avgResolutionTime: avgResolutionTime.toFixed(1),
      slaCompliance,
      slaExceeded,
      priorityStats,
      topCategories,
      resolutionRate: totalTickets > 0 
        ? ((resolvedTickets / totalTickets) * 100).toFixed(1)
        : 0
    }
  }, [data])

  const cards = [
    {
      title: 'Total de Chamados',
      value: stats.totalTickets?.toLocaleString('pt-BR') || '0',
      icon: Users,
      color: 'bg-blue-500',
      description: 'Chamados registrados'
    },
    {
      title: 'Chamados Resolvidos',
      value: stats.resolvedTickets?.toLocaleString('pt-BR') || '0',
      icon: CheckCircle,
      color: 'bg-green-500',
      description: `${stats.resolutionRate || 0}% de resolução`
    },
    {
      title: 'Chamados Abertos',
      value: stats.openTickets?.toLocaleString('pt-BR') || '0',
      icon: AlertTriangle,
      color: 'bg-orange-500',
      description: 'Aguardando atendimento'
    },
    {
      title: 'Tempo Médio Resolução',
      value: `${stats.avgResolutionTime || 0} min`,
      icon: Clock,
      color: 'bg-purple-500',
      description: 'Tempo médio de solução'
    },
    {
      title: 'Compliance SLA',
      value: `${stats.slaCompliance || 100}%`,
      icon: Target,
      color: 'bg-indigo-500',
      description: 'Dentro do prazo acordado'
    },
    {
      title: 'SLA Excedido',
      value: stats.slaExceeded?.toLocaleString('pt-BR') || '0',
      icon: Zap,
      color: 'bg-red-500',
      description: 'Prazo ultrapassado'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon
          return (
            <div key={index} className="dashboard-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </div>
                <div className={`p-3 rounded-full ${card.color}`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Top Categorias */}
      {stats.topCategories && stats.topCategories.length > 0 && (
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top 5 Categorias de Chamados
          </h3>
          <div className="space-y-3">
            {stats.topCategories.map(([category, count], index) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">
                    #{index + 1}
                  </span>
                  <span className="text-sm text-gray-700 truncate max-w-xs">
                    {category}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${(count / stats.totalTickets) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketStats 