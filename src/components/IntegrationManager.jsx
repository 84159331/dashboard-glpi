import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Database, 
  Zap, 
  Globe, 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Key,
  Server,
  Cloud
} from 'lucide-react'
import { useNotifications } from './Notification'

const IntegrationManager = () => {
  const [integrations, setIntegrations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('glpi')
  const { addNotification } = useNotifications()

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = () => {
    setIsLoading(true)
    
    // Simular carregamento de integrações
    setTimeout(() => {
      const defaultIntegrations = [
        {
          id: 'glpi',
          name: 'GLPI',
          description: 'Sistema de Gestão de Chamados',
          status: 'connected',
          type: 'api',
          icon: Database,
          color: 'blue',
          lastSync: new Date().toISOString(),
          config: {
            url: 'https://glpi.company.com',
            apiKey: '••••••••••••••••',
            version: '10.0.0'
          }
        },
        {
          id: 'jira',
          name: 'Jira',
          description: 'Gestão de Projetos e Issues',
          status: 'disconnected',
          type: 'api',
          icon: Globe,
          color: 'blue',
          lastSync: null,
          config: {
            url: '',
            apiKey: '',
            version: ''
          }
        },
        {
          id: 'slack',
          name: 'Slack',
          description: 'Notificações e Comunicação',
          status: 'connected',
          type: 'webhook',
          icon: Zap,
          color: 'purple',
          lastSync: new Date(Date.now() - 3600000).toISOString(),
          config: {
            webhookUrl: 'https://hooks.slack.com/...',
            channel: '#suporte-ti'
          }
        },
        {
          id: 'email',
          name: 'Email',
          description: 'Notificações por Email',
          status: 'configured',
          type: 'smtp',
          icon: Server,
          color: 'green',
          lastSync: new Date(Date.now() - 7200000).toISOString(),
          config: {
            smtpServer: 'smtp.company.com',
            port: 587,
            username: 'dashboard@company.com'
          }
        },
        {
          id: 'backup',
          name: 'Backup Cloud',
          description: 'Backup Automático dos Dados',
          status: 'connected',
          type: 'storage',
          icon: Cloud,
          color: 'cyan',
          lastSync: new Date(Date.now() - 86400000).toISOString(),
          config: {
            provider: 'AWS S3',
            bucket: 'dashboard-backups',
            frequency: 'daily'
          }
        }
      ]
      
      setIntegrations(defaultIntegrations)
      setIsLoading(false)
    }, 1000)
  }

  const testConnection = async (integrationId) => {
    const integration = integrations.find(i => i.id === integrationId)
    if (!integration) return

    setIsLoading(true)
    
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const success = Math.random() > 0.3 // 70% de sucesso
      
      if (success) {
        addNotification({
          type: 'success',
          title: 'Conexão Testada',
          message: `${integration.name} está funcionando corretamente.`,
          duration: 3000
        })
      } else {
        addNotification({
          type: 'error',
          title: 'Erro de Conexão',
          message: `Não foi possível conectar com ${integration.name}.`,
          duration: 5000
        })
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao testar conexão.',
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const syncData = async (integrationId) => {
    const integration = integrations.find(i => i.id === integrationId)
    if (!integration) return

    setIsLoading(true)
    
    try {
      // Simular sincronização
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      addNotification({
        type: 'success',
        title: 'Sincronização Concluída',
        message: `Dados de ${integration.name} foram sincronizados com sucesso.`,
        duration: 4000
      })
      
      // Atualizar última sincronização
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId 
          ? { ...i, lastSync: new Date().toISOString() }
          : i
      ))
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro na Sincronização',
        message: 'Erro ao sincronizar dados.',
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-green-400 bg-green-500/20 border-green-400/30'
      case 'disconnected':
        return 'text-red-400 bg-red-500/20 border-red-400/30'
      case 'configured':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30'
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-400/30'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Conectado'
      case 'disconnected':
        return 'Desconectado'
      case 'configured':
        return 'Configurado'
      default:
        return 'Desconhecido'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'api':
        return <Database className="h-4 w-4" />
      case 'webhook':
        return <Zap className="h-4 w-4" />
      case 'smtp':
        return <Server className="h-4 w-4" />
      case 'storage':
        return <Cloud className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciador de Integrações</h2>
          <p className="text-gray-400">Configure e gerencie conexões com sistemas externos</p>
        </div>
        <button
          onClick={loadIntegrations}
          disabled={isLoading}
          className="btn-primary flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
        {['glpi', 'jira', 'slack', 'email', 'backup'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${activeTab === tab 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }
            `}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Integrations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const IconComponent = integration.icon
          const isActive = activeTab === integration.id
          
          if (!isActive) return null

          return (
            <div key={integration.id} className="dashboard-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-12 h-12 bg-gradient-to-br from-${integration.color}-500/20 to-${integration.color}-600/20 
                    border border-${integration.color}-400/30 rounded-xl flex items-center justify-center
                  `}>
                    <IconComponent className={`h-6 w-6 text-${integration.color}-400`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                    <p className="text-sm text-gray-400">{integration.description}</p>
                  </div>
                </div>
                
                <div className={`
                  px-3 py-1 rounded-full text-xs font-medium border
                  ${getStatusColor(integration.status)}
                `}>
                  {getStatusText(integration.status)}
                </div>
              </div>

              {/* Configuration */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  {getTypeIcon(integration.type)}
                  <span className="capitalize">{integration.type}</span>
                </div>

                {/* Config Details */}
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  {Object.entries(integration.config).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-sm text-white font-mono">
                        {key.includes('Key') || key.includes('password') 
                          ? '••••••••••••••••' 
                          : value || 'Não configurado'
                        }
                      </span>
                    </div>
                  ))}
                </div>

                {/* Last Sync */}
                {integration.lastSync && (
                  <div className="text-xs text-gray-500">
                    Última sincronização: {new Date(integration.lastSync).toLocaleString('pt-BR')}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-700/50">
                  <button
                    onClick={() => testConnection(integration.id)}
                    disabled={isLoading}
                    className="btn-secondary flex items-center space-x-2 text-sm"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Testar</span>
                  </button>
                  
                  <button
                    onClick={() => syncData(integration.id)}
                    disabled={isLoading || integration.status === 'disconnected'}
                    className="btn-primary flex items-center space-x-2 text-sm"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Sincronizar</span>
                  </button>
                  
                  <button className="btn-secondary flex items-center space-x-2 text-sm">
                    <Settings className="h-4 w-4" />
                    <span>Configurar</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="dashboard-card card-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total de Integrações</p>
              <p className="text-2xl font-bold text-white">{integrations.length}</p>
            </div>
            <Database className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="dashboard-card card-success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Conectadas</p>
              <p className="text-2xl font-bold text-white">
                {integrations.filter(i => i.status === 'connected').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="dashboard-card card-warning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Configuradas</p>
              <p className="text-2xl font-bold text-white">
                {integrations.filter(i => i.status === 'configured').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="dashboard-card card-danger">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Desconectadas</p>
              <p className="text-2xl font-bold text-white">
                {integrations.filter(i => i.status === 'disconnected').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntegrationManager
