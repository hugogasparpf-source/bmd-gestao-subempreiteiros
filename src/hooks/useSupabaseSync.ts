import { useEffect, useRef } from 'react'
import { 
  syncSubempreiteiros, 
  syncObras, 
  syncTarefas, 
  syncNotificacoes, 
  loadUserData,
  createBackup 
} from '@/lib/supabase'

interface UseSupabaseSyncProps {
  userId: string
  subempreiteiros: any[]
  obras: any[]
  tarefas: any[]
  notificacoes: any[]
  onDataLoaded?: (data: any) => void
}

export const useSupabaseSync = ({
  userId,
  subempreiteiros,
  obras,
  tarefas,
  notificacoes,
  onDataLoaded
}: UseSupabaseSyncProps) => {
  const syncTimeoutRef = useRef<NodeJS.Timeout>()
  const lastSyncRef = useRef<string>('')
  const isInitialLoadRef = useRef(true)

  // Carregar dados iniciais do Supabase
  useEffect(() => {
    if (userId && isInitialLoadRef.current) {
      loadUserData(userId).then((data) => {
        if (data.subempreiteiros.length > 0 || data.obras.length > 0 || data.tarefas.length > 0) {
          // Converter dados do banco para formato da aplicação
          const convertedData = {
            subempreiteiros: data.subempreiteiros.map((sub: any) => ({
              id: sub.id,
              nome: sub.nome,
              contacto: sub.contacto,
              email: sub.email,
              avaliacao: sub.avaliacao,
              precoHora: sub.preco_hora,
              tarefas: [],
              obrasAtribuidas: sub.obras_atribuidas,
              proximasDatasLivres: sub.proximas_datas_livres,
              especialidade: sub.especialidade,
              bloqueado: sub.bloqueado
            })),
            obras: data.obras.map((obra: any) => ({
              id: obra.id,
              nome: obra.nome,
              descricao: obra.descricao,
              responsavel: obra.responsavel,
              dataInicio: obra.data_inicio,
              dataFimPrevista: obra.data_fim_prevista,
              notas: obra.notas
            })),
            tarefas: data.tarefas.map((tarefa: any) => ({
              id: tarefa.id,
              descricao: tarefa.descricao,
              obra: tarefa.obra,
              responsavelObra: tarefa.responsavel_obra,
              dataInicio: tarefa.data_inicio,
              dataFim: tarefa.data_fim,
              status: tarefa.status,
              subempreiteiro: tarefa.subempreiteiro,
              checklist: tarefa.checklist,
              percentagemConclusao: tarefa.percentagem_conclusao
            })),
            notificacoes: data.notificacoes.map((notif: any) => ({
              id: notif.id,
              tipo: notif.tipo,
              titulo: notif.titulo,
              descricao: notif.descricao,
              dataAlerta: notif.data_alerta,
              tarefa: notif.tarefa,
              responsavel: notif.responsavel,
              lida: notif.lida
            }))
          }
          
          onDataLoaded?.(convertedData)
        }
        isInitialLoadRef.current = false
      })
    }
  }, [userId, onDataLoaded])

  // Sincronização automática quando dados mudam
  useEffect(() => {
    if (!userId || isInitialLoadRef.current) return

    const currentDataHash = JSON.stringify({
      subempreiteiros,
      obras,
      tarefas,
      notificacoes
    })

    if (currentDataHash !== lastSyncRef.current) {
      lastSyncRef.current = currentDataHash

      // Debounce para evitar muitas sincronizações
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }

      syncTimeoutRef.current = setTimeout(async () => {
        try {
          await Promise.all([
            syncSubempreiteiros(userId, subempreiteiros),
            syncObras(userId, obras),
            syncTarefas(userId, tarefas),
            syncNotificacoes(userId, notificacoes)
          ])
          
          console.log('✅ Dados sincronizados com Supabase')
        } catch (error) {
          console.error('❌ Erro na sincronização:', error)
        }
      }, 2000) // Aguarda 2 segundos após última mudança
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [userId, subempreiteiros, obras, tarefas, notificacoes])

  // Backup automático diário
  useEffect(() => {
    if (!userId) return

    const createDailyBackup = async () => {
      const lastBackup = localStorage.getItem(`lastBackup_${userId}`)
      const today = new Date().toDateString()

      if (lastBackup !== today) {
        try {
          await createBackup(userId)
          localStorage.setItem(`lastBackup_${userId}`, today)
          console.log('✅ Backup diário criado')
        } catch (error) {
          console.error('❌ Erro ao criar backup:', error)
        }
      }
    }

    // Criar backup na inicialização e depois a cada hora
    createDailyBackup()
    const backupInterval = setInterval(createDailyBackup, 60 * 60 * 1000) // 1 hora

    return () => clearInterval(backupInterval)
  }, [userId])

  return {
    isInitialLoad: isInitialLoadRef.current
  }
}