import React, { useMemo } from 'react'
import { Heart, Coffee, Moon, AlertCircle, TrendingUp, Activity, Battery, Zap, Clock } from 'lucide-react'

const WellnessMonitor = ({ technicianTickets, technicianStats, historicalData }) => {
  const wellnessMetrics = useMemo(() => {
    if (!technicianTickets || !technicianStats) return null

    const openTickets = technicianTickets.filter(t => 
      t.Status !== 'Solucionado' && t.Status !== 'Fechado'
    )

    // Calcular carga de trabalho
    const workloadLevel = openTickets.length
    const workloadStatus = workloadLevel > 15 ? 'sobrecarga' : 
                          workloadLevel > 10 ? 'alta' : 
                          workloadLevel > 5 ? 'moderada' : 'normal'

    // Calcular horas trabalhadas estimadas (baseado em resoluções)
    const resolvedTickets = technicianTickets.filter(t => 
      (t.Status === 'Solucionado' || t.Status === 'Fechado') && t['Tempo para solução']
    )

    let estimatedHours = 0
    resolvedTickets.forEach(ticket => {
      const timeStr = ticket['Tempo para solução'] || ''
      const hoursMatch = timeStr.match(/(\d+)\s*hora/)
      const minutesMatch = timeStr.match(/(\d+)\s*minuto/)
      if (hoursMatch) estimatedHours += parseInt(hoursMatch[1])
      if (minutesMatch) estimatedHours += parseInt(minutesMatch[1]) / 60
    })

    // Calcular intensidade de trabalho (baseado em SLA compliance)
    const intensityLevel = technicianStats.slaCompliance < 70 ? 'alta' :
                          technicianStats.slaCompliance < 85 ? 'moderada' : 'normal'

    // Calcular tendência de burnout (risco baseado em múltiplos fatores)
    let burnoutRisk = 0
    if (workloadLevel > 15) burnoutRisk += 30
    if (workloadLevel > 20) burnoutRisk += 20
    if (technicianStats.slaCompliance < 75) burnoutRisk += 25
    if (technicianStats.slaExceeded > 5) burnoutRisk += 15
    if (estimatedHours > 160) burnoutRisk += 10 // Mais de 160h em um período

    const burnoutLevel = burnoutRisk >= 60 ? 'alto' :
                        burnoutRisk >= 40 ? 'médio' :
                        burnoutRisk >= 20 ? 'baixo' : 'mínimo'

    // Análise de equilíbrio
    const balanceScore = 100 - burnoutRisk
    const balanceStatus = balanceScore >= 80 ? 'excelente' :
                         balanceScore >= 60 ? 'bom' :
                         balanceScore >= 40 ? 'atenção' : 'crítico'

    return {
      workloadLevel,
      workloadStatus,
      estimatedHours: Math.round(estimatedHours),
      intensityLevel,
      burnoutRisk,
      burnoutLevel,
      balanceScore,
      balanceStatus,
      openTicketsCount: openTickets.length
    }
  }, [technicianTickets, technicianStats, historicalData])

  if (!wellnessMetrics) return null

  const getWellnessColor = (status) => {
    switch (status) {
      case 'excelente':
      case 'normal':
        return 'text-green-400'
      case 'bom':
      case 'moderada':
        return 'text-blue-400'
      case 'atenção':
      case 'alta':
        return 'text-yellow-400'
      case 'crítico':
      case 'sobrecarga':
      case 'alto':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getWellnessBg = (status) => {
    switch (status) {
      case 'excelente':
      case 'normal':
        return 'bg-green-500/20 border-green-500/50'
      case 'bom':
      case 'moderada':
        return 'bg-blue-500/20 border-blue-500/50'
      case 'atenção':
      case 'alta':
        return 'bg-yellow-500/20 border-yellow-500/50'
      case 'crítico':
      case 'sobrecarga':
      case 'alto':
        return 'bg-red-500/20 border-red-500/50'
      default:
        return 'bg-gray-500/20 border-gray-500/50'
    }
  }

  const getRecommendations = () => {
    const recs = []
    
    if (wellnessMetrics.workloadLevel > 15) {
      recs.push({
        type: 'critical',
        message: 'Você tem muitos chamados abertos. Considere priorizar e comunicar sobrecarga ao gestor.'
      })
    }
    
    if (wellnessMetrics.burnoutRisk >= 60) {
      recs.push({
        type: 'critical',
        message: 'Risco elevado de sobrecarga. É importante fazer pausas e equilibrar o ritmo de trabalho.'
      })
    } else if (wellnessMetrics.burnoutRisk >= 40) {
      recs.push({
        type: 'warning',
        message: 'Carga de trabalho elevada. Tente distribuir melhor suas atividades ao longo do dia.'
      })
    }
    
    if (wellnessMetrics.estimatedHours > 160) {
      recs.push({
        type: 'warning',
        message: 'Horas trabalhadas acima do ideal. Lembre-se de fazer pausas regulares e manter o equilíbrio.'
      })
    }
    
    if (wellnessMetrics.balanceScore >= 80) {
      recs.push({
        type: 'success',
        message: 'Excelente equilíbrio! Você está mantendo um ritmo saudável de trabalho.'
      })
    }

    return recs
  }

  const recommendations = getRecommendations()

  return (
    <div className="bg-gradient-to-br from-pink-600/20 via-rose-600/20 to-red-600/20 backdrop-blur-sm rounded-xl p-6 border-2 border-pink-500/30 shadow-md">
      <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Heart className="h-6 w-6 text-pink-400" />
        Monitor de Bem-Estar
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Score de Equilíbrio */}
        <div className={`${getWellnessBg(wellnessMetrics.balanceStatus)} rounded-lg p-5 border-2`}>
          <div className="flex items-center justify-between mb-3">
            <Battery className={`h-5 w-5 ${getWellnessColor(wellnessMetrics.balanceStatus)}`} />
            <span className={`text-xs font-semibold px-2 py-1 rounded ${getWellnessBg(wellnessMetrics.balanceStatus)}`}>
              {wellnessMetrics.balanceStatus.charAt(0).toUpperCase() + wellnessMetrics.balanceStatus.slice(1)}
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-1">Equilíbrio Trabalho-Vida</p>
          <p className={`text-3xl font-bold ${getWellnessColor(wellnessMetrics.balanceStatus)}`}>
            {wellnessMetrics.balanceScore}/100
          </p>
        </div>

        {/* Risco de Burnout */}
        <div className={`${getWellnessBg(wellnessMetrics.burnoutLevel)} rounded-lg p-5 border-2`}>
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className={`h-5 w-5 ${getWellnessColor(wellnessMetrics.burnoutLevel)}`} />
            <span className={`text-xs font-semibold px-2 py-1 rounded ${getWellnessBg(wellnessMetrics.burnoutLevel)}`}>
              {wellnessMetrics.burnoutLevel.charAt(0).toUpperCase() + wellnessMetrics.burnoutLevel.slice(1)}
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-1">Risco de Sobrecarga</p>
          <p className={`text-3xl font-bold ${getWellnessColor(wellnessMetrics.burnoutLevel)}`}>
            {wellnessMetrics.burnoutRisk}%
          </p>
        </div>

        {/* Carga de Trabalho */}
        <div className={`${getWellnessBg(wellnessMetrics.workloadStatus)} rounded-lg p-5 border-2`}>
          <div className="flex items-center justify-between mb-3">
            <Activity className={`h-5 w-5 ${getWellnessColor(wellnessMetrics.workloadStatus)}`} />
            <span className={`text-xs font-semibold px-2 py-1 rounded ${getWellnessBg(wellnessMetrics.workloadStatus)}`}>
              {wellnessMetrics.workloadStatus.charAt(0).toUpperCase() + wellnessMetrics.workloadStatus.slice(1)}
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-1">Carga de Trabalho</p>
          <p className={`text-3xl font-bold ${getWellnessColor(wellnessMetrics.workloadStatus)}`}>
            {wellnessMetrics.openTicketsCount}
          </p>
          <p className="text-xs text-gray-400 mt-1">chamados abertos</p>
        </div>

        {/* Horas Estimadas */}
        <div className="bg-gray-800/50 rounded-lg p-5 border-2 border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-sm text-gray-300 mb-1">Horas Estimadas</p>
          <p className="text-3xl font-bold text-white">
            {wellnessMetrics.estimatedHours}h
          </p>
          <p className="text-xs text-gray-400 mt-1">tempo de resolução</p>
        </div>
      </div>

      {/* Recomendações de Bem-Estar */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <h5 className="font-semibold text-white flex items-center gap-2">
            <Coffee className="h-5 w-5 text-pink-400" />
            Recomendações de Bem-Estar
          </h5>
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                rec.type === 'critical' ? 'bg-red-500/20 border-red-500/50' :
                rec.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500/50' :
                'bg-green-500/20 border-green-500/50'
              }`}
            >
              <p className={`text-sm ${
                rec.type === 'critical' ? 'text-red-300' :
                rec.type === 'warning' ? 'text-yellow-300' :
                'text-green-300'
              }`}>
                {rec.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Indicador Visual de Saúde */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
          <span className="font-semibold">Nível de Bem-Estar Geral</span>
          <span className={`font-bold ${getWellnessColor(wellnessMetrics.balanceStatus)}`}>
            {wellnessMetrics.balanceScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              wellnessMetrics.balanceScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              wellnessMetrics.balanceScore >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
              wellnessMetrics.balanceScore >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-red-500 to-rose-500'
            }`}
            style={{ width: `${wellnessMetrics.balanceScore}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default WellnessMonitor

