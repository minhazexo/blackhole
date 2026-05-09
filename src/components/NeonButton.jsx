import { useState, useCallback, useRef } from 'react'

/**
 * NeonButton - Interactive button with neon glow, ripple distortion, particle click effects
 * 
 * @param {Object} props
 * @param {'cyan' | 'purple' | 'gradient'} props.color - Accent color
 * @param {'default' | 'outline' | 'ghost'} props.variant - Visual style
 * @param {'sm' | 'md' | 'lg'} props.size - Button size
 * @param {boolean} props.glow - Persistent glow effect
 * @param {boolean} props.particles - Click particle burst
 * @param {boolean} props.ripple - Click ripple distortion
 * @param {boolean} props.shimmer - Hover shimmer sweep
 * @param {boolean} props.loading - Show loading state
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional CSS classes
 * @param {ReactNode} props.children - Button content
 */
const NeonButton = ({
  color = 'cyan',
  variant = 'default',
  size = 'md',
  glow = false,
  particles = true,
  ripple = true,
  shimmer = true,
  loading = false,
  onClick,
  disabled = false,
  className = '',
  children,
  ...rest
}) => {
  const [ripples, setRipples] = useState([])
  const [particleBursts, setParticleBursts] = useState([])
  const buttonRef = useRef(null)

  // Color configurations
  const colorConfig = {
    cyan: {
      bg: 'bg-cyan-500/10',
      bgHover: 'hover:bg-cyan-500/20',
      border: 'border-cyan-500/30',
      borderHover: 'hover:border-cyan-500/50',
      text: 'text-cyan-400',
      textHover: 'hover:text-cyan-300',
      glow: 'glow-cyan-sm',
      glowHover: 'hover:glow-cyan-md',
      particle: 'bg-cyan-400'
    },
    purple: {
      bg: 'bg-purple-500/10',
      bgHover: 'hover:bg-purple-500/20',
      border: 'border-purple-500/30',
      borderHover: 'hover:border-purple-500/50',
      text: 'text-purple-400',
      textHover: 'hover:text-purple-300',
      glow: 'glow-purple-sm',
      glowHover: 'hover:glow-purple-md',
      particle: 'bg-purple-400'
    },
    gradient: {
      bg: 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10',
      bgHover: 'hover:from-cyan-500/20 hover:to-purple-500/20',
      border: 'border-white/10',
      borderHover: 'hover:border-white/20',
      text: 'text-white',
      textHover: 'hover:text-white/90',
      glow: 'glow-cyan-sm',
      glowHover: 'hover:glow-cyan-md',
      particle: 'bg-gradient-to-r from-cyan-400 to-purple-400'
    }
  }

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'px-4 py-2',
      text: 'text-xs',
      rounded: 'rounded-xl'
    },
    md: {
      padding: 'px-6 py-3',
      text: 'text-sm',
      rounded: 'rounded-2xl'
    },
    lg: {
      padding: 'px-8 py-4',
      text: 'text-base',
      rounded: 'rounded-2xl'
    }
  }

  // Variant configurations
  const variantConfig = {
    default: {
      bg: colorConfig[color].bg,
      bgHover: colorConfig[color].bgHover,
      border: colorConfig[color].border,
      borderHover: colorConfig[color].borderHover
    },
    outline: {
      bg: 'bg-transparent',
      bgHover: colorConfig[color].bgHover,
      border: colorConfig[color].border,
      borderHover: colorConfig[color].borderHover
    },
    ghost: {
      bg: 'bg-transparent',
      bgHover: colorConfig[color].bgHover,
      border: 'border-transparent',
      borderHover: 'border-transparent'
    }
  }

  const c = colorConfig[color]
  const s = sizeConfig[size]
  const v = variantConfig[variant]

  // Handle click with ripple and particle effects
  const handleClick = useCallback((e) => {
    if (disabled || loading) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Create ripple
    if (ripple) {
      const rippleId = Date.now()
      setRipples(prev => [...prev, { id: rippleId, x, y }])
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== rippleId))
      }, 600)
    }

    // Create particle burst
    if (particles) {
      const burstId = Date.now()
      const newParticles = Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const distance = 40 + Math.random() * 20
        return {
          id: `${burstId}-${i}`,
          tx: Math.cos(angle) * distance,
          ty: Math.sin(angle) * distance
        }
      })
      setParticleBursts(prev => [...prev, { id: burstId, particles: newParticles }])
      setTimeout(() => {
        setParticleBursts(prev => prev.filter(b => b.id !== burstId))
      }, 600)
    }

    onClick?.(e)
  }, [disabled, loading, ripple, particles, onClick])

  // Build base classes
  const baseClasses = [
    'relative',
    'overflow-hidden',
    'backdrop-blur-md',
    'font-mono',
    'tracking-wider',
    'transition-all',
    'duration-300',
    'ease-out-expo',
    'cursor-pointer',
    'select-none',
    s.padding,
    s.text,
    s.rounded,
    v.bg,
    v.bgHover,
    v.border,
    v.borderHover,
    c.text,
    c.textHover,
    glow ? c.glow : '',
    glow ? c.glowHover : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    loading ? 'cursor-wait' : ''
  ].filter(Boolean).join(' ')

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${className}`}
      {...rest}
    >
      {/* Shimmer effect */}
      {shimmer && !loading && !disabled && (
        <div className="shimmer-effect" />
      )}

      {/* Ripples */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple-effect"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '200px',
            height: '200px'
          }}
        />
      ))}

      {/* Particle bursts */}
      {particleBursts.map(burst => (
        <div key={burst.id} className="particle-burst">
          {burst.particles.map(particle => (
            <span
              key={particle.id}
              className={`particle ${color === 'purple' ? 'purple' : ''}`}
              style={{
                left: '50%',
                top: '50%',
                '--tx': `${particle.tx}px`,
                '--ty': `${particle.ty}px`
              }}
            />
          ))}
        </div>
      ))}

      {/* Loading state */}
      {loading ? (
        <div className="loading-dots">
          <span />
          <span />
          <span />
        </div>
      ) : (
        <span className="relative z-10">{children}</span>
      )}
    </button>
  )
}

export default NeonButton
