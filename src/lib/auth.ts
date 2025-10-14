import { supabase } from './supabase'

// Tipos básicos para o sistema de autenticação
export type User = {
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

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>

// Funções de autenticação já estão no supabase.ts
// Este arquivo existe apenas para compatibilidade de tipos
export { authenticateUser, getCurrentUser, logoutUser } from './supabase'