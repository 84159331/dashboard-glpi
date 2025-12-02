import React, { useState, useEffect, useMemo } from 'react'
import { Target, TrendingUp, CheckCircle, Plus, Edit, Trash2, Calendar, Trophy } from 'lucide-react'

const PersonalGoals = ({ technicianName, technicianStats, historicalData }) => {
  const [goals, setGoals] = useState([])
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    type: 'sla_compliance',
    target: '',
    deadline: '',
    description: ''
  })

  // Carregar metas salvas
  useEffect(() => {
    if (technicianName) {
      const saved = localStorage.getItem(`goals_${technicianName}`)
      if (saved) {
        try {
          setGoals(JSON.parse(saved))
        } catch (e) {
          console.error('Erro ao carregar metas:', e)
        }
      }
    }
  }, [technicianName])

  // Salvar metas
  const saveGoals = (updatedGoals) => {
    if (technicianName) {
      localStorage.setItem(`goals_${technicianName}`, JSON.stringify(updatedGoals))
      setGoals(updatedGoals)
    }
  }

  // Calcular progresso das metas
  const goalsWithProgress = useMemo(() => {
    if (!technicianStats || !goals.length) return []

    return goals.map(goal => {
      let current = 0
      let target = parseFloat(goal.target) || 0
      let progress = 0
      let status = 'pending' // pending, in_progress, achieved, expired

      const deadline = goal.deadline ? new Date(goal.deadline) : null
      const isExpired = deadline && deadline < new Date()

      switch (goal.type) {
        case 'sla_compliance':
          current = technicianStats.slaCompliance
          progress = target > 0 ? (current / target) * 100 : 0
          status = isExpired ? 'expired' : current >= target ? 'achieved' : current > 0 ? 'in_progress' : 'pending'
          break
        
        case 'resolution_time':
          current = technicianStats.avgResolutionTime
          progress = target > 0 ? Math.max(0, (1 - (current / target)) * 100) : 0
          status = isExpired ? 'expired' : current <= target ? 'achieved' : current > 0 ? 'in_progress' : 'pending'
          break
        
        case 'tickets_resolved':
          current = technicianStats.resolved
          progress = target > 0 ? (current / target) * 100 : 0
          status = isExpired ? 'expired' : current >= target ? 'achieved' : current > 0 ? 'in_progress' : 'pending'
          break
        
        case 'sla_exceeded_reduction':
          const exceededRate = technicianStats.total > 0 ? (technicianStats.slaExceeded / technicianStats.total) * 100 : 0
          current = 100 - exceededRate // Inverso
          progress = target > 0 ? (current / target) * 100 : 0
          status = isExpired ? 'expired' : exceededRate <= (100 - target) ? 'achieved' : current > 0 ? 'in_progress' : 'pending'
          break
        
        default:
          break
      }

      return {
        ...goal,
        current: Math.round(current * 10) / 10,
        target,
        progress: Math.min(100, Math.max(0, progress)),
        status,
        isExpired
      }
    })
  }, [goals, technicianStats])

  // Adicionar nova meta
  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.target || !newGoal.deadline) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    const goal = {
      id: Date.now(),
      ...newGoal,
      createdAt: new Date().toISOString(),
      target: parseFloat(newGoal.target)
    }

    const updated = [...goals, goal]
    saveGoals(updated)
    
    // Resetar formulário
    setNewGoal({
      title: '',
      type: 'sla_compliance',
      target: '',
      deadline: '',
      description: ''
    })
    setShowAddGoal(false)
  }

  // Remover meta
  const handleRemoveGoal = (id) => {
    if (confirm('Tem certeza que deseja remover esta meta?')) {
      const updated = goals.filter(g => g.id !== id)
      saveGoals(updated)
    }
  }

  // Formatar tipo de meta
  const formatGoalType = (type) => {
    const types = {
      'sla_compliance': 'SLA Compliance (%)',
      'resolution_time': 'Tempo Médio (min)',
      'tickets_resolved': 'Chamados Resolvidos',
      'sla_exceeded_reduction': 'Redução de SLA Excedido (%)'
    }
    return types[type] || type
  }

  // Formatar valor atual
  const formatCurrentValue = (goal) => {
    switch (goal.type) {
      case 'sla_compliance':
      case 'sla_exceeded_reduction':
        return `${goal.current}%`
      case 'resolution_time':
        return `${Math.round(goal.current)} min`
      case 'tickets_resolved':
        return `${Math.round(goal.current)} chamados`
      default:
        return goal.current
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="h-6 w-6 text-orange-400" />
          Metas Pessoais
        </h4>
        <button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          Nova Meta
        </button>
      </div>

      {/* Formulário de Nova Meta */}
      {showAddGoal && (
        <div className="bg-gray-700/50 rounded-lg p-5 mb-6 border border-gray-600/50 animate-slide-up">
          <h5 className="font-semibold text-white mb-4">Criar Nova Meta</h5>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Título da Meta *</label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ex: Atingir 95% de SLA compliance"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Tipo de Meta *</label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="sla_compliance">SLA Compliance (%)</option>
                  <option value="resolution_time">Tempo Médio de Resolução (min)</option>
                  <option value="tickets_resolved">Chamados Resolvidos</option>
                  <option value="sla_exceeded_reduction">Redução de SLA Excedido (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Valor Alvo *</label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ex: 95"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Prazo *</label>
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Descrição (opcional)</label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows="2"
                placeholder="Adicione uma descrição ou plano de ação..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddGoal}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-semibold"
              >
                Criar Meta
              </button>
              <button
                onClick={() => {
                  setShowAddGoal(false)
                  setNewGoal({
                    title: '',
                    type: 'sla_compliance',
                    target: '',
                    deadline: '',
                    description: ''
                  })
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Metas */}
      {goalsWithProgress.length === 0 ? (
        <div className="text-center py-12 bg-gray-700/30 rounded-lg border border-gray-600/50">
          <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-semibold mb-2">Nenhuma meta definida</p>
          <p className="text-gray-500 text-sm">Crie suas primeiras metas para acompanhar seu progresso!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goalsWithProgress.map((goal) => (
            <div
              key={goal.id}
              className={`p-5 rounded-lg border-2 ${
                goal.status === 'achieved' ? 'bg-green-500/20 border-green-500/50' :
                goal.status === 'expired' ? 'bg-gray-700/50 border-gray-600/50 opacity-60' :
                goal.status === 'in_progress' ? 'bg-blue-500/20 border-blue-500/50' :
                'bg-gray-700/50 border-gray-600/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {goal.status === 'achieved' ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <Target className="h-5 w-5 text-blue-400" />
                    )}
                    <h5 className="font-bold text-white">{goal.title}</h5>
                    {goal.status === 'achieved' && (
                      <span className="px-2 py-1 bg-green-500/30 text-green-300 text-xs font-semibold rounded">
                        Conquistada!
                      </span>
                    )}
                    {goal.status === 'expired' && (
                      <span className="px-2 py-1 bg-gray-500/30 text-gray-300 text-xs font-semibold rounded">
                        Expirada
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    <span className="font-semibold">Tipo:</span> {formatGoalType(goal.type)}
                  </p>
                  {goal.description && (
                    <p className="text-sm text-gray-400 mb-2">{goal.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>Prazo: {goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveGoal(goal.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Remover meta"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Barra de Progresso */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-300">
                    Progresso: {formatCurrentValue(goal)} / {goal.target}{goal.type.includes('%') ? '%' : goal.type.includes('min') ? ' min' : ''}
                  </span>
                  <span className={`font-bold ${
                    goal.status === 'achieved' ? 'text-green-400' :
                    goal.status === 'expired' ? 'text-gray-400' :
                    'text-blue-400'
                  }`}>
                    {goal.progress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      goal.status === 'achieved' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      goal.status === 'expired' ? 'bg-gray-500' :
                      'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PersonalGoals

