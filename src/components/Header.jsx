import React from 'react'
import { BarChart3, Database, Headphones, Activity } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              <Headphones className="h-6 w-6 text-primary-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard de Chamados TI</h1>
              <p className="text-sm text-gray-600">Análise e gestão de tickets do GLPI</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Powered by React + Recharts
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 