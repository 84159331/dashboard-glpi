import React, { useState, useMemo } from 'react'
import { RotateCcw, Download, Filter, BarChart3, Table, PieChart, FolderOpen, Star, User, Database } from 'lucide-react'
import TicketTable from './TicketTable'
import TicketCharts from './TicketCharts'
import TicketStats from './TicketStats'
import CategoryAnalysis from './CategoryAnalysis'
import EvaluationSummary from './EvaluationSummary'
import TechnicianPerformance from './TechnicianPerformance'
import CoreplanIntegration from './CoreplanIntegration'
import Breadcrumbs from './Breadcrumbs'
import ErrorBoundary from './ErrorBoundary'

const Dashboard = ({ data, columns, onReset }) => {
  const [chartType, setChartType] = useState('status')
  const [viewMode, setViewMode] = useState('stats') // stats, charts, table, category, evaluations, performance, integration
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
            onClickCategoryOpen={(category) => { setViewMode('table'); setTableFilterMode('open'); setTableInitialSearch(category || '') }}
            onClickCategorySlaExceeded={(category) => { setViewMode('table'); setTableFilterMode('slaExceeded'); setTableInitialSearch(category || '') }}
            onClickUserOpen={(user) => { setViewMode('table'); setTableFilterMode('open'); setTableInitialSearch(user || '') }}
            onClickUserSlaMet={(user) => { setViewMode('table'); setTableFilterMode('slaMet'); setTableInitialSearch(user || '') }}
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
      case 'performance':
        return (
          <ErrorBoundary>
            <TechnicianPerformance data={data} />
          </ErrorBoundary>
        )
      case 'integration':
        return (
          <ErrorBoundary>
            <CoreplanIntegration />
          </ErrorBoundary>
        )
      default:
        return (
          <TicketStats
            data={data}
            onClickOpenTickets={() => { setViewMode('table'); setTableFilterMode('open'); setTableInitialSearch('') }}
            onClickAllTickets={() => { setViewMode('table'); setTableFilterMode('all'); setTableInitialSearch('') }}
            onClickSlaMet={() => { setViewMode('table'); setTableFilterMode('slaMet'); setTableInitialSearch('') }}
            onClickSlaExceeded={() => { setViewMode('table'); setTableFilterMode('slaExceeded'); setTableInitialSearch('') }}
            onClickCategoryOpen={(category) => { setViewMode('table'); setTableFilterMode('open'); setTableInitialSearch(category || '') }}
            onClickCategorySlaExceeded={(category) => { setViewMode('table'); setTableFilterMode('slaExceeded'); setTableInitialSearch(category || '') }}
            onClickUserOpen={(user) => { setViewMode('table'); setTableFilterMode('open'); setTableInitialSearch(user || '') }}
            onClickUserSlaMet={(user) => { setViewMode('table'); setTableFilterMode('slaMet'); setTableInitialSearch(user || '') }}
          />
        )
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
    if (viewMode === 'performance') items.push({ label: 'Análise Individual' })
    if (viewMode === 'integration') items.push({ label: 'Integração GLPI' })
    
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
                
                <button
                  onClick={() => setViewMode('performance')}
                  className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg border transition-all duration-300 text-sm md:text-base ${
                    viewMode === 'performance'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600 shadow-glow scale-105'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:scale-105 active:scale-95'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Individual</span>
                  <span className="sm:hidden">Ind.</span>
                </button>

                <button
                  onClick={() => setViewMode('integration')}
                  className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg border transition-all duration-300 text-sm md:text-base ${
                    viewMode === 'integration'
                      ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border-emerald-600 shadow-glow scale-105'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:scale-105 active:scale-95'
                  }`}
                >
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">Integração</span>
                  <span className="sm:hidden">GLPI</span>
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
                <p>• <strong>Individual:</strong> Análise detalhada de desempenho por técnico com comparação e recomendações</p>
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
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Análise individual de desempenho</span>
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
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700/60 shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white">Insights e Recomendações</h3>
            <p className="text-sm text-gray-400 mt-1">Resumo rápido do que acompanhar e do que fazer em seguida</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <h4 className="text-base font-bold text-white mb-3">Métricas que importam</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                <p className="text-xs text-gray-400">Resolução</p>
                <p className="text-sm text-gray-200 font-semibold mt-1">Tempo (mediana e p90)</p>
              </div>
              <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                <p className="text-xs text-gray-400">SLA</p>
                <p className="text-sm text-gray-200 font-semibold mt-1">Atendido vs Extrapolado</p>
              </div>
              <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                <p className="text-xs text-gray-400">Backlog</p>
                <p className="text-sm text-gray-200 font-semibold mt-1">Abertos e envelhecidos</p>
              </div>
              <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                <p className="text-xs text-gray-400">Distribuição</p>
                <p className="text-sm text-gray-200 font-semibold mt-1">Carga por técnico</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <h4 className="text-base font-bold text-white mb-3">Ações recomendadas</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-orange-400"></div>
                <div>
                  <p className="text-sm text-white font-semibold">Atacar SLAs extrapolados</p>
                  <p className="text-xs text-gray-400 mt-0.5">Priorize as categorias com maior extrapolação.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-purple-400"></div>
                <div>
                  <p className="text-sm text-white font-semibold">Reduzir backlog antigo</p>
                  <p className="text-xs text-gray-400 mt-0.5">Limpe chamados envelhecidos para reduzir risco.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-emerald-400"></div>
                <div>
                  <p className="text-sm text-white font-semibold">Padronizar soluções</p>
                  <p className="text-xs text-gray-400 mt-0.5">Crie checklists nas categorias recorrentes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard