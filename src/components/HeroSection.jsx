import React from 'react'
import { Canvas } from '@react-three/fiber'
import './HeroSection.css'
import Scene3D from './Scene3D'

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-canvas">
        <Canvas
        camera={{ position: [50, 15, 50], fov: 12}}
        gl={{ antialias: true, alpha: true }}
        >
          <Scene3D />
        </Canvas>
      </div>
      <div className="hero-content">
        <h1 className="hero-title">infinite potential</h1>
      </div>
      <div className="hero-background"></div>
    </section>

  )
}

export default HeroSection
