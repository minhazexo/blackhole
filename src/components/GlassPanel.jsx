import { forwardRef } from 'react'

/**
 * GlassPanel - Reusable glassmorphism container component
 * 
 * @param {Object} props
 * @param {'surface' | 'elevated' | 'floating' | 'prominent'} props.variant - Glassmorphism depth level
 * @param {'none' | 'cyan' | 'purple'} props.accent - Border accent color
 * @param {'none' | 'sm' | 'md' | 'lg'} props.glow - Glow intensity
 * @param {boolean} props.hover - Enable hover lift and glow effects
 * @param {'none' | 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'fadeInScale'} props.animate - Entrance animation
 * @param {boolean} props.noise - Add subtle noise texture overlay
 * @param {boolean} props.edgeLight - Top edge highlight streak
 * @param {number} props.delay - Animation delay in ms
 * @param {string} props.className - Additional CSS classes
 * @param {ReactNode} props.children - Child elements
 * @param {Object} props.style - Additional inline styles
 */
const GlassPanel = forwardRef(({
  variant = 'elevated',
  accent = 'none',
  glow = 'none',
  hover = false,
  animate = 'none',
  noise = false,
  edgeLight = false,
  delay = 0,
  className = '',
  children,
  style,
  ...rest
}, ref) => {
  // Variant classes mapping
  const variantClasses = {
    surface: 'glass-surface',
    elevated: 'glass-elevated',
    floating: 'glass-floating',
    prominent: 'glass-prominent'
  }

  // Accent border classes
  const accentClasses = {
    none: '',
    cyan: 'border-cyan-500/25',
    purple: 'border-purple-500/25'
  }

  // Glow classes
  const glowClasses = {
    none: '',
    sm: 'glow-cyan-sm',
    md: 'glow-cyan-md',
    lg: 'glow-cyan-lg'
  }

  // Animation classes
  const animationClasses = {
    none: '',
    fadeIn: 'animate-fade-in',
    fadeInUp: 'animate-fade-in-up',
    fadeInDown: 'animate-fade-in-down',
    fadeInScale: 'animate-fade-in-scale'
  }

  // Build base classes
  const baseClasses = [
    'relative',
    'rounded-2xl',
    'overflow-hidden',
    variantClasses[variant],
    accentClasses[accent],
    hover ? 'glass-hover' : '',
    glowClasses[glow],
    animationClasses[animate]
  ].filter(Boolean).join(' ')

  // Animation delay style
  const animationStyle = delay > 0 ? { animationDelay: `${delay}ms`, ...style } : style

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${className}`}
      style={animationStyle}
      {...rest}
    >
      {/* Edge lighting effect */}
      {edgeLight && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
      )}

      {/* Noise texture overlay */}
      {noise && (
        <div className="noise-overlay" />
      )}

      {/* Children */}
      {children}
    </div>
  )
})

GlassPanel.displayName = 'GlassPanel'

export default GlassPanel
