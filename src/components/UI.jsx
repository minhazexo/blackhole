import { useState, useCallback, useEffect } from 'react'
import GlassPanel from './GlassPanel'
import NeonButton from './NeonButton'
import DataPanel from './DataPanel'

/**
 * Professional Observatory UI
 * A high-precision HUD design following cinematic sci-fi principles.
 * Minimalist overlays, high-tech aesthetics, and responsive layout.
 */
export default function UI({
  intensity = 1,
  isHighIntensity = false,
  soundEnabled = false,
  autoRotate = false,
  quality = 2,
  viewMode = 'cinematic',
  brightnessLevelIdx = 2,
  onIntensityToggle,
  onSoundToggle,
  onAutoRotateToggle,
  onViewToggle,
  onQualityChange,
  onToggleStats,
  onBrightnessChange,
  showNebula = true,
  onNebulaToggle,
  autoRotateSpeedIdx = 1,
  onOrbitSpeedChange,
  gravityLevelName = 'NOMINAL'
}) {
  const [showInfo, setShowInfo] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [uiVisible, setUiVisible] = useState(true)

  const toggleUI = () => setUiVisible(!uiVisible)
  const handleInfoToggle = useCallback(() => setShowInfo(p => !p), [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const viewModes = ['cinematic', 'top', 'edge', 'nadir', 'close', 'distant', 'oblique', 'wormhole', 'horizon', 'galactic']

  return (
    <>
      {/* ───── TOP-LEFT HUD: SYSTEM IDENTITY ───── */}
      <div className={`fixed top-6 left-6 z-30 pointer-events-none transition-all duration-700 ${uiVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
        <div className="flex flex-col gap-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <span className="text-cyan-400/80 font-mono text-[9px] tracking-[0.6em] uppercase">Observatory System v2.8</span>
          </div>
          <h1 className="text-white text-3xl font-extralight tracking-[0.25em] uppercase leading-none mb-2 drop-shadow-lg">Singularity</h1>
          <div className="w-48 h-px bg-gradient-to-r from-cyan-500/60 via-cyan-500/20 to-transparent" />
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-400/60 font-mono text-[8px] tracking-[0.2em] uppercase">Kerr Metric Approximation</p>
            <div className="w-1 h-1 rounded-full bg-gray-600" />
            <p className="text-gray-400/60 font-mono text-[8px] tracking-[0.2em] uppercase">Mass: 4.2M ☉</p>
          </div>
        </div>
      </div>

      {/* ───── TOP-RIGHT HUD: SYSTEM UTILITIES ───── */}
      <div className={`fixed top-4 right-4 md:top-6 md:right-8 z-30 flex flex-row gap-1 md:gap-2 pointer-events-auto transition-all duration-700 ${uiVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
        <NeonButton onClick={() => onSoundToggle(!soundEnabled)} color={soundEnabled ? "cyan" : "gray"} variant="ghost" size="xs" className="px-2 md:px-3">
          {soundEnabled ? '🔊' : '🔇'}
          <span className="hidden md:inline ml-1">{soundEnabled ? 'AUDIO: ON' : 'AUDIO: OFF'}</span>
        </NeonButton>
        <NeonButton onClick={() => onQualityChange?.((quality + 1) % 3)} color="cyan" variant="ghost" size="xs" className="px-2 md:px-3">
          <span className="md:hidden">⚙ {['L', 'M', 'H'][quality]}</span>
          <span className="hidden md:inline">{`⚙ TIER: ${['LOW', 'MED', 'HIGH'][quality]}`}</span>
        </NeonButton>
        <NeonButton onClick={onToggleStats} color="cyan" variant="ghost" size="xs" className="px-2 md:px-3">
          DATALOG
        </NeonButton>
        <NeonButton onClick={toggleFullscreen} color={isFullscreen ? "cyan" : "gray"} variant="ghost" size="xs" className="px-2 md:px-3">
          {isFullscreen ? '🗗' : '🖵'}
        </NeonButton>
      </div>

      {/* ───── DATA READOUTS (Responsive Positioning) ───── */}
      <div className={`fixed z-30 flex pointer-events-none transition-all duration-700 
                    ${uiVisible ? 'opacity-100' : 'opacity-0'}
                    /* Mobile: Top horizontal bar */
                    top-32 left-4 right-4 flex-row gap-1 justify-center
                    /* Desktop: Right vertical stack */
                    md:top-[30%] md:right-8 md:left-auto md:flex-col md:gap-2 md:w-auto
                    ${uiVisible ? 'translate-y-0 md:translate-x-0' : 'translate-y-10 md:translate-x-20'}`}>
        <DataPanel label="MASS"   value="4.2M"  unit="☉"  status="active"   variant="compact" />
        <DataPanel label="RADIUS" value="12.8"  unit="km" status="default"  variant="compact" />
        <DataPanel label="SPIN"   value="0.998" unit="a*" status="critical" variant="compact" />
        <DataPanel label="GRAV"   value={gravityLevelName} status={isHighIntensity ? 'critical' : 'active'} variant="compact" />
      </div>

      {/* ───── BOTTOM-RIGHT: CONTROL DOCK (SQUARE) ───── */}
      <div className={`fixed bottom-10 right-4 md:right-10 z-30 transition-all duration-700 ${uiVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex flex-col items-end gap-3">
          {/* Square Control Grid (Precise 2x2) */}
          <GlassPanel variant="elevated" accent="cyan" className="p-1.5 w-[140px] h-[140px] md:w-[180px] md:h-[180px] grid grid-cols-2 grid-rows-2 gap-1.5 pointer-events-auto border-white/5">
            <NeonButton onClick={onIntensityToggle} color={isHighIntensity ? 'purple' : 'cyan'} variant={isHighIntensity ? 'default' : 'ghost'} size="xs" className="flex flex-col items-center justify-center text-center p-0 w-full h-full" glow={isHighIntensity}>
               <span className="text-[7px] md:text-[8px] opacity-40 font-mono tracking-widest mb-1">PHYSICS</span>
               <span className="text-[9px] md:text-[11px] font-medium tracking-tighter leading-none">{gravityLevelName.slice(0,4)}</span>
            </NeonButton>
            <NeonButton onClick={onAutoRotateToggle} color={autoRotate ? 'cyan' : 'gray'} variant="ghost" size="xs" className="flex flex-col items-center justify-center text-center p-0 w-full h-full">
               <span className="text-[7px] md:text-[8px] opacity-40 font-mono tracking-widest mb-1">ROTATION</span>
               <span className="text-[9px] md:text-[11px] font-medium tracking-tighter leading-none">{autoRotate ? 'ACTIVE' : 'STATIC'}</span>
            </NeonButton>
            <NeonButton onClick={onOrbitSpeedChange} color="cyan" variant="ghost" size="xs" className="flex flex-col items-center justify-center text-center p-0 w-full h-full">
               <span className="text-[7px] md:text-[8px] opacity-40 font-mono tracking-widest mb-1">VELOCITY</span>
               <span className="text-[9px] md:text-[11px] font-medium tracking-tighter leading-none">x{autoRotateSpeedIdx + 1}.0</span>
            </NeonButton>
            <NeonButton onClick={onNebulaToggle} color={showNebula ? 'cyan' : 'gray'} variant={showNebula ? 'default' : 'ghost'} size="xs" className="flex flex-col items-center justify-center text-center p-0 w-full h-full">
               <span className="text-[7px] md:text-[8px] opacity-40 font-mono tracking-widest mb-1">NEBULA</span>
               <span className="text-[9px] md:text-[11px] font-medium tracking-tighter leading-none">{showNebula ? 'VISIBLE' : 'HIDDEN'}</span>
            </NeonButton>
          </GlassPanel>

          {/* Perspective Selector (Circular) */}
          <div className="flex items-center gap-3 pointer-events-auto bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-2xl">
            <span className="text-[8px] font-mono text-cyan-400/60 tracking-[0.4em] uppercase">{viewMode}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const nextIdx = (viewModes.indexOf(viewMode) + 1) % viewModes.length;
                onViewToggle?.(viewModes[nextIdx]);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ───── BOTTOM-LEFT: SYSTEM DIAGNOSTICS ───── */}
      <div className={`fixed bottom-6 left-6 z-30 pointer-events-none transition-all duration-700 ${uiVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex flex-col gap-1.5 font-mono text-[8px] text-cyan-400/40 tracking-wider">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 animate-pulse" />
            <p>CORE_METRIC: STABLE</p>
          </div>
          <p>RADIATIVE_FLUX: 1.42e32W</p>
          <p>SINGULARITY_COORD: [0, 0, 0]</p>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-20 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-cyan-500/30 animate-pulse" />
             </div>
             <span>SYNC 88.4%</span>
          </div>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); setUiVisible(false); }}
          onMouseDown={(e) => e.stopPropagation()}
          className="mt-5 px-4 py-1.5 rounded-sm border border-white/5 text-gray-500 text-[8px] tracking-[0.5em] hover:text-cyan-400 hover:border-cyan-500/40 transition-all pointer-events-auto uppercase"
        >
          Terminate HUD
        </button>
      </div>

      {/* ───── REVEAL OVERLAY ───── */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-1000 ${!uiVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-90 pointer-events-none'}`}>
        <button 
          onClick={(e) => { e.stopPropagation(); setUiVisible(true); }}
          onMouseDown={(e) => e.stopPropagation()}
          className="group flex flex-col items-center gap-2 pointer-events-auto"
        >
          <div className="px-6 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-cyan-500/20 text-cyan-400 text-[9px] tracking-[0.5em] font-mono group-hover:border-cyan-500 group-hover:bg-cyan-500/10 transition-all">
            RESTORE_LINK
          </div>
          <div className="w-px h-6 bg-gradient-to-b from-cyan-500/40 to-transparent animate-bounce" />
        </button>
      </div>

      {/* ───── VIGNETTE ───── */}
      <div className="vignette pointer-events-none fixed inset-0 z-0" />
    </>
  )
}
