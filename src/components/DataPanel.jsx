import { useState, useEffect } from 'react'

/**
 * DataPanel - Sci-fi data display with label, value, status indicators
 * 
 * @param {Object} props
 * @param {string} props.label - Data label
 * @param {string} props.value - Data value
 * @param {string} props.unit - Optional unit suffix
 * @param {'default' | 'active' | 'warning' | 'critical'} props.status - Status indicator color
 * @param {boolean} props.animate - Animate value changes
 * @param {'compact' | 'default' | 'detailed'} props.variant - Display density
 * @param {ReactNode} props.icon - Optional status indicator icon
 * @param {string} props.className - Additional CSS classes
 */
const DataPanel = ({
  label,
  value,
  unit = '',
  status = 'default',
  animate = false,
  variant = 'default',
  icon = null,
  className = '',
  ...rest
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

  // Trigger animation when value changes
  useEffect(() => {
    if (animate) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 500)
      return () => clearTimeout(timer)
    }
  }, [value, animate])

  // Status color configurations
  const statusConfig = {
    default: {
      dot: 'bg-gray-500',
      glow: 'shadow-gray-500/30',
      text: 'text-gray-400'
    },
    active: {
      dot: 'bg-cyan-400',
      glow: 'shadow-cyan-400/50',
      text: 'text-cyan-400'
    },
    warning: {
      dot: 'bg-amber-400',
      glow: 'shadow-amber-400/50',
      text: 'text-amber-400'
    },
    critical: {
      dot: 'bg-red-400',
      glow: 'shadow-red-400/50',
      text: 'text-red-400'
    }
  }

  // Variant configurations
  const variantConfig = {
    compact: {
      padding: 'px-3 py-2',
      labelSize: 'text-[10px]',
      valueSize: 'text-xs',
      gap: 'gap-1'
    },
    default: {
      padding: 'px-4 py-3',
      labelSize: 'text-[10px]',
      valueSize: 'text-sm',
      gap: 'gap-2'
    },
    detailed: {
      padding: 'px-5 py-4',
      labelSize: 'text-xs',
      valueSize: 'text-base',
      gap: 'gap-3'
    }
  }

  const s = statusConfig[status]
  const v = variantConfig[variant]

  // Build base classes
  const baseClasses = [
    'relative',
    'glass-elevated',
    'rounded-xl',
    'overflow-hidden',
    'transition-all',
    'duration-300',
    'ease-out-expo',
    'hover:border-white/15',
    v.padding,
    v.gap
  ].filter(Boolean).join(' ')

  return (
    <div className={`${baseClasses} ${className}`} {...rest}>
      {/* Scan line effect */}
      <div className="scan-line-effect" />

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        {icon ? (
          <div className={`status-dot ${s.dot} animate-status-pulse`} style={{ boxShadow: `0 0 10px ${s.glow}` }} />
        ) : (
          <div className={`status-dot ${s.dot} ${status !== 'default' ? 'animate-status-pulse' : ''}`} style={{ boxShadow: `0 0 10px ${s.glow}` }} />
        )}
        <span className={`${v.labelSize} ${s.text} font-mono tracking-wider uppercase`}>
          {label}
        </span>
      </div>

      {/* Value with optional unit */}
      <div className="flex items-baseline gap-1">
        <span
          className={`${v.valueSize} font-mono text-white/90 ${isAnimating ? 'data-value-flash' : ''}`}
          style={{
            textShadow: status !== 'default' ? `0 0 10px ${s.glow}` : 'none'
          }}
        >
          {value}
        </span>
        {unit && (
          <span className={`${v.valueSize} font-mono text-white/50`}>
            {unit}
          </span>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

export default DataPanel
