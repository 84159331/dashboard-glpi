import React, { useState, useMemo } from 'react'
import { RotateCcw, Download, Filter, BarChart3, Table, PieChart, FolderOpen } from 'lucide-react'
import TicketTable from './TicketTable'
import TicketCharts from './TicketCharts'
import TicketStats from './TicketStats'
import CategoryAnalysis from './CategoryAnalysis'

const Dashboard = ({ data, columns, onReset }) => {
  const [chartType, setChartType] = useState('status')
  const [viewMode, setViewMode] = useState('stats') // stats, charts, table, category

  const handleExportCSV = () => {
    const csvContent = [
      columns.join(';'),
      ...data.map(row => columns.map(col => `"${row[col] || ''}"`).join(';'))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'tickets_glpi.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'stats':
        return <TicketStats data={data} />
      case 'charts':
        return <TicketCharts data={data} chartType={chartType} />
      case 'table':
        return <TicketTable data={data} />
      case 'category':
        return <CategoryAnalysis data={data} />
      default:
        return <TicketStats data={data} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Chamados TI</h2>
          <p className="text-gray-600">
            {data.length} chamados carregados • {columns.length} campos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Novo Arquivo
          </button>
        </div>
      </div>

      {/* Controles do Dashboard */}
      <div className="dashboard-card">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Modo de Visualização
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setViewMode('stats')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                    viewMode === 'stats'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Estatísticas</span>
                </button>
                
                <button
                  onClick={() => setViewMode('charts')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                    viewMode === 'charts'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <PieChart className="h-4 w-4" />
                  <span>Gráficos</span>
                </button>
                
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                    viewMode === 'table'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Table className="h-4 w-4" />
                  <span>Tabela</span>
                </button>
                
                <button
                  onClick={() => setViewMode('category')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                    viewMode === 'category'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FolderOpen className="h-4 w-4" />
                  <span>Por Categoria</span>
                </button>
              </div>

              {viewMode === 'charts' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Análise
                  </label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="status">Distribuição por Status</option>
                    <option value="priority">Chamados por Prioridade</option>
                    <option value="category">Top Categorias</option>
                    <option value="timeline">Evolução Temporal</option>
                    <option value="sla">Análise de SLA</option>
                  </select>
                </div>
              )}

              <div className="text-xs text-gray-500">
                <p>• <strong>Estatísticas:</strong> Visão geral dos KPIs principais</p>
                <p>• <strong>Gráficos:</strong> Visualizações interativas dos dados</p>
                <p>• <strong>Tabela:</strong> Lista detalhada com busca e filtros</p>
                <p>• <strong>Por Categoria:</strong> Análise específica por categoria com avaliação</p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Funcionalidades Disponíveis
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Visualização detalhada de chamados</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Análise por categoria</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Avaliação de soluções</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Métricas de SLA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="dashboard-card">
        {renderContent()}
      </div>

      {/* Insights */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Insights e Recomendações
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Métricas de Performance</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Tempo médio de resolução dos chamados</li>
              <li>• Taxa de resolução no primeiro contato</li>
              <li>• Compliance com SLAs estabelecidos</li>
              <li>• Distribuição de carga por técnico</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Ações Recomendadas</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Identificar categorias com maior volume</li>
              <li>• Analisar chamados que excedem SLA</li>
              <li>• Otimizar processos para redução de tempo</li>
              <li>• Treinamento em categorias problemáticas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 