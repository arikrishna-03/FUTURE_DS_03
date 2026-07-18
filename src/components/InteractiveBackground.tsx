import React, { useEffect, useRef, useState } from 'react';

interface InteractiveBackgroundProps {
  isDarkMode: boolean;
  themeColor: 'indigo' | 'blue' | 'emerald' | 'purple' | 'rose' | 'amber';
  showParticles?: boolean;
}

const COLOR_MAP = {
  indigo: { r: 99, g: 102, b: 241 },
  blue: { r: 59, g: 130, b: 246 },
  emerald: { r: 16, g: 185, b: 129 },
  purple: { r: 168, g: 85, b: 247 },
  rose: { r: 244, g: 63, b: 94 },
  amber: { r: 245, g: 158, b: 11 },
};

export const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({
  isDarkMode,
  themeColor,
  showParticles = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track mouse coordinates
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Canvas animation logic
  useEffect(() => {
    if (!showParticles) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class definition
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = -Math.random() * 0.4 - 0.1; // rise up
        this.opacity = Math.random() * 0.5 + 0.1;
        this.fadeSpeed = Math.random() * 0.005 + 0.002;
      }

      update(mouseX: number, mouseY: number) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around vertical edges
        if (this.y < 0) {
          this.y = height;
          this.x = Math.random() * width;
        }
        if (this.x < 0 || this.x > width) {
          this.x = Math.random() * width;
        }

        // Mouse avoidance/interaction logic
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const force = (180 - dist) / 180;
          this.x += (dx / dist) * force * 2;
          this.y += (dy / dist) * force * 2;
        }
      }

      draw(c: CanvasRenderingContext2D, color: { r: number; g: number; b: number }) {
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity})`;
        c.fill();
      }
    }

    // Initialize particles
    const particleCount = Math.min(80, Math.floor((width * height) / 18000));
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Handle resizing
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const activeColor = COLOR_MAP[themeColor];

    // Animation Loop
    const draw = () => {
      // Clear canvas with subtle trail effect
      ctx.clearRect(0, 0, width, height);

      // Render glowing aura blob in the background
      if (isDarkMode) {
        const gradient = ctx.createRadialGradient(
          width / 2,
          height / 2,
          10,
          width / 2,
          height / 2,
          Math.max(width, height)
        );
        gradient.addColorStop(0, `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, 0.03)`);
        gradient.addColorStop(0.5, 'rgba(10, 15, 30, 0)');
        gradient.addColorStop(1, 'rgba(3, 7, 18, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw and update particles
      particles.forEach((p) => {
        p.update(mousePos.x, mousePos.y);
        p.draw(ctx, activeColor);
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [themeColor, mousePos, isDarkMode, showParticles]);

  const activeColor = COLOR_MAP[themeColor];

  // Mouse radial aura glow style
  const radialGlow = showParticles
    ? isDarkMode
      ? `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, 0.08), transparent 80%)`
      : `radial-gradient(500px at ${mousePos.x}px ${mousePos.y}px, rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, 0.04), transparent 80%)`
    : '';

  return (
    <>
      {showParticles && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-0 opacity-60 transition-opacity duration-500 print:hidden"
        />
      )}
      {showParticles && radialGlow && (
        <div
          className="fixed inset-0 pointer-events-none z-10 transition-opacity duration-300 print:hidden"
          style={{ background: radialGlow }}
        />
      )}
    </>
  );
};
