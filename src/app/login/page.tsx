import type { Metadata } from 'next'
import LoginView from './LoginView'

// 1. Ahora searchParams es explícitamente una Promesa
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  // 2. Esperamos a que la promesa se resuelva antes de leer sus propiedades
  const resolvedSearchParams = await searchParams
  const isRegister = resolvedSearchParams.tab === 'register'

  return {
    title: isRegister ? 'Crear cuenta' : 'Iniciar sesión',
  }
}

export default function LoginPage() {
  return <LoginView />
}