import { useEffect, useState } from 'react'
import GlassPanel from './GlassPanel'

/**
 * Displays real-time engine telemetry in a high-precision HUD format.
 */
export default function PerformanceStats({ stats: s }) {
  if (!s) return null

  return (
    <div className="fixed top-20 right-4 md:top-24 md:right-10 z-40 pointer-events-none 
                    animate-fade-in origin-top-right scale-90 md:scale-100 max-w-[calc(100vw-32px)]">
      <GlassPanel variant="elevated" accent="cyan" className="p-4 w-64 border-white/5 bg-black/40 backdrop-blur-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-3 border-b border-cyan-500/20 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 font-mono text-[9px] tracking-[0.3em] uppercase font-bold">Telemetry Log</span>
          </div>
          <span className="text-gray-500 font-mono text-[8px] uppercase">Live Feed</span>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-500 font-mono text-[8px] uppercase mb-0.5">Render Rate</p>
            <p className={`text-lg font-mono leading-none ${s.fps > 55 ? 'text-green-400' : s.fps > 30 ? 'text-amber-400' : 'text-red-400'}`}>
              {s.fps}<span className="text-[10px] ml-1 opacity-50">FPS</span>
            </p>
          </div>
          <div>
            <p className="text-gray-500 font-mono text-[8px] uppercase mb-0.5">Frame Time</p>
            <p className="text-lg font-mono text-cyan-400 leading-none">
              {s.frameTime}<span className="text-[10px] ml-1 opacity-50">ms</span>
            </p>
          </div>
        </div>

        {/* Engine Statistics */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-end border-b border-white/5 pb-1">
            <span className="text-gray-500 font-mono text-[8px] uppercase">Draw Calls</span>
            <span className="text-white font-mono text-[10px]">{s.drawCalls}</span>
          </div>
          <div className="flex justify-between items-end border-b border-white/5 pb-1">
            <span className="text-gray-500 font-mono text-[8px] uppercase">Triangles</span>
            <span className="text-white font-mono text-[10px]">{(s.triangles / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex justify-between items-end border-b border-white/5 pb-1">
            <span className="text-gray-500 font-mono text-[8px] uppercase">Textures</span>
            <span className="text-white font-mono text-[10px]">{s.textures || 0}</span>
          </div>
          <div className="flex justify-between items-end border-b border-white/5 pb-1">
            <span className="text-gray-500 font-mono text-[8px] uppercase">Quality Tier</span>
            <span className="text-cyan-400 font-mono text-[9px] font-bold tracking-widest">{s.recommendedQuality?.toUpperCase()}</span>
          </div>
        </div>

        {/* System Bar */}
        <div className="mt-4 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-[7px] font-mono text-gray-500 uppercase tracking-widest">
            <span>Buffer Sync</span>
            <span>98.2%</span>
          </div>
          <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500/40 animate-pulse" style={{ width: '98%' }} />
          </div>
        </div>

        <div className="mt-3 text-[7px] font-mono text-gray-700 text-center uppercase tracking-[0.4em]">
          End of Log Strip
        </div>
      </GlassPanel>
    </div>
  )
}
