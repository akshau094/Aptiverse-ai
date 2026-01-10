'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

type DistortableMaterial = THREE.Material & { distort?: number };

function AvatarMesh({ isSpeaking }: { isSpeaking: boolean }) {
  const meshRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const layer1Ref = useRef<THREE.Mesh>(null);
  const layer2Ref = useRef<THREE.Mesh>(null);
  const layer3Ref = useRef<THREE.Mesh>(null);
  const eyesRef = useRef<THREE.Group>(null);
  
  // Smoother state transitions using lerp
  const speakingFactor = useRef(0);
  
  useFrame((state, delta) => {
    if (!meshRef.current || !coreRef.current || !layer1Ref.current || !layer2Ref.current || !layer3Ref.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Smoothly transition the speaking factor
    speakingFactor.current = THREE.MathUtils.lerp(
      speakingFactor.current, 
      isSpeaking ? 1 : 0, 
      delta * 4
    );
    
    // Core subtle pulse
    const corePulse = 1 + Math.sin(time * 1.5) * 0.02;
    coreRef.current.scale.set(corePulse, corePulse, corePulse);

    // Layer 1: Outer Blue Plasma (Smoother waves)
    layer1Ref.current.rotation.z = time * 0.05;
    const l1Scale = 1.3 + (speakingFactor.current * 0.15) + Math.sin(time * 1.2) * 0.03;
    layer1Ref.current.scale.set(l1Scale, l1Scale, l1Scale);
    (layer1Ref.current.material as DistortableMaterial).distort = THREE.MathUtils.lerp(0.4, 0.7, speakingFactor.current);

    // Layer 2: Middle Purple Plasma
    layer2Ref.current.rotation.z = -time * 0.1;
    const l2Scale = 1.15 + (speakingFactor.current * 0.1) + Math.cos(time * 1.5) * 0.02;
    layer2Ref.current.scale.set(l2Scale, l2Scale, l2Scale);
    (layer2Ref.current.material as DistortableMaterial).distort = THREE.MathUtils.lerp(0.3, 0.6, speakingFactor.current);

    // Layer 3: Inner Glow
    layer3Ref.current.rotation.z = time * 0.3;
    const l3Scale = 1.05 + (speakingFactor.current * 0.05) + Math.sin(time * 2) * 0.01;
    layer3Ref.current.scale.set(l3Scale, l3Scale, l3Scale);
    (layer3Ref.current.material as DistortableMaterial).distort = THREE.MathUtils.lerp(0.2, 0.4, speakingFactor.current);

    // Eyes micro-movement
    if (eyesRef.current) {
      eyesRef.current.position.x = Math.sin(time * 0.8) * 0.02;
      eyesRef.current.position.y = Math.cos(time * 0.6) * 0.02;
    }

    // Overall gentle float
    meshRef.current.position.y = Math.sin(time * 0.5) * 0.03;
  });

  return (
    <group ref={meshRef}>
      <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.1}>
        {/* Dark Central Core */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[1, 128, 128]} />
          <meshStandardMaterial 
            color="#020617" 
            roughness={0.1} 
            metalness={0.8} 
          />
        </mesh>

        {/* Outer Plasma Layer - Cyan/Blue */}
        <mesh ref={layer1Ref}>
          <sphereGeometry args={[1, 128, 128]} />
          <MeshDistortMaterial
            speed={2}
            roughness={0}
            color="#0ea5e9"
            emissive="#0284c7"
            emissiveIntensity={isSpeaking ? 4 : 2}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Middle Plasma Layer - Purple/Magenta */}
        <mesh ref={layer2Ref}>
          <sphereGeometry args={[1, 128, 128]} />
          <MeshDistortMaterial
            speed={3}
            roughness={0}
            color="#a855f7"
            emissive="#7e22ce"
            emissiveIntensity={isSpeaking ? 5 : 2.5}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Inner Glow Layer - Electric Blue */}
        <mesh ref={layer3Ref}>
          <sphereGeometry args={[1, 128, 128]} />
          <MeshDistortMaterial
            speed={4}
            roughness={0}
            color="#38bdf8"
            emissive="#0ea5e9"
            emissiveIntensity={isSpeaking ? 3 : 1.5}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* The Two White Eyes (Centered and small) */}
        <group ref={eyesRef} position={[0, 0, 1.01]}>
          <mesh position={[-0.2, 0, 0]}>
            <sphereGeometry args={[0.045, 64, 64]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.2, 0, 0]}>
            <sphereGeometry args={[0.045, 64, 64]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </Float>
      
      {/* Dynamic Aura Lights - Intense Glow */}
      <pointLight position={[0, 0, 2]} intensity={isSpeaking ? 12 : 6} color="#00ffff" />
      <pointLight position={[1, 1, 1]} intensity={isSpeaking ? 8 : 4} color="#ff00ff" />
      <pointLight position={[-1, -1, 1]} intensity={isSpeaking ? 8 : 4} color="#0066ff" />
      <ambientLight intensity={0.1} />
    </group>
  );
}

export default function InterviewerAvatar({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <div className="w-full h-full cursor-pointer">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <AvatarMesh isSpeaking={isSpeaking} />
      </Canvas>
    </div>
  );
}
