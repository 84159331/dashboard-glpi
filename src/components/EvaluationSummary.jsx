import React, { useState, useEffect } from 'react'
import { Star, ThumbsUp, ThumbsDown, Calendar, MessageSquare } from 'lucide-react'

const EvaluationSummary = () => {
  const [evaluations, setEvaluations] = useState({})
  const [showDetails, setShowDetails] = useState(false)
  // Avaliações por estrelas (0 a 5) com comentário opcional
  const [starReviews, setStarReviews] = useState([])
  const [currentStars, setCurrentStars] = useState(0)
  const [hoverStars, setHoverStars] = useState(null)
  const [reviewComment, setReviewComment] = useState('')

  useEffect(() => {
    const storedEvaluations = JSON.parse(localStorage.getItem('ticketEvaluations') || '{}')
    setEvaluations(storedEvaluations)
    const storedStars = JSON.parse(localStorage.getItem('starEvaluations') || '[]')
    setStarReviews(storedStars)
  }, [])

  const totalEvaluations = Object.keys(evaluations).length
  const positiveEvaluations = Object.values(evaluations).filter(evaluation => evaluation.evaluation === 'positive').length
  const negativeEvaluations = Object.values(evaluations).filter(evaluation => evaluation.evaluation === 'negative').length
  const positivePercentage = totalEvaluations > 0 ? ((positiveEvaluations / totalEvaluations) * 100).toFixed(1) : 0

  const averageStars = starReviews.length > 0
    ? (starReviews.reduce((sum, r) => sum + (r.stars || 0), 0) / starReviews.length).toFixed(1)
    : 0

  const handleSubmitStarReview = (e) => {
    e.preventDefault()
    const newReview = {
      id: Date.now(),
      stars: currentStars,
      comment: reviewComment.trim(),
      date: new Date().toISOString()
    }
    const updated = [newReview, ...starReviews]
    setStarReviews(updated)
    localStorage.setItem('starEvaluations', JSON.stringify(updated))
    setCurrentStars(0)
    setHoverStars(null)
    setReviewComment('')
  }

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
      {/* Nova Avaliação por Estrelas */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="h-5 w-5" />
          Avaliar por Estrelas (0 = Muito ruim, 5 = Excelente)
        </h3>
        <form onSubmit={handleSubmitStarReview} className="space-y-4">
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
              <button
                key={value}
                type="button"
                onMouseEnter={() => setHoverStars(value)}
                onMouseLeave={() => setHoverStars(null)}
                onClick={() => setCurrentStars(value)}
                className="p-1"
                aria-label={`Avaliar ${value} estrela${value > 1 ? 's' : ''}`}
              >
                <Star
                  className={`h-6 w-6 ${ (hoverStars ?? currentStars) >= value ? 'text-yellow-400' : 'text-gray-300' }`}
                  fill={(hoverStars ?? currentStars) >= value ? '#FBBF24' : 'none'}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">{currentStars} / 5</span>
            <button
              type="button"
              onClick={() => setCurrentStars(0)}
              className="ml-3 text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Zerar (0)
            </button>
          </div>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Escreva sua avaliação (opcional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
            rows={3}
          />
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Média atual: <span className="font-semibold">{averageStars}</span> ({starReviews.length} avaliações)
            </div>
            <button
              type="submit"
              disabled={currentStars < 0 || currentStars > 5}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              Enviar avaliação
            </button>
          </div>
        </form>
        {starReviews.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-2">Avaliações recentes</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {starReviews.map((r) => (
                <div key={r.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => i + 1).map((v) => (
                        <Star key={v} className={`h-4 w-4 ${r.stars >= v ? 'text-yellow-400' : 'text-gray-300'}`} fill={r.stars >= v ? '#FBBF24' : 'none'} />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{r.stars}/5</span>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(r.date).toLocaleString('pt-BR')}</span>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-gray-700 mt-1">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Resumo Geral */}
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

      {/* Ações */}
      <div className="dashboard-card">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Gerenciar Avaliações
        </h4>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja limpar todas as avaliações? Esta ação não pode ser desfeita.')) {
                localStorage.removeItem('ticketEvaluations')
                setEvaluations({})
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Limpar Todas as Avaliações
          </button>
          
          <button
            onClick={() => {
              const evaluationsText = Object.entries(evaluations)
                .map(([ticketId, evaluation]) => 
                  `Chamado #${ticketId}: ${evaluation.evaluation === 'positive' ? 'Positiva' : 'Negativa'} - ${evaluation.comment || 'Sem comentário'} - ${formatDate(evaluation.date)}`
                )
                .join('\n')
              
              const blob = new Blob([evaluationsText], { type: 'text/plain' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'avaliacoes_chamados.txt'
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Exportar Avaliações
          </button>
        </div>
      </div>
    </div>
  )
}

export default EvaluationSummary 