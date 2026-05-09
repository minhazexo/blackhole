import { useState, useCallback } from 'react'
import GlassPanel from './GlassPanel'
import NeonButton from './NeonButton'
import DataPanel from './DataPanel'

export default function UI({
  intensity = 1,
  isHighIntensity = false,
  soundEnabled = false,
  autoRotate = false,
  quality = 2,
  viewMode = 'cinematic',
  onIntensityToggle,
  onSoundToggle,
  onAutoRotateToggle,
  onViewToggle,
  onQualityChange,
  onToggleStats
}) {
  const [showInfo, setShowInfo] = useState(false)

  const handleInfoToggle = useCallback(() => setShowInfo(p => !p), [])

  const qualityLabels = ['LOW', 'MED', 'HIGH']
  const qualityColors = ['text-red-400', 'text-amber-400', 'text-cyan-400']

  return (
    <>
      {/* ───── TOP BAR ───── */}
      <div
        className="fixed top-0 left-0 right-0 z-20 p-4 md:p-5 flex justify-between items-center animate-fade-in-down pointer-events-none"
        style={{ animationDelay: '200ms' }}
      >
        {/* Brand */}
        <GlassPanel variant="elevated" accent="cyan" animate="none" className="px-5 py-2.5 pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-glow" />
            <span className="text-cyan-400 font-mono text-xs tracking-[0.35em] uppercase">
              Event Horizon
            </span>
          </div>
        </GlassPanel>

        {/* Top-right controls */}
        <div className="flex gap-2 pointer-events-auto">
          {/* Sound */}
          <button
            id="sound-toggle-btn"
            onClick={() => onSoundToggle?.(!soundEnabled)}
            title={soundEnabled ? 'Mute ambient sound' : 'Enable ambient sound'}
            className="glass-elevated rounded-xl px-3 py-2.5 text-xs font-mono tracking-wider
                       text-cyan-400/70 hover:text-cyan-400 transition-all duration-300
                       hover:glow-cyan-sm border border-transparent hover:border-cyan-500/30"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Quality badge */}
          <button
            id="quality-toggle-btn"
            onClick={() => onQualityChange?.((quality + 1) % 3)}
            title="Cycle rendering quality"
            className="glass-elevated rounded-xl px-3 py-2.5 font-mono text-xs tracking-widest
                       transition-all duration-300 hover:glow-cyan-sm
                       border border-transparent hover:border-cyan-500/30"
          >
            <span className={qualityColors[quality]}>Q:{qualityLabels[quality]}</span>
          </button>

          {/* Stats */}
          <button
            id="stats-toggle-btn"
            onClick={onToggleStats}
            title="Toggle performance stats"
            className="glass-elevated rounded-xl px-3 py-2.5 font-mono text-xs tracking-widest
                       text-gray-400/60 hover:text-gray-300 transition-all duration-300
                       border border-transparent hover:border-white/15"
          >
            ⚙
          </button>

          <GlassPanel variant="elevated" animate="none" className="px-4 py-2.5 hidden md:block">
            <span className="text-gray-400/60 font-mono text-[10px] tracking-[0.4em]">
              OBSERVATORY v2.0
            </span>
          </GlassPanel>
        </div>
      </div>

      {/* ───── CENTER TITLE ───── */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   z-10 pointer-events-none w-full px-4"
        style={{ marginTop: '-15vh' }}
      >
        <GlassPanel
          variant="prominent"
          accent="cyan"
          glow="sm"
          animate="fadeInScale"
          delay={500}
          edgeLight
          noise
          className="px-8 py-6 text-center max-w-md mx-auto"
        >
          <p className="text-cyan-400/50 font-mono text-[10px] tracking-[0.5em] mb-3 uppercase">
            Stellar Classification: K1* · Kerr Metric
          </p>
          <h1
            className="text-white/90 font-light tracking-[0.25em] mb-1 animate-breathe"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)' }}
          >
            SINGULARITY
          </h1>
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent my-3" />
          <p className="text-cyan-400/55 font-mono text-[10px] tracking-[0.35em] uppercase">
            Gravitational Anomaly · Mass: 4.2M ☉
          </p>
        </GlassPanel>
      </div>

      {/* ───── RIGHT STATS PANEL ───── */}
      <div
        className="fixed right-5 top-1/2 -translate-y-1/2 z-20
                   hidden lg:flex flex-col gap-3 pointer-events-none
                   animate-slide-in-right"
        style={{ animationDelay: '800ms' }}
      >
        <DataPanel label="MASS"     value="4.2M"   unit="☉"  status="active"   animate />
        <DataPanel label="DISTANCE" value="26,000"  unit="ly" status="default"  />
        <DataPanel label="TEMP"     value="1.2M"   unit="K"  status="warning"  />
        <DataPanel label="SPIN"     value="0.998"  unit="a*" status="critical" />
        <DataPanel label="GRAVITY"  value={isHighIntensity ? 'MAX' : 'NOM'} status={isHighIntensity ? 'critical' : 'active'} animate />
      </div>

      {/* ───── INFO PANEL ───── */}
      {showInfo && (
        <div
          className="fixed left-5 top-1/2 -translate-y-1/2 z-20 max-w-sm
                     animate-slide-in-left hidden md:block"
        >
          <GlassPanel variant="floating" accent="purple" glow="sm" edgeLight className="p-6">
            <p className="text-purple-400 font-mono text-[11px] tracking-widest mb-4 uppercase border-b border-purple-500/20 pb-2">
              Einstein Field Equations
            </p>
            <div className="space-y-4 text-[10px] font-mono text-gray-300/80 leading-relaxed tracking-wide">
              <div>
                <p className="text-cyan-400 mb-1">General Relativity (Vacuum T_μν = 0)</p>
                <p>G_μν + Λg_μν = (8πG / c⁴) T_μν</p>
              </div>
              
              <div>
                <p className="text-amber-400 mb-1">Schwarzschild Metric (Static)</p>
                <p>ds² = -(1 - 2GM/rc²)c²dt²</p>
                <p className="pl-8">+ (1 - 2GM/rc²)⁻¹dr² + r²dΩ²</p>
              </div>

              <div>
                <p className="text-red-400 mb-1">Kerr Metric Horizon (Rotating J)</p>
                <p>r+ = GM/c² + √((GM/c²)² - (J/Mc)²)</p>
              </div>

              <div>
                <p className="text-purple-400 mb-1">Hawking Temperature & Entropy</p>
                <p>T = ℏc³ / (8πGMk_B)</p>
                <p>S = (k_B c³ A) / (4Gℏ)</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-[9px] text-gray-500/70 font-mono tracking-widest uppercase">
              Simulating Lense-Thirring Frame Dragging
            </div>
          </GlassPanel>
        </div>
      )}

      {/* ───── BOTTOM CONTROLS ───── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 p-4 md:p-6
                   flex flex-col md:flex-row justify-center items-center gap-3
                   animate-fade-in-up pointer-events-none"
        style={{ animationDelay: '700ms' }}
      >
        {/* Gravity toggle */}
        <NeonButton
          id="gravity-btn"
          onClick={onIntensityToggle}
          color={isHighIntensity ? 'purple' : 'cyan'}
          glow
          className="pointer-events-auto"
        >
          {isHighIntensity ? '⚡ GRAVITY: MAXIMUM' : '◎ GRAVITY: NOMINAL'}
        </NeonButton>

        {/* Auto-rotate */}
        <NeonButton
          id="rotate-btn"
          onClick={onAutoRotateToggle}
          color={autoRotate ? 'purple' : 'cyan'}
          variant="outline"
          glow={autoRotate}
          className="pointer-events-auto"
        >
          {autoRotate ? '⟳ ORBIT: AUTO' : '⟳ ORBIT: MANUAL'}
        </NeonButton>

        {/* View Toggle */}
        <NeonButton
          id="view-btn"
          onClick={onViewToggle}
          color="cyan"
          variant="outline"
          className="pointer-events-auto"
        >
          👁 VIEW: {viewMode.toUpperCase()}
        </NeonButton>

        {/* Info toggle */}
        <NeonButton
          id="info-btn"
          onClick={handleInfoToggle}
          color="cyan"
          variant="ghost"
          className="pointer-events-auto hidden md:inline-flex"
        >
          {showInfo ? '✕ HIDE DATA' : 'ℹ DATA'}
        </NeonButton>
      </div>

      {/* ───── MOBILE STATS STRIP ───── */}
      <div
        className="lg:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-20
                   flex flex-row gap-2 pointer-events-none animate-fade-in-up"
        style={{ animationDelay: '900ms' }}
      >
        <DataPanel label="MASS"   value="4.2M"  unit="☉"  status="active"   variant="compact" />
        <DataPanel label="DIST"   value="26k"   unit="ly" status="default"  variant="compact" />
        <DataPanel label="SPIN"   value="0.998" unit="a*" status="critical" variant="compact" />
      </div>

      {/* ───── SCROLL HINT ───── */}
      <div
        className="fixed bottom-20 md:bottom-[5.5rem] left-1/2 -translate-x-1/2 z-10
                   pointer-events-none animate-fade-in"
        style={{ animationDelay: '1200ms' }}
      >
        <div className="flex flex-col items-center gap-1.5 opacity-35">
          <span className="text-gray-400 text-[9px] font-mono tracking-[0.4em]">DRAG · SCROLL · CLICK</span>
          <div className="w-px h-7 bg-gradient-to-b from-cyan-500/60 to-transparent animate-pulse" />
        </div>
      </div>

      {/* ───── VIGNETTE ───── */}
      <div className="vignette pointer-events-none" />
    </>
  )
}
