import React, { useState, useEffect } from 'react'
import { 
  Zap, 
  Play, 
  Pause, 
  Trash2, 
  Plus, 
  Settings, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Bell,
  Mail,
  MessageSquare,
  Database,
  FileText
} from 'lucide-react'
import { useNotifications } from './Notification'

const AutomationWorkflow = () => {
  const [workflows, setWorkflows] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const { addNotification } = useNotifications()

  useEffect(() => {
    loadWorkflows()
  }, [])

  const loadWorkflows = () => {
    setIsLoading(true)
    
    setTimeout(() => {
      const defaultWorkflows = [
        {
          id: 1,
          name: 'Notificação de SLA',
          description: 'Envia alertas quando tickets estão próximos de exceder SLA',
          status: 'active',
          trigger: 'time_based',
          frequency: 'hourly',
          lastRun: new Date(Date.now() - 1800000).toISOString(),
          nextRun: new Date(Date.now() + 1800000).toISOString(),
          actions: [
            { type: 'email', target: 'gerentes@company.com', template: 'sla_alert' },
            { type: 'slack', channel: '#suporte-ti', message: 'SLA próximo de expirar' }
          ],
          conditions: [
            { field: 'sla_status', operator: 'equals', value: 'warning' },
            { field: 'priority', operator: 'in', value: ['high', 'critical'] }
          ]
        },
        {
          id: 2,
          name: 'Backup Automático',
          description: 'Realiza backup dos dados do dashboard diariamente',
          status: 'active',
          trigger: 'schedule',
          frequency: 'daily',
          lastRun: new Date(Date.now() - 86400000).toISOString(),
          nextRun: new Date(Date.now() + 86400000).toISOString(),
          actions: [
            { type: 'backup', target: 'aws_s3', bucket: 'dashboard-backups' },
            { type: 'notification', message: 'Backup concluído com sucesso' }
          ],
          conditions: []
        },
        {
          id: 3,
          name: 'Relatório Semanal',
          description: 'Gera e envia relatório semanal de performance',
          status: 'paused',
          trigger: 'schedule',
          frequency: 'weekly',
          lastRun: new Date(Date.now() - 604800000).toISOString(),
          nextRun: new Date(Date.now() + 604800000).toISOString(),
          actions: [
            { type: 'report', format: 'pdf', template: 'weekly_performance' },
            { type: 'email', target: 'equipe@company.com', attachment: true }
          ],
          conditions: []
        },
        {
          id: 4,
          name: 'Escalação Automática',
          description: 'Escala tickets não resolvidos para supervisores',
          status: 'active',
          trigger: 'event',
          frequency: 'realtime',
          lastRun: new Date(Date.now() - 3600000).toISOString(),
          nextRun: null,
          actions: [
            { type: 'escalate', target: 'supervisor', level: 'tier2' },
            { type: 'notification', message: 'Ticket escalado automaticamente' }
          ],
          conditions: [
            { field: 'status', operator: 'equals', value: 'pending' },
            { field: 'time_open', operator: 'greater_than', value: '24h' }
          ]
        }
      ]
      
      setWorkflows(defaultWorkflows)
      setIsLoading(false)
    }, 1000)
  }

  const toggleWorkflow = async (workflowId) => {
    const workflow = workflows.find(w => w.id === workflowId)
    if (!workflow) return

    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newStatus = workflow.status === 'active' ? 'paused' : 'active'
      
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: newStatus }
          : w
      ))
      
      addNotification({
        type: 'success',
        title: 'Workflow Atualizado',
        message: `Workflow "${workflow.name}" foi ${newStatus === 'active' ? 'ativado' : 'pausado'}.`,
        duration: 3000
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao atualizar workflow.',
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const runWorkflow = async (workflowId) => {
    const workflow = workflows.find(w => w.id === workflowId)
    if (!workflow) return

    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      addNotification({
        type: 'success',
        title: 'Workflow Executado',
        message: `Workflow "${workflow.name}" foi executado com sucesso.`,
        duration: 4000
      })
      
      // Atualizar última execução
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, lastRun: new Date().toISOString() }
          : w
      ))
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro na Execução',
        message: 'Erro ao executar workflow.',
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteWorkflow = async (workflowId) => {
    const workflow = workflows.find(w => w.id === workflowId)
    if (!workflow) return

    if (!confirm(`Tem certeza que deseja excluir o workflow "${workflow.name}"?`)) {
      return
    }

    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setWorkflows(prev => prev.filter(w => w.id !== workflowId))
      
      addNotification({
        type: 'success',
        title: 'Workflow Excluído',
        message: `Workflow "${workflow.name}" foi excluído com sucesso.`,
        duration: 3000
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao excluir workflow.',
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/20 border-green-400/30'
      case 'paused':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30'
      case 'error':
        return 'text-red-400 bg-red-500/20 border-red-400/30'
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-400/30'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4" />
      case 'paused':
        return <Pause className="h-4 w-4" />
      case 'error':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTriggerIcon = (trigger) => {
    switch (trigger) {
      case 'time_based':
        return <Clock className="h-4 w-4" />
      case 'schedule':
        return <Calendar className="h-4 w-4" />
      case 'event':
        return <Zap className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getActionIcon = (action) => {
    switch (action.type) {
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'slack':
        return <MessageSquare className="h-4 w-4" />
      case 'notification':
        return <Bell className="h-4 w-4" />
      case 'backup':
        return <Database className="h-4 w-4" />
      case 'report':
        return <FileText className="h-4 w-4" />
      case 'escalate':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Automações e Workflows</h2>
          <p className="text-gray-400">Gerencie automações e workflows do sistema</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Workflow</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="dashboard-card card-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total de Workflows</p>
              <p className="text-2xl font-bold text-white">{workflows.length}</p>
            </div>
            <Zap className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="dashboard-card card-success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Ativos</p>
              <p className="text-2xl font-bold text-white">
                {workflows.filter(w => w.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="dashboard-card card-warning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pausados</p>
              <p className="text-2xl font-bold text-white">
                {workflows.filter(w => w.status === 'paused').length}
              </p>
            </div>
            <Pause className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="dashboard-card card-danger">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Com Erro</p>
              <p className="text-2xl font-bold text-white">
                {workflows.filter(w => w.status === 'error').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="dashboard-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-400/30 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                  <p className="text-sm text-gray-400">{workflow.description}</p>
                </div>
              </div>
              
              <div className={`
                px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1
                ${getStatusColor(workflow.status)}
              `}>
                {getStatusIcon(workflow.status)}
                <span>{workflow.status === 'active' ? 'Ativo' : workflow.status === 'paused' ? 'Pausado' : 'Erro'}</span>
              </div>
            </div>

            {/* Workflow Details */}
            <div className="space-y-4">
              {/* Trigger Info */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-400">
                  {getTriggerIcon(workflow.trigger)}
                  <span className="capitalize">{workflow.trigger.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span className="capitalize">{workflow.frequency}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-3">Ações</h4>
                <div className="space-y-2">
                  {workflow.actions.map((action, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      {getActionIcon(action)}
                      <span className="text-gray-300 capitalize">{action.type}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-gray-400">{action.target || action.message || action.format}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              {workflow.conditions.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white mb-3">Condições</h4>
                  <div className="space-y-2">
                    {workflow.conditions.map((condition, index) => (
                      <div key={index} className="text-sm text-gray-400">
                        {condition.field} {condition.operator} {condition.value}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timing Info */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Última execução: {new Date(workflow.lastRun).toLocaleString('pt-BR')}</span>
                {workflow.nextRun && (
                  <span>Próxima execução: {new Date(workflow.nextRun).toLocaleString('pt-BR')}</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-700/50">
                <button
                  onClick={() => toggleWorkflow(workflow.id)}
                  disabled={isLoading}
                  className={`flex items-center space-x-2 text-sm ${
                    workflow.status === 'active' ? 'btn-warning' : 'btn-success'
                  }`}
                >
                  {workflow.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{workflow.status === 'active' ? 'Pausar' : 'Ativar'}</span>
                </button>
                
                <button
                  onClick={() => runWorkflow(workflow.id)}
                  disabled={isLoading}
                  className="btn-primary flex items-center space-x-2 text-sm"
                >
                  <Play className="h-4 w-4" />
                  <span>Executar</span>
                </button>
                
                <button
                  onClick={() => setSelectedWorkflow(workflow)}
                  className="btn-secondary flex items-center space-x-2 text-sm"
                >
                  <Settings className="h-4 w-4" />
                  <span>Configurar</span>
                </button>
                
                <button
                  onClick={() => deleteWorkflow(workflow.id)}
                  disabled={isLoading}
                  className="btn-danger flex items-center space-x-2 text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Criar Novo Workflow</h3>
              <p className="text-gray-400 mb-6">
                Configure um novo workflow de automação para o sistema.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome do Workflow
                  </label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="Ex: Notificação de SLA"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    className="input-modern w-full"
                    rows="3"
                    placeholder="Descreva o propósito do workflow"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Trigger
                    </label>
                    <select className="input-modern w-full">
                      <option value="schedule">Agendado</option>
                      <option value="event">Evento</option>
                      <option value="time_based">Baseado em Tempo</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Frequência
                    </label>
                    <select className="input-modern w-full">
                      <option value="realtime">Tempo Real</option>
                      <option value="hourly">A cada hora</option>
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button className="btn-primary">
                  Criar Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AutomationWorkflow
