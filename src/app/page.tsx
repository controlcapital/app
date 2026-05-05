import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Control Capital — App gratuita de finanzas personales',
  description: 'Controla tus ingresos, gastos y metas de ahorro desde cualquier dispositivo. Gratis y sin publicidad.',
  keywords: ['finanzas personales', 'control de gastos', 'app ahorro', 'gestión dinero', 'presupuesto personal'],
}

// Schema structured data para Google
const schemaData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Control Capital",
  "url": "https://controlcapital.es",
  "description": "App gratuita de finanzas personales para controlar ingresos, gastos y metas de ahorro desde cualquier dispositivo.",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  },
  "featureList": [
    "Panel de control con balance en tiempo real",
    "Registro de ingresos por categoría",
    "Control de gastos con estado de pago",
    "Metas de ahorro personalizadas"
  ],
  "inLanguage": "es",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "ratingCount": "1"
  }
}

const faqData = [
  {
    question: "¿Control Capital es realmente gratis?",
    answer: "Sí, 100% gratis. Sin planes de pago, sin tarjeta de crédito, sin prueba gratuita que caduca. Gratis de verdad, para siempre."
  },
  {
    question: "¿Funciona en el móvil?",
    answer: "Sí. Control Capital está diseñada para funcionar perfectamente en móvil, tablet y ordenador. Solo necesitas un navegador, no hay que instalar nada."
  },
  {
    question: "¿Mis datos financieros están seguros?",
    answer: "Tus datos se almacenan de forma segura y nunca se venden a terceros ni se usan para publicidad. La app no tiene anuncios de ningún tipo."
  },
  {
    question: "¿Qué puedo registrar en la app?",
    answer: "Puedes registrar ingresos (sueldo, freelance, inversiones...), gastos por categoría con estado de pago, y crear metas de ahorro personalizadas para seguir tu progreso."
  },
  {
    question: "¿Necesito instalar algo?",
    answer: "No. Control Capital funciona directamente desde el navegador en cualquier dispositivo. Solo crea tu cuenta y empieza a usarla."
  },
  {
    question: "¿Hay límite de registros?",
    answer: "No. Puedes añadir todos los ingresos, gastos y metas que quieras, sin límites."
  }
]

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqData.map(({ question, answer }) => ({
    "@type": "Question",
    "name": question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": answer
    }
  }))
}

// Iconos Reales del Dashboard
const Icons = {
  Dashboard: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  Ingresos: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M17 7H7M17 7V17" />
    </svg>
  ),
  Gastos: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7l10 10M17 7v10H7" />
    </svg>
  ),
  Ahorro: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M3 10h18M5 10v11M19 10v11M12 10v11M4 10l8-7 8 7" />
    </svg>
  )
}

export default function Home() {
  return (
    <main className="bg-white text-zinc-900 overflow-x-hidden">

      {/* ── SCHEMA JSON-LD ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-16 border-b border-zinc-200"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}>
        <Link href="/" className="flex items-center gap-2 no-underline">
          <img src="/logo_negro-1.png" alt="Control Capital" height={36} style={{ height: '36px', width: 'auto' }} />
        </Link>
        <Link href="/login"
          className="bg-zinc-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-80 transition-opacity no-underline">
          Iniciar sesión →
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-10 pt-32 pb-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-60 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(#e4e4e7 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 70%)' }} />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
               style={{ background: '#e8f3fd', color: '#0476D9' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#0476D9' }} />
            Disponible ahora — 100% gratuito
          </div>

          <h1 className="font-extrabold leading-none mb-7 text-zinc-900"
              style={{ fontSize: 'clamp(48px, 8vw, 88px)', letterSpacing: '-3px' }}>
            Tus finanzas,<br />bajo <span style={{ color: '#0476D9' }}>control.</span>
          </h1>

          <p className="text-xl font-light text-zinc-500 leading-relaxed max-w-lg mx-auto mb-12">
            Registra tus ingresos, controla tus gastos y crea metas de ahorro. Todo en un solo lugar, desde cualquier dispositivo.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            {/* ← CTA principal apunta a registro directamente */}
            <Link href="/login?tab=register"
              className="bg-zinc-900 text-white px-9 py-4 rounded-full text-base font-bold no-underline transition-transform hover:-translate-y-0.5"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
              Empezar gratis →
            </Link>
            <a href="#funcionalidades" className="text-zinc-500 text-sm font-medium flex items-center gap-1.5 hover:text-zinc-900 transition-colors no-underline">
              Ver cómo funciona
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 mt-12 flex-wrap">
            {['Sin publicidad', 'Sin tarjeta de crédito', 'Funciona en móvil'].map(tag => (
              <div key={tag} className="flex items-center gap-1.5 text-xs text-zinc-400">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
                {tag}
              </div>
            ))}
          </div>

          {/* ── PRUEBA SOCIAL ── */}
          {/* Actualiza el número cuando tengas más usuarios */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="flex -space-x-2">
              {['#0476D9', '#16a34a', '#ea580c', '#8b5cf6'].map((color, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-black"
                     style={{ background: color }}>
                  {['AB', 'MG', 'LR', 'PR'][i]}
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-500">
              <span className="font-bold text-zinc-900">+50 personas</span> ya controlan sus finanzas con Control Capital
            </p>
          </div>
        </div>

        {/* Mockup */}
        <div className="relative z-10 mt-12 md:mt-20 w-full max-w-5xl mx-auto px-2 md:px-4">
          <div className="rounded-2xl md:rounded-[2rem] overflow-hidden border border-zinc-200 bg-[#F4F4F5] shadow-2xl flex flex-col min-h-[500px] h-auto lg:h-[620px]">
            
            <div className="bg-white border-b border-zinc-100 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
              <div className="flex gap-1.5 md:gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-zinc-200" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-zinc-200" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-zinc-200" />
              </div>
              <div className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 px-3 md:px-4 py-1 rounded-full border border-zinc-100 truncate max-w-[150px] md:max-w-none">
                controlcapital.es/app
              </div>
              <div className="hidden md:block w-10" />
            </div>

            <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
              <div className="w-56 bg-white border-r border-zinc-100 p-5 flex-col gap-1 hidden lg:flex">
                <div className="bg-black text-white rounded-xl px-4 py-3 flex items-center gap-3 text-[11px] font-bold mb-4 shadow-lg shadow-black/10">
                  <Icons.Dashboard /> Panel de control
                </div>
                {[
                  { name: 'Ingresos', icon: <Icons.Ingresos /> },
                  { name: 'Gastos', icon: <Icons.Gastos /> },
                  { name: 'Ahorro', icon: <Icons.Ahorro /> }
                ].map((item) => (
                  <div key={item.name} className="text-zinc-400 px-4 py-3 flex items-center gap-3 text-[11px] font-bold hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all cursor-pointer">
                    {item.icon}
                    {item.name}
                  </div>
                ))}
                <div className="mt-auto pt-4 border-t border-zinc-50 flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black">ÁB</div>
                  <div className="text-[10px] font-bold text-zinc-900">Álvaro del B...</div>
                </div>
              </div>

              <div className="flex-1 p-4 md:p-8 text-left overflow-y-auto bg-[#fcfcfc]">
                <div className="mb-6 md:mb-8">
                  <p className="text-[8px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mb-1">miércoles, 15 de abril de 2026</p>
                  <h3 className="text-xl md:text-3xl font-black text-zinc-900 tracking-tight">Buenas tardes, Álvaro 👋</h3>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                  {[
                    { label: 'Ingresos', val: '2.840 €', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Gastos', val: '1.250 €', color: 'text-rose-500', bg: 'bg-rose-50' },
                    { label: 'Balance', val: '1.590 €', color: 'text-zinc-900', bg: 'bg-zinc-100' },
                    { label: '% Ahorro', val: '56%', color: 'text-blue-500', bg: 'bg-blue-50', progress: 56 },
                  ].map((card, i) => (
                    <div key={i} className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-zinc-100/50">
                      <div className="flex items-center gap-2 mb-2 md:mb-4">
                        <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${card.color.replace('text', 'bg')}`} />
                        <span className="text-[7px] md:text-[9px] font-black text-zinc-400 uppercase tracking-widest">{card.label}</span>
                      </div>
                      <div className={`text-sm md:text-2xl font-black ${card.color}`}>{card.val}</div>
                      {card.progress && (
                        <div className="h-1 md:h-1.5 w-full bg-zinc-100 rounded-full mt-2 md:mt-4 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${card.progress}%` }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl md:rounded-[32px] p-4 md:p-8 shadow-sm border border-zinc-100/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-10">
                    <div>
                      <h4 className="text-[10px] md:text-xs font-black uppercase tracking-tight">Evolución mensual</h4>
                      <p className="text-[8px] md:text-[10px] text-zinc-400 font-bold">Últimos 6 meses</p>
                    </div>
                    <div className="flex gap-3 md:gap-4">
                      <div className="flex items-center gap-1.5 text-[7px] md:text-[9px] font-bold text-zinc-400"><div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-emerald-500" /> INGRESOS</div>
                      <div className="flex items-center gap-1.5 text-[7px] md:text-[9px] font-bold text-zinc-400"><div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-rose-500" /> GASTOS</div>
                    </div>
                  </div>

                  <div className="w-full relative">
                    <svg viewBox="0 0 1000 250" className="w-full h-auto overflow-visible">
                      <defs>
                        <linearGradient id="grad-green" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="grad-red" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="0" x2="1000" y2="0" stroke="#f4f4f5" strokeWidth="2" />
                      <line x1="0" y1="125" x2="1000" y2="125" stroke="#f4f4f5" strokeWidth="2" />
                      <line x1="0" y1="250" x2="1000" y2="250" stroke="#f4f4f5" strokeWidth="2" />
                      <path d="M 0 230 Q 200 220 400 225 Q 600 230 800 130 T 1000 30" fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 0 230 Q 200 220 400 225 Q 600 230 800 130 T 1000 30 L 1000 250 L 0 250 Z" fill="url(#grad-green)" />
                      <path d="M 0 240 Q 200 235 400 238 Q 600 235 800 200 T 1000 150" fill="none" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 0 240 Q 200 235 400 238 Q 600 235 800 200 T 1000 150 L 1000 250 L 0 250 Z" fill="url(#grad-red)" />
                    </svg>
                    <div className="flex justify-between mt-4 px-1">
                      {['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'].map(m => (
                        <span key={m} className="text-[7px] md:text-[9px] font-black text-zinc-300 uppercase tracking-widest">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="funcionalidades" className="px-10 py-24 max-w-6xl mx-auto">
        <div className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#0476D9' }}>Funcionalidades</div>
        <h2 className="font-extrabold mb-4 text-zinc-900"
            style={{ fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-2px', lineHeight: '1.05' }}>
          Todo lo que necesitas <br/> para gestionar tu dinero.
        </h2>
        <p className="text-lg font-light text-zinc-500 leading-relaxed max-w-lg mb-16">
          Sin hojas de cálculo. Sin complicaciones. Solo tú y tus finanzas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { color: '#09090b', title: 'Panel de control', desc: 'Visualiza tu balance en tiempo real. Sabe exactamente cuánto tienes, cuánto has gastado y cuánto te queda este mes.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { color: '#0476D9', title: 'Registro de ingresos', desc: 'Añade y categoriza todos tus ingresos. Sueldo, freelance, inversiones... todo organizado por categorías.', icon: 'M12 4v16m8-8H4' },
            { color: '#ea580c', title: 'Control de gastos', desc: 'Registra cada gasto con categoría y estado. Diferencia entre pagado y pendiente para no perder ningún pago.', icon: 'M20 12H4' },
            { color: '#16a34a', title: 'Metas de ahorro 🐷', desc: 'Crea metas personalizadas, aporta dinero cuando puedas y sigue tu progreso hacia cada objetivo.', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
            { color: '#09090b', title: 'Funciona en móvil', desc: 'Diseñada para usarla desde cualquier dispositivo. Móvil, tablet u ordenador — misma experiencia en todos.', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
            { color: '#0476D9', title: 'Seguro y privado', desc: 'Tus datos son tuyos. Sin publicidad, sin venta de datos, sin suscripciones. Gratis de verdad, sin letra pequeña.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
          ].map(({ color, title, desc, icon }) => (
            <div key={title} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 hover:-translate-y-1 hover:shadow-lg hover:border-zinc-400 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: color }}>
                <svg className="w-6 h-6" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d={icon} />
                </svg>
              </div>
              <div className="font-bold text-xl mb-2.5 text-zinc-900">{title}</div>
              <div className="text-sm font-light text-zinc-500 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-zinc-900 py-20 px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { value: '100%', label: 'Gratuito.\nSin tarjeta.' },
            { value: '0€', label: 'En publicidad.\nPara siempre.' },
            { value: '3', label: 'Módulos:\nIngresos, Gastos, Ahorro.' },
            { value: '∞', label: 'Registros.\nSin límites.' },
          ].map(({ value, label }) => (
            <div key={value}>
              <div className="font-extrabold text-white leading-none mb-2"
                   style={{ fontSize: '56px', letterSpacing: '-3px' }}>{value}</div>
              <div className="text-sm font-light text-zinc-500 leading-snug whitespace-pre-line">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="px-10 py-24 max-w-3xl mx-auto">
        <div className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#0476D9' }}>FAQ</div>
        <h2 className="font-extrabold mb-16 text-zinc-900"
            style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-2px', lineHeight: '1.1' }}>
          Preguntas frecuentes
        </h2>

        <div className="space-y-0">
          {faqData.map(({ question, answer }, i) => (
            <details key={i} className="group border-t border-zinc-200 last:border-b">
              <summary className="flex items-center justify-between gap-4 py-6 cursor-pointer list-none font-semibold text-zinc-900 hover:text-zinc-600 transition-colors">
                {question}
                <svg className="w-5 h-5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </summary>
              <p className="pb-6 text-zinc-500 font-light leading-relaxed -mt-2">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-60 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(#e4e4e7 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 70%)' }} />
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="font-extrabold leading-none mb-6 text-zinc-900"
              style={{ fontSize: 'clamp(36px, 6vw, 64px)', letterSpacing: '-3px' }}>
            Empieza a controlar<br />tu dinero hoy.
          </h2>
          <p className="text-lg font-light text-zinc-500 leading-relaxed mb-10">Sin complicaciones. Sin excusas. Solo tú y tus finanzas.</p>
          {/* ← CTA también apunta a registro */}
          <Link href="/login?tab=register"
            className="inline-block bg-zinc-900 text-white px-9 py-4 rounded-full text-base font-bold no-underline hover:-translate-y-0.5 transition-transform"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
            Crear cuenta gratis →
          </Link>
          <p className="text-xs text-zinc-400 mt-4">Sin tarjeta de crédito · Sin publicidad · Sin trampa</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-200 px-10 py-8 flex items-center justify-between flex-wrap gap-4">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 20h18M5 20V14h3v6M10 20V9h3v11M15 20V11h3v9"/>
            </svg>
          </div>
          <span className="font-bold text-sm text-zinc-900">Control Capital</span>
        </Link>
        <div className="flex gap-6">
          <a href="https://www.iubenda.com/privacy-policy/37621247" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors no-underline">Política de Privacidad</a>
          <a href="https://www.iubenda.com/privacy-policy/37621247/cookie-policy" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors no-underline">Política de Cookies</a>
          <Link href="/login" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors no-underline">Iniciar sesión</Link>
        </div>
        <span className="text-xs text-zinc-400">© 2026 Control Capital</span>
      </footer>

    </main>
  )
}