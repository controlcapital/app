'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@/app/hooks/useUser'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import Navbar from '@/app/components/navbar'
import { useTheme } from '@/app/context/Theme.context'

const EMOJIS = ['🎯', '✈️', '🏠', '🚗', '💍', '🎓', '💻', '🏖️', '🎸', '👶', '🐶', '💪', '🛍️', '📱', '🏋️']

interface Saving {
  id: string
  user_id: string
  name: string
  emoji: string
  target_amount: number
  current_amount: number
  start_date: string
  deadline: string
  completed: boolean
  created_at: string
}

export default function savingPage() {
  const [mounted, setMounted] = useState(false)
  const [saving, setsaving] = useState<Saving[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [balance, setBalance] = useState(0)
  const { user, loading } = useUser()
  const router = useRouter()
  const { theme } = useTheme()

  // Modal nueva meta
  const [showNewModal, setShowNewModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🎯')
  const [newTarget, setNewTarget] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [savingNew, setSavingNew] = useState(false)

  // Modal aportación
  const [showContribModal, setShowContribModal] = useState(false)
  const [selectedSaving, setSelectedSaving] = useState<Saving | null>(null)
  const [contribAmount, setContribAmount] = useState('')
  const [savingContrib, setSavingContrib] = useState(false)

  // Modal eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // estados para editar
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSaving, setEditingSaving] = useState<Saving | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('🎯')
  const [editTarget, setEditTarget] = useState('')
  const [editDeadline, setEditDeadline] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  //estados para retirar

  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [savingWithdraw, setSavingWithdraw] = useState(false)

  const colors = {
    bg: theme === 'light' ? '#ffffff' : '#000000',
    bgCard: theme === 'light' ? '#f4f4f5' : '#18181b',
    bgInput: theme === 'light' ? '#ffffff' : '#000000',
    text: theme === 'light' ? '#09090b' : '#ffffff',
    textSecondary: theme === 'light' ? '#71717a' : '#a1a1aa',
    border: theme === 'light' ? '#e4e4e7' : '#3f3f46',
    skeleton: theme === 'light' ? '#e4e4e7' : '#27272a',
    buttonSecondary: theme === 'light' ? '#f4f4f5' : '#27272a',
  }

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      fetchData()
    }
  }, [user, loading, router])

  const fetchData = async () => {
    setLoadingData(true)

    const [
      { data: savingData },
      { data: incomesData },
      { data: expensesData },
      { data: contribsData },
    ] = await Promise.all([
      supabase.from('saving').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
      supabase.from('income').select('amount').eq('user_id', user?.id),
      supabase.from('expense').select('amount').eq('user_id', user?.id),
      supabase.from('saving_contribution').select('amount').eq('user_id', user?.id),
    ])

    const totalIngresos = (incomesData || []).reduce((sum, i) => sum + Number(i.amount), 0)
    const totalGastos = (expensesData || []).reduce((sum, e) => sum + Number(e.amount), 0)
    const totalAportado = (contribsData || []).reduce((sum, c) => sum + Number(c.amount), 0)
    setBalance(totalIngresos - totalGastos - totalAportado)
    setsaving(savingData || [])
    setLoadingData(false)
  }

  const handleCreateSaving = async () => {
    if (!newName || !newTarget || !user?.id) return
    setSavingNew(true)

    const { data, error } = await supabase.from('saving').insert([{
        user_id: user.id,
        name: newName,
        emoji: newEmoji,
        target_amount: Number(newTarget),
        current_amount: 0,
        start_date: new Date().toISOString(),
        deadline: newDeadline || null,
        completed: false,
    }]).select()

    console.log('data:', data)
    console.log('error:', error)

    if (!error) {
        setShowNewModal(false)
        setNewName('')
        setNewEmoji('🎯')
        setNewTarget('')
        setNewDeadline('')
        fetchData()
    }
    setSavingNew(false)
    }
    
    const handleEdit = async () => {
      if (!editingSaving || !editName || !editTarget) return
      setSavingEdit(true)

      const { error } = await supabase.from('saving').update({
        name: editName,
        emoji: editEmoji,
        target_amount: Number(editTarget),
        deadline: editDeadline || null,
        updated_at: new Date().toISOString(),
      }).eq('id', editingSaving.id)

      if (!error) {
        setShowEditModal(false)
        setEditingSaving(null)
        fetchData()
      }
      setSavingEdit(false)
    }

  const handleContribution = async () => {
    if (!selectedSaving || !contribAmount) return
    const amount = Number(contribAmount)
    if (amount <= 0) return
    if (amount > balance) return alert('No tienes suficiente balance disponible')

    setSavingContrib(true)

    const newAmount = selectedSaving.current_amount + amount
    const completed = newAmount >= selectedSaving.target_amount

    const [{ error: contribError }, { error: savingError }] = await Promise.all([
      supabase.from('saving_contribution').insert([{
        saving_id: selectedSaving.id,
        user_id: user?.id,
        amount,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }]),
      supabase.from('saving').update({
        current_amount: newAmount,
        completed,
        updated_at: new Date().toISOString(),
      }).eq('id', selectedSaving.id),
    ])

    if (!contribError && !savingError) {
      setShowContribModal(false)
      setContribAmount('')
      setSelectedSaving(null)
      fetchData()
    }
    setSavingContrib(false)
  }

  const handleWithdraw = async () => {
    if (!selectedSaving || !withdrawAmount) return
    const amount = Number(withdrawAmount)
    if (amount <= 0) return
    if (amount > selectedSaving.current_amount) return alert('No puedes retirar más de lo aportado')

    setSavingWithdraw(true)

    const newAmount = selectedSaving.current_amount - amount
    const completed = newAmount >= selectedSaving.target_amount

    const [{ error: contribError }, { error: savingError }] = await Promise.all([
      supabase.from('saving_contribution').insert([{
        saving_id: selectedSaving.id,
        user_id: user?.id,
        amount: -amount,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }]),
      supabase.from('saving').update({
        current_amount: newAmount,
        completed,
        updated_at: new Date().toISOString(),
      }).eq('id', selectedSaving.id),
    ])

    if (!contribError && !savingError) {
      setShowWithdrawModal(false)
      setWithdrawAmount('')
      setSelectedSaving(null)
      fetchData()
    }
    setSavingWithdraw(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('saving').delete().eq('id', id)
    if (!error) {
      setShowDeleteModal(false)
      setDeletingId(null)
      fetchData()
    }
  }

  const formatEuro = (num: number) => new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(num)

  const formatFecha = (fecha: string) => new Date(fecha).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  const activesaving = saving.filter(s => !s.completed)
  const completedsaving = saving.filter(s => s.completed)
  const totalAhorrado = saving.reduce((sum, s) => sum + Number(s.current_amount), 0)
  const totalObjetivo = saving.reduce((sum, s) => sum + Number(s.target_amount), 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300"
           style={{ backgroundColor: colors.bg }}>
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
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
                    Ahorro
                  </h1>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    {mounted && new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                  </p>
                </div>

                <button
                  onClick={() => setShowNewModal(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-full font-semibold hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
                  style={{
                    backgroundColor: theme === 'light' ? '#000000' : '#ffffff',
                    color: theme === 'light' ? '#ffffff' : '#000000'
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Nueva meta</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="rounded-3xl p-6 border transition-colors"
                     style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                  <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>Balance disponible</p>
                  <p className="text-4xl font-bold mb-2" style={{ color: balance >= 0 ? colors.text : '#ef4444' }}>
                    {formatEuro(balance)}
                  </p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Para asignar a metas</p>
                </div>

                <div className="rounded-3xl p-6 border transition-colors"
                     style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                  <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>Total ahorrado</p>
                  <p className="text-4xl font-bold mb-2" style={{ color: colors.text }}>
                    {formatEuro(totalAhorrado)}
                  </p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    de {formatEuro(totalObjetivo)} en objetivos
                  </p>
                </div>

                <div className="rounded-3xl p-6 border transition-colors"
                     style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                  <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>Metas activas</p>
                  <p className="text-4xl font-bold mb-2" style={{ color: colors.text }}>
                    {activesaving.length}
                  </p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    {completedsaving.length} completadas
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de metas */}
            {loadingData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-3xl p-6 border animate-pulse"
                       style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl flex-shrink-0" style={{ backgroundColor: colors.skeleton }} />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 rounded w-1/2" style={{ backgroundColor: colors.skeleton }} />
                        <div className="h-3 rounded w-1/3" style={{ backgroundColor: colors.skeleton }} />
                      </div>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: colors.skeleton }} />
                  </div>
                ))}
              </div>
            ) : saving.length === 0 ? (
              <div className="rounded-3xl p-12 border text-center transition-colors"
                   style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                <p className="text-4xl mb-4">🎯</p>
                <p className="font-semibold text-lg mb-2" style={{ color: colors.text }}>
                  No tienes metas de ahorro
                </p>
                <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
                  Crea tu primera meta y empieza a ahorrar
                </p>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-transform cursor-pointer"
                  style={{
                    backgroundColor: theme === 'light' ? '#000000' : '#ffffff',
                    color: theme === 'light' ? '#ffffff' : '#000000'
                  }}
                >
                  Crear meta
                </button>
              </div>
            ) : (
              <>
                {/* Metas activas */}
                {activesaving.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4" style={{ color: colors.text }}>
                      Metas activas
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activesaving.map((saving) => {
                        const porcentaje = Math.min((saving.current_amount / saving.target_amount) * 100, 100)
                        const restante = saving.target_amount - saving.current_amount

                        return (
                          <div key={saving.id}
                               className="rounded-3xl p-6 border transition-all duration-200"
                               style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>

                            {/* Header card */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
                                  {saving.emoji}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-bold text-base line-clamp-1" style={{ color: colors.text }}>
                                    {saving.name}
                                  </h3>
                                  {saving.deadline && (
                                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                                      Hasta {formatFecha(saving.deadline)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Botones editar/eliminar */}
                              <div className="flex gap-2 flex-shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingSaving(saving)
                                    setEditName(saving.name)
                                    setEditEmoji(saving.emoji)
                                    setEditTarget(String(saving.target_amount))
                                    setEditDeadline(saving.deadline ? saving.deadline.split('T')[0] : '')
                                    setShowEditModal(true)
                                  }}
                                  className="w-8 h-7 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer hover:border-blue-500"
                                  style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                                  title="Editar"
                                >
                                  <svg className="w-4 h-4" style={{ color: colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => { setDeletingId(saving.id); setShowDeleteModal(true) }}
                                  className="w-8 h-7 rounded-xl border hover:bg-red-500/10 hover:border-red-500 transition-all duration-200 flex items-center justify-center cursor-pointer"
                                  style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                                  title="Eliminar"
                                >
                                  <svg className="w-4 h-4 text-gray-400 hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Importes */}
                            <div className="flex items-end justify-between mb-3">
                              <div>
                                <p className="text-2xl font-bold" style={{ color: colors.text }}>
                                  {formatEuro(saving.current_amount)}
                                </p>
                                <p className="text-xs" style={{ color: colors.textSecondary }}>
                                  de {formatEuro(saving.target_amount)}
                                </p>
                              </div>
                              <p className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
                                {porcentaje.toFixed(0)}%
                              </p>
                            </div>

                            {/* Barra progreso */}
                            <div className="h-2 rounded-full mb-4 overflow-hidden"
                                 style={{ backgroundColor: theme === 'light' ? '#e4e4e7' : '#27272a' }}>
                              <div
                                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-purple-600"
                                style={{ width: `${porcentaje}%` }}
                              />
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                              <p className="text-xs" style={{ color: colors.textSecondary }}>
                                Faltan {formatEuro(restante)}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { setSelectedSaving(saving); setShowWithdrawModal(true) }}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm hover:scale-105 transition-transform cursor-pointer"
                                  style={{ backgroundColor: colors.buttonSecondary, color: colors.text }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                  </svg>
                                  Retirar
                                </button>
                                <button
                                  onClick={() => { setSelectedSaving(saving); setShowContribModal(true) }}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm hover:scale-105 transition-transform cursor-pointer"
                                  style={{
                                    backgroundColor: theme === 'light' ? '#000000' : '#ffffff',
                                    color: theme === 'light' ? '#ffffff' : '#000000'
                                  }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                  </svg>
                                  Aportar
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Metas completadas */}
                {completedsaving.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold mb-4" style={{ color: colors.text }}>
                      Metas completadas 🎉
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {completedsaving.map((saving) => (
                        <div key={saving.id}
                             className="rounded-3xl p-6 border transition-all duration-200 opacity-75"
                             style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl flex-shrink-0">
                              {saving.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base line-clamp-1" style={{ color: colors.text }}>
                                {saving.name}
                              </h3>
                              <p className="text-xs text-green-400 font-medium">✓ Completada</p>
                            </div>
                            <button
                              onClick={() => { setDeletingId(saving.id); setShowDeleteModal(true) }}
                              className="w-8 h-7 rounded-xl border hover:bg-red-500/10 hover:border-red-500 transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
                              style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                            >
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden mb-2"
                               style={{ backgroundColor: theme === 'light' ? '#e4e4e7' : '#27272a' }}>
                            <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600" style={{ width: '100%' }} />
                          </div>
                          <p className="text-sm font-semibold text-right" style={{ color: colors.textSecondary }}>
                            {formatEuro(saving.target_amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </main>

      {/* Modal nueva meta */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md rounded-3xl p-6 border transition-colors"
               style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: colors.text }}>Nueva meta de ahorro</h2>

            <div className="space-y-4">
              {/* Emoji */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setNewEmoji(e)}
                      className="w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all cursor-pointer"
                      style={{
                        borderColor: newEmoji === e ? (theme === 'light' ? '#000' : '#fff') : colors.border,
                        backgroundColor: newEmoji === e ? (theme === 'light' ? '#000' : '#fff') : 'transparent',
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Nombre de la meta
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Viaje a Japón"
                  className="w-full px-4 py-3.5 border rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
                  style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                />
              </div>

              {/* Importe objetivo */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Importe objetivo
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-medium"
                        style={{ color: colors.textSecondary }}>€</span>
                  <input
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3.5 border rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
                    style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                  />
                </div>
              </div>

              {/* Fecha límite */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Fecha límite (opcional)
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-4 py-3.5 border rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
                  style={{
                    backgroundColor: colors.bgInput,
                    borderColor: colors.border,
                    color: colors.text,
                    colorScheme: theme === 'light' ? 'light' : 'dark'
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowNewModal(false); setNewName(''); setNewEmoji('🎯'); setNewTarget(''); setNewDeadline('') }}
                className="flex-1 py-3 rounded-2xl font-semibold transition-colors cursor-pointer text-sm md:text-base"
                style={{ backgroundColor: colors.buttonSecondary, color: colors.text }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateSaving}
                disabled={savingNew || !newName || !newTarget}
                className="flex-1 py-3 rounded-2xl font-semibold transition-colors cursor-pointer disabled:opacity-50 text-sm md:text-base"
                style={{
                  backgroundColor: theme === 'light' ? '#000000' : '#ffffff',
                  color: theme === 'light' ? '#ffffff' : '#000000'
                }}
              >
                {savingNew ? 'Creando...' : 'Crear meta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal aportación */}
      {showContribModal && selectedSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md rounded-3xl p-6 border"
               style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                {selectedSaving.emoji}
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: colors.text }}>Añadir aportación</h2>
                <p className="text-sm" style={{ color: colors.textSecondary }}>{selectedSaving.name}</p>
              </div>
            </div>

            <div className="rounded-2xl p-4 mb-4 border"
                 style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
              <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>Balance disponible</p>
              <p className="text-2xl font-bold" style={{ color: balance >= 0 ? colors.text : '#ef4444' }}>
                {formatEuro(balance)}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Importe a aportar
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-medium"
                      style={{ color: colors.textSecondary }}>€</span>
                <input
                  type="number"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3.5 border rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
                  style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                />
              </div>
              {Number(contribAmount) > balance && (
                <p className="text-xs text-red-400 mt-1">No tienes suficiente balance disponible</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowContribModal(false); setContribAmount(''); setSelectedSaving(null) }}
                className="flex-1 py-3 rounded-2xl font-semibold transition-colors cursor-pointer text-sm md:text-base"
                style={{ backgroundColor: colors.buttonSecondary, color: colors.text }}
              >
                Cancelar
              </button>
              <button
                onClick={handleContribution}
                disabled={savingContrib || !contribAmount || Number(contribAmount) <= 0 || Number(contribAmount) > balance}
                className="flex-1 py-3 rounded-2xl font-semibold transition-colors cursor-pointer disabled:opacity-50 text-sm md:text-base"
                style={{
                  backgroundColor: theme === 'light' ? '#000000' : '#ffffff',
                  color: theme === 'light' ? '#ffffff' : '#000000'
                }}
              >
                {savingContrib ? 'Aportando...' : 'Aportar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal retirar */}
      {showWithdrawModal && selectedSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md rounded-3xl p-6 border"
              style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                {selectedSaving.emoji}
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: colors.text }}>Retirar dinero</h2>
                <p className="text-sm" style={{ color: colors.textSecondary }}>{selectedSaving.name}</p>
              </div>
            </div>

            <div className="rounded-2xl p-4 mb-4 border"
                style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
              <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>Dinero aportado</p>
              <p className="text-2xl font-bold" style={{ color: colors.text }}>
                {formatEuro(selectedSaving.current_amount)}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Importe a retirar
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-medium"
                      style={{ color: colors.textSecondary }}>€</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3.5 border rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
                  style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                />
              </div>
              {Number(withdrawAmount) > selectedSaving.current_amount && (
                <p className="text-xs text-red-400 mt-1">No puedes retirar más de lo aportado</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowWithdrawModal(false); setWithdrawAmount(''); setSelectedSaving(null) }}
                className="flex-1 py-3 rounded-2xl font-semibold transition-colors cursor-pointer text-sm md:text-base"
                style={{ backgroundColor: colors.buttonSecondary, color: colors.text }}
              >
                Cancelar
              </button>
              <button
                onClick={handleWithdraw}
                disabled={savingWithdraw || !withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > selectedSaving.current_amount}
                className="flex-1 py-3 rounded-2xl font-semibold transition-colors cursor-pointer disabled:opacity-50 text-sm md:text-base bg-red-500/10 border border-red-500/20 text-red-400"
              >
                {savingWithdraw ? 'Retirando...' : 'Retirar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6 border"
               style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Eliminar meta</h2>
            <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
              ¿Seguro que quieres eliminar esta meta? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletingId(null) }}
                className="flex-1 py-3 rounded-2xl font-semibold cursor-pointer text-sm"
                style={{ backgroundColor: colors.buttonSecondary, color: colors.text }}
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

      {showEditModal && editingSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md rounded-3xl p-6 border transition-colors"
              style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: colors.text }}>Editar meta</h2>

            <div className="space-y-4">
              {/* Emoji */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEditEmoji(e)}
                      className="w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all cursor-pointer"
                      style={{
                        borderColor: editEmoji === e ? (theme === 'light' ? '#000' : '#fff') : colors.border,
                        backgroundColor: editEmoji === e ? (theme === 'light' ? '#000' : '#fff') : 'transparent',
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Nombre</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3.5 border rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
                  style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                />
              </div>

              {/* Importe */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Importe objetivo</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-medium" style={{ color: colors.textSecondary }}>€</span>
                  <input
                    type="number"
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                    className="w-full pl-8 pr-4 py-3.5 border rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
                    style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                  />
                </div>
              </div>

              {/* Fecha límite */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Fecha límite (opcional)</label>
                <input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full px-4 py-3.5 border rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
                  style={{
                    backgroundColor: colors.bgInput,
                    borderColor: colors.border,
                    color: colors.text,
                    colorScheme: theme === 'light' ? 'light' : 'dark'
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowEditModal(false); setEditingSaving(null) }}
                className="flex-1 py-3 rounded-2xl font-semibold transition-colors cursor-pointer text-sm md:text-base"
                style={{ backgroundColor: colors.buttonSecondary, color: colors.text }}
              >
                Cancelar
              </button>
              <button
                onClick={handleEdit}
                disabled={savingEdit || !editName || !editTarget}
                className="flex-1 py-3 rounded-2xl font-semibold transition-colors cursor-pointer disabled:opacity-50 text-sm md:text-base"
                style={{
                  backgroundColor: theme === 'light' ? '#000000' : '#ffffff',
                  color: theme === 'light' ? '#ffffff' : '#000000'
                }}
              >
                {savingEdit ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}