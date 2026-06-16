'use client'
import { useEffect, useRef, useState } from 'react'
import { toDateKey, startOfMonth, daysInMonth, DAY_LABELS, TaskChip } from './calendarShared'
import { useCalendarDrag } from './calendarDrag'

const MAX_CHIPS = 3

interface Props {
    month: Date
    items: Item[]
    allItems: Item[]
    groups: Group[]
    onDrop: (item: Item, dateKey: string, hour: number, minute: number) => void
}

interface DayCellProps {
    day: number
    dateKey: string
    isToday: boolean
    cellItems: Item[]
    groups: Group[]
    onDrop: (item: Item, dateKey: string, hour: number, minute: number) => void
}

function DayCell({ day, dateKey, isToday, cellItems, groups, onDrop }: DayCellProps) {
    const { dragging, registerDrop } = useCalendarDrag()
    const cellRef = useRef<HTMLDivElement>(null)
    const [isOver, setIsOver] = useState(false)
    const visible  = cellItems.slice(0, MAX_CHIPS)
    const overflow = cellItems.length - MAX_CHIPS

    useEffect(() => {
        const el = cellRef.current
        if (!el) return
        return registerDrop(el, (item) => onDrop(item, dateKey, 9, 0))
    }, [dateKey, onDrop, registerDrop])

    useEffect(() => {
        if (!dragging) setIsOver(false)
    }, [dragging])

    return (
        <div
            ref={cellRef}
            onPointerEnter={() => { if (dragging) setIsOver(true) }}
            onPointerLeave={() => setIsOver(false)}
            style={{
                border: '1px solid rgba(255,255,255,0.05)',
                minHeight: 90,
                padding: '4px 6px',
                background: isOver
                    ? 'rgba(99,102,241,0.12)'
                    : isToday
                        ? 'rgba(99,102,241,0.08)'
                        : undefined,
                transition: 'background 0.15s',
            }}
        >
            <div style={{
                fontSize: 12, fontWeight: isToday ? 700 : 400,
                color: isToday ? '#fff' : 'rgba(255,255,255,0.45)',
                marginBottom: 4,
            }}>
                {day}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {visible.map(i => (
                    <TaskChip key={i.id} item={i} groups={groups} detail="compact" draggable />
                ))}
                {overflow > 0 && (
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, paddingLeft: 4 }}>
                        +{overflow} mais
                    </span>
                )}
            </div>
        </div>
    )
}

export default function CalendarMonthly({ month, items, allItems, groups, onDrop }: Props) {
    const todayKey  = toDateKey(new Date())
    const first     = startOfMonth(month)
    const totalDays = daysInMonth(month)
    const startPad  = first.getDay()

    const cells: Array<{ day: number | null; dateKey: string | null }> = []
    for (let i = 0; i < startPad; i++) cells.push({ day: null, dateKey: null })
    for (let d = 1; d <= totalDays; d++) {
        const date = new Date(month.getFullYear(), month.getMonth(), d)
        cells.push({ day: d, dateKey: toDateKey(date) })
    }
    while (cells.length % 7 !== 0) cells.push({ day: null, dateKey: null })

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* cabeçalho dos dias */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {DAY_LABELS.map(d => (
                    <div key={d} style={{
                        textAlign: 'center', padding: '6px 0',
                        color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                    }}>
                        {d}
                    </div>
                ))}
            </div>

            {/* grade */}
            <div className="calendar-scroll" style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {cells.map((cell, idx) =>
                    cell.day !== null && cell.dateKey ? (
                        <DayCell
                            key={idx}
                            day={cell.day}
                            dateKey={cell.dateKey}
                            isToday={cell.dateKey === todayKey}
                            cellItems={items.filter(i => i.scheduledDate === cell.dateKey)}
                            groups={groups}
                            onDrop={onDrop}
                        />
                    ) : (
                        <div key={idx} style={{ border: '1px solid rgba(255,255,255,0.05)', minHeight: 90 }} />
                    )
                )}
            </div>
        </div>
    )
}
