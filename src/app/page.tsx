'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building2, 
  Users, 
  CheckSquare, 
  Bell, 
  LogIn, 
  LogOut, 
  Loader2,
  Plus,
  Trash2,
  Wifi,
  WifiOff
} from 'lucide-react'

// Tipos básicos
interface User {
  id: string
  nome: string
  email: string
  username: string
  tipo: 'admin' | 'gestor' | 'subempreiteiro'
}

interface Obra {
  id: string
  nome: string
  descricao: string
  responsavel: string
  data_inicio: string
  data_fim_prevista: string
  status?: string
}

interface Subempreiteiro {
  id: string
  nome: string
  telefone: string
  email: string
  especialidade: string
  status?: string
}

interface Tarefa {
  id: string
  titulo: string
  descricao: string
  prioridade: 'alta' | 'media' | 'baixa'
  status: 'pendente' | 'em_andamento' | 'concluida'
  data_vencimento: string
}

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo: string
  lida: boolean
  created_at: string
}

// Hook de autenticação simplificado
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar sessão existente
    const checkSession = () => {
      try {
        const userData = localStorage.getItem('bmd_user')
        if (userData) {
          setUser(JSON.parse(userData))
        }
      } catch (err) {
        console.warn('Erro ao verificar sessão:', err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      if (username === 'BMD2025' && password === 'construcao2025') {
        const userData: User = {
          id: 'bmd-2025-user-id',
          nome: 'BMD Administrator',
          email: 'admin@bmdproject.com',
          username: 'BMD2025',
          tipo: 'admin'
        }

        localStorage.setItem('bmd_user', JSON.stringify(userData))
        setUser(userData)
        return userData
      }

      throw new Error('Credenciais inválidas')
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('bmd_user')
    setUser(null)
    setError(null)
  }

  const clearError = () => setError(null)

  return {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
    isAuthenticated: !!user,
    isAdmin: user?.tipo === 'admin'
  }
}

// Hook para gerenciar dados locais
const useLocalData = <T>(key: string, initialData: T[]) => {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Carregar dados do localStorage
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        setData(JSON.parse(stored))
      } else {
        // Salvar dados iniciais
        localStorage.setItem(key, JSON.stringify(initialData))
        setData(initialData)
      }
    } catch (err) {
      console.warn(`Erro ao carregar ${key}:`, err)
      setData(initialData)
    }
  }, [key])

  const create = (newItem: T) => {
    const updatedData = [newItem, ...data]
    setData(updatedData)
    localStorage.setItem(key, JSON.stringify(updatedData))
  }

  const update = (id: string, updates: Partial<T>) => {
    const updatedData = data.map(item => 
      (item as any).id === id ? { ...item, ...updates } : item
    )
    setData(updatedData)
    localStorage.setItem(key, JSON.stringify(updatedData))
  }

  const remove = (id: string) => {
    const updatedData = data.filter(item => (item as any).id !== id)
    setData(updatedData)
    localStorage.setItem(key, JSON.stringify(updatedData))
  }

  return { data, loading, create, update, remove }
}

// Componente de Login
const LoginForm = () => {
  const { login, loading, error, clearError } = useAuth()
  const [credentials, setCredentials] = useState({ username: '', password: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(credentials.username, credentials.password)
    } catch (err) {
      // Erro já tratado no hook
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">BMD Project</CardTitle>
          <CardDescription>Sistema de Gestão de Subempreiteiros</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertDescription className="text-red-600">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Usuário"
                value={credentials.username}
                onChange={(e) => {
                  clearError()
                  setCredentials(prev => ({ ...prev, username: e.target.value }))
                }}
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={credentials.password}
                onChange={(e) => {
                  clearError()
                  setCredentials(prev => ({ ...prev, password: e.target.value }))
                }}
                disabled={loading}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Usuário de teste:</strong> BMD2025<br />
              <strong>Senha:</strong> construcao2025
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Dados iniciais
const initialObras: Obra[] = [
  {
    id: 'obra-1',
    nome: 'Construção Residencial - Vila Nova',
    descricao: 'Construção de moradia unifamiliar com 3 quartos',
    responsavel: 'João Silva',
    data_inicio: '2024-01-15',
    data_fim_prevista: '2024-06-30',
    status: 'Em andamento'
  },
  {
    id: 'obra-2',
    nome: 'Renovação Comercial - Centro',
    descricao: 'Renovação completa de espaço comercial',
    responsavel: 'Maria Santos',
    data_inicio: '2024-02-01',
    data_fim_prevista: '2024-04-15',
    status: 'Em andamento'
  }
]

const initialSubempreiteiros: Subempreiteiro[] = [
  {
    id: 'sub-1',
    nome: 'António Pereira',
    telefone: '+351 912 345 678',
    email: 'antonio@exemplo.com',
    especialidade: 'Carpintaria',
    status: 'Ativo'
  },
  {
    id: 'sub-2',
    nome: 'Carlos Mendes',
    telefone: '+351 913 456 789',
    email: 'carlos@exemplo.com',
    especialidade: 'Eletricidade',
    status: 'Ativo'
  }
]

const initialTarefas: Tarefa[] = [
  {
    id: 'tarefa-1',
    titulo: 'Instalação de sistema elétrico',
    descricao: 'Instalação completa do sistema elétrico',
    prioridade: 'alta',
    status: 'em_andamento',
    data_vencimento: '2024-03-15'
  },
  {
    id: 'tarefa-2',
    titulo: 'Carpintaria - Portas e janelas',
    descricao: 'Instalação de portas e janelas',
    prioridade: 'media',
    status: 'pendente',
    data_vencimento: '2024-03-20'
  }
]

const initialNotificacoes: Notificacao[] = [
  {
    id: 'notif-1',
    titulo: 'Prazo próximo',
    mensagem: 'A tarefa "Instalação de sistema elétrico" tem prazo até 15/03',
    tipo: 'prazo',
    lida: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'notif-2',
    titulo: 'Nova tarefa atribuída',
    mensagem: 'Nova tarefa de carpintaria foi atribuída',
    tipo: 'nova_tarefa',
    lida: true,
    created_at: new Date().toISOString()
  }
]

// Componente principal do dashboard
const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('obras')
  const [isOnline, setIsOnline] = useState(true)

  // Hooks de dados locais
  const obras = useLocalData<Obra>('bmd_obras', initialObras)
  const subempreiteiros = useLocalData<Subempreiteiro>('bmd_subempreiteiros', initialSubempreiteiros)
  const tarefas = useLocalData<Tarefa>('bmd_tarefas', initialTarefas)
  const notificacoes = useLocalData<Notificacao>('bmd_notificacoes', initialNotificacoes)

  // Monitorar conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Estatísticas
  const stats = {
    obras: obras.data.length,
    subempreiteiros: subempreiteiros.data.length,
    tarefas: tarefas.data.length,
    notificacoes: notificacoes.data.filter(n => !n.lida).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">BMD Project</h1>
                <p className="text-sm text-gray-500">Gestão de Subempreiteiros</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status de conexão */}
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-gray-600">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Informações do usuário */}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.nome}</p>
                <p className="text-xs text-gray-500">
                  {user?.tipo} {isAdmin && '(Admin)'}
                </p>
              </div>
              
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Obras</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.obras}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Subempreiteiros</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.subempreiteiros}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tarefas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.tarefas}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Notificações</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.notificacoes}</p>
                </div>
                <Bell className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de conteúdo */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="obras">Obras</TabsTrigger>
            <TabsTrigger value="subempreiteiros">Subempreiteiros</TabsTrigger>
            <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          </TabsList>

          {/* Tab Obras */}
          <TabsContent value="obras" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Obras</h2>
              <Button 
                onClick={() => obras.create({
                  id: `obra-${Date.now()}`,
                  nome: `Nova Obra ${Date.now()}`,
                  descricao: 'Descrição da obra',
                  responsavel: user?.nome || '',
                  data_inicio: new Date().toISOString().split('T')[0],
                  data_fim_prevista: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  status: 'Em andamento'
                })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Obra
              </Button>
            </div>

            <div className="grid gap-4">
              {obras.data.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma obra encontrada</p>
                    <p className="text-sm text-gray-400">Clique em "Nova Obra" para começar</p>
                  </CardContent>
                </Card>
              ) : (
                obras.data.map((obra) => (
                  <Card key={obra.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{obra.nome}</h3>
                          <p className="text-gray-600 mt-1">{obra.descricao}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>Responsável: {obra.responsavel}</span>
                            <span>Início: {obra.data_inicio}</span>
                            <span>Previsão: {obra.data_fim_prevista}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {obra.status || 'Em andamento'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => obras.remove(obra.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tab Subempreiteiros */}
          <TabsContent value="subempreiteiros" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Subempreiteiros</h2>
              <Button 
                onClick={() => subempreiteiros.create({
                  id: `sub-${Date.now()}`,
                  nome: `Subempreiteiro ${Date.now()}`,
                  especialidade: 'Construção Civil',
                  telefone: '(11) 99999-9999',
                  email: 'contato@exemplo.com',
                  status: 'Ativo'
                })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Subempreiteiro
              </Button>
            </div>

            <div className="grid gap-4">
              {subempreiteiros.data.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum subempreiteiro encontrado</p>
                    <p className="text-sm text-gray-400">Clique em "Novo Subempreiteiro" para começar</p>
                  </CardContent>
                </Card>
              ) : (
                subempreiteiros.data.map((sub) => (
                  <Card key={sub.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{sub.nome}</h3>
                          <p className="text-gray-600 mt-1">{sub.especialidade}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>Tel: {sub.telefone}</span>
                            <span>Email: {sub.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {sub.status || 'Ativo'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => subempreiteiros.remove(sub.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tab Tarefas */}
          <TabsContent value="tarefas" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Tarefas</h2>
              <Button 
                onClick={() => tarefas.create({
                  id: `tarefa-${Date.now()}`,
                  titulo: `Nova Tarefa ${Date.now()}`,
                  descricao: 'Descrição da tarefa',
                  prioridade: 'media',
                  status: 'pendente',
                  data_vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>

            <div className="grid gap-4">
              {tarefas.data.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma tarefa encontrada</p>
                    <p className="text-sm text-gray-400">Clique em "Nova Tarefa" para começar</p>
                  </CardContent>
                </Card>
              ) : (
                tarefas.data.map((tarefa) => (
                  <Card key={tarefa.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{tarefa.titulo}</h3>
                          <p className="text-gray-600 mt-1">{tarefa.descricao}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>Vencimento: {tarefa.data_vencimento}</span>
                            <span>Prioridade: {tarefa.prioridade}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={tarefa.status === 'concluida' ? 'default' : 'outline'}>
                            {tarefa.status || 'Pendente'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => tarefas.update(tarefa.id, { 
                              status: tarefa.status === 'concluida' ? 'pendente' : 'concluida' 
                            })}
                          >
                            <CheckSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => tarefas.remove(tarefa.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tab Notificações */}
          <TabsContent value="notificacoes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Notificações</h2>
              <Button 
                onClick={() => notificacoes.create({
                  id: `notif-${Date.now()}`,
                  titulo: `Notificação ${Date.now()}`,
                  mensagem: 'Nova notificação do sistema',
                  tipo: 'info',
                  lida: false,
                  created_at: new Date().toISOString()
                })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Notificação
              </Button>
            </div>

            <div className="grid gap-4">
              {notificacoes.data.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma notificação encontrada</p>
                    <p className="text-sm text-gray-400">Clique em "Nova Notificação" para começar</p>
                  </CardContent>
                </Card>
              ) : (
                notificacoes.data.map((notif) => (
                  <Card key={notif.id} className={!notif.lida ? 'border-blue-200 bg-blue-50' : ''}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{notif.titulo}</h3>
                          <p className="text-gray-600 mt-1">{notif.mensagem}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>Tipo: {notif.tipo}</span>
                            <span>Data: {new Date(notif.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={!notif.lida ? 'default' : 'outline'}>
                            {notif.lida ? 'Lida' : 'Nova'}
                          </Badge>
                          {!notif.lida && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => notificacoes.update(notif.id, { lida: true })}
                            >
                              Marcar como lida
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => notificacoes.remove(notif.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Componente principal da aplicação com tipagem explícita
export default function Home(): JSX.Element {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return user ? <Dashboard /> : <LoginForm />
}