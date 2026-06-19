import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Line, LineBasicMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Utility to generate random positions for particles
function generateParticles(count: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const radius = 5 + Math.random() * 5;
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.acos((Math.random() * 2) - 1);
    const x = radius * Math.sin(theta) * Math.cos(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(theta);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

// Particle field component
function ParticleField({ count = 2000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => generateParticles(count), [count]);

  // Slight rotation based on cursor position – placeholder for now
  useFrame(({ mouse }) => {
    if (ref.current) {
      const rotationX = (mouse.y - 0.5) * 0.2;
      const rotationY = (mouse.x - 0.5) * 0.2;
      ref.current.rotation.x = rotationX;
      ref.current.rotation.y = rotationY;
    }
  });

  return (
    <points ref={ref} position={[0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointMaterial
        size={0.04}
        sizeAttenuation={true}
        color="#2c2c2c"
        transparent={true}
        opacity={0.7}
      />
    </points>
  );
}

// Simple nebula fog – a translucent sphere
function Nebula() {
  return (
    <mesh>
      <sphereGeometry args={[6, 32, 32]} />
      <meshStandardMaterial
        color="#EAECEC"
        transparent={true}
        opacity={0.15}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Aurora trails – a set of thin rotating planes with gradient texture
function Aurora() {
  const ref = useRef<THREE.Group>(null!);
  const gradient = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1; canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.5, 'rgba(80,80,80,0.3)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  const planes = [];
  for (let i = 0; i < 5; i++) {
    const radius = 3 + i * 0.4;
    const angle = (i / 5) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    planes.push(
      <mesh key={i} position={[x, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 0.8]} />
        <meshBasicMaterial map={gradient} transparent={true} depthWrite={false} />
      </mesh>
    );
  }

  return <group ref={ref}>{planes}</group>;
}

// Knowledge graph lines between nearby particles
function KnowledgeLines({ points }: { points: THREE.Vector3[] }) {
  const lines: JSX.Element[] = [];
  const maxDist = 0.8;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const pi = points[i];
      const pj = points[j];
      const dist = pi.distanceTo(pj);
      if (dist < maxDist) {
        const id = `${i}-${j}`;
        const geometry = new THREE.BufferGeometry().setFromPoints([pi, pj]);
        lines.push(
          <line key={id} geometry={geometry}>
            <lineBasicMaterial
              attach="material"
              color="#999B9B"
              linewidth={0.5}
              transparent={true}
              opacity={0.4}
            />
          </line>
        );
      }
    }
  }
  return <>{lines}</>;
}

// Main canvas component
export default function HeroCanvas() {
  // Generate particle positions once for line connections
  const particleCount = 350;
  const positions = useMemo(() => generateParticles(particleCount), [particleCount]);
  const points = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < particleCount; i++) {
      arr.push(new THREE.Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      ));
    }
    return arr;
  }, [positions]);

  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <ParticleField count={particleCount} />
      <Nebula />
      <Aurora />
      <KnowledgeLines points={points} />
    </Canvas>
  );
}
