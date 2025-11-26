import React from 'react'
import { Home, ChevronRight } from 'lucide-react'

const Breadcrumbs = ({ items = [] }) => {
  if (items.length === 0) return null

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
      <button
        className="flex items-center text-gray-400 hover:text-white transition-colors"
        aria-label="Início"
      >
        <Home className="h-4 w-4" />
      </button>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-gray-500" />
          {index === items.length - 1 ? (
            <span className="text-white font-medium">{item.label}</span>
          ) : (
            <button
              onClick={item.onClick}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export default Breadcrumbs

