export default class AIInsightsService {
  static normalize(value, min, max) {
    if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 0
    return Math.max(0, Math.min(1, (value - min) / (max - min)))
  }

  static parsePtBrDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null
    const raw = dateStr.split(' ')[0]
    const parts = raw.split('/')
    if (parts.length !== 3) return null
    const [day, month, year] = parts
    const d = new Date(Number(year), Number(month) - 1, Number(day))
    if (!Number.isFinite(d.valueOf())) return null
    return d
  }

  static getTicketAgeDays(ticket) {
    const dateStr = ticket?.['Data de abertura'] || ticket?.createdAt
    const d = typeof dateStr === 'string' ? this.parsePtBrDate(dateStr) : (dateStr ? new Date(dateStr) : null)
    if (!d || !Number.isFinite(d.valueOf())) return 0
    const diffMs = Date.now() - d.valueOf()
    return Math.max(0, Math.floor(diffMs / 86400000))
  }

  static isOpen(ticket) {
    const status = ticket?.Status || ticket?.status
    return status !== 'Solucionado' && status !== 'Fechado' && status !== 'Resolvido'
  }

  static mapPriority(priority) {
    const p = String(priority || '').toLowerCase()
    if (p.includes('alta') || p.includes('crít') || p.includes('crit') || p.includes('urg')) return 3
    if (p.includes('média') || p.includes('media')) return 2
    if (p.includes('baixa')) return 1
    const n = Number(priority)
    if (Number.isFinite(n)) {
      if (n >= 5) return 3
      if (n >= 3) return 2
      return 1
    }
    return 1
  }

  static scoreTicket(ticket) {
    const factors = []
    let risk = 0

    const exceeded = ticket?.['Tempo para resolver excedido'] === 'Sim'
    if (exceeded) {
      risk += 45
      factors.push({ key: 'sla_exceeded', label: 'SLA excedido', weight: 45 })
    }

    const priorityLevel = this.mapPriority(ticket?.Prioridade || ticket?.priority)
    if (priorityLevel === 3) {
      risk += 20
      factors.push({ key: 'priority_high', label: 'Alta prioridade', weight: 20 })
    } else if (priorityLevel === 2) {
      risk += 10
      factors.push({ key: 'priority_medium', label: 'Média prioridade', weight: 10 })
    }

    const open = this.isOpen(ticket)
    if (open) {
      risk += 8
      factors.push({ key: 'still_open', label: 'Chamado aberto', weight: 8 })
    }

    const ageDays = this.getTicketAgeDays(ticket)
    if (ageDays >= 14) {
      risk += 18
      factors.push({ key: 'aging_14', label: `Envelhecido (${ageDays} dias)`, weight: 18 })
    } else if (ageDays >= 7) {
      risk += 10
      factors.push({ key: 'aging_7', label: `Aging (${ageDays} dias)`, weight: 10 })
    }

    // Penalizar quando não tem técnico atribuído
    const tech = ticket?.['Técnico responsável'] || ticket?.['Atribuído - Técnico'] || ticket?.assignedTo
    if (!tech || String(tech).toLowerCase().includes('não atrib')) {
      risk += 8
      factors.push({ key: 'unassigned', label: 'Sem técnico atribuído', weight: 8 })
    }

    risk = Math.max(0, Math.min(100, Math.round(risk)))

    return {
      risk,
      factors
    }
  }

  static summarizeTickets(tickets) {
    const list = Array.isArray(tickets) ? tickets : []

    const openTickets = list.filter(t => this.isOpen(t))
    const exceededTickets = list.filter(t => t?.['Tempo para resolver excedido'] === 'Sim')

    const oldestOpen = openTickets
      .map(t => ({ ticket: t, ageDays: this.getTicketAgeDays(t) }))
      .sort((a, b) => b.ageDays - a.ageDays)[0]

    return {
      total: list.length,
      open: openTickets.length,
      exceeded: exceededTickets.length,
      oldestOpenDays: oldestOpen?.ageDays ?? 0,
      oldestOpenTicket: oldestOpen?.ticket ?? null
    }
  }

  static scoreTechnician({ technicianStats, teamStats, tickets }) {
    const stats = technicianStats || {}
    const team = teamStats || null
    const summary = this.summarizeTickets(tickets)

    const sla = Number(stats.slaCompliance)
    const slaScore = Number.isFinite(sla) ? this.normalize(sla, 70, 100) : 0

    const medianTime = Number(stats.medianResolutionTime ?? stats.avgResolutionTime)
    const p90Time = Number(stats.p90ResolutionTime ?? stats.avgResolutionTime)
    const timeScore = Number.isFinite(medianTime) ? (1 - this.normalize(medianTime, 30, 240)) : 0

    const backlogPenalty = this.normalize(summary.open, 0, 30)
    const exceededPenalty = summary.total > 0 ? this.normalize(summary.exceeded / summary.total, 0, 0.3) : 0

    // Performance score 0-100 (maior é melhor)
    const performance = Math.round(
      100 * (
        0.55 * slaScore +
        0.25 * timeScore +
        0.10 * (1 - backlogPenalty) +
        0.10 * (1 - exceededPenalty)
      )
    )

    // Risk score 0-100 (maior é pior)
    const risk = Math.round(
      100 * (
        0.55 * backlogPenalty +
        0.45 * exceededPenalty
      )
    )

    const comparison = team
      ? {
          slaDelta: Number.isFinite(sla) && Number.isFinite(Number(team.slaCompliance)) ? sla - Number(team.slaCompliance) : null,
          medianTimeDelta: Number.isFinite(medianTime) && Number.isFinite(Number(team.medianResolutionTime ?? team.avgResolutionTime))
            ? medianTime - Number(team.medianResolutionTime ?? team.avgResolutionTime)
            : null,
          p90TimeDelta: Number.isFinite(p90Time) && Number.isFinite(Number(team.p90ResolutionTime ?? team.avgResolutionTime))
            ? p90Time - Number(team.p90ResolutionTime ?? team.avgResolutionTime)
            : null
        }
      : null

    return {
      performance: Math.max(0, Math.min(100, performance)),
      risk: Math.max(0, Math.min(100, risk)),
      summary,
      factors: [],
      comparison
    }
  }

  static generateRecommendations({ technicianName, technicianStats, teamStats, tickets }) {
    const score = this.scoreTechnician({ technicianStats, teamStats, tickets })
    const recs = []

    if (score.summary.exceeded > 0) {
      recs.push({
        type: 'critical',
        priority: 'alta',
        title: 'Atacar SLAs excedidos primeiro',
        message: `Existem ${score.summary.exceeded} chamado(s) com SLA excedido. Priorize-os para reduzir risco operacional.`
      })
    }

    if (score.summary.oldestOpenDays >= 14) {
      recs.push({
        type: 'warning',
        priority: 'alta',
        title: 'Resolver chamados envelhecidos',
        message: `Há chamado(s) abertos há ${score.summary.oldestOpenDays} dias. Isso tende a gerar retrabalho e insatisfação.`
      })
    } else if (score.summary.oldestOpenDays >= 7) {
      recs.push({
        type: 'warning',
        priority: 'média',
        title: 'Reduzir idade do backlog',
        message: `Existem chamados abertos há ${score.summary.oldestOpenDays} dias. Foque em limpar a fila antiga.`
      })
    }

    if (Number.isFinite(Number(technicianStats?.slaCompliance)) && Number(technicianStats.slaCompliance) < 90) {
      recs.push({
        type: 'warning',
        priority: 'média',
        title: 'Melhorar compliance de SLA',
        message: `SLA compliance está em ${Number(technicianStats.slaCompliance).toFixed(1)}%. Identifique as categorias/horários com maior incidência de atraso.`
      })
    }

    if (score.comparison?.medianTimeDelta !== null && score.comparison.medianTimeDelta > 20) {
      recs.push({
        type: 'info',
        priority: 'baixa',
        title: 'Otimizar tempo de resolução (mediana)',
        message: `Sua mediana está ${Math.round(score.comparison.medianTimeDelta)} min acima da equipe. Padronize soluções e crie checklists por categoria.`
      })
    }

    if (score.comparison?.p90TimeDelta !== null && score.comparison.p90TimeDelta > 30) {
      recs.push({
        type: 'info',
        priority: 'baixa',
        title: 'Reduzir cauda longa (p90)',
        message: `O p90 (casos mais demorados) está ${Math.round(score.comparison.p90TimeDelta)} min acima da equipe. Crie playbooks para incidentes recorrentes e revise chamados “travados”.`
      })
    }

    if (recs.length === 0) {
      recs.push({
        type: 'success',
        priority: 'baixa',
        title: 'Manter consistência',
        message: 'Os indicadores estão saudáveis. Continue monitorando backlog e SLAs críticos.'
      })
    }

    return {
      score,
      recommendations: recs
    }
  }

  static topTicketRisks(tickets, limit = 10) {
    const list = Array.isArray(tickets) ? tickets : []
    return list
      .map(t => {
        const s = this.scoreTicket(t)
        const id = t?.ID || t?.id || 'N/A'
        const title = t?.Título || t?.title || ''
        return {
          id,
          title,
          ticket: t,
          risk: s.risk,
          factors: s.factors
        }
      })
      .sort((a, b) => b.risk - a.risk)
      .slice(0, Math.max(1, limit))
  }
}
