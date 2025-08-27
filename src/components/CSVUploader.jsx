import React, { useState } from 'react'
import Papa from 'papaparse'
import { Upload, FileText, AlertCircle, CheckCircle, Headphones, Download, Database, Zap } from 'lucide-react'

const CSVUploader = ({ onDataLoaded }) => {
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
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
      delimiter: ';',
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-glow">
            <Database className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-4xl font-bold text-gradient">Carregue seu arquivo GLPI</h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Arraste e solte seu arquivo CSV do GLPI aqui ou clique para selecionar
        </p>
      </div>

      {/* Área de Upload */}
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${dragActive 
            ? 'border-blue-500 bg-blue-500/10 shadow-glow scale-105' 
            : 'border-gray-600 hover:border-blue-400 hover:bg-white/5'
          }
          ${success ? 'border-green-500 bg-green-500/10' : ''}
        `}
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
        
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-600/20 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-2 border-transparent border-b-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-white">Processando arquivo GLPI...</p>
                <p className="text-gray-400">Isso pode levar alguns segundos</p>
              </div>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-glow">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-green-400">Arquivo GLPI carregado com sucesso!</p>
                <p className="text-gray-400">Redirecionando para o dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mx-auto shadow-soft">
                  <Headphones className="h-10 w-10 text-gray-300" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-glow">
                  <Upload className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-2xl font-bold text-white">Arraste seu arquivo GLPI aqui</p>
                <p className="text-gray-400 text-lg">ou clique para selecionar</p>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <FileText className="h-4 w-4" />
                <span>Apenas arquivos .csv do GLPI são aceitos</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="animate-bounce-in">
          <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h4 className="font-semibold text-red-300">Erro no Upload</h4>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Como exportar */}
        <div className="dashboard-card card-primary">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Como exportar do GLPI</h3>
          </div>
          
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">1</div>
              <span>Acesse o GLPI</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">2</div>
              <span>Vá em "Tickets" → "Lista de tickets"</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">3</div>
              <span>Aplique os filtros desejados</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">4</div>
              <span>Clique em "Exportar" → "CSV"</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">5</div>
              <span>Carregue o arquivo aqui</span>
            </div>
          </div>
        </div>

        {/* Campos esperados */}
        <div className="dashboard-card card-accent">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Campos esperados do GLPI</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-2 text-sm">
            {[
              'ID do ticket',
              'Título',
              'Status',
              'Prioridade',
              'Categoria',
              'Requerente',
              'Técnico responsável',
              'Data de abertura',
              'Tempo de resolução',
              'Solução implementada'
            ].map((field, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">{field}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CSVUploader 