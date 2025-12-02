// Hook para otimização de performance - Debounce e memoização

import { useState, useEffect, useCallback, useRef } from 'react'

export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const useThrottle = (value, limit = 300) => {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

export const useLazyLoading = (items, itemsPerPage = 10) => {
  const [visibleItems, setVisibleItems] = useState(itemsPerPage)

  const loadMore = useCallback(() => {
    setVisibleItems(prev => Math.min(prev + itemsPerPage, items.length))
  }, [items.length, itemsPerPage])

  const hasMore = visibleItems < items.length

  return {
    visibleItems: items.slice(0, visibleItems),
    loadMore,
    hasMore,
    total: items.length
  }
}

export default {
  useDebounce,
  useThrottle,
  useLazyLoading
}

