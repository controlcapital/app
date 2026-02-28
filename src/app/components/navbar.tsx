'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@/app/hooks/useUser'
import { supabase } from '@/app/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from '@/app/context/Theme.context'

interface NavbarProps {
  activeMenu?: string
  onMenuChange?: (menu: string) => void
}

export default function Navbar({ activeMenu: activeMenuProp, onMenuChange }: NavbarProps) {
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const { theme } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [dbUserData, setDbUserData] = useState<{ avatar?: string | null, fullname?: string | null } | null>(null)

  useEffect(() => {
    if (!user?.id) return

    const fetchUserData = async () => {
      const { data } = await supabase
        .from('users')
        .select('avatar, fullname')
        .eq('id', user.id)
        .single()
      
      if (data) setDbUserData(data)
    }

    fetchUserData()

    const channel = supabase
      .channel(`navbar-user-${user.id}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'users', 
          filter: `id=eq.${user.id}` 
        }, 
        (payload) => {
          console.log('🔔 Realtime UPDATE:', payload.new)
          setDbUserData({
            avatar: payload.new.avatar,
            fullname: payload.new.fullname
          })
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime status:', status)
      })

    const handleUserDataUpdate = (e: any) => {
      console.log('⚡ Window event recibido:', e.detail)
      setDbUserData(prev => ({
        ...prev,
        avatar: e.detail.avatar,
        fullname: e.detail.fullname
      }))
    }

    window.addEventListener('userDataUpdated', handleUserDataUpdate)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('userDataUpdated', handleUserDataUpdate)
    }
  }, [user?.id])

  const getActiveMenu = () => {
    if (pathname === '/dashboard') return 'dashboard'
    if (pathname?.startsWith('/income')) return 'ingresos'
    if (pathname?.startsWith('/expense')) return 'gastos'
    if (pathname === '/settings') return 'settings'
    return activeMenuProp || 'home'
  }

  const activeMenu = getActiveMenu()

  const getInitials = (): string => {
    const name = dbUserData?.fullname || user?.user_metadata?.full_name || user?.user_metadata?.fullname
    if (name) {
      const names = name.trim().split(/\s+/)
      if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase()
      return names[0].slice(0, 2).toUpperCase()
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U'
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const avatarUrl = dbUserData?.avatar || user?.user_metadata?.avatar_url

  // Colores dinámicos
  const colors = {
    bg: theme === 'light' ? '#f4f4f5' : '#18181b',
    border: theme === 'light' ? '#e4e4e7' : '#3f3f46',
    text: theme === 'light' ? '#09090b' : '#ffffff',
    textSecondary: theme === 'light' ? '#71717a' : '#a1a1aa',
    logoText: theme === 'light' ? '#000000' : '#ffffff',
    activeButtonBg: theme === 'light' ? '#000000' : '#ffffff',
    activeButtonText: theme === 'light' ? '#ffffff' : '#000000',
    hoverBg: theme === 'light' ? '#e4e4e7' : '#27272a',
  }

  return (
    <aside className="w-20 lg:w-64 border-r flex flex-col fixed h-full z-50 transition-colors duration-300" 
           style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
      
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: colors.border }}>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl"
               style={{ backgroundColor: theme === 'light' ? '#000000' : '#ffffff' }}>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"
                 style={{ color: theme === 'light' ? '#ffffff' : '#000000' }}>
              {/* Barras */}
              <path d="M3 20h18M5 20V14h3v6M10 20V9h3v11M15 20V11h3v9"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              
            </svg>
          </div>
          <span className="font-bold text-xl hidden lg:block truncate transition-colors" 
                style={{ color: colors.text }}>
            Control Capital
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', path: '/dashboard' },
          { id: 'ingresos', label: 'Ingresos', icon: 'M7 11l5-5m0 0l5 5m-5-5v12', path: '/income' },
          { id: 'gastos', label: 'Gastos', icon: 'M17 13l-5 5m0 0l-5-5m5 5V6', path: '/expense' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(item.path)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: activeMenu === item.id ? colors.activeButtonBg : 'transparent',
              color: activeMenu === item.id ? colors.activeButtonText : colors.textSecondary,
            }}
            onMouseEnter={(e) => {
              if (activeMenu !== item.id) {
                e.currentTarget.style.backgroundColor = colors.hoverBg
                e.currentTarget.style.color = colors.text
              }
            }}
            onMouseLeave={(e) => {
              if (activeMenu !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = colors.textSecondary
              }
            }}
          >
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="font-medium hidden lg:block">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t" style={{ borderColor: colors.border }}>
        <div className="relative">
          <div className="w-full flex items-center gap-3 px-2 lg:px-4 py-3 rounded-2xl">
            
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden border"
                 style={{ borderColor: colors.border }}>
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  key={avatarUrl}
                />
              ) : (
                <span className="text-white text-xs font-bold">
                  {getInitials()}
                </span>
              )}
            </div>

            <div className="text-left hidden lg:block flex-1 min-w-0">
              <p className="text-sm font-medium truncate transition-colors" style={{ color: colors.text }}>
                {dbUserData?.fullname || user?.user_metadata?.full_name || 'Usuario'}
              </p>
              <p className="text-xs truncate transition-colors" style={{ color: colors.textSecondary }}>
                {user?.email}
              </p>
            </div>
            
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-colors"
              style={{ color: colors.textSecondary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.hoverBg
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute bottom-full left-4 right-4 mb-2 rounded-2xl shadow-xl border overflow-hidden z-50 transition-colors"
                   style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                <button
                  onClick={() => { setShowUserMenu(false); router.push('/settings'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer transition-colors"
                  style={{ color: colors.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.hoverBg
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                  <span className="text-sm font-medium">Configuración</span>
                </button>
                <div className="h-px" style={{ backgroundColor: colors.border }} />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 cursor-pointer transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-medium">Cerrar sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}