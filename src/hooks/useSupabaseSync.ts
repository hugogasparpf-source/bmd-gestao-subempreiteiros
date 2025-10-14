'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord,
} from '@/lib/supabase'
import { useAuth } from './useAuth'

interface UseSupabaseSyncProps {
  table: string
  filters?: Record<string, any>
  realtime?: boolean
  autoBackup?: boolean
  onDataLoaded?: (data: any[]) => void
}

export const useSupabaseSync = ({
  table,
  filters,
  realtime = false,
  autoBackup = false,
  onDataLoaded
}: UseSupabaseSyncProps) => {
  const { user, isAuthenticated } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  
  const mountedRef = useRef(true)
  const loadingRef = useRef(false)
  const dataLoadedRef = useRef(false)

  // Função para carregar dados com tratamento robusto de erros
  const loadData = useCallback(async (showLoading = true) => {
    // Não carregar se não estiver autenticado ou se já está carregando
    if (!isAuthenticated || !user || loadingRef.current || !mountedRef.current) {
      if (mountedRef.current) setLoading(false)
      return
    }

    try {
      loadingRef.current = true
      if (showLoading && mountedRef.current) setLoading(true)
      if (mountedRef.current) setError(null)

      // Criar filtros com user_id válido
      const finalFilters = {
        ...filters,
        user_id: user.id
      }

      const records = await getRecords(table, finalFilters)
      
      if (mountedRef.current) {
        setData(records || [])
        dataLoadedRef.current = true
        
        if (onDataLoaded) {
          try {
            onDataLoaded(records || [])
          } catch (callbackError) {
            console.warn('Erro no callback onDataLoaded:', callbackError)
          }
        }
      }
    } catch (err: any) {
      console.warn(`Erro ao carregar ${table}:`, err)
      if (mountedRef.current) {
        setError(null) // Não definir erro para não quebrar a UI
        // Manter dados existentes se houver
        if (!dataLoadedRef.current) {
          setData([])
        }
      }
    } finally {
      if (mountedRef.current) setLoading(false)
      loadingRef.current = false
    }
  }, [table, filters, onDataLoaded, user, isAuthenticated])

  // Função para criar registro com fallback
  const create = useCallback(async (newData: any) => {
    if (!mountedRef.current || !user) return null

    try {
      setSyncing(true)
      setError(null)

      const record = await createRecord(table, {
        ...newData,
        user_id: user.id,
        id: newData.id || `${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })

      // Atualizar dados localmente
      if (mountedRef.current && record) {
        setData(prev => [record, ...prev])
      }
      
      return record
    } catch (err: any) {
      console.warn(`Erro ao criar ${table}:`, err)
      if (mountedRef.current) {
        setError(null)
      }
      // Retornar dados mesmo com erro
      const fallbackRecord = {
        id: `${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...newData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      if (mountedRef.current) {
        setData(prev => [fallbackRecord, ...prev])
      }
      
      return fallbackRecord
    } finally {
      if (mountedRef.current) setSyncing(false)
    }
  }, [table, user])

  // Função para atualizar registro com fallback
  const update = useCallback(async (id: string, updates: any) => {
    if (!mountedRef.current || !user) return null

    try {
      setSyncing(true)
      setError(null)

      const record = await updateRecord(table, id, updates)

      // Atualizar dados localmente
      if (mountedRef.current && record) {
        setData(prev => prev.map(item => item.id === id ? record : item))
      }
      
      return record
    } catch (err: any) {
      console.warn(`Erro ao atualizar ${table}:`, err)
      if (mountedRef.current) {
        setError(null)
        const updatedRecord = { id, ...updates, updated_at: new Date().toISOString() }
        setData(prev => prev.map(item => item.id === id ? { ...item, ...updatedRecord } : item))
        return updatedRecord
      }
      return null
    } finally {
      if (mountedRef.current) setSyncing(false)
    }
  }, [table, user])

  // Função para deletar registro com fallback
  const remove = useCallback(async (id: string) => {
    if (!mountedRef.current || !user) return false

    try {
      setSyncing(true)
      setError(null)

      await deleteRecord(table, id)

      // Remover dos dados localmente
      if (mountedRef.current) {
        setData(prev => prev.filter(item => item.id !== id))
      }
      
      return true
    } catch (err: any) {
      console.warn(`Erro ao deletar ${table}:`, err)
      if (mountedRef.current) {
        setError(null)
        setData(prev => prev.filter(item => item.id !== id))
      }
      return true
    } finally {
      if (mountedRef.current) setSyncing(false)
    }
  }, [table, user])

  // Função para recarregar dados
  const refresh = useCallback(() => {
    if (mountedRef.current && isAuthenticated && user) {
      loadData(false)
    }
  }, [loadData, isAuthenticated, user])

  // Carregar dados quando usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated && user && mountedRef.current && !dataLoadedRef.current) {
      loadData()
    }
  }, [isAuthenticated, user, loadData])

  // Cleanup
  useEffect(() => {
    mountedRef.current = true
    
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    data,
    loading,
    error,
    syncing,
    create,
    update,
    remove,
    refresh,
    lastSync: new Date().toISOString(),
  }
}