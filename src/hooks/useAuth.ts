'use client'

import { useState, useEffect, useCallback } from 'react'
import { authenticateUser, getCurrentUser, logoutUser } from '@/lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Verificar sessão existente apenas uma vez
  useEffect(() => {
    if (initialized) return

    const checkSession = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser.user)
        }
      } catch (err) {
        console.warn('Erro ao verificar sessão:', err)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    checkSession()
  }, [initialized])

  const login = useCallback(async (username: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const result = await authenticateUser(username, password)
      
      if (result && result.user) {
        setUser(result.user)
        return result
      }
      
      throw new Error('Falha na autenticação')
    } catch (err: any) {
      const errorMessage = err.message || 'Erro na autenticação'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setLoading(true)
      await logoutUser()
      setUser(null)
      setError(null)
    } catch (err) {
      console.warn('Erro no logout:', err)
      // Forçar logout local mesmo com erro
      setUser(null)
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const isAdmin = user?.tipo === 'admin'

  return {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
    isAdmin,
    isAuthenticated: !!user,
  }
}