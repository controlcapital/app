'use client'
import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useTheme } from '@/app/context/Theme.context'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  const { theme } = useTheme()

  const colors = {
    bg: theme === 'light' ? '#ffffff' : '#000000',
    bgCard: theme === 'light' ? '#f4f4f5' : '#18181b',
    bgInput: theme === 'light' ? '#ffffff' : '#000000',
    text: theme === 'light' ? '#09090b' : '#ffffff',
    textSecondary: theme === 'light' ? '#71717a' : '#a1a1aa',
    border: theme === 'light' ? '#e4e4e7' : '#3f3f46',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setSent(true)
      setMessage({
        type: 'success',
        text: 'Te hemos enviado un enlace para restablecer tu contraseña.',
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Ocurrió un error. Intenta de nuevo.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="w-full max-w-md">

        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl"
                style={{ backgroundColor: theme === 'light' ? '#000000' : '#ffffff' }}>
              <svg className="w-11 h-11" viewBox="0 0 24 29" fill="none"
                  style={{ color: theme === 'light' ? '#ffffff' : '#000000' }}>
                <path d="M3 20h18M5 20V14h3v6M10 20V9h3v11M15 20V11h3v9"
                      stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                <text x="12" y="25" textAnchor="middle" fontSize="3" fontWeight="bold" fill="currentColor">
                  Control Capital
                </text>
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-2 transition-colors" style={{ color: colors.text }}>
            Control Capital
          </h1>
          <p className="transition-colors" style={{ color: colors.textSecondary }}>
            Gestiona tus finanzas de forma inteligente
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 border transition-colors"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
        >
          {/* Icono candado */}
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: theme === 'light' ? '#f0fdf4' : '#052e16', border: '1.5px solid #22c55e' }}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
              ¿Olvidaste tu contraseña?
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
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

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2"
                       style={{ color: colors.textSecondary }}>
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5" style={{ color: colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full pl-12 pr-4 py-3.5 border rounded-2xl placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                    style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Botón enviar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: theme === 'light' ? '#000000' : '#ffffff',
                  color: theme === 'light' ? '#ffffff' : '#000000',
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>Enviando...</span>
                  </>
                ) : (
                  'Enviar enlace'
                )}
              </button>
            </form>
          ) : (
            /* Estado: email enviado */
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-500/10 border border-green-500">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Revisa tu bandeja de entrada y sigue las instrucciones del correo.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); setMessage(null) }}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                Enviar de nuevo
              </button>
            </div>
          )}

          {/* Volver al login */}
          <div className="mt-6 text-center">
            <a
              href="/login"
              className="inline-flex items-center gap-2 text-sm transition-colors cursor-pointer"
              style={{ color: colors.textSecondary }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Volver al inicio de sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}