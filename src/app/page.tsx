"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, CalendarDays, Users, Building2, Clock, CheckCircle, AlertCircle, Plus, Edit, Eye, Bell, UserCheck, UserX, Trash2, Check, X, Search, Filter, BarChart3, Calendar as CalendarIcon, UserPlus, Copy, Lock, LockOpen } from 'lucide-react'
import { toast } from 'sonner'

interface ChecklistItem {
  id: string
  descricao: string
  concluido: boolean
}

interface Subempreiteiro {
  id: string
  nome: string
  contacto: string
  email: string
  avaliacao: number
  precoHora: number
  tarefas: Tarefa[]
  obrasAtribuidas: number
  proximasDatasLivres: string[]
  especialidade: string
  bloqueado?: boolean
}

interface Tarefa {
  id: string
  descricao: string
  obra: string
  responsavelObra: string
  dataInicio: string
  dataFim: string
  status: 'pendente' | 'em_andamento' | 'concluida'
  subempreiteiro: string
  checklist: ChecklistItem[]
  percentagemConclusao: number
}

interface Obra {
  id: string
  nome: string
  descricao: string
  responsavel: string
  dataInicio: string
  dataFimPrevista: string
  notas?: string
}

interface Usuario {
  id: string
  nome: string
  email: string
  username: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  tipo: 'admin' | 'gestor' | 'responsavel'
  dataRegisto: string
}

interface Notificacao {
  id: string
  tipo: 'documentacao' | 'seguranca' | 'material'
  titulo: string
  descricao: string
  dataAlerta: string
  tarefa: string
  responsavel: string
  lida: boolean
}

interface ConviteUsuario {
  id: string
  nome: string
  email: string
  token: string
  dataConvite: string
  usado: boolean
}

export default function GestaoSubempreiteiros() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showRegister, setShowRegister] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [registerData, setRegisterData] = useState({ nome: '', email: '', password: '' })
  const [subempreiteiros, setSubempreiteiros] = useState<Subempreiteiro[]>([])
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [obras, setObras] = useState<Obra[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [convites, setConvites] = useState<ConviteUsuario[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedSubempreiteiro, setSelectedSubempreiteiro] = useState<Subempreiteiro | null>(null)
  const [selectedTarefa, setSelectedTarefa] = useState<Tarefa | null>(null)
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null)
  const [isAddingSubempreiteiro, setIsAddingSubempreiteiro] = useState(false)
  const [isAddingTarefa, setIsAddingTarefa] = useState(false)
  const [isAddingObra, setIsAddingObra] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [isEditingSubempreiteiro, setIsEditingSubempreiteiro] = useState(false)
  const [isEditingObra, setIsEditingObra] = useState(false)
  const [editingSubempreiteiro, setEditingSubempreiteiro] = useState<Subempreiteiro | null>(null)
  const [editingObra, setEditingObra] = useState<Obra | null>(null)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [generatedInviteLink, setGeneratedInviteLink] = useState('')
  
  // Estados para pesquisa e filtros
  const [searchSubempreiteiros, setSearchSubempreiteiros] = useState('')
  const [searchObras, setSearchObras] = useState('')
  const [cronogramaView, setCronogramaView] = useState<'semanal' | 'trimestral' | 'anual'>('semanal')
  const [cronogramaStartDate, setCronogramaStartDate] = useState('')
  const [cronogramaEndDate, setCronogramaEndDate] = useState('')
  
  // Estados para modais de listagem do dashboard
  const [showSubempreiteirosModal, setShowSubempreiteirosModal] = useState(false)
  const [showTarefasAtivasModal, setShowTarefasAtivasModal] = useState(false)
  const [showTarefasPendentesModal, setShowTarefasPendentesModal] = useState(false)
  const [showObrasAtivasModal, setShowObrasAtivasModal] = useState(false)
  const [showSubempreiteirosObraModal, setShowSubempreiteirosObraModal] = useState(false)

  // Estados para confirmação de exclusão
  const [showDeleteObraDialog, setShowDeleteObraDialog] = useState(false)
  const [showDeleteTarefaDialog, setShowDeleteTarefaDialog] = useState(false)
  const [obraToDelete, setObraToDelete] = useState<Obra | null>(null)
  const [tarefaToDelete, setTarefaToDelete] = useState<Tarefa | null>(null)

  // Dados de exemplo
  useEffect(() => {
    const usuariosExemplo: Usuario[] = [
      {
        id: '1',
        nome: 'Administrador',
        email: 'admin@construtora.pt',
        username: 'admin',
        status: 'aprovado',
        tipo: 'admin',
        dataRegisto: '2024-01-01'
      },
      {
        id: '2',
        nome: 'João Gestor',
        email: 'joao.gestor@construtora.pt',
        username: 'joao.gestor',
        status: 'pendente',
        tipo: 'gestor',
        dataRegisto: '2024-01-08'
      }
    ]

    const dadosExemplo: Subempreiteiro[] = [
      {
        id: '1',
        nome: 'João Silva',
        contacto: '+351 912 345 678',
        email: 'joao.silva@email.com',
        avaliacao: 4.5,
        precoHora: 25,
        tarefas: [],
        obrasAtribuidas: 3,
        proximasDatasLivres: ['2024-01-15', '2024-01-22', '2024-01-29'],
        especialidade: 'Eletricista',
        bloqueado: false
      },
      {
        id: '2',
        nome: 'Maria Santos',
        contacto: '+351 913 456 789',
        email: 'maria.santos@email.com',
        avaliacao: 4.8,
        precoHora: 30,
        tarefas: [],
        obrasAtribuidas: 2,
        proximasDatasLivres: ['2024-01-18', '2024-01-25', '2024-02-01'],
        especialidade: 'Canalizadora',
        bloqueado: false
      },
      {
        id: '3',
        nome: 'António Costa',
        contacto: '+351 914 567 890',
        email: 'antonio.costa@email.com',
        avaliacao: 4.2,
        precoHora: 28,
        tarefas: [],
        obrasAtribuidas: 4,
        proximasDatasLivres: ['2024-01-20', '2024-01-27', '2024-02-03'],
        especialidade: 'Pintor',
        bloqueado: false
      }
    ]

    const obrasExemplo: Obra[] = [
      { 
        id: '1', 
        nome: 'Edifício Residencial Porto', 
        descricao: 'Construção de edifício de 8 andares',
        responsavel: 'Eng. Carlos Silva',
        dataInicio: '2024-01-01',
        dataFimPrevista: '2024-06-30',
        notas: 'Atenção especial aos acabamentos. Verificar licenças municipais antes do início de cada fase.'
      },
      { 
        id: '2', 
        nome: 'Moradia Cascais', 
        descricao: 'Moradia unifamiliar de luxo',
        responsavel: 'Arq. Ana Costa',
        dataInicio: '2024-01-15',
        dataFimPrevista: '2024-04-15',
        notas: 'Cliente muito exigente. Materiais de alta qualidade obrigatórios.'
      },
      { 
        id: '3', 
        nome: 'Escritórios Lisboa', 
        descricao: 'Renovação de escritórios corporativos',
        responsavel: 'Eng. Pedro Santos',
        dataInicio: '2024-02-01',
        dataFimPrevista: '2024-05-01',
        notas: 'Trabalhos apenas aos fins de semana para não interferir com funcionamento da empresa.'
      }
    ]

    const tarefasExemplo: Tarefa[] = [
      {
        id: '1',
        descricao: 'Instalação elétrica - Apartamento 2A',
        obra: 'Edifício Residencial Porto',
        responsavelObra: 'Eng. Carlos Silva',
        dataInicio: '2024-01-08',
        dataFim: '2024-01-12',
        status: 'em_andamento',
        subempreiteiro: 'João Silva',
        checklist: [
          { id: '1', descricao: 'Verificar quadro elétrico', concluido: true },
          { id: '2', descricao: 'Instalar tomadas', concluido: true },
          { id: '3', descricao: 'Instalar interruptores', concluido: false },
          { id: '4', descricao: 'Testar instalação', concluido: false }
        ],
        percentagemConclusao: 50
      },
      {
        id: '2',
        descricao: 'Canalização - Casa Unifamiliar',
        obra: 'Moradia Cascais',
        responsavelObra: 'Arq. Ana Costa',
        dataInicio: '2024-01-10',
        dataFim: '2024-01-15',
        status: 'em_andamento',
        subempreiteiro: 'Maria Santos',
        checklist: [
          { id: '1', descricao: 'Instalar tubagem principal', concluido: true },
          { id: '2', descricao: 'Conectar pontos de água', concluido: false },
          { id: '3', descricao: 'Testar pressão', concluido: false }
        ],
        percentagemConclusao: 33
      },
      {
        id: '3',
        descricao: 'Pintura exterior',
        obra: 'Escritórios Lisboa',
        responsavelObra: 'Eng. Pedro Santos',
        dataInicio: '2024-01-15',
        dataFim: '2024-01-20',
        status: 'pendente',
        subempreiteiro: 'António Costa',
        checklist: [
          { id: '1', descricao: 'Preparar superfícies', concluido: false },
          { id: '2', descricao: 'Aplicar primer', concluido: false },
          { id: '3', descricao: 'Aplicar tinta final', concluido: false }
        ],
        percentagemConclusao: 0
      }
    ]

    const notificacoesExemplo: Notificacao[] = [
      {
        id: '1',
        tipo: 'documentacao',
        titulo: 'Verificar documentação - João Silva',
        descricao: 'Verificar se João Silva tem toda a documentação necessária para iniciar trabalho em 2 dias',
        dataAlerta: '2024-01-06',
        tarefa: 'Instalação elétrica - Apartamento 2A',
        responsavel: 'Eng. Carlos Silva',
        lida: false
      },
      {
        id: '2',
        tipo: 'seguranca',
        titulo: 'Equipamentos de segurança - Maria Santos',
        descricao: 'Confirmar que Maria Santos tem todos os EPIs necessários',
        dataAlerta: '2024-01-08',
        tarefa: 'Canalização - Casa Unifamiliar',
        responsavel: 'Arq. Ana Costa',
        lida: false
      }
    ]

    setUsuarios(usuariosExemplo)
    setSubempreiteiros(dadosExemplo)
    setTarefas(tarefasExemplo)
    setObras(obrasExemplo)
    setNotificacoes(notificacoesExemplo)
    
    // Definir datas padrão do cronograma (próximas 8 semanas)
    const hoje = new Date()
    const proximasSemanas = new Date(hoje)
    proximasSemanas.setDate(hoje.getDate() + (8 * 7))
    
    setCronogramaStartDate(hoje.toISOString().split('T')[0])
    setCronogramaEndDate(proximasSemanas.toISOString().split('T')[0])

    // Configurar dados salvos automaticamente
    const savedData = localStorage.getItem('gestaoSubempreiteirosData')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        if (parsedData.subempreiteiros) setSubempreiteiros(parsedData.subempreiteiros)
        if (parsedData.tarefas) setTarefas(parsedData.tarefas)
        if (parsedData.obras) setObras(parsedData.obras)
        if (parsedData.usuarios) setUsuarios(parsedData.usuarios)
        if (parsedData.notificacoes) setNotificacoes(parsedData.notificacoes)
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error)
      }
    }
  }, [])

  // Salvar dados automaticamente sempre que houver mudanças
  useEffect(() => {
    const dataToSave = {
      subempreiteiros,
      tarefas,
      obras,
      usuarios,
      notificacoes
    }
    localStorage.setItem('gestaoSubempreiteirosData', JSON.stringify(dataToSave))
  }, [subempreiteiros, tarefas, obras, usuarios, notificacoes])

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar se o email existe no sistema
    const user = usuarios.find(u => u.email === forgotPasswordEmail)
    if (user) {
      toast.success('Instruções de recuperação enviadas para o seu email!')
      setShowForgotPassword(false)
      setForgotPasswordEmail('')
    } else {
      toast.error('Email não encontrado no sistema!')
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar credenciais do administrador BMD2025
    if (username === 'BMD2025' && password === 'construcao2025') {
      const adminUser = {
        id: 'admin-bmd',
        nome: 'Administrador BMD',
        email: 'admin@bmd.pt',
        username: 'BMD2025',
        status: 'aprovado' as const,
        tipo: 'admin' as const,
        dataRegisto: '2024-01-01'
      }
      setCurrentUser(adminUser)
      setIsLoggedIn(true)
      setActiveTab('dashboard') // Definir dashboard como página padrão
      toast.success('Login realizado com sucesso!')
      return
    }
    
    // Verificar outros usuários aprovados
    const user = usuarios.find(u => u.username === username && u.status === 'aprovado')
    if (user && password === 'password123') {
      setCurrentUser(user)
      setIsLoggedIn(true)
      setActiveTab('dashboard') // Definir dashboard como página padrão
      toast.success('Login realizado com sucesso!')
      return
    }
    
    // Verificar se usuário existe mas não foi aprovado
    const pendingUser = usuarios.find(u => u.username === username && u.status === 'pendente')
    if (pendingUser) {
      toast.error('Conta ainda não aprovada pelo administrador. Aguarde a aprovação.')
      return
    }
    
    // Credenciais inválidas
    toast.error('Nome de utilizador ou palavra-passe incorretos. Verifique os dados introduzidos.')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setUsername('')
    setPassword('')
    setActiveTab('dashboard')
    toast.success('Sessão terminada com sucesso!')
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar se email já existe
    const emailExists = usuarios.some(u => u.email === registerData.email)
    if (emailExists) {
      toast.error('Este email já está registado!')
      return
    }

    const novoUsuario: Usuario = {
      id: Date.now().toString(),
      nome: registerData.nome,
      email: registerData.email,
      username: registerData.email.split('@')[0], // usar parte do email como username
      status: 'pendente',
      tipo: 'gestor',
      dataRegisto: new Date().toISOString().split('T')[0]
    }

    setUsuarios([...usuarios, novoUsuario])
    setRegisterData({ nome: '', email: '', password: '' })
    setShowRegister(false)
    toast.success('Registo efetuado! Aguarde aprovação do administrador.')
  }

  const handleAddUser = (formData: FormData) => {
    const nome = formData.get('nome') as string
    const email = formData.get('email') as string
    
    // Gerar token único para o convite
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    const novoConvite: ConviteUsuario = {
      id: Date.now().toString(),
      nome,
      email,
      token,
      dataConvite: new Date().toISOString(),
      usado: false
    }
    
    setConvites([...convites, novoConvite])
    
    // Gerar link de convite
    const baseUrl = window.location.origin
    const inviteLink = `${baseUrl}?invite=${token}`
    setGeneratedInviteLink(inviteLink)
    
    toast.success('Convite criado com sucesso!')
  }

  const copyInviteLink = async () => {
    try {
      // Tentar usar a Clipboard API moderna
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(generatedInviteLink)
        toast.success('Link copiado para a área de transferência!')
      } else {
        // Fallback para ambientes sem suporte à Clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = generatedInviteLink
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          document.execCommand('copy')
          toast.success('Link copiado para a área de transferência!')
        } catch (err) {
          console.error('Erro ao copiar:', err)
          toast.error('Não foi possível copiar automaticamente. Copie manualmente o link.')
        } finally {
          document.body.removeChild(textArea)
        }
      }
    } catch (err) {
      console.error('Erro ao copiar para clipboard:', err)
      toast.error('Não foi possível copiar automaticamente. Copie manualmente o link.')
    }
  }

  const handleAddSubempreiteiro = (formData: FormData) => {
    const novoSubempreiteiro: Subempreiteiro = {
      id: Date.now().toString(),
      nome: formData.get('nome') as string,
      contacto: formData.get('contacto') as string,
      email: formData.get('email') as string,
      especialidade: formData.get('especialidade') as string,
      avaliacao: parseFloat(formData.get('avaliacao') as string),
      precoHora: parseFloat(formData.get('precoHora') as string),
      tarefas: [],
      obrasAtribuidas: 0,
      proximasDatasLivres: [],
      bloqueado: false
    }
    
    setSubempreiteiros([...subempreiteiros, novoSubempreiteiro])
    setIsAddingSubempreiteiro(false)
    toast.success('Subempreiteiro adicionado com sucesso!')
  }

  const handleEditSubempreiteiro = (formData: FormData) => {
    if (!editingSubempreiteiro) return
    
    const subempreiteiroAtualizado: Subempreiteiro = {
      ...editingSubempreiteiro,
      nome: formData.get('nome') as string,
      contacto: formData.get('contacto') as string,
      email: formData.get('email') as string,
      especialidade: formData.get('especialidade') as string,
      avaliacao: parseFloat(formData.get('avaliacao') as string),
      precoHora: parseFloat(formData.get('precoHora') as string),
    }
    
    setSubempreiteiros(subempreiteiros.map(sub => 
      sub.id === editingSubempreiteiro.id ? subempreiteiroAtualizado : sub
    ))
    setIsEditingSubempreiteiro(false)
    setEditingSubempreiteiro(null)
    toast.success('Subempreiteiro atualizado com sucesso!')
  }

  const toggleSubempreiteiroBloqueio = (subempreiteiroId: string) => {
    setSubempreiteiros(subempreiteiros.map(sub => 
      sub.id === subempreiteiroId ? { ...sub, bloqueado: !sub.bloqueado } : sub
    ))
    const sub = subempreiteiros.find(s => s.id === subempreiteiroId)
    toast.success(`Subempreiteiro ${sub?.bloqueado ? 'desbloqueado' : 'bloqueado'} com sucesso!`)
  }

  const handleAddObra = (formData: FormData) => {
    const novaObra: Obra = {
      id: Date.now().toString(),
      nome: formData.get('nome') as string,
      descricao: formData.get('descricao') as string,
      responsavel: formData.get('responsavel') as string,
      dataInicio: formData.get('dataInicio') as string,
      dataFimPrevista: formData.get('dataFimPrevista') as string,
      notas: formData.get('notas') as string || ''
    }
    
    setObras([...obras, novaObra])
    setIsAddingObra(false)
    toast.success('Obra adicionada com sucesso!')
  }

  const handleEditObra = (formData: FormData) => {
    if (!editingObra) return
    
    const obraAtualizada: Obra = {
      ...editingObra,
      nome: formData.get('nome') as string,
      descricao: formData.get('descricao') as string,
      responsavel: formData.get('responsavel') as string,
      dataInicio: formData.get('dataInicio') as string,
      dataFimPrevista: formData.get('dataFimPrevista') as string,
      notas: formData.get('notas') as string || ''
    }
    
    setObras(obras.map(obra => 
      obra.id === editingObra.id ? obraAtualizada : obra
    ))
    setIsEditingObra(false)
    setEditingObra(null)
    toast.success('Obra atualizada com sucesso!')
  }

  const confirmDeleteObra = (obra: Obra) => {
    setObraToDelete(obra)
    setShowDeleteObraDialog(true)
  }

  const handleDeleteObra = () => {
    if (!obraToDelete) return
    
    // Remover obra
    setObras(obras.filter(obra => obra.id !== obraToDelete.id))
    
    // Remover tarefas associadas à obra
    setTarefas(tarefas.filter(tarefa => tarefa.obra !== obraToDelete.nome))
    
    setShowDeleteObraDialog(false)
    setObraToDelete(null)
    toast.success('Obra apagada com sucesso!')
  }

  const confirmDeleteTarefa = (tarefa: Tarefa) => {
    setTarefaToDelete(tarefa)
    setShowDeleteTarefaDialog(true)
  }

  const handleDeleteTarefa = () => {
    if (!tarefaToDelete) return
    
    setTarefas(tarefas.filter(tarefa => tarefa.id !== tarefaToDelete.id))
    setShowDeleteTarefaDialog(false)
    setTarefaToDelete(null)
    toast.success('Tarefa apagada com sucesso!')
  }

  const handleAddTarefa = (formData: FormData) => {
    const subempreiteiroNome = formData.get('subempreiteiro') as string
    const subempreiteiro = subempreiteiros.find(sub => sub.nome === subempreiteiroNome)
    
    // Verificar se subempreiteiro está bloqueado
    if (subempreiteiro?.bloqueado) {
      toast.error('Não é possível atribuir tarefa a subempreiteiro bloqueado!')
      return
    }

    const checklistItems = (formData.get('checklist') as string)
      .split('\n')
      .filter(item => item.trim())
      .map((item, index) => ({
        id: (index + 1).toString(),
        descricao: item.trim(),
        concluido: false
      }))

    const novaTarefa: Tarefa = {
      id: Date.now().toString(),
      descricao: formData.get('descricao') as string,
      obra: formData.get('obra') as string,
      responsavelObra: formData.get('responsavelObra') as string,
      dataInicio: formData.get('dataInicio') as string,
      dataFim: formData.get('dataFim') as string,
      status: 'pendente',
      subempreiteiro: subempreiteiroNome,
      checklist: checklistItems,
      percentagemConclusao: 0
    }
    
    setTarefas([...tarefas, novaTarefa])
    setIsAddingTarefa(false)
    
    // Criar notificação automática 2 dias antes
    const dataInicio = new Date(novaTarefa.dataInicio)
    const dataNotificacao = new Date(dataInicio)
    dataNotificacao.setDate(dataInicio.getDate() - 2)
    
    const novaNotificacao: Notificacao = {
      id: Date.now().toString() + '_notif',
      tipo: 'documentacao',
      titulo: `Verificar preparação - ${novaTarefa.subempreiteiro}`,
      descricao: `Verificar documentação, equipamentos de segurança e materiais para: ${novaTarefa.descricao}`,
      dataAlerta: dataNotificacao.toISOString().split('T')[0],
      tarefa: novaTarefa.descricao,
      responsavel: novaTarefa.responsavelObra,
      lida: false
    }
    
    setNotificacoes([...notificacoes, novaNotificacao])
    toast.success('Tarefa criada com sucesso! Notificação automática programada.')
  }

  const updateChecklistItem = (tarefaId: string, itemId: string, concluido: boolean) => {
    setTarefas(tarefas.map(tarefa => {
      if (tarefa.id === tarefaId) {
        const updatedChecklist = tarefa.checklist.map(item =>
          item.id === itemId ? { ...item, concluido } : item
        )
        const concluidos = updatedChecklist.filter(item => item.concluido).length
        const percentagem = Math.round((concluidos / updatedChecklist.length) * 100)
        
        return {
          ...tarefa,
          checklist: updatedChecklist,
          percentagemConclusao: percentagem,
          status: percentagem === 100 ? 'concluida' : percentagem > 0 ? 'em_andamento' : 'pendente'
        }
      }
      return tarefa
    }))
  }

  const approveUser = (userId: string) => {
    setUsuarios(usuarios.map(user =>
      user.id === userId ? { ...user, status: 'aprovado' } : user
    ))
    toast.success('Utilizador aprovado com sucesso!')
  }

  const rejectUser = (userId: string) => {
    setUsuarios(usuarios.map(user =>
      user.id === userId ? { ...user, status: 'rejeitado' } : user
    ))
    toast.success('Utilizador rejeitado!')
  }

  const markNotificationAsRead = (notifId: string) => {
    setNotificacoes(notificacoes.map(notif =>
      notif.id === notifId ? { ...notif, lida: true } : notif
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Em Andamento</Badge>
      case 'pendente':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendente</Badge>
      case 'concluida':
        return <Badge className="bg-green-500 hover:bg-green-600">Concluída</Badge>
      default:
        return <Badge variant="secondary">Desconhecido</Badge>
    }
  }

  // Filtrar subempreiteiros por pesquisa
  const filteredSubempreiteiros = subempreiteiros.filter(sub =>
    sub.nome.toLowerCase().includes(searchSubempreiteiros.toLowerCase()) ||
    sub.especialidade.toLowerCase().includes(searchSubempreiteiros.toLowerCase()) ||
    sub.email.toLowerCase().includes(searchSubempreiteiros.toLowerCase())
  )

  // Filtrar obras por pesquisa
  const filteredObras = obras.filter(obra =>
    obra.nome.toLowerCase().includes(searchObras.toLowerCase()) ||
    obra.descricao.toLowerCase().includes(searchObras.toLowerCase()) ||
    obra.responsavel.toLowerCase().includes(searchObras.toLowerCase())
  )

  const getWeekDates = () => {
    const weeks = []
    let startDate = new Date()
    let endDate = new Date()
    let weeksToShow = 8
    
    if (cronogramaStartDate && cronogramaEndDate) {
      startDate = new Date(cronogramaStartDate)
      endDate = new Date(cronogramaEndDate)
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      weeksToShow = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
    } else {
      // Padrão: próximas 8 semanas
      startDate.setDate(startDate.getDate() - startDate.getDay() + 1)
    }
    
    if (cronogramaView === 'trimestral') {
      weeksToShow = 12 // 3 meses
    } else if (cronogramaView === 'anual') {
      weeksToShow = 52 // 1 ano
    }
    
    for (let i = 0; i < weeksToShow; i++) {
      const weekStart = new Date(startDate)
      weekStart.setDate(startDate.getDate() + (i * 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 4)
      
      weeks.push({
        start: weekStart.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }),
        end: weekEnd.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }),
        month: weekStart.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
      })
    }
    return weeks
  }

  const renderCronograma = () => {
    const weeks = getWeekDates()
    
    return (
      <div className="relative">
        {/* Container com scroll horizontal */}
        <div className="flex">
          {/* Coluna fixa das obras */}
          <div className="flex-shrink-0 bg-white border-r-2 border-gray-300 z-10">
            <div className="bg-gray-100 border-b border-gray-300 p-2 h-16 flex items-center">
              <div className="font-semibold text-left min-w-[250px] max-w-[250px]">Obra</div>
            </div>
            {obras.map((obra) => (
              <div key={obra.id} className="border-b border-gray-300 p-2 h-auto min-h-[80px] bg-white hover:bg-gray-50">
                <div className="min-w-[250px] max-w-[250px]">
                  <div className="font-semibold text-sm">{obra.nome}</div>
                  <div className="text-xs text-gray-500 mt-1">{obra.descricao}</div>
                  <div className="text-xs text-blue-600 mt-1">Resp: {obra.responsavel}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Container das semanas com scroll horizontal */}
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-max">
              {/* Cabeçalho das semanas */}
              <div className="flex bg-gray-100 border-b border-gray-300">
                {weeks.map((week, index) => (
                  <div key={index} className="border-l border-gray-300 p-2 text-center min-w-[140px] h-16 flex flex-col justify-center">
                    <div className="text-xs text-gray-600">{week.month}</div>
                    <div className="text-sm font-semibold">{week.start} - {week.end}</div>
                  </div>
                ))}
              </div>
              
              {/* Linhas das obras */}
              {obras.map((obra) => (
                <div key={obra.id} className="flex border-b border-gray-300 hover:bg-gray-50">
                  {weeks.map((week, weekIndex) => {
                    const tarefasDaSemana = tarefas.filter(tarefa => {
                      if (tarefa.obra !== obra.nome) return false
                      
                      const tarefaInicio = new Date(tarefa.dataInicio)
                      const tarefaFim = new Date(tarefa.dataFim)
                      const [diaI, mesI] = week.start.split('/')
                      const [diaF, mesF] = week.end.split('/')
                      const anoAtual = new Date().getFullYear()
                      const semanaInicio = new Date(anoAtual, parseInt(mesI) - 1, parseInt(diaI))
                      const semanaFim = new Date(anoAtual, parseInt(mesF) - 1, parseInt(diaF))
                      
                      return (tarefaInicio >= semanaInicio && tarefaInicio <= semanaFim) ||
                             (tarefaFim >= semanaInicio && tarefaFim <= semanaFim) ||
                             (tarefaInicio <= semanaInicio && tarefaFim >= semanaFim)
                    })
                    
                    return (
                      <div key={weekIndex} className="border-l border-gray-300 p-1 align-top min-w-[140px] min-h-[80px]">
                        {tarefasDaSemana.map((tarefa, tarefaIndex) => (
                          <div key={tarefaIndex} className="mb-1">
                            <div className={`text-xs p-2 rounded-md border-l-4 ${
                              tarefa.status === 'em_andamento' ? 'bg-blue-50 border-blue-400 text-blue-800' :
                              tarefa.status === 'pendente' ? 'bg-yellow-50 border-yellow-400 text-yellow-800' :
                              'bg-green-50 border-green-400 text-green-800'
                            }`}>
                              <div className="font-semibold truncate">{tarefa.subempreiteiro}</div>
                              <div className="truncate text-xs opacity-90">{tarefa.descricao}</div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs opacity-75">{tarefa.percentagemConclusao}%</span>
                                <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-current opacity-60 transition-all"
                                    style={{ width: `${tarefa.percentagemConclusao}%` }}
                                  />
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0 mt-1 hover:bg-red-100"
                                onClick={() => confirmDeleteTarefa(tarefa)}
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Gestão de Subempreiteiros</CardTitle>
            <CardDescription>Sistema de gestão para construtoras</CardDescription>
          </CardHeader>
          <CardContent>
            {!showRegister && !showForgotPassword ? (
              <>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de utilizador</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Digite o seu utilizador"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Palavra-passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite a sua palavra-passe"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Entrar
                  </Button>
                </form>
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowRegister(true)}
                    className="w-full"
                  >
                    Novo Utilizador
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowForgotPassword(true)}
                    className="w-full text-sm text-blue-600 hover:text-blue-700"
                  >
                    Esqueci a palavra-passe
                  </Button>
                </div>
              </>
            ) : showForgotPassword ? (
              <>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgotEmail">Email</Label>
                    <Input
                      id="forgotEmail"
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="Digite o seu email"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Enviar Instruções
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setForgotPasswordEmail('')
                    }}
                    className="w-full"
                  >
                    Voltar ao Login
                  </Button>
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-lg text-sm text-blue-800">
                  <strong>Nota:</strong> Se o email estiver registado no sistema, receberá instruções para recuperar a sua palavra-passe.
                </div>
              </>
            ) : (
              <>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input
                      id="nome"
                      type="text"
                      value={registerData.nome}
                      onChange={(e) => setRegisterData({...registerData, nome: e.target.value})}
                      placeholder="Digite o seu nome completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      placeholder="Digite o seu email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Palavra-passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      placeholder="Digite a sua palavra-passe"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Registar
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRegister(false)
                      setRegisterData({ nome: '', email: '', password: '' })
                    }}
                    className="w-full"
                  >
                    Voltar ao Login
                  </Button>
                </div>
                <div className="mt-4 p-3 bg-yellow-100 rounded-lg text-sm text-yellow-800">
                  <strong>Nota:</strong> Após o registo, aguarde a aprovação do administrador para ter acesso à aplicação.
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Gestão de Subempreiteiros</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotifications(true)}
                className="relative"
              >
                <Bell className="w-4 h-4" />
                {notificacoesNaoLidas > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                    {notificacoesNaoLidas}
                  </Badge>
                )}
              </Button>
              {currentUser?.tipo === 'admin' && (
                <>
                  <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        +Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Adicionar Novo Utilizador</DialogTitle>
                        <DialogDescription>
                          Crie um convite para um novo utilizador
                        </DialogDescription>
                      </DialogHeader>
                      <form action={handleAddUser} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome">Nome do utilizador</Label>
                          <Input id="nome" name="nome" placeholder="Nome completo" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" name="email" type="email" placeholder="email@exemplo.com" required />
                        </div>
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                          Enviar Convite
                        </Button>
                      </form>
                      
                      {generatedInviteLink && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-2">Link de Convite Gerado:</h4>
                          <div className="flex items-center space-x-2">
                            <Input 
                              value={generatedInviteLink} 
                              readOnly 
                              className="text-sm bg-white"
                            />
                            <Button
                              size="sm"
                              onClick={copyInviteLink}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-green-700 mt-2">
                            Envie este link para o utilizador. Ele poderá criar a sua palavra-passe e ter acesso à aplicação.
                          </p>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUserManagement(true)}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Utilizadores
                  </Button>
                </>
              )}
              <div className="text-sm text-gray-600">
                Olá, {currentUser?.nome}
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dialog de confirmação para apagar obra */}
      <Dialog open={showDeleteObraDialog} onOpenChange={setShowDeleteObraDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Pretende continuar?
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteObraDialog(false)}
            >
              Não
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteObra}
            >
              Sim
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para apagar tarefa */}
      <Dialog open={showDeleteTarefaDialog} onOpenChange={setShowDeleteTarefaDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Pretende continuar?
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteTarefaDialog(false)}
            >
              Não
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTarefa}
            >
              Sim
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notificações Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notificações</DialogTitle>
            <DialogDescription>
              Alertas e lembretes do sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma notificação</p>
            ) : (
              notificacoes.map((notif) => (
                <Alert key={notif.id} className={`${notif.lida ? 'opacity-60' : ''}`}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{notif.titulo}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notif.descricao}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Tarefa: {notif.tarefa}</span>
                          <span>Responsável: {notif.responsavel}</span>
                          <span>Data: {new Date(notif.dataAlerta).toLocaleDateString('pt-PT')}</span>
                        </div>
                      </div>
                      {!notif.lida && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markNotificationAsRead(notif.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Gestão de Utilizadores Dialog */}
      <Dialog open={showUserManagement} onOpenChange={setShowUserManagement}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gestão de Utilizadores</DialogTitle>
            <DialogDescription>
              Aprovar ou rejeitar novos utilizadores
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {usuarios.filter(u => u.status === 'pendente').length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum utilizador pendente de aprovação</p>
            ) : (
              usuarios.filter(u => u.status === 'pendente').map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{user.nome}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="secondary">{user.tipo}</Badge>
                      <span className="text-xs text-gray-500">
                        Registo: {new Date(user.dataRegisto).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => approveUser(user.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectUser(user.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Listagem de Subempreiteiros */}
      <Dialog open={showSubempreiteirosModal} onOpenChange={setShowSubempreiteirosModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Lista de Subempreiteiros</DialogTitle>
            <DialogDescription>
              Todos os subempreiteiros registados no sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {subempreiteiros.map((sub) => (
              <div key={sub.id} className={`flex items-center justify-between p-4 border rounded-lg ${sub.bloqueado ? 'bg-red-50 border-red-200' : ''}`}>
                <div>
                  <h3 className="font-semibold">{sub.nome}</h3>
                  <p className="text-sm text-gray-600">{sub.especialidade} • {sub.contacto}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <Badge variant="secondary">€{sub.precoHora}/hora</Badge>
                    <span className="text-xs text-gray-500">★ {sub.avaliacao}</span>
                    <span className="text-xs text-gray-500">{sub.obrasAtribuidas} obras</span>
                    {sub.bloqueado && <Badge variant="destructive">Bloqueado</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Tarefas Ativas */}
      <Dialog open={showTarefasAtivasModal} onOpenChange={setShowTarefasAtivasModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Tarefas Ativas</DialogTitle>
            <DialogDescription>
              Tarefas atualmente em andamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {tarefas.filter(t => t.status === 'em_andamento').map((tarefa) => (
              <div key={tarefa.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{tarefa.descricao}</h3>
                  {getStatusBadge(tarefa.status)}
                </div>
                <p className="text-sm text-gray-600">{tarefa.obra} • {tarefa.subempreiteiro}</p>
                <div className="mt-2">
                  <Progress value={tarefa.percentagemConclusao} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{tarefa.percentagemConclusao}% concluído</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Tarefas Pendentes */}
      <Dialog open={showTarefasPendentesModal} onOpenChange={setShowTarefasPendentesModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Tarefas Pendentes</DialogTitle>
            <DialogDescription>
              Tarefas aguardando início
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {tarefas.filter(t => t.status === 'pendente').map((tarefa) => (
              <div key={tarefa.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{tarefa.descricao}</h3>
                  {getStatusBadge(tarefa.status)}
                </div>
                <p className="text-sm text-gray-600">{tarefa.obra} • {tarefa.subempreiteiro}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Início: {new Date(tarefa.dataInicio).toLocaleDateString('pt-PT')}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Obras Ativas */}
      <Dialog open={showObrasAtivasModal} onOpenChange={setShowObrasAtivasModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Obras Ativas</DialogTitle>
            <DialogDescription>
              Todas as obras em curso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {obras.map((obra) => (
              <div key={obra.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{obra.nome}</h3>
                <p className="text-sm text-gray-600">{obra.descricao}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>Responsável: {obra.responsavel}</span>
                  <span>Início: {new Date(obra.dataInicio).toLocaleDateString('pt-PT')}</span>
                  <span>Fim previsto: {new Date(obra.dataFimPrevista).toLocaleDateString('pt-PT')}</span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Subempreiteiros da Obra */}
      <Dialog open={showSubempreiteirosObraModal} onOpenChange={setShowSubempreiteirosObraModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Subempreiteiros da Obra</DialogTitle>
            <DialogDescription>
              {selectedObra ? `Subempreiteiros com tarefas em: ${selectedObra.nome}` : 'Subempreiteiros da obra selecionada'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedObra && tarefas
              .filter(t => t.obra === selectedObra.nome)
              .map((tarefa) => (
                <div key={tarefa.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{tarefa.subempreiteiro}</h3>
                    {getStatusBadge(tarefa.status)}
                  </div>
                  <p className="text-sm text-gray-600">{tarefa.descricao}</p>
                  <div className="mt-2">
                    <Progress value={tarefa.percentagemConclusao} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">{tarefa.percentagemConclusao}% concluído</p>
                  </div>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <CalendarDays className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="subempreiteiros" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Subempreiteiros</span>
            </TabsTrigger>
            <TabsTrigger value="obras" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Obras</span>
            </TabsTrigger>
            <TabsTrigger value="cronograma" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Cronograma</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowSubempreiteirosModal(true)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Subempreiteiros</p>
                      <p className="text-3xl font-bold text-gray-900">{subempreiteiros.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowTarefasAtivasModal(true)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tarefas Ativas</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {tarefas.filter(t => t.status === 'em_andamento').length}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowTarefasPendentesModal(true)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tarefas Pendentes</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {tarefas.filter(t => t.status === 'pendente').length}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowObrasAtivasModal(true)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Obras Ativas</p>
                      <p className="text-3xl font-bold text-gray-900">{obras.length}</p>
                    </div>
                    <Building2 className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Subempreiteiros</CardTitle>
                  <CardDescription>Estado atual e próximas disponibilidades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subempreiteiros.map((sub) => {
                      const tarefasAtivas = tarefas.filter(t => t.subempreiteiro === sub.nome && t.status === 'em_andamento')
                      const tarefasPendentes = tarefas.filter(t => t.subempreiteiro === sub.nome && t.status === 'pendente')
                      
                      return (
                        <div key={sub.id} className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${sub.bloqueado ? 'bg-red-50 border-red-200' : ''}`}>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{sub.nome}</h3>
                            <p className="text-sm text-gray-600">{sub.especialidade} • {sub.contacto}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {sub.obrasAtribuidas} obras
                              </span>
                              <span className="text-xs text-gray-500">
                                €{sub.precoHora}/hora
                              </span>
                              <div className="flex items-center">
                                <span className="text-xs text-yellow-600">★</span>
                                <span className="text-xs text-gray-600 ml-1">{sub.avaliacao}</span>
                              </div>
                              {sub.bloqueado && <Badge variant="destructive" className="text-xs">Bloqueado</Badge>}
                            </div>
                          </div>
                          <div className="text-right">
                            {sub.bloqueado ? (
                              <Badge variant="destructive">Bloqueado</Badge>
                            ) : tarefasAtivas.length > 0 ? (
                              <Badge className="bg-green-500 hover:bg-green-600">A trabalhar</Badge>
                            ) : tarefasPendentes.length > 0 ? (
                              <Badge className="bg-yellow-500 hover:bg-yellow-600">Tarefa atribuída</Badge>
                            ) : (
                              <Badge variant="secondary">Disponível</Badge>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              Próximas datas livres:
                            </div>
                            <div className="text-xs text-gray-600">
                              {sub.proximasDatasLivres.slice(0, 3).map(data => 
                                new Date(data).toLocaleDateString('pt-PT')
                              ).join(', ')}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tarefas com Progresso</CardTitle>
                  <CardDescription>Acompanhamento de checklists</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tarefas.slice(0, 5).map((tarefa) => (
                      <div key={tarefa.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{tarefa.descricao}</h4>
                          {getStatusBadge(tarefa.status)}
                        </div>
                        <p className="text-sm text-gray-600">{tarefa.obra} • {tarefa.subempreiteiro}</p>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progresso</span>
                            <span>{tarefa.percentagemConclusao}%</span>
                          </div>
                          <Progress value={tarefa.percentagemConclusao} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">
                            {tarefa.checklist.filter(item => item.concluido).length} de {tarefa.checklist.length} itens concluídos
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => setSelectedTarefa(tarefa)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Checklist
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subempreiteiros" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Gestão de Subempreiteiros</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Pesquisar subempreiteiros..."
                    value={searchSubempreiteiros}
                    onChange={(e) => setSearchSubempreiteiros(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <div className="flex space-x-2">
                  <Dialog open={isAddingSubempreiteiro} onOpenChange={setIsAddingSubempreiteiro}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Subempreiteiro
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Adicionar Subempreiteiro</DialogTitle>
                        <DialogDescription>
                          Preencha os dados do novo subempreiteiro
                        </DialogDescription>
                      </DialogHeader>
                      <form action={handleAddSubempreiteiro} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome">Nome completo</Label>
                          <Input id="nome" name="nome" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contacto">Contacto</Label>
                          <Input id="contacto" name="contacto" placeholder="+351 912 345 678" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" name="email" type="email" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="especialidade">Especialidade</Label>
                          <Input id="especialidade" name="especialidade" placeholder="ex: Eletricista, Canalizador" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="avaliacao">Avaliação (1-5)</Label>
                          <Input id="avaliacao" name="avaliacao" type="number" min="1" max="5" step="0.1" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="precoHora">Preço por hora (€)</Label>
                          <Input id="precoHora" name="precoHora" type="number" min="0" step="0.01" required />
                        </div>
                        <Button type="submit" className="w-full">Adicionar</Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isAddingTarefa} onOpenChange={setIsAddingTarefa}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Tarefa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Criar Nova Tarefa</DialogTitle>
                        <DialogDescription>
                          Atribua uma nova tarefa a um subempreiteiro com checklist
                        </DialogDescription>
                      </DialogHeader>
                      <form action={handleAddTarefa} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="descricao">Descrição da tarefa</Label>
                          <Textarea id="descricao" name="descricao" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="obra">Obra</Label>
                            <Select name="obra" required>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a obra" />
                              </SelectTrigger>
                              <SelectContent>
                                {obras.map((obra) => (
                                  <SelectItem key={obra.id} value={obra.nome}>
                                    {obra.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="responsavelObra">Responsável da obra</Label>
                            <Input id="responsavelObra" name="responsavelObra" placeholder="Nome do responsável" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subempreiteiro">Subempreiteiro</Label>
                          <Select name="subempreiteiro" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o subempreiteiro" />
                            </SelectTrigger>
                            <SelectContent>
                              {subempreiteiros.filter(sub => !sub.bloqueado).map((sub) => (
                                <SelectItem key={sub.id} value={sub.nome}>
                                  {sub.nome} - {sub.especialidade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="dataInicio">Data de início</Label>
                            <Input id="dataInicio" name="dataInicio" type="date" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dataFim">Data de fim</Label>
                            <Input id="dataFim" name="dataFim" type="date" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="checklist">Checklist (um item por linha)</Label>
                          <Textarea 
                            id="checklist" 
                            name="checklist" 
                            placeholder="Verificar materiais&#10;Preparar ferramentas&#10;Executar instalação&#10;Testar funcionamento"
                            rows={4}
                            required 
                          />
                        </div>
                        <Button type="submit" className="w-full">Criar Tarefa</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubempreiteiros.map((sub) => {
                const obrasAtribuidas = tarefas
                  .filter(t => t.subempreiteiro === sub.nome)
                  .map(t => ({ nome: t.obra, responsavel: t.responsavelObra, progresso: t.percentagemConclusao }))
                  .reduce((acc, curr) => {
                    const existing = acc.find(item => item.nome === curr.nome)
                    if (!existing) {
                      acc.push(curr)
                    }
                    return acc
                  }, [] as { nome: string; responsavel: string; progresso: number }[])

                return (
                  <Card key={sub.id} className={`hover:shadow-lg transition-shadow ${sub.bloqueado ? 'bg-red-50 border-red-200' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{sub.nome}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm font-medium">{sub.avaliacao}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleSubempreiteiroBloqueio(sub.id)}
                            className={`p-1 ${sub.bloqueado ? 'text-red-600 hover:text-red-700' : 'text-gray-600 hover:text-gray-700'}`}
                          >
                            {sub.bloqueado ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{sub.especialidade} • {sub.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Contacto:</span>
                          <span className="font-medium">{sub.contacto}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Preço/hora:</span>
                          <span className="font-medium">€{sub.precoHora}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Obras atribuídas:</span>
                          <span className="font-medium">{obrasAtribuidas.length}</span>
                        </div>
                        {sub.bloqueado && (
                          <div className="p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
                            Subempreiteiro bloqueado - não pode receber novas tarefas
                          </div>
                        )}
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-600 mb-2">Próximas datas livres:</p>
                          <div className="flex flex-wrap gap-1">
                            {sub.proximasDatasLivres.slice(0, 3).map((data, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {new Date(data).toLocaleDateString('pt-PT')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Subempreiteiro</DialogTitle>
                              <DialogDescription>
                                Informações detalhadas e obras atribuídas
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{sub.nome}</h3>
                                  <p className="text-sm text-gray-600">{sub.especialidade}</p>
                                  <p className="text-sm text-gray-600">{sub.contacto}</p>
                                  <p className="text-sm text-gray-600">{sub.email}</p>
                                  {sub.bloqueado && (
                                    <Badge variant="destructive" className="mt-2">Bloqueado</Badge>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-600">Avaliação</div>
                                  <div className="text-2xl font-bold text-gray-900">★ {sub.avaliacao}</div>
                                  <div className="text-sm text-gray-600 mt-2">€{sub.precoHora}/hora</div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Obras Atribuídas</h4>
                                <div className="space-y-3">
                                  {obrasAtribuidas.length === 0 ? (
                                    <p className="text-gray-500 text-sm">Nenhuma obra atribuída</p>
                                  ) : (
                                    obrasAtribuidas.map((obra, index) => (
                                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                          <span className="font-medium">{obra.nome}</span>
                                          <p className="text-sm text-gray-600">Responsável: {obra.responsavel}</p>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm font-medium">{obra.progresso}%</div>
                                          <Progress value={obra.progresso} className="w-16 h-2 mt-1" />
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setEditingSubempreiteiro(sub)
                            setIsEditingSubempreiteiro(true)
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="obras" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Gestão de Obras</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Pesquisar obras..."
                    value={searchObras}
                    onChange={(e) => setSearchObras(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Dialog open={isAddingObra} onOpenChange={setIsAddingObra}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Obra
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Obra</DialogTitle>
                      <DialogDescription>
                        Preencha os dados da nova obra
                      </DialogDescription>
                    </DialogHeader>
                    <form action={handleAddObra} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome da obra</Label>
                        <Input id="nome" name="nome" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea id="descricao" name="descricao" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="responsavel">Responsável</Label>
                        <Input id="responsavel" name="responsavel" placeholder="Nome do responsável" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dataInicio">Data de início</Label>
                          <Input id="dataInicio" name="dataInicio" type="date" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dataFimPrevista">Data fim prevista</Label>
                          <Input id="dataFimPrevista" name="dataFimPrevista" type="date" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notas">Notas</Label>
                        <Textarea id="notas" name="notas" placeholder="Observações e detalhes importantes..." />
                      </div>
                      <Button type="submit" className="w-full">Adicionar Obra</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredObras.map((obra) => {
                const tarefasDaObra = tarefas.filter(t => t.obra === obra.nome)
                const tarefasAtivas = tarefasDaObra.filter(t => t.status === 'em_andamento').length
                const tarefasPendentes = tarefasDaObra.filter(t => t.status === 'pendente').length
                const tarefasConcluidas = tarefasDaObra.filter(t => t.status === 'concluida').length
                
                return (
                  <Card key={obra.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{obra.nome}</CardTitle>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => confirmDeleteObra(obra)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardDescription>{obra.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Responsável:</span>
                          <span className="font-medium">{obra.responsavel}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Início:</span>
                          <span className="font-medium">{new Date(obra.dataInicio).toLocaleDateString('pt-PT')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Fim previsto:</span>
                          <span className="font-medium">{new Date(obra.dataFimPrevista).toLocaleDateString('pt-PT')}</span>
                        </div>
                        {obra.notas && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-gray-600 mb-1">Notas:</p>
                            <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">{obra.notas}</p>
                          </div>
                        )}
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-600 mb-2">Tarefas:</p>
                          <div className="flex flex-wrap gap-2">
                            {tarefasAtivas > 0 && (
                              <Badge className="bg-blue-500 text-xs">
                                {tarefasAtivas} ativas
                              </Badge>
                            )}
                            {tarefasPendentes > 0 && (
                              <Badge className="bg-yellow-500 text-xs">
                                {tarefasPendentes} pendentes
                              </Badge>
                            )}
                            {tarefasConcluidas > 0 && (
                              <Badge className="bg-green-500 text-xs">
                                {tarefasConcluidas} concluídas
                              </Badge>
                            )}
                            {tarefasDaObra.length === 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Sem tarefas
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedObra(obra)
                            setShowSubempreiteirosObraModal(true)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setEditingObra(obra)
                            setIsEditingObra(true)
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="cronograma" className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Cronograma de Obras</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex gap-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="dataInicio" className="text-sm">De:</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={cronogramaStartDate}
                      onChange={(e) => setCronogramaStartDate(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="dataFim" className="text-sm">Até:</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={cronogramaEndDate}
                      onChange={(e) => setCronogramaEndDate(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={cronogramaView === 'semanal' ? 'default' : 'outline'}
                    onClick={() => setCronogramaView('semanal')}
                  >
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    Semanal
                  </Button>
                  <Button
                    size="sm"
                    variant={cronogramaView === 'trimestral' ? 'default' : 'outline'}
                    onClick={() => setCronogramaView('trimestral')}
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Trimestral
                  </Button>
                  <Button
                    size="sm"
                    variant={cronogramaView === 'anual' ? 'default' : 'outline'}
                    onClick={() => setCronogramaView('anual')}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Anual
                  </Button>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  Cronograma {cronogramaView === 'semanal' ? 'Semanal' : cronogramaView === 'trimestral' ? 'Trimestral' : 'Anual'}
                </CardTitle>
                <CardDescription>
                  Distribuição de tarefas por obra e subempreiteiro ao longo do período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderCronograma()}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-50 border-l-4 border-blue-400 rounded"></div>
                    <span className="text-sm">Em Andamento</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-50 border-l-4 border-yellow-400 rounded"></div>
                    <span className="text-sm">Pendente</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-50 border-l-4 border-green-400 rounded"></div>
                    <span className="text-sm">Concluída</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog para editar subempreiteiro */}
      <Dialog open={isEditingSubempreiteiro} onOpenChange={setIsEditingSubempreiteiro}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Subempreiteiro</DialogTitle>
            <DialogDescription>
              Atualize os dados do subempreiteiro
            </DialogDescription>
          </DialogHeader>
          {editingSubempreiteiro && (
            <form action={handleEditSubempreiteiro} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" name="nome" defaultValue={editingSubempreiteiro.nome} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contacto">Contacto</Label>
                <Input id="contacto" name="contacto" defaultValue={editingSubempreiteiro.contacto} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editingSubempreiteiro.email} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="especialidade">Especialidade</Label>
                <Input id="especialidade" name="especialidade" defaultValue={editingSubempreiteiro.especialidade} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avaliacao">Avaliação (1-5)</Label>
                <Input id="avaliacao" name="avaliacao" type="number" min="1" max="5" step="0.1" defaultValue={editingSubempreiteiro.avaliacao} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precoHora">Preço por hora (€)</Label>
                <Input id="precoHora" name="precoHora" type="number" min="0" step="0.01" defaultValue={editingSubempreiteiro.precoHora} required />
              </div>
              <Button type="submit" className="w-full">Atualizar</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar obra */}
      <Dialog open={isEditingObra} onOpenChange={setIsEditingObra}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Obra</DialogTitle>
            <DialogDescription>
              Atualize os dados da obra
            </DialogDescription>
          </DialogHeader>
          {editingObra && (
            <form action={handleEditObra} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da obra</Label>
                <Input id="nome" name="nome" defaultValue={editingObra.nome} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" name="descricao" defaultValue={editingObra.descricao} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input id="responsavel" name="responsavel" defaultValue={editingObra.responsavel} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data de início</Label>
                  <Input id="dataInicio" name="dataInicio" type="date" defaultValue={editingObra.dataInicio} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFimPrevista">Data fim prevista</Label>
                  <Input id="dataFimPrevista" name="dataFimPrevista" type="date" defaultValue={editingObra.dataFimPrevista} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notas">Notas</Label>
                <Textarea id="notas" name="notas" defaultValue={editingObra.notas || ''} placeholder="Observações e detalhes importantes..." />
              </div>
              <Button type="submit" className="w-full">Atualizar</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para ver detalhes da tarefa e checklist */}
      <Dialog open={!!selectedTarefa} onOpenChange={() => setSelectedTarefa(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Tarefa</DialogTitle>
            <DialogDescription>
              Acompanhe o progresso através do checklist
            </DialogDescription>
          </DialogHeader>
          {selectedTarefa && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedTarefa.descricao}</h3>
                  <p className="text-sm text-gray-600">{selectedTarefa.obra}</p>
                  <p className="text-sm text-gray-600">Subempreiteiro: {selectedTarefa.subempreiteiro}</p>
                  <p className="text-sm text-gray-600">Responsável: {selectedTarefa.responsavelObra}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(selectedTarefa.status)}
                  <div className="mt-2">
                    <div className="text-sm text-gray-600">Progresso</div>
                    <div className="text-2xl font-bold text-gray-900">{selectedTarefa.percentagemConclusao}%</div>
                    <Progress value={selectedTarefa.percentagemConclusao} className="mt-1" />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Checklist</h4>
                <div className="space-y-3">
                  {selectedTarefa.checklist.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={item.concluido}
                        onCheckedChange={(checked) => 
                          updateChecklistItem(selectedTarefa.id, item.id, checked as boolean)
                        }
                      />
                      <span className={`flex-1 ${item.concluido ? 'line-through text-gray-500' : ''}`}>
                        {item.descricao}
                      </span>
                      {item.concluido && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm text-gray-600">
                  {selectedTarefa.checklist.filter(item => item.concluido).length} de {selectedTarefa.checklist.length} itens concluídos
                </span>
                <div className="text-sm text-gray-600">
                  {new Date(selectedTarefa.dataInicio).toLocaleDateString('pt-PT')} - {new Date(selectedTarefa.dataFim).toLocaleDateString('pt-PT')}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}