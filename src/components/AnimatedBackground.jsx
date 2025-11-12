import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme ?? 'light';
  const isDark = theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const palette = isDark
      ? ['#00D4FF', '#8B5CF6']
      : ['#d4b08a', '#c89d76', '#e3c8aa'];

    const connectorColor = isDark ? '#00D4FF' : 'rgba(184, 144, 99, 0.6)';
    const maxConnections = isDark ? 120 : 80;
    const particleCount = isDark ? 50 : 30;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * (isDark ? 0.5 : 0.25);
        this.vy = (Math.random() - 0.5) * (isDark ? 0.5 : 0.25);
        this.size = Math.random() * (isDark ? 2 : 1.5) + 0.8;
        this.opacity = isDark ? Math.random() * 0.5 + 0.2 : Math.random() * 0.25 + 0.2;
        this.color = palette[Math.floor(Math.random() * palette.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw(context) {
        context.save();
        context.globalAlpha = this.opacity;
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
    }

    const particles = Array.from({ length: particleCount }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });

      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxConnections) {
            ctx.save();
            ctx.globalAlpha = ((maxConnections - distance) / maxConnections) * (isDark ? 0.1 : 0.08);
            ctx.strokeStyle = connectorColor;
            ctx.lineWidth = isDark ? 0.5 : 0.35;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [isDark]);

  return (
    <div className={`animated-background ${isDark ? 'animated-background--dark' : 'animated-background--light'}`}>
      <canvas
        ref={canvasRef}
        className="particle-canvas"
        style={{ background: 'transparent' }}
      />

      <div className="gradient-overlay-1" />
      <div className="gradient-overlay-2" />
    </div>
  );
};

export default AnimatedBackground;
