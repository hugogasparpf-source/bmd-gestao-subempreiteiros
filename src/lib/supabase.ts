import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface DatabaseSubempreiteiro {
  id: string
  user_id: string
  nome: string
  contacto: string
  email: string
  avaliacao: number
  preco_hora: number
  obras_atribuidas: number
  proximas_datas_livres: string[]
  especialidade: string
  bloqueado: boolean
  created_at: string
  updated_at: string
}

export interface DatabaseObra {
  id: string
  user_id: string
  nome: string
  descricao: string
  responsavel: string
  data_inicio: string
  data_fim_prevista: string
  notas?: string
  created_at: string
  updated_at: string
}

export interface DatabaseTarefa {
  id: string
  user_id: string
  descricao: string
  obra: string
  responsavel_obra: string
  data_inicio: string
  data_fim: string
  status: 'pendente' | 'em_andamento' | 'concluida'
  subempreiteiro: string
  checklist: any[]
  percentagem_conclusao: number
  created_at: string
  updated_at: string
}

export interface DatabaseUsuario {
  id: string
  nome: string
  email: string
  username: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  tipo: 'admin' | 'gestor' | 'responsavel'
  data_registo: string
  created_at: string
  updated_at: string
}

export interface DatabaseNotificacao {
  id: string
  user_id: string
  tipo: 'documentacao' | 'seguranca' | 'material'
  titulo: string
  descricao: string
  data_alerta: string
  tarefa: string
  responsavel: string
  lida: boolean
  created_at: string
  updated_at: string
}

// Funções de sincronização
export const syncSubempreiteiros = async (userId: string, subempreiteiros: any[]) => {
  try {
    // Primeiro, buscar dados existentes
    const { data: existing } = await supabase
      .from('subempreiteiros')
      .select('*')
      .eq('user_id', userId)

    // Sincronizar cada subempreiteiro
    for (const sub of subempreiteiros) {
      const existingRecord = existing?.find(e => e.id === sub.id)
      
      const dbRecord: Omit<DatabaseSubempreiteiro, 'created_at' | 'updated_at'> = {
        id: sub.id,
        user_id: userId,
        nome: sub.nome,
        contacto: sub.contacto,
        email: sub.email,
        avaliacao: sub.avaliacao,
        preco_hora: sub.precoHora,
        obras_atribuidas: sub.obrasAtribuidas,
        proximas_datas_livres: sub.proximasDatasLivres,
        especialidade: sub.especialidade,
        bloqueado: sub.bloqueado || false
      }

      if (existingRecord) {
        await supabase
          .from('subempreiteiros')
          .update({ ...dbRecord, updated_at: new Date().toISOString() })
          .eq('id', sub.id)
          .eq('user_id', userId)
      } else {
        await supabase
          .from('subempreiteiros')
          .insert({ ...dbRecord, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao sincronizar subempreiteiros:', error)
    return { success: false, error }
  }
}

export const syncObras = async (userId: string, obras: any[]) => {
  try {
    const { data: existing } = await supabase
      .from('obras')
      .select('*')
      .eq('user_id', userId)

    for (const obra of obras) {
      const existingRecord = existing?.find(e => e.id === obra.id)
      
      const dbRecord: Omit<DatabaseObra, 'created_at' | 'updated_at'> = {
        id: obra.id,
        user_id: userId,
        nome: obra.nome,
        descricao: obra.descricao,
        responsavel: obra.responsavel,
        data_inicio: obra.dataInicio,
        data_fim_prevista: obra.dataFimPrevista,
        notas: obra.notas
      }

      if (existingRecord) {
        await supabase
          .from('obras')
          .update({ ...dbRecord, updated_at: new Date().toISOString() })
          .eq('id', obra.id)
          .eq('user_id', userId)
      } else {
        await supabase
          .from('obras')
          .insert({ ...dbRecord, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao sincronizar obras:', error)
    return { success: false, error }
  }
}

export const syncTarefas = async (userId: string, tarefas: any[]) => {
  try {
    const { data: existing } = await supabase
      .from('tarefas')
      .select('*')
      .eq('user_id', userId)

    for (const tarefa of tarefas) {
      const existingRecord = existing?.find(e => e.id === tarefa.id)
      
      const dbRecord: Omit<DatabaseTarefa, 'created_at' | 'updated_at'> = {
        id: tarefa.id,
        user_id: userId,
        descricao: tarefa.descricao,
        obra: tarefa.obra,
        responsavel_obra: tarefa.responsavelObra,
        data_inicio: tarefa.dataInicio,
        data_fim: tarefa.dataFim,
        status: tarefa.status,
        subempreiteiro: tarefa.subempreiteiro,
        checklist: tarefa.checklist,
        percentagem_conclusao: tarefa.percentagemConclusao
      }

      if (existingRecord) {
        await supabase
          .from('tarefas')
          .update({ ...dbRecord, updated_at: new Date().toISOString() })
          .eq('id', tarefa.id)
          .eq('user_id', userId)
      } else {
        await supabase
          .from('tarefas')
          .insert({ ...dbRecord, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao sincronizar tarefas:', error)
    return { success: false, error }
  }
}

export const syncNotificacoes = async (userId: string, notificacoes: any[]) => {
  try {
    const { data: existing } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('user_id', userId)

    for (const notif of notificacoes) {
      const existingRecord = existing?.find(e => e.id === notif.id)
      
      const dbRecord: Omit<DatabaseNotificacao, 'created_at' | 'updated_at'> = {
        id: notif.id,
        user_id: userId,
        tipo: notif.tipo,
        titulo: notif.titulo,
        descricao: notif.descricao,
        data_alerta: notif.dataAlerta,
        tarefa: notif.tarefa,
        responsavel: notif.responsavel,
        lida: notif.lida
      }

      if (existingRecord) {
        await supabase
          .from('notificacoes')
          .update({ ...dbRecord, updated_at: new Date().toISOString() })
          .eq('id', notif.id)
          .eq('user_id', userId)
      } else {
        await supabase
          .from('notificacoes')
          .insert({ ...dbRecord, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao sincronizar notificações:', error)
    return { success: false, error }
  }
}

// Funções de carregamento
export const loadUserData = async (userId: string) => {
  try {
    const [subempreiteiros, obras, tarefas, notificacoes] = await Promise.all([
      supabase.from('subempreiteiros').select('*').eq('user_id', userId),
      supabase.from('obras').select('*').eq('user_id', userId),
      supabase.from('tarefas').select('*').eq('user_id', userId),
      supabase.from('notificacoes').select('*').eq('user_id', userId)
    ])

    return {
      subempreiteiros: subempreiteiros.data || [],
      obras: obras.data || [],
      tarefas: tarefas.data || [],
      notificacoes: notificacoes.data || []
    }
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error)
    return {
      subempreiteiros: [],
      obras: [],
      tarefas: [],
      notificacoes: []
    }
  }
}

// Função para criar backup
export const createBackup = async (userId: string) => {
  try {
    const userData = await loadUserData(userId)
    
    const backup = {
      user_id: userId,
      timestamp: new Date().toISOString(),
      data: userData,
      version: '1.0'
    }

    const { data, error } = await supabase
      .from('backups')
      .insert(backup)

    if (error) throw error

    return { success: true, backup: data }
  } catch (error) {
    console.error('Erro ao criar backup:', error)
    return { success: false, error }
  }
}

// Função para migração de dados
export const migrateUserData = async (userId: string, fromVersion: string, toVersion: string) => {
  try {
    // Criar backup antes da migração
    await createBackup(userId)

    // Lógica de migração baseada na versão
    if (fromVersion === '1.0' && toVersion === '1.1') {
      // Exemplo de migração: adicionar campos novos
      const { data: subempreiteiros } = await supabase
        .from('subempreiteiros')
        .select('*')
        .eq('user_id', userId)

      for (const sub of subempreiteiros || []) {
        if (!sub.bloqueado) {
          await supabase
            .from('subempreiteiros')
            .update({ bloqueado: false })
            .eq('id', sub.id)
            .eq('user_id', userId)
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro na migração:', error)
    return { success: false, error }
  }
}