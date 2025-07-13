// Example of how to integrate your animated model into Scene3D.jsx

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { AnimatedModel } from './AnimatedModel'

// ... your existing components (PlanetAtmosphere, AnimatedSphere, FloatingParticles)

export default function Scene3D() {
  const cameraLightRef = useRef()
  
  // Dynamic lighting that follows the camera
  useFrame(({ camera }) => {
    if (cameraLightRef.current) {
      // Position light slightly behind and above the camera
      const cameraPosition = camera.position.clone()
      const lightOffset = new THREE.Vector3(0, 2, 5)
      lightOffset.applyQuaternion(camera.quaternion)
      cameraLightRef.current.position.copy(cameraPosition.add(lightOffset))
    }
  })

  return (
    <>
      {/* Enhanced lighting setup for 360-degree illumination */}
      <ambientLight intensity={0.6} color="#ffffff" />
      
      {/* Camera-following light for consistent illumination */}
      <pointLight 
        ref={cameraLightRef}
        intensity={2} 
        color="#ffffff" 
        distance={100}
        decay={0.5}
      />
      
      {/* Key light (main) */}
      <directionalLight position={[5, 5, 8]} intensity={2} color="#FFE4B5" castShadow />
      
      {/* Fill lights (opposite sides) */}
      <directionalLight position={[-5, 5, -8]} intensity={1.8} color="#E0E0FF" />
      <directionalLight position={[8, -3, 5]} intensity={1.5} color="#FFE4E1" />
      <directionalLight position={[-8, -3, -5]} intensity={1.5} color="#E1F5FF" />
      <directionalLight position={[0, -8, 0]} intensity={1.3} color="#FFFFFF" />
      <directionalLight position={[0, 8, 0]} intensity={1.3} color="#FFFFFF" />
      
      {/* Point lights for 360-degree coverage - increased intensity */}
      <pointLight position={[0, 15, 0]} intensity={1.5} color="#FFFFFF" distance={60} />
      <pointLight position={[0, -15, 0]} intensity={1.2} color="#FFFFFF" distance={60} />
      <pointLight position={[20, 0, 0]} intensity={1.3} color="#FFE4B5" distance={50} />
      <pointLight position={[-20, 0, 0]} intensity={1.3} color="#E0E0FF" distance={50} />
      <pointLight position={[0, 0, 20]} intensity={1.3} color="#FFFFFF" distance={50} />
      <pointLight position={[0, 0, -20]} intensity={1.3} color="#FFFFFF" distance={50} />
      
      {/* Additional corner lights to eliminate dark spots */}
      <pointLight position={[10, 10, 10]} intensity={1} color="#FFFFFF" distance={40} />
      <pointLight position={[-10, 10, 10]} intensity={1} color="#FFFFFF" distance={40} />
      <pointLight position={[10, -10, 10]} intensity={1} color="#FFFFFF" distance={40} />
      <pointLight position={[-10, -10, 10]} intensity={1} color="#FFFFFF" distance={40} />
      <pointLight position={[10, 10, -10]} intensity={1} color="#FFFFFF" distance={40} />
      <pointLight position={[-10, 10, -10]} intensity={1} color="#FFFFFF" distance={40} />
      <pointLight position={[10, -10, -10]} intensity={1} color="#FFFFFF" distance={40} />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#FFFFFF" distance={40} />
      
      {/* Hemisphere light for natural ambient lighting */}
      <hemisphereLight skyColor="#87CEEB" groundColor="#F4E4BC" intensity={0.8} />
      
      {/* Your existing planet */}
      <PlanetAtmosphere />
      <AnimatedSphere />
      <FloatingParticles />
      
      {/* Add your animated model */}
      <AnimatedModel 
        modelPath="/models/your-model.gltf"
        animationName="idle" // or whatever your animation is called
        position={[0, 0, 0]}
        scale={[1, 1, 1]}
        rotation={[0, 0, 0]}
      />
      
      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  )
}
