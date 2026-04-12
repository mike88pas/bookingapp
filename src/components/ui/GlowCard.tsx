import { useRef, useState, type ReactNode, type MouseEvent } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowCard({
  children,
  className = '',
  glowColor = 'rgba(230, 57, 70, 0.15)',
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 0, y: 0, visible: false });

  const handleMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setGlow({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });
  };

  const handleLeave = () => setGlow((p) => ({ ...p, visible: false }));

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Glow spotlight following cursor */}
      {glow.visible && (
        <div
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            width: 250,
            height: 250,
            left: glow.x - 125,
            top: glow.y - 125,
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            opacity: 1,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
