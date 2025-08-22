import React, { useMemo } from 'react'
import { TrendingUp, Users, BarChart3, Activity } from 'lucide-react'

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
      color: 'bg-blue-500',
      description: 'Número total de linhas'
    },
    {
      title: 'Média',
      value: stats.avgValue,
      icon: TrendingUp,
      color: 'bg-green-500',
      description: `Média de ${stats.mainColumn || 'valores'}`
    },
    {
      title: 'Valor Máximo',
      value: stats.maxValue,
      icon: BarChart3,
      color: 'bg-purple-500',
      description: `Máximo de ${stats.mainColumn || 'valores'}`
    },
    {
      title: 'Valor Mínimo',
      value: stats.minValue,
      icon: Activity,
      color: 'bg-orange-500',
      description: `Mínimo de ${stats.mainColumn || 'valores'}`
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
  )
}

export default StatsCards 