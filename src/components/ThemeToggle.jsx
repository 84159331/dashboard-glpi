import React, { useState, useEffect } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

const ThemeToggle = () => {
  const [theme, setTheme] = useState('dark')
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard-theme') || 'dark'
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (newTheme) => {
    const root = document.documentElement
    const body = document.body
    
    if (newTheme === 'light') {
      root.classList.add('light')
      body.classList.add('light')
    } else {
      root.classList.remove('light')
      body.classList.remove('light')
    }
  }

  const toggleTheme = () => {
    setIsAnimating(true)
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    
    setTimeout(() => {
      setTheme(newTheme)
      applyTheme(newTheme)
      localStorage.setItem('dashboard-theme', newTheme)
      setIsAnimating(false)
    }, 150)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />
      case 'dark':
        return <Moon className="h-5 w-5" />
      default:
        return <Monitor className="h-5 w-5" />
    }
  }

  return (
    <button
      onClick={toggleTheme}
      disabled={isAnimating}
      className={`
        relative w-12 h-12 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 
        hover:from-gray-600 hover:to-gray-700 border border-gray-600 
        flex items-center justify-center text-gray-300 hover:text-white
        transition-all duration-300 transform hover:scale-110 active:scale-95
        shadow-soft hover:shadow-medium
        ${isAnimating ? 'animate-spin' : ''}
      `}
      title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
    >
      <div className={`transition-transform duration-300 ${isAnimating ? 'scale-0' : 'scale-100'}`}>
        {getThemeIcon()}
      </div>
      
      {/* Efeito de brilho */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </button>
  )
}

export default ThemeToggle
