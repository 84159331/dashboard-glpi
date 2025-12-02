import React, { useMemo } from 'react'
import { Clock, Calendar, Activity, TrendingUp, Coffee, Moon, Sun } from 'lucide-react'

const BehavioralAnalysis = ({ technicianTickets, technicianStats }) => {
  const behavioralInsights = useMemo(() => {
    if (!technicianTickets || technicianTickets.length === 0) return null

    // Analisar padrões temporais
    const timePatterns = analyzeTimePatterns(technicianTickets)
    
    // Analisar padrões de carga
    const workloadPatterns = analyzeWorkloadPatterns(technicianTickets)
    
    // Analisar padrões de eficiência
    const efficiencyPatterns = analyzeEfficiencyPatterns(technicianTickets)

    return {
      timePatterns,
      workloadPatterns,
      efficiencyPatterns
    }
  }, [technicianTickets, technicianStats])

  if (!behavioralInsights) {
    return null
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-md">
      <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Activity className="h-6 w-6 text-green-400" />
        Análise Comportamental e Padrões de Trabalho
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Padrões Temporais */}
        {behavioralInsights.timePatterns && (
          <div className="bg-gray-700/50 rounded-lg p-5 border border-gray-600/50">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-400" />
              <h5 className="font-semibold text-white">Padrões Temporais</h5>
            </div>
            {behavioralInsights.timePatterns.mostProductive && (
              <div className="space-y-2">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold">Período mais produtivo:</span>{' '}
                  {behavioralInsights.timePatterns.mostProductive}
                </p>
                {behavioralInsights.timePatterns.suggestion && (
                  <p className="text-xs text-blue-300 bg-blue-500/20 p-2 rounded">
                    💡 {behavioralInsights.timePatterns.suggestion}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Padrões de Carga */}
        {behavioralInsights.workloadPatterns && (
          <div className="bg-gray-700/50 rounded-lg p-5 border border-gray-600/50">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-purple-400" />
              <h5 className="font-semibold text-white">Distribuição de Carga</h5>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Chamados abertos:</span>{' '}
                {behavioralInsights.workloadPatterns.openCount}
              </p>
              {behavioralInsights.workloadPatterns.loadLevel && (
                <p className="text-xs text-gray-400">
                  Nível de carga: <span className={`font-semibold ${
                    behavioralInsights.workloadPatterns.loadLevel === 'alta' ? 'text-red-400' :
                    behavioralInsights.workloadPatterns.loadLevel === 'média' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {behavioralInsights.workloadPatterns.loadLevel}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Padrões de Eficiência */}
        {behavioralInsights.efficiencyPatterns && (
          <div className="bg-gray-700/50 rounded-lg p-5 border border-gray-600/50">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <h5 className="font-semibold text-white">Eficiência</h5>
            </div>
            <div className="space-y-2">
              {behavioralInsights.efficiencyPatterns.avgResolution && (
                <p className="text-sm text-gray-300">
                  <span className="font-semibold">Tempo médio:</span>{' '}
                  {behavioralInsights.efficiencyPatterns.avgResolution} min
                </p>
              )}
              {behavioralInsights.efficiencyPatterns.consistency && (
                <p className="text-xs text-gray-400">
                  Consistência: <span className={`font-semibold ${
                    behavioralInsights.efficiencyPatterns.consistency === 'alta' ? 'text-green-400' :
                    behavioralInsights.efficiencyPatterns.consistency === 'média' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {behavioralInsights.efficiencyPatterns.consistency}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Insights e Recomendações Comportamentais */}
      <div className="mt-6 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg p-4 border border-green-500/30">
        <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Coffee className="h-5 w-5 text-green-400" />
          Insights Comportamentais
        </h5>
        <div className="space-y-2 text-sm text-gray-300">
          {behavioralInsights.timePatterns && behavioralInsights.timePatterns.insight && (
            <p>• {behavioralInsights.timePatterns.insight}</p>
          )}
          {behavioralInsights.workloadPatterns && behavioralInsights.workloadPatterns.insight && (
            <p>• {behavioralInsights.workloadPatterns.insight}</p>
          )}
          {behavioralInsights.efficiencyPatterns && behavioralInsights.efficiencyPatterns.insight && (
            <p>• {behavioralInsights.efficiencyPatterns.insight}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Funções auxiliares para análise
function analyzeTimePatterns(tickets) {
  if (!tickets || tickets.length === 0) return null

  // Análise simplificada - em produção, analisaria horários de resolução
  const resolvedTickets = tickets.filter(t => 
    t.Status === 'Solucionado' || t.Status === 'Fechado'
  )

  return {
    mostProductive: resolvedTickets.length > 0 ? 'Horários de menor demanda' : null,
    suggestion: resolvedTickets.length > 10 ? 
      'Considere agendar chamados complexos em períodos de maior produtividade' : 
      'Continue coletando dados para identificar padrões temporais',
    insight: `Você resolveu ${resolvedTickets.length} chamados. Mantenha um ritmo constante para melhor desempenho.`
  }
}

function analyzeWorkloadPatterns(tickets) {
  if (!tickets) return null

  const openCount = tickets.filter(t => 
    t.Status !== 'Solucionado' && t.Status !== 'Fechado'
  ).length

  const loadLevel = openCount > 15 ? 'alta' : openCount > 8 ? 'média' : 'baixa'

  return {
    openCount,
    loadLevel,
    insight: loadLevel === 'alta' ? 
      'Você tem uma carga de trabalho elevada. Considere priorizar por SLA e complexidade.' :
      loadLevel === 'média' ?
      'Sua carga de trabalho está equilibrada. Mantenha o ritmo atual.' :
      'Carga de trabalho baixa. Você tem espaço para aceitar mais chamados.'
  }
}

function analyzeEfficiencyPatterns(tickets) {
  if (!tickets || tickets.length === 0) return null

  const resolvedTickets = tickets.filter(t => 
    t.Status === 'Solucionado' || t.Status === 'Fechado' && t['Tempo para solução']
  )

  if (resolvedTickets.length === 0) return null

  // Calcular tempos médios (simplificado)
  const times = resolvedTickets.map(t => {
    const timeStr = t['Tempo para solução'] || ''
    if (!timeStr) return 0
    
    const hoursMatch = timeStr.match(/(\d+)\s*hora/)
    const minutesMatch = timeStr.match(/(\d+)\s*minuto/)
    let totalMinutes = 0
    if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60
    if (minutesMatch) totalMinutes += parseInt(minutesMatch[1])
    return totalMinutes
  }).filter(t => t > 0)

  if (times.length === 0) return null

  const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length
  
  // Calcular variância para consistência
  const variance = times.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) / times.length
  const stdDev = Math.sqrt(variance)
  const coefficient = (stdDev / avgTime) * 100

  const consistency = coefficient < 30 ? 'alta' : coefficient < 50 ? 'média' : 'baixa'

  return {
    avgResolution: Math.round(avgTime),
    consistency,
    insight: consistency === 'alta' ?
      'Você mantém um ritmo muito consistente. Excelente para previsibilidade!' :
      consistency === 'média' ?
      'Sua consistência está boa. Continue trabalhando para reduzir variações.' :
      'Há grande variação nos tempos de resolução. Identifique os fatores que afetam a eficiência.'
  }
}

export default BehavioralAnalysis

