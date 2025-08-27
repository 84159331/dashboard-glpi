import React, { useMemo } from 'react'
import {
	BarChart, Bar, Line, PieChart, Pie, Cell,
	XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart
} from 'recharts'

const TicketCharts = ({ data }) => {
	const statusData = useMemo(() => {
		if (!data || data.length === 0) return []
		return prepareStatusData(data)
	}, [data])

	const timelineData = useMemo(() => {
		if (!data || data.length === 0) return []
		return prepareMonthlyOpenClosedData(data)
	}, [data])

	const priorityData = useMemo(() => {
		if (!data || data.length === 0) return []
		return preparePriorityData(data)
	}, [data])

	const technicianData = useMemo(() => {
		if (!data || data.length === 0) return []
		return prepareTechnicianData(data)
	}, [data])

	const colors = [
		'#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
		'#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
	]

	// Tooltip personalizado
	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
					<p className="text-white font-medium mb-2">{label}</p>
					{payload.map((entry, index) => (
						<p key={index} className="text-sm" style={{ color: entry.color }}>
							{entry.name}: <span className="font-bold">{entry.value}</span>
						</p>
					))}
				</div>
			)
		}
		return null
	}

	return (
		<div className="space-y-6">
			{/* Gráfico Principal - Timeline */}
			<div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
				<h3 className="text-white font-semibold mb-4">Evolução de Chamados por Mês</h3>
				{timelineData.length === 0 ? (
					<div className="flex items-center justify-center h-64 text-gray-500">Nenhum dado disponível</div>
				) : (
					<ResponsiveContainer width="100%" height={400}>
						<ComposedChart data={timelineData}>
							<CartesianGrid stroke="#374151" strokeDasharray="3 3" />
							<XAxis dataKey="mes" stroke="#9ca3af" />
							<YAxis stroke="#9ca3af" />
							<Tooltip content={<CustomTooltip />} />
							<Legend wrapperStyle={{ color: '#e5e7eb' }} />
							<Bar dataKey="abertos" name="Abertos" fill="#3b82f6" radius={[4,4,0,0]} />
							<Line type="monotone" dataKey="fechados" name="Fechados" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
						</ComposedChart>
					</ResponsiveContainer>
				)}
			</div>

			{/* Grid de Gráficos Secundários */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Status */}
				<div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
					<h3 className="text-white font-semibold mb-4">Distribuição por Status</h3>
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
				<div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
					<h3 className="text-white font-semibold mb-4">Chamados por Prioridade</h3>
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
			<div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
				<h3 className="text-white font-semibold mb-4">Performance por Técnico</h3>
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

const prepareMonthlyOpenClosedData = (data) => {
	const byMonth = {}
	for (const ticket of data) {
		const openDate = parsePtBrDate(ticket['Data de abertura'])
		if (openDate) {
			const key = formatMonthYear(openDate)
			byMonth[key] = byMonth[key] || { mes: key, abertos: 0, fechados: 0 }
			byMonth[key].abertos += 1
		}
		const closeDate = parsePtBrDate(ticket['Data de fechamento']) || parsePtBrDate(ticket['Data de fechamento prevista'])
		if (closeDate) {
			const key = formatMonthYear(closeDate)
			byMonth[key] = byMonth[key] || { mes: key, abertos: 0, fechados: 0 }
			byMonth[key].fechados += 1
		}
	}

	const result = Object.values(byMonth)
		.sort((a, b) => {
			const [ma, ya] = a.mes.split('/')
			const [mb, yb] = b.mes.split('/')
			return new Date(Number(ya), Number(ma) - 1) - new Date(Number(yb), Number(mb) - 1)
		})

	return result.slice(-12) // últimos 12 meses
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