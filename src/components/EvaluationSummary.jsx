import React, { useState, useEffect } from 'react'
import { Star, ThumbsUp, ThumbsDown, Calendar, MessageSquare, TrendingUp, Users, Award, Sparkles, BarChart3 } from 'lucide-react'

const EvaluationSummary = ({ onJumpToTicket }) => {
  const [evaluations, setEvaluations] = useState({})
  const [showDetails, setShowDetails] = useState(false)
  // Avaliações por estrelas (0 a 5) com comentário opcional
  const [starReviews, setStarReviews] = useState([])

  useEffect(() => {
    const storedEvaluations = JSON.parse(localStorage.getItem('ticketEvaluations') || '{}')
    setEvaluations(storedEvaluations)
    const storedStars = JSON.parse(localStorage.getItem('starEvaluations') || '[]')
    setStarReviews(storedStars)
  }, [])

  const totalEvaluationsThumbs = Object.keys(evaluations).length
  const totalEvaluationsStars = starReviews.length
  const totalEvaluations = totalEvaluationsThumbs + totalEvaluationsStars
  const positiveEvaluations = Object.values(evaluations).filter(evaluation => evaluation.evaluation === 'positive').length
  const negativeEvaluations = Object.values(evaluations).filter(evaluation => evaluation.evaluation === 'negative').length
  const positivePercentage = totalEvaluationsThumbs > 0 ? ((positiveEvaluations / totalEvaluationsThumbs) * 100).toFixed(1) : 0

  const averageStars = starReviews.length > 0
    ? (starReviews.reduce((sum, r) => sum + (r.stars || 0), 0) / starReviews.length).toFixed(1)
    : 0

  // Cálculo do NPS (Net Promoter Score)
  const calculateNPS = () => {
    if (starReviews.length === 0) return 0
    
    const promoters = starReviews.filter(r => r.stars >= 4).length
    const detractors = starReviews.filter(r => r.stars <= 2).length
    const total = starReviews.length
    
    return Math.round(((promoters - detractors) / total) * 100)
  }

  const npsScore = calculateNPS()
  const npsCategory = npsScore >= 50 ? 'Excelente' : npsScore >= 0 ? 'Bom' : npsScore >= -50 ? 'Regular' : 'Ruim'
  const npsColor = npsScore >= 50 ? 'text-green-400' : npsScore >= 0 ? 'text-blue-400' : npsScore >= -50 ? 'text-yellow-400' : 'text-red-400'

  // Distribuição de estrelas
  const starDistribution = Array.from({ length: 6 }, (_, i) => {
    const count = starReviews.filter(r => r.stars === i).length
    const percentage = starReviews.length > 0 ? (count / starReviews.length * 100).toFixed(1) : 0
    return { stars: i, count, percentage }
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (totalEvaluations === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-yellow-500/30 shadow-glow">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                Avaliações
              </h3>
            </div>
            <div className="text-center py-12">
              <Star className="h-16 w-16 text-yellow-400/50 mx-auto mb-6" />
              <h4 className="text-xl font-bold text-white mb-3">
                Nenhuma Avaliação Realizada
              </h4>
              <p className="text-gray-300 text-base max-w-md mx-auto">
                As avaliações aparecerão aqui após você analisar e avaliar os chamados. Comece avaliando alguns chamados para ver métricas de satisfação!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Modernizado */}
      <div className="bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-yellow-500/30 shadow-glow">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
              Avaliações e Satisfação
            </h3>
          </div>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
            Análise completa das avaliações recebidas, métricas de satisfação e Net Promoter Score (NPS)
          </p>
          {totalEvaluations > 0 && (
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span>{totalEvaluations} avaliações realizadas</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-orange-400" />
                <span>NPS: {npsScore} ({npsCategory})</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Métricas de NPS */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="h-6 w-6 text-blue-400" />
          Net Promoter Score (NPS)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-xl border-2 border-blue-500/30 backdrop-blur-sm">
            <div className={`text-5xl font-bold ${npsColor} mb-2`}>{npsScore}</div>
            <div className="text-sm text-gray-300 mb-1">NPS Score</div>
            <div className={`text-sm font-semibold ${npsColor}`}>{npsCategory}</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl border-2 border-green-500/30 backdrop-blur-sm">
            <div className="text-5xl font-bold text-green-400 mb-2">
              {starReviews.filter(r => r.stars >= 4).length}
            </div>
            <div className="text-sm text-gray-300 mb-1">Promotores</div>
            <div className="text-sm font-semibold text-green-400">(4-5 estrelas)</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-red-600/20 to-rose-600/20 rounded-xl border-2 border-red-500/30 backdrop-blur-sm">
            <div className="text-5xl font-bold text-red-400 mb-2">
              {starReviews.filter(r => r.stars <= 2).length}
            </div>
            <div className="text-sm text-gray-300 mb-1">Detratores</div>
            <div className="text-sm font-semibold text-red-400">(0-2 estrelas)</div>
          </div>
        </div>
      </div>

      {/* Distribuição de Estrelas */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-purple-400" />
          Distribuição de Avaliações por Estrelas
        </h3>
        <div className="space-y-3">
          {starDistribution.slice(1).reverse().map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-4">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium text-white">{stars}</span>
                <Star className="h-4 w-4 text-yellow-400" fill="#FBBF24" />
              </div>
              <div className="flex-1 bg-gray-700/50 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-300 w-20 text-right font-semibold">
                {count} ({percentage}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avaliações por Estrelas Recebidas */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Star className="h-6 w-6 text-yellow-400" />
          Avaliações por Estrelas Recebidas
        </h3>
        <div className="flex items-center justify-between mb-4 p-3 bg-white/5 rounded-lg">
          <span className="text-sm text-gray-300">Média: <span className="font-bold text-yellow-400">{averageStars}</span></span>
          <span className="text-sm text-gray-300">Total: <span className="font-bold text-white">{starReviews.length}</span></span>
        </div>
        {starReviews.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
            {starReviews.map((r) => (
              <div key={r.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => i + 1).map((v) => (
                        <Star key={v} className={`h-4 w-4 ${r.stars >= v ? 'text-yellow-400' : 'text-gray-600'}`} fill={r.stars >= v ? '#FBBF24' : 'none'} />
                      ))}
                      <span className="ml-2 text-sm text-gray-300 font-semibold">{r.stars}/5</span>
                      {r.ticketId && (
                        <button
                          onClick={() => onJumpToTicket && onJumpToTicket(String(r.ticketId))}
                          className="ml-3 text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                        >
                          Ver chamado #{r.ticketId}
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{new Date(r.date).toLocaleString('pt-BR')}</span>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-gray-300 mt-2 italic bg-white/5 p-2 rounded">{r.comment}</p>
                  )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Ainda não há avaliações por estrelas.</p>
        )}
      </div>

      {/* Resumo Geral */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-400" />
            Resumo das Avaliações
          </h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm font-semibold border border-white/20"
          >
            {showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-xl border border-blue-500/30">
            <div className="text-3xl font-bold text-blue-400">{totalEvaluations}</div>
            <div className="text-sm text-gray-300 mt-1">Total Avaliado</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl border border-green-500/30">
            <div className="text-3xl font-bold text-green-400">{positiveEvaluations}</div>
            <div className="text-sm text-gray-300 mt-1">Avaliações Positivas</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-red-600/20 to-rose-600/20 rounded-xl border border-red-500/30">
            <div className="text-3xl font-bold text-red-400">{negativeEvaluations}</div>
            <div className="text-sm text-gray-300 mt-1">Avaliações Negativas</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
            <div className="text-3xl font-bold text-purple-400">{positivePercentage}%</div>
            <div className="text-sm text-gray-300 mt-1">Satisfação</div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
            <span className="font-semibold">Satisfação Geral</span>
            <span className="font-bold text-white">{positivePercentage}%</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${positivePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Detalhes das Avaliações */}
      {showDetails && (
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30 shadow-xl animate-slide-up">
          <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-indigo-400" />
            Detalhes das Avaliações
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {Object.entries(evaluations)
              .sort(([,a], [,b]) => new Date(b.date) - new Date(a.date))
              .map(([ticketId, evaluation]) => (
                <div 
                  key={ticketId}
                  className={`p-4 rounded-lg border-2 backdrop-blur-sm ${
                    evaluation.evaluation === 'positive' 
                      ? 'bg-green-600/20 border-green-500/30' 
                      : 'bg-red-600/20 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {evaluation.evaluation === 'positive' ? (
                          <ThumbsUp className="h-5 w-5 text-green-400" />
                        ) : (
                          <ThumbsDown className="h-5 w-5 text-red-400" />
                        )}
                        <span className="font-bold text-white text-lg">
                          Chamado #{ticketId}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                          evaluation.evaluation === 'positive'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {evaluation.evaluation === 'positive' ? 'Positiva' : 'Negativa'}
                        </span>
                      </div>
                      
                      {evaluation.comment && (
                        <div className="flex items-start gap-2 mb-3 p-3 bg-white/5 rounded-lg">
                          <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-300 italic">
                            "{evaluation.comment}"
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(evaluation.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Somente leitura nesta aba; criação de avaliações apenas nos chamados */}
    </div>
  )
}

export default EvaluationSummary 