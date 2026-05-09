import { useEffect, useState, useRef } from 'react'

const PHASES = [
  { text: 'INITIALIZING OBSERVATORY',   icon: '◎' },
  { text: 'CALIBRATING SENSORS',        icon: '⟁' },
  { text: 'RENDERING EVENT HORIZON',    icon: '◈' },
  { text: 'ALIGNING ORBITAL MECHANICS', icon: '⊛' },
  { text: 'STABILIZING SINGULARITY',    icon: '◉' },
]

export default function LoadingScreen({ onComplete }) {
  const [progress,  setProgress]  = useState(0)
  const [phase,     setPhase]     = useState(0)
  const [exiting,   setExiting]   = useState(false)
  const [dots,      setDots]      = useState('')
  const doneRef = useRef(false)

  // Animated ellipsis
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400)
    return () => clearInterval(id)
  }, [])

  // Progress + phase cycling
  useEffect(() => {
    const progId = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + Math.random() * 14 + 4, 100)
        if (next >= 100 && !doneRef.current) {
          doneRef.current = true
          clearInterval(progId)
          setTimeout(() => {
            setExiting(true)
            setTimeout(() => onComplete?.(), 900)
          }, 400)
        }
        return next
      })
    }, 180)

    const phaseId = setInterval(() => {
      setPhase(p => (p + 1) % PHASES.length)
    }, 700)

    return () => { clearInterval(progId); clearInterval(phaseId) }
  }, [onComplete])

  const pct = Math.min(Math.floor(progress), 100)

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black
                  transition-all duration-900 ${exiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
    >
      {/* Background subtle grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-scan-line absolute left-0 right-0 h-px
                        bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      </div>

      {/* Corner decorations */}
      {['top-8 left-8', 'top-8 right-8', 'bottom-8 left-8', 'bottom-8 right-8'].map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-10 h-10 opacity-20`}
          style={{
            borderTop: i < 2 ? '1px solid #00ffff' : 'none',
            borderBottom: i >= 2 ? '1px solid #00ffff' : 'none',
            borderLeft: (i === 0 || i === 2) ? '1px solid #00ffff' : 'none',
            borderRight: (i === 1 || i === 3) ? '1px solid #00ffff' : 'none',
          }}
        />
      ))}

      {/* ── Black hole animation ── */}
      <div className="relative w-40 h-40 mb-12">
        {/* Outer glow ring */}
        <div className="absolute inset-[-20px] rounded-full animate-pulse"
          style={{ boxShadow: '0 0 60px rgba(0,255,255,0.08), 0 0 120px rgba(100,0,255,0.05)' }}
        />

        {/* Accretion disk rings */}
        {[
          { size: '-12px', dur: '7s',  color: 'from-orange-500 via-yellow-300 to-cyan-400', op: 0.6 },
          { size: '-5px',  dur: '11s', color: 'from-purple-600 via-blue-400 to-cyan-300',   op: 0.5, rev: true },
          { size: '5px',   dur: '5s',  color: 'from-amber-400 via-orange-500 to-red-500',   op: 0.7 },
        ].map((ring, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${ring.rev ? 'animate-orbit-reverse' : 'animate-orbit'}`}
            style={{
              inset: ring.size,
              background: `conic-gradient(from 0deg, transparent, transparent 60%, currentColor)`,
              backgroundImage: `conic-gradient(from 0deg, transparent 0%, rgba(255,150,0,0.${Math.round(ring.op*10)}) 40%, rgba(100,200,255,0.${Math.round(ring.op*10)}) 70%, transparent 100%)`,
              animationDuration: ring.dur,
              opacity: ring.op,
              filter: 'blur(1px)',
            }}
          />
        ))}

        {/* Event horizon */}
        <div className="absolute inset-[16px] rounded-full bg-black
                        border border-cyan-500/20"
          style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,1), 0 0 8px rgba(0,255,255,0.15)' }}
        />

        {/* Central singularity pulse */}
        <div className="absolute inset-[32px] rounded-full animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(0,200,255,0.15) 0%, transparent 70%)' }}
        />

        {/* Pulse rings */}
        {[0, 0.5, 1.0].map((delay, i) => (
          <div key={i} className="absolute inset-0 rounded-full border border-cyan-500/20"
            style={{
              animation: `ripple-expand 2.5s ease-out infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </div>

      {/* Phase indicator */}
      <div className="mb-3 flex items-center gap-2.5">
        <span className="text-cyan-400/60 text-sm font-mono animate-pulse">
          {PHASES[phase].icon}
        </span>
        <span className="text-cyan-400 text-xs font-mono tracking-[0.3em] uppercase"
          style={{ minWidth: '22ch', display: 'inline-block' }}
        >
          {PHASES[phase].text}{dots}
        </span>
      </div>

      {/* Phase dots */}
      <div className="flex gap-2 mb-8">
        {PHASES.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === phase ? '20px' : '6px',
              height: '6px',
              background: i < phase
                ? 'rgba(0,255,255,0.7)'
                : i === phase
                  ? 'rgba(0,255,255,1)'
                  : 'rgba(255,255,255,0.15)',
              boxShadow: i === phase ? '0 0 8px rgba(0,255,255,0.8)' : 'none'
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-72 md:w-96">
        <div className="relative h-[2px] rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-200"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #00ccff, #bf00ff)',
              boxShadow: '0 0 12px rgba(0,200,255,0.7)',
            }}
          />
          {/* Shimmer on progress bar */}
          <div
            className="absolute top-0 left-0 h-full w-20 rounded-full"
            style={{
              left: `${pct - 5}%`,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
              filter: 'blur(4px)',
              transition: 'left 0.2s',
            }}
          />
        </div>

        <div className="flex justify-between mt-2">
          <span className="text-gray-600 text-[10px] font-mono tracking-wider">LOADING</span>
          <span className="text-cyan-400/80 text-[10px] font-mono tracking-wider">{pct}%</span>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-12 text-center">
        <p className="text-gray-600 text-[10px] font-mono tracking-[0.5em] uppercase">
          Black Hole Observatory · Kerr–Newman Simulation
        </p>
      </div>

      <div className="vignette pointer-events-none" />
    </div>
  )
}
