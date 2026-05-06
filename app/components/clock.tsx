'use client'
interface ArcProgressProps {
    progress: number;
    arcSize: number;
    numTicks?: number;
    radius?: number;
    className?: string;
}

function buildTick(
    index: number,
    total: number,
    startDeg: number,
    arcSizeDeg: number,
    radius: number,
    tickLen: number,
    filled: boolean
) {
    const frac = total === 1 ? 0 : index / (total - 1);
    const deg = startDeg + frac * arcSizeDeg;
    const rad = ((deg - 90) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const innerR = radius - tickLen / 2;
    const outerR = radius + tickLen / 2;
    return {
        x1: innerR * cos, y1: innerR * sin,
        x2: outerR * cos, y2: outerR * sin,
        filled,
    };
}

export default function ArcProgress({
                                        progress,
                                        arcSize,
                                        numTicks = 50,
                                        radius = 65,
                                        className = "",
                                    }: ArcProgressProps) {
    const TICK_LEN = 9;
    const padding = TICK_LEN / 2 + 6;
    const box = radius + padding;
    const viewBox = `${-box} ${-box} ${box * 2} ${box * 2}`;

    const startDeg = 360 - arcSize / 2;
    const filledCount = Math.round((Math.min(progress, 100) / 100) * numTicks);

    const ticks = Array.from({ length: numTicks }, (_, i) =>
        buildTick(i, numTicks, startDeg, arcSize, radius, TICK_LEN, i < filledCount)
    );

    return (
        <div className={`aspect-square max-h-full max-w-full h-full ${className}`}>
            <svg viewBox={viewBox} className="w-full h-full overflow-visible transition-all">

                {ticks.map((t, i) => (
                    <g key={i}>
                        <line
                            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                            strokeWidth={5.5}
                            strokeLinecap="round"
                            stroke={t.filled
                                ? "rgba(109,40,217,0.15)"
                                : "rgba(0,0,0,0.04)"}
                            className={t.filled ? "" : "dark:stroke-white/[0.04]"}
                        />
                        <line
                            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                            strokeWidth={5.5}
                            strokeLinecap="round"
                            stroke={t.filled ? "white" : "currentColor"}
                            className={t.filled ? "" : "text-black/10 dark:text-white/10 transition-all"}
                        />
                        {t.filled && (() => {
                            const mx = (t.x1 + t.x2) / 2;
                            const my = (t.y1 + t.y2) / 2;
                            const dx = t.x2 - t.x1;
                            const dy = t.y2 - t.y1;
                            return (
                                <line
                                    x1={mx - dx * 0.19} y1={my - dy * 0.19}
                                    x2={mx + dx * 0.19} y2={my + dy * 0.19}
                                    strokeWidth={1.5}
                                    strokeLinecap="round"
                                    stroke="rgba(255,255,255,0.5)"
                                />
                            );
                        })()}
                    </g>
                ))}
            </svg>
        </div>
    );
}