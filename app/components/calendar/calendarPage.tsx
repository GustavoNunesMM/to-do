'use client'
import { useEffect, useState } from 'react'
import { useTasks } from '@/app/store/tasks'
import { STATUS_CONFIG } from '@/app/lib/task'
import {
    CalendarView, startOfWeek, addDays, MONTH_NAMES,
    Dropdown, UnscheduledBank, navBtnStyle,
} from '@/app/components/calendar/calendarShared'
import CalendarDaily   from '@/app/components/calendar/calendarDaily'
import CalendarWeekly  from '@/app/components/calendar/calendarWeekly'
import CalendarMonthly from '@/app/components/calendar/calendarMonthly'
import { CalendarDragProvider } from '@/app/components/calendar/calendarDrag'
import type { ModalPageProps } from '@/app/types'

export default function CalendarPage({ open, onRequestClose, onClose }: ModalPageProps) {
    const { items, groups, update } = useTasks()
    const [view, setView]               = useState<CalendarView>('week')
    const [currentDate, setCurrentDate] = useState(() => new Date())
    const [filterGroup, setFilterGroup] = useState<number | null>(null)
    const [filterStatus, setFilterStatus] = useState<TaskStatus | null>(null)

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onRequestClose()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onRequestClose])

    function handleAnimationEnd(e: React.AnimationEvent) {
        if (e.animationName === 'calendar-out') onClose()
    }

    const visibleItems = items.filter(i => {
        if (i.parentId) return false
        if (filterGroup !== null && i.groupId !== filterGroup) return false
        if (filterStatus !== null && i.status !== filterStatus) return false
        return true
    })

    function handleDrop(item: Item, dateKey: string, hour: number, minute: number) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        update({ ...item, scheduledDate: dateKey, scheduledTime: time })
    }

    function handleUnschedule(item: Item) {
        update({ ...item, scheduledDate: null, scheduledTime: null })
    }

    function navigate(dir: 1 | -1) {
        setCurrentDate(prev => {
            const d = new Date(prev)
            if (view === 'day')   d.setDate(d.getDate() + dir)
            if (view === 'week')  d.setDate(d.getDate() + dir * 7)
            if (view === 'month') d.setMonth(d.getMonth() + dir)
            return d
        })
    }

    function goToday() { setCurrentDate(new Date()) }

    function periodLabel(): string {
        if (view === 'day') {
            return currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        }
        if (view === 'week') {
            const ws = startOfWeek(currentDate)
            const we = addDays(ws, 6)
            return `${ws.getDate()} ${MONTH_NAMES[ws.getMonth()].slice(0,3)} – ${we.getDate()} ${MONTH_NAMES[we.getMonth()].slice(0,3)} ${we.getFullYear()}`
        }
        return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    }

    const statuses: TaskStatus[] = ['idle', 'running', 'paused', 'done', 'partial']

    return (
      <CalendarDragProvider>
        <div
            className={open ? 'calendar-enter' : 'calendar-exit'}
            onAnimationEnd={handleAnimationEnd}
            style={{
                position: 'fixed', inset: 0, zIndex: 50,
                display: 'flex', flexDirection: 'column',
                background: 'rgba(20,20,40,0.45)',
                backdropFilter: 'blur(28px) saturate(1.6)',
                WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
                borderLeft: '1px solid rgba(255,255,255,0.12)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
            }}
        >
            {/* barra superior */}
            <div style={{
                height: 56, flexShrink: 0,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '0 16px',
            }}>
                <button
                    onClick={onRequestClose}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'rgba(255,255,255,0.45)', fontSize: 20, lineHeight: 1,
                        padding: '0 4px', display: 'flex', alignItems: 'center',
                        transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                    title="Fechar (Esc)"
                >
                    ✕
                </button>

                <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 18 }}>|</span>

                <div style={{ display: 'flex', gap: 4 }}>
                    {(['day','week','month'] as CalendarView[]).map(v => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            style={{
                                background: view === v ? 'rgba(255,255,255,0.12)' : 'none',
                                border: `1px solid ${view === v ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
                                borderRadius: 8,
                                color: view === v ? '#fff' : 'rgba(255,255,255,0.4)',
                                fontSize: 12, fontWeight: 500,
                                cursor: 'pointer', padding: '4px 10px',
                            }}
                        >
                            {v === 'day' ? 'Diário' : v === 'week' ? 'Semanal' : 'Mensal'}
                        </button>
                    ))}
                </div>

                <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 18 }}>|</span>

                <button onClick={() => navigate(-1)} style={navBtnStyle}>‹</button>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, minWidth: 200, textAlign: 'center' }}>
                    {periodLabel()}
                </span>
                <button onClick={() => navigate(1)} style={navBtnStyle}>›</button>
                <button onClick={goToday} style={{ ...navBtnStyle, fontSize: 11, padding: '3px 8px', marginLeft: 4 }}>
                    Hoje
                </button>

                <div style={{ flex: 1 }} />

                <Dropdown
                    value={filterGroup !== null ? String(filterGroup) : ''}
                    placeholder="Todos os grupos"
                    options={[
                        { value: '', label: 'Todos os grupos' },
                        ...groups.map(g => ({ value: String(g.id), label: g.name })),
                    ]}
                    onChange={v => setFilterGroup(v === '' ? null : Number(v))}
                />

                <Dropdown
                    value={filterStatus ?? ''}
                    placeholder="Todos os status"
                    options={[
                        { value: '', label: 'Todos os status' },
                        ...statuses.map(s => ({ value: s, label: STATUS_CONFIG[s].label })),
                    ]}
                    onChange={v => setFilterStatus(v === '' ? null : v as TaskStatus)}
                />
            </div>

            {/* área de conteúdo */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 12 }}>
                    {view === 'day' && (
                        <CalendarDaily
                            date={currentDate}
                            items={visibleItems}
                            allItems={items}
                            groups={groups}
                            onDrop={handleDrop}
                        />
                    )}
                    {view === 'week' && (
                        <CalendarWeekly
                            weekStart={startOfWeek(currentDate)}
                            items={visibleItems}
                            allItems={items}
                            groups={groups}
                            onDrop={handleDrop}
                        />
                    )}
                    {view === 'month' && (
                        <CalendarMonthly
                            month={currentDate}
                            items={visibleItems}
                            allItems={items}
                            groups={groups}
                            onDrop={handleDrop}
                        />
                    )}
                </div>

                <UnscheduledBank items={visibleItems} groups={groups} onUnschedule={handleUnschedule} />
            </div>
        </div>
      </CalendarDragProvider>
    )
}
