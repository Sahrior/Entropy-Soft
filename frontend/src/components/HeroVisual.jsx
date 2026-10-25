// An ordered grid that dissolves from left to right: the idea behind the name.
const COLS = 9;
const ROWS = 7;
const PITCH = 38;
const SIZE = 22;

// Deterministic pseudo-random so the artwork is identical on every render.
const rand = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export default function HeroVisual() {
  const cells = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const i = r * COLS + c;
      const chaos = c / (COLS - 1);
      if (chaos > 0.45 && rand(i + 50) < chaos * 0.5) continue; // some cells are lost to disorder
      const x = c * PITCH + (rand(i) - 0.5) * chaos * 40;
      const y = r * PITCH + (rand(i + 99) - 0.5) * chaos * 40;
      const rot = (rand(i + 7) - 0.5) * chaos * 80;
      const scale = 1 - chaos * 0.45 * rand(i + 13);
      const opacity = 1 - chaos * (0.35 + 0.5 * rand(i + 3));
      cells.push({ i, x, y, rot, size: SIZE * scale, opacity, delay: (rand(i + 21) * 7).toFixed(2), outline: chaos > 0.6 && rand(i + 31) > 0.55 });
    }
  }
  return (
    <svg className="hero-visual" viewBox="-30 -30 364 290" aria-hidden="true" focusable="false">
      {cells.map((cell) => (
        <g key={cell.i} transform={`translate(${cell.x.toFixed(1)} ${cell.y.toFixed(1)}) rotate(${cell.rot.toFixed(1)})`}>
          <rect
            className={`hv-cell ${cell.outline ? 'hv-cell--outline' : ''}`}
            x={-cell.size / 2}
            y={-cell.size / 2}
            width={cell.size}
            height={cell.size}
            rx="3"
            opacity={cell.opacity.toFixed(2)}
            style={{ animationDelay: `${cell.delay}s` }}
          />
        </g>
      ))}
    </svg>
  );
}
