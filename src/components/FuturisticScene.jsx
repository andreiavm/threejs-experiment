import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Futuristic grid floor component
function GridFloor() {
  const gridRef = useRef()
  
  const gridGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(200, 200, 100, 100)
    geometry.rotateX(-Math.PI / 2) // Rotate to be horizontal
    return geometry
  }, [])

  const gridMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        gridColor: { value: new THREE.Color(0x00ffff) },
        bgColor: { value: new THREE.Color(0x000000) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 gridColor;
        uniform vec3 bgColor;
        varying vec2 vUv;
        
        void main() {
          vec2 grid = abs(fract(vUv * 50.0) - 0.5) / fwidth(vUv * 50.0);
          float line = min(grid.x, grid.y);
          
          // Add perspective fade
          float fade = 1.0 - smoothstep(0.0, 1.0, length(vUv - 0.5) * 2.0);
          
          // Add animated pulse effect
          float pulse = sin(time * 2.0 + length(vUv - 0.5) * 10.0) * 0.3 + 0.7;
          
          vec3 color = mix(gridColor * pulse, bgColor, smoothstep(0.0, 2.0, line));
          color *= fade;
          
          gl_FragColor = vec4(color, fade * 0.8);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    })
  }, [])

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.material.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={gridRef} position={[0, -10, 0]} geometry={gridGeometry} material={gridMaterial} />
  )
}

// Enhanced particle system for stars and floating particles with rocket interactions
function StarField({ rocketPosition, rocketVelocity }) {
  const starsRef = useRef()
  const particlesRef = useRef()
  const interactiveParticlesRef = useRef()
  const thrusterParticlesRef = useRef()
  
  // Store original positions for particle reset
  const originalParticlePositions = useRef()
  const particleVelocities = useRef()
  const thrusterParticleData = useRef()
  
  const starPositions = useMemo(() => {
    const positions = new Float32Array(1000 * 3)
    const colors = new Float32Array(1000 * 3)
    
    for (let i = 0; i < 1000; i++) {
      // Create a sphere of stars around the scene
      const radius = 50 + Math.random() * 100
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.cos(phi)
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
      
      // Random star colors (white, blue, cyan, yellow)
      const colorType = Math.random()
      if (colorType < 0.4) {
        // White stars
        colors[i * 3] = 1
        colors[i * 3 + 1] = 1
        colors[i * 3 + 2] = 1
      } else if (colorType < 0.7) {
        // Cyan stars
        colors[i * 3] = 0.2
        colors[i * 3 + 1] = 1
        colors[i * 3 + 2] = 1
      } else if (colorType < 0.9) {
        // Blue stars
        colors[i * 3] = 0.3
        colors[i * 3 + 1] = 0.6
        colors[i * 3 + 2] = 1
      } else {
        // Yellow stars
        colors[i * 3] = 1
        colors[i * 3 + 1] = 1
        colors[i * 3 + 2] = 0.3
      }
    }
    
    return { positions, colors }
  }, [])

  const floatingParticles = useMemo(() => {
    const positions = new Float32Array(300 * 3)
    const velocities = new Float32Array(300 * 3)
    
    for (let i = 0; i < 300; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80
      
      // Initialize velocities to zero
      velocities[i * 3] = 0
      velocities[i * 3 + 1] = 0
      velocities[i * 3 + 2] = 0
    }
    
    originalParticlePositions.current = new Float32Array(positions)
    particleVelocities.current = velocities
    
    return positions
  }, [])

  // Interactive particles that react to rocket movement
  const interactiveParticles = useMemo(() => {
    const positions = new Float32Array(500 * 3)
    
    for (let i = 0; i < 500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60
    }
    
    return positions
  }, [])

  // Thruster particles
  const thrusterParticles = useMemo(() => {
    const positions = new Float32Array(100 * 3)
    const velocities = new Float32Array(100 * 3)
    const lifetimes = new Float32Array(100)
    
    for (let i = 0; i < 100; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0
      
      velocities[i * 3] = 0
      velocities[i * 3 + 1] = 0
      velocities[i * 3 + 2] = 0
      
      lifetimes[i] = 0
    }
    
    thrusterParticleData.current = { positions, velocities, lifetimes }
    
    return positions
  }, [])

  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.01
    }
    
    // Update floating particles with rocket interactions
    if (particlesRef.current && rocketPosition && rocketVelocity) {
      const positions = particlesRef.current.geometry.attributes.position.array
      const rocketPos = new THREE.Vector3(rocketPosition.x, rocketPosition.y, rocketPosition.z)
      const rocketVel = new THREE.Vector3(rocketVelocity.x, rocketVelocity.y, rocketVelocity.z)
      
      for (let i = 0; i < 300; i++) {
        const particlePos = new THREE.Vector3(
          positions[i * 3],
          positions[i * 3 + 1], 
          positions[i * 3 + 2]
        )
        
        const distance = particlePos.distanceTo(rocketPos)
        
        // Wake effect - particles get pulled behind the rocket
        if (distance < 8) {
          const direction = particlePos.clone().sub(rocketPos).normalize()
          const wakeForce = new THREE.Vector3(rocketVel.x, rocketVel.y, rocketVel.z).multiplyScalar(-0.3 / (distance + 0.1))
          
          particleVelocities.current[i * 3] += wakeForce.x * delta
          particleVelocities.current[i * 3 + 1] += wakeForce.y * delta
          particleVelocities.current[i * 3 + 2] += wakeForce.z * delta
          
          // Add some repulsion to prevent particles from clustering
          const repulsion = direction.multiplyScalar(2 / (distance + 0.1))
          particleVelocities.current[i * 3] += repulsion.x * delta
          particleVelocities.current[i * 3 + 1] += repulsion.y * delta
          particleVelocities.current[i * 3 + 2] += repulsion.z * delta
        }
        
        // Apply velocities with damping
        positions[i * 3] += particleVelocities.current[i * 3] * delta
        positions[i * 3 + 1] += particleVelocities.current[i * 3 + 1] * delta
        positions[i * 3 + 2] += particleVelocities.current[i * 3 + 2] * delta
        
        // Damping
        particleVelocities.current[i * 3] *= 0.98
        particleVelocities.current[i * 3 + 1] *= 0.98
        particleVelocities.current[i * 3 + 2] *= 0.98
        
        // Boundary reset
        if (Math.abs(positions[i * 3]) > 40 || Math.abs(positions[i * 3 + 1]) > 20 || Math.abs(positions[i * 3 + 2]) > 40) {
          positions[i * 3] = originalParticlePositions.current[i * 3]
          positions[i * 3 + 1] = originalParticlePositions.current[i * 3 + 1]
          positions[i * 3 + 2] = originalParticlePositions.current[i * 3 + 2]
          particleVelocities.current[i * 3] = 0
          particleVelocities.current[i * 3 + 1] = 0
          particleVelocities.current[i * 3 + 2] = 0
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
    
    // Update interactive particles that swirl around the rocket
    if (interactiveParticlesRef.current && rocketPosition) {
      const positions = interactiveParticlesRef.current.geometry.attributes.position.array
      const rocketPos = new THREE.Vector3(rocketPosition.x, rocketPosition.y, rocketPosition.z)
      
      for (let i = 0; i < 500; i++) {
        const particlePos = new THREE.Vector3(
          positions[i * 3],
          positions[i * 3 + 1], 
          positions[i * 3 + 2]
        )
        
        const distance = particlePos.distanceTo(rocketPos)
        
        if (distance < 12) {
          // Create swirling motion around the rocket
          const angle = state.clock.elapsedTime * 2 + i * 0.1
          const swirl = new THREE.Vector3(
            Math.cos(angle) * 0.5,
            Math.sin(angle * 0.7) * 0.3,
            Math.sin(angle) * 0.5
          )
          
          positions[i * 3] += swirl.x * delta
          positions[i * 3 + 1] += swirl.y * delta
          positions[i * 3 + 2] += swirl.z * delta
        }
      }
      
      interactiveParticlesRef.current.geometry.attributes.position.needsUpdate = true
    }
    
    // Update thruster particles
    if (thrusterParticlesRef.current && rocketPosition && rocketVelocity) {
      const speed = Math.sqrt(rocketVelocity.x * rocketVelocity.x + rocketVelocity.y * rocketVelocity.y + rocketVelocity.z * rocketVelocity.z)
      
      if (speed > 0.1) { // Only emit when moving
        const data = thrusterParticleData.current
        
        for (let i = 0; i < 100; i++) {
          // Update existing particles
          if (data.lifetimes[i] > 0) {
            data.positions[i * 3] += data.velocities[i * 3] * delta
            data.positions[i * 3 + 1] += data.velocities[i * 3 + 1] * delta
            data.positions[i * 3 + 2] += data.velocities[i * 3 + 2] * delta
            
            data.lifetimes[i] -= delta
          } else {
            // Spawn new particle from rocket position
            const spawnOffset = new THREE.Vector3(
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 4,
            )
            
            data.positions[i * 3] = rocketPosition.x + spawnOffset.x
            data.positions[i * 3 + 1] = rocketPosition.y + spawnOffset.y
            data.positions[i * 3 + 2] = rocketPosition.z + spawnOffset.z
            
            // Emit opposite to rocket velocity
            const emitDirection = new THREE.Vector3(rocketVelocity.x, rocketVelocity.y, rocketVelocity.z).normalize().multiplyScalar(-1)
            const randomSpread = new THREE.Vector3(
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 2
            )
            
            const finalVel = emitDirection.add(randomSpread).normalize().multiplyScalar(speed * 2)
            
            data.velocities[i * 3] = finalVel.x
            data.velocities[i * 3 + 1] = finalVel.y
            data.velocities[i * 3 + 2] = finalVel.z
            
            data.lifetimes[i] = 2 + Math.random() * 2 // 2-4 second lifetime
          }
        }
        
        thrusterParticlesRef.current.geometry.attributes.position.needsUpdate = true
      }
    }
  })

  return (
    <>
      {/* Background stars */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1000}
            array={starPositions.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={1000}
            array={starPositions.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={2} 
          transparent 
          opacity={0.8}
          sizeAttenuation={true}
          vertexColors={true}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Floating particles with wake effects */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={300}
            array={floatingParticles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={1.5} 
          color="#00ffff" 
          transparent 
          opacity={0.7}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
        />
      </points>


    </>
  )
}

// Enhanced lighting for the futuristic scene
function FuturisticLighting() {
  return (
    <>
      <ambientLight intensity={1} color="#212224" />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={0.5} 
        color="#ffffff" 
        castShadow 
      />
      <pointLight 
        position={[0, 10, 0]} 
        intensity={1} 
        color="#00ffff" 
        distance={50}
      />
      <pointLight 
        position={[-20, 5, -20]} 
        intensity={0.8} 
        color="#0080ff" 
        distance={40}
      />
      <pointLight 
        position={[20, 5, 20]} 
        intensity={0.8} 
        color="#80ff00" 
        distance={40}
      />
    </>
  )
}

export { GridFloor, StarField, FuturisticLighting }
