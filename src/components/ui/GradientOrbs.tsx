export function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main brand orb — top right */}
      <div
        className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full opacity-[0.07]"
        style={{
          background: 'radial-gradient(circle, #e63946 0%, transparent 70%)',
          animation: 'orb-float 12s ease-in-out infinite',
        }}
      />
      {/* Secondary orb — bottom left */}
      <div
        className="absolute -bottom-[30%] -left-[15%] w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, #e63946 0%, transparent 70%)',
          animation: 'orb-float 15s ease-in-out infinite reverse',
        }}
      />
      {/* Accent orb — center */}
      <div
        className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full opacity-[0.03]"
        style={{
          background: 'radial-gradient(circle, #fff 0%, transparent 70%)',
          animation: 'orb-float 10s ease-in-out infinite 2s',
        }}
      />
    </div>
  );
}
