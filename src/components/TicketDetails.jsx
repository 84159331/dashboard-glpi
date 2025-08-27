import React, { useState } from 'react'
import { X, ThumbsUp, ThumbsDown, Clock, User, Tag, MessageSquare, Star } from 'lucide-react'

const TicketDetails = ({ ticket, isOpen, onClose, onEvaluate }) => {
  const [evaluation, setEvaluation] = useState(null)
  const [comment, setComment] = useState('')
  const [starRating, setStarRating] = useState(0)
  const [starHover, setStarHover] = useState(null)
  const [starComment, setStarComment] = useState('')

  if (!isOpen || !ticket) return null

  const handleEvaluate = (rating) => {
    setEvaluation(rating)
  }

  const handleSubmitEvaluation = () => {
    if (evaluation && onEvaluate) {
      onEvaluate(ticket.ID, evaluation, comment)
      setEvaluation(null)
      setComment('')
      onClose()
    }
  }

  const handleSubmitStarReview = () => {
    // Salva avaliação por estrelas no localStorage (lista cumulativa)
    const existing = JSON.parse(localStorage.getItem('starEvaluations') || '[]')
    const newReview = {
      id: Date.now(),
      ticketId: ticket.ID,
      stars: starRating,
      comment: starComment.trim(),
      date: new Date().toISOString()
    }
    const updated = [newReview, ...existing]
    localStorage.setItem('starEvaluations', JSON.stringify(updated))
    setStarRating(0)
    setStarHover(null)
    setStarComment('')
    onClose()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Solucionado':
        return 'bg-green-100 text-green-800'
      case 'Fechado':
        return 'bg-gray-100 text-gray-800'
      case 'Em andamento':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-100 text-red-800'
      case 'Média':
        return 'bg-yellow-100 text-yellow-800'
      case 'Baixa':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A'
    
    const hoursMatch = timeStr.match(/(\d+)\s*hora/)
    const minutesMatch = timeStr.match(/(\d+)\s*minuto/)
    const secondsMatch = timeStr.match(/(\d+)\s*segundo/)
    
    let totalMinutes = 0
    if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60
    if (minutesMatch) totalMinutes += parseInt(minutesMatch[1])
    if (secondsMatch) totalMinutes += parseInt(secondsMatch[1]) / 60
    
    if (totalMinutes < 60) {
      return `${Math.round(totalMinutes)} min`
    } else {
      const hours = Math.floor(totalMinutes / 60)
      const minutes = Math.round(totalMinutes % 60)
      return `${hours}h ${minutes}min`
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Tag className="h-6 w-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Chamado #{ticket.ID}
              </h2>
              <p className="text-sm text-gray-600">
                {ticket.Categoria}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {ticket.Título}
                </h3>
                <p className="text-gray-600 text-sm">
                  {ticket.Descrição || 'Sem descrição disponível'}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(ticket.Status)}`}>
                  {ticket.Status}
                </span>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(ticket.Prioridade)}`}>
                  {ticket.Prioridade}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  <strong>Requerente:</strong> {ticket['Requerente - Requerente']}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  <strong>Técnico:</strong> {ticket['Atribuído - Técnico']}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  <strong>Abertura:</strong> {ticket['Data de abertura']}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  <strong>Solução:</strong> {ticket['Data da solução'] || 'Pendente'}
                </span>
              </div>
            </div>
          </div>

          {/* Métricas de Tempo */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Métricas de Tempo</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Tempo de Espera</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatTime(ticket['Estatísticas - Tempo de espera'])}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Tempo de Atribuição</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatTime(ticket['Estatísticas - Tempo de atribuição'])}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Tempo de Solução</p>
                <p className="text-lg font-semibold text-purple-600">
                  {formatTime(ticket['Estatísticas - Tempo de solução'])}
                </p>
              </div>
            </div>
          </div>

          {/* Solução */}
          {ticket['Solução - Solução'] && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Solução Implementada</span>
              </h4>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {ticket['Solução - Solução']}
                </p>
              </div>
            </div>
          )}

          {/* SLA */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Informações de SLA</h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>SLA Definido:</strong> {ticket['SLA - SLA Tempo para solução']}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Tempo para Solução:</strong> {formatTime(ticket['Tempo para solução'])}
              </p>
              <p className="text-sm text-gray-600">
                <strong>SLA Excedido:</strong> 
                <span className={ticket['Tempo para resolver excedido'] === 'Sim' ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                  {ticket['Tempo para resolver excedido'] === 'Sim' ? ' Sim' : ' Não'}
                </span>
              </p>
            </div>
          </div>

          {/* Avaliação por Estrelas */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Avaliar por Estrelas (0 = Muito ruim, 5 = Excelente)</span>
            </h4>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onMouseEnter={() => setStarHover(value)}
                    onMouseLeave={() => setStarHover(null)}
                    onClick={() => setStarRating(value)}
                    className="p-1"
                  >
                    <Star
                      className={`h-6 w-6 ${ (starHover ?? starRating) >= value ? 'text-yellow-400' : 'text-gray-300' }`}
                      fill={(starHover ?? starRating) >= value ? '#FBBF24' : 'none'}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">{starRating} / 5</span>
                <button
                  type="button"
                  onClick={() => setStarRating(0)}
                  className="ml-3 text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Zerar (0)
                </button>
              </div>

              <textarea
                value={starComment}
                onChange={(e) => setStarComment(e.target.value)}
                placeholder="Escreva sua avaliação (opcional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows="3"
              />

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSubmitStarReview}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Salvar Avaliação por Estrelas
                </button>
              </div>
            </div>
          </div>

          {/* Avaliação Positiva/Negativa */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Avaliar Atendimento</span>
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleEvaluate('positive')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    evaluation === 'positive'
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-green-50'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Avaliar Positivamente</span>
                </button>
                
                <button
                  onClick={() => handleEvaluate('negative')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    evaluation === 'negative'
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-red-50'
                  }`}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>Avaliar Negativamente</span>
                </button>
              </div>

              {evaluation && (
                <div className="space-y-3">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Adicione um comentário sobre a avaliação (opcional)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows="3"
                  />
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSubmitEvaluation}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Enviar Avaliação
                    </button>
                    
                    <button
                      onClick={() => {
                        setEvaluation(null)
                        setComment('')
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketDetails 