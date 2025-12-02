// Serviço de IA Avançada para Recomendações Personalizadas

class AdvancedRecommendations {
  // Análise avançada de padrões e recomendações
  static generateAdvancedRecommendations(technicianStats, teamStats, historicalData, categoryStats, openTickets) {
    const recommendations = []

    // 1. Análise de Correlação entre Categorias
    const categoryCorrelations = this.analyzeCategoryCorrelations(categoryStats)
    if (categoryCorrelations.strongCategories.length > 0) {
      recommendations.push({
        type: 'info',
        priority: 'média',
        title: 'Oportunidade de Foco',
        message: `Você se destaca em: ${categoryCorrelations.strongCategories.slice(0, 3).join(', ')}. Considere aceitar mais chamados nessas categorias para maximizar seu desempenho.`,
        category: 'optimization',
        actionType: 'focus_areas'
      })
    }

    if (categoryCorrelations.weakCategories.length > 0) {
      recommendations.push({
        type: 'warning',
        priority: 'alta',
        title: 'Categorias que Precisam de Atenção',
        message: `Suas categorias mais desafiadoras são: ${categoryCorrelations.weakCategories.slice(0, 3).join(', ')}. Considere treinamento específico ou parceria com especialistas nessas áreas.`,
        category: 'improvement',
        actionType: 'training_needed',
        categories: categoryCorrelations.weakCategories.slice(0, 3)
      })
    }

    // 2. Análise de Timing e Produtividade
    const timingAnalysis = this.analyzeTimingPatterns(historicalData)
    if (timingAnalysis.bestPeriod) {
      recommendations.push({
        type: 'success',
        priority: 'baixa',
        title: 'Período de Maior Eficiência Identificado',
        message: `Seus dados mostram melhor desempenho durante ${timingAnalysis.bestPeriod}. Considere agendar chamados mais complexos nesse período.`,
        category: 'optimization',
        actionType: 'schedule_optimization'
      })
    }

    // 3. Análise de Volume vs. Qualidade
    const volumeQualityAnalysis = this.analyzeVolumeQuality(technicianStats, teamStats)
    if (volumeQualityAnalysis.recommendation) {
      recommendations.push({
        type: volumeQualityAnalysis.type,
        priority: volumeQualityAnalysis.priority,
        title: volumeQualityAnalysis.title,
        message: volumeQualityAnalysis.message,
        category: 'balance',
        actionType: 'workload_balance'
      })
    }

    // 4. Análise de Tendências e Previsões
    if (historicalData && historicalData.length >= 3) {
      const trendAnalysis = this.analyzeTrends(historicalData)
      if (trendAnalysis.declining) {
        recommendations.push({
          type: 'warning',
          priority: 'alta',
          title: 'Tendência de Declínio Detectada',
          message: `Seu SLA compliance está em tendência de queda nos últimos períodos (${trendAnalysis.declineAmount}%). Identifique as causas e ajuste sua abordagem.`,
          category: 'trend',
          actionType: 'intervention_needed'
        })
      } else if (trendAnalysis.improving) {
        recommendations.push({
          type: 'success',
          priority: 'baixa',
          title: 'Melhoria Contínua em Andamento',
          message: `Excelente! Você está melhorando consistentemente (${trendAnalysis.improvementAmount}% nos últimos períodos). Continue mantendo esse ritmo!`,
          category: 'trend',
          actionType: 'maintain_momentum'
        })
      }
    }

    // 5. Análise de Eficiência por Prioridade
    const priorityAnalysis = this.analyzePriorityEfficiency(openTickets)
    if (priorityAnalysis.recommendation) {
      recommendations.push({
        type: priorityAnalysis.type,
        priority: priorityAnalysis.priority,
        title: priorityAnalysis.title,
        message: priorityAnalysis.message,
        category: 'prioritization',
        actionType: 'priority_optimization'
      })
    }

    // 6. Análise de SLA Risk Management
    const riskAnalysis = this.analyzeSLARisk(openTickets, technicianStats)
    if (riskAnalysis.needsAttention) {
      recommendations.push({
        type: 'critical',
        priority: 'alta',
        title: 'Gerenciamento de Riscos de SLA',
        message: riskAnalysis.message,
        category: 'risk_management',
        actionType: 'sla_risk_mitigation',
        urgentTickets: riskAnalysis.urgentCount
      })
    }

    // 7. Análise Comparativa Avançada
    if (teamStats) {
      const comparativeAnalysis = this.comparativeAnalysis(technicianStats, teamStats)
      if (comparativeAnalysis.recommendation) {
        recommendations.push({
          type: comparativeAnalysis.type,
          priority: comparativeAnalysis.priority,
          title: comparativeAnalysis.title,
          message: comparativeAnalysis.message,
          category: 'benchmarking',
          actionType: 'performance_gap'
        })
      }
    }

    // Ordenar por prioridade e impacto
    return recommendations.sort((a, b) => {
      const priorityOrder = { 'alta': 0, 'média': 1, 'baixa': 2 }
      const typeOrder = { 'critical': 0, 'warning': 1, 'info': 2, 'success': 3 }
      
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return typeOrder[a.type] - typeOrder[b.type]
    })
  }

  // Analisar correlações entre categorias
  static analyzeCategoryCorrelations(categoryStats) {
    if (!categoryStats) return { strongCategories: [], weakCategories: [] }

    const strongCategories = []
    const weakCategories = []

    Object.entries(categoryStats).forEach(([category, stats]) => {
      if (stats.compliance >= 95 && stats.total >= 5) {
        strongCategories.push({ name: category, compliance: stats.compliance, total: stats.total })
      } else if (stats.compliance < 70 && stats.total >= 3) {
        weakCategories.push({ name: category, compliance: stats.compliance, total: stats.total })
      }
    })

    return {
      strongCategories: strongCategories
        .sort((a, b) => b.compliance - a.compliance)
        .map(c => c.name),
      weakCategories: weakCategories
        .sort((a, b) => a.compliance - b.compliance)
        .map(c => c.name)
    }
  }

  // Analisar padrões de timing
  static analyzeTimingPatterns(historicalData) {
    if (!historicalData || historicalData.length < 3) {
      return { bestPeriod: null }
    }

    // Simulação - em produção, analisaria horários de resolução
    const recent = historicalData.slice(-3)
    const avgCompliance = recent.reduce((sum, d) => sum + (parseFloat(d.compliance) || 0), 0) / recent.length

    return {
      bestPeriod: avgCompliance >= 90 ? 'períodos de menor demanda' : null
    }
  }

  // Analisar volume vs. qualidade
  static analyzeVolumeQuality(technicianStats, teamStats) {
    if (!technicianStats || !teamStats) return { recommendation: null }

    const volumeRatio = technicianStats.total / Math.max(teamStats.total, 1)
    const qualityRatio = technicianStats.slaCompliance / Math.max(teamStats.slaCompliance, 1)

    if (volumeRatio > 1.2 && qualityRatio < 0.9) {
      return {
        type: 'warning',
        priority: 'média',
        title: 'Equilíbrio Volume vs. Qualidade',
        message: 'Você está resolvendo mais chamados que a média, mas com menor SLA compliance. Considere focar em qualidade sobre quantidade.',
        recommendation: true
      }
    } else if (volumeRatio < 0.8 && qualityRatio > 1.1) {
      return {
        type: 'success',
        priority: 'baixa',
        title: 'Excelente Qualidade',
        message: 'Você mantém alta qualidade mesmo com volume menor. Se desejar aumentar produtividade, considere aceitar mais chamados nas categorias onde se destaca.',
        recommendation: true
      }
    }

    return { recommendation: null }
  }

  // Analisar tendências
  static analyzeTrends(historicalData) {
    if (!historicalData || historicalData.length < 3) {
      return { declining: false, improving: false }
    }

    const recent = historicalData.slice(-3)
    const compliances = recent.map(d => parseFloat(d.compliance) || 0)
    
    // Calcular tendência
    const first = compliances[0]
    const last = compliances[compliances.length - 1]
    const change = last - first

    return {
      declining: change < -5,
      improving: change > 5,
      declineAmount: change < 0 ? Math.abs(change).toFixed(1) : 0,
      improvementAmount: change > 0 ? change.toFixed(1) : 0
    }
  }

  // Analisar eficiência por prioridade
  static analyzePriorityEfficiency(openTickets) {
    if (!openTickets || openTickets.length === 0) {
      return { recommendation: null }
    }

    const highPriority = openTickets.filter(t => 
      t.Prioridade === 'Alta' || t.Prioridade === 'Crítica'
    ).length

    const totalOpen = openTickets.length

    if (highPriority > 0 && highPriority / totalOpen > 0.3) {
      return {
        type: 'warning',
        priority: 'alta',
        title: 'Alta Concentração de Chamados Prioritários',
        message: `${highPriority} de ${totalOpen} chamados abertos são de alta prioridade. Priorize a resolução desses para evitar exceder SLAs críticos.`,
        recommendation: true
      }
    }

    return { recommendation: null }
  }

  // Analisar riscos de SLA
  static analyzeSLARisk(openTickets, technicianStats) {
    if (!openTickets || openTickets.length === 0) {
      return { needsAttention: false }
    }

    const riskyTickets = openTickets.filter(ticket => {
      const slaStr = ticket['SLA - SLA Tempo para solução'] || ''
      const timeStr = ticket['Tempo para solução'] || ''
      
      if (!slaStr || !timeStr) return false
      
      const slaHours = this.parseHours(slaStr)
      const usedHours = this.parseTimeToHours(timeStr)
      
      if (slaHours === 0) return false
      
      return (usedHours / slaHours) >= 0.75
    })

    if (riskyTickets.length > 0) {
      return {
        needsAttention: true,
        urgentCount: riskyTickets.length,
        message: `${riskyTickets.length} chamado(s) aberto(s) estão com 75%+ do SLA utilizado. Ação imediata necessária para evitar excedência.`
      }
    }

    return { needsAttention: false }
  }

  // Análise comparativa avançada
  static comparativeAnalysis(technicianStats, teamStats) {
    const slaGap = technicianStats.slaCompliance - teamStats.slaCompliance
    const timeGap = technicianStats.avgResolutionTime - teamStats.avgResolutionTime

    if (slaGap < -15) {
      return {
        type: 'warning',
        priority: 'alta',
        title: 'Gap Significativo com a Equipe',
        message: `Você está ${Math.abs(slaGap).toFixed(1)}% abaixo da média em SLA compliance. Considere revisar processos e buscar mentoria de técnicos de alto desempenho.`,
        recommendation: true
      }
    } else if (slaGap > 15) {
      return {
        type: 'success',
        priority: 'baixa',
        title: 'Desempenho Excepcional',
        message: `Parabéns! Você está ${slaGap.toFixed(1)}% acima da média. Considere compartilhar suas melhores práticas com a equipe.`,
        recommendation: true
      }
    }

    return { recommendation: null }
  }

  // Helpers
  static parseHours(timeStr) {
    if (!timeStr) return 0
    const hoursMatch = timeStr.match(/(\d+)\s*h/i)
    const daysMatch = timeStr.match(/(\d+)\s*d/i)
    let hours = 0
    if (daysMatch) hours += parseInt(daysMatch[1]) * 24
    if (hoursMatch) hours += parseInt(hoursMatch[1])
    return hours
  }

  static parseTimeToHours(timeStr) {
    if (!timeStr) return 0
    const hoursMatch = timeStr.match(/(\d+)\s*hora/)
    const minutesMatch = timeStr.match(/(\d+)\s*minuto/)
    let hours = 0
    if (hoursMatch) hours += parseInt(hoursMatch[1])
    if (minutesMatch) hours += parseInt(minutesMatch[1]) / 60
    return hours
  }
}

export default AdvancedRecommendations

