import React from 'react'
import { Download, FileText, Calendar, User } from 'lucide-react'

const PerformanceReport = ({ technicianName, technicianStats, teamStats, gamification, recommendations, percentileRank }) => {
  const generateReport = () => {
    const reportDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const reportContent = `
═══════════════════════════════════════════════════════════════
        RELATÓRIO DE DESEMPENHO INDIVIDUAL
═══════════════════════════════════════════════════════════════

Técnico: ${technicianName}
Data do Relatório: ${reportDate}

═══════════════════════════════════════════════════════════════
                    RESUMO EXECUTIVO
═══════════════════════════════════════════════════════════════

KPIs PRINCIPAIS:
----------------
• SLA Compliance: ${technicianStats.slaCompliance.toFixed(1)}%
${teamStats ? `• Comparação com Equipe: ${technicianStats.slaCompliance >= teamStats.slaCompliance ? '+' : ''}${(technicianStats.slaCompliance - teamStats.slaCompliance).toFixed(1)}%` : ''}
${percentileRank !== null ? `• Posicionamento: Top ${100 - percentileRank}% da equipe` : ''}

• Tempo Médio de Resolução: ${Math.round(technicianStats.avgResolutionTime)} minutos
${teamStats ? `• Comparação com Equipe: ${technicianStats.avgResolutionTime <= teamStats.avgResolutionTime ? '-' : '+'}${Math.abs(Math.round(technicianStats.avgResolutionTime - teamStats.avgResolutionTime))} minutos` : ''}

• Chamados Resolvidos: ${technicianStats.resolved} de ${technicianStats.total}
• SLA Excedido: ${technicianStats.slaExceeded} (${technicianStats.total > 0 ? ((technicianStats.slaExceeded / technicianStats.total) * 100).toFixed(1) : 0}%)

${gamification ? `
═══════════════════════════════════════════════════════════════
                    PROGRESSO E CONQUISTAS
═══════════════════════════════════════════════════════════════

• Nível Atual: ${gamification.currentLevel.level} - ${gamification.currentLevel.name}
• Total de XP: ${gamification.totalXP.toLocaleString('pt-BR')}
${gamification.xpEarned > 0 ? `• XP Ganho Hoje: +${gamification.xpEarned}` : ''}

• Badges Conquistadas: ${gamification.badges.length}
${gamification.badges.length > 0 ? gamification.badges.map(b => `  - ${b.name}: ${b.description}`).join('\n') : '  Nenhum badge conquistado ainda'}
` : ''}

${recommendations && recommendations.length > 0 ? `
═══════════════════════════════════════════════════════════════
                    RECOMENDAÇÕES
═══════════════════════════════════════════════════════════════

${recommendations.slice(0, 5).map((rec, idx) => `
${idx + 1}. ${rec.title} [Prioridade: ${rec.priority}]
   ${rec.message}
`).join('\n')}
` : ''}

═══════════════════════════════════════════════════════════════
        Relatório gerado automaticamente pelo Dashboard
═══════════════════════════════════════════════════════════════
    `

    // Criar arquivo e fazer download
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_desempenho_${technicianName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateHTMLReport = () => {
    const reportDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Desempenho - ${technicianName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 20px;
      text-align: center;
    }
    .section {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .kpi {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 15px;
    }
    .kpi-item {
      padding: 15px;
      background: #f8f9fa;
      border-radius: 5px;
      border-left: 4px solid #667eea;
    }
    .kpi-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    .kpi-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    h2 {
      color: #333;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .badge {
      display: inline-block;
      padding: 5px 10px;
      margin: 5px;
      background: #e9ecef;
      border-radius: 5px;
      font-size: 12px;
    }
    .recommendation {
      padding: 10px;
      margin: 10px 0;
      border-left: 4px solid #ffc107;
      background: #fff3cd;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Relatório de Desempenho Individual</h1>
    <p><strong>${technicianName}</strong></p>
    <p>Gerado em: ${reportDate}</p>
  </div>

  <div class="section">
    <h2>Resumo Executivo</h2>
    <div class="kpi">
      <div class="kpi-item">
        <div class="kpi-label">SLA Compliance</div>
        <div class="kpi-value">${technicianStats.slaCompliance.toFixed(1)}%</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-label">Tempo Médio Resolução</div>
        <div class="kpi-value">${Math.round(technicianStats.avgResolutionTime)} min</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-label">Chamados Resolvidos</div>
        <div class="kpi-value">${technicianStats.resolved}/${technicianStats.total}</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-label">SLA Excedido</div>
        <div class="kpi-value">${technicianStats.slaExceeded}</div>
      </div>
    </div>
    ${percentileRank !== null ? `<p><strong>Posicionamento:</strong> Top ${100 - percentileRank}% da equipe</p>` : ''}
  </div>

  ${gamification ? `
  <div class="section">
    <h2>Progresso e Conquistas</h2>
    <p><strong>Nível:</strong> ${gamification.currentLevel.level} - ${gamification.currentLevel.name}</p>
    <p><strong>Total de XP:</strong> ${gamification.totalXP.toLocaleString('pt-BR')}</p>
    <p><strong>Badges Conquistadas:</strong> ${gamification.badges.length}</p>
    ${gamification.badges.map(b => `<span class="badge">${b.icon} ${b.name}</span>`).join('')}
  </div>
  ` : ''}

  ${recommendations && recommendations.length > 0 ? `
  <div class="section">
    <h2>Recomendações</h2>
    ${recommendations.slice(0, 5).map(rec => `
      <div class="recommendation">
        <strong>${rec.title}</strong> [${rec.priority}]
        <p>${rec.message}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}
</body>
</html>
    `

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_desempenho_${technicianName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-md">
      <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FileText className="h-6 w-6 text-blue-400" />
        Relatório Personalizado
      </h4>
      <p className="text-gray-300 text-sm mb-6">
        Gere um relatório completo do seu desempenho em formato texto ou HTML para impressão ou compartilhamento.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={generateReport}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 font-semibold"
        >
          <Download className="h-5 w-5" />
          Baixar Relatório TXT
        </button>
        <button
          onClick={generateHTMLReport}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 font-semibold"
        >
          <FileText className="h-5 w-5" />
          Baixar Relatório HTML
        </button>
      </div>
    </div>
  )
}

export default PerformanceReport

