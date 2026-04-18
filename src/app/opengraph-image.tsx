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

        {/* Logo oficial — icono + texto en fila */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '48px', gap: '14px' }}>
        <div style={{
            width: '48px',
            height: '48px',
            background: '#ffffff',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <svg width="28" height="24" viewBox="0 0 24 21" fill="none" stroke="#09090b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="20" x2="21" y2="20" />
            <rect x="4" y="13" width="4" height="7" rx="0.5" />
            <rect x="10" y="8" width="4" height="12" rx="0.5" />
            <rect x="16" y="10" width="4" height="10" rx="0.5" />
            </svg>
        </div>
        <span style={{ color: '#ffffff', fontSize: '24px', fontWeight: '700' }}>
            Control Capital
        </span>
        </div>

        {/* Titular */}
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