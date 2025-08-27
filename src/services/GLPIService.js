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
      const response = await fetch(`${this.baseUrl}/apirest.php/initSession`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${this.credentials.username}:${this.credentials.password}`)}`
        }
      })

      if (!response.ok) {
        throw new Error(`Erro de autenticação: ${response.status}`)
      }

      const data = await response.json()
      this.sessionToken = data.session_token
      this.isAuthenticated = true
      
      return {
        success: true,
        sessionToken: this.sessionToken,
        message: 'Autenticação realizada com sucesso'
      }
    } catch (error) {
      console.error('Erro na autenticação GLPI:', error)
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
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar tickets: ${response.status}`)
      }

      const data = await response.json()
      return this.formatTickets(data.data || [])
    } catch (error) {
      console.error('Erro ao buscar tickets:', error)
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
    return {
      id: rawTicket.id || rawTicket.tickets_id,
      title: rawTicket.name || rawTicket.content,
      description: rawTicket.content || '',
      status: this.getStatusName(rawTicket.status),
      priority: this.getPriorityName(rawTicket.priority),
      requester: rawTicket.users_id_recipient || 'N/A',
      assignedTo: rawTicket.users_id_assign || 'N/A',
      createdAt: rawTicket.date_creation || new Date().toISOString(),
      updatedAt: rawTicket.date_mod || new Date().toISOString(),
      sla: rawTicket.sla_waiting_duration || 0,
      category: rawTicket.itilcategories_id || 'Geral',
      urgency: rawTicket.urgency || 1,
      impact: rawTicket.impact || 1,
      timeToResolve: rawTicket.time_to_resolve || null,
      timeToOwn: rawTicket.time_to_own || null,
      internalTimeToResolve: rawTicket.internal_time_to_resolve || null,
      internalTimeToOwn: rawTicket.internal_time_to_own || null
    }
  }

  // Formatar lista de tickets
  formatTickets(rawTickets) {
    return rawTickets.map(ticket => this.formatTicket(ticket))
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
    const headers = [
      'ID', 'Título', 'Descrição', 'Status', 'Prioridade', 'Solicitante',
      'Responsável', 'Categoria', 'Data Criação', 'Data Modificação', 'SLA'
    ]

    const csvContent = [
      headers.join(','),
      ...tickets.map(ticket => [
        ticket.id,
        `"${ticket.title.replace(/"/g, '""')}"`,
        `"${ticket.description.replace(/"/g, '""')}"`,
        ticket.status,
        ticket.priority,
        ticket.requester,
        ticket.assignedTo,
        ticket.category,
        ticket.createdAt,
        ticket.updatedAt,
        ticket.sla
      ].join(','))
    ].join('\n')

    return csvContent
  }

  // Testar conexão
  async testConnection() {
    try {
      const authResult = await this.authenticate()
      if (authResult.success) {
        // Tentar buscar um ticket para verificar se a API está funcionando
        await this.getTickets({ limit: 1 })
        return {
          success: true,
          message: 'Conexão estabelecida com sucesso'
        }
      } else {
        return {
          success: false,
          error: authResult.error
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default GLPIService
