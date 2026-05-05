'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@/app/hooks/useUser'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import Navbar from '@/app/components/navbar'
import { useTheme } from '@/app/context/Theme.context'

const CATEGORIAS: { [key: string]: { label: string, emoji: string, color: string, bg: string, border: string } } = {
  // Hogar y vida básica
  vivienda:      { label: 'Vivienda',      emoji: '🏠',    color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },   // #60a5fa
  suministros:   { label: 'Suministros',   emoji: '💡',    color: 'text-orange-300',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20' }, // #fdba74
  alimentacion:  { label: 'Alimentación',  emoji: '🛒',    color: 'text-green-400',   bg: 'bg-green-500/10',   border: 'border-green-500/20' },  // #4ade80
  transporte:    { label: 'Transporte',    emoji: '🚗',    color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20' }, // #818cf8
  seguros:       { label: 'Seguros',       emoji: '🛡️',    color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20' },    // #38bdf8
  // Salud y bienestar
  salud:         { label: 'Salud',         emoji: '❤️',    color: 'text-red-500',     bg: 'bg-red-400/10',     border: 'border-red-500/20' },    // #fca5a5
  deporte:       { label: 'Deporte',       emoji: '🏋️',    color: 'text-lime-400',    bg: 'bg-lime-500/10',    border: 'border-lime-500/20' },   // #a3e635
  estetica:      { label: 'Estética',      emoji: '💇🏻‍♂️',    color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/20' },   // #f472b6
  // Ocio y estilo de vida
  ocio:          { label: 'Ocio',          emoji: '🎉',    color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20' }, // #fb923c
  suscripciones: { label: 'Suscripciones', emoji: '📱',    color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20' }, // #a78bfa
  moda:          { label: 'Moda',          emoji: '👚',    color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },   // #fb7185
  mascotas:      { label: 'Mascotas',      emoji: '🐾',    color: 'text-amber-800',  bg: 'bg-amber-800/10',  border: 'border-amber-900/20' },    // #7c2d12
  // Pagos y transferencias
  bizum:         { label: 'Bizum',         emoji: '💸',    color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20' },   // #22d3ee
  ingreso:       { label: 'Ingreso',       emoji: '💰',    color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20' }, // #facc15 — amarillo oro
  // Otros
  otro:          { label: 'Otro',          emoji: '📦',    color: 'text-zinc-400',    bg: 'bg-zinc-500/10',    border: 'border-zinc-500/20' },   // #a1a1aa
}

const ICON_COLORS: { [key: string]: string } = {
  vivienda:      'from-blue-500 to-blue-600',      // #3b82f6 → #2563eb
  suministros:   'from-orange-400 to-orange-500', // #fb923c → #f97316
  alimentacion:  'from-green-500 to-emerald-600',  // #22c55e → #059669
  transporte:    'from-indigo-500 to-indigo-600',  // #6366f1 → #4f46e5
  seguros:       'from-sky-400 to-sky-600',        // #38bdf8 → #0284c7
  salud:         'from-red-400 to-red-500',        // #f87171 → #ef4444
  deporte:       'from-lime-500 to-lime-600',      // #84cc16 → #65a30d
  estetica:      'from-pink-400 to-pink-600',      // #f472b6 → #db2777
  ocio:          'from-orange-400 to-orange-600',  // #fb923c → #ea580c
  suscripciones: 'from-violet-500 to-violet-600',  // #8b5cf6 → #7c3aed
  moda:          'from-rose-400 to-rose-600',      // #fb7185 → #e11d48
  mascotas:      'from-orange-900 to-amber-900',   // #7c2d12 → #78350f
  bizum:         'from-cyan-400 to-cyan-600',      // #22d3ee → #0891b2
  ingreso:       'from-emerald-400 to-emerald-600',// #facc15 → #facc15
  otro:          'from-zinc-500 to-zinc-600',      // #71717a → #52525b
}

interface Expense {
  id: string
  user_id: string
  description: string
  category: string
  date: string
  amount: number
  payment_method: string
  frequency: string
  reminder: string
  status: string
  created_at: string
}

export default function ExpenseTable() {
  const [mounted, setMounted] = useState(false)
  const [expense, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [activeFilter, setActiveFilter] = useState('todos')
  const { user, loading } = useUser()
  const router = useRouter()
  const { theme } = useTheme()

  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [mesFiltro, setMesFiltro] = useState('todos_los_meses')
  const [paginaActual, setPaginaActual] = useState(1)
  const ITEMS_POR_PAGINA = 4

  // ── Modal eliminar ──
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const colors = {
    bg: theme === 'light' ? '#ffffff' : '#000000',
    bgCard: theme === 'light' ? '#f4f4f5' : '#18181b',
    bgInput: theme === 'light' ? '#ffffff' : '#000000',
    text: theme === 'light' ? '#09090b' : '#ffffff',
    textSecondary: theme === 'light' ? '#71717a' : '#a1a1aa',
    border: theme === 'light' ? '#e4e4e7' : '#3f3f46',
    hoverBorder: theme === 'light' ? '#d4d4d8' : '#52525b',
    skeleton: theme === 'light' ? '#e4e4e7' : '#27272a',
  }

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      fetchExpenses()
    }
  }, [user, loading, router])

  useEffect(() => {
    let resultado = expense

    if (busqueda) {
      resultado = resultado.filter(i =>
        i.description.toLowerCase().includes(busqueda.toLowerCase())
      )
    }

    if (categoriaFiltro !== 'todos') {
      resultado = resultado.filter(i => i.category === categoriaFiltro)
    }

    const ahora = new Date()
    if (mesFiltro === 'este_mes') {
      resultado = resultado.filter(i => {
        const fecha = new Date(i.date)
        return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
      })
    } else if (mesFiltro === 'mes_anterior') {
      resultado = resultado.filter(i => {
        const fecha = new Date(i.date)
        const mesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
        return fecha.getMonth() === mesAnterior.getMonth() && fecha.getFullYear() === mesAnterior.getFullYear()
      })
    } else if (mesFiltro === 'este_anio') {
      resultado = resultado.filter(i => {
        return new Date(i.date).getFullYear() === ahora.getFullYear()
      })
    }

    setFilteredExpenses(resultado)
    setPaginaActual(1)
  }, [busqueda, categoriaFiltro, mesFiltro, expense])

  const fetchExpenses = async () => {
    setLoadingData(true)
    const { data, error } = await supabase
      .from('expense')
      .select('*')
      .eq('user_id', user?.id)
      .order('date', { ascending: false })

    if (!error && data) {
      setExpenses(data)
      setFilteredExpenses(data)
    }
    setLoadingData(false)
  }

  // ── MODIFICADO: usa modal en lugar de confirm() ──
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('expense')
      .delete()
      .eq('id', id)

    if (!error) {
      setShowDeleteModal(false)
      setDeletingId(null)
      fetchExpenses()
    }
  }

  const totalPaginas = Math.ceil(filteredExpenses.length / ITEMS_POR_PAGINA)
  const gastosPaginados = filteredExpenses.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  )

  useEffect(() => { setPaginaActual(1) }, [activeFilter])

  const calcularStats = () => {
    const ahora = new Date()
    const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
    const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0)

    const total = expense.reduce((sum, i) => sum + Number(i.amount), 0)

    const gastosMesActual = expense.filter(i => new Date(i.date) >= inicioMesActual)
    const totalMesActual = gastosMesActual.reduce((sum, i) => sum + Number(i.amount), 0)

    const gastosMesAnterior = expense.filter(i => {
      const fecha = new Date(i.date)
      return fecha >= inicioMesAnterior && fecha <= finMesAnterior
    })
    const totalMesAnterior = gastosMesAnterior.reduce((sum, i) => sum + Number(i.amount), 0)

    let porcentaje = 0
    if (totalMesAnterior > 0) {
      porcentaje = ((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100
    }

    const promedio = expense.length > 0 ? total / expense.length : 0

    return { total, totalMesActual, transaccionesMes: gastosMesActual.length, promedio, porcentaje }
  }

  const stats = calcularStats()

  const formatEuro = (num: number) => new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(num)

  const formatFecha = (fecha: string) => new Date(fecha).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short'
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300"
           style={{ backgroundColor: colors.bg }}>
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p style={{ color: colors.textSecondary }}>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex transition-colors duration-300" style={{ backgroundColor: colors.bg }}>

      <Navbar />

      <main className="flex-1 ml-20 lg:ml-64 overflow-hidden">
        <div className="p-3 md:p-6">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold mb-2" style={{ color: colors.text }}>
                    Gastos
                  </h1>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    {mounted && new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                  </p>
                </div>

                <button
                  onClick={() => router.push('/expense/add')}
                  className="flex items-center gap-2 px-5 py-3 rounded-full font-semibold hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
                  style={{
                    backgroundColor: theme === 'light' ? '#000000' : '#ffffff',
                    color: theme === 'light' ? '#ffffff' : '#000000'
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Añadir</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="rounded-3xl p-6 border transition-colors"
                     style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                  <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>Total</p>
                  <p className="text-4xl font-bold mb-2" style={{ color: colors.text }}>
                    {formatEuro(stats.total)}
                  </p>
                  <div className="flex items-center gap-1 text-xs">
                    <span className={stats.porcentaje >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {stats.porcentaje >= 0 ? '+' : ''}{stats.porcentaje.toFixed(1)}%
                    </span>
                    <span style={{ color: colors.textSecondary }}>vs. mes anterior</span>
                  </div>
                </div>

                <div className="rounded-3xl p-6 border transition-colors"
                     style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                  <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>Este mes</p>
                  <p className="text-4xl font-bold mb-2" style={{ color: colors.text }}>
                    {formatEuro(stats.totalMesActual)}
                  </p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    {stats.transaccionesMes} transacciones
                  </p>
                </div>

                <div className="rounded-3xl p-6 border transition-colors"
                     style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                  <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>Promedio</p>
                  <p className="text-4xl font-bold mb-2" style={{ color: colors.text }}>
                    {formatEuro(stats.promedio)}
                  </p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Por gasto</p>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5" style={{ color: colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar gastos..."
                  className="w-full pl-11 pr-4 py-3 border rounded-2xl placeholder-gray-500 focus:outline-none transition-colors"
                  style={{ backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.text }}
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
                    style={{ color: colors.textSecondary }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="relative">
                <select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                  className="w-full sm:w-52 px-4 py-3 border rounded-2xl focus:outline-none transition-colors appearance-none cursor-pointer pr-10"
                  style={{ backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.text }}
                >
                  <option value="todos" style={{ backgroundColor: colors.bgCard }}>Todas las categorías</option>
                  {Object.entries(CATEGORIAS).map(([key, cat]) => (
                    <option key={key} value={key} style={{ backgroundColor: colors.bgCard }}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5" style={{ color: colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select
                  value={mesFiltro}
                  onChange={(e) => setMesFiltro(e.target.value)}
                  className="w-full sm:w-44 px-4 py-3 border rounded-2xl focus:outline-none transition-colors appearance-none cursor-pointer pr-10"
                  style={{ backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.text }}
                >
                  <option value="este_mes" style={{ backgroundColor: colors.bgCard }}>Este mes</option>
                  <option value="mes_anterior" style={{ backgroundColor: colors.bgCard }}>Mes anterior</option>
                  <option value="este_anio" style={{ backgroundColor: colors.bgCard }}>Este año</option>
                  <option value="todos_los_meses" style={{ backgroundColor: colors.bgCard }}>Todos</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5" style={{ color: colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Lista de gastos */}
            <div className="space-y-3">
              {loadingData ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-3xl p-5 border animate-pulse"
                       style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex-shrink-0"
                           style={{ backgroundColor: colors.skeleton }} />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 rounded w-1/3" style={{ backgroundColor: colors.skeleton }} />
                        <div className="h-3 rounded w-1/4" style={{ backgroundColor: colors.skeleton }} />
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredExpenses.length === 0 ? (
                <div className="rounded-3xl p-12 border text-center transition-colors"
                     style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                  <p className="text-4xl mb-4">💸</p>
                  <p className="font-semibold text-lg mb-2" style={{ color: colors.text }}>
                    {activeFilter === 'todos' ? 'No tienes gastos aún' : 'No hay gastos en esta categoría'}
                  </p>
                  <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
                    {activeFilter === 'todos' ? 'Añade tu primer gasto para empezar' : 'Prueba con otro filtro'}
                  </p>
                  {activeFilter === 'todos' && (
                    <button
                      onClick={() => router.push('/expense/add')}
                      className="px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-transform"
                      style={{
                        backgroundColor: theme === 'light' ? '#000000' : '#ffffff',
                        color: theme === 'light' ? '#ffffff' : '#000000'
                      }}
                    >
                      Añadir gasto
                    </button>
                  )}
                </div>
              ) : (
                gastosPaginados.map((expense) => {
                  const cat = CATEGORIAS[expense.category] || CATEGORIAS['otro']
                  const iconColor = ICON_COLORS[expense.category] || ICON_COLORS['otro']

                  return (
                    <div key={expense.id}
                      className="relative rounded-3xl p-4 border transition-all duration-200 group"
                      style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${iconColor} flex items-center justify-center flex-shrink-0 text-xl`}>
                          {cat.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-base md:text-lg line-clamp-1 max-w-[50%]" style={{ color: colors.text }}>
                              {expense.description}
                            </h3>
                            <p className="font-bold text-base md:text-xl ml-2 md:ml-4 flex-shrink-0" style={{ color: colors.text }}>
                              {formatEuro(expense.amount)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between flex-wrap gap-1 md:gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${cat.bg} ${cat.color} border ${cat.border}`}>
                                {cat.label}
                              </span>
                            </div>
                            <span className="text-xs md:text-sm" style={{ color: colors.textSecondary }}>
                              {formatFecha(expense.date)}
                            </span>
                          </div>
                        </div>

                        {/* Botones — MODIFICADO: eliminar abre modal */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => router.push(`/expense/edit/${expense.id}`)}
                              className="w-8 h-7 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer"
                              style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
                              title="Editar"
                            >
                              <svg className="w-4 h-4" style={{ color: colors.textSecondary }}
                                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => { setDeletingId(expense.id); setShowDeleteModal(true) }}
                              className="w-8 h-7 rounded-xl border hover:bg-red-500/10 hover:border-red-900 transition-all duration-200 flex items-center justify-center cursor-pointer"
                              style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4 text-gray-400 hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex flex-col items-center gap-3 mt-8 pb-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    className="w-10 h-10 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ backgroundColor: colors.bgCard, color: colors.textSecondary }}
                  >
                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                    <button
                      key={pagina}
                      onClick={() => setPaginaActual(pagina)}
                      className="w-10 h-10 rounded-full font-semibold transition-colors"
                      style={{
                        backgroundColor: paginaActual === pagina
                          ? (theme === 'light' ? '#000000' : '#ffffff')
                          : colors.bgCard,
                        color: paginaActual === pagina
                          ? (theme === 'light' ? '#ffffff' : '#000000')
                          : colors.text
                      }}
                    >
                      {pagina}
                    </button>
                  ))}

                  <button
                    onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                    disabled={paginaActual === totalPaginas}
                    className="w-10 h-10 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ backgroundColor: colors.bgCard, color: colors.textSecondary }}
                  >
                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Mostrando {((paginaActual - 1) * ITEMS_POR_PAGINA) + 1} - {Math.min(paginaActual * ITEMS_POR_PAGINA, filteredExpenses.length)} de {filteredExpenses.length} gastos
                </p>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* ── Modal confirmar eliminar ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6 border"
               style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
              Eliminar gasto
            </h2>
            <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
              ¿Seguro que quieres eliminar este gasto? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletingId(null) }}
                className="flex-1 py-3 rounded-2xl font-semibold cursor-pointer text-sm"
                style={{ backgroundColor: colors.bgCard, color: colors.text }}
              >
                Cancelar
              </button>
              <button
                onClick={() => deletingId && handleDelete(deletingId)}
                className="flex-1 py-3 rounded-2xl font-semibold cursor-pointer text-sm bg-red-500/10 border border-red-500/20 text-red-400"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}