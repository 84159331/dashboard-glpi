import React, { useMemo } from 'react'
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Calendar,
  Zap,
  Target,
  Phone,
  Hourglass,
  BarChart3,
  Sparkles,
  Award,
  Activity
} from 'lucide-react'

const TicketStats = ({ data, onClickOpenTickets, onClickAllTickets, onClickSlaMet, onClickSlaExceeded }) => {
  const stats = useMemo(() => {
    if (!data || data.length === 0) return {}

    const totalTickets = data.length
    const resolvedTickets = data.filter(ticket => 
      ticket.Status === 'Solucionado' || ticket.Status === 'Fechado'
    ).length
    const openTickets = totalTickets - resolvedTickets
    
    // Calcular SLA atendido e extrapolado
    const slaExceeded = data.filter(ticket => 
      ticket['Tempo para resolver excedido'] === 'Sim'
    ).length
    const slaMet = totalTickets - slaExceeded

    // Análise por categoria/motivo
    const categoryStats = data.reduce((acc, ticket) => {
      const category = ticket.Categoria || ticket['Motivo'] || 'Não categorizado'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})

    // Top categorias
    const topCategories = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)

    // Análise por usuário/técnico
    const userStats = data.reduce((acc, ticket) => {
      const user = ticket['Técnico responsável'] || ticket['Usuário'] || 'Não atribuído'
      acc[user] = (acc[user] || 0) + 1
      return acc
    }, {})

    // Top usuários com mais chamados abertos
    const topUsersOpen = Object.entries(userStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)

    // Top usuários com mais SLAs atendidos
    const slaMetByUser = data
      .filter(ticket => ticket['Tempo para resolver excedido'] !== 'Sim')
      .reduce((acc, ticket) => {
        const user = ticket['Técnico responsável'] || ticket['Usuário'] || 'Não atribuído'
        acc[user] = (acc[user] || 0) + 1
        return acc
      }, {})

    const topUsersSlaMet = Object.entries(slaMetByUser)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)

    // SLA extrapolado por categoria
    const slaExceededByCategory = data
      .filter(ticket => ticket['Tempo para resolver excedido'] === 'Sim')
      .reduce((acc, ticket) => {
        const category = ticket.Categoria || ticket['Motivo'] || 'Não categorizado'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {})

    const topSlaExceededCategories = Object.entries(slaExceededByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)

    return {
      totalTickets,
      resolvedTickets,
      openTickets,
      slaMet,
      slaExceeded,
      topCategories,
      topUsersOpen,
      topUsersSlaMet,
      topSlaExceededCategories
    }
  }, [data])

  const cards = [
    {
      title: 'Total em Aberto',
      value: stats.openTickets?.toLocaleString('pt-BR') || '0',
      icon: Clock,
      gradient: 'from-orange-600/20 to-red-600/20',
      border: 'border-orange-500/30',
      iconBg: 'from-orange-500 to-red-500',
      textColor: 'text-orange-400',
      description: 'Chamados aguardando atendimento'
    },
    {
      title: 'Total Atendimentos',
      value: stats.totalTickets?.toLocaleString('pt-BR') || '0',
      icon: Phone,
      gradient: 'from-purple-600/20 to-pink-600/20',
      border: 'border-purple-500/30',
      iconBg: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-400',
      description: 'Total de chamados registrados'
    },
    {
      title: 'SLA Atendido',
      value: stats.slaMet?.toLocaleString('pt-BR') || '0',
      icon: CheckCircle,
      gradient: 'from-green-600/20 to-emerald-600/20',
      border: 'border-green-500/30',
      iconBg: 'from-green-500 to-emerald-500',
      textColor: 'text-green-400',
      description: 'Dentro do prazo acordado'
    },
    {
      title: 'SLA Extrapolado',
      value: stats.slaExceeded?.toLocaleString('pt-BR') || '0',
      icon: Hourglass,
      gradient: 'from-red-600/20 to-rose-600/20',
      border: 'border-red-500/30',
      iconBg: 'from-red-500 to-rose-500',
      textColor: 'text-red-400',
      description: 'Prazo ultrapassado'
    }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Modernizado */}
      <div className="bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-green-600/20 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-blue-500/30 shadow-glow">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              Estatísticas Gerais
            </h3>
          </div>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
            Visão consolidada dos principais indicadores de performance e métricas dos chamados
          </p>
          {stats.totalTickets > 0 && (
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-400" />
                <span>{stats.totalTickets.toLocaleString('pt-BR')} chamados analisados</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-400" />
                <span>{stats.totalTickets > 0 ? Math.round((stats.slaMet / stats.totalTickets) * 100) : 0}% SLA atendido</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${card.gradient} backdrop-blur-sm rounded-xl p-5 md:p-6 border-2 ${card.border} hover:shadow-glow transition-all duration-300 hover:scale-105`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${card.iconBg} rounded-xl shadow-lg`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">{card.title}</p>
                <p className={`text-3xl md:text-4xl font-bold ${card.textColor} mb-2`}>{card.value}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {card.description}
                </p>
                {(index === 0 || index === 1 || index === 2 || index === 3) && (
                  <button
                    onClick={
                      index === 0 ? onClickOpenTickets :
                      index === 1 ? onClickAllTickets :
                      index === 2 ? onClickSlaMet :
                      onClickSlaExceeded
                    }
                    className="mt-3 w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm font-semibold border border-white/20"
                  >
                    Ver Chamados →
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Gráfico de Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            Total em Aberto por Categoria
          </h3>
          <div className="space-y-3">
            {stats.topCategories && stats.topCategories.length > 0 ? (
              stats.topCategories.map(([category, count], index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <span className="text-sm text-gray-300 truncate max-w-xs font-medium">{category}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(count / stats.topCategories[0][1]) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-orange-400 min-w-[2rem]">{count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 border-2 border-green-500/30 shadow-xl flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="h-5 w-5 text-green-400" />
            SLA Atendido
          </h3>
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="rgba(55, 65, 81, 0.5)"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="url(#gradient-green)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54 * (stats.slaMet / stats.totalTickets || 0)} ${2 * Math.PI * 54}`}
                strokeDashoffset="0"
              />
              <defs>
                <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {stats.totalTickets > 0 ? Math.round((stats.slaMet / stats.totalTickets) * 100) : 0}%
              </span>
              <span className="text-xs text-gray-400 mt-1">dentro do prazo</span>
            </div>
          </div>
        </div>
      </div>

      {/* SLA Extrapolado por Categoria */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-red-500/30 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          SLA Extrapolado por Categoria
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.topSlaExceededCategories && stats.topSlaExceededCategories.length > 0 ? (
            stats.topSlaExceededCategories.map(([category, count], index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <span className="text-sm text-gray-300 truncate max-w-xs font-medium">{category}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-700/50 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-rose-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(count / (stats.topSlaExceededCategories[0]?.[1] || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-red-400 min-w-[2rem]">{count}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">Nenhum SLA extrapolado encontrado</p>
          )}
        </div>
      </div>

      {/* Total em Aberto por Usuário e SLA Atendido por Usuário */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-400" />
            Total em Aberto por Usuário
          </h3>
          <div className="space-y-3">
            {stats.topUsersOpen && stats.topUsersOpen.length > 0 ? (
              stats.topUsersOpen.map(([user, count], index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <span className="text-sm text-gray-300 font-medium">{user}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(count / (stats.topUsersOpen[0]?.[1] || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-orange-400 min-w-[2rem]">{count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="h-5 w-5 text-green-400" />
            SLA Atendido por Usuário
          </h3>
          <div className="space-y-3">
            {stats.topUsersSlaMet && stats.topUsersSlaMet.length > 0 ? (
              stats.topUsersSlaMet.map(([user, count], index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <span className="text-sm text-gray-300 font-medium">{user}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(count / (stats.topUsersSlaMet[0]?.[1] || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-green-400 min-w-[2rem]">{count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketStats 