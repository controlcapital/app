import { ImageResponse } from 'next/og'

export const alt = 'Control Capital — App gratuita de finanzas personales'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#09090b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow azul */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(4,118,217,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: '#ffffff',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#09090b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 20h18M5 20V14h3v6M10 20V9h3v11M15 20V11h3v9"/>
            </svg>
          </div>
          <span style={{ color: '#ffffff', fontSize: '22px', fontWeight: '700' }}>
            Control Capital
          </span>
        </div>

        {/* Titular — dos líneas separadas para evitar el bug de color en spans */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
          <span style={{ color: '#ffffff', fontSize: '72px', fontWeight: '800', letterSpacing: '-3px', lineHeight: '1.05' }}>
            Tus finanzas,
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ color: '#ffffff', fontSize: '72px', fontWeight: '800', letterSpacing: '-3px', lineHeight: '1.05' }}>
              bajo
            </span>
            <span style={{ color: '#0476D9', fontSize: '72px', fontWeight: '800', letterSpacing: '-3px', lineHeight: '1.05' }}>
              control.
            </span>
          </div>
        </div>

        {/* Descripción */}
        <div style={{ color: '#a1a1aa', fontSize: '24px', fontWeight: '300', lineHeight: '1.5', marginBottom: '48px', maxWidth: '650px', display: 'flex' }}>
          Registra ingresos, controla gastos y crea metas de ahorro. Gratis y sin publicidad.
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {['100% Gratuito', 'Sin publicidad', 'Funciona en móvil'].map((tag) => (
            <div
              key={tag}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '100px',
                padding: '10px 20px',
                color: '#a1a1aa',
                fontSize: '16px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ color: '#0476D9' }}>✓</span>
              {tag}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{ position: 'absolute', bottom: '48px', right: '80px', color: '#52525b', fontSize: '18px', fontWeight: '600', display: 'flex' }}>
          controlcapital.es
        </div>
      </div>
    ),
    { ...size }
  )
}