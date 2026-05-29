import type { Metadata } from 'next'
import Link from 'next/link'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Control Capital',
  description: 'El organizador financiero para el hogar. Detectad fugas de dinero, planificad metas en común y tomad el control de vuestro futuro sin usar Excel.',
}

// Schema structured data
const schemaData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Control Capital",
  "url": "https://controlcapital.es",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  }
}

export default function Home() {
  return (
    <main className={`${inter.className} bg-[#050505] text-white selection:bg-emerald-500 selection:text-white antialiased overflow-x-hidden min-h-screen relative`}>
      
      {/* ── SCHEMA ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      {/* ── BACKGROUND GLOW EFFECTS ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-20 pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)' }} />

      {/* ── NAV GLASSMORPHISM ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-md">
        <Link href="/" className="font-bold text-lg tracking-tight text-white inline-flex items-center no-underline">
          <svg viewBox="0 0 32 24" fill="none" className="w-12 h-9 -translate-y-[5px]">
            <path 
              d="M3 20h18M5 20V14h3v6M10 20V9h3v11M15 20V11h3v9" 
              stroke="white" 
              strokeWidth="1.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          Control Capital
        </Link>
        
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="text-zinc-400 hover:text-white transition-colors hidden md:block no-underline">
            Iniciar sesión
          </Link>
          <Link href="/login?tab=register" 
            className="bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] no-underline">
            Entrar Gratis
          </Link>
        </div>
      </nav>

      {/* ── HERO SECTION (ALTA CONVERSIÓN) ── */}
      <section className="relative pt-40 pb-20 px-6 flex flex-col items-center text-center z-10">
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 bg-white/5 border border-white/10 backdrop-blur-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-zinc-300">Acceso Beta Abierto</span>
        </div>

        <h1 className="font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6"
            style={{ fontSize: 'clamp(48px, 8vw, 88px)', lineHeight: '1.05' }}>
          El dinero vuela.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Descubre dónde.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl font-light leading-relaxed mb-10">
          Controla tus gastos, planifica tus metas y olvídate del estrés de final de mes. Seguro y privado.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link href="/login?tab=register"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-black bg-white rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.3)] no-underline w-full sm:w-auto">
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-emerald-400 rounded-full group-hover:w-56 group-hover:h-56"></span>
            <span className="relative flex items-center gap-2">
              Empezar gratis
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>
        </div>
        <p className="mt-4 text-xs text-zinc-500 tracking-wide font-medium">Sin conectar bancos · Sin tarjeta de crédito</p>

        {/* ── FLOATING UI ELEMENTS (THE "WOW" FACTOR) ── */}
        <div className="mt-20 relative w-full max-w-6xl mx-auto px-4">
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            
            {/* Floating Card 1 (Gastos de Hogar) - IZQUIERDA */}
            <div className="w-full md:w-64 bg-black border border-rose-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(244,63,94,0.15)] md:animate-[bounce_4s_infinite_ease-in-out] order-2 md:order-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">📺</div>
                <div className="text-sm font-bold text-white">Gasto duplicado</div>
              </div>
              <div className="text-xs text-zinc-400">Netflix & Disney+ (Poco uso este mes)</div>
              <div className="mt-3 text-rose-400 font-black">-28,98 €</div>
            </div>

            {/* Card Central */}
            <div className="w-full md:w-auto md:flex-shrink-0 md:max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl order-1 md:order-2">
              <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-zinc-400 font-medium">Balance</div>
                <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wider">Saludable</div>
              </div>
              <div className="text-5xl font-black text-white mb-8 tracking-tighter">1.840,50 €</div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 w-[65%]" />
              </div>
              <div className="mt-2 text-right text-xs font-bold text-emerald-400">Objetivo: 65% completado</div>
            </div>

            {/* Floating Card 2 (Ingreso conjunto) - DERECHA */}
            <div className="w-full md:w-56 bg-black border border-emerald-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.15)] md:animate-[bounce_5s_infinite_ease-in-out_reverse] order-3">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs font-bold text-zinc-300">Ingreso Registrado</div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" />
              </div>
              <div className="text-xs text-zinc-500 mb-2">Nómina Conjunta</div>
              <div className="text-lg font-black text-emerald-400">+3.450,00 €</div>
            </div>

          </div>
        </div>
        
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">Prioriza tu paz mental.</h2>
            <p className="text-zinc-400 text-lg font-light">Pensado para que organices tus cuentas con total tranquilidad, solo o en compañía.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Adiós a los sustos",
                desc: "Identificad exactamente en qué se va el presupuesto mensual. Registrad luz, comida o caprichos y cortad las fugas invisibles de dinero.",
                icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              },
              {
                title: "Metas en Común",
                desc: "¿Ahorrando para la entrada de un piso? ¿Para la llegada de un bebé? Cread metas de ahorro visuales y alcanzad los objetivos juntos.",
                icon: "M13 10V3L4 14h7v7l9-11h-7z"
              },
              {
                title: "Privacidad Familiar",
                desc: "Sin conectar cuentas bancarias. Sin algoritmos espiando vuestros hábitos. Vosotros introducís los datos, vosotros tenéis el control absoluto.",
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white/5 border border-white/5 hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-300 p-8 rounded-3xl group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-zinc-400 font-light leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA WITH GLOW ── */}
      <section className="py-32 px-6 relative flex justify-center items-center">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent pointer-events-none" />
        <div className="relative z-10 w-full max-w-3xl bg-white/5 border border-white/10 backdrop-blur-md rounded-[3rem] p-12 md:p-20 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6">
            Construye TU futuro.<br/>Hoy.
          </h2>
          <p className="text-zinc-400 mb-10 text-lg font-light">Miles de personas ya controlan su dinero. Tú puedes ser la siguiente.</p>
          <Link href="/login?tab=register"
            className="inline-block bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-10 py-5 rounded-full text-lg font-bold shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] hover:scale-105 transition-all duration-300 no-underline">
            Empieza a ahorrar ahora
          </Link>
        
        </div>

      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 py-8 px-6 text-center z-10 relative bg-[#050505]">
        <p className="text-xs text-zinc-600 font-medium">
          © 2026. Control Capital
          {' · '}
          <a href="https://www.iubenda.com/privacy-policy/37621247" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Política de Privacidad
          </a>
          {' · '}
          <a href="https://www.iubenda.com/privacy-policy/37621247/cookie-policy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Política de Cookies
          </a>
        </p>
      </footer>

    </main>
  )
}