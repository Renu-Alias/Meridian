import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create a simple particle system representing the knowledge network
    const particles = new THREE.BufferGeometry();
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: '#00C896', size: 0.07, transparent: true, opacity: 0.8 });
    const pointCloud = new THREE.Points(particles, material);
    scene.add(pointCloud);

    // Simple animation loop – pulsating particles
    const animate = () => {
      requestAnimationFrame(animate);
      pointCloud.rotation.x += 0.0005;
      pointCloud.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on unmount
    return () => {
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[60vh] bg-surface rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
