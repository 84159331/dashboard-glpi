import React, { useState, useEffect } from 'react'
import { Filter, Save, X, Plus, Trash2, Search } from 'lucide-react'

const AdvancedFilters = ({ onFilterApply, data }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [savedFilters, setSavedFilters] = useState([])
  const [currentFilter, setCurrentFilter] = useState({
    name: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    technician: 'all',
    slaStatus: 'all',
    dateRange: 'all'
  })

  // Carregar filtros salvos
  useEffect(() => {
    const saved = localStorage.getItem('saved_filters')
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved))
      } catch (e) {
        console.error('Erro ao carregar filtros:', e)
      }
    }
  }, [])

  // Obter valores únicos para filtros
  const uniqueValues = React.useMemo(() => {
    if (!data || data.length === 0) return { statuses: [], priorities: [], categories: [], technicians: [] }

    const statuses = [...new Set(data.map(t => t.Status).filter(Boolean))].sort()
    const priorities = [...new Set(data.map(t => t.Prioridade).filter(Boolean))].sort()
    const categories = [...new Set(data.map(t => t.Categoria || t['Motivo']).filter(Boolean))].sort()
    const technicians = [...new Set(data.map(t => t['Técnico responsável'] || t['Atribuído - Técnico']).filter(Boolean))].sort()

    return { statuses, priorities, categories, technicians }
  }, [data])

  const saveFilter = () => {
    if (!currentFilter.name.trim()) {
      alert('Dê um nome ao filtro antes de salvar')
      return
    }

    const newFilter = {
      id: Date.now(),
      ...currentFilter,
      createdAt: new Date().toISOString()
    }

    const updated = [...savedFilters, newFilter]
    setSavedFilters(updated)
    localStorage.setItem('saved_filters', JSON.stringify(updated))
    
    alert(`Filtro "${currentFilter.name}" salvo com sucesso!`)
    
    // Resetar
    setCurrentFilter({
      name: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      technician: 'all',
      slaStatus: 'all',
      dateRange: 'all'
    })
  }

  const deleteFilter = (id) => {
    if (confirm('Deseja excluir este filtro salvo?')) {
      const updated = savedFilters.filter(f => f.id !== id)
      setSavedFilters(updated)
      localStorage.setItem('saved_filters', JSON.stringify(updated))
    }
  }

  const applyFilter = (filter) => {
    setCurrentFilter(filter)
    if (onFilterApply) {
      onFilterApply(filter)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm font-semibold"
        title="Filtros Avançados"
      >
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline">Filtros</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl border-2 border-gray-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Filter className="h-6 w-6" />
                    Filtros Avançados
                  </h3>
                  <p className="text-gray-300 text-sm mt-1">
                    Crie e salve filtros personalizados para análises rápidas
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Criar Novo Filtro */}
                <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600/50">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-purple-400" />
                    Criar Novo Filtro
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Nome do Filtro *</label>
                      <input
                        type="text"
                        value={currentFilter.name}
                        onChange={(e) => setCurrentFilter({ ...currentFilter, name: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Ex: Chamados Urgentes"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Status</label>
                        <select
                          value={currentFilter.status}
                          onChange={(e) => setCurrentFilter({ ...currentFilter, status: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="all">Todos</option>
                          {uniqueValues.statuses.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Prioridade</label>
                        <select
                          value={currentFilter.priority}
                          onChange={(e) => setCurrentFilter({ ...currentFilter, priority: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="all">Todas</option>
                          {uniqueValues.priorities.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Categoria</label>
                      <select
                        value={currentFilter.category}
                        onChange={(e) => setCurrentFilter({ ...currentFilter, category: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">Todas</option>
                        {uniqueValues.categories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">SLA Status</label>
                      <select
                        value={currentFilter.slaStatus}
                        onChange={(e) => setCurrentFilter({ ...currentFilter, slaStatus: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">Todos</option>
                        <option value="met">SLA Atendido</option>
                        <option value="exceeded">SLA Excedido</option>
                        <option value="at_risk">Em Risco</option>
                      </select>
                    </div>

                    <button
                      onClick={saveFilter}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all font-semibold"
                    >
                      <Save className="h-4 w-4" />
                      Salvar Filtro
                    </button>
                  </div>
                </div>

                {/* Filtros Salvos */}
                <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600/50">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Search className="h-5 w-5 text-blue-400" />
                    Filtros Salvos ({savedFilters.length})
                  </h4>

                  {savedFilters.length === 0 ? (
                    <div className="text-center py-12">
                      <Filter className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Nenhum filtro salvo ainda</p>
                      <p className="text-gray-500 text-xs mt-1">Crie seu primeiro filtro ao lado</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                      {savedFilters.map((filter) => (
                        <div
                          key={filter.id}
                          className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50 hover:border-purple-500/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h5 className="font-semibold text-white mb-1">{filter.name}</h5>
                              <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                                {filter.status !== 'all' && (
                                  <span className="px-2 py-1 bg-blue-500/20 rounded">Status: {filter.status}</span>
                                )}
                                {filter.priority !== 'all' && (
                                  <span className="px-2 py-1 bg-yellow-500/20 rounded">Prioridade: {filter.priority}</span>
                                )}
                                {filter.category !== 'all' && (
                                  <span className="px-2 py-1 bg-purple-500/20 rounded">Categoria: {filter.category}</span>
                                )}
                                {filter.slaStatus !== 'all' && (
                                  <span className="px-2 py-1 bg-red-500/20 rounded">SLA: {filter.slaStatus}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => applyFilter(filter)}
                                className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                                title="Aplicar filtro"
                              >
                                <Search className="h-4 w-4 text-white" />
                              </button>
                              <button
                                onClick={() => deleteFilter(filter.id)}
                                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                title="Excluir filtro"
                              >
                                <Trash2 className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-700/50 p-4 border-t border-gray-700 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdvancedFilters

