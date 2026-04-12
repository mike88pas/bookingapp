interface DiagonalDividerProps {
  fromColor?: string;
  toColor?: string;
  flip?: boolean;
  className?: string;
}

export function DiagonalDivider({
  fromColor = '#0b0b0b',
  toColor = '#0d0d0d',
  flip = false,
  className = '',
}: DiagonalDividerProps) {
  const clipPath = flip
    ? 'polygon(0 0, 100% 0, 100% 100%, 0 60%)'
    : 'polygon(0 0, 100% 40%, 100% 100%, 0 100%)';

  return (
    <div className={`relative h-16 md:h-24 ${className}`} style={{ background: fromColor }}>
      <div
        className="absolute inset-0"
        style={{ background: toColor, clipPath }}
      />
    </div>
  );
}
