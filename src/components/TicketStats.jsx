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
  Hourglass
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
      color: 'bg-orange-500',
      description: 'Chamados aguardando atendimento'
    },
    {
      title: 'Total Atendimentos',
      value: stats.totalTickets?.toLocaleString('pt-BR') || '0',
      icon: Phone,
      color: 'bg-purple-500',
      description: 'Total de chamados registrados'
    },
    {
      title: 'SLA Atendido',
      value: stats.slaMet?.toLocaleString('pt-BR') || '0',
      icon: CheckCircle,
      color: 'bg-green-500',
      description: 'Dentro do prazo acordado'
    },
    {
      title: 'SLA Extrapolado',
      value: stats.slaExceeded?.toLocaleString('pt-BR') || '0',
      icon: Hourglass,
      color: 'bg-red-500',
      description: 'Prazo ultrapassado'
    }
  ]

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon
          return (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${card.color}`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {card.description}
                  {index === 0 && (
                    <button
                      onClick={onClickOpenTickets}
                      className="ml-2 text-blue-400 hover:text-blue-300 underline underline-offset-2"
                    >
                      Ver chamados
                    </button>
                  )}
                  {index === 1 && (
                    <button
                      onClick={onClickAllTickets}
                      className="ml-2 text-blue-400 hover:text-blue-300 underline underline-offset-2"
                    >
                      Ver chamados
                    </button>
                  )}
                  {index === 2 && (
                    <button
                      onClick={onClickSlaMet}
                      className="ml-2 text-blue-400 hover:text-blue-300 underline underline-offset-2"
                    >
                      Ver chamados
                    </button>
                  )}
                  {index === 3 && (
                    <button
                      onClick={onClickSlaExceeded}
                      className="ml-2 text-blue-400 hover:text-blue-300 underline underline-offset-2"
                    >
                      Ver chamados
                    </button>
                  )}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Gráfico de Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Total em Aberto por Categoria</h3>
          <div className="space-y-3">
            {stats.topCategories && stats.topCategories.length > 0 ? (
              stats.topCategories.map(([category, count], index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate max-w-xs">{category}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${(count / stats.topCategories[0][1]) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-white min-w-[2rem]">{count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-white mb-6">SLA Atendido</h3>
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#374151"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#10B981"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 54 * (stats.slaMet / stats.totalTickets || 0)} ${2 * Math.PI * 54}`}
                strokeDashoffset="0"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {stats.totalTickets > 0 ? Math.round((stats.slaMet / stats.totalTickets) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SLA Extrapolado por Categoria */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">SLA Extrapolado por Categoria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.topSlaExceededCategories && stats.topSlaExceededCategories.length > 0 ? (
            stats.topSlaExceededCategories.map(([category, count], index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 truncate max-w-xs">{category}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(count / (stats.topSlaExceededCategories[0]?.[1] || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-white min-w-[2rem]">{count}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">Nenhum SLA extrapolado encontrado</p>
          )}
        </div>
      </div>

      {/* Total em Aberto por Usuário e SLA Atendido por Usuário */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Total em Aberto por Usuário</h3>
          <div className="space-y-3">
            {stats.topUsersOpen && stats.topUsersOpen.length > 0 ? (
              stats.topUsersOpen.map(([user, count], index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{user}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${(count / (stats.topUsersOpen[0]?.[1] || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-white min-w-[2rem]">{count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">SLA Atendido por Usuário</h3>
          <div className="space-y-3">
            {stats.topUsersSlaMet && stats.topUsersSlaMet.length > 0 ? (
              stats.topUsersSlaMet.map(([user, count], index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{user}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(count / (stats.topUsersSlaMet[0]?.[1] || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-white min-w-[2rem]">{count}</span>
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