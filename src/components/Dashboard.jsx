import React, { useState, useMemo } from 'react'
import { RotateCcw, Download, Filter, BarChart3, Table, PieChart, FolderOpen, Star } from 'lucide-react'
import TicketTable from './TicketTable'
import TicketCharts from './TicketCharts'
import TicketStats from './TicketStats'
import CategoryAnalysis from './CategoryAnalysis'
import EvaluationSummary from './EvaluationSummary'
import Breadcrumbs from './Breadcrumbs'

const Dashboard = ({ data, columns, onReset }) => {
  const [chartType, setChartType] = useState('status')
  const [viewMode, setViewMode] = useState('stats') // stats, charts, table, category, evaluations
  const [tableFilterMode, setTableFilterMode] = useState('none')
  const [tableInitialSearch, setTableInitialSearch] = useState('')

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
        return (
          <TicketStats
            data={data}
            onClickOpenTickets={() => { setViewMode('table'); setTableFilterMode('open'); setTableInitialSearch('') }}
            onClickAllTickets={() => { setViewMode('table'); setTableFilterMode('all'); setTableInitialSearch('') }}
            onClickSlaMet={() => { setViewMode('table'); setTableFilterMode('slaMet'); setTableInitialSearch('') }}
            onClickSlaExceeded={() => { setViewMode('table'); setTableFilterMode('slaExceeded'); setTableInitialSearch('') }}
          />
        )
      case 'charts':
        return <TicketCharts data={data} chartType={chartType} />
      case 'table':
        return <TicketTable data={data} filterMode={tableFilterMode} initialSearchTerm={tableInitialSearch} />
      case 'category':
        return <CategoryAnalysis data={data} />
      case 'evaluations':
        return (
          <EvaluationSummary
            onJumpToTicket={(id) => {
              setViewMode('table')
              setTableFilterMode('all')
              setTableInitialSearch(id)
            }}
          />
        )
      default:
        return <TicketStats data={data} />
    }
  }

  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: 'Dashboard', onClick: () => setViewMode('stats') }
    ]
    
    if (viewMode === 'charts') items.push({ label: 'Gráficos' })
    if (viewMode === 'table') items.push({ label: 'Tabela de Chamados' })
    if (viewMode === 'category') items.push({ label: 'Análise por Categoria' })
    if (viewMode === 'evaluations') items.push({ label: 'Avaliações' })
    
    return items
  }, [viewMode])

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Header do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Dashboard de Chamados TI</h2>
          <p className="text-sm md:text-base text-gray-400">
            {data.length.toLocaleString('pt-BR')} chamados carregados • {columns.length} campos disponíveis
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-soft hover:shadow-medium text-sm md:text-base"
            title="Exportar dados para CSV"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">Exportar</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-soft hover:shadow-medium text-sm md:text-base"
            title="Carregar novo arquivo"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Arquivo</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* Controles do Dashboard */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Modo de Visualização
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                <button
                  onClick={() => setViewMode('stats')}
                  className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg border transition-all duration-300 text-sm md:text-base ${
                    viewMode === 'stats'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-glow scale-105'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:scale-105 active:scale-95'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Estatísticas</span>
                  <span className="sm:hidden">Stats</span>
                </button>
                
                <button
                  onClick={() => setViewMode('charts')}
                  className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg border transition-all duration-300 text-sm md:text-base ${
                    viewMode === 'charts'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-glow scale-105'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:scale-105 active:scale-95'
                  }`}
                >
                  <PieChart className="h-4 w-4" />
                  <span className="hidden sm:inline">Gráficos</span>
                  <span className="sm:hidden">Gráf.</span>
                </button>
                
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg border transition-all duration-300 text-sm md:text-base ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-glow scale-105'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:scale-105 active:scale-95'
                  }`}
                >
                  <Table className="h-4 w-4" />
                  <span>Tabela</span>
                </button>
                
                <button
                  onClick={() => setViewMode('category')}
                  className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg border transition-all duration-300 text-sm md:text-base ${
                    viewMode === 'category'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-glow scale-105'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:scale-105 active:scale-95'
                  }`}
                >
                  <FolderOpen className="h-4 w-4" />
                  <span className="hidden lg:inline">Por Categoria</span>
                  <span className="lg:hidden">Categoria</span>
                </button>
                
                <button
                  onClick={() => setViewMode('evaluations')}
                  className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg border transition-all duration-300 text-sm md:text-base ${
                    viewMode === 'evaluations'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-glow scale-105'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:scale-105 active:scale-95'
                  }`}
                >
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">Avaliações</span>
                  <span className="sm:hidden">Aval.</span>
                </button>
              </div>

              {viewMode === 'charts' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Análise
                  </label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <p>• <strong>Avaliações:</strong> Resumo e histórico das avaliações realizadas</p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-4">
              Funcionalidades Disponíveis
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Visualização detalhada de chamados</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Análise por categoria</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Avaliação de soluções</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Métricas de SLA</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Histórico de avaliações</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        {renderContent()}
      </div>

      {/* Insights */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          Insights e Recomendações
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-white">Métricas de Performance</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Tempo médio de resolução dos chamados</li>
              <li>• Taxa de resolução no primeiro contato</li>
              <li>• Compliance com SLAs estabelecidos</li>
              <li>• Distribuição de carga por técnico</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-white">Ações Recomendadas</h4>
            <ul className="text-sm text-gray-400 space-y-1">
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