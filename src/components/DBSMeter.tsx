type GaugeProps = {
  score: number;
  min: number;
  max: number;
};

const DBSMeter = ({ score, min, max }: GaugeProps) => {
  const angle = ((score - min) / (max - min)) * 180 - 180;

  const cx = 100;
  const cy = 105;
  const r = 80;
  const rad = (angle * Math.PI) / 180;

  const needleX = cx + r * 0.78 * Math.cos(rad);
  const needleY = cy + r * 0.78 * Math.sin(rad);

  return (
    <svg viewBox="0 0 200 150" className="w-full max-w-xs mx-auto">
      <defs>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e74c3c" />
          <stop offset="35%" stopColor="#e67e22" />
          <stop offset="65%" stopColor="#f1c40f" />
          <stop offset="100%" stopColor="#2ecc71" />
        </linearGradient>
      </defs>

      {/* Title */}
      <text
        x="100"
        y="10"
        textAnchor="middle"
        className="font-headline fill-on-surface text-xs gap-3"
      >
        Your DBS Score
      </text>

      {/* Background arc */}
      <path
        d="M 20 105 A 80 80 0 0 1 180 105"
        fill="none"
        stroke="#e0e0e0"
        strokeWidth="14"
        strokeLinecap="round"
      />

      {/* Colored gradient arc */}
      <path
        d="M 20 105 A 80 80 0 0 1 180 105"
        fill="none"
        stroke="url(#arcGrad)"
        strokeWidth="14"
        strokeLinecap="round"
      />

      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={needleX}
        y2={needleY}
        stroke="#555"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="6" fill="#555" />
      <circle cx={cx} cy={cy} r="3" fill="#ccc" />

      {/* Min / Max labels */}
      <text
        x="22"
        y="120"
        fontSize="9"
        className="fill-on-surface-variant font-label"
      >
        300
      </text>
      <text
        x="168"
        y="120"
        fontSize="9"
        className="fill-on-surface-variant font-label"
      >
        900
      </text>

      {/* Score */}
      <text
        x="100"
        y="130"
        textAnchor="middle"
        className="font-headline fill-on-surface font-black text-2xl"
      >
        {score}
      </text>
    </svg>
  );
};

export default DBSMeter;
