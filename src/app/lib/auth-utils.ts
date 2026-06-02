const DOMINIOS_PERMITIDOS = [
  'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com',
  'icloud.com', 'protonmail.com', 'live.com', 'msn.com'
]

export const validarEmail = (email: string): boolean => {
  const dominio = email.split('@')[1]?.toLowerCase()
  return DOMINIOS_PERMITIDOS.includes(dominio)
}

export const traducirError = (msg: string) => {
  const errores: { [key: string]: string } = {
    'User already registered': 'Este usuario ya está registrado',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
    'Unable to validate email address: invalid format': 'El formato del correo no es válido',
    'Signup requires a valid password': 'Introduce una contraseña válida',
    'Database error saving new user': 'Error en la base de datos guardando un nuevo usuario',
    'Invalid login credentials': 'Correo o contraseña incorrectos',
    'Email not confirmed': 'Confirma tu correo antes de iniciar sesión',
    'Too many requests': 'Demasiados intentos, espera un momento',
    'New password should be different from the old password': 'La nueva contraseña debe ser diferente a la anterior',
    'Password recovery requires an email': 'Introduce tu correo para recuperar la contraseña',
    'Network request failed': 'Error de conexión, comprueba tu internet',
    'Request timeout': 'La solicitud tardó demasiado, inténtalo de nuevo',
    'duplicate key value violates unique constraint "user_pkey"': 'El valor de clave duplicado viola la restricción de unicidad.'
  }
  return errores[msg] ?? msg
}

export const getPasswordStrength = (pwd: string) => {
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