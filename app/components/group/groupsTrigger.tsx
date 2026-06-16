'use client'
import { useEffect, useRef, useState } from 'react'

const HOVER_DELAY_MS = 2000
const EDGE_WIDTH = 28  
const TRIGGER_X  = 60  

export default function GroupsTrigger({ onOpen }: { onOpen: () => void }) {
    const [visible, setVisible]   = useState(false)   // semicírculo visível
    const [filling, setFilling]   = useState(false)   // animação de preenchimento
    const timerRef  = useRef<NodeJS.Timeout | null>(null)
    const fillStart = useRef<number | null>(null)
    const rafRef    = useRef<number | null>(null)
    const [fillPct, setFillPct]   = useState(0)

    useEffect(() => {
        function onMouseMove(e: MouseEvent) {
            const nearEdge = e.clientX <= EDGE_WIDTH
            if (nearEdge) {
                setVisible(true)
            } else if (e.clientX > TRIGGER_X) {
                setVisible(false)
                cancelFill()
            }
        }
        window.addEventListener('mousemove', onMouseMove)
        return () => window.removeEventListener('mousemove', onMouseMove)
    }, [])

    function cancelFill() {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
        if (rafRef.current)   { cancelAnimationFrame(rafRef.current); rafRef.current = null }
        fillStart.current = null
        setFilling(false)
        setFillPct(0)
    }

    function startFill() {
        if (filling) return
        setFilling(true)
        fillStart.current = performance.now()

        function tick(now: number) {
            const elapsed = now - (fillStart.current ?? now)
            const pct     = Math.min(elapsed / HOVER_DELAY_MS, 1)
            setFillPct(pct)
            if (pct < 1) {
                rafRef.current = requestAnimationFrame(tick)
            } else {
                onOpen()
                cancelFill()
            }
        }
        rafRef.current = requestAnimationFrame(tick)
    }

    const R             = 60
    const circumference = Math.PI * R
    const dashOffset    = circumference * (1 - fillPct)

    if (!visible) return null

    const arcPath  = `M 0 0 A ${R} ${R} 0 0 0 0 ${R * 2} Z`
    const arcStroke = `M 0 0 A ${R} ${R} 0 0 0 0 ${R * 2}`

    return (
        <div
            className="fixed left-0 top-1/2 -translate-y-1/2 z-40 cursor-pointer"
            style={{ width: R, height: R * 2 }}
            onMouseEnter={startFill}
            onMouseLeave={cancelFill}
            onClick={onOpen}
        >
            <svg
                width={R}
                height={R * 2}
                viewBox={`0 0 ${R} ${R * 2}`}
                overflow="visible"
            >
                <path
                    d={arcPath}
                    fill="rgba(255,255,255,0.08)"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="1"
                />

                {filling && (
                    <path
                        d={arcStroke}
                        fill="none"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="3"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        style={{ transition: 'none' }}
                    />
                )}

                <text
                    x={R * 0.45}
                    y={R}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(255,255,255,0.7)"
                    fontSize="11"
                    fontWeight="600"
                    letterSpacing="2"
                    transform={`rotate(90, ${R * 0.45}, ${R})`}
                    style={{ userSelect: 'none' }}
                >
                    GRUPOS
                </text>
            </svg>
        </div>
    )
}
