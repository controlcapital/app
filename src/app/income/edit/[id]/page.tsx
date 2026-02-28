'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { useUser } from '@/app/hooks/useUser'
import Navbar from '@/app/components/navbar'
import { useTheme } from '@/app/context/Theme.context'

const CATEGORIAS = [
  { value: 'nomina',      label: 'Nómina',                 emoji: '💼' },
  { value: 'freelance',   label: 'Freelance',              emoji: '💻' },
  { value: 'ventas',      label: 'Ventas',                 emoji: '🛍️' },
  { value: 'dividendos',  label: 'Dividendos/Inversiones', emoji: '📈' },
  { value: 'alquiler',    label: 'Alquiler',               emoji: '🏠' },
  { value: 'regalo',      label: 'Regalo',                 emoji: '🎁' },
  { value: 'reembolso',   label: 'Reembolso',              emoji: '↩️' },
  { value: 'pension',     label: 'Pensión/Subsidio',       emoji: '🏛️' },
  { value: 'otro',        label: 'Otro',                   emoji: '📦' },
]

export default function EditIncomePage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading } = useUser()
  const { theme } = useTheme()
  const id = params.id as string

  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria]     = useState('')
  const [importe, setImporte]         = useState('')
  const [fecha, setFecha]             = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving]           = useState(false)
  const [message, setMessage]         = useState<{ type: 'error' | 'success', text: string } | null>(null)

  // Colores dinámicos
  const colors = {
    bg: theme === 'light' ? '#ffffff' : '#000000',
    bgCard: theme === 'light' ? '#f4f4f5' : '#18181b',
    bgInput: theme === 'light' ? '#ffffff' : '#000000',
    text: theme === 'light' ? '#09090b' : '#ffffff',
    textSecondary: theme === 'light' ? '#71717a' : '#a1a1aa',
    border: theme === 'light' ? '#e4e4e7' : '#3f3f46',
    buttonSecondary: theme === 'light' ? '#e4e4e7' : '#27272a',
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user && id) {
      fetchIncome()
    }
  }, [user, loading, id])

  const fetchIncome = async () => {
    setLoadingData(true)

    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('id', id)
      .eq('user_id', user?.id)
      .single()

    if (error || !data) {
      router.push('/income')
      return
    }

    setDescripcion(data.description || '')
    setCategoria(data.category || '')
    setImporte(data.amount?.toString() || '')
    setFecha(data.date ? data.date.split('T')[0] : '')

    setLoadingData(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('income')
        .update({
          description: descripcion,
          category:    categoria,
          amount:      parseFloat(importe),
          date:        fecha,
          updated_at:  new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error

      setMessage({ type: 'success', text: '✅ Ingreso actualizado correctamente' })
      setTimeout(() => router.push('/income'), 1000)
    } catch (error: any) {
      setMessage({ type: 'error', text: `Error: ${error.message}` })
    } finally {
      setSaving(false)
    }
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

  return (
    <div className="min-h-screen flex transition-colors duration-300" style={{ backgroundColor: colors.bg }}>

      <Navbar />

      <main className="flex-1 ml-20 lg:ml-64">
        <div className="p-4 md:p-6">
          <div className="max-w-2xl mx-auto pt-10">

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors cursor-pointer"
                style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
              >
                <svg className="w-5 h-5" style={{ color: colors.text }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-4xl font-bold" style={{ color: colors.text }}>
                  Editar ingreso
                </h1>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  Modifica los datos del ingreso
                </p>
              </div>
            </div>

            {/* Mensaje error/éxito */}
            {message && (
              <div className={`mb-6 p-4 rounded-2xl border text-center ${
                message.type === 'error'
                  ? 'bg-red-950/50 border-red-900 text-red-200'
                  : 'bg-green-500/10 border-green-500 text-green-400'
              }`}>
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <div className="rounded-3xl p-6 md:p-8 border transition-colors"
                 style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Ej: Salario mensual, Proyecto freelance..."
                    required
                    className="w-full px-4 py-3.5 border rounded-2xl placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                    style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                  />
                </div>

                {/* Importe */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Importe
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-lg font-semibold"
                          style={{ color: colors.textSecondary }}>
                      €
                    </span>
                    <input
                      type="number"
                      value={importe}
                      onChange={(e) => setImporte(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                      className="w-full pl-10 pr-4 py-3.5 border rounded-2xl text-lg font-semibold placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                      style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                    />
                  </div>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Categoría
                  </label>
                  <div className="relative">
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 border rounded-2xl focus:outline-none focus:border-violet-500 transition-colors appearance-none cursor-pointer"
                      style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                    >
                      <option value="" disabled>Selecciona una categoría</option>
                      {CATEGORIAS.map((cat) => (
                        <option key={cat.value} value={cat.value} style={{ backgroundColor: colors.bgCard }}>
                          {cat.emoji} {cat.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5" style={{ color: colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Fecha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5" style={{ color: colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 border rounded-2xl focus:outline-none focus:border-violet-500 transition-colors"
                      style={{ 
                        backgroundColor: colors.bgInput, 
                        borderColor: colors.border, 
                        color: colors.text,
                        colorScheme: theme === 'light' ? 'light' : 'dark'
                      }}
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 py-4 rounded-2xl font-semibold transition-colors cursor-pointer"
                    style={{ backgroundColor: colors.buttonSecondary, color: colors.text }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    style={{
                      backgroundColor: theme === 'light' ? '#000000' : '#ffffff',
                      color: theme === 'light' ? '#ffffff' : '#000000'
                    }}
                  >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}