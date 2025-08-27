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
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white">
      {/* Top Nav */}
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          <div className="w-3 h-3 rounded-sm bg-cyan-400"></div>
          <span>LOGOTYPE</span>
        </div>
        <ul className="hidden md:flex items-center gap-8 text-sm text-blue-100">
          <li className="hover:text-white cursor-pointer">HOME</li>
          <li className="hover:text-white cursor-pointer">ABOUT US</li>
          <li className="hover:text-white cursor-pointer">SERVICES</li>
          <li className="hover:text-white cursor-pointer">INFO</li>
          <li className="hover:text-white cursor-pointer">CONTACT US</li>
        </ul>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left Illustration Blocks (simulação) */}
        <div className="relative hidden md:block">
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-blue-700/40 rounded-lg blur-xl"></div>
          <div className="absolute right-10 top-10 w-20 h-20 bg-cyan-500/30 rounded-lg blur-lg"></div>
          <div className="space-y-6">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 shadow-2xl">
              <div className="h-40 bg-gradient-to-br from-blue-600/30 to-cyan-500/30 rounded-lg"></div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <div className="h-24 bg-gradient-to-br from-blue-600/30 to-indigo-500/30 rounded-lg"></div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <div className="h-24 bg-gradient-to-br from-cyan-600/30 to-blue-500/30 rounded-lg"></div>
              </div>
            </div>
            <div className="mx-auto w-28 flex items-center justify-between">
              {[0,1,2,3].map((i) => (
                <span key={i} className={`block w-2 h-2 rounded-full ${i===0 ? 'bg-white' : 'bg-white/40'}`}></span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div>
          <p className="tracking-widest text-cyan-400 font-semibold">TECHNOLOGY</p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            LANDING PAGE
          </h1>
          <div className="h-0.5 w-36 bg-white/60 my-4"></div>
          <h2 className="text-cyan-300 font-bold">LOREM IPSUM</h2>
          <p className="mt-4 text-blue-100 max-w-xl">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ultricies velit vel ex dictum. Suspendisse tincidunt, elit eget tempor suscipit.
          </p>

          {/* CTA / Upload */}
          <div className="mt-6 flex flex-wrap gap-4 items-center">
            <button
              onClick={() => document.getElementById('csv-input-trigger')?.click()}
              className="px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold transition-colors"
            >
              LEARN MORE
            </button>
            <span className="text-sm text-blue-200">ou arraste seu CSV do GLPI</span>
          </div>
        </div>
      </section>

      {/* Dropzone sobreposta para upload */}
      <div
        className={`container mx-auto px-6 pb-12`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${dragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/20 hover:border-cyan-400'}`}>
          <input
            id="csv-input-trigger"
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              <p className="text-blue-100 mt-2">Processando arquivo GLPI...</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-400" />
              <p className="text-green-300 font-medium">Arquivo GLPI carregado com sucesso!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center text-sm text-blue-200">
                <FileText className="h-4 w-4 mr-2" />
                Apenas arquivos .csv do GLPI são aceitos
              </div>
              <p className="text-xs text-blue-300">Dica: você pode arrastar e soltar aqui</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-300 mr-2" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CSVUploader 