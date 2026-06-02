'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { validarEmail, traducirError, getPasswordStrength } from '@/app/lib/auth-utils'

const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME_MS = 15 * 60 * 1000; // 15 minutos
const LOCKOUT_KEY = 'auth_lockout_data';

export const useAuthForm = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  const [rememberMe, setRememberMe] = useState(false)

  // 🔒 Nuevos estados para el bloqueo
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)

  // 🛡️ Estado para el token de Cloudflare Turnstile
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  // 🌟 ESTADOS PARA MICRO-INTERACCIONES
  const [isShake, setIsShake] = useState(false)
  const [isSuccessScreen, setIsSuccessScreen] = useState(false)

  // 1. Inicializar estado de bloqueo desde localStorage
  useEffect(() => {
    const storedLockout = localStorage.getItem(LOCKOUT_KEY)
    if (storedLockout) {
      const { attempts, lockUntil } = JSON.parse(storedLockout)
      
      if (lockUntil && Date.now() < lockUntil) {
        setLockoutUntil(lockUntil)
        setFailedAttempts(attempts)
      } else if (lockUntil && Date.now() >= lockUntil) {
        // El bloqueo ha expirado, limpiamos
        localStorage.removeItem(LOCKOUT_KEY)
      } else {
        setFailedAttempts(attempts)
      }
    }
    
    // Tab effect
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === 'register') {
      setIsLogin(false)
    }
  }, [])

  // 2. Temporizador para actualizar el tiempo restante en pantalla cada segundo
  useEffect(() => {
    if (!lockoutUntil) {
      setTimeRemaining(null)
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now()
      if (now >= lockoutUntil) {
        setLockoutUntil(null)
        setFailedAttempts(0)
        setTimeRemaining(null)
        localStorage.removeItem(LOCKOUT_KEY)
        setMessage(null)
        clearInterval(interval)
      } else {
        const diff = lockoutUntil - now
        const minutes = Math.floor(diff / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        setTimeRemaining(`${minutes}m ${seconds}s`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lockoutUntil])

  // 3. Sincronizar el título de la pestaña y la URL con el estado de React
  useEffect(() => {
    document.title = isLogin 
      ? 'Iniciar sesión | Control Capital' 
      : 'Crear cuenta | Control Capital';

    const newUrl = isLogin ? '/login' : '/login?tab=register';
    window.history.replaceState(null, '', newUrl);
  }, [isLogin]);

  // 4. Manejador de fallos de intento
  const registerFailedAttempt = () => {
    const newAttempts = failedAttempts + 1
    setFailedAttempts(newAttempts)

    if (newAttempts >= MAX_ATTEMPTS) {
      const lockTime = Date.now() + LOCKOUT_TIME_MS
      setLockoutUntil(lockTime)
      localStorage.setItem(LOCKOUT_KEY, JSON.stringify({ attempts: newAttempts, lockUntil: lockTime }))
      setMessage({ type: 'error', text: `Demasiados intentos. Inténtalo de nuevo en 15 minutos.` })
    } else {
      localStorage.setItem(LOCKOUT_KEY, JSON.stringify({ attempts: newAttempts, lockUntil: null }))
      setMessage({ type: 'error', text: `Correo o contraseña incorrectos. Te quedan ${MAX_ATTEMPTS - newAttempts} intentos.` })
    }
  }

  const clearFailedAttempts = () => {
    setFailedAttempts(0)
    setLockoutUntil(null)
    localStorage.removeItem(LOCKOUT_KEY)
  }

  // Función auxiliar para activar la animación de temblor
  const triggerShake = () => {
    setIsShake(true)
    setTimeout(() => setIsShake(false), 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Bloqueo de tiempo antes de llamar a base de datos
    if (lockoutUntil && Date.now() < lockoutUntil) {
      setMessage({ type: 'error', text: `Cuenta bloqueada temporalmente. Espera ${timeRemaining}.` });
      triggerShake();
      return;
    }

    // 🛡️ Validar que tenemos el token de Turnstile
    if (!captchaToken) {
      setMessage({ type: 'error', text: 'Verificando seguridad, espera un momento...' });
      triggerShake();
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password,
          options: { captchaToken } // 🛡️ Pasamos el token a Supabase
        })
        
        if (error) {
          triggerShake();
          if (error.message.includes('Invalid login credentials')) {
            registerFailedAttempt();
            setLoading(false);
            setCaptchaToken(null); // 🛡️ Resetear token tras intento fallido
            return;
          }
          throw error;
        }

        clearFailedAttempts();

        if (!rememberMe) {
          document.cookie.split(';').forEach(cookie => {
            const name = cookie.split('=')[0].trim()
            if (name.startsWith('sb-')) {
              const value = decodeURIComponent(cookie.split('=')[1] || '')
              document.cookie = `${name}=${value}; path=/; SameSite=Lax`
            }
          })
        }

        setMessage({ type: 'success', text: '¡Bienvenido de nuevo!' });
        setTimeout(() => window.location.href = '/dashboard', 1000);

      } else {
        // --- LÓGICA DE REGISTRO ---
        if (!validarEmail(email)) throw new Error('Por favor usa un correo electrónico válido (Gmail, Hotmail, Outlook...).')
        if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
        if (!/[A-Z]/.test(password)) throw new Error('La contraseña debe tener al menos una mayúscula.');
        if (!/[a-z]/.test(password)) throw new Error('La contraseña debe tener al menos una minúscula.');
        if (!/[0-9]/.test(password)) throw new Error('La contraseña debe tener al menos un número.');
        if (!/[^A-Za-z0-9]/.test(password)) throw new Error('La contraseña debe tener al menos un carácter especial.');

        const { error: authError } = await supabase.auth.signUp({
          email, 
          password, 
          options: { 
            data: { full_name: name },
            captchaToken // 🛡️ Pasamos el token a Supabase
          }
        });

        if (authError) {
          triggerShake();
          throw authError;
        }

        setIsSuccessScreen(true);
      }
    } catch (error: any) {
      triggerShake();
      setMessage({ type: 'error', text: traducirError(error.message) || 'Ocurrió un error. Intenta de nuevo.' });
      setCaptchaToken(null); // 🛡️ Resetear token si hay cualquier otro error
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      })
      if (error) throw error
    } catch (error: any) {
      triggerShake();
      setMessage({ type: 'error', text: traducirError(error.message) })
      setLoading(false)
    }
  }

  const strength = getPasswordStrength(password)

  return {
    isLogin, setIsLogin, email, setEmail, password, setPassword,
    name, setName, showPassword, setShowPassword, loading,
    message, setMessage, rememberMe, setRememberMe,
    handleSubmit, handleGoogleLogin, strength,
    isLocked: !!lockoutUntil,
    timeRemaining,
    isShake,
    isSuccessScreen, setIsSuccessScreen,
    // 🛡️ Exportamos el estado del token
    captchaToken, setCaptchaToken
  }
}