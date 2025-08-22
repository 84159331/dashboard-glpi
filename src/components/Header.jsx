import React from 'react'
import { ArrowLeft, BarChart3, Database, Headphones, Activity } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-400" />
                <div className="text-left">
                  <h2 className="text-lg font-bold text-white">LEONARDO KARPINSKI</h2>
                  <p className="text-sm text-gray-300">APOIO POWER BI</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ArrowLeft className="h-6 w-6 text-gray-400" />
              <h1 className="text-2xl font-bold text-white">SLA de Atendimento</h1>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Powered by React + Recharts
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 