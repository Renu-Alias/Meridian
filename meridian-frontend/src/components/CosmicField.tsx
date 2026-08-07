import { useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 1200;
const CONNECTION_DIST = 120;
const MOUSE_INFLUENCE = 0.004;

function Particles({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const mesh = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 2);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * viewport.width * 3;
      pos[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      vel[i * 2] = (Math.random() - 0.5) * 0.15;
      vel[i * 2 + 1] = (Math.random() - 0.5) * 0.15;
    }
    return [pos, vel];
  }, [viewport]);

  const sizes = useMemo(() => {
    const s = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      s[i] = 0.5 + Math.random() * 2.5;
    }
    return s;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, sizes]);

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(0,0,0,0.9)');
    gradient.addColorStop(0.3, 'rgba(0,0,0,0.4)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    const pos = mesh.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    const mx = mouse.current.x;
    const my = mouse.current.y;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] += Math.sin(time * 0.3 + i * 0.01) * 0.04 + velocities[i * 2] + mx * MOUSE_INFLUENCE * (pos[i3 + 2] + 6);
      pos[i3 + 1] += Math.cos(time * 0.25 + i * 0.015) * 0.04 + velocities[i * 2 + 1] + my * MOUSE_INFLUENCE * (pos[i3 + 2] + 6);
      pos[i3 + 2] += Math.sin(time * 0.1 + i * 0.02) * 0.008;

      const bound = Math.max(viewport.width, viewport.height) * 1.8;
      if (pos[i3] > bound) pos[i3] = -bound;
      if (pos[i3] < -bound) pos[i3] = bound;
      if (pos[i3 + 1] > bound) pos[i3 + 1] = -bound;
      if (pos[i3 + 1] < -bound) pos[i3 + 1] = bound;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh} geometry={geometry}>
      <pointsMaterial size={1.8} map={texture} transparent depthWrite={false} blending={THREE.AdditiveBlending} color="#555555" sizeAttenuation />
    </points>
  );
}

function ConnectingLines({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const positionsRef = useRef<Float32Array | null>(null);

  useFrame((state) => {
    if (!lineRef.current) return;

    const pos = positionsRef.current;
    if (!pos) return;
    const verts: number[] = [];
    const particleCount = 400;

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < CONNECTION_DIST && Math.random() < 0.005) {
          verts.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
          verts.push(pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]);
        }
      }
    }

    if (verts.length > 0) {
      const geo = lineRef.current.geometry;
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
      geo.setDrawRange(0, verts.length / 3);
      geo.attributes.position.needsUpdate = true;
    }
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#999999" transparent opacity={0.15} />
    </lineSegments>
  );
}

function FloatingStars() {
  const count = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 10;
    }
    return pos;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.015) * 0.03;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: 3 }).map((_, layer) => (
        <points key={layer} position={[0, 0, -layer * 3]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.3 + layer * 0.2} color="#CCCCCC" transparent opacity={0.15 + layer * 0.1} depthWrite={false} />
        </points>
      ))}
    </group>
  );
}

function NebulaGradients() {
  return (
    <group>
      {[
        { pos: [-8, 4, -8], color: '#EAECEC', size: 14 },
        { pos: [9, -3, -10], color: '#D0D2D2', size: 12 },
        { pos: [-5, -6, -6], color: '#C8CACA', size: 10 },
        { pos: [7, 5, -12], color: '#E0E2E2', size: 11 },
      ].map((n, i) => (
        <mesh key={i} position={n.pos as [number, number, number]}>
          <planeGeometry args={[n.size, n.size]} />
          <meshBasicMaterial color={n.color} transparent opacity={0.06} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  return (
    <>
      <color attach="background" args={['#f7f8f8']} />
      <fog attach="fog" args={['#f7f8f8', 18, 30]} />
      <NebulaGradients />
      <FloatingStars />
      <Particles mouse={mouse} />
      <ConnectingLines mouse={mouse} />
    </>
  );
}

export function CosmicField() {
  const mouse = useRef({ x: 0, y: 0 });

  const handleMouse = useCallback((e: MouseEvent) => {
    mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [handleMouse]);

  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: false }}>
        <Scene mouse={mouse} />
      </Canvas>
    </div>
  );
}
