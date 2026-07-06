'use client';

import { Modal, ModalDialog, Button } from '@mui/joy';
import { useState, useEffect, useRef } from 'react';
import { MdAdd, MdDeleteOutline, MdTimer, MdSchedule, MdNotes, MdExpandMore, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import DurationPicker from '@/app/components/timePicker';
import { useTasks } from '@/app/store/tasks';
import { genId } from '@/app/lib/task';
import type { SubtaskDraft, CreateModalProps } from '@/app/types';


const DROPDOWN_STYLE: React.CSSProperties = {
    position: 'absolute',
    zIndex: 9999,
    backgroundColor: 'rgba(248,248,250,0.97)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: 16,
    boxShadow: '0 12px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
    userSelect: 'none',
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTHS   = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']


function CalendarPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [open, setOpen]   = useState(false)
    const wrapRef           = useRef<HTMLDivElement>(null)

    const today    = new Date()
    const initDate = value ? new Date(value + 'T00:00') : today
    const [year, setYear]   = useState(initDate.getFullYear())
    const [month, setMonth] = useState(initDate.getMonth())

    useEffect(() => {
        if (value) {
            const d = new Date(value + 'T00:00')
            setYear(d.getFullYear()); setMonth(d.getMonth())
        }
    }, [value])

    useEffect(() => {
        if (!open) return
        function onDown(e: MouseEvent) {
            if (wrapRef.current?.contains(e.target as Node)) return
            setOpen(false)
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
    }, [open])

    function prevMonth() { month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1) }
    function nextMonth() { month === 11 ? (setMonth(0), setYear(y => y + 1)) : setMonth(m => m + 1) }

    const firstDay    = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
    while (cells.length % 7 !== 0) cells.push(null)

    function toISO(day: number) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const label = value
        ? new Date(value + 'T00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
        : 'Data'

    return (
        <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', height: 40,
                    background: open || value ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: 10, backdropFilter: 'blur(10px)',
                    color: value ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    whiteSpace: 'nowrap', transition: 'background 0.2s',
                }}
            >
                <MdSchedule size={14} style={{ opacity: 0.7 }} />
                {label}
            </button>

            {open && (
                <div style={{ ...DROPDOWN_STYLE, top: 'calc(100% + 6px)', left: 0, padding: '14px 14px 12px', width: 252 }}>
                    <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(0,0,0,0.35)', marginBottom: 10, letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 500 }}>
                        Data
                    </p>

                    {/* Month nav */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <button type="button" onClick={prevMonth} style={navBtn}><MdChevronLeft size={15} /></button>
                        <span style={{ color: 'rgba(0,0,0,0.7)', fontSize: 12, fontWeight: 600 }}>{MONTHS[month]} {year}</span>
                        <button type="button" onClick={nextMonth} style={navBtn}><MdChevronRight size={15} /></button>
                    </div>

                    {/* Weekdays */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
                        {WEEKDAYS.map((d, i) => (
                            <div key={i} style={{ textAlign: 'center', color: 'rgba(0,0,0,0.3)', fontSize: 10, fontWeight: 700 }}>{d}</div>
                        ))}
                    </div>

                    {/* Days */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                        {cells.map((day, i) => {
                            if (!day) return <div key={i} />
                            const iso        = toISO(day)
                            const isSelected = iso === value
                            const isToday    = iso === todayISO
                            const isPast     = iso < todayISO
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => { onChange(isSelected ? '' : iso); if (!isSelected) setOpen(false) }}
                                    style={{
                                        height: 30, borderRadius: 7, border: 'none',
                                        cursor: isPast ? 'default' : 'pointer',
                                        fontSize: 12, fontWeight: isSelected ? 700 : 400,
                                        background: isSelected ? '#5b8dee' : isToday ? 'rgba(91,141,238,0.1)' : 'transparent',
                                        color: isSelected ? '#fff' : isPast ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.7)',
                                        outline: isToday && !isSelected ? '1px solid rgba(91,141,238,0.4)' : 'none',
                                        transition: 'background 0.12s',
                                        opacity: isPast ? 0.5 : 1,
                                    }}
                                    onMouseEnter={e => { if (!isSelected && !isPast) e.currentTarget.style.background = 'rgba(91,141,238,0.12)' }}
                                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? 'rgba(91,141,238,0.1)' : 'transparent' }}
                                >
                                    {day}
                                </button>
                            )
                        })}
                    </div>

                    {value && (
                        <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => { onChange(''); setOpen(false) }}
                                style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                            >
                                Limpar
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}


function TimePickerDropdown({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled: boolean }) {
    const [open, setOpen] = useState(false)
    const wrapRef         = useRef<HTMLDivElement>(null)

    const [h, m] = value ? value.split(':').map(Number) : [9, 0]
    function pad(n: number) { return String(n).padStart(2, '0') }
    function setHour(n: number)   { onChange(`${pad(((n % 24) + 24) % 24)}:${pad(m)}`) }
    function setMinute(n: number) { onChange(`${pad(h)}:${pad(((n % 60) + 60) % 60)}`) }

    useEffect(() => {
        if (!open) return
        function onDown(e: MouseEvent) {
            if (wrapRef.current?.contains(e.target as Node)) return
            setOpen(false)
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
    }, [open])

    const label = value || 'Hora'

    return (
        <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(v => !v)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', height: 40,
                    background: open || value ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: 10, backdropFilter: 'blur(10px)',
                    color: value ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                    fontSize: 13, fontWeight: 500,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.4 : 1,
                    whiteSpace: 'nowrap', transition: 'background 0.2s',
                }}
            >
                {label}
            </button>

            {open && (
                <div style={{ ...DROPDOWN_STYLE, top: 'calc(100% + 6px)', left: 0, padding: '14px 18px 12px', width: 160 }}>
                    <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(0,0,0,0.35)', marginBottom: 12, letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 500 }}>
                        Horário
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        {/* Hours */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                            <button type="button" onClick={() => setHour(h + 1)} style={spinBtn}><MdChevronLeft size={13} style={{ transform: 'rotate(90deg)' }} /></button>
                            <div style={timeCell}>{pad(h)}</div>
                            <button type="button" onClick={() => setHour(h - 1)} style={spinBtn}><MdChevronLeft size={13} style={{ transform: 'rotate(-90deg)' }} /></button>
                        </div>
                        <span style={{ color: 'rgba(0,0,0,0.3)', fontSize: 20, fontWeight: 300, marginBottom: 2 }}>:</span>
                        {/* Minutes */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                            <button type="button" onClick={() => setMinute(m + 5)} style={spinBtn}><MdChevronLeft size={13} style={{ transform: 'rotate(90deg)' }} /></button>
                            <div style={timeCell}>{pad(m - (m % 5))}</div>
                            <button type="button" onClick={() => setMinute(m - 5)} style={spinBtn}><MdChevronLeft size={13} style={{ transform: 'rotate(-90deg)' }} /></button>
                        </div>
                    </div>
                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#5b8dee' }}>{pad(h)}:{pad(m - (m % 5))}</span>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            style={{ padding: '4px 14px', background: '#5b8dee', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

const navBtn: React.CSSProperties = {
    background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: 6, width: 26, height: 26, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'rgba(0,0,0,0.45)', transition: 'background 0.15s',
}

const spinBtn: React.CSSProperties = {
    background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: 5, width: 28, height: 22, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'rgba(0,0,0,0.45)', padding: 0,
}

const timeCell: React.CSSProperties = {
    width: 46, height: 40, borderRadius: 8,
    background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'rgba(0,0,0,0.75)', fontSize: 22, fontWeight: 600, fontFamily: 'monospace',
}


function ContinuousToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!value)}
            title={value ? 'Tarefa contínua (sem tempo definido)' : 'Tornar tarefa contínua (sem tempo definido)'}
            style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', height: 40,
                background: value ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.2)'}`,
                borderRadius: 10, backdropFilter: 'blur(10px)',
                color: value ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'background 0.2s, border-color 0.2s',
            }}
        >
            <span style={{ fontSize: 16, lineHeight: 1 }}>∞</span>
            Sem tempo
        </button>
    )
}


function PomodoroToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!value)}
            title={value ? 'Pomodoro ativado' : 'Pomodoro desativado'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
        >
            <div style={{
                width: 28, height: 16, borderRadius: 8,
                backgroundColor: value ? 'rgba(251,146,60,0.65)' : 'rgba(255,255,255,0.12)',
                border: `1px solid ${value ? 'rgba(251,146,60,0.4)' : 'rgba(255,255,255,0.18)'}`,
                position: 'relative', transition: 'background-color 0.2s, border-color 0.2s', flexShrink: 0,
            }}>
                <div style={{
                    position: 'absolute', top: 2, left: value ? 12 : 2,
                    width: 10, height: 10, borderRadius: '50%',
                    backgroundColor: 'white', transition: 'left 0.2s',
                }} />
            </div>
            <span style={{ fontSize: '13px', lineHeight: 1 }}>🍅</span>
        </button>
    )
}


function PomodoroIntervalInput({ value, onChange }: { value: number | undefined; onChange: (v: number | undefined) => void }) {
    const [open, setOpen] = useState(false)
    const hasCustom = value !== undefined

    return (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                title="Intervalo Pomodoro desta tarefa"
                style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: hasCustom ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.07)',
                    border: `1px solid ${hasCustom ? 'rgba(251,146,60,0.35)' : 'rgba(255,255,255,0.13)'}`,
                    borderRadius: 8, padding: '3px 8px', cursor: 'pointer',
                    color: hasCustom ? 'rgba(251,146,60,0.9)' : 'rgba(255,255,255,0.4)',
                    fontSize: 11, fontWeight: 500, transition: 'all 0.15s', flexShrink: 0,
                }}
            >
                <MdTimer size={12} />
                <span>{hasCustom ? `${value}min` : 'padrão'}</span>
                <MdExpandMore size={11} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
                    background: 'rgba(30,30,40,0.97)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                    padding: '10px 12px', minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                        Intervalo Pomodoro
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <button
                            type="button"
                            onClick={() => { onChange(undefined); setOpen(false) }}
                            style={{
                                textAlign: 'left', background: !hasCustom ? 'rgba(251,146,60,0.15)' : 'transparent',
                                border: `1px solid ${!hasCustom ? 'rgba(251,146,60,0.3)' : 'transparent'}`,
                                borderRadius: 6, padding: '4px 8px', color: !hasCustom ? 'rgba(251,146,60,0.9)' : 'rgba(255,255,255,0.5)',
                                fontSize: 11, cursor: 'pointer',
                            }}
                        >
                            Usar padrão global
                        </button>
                        {[10, 15, 20, 25, 30, 45].map(min => (
                            <button
                                key={min}
                                type="button"
                                onClick={() => { onChange(min); setOpen(false) }}
                                style={{
                                    textAlign: 'left', background: value === min ? 'rgba(251,146,60,0.15)' : 'transparent',
                                    border: `1px solid ${value === min ? 'rgba(251,146,60,0.3)' : 'transparent'}`,
                                    borderRadius: 6, padding: '4px 8px',
                                    color: value === min ? 'rgba(251,146,60,0.9)' : 'rgba(255,255,255,0.55)',
                                    fontSize: 11, cursor: 'pointer',
                                }}
                            >
                                {min} minutos
                            </button>
                        ))}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <input
                                type="number"
                                min={1} max={120}
                                placeholder="Personalizado"
                                value={hasCustom && ![10,15,20,25,30,45].includes(value!) ? value : ''}
                                onChange={e => {
                                    const n = parseInt(e.target.value)
                                    if (!isNaN(n) && n > 0) onChange(n)
                                }}
                                style={{
                                    flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: 6, color: '#fff', fontSize: 11, padding: '4px 8px', outline: 'none', width: 0,
                                }}
                            />
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, flexShrink: 0 }}>min</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


function SectionLabel({ icon, label, count }: { icon: React.ReactNode; label: string; count?: number }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center' }}>{icon}</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                {label}{count !== undefined ? ` · ${count}` : ''}
            </span>
        </div>
    )
}


interface SubtaskRowProps {
    sub: SubtaskDraft
    index: number
    inputRef: React.Ref<HTMLInputElement> | null
    onUpdate: (id: number, patch: Partial<SubtaskDraft>) => void
    onRemove: (id: number) => void
    onErrorClear: () => void
}

function SubtaskRow({ sub, index, inputRef, onUpdate, onRemove, onErrorClear }: SubtaskRowProps) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
            borderLeft: '2px solid rgba(255,255,255,0.18)', borderRadius: 10, padding: '8px 10px',
            transition: 'border-color 0.15s, background 0.15s',
        }}>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700, width: 14, textAlign: 'right', flexShrink: 0, fontFamily: 'monospace' }}>
                {index + 1}
            </span>
            <input
                ref={inputRef}
                value={sub.name}
                onChange={e => { onUpdate(sub.id, { name: e.target.value }); onErrorClear(); }}
                placeholder="Nome da subtarefa"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 13, minWidth: 0 }}
            />
            <DurationPicker value={sub.duration} onChange={d => onUpdate(sub.id, { duration: d })} />
            <PomodoroToggle value={sub.pomodoroEnabled} onChange={v => onUpdate(sub.id, { pomodoroEnabled: v })} />
            <button
                type="button"
                onClick={() => onRemove(sub.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,100,100,0.45)', padding: '2px', flexShrink: 0, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,100,100,0.45)')}
            >
                <MdDeleteOutline size={15} />
            </button>
        </div>
    )
}


export default function CreateModal({ openModal, onClose, editItem }: CreateModalProps) {
    const { add, update, addSubtask, remove, items } = useTasks();
    const [name, setName]                         = useState('');
    const [duration, setDuration]                 = useState<durationType>({ hours: 0, minutes: 30 });
    const [continuous, setContinuous]             = useState(false);
    const [description, setDescription]           = useState('');
    const [pomodoroEnabled, setPomodoroEnabled]   = useState(true);
    const [pomodoroIntervalMin, setPomodoroIntervalMin] = useState<number | undefined>(undefined);
    const [scheduledDate, setScheduledDate]       = useState('');
    const [scheduledTime, setScheduledTime]       = useState('');
    const [error, setError]                       = useState('');
    const [subtasks, setSubtasks]                 = useState<SubtaskDraft[]>([]);
    const [descOpen, setDescOpen]                 = useState(false);
    const lastInputRef = useRef<HTMLInputElement | null>(null);
    const nameInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (openModal && !editItem) {
            setTimeout(() => nameInputRef.current?.focus(), 80)
        }
    }, [openModal])

    useEffect(() => {
        if (editItem) {
            setName(editItem.name);
            setDuration(editItem.duration);
            setContinuous(editItem.continuous ?? false);
            setDescription(editItem.description);
            setPomodoroEnabled(editItem.pomodoroEnabled ?? true);
            setPomodoroIntervalMin(editItem.pomodoroIntervalMin ?? undefined);
            setScheduledDate(editItem.scheduledDate ?? '');
            setScheduledTime(editItem.scheduledTime ?? '');
            setDescOpen(!!editItem.description);
            const existingSubs = items.filter(i => i.parentId === editItem.id);
            setSubtasks(existingSubs.map(s => ({
                id: s.id,
                name: s.name,
                duration: s.duration,
                pomodoroEnabled: s.pomodoroEnabled ?? true,
            })));
        } else {
            clear();
        }
    }, [editItem, openModal]);

    function clear() {
        setName('');
        setDuration({ hours: 0, minutes: 30 });
        setContinuous(false);
        setDescription('');
        setPomodoroEnabled(true);
        setPomodoroIntervalMin(undefined);
        setScheduledDate('');
        setScheduledTime('');
        setError('');
        setSubtasks([]);
        setDescOpen(false);
    }

    function addSubtaskDraft() {
        setSubtasks(prev => [...prev, { id: genId(), name: '', duration: { hours: 0, minutes: 30 }, pomodoroEnabled }]);
        setTimeout(() => lastInputRef.current?.focus(), 50);
    }

    function updateDraft(id: number, patch: Partial<SubtaskDraft>) {
        setSubtasks(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    }

    function removeDraft(id: number) {
        setSubtasks(prev => prev.filter(s => s.id !== id));
    }

    function handleSave() {
        if (name.trim().length <= 1) { setError('Nome deve ter pelo menos 2 caracteres'); return; }
        for (const sub of subtasks) {
            if (sub.name.trim().length <= 1) { setError('Subtarefa precisa ter pelo menos 2 caracteres'); return; }
        }

        const sDate = scheduledDate || null
        const sTime = scheduledDate && scheduledTime ? scheduledTime : null

        if (editItem) {
            update({ ...editItem, name, duration, continuous, description, pomodoroEnabled, pomodoroIntervalMin: pomodoroIntervalMin ?? null, scheduledDate: sDate, scheduledTime: sTime });

            const storeSubs = items.filter(i => i.parentId === editItem.id);
            const storeIds  = new Set(storeSubs.map(i => i.id));
            const draftIds  = new Set(subtasks.map(s => s.id));

            storeSubs.forEach(s => { if (!draftIds.has(s.id)) remove(s.id); });
            subtasks.forEach(sub => {
                if (storeIds.has(sub.id)) {
                    const orig = storeSubs.find(s => s.id === sub.id)!;
                    update({ ...orig, name: sub.name, duration: sub.duration, pomodoroEnabled: sub.pomodoroEnabled });
                } else {
                    addSubtask(editItem.id, { name: sub.name, duration: sub.duration, description: '', pomodoroEnabled: sub.pomodoroEnabled, groupId: editItem.groupId });
                }
            });
        } else {
            const parentId = genId();
            add({ name, duration, continuous, description, pomodoroEnabled, pomodoroIntervalMin: pomodoroIntervalMin ?? null, scheduledDate: sDate, scheduledTime: sTime }, parentId);
            subtasks.forEach(sub => {
                addSubtask(parentId, { name: sub.name, duration: sub.duration, description: '', pomodoroEnabled: sub.pomodoroEnabled });
            });
        }
        clear();
        onClose();
    }

    const isEditing = !!editItem;

    return (
        <Modal open={openModal} onClose={onClose}>
            <ModalDialog sx={{
                backdropFilter: 'blur(32px)',
                backgroundColor: 'rgba(255,255,255,0.11)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.25)',
                borderRadius: '20px',
                maxWidth: '560px',
                width: '92%',
                padding: '0',
                overflow: 'visible',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
            }}>

                {/* ── Header ── */}
                <div style={{ padding: '22px 24px 0', flexShrink: 0 }}>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
                        {isEditing ? 'Editar atividade' : 'Nova atividade'}
                    </p>

                    {/* Name */}
                    <input
                        ref={nameInputRef}
                        placeholder="Nome da atividade"
                        value={name}
                        onChange={e => { setName(e.target.value); setError('') }}
                        style={{
                            width: '100%', background: 'transparent', border: 'none', outline: 'none',
                            color: '#fff', fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em',
                            marginBottom: 16,
                        }}
                    />

                    {/* Duration + Pomodoro row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                        {!continuous && <DurationPicker value={duration} onChange={setDuration} />}
                        <ContinuousToggle value={continuous} onChange={setContinuous} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}>
                            <PomodoroToggle value={pomodoroEnabled} onChange={setPomodoroEnabled} />
                            {pomodoroEnabled && (
                                <>
                                    <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
                                    <PomodoroIntervalInput value={pomodoroIntervalMin} onChange={setPomodoroIntervalMin} />
                                </>
                            )}
                        </div>
                    </div>

                    <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', marginLeft: -24, marginRight: -24 }} />
                </div>

                {/* ── Scrollable body ── */}
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'visible', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Description (collapsible) */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setDescOpen(v => !v)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%' }}
                        >
                            <SectionLabel icon={<MdNotes size={13} />} label="Descrição" />
                            <MdExpandMore size={13} style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 'auto', transform: descOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                        {descOpen && (
                            <textarea
                                placeholder="Adicione notas ou detalhes..."
                                value={description}
                                rows={3}
                                onChange={e => setDescription(e.target.value)}
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 10, color: 'rgba(255,255,255,0.8)', fontSize: 13, padding: '10px 12px',
                                    outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                                    marginTop: 4,
                                }}
                            />
                        )}
                    </div>

                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

                    {/* Scheduling */}
                    <div>
                        <SectionLabel icon={<MdSchedule size={13} />} label="Agendamento" />
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <CalendarPicker
                                value={scheduledDate}
                                onChange={v => { setScheduledDate(v); if (!v) setScheduledTime('') }}
                            />
                            <TimePickerDropdown
                                value={scheduledTime}
                                onChange={setScheduledTime}
                                disabled={!scheduledDate}
                            />
                        </div>
                    </div>

                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

                    {/* Subtasks */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <SectionLabel icon={<span style={{ fontSize: 12 }}>⊞</span>} label="Subtarefas" count={subtasks.length || undefined} />
                            <button
                                type="button"
                                onClick={addSubtaskDraft}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.11)',
                                    borderRadius: 8, color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                                    padding: '4px 10px', fontSize: 11, fontWeight: 500, transition: 'background 0.15s',
                                    marginBottom: 8,
                                }}
                            >
                                <MdAdd size={13} /> Adicionar
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {subtasks.length === 0 ? (
                                <div style={{
                                    border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 10,
                                    padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: 12,
                                }}>
                                    Nenhuma subtarefa — clique em Adicionar para criar
                                </div>
                            ) : subtasks.map((sub, idx) => (
                                <SubtaskRow
                                    key={sub.id}
                                    sub={sub}
                                    index={idx}
                                    inputRef={idx === subtasks.length - 1 ? lastInputRef : null}
                                    onUpdate={updateDraft}
                                    onRemove={removeDraft}
                                    onErrorClear={() => setError('')}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div style={{
                    padding: '12px 24px 16px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
                }}>
                    {error
                        ? <span style={{ color: 'rgba(255,100,100,0.9)', fontSize: 12 }}>{error}</span>
                        : <span />
                    }
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button variant="plain" onClick={onClose} sx={buttonSecondary}>Fechar</Button>
                        <Button onClick={handleSave} sx={buttonPrimary}>
                            {isEditing ? 'Salvar alterações' : 'Criar atividade'}
                        </Button>
                    </div>
                </div>
            </ModalDialog>
        </Modal>
    );
}

const buttonPrimary = {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.7), rgba(139,92,246,0.7))',
    color: '#fff',
    border: '1px solid rgba(139,92,246,0.4)',
    borderRadius: '10px',
    backdropFilter: 'blur(10px)',
    fontWeight: 600,
    '&:hover': { background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9))' },
};

const buttonSecondary = {
    color: 'rgba(255,255,255,0.45)',
    borderRadius: '10px',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' },
};
