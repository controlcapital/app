'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getInitialUser = async () => {
      try {
        // Usamos getSession que es más rápido para leer la cookie local
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error cargando usuario:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}