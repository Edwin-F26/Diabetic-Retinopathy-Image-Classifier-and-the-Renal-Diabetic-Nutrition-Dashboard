import useCountUp from '../hooks/useCountUp';
import { balanceTone } from '../lib/insights';

const SIZE = 168;
const STROKE = 13;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The day's balance as a single dial. The arc is drawn with stroke-dashoffset
 * so it sweeps into place, and the number counts up alongside it.
 */
export default function BalanceRing({ score, label, caption }) {
  const animated = useCountUp(score ?? 0, 900);
  const isScored = score != null;
  const tone = isScored ? balanceTone(score) : 'idle';
  const progress = isScored ? Math.min(1, Math.max(0, animated / 100)) : 0;

  return (
    <div className={`ring ring--${tone}`}>
      <svg
        className="ring__svg"
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={
          isScored
            ? `Daily balance score ${score} out of 100`
            : 'Daily balance not yet available'
        }
      >
        <defs>
          <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--ring-from)" />
            <stop offset="100%" stopColor="var(--ring-to)" />
          </linearGradient>
        </defs>

        <circle
          className="ring__track"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
        />
        <circle
          className="ring__arc"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </svg>

      <div className="ring__center">
        {isScored ? (
          <>
            <span className="ring__score">{Math.round(animated)}</span>
            <span className="ring__label">{label}</span>
          </>
        ) : (
          <>
            <span className="ring__score ring__score--idle">—</span>
            <span className="ring__label">{label}</span>
          </>
        )}
      </div>

      {caption && <p className="ring__caption">{caption}</p>}
    </div>
  );
}
