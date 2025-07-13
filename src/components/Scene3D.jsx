import React, { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { RocketModel } from './RocketModel'
import { StarField, FuturisticLighting } from './FuturisticScene'

export default function Scene3D() {
  const [collisionData, setCollisionData] = useState({
    isColliding: false,
    time: 0,
    direction: { x: 0, y: 0, z: 0 }
  })

  const orbitControlsRef = useRef()

  // Animate camera to simulate mouse dragging from left (horizontal rotation)
  useFrame((state) => {
    if (orbitControlsRef.current) {
      // Simulate horizontal dragging (azimuth rotation)
      const time = state.clock.elapsedTime
      
      // Main horizontal rotation (like dragging from left to right) - slower speed
      orbitControlsRef.current.setAzimuthalAngle(time * 0.05)
      
      // Add subtle vertical movement (like slight vertical mouse movement) - slower
      const verticalOffset = Math.sin(time * 0.05) * 0.1
      orbitControlsRef.current.setPolarAngle(Math.PI / 2 + verticalOffset)
      
      // Update the controls
      orbitControlsRef.current.update()
    }
  })

  // Create 3 rockets with different delays and scales, positioned across the screen
  const rockets = [
    { id: 1, delay: 0, scale: [2, 2, 2], position: [-6, 2, -2] },
    { id: 2, delay: 1.0, scale: [3,3, 3], position: [0, -3, 3] },
    { id: 3, delay: 2.0, scale: [2.5,2.5,2.5], position: [6, 1, -1] }
  ]


  return (
    <>
      {/* Futuristic lighting setup */}
      <FuturisticLighting />
      
      {/* Star field and floating particles */}
      <StarField />
      
      {/* Add multiple rocket models with different delays */}
      {rockets.map((rocket) => (
        <RocketModel 
          key={rocket.id}
          scale={rocket.scale} 
          position={rocket.position}
          timeDelay={rocket.delay}
          onCollision={setCollisionData}
        />
      ))}
      
      <OrbitControls 
        ref={orbitControlsRef}
        enableZoom={false} 
        enablePan={false}
        enableRotate={false}
        autoRotate={false}
      />
    </>
  )
}
