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
  const [isReady,   setIsReady]   = useState(false)
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
        const next = Math.min(p + Math.random() * 25 + 5, 100)
        if (next >= 100 && !doneRef.current) {
          doneRef.current = true
          clearInterval(progId)
          setTimeout(() => setIsReady(true), 400)
        }
        return next
      })
    }, 150)

    const phaseId = setInterval(() => {
      setPhase(p => (p + 1) % PHASES.length)
    }, 600)

    return () => { clearInterval(progId); clearInterval(phaseId) }
  }, [])

  const handleStart = () => {
    setExiting(true)
    setTimeout(() => onComplete?.(), 800)
  }

  const pct = Math.min(Math.floor(progress), 100)

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black
                  transition-all duration-700 ${exiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
    >
      {/* Background subtle grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* ── Black hole animation ── */}
      <div className="relative w-32 h-32 mb-10">
        <div className="absolute inset-0 rounded-full animate-pulse border border-cyan-500/20 shadow-[0_0_40px_rgba(0,255,255,0.1)]" />
        <div className="absolute inset-4 rounded-full bg-black border border-cyan-500/10 shadow-[inset_0_0_20px_rgba(0,0,0,1)]" />
      </div>

      {!isReady ? (
        <div className="flex flex-col items-center w-64 md:w-80">
          <div className="flex justify-between w-full mb-2 font-mono text-[10px] text-cyan-400/60 uppercase tracking-widest">
            <span>{PHASES[phase].text}{dots}</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full h-[1px] bg-white/10 overflow-hidden rounded-full">
            <div 
              className="h-full bg-cyan-400 transition-all duration-200"
              style={{ width: `${pct}%`, boxShadow: '0 0 10px #00ffff' }}
            />
          </div>
        </div>
      ) : (
        <button
          onClick={handleStart}
          className="group relative px-10 py-3.5 overflow-hidden rounded-sm transition-all border border-cyan-500/30 hover:border-cyan-500 bg-cyan-500/5 hover:bg-cyan-500/10"
        >
          <span className="relative text-cyan-400 font-mono text-xs tracking-[0.6em] uppercase group-hover:text-white transition-all">
            Enter Observatory
          </span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </button>
      )}

      <div className="absolute bottom-10 text-center opacity-20">
        <p className="text-gray-400 text-[8px] font-mono tracking-[0.4em] uppercase">
          Black Hole Observatory · System v2.8.4
        </p>
      </div>
    </div>
  )
}
