import React, { useState, useEffect } from 'react'
import { Star, ThumbsUp, ThumbsDown, Calendar, MessageSquare, TrendingUp, Users, Award } from 'lucide-react'

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
      <div className="dashboard-card">
        <div className="text-center py-8">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma Avaliação Realizada
          </h3>
          <p className="text-gray-600">
            As avaliações aparecerão aqui após você analisar e avaliar os chamados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas de NPS */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="h-5 w-5" />
          Net Promoter Score (NPS)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className={`text-4xl font-bold ${npsColor} mb-2`}>{npsScore}</div>
            <div className="text-sm text-gray-600 mb-1">NPS Score</div>
            <div className={`text-sm font-medium ${npsColor}`}>{npsCategory}</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {starReviews.filter(r => r.stars >= 4).length}
            </div>
            <div className="text-sm text-gray-600 mb-1">Promotores</div>
            <div className="text-sm font-medium text-green-600">(4-5 estrelas)</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
            <div className="text-4xl font-bold text-red-600 mb-2">
              {starReviews.filter(r => r.stars <= 2).length}
            </div>
            <div className="text-sm text-gray-600 mb-1">Detratores</div>
            <div className="text-sm font-medium text-red-600">(0-2 estrelas)</div>
          </div>
        </div>
      </div>

      {/* Distribuição de Estrelas */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Distribuição de Avaliações por Estrelas
        </h3>
        <div className="space-y-3">
          {starDistribution.slice(1).reverse().map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-4">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium text-gray-700">{stars}</span>
                <Star className="h-4 w-4 text-yellow-400" fill="#FBBF24" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 w-20 text-right">
                {count} ({percentage}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avaliações por Estrelas Recebidas */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="h-5 w-5" />
          Avaliações por Estrelas Recebidas
        </h3>
        <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
          <span>Média: <span className="font-semibold">{averageStars}</span></span>
          <span>Total: <span className="font-semibold">{starReviews.length}</span></span>
        </div>
        {starReviews.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {starReviews.map((r) => (
              <div key={r.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => i + 1).map((v) => (
                      <Star key={v} className={`h-4 w-4 ${r.stars >= v ? 'text-yellow-400' : 'text-gray-300'}`} fill={r.stars >= v ? '#FBBF24' : 'none'} />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{r.stars}/5</span>
                    {r.ticketId && (
                      <button
                        onClick={() => onJumpToTicket && onJumpToTicket(String(r.ticketId))}
                        className="ml-3 text-xs text-blue-600 hover:text-blue-700 underline"
                      >
                        Ver chamado #{r.ticketId}
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{new Date(r.date).toLocaleString('pt-BR')}</span>
                </div>
                {r.comment && (
                  <p className="text-sm text-gray-700 mt-1">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Ainda não há avaliações por estrelas.</p>
        )}
      </div>

      {/* Resumo Geral (apenas leitura) */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Star className="h-5 w-5" />
            Resumo das Avaliações
          </h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalEvaluations}</div>
            <div className="text-sm text-gray-600">Total Avaliado</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{positiveEvaluations}</div>
            <div className="text-sm text-gray-600">Avaliações Positivas</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{negativeEvaluations}</div>
            <div className="text-sm text-gray-600">Avaliações Negativas</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{positivePercentage}%</div>
            <div className="text-sm text-gray-600">Satisfação</div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Satisfação Geral</span>
            <span>{positivePercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${positivePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Detalhes das Avaliações */}
      {showDetails && (
        <div className="dashboard-card">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Detalhes das Avaliações
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(evaluations)
              .sort(([,a], [,b]) => new Date(b.date) - new Date(a.date))
              .map(([ticketId, evaluation]) => (
                <div 
                  key={ticketId}
                  className={`p-4 rounded-lg border ${
                    evaluation.evaluation === 'positive' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {evaluation.evaluation === 'positive' ? (
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <ThumbsDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium text-gray-900">
                          Chamado #{ticketId}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          evaluation.evaluation === 'positive'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {evaluation.evaluation === 'positive' ? 'Positiva' : 'Negativa'}
                        </span>
                      </div>
                      
                      {evaluation.comment && (
                        <div className="flex items-start gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                          <p className="text-sm text-gray-700 italic">
                            "{evaluation.comment}"
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
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