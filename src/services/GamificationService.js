// Serviço de Gamificação - Gerencia badges, níveis e XP

export const BADGES = {
  SLA_MASTER: {
    id: 'sla_master',
    name: 'Mestre do SLA',
    description: '100% de SLA compliance por 30 dias consecutivos',
    icon: '🎯',
    rarity: 'legendary',
    category: 'performance'
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Demônio da Velocidade',
    description: 'Tempo médio de resolução abaixo de 30 minutos',
    icon: '⚡',
    rarity: 'epic',
    category: 'speed'
  },
  CONSISTENCY_KING: {
    id: 'consistency_king',
    name: 'Rei da Consistência',
    description: 'SLA compliance acima de 95% por 3 meses',
    icon: '👑',
    rarity: 'epic',
    category: 'consistency'
  },
  CATEGORY_EXPERT: {
    id: 'category_expert',
    name: 'Especialista',
    description: '95%+ SLA compliance em uma categoria específica',
    icon: '🏆',
    rarity: 'rare',
    category: 'expertise'
  },
  IMPROVEMENT_CHAMPION: {
    id: 'improvement_champion',
    name: 'Campeão da Melhoria',
    description: 'Melhorou SLA compliance em 20%+ no último mês',
    icon: '📈',
    rarity: 'rare',
    category: 'improvement'
  },
  HUNDRED_CLUB: {
    id: 'hundred_club',
    name: 'Clube dos 100',
    description: 'Resolveu 100+ chamados com SLA compliance acima de 90%',
    icon: '💯',
    rarity: 'rare',
    category: 'volume'
  },
  FAST_TRACK: {
    id: 'fast_track',
    name: 'Via Expressa',
    description: 'Resolveu 50+ chamados no primeiro contato',
    icon: '🚀',
    rarity: 'uncommon',
    category: 'efficiency'
  },
  ZERO_DEFECT: {
    id: 'zero_defect',
    name: 'Zero Defeitos',
    description: 'Zero chamados com SLA excedido no último mês',
    icon: '✨',
    rarity: 'uncommon',
    category: 'quality'
  },
  RISING_STAR: {
    id: 'rising_star',
    name: 'Estrela Ascendente',
    description: 'Top 10% da equipe em SLA compliance',
    icon: '⭐',
    rarity: 'common',
    category: 'ranking'
  },
  PERFECT_WEEK: {
    id: 'perfect_week',
    name: 'Semana Perfeita',
    description: '100% SLA compliance em uma semana',
    icon: '🌟',
    rarity: 'common',
    category: 'weekly'
  }
}

export const LEVELS = [
  { level: 1, xpRequired: 0, name: 'Iniciante', color: 'gray' },
  { level: 2, xpRequired: 100, name: 'Aprendiz', color: 'green' },
  { level: 3, xpRequired: 300, name: 'Estagiário', color: 'blue' },
  { level: 4, xpRequired: 600, name: 'Técnico', color: 'purple' },
  { level: 5, xpRequired: 1000, name: 'Técnico Sênior', color: 'pink' },
  { level: 6, xpRequired: 1500, name: 'Especialista', color: 'orange' },
  { level: 7, xpRequired: 2200, name: 'Especialista Sênior', color: 'red' },
  { level: 8, xpRequired: 3000, name: 'Mestre', color: 'yellow' },
  { level: 9, xpRequired: 4000, name: 'Mestre Sênior', color: 'indigo' },
  { level: 10, xpRequired: 5000, name: 'Lenda', color: 'gold' }
]

class GamificationService {
  // Calcular XP baseado em ações e performance
  static calculateXP(technicianData) {
    let xp = 0
    
    // XP por chamado resolvido dentro do SLA
    const slaCompliantTickets = technicianData.tickets?.filter(t => 
      t['Tempo para resolver excedido'] !== 'Sim'
    ).length || 0
    xp += slaCompliantTickets * 10
    
    // XP bonus por SLA compliance alto
    if (technicianData.slaCompliance >= 95) {
      xp += 50
    } else if (technicianData.slaCompliance >= 90) {
      xp += 30
    } else if (technicianData.slaCompliance >= 80) {
      xp += 15
    }
    
    // XP por volume de chamados resolvidos
    const resolvedCount = technicianData.resolved || 0
    if (resolvedCount >= 100) {
      xp += 100
    } else if (resolvedCount >= 50) {
      xp += 50
    } else if (resolvedCount >= 25) {
      xp += 25
    }
    
    // XP por melhoria de performance (se comparado com período anterior)
    if (technicianData.improvement && technicianData.improvement > 0) {
      xp += Math.round(technicianData.improvement * 5)
    }
    
    return Math.round(xp)
  }
  
  // Obter nível atual baseado em XP
  static getCurrentLevel(totalXP) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalXP >= LEVELS[i].xpRequired) {
        return LEVELS[i]
      }
    }
    return LEVELS[0]
  }
  
  // Calcular progresso para próximo nível
  static getLevelProgress(totalXP, currentLevel) {
    if (!currentLevel || !totalXP) {
      return { 
        progress: 0, 
        xpNeeded: 0, 
        xpInLevel: 0, 
        xpNeededForNext: 100 
      }
    }

    const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1)
    if (!nextLevel) {
      // Nível máximo alcançado
      return { 
        progress: 100, 
        xpNeeded: 0, 
        xpInLevel: totalXP - currentLevel.xpRequired,
        xpNeededForNext: 0 
      }
    }
    
    const xpInLevel = Math.max(0, totalXP - currentLevel.xpRequired)
    const xpNeededForNext = Math.max(1, nextLevel.xpRequired - currentLevel.xpRequired)
    const progress = Math.min(100, Math.max(0, (xpInLevel / xpNeededForNext) * 100))
    const xpNeeded = Math.max(0, nextLevel.xpRequired - totalXP)
    
    return {
      progress: progress,
      xpNeeded: xpNeeded,
      xpInLevel: xpInLevel,
      xpNeededForNext: xpNeededForNext
    }
  }
  
  // Verificar e conceder badges
  static checkBadges(technicianName, technicianData, historicalData) {
    const badges = []
    
    // SLA Master - 100% compliance por 30 dias
    const last30Days = this.getLastNDaysTickets(technicianData.tickets, 30)
    if (last30Days.length >= 20) {
      const compliance30Days = this.calculateCompliance(last30Days)
      if (compliance30Days === 100) {
        badges.push({ ...BADGES.SLA_MASTER, earnedDate: new Date().toISOString() })
      }
    }
    
    // Speed Demon - Tempo médio < 30 min
    if (technicianData.avgResolutionTime && technicianData.avgResolutionTime <= 30) {
      badges.push({ ...BADGES.SPEED_DEMON, earnedDate: new Date().toISOString() })
    }
    
    // Consistency King - 95%+ por 3 meses
    const last90Days = this.getLastNDaysTickets(technicianData.tickets, 90)
    if (last90Days.length >= 50) {
      const compliance90Days = this.calculateCompliance(last90Days)
      if (compliance90Days >= 95) {
        badges.push({ ...BADGES.CONSISTENCY_KING, earnedDate: new Date().toISOString() })
      }
    }
    
    // Improvement Champion - Melhoria de 20%+
    if (historicalData && historicalData.previousCompliance) {
      const improvement = technicianData.slaCompliance - historicalData.previousCompliance
      if (improvement >= 20) {
        badges.push({ ...BADGES.IMPROVEMENT_CHAMPION, earnedDate: new Date().toISOString() })
      }
    }
    
    // Hundred Club - 100+ chamados com 90%+ compliance
    if (technicianData.total >= 100 && technicianData.slaCompliance >= 90) {
      badges.push({ ...BADGES.HUNDRED_CLUB, earnedDate: new Date().toISOString() })
    }
    
    // Zero Defect - Zero SLA excedido no último mês
    const lastMonth = this.getLastNDaysTickets(technicianData.tickets, 30)
    const exceededLastMonth = lastMonth.filter(t => t['Tempo para resolver excedido'] === 'Sim').length
    if (lastMonth.length >= 10 && exceededLastMonth === 0) {
      badges.push({ ...BADGES.ZERO_DEFECT, earnedDate: new Date().toISOString() })
    }
    
    // Rising Star - Top 10% (será verificado externamente)
    if (technicianData.percentileRank >= 90) {
      badges.push({ ...BADGES.RISING_STAR, earnedDate: new Date().toISOString() })
    }
    
    // Perfect Week - 100% em uma semana
    const lastWeek = this.getLastNDaysTickets(technicianData.tickets, 7)
    if (lastWeek.length >= 5) {
      const complianceWeek = this.calculateCompliance(lastWeek)
      if (complianceWeek === 100) {
        badges.push({ ...BADGES.PERFECT_WEEK, earnedDate: new Date().toISOString() })
      }
    }
    
    return badges
  }
  
  // Helper: Obter tickets dos últimos N dias
  static getLastNDaysTickets(tickets, days) {
    if (!tickets || tickets.length === 0) return []
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return tickets.filter(ticket => {
      const openDate = ticket['Data de abertura']
      if (!openDate) return false
      try {
        const [day, month, year] = openDate.split(' ')[0].split('/')
        const ticketDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        return ticketDate >= cutoffDate
      } catch {
        return false
      }
    })
  }
  
  // Helper: Calcular SLA compliance
  static calculateCompliance(tickets) {
    if (!tickets || tickets.length === 0) return 0
    const exceeded = tickets.filter(t => t['Tempo para resolver excedido'] === 'Sim').length
    return ((tickets.length - exceeded) / tickets.length) * 100
  }
  
  // Salvar progresso do técnico
  static saveTechnicianProgress(technicianName, xp, badges, level) {
    try {
      const key = `gamification_${technicianName}`
      const progress = {
        technicianName,
        totalXP: xp,
        currentLevel: level.level,
        badges: badges.map(b => ({ id: b.id, earnedDate: b.earnedDate })),
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(key, JSON.stringify(progress))
      return progress
    } catch (error) {
      console.error('Erro ao salvar progresso:', error)
      return null
    }
  }
  
  // Carregar progresso do técnico
  static loadTechnicianProgress(technicianName) {
    try {
      const key = `gamification_${technicianName}`
      const saved = localStorage.getItem(key)
      if (saved) {
        return JSON.parse(saved)
      }
      return {
        technicianName,
        totalXP: 0,
        currentLevel: 1,
        badges: [],
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error)
      return {
        technicianName,
        totalXP: 0,
        currentLevel: 1,
        badges: [],
        lastUpdated: new Date().toISOString()
      }
    }
  }
  
  // Verificar se badge já foi concedido
  static hasBadge(technicianName, badgeId) {
    const progress = this.loadTechnicianProgress(technicianName)
    return progress.badges.some(b => b.id === badgeId)
  }
  
  // Obter raridade em cor
  static getRarityColor(rarity) {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
      case 'epic': return 'text-purple-400 bg-purple-400/20 border-purple-400/30'
      case 'rare': return 'text-blue-400 bg-blue-400/20 border-blue-400/30'
      case 'uncommon': return 'text-green-400 bg-green-400/20 border-green-400/30'
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30'
    }
  }
}

export default GamificationService

