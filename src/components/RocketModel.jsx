import React, { useRef, useEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { FBXLoader } from 'three-stdlib'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function RocketModel({ position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0], timeDelay = 0, onCollision }) {
  const rocketRef = useRef()
  const fbx = useLoader(FBXLoader, '/models/Retro_Rocket_Explorer_0713163815_texture.fbx')
  
  // Generate unique rotation speeds and patterns for this rocket instance
  const rotationSpeeds = useRef({
    x: (Math.random() - 0.5) * 0.04, // Random speed between -0.02 and 0.02
    y: (Math.random() - 0.5) * 0.03, // Random speed between -0.015 and 0.015
    z: (Math.random() - 0.5) * 0.05, // Random speed between -0.025 and 0.025
    xFreq: 0.1 + Math.random() * 0.3, // Random frequency for sine wave
    yFreq: 0.08 + Math.random() * 0.25,
    zFreq: 0.06 + Math.random() * 0.2
  })

  useEffect(() => {
    if (fbx && rocketRef.current) {
      // Clone the FBX model for this instance
      const clonedFbx = fbx.clone()
      
      // Scale the model appropriately
      clonedFbx.scale.setScalar(0.01) // Adjust this value based on your model size
      
      // Load and apply texture
      const textureLoader = new THREE.TextureLoader()
      const texture = textureLoader.load('/models/Retro_Rocket_Explorer_0713163815_texture.png')
      
      // Apply texture to all materials in the model with enhanced visibility
      clonedFbx.traverse((child) => {
        if (child.isMesh) {
          if (child.material) {
            // Clone materials to avoid sharing between instances
            if (Array.isArray(child.material)) {
              child.material = child.material.map(mat => {
                const clonedMat = mat.clone()
                clonedMat.map = texture
                clonedMat.needsUpdate = true
                
                // Enhance visibility and saturation
                if (clonedMat.isMeshStandardMaterial) {
                  clonedMat.metalness = 0.7 // More metallic for better light reflection
                  clonedMat.roughness = 0.2 // Smoother surface for more reflection
                  clonedMat.emissive = new THREE.Color(0x333333) // Add glow
                  clonedMat.emissiveIntensity = 0.3
                } else if (clonedMat.isMeshPhongMaterial) {
                  clonedMat.shininess = 100 // Increase shininess
                  clonedMat.emissive = new THREE.Color(0x333333) // Add glow
                } else {
                  // Convert to MeshStandardMaterial for better control
                  const newMat = new THREE.MeshStandardMaterial({
                    map: texture,
                    metalness: 0.7,
                    roughness: 0.2,
                    emissive: new THREE.Color(0x333333),
                    emissiveIntensity: 0.3,
                    color: new THREE.Color(1.2, 1.2, 1.2) // Brighten the base color
                  })
                  return newMat
                }
                
                // Increase overall brightness
                if (clonedMat.color) {
                  clonedMat.color.multiplyScalar(1.5) // Make 50% brighter
                }
                
                return clonedMat
              })
            } else {
              child.material = child.material.clone()
              child.material.map = texture
              child.material.needsUpdate = true
              
              // Enhance visibility and saturation
              if (child.material.isMeshStandardMaterial) {
                child.material.metalness = 0.7
                child.material.roughness = 0.2
                child.material.emissive = new THREE.Color(0x333333)
                child.material.emissiveIntensity = 0.3
              } else if (child.material.isMeshPhongMaterial) {
                child.material.shininess = 100
                child.material.emissive = new THREE.Color(0x333333)
              } else {
                // Convert to MeshStandardMaterial for better control
                child.material = new THREE.MeshStandardMaterial({
                  map: texture,
                  metalness: 0.7,
                  roughness: 0.2,
                  emissive: new THREE.Color(0x333333),
                  emissiveIntensity: 0.3,
                  color: new THREE.Color(1.2, 1.2, 1.2)
                })
              }
              
              // Increase overall brightness
              if (child.material.color) {
                child.material.color.multiplyScalar(1.5)
              }
            }
          }
        }
      })
      
      // Add the cloned model to the group
      rocketRef.current.add(clonedFbx)
      
      // Cleanup function to remove the model when component unmounts
      return () => {
        if (rocketRef.current) {
          rocketRef.current.remove(clonedFbx)
        }
      }
    }
  }, [fbx])

  // Gentle floating motion like objects drifting through space
  useFrame((state) => {
    if (rocketRef.current) {
      const time = state.clock.elapsedTime + timeDelay // Add delay offset
      
      // Subtle drift motion - smaller ranges for gentle floating
      const driftX = Math.sin(time * 0.1) * 1.5 
      const driftY = Math.cos(time * 0.08) * 1 
      const driftZ = Math.sin(time * 0.06) * 1.2 
      
      // Apply gentle floating position
      rocketRef.current.position.x = position[0] + driftX
      rocketRef.current.position.y = position[1] + driftY
      rocketRef.current.position.z = position[2] + driftZ
      
      // Very subtle rotation for natural floating feel
      rocketRef.current.rotation.x = time * rotationSpeeds.current.x + Math.sin(time * rotationSpeeds.current.xFreq) * 0.15
      rocketRef.current.rotation.y = time * rotationSpeeds.current.y + Math.cos(time * rotationSpeeds.current.yFreq) * 0.2
      rocketRef.current.rotation.z = time * rotationSpeeds.current.z + Math.sin(time * rotationSpeeds.current.zFreq) * 0.1
    }
  })

  return (
    <group ref={rocketRef} scale={scale}>
      {/* Add a point light that follows the rocket for better visibility */}
      <pointLight 
        position={[0, 2, 2]} 
        intensity={1.5} 
        color="#ffffff" 
        distance={15}
        decay={2}
      />
      {/* The FBX model will be added via useEffect */}
    </group>
  )
}
