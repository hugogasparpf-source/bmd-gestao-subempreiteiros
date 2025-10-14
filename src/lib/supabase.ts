import { createClient } from '@supabase/supabase-js'

// Configuração segura para build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDk3NzEyMDAsImV4cCI6MTk2NTM0NzIwMH0.placeholder'

// Verificar se estamos em ambiente de build
const isBuildTime = typeof window === 'undefined'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: !isBuildTime,
    autoRefreshToken: !isBuildTime,
    detectSessionInUrl: !isBuildTime,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})

// Tipos para as tabelas do banco
export interface Usuario {
  id: string
  nome: string
  email: string
  username: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  tipo: 'gestor' | 'admin' | 'subempreiteiro'
  data_registo: string
  created_at: string
  updated_at: string
}

// Usuário padrão para fallback
const DEFAULT_USER: Usuario = {
  id: 'bmd-2025-user-id',
  nome: 'BMD Administrator',
  email: 'admin@bmdproject.com',
  username: 'BMD2025',
  status: 'aprovado',
  tipo: 'admin',
  data_registo: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Dados de exemplo para modo offline
const generateSampleData = (table: string, userId: string) => {
  const baseData = {
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  switch (table) {
    case 'obras':
      return [
        {
          id: 'obra-1',
          nome: 'Construção Residencial - Vila Nova',
          descricao: 'Construção de moradia unifamiliar com 3 quartos',
          responsavel: 'João Silva',
          data_inicio: '2024-01-15',
          data_fim_prevista: '2024-06-30',
          notas: 'Projeto em fase inicial',
          ...baseData,
        },
        {
          id: 'obra-2',
          nome: 'Renovação Comercial - Centro',
          descricao: 'Renovação completa de espaço comercial',
          responsavel: 'Maria Santos',
          data_inicio: '2024-02-01',
          data_fim_prevista: '2024-04-15',
          notas: 'Urgente - cliente prioritário',
          ...baseData,
        }
      ]

    case 'subempreiteiros':
      return [
        {
          id: 'sub-1',
          nome: 'António Pereira',
          telefone: '+351 912 345 678',
          email: 'antonio@exemplo.com',
          especialidade: 'Carpintaria',
          status: 'Ativo',
          ...baseData,
        },
        {
          id: 'sub-2',
          nome: 'Carlos Mendes',
          telefone: '+351 913 456 789',
          email: 'carlos@exemplo.com',
          especialidade: 'Eletricidade',
          status: 'Ativo',
          ...baseData,
        }
      ]

    case 'tarefas':
      return [
        {
          id: 'tarefa-1',
          titulo: 'Instalação de sistema elétrico',
          descricao: 'Instalação completa do sistema elétrico',
          prioridade: 'alta',
          status: 'em_andamento',
          data_vencimento: '2024-03-15',
          ...baseData,
        },
        {
          id: 'tarefa-2',
          titulo: 'Carpintaria - Portas e janelas',
          descricao: 'Instalação de portas e janelas',
          prioridade: 'media',
          status: 'pendente',
          data_vencimento: '2024-03-20',
          ...baseData,
        }
      ]

    case 'notificacoes':
      return [
        {
          id: 'notif-1',
          tipo: 'prazo',
          titulo: 'Prazo próximo',
          mensagem: 'A tarefa "Instalação de sistema elétrico" tem prazo até 15/03',
          lida: false,
          ...baseData,
        },
        {
          id: 'notif-2',
          tipo: 'nova_tarefa',
          titulo: 'Nova tarefa atribuída',
          mensagem: 'Nova tarefa de carpintaria foi atribuída',
          lida: true,
          ...baseData,
        }
      ]

    default:
      return []
  }
}

// Funções de autenticação customizada
export const authenticateUser = async (username: string, password: string) => {
  try {
    // Verificar credenciais do usuário BMD2025
    if (username === 'BMD2025' && password === 'construcao2025') {
      let user = DEFAULT_USER

      // Criar sessão persistente
      const sessionData = {
        user_id: user.id,
        username: user.username,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        authenticated: true,
        login_time: new Date().toISOString(),
      }

      // Salvar no localStorage para persistência (apenas no cliente)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bmd_session', JSON.stringify(sessionData))
          localStorage.setItem('bmd_user', JSON.stringify(user))
        } catch (storageError) {
          console.warn('Erro ao salvar no localStorage:', storageError)
        }
      }

      return { user, session: sessionData }
    }

    throw new Error('Credenciais inválidas')
  } catch (error) {
    console.error('Erro na autenticação:', error)
    throw error
  }
}

export const getCurrentUser = async () => {
  try {
    // Verificar localStorage primeiro (apenas no cliente)
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('bmd_session')
      const userData = localStorage.getItem('bmd_user')
      
      if (sessionData && userData) {
        try {
          const session = JSON.parse(sessionData)
          const user = JSON.parse(userData)
          return { user, session }
        } catch (parseError) {
          console.warn('Erro ao verificar sessão:', parseError)
          // Se houver erro, limpar localStorage
          localStorage.removeItem('bmd_session')
          localStorage.removeItem('bmd_user')
        }
      }
    }

    return null
  } catch (error) {
    console.warn('Erro ao obter usuário atual:', error)
    return null
  }
}

export const logoutUser = async () => {
  try {
    // Limpar localStorage (apenas no cliente)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('bmd_session')
        localStorage.removeItem('bmd_user')
      } catch (storageError) {
        console.warn('Erro ao limpar localStorage:', storageError)
      }
    }

    return true
  } catch (error) {
    console.warn('Erro no logout:', error)
    return true // Retornar true mesmo com erro para garantir logout local
  }
}

// Funções CRUD simplificadas
export const createRecord = async (table: string, data: any) => {
  // Sempre usar localStorage como fallback
  const record = {
    id: data.id || `${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  // Salvar no localStorage (apenas no cliente)
  if (typeof window !== 'undefined') {
    try {
      const key = `bmd_${table}`
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      existing.unshift(record) // Adicionar no início
      localStorage.setItem(key, JSON.stringify(existing))
    } catch (error) {
      console.warn('Erro ao salvar no localStorage:', error)
    }
  }
  
  return record
}

export const updateRecord = async (table: string, id: string, data: any) => {
  const updates = { 
    ...data, 
    updated_at: new Date().toISOString() 
  }

  // Atualizar no localStorage (apenas no cliente)
  if (typeof window !== 'undefined') {
    try {
      const key = `bmd_${table}`
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      const index = existing.findIndex((item: any) => item.id === id)
      if (index !== -1) {
        existing[index] = { ...existing[index], ...updates }
        localStorage.setItem(key, JSON.stringify(existing))
      }
    } catch (error) {
      console.warn('Erro ao atualizar no localStorage:', error)
    }
  }

  return { id, ...updates }
}

export const deleteRecord = async (table: string, id: string) => {
  // Remover do localStorage (apenas no cliente)
  if (typeof window !== 'undefined') {
    try {
      const key = `bmd_${table}`
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      const filtered = existing.filter((item: any) => item.id !== id)
      localStorage.setItem(key, JSON.stringify(filtered))
    } catch (error) {
      console.warn('Erro ao remover do localStorage:', error)
    }
  }

  return true
}

export const getRecords = async (table: string, filters?: any) => {
  let localData: any[] = []

  // Buscar do localStorage primeiro (apenas no cliente)
  if (typeof window !== 'undefined') {
    try {
      const key = `bmd_${table}`
      const stored = localStorage.getItem(key)
      
      if (stored) {
        localData = JSON.parse(stored)
      } else {
        // Se não há dados locais, gerar dados de exemplo
        const currentUser = await getCurrentUser()
        if (currentUser) {
          localData = generateSampleData(table, currentUser.user.id)
          localStorage.setItem(key, JSON.stringify(localData))
        }
      }
    } catch (error) {
      console.warn('Erro ao buscar do localStorage:', error)
      // Gerar dados de exemplo em caso de erro
      const currentUser = await getCurrentUser()
      if (currentUser) {
        localData = generateSampleData(table, currentUser.user.id)
      }
    }
  }

  // Aplicar filtros se necessário
  if (filters && localData.length > 0) {
    localData = localData.filter((item: any) => {
      return Object.entries(filters).every(([key, value]) => item[key] === value)
    })
  }

  // Ordenar por data de criação (mais recentes primeiro)
  localData.sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return localData
}