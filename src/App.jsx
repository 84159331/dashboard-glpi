import React, { useState } from 'react'
import CSVUploader from './components/CSVUploader'
import Dashboard from './components/Dashboard'
import Header from './components/Header'

function App() {
  const [data, setData] = useState(null)
  const [columns, setColumns] = useState([])

  const handleDataLoaded = (parsedData, columnNames) => {
    setData(parsedData)
    setColumns(columnNames)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header onHomeClick={() => setData(null)} />
      <main className="container mx-auto px-4 py-8">
        {!data ? (
          <CSVUploader onDataLoaded={handleDataLoaded} />
        ) : (
          <Dashboard data={data} columns={columns} onReset={() => setData(null)} />
        )}
      </main>
    </div>
  )
}

export default App 