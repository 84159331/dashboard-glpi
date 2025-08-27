import React, { useEffect, useState } from 'react'
import { ArrowLeft, BarChart3, Database, Headphones, Activity } from 'lucide-react'

const Header = ({ onHomeClick }) => {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-400" />
                <div className="text-left">
                  <button onClick={onHomeClick} className="text-lg font-bold text-white hover:underline">
                    JADNEY RANES
                  </button>
                  <p className="text-sm text-gray-300">DASHBOARD CHAMADOS GPLI</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ArrowLeft className="h-6 w-6 text-gray-400" />
              <button onClick={onHomeClick} className="text-2xl font-bold text-white hover:underline">
                SLA de Atendimento
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {now.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 