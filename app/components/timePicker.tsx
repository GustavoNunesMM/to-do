'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
    value: { hours: number; minutes: number };
    onChange: (value: { hours: number; minutes: number }) => void;
}

const CLOCK_SIZE = 220;
const CENTER = CLOCK_SIZE / 2;
const RADIUS = CENTER - 28;

function getAngle(hours: number, minutes: number, view: 'hours' | 'minutes') {
    if (view === 'hours') return ((hours % 12) / 12) * 360;
    return (minutes / 60) * 360;
}

function polarToCartesian(angle: number, r: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
        x: CENTER + r * Math.cos(rad),
        y: CENTER + r * Math.sin(rad),
    };
}

function getValueFromAngle(angle: number, view: 'hours' | 'minutes') {
    let normalized = ((angle % 360) + 360) % 360;
    if (view === 'hours') {
        const h = Math.round(normalized / 30) % 12;
        return h;
    } else {
        const m = Math.round(normalized / 6) % 60;
        return m;
    }
}

function getAngleFromEvent(e: MouseEvent | React.MouseEvent, svgRef: SVGSVGElement) {
    const rect = svgRef.getBoundingClientRect();
    const x = e.clientX - rect.left - CENTER;
    const y = e.clientY - rect.top - CENTER;
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    return ((angle % 360) + 360) % 360;
}

export default function DurationPicker({ value, onChange }: Props) {
    const [view, setView] = useState<'hours' | 'minutes'>('hours');
    const [open, setOpen] = useState(false);
    const [dragging, setDragging] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const { hours, minutes } = value;
    const label = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}min`;

    // Fecha ao clicar fora
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
                setView('hours');
            }
        }
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    // Drag global
    useEffect(() => {
        if (!dragging) return;

        function handleMouseMove(e: MouseEvent) {
            if (!svgRef.current) return;
            const angle = getAngleFromEvent(e, svgRef.current);
            const raw = getValueFromAngle(angle, view);

            if (view === 'hours') {
                // Preserva se é AM (0-11) ou PM (12-23)
                const isPM = hours >= 12;
                onChange({ hours: isPM ? raw + 12 : raw, minutes });
            } else {
                onChange({ hours, minutes: raw });
            }
        }

        function handleMouseUp() {
            setDragging(false);
            if (view === 'hours') setView('minutes');
        }

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, view, hours, minutes, onChange]);

    function handleSvgMouseDown(e: React.MouseEvent) {
        if (!svgRef.current) return;
        const angle = getAngleFromEvent(e, svgRef.current);
        const raw = getValueFromAngle(angle, view);

        if (view === 'hours') {
            const isPM = hours >= 12;
            onChange({ hours: isPM ? raw + 12 : raw, minutes });
        } else {
            onChange({ hours, minutes: raw });
        }
        setDragging(true);
    }

    const hourMarkers = Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const x = CENTER + RADIUS * Math.cos(rad);
        const y = CENTER + RADIUS * Math.sin(rad);
        const displayHour = i === 0 ? 12 : i;
        const isSelected =
            view === 'hours' && (hours % 12 === i || (hours % 12 === 0 && i === 0));
        return { x, y, label: String(displayHour), isSelected };
    });

    const minuteMarkers = Array.from({ length: 12 }, (_, i) => {
        const min = i * 5;
        const angle = (i / 12) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const x = CENTER + RADIUS * Math.cos(rad);
        const y = CENTER + RADIUS * Math.sin(rad);
        const isSelected = view === 'minutes' && Math.round(minutes / 5) * 5 === min;
        return { x, y, label: String(min).padStart(2, '0'), isSelected };
    });

    const pointerAngle =
        view === 'hours'
            ? ((hours % 12) / 12) * 360
            : (minutes / 60) * 360;
    const pointerEnd = polarToCartesian(pointerAngle, RADIUS);

    return (
        <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => { setOpen(prev => !prev); setView('hours'); }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: open ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '10px',
                    backdropFilter: 'blur(10px)',
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'background 0.2s ease',
                    height: '40px',
                    letterSpacing: '0.02em',
                }}
            >
                {label}
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    backgroundColor: 'rgba(248,248,250,0.97)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(0,0,0,0.07)',
                    borderRadius: '16px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)',
                    padding: '14px 14px 10px',
                    width: `${CLOCK_SIZE + 28}px`,
                    userSelect: 'none',
                }}>
                    <p style={{
                        textAlign: 'center',
                        fontSize: '11px',
                        color: 'rgba(0,0,0,0.35)',
                        marginBottom: '10px',
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                    }}>
                        Duração da atividade
                    </p>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '6px',
                        marginBottom: '12px',
                    }}>
                        {(['hours', 'minutes'] as const).map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                style={{
                                    padding: '4px 16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    backgroundColor: view === v ? '#5b8dee' : 'rgba(0,0,0,0.06)',
                                    color: view === v ? '#fff' : 'rgba(0,0,0,0.45)',
                                    letterSpacing: '0.03em',
                                }}
                            >
                                {v === 'hours' ? 'Horas' : 'Minutos'}
                            </button>
                        ))}
                    </div>

                    <svg
                        ref={svgRef}
                        width={CLOCK_SIZE}
                        height={CLOCK_SIZE}
                        style={{ display: 'block', margin: '0 auto', cursor: 'pointer' }}
                        onMouseDown={handleSvgMouseDown}
                    >
                        <circle cx={CENTER} cy={CENTER} r={CENTER - 4} fill="rgba(0,0,0,0.04)" />

                        <line
                            x1={CENTER} y1={CENTER}
                            x2={pointerEnd.x} y2={pointerEnd.y}
                            stroke="#5b8dee"
                            strokeWidth={2}
                            strokeLinecap="round"
                        />
                        <circle cx={CENTER} cy={CENTER} r={4} fill="#5b8dee" />
                        <circle cx={pointerEnd.x} cy={pointerEnd.y} r={10} fill="#5b8dee" />

                        {(view === 'hours' ? hourMarkers : minuteMarkers).map((m, i) => (
                            <g key={i}>
                                <circle cx={m.x} cy={m.y} r={14}
                                        fill={m.isSelected ? '#5b8dee' : 'transparent'} />
                                <text
                                    x={m.x} y={m.y}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize={11}
                                    fontWeight={m.isSelected ? 700 : 500}
                                    fill={m.isSelected ? '#fff' : 'rgba(0,0,0,0.6)'}
                                    style={{ pointerEvents: 'none' }}
                                >
                                    {m.label}
                                </text>
                            </g>
                        ))}
                    </svg>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '10px',
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                    }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#5b8dee', letterSpacing: '0.02em' }}>
                            {label}
                        </span>
                        <button
                            onClick={() => { setOpen(false); setView('hours'); }}
                            style={{
                                padding: '5px 16px',
                                backgroundColor: '#5b8dee',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                letterSpacing: '0.03em',
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}