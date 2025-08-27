import React, { useMemo } from 'react'
import { TrendingUp, Users, BarChart3, Activity, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

const StatsCards = ({ data, numericColumns }) => {
  const stats = useMemo(() => {
    const totalRecords = data.length
    
    // Encontrar a coluna numérica com mais valores únicos
    const columnWithMostUniqueValues = numericColumns.reduce((maxCol, col) => {
      const uniqueValues = new Set(data.map(row => row[col]).filter(val => val !== ''))
      const maxUniqueValues = new Set(data.map(row => maxCol).filter(val => val !== ''))
      return uniqueValues.size > maxUniqueValues.size ? col : maxCol
    }, numericColumns[0] || '')

    // Calcular estatísticas para a coluna numérica principal
    let avgValue = 0
    let maxValue = 0
    let minValue = 0
    
    if (columnWithMostUniqueValues) {
      const values = data
        .map(row => parseFloat(row[columnWithMostUniqueValues]))
        .filter(val => !isNaN(val))
      
      if (values.length > 0) {
        avgValue = values.reduce((sum, val) => sum + val, 0) / values.length
        maxValue = Math.max(...values)
        minValue = Math.min(...values)
      }
    }

    return {
      totalRecords,
      avgValue: avgValue.toFixed(2),
      maxValue: maxValue.toFixed(2),
      minValue: minValue.toFixed(2),
      mainColumn: columnWithMostUniqueValues
    }
  }, [data, numericColumns])

  const cards = [
    {
      title: 'Total de Registros',
      value: stats.totalRecords.toLocaleString('pt-BR'),
      icon: Users,
      color: 'card-primary',
      iconColor: 'text-blue-400',
      bgGradient: 'from-blue-500/20 to-purple-600/20',
      borderColor: 'border-blue-400/30',
      description: 'Número total de linhas',
      trend: '+12%',
      trendColor: 'text-green-400'
    },
    {
      title: 'Média',
      value: stats.avgValue,
      icon: TrendingUp,
      color: 'card-success',
      iconColor: 'text-green-400',
      bgGradient: 'from-green-500/20 to-emerald-600/20',
      borderColor: 'border-green-400/30',
      description: `Média de ${stats.mainColumn || 'valores'}`,
      trend: '+5%',
      trendColor: 'text-green-400'
    },
    {
      title: 'Valor Máximo',
      value: stats.maxValue,
      icon: BarChart3,
      color: 'card-accent',
      iconColor: 'text-purple-400',
      bgGradient: 'from-purple-500/20 to-pink-600/20',
      borderColor: 'border-purple-400/30',
      description: `Máximo de ${stats.mainColumn || 'valores'}`,
      trend: '+8%',
      trendColor: 'text-purple-400'
    },
    {
      title: 'Valor Mínimo',
      value: stats.minValue,
      icon: Activity,
      color: 'card-warning',
      iconColor: 'text-yellow-400',
      bgGradient: 'from-yellow-500/20 to-orange-600/20',
      borderColor: 'border-yellow-400/30',
      description: `Mínimo de ${stats.mainColumn || 'valores'}`,
      trend: '-3%',
      trendColor: 'text-red-400'
    }
  ]

  return (
    <div className="grid-responsive">
      {cards.map((card, index) => {
        const IconComponent = card.icon
        return (
          <div 
            key={index} 
            className={`
              dashboard-card ${card.color} animate-fade-in
              hover:shadow-glow transition-all duration-500
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`
                  w-12 h-12 bg-gradient-to-br ${card.bgGradient} 
                  ${card.borderColor} border rounded-xl flex items-center justify-center
                  shadow-soft hover:shadow-medium transition-all duration-300
                `}>
                  <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">{card.title}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-white">{card.value}</p>
                    <span className={`text-xs font-medium ${card.trendColor}`}>
                      {card.trend}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Indicador de status */}
              <div className="flex flex-col items-end space-y-1">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Ativo</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-gray-500">{card.description}</p>
              
              {/* Barra de progresso sutil */}
              <div className="w-full bg-gray-700/30 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full bg-gradient-to-r ${card.bgGradient}`}
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                ></div>
              </div>
              
              {/* Estatísticas adicionais */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Última atualização: Agora</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCards 