'use client'
import { useEffect, useRef, useState } from 'react'
import { toDateKey, addDays, DAY_LABELS, TaskChip } from './calendarShared'
import { useCalendarDrag } from './calendarDrag'

const HOURS    = Array.from({ length: 24 }, (_, i) => i)
const COL_W    = 80
const HEADER_H = 28

interface Props {
    weekStart: Date
    items: Item[]
    allItems: Item[]
    groups: Group[]
    onDrop: (item: Item, dateKey: string, hour: number, minute: number) => void
}

interface DayRowProps {
    day: Date
    dateKey: string
    isToday: boolean
    dayItems: Item[]
    groups: Group[]
    onDrop: (item: Item, dateKey: string, hour: number, minute: number) => void
}

function DayRow({ day, dateKey, isToday, dayItems, groups, onDrop }: DayRowProps) {
    const { dragging, registerDrop } = useCalendarDrag()
    const rowRef = useRef<HTMLDivElement>(null)
    const [isOver, setIsOver] = useState(false)

    useEffect(() => {
        const el = rowRef.current
        if (!el) return
        return registerDrop(el, (item, x, y) => {
            const rect = el.getBoundingClientRect()
            const relX = x - rect.left - 56
            const hour = Math.min(23, Math.max(0, Math.floor(relX / COL_W)))
            onDrop(item, dateKey, hour, 0)
        })
    }, [dateKey, onDrop, registerDrop])

    useEffect(() => {
        if (!dragging) setIsOver(false)
    }, [dragging])

    return (
        <div
            ref={rowRef}
            onPointerEnter={() => { if (dragging) setIsOver(true) }}
            onPointerLeave={() => setIsOver(false)}
            style={{
                flex: 1, display: 'flex',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                minHeight: 0,
                background: isOver ? 'rgba(99,102,241,0.12)' : 'transparent',
                transition: 'background 0.15s',
            }}
        >
            {/* label do dia */}
            <div style={{
                width: 56, flexShrink: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 1, borderRight: '1px solid rgba(255,255,255,0.08)',
            }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, textTransform: 'uppercase' }}>
                    {DAY_LABELS[day.getDay()]}
                </span>
                <span style={{
                    color: isToday ? '#fff' : 'rgba(255,255,255,0.6)',
                    fontSize: 16, fontWeight: isToday ? 700 : 400,
                    background: isToday ? 'rgba(99,102,241,0.5)' : 'transparent',
                    borderRadius: '50%', width: 28, height: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {day.getDate()}
                </span>
            </div>

            {/* células por hora */}
            {HOURS.map(h => {
                const slotItems = dayItems.filter(i => {
                    const [ih] = (i.scheduledTime ?? '00:00').split(':').map(Number)
                    return ih === h
                })
                return (
                    <div
                        key={h}
                        style={{
                            width: COL_W, flexShrink: 0,
                            borderRight: '1px solid rgba(255,255,255,0.05)',
                            padding: '3px 2px',
                            display: 'flex', flexDirection: 'column', gap: 2,
                            overflow: 'hidden',
                        }}
                    >
                        {slotItems.map(i => (
                            <TaskChip
                                key={i.id}
                                item={i}
                                groups={groups}
                                draggable
                            />
                        ))}
                    </div>
                )
            })}
        </div>
    )
}

export default function CalendarWeekly({ weekStart, items, allItems, groups, onDrop }: Props) {
    const todayKey = toDateKey(new Date())
    const days     = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    return (
        <div
            className="calendar-scroll"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'auto', overflowY: 'hidden' }}
        >
            {/* cabeçalho de horas */}
            <div style={{ display: 'flex', flexShrink: 0, paddingLeft: 56, height: HEADER_H }}>
                {HOURS.map(h => (
                    <div key={h} style={{
                        width: COL_W, flexShrink: 0,
                        color: 'rgba(255,255,255,0.25)', fontSize: 10,
                        textAlign: 'center', lineHeight: `${HEADER_H}px`,
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                    }}>
                        {String(h).padStart(2, '0')}h
                    </div>
                ))}
            </div>

            {/* linhas dos dias */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {days.map((day, di) => {
                    const dateKey  = toDateKey(day)
                    const isToday  = dateKey === todayKey
                    const dayItems = items.filter(i => i.scheduledDate === dateKey)

                    return (
                        <DayRow
                            key={di}
                            day={day}
                            dateKey={dateKey}
                            isToday={isToday}
                            dayItems={dayItems}
                            groups={groups}
                            onDrop={onDrop}
                        />
                    )
                })}
            </div>
        </div>
    )
}
