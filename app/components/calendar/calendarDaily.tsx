'use client'
import { useEffect, useRef, useState } from 'react'
import { toDateKey, TaskChip } from '@/app/components/calendar/calendarShared'
import { useCalendarDrag } from '@/app/components/calendar/calendarDrag'

const HOURS   = Array.from({ length: 24 }, (_, i) => i)
const ROW_H   = 56
const LABEL_W = 52

interface Props {
    date: Date
    items: Item[]
    allItems: Item[]
    groups: Group[]
    onDrop: (item: Item, dateKey: string, hour: number, minute: number) => void
}

interface HourRowProps {
    h: number
    dateKey: string
    isNowRow: boolean
    slotItems: Item[]
    groups: Group[]
    onDrop: (item: Item, dateKey: string, hour: number, minute: number) => void
}

function HourRow({ h, dateKey, isNowRow, slotItems, groups, onDrop }: HourRowProps) {
    const { dragging, registerDrop } = useCalendarDrag()
    const rowRef = useRef<HTMLDivElement>(null)
    const [isOver, setIsOver] = useState(false)

    useEffect(() => {
        const el = rowRef.current
        if (!el) return
        return registerDrop(el, (item) => onDrop(item, dateKey, h, 0))
    }, [dateKey, h, onDrop, registerDrop])

    useEffect(() => {
        if (!dragging) setIsOver(false)
    }, [dragging])

    return (
        <div
            ref={rowRef}
            onPointerEnter={() => { if (dragging) setIsOver(true) }}
            onPointerLeave={() => setIsOver(false)}
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                minHeight: ROW_H,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: isOver
                    ? 'rgba(99,102,241,0.12)'
                    : isNowRow
                        ? 'rgba(239,68,68,0.06)'
                        : 'transparent',
                transition: 'background 0.15s',
                width: '100%',
                position: 'relative',
            }}
        >
            <div style={{
                width: LABEL_W, flexShrink: 0,
                paddingTop: 8, paddingLeft: 8,
                color: isNowRow ? 'rgba(239,68,68,0.8)' : 'rgba(255,255,255,0.22)',
                fontSize: 10, fontWeight: isNowRow ? 600 : 400,
                letterSpacing: '0.04em',
                borderRight: '1px solid rgba(255,255,255,0.07)',
                alignSelf: 'stretch', display: 'flex', alignItems: 'flex-start',
            }}>
                {String(h).padStart(2, '0')}:00
            </div>

            {isNowRow && (
                <div style={{
                    position: 'absolute', left: LABEL_W,
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'rgba(239,68,68,0.9)',
                    marginTop: 7, marginLeft: -3,
                }} />
            )}

            <div style={{
                flex: 1, display: 'flex', flexWrap: 'wrap',
                gap: 4, padding: '6px 8px',
                alignItems: 'flex-start', minHeight: ROW_H,
            }}>
                {slotItems.map(i => (
                    <TaskChip
                        key={i.id}
                        item={i}
                        groups={groups}
                        detail="detailed"
                        draggable
                    />
                ))}
            </div>
        </div>
    )
}

export default function CalendarDaily({ date, items, allItems, groups, onDrop }: Props) {
    const dateKey  = toDateKey(date)
    const dayItems = items.filter(i => i.scheduledDate === dateKey)
    const isToday  = toDateKey(new Date()) === dateKey
    const nowH     = new Date().getHours()

    return (
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="calendar-scroll">
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {HOURS.map(h => {
                    const slotItems = dayItems.filter(i => {
                        const [ih] = (i.scheduledTime ?? '00:00').split(':').map(Number)
                        return ih === h
                    })
                    return (
                        <HourRow
                            key={h}
                            h={h}
                            dateKey={dateKey}
                            isNowRow={isToday && nowH === h}
                            slotItems={slotItems}
                            groups={groups}
                            onDrop={onDrop}
                        />
                    )
                })}
            </div>
        </div>
    )
}
