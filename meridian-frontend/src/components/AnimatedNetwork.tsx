import { useEffect, useRef } from 'react';

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
};

export function AnimatedNetwork() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animationId = 0;
    const nodes: Node[] = Array.from({ length: 62 }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0008,
      vy: (Math.random() - 0.5) * 0.0008,
      r: 1.5 + (index % 4) * 0.7,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      frame += 1;
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      ctx.clearRect(0, 0, width, height);

      const progress = Math.min(frame / 240, 1);
      const activeCount = Math.floor(nodes.length * progress);
      const visibleNodes = nodes.slice(0, Math.max(activeCount, 12));

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.94)');
      gradient.addColorStop(0.56, 'rgba(4, 22, 18, 0.96)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.96)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0.04 || node.x > 0.96) node.vx *= -1;
        if (node.y < 0.05 || node.y > 0.95) node.vy *= -1;
      }

      visibleNodes.forEach((a, i) => {
        visibleNodes.slice(i + 1).forEach((b) => {
          const ax = a.x * width;
          const ay = a.y * height;
          const bx = b.x * width;
          const by = b.y * height;
          const distance = Math.hypot(ax - bx, ay - by);
          if (distance < 190) {
            ctx.strokeStyle = `rgba(0, 200, 150, ${0.18 * (1 - distance / 190)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        });
      });

      visibleNodes.forEach((node) => {
        const pulse = Math.sin(frame / 24 + node.phase) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(0, 200, 150, ${0.45 + pulse * 0.45})`;
        ctx.shadowColor = 'rgba(0, 200, 150, 0.7)';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(node.x * width, node.y * height, node.r + pulse * 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      const hubX = width * (0.68 + Math.sin(frame / 120) * 0.02);
      const hubY = height * 0.48;
      for (let i = 0; i < 4; i += 1) {
        ctx.strokeStyle = `rgba(255, 185, 0, ${0.16 - i * 0.03})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hubX, hubY, 42 + ((frame * 1.4 + i * 32) % 150), 0, Math.PI * 2);
        ctx.stroke();
      }

      ['$', '↯', 'ƒ', '+'].forEach((token, index) => {
        const t = (frame / 90 + index / 4) % 1;
        ctx.fillStyle = `rgba(255, 185, 0, ${1 - t})`;
        ctx.font = '600 18px ui-monospace, SFMono-Regular, Consolas, monospace';
        ctx.fillText(token, hubX + Math.cos(index * 1.6) * 120 * t, hubY + Math.sin(index * 1.6) * 90 * t);
      });

      animationId = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
