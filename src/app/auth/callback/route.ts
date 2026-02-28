import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('CALLBACK - Code recibido:', code)

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code:', error)
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    console.log('✅ Usuario autenticado:', data.user?.id)

    if (data.user) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingUser) {
        console.log('Creando usuario en tabla...')
        
        const { error: dbError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            email: data.user.email!,
            fullname: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
            avatar: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
          }])

        if (dbError) {
          console.error('❌ Error creando usuario:', dbError)
        } else {
          console.log('✅ Usuario creado en tabla users')
        }
      } else {
        console.log('ℹ️ Usuario ya existe en tabla')
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}