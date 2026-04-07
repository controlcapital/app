'use client'
import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useTheme } from '@/app/context/Theme.context'
import Link from 'next/link'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  const { theme } = useTheme()
  const [rememberMe, setRememberMe] = useState(false)
  
  const traducirError = (msg: string) => {
    const errores: { [key: string]: string } = {
      // Registro
      'User already registered':                    'Este usuario ya está registrado',
      'Password should be at least 6 characters':   'La contraseña debe tener al menos 6 caracteres',
      'Unable to validate email address: invalid format': 'El formato del correo no es válido',
      'Signup requires a valid password':            'Introduce una contraseña válida',
      'Database error saving new user': 'Error en la base de datos guardando un nuevo usuario',

      // Login
      'Invalid login credentials':                  'Correo o contraseña incorrectos',
      'Email not confirmed':                         'Confirma tu correo antes de iniciar sesión',
      'Too many requests':                           'Demasiados intentos, espera un momento',

      // Contraseña
      'New password should be different from the old password': 'La nueva contraseña debe ser diferente a la anterior',
      'Password recovery requires an email':         'Introduce tu correo para recuperar la contraseña',

      // General
      'Network request failed':                      'Error de conexión, comprueba tu internet',
      'Request timeout':                             'La solicitud tardó demasiado, inténtalo de nuevo',
      'duplicate key value violates unique constraint "user_pkey"': 'El valor de clave duplicado viola la restricción de unicidad "user_pkey".'
    }
    return errores[msg] ?? msg
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
  

    try {
      if (isLogin) {
        // --- LÓGICA DE LOGIN ---
   
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) throw error;

        // Si NO marca Recordarme, convierte las cookies en cookies de sesión
        if (!rememberMe) {
          document.cookie.split(';').forEach(cookie => {
            const name = cookie.split('=')[0].trim()
            if (name.startsWith('sb-')) {
              // Reescribe la cookie sin fecha de expiración = cookie de sesión
              const value = decodeURIComponent(cookie.split('=')[1] || '')
              document.cookie = `${name}=${value}; path=/; SameSite=Lax`
            }
          })
        }

        setMessage({ type: 'success', text: '¡Bienvenido de nuevo!' });
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);

      } else {
        // --- LÓGICA DE REGISTRO ---
        
        // 1. Validaciones de contraseña (solo en registro)
        if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
        if (!/[A-Z]/.test(password)) throw new Error('La contraseña debe tener al menos una mayúscula.');
        if (!/[a-z]/.test(password)) throw new Error('La contraseña debe tener al menos una minúscula.');
        if (!/[0-9]/.test(password)) throw new Error('La contraseña debe tener al menos un número.');
        if (!/[^A-Za-z0-9]/.test(password)) throw new Error('La contraseña debe tener al menos un carácter especial.');

        // 2. Registro en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        });

        if (authError) throw authError;

        // 3. Insertar en tabla pública 'users' (Opcional, si no usas Triggers)
        // if (authData.user) {
        //   const { error: dbError } = await supabase
        //     .from('users')
        //     .insert([
        //       {
        //         id: authData.user.id,
        //         email: email,
        //         fullname: name,
        //       }
        //     ]);

        //   if (dbError) throw dbError;
        // }

        setMessage({ 
          type: 'success', 
          text: '¡Cuenta creada! Revisa tu email para confirmar.' 
        });
        
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: traducirError(error.message) || 'Ocurrió un error. Intenta de nuevo.' 
      });
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) throw error
    } catch (error: any) {
      setMessage({ type: 'error', text: traducirError(error.message) })
      setLoading(false)
    }
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

  // Colores dinámicos
  const colors = {
    bg: theme === 'light' ? '#ffffff' : '#000000',
    bgCard: theme === 'light' ? '#f4f4f5' : '#18181b',
    bgInput: theme === 'light' ? '#ffffff' : '#000000',
    text: theme === 'light' ? '#09090b' : '#ffffff',
    textSecondary: theme === 'light' ? '#71717a' : '#a1a1aa',
    border: theme === 'light' ? '#e4e4e7' : '#3f3f46',
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
         style={{ backgroundColor: colors.bg }}>
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

        {/* Card principal */}
        <div className="rounded-3xl p-8 border transition-colors"
             style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
          
          {/* Toggle Login/Registro */}
          <div className="flex gap-2 mb-8 rounded-full p-1"
               style={{ backgroundColor: colors.bgInput }}>
            <button
              onClick={() => {
                setIsLogin(true)
                setMessage(null)
              }}
              disabled={loading}
              className="flex-1 py-3 rounded-full font-semibold transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: isLogin ? (theme === 'light' ? '#000000' : '#ffffff') : 'transparent',
                color: isLogin ? (theme === 'light' ? '#ffffff' : '#000000') : colors.textSecondary
              }}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => {
                setIsLogin(false)
                setMessage(null)
              }}
              disabled={loading}
              className="flex-1 py-3 rounded-full font-semibold transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: !isLogin ? (theme === 'light' ? '#000000' : '#ffffff') : 'transparent',
                color: !isLogin ? (theme === 'light' ? '#ffffff' : '#000000') : colors.textSecondary
              }}
            >
              Registrarse
            </button>
          </div>

          {/* Mensaje de error/éxito */}
          {message && (
              <div className={`mb-6 p-4 rounded-2xl border text-center ${
                message.type === 'error'
                  ? 'bg-red-500/10 border-red-500 text-red-400'
                  : 'bg-green-500/10 border-green-500 text-green-400'
              }`}>
                <p className="text-sm">{message.text}</p>
              </div>
            )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Campo nombre (solo en registro) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2"
                       style={{ color: colors.textSecondary }}>
                  Nombre completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5" style={{ color: colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Pérez"
                    className="w-full pl-12 pr-4 py-3.5 border rounded-2xl placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                    required={!isLogin}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

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
                  className="w-full pl-12 pr-4 py-3.5 border rounded-2xl placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                  required
                />
              </div>
            </div>

            {/* Campo contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2"
                     style={{ color: colors.textSecondary }}>
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5" style={{ color: colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 border rounded-2xl placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors cursor-pointer"
                  style={{ color: colors.textSecondary }}
                >
                  {showPassword ? (
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
              {/* ✅ Barra de fortaleza — solo en registro */}
              {!isLogin && strength && (
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

            {/* Recordar / Olvidé contraseña (solo en login) */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-black text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    disabled={loading}
                  />
                  <span className="text-sm transition-colors" style={{ color: colors.textSecondary }}>
                    Recordarme
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer"
              style={{
                backgroundColor: theme === 'light' ? '#000000' : '#ffffff',
                color: theme === 'light' ? '#ffffff' : '#000000'
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Procesando...</span>
                </>
              ) : (
                isLogin ? 'Iniciar sesión' : 'Crear cuenta'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: colors.border }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4" style={{ backgroundColor: colors.bgCard, color: colors.textSecondary }}>
                O continúa con
              </span>
            </div>
          </div>

          {/* Botones sociales */}
          <div className="flex justify-center"> {/* PARA PONER EL DE APPLE CAMBIAR POR 'grid grid-cols-2 gap-3' Y QUITAR 'PX-8' DEL BOTON DE GOOGLE*/}
            <button type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 border rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-8"
              style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-medium">Google</span>
            </button>
            
            {/*<button
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 border rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.text }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.957 4.45z"/>
              </svg>
              <span className="font-medium">Apple</span>
            </button>*/}
          </div>
        </div>
      </div>
    </div>
  )
}