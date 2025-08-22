import React, { useState } from 'react'
import Papa from 'papaparse'
import { Upload, FileText, AlertCircle, CheckCircle, Headphones } from 'lucide-react'

const CSVUploader = ({ onDataLoaded }) => {
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Por favor, selecione um arquivo CSV válido.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';', // GLPI usa ponto e vírgula como separador
      complete: (results) => {
        setLoading(false)
        if (results.errors.length > 0) {
          setError('Erro ao processar o arquivo CSV. Verifique o formato.')
          return
        }
        
        if (results.data.length === 0) {
          setError('O arquivo CSV está vazio.')
          return
        }

        // Verificar se é um arquivo GLPI válido
        const firstRow = results.data[0]
        const expectedFields = ['ID', 'Título', 'Status', 'Prioridade']
        const hasRequiredFields = expectedFields.some(field => 
          Object.keys(firstRow).some(key => key.includes(field))
        )

        if (!hasRequiredFields) {
          setError('O arquivo não parece ser um export válido do GLPI. Verifique se contém os campos necessários.')
          return
        }

        setSuccess(true)
        const columns = Object.keys(results.data[0])
        onDataLoaded(results.data, columns)
      },
      error: (error) => {
        setLoading(false)
        setError('Erro ao ler o arquivo: ' + error.message)
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Carregue seu arquivo GLPI
        </h2>
        <p className="text-lg text-gray-600">
          Arraste e solte seu arquivo CSV do GLPI aqui ou clique para selecionar
        </p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="text-gray-600 mt-2">Processando arquivo GLPI...</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-green-600 font-medium">Arquivo GLPI carregado com sucesso!</p>
            </div>
          ) : (
            <>
              <Headphones className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Arraste seu arquivo GLPI aqui
                </p>
                <p className="text-gray-500">ou clique para selecionar</p>
              </div>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <FileText className="h-4 w-4 mr-1" />
                Apenas arquivos .csv do GLPI são aceitos
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Como exportar do GLPI
        </h3>
        <div className="bg-gray-100 p-4 rounded-lg text-sm text-left max-w-md mx-auto">
          <div className="space-y-2">
            <p><strong>1.</strong> Acesse o GLPI</p>
            <p><strong>2.</strong> Vá em "Tickets" → "Lista de tickets"</p>
            <p><strong>3.</strong> Aplique os filtros desejados</p>
            <p><strong>4.</strong> Clique em "Exportar" → "CSV"</p>
            <p><strong>5.</strong> Carregue o arquivo aqui</p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Campos esperados do GLPI
        </h3>
        <div className="bg-blue-50 p-4 rounded-lg text-sm text-left max-w-md mx-auto">
          <div className="space-y-1">
            <p>• ID do ticket</p>
            <p>• Título</p>
            <p>• Status</p>
            <p>• Prioridade</p>
            <p>• Categoria</p>
            <p>• Requerente</p>
            <p>• Técnico responsável</p>
            <p>• Data de abertura</p>
            <p>• Tempo de resolução</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CSVUploader 