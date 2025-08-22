
import React from 'react'
import { Check, X } from 'lucide-react'

const ColumnSelector = ({ 
  columns, 
  selectedColumns, 
  onSelectionChange, 
  numericColumns, 
  categoricalColumns 
}) => {
  const handleColumnToggle = (column) => {
    if (selectedColumns.includes(column)) {
      onSelectionChange(selectedColumns.filter(col => col !== column))
    } else {
      onSelectionChange([...selectedColumns, column])
    }
  }

  const isNumeric = (column) => numericColumns.includes(column)
  const isCategorical = (column) => categoricalColumns.includes(column)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecionar Colunas ({selectedColumns.length}/{columns.length})
        </label>
        
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {columns.map((column) => {
            const isSelected = selectedColumns.includes(column)
            const type = isNumeric(column) ? 'numérico' : isCategorical(column) ? 'categórico' : 'texto'
            
            return (
              <button
                key={column}
                onClick={() => handleColumnToggle(column)}
                className={`flex items-center justify-between p-2 rounded-lg border text-left transition-colors ${
                  isSelected
                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{column}</div>
                  <div className="text-xs text-gray-500">{type}</div>
                </div>
                <div className="ml-2">
                  {isSelected ? (
                    <Check className="h-4 w-4 text-primary-600" />
                  ) : (
                    <div className="h-4 w-4 border-2 border-gray-300 rounded" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selectedColumns.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Colunas Selecionadas
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedColumns.map((column) => (
              <span
                key={column}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                {column}
                <button
                  onClick={() => handleColumnToggle(column)}
                  className="hover:bg-primary-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p>• <strong>Numérico:</strong> Colunas com valores numéricos</p>
        <p>• <strong>Categórico:</strong> Colunas com texto/valores únicos</p>
        <p>• <strong>Texto:</strong> Outros tipos de dados</p>
      </div>
    </div>
  )
}

export default ColumnSelector 