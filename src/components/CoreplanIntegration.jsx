import React, { useState, useEffect, useRef } from 'react'
import { 
  Database, 
  Zap, 
  Bell, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  Activity,
  ExternalLink,
  Download,
  Upload,
  Shield,
  Key,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react'
import Papa from 'papaparse'
import { useNotifications } from './Notification'

// Helper functions para chamar GLPI diretamente via proxy
const glpiInitSession = async ({ appToken, userToken, username, password }) => {
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (appToken) headers['App-Token'] = appToken
  
  if (userToken) {
    headers['Authorization'] = `user_token ${userToken}`
  } else if (username && password) {
    headers['Authorization'] = `Basic ${btoa(`${username}:${password}`)}`
  }
  
  const response = await fetch('/glpi-proxy/apirest.php/initSession', {
    method: 'GET',
    headers
  })
  
  if (!response.ok) {
    if (response.status === 401) throw new Error('Credenciais inválidas')
    throw new Error(`Erro de autenticação: ${response.status}`)
  }
  
  const data = await response.json()
  if (!data.session_token) throw new Error('Token de sessão não recebido')
  return data.session_token
}

const glpiKillSession = async (sessionToken, appToken) => {
  try {
    const headers = { 'Session-Token': sessionToken }
    if (appToken) headers['App-Token'] = appToken
    await fetch('/glpi-proxy/apirest.php/killSession', { method: 'GET', headers })
  } catch {
    // ignore
  }
}

const glpiSearchTickets = async (sessionToken, appToken, range = '0-500') => {
  const headers = {
    'Content-Type': 'application/json',
    'Session-Token': sessionToken
  }
  if (appToken) headers['App-Token'] = appToken
  
  const response = await fetch(`/glpi-proxy/apirest.php/search/Ticket?range=${range}`, {
    method: 'GET',
    headers
  })
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar tickets: ${response.status}`)
  }
  
  const data = await response.json()
  return Array.isArray(data?.data) ? data.data : []
}

const formatTicket = (raw) => {
  const statusMap = { 1: 'Novo', 2: 'Em andamento', 3: 'Aguardando Cliente', 4: 'Aguardando Terceiro', 5: 'Resolvido', 6: 'Fechado' }
  const priorityMap = { 1: 'Baixa', 2: 'Média', 3: 'Alta', 4: 'Crítica', 5: 'Muito Crítica', 6: 'Urgente' }
  
  const id = raw.id || raw['2'] || 'N/A'
  const title = raw.name || raw['1'] || 'Sem título'
  const status = statusMap[raw.status || raw['12']] || 'Desconhecido'
  const priority = priorityMap[raw.priority || raw['3']] || 'Não Definida'
  const createdAt = raw.date_creation || raw['15'] || new Date().toISOString()
  const requester = raw.users_id_recipient || raw['4'] || 'N/A'
  const assignedTo = raw.users_id_assign || raw['5'] || 'N/A'
  const category = raw.itilcategories_id || raw['7'] || 'Geral'
  
  return {
    ID: String(id),
    Título: String(title),
    Status: String(status),
    Prioridade: String(priority),
    Categoria: String(category),
    'Requerente - Requerente': String(requester),
    'Atribuído - Técnico': String(assignedTo),
    'Técnico responsável': String(assignedTo),
    'Data de abertura': String(createdAt),
    id: String(id),
    title: String(title),
    status: String(status),
    priority: String(priority),
    requester: String(requester),
    assignedTo: String(assignedTo),
    createdAt: String(createdAt),
    category: String(category)
  }
}

const CoreplanIntegration = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [lastSync, setLastSync] = useState(null)
  const [syncInterval, setSyncInterval] = useState(300000) // 5 minutos
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    apiKey: '',
    userToken: '',
    baseUrl: 'https://suporte.coreplan.com.br'
  })
  const [glpiService, setGlpiService] = useState(null)
  const [showCredentials, setShowCredentials] = useState(false)
  const [syncHistory, setSyncHistory] = useState([])
  const [newTickets, setNewTickets] = useState([])
  const [syncStats, setSyncStats] = useState({
    totalTickets: 0,
    newTickets: 0,
    updatedTickets: 0,
    errors: 0
  })
  
  const { addNotification } = useNotifications()
  const monitoringRef = useRef(null)

  useEffect(() => {
    try {
      loadSavedCredentials()
    } catch (error) {
      console.error('Erro ao carregar credenciais:', error)
      addNotification({
        type: 'error',
        title: 'Erro de Inicialização',
        message: 'Erro ao carregar configurações salvas.',
        duration: 5000
      })
    }
    
    return () => {
      if (monitoringRef.current) {
        clearInterval(monitoringRef.current)
      }
    }
  }, [])

  const loadSavedCredentials = () => {
    try {
      const saved = localStorage.getItem('coreplan-credentials')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Nunca restaurar senha/apiKey do storage
        setCredentials(prev => ({
          ...prev,
          baseUrl: parsed.baseUrl || prev.baseUrl,
          username: parsed.username || ''
        }))
      }

      try {
        const tokenSaved = sessionStorage.getItem('coreplan-credentials-tokens')
        if (tokenSaved) {
          const parsedTokens = JSON.parse(tokenSaved)
          setCredentials(prev => ({
            ...prev,
            apiKey: parsedTokens.apiKey || '',
            userToken: parsedTokens.userToken || ''
          }))
        }
      } catch {
        sessionStorage.removeItem('coreplan-credentials-tokens')
      }
    } catch (error) {
      console.error('Erro ao carregar credenciais salvas:', error)
      // Limpar credenciais corrompidas
      localStorage.removeItem('coreplan-credentials')
    }
  }

  const saveCredentials = () => {
    try {
      // Salvar apenas dados não sensíveis
      localStorage.setItem('coreplan-credentials', JSON.stringify({
        baseUrl: credentials.baseUrl,
        username: credentials.username
      }))

      try {
        const payload = {
          apiKey: credentials.apiKey,
          userToken: credentials.userToken
        }
        if (payload.apiKey || payload.userToken) {
          sessionStorage.setItem('coreplan-credentials-tokens', JSON.stringify(payload))
        } else {
          sessionStorage.removeItem('coreplan-credentials-tokens')
        }
      } catch {
        // ignore
      }
      addNotification({
        type: 'success',
        title: 'Credenciais Salvas',
        message: 'As credenciais foram salvas com sucesso.',
        duration: 3000
      })
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error)
      addNotification({
        type: 'error',
        title: 'Erro ao Salvar',
        message: 'Não foi possível salvar as credenciais.',
        duration: 5000
      })
    }
  }

  const testConnection = async () => {
    const hasTokenAuth = Boolean(credentials.userToken)
    const hasBasicAuth = Boolean(credentials.username && credentials.password)

    if (!hasTokenAuth && !hasBasicAuth) {
      addNotification({
        type: 'warning',
        title: 'Credenciais Incompletas',
        message: 'Informe (User-Token) ou (Usuário + Senha) antes de testar a conexão.',
        duration: 4000
      })
      return
    }

    setIsLoading(true)
    setConnectionStatus('testing')
    
    let sessionToken = null
    try {
      sessionToken = await glpiInitSession({
        appToken: credentials.apiKey,
        userToken: credentials.userToken,
        username: credentials.username,
        password: credentials.password
      })
      
      const tickets = await glpiSearchTickets(sessionToken, credentials.apiKey, '0-10')
      
      setIsConnected(true)
      setConnectionStatus('connected')
      setGlpiService({
        baseUrl: credentials.baseUrl,
        username: credentials.username,
        password: credentials.password,
        appToken: credentials.apiKey,
        userToken: credentials.userToken
      })
      addNotification({
        type: 'success',
        title: 'Conexão Estabelecida',
        message: `Conectado com sucesso ao GLPI. ${tickets.length} tickets no teste.`,
        duration: 4000
      })
    } catch (error) {
      console.error('Erro no teste de conexão:', error)
      setIsConnected(false)
      setConnectionStatus('error')
      addNotification({
        type: 'error',
        title: 'Erro de Conexão',
        message: `Não foi possível conectar ao sistema GLPI: ${error.message}`,
        duration: 5000
      })
    } finally {
      if (sessionToken) await glpiKillSession(sessionToken, credentials.apiKey)
      setIsLoading(false)
    }
  }

  const startMonitoring = async () => {
    if (!isConnected) {
      addNotification({
        type: 'warning',
        title: 'Conexão Necessária',
        message: 'É necessário estar conectado para iniciar o monitoramento.',
        duration: 4000
      })
      return
    }

    try {
      setIsMonitoring(true)
      
      // Primeira sincronização imediata
      await syncTickets()
      
      // Configurar monitoramento contínuo
      monitoringRef.current = setInterval(async () => {
        try {
          await syncTickets()
        } catch (error) {
          console.error('Erro no monitoramento automático:', error)
          addNotification({
            type: 'error',
            title: 'Erro no Monitoramento',
            message: 'Erro durante sincronização automática.',
            duration: 5000
          })
        }
      }, syncInterval)
      
      addNotification({
        type: 'success',
        title: 'Monitoramento Iniciado',
        message: `Sincronizando tickets a cada ${syncInterval / 60000} minutos.`,
        duration: 4000
      })
    } catch (error) {
      setIsMonitoring(false)
      addNotification({
        type: 'error',
        title: 'Erro ao Iniciar Monitoramento',
        message: 'Não foi possível iniciar o monitoramento automático.',
        duration: 5000
      })
    }
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
    if (monitoringRef.current) {
      clearInterval(monitoringRef.current)
      monitoringRef.current = null
    }
    
    addNotification({
      type: 'info',
      title: 'Monitoramento Parado',
      message: 'O monitoramento automático foi interrompido.',
      duration: 3000
    })
  }

  const syncTickets = async () => {
    if (!isConnected || !glpiService) {
      addNotification({
        type: 'warning',
        title: 'Conexão Necessária',
        message: 'É necessário estar conectado para sincronizar tickets.',
        duration: 4000
      })
      return
    }

    setIsLoading(true)
    
    try {
      let previousIds = new Set()
      try {
        const stored = localStorage.getItem('dashboard-data')
        const parsed = stored ? JSON.parse(stored) : []
        if (Array.isArray(parsed)) {
          previousIds = new Set(
            parsed
              .map(t => t?.ID ?? t?.id)
              .filter(v => v !== null && v !== undefined)
              .map(v => String(v))
          )
        }
      } catch {
        previousIds = new Set()
      }

      // Chamar GLPI diretamente via proxy
      const sessionToken = await glpiInitSession({
        appToken: glpiService.appToken,
        userToken: glpiService.userToken,
        username: glpiService.username,
        password: glpiService.password
      })
      
      let allTickets = []
      try {
        // Buscar tickets em lotes
        for (let page = 0; page < 20; page++) {
          const start = page * 500
          const end = start + 499
          const rawTickets = await glpiSearchTickets(sessionToken, glpiService.appToken, `${start}-${end}`)
          if (!rawTickets.length) break
          allTickets.push(...rawTickets.map(formatTicket))
          if (rawTickets.length < 500) break
        }
      } finally {
        await glpiKillSession(sessionToken, glpiService.appToken)
      }

      const tickets = allTickets
      
      if (tickets && Array.isArray(tickets)) {
        try {
          localStorage.setItem('dashboard-data', JSON.stringify(tickets))
          const columns = tickets.length > 0 ? Object.keys(tickets[0] || {}) : []
          localStorage.setItem('dashboard-columns', JSON.stringify(columns))
          localStorage.setItem('dashboard-glpi-baseUrl', String(glpiService.baseUrl || ''))
          window.dispatchEvent(new Event('dashboard-data-updated'))
        } catch (e) {
          console.error('Erro ao salvar dados do dashboard no storage:', e)
        }

        const newTicketsFound = tickets.filter(ticket => {
          const id = ticket?.ID ?? ticket?.id
          if (id === null || id === undefined) return false
          return !previousIds.has(String(id))
        })
        
        if (tickets.length > 0) {
          setNewTickets(prev => [...tickets.slice(0, 10), ...prev].slice(0, 10))
          
          // Adicionar ao histórico de sincronização
          const syncRecord = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ticketsFound: tickets.length,
            newTickets: newTicketsFound.length,
            status: 'success'
          }
          
          setSyncHistory(prev => [syncRecord, ...prev].slice(0, 20))
          
          // Atualizar estatísticas
          setSyncStats(prev => ({
            ...prev,
            totalTickets: tickets.length,
            newTickets: newTicketsFound.length
          }))
          
          // Notificar sobre novos tickets
          newTicketsFound.forEach(ticket => {
            const displayId = ticket?.ID ?? ticket?.id ?? 'N/A'
            const displayTitle = ticket?.Título ?? ticket?.title ?? 'Sem título'
            addNotification({
              type: 'info',
              title: 'Novo Ticket Recebido',
              message: `Ticket #${displayId} - ${displayTitle}`,
              duration: 6000
            })
          })
        }
        
        setLastSync(new Date().toISOString())
        
        addNotification({
          type: 'success',
          title: 'Sincronização Concluída',
          message: `${tickets.length} tickets sincronizados com sucesso.`,
          duration: 3000
        })
      } else {
        throw new Error('Resposta inválida do servidor GLPI')
      }
      
    } catch (error) {
      console.error('Erro na sincronização:', error)
      
      const syncRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ticketsFound: 0,
        newTickets: 0,
        status: 'error',
        error: error.message
      }
      
      setSyncHistory(prev => [syncRecord, ...prev].slice(0, 20))
      setSyncStats(prev => ({ ...prev, errors: prev.errors + 1 }))
      
      addNotification({
        type: 'error',
        title: 'Erro na Sincronização',
        message: `Erro ao sincronizar tickets: ${error.message}`,
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }



  const exportTickets = async () => {
    if (!glpiService) {
      addNotification({
        type: 'error',
        title: 'Erro na Exportação',
        message: 'Serviço GLPI não disponível.',
        duration: 3000
      })
      return
    }

    try {
      // Chamar GLPI diretamente via proxy
      const sessionToken = await glpiInitSession({
        appToken: glpiService.appToken,
        userToken: glpiService.userToken,
        username: glpiService.username,
        password: glpiService.password
      })
      
      let tickets = []
      try {
        for (let page = 0; page < 20; page++) {
          const start = page * 500
          const end = start + 499
          const rawTickets = await glpiSearchTickets(sessionToken, glpiService.appToken, `${start}-${end}`)
          if (!rawTickets.length) break
          tickets.push(...rawTickets.map(formatTicket))
          if (rawTickets.length < 500) break
        }
      } finally {
        await glpiKillSession(sessionToken, glpiService.appToken)
      }
      
      if (!tickets || tickets.length === 0) {
        addNotification({
          type: 'warning',
          title: 'Nenhum Ticket',
          message: 'Não há tickets para exportar.',
          duration: 3000
        })
        return
      }

      const csvContent = Papa.unparse(tickets, {
        delimiter: ';',
        quotes: true,
        skipEmptyLines: true
      })
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `coreplan-tickets-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      
      addNotification({
        type: 'success',
        title: 'Exportação Concluída',
        message: `${tickets.length} tickets exportados em CSV com sucesso.`,
        duration: 3000
      })
    } catch (error) {
      console.error('Erro na exportação:', error)
      addNotification({
        type: 'error',
        title: 'Erro na Exportação',
        message: `Erro ao exportar tickets: ${error.message}`,
        duration: 5000
      })
    }
  }

  const clearHistory = () => {
    try {
      setSyncHistory([])
      setNewTickets([])
      setSyncStats({
        totalTickets: 0,
        newTickets: 0,
        updatedTickets: 0,
        errors: 0
      })
      
      addNotification({
        type: 'info',
        title: 'Histórico Limpo',
        message: 'Histórico de sincronização foi limpo.',
        duration: 3000
      })
    } catch (error) {
      console.error('Erro ao limpar histórico:', error)
      addNotification({
        type: 'error',
        title: 'Erro ao Limpar',
        message: 'Não foi possível limpar o histórico.',
        duration: 5000
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-green-400 bg-green-500/20 border-green-400/30'
      case 'testing':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30'
      case 'error':
        return 'text-red-400 bg-red-500/20 border-red-400/30'
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-400/30'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Conectado'
      case 'testing':
        return 'Testando'
      case 'error':
        return 'Erro'
      default:
        return 'Desconectado'
    }
  }

  // Tratamento de erro global para evitar página em branco
  if (!credentials) {
    return (
      <div className="space-y-6">
        <div className="dashboard-card">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Erro de Carregamento</h2>
            <p className="text-gray-400 mb-4">Ocorreu um erro ao carregar o componente de integração.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Integração Coreplan GLPI</h2>
          <p className="text-gray-400">Sincronização automática de tickets do sistema GLPI</p>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href="https://suporte.coreplan.com.br/front/ticket.php"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Abrir GLPI</span>
          </a>
        </div>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="dashboard-card card-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Status da Conexão</p>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border mt-2 ${getStatusColor(connectionStatus)}`}>
                {getStatusText(connectionStatus)}
              </div>
            </div>
            <Database className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="dashboard-card card-success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Monitoramento</p>
              <p className="text-2xl font-bold text-white">
                {isMonitoring ? 'Ativo' : 'Inativo'}
              </p>
            </div>
            <Activity className={`h-8 w-8 ${isMonitoring ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
          </div>
        </div>
        
        <div className="dashboard-card card-accent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Novos Tickets</p>
              <p className="text-2xl font-bold text-white">{syncStats.newTickets}</p>
            </div>
            <Bell className="h-8 w-8 text-purple-400" />
          </div>
        </div>
        
        <div className="dashboard-card card-warning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Sincronizado</p>
              <p className="text-2xl font-bold text-white">{syncStats.totalTickets}</p>
            </div>
            <RefreshCw className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Configuração da Conexão</h3>
          <button
            onClick={() => setShowCredentials(!showCredentials)}
            className="btn-secondary flex items-center space-x-2"
          >
            {showCredentials ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showCredentials ? 'Ocultar' : 'Mostrar'}</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL Base
              </label>
              <input
                type="url"
                value={credentials.baseUrl}
                onChange={(e) => setCredentials(prev => ({ ...prev, baseUrl: e.target.value }))}
                className="input-modern w-full"
                placeholder="https://suporte.coreplan.com.br"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome de Usuário
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="input-modern w-full"
                placeholder="Seu usuário GLPI"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="input-modern w-full"
                placeholder="Sua senha GLPI"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Chave API (Opcional)
              </label>
              <input
                type="password"
                value={credentials.apiKey}
                onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                className="input-modern w-full"
                placeholder="Chave API para autenticação"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                User Token (Opcional)
              </label>
              <input
                type="password"
                value={credentials.userToken}
                onChange={(e) => setCredentials(prev => ({ ...prev, userToken: e.target.value }))}
                className="input-modern w-full"
                placeholder="Token do usuário (API)"
              />
            </div>

            <div />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={testConnection}
              disabled={isLoading}
              className="btn-primary flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Testar Conexão</span>
            </button>
            
            <button
              onClick={saveCredentials}
              className="btn-secondary flex items-center space-x-2"
            >
              <Key className="h-4 w-4" />
              <span>Salvar Credenciais</span>
            </button>
          </div>
        </div>
      </div>

      {/* Monitoring Controls */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Controle de Monitoramento</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Intervalo: {syncInterval / 60000} minutos</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-300">Intervalo de Sincronização:</label>
            <select
              value={syncInterval}
              onChange={(e) => setSyncInterval(Number(e.target.value))}
              className="input-modern"
            >
              <option value={60000}>1 minuto</option>
              <option value={300000}>5 minutos</option>
              <option value={600000}>10 minutos</option>
              <option value={1800000}>30 minutos</option>
              <option value={3600000}>1 hora</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            {!isMonitoring ? (
              <button
                onClick={startMonitoring}
                disabled={!isConnected || isLoading}
                className="btn-success flex items-center space-x-2"
              >
                <Zap className="h-4 w-4" />
                <span>Iniciar Monitoramento</span>
              </button>
            ) : (
              <button
                onClick={stopMonitoring}
                className="btn-warning flex items-center space-x-2"
              >
                <XCircle className="h-4 w-4" />
                <span>Parar Monitoramento</span>
              </button>
            )}
            
            <button
              onClick={syncTickets}
              disabled={!isConnected || isLoading}
              className="btn-primary flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sincronizar Agora</span>
            </button>
          </div>

          {lastSync && (
            <div className="text-sm text-gray-400">
              Última sincronização: {new Date(lastSync).toLocaleString('pt-BR')}
            </div>
          )}
        </div>
      </div>

      {/* Recent Tickets */}
      {newTickets.length > 0 && (
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Tickets Recentes</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportTickets}
                className="btn-secondary flex items-center space-x-2 text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </button>
              <button
                onClick={clearHistory}
                className="btn-danger flex items-center space-x-2 text-sm"
              >
                <Trash2 className="h-4 w-4" />
                <span>Limpar</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {newTickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-white">#{ticket.id} - {ticket.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.priority === 'Crítica' ? 'bg-red-500/20 text-red-400 border border-red-400/30' :
                        ticket.priority === 'Alta' ? 'bg-orange-500/20 text-orange-400 border border-orange-400/30' :
                        ticket.priority === 'Média' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30' :
                        'bg-green-500/20 text-green-400 border border-green-400/30'
                      }`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'Novo' ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' :
                        ticket.status === 'Em Andamento' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30' :
                        ticket.status === 'Resolvido' ? 'bg-green-500/20 text-green-400 border border-green-400/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-400/30'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{ticket.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Solicitante: {ticket.requester}</span>
                      <span>Responsável: {ticket.assignedTo}</span>
                      <span>SLA: {ticket.sla}h</span>
                      <span>Criado: {new Date(ticket.createdAt).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync History */}
      {syncHistory.length > 0 && (
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-white mb-4">Histórico de Sincronização</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {syncHistory.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    record.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <span className="text-sm text-gray-300">
                    {new Date(record.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>{record.ticketsFound} tickets encontrados</span>
                  <span>{record.newTickets} novos</span>
                  {record.status === 'error' && (
                    <span className="text-red-400">Erro</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CoreplanIntegration
