import React, { useState, useEffect } from 'react'
import { Settings, Eye, EyeOff, GripVertical, X } from 'lucide-react'

const DashboardCustomizer = ({ technicianName, onLayoutChange, currentLayout }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [availableWidgets] = useState([
    { id: 'kpis', name: 'KPIs Principais', defaultVisible: true },
    { id: 'gamification', name: 'Gamificação e Conquistas', defaultVisible: true },
    { id: 'alerts', name: 'Alertas Inteligentes', defaultVisible: true },
    { id: 'predictive', name: 'Análise Preditiva', defaultVisible: true },
    { id: 'behavioral', name: 'Análise Comportamental', defaultVisible: true },
    { id: 'goals', name: 'Metas Pessoais', defaultVisible: true },
    { id: 'recommendations', name: 'Recomendações', defaultVisible: true },
    { id: 'comparison', name: 'Comparação com Equipe', defaultVisible: true },
    { id: 'timeline', name: 'Evolução Temporal', defaultVisible: true },
    { id: 'categories', name: 'Performance por Categoria', defaultVisible: true },
    { id: 'radar', name: 'Habilidades (Gráfico Radar)', defaultVisible: true },
    { id: 'wellness', name: 'Monitor de Bem-Estar', defaultVisible: true },
    { id: 'activity', name: 'Feed de Atividades', defaultVisible: false },
    { id: 'report', name: 'Relatório Personalizado', defaultVisible: true }
  ])

  const [widgets, setWidgets] = useState(() => {
    if (technicianName) {
      const saved = localStorage.getItem(`dashboard_layout_${technicianName}`)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return availableWidgets.map(w => ({ ...w, visible: w.defaultVisible }))
        }
      }
    }
    return availableWidgets.map(w => ({ ...w, visible: w.defaultVisible }))
  })

  useEffect(() => {
    if (technicianName && widgets) {
      localStorage.setItem(`dashboard_layout_${technicianName}`, JSON.stringify(widgets))
      if (onLayoutChange) {
        onLayoutChange(widgets.filter(w => w.visible).map(w => w.id))
      }
    }
  }, [widgets, technicianName, onLayoutChange])

  const toggleWidget = (widgetId) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ))
  }

  const resetLayout = () => {
    if (confirm('Deseja restaurar o layout padrão? Todas as customizações serão perdidas.')) {
      const defaultWidgets = availableWidgets.map(w => ({ ...w, visible: w.defaultVisible }))
      setWidgets(defaultWidgets)
    }
  }

  const visibleCount = widgets.filter(w => w.visible).length
  const hiddenCount = widgets.filter(w => !w.visible).length

  return (
    <>
      {/* Botão para abrir customizador */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm font-semibold"
        title="Personalizar Dashboard"
      >
        <Settings className="h-4 w-4" />
        <span className="hidden sm:inline">Personalizar</span>
      </button>

      {/* Modal de Customização */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl border-2 border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Settings className="h-6 w-6" />
                    Personalizar Dashboard
                  </h3>
                  <p className="text-gray-300 text-sm mt-1">
                    Escolha quais seções exibir no seu dashboard personalizado
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
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  <span className="text-green-400 font-semibold">{visibleCount} visíveis</span>
                  {' • '}
                  <span className="text-gray-500">{hiddenCount} ocultos</span>
                </div>
                <button
                  onClick={resetLayout}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Restaurar padrão
                </button>
              </div>

              <div className="space-y-2">
                {widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      widget.visible
                        ? 'bg-blue-500/20 border-blue-500/50'
                        : 'bg-gray-700/50 border-gray-600/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="h-5 w-5 text-gray-500 cursor-move" />
                      <div>
                        <p className={`font-semibold ${widget.visible ? 'text-white' : 'text-gray-400'}`}>
                          {widget.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {widget.visible ? 'Visível no dashboard' : 'Oculto do dashboard'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleWidget(widget.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        widget.visible
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                      }`}
                      title={widget.visible ? 'Ocultar' : 'Mostrar'}
                    >
                      {widget.visible ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                ))}
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

export default DashboardCustomizer

