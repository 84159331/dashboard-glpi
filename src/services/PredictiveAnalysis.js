// Serviço de Análise Preditiva - Previsões baseadas em dados históricos

class PredictiveAnalysis {
  // Prever SLA compliance para o próximo período baseado em tendência
  static predictSLACompliance(historicalData, periods = 1) {
    if (!historicalData || historicalData.length < 2) {
      return null
    }

    // Ordenar por data
    const sorted = [...historicalData].sort((a, b) => {
      const dateA = this.parseDate(a.month)
      const dateB = this.parseDate(b.month)
      return dateA - dateB
    })

    // Calcular tendência linear simples
    const n = sorted.length
    const compliances = sorted.map(d => parseFloat(d.compliance) || 0)
    
    // Média móvel ponderada (últimos meses têm mais peso)
    const weights = []
    for (let i = 0; i < n; i++) {
      weights.push((i + 1) / (n * (n + 1) / 2))
    }
    
    const weightedAvg = compliances.reduce((sum, val, idx) => sum + val * weights[idx], 0)
    
    // Calcular tendência (diferença entre últimos 2 períodos)
    const trend = n >= 2 ? compliances[n - 1] - compliances[0] : 0
    
    // Previsão para próximo período
    const prediction = Math.max(0, Math.min(100, weightedAvg + (trend / n) * periods))
    const confidence = Math.min(100, n * 15) // Mais dados = mais confiança (máx 100%)

    return {
      predicted: Math.round(prediction * 10) / 10,
      confidence: Math.round(confidence),
      trend: trend > 0 ? 'ascendente' : trend < 0 ? 'descendente' : 'estável',
      trendValue: Math.round(trend * 10) / 10
    }
  }

  // Prever tempo médio de resolução
  static predictResolutionTime(historicalData, periods = 1) {
    if (!historicalData || historicalData.length < 2) {
      return null
    }

    const sorted = [...historicalData].sort((a, b) => {
      const dateA = this.parseDate(a.month)
      const dateB = this.parseDate(b.month)
      return dateA - dateB
    })

    const times = sorted.map(d => parseFloat(d.avgResolutionTime) || 0).filter(t => t > 0)
    
    if (times.length === 0) return null

    // Média móvel exponencial
    const alpha = 0.3 // Fator de suavização
    let ema = times[0]
    
    for (let i = 1; i < times.length; i++) {
      ema = alpha * times[i] + (1 - alpha) * ema
    }

    // Tendência
    const trend = times.length >= 2 ? times[times.length - 1] - times[0] : 0
    const prediction = Math.max(0, ema + (trend / times.length) * periods)

    return {
      predicted: Math.round(prediction),
      confidence: Math.min(100, times.length * 15),
      trend: trend > 0 ? 'aumentando' : trend < 0 ? 'diminuindo' : 'estável',
      trendValue: Math.round(trend)
    }
  }

  // Prever risco de exceder SLA em chamados abertos
  static predictSLARisk(openTickets, historicalCompliance) {
    if (!openTickets || openTickets.length === 0) {
      return null
    }

    const totalOpen = openTickets.length
    
    // Taxa histórica de excedência
    const historicalExceedRate = historicalCompliance ? (100 - historicalCompliance) / 100 : 0.2
    
    // Estimativa de quantos podem exceder baseado em histórico
    const estimatedExceed = Math.round(totalOpen * historicalExceedRate)
    
    // Análise de tempo restante nos chamados abertos
    const riskyCount = openTickets.filter(ticket => {
      const slaStr = ticket['SLA - SLA Tempo para solução'] || ''
      const timeStr = ticket['Tempo para solução'] || ''
      
      if (!slaStr || !timeStr) return false
      
      const slaHours = this.parseHours(slaStr)
      const usedHours = this.parseTimeToHours(timeStr)
      
      if (slaHours === 0) return false
      
      // Se já usou mais de 70% do SLA
      return (usedHours / slaHours) >= 0.7
    }).length

    const riskLevel = riskyCount > 0 ? 
      (riskyCount / totalOpen >= 0.3 ? 'alto' : riskyCount / totalOpen >= 0.15 ? 'médio' : 'baixo') :
      'baixo'

    return {
      totalOpen,
      estimatedExceed,
      riskyCount,
      riskLevel,
      riskPercentage: totalOpen > 0 ? Math.round((riskyCount / totalOpen) * 100) : 0
    }
  }

  // Prever desempenho futuro baseado em padrões
  static predictFuturePerformance(technicianStats, historicalData, daysAhead = 30) {
    const predictions = {
      slaCompliance: null,
      resolutionTime: null,
      ticketVolume: null
    }

    if (historicalData && historicalData.length > 0) {
      predictions.slaCompliance = this.predictSLACompliance(historicalData, 1)
      predictions.resolutionTime = this.predictResolutionTime(historicalData, 1)
    }

    // Prever volume de chamados baseado em média
    if (historicalData && historicalData.length > 0) {
      const avgVolume = historicalData.reduce((sum, d) => sum + (d.total || 0), 0) / historicalData.length
      const daysInPeriod = 30 // assumindo dados mensais
      const dailyAvg = avgVolume / daysInPeriod
      
      predictions.ticketVolume = {
        predicted: Math.round(dailyAvg * daysAhead),
        dailyAverage: Math.round(dailyAvg * 10) / 10,
        confidence: Math.min(100, historicalData.length * 20)
      }
    }

    return predictions
  }

  // Identificar padrões sazonais
  static detectSeasonalPatterns(historicalData) {
    if (!historicalData || historicalData.length < 6) {
      return null
    }

    // Agrupar por dia da semana, mês, etc.
    const patterns = {
      monthly: {},
      weekly: {}
    }

    historicalData.forEach(entry => {
      const date = this.parseDate(entry.month)
      if (!date || isNaN(date.getTime())) return

      const month = date.getMonth()
      const dayOfWeek = date.getDay()

      if (!patterns.monthly[month]) {
        patterns.monthly[month] = { total: 0, count: 0 }
      }
      patterns.monthly[month].total += parseFloat(entry.compliance) || 0
      patterns.monthly[month].count++

      if (!patterns.weekly[dayOfWeek]) {
        patterns.weekly[dayOfWeek] = { total: 0, count: 0 }
      }
      patterns.weekly[dayOfWeek].total += parseFloat(entry.compliance) || 0
      patterns.weekly[dayOfWeek].count++
    })

    // Calcular médias
    Object.keys(patterns.monthly).forEach(month => {
      const data = patterns.monthly[month]
      patterns.monthly[month] = data.count > 0 ? data.total / data.count : 0
    })

    Object.keys(patterns.weekly).forEach(day => {
      const data = patterns.weekly[day]
      patterns.weekly[day] = data.count > 0 ? data.total / data.count : 0
    })

    return patterns
  }

  // Helper: Parsear data no formato MM/YYYY
  static parseDate(dateStr) {
    if (!dateStr) return null
    try {
      const [month, year] = dateStr.split('/').map(Number)
      return new Date(year, month - 1, 1)
    } catch {
      return null
    }
  }

  // Helper: Parsear horas de string
  static parseHours(timeStr) {
    if (!timeStr) return 0
    const hoursMatch = timeStr.match(/(\d+)\s*h/i)
    const daysMatch = timeStr.match(/(\d+)\s*d/i)
    let hours = 0
    if (daysMatch) hours += parseInt(daysMatch[1]) * 24
    if (hoursMatch) hours += parseInt(hoursMatch[1])
    return hours
  }

  // Helper: Parsear tempo usado em horas
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

export default PredictiveAnalysis

