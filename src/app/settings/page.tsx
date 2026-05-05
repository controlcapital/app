'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@/app/hooks/useUser'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import Navbar from '@/app/components/navbar'
import { useTheme } from '@/app/context/Theme.context'

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [activeMenu, setActiveMenu] = useState('settings')
  const { user, loading } = useUser()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  
  // Estados para mostrar/ocultar contraseñas
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      loadUserData()
    }
  }, [user, loading, router])

  const loadUserData = async () => {
    if (!user) return
    setEmail(user.email || '')
    
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userData) {
      setFullname(userData.fullname || '')
      setAvatar(userData.avatar || '')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true)
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen para subir.')
      }

      const file = event.target.files[0]
      const userId = user?.id
      if (!userId) throw new Error('No se encontró el ID del usuario')

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${userId}/avatar.png`, file, {
          cacheControl: '0',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${userId}/avatar.png`)

      const urlWithTimestamp = `${publicUrl}?t=${new Date().getTime()}`

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar: urlWithTimestamp })
        .eq('id', userId)

      if (updateError) throw updateError

      setAvatar(urlWithTimestamp)
      setMessage({ type: 'success', text: '¡Avatar actualizado correctamente!' })

      window.dispatchEvent(new CustomEvent('userDataUpdated', { 
        detail: { avatar: urlWithTimestamp, fullname: fullname } 
      }))
    } catch (error: any) {
      console.error('Error al subir:', error)
      setMessage({ type: 'error', text: error.message || 'Error al subir la imagen' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleDeleteAvatar = async () => {
    try {
      setUploadingAvatar(true)
      const { error } = await supabase
        .from('users')
        .update({ avatar: null })
        .eq('id', user?.id)

      if (error) throw error

      await supabase.storage.from('avatars').remove([`${user?.id}/avatar.png`])
      setAvatar('')
      setMessage({ type: 'success', text: 'Avatar eliminado' })

      window.dispatchEvent(new CustomEvent('userDataUpdated', { 
        detail: { avatar: null, fullname: fullname } 
      }))
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Error al eliminar: ' + error.message })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { error: dbError } = await supabase
        .from('users')
        .update({
          fullname: fullname,
          avatar: avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)

      if (dbError) throw dbError

      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullname, avatar: avatar }
      })

      if (authError) throw authError

      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })

      window.dispatchEvent(new CustomEvent('userDataUpdated', { 
        detail: { avatar: avatar, fullname: fullname } 
      }))
      
    } catch (error: any) {
      setMessage({ type: 'error', text: `Error: ${error.message}` })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      setSaving(false)
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' })
      setSaving(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' })
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setMessage({ type: 'error', text: `Error: ${error.message}` })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const { error: dbError } = await supabase.from('users').delete().eq('id', user?.id)
      if (dbError) throw dbError

      await supabase.auth.signOut()
      router.push('/login')
    } catch (error: any) {
      setMessage({ type: 'error', text: `Error al eliminar cuenta: ${error.message}` })
    }
  }

  // Función para calcular fortaleza de contraseña
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return null

    const hasMinLength = pwd.length >= 8
    const hasUpper = /[A-Z]/.test(pwd)
    const hasLower = /[a-z]/.test(pwd)
    const hasNumber = /[0-9]/.test(pwd)
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd)

    const score = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length

    if (score <= 1) return { label: 'Muy débil', color: '#ef4444', width: '20%' }
    if (score === 2) return { label: 'Débil', color: '#f97316', width: '40%' }
    if (score === 3) return { label: 'Regular', color: '#eab308', width: '60%' }
    if (score === 4) return { label: 'Buena', color: '#84cc16', width: '80%' }
    return { label: 'Fuerte', color: '#22c55e', width: '100%' }
  }

  const newPasswordStrength = getPasswordStrength(newPassword)
  const confirmPasswordStrength = getPasswordStrength(confirmPassword)

  // Colores dinámicos según el tema
  const colors = {
    bg: theme === 'light' ? '#ffffff' : '#000000',
    bgCard: theme === 'light' ? '#f4f4f5' : '#18181b',
    bgInput: theme === 'light' ? '#ffffff' : '#000000',
    text: theme === 'light' ? '#09090b' : '#ffffff',
    textSecondary: theme === 'light' ? '#71717a' : '#a1a1aa',
    border: theme === 'light' ? '#e4e4e7' : '#3f3f46',
  }

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
      
      <Navbar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      <main className="flex-1 ml-20 lg:ml-64">
        <div className="p-4 md:p-6">
          <div className="max-w-4xl mx-auto">

            {/* Header con botón de tema */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold mb-2 transition-colors" style={{ color: colors.text }}>
                  Configuración
                </h1>
                <p className="text-xs md:text-base transition-colors" style={{ color: colors.textSecondary }}>
                  Administra tu cuenta y preferencias
                </p>
              </div>

              <button
                onClick={toggleTheme}
                className="p-3 rounded-2xl border hover:scale-105 transition-all"
                style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
                title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              >
                {theme === 'dark' ? (
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-2xl border text-center ${
                message.type === 'error'
                  ? 'bg-red-950/50 border-red-900 text-red-200'
                  : 'bg-green-500/10 border-green-500 text-green-400'
              }`}>
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            {/* Información del Perfil */}
            <div className="rounded-3xl p-6 md:p-8 border mb-6 transition-colors" 
                 style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-6 h-6" style={{ color: colors.text }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
                  Información del perfil
                </h2>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-8">
                  
                  <div className="relative group flex-shrink-0 sm:mt-7 self-center">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                    
                    <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 group-hover:border-violet-500 transition-all relative"
                         style={{ borderColor: colors.border }}>
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-4xl font-bold">
                          {fullname?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase()}
                        </span>
                      )}

                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2 p-3">
                        {uploadingAvatar ? (
                          <svg className="w-6 h-6 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <>
                            <label htmlFor="avatar-upload" className="w-full py-1.5 bg-white text-black rounded-xl text-[10px] font-bold text-center cursor-pointer">
                              {avatar ? 'Cambiar' : 'Subir'}
                            </label>
                            {avatar && (
                              <button type="button" onClick={handleDeleteAvatar} className="w-full py-1.5 bg-red-600 text-white rounded-xl text-[10px] font-bold">
                                Eliminar
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-4">
                    <div className="flex-col gap-2">
                      <label htmlFor="fullname" className="text-sm font-medium ml-1" style={{ color: colors.textSecondary }}>
                        Nombre completo
                      </label>
                      <input
                        id="fullname"
                        type="text"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        className="w-full px-4 py-3.5 border rounded-2xl focus:border-violet-500 outline-none transition-colors mt-2"
                        style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="text-sm font-medium ml-1" style={{ color: colors.textSecondary }}>
                        Correo electrónico
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-3.5 border rounded-2xl cursor-not-allowed opacity-60"
                        style={{ backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.textSecondary }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:brightness-90 transition-all disabled:opacity-50 cursor-pointer">
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </form>
            </div>

            {/* Cambiar Contraseña */}
            <div className="rounded-3xl p-6 md:p-8 border mb-6 transition-colors"
                 style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-6 h-6" style={{ color: colors.text }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
                  Seguridad
                </h2>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-6">
                
                {/* Nueva contraseña */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full px-4 py-3.5 pr-12 border rounded-2xl placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                      style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors cursor-pointer"
                      style={{ color: colors.textSecondary }}
                    >
                      {showNewPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Barra de fortaleza */}
                  {newPasswordStrength && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
                        <div className="h-full rounded-full transition-all duration-300"
                             style={{ width: newPasswordStrength.width, backgroundColor: newPasswordStrength.color }} />
                      </div>
                      <p className="text-xs mt-1 text-right" style={{ color: newPasswordStrength.color }}>
                        {newPasswordStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Confirmar nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full px-4 py-3.5 pr-12 border rounded-2xl placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                      style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors cursor-pointer"
                      style={{ color: colors.textSecondary }}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Barra de fortaleza */}
                  {confirmPasswordStrength && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
                        <div className="h-full rounded-full transition-all duration-300"
                             style={{ width: confirmPasswordStrength.width, backgroundColor: confirmPasswordStrength.color }} />
                      </div>
                      <p className="text-xs mt-1 text-right" style={{ color: confirmPasswordStrength.color }}>
                        {confirmPasswordStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving || !newPassword || !confirmPassword}
                  className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving ? 'Actualizando...' : 'Cambiar contraseña'}
                </button>
              </form>
            </div>

            {/* Zona de Peligro */}
            <div className="rounded-3xl p-6 md:p-8 border border-red-900/30 mb-6 transition-colors"
                 style={{ backgroundColor: colors.bgCard }}>
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-2xl font-bold text-red-400">Zona de peligro</h2>
              </div>

              <div>
                <h3 className="font-semibold mb-2" style={{ color: colors.text }}>
                  Eliminar cuenta
                </h3>
                <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                  Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten cuidado.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-6 py-3 bg-red-600 text-white rounded-2xl font-semibold hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Eliminar mi cuenta
                </button>
              </div>
            </div>

            {/* Información adicional */}
            <div className="rounded-3xl p-6 border transition-colors"
                 style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
              <h3 className="font-semibold mb-4" style={{ color: colors.text }}>
                Información de la cuenta
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Cuenta creada:</span>
                  <span style={{ color: colors.text }}>
                    {mounted && new Date(user.created_at).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Método de autenticación:</span>
                  <span className="capitalize" style={{ color: colors.text }}>
                    {user.app_metadata?.provider || 'Email'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}