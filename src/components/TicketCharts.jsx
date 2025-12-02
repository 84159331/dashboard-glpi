import React, { useMemo, useState } from 'react'
import {
	BarChart, Bar, Line, PieChart, Pie, Cell,
	XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart
} from 'recharts'
import { Calendar, TrendingUp, TrendingDown, Filter, Download, BarChart3, Sparkles } from 'lucide-react'

const TicketCharts = ({ data, chartType }) => {
	const [timeRange, setTimeRange] = useState(12) // 3, 6, 12, ou 'all'
	const [showMetrics, setShowMetrics] = useState(true)

	const statusData = useMemo(() => {
		if (!data || data.length === 0) return []
		return prepareStatusData(data)
	}, [data])

	const timelineData = useMemo(() => {
		if (!data || data.length === 0) return []
		return prepareMonthlyOpenClosedData(data, timeRange)
	}, [data, timeRange])

	const priorityData = useMemo(() => {
		if (!data || data.length === 0) return []
		return preparePriorityData(data)
	}, [data])

	const technicianData = useMemo(() => {
		if (!data || data.length === 0) return []
		return prepareTechnicianData(data)
	}, [data])

	// Paleta de cores moderna e harmoniosa
	const colors = [
		'#3b82f6', // Azul primário
		'#10b981', // Verde sucesso
		'#f59e0b', // Amarelo/laranja
		'#8b5cf6', // Roxo
		'#ef4444', // Vermelho
		'#06b6d4', // Ciano
		'#ec4899', // Rosa
		'#6366f1', // Índigo
		'#84cc16', // Lima
		'#f97316'  // Laranja
	]
	
	// Cores para gráficos específicos
	const statusColors = {
		'Solucionado': '#10b981',
		'Fechado': '#6b7280',
		'Em andamento': '#3b82f6',
		'Novo': '#f59e0b',
		'Pendente': '#f97316',
		'Cancelado': '#ef4444'
	}
	
	const priorityColors = {
		'Alta': '#ef4444',
		'Média': '#f59e0b',
		'Baixa': '#10b981',
		'Crítica': '#dc2626'
	}

	// Tooltip personalizado melhorado
	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-xl">
					<p className="text-white font-semibold mb-3 text-base border-b border-gray-700 pb-2">{label}</p>
					<div className="space-y-2">
						{payload.map((entry, index) => (
							<div key={index} className="flex items-center justify-between gap-4">
								<div className="flex items-center gap-2">
									<div 
										className="w-3 h-3 rounded-full" 
										style={{ backgroundColor: entry.color }}
									></div>
									<span className="text-sm text-gray-300">{entry.name}:</span>
								</div>
								<span className="text-sm font-bold text-white">{entry.value}</span>
							</div>
						))}
					</div>
				</div>
			)
		}
		return null
	}

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Header Modernizado para Gráficos */}
			<div className="bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-indigo-500/30 shadow-glow">
				<div className="text-center">
					<div className="flex items-center justify-center gap-3 mb-4">
						<div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
							<BarChart3 className="h-8 w-8 text-white" />
						</div>
						<h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
							Visualizações e Gráficos
						</h3>
					</div>
					<p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
						Análise visual interativa dos dados de chamados com múltiplas perspectivas e métricas
					</p>
					{data && data.length > 0 && (
						<div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
							<div className="flex items-center gap-2">
								<Sparkles className="h-4 w-4 text-indigo-400" />
								<span>{data.length.toLocaleString('pt-BR')} chamados analisados</span>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Gráfico Principal - Timeline */}
			{(!chartType || chartType === 'timeline') && (
				<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700/50 shadow-soft hover:shadow-medium transition-all duration-300">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
						<div>
							<h3 className="text-white font-bold text-lg md:text-xl mb-2 flex items-center gap-2">
								<span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
								Evolução de Chamados por Mês
							</h3>
							<p className="text-gray-400 text-sm">Análise temporal dos chamados abertos, fechados e métricas de desempenho</p>
						</div>
						
						{/* Controles */}
						<div className="flex flex-wrap items-center gap-3">
							<div className="flex items-center gap-2">
								<Filter className="h-4 w-4 text-gray-400" />
								<select
									value={timeRange}
									onChange={(e) => setTimeRange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
									className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-700 transition-colors"
								>
									<option value={3}>Últimos 3 meses</option>
									<option value={6}>Últimos 6 meses</option>
									<option value={12}>Últimos 12 meses</option>
									<option value="all">Todos os períodos</option>
								</select>
							</div>
						</div>
					</div>

					{/* Métricas Resumidas */}
					{showMetrics && timelineData.length > 0 && (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
							{(() => {
								const totalAbertos = timelineData.reduce((sum, d) => sum + (d.abertos || 0), 0)
								const totalFechados = timelineData.reduce((sum, d) => sum + (d.fechados || 0), 0)
								const mediaAbertos = (totalAbertos / timelineData.length).toFixed(1)
								const mediaFechados = (totalFechados / timelineData.length).toFixed(1)
								const taxaResolucao = totalAbertos > 0 ? ((totalFechados / totalAbertos) * 100).toFixed(1) : 0
								const saldoLiquido = totalAbertos - totalFechados
								const ultimoMes = timelineData[timelineData.length - 1]
								const penultimoMes = timelineData.length > 1 ? timelineData[timelineData.length - 2] : null
								const variacaoAbertos = penultimoMes ? ultimoMes.abertos - penultimoMes.abertos : 0

								return (
									<>
										<div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
											<div className="text-xs text-blue-400 mb-1">Total Abertos</div>
											<div className="text-lg font-bold text-blue-300">{totalAbertos}</div>
											<div className="text-xs text-gray-500 mt-1">Média: {mediaAbertos}/mês</div>
										</div>
										<div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3">
											<div className="text-xs text-red-400 mb-1">Total Fechados</div>
											<div className="text-lg font-bold text-red-300">{totalFechados}</div>
											<div className="text-xs text-gray-500 mt-1">Média: {mediaFechados}/mês</div>
										</div>
										<div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3">
											<div className="text-xs text-green-400 mb-1">Taxa de Resolução</div>
											<div className="text-lg font-bold text-green-300">{taxaResolucao}%</div>
											<div className="text-xs text-gray-500 mt-1">
												Saldo: {saldoLiquido > 0 ? '+' : ''}{saldoLiquido}
											</div>
										</div>
										<div className={`${variacaoAbertos >= 0 ? 'bg-yellow-900/30 border-yellow-500/30' : 'bg-green-900/30 border-green-500/30'} rounded-lg p-3`}>
											<div className={`text-xs mb-1 ${variacaoAbertos >= 0 ? 'text-yellow-400' : 'text-green-400'}`}>
												Variação (último mês)
											</div>
											<div className={`text-lg font-bold flex items-center gap-1 ${variacaoAbertos >= 0 ? 'text-yellow-300' : 'text-green-300'}`}>
												{variacaoAbertos >= 0 ? (
													<><TrendingUp className="h-4 w-4" /> +{variacaoAbertos}</>
												) : (
													<><TrendingDown className="h-4 w-4" /> {variacaoAbertos}</>
												)}
											</div>
											<div className="text-xs text-gray-500 mt-1">
												{ultimoMes?.abertos || 0} abertos
											</div>
										</div>
									</>
								)
							})()}
						</div>
					)}

					{timelineData.length === 0 ? (
						<div className="flex items-center justify-center h-64 text-gray-500">Nenhum dado disponível</div>
					) : (
						<ResponsiveContainer width="100%" height={450}>
							<ComposedChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
								<CartesianGrid stroke="#374151" strokeDasharray="3 3" />
								<XAxis 
									dataKey="mes" 
									stroke="#9ca3af"
									tick={{ fill: '#9ca3af', fontSize: 12 }}
									angle={-45}
									textAnchor="end"
									height={80}
								/>
								<YAxis 
									yAxisId="left"
									stroke="#9ca3af"
									tick={{ fill: '#9ca3af', fontSize: 12 }}
									label={{ value: 'Quantidade', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
								/>
								<YAxis 
									yAxisId="right"
									orientation="right"
									stroke="#10b981"
									tick={{ fill: '#10b981', fontSize: 12 }}
									label={{ value: 'Taxa (%)', angle: 90, position: 'insideRight', style: { fill: '#10b981' } }}
								/>
								<Tooltip 
									content={({ active, payload, label }) => {
										if (active && payload && payload.length) {
											const data = payload[0].payload
											const taxaResolucao = data.abertos > 0 ? ((data.fechados / data.abertos) * 100).toFixed(1) : 0
											const saldo = (data.abertos || 0) - (data.fechados || 0)
											
											return (
												<div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-xl">
													<p className="text-white font-semibold mb-3 text-base border-b border-gray-700 pb-2">{label}</p>
													<div className="space-y-2">
														<div className="flex items-center justify-between gap-4">
															<div className="flex items-center gap-2">
																<div className="w-3 h-3 rounded-full bg-blue-500"></div>
																<span className="text-sm text-gray-300">Abertos:</span>
															</div>
															<span className="text-sm font-bold text-white">{data.abertos || 0}</span>
														</div>
														<div className="flex items-center justify-between gap-4">
															<div className="flex items-center gap-2">
																<div className="w-3 h-3 rounded-full bg-red-500"></div>
																<span className="text-sm text-gray-300">Fechados:</span>
															</div>
															<span className="text-sm font-bold text-white">{data.fechados || 0}</span>
														</div>
														<div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-700">
															<span className="text-sm text-gray-300">Taxa de Resolução:</span>
															<span className="text-sm font-bold text-green-400">{taxaResolucao}%</span>
														</div>
														<div className="flex items-center justify-between gap-4">
															<span className="text-sm text-gray-300">Saldo Líquido:</span>
															<span className={`text-sm font-bold ${saldo >= 0 ? 'text-yellow-400' : 'text-green-400'}`}>
																{saldo >= 0 ? '+' : ''}{saldo}
															</span>
														</div>
													</div>
												</div>
											)
										}
										return null
									}}
								/>
								<Legend wrapperStyle={{ color: '#e5e7eb' }} />
								<Bar 
									yAxisId="left"
									dataKey="abertos" 
									name="Abertos" 
									fill="#3b82f6" 
									radius={[4, 4, 0, 0]}
									opacity={0.8}
								/>
								<Bar 
									yAxisId="left"
									dataKey="fechados" 
									name="Fechados" 
									fill="#ef4444" 
									radius={[4, 4, 0, 0]}
									opacity={0.8}
								/>
								<Line 
									yAxisId="right"
									type="monotone" 
									dataKey="taxaResolucao" 
									name="Taxa Resolução (%)" 
									stroke="#10b981" 
									strokeWidth={3} 
									dot={{ r: 5, fill: '#10b981' }}
									strokeDasharray="5 5"
								/>
							</ComposedChart>
						</ResponsiveContainer>
					)}
				</div>
			)}

			{/* Grid de Gráficos Secundários */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
				{/* Status */}
				<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700/50 shadow-soft hover:shadow-medium transition-all duration-300">
					<h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
						<span className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></span>
						Distribuição por Status
					</h3>
					<p className="text-gray-400 text-sm mb-4">Proporção de chamados por status atual</p>
					{statusData.length === 0 ? (
						<div className="flex items-center justify-center h-64 text-gray-500">Nenhum dado disponível</div>
					) : (
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie
									data={statusData}
									cx="50%"
									cy="50%"
									innerRadius={40}
									outerRadius={80}
									paddingAngle={2}
									label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
									dataKey="value"
								>
									{statusData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
									))}
								</Pie>
								<Tooltip content={<CustomTooltip />} />
								<Legend wrapperStyle={{ color: '#e5e7eb' }} />
							</PieChart>
						</ResponsiveContainer>
					)}
				</div>

				{/* Prioridade */}
				<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700/50 shadow-soft hover:shadow-medium transition-all duration-300">
					<h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
						<span className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></span>
						Chamados por Prioridade
					</h3>
					<p className="text-gray-400 text-sm mb-4">Distribuição dos chamados por nível de prioridade</p>
					{priorityData.length === 0 ? (
						<div className="flex items-center justify-center h-64 text-gray-500">Nenhum dado disponível</div>
					) : (
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={priorityData} layout="horizontal">
								<CartesianGrid stroke="#374151" strokeDasharray="3 3" />
								<XAxis type="number" stroke="#9ca3af" />
								<YAxis dataKey="name" type="category" stroke="#9ca3af" width={80} />
								<Tooltip content={<CustomTooltip />} />
								<Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
							</BarChart>
						</ResponsiveContainer>
					)}
				</div>
			</div>

			{/* Performance por Técnico */}
			<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700/50 shadow-soft hover:shadow-medium transition-all duration-300">
				<h3 className="text-white font-bold text-lg md:text-xl mb-2 flex items-center gap-2">
					<span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
					Performance por Técnico
				</h3>
				<p className="text-gray-400 text-sm mb-4">Análise comparativa de resolução por técnico responsável</p>
				{technicianData.length === 0 ? (
					<div className="flex items-center justify-center h-64 text-gray-500">Nenhum dado disponível</div>
				) : (
					<ResponsiveContainer width="100%" height={400}>
						<AreaChart data={technicianData}>
							<CartesianGrid stroke="#374151" strokeDasharray="3 3" />
							<XAxis dataKey="name" stroke="#9ca3af" />
							<YAxis stroke="#9ca3af" />
							<Tooltip content={<CustomTooltip />} />
							<Legend wrapperStyle={{ color: '#e5e7eb' }} />
							<Area 
								type="monotone" 
								dataKey="resolvidos" 
								stackId="1"
								stroke="#10b981" 
								fill="#10b981" 
								fillOpacity={0.6}
								name="Resolvidos"
							/>
							<Area 
								type="monotone" 
								dataKey="pendentes" 
								stackId="1"
								stroke="#f59e0b" 
								fill="#f59e0b" 
								fillOpacity={0.6}
								name="Pendentes"
							/>
						</AreaChart>
					</ResponsiveContainer>
				)}
			</div>
		</div>
	)
}

const parsePtBrDate = (dateStr) => {
	if (!dateStr) return null
	const [day, month, year] = dateStr.split(' ')[0].split('/')
	const d = new Date(Number(year), Number(month) - 1, Number(day))
	return isNaN(d.getTime()) ? null : d
}

const formatMonthYear = (date) => {
	const mm = String(date.getMonth() + 1).padStart(2, '0')
	return `${mm}/${date.getFullYear()}`
}

const prepareMonthlyOpenClosedData = (data, timeRange = 12) => {
	const byMonth = {}
	for (const ticket of data) {
		const openDate = parsePtBrDate(ticket['Data de abertura'])
		if (openDate) {
			const key = formatMonthYear(openDate)
			byMonth[key] = byMonth[key] || { mes: key, abertos: 0, fechados: 0, dataCompleta: openDate }
			byMonth[key].abertos += 1
		}
		// Tentar múltiplos campos de data de fechamento
		const closeDate = parsePtBrDate(ticket['Data da solução']) || 
						  parsePtBrDate(ticket['Data de fechamento']) || 
						  parsePtBrDate(ticket['Data de fechamento prevista'])
		if (closeDate) {
			const key = formatMonthYear(closeDate)
			byMonth[key] = byMonth[key] || { mes: key, abertos: 0, fechados: 0, dataCompleta: closeDate }
			byMonth[key].fechados += 1
		}
	}

	let result = Object.values(byMonth)
		.sort((a, b) => {
			// Usar dataCompleta para ordenação mais precisa
			if (a.dataCompleta && b.dataCompleta) {
				return a.dataCompleta.getTime() - b.dataCompleta.getTime()
			}
			const [ma, ya] = a.mes.split('/')
			const [mb, yb] = b.mes.split('/')
			return new Date(Number(ya), Number(ma) - 1) - new Date(Number(yb), Number(mb) - 1)
		})
		.map(item => {
			// Calcular taxa de resolução e outras métricas
			const taxaResolucao = item.abertos > 0 
				? ((item.fechados / item.abertos) * 100) 
				: 0
			
			return {
				mes: item.mes,
				abertos: item.abertos,
				fechados: item.fechados,
				taxaResolucao: Math.round(taxaResolucao * 10) / 10, // Arredondar para 1 casa decimal
				saldoLiquido: item.abertos - item.fechados
			}
		})

	// Aplicar filtro de período
	if (timeRange !== 'all' && typeof timeRange === 'number') {
		result = result.slice(-timeRange)
	}

	return result
}

const prepareStatusData = (data) => {
	const statusCount = data.reduce((acc, ticket) => {
		const status = ticket.Status || 'Não definido'
		acc[status] = (acc[status] || 0) + 1
		return acc
	}, {})

	return Object.entries(statusCount).map(([name, value]) => ({
		name,
		value
	}))
}

const preparePriorityData = (data) => {
	const priorityCount = data.reduce((acc, ticket) => {
		const priority = ticket.Prioridade || 'Não definida'
		acc[priority] = (acc[priority] || 0) + 1
		return acc
	}, {})

	return Object.entries(priorityCount).map(([name, value]) => ({
		name,
		value
	}))
}

const prepareTechnicianData = (data) => {
	const technicianStats = data.reduce((acc, ticket) => {
		const technician = ticket['Técnico responsável'] || ticket['Atribuído - Técnico'] || 'Não atribuído'
		if (!acc[technician]) {
			acc[technician] = { name: technician, resolvidos: 0, pendentes: 0 }
		}
		
		if (ticket.Status === 'Solucionado' || ticket.Status === 'Fechado') {
			acc[technician].resolvidos += 1
		} else {
			acc[technician].pendentes += 1
		}
		
		return acc
	}, {})

	return Object.values(technicianStats)
		.sort((a, b) => (b.resolvidos + b.pendentes) - (a.resolvidos + a.pendentes))
		.slice(0, 10) // top 10 técnicos
}

export default TicketCharts 