import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Float } from '@react-three/drei'
import * as THREE from 'three'

// Side-scrolling environment
function Scenery() {
  const fenceRef = useRef()
  const trackLinesRef = useRef()
  const treesRef = useRef()

  useFrame((state, delta) => {
    // Parallax scrolling speeds (negative means moving left, simulating camera panning right)
    const speedFence = 20
    const speedTrack = 25
    const speedTrees = 8

    if (fenceRef.current) {
      fenceRef.current.position.x -= delta * speedFence
      if (fenceRef.current.position.x < -10) fenceRef.current.position.x += 10
    }
    
    if (trackLinesRef.current) {
      trackLinesRef.current.position.x -= delta * speedTrack
      if (trackLinesRef.current.position.x < -10) trackLinesRef.current.position.x += 10
    }

    if (treesRef.current) {
      treesRef.current.position.x -= delta * speedTrees
      if (treesRef.current.position.x < -20) treesRef.current.position.x += 20
    }
  })

  const fencePosts = useMemo(() => Array.from({ length: 15 }), [])
  
  // Distant trees for parallax depth
  const trees = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    x: -30 + i * 8 + Math.random() * 4,
    z: -8 - Math.random() * 6,
    scale: 0.8 + Math.random() * 0.5
  })), [])

  // Track lines (dirt details flying by)
  const trackDetails = useMemo(() => {
    const lines = 60
    const pos = new Float32Array(lines * 6)
    for (let i = 0; i < lines; i++) {
      const x = -30 + i * 1.5
      const length = 0.5 + Math.random() * 2
      const zOffset = (Math.random() - 0.5) * 5
      pos[i * 6] = x
      pos[i * 6 + 1] = -1.99
      pos[i * 6 + 2] = zOffset
      
      pos[i * 6 + 3] = x + length
      pos[i * 6 + 4] = -1.99
      pos[i * 6 + 5] = zOffset
    }
    return pos
  }, [])

  return (
    <group>
      {/* Distant trees */}
      <group ref={treesRef}>
        {trees.map((t, i) => (
          <group key={i} position={[t.x, -0.5, t.z]} scale={t.scale}>
            <mesh position={[0, 1.5, 0]}>
              <coneGeometry args={[1.5, 4, 8]} />
              <meshStandardMaterial color="#0b2410" roughness={1} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
              <meshStandardMaterial color="#3d2314" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[100, 20]} />
        <meshStandardMaterial color="#4A3320" roughness={1} />
      </mesh>
      
      {/* Background Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.01, -15]}>
        <planeGeometry args={[100, 20]} />
        <meshStandardMaterial color="#1B361B" roughness={1} />
      </mesh>

      {/* Moving track details */}
      <lineSegments ref={trackLinesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={trackDetails.length / 3}
            array={trackDetails}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#7A5230" opacity={0.8} transparent />
      </lineSegments>

      {/* Fence in the background */}
      <group ref={fenceRef} position={[0, -1.5, -4]}>
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[40, 0.1, 0.1]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[40, 0.1, 0.1]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {fencePosts.map((_, i) => (
          <mesh key={i} position={[-20 + i * 3, 0.5, 0]}>
            <boxGeometry args={[0.15, 1.2, 0.15]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function RunningHorses() {
  const horses = [
    // --- BÊN PHẢI QR CODE ---
    { id: 1, z: -1.5, scale: 2.0, speed: 0.90, xBase: 5.0, yOffset: 0.3 },
    { id: 2, z: 0.5,  scale: 2.5, speed: 1.05, xBase: 7.0, yOffset: -0.1 },
    { id: 3, z: 2.0,  scale: 3.2, speed: 1.15, xBase: 9.0, yOffset: -0.4 },

    // --- BÊN TRÁI QR CODE ---
    { id: 4, z: -1.0, scale: 2.2, speed: 0.95, xBase: -5.0, yOffset: 0.2 },
    { id: 5, z: 1.0,  scale: 2.8, speed: 1.10, xBase: -7.5, yOffset: -0.2 },
    { id: 6, z: 2.5,  scale: 3.5, speed: 1.25, xBase: -10.0, yOffset: -0.6 },
  ]
  
  const groupRefs = useRef([])
  
  useFrame((state) => {
    const time = state.clock.elapsedTime
    horses.forEach((h, i) => {
      const el = groupRefs.current[i]
      if (el) {
        // Galloping bob motion
        el.position.y = Math.abs(Math.sin(time * 10 * h.speed)) * 0.3 + h.yOffset - 1.5
        // Forward/backward positioning relative to others, tightly constrained
        el.position.x = h.xBase + Math.sin(time * h.speed * 0.4) * 0.8
        // Slight tilt simulating running
        el.rotation.z = Math.sin(time * 10 * h.speed) * 0.05
      }
    })
  })

  return (
    <group>
      {horses.map((h, i) => (
        <group key={h.id} ref={el => groupRefs.current[i] = el} position={[h.xBase, -1.5, h.z]}>
          {/* HTML Overlay for crisp Emoji rendering */}
          <Html transform sprite position={[0, 1, 0]} scale={h.scale} pointerEvents="none">
            <div style={{
              fontSize: '40px',
              transform: 'scaleX(-1)', // Flip horizontal to face right
              filter: `drop-shadow(2px 5px 3px rgba(0,0,0,0.6))`,
              userSelect: 'none',
              pointerEvents: 'none',
              lineHeight: 1
            }}>
              🏇
            </div>
          </Html>
          {/* Fake shadow underneath */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <planeGeometry args={[1.5, 0.5]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function FloatingHorseShoes() {
  const groupRef = useRef()
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x -= delta * 15 // Float left along with scene
      if (groupRef.current.position.x < -15) {
        groupRef.current.position.x += 30
      }
      groupRef.current.rotation.y += delta * 2
      groupRef.current.rotation.z += delta
    }
  })

  return (
    <group ref={groupRef} position={[10, 1.5, -2]}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh scale={0.5}>
          <torusGeometry args={[1, 0.25, 16, 32, Math.PI * 1.5]} />
          <meshStandardMaterial color="#D4A017" metalness={0.8} roughness={0.2} />
          <mesh position={[1, 0, 0]}>
             <sphereGeometry args={[0.25, 16, 16]} />
             <meshStandardMaterial color="#D4A017" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, -1, 0]}>
             <sphereGeometry args={[0.25, 16, 16]} />
             <meshStandardMaterial color="#D4A017" metalness={0.8} roughness={0.2} />
          </mesh>
        </mesh>
      </Float>
    </group>
  )
}

function Dust() {
  const pointsRef = useRef()
  
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.position.x -= delta * 25 // Fast dust moving left
      if (pointsRef.current.position.x < -20) {
        pointsRef.current.position.x += 20
      }
    }
  })

  const { positions } = useMemo(() => {
    const count = 300
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60
      pos[i * 3 + 1] = -2 + Math.random() * 2 // Dust stays near ground
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return { positions: pos }
  }, [])

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#A67B5B" transparent opacity={0.5} />
    </points>
  )
}

export default function HorseRacingThreeBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden opacity-100 pointer-events-none rounded-2xl">
      <Canvas camera={{ position: [0, 0.5, 6], fov: 50 }}>
        {/* Night sky background */}
        <color attach="background" args={['#081224']} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#FFD700" castShadow />
        <pointLight position={[-5, 5, 5]} intensity={1} color="#008fe5" />
        
        <Scenery />
        <Dust />
        <RunningHorses />
        <FloatingHorseShoes />
        
        <fog attach="fog" args={['#081224', 5, 20]} />
      </Canvas>
      
      {/* Overlay gradient to blend nicely with the dark UI */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-[#0A1628]/40 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/90 via-transparent to-[#0A1628]/90 pointer-events-none"></div>
    </div>
  )
}
