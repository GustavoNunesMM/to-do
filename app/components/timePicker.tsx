'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface Props {
    value: { hours: number; minutes: number };
    onChange: (value: { hours: number; minutes: number }) => void;
}

const CLOCK_SIZE = 220;
const CENTER = CLOCK_SIZE / 2;
const RADIUS = CENTER - 28;

function polarToCartesian(angle: number, r: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

function getValueFromAngle(angle: number, view: 'hours' | 'minutes') {
    const normalized = ((angle % 360) + 360) % 360;
    if (view === 'hours') return Math.round(normalized / 30) % 12;
    return Math.round(normalized / 6) % 60;
}

function getAngleFromEvent(e: MouseEvent | React.MouseEvent, svgEl: SVGSVGElement) {
    const rect = svgEl.getBoundingClientRect();
    const x = e.clientX - rect.left - CENTER;
    const y = e.clientY - rect.top - CENTER;
    return (((Math.atan2(y, x) * (180 / Math.PI) + 90) % 360) + 360) % 360;
}

const POPUP_WIDTH = CLOCK_SIZE + 28;

export default function DurationPicker({ value, onChange }: Props) {
    const [view, setView]       = useState<'hours' | 'minutes'>('hours');
    const [open, setOpen]       = useState(false);
    const [dragging, setDragging] = useState(false);
    const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
    const svgRef     = useRef<SVGSVGElement>(null);
    const buttonRef  = useRef<HTMLButtonElement>(null);
    const popupRef   = useRef<HTMLDivElement>(null);

    const { hours, minutes } = value;
    const label = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}min`;

    const onChangeRef = useRef(onChange);
    useEffect(() => { onChangeRef.current = onChange; });

    function openPicker() {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const popupHeight = 370;

        const top = spaceBelow >= popupHeight
            ? rect.bottom + 10
            : rect.top - popupHeight - 10;

        let left = rect.left + rect.width / 2 - POPUP_WIDTH / 2;
        left = Math.max(8, Math.min(left, window.innerWidth - POPUP_WIDTH - 8));

        setPopupPos({ top, left });
        setView('hours');
        setOpen(true);
    }

    useEffect(() => {
        if (!open) return;
        function onMouseDown(e: MouseEvent) {
            if (
                popupRef.current && !popupRef.current.contains(e.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
    }, [open]);

    const hoursRef   = useRef(hours);
    const minutesRef = useRef(minutes);
    const viewRef    = useRef(view);
    useEffect(() => { hoursRef.current   = hours;   });
    useEffect(() => { minutesRef.current = minutes; });
    useEffect(() => { viewRef.current    = view;    });

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!svgRef.current) return;
        const angle = getAngleFromEvent(e, svgRef.current);
        const raw   = getValueFromAngle(angle, viewRef.current);
        if (viewRef.current === 'hours') {
            onChangeRef.current({ hours: hoursRef.current >= 12 ? raw + 12 : raw, minutes: minutesRef.current });
        } else {
            onChangeRef.current({ hours: hoursRef.current, minutes: raw });
        }
    }, []);

    const onMouseUp = useCallback(() => {
        setDragging(false);
        if (viewRef.current === 'hours') setView('minutes');
    }, []);

    useEffect(() => {
        if (!dragging) return;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [dragging, onMouseMove, onMouseUp]);

    function handleSvgMouseDown(e: React.MouseEvent) {
        if (!svgRef.current) return;
        const angle = getAngleFromEvent(e, svgRef.current);
        const raw = getValueFromAngle(angle, view);
        if (view === 'hours') {
            onChangeRef.current({ hours: hours >= 12 ? raw + 12 : raw, minutes });
        } else {
            onChangeRef.current({ hours, minutes: raw });
        }
        setDragging(true);
    }

    const hourMarkers = Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        return {
            x: CENTER + RADIUS * Math.cos(rad),
            y: CENTER + RADIUS * Math.sin(rad),
            label: String(i === 0 ? 12 : i),
            isSelected: view === 'hours' && (hours % 12 === i || (hours % 12 === 0 && i === 0)),
        };
    });

    const minuteMarkers = Array.from({ length: 12 }, (_, i) => {
        const min = i * 5;
        const angle = (i / 12) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        return {
            x: CENTER + RADIUS * Math.cos(rad),
            y: CENTER + RADIUS * Math.sin(rad),
            label: String(min).padStart(2, '0'),
            isSelected: view === 'minutes' && Math.round(minutes / 5) * 5 === min,
        };
    });

    const pointerAngle = view === 'hours' ? ((hours % 12) / 12) * 360 : (minutes / 60) * 360;
    const pointerEnd = polarToCartesian(pointerAngle, RADIUS);

    const popup = open ? (
        <div
            ref={popupRef}
            style={{
                position: 'fixed',
                top: popupPos.top,
                left: popupPos.left,
                zIndex: 99999,
                backgroundColor: 'rgba(248,248,250,0.97)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(0,0,0,0.07)',
                borderRadius: '16px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
                padding: '14px 14px 10px',
                width: `${POPUP_WIDTH}px`,
                userSelect: 'none',
            }}
        >
            <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(0,0,0,0.35)', marginBottom: '10px', letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 500 }}>
                Duração da atividade
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '12px' }}>
                {(['hours', 'minutes'] as const).map(v => (
                    <button
                        key={v}
                        onClick={() => setView(v)}
                        style={{
                            padding: '4px 16px', borderRadius: '20px', border: 'none',
                            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
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
                <line x1={CENTER} y1={CENTER} x2={pointerEnd.x} y2={pointerEnd.y} stroke="#5b8dee" strokeWidth={2} strokeLinecap="round" />
                <circle cx={CENTER} cy={CENTER} r={4} fill="#5b8dee" />
                <circle cx={pointerEnd.x} cy={pointerEnd.y} r={10} fill="#5b8dee" />
                {(view === 'hours' ? hourMarkers : minuteMarkers).map((m, i) => (
                    <g key={i}>
                        <circle cx={m.x} cy={m.y} r={14} fill={m.isSelected ? '#5b8dee' : 'transparent'} />
                        <text
                            x={m.x} y={m.y}
                            textAnchor="middle" dominantBaseline="central"
                            fontSize={11} fontWeight={m.isSelected ? 700 : 500}
                            fill={m.isSelected ? '#fff' : 'rgba(0,0,0,0.6)'}
                            style={{ pointerEvents: 'none' }}
                        >
                            {m.label}
                        </text>
                    </g>
                ))}
            </svg>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#5b8dee', letterSpacing: '0.02em' }}>
                    {label}
                </span>
                <button
                    onClick={() => setOpen(false)}
                    style={{ padding: '5px 16px', backgroundColor: '#5b8dee', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.03em' }}
                >
                    OK
                </button>
            </div>
        </div>
    ) : null;

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
                ref={buttonRef}
                onClick={() => open ? setOpen(false) : openPicker()}
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: open ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '10px', backdropFilter: 'blur(10px)',
                    color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'background 0.2s ease', height: '40px', letterSpacing: '0.02em',
                }}
            >
                {label}
            </button>

            {typeof window !== 'undefined' && createPortal(popup, document.body)}
        </div>
    );
}
