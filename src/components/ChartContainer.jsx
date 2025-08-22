import React, { useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

const ChartContainer = ({ 
  data, 
  columns, 
  chartType, 
  numericColumns, 
  categoricalColumns 
}) => {
  const chartData = useMemo(() => {
    if (columns.length === 0) return []

    switch (chartType) {
      case 'bar':
      case 'line':
        return prepareBarLineData(data, columns, numericColumns, categoricalColumns)
      case 'pie':
        return preparePieData(data, columns, numericColumns, categoricalColumns)
      case 'scatter':
        return prepareScatterData(data, columns, numericColumns)
      default:
        return data.slice(0, 50) // Limitar para performance
    }
  }, [data, columns, chartType, numericColumns, categoricalColumns])

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ]

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Selecione colunas válidas para visualizar os dados</p>
        </div>
      )
    }

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {columns.slice(1).map((column, index) => (
                <Bar
                  key={column}
                  dataKey={column}
                  fill={colors[index % colors.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {columns.slice(1).map((column, index) => (
                <Line
                  key={column}
                  type="monotone"
                  dataKey={column}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'scatter':
        if (columns.length < 2) {
          return (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>Selecione pelo menos 2 colunas numéricas para gráfico de dispersão</p>
            </div>
          )
        }
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis type="number" dataKey={columns[0]} name={columns[0]} />
              <YAxis type="number" dataKey={columns[1]} name={columns[1]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Dados" data={chartData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        )

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Tipo de gráfico não suportado</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {getChartTitle(chartType)}
        </h3>
        <p className="text-sm text-gray-600">
          {getChartDescription(chartType, columns)}
        </p>
      </div>
      
      {renderChart()}
    </div>
  )
}

// Funções auxiliares para preparar dados
const prepareBarLineData = (data, columns, numericColumns, categoricalColumns) => {
  if (columns.length < 2) return []

  const categoryCol = categoricalColumns.find(col => columns.includes(col)) || columns[0]
  const valueCols = columns.filter(col => col !== categoryCol)

  // Agrupar dados por categoria
  const grouped = data.reduce((acc, row) => {
    const category = row[categoryCol] || 'Sem categoria'
    if (!acc[category]) {
      acc[category] = {}
      valueCols.forEach(col => acc[category][col] = 0)
    }
    
    valueCols.forEach(col => {
      const value = parseFloat(row[col]) || 0
      acc[category][col] += value
    })
    
    return acc
  }, {})

  return Object.entries(grouped).map(([name, values]) => ({
    name,
    ...values
  }))
}

const preparePieData = (data, columns, numericColumns, categoricalColumns) => {
  if (columns.length < 2) return []

  const categoryCol = categoricalColumns.find(col => columns.includes(col)) || columns[0]
  const valueCol = numericColumns.find(col => columns.includes(col)) || columns[1]

  // Agrupar dados por categoria
  const grouped = data.reduce((acc, row) => {
    const category = row[categoryCol] || 'Sem categoria'
    const value = parseFloat(row[valueCol]) || 0
    acc[category] = (acc[category] || 0) + value
    return acc
  }, {})

  return Object.entries(grouped).map(([name, value]) => ({
    name,
    value
  }))
}

const prepareScatterData = (data, columns, numericColumns) => {
  if (columns.length < 2) return []

  const xCol = numericColumns.find(col => columns.includes(col)) || columns[0]
  const yCol = numericColumns.find(col => columns.includes(col) && col !== xCol) || columns[1]

  return data
    .filter(row => {
      const x = parseFloat(row[xCol])
      const y = parseFloat(row[yCol])
      return !isNaN(x) && !isNaN(y)
    })
    .map(row => ({
      [xCol]: parseFloat(row[xCol]),
      [yCol]: parseFloat(row[yCol])
    }))
}

const getChartTitle = (chartType) => {
  const titles = {
    bar: 'Gráfico de Barras',
    line: 'Gráfico de Linha',
    pie: 'Gráfico de Pizza',
    scatter: 'Gráfico de Dispersão'
  }
  return titles[chartType] || 'Visualização'
}

const getChartDescription = (chartType, columns) => {
  if (columns.length === 0) return 'Selecione colunas para visualizar'
  
  const descriptions = {
    bar: `Mostrando dados de ${columns.length} colunas em formato de barras`,
    line: `Mostrando tendências de ${columns.length} colunas ao longo do tempo`,
    pie: `Distribuição percentual dos dados`,
    scatter: `Correlação entre ${columns[0]} e ${columns[1]}`
  }
  return descriptions[chartType] || 'Visualização dos dados selecionados'
}

export default ChartContainer 