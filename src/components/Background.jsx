// Built once at module scope: Math.random() is not allowed during render, and
// re-rolling these on every render made the whole backdrop jump around.
const particles = [...Array(60)].map(() => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: `${Math.random() * 4 + 2}px`,
  color: Math.random() > 0.7 ? "#ff0000" : "#D4AF37",
  delay: `${Math.random() * 5}s`,
  duration: `${Math.random() * 4 + 4}s`,
  glow: `0 0 ${Math.random() * 15 + 10}px ${
    Math.random() > 0.7 ? "rgba(255,0,0,0.8)" : "rgba(212,175,55,0.8)"
  }`,
}));

const petals = [...Array(25)].map(() => ({
  left: `${Math.random() * 100}%`,
  top: `-${Math.random() * 20}%`,
  delay: `${Math.random() * 5}s`,
  duration: `${Math.random() * 4 + 8}s`,
  width: `${Math.random() * 20 + 25}px`,
  height: `${Math.random() * 25 + 30}px`,
  rotate: `${Math.random() * 360}deg`,
}));

export default function Background() {
  return (
    <>
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={`particle-${i}`}
            className="absolute animate-particle-drift"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: "50%",
              animationDelay: p.delay,
              animationDuration: p.duration,
              boxShadow: p.glow,
            }}
          />
        ))}
      </div>

      {/* Petals */}
      <div className="absolute inset-0 overflow-hidden">
        {petals.map((p, i) => (
          <div
            key={`petal-${i}`}
            className="absolute animate-petal-fall-3d"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          >
            <div
              style={{
                width: p.width,
                height: p.height,
                background: "linear-gradient(135deg, #f0c6c6 0%, #d4a0a0 100%)",
                borderRadius: "50% 0 50% 0",
                transform: `rotate(${p.rotate})`,
                boxShadow: "0 8px 16px rgba(212, 160, 160, 0.4)",
                opacity: 0.9,
              }}
            />
          </div>
        ))}
      </div>

      {/* Keyframes – can live here or in a global CSS */}
      <style>{`
        @keyframes particle-drift {
          0%, 100% { transform: translate(0, 0); opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { transform: translate(50px, 50px); }
        }
        @keyframes petal-fall-3d {
          0% { transform: translateY(0) rotate(0deg) rotateX(0deg) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateY(50vh) rotate(180deg) rotateX(180deg) translateX(80px); }
          90% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg) rotateX(360deg) translateX(-80px); opacity: 0; }
        }
        .animate-particle-drift { animation: particle-drift ease-in-out infinite; }
        .animate-petal-fall-3d { animation: petal-fall-3d linear infinite; }
      `}</style>
    </>
  );
}
