import React, { useRef, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export function AnimatedModel({ modelPath, animationName, ...props }) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF(modelPath)
  const { actions, names } = useAnimations(animations, group)

  // Play the specified animation on mount
  useEffect(() => {
    if (animationName && actions[animationName]) {
      actions[animationName].reset().fadeIn(0.5).play()
    } else if (names.length > 0) {
      // If no specific animation is provided, play the first one
      actions[names[0]].reset().fadeIn(0.5).play()
    }
  }, [actions, animationName, names])

  // Optional: Log available animations for debugging
  useEffect(() => {
    console.log('Available animations:', names)
  }, [names])

  return (
    <group ref={group} {...props} dispose={null}>
      {/* You'll need to add your model's mesh structure here */}
      {/* This is a generic example - replace with your actual model structure */}
      <primitive object={nodes.Scene || nodes.Root || Object.values(nodes)[0]} />
    </group>
  )
}

// Component with animation controls
export function AnimatedModelWithControls({ modelPath, ...props }) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF(modelPath)
  const { actions, names } = useAnimations(animations, group)
  
  // Function to play a specific animation
  const playAnimation = (animationName) => {
    // Stop all current animations
    Object.values(actions).forEach(action => action.stop())
    
    // Play the selected animation
    if (actions[animationName]) {
      actions[animationName].reset().fadeIn(0.5).play()
    }
  }

  // Function to blend between animations
  const blendToAnimation = (fromAnimation, toAnimation, duration = 1.0) => {
    if (actions[fromAnimation] && actions[toAnimation]) {
      actions[fromAnimation].fadeOut(duration)
      actions[toAnimation].reset().fadeIn(duration).play()
    }
  }

  useEffect(() => {
    // Auto-play first animation
    if (names.length > 0) {
      actions[names[0]].play()
    }
  }, [actions, names])

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={nodes.Scene || nodes.Root || Object.values(nodes)[0]} />
    </group>
  )
}

// Preload the model for better performance
useGLTF.preload('/path/to/your/model.gltf')
