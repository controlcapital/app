'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { useTheme } from '@/app/context/Theme.context'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  const { theme } = useTheme()
  const router = useRouter()

  // Supabase envía el token en el hash de la URL — hay que escucharlo
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // sesión lista, el usuario puede resetear
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const colors = {
    bg: theme === 'light' ? '#ffffff' : '#000000',
    bgCard: theme === 'light' ? '#f4f4f5' : '#18181b',
    bgInput: theme === 'light' ? '#ffffff' : '#000000',
    text: theme === 'light' ? '#09090b' : '#ffffff',
    textSecondary: theme === 'light' ? '#71717a' : '#a1a1aa',
    border: theme === 'light' ? '#e4e4e7' : '#3f3f46',
  }

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

  const strength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    // Validaciones
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres.' })
      return
    }
    if (!/[A-Z]/.test(password)) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos una mayúscula.' })
      return
    }
    if (!/[a-z]/.test(password)) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos una minúscula.' })
      return
    }
    if (!/[0-9]/.test(password)) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos un número.' })
      return
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos un carácter especial.' })
      return
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' })
      return
    }
    
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setMessage({ type: 'success', text: '¡Contraseña actualizada correctamente!' })
      setTimeout(() => router.push('/login'), 2500)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Ocurrió un error. Intenta de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
         style={{ backgroundColor: colors.bg }}>
      <div className="w-full max-w-md">

        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
               style={{ backgroundColor: theme === 'light' ? '#000000' : '#ffffff' }}>
            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none"
                 style={{ color: theme === 'light' ? '#ffffff' : '#000000' }}>
              <path d="M3 20h18M5 20V14h3v6M10 20V9h3v11M15 20V11h3v9"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2 transition-colors" style={{ color: colors.text }}>
            Control Capital
          </h1>
          <p className="transition-colors" style={{ color: colors.textSecondary }}>
            Gestiona tus finanzas de forma inteligente
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 border transition-colors"
             style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>

          {/* Icono llave */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                 style={{ backgroundColor: theme === 'light' ? '#f0fdf4' : '#052e16', border: '1.5px solid #22c55e' }}>
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
              Nueva contraseña
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
              Elige una contraseña segura para proteger tu cuenta.
            </p>
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

          {!done ? (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Nueva contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2"
                       style={{ color: colors.textSecondary }}>
                  Nueva contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5" style={{ color: colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input id="password" type={showPassword ? 'text' : 'password'}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 border rounded-2xl placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                    style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                    required disabled={loading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors cursor-pointer"
                    style={{ color: colors.textSecondary }}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>

                {/* Barra de fortaleza */}
                {strength && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
                      <div className="h-full rounded-full transition-all duration-300"
                           style={{ width: strength.width, backgroundColor: strength.color }} />
                    </div>
                    <p className="text-xs mt-1 text-right" style={{ color: strength.color }}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium mb-2"
                       style={{ color: colors.textSecondary }}>
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5" style={{ color: colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input id="confirm" type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 border rounded-2xl placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                    style={{
                      backgroundColor: colors.bgInput,
                      borderColor: confirmPassword && confirmPassword !== password ? '#ef4444' : colors.border,
                      color: colors.text
                    }}
                    required disabled={loading} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors cursor-pointer"
                    style={{ color: colors.textSecondary }}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {/* Indicador coincidencia */}
                {confirmPassword.length > 0 && (
                  <p className="text-xs mt-1 text-right" style={{ color: confirmPassword === password ? '#22c55e' : '#ef4444' }}>
                    {confirmPassword === password ? '✓ Las contraseñas coinciden' : '✗ No coinciden'}
                  </p>
                )}
              </div>

              {/* Botón */}
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: theme === 'light' ? '#000000' : '#ffffff',
                  color: theme === 'light' ? '#ffffff' : '#000000'
                }}>
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>Guardando...</span>
                  </>
                ) : 'Guardar nueva contraseña'}
              </button>
            </form>
          ) : (
            /* Estado: contraseña cambiada */
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-500/10 border border-green-500">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Redirigiendo al inicio de sesión...
              </p>
            </div>
          )}

          {/* Volver al login */}
          {!done && (
            <div className="mt-6 text-center">
              <a href="/login"
                className="inline-flex items-center gap-2 text-sm transition-colors cursor-pointer"
                style={{ color: colors.textSecondary }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
                Volver al inicio de sesión
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}