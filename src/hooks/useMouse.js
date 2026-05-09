import { useCallback, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { throttle } from '../utils/performance'

export function useMouse() {
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  const { size } = useThree()

  // Throttled mouse move handler for better performance
  const onMouseMove = useCallback(throttle((e) => {
    mouse.current.targetX = (e.clientX / size.width) * 2 - 1
    mouse.current.targetY = -(e.clientY / size.height) * 2 + 1
  }, 16), [size]) // Throttle to ~60fps

  useFrame(() => {
    // Smooth interpolation with reduced frequency for performance
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.05
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.05
  })

  return { mouse, onMouseMove }
}
