'use client'
import { useTheme } from '@/app/context/Theme.context'

export default function AuthBranding() {
  const { theme } = useTheme()

  return (
    <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden" 
         style={{ backgroundColor: theme === 'light' ? '#09090b' : '#000000', color: '#ffffff' }}>
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[100px]" style={{ background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[100px]" style={{ background: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)' }}></div>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white text-black">
          <svg className="w-6 h-6" viewBox="0 0 24 29" fill="none">
            <path d="M3 20h18M5 20V14h3v6M10 20V9h3v11M15 20V11h3v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight">Control Capital</span>
      </div>

      {/* Hero Text */}
      <div className="relative z-10 max-w-lg">
        <h2 className="text-5xl font-bold mb-6 leading-tight">
          Prioriza tu paz mental.
        </h2>
        <p className="text-zinc-400 text-lg mb-8">
          Organiza tus cuentas con total tranquilidad. Sin algoritmos espiando tus hábitos y sin necesidad de vincular tus tarjetas de crédito.
        </p>
        
        {/* Mockup UI Component */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-green-400 font-bold">€</span>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Ahorro mensual proyectado</p>
            <p className="text-xl font-bold text-white">+450.00 €</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} Control Capital. Todos los derechos reservados.</p>
      </div>
    </div>
  )
}