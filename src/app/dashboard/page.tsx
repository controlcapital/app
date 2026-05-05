'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@/app/hooks/useUser'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import Navbar from '@/app/components/navbar'
import { useTheme } from '@/app/context/Theme.context'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const CATEGORIA_COLORES: { [key: string]: string } = {
  vivienda:      '#3b82f6',
  suministros:   '#fb923c',
  alimentacion:  '#22c55e',
  transporte:    '#64748b',
  seguros:       '#38bdf8',
  
  salud:         '#ef4444',
  deporte:       '#84cc16',
  estetica:      '#f472b6',
  
  ocio:          '#fb923c',
  
  suscripciones: '#8b5cf6',
  moda:          '#fb7185',
  mascotas:      '#7c2d12',

  bizum:         '#22d3ee',
  ingreso:       '#facc15',
  
  otro:          '#71717a',
}

const CATEGORIA_LABELS: { [key: string]: string } = {
  vivienda:      '🏠 Vivienda',
  suministros:   '💡 Suministros',
  alimentacion:  '🛒 Alimentación',
  transporte:    '🚗 Transporte',
  seguros:       '🛡️ Seguros',
  
  salud:         '❤️ Salud',
  deporte:       '🏋️ Deporte',
  estetica:      '💇🏻‍♂️ Estética',
  
  ocio:          '🎉 Ocio',
  suscripciones: '📱 Suscripciones',
  moda:          '👚 Moda',
  mascotas:      '🐾 Mascotas',

  bizum:         '💸 Bizum',
  ingreso:       '💰 Ingreso',

  otro:          '📦 Otro',
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function DashboardPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [incomes, setIncomes] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/login')
    } else {
      fetchData()
    }
  }, [user, loading])

  const fetchData = async () => {
    setLoadingData(true)

    const [{ data: incomesData }, { data: expensesData }] = await Promise.all([
      supabase.from('income').select('*').eq('user_id', user?.id),
      supabase.from('expense').select('*').eq('user_id', user?.id),
    ])

    setIncomes(incomesData || [])
    setExpenses(expensesData || [])
    setLoadingData(false)
  }

  const formatEuro = (num: number) => new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(num)

  const totalIngresos = incomes.reduce((sum, i) => sum + Number(i.amount), 0)
  const totalGastos = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const balance = totalIngresos - totalGastos
  const porcentajeAhorro = totalIngresos > 0 ? ((balance / totalIngresos) * 100).toFixed(2) : '0'

  const gastosPendientes = expenses.filter(e => e.status === 'pendiente')

  const datosEvolucion = () => {
    const ahora = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - (5 - i), 1)
      const mes = fecha.getMonth()
      const anio = fecha.getFullYear()

      const ingresosMes = incomes
        .filter(item => {
          const d = new Date(item.date)
          return d.getMonth() === mes && d.getFullYear() === anio
        })
        .reduce((sum, item) => sum + Number(item.amount), 0)

      const gastosMes = expenses
        .filter(item => {
          const d = new Date(item.date)
          return d.getMonth() === mes && d.getFullYear() === anio
        })
        .reduce((sum, item) => sum + Number(item.amount), 0)

      return {
        mes: MESES[mes],
        ingresos: ingresosMes,
        gastos: gastosMes,
      }
    })
  }

  const datosCategorias = () => {
    const agrupado: { [key: string]: number } = {}
    expenses.forEach(e => {
      agrupado[e.category] = (agrupado[e.category] || 0) + Number(e.amount)
    })
    return Object.entries(agrupado)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }

  const getSaludo = () => {
    const hora = new Date().getHours()
    if (hora < 13) return 'Buenos días'
    if (hora < 20) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const nombre = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario'

  // Colores dinámicos
  const colors = {
    bg: theme === 'light' ? '#ffffff' : '#000000',
    bgCard: theme === 'light' ? '#f4f4f5' : '#18181b',
    text: theme === 'light' ? '#09090b' : '#ffffff',
    textSecondary: theme === 'light' ? '#71717a' : '#a1a1aa',
    border: theme === 'light' ? '#e4e4e7' : '#3f3f46',
    grid: theme === 'light' ? '#e4e4e7' : '#27272a',
  }

  if (loading || loadingData) {
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

  const evolucion = datosEvolucion()
  const categorias = datosCategorias()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl p-4 shadow-xl border transition-colors"
             style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
          <p className="font-semibold mb-2" style={{ color: colors.text }}>{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }} className="text-sm">
              {entry.name === 'ingresos' ? '↑ Ingresos' : '↓ Gastos'}: {formatEuro(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const total = categorias.reduce((sum, c) => sum + c.value, 0)
      const porcentaje = ((payload[0].value / total) * 100).toFixed(1)
      return (
        <div className="rounded-2xl p-3 shadow-xl border"
             style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
          <p className="font-semibold" style={{ color: colors.text }}>
            {CATEGORIA_LABELS[payload[0].name] || payload[0].name}
          </p>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {formatEuro(payload[0].value)} ({porcentaje}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    
    <div className="min-h-screen flex transition-colors duration-300" style={{ backgroundColor: colors.bg }}>

      <Navbar />

      <main className="flex-1 ml-20 lg:ml-64 overflow-hidden">
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">

            {/* Saludo + Fecha */}
            <div className="mb-8">
              <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                {mounted && new Date().toLocaleDateString('es-ES', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
              <h1 className="text-2xl md:text-4xl font-bold" style={{ color: colors.text }}>
                {getSaludo()}, {nombre} 👋
              </h1>
            </div>

            {/* Stats principales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

              {/* Ingresos totales */}
              <div className="rounded-3xl p-6 border transition-colors"
                   style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Ingresos</p>
                </div>
                <p className="text-2xl lg:text-3xl font-bold" style={{ color: colors.text }}>
                  {formatEuro(totalIngresos)}
                </p>
                <p className="text-xs text-green-400 mt-1">Total acumulado</p>
              </div>

              {/* Gastos totales */}
              <div className="rounded-3xl p-6 border transition-colors"
                   style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  </div>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Gastos</p>
                </div>
                <p className="text-2xl lg:text-3xl font-bold" style={{ color: colors.text }}>
                  {formatEuro(totalGastos)}
                </p>
                <p className="text-xs text-red-400 mt-1">Total acumulado</p>
              </div>

              {/* Balance */}
              <div className="rounded-3xl p-6 border transition-colors"
                   style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${balance >= 0 ? 'bg-violet-500/10' : 'bg-red-500/10'}`}>
                    <svg className={`w-4 h-4 ${balance >= 0 ? 'text-violet-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Balance</p>
                </div>
                <p className={`text-2xl lg:text-3xl font-bold ${balance >= 0 ? '' : 'text-red-400'}`}
                   style={{ color: balance >= 0 ? colors.text : undefined }}>
                  {formatEuro(balance)}
                </p>
                <p className={`text-xs mt-1 ${balance >= 0 ? 'text-violet-400' : 'text-red-400'}`}>
                  {balance >= 0 ? 'Positivo ✓' : 'Negativo ✗'}
                </p>
              </div>

              {/* % Ahorro */}
              <div className="rounded-3xl p-6 border transition-colors"
                   style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>% Ahorro</p>
                </div>
                <p className="text-2xl lg:text-3xl font-bold" style={{ color: colors.text }}>
                  {porcentajeAhorro}%
                </p>
                <div className="mt-2 w-full rounded-full h-1.5"
                     style={{ backgroundColor: theme === 'light' ? '#e4e4e7' : '#27272a' }}>
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(Math.max(Number(porcentajeAhorro), 0), 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Gráfica evolución mensual */}
            <div className="rounded-3xl p-6 border mb-6 transition-colors"
                 style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                    Evolución mensual
                  </h2>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    Últimos 6 meses
                  </p>
                </div>
                <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500" />
                    <span style={{ color: colors.textSecondary }}>Ingresos</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500" />
                    <span style={{ color: colors.textSecondary }}>Gastos</span>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={evolucion} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                  <XAxis dataKey="mes" stroke={colors.textSecondary} tick={{ fill: colors.textSecondary, fontSize: 12 }} tickMargin={15}/>
                  <YAxis stroke={colors.textSecondary} tick={{ fill: colors.textSecondary, fontSize: 12 }} tickFormatter={(v) => `${v}€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="ingresos" stroke="#22c55e" strokeWidth={2} fill="url(#colorIngresos)" />
                  <Area type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} fill="url(#colorGastos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfica categorías + Gastos pendientes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* Gráfica categorías */}
              <div className="rounded-3xl p-6 border transition-colors"
                   style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                <h2 className="text-xl font-bold mb-1" style={{ color: colors.text }}>
                  Gastos por categoría
                </h2>
                <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
                  Distribución del gasto total
                </p>

                {categorias.length === 0 ? (
                  <div className="flex items-center justify-center h-48" style={{ color: colors.textSecondary }}>
                    <p>No hay gastos registrados</p>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={categorias}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categorias.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={CATEGORIA_COLORES[entry.name] || '#6b7280'}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-2 mt-2">
                      {categorias.map((cat) => {
                        const total = categorias.reduce((sum, c) => sum + c.value, 0)
                        const porcentaje = ((cat.value / total) * 100).toFixed(1)
                        return (
                          <div key={cat.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: CATEGORIA_COLORES[cat.name] || '#6b7280' }}
                              />
                              <span className="text-sm" style={{ color: colors.text }}>
                                {CATEGORIA_LABELS[cat.name] || cat.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm" style={{ color: colors.textSecondary }}>
                                {porcentaje}%
                              </span>
                              <span className="text-sm font-medium" style={{ color: colors.text }}>
                                {formatEuro(cat.value)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Gastos pendientes */}
              <div className="rounded-3xl p-6 border transition-colors"
                   style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                      Gastos pendientes
                    </h2>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      {gastosPendientes.length} pendientes de pago
                    </p>
                  </div>
                  {gastosPendientes.length > 0 && (
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-medium">
                      ⚠️ {gastosPendientes.length}
                    </span>
                  )}
                </div>

                {gastosPendientes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <p className="text-4xl mb-3">✅</p>
                    <p className="font-semibold" style={{ color: colors.text }}>Todo al día</p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      No tienes gastos pendientes
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-80">
                    {gastosPendientes.map((gasto) => {
                      const fechaGasto = new Date(gasto.date)
                      const hoy = new Date()
                      hoy.setHours(0, 0, 0, 0)
                      fechaGasto.setHours(0, 0, 0, 0)
                      const vencido = fechaGasto < hoy

                      return (
                        <div
                          key={gasto.id}
                          onClick={() => router.push(`/expense/edit/${gasto.id}`)}
                          className="flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 group"
                          style={{ 
                            backgroundColor: colors.bg, 
                            borderColor: colors.border 
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${vencido ? 'bg-red-500' : 'bg-yellow-500'}`} />
                            <div>
                              <p className="text-sm font-medium" style={{ color: colors.text }}>
                                {gasto.description}
                              </p>
                              <p className="text-xs" style={{ color: colors.textSecondary }}>
                                {new Date(gasto.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                {' · '}
                                <span className={vencido ? 'text-red-400' : 'text-yellow-400'}>
                                  {vencido ? 'Revisar pago' : 'Próximamente'}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm" style={{ color: colors.text }}>
                              {formatEuro(Number(gasto.amount))}
                            </p>
                            <svg className="w-4 h-4 transition-colors" 
                                 style={{ color: colors.textSecondary }}
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}