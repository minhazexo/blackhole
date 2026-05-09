import { useEffect, useState, useRef } from 'react'

const PHASES = [
  { text: 'INITIALIZING_NEURAL_LINK',   icon: '◎' },
  { text: 'CALIBRATING_OPTICS',         icon: '⟁' },
  { text: 'SIMULATING_EVENT_HORIZON',   icon: '◈' },
  { text: 'MAPPING_KERR_GEODESICS',     icon: '⊛' },
  { text: 'STABILIZING_SINGULARITY',    icon: '◉' },
]

export default function LoadingScreen({ onComplete }) {
  const [progress,  setProgress]  = useState(0)
  const [phase,     setPhase]     = useState(0)
  const [isReady,   setIsReady]   = useState(false)
  const [exiting,   setExiting]   = useState(false)
  const [dots,      setDots]      = useState('')
  const [particles, setParticles] = useState([])
  const doneRef = useRef(false)

  // Generate floating data particles
  useEffect(() => {
    const p = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 5 + 3,
      delay: Math.random() * 2
    }))
    setParticles(p)
  }, [])

  // Animated ellipsis
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400)
    return () => clearInterval(id)
  }, [])

  // Progress + phase cycling
  useEffect(() => {
    const progId = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + Math.random() * 18 + 5, 100)
        if (next >= 100 && !doneRef.current) {
          doneRef.current = true
          clearInterval(progId)
          setTimeout(() => setIsReady(true), 600)
        }
        return next
      })
    }, 140)

    const phaseId = setInterval(() => {
      setPhase(p => (p + 1) % PHASES.length)
    }, 800)

    return () => { clearInterval(progId); clearInterval(phaseId) }
  }, [])

  const handleStart = () => {
    setExiting(true)
    setTimeout(() => onComplete?.(), 900)
  }

  const pct = Math.min(Math.floor(progress), 100)

  return (
    <div
      onClick={() => isReady && handleStart()}
      className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black overflow-hidden
                  ${isReady ? 'cursor-pointer' : 'cursor-wait'}
                  transition-all duration-1000 ${exiting ? 'opacity-0 scale-110 blur-xl' : 'opacity-100 scale-100 blur-0'}`}
    >
      {/* ── BACKGROUND FX ── */}
      {/* Subtle Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Floating Bits */}
      {particles.map(p => (
        <div 
          key={p.id}
          className="absolute bg-cyan-500/40 rounded-full animate-pulse pointer-events-none"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `float ${p.duration}s infinite linear`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-20 w-full animate-scan-line opacity-30" />

      {/* ── CENTRAL CONSTRUCT ── */}
      <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
        {/* Outer Pulsing Aura */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-10 border border-cyan-400" />
        
        {/* Rotating Geometric Rings */}
        <div className="absolute inset-0 border-[1px] border-dashed border-cyan-500/20 rounded-full animate-spin-slow" />
        <div className="absolute inset-4 border-[1px] border-dotted border-purple-500/30 rounded-full animate-reverse-spin" style={{ animationDuration: '15s' }} />
        <div className="absolute inset-10 border-[1px] border-cyan-500/40 rounded-full animate-spin-slow" style={{ animationDuration: '6s' }} />

        {/* The Core */}
        <div className="relative w-16 h-16 rounded-full bg-black flex items-center justify-center z-10 shadow-[0_0_50px_rgba(0,255,255,0.2)]">
          <div className="absolute inset-0 rounded-full border border-cyan-500/50 animate-pulse" />
          <span className="text-cyan-400 text-xl font-mono animate-pulse">{PHASES[phase].icon}</span>
        </div>

        {/* Orbiting Particles */}
        <div className="absolute w-full h-full animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#00ffff]" />
        </div>
      </div>

      {/* ── HUD INTERFACE ── */}
      <div className="relative z-10 flex flex-col items-center">
        {!isReady ? (
          <div className="flex flex-col items-center w-72 md:w-96">
            {/* Status Text with Glitch Feel */}
            <div className="flex justify-between w-full mb-3 font-mono text-[10px] md:text-[11px] tracking-[0.4em] uppercase">
              <span className="text-cyan-400/80 animate-pulse">{PHASES[phase].text}</span>
              <span className="text-white/60">{pct}%</span>
            </div>
            
            {/* Advanced Progress Bar */}
            <div className="relative w-full h-[3px] bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="absolute h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-purple-500 transition-all duration-300"
                style={{ width: `${pct}%`, boxShadow: '0 0 15px rgba(0,255,255,0.5)' }}
              />
              {/* Sliding highlight */}
              <div 
                className="absolute h-full w-20 bg-white/40 skew-x-12 animate-shimmer"
                style={{ left: `${pct - 10}%` }}
              />
            </div>

            {/* Sub-metrics */}
            <div className="mt-4 flex gap-6 opacity-40 font-mono text-[7px] tracking-widest text-gray-400 uppercase">
              <span>LATENCY: 4ms</span>
              <span>BUFFER: 1024KB</span>
              <span>STATUS: NOMINAL</span>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in flex flex-col items-center">
             <button
              onClick={handleStart}
              className="group relative px-14 py-4 overflow-hidden rounded-sm transition-all bg-transparent hover:scale-105 active:scale-95"
            >
              {/* Button Border - Animated Glow */}
              <div className="absolute inset-0 border border-cyan-500/40 group-hover:border-cyan-400 transition-colors" />
              <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-colors" />
              
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />

              <span className="relative text-cyan-400 font-mono text-sm tracking-[0.8em] uppercase group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] transition-all">
                Initialize_Link
              </span>

              {/* Scanline Sweep on Button */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
            </button>
            <p className="mt-4 text-[8px] font-mono text-cyan-400/40 tracking-[0.5em] uppercase animate-pulse">
              Observatory ready for interaction
            </p>
          </div>
        )}
      </div>

      {/* Footer Branded Bar */}
      <div className="absolute bottom-12 flex flex-col items-center gap-2 opacity-30">
        <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
        <p className="text-gray-400 text-[8px] font-mono tracking-[0.6em] uppercase">
          Black Hole Observatory · Optics_V2.8.4
        </p>
      </div>

      {/* Custom Global Animations for this component */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
          100% { transform: translateY(0) translateX(0); }
        }
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-spin-slow { animation: spin 10s linear infinite; }
        .animate-reverse-spin { animation: spin 8s linear infinite reverse; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  )
}
