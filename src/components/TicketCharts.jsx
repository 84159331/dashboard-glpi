import React, { useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const TicketCharts = ({ data, chartType }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    switch (chartType) {
      case 'status':
        return prepareStatusData(data)
      case 'priority':
        return preparePriorityData(data)
      case 'category':
        return prepareCategoryData(data)
      case 'timeline':
        return prepareTimelineData(data)
      case 'sla':
        return prepareSLAData(data)
      default:
        return []
    }
  }, [data, chartType])

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ]

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Nenhum dado disponível para visualização</p>
        </div>
      )
    }

    switch (chartType) {
      case 'status':
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

      case 'priority':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'category':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={200} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'timeline':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="tickets" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Chamados"
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'sla':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="dentroSLA" fill="#10b981" name="Dentro do SLA" />
              <Bar dataKey="excedidoSLA" fill="#ef4444" name="SLA Excedido" />
            </BarChart>
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

  const getChartTitle = () => {
    const titles = {
      status: 'Distribuição por Status',
      priority: 'Chamados por Prioridade',
      category: 'Top Categorias',
      timeline: 'Evolução Temporal',
      sla: 'Análise de SLA'
    }
    return titles[chartType] || 'Análise de Chamados'
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {getChartTitle()}
        </h3>
      </div>
      
      {renderChart()}
    </div>
  )
}

// Funções auxiliares para preparar dados
const prepareStatusData = (data) => {
  const statusCount = data.reduce((acc, ticket) => {
    const status = ticket.Status || 'Não definido'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  return Object.entries(statusCount).map(([name, value]) => ({
    name,
    value
  }))
}

const preparePriorityData = (data) => {
  const priorityCount = data.reduce((acc, ticket) => {
    const priority = ticket.Prioridade || 'Não definida'
    acc[priority] = (acc[priority] || 0) + 1
    return acc
  }, {})

  return Object.entries(priorityCount).map(([name, value]) => ({
    name,
    value
  }))
}

const prepareCategoryData = (data) => {
  const categoryCount = data.reduce((acc, ticket) => {
    const category = ticket.Categoria || 'Não categorizado'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})

  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.length > 50 ? name.substring(0, 50) + '...' : name,
      value
    }))
}

const prepareTimelineData = (data) => {
  const dateCount = data.reduce((acc, ticket) => {
    const dateStr = ticket['Data de abertura']
    if (dateStr) {
      const date = new Date(dateStr.split(' ')[0].split('/').reverse().join('-'))
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`
      acc[monthYear] = (acc[monthYear] || 0) + 1
    }
    return acc
  }, {})

  return Object.entries(dateCount)
    .sort(([a], [b]) => {
      const [monthA, yearA] = a.split('/')
      const [monthB, yearB] = b.split('/')
      return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1)
    })
    .map(([date, tickets]) => ({
      date,
      tickets
    }))
}

const prepareSLAData = (data) => {
  const slaStats = data.reduce((acc, ticket) => {
    const sla = ticket['Tempo para resolver excedido'] === 'Sim' ? 'excedidoSLA' : 'dentroSLA'
    acc[sla] = (acc[sla] || 0) + 1
    return acc
  }, {})

  return [{
    name: 'Compliance SLA',
    dentroSLA: slaStats.dentroSLA || 0,
    excedidoSLA: slaStats.excedidoSLA || 0
  }]
}

export default TicketCharts 