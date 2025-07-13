import React, { useRef, useEffect, useState } from 'react'
import { useLoader } from '@react-three/fiber'
import { FBXLoader } from 'three-stdlib'
import { GLTFLoader } from 'three-stdlib'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function CharacterModel({ position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0], timeDelay = 0 }) {
  const characterRef = useRef()
  const mixerRef = useRef()
  const actionsRef = useRef({})
  const [currentAction, setCurrentAction] = useState('idle')
  
  // Load the character model
  const fbx = useLoader(FBXLoader, '/models/A_3D_character_model__0712202425_texture.fbx')
  
  // Load all animation files
  const animations = {
    idle: useLoader(GLTFLoader, '/animations/Animation_Idle_withSkin.glb'),
    agree: useLoader(GLTFLoader, '/animations/Animation_Agree_Gesture_withSkin.glb'),
    walk: useLoader(GLTFLoader, '/animations/Animation_Walking_withSkin.glb'),
    run: useLoader(GLTFLoader, '/animations/Animation_Running_withSkin.glb'),
    runFast: useLoader(GLTFLoader, '/animations/Animation_RunFast_withSkin.glb'),
    run03: useLoader(GLTFLoader, '/animations/Animation_Run_03_withSkin.glb')
  }
  
  // Function to change animation
  const playAnimation = (animationName) => {
    if (actionsRef.current[animationName] && actionsRef.current[currentAction]) {
      // Fade out current animation
      actionsRef.current[currentAction].fadeOut(0.5)
      
      // Fade in new animation
      actionsRef.current[animationName].reset().fadeIn(0.5).play()
      
      setCurrentAction(animationName)
    }
  }

  // Generate unique rotation speeds and patterns for this character instance
  const rotationSpeeds = useRef({
    x: (Math.random() - 0.5) * 0.02, // Slower rotation for character
    y: (Math.random() - 0.5) * 0.02,
    z: (Math.random() - 0.5) * 0.02,
    xFreq: 0.05 + Math.random() * 0.15,
    yFreq: 0.04 + Math.random() * 0.12,
    zFreq: 0.03 + Math.random() * 0.1
  })

  useEffect(() => {
    if (fbx && characterRef.current && animations.idle) {
      // Clone the FBX model for this instance
      const clonedFbx = fbx.clone()
      
      // Scale the model appropriately
      clonedFbx.scale.setScalar(0.01)
      
      // Load and apply texture
      const textureLoader = new THREE.TextureLoader()
      const texture = textureLoader.load('/models/A_3D_character_model__0712202425_texture.png')
      
      // Apply texture to all materials in the model
      clonedFbx.traverse((child) => {
        if (child.isMesh) {
          if (child.material) {
            // Clone materials to avoid sharing between instances
            if (Array.isArray(child.material)) {
              child.material = child.material.map(mat => {
                const clonedMat = mat.clone()
                clonedMat.map = texture
                clonedMat.needsUpdate = true
                
                // Enhance visibility for character
                if (clonedMat.isMeshStandardMaterial) {
                  clonedMat.metalness = 0.3
                  clonedMat.roughness = 0.7
                  clonedMat.emissive = new THREE.Color(0x111111)
                  clonedMat.emissiveIntensity = 0.1
                } else {
                  // Convert to MeshStandardMaterial for better control
                  const newMat = new THREE.MeshStandardMaterial({
                    map: texture,
                    metalness: 0.3,
                    roughness: 0.7,
                    emissive: new THREE.Color(0x111111),
                    emissiveIntensity: 0.1,
                    color: new THREE.Color(1.1, 1.1, 1.1)
                  })
                  return newMat
                }
                
                if (clonedMat.color) {
                  clonedMat.color.multiplyScalar(1.2)
                }
                
                return clonedMat
              })
            } else {
              child.material = child.material.clone()
              child.material.map = texture
              child.material.needsUpdate = true
              
              if (child.material.isMeshStandardMaterial) {
                child.material.metalness = 0.3
                child.material.roughness = 0.7
                child.material.emissive = new THREE.Color(0x111111)
                child.material.emissiveIntensity = 0.1
              } else {
                child.material = new THREE.MeshStandardMaterial({
                  map: texture,
                  metalness: 0.3,
                  roughness: 0.7,
                  emissive: new THREE.Color(0x111111),
                  emissiveIntensity: 0.1,
                  color: new THREE.Color(1.1, 1.1, 1.1)
                })
              }
              
              if (child.material.color) {
                child.material.color.multiplyScalar(1.2)
              }
            }
          }
        }
      })
      
      // Create animation mixer
      mixerRef.current = new THREE.AnimationMixer(clonedFbx)
      
      // Load and setup all animations
      Object.entries(animations).forEach(([name, gltf]) => {
        if (gltf.animations && gltf.animations.length > 0) {
          // Use the first animation from each GLB file
          const clip = gltf.animations[0]
          const action = mixerRef.current.clipAction(clip)
          
          // Set animation properties
          if (name === 'idle') {
            action.setLoop(THREE.LoopRepeat)
            action.play() // Start with idle animation
          } else {
            action.setLoop(THREE.LoopRepeat)
            action.setEffectiveWeight(0) // Start with weight 0
          }
          
          actionsRef.current[name] = action
          
          console.log(`Loaded animation: ${name}`, {
            duration: clip.duration,
            tracks: clip.tracks.length
          })
        }
      })
      
      console.log('All animations loaded:', Object.keys(actionsRef.current))
      
      // Add the cloned model to the group
      characterRef.current.add(clonedFbx)
      
      // Cleanup function
      return () => {
        if (characterRef.current) {
          characterRef.current.remove(clonedFbx)
        }
        if (mixerRef.current) {
          mixerRef.current.stopAllAction()
        }
      }
    }
  }, [fbx, animations.idle, animations.agree, animations.walk, animations.run, animations.runFast, animations.run03])

  // Animation update loop
  useFrame((state, delta) => {
    // Update animation mixer
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
    
    if (characterRef.current) {
      const time = state.clock.elapsedTime + timeDelay
      
      // Very subtle drift motion for character (reduced when animating)
      const driftX = Math.sin(time * 0.05) * 0.3 
      const driftY = Math.cos(time * 0.04) * 0.2 
      const driftZ = Math.sin(time * 0.03) * 0.25 
      
      // Apply gentle floating position
      characterRef.current.position.x = position[0] + driftX
      characterRef.current.position.y = position[1] + driftY
      characterRef.current.position.z = position[2] + driftZ
      
      // Very subtle rotation for natural floating feel (reduced)
      characterRef.current.rotation.y = time * 0.1 // Slow Y rotation only
    }
    
    // Auto-cycle through animations every 8 seconds for demo
    const animationCycle = Math.floor(state.clock.elapsedTime / 8) % 6
    const animationNames = ['idle', 'agree', 'walk', 'run', 'runFast', 'run03']
    const targetAnimation = animationNames[animationCycle]
    
    if (targetAnimation !== currentAction) {
      playAnimation(targetAnimation)
    }
  })

  return (
    <group ref={characterRef} scale={scale}>
      {/* Add a softer point light for character illumination */}
      <pointLight 
        position={[1, 2, 1]} 
        intensity={1.2} 
        color="#ffffff" 
        distance={12}
        decay={2}
      />
      
      {/* Animation control UI - click to change animations manually */}
      <mesh 
        position={[0, 3, 0]} 
        onClick={() => {
          const animationNames = ['idle', 'agree', 'walk', 'run', 'runFast', 'run03']
          const currentIndex = animationNames.indexOf(currentAction)
          const nextIndex = (currentIndex + 1) % animationNames.length
          playAnimation(animationNames[nextIndex])
        }}
      >
        <sphereGeometry args={[0.5]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
      </mesh>
      
      {/* The FBX model will be added via useEffect */}
    </group>
  )
}
