'use client'
import { useEffect, useRef, useState } from 'react'
import { durationToSec, STATUS_CONFIG } from '@/app/lib/task'
import { useCalendarDrag } from '@/app/components/calendar/calendarDrag'

export type CalendarView = 'day' | 'week' | 'month'

export function toDateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function startOfWeek(d: Date): Date {
    const copy = new Date(d)
    copy.setDate(d.getDate() - d.getDay())
    copy.setHours(0, 0, 0, 0)
    return copy
}

export function addDays(d: Date, n: number): Date {
    const copy = new Date(d)
    copy.setDate(d.getDate() + n)
    return copy
}

export function startOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function daysInMonth(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

export const DAY_LABELS  = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']


function durLabel(item: Item): string {
    const sec = durationToSec(item.duration)
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    return h > 0 ? `${h}h${m > 0 ? `${m}m` : ''}` : `${m}m`
}


export interface DropdownOption { value: string; label: string }

export function Dropdown({ value, options, onChange, placeholder }: {
    value: string
    options: DropdownOption[]
    onChange: (v: string) => void
    placeholder?: string
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const selected = options.find(o => o.value === value)

    useEffect(() => {
        function onOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        if (open) document.addEventListener('mousedown', onOutside)
        return () => document.removeEventListener('mousedown', onOutside)
    }, [open])

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: open ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
                    border: `1px solid ${open ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: 8,
                    color: selected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                    fontSize: 11, padding: '4px 8px', cursor: 'pointer',
                    outline: 'none', whiteSpace: 'nowrap',
                    transition: 'background 0.15s, border 0.15s',
                }}
            >
                {selected ? selected.label : (placeholder ?? '')}
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, marginLeft: 2 }}>▾</span>
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                    background: 'rgba(18,18,32,0.92)',
                    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10, overflow: 'hidden', zIndex: 200,
                    minWidth: 140, boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                }}>
                    {options.map(o => (
                        <button
                            key={o.value}
                            onClick={() => { onChange(o.value); setOpen(false) }}
                            style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                padding: '7px 12px',
                                background: o.value === value ? 'rgba(99,102,241,0.25)' : 'transparent',
                                color: o.value === value ? '#fff' : 'rgba(255,255,255,0.6)',
                                fontSize: 11, border: 'none', cursor: 'pointer', transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => { if (o.value !== value) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)' }}
                            onMouseLeave={e => { if (o.value !== value) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                        >
                            {o.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
export type ChipDetail = 'compact' | 'normal' | 'detailed'

export interface TaskChipProps {
    item: Item
    groups: Group[]
    detail?: ChipDetail
    draggable?: boolean
    onClick?: () => void
}

export function TaskChip({ item, groups, detail = 'normal', draggable, onClick }: TaskChipProps) {
    const { startDrag, dragging } = useCalendarDrag()
    const group    = groups.find(g => g.id === item.groupId)
    const dotClass = STATUS_CONFIG[item.status].dot
    const color    = group?.color ?? null
    const label    = durLabel(item)
    const statusLabel = STATUS_CONFIG[item.status].label
    const isBeingDragged = dragging?.id === item.id

    function onPointerDown(e: React.PointerEvent) {
        if (!draggable) return
        startDrag(item, e)
    }

    const base: React.CSSProperties = {
        display: 'flex', alignItems: 'center',
        background: color ? `${color}22` : 'rgba(255,255,255,0.07)',
        borderLeft: `3px solid ${color ?? 'rgba(255,255,255,0.35)'}`,
        borderRadius: 5,
        cursor: draggable ? 'grab' : onClick ? 'pointer' : 'default',
        userSelect: 'none', overflow: 'hidden', flexShrink: 0,
        opacity: isBeingDragged ? 0.35 : 1,
        transition: 'opacity 0.1s',
    }

    if (detail === 'compact') {
        return (
            <div
                onPointerDown={onPointerDown}
                onClick={onClick}
                title={`${item.name} · ${label} · ${statusLabel}`}
                style={{
                    ...base,
                    border: `1px solid ${color ?? 'rgba(255,255,255,0.10)'}`,
                    padding: '2px 5px', gap: 4, whiteSpace: 'nowrap',
                    maxWidth: '100%',
                }}
            >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} style={{ pointerEvents: 'none' }} />
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', pointerEvents: 'none' }}>
                    {item.name}
                </span>
            </div>
        )
    }

    if (detail === 'normal') {
        return (
            <div
                onPointerDown={onPointerDown}
                onClick={onClick}
                title={`${item.name} · ${label} · ${statusLabel}`}
                style={{
                    ...base,
                    border: `1px solid ${color ?? 'rgba(255,255,255,0.12)'}`,
                    padding: '3px 6px', gap: 4, whiteSpace: 'nowrap',
                    width: '100%',
                }}
            >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} style={{ pointerEvents: 'none' }} />
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, pointerEvents: 'none' }}>
                    {item.name}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, flexShrink: 0, marginLeft: 4, pointerEvents: 'none' }}>
                    {label}
                </span>
            </div>
        )
    }

    return (
        <div
            onPointerDown={onPointerDown}
            onClick={onClick}
            title={`${item.name} · ${label} · ${statusLabel}`}
            style={{
                ...base,
                flexDirection: 'column', alignItems: 'flex-start',
                border: `1px solid ${color ?? 'rgba(255,255,255,0.12)'}`,
                padding: '5px 8px', gap: 3,
                minWidth: 120,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%', pointerEvents: 'none' }}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass}`} />
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {item.name}
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none' }}>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>⏱ {label}</span>
                <span style={{
                    fontSize: 9, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                    color: color ?? 'rgba(255,255,255,0.35)',
                    background: color ? `${color}20` : 'rgba(255,255,255,0.06)',
                    padding: '1px 5px', borderRadius: 3,
                }}>
                    {statusLabel}
                </span>
            </div>
        </div>
    )
}


export function UnscheduledBank({ items, groups, onUnschedule }: { items: Item[]; groups: Group[]; onUnschedule: (item: Item) => void }) {
    const { dragging, registerDrop } = useCalendarDrag()
    const unscheduled = items.filter(i => !i.parentId && !i.scheduledDate)
    const dropRef = useRef<HTMLDivElement>(null)
    const [isOver, setIsOver] = useState(false)

    useEffect(() => {
        const el = dropRef.current
        if (!el) return
        return registerDrop(el, (item) => {
            if (item.scheduledDate) onUnschedule(item)
        })
    }, [onUnschedule, registerDrop])

    useEffect(() => {
        if (!dragging) setIsOver(false)
    }, [dragging])

    const canDrop = !!dragging?.scheduledDate

    return (
        <div
            ref={dropRef}
            onPointerEnter={() => { if (canDrop) setIsOver(true) }}
            onPointerLeave={() => setIsOver(false)}
            style={{
                width: 210, flexShrink: 0,
                borderLeft: `1px solid ${isOver ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                background: isOver ? 'rgba(99,102,241,0.07)' : 'transparent',
                transition: 'background 0.15s, border-color 0.15s',
            }}
        >
            <div style={{
                padding: '10px 12px 8px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                color: isOver ? 'rgba(99,102,241,0.9)' : 'rgba(255,255,255,0.35)',
                fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                transition: 'color 0.15s',
            }}>
                Sem data · {unscheduled.length}
            </div>
            <div
                className="calendar-scroll"
                style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: 6 }}
            >
                {unscheduled.length === 0 && (
                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'center', marginTop: 16 }}>
                        Todas as tarefas<br />estão agendadas
                    </div>
                )}
                {unscheduled.map(i => (
                    <TaskChip
                        key={i.id}
                        item={i}
                        groups={groups}
                        detail="normal"
                        draggable
                    />
                ))}
            </div>
        </div>
    )
}

export const navBtnStyle: React.CSSProperties = {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 6,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    cursor: 'pointer',
    padding: '2px 8px',
    lineHeight: 1.4,
}
