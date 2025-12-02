import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, Target, Calendar, AlertCircle, BarChart3, Zap } from 'lucide-react'
import PredictiveAnalysisService from '../services/PredictiveAnalysis'

const PredictiveAnalysisComponent = ({ technicianStats, historicalData, openTickets }) => {
  const predictions = useMemo(() => {
    if (!technicianStats || !historicalData) return null

    const slaPrediction = PredictiveAnalysisService.predictSLACompliance(historicalData, 1)
    const timePrediction = PredictiveAnalysisService.predictResolutionTime(historicalData, 1)
    const riskPrediction = PredictiveAnalysisService.predictSLARisk(openTickets, technicianStats.slaCompliance)
    const futurePerformance = PredictiveAnalysisService.predictFuturePerformance(technicianStats, historicalData, 30)
    const seasonalPatterns = PredictiveAnalysisService.detectSeasonalPatterns(historicalData)

    return {
      slaCompliance: slaPrediction,
      resolutionTime: timePrediction,
      slaRisk: riskPrediction,
      futurePerformance,
      seasonalPatterns
    }
  }, [technicianStats, historicalData, openTickets])

  if (!predictions || !predictions.slaCompliance) {
    return null
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'ascendente':
      case 'diminuindo':
        return <TrendingUp className="h-5 w-5 text-green-400" />
      case 'descendente':
      case 'aumentando':
        return <TrendingDown className="h-5 w-5 text-red-400" />
      default:
        return <Target className="h-5 w-5 text-blue-400" />
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'ascendente':
      case 'diminuindo':
        return 'text-green-400'
      case 'descendente':
      case 'aumentando':
        return 'text-red-400'
      default:
        return 'text-blue-400'
    }
  }

  return (
    <div className="bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border-2 border-indigo-500/30 shadow-md">
      <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-indigo-400" />
        Análise Preditiva
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Previsão de SLA Compliance */}
        {predictions.slaCompliance && (
          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-gray-300">SLA Compliance Previsto</h5>
              {getTrendIcon(predictions.slaCompliance.trend)}
            </div>
            <div className="mb-2">
              <p className="text-3xl font-bold text-white">
                {predictions.slaCompliance.predicted}%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Próximo período
              </p>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${getTrendColor(predictions.slaCompliance.trend)}`}>
                Tendência: {predictions.slaCompliance.trend}
                {predictions.slaCompliance.trendValue !== 0 && (
                  <span className="ml-1">
                    ({predictions.slaCompliance.trendValue > 0 ? '+' : ''}{predictions.slaCompliance.trendValue}%)
                  </span>
                )}
              </span>
              <span className="text-gray-400">
                Confiança: {predictions.slaCompliance.confidence}%
              </span>
            </div>
          </div>
        )}

        {/* Previsão de Tempo de Resolução */}
        {predictions.resolutionTime && (
          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-gray-300">Tempo Médio Previsto</h5>
              {getTrendIcon(predictions.resolutionTime.trend)}
            </div>
            <div className="mb-2">
              <p className="text-3xl font-bold text-white">
                {predictions.resolutionTime.predicted} min
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Próximo período
              </p>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${getTrendColor(predictions.resolutionTime.trend)}`}>
                Tendência: {predictions.resolutionTime.trend}
              </span>
              <span className="text-gray-400">
                Confiança: {predictions.resolutionTime.confidence}%
              </span>
            </div>
          </div>
        )}

        {/* Risco de SLA */}
        {predictions.slaRisk && (
          <div className={`bg-gray-800/50 rounded-lg p-5 border-2 ${
            predictions.slaRisk.riskLevel === 'alto' ? 'border-red-500/50' :
            predictions.slaRisk.riskLevel === 'médio' ? 'border-orange-500/50' :
            'border-green-500/50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-gray-300">Risco de SLA</h5>
              <AlertCircle className={`h-5 w-5 ${
                predictions.slaRisk.riskLevel === 'alto' ? 'text-red-400' :
                predictions.slaRisk.riskLevel === 'médio' ? 'text-orange-400' :
                'text-green-400'
              }`} />
            </div>
            <div className="mb-2">
              <p className={`text-3xl font-bold ${
                predictions.slaRisk.riskLevel === 'alto' ? 'text-red-400' :
                predictions.slaRisk.riskLevel === 'médio' ? 'text-orange-400' :
                'text-green-400'
              }`}>
                {predictions.slaRisk.riskyCount}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Chamados em risco ({predictions.slaRisk.riskPercentage}%)
              </p>
            </div>
            <div className="text-xs text-gray-400">
              {predictions.slaRisk.totalOpen} chamados abertos
            </div>
          </div>
        )}
      </div>

      {/* Volume Previsto */}
      {predictions.futurePerformance && predictions.futurePerformance.ticketVolume && (
        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-semibold text-gray-300">Volume Previsto (30 dias)</h5>
            <Calendar className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-2xl font-bold text-white">
                ~{predictions.futurePerformance.ticketVolume.predicted}
              </p>
              <p className="text-xs text-gray-400">chamados previstos</p>
            </div>
            <div className="border-l border-gray-700 pl-4">
              <p className="text-sm text-gray-300">
                Média diária: {predictions.futurePerformance.ticketVolume.dailyAverage}
              </p>
              <p className="text-xs text-gray-400">
                Confiança: {predictions.futurePerformance.ticketVolume.confidence}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Informações sobre Previsões */}
      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-300 mb-1">Como Funcionam as Previsões</p>
            <p className="text-xs text-blue-200/80">
              As previsões são baseadas em análise de tendências dos seus dados históricos, usando médias móveis e análise de padrões. 
              Quanto mais dados históricos disponíveis, maior a confiança nas previsões.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PredictiveAnalysisComponent

