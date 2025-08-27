class GLPIService {
  constructor(baseUrl, credentials) {
    this.baseUrl = baseUrl
    this.credentials = credentials
    this.sessionToken = null
    this.isAuthenticated = false
  }

  // Autenticação com o GLPI
  async authenticate() {
    try {
      // Verificar se a URL base é válida
      if (!this.baseUrl || !this.baseUrl.startsWith('http')) {
        throw new Error('URL base inválida')
      }

      // Verificar se as credenciais estão presentes
      if (!this.credentials.username || !this.credentials.password) {
        throw new Error('Credenciais incompletas')
      }

      const response = await fetch(`${this.baseUrl}/apirest.php/initSession`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${this.credentials.username}:${this.credentials.password}`)}`
        },
        mode: 'cors',
        credentials: 'omit'
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Credenciais inválidas')
        } else if (response.status === 404) {
          throw new Error('API GLPI não encontrada. Verifique a URL base.')
        } else {
          throw new Error(`Erro de autenticação: ${response.status} - ${response.statusText}`)
        }
      }

      const data = await response.json()
      
      if (!data.session_token) {
        throw new Error('Token de sessão não recebido')
      }
      
      this.sessionToken = data.session_token
      this.isAuthenticated = true
      
      return {
        success: true,
        sessionToken: this.sessionToken,
        message: 'Autenticação realizada com sucesso'
      }
    } catch (error) {
      console.error('Erro na autenticação GLPI:', error)
      
      // Tratar erros específicos
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Erro de rede. Verifique sua conexão e a URL do GLPI.'
        }
      }
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Encerrar sessão
  async logout() {
    if (!this.sessionToken) return

    try {
      await fetch(`${this.baseUrl}/apirest.php/killSession`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Session-Token': this.sessionToken
        }
      })

      this.sessionToken = null
      this.isAuthenticated = false
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error)
    }
  }

  // Buscar tickets
  async getTickets(filters = {}) {
    if (!this.isAuthenticated) {
      const authResult = await this.authenticate()
      if (!authResult.success) {
        throw new Error('Falha na autenticação')
      }
    }

    try {
      // Construir query parameters
      const queryParams = new URLSearchParams()
      
      // Filtros padrão para buscar tickets do usuário
      queryParams.append('criteria[0][field]', '4') // Assigned to
      queryParams.append('criteria[0][searchtype]', 'equals')
      queryParams.append('criteria[0][value]', this.credentials.username)
      
      // Adicionar filtros personalizados
      if (filters.status) {
        queryParams.append('criteria[1][field]', '12') // Status
        queryParams.append('criteria[1][searchtype]', 'equals')
        queryParams.append('criteria[1][value]', filters.status)
      }
      
      if (filters.priority) {
        queryParams.append('criteria[2][field]', '3') // Priority
        queryParams.append('criteria[2][searchtype]', 'equals')
        queryParams.append('criteria[2][value]', filters.priority)
      }
      
      if (filters.dateFrom) {
        queryParams.append('criteria[3][field]', '15') // Date
        queryParams.append('criteria[3][searchtype]', 'morethan')
        queryParams.append('criteria[3][value]', filters.dateFrom)
      }

      const response = await fetch(`${this.baseUrl}/apirest.php/search/Ticket?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Session-Token': this.sessionToken
        },
        mode: 'cors',
        credentials: 'omit'
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado, tentar reautenticar
          this.isAuthenticated = false
          const authResult = await this.authenticate()
          if (!authResult.success) {
            throw new Error('Sessão expirada. Faça login novamente.')
          }
          // Tentar novamente com novo token
          return this.getTickets(filters)
        } else {
          throw new Error(`Erro ao buscar tickets: ${response.status} - ${response.statusText}`)
        }
      }

      const data = await response.json()
      
      if (!data || !Array.isArray(data.data)) {
        console.warn('Resposta inesperada do GLPI:', data)
        return []
      }
      
      return this.formatTickets(data.data || [])
    } catch (error) {
      console.error('Erro ao buscar tickets:', error)
      
      // Tratar erros específicos
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erro de rede. Verifique sua conexão.')
      }
      
      throw error
    }
  }

  // Buscar tickets por ID específico
  async getTicketById(ticketId) {
    if (!this.isAuthenticated) {
      const authResult = await this.authenticate()
      if (!authResult.success) {
        throw new Error('Falha na autenticação')
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/apirest.php/Ticket/${ticketId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Session-Token': this.sessionToken
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar ticket: ${response.status}`)
      }

      const data = await response.json()
      return this.formatTicket(data)
    } catch (error) {
      console.error('Erro ao buscar ticket:', error)
      throw error
    }
  }

  // Buscar tickets recentes (últimas 24h)
  async getRecentTickets() {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    return this.getTickets({
      dateFrom: yesterday.toISOString()
    })
  }

  // Buscar tickets por status
  async getTicketsByStatus(status) {
    return this.getTickets({ status })
  }

  // Atualizar ticket
  async updateTicket(ticketId, updates) {
    if (!this.isAuthenticated) {
      const authResult = await this.authenticate()
      if (!authResult.success) {
        throw new Error('Falha na autenticação')
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/apirest.php/Ticket/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Session-Token': this.sessionToken
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error(`Erro ao atualizar ticket: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        message: 'Ticket atualizado com sucesso',
        data: data
      }
    } catch (error) {
      console.error('Erro ao atualizar ticket:', error)
      throw error
    }
  }

  // Adicionar comentário ao ticket
  async addTicketFollowup(ticketId, content) {
    if (!this.isAuthenticated) {
      const authResult = await this.authenticate()
      if (!authResult.success) {
        throw new Error('Falha na autenticação')
      }
    }

    try {
      const followup = {
        tickets_id: ticketId,
        content: content,
        is_private: 0,
        requesttypes_id: 1 // Solicitação
      }

      const response = await fetch(`${this.baseUrl}/apirest.php/TicketFollowup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Session-Token': this.sessionToken
        },
        body: JSON.stringify(followup)
      })

      if (!response.ok) {
        throw new Error(`Erro ao adicionar comentário: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        message: 'Comentário adicionado com sucesso',
        data: data
      }
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
      throw error
    }
  }

  // Buscar estatísticas de tickets
  async getTicketStats() {
    try {
      const allTickets = await this.getTickets()
      
      const stats = {
        total: allTickets.length,
        byStatus: {},
        byPriority: {},
        byCategory: {},
        recent: 0
      }

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      allTickets.forEach(ticket => {
        // Por status
        stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1
        
        // Por prioridade
        stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1
        
        // Por categoria
        stats.byCategory[ticket.category] = (stats.byCategory[ticket.category] || 0) + 1
        
        // Recentes (últimas 24h)
        if (new Date(ticket.createdAt) > yesterday) {
          stats.recent++
        }
      })

      return stats
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw error
    }
  }

  // Formatar dados do ticket
  formatTicket(rawTicket) {
    if (!rawTicket || typeof rawTicket !== 'object') {
      throw new Error('Ticket inválido')
    }

    try {
      return {
        id: rawTicket.id || rawTicket.tickets_id || 'N/A',
        title: rawTicket.name || rawTicket.content || 'Sem título',
        description: rawTicket.content || rawTicket.description || '',
        status: this.getStatusName(rawTicket.status),
        priority: this.getPriorityName(rawTicket.priority),
        requester: rawTicket.users_id_recipient || rawTicket.requester || 'N/A',
        assignedTo: rawTicket.users_id_assign || rawTicket.assigned_to || 'N/A',
        createdAt: rawTicket.date_creation || rawTicket.created_at || new Date().toISOString(),
        updatedAt: rawTicket.date_mod || rawTicket.updated_at || new Date().toISOString(),
        sla: rawTicket.sla_waiting_duration || rawTicket.sla || 0,
        category: rawTicket.itilcategories_id || rawTicket.category || 'Geral',
        urgency: rawTicket.urgency || 1,
        impact: rawTicket.impact || 1,
        timeToResolve: rawTicket.time_to_resolve || null,
        timeToOwn: rawTicket.time_to_own || null,
        internalTimeToResolve: rawTicket.internal_time_to_resolve || null,
        internalTimeToOwn: rawTicket.internal_time_to_own || null
      }
    } catch (error) {
      console.error('Erro ao formatar ticket:', error, rawTicket)
      // Retornar ticket básico em caso de erro
      return {
        id: 'Erro',
        title: 'Erro ao processar ticket',
        description: 'Não foi possível processar este ticket',
        status: 'Erro',
        priority: 'N/A',
        requester: 'N/A',
        assignedTo: 'N/A',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sla: 0,
        category: 'Erro',
        urgency: 1,
        impact: 1,
        timeToResolve: null,
        timeToOwn: null,
        internalTimeToResolve: null,
        internalTimeToOwn: null
      }
    }
  }

  // Formatar lista de tickets
  formatTickets(rawTickets) {
    if (!Array.isArray(rawTickets)) {
      console.warn('formatTickets: rawTickets não é um array:', rawTickets)
      return []
    }
    
    return rawTickets
      .filter(ticket => ticket && typeof ticket === 'object')
      .map(ticket => {
        try {
          return this.formatTicket(ticket)
        } catch (error) {
          console.error('Erro ao formatar ticket:', error, ticket)
          return null
        }
      })
      .filter(ticket => ticket !== null)
  }

  // Mapear códigos de status para nomes
  getStatusName(statusCode) {
    const statusMap = {
      1: 'Novo',
      2: 'Em Andamento',
      3: 'Aguardando Cliente',
      4: 'Aguardando Terceiro',
      5: 'Resolvido',
      6: 'Fechado'
    }
    return statusMap[statusCode] || 'Desconhecido'
  }

  // Mapear códigos de prioridade para nomes
  getPriorityName(priorityCode) {
    const priorityMap = {
      1: 'Baixa',
      2: 'Média',
      3: 'Alta',
      4: 'Crítica',
      5: 'Muito Crítica',
      6: 'Urgente'
    }
    return priorityMap[priorityCode] || 'Não Definida'
  }

  // Verificar se há novos tickets
  async checkForNewTickets(lastCheckTime) {
    try {
      const recentTickets = await this.getRecentTickets()
      const newTickets = recentTickets.filter(ticket => 
        new Date(ticket.createdAt) > new Date(lastCheckTime)
      )
      
      return {
        hasNew: newTickets.length > 0,
        count: newTickets.length,
        tickets: newTickets
      }
    } catch (error) {
      console.error('Erro ao verificar novos tickets:', error)
      throw error
    }
  }

  // Exportar tickets para CSV
  async exportTicketsToCSV(tickets) {
    try {
      if (!Array.isArray(tickets)) {
        throw new Error('Lista de tickets inválida')
      }

      const headers = [
        'ID', 'Título', 'Descrição', 'Status', 'Prioridade', 'Solicitante',
        'Responsável', 'Categoria', 'Data Criação', 'Data Modificação', 'SLA'
      ]

      const csvContent = [
        headers.join(','),
        ...tickets.map(ticket => {
          try {
            return [
              ticket.id || 'N/A',
              `"${(ticket.title || 'Sem título').replace(/"/g, '""')}"`,
              `"${(ticket.description || '').replace(/"/g, '""')}"`,
              ticket.status || 'N/A',
              ticket.priority || 'N/A',
              ticket.requester || 'N/A',
              ticket.assignedTo || 'N/A',
              ticket.category || 'N/A',
              ticket.createdAt || 'N/A',
              ticket.updatedAt || 'N/A',
              ticket.sla || 0
            ].join(',')
          } catch (error) {
            console.error('Erro ao processar ticket para CSV:', error, ticket)
            return 'Erro,Erro ao processar ticket,,,,,,,,,'
          }
        })
      ].join('\n')

      return csvContent
    } catch (error) {
      console.error('Erro ao exportar tickets para CSV:', error)
      throw new Error(`Erro na exportação CSV: ${error.message}`)
    }
  }

  // Testar conexão
  async testConnection() {
    try {
      const authResult = await this.authenticate()
      if (authResult.success) {
        // Tentar buscar tickets para verificar se a API está funcionando
        const tickets = await this.getTickets()
        return {
          success: true,
          message: `Conexão estabelecida com sucesso. ${tickets.length} tickets encontrados.`
        }
      } else {
        return {
          success: false,
          error: authResult.error
        }
      }
    } catch (error) {
      console.error('Erro no teste de conexão:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default GLPIService
