'use client'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Modal, ModalDialog } from '@mui/joy'
import { MdAdd, MdDeleteOutline, MdOutlineEdit, MdExpandMore, MdHistory, MdDragIndicator } from "react-icons/md";
import { useTasks } from '@/app/store/tasks'
import { useTimerLive } from '@/app/store/timerContext'
import CreateModal from '@/app/components/modal/createModal'
import { STATUS_CONFIG, durationToSec, formatRemaining, formatDuration, formatSec, formatTime } from '@/app/lib/task'
import type { CompletedEntry } from '@/app/types'

// ─── Animated subtask accordion ──────────────────────────────────────────────

function AnimatedSubtasks({ open, children }: { open: boolean; children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState(0)
    const [visible, setVisible] = useState(open)

    useEffect(() => {
        if (open) {
            setVisible(true)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (ref.current) setHeight(ref.current.scrollHeight)
                })
            })
        } else {
            setHeight(0)
            const t = setTimeout(() => setVisible(false), 220)
            return () => clearTimeout(t)
        }
    }, [open])

    if (!visible) return null

    return (
        <div style={{ height: open ? height : 0, overflow: 'hidden', transition: 'height 0.22s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <div ref={ref}>{children}</div>
        </div>
    )
}

// ─── Subtask progress bar ─────────────────────────────────────────────────────

function SubtaskProgressBar({ done, total, groupColor }: { done: number; total: number; groupColor?: string }) {
    const pct = total > 0 ? (done / total) * 100 : 0
    return (
        <div style={{ height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: 3 }}>
            <div
                style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: 2,
                    background: groupColor ?? 'rgba(255,255,255,0.45)',
                    transition: 'width 0.35s ease',
                }}
            />
        </div>
    )
}

// ─── Delete confirmation ──────────────────────────────────────────────────────

function DeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
    return (
        <Modal open onClose={onCancel}>
            <ModalDialog sx={{
                backdropFilter: 'blur(32px)',
                backgroundColor: 'rgba(255,255,255,0.09)',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                borderRadius: '18px',
                padding: '28px 28px 22px',
                maxWidth: '340px',
                width: '90%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
            }}>
                {/* Icon */}
                <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <MdDeleteOutline size={22} style={{ color: 'rgba(239,68,68,0.85)' }} />
                </div>

                {/* Text */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                        Remover tarefa?
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                        <strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{name}</strong> será removida permanentemente.
                    </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1, padding: '9px 0', borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.11)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1, padding: '9px 0', borderRadius: 10,
                            border: '1px solid rgba(239,68,68,0.35)',
                            background: 'rgba(239,68,68,0.18)',
                            color: 'rgba(255,100,100,0.95)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.28)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
                    >
                        Remover
                    </button>
                </div>
            </ModalDialog>
        </Modal>
    )
}

// ─── Task card ────────────────────────────────────────────────────────────────

interface TaskCardProps {
    item: Item
    subs: Item[]
    selectedId: number | null
    groups: Group[]
    isOpen: boolean
    isDragOver: boolean
    dragHandleProps: React.HTMLAttributes<HTMLDivElement>
    onToggleExpand: (id: number) => void
    onSelect: (id: number) => void
    onEdit: (item: Item) => void
    onDelete: (item: Item) => void
}

function TaskCard({ item, subs, selectedId, groups, isOpen, isDragOver, dragHandleProps, onToggleExpand, onSelect, onEdit, onDelete }: TaskCardProps) {
    const { liveRemainingSec } = useTimerLive()
    const hasSubs    = subs.length > 0
    const isSelected = item.id === selectedId
    const group      = item.groupId ? groups.find(g => g.id === item.groupId) : null

    const derivedStatus: TaskStatus = hasSubs
        ? subs.some(s => s.status === 'running') ? 'running'
        : subs.some(s => s.status === 'paused')  ? 'paused'
        : subs.every(s => s.status === 'done')   ? 'done'
        : subs.some(s => s.status === 'done')    ? 'partial'
        : 'idle'
        : item.status

    const { label, className, dot } = STATUS_CONFIG[derivedStatus] ?? STATUS_CONFIG['idle']
    const doneSubs      = subs.filter(s => s.status === 'done').length
    const isLiveTarget  = !hasSubs && item.id === selectedId && item.status === 'running' && liveRemainingSec !== null
    const totalRemSec   = hasSubs
        ? subs.reduce((acc, s) => s.status === 'done' ? acc : acc + (s.savedRemainingSec ?? durationToSec(s.duration)), 0)
        : isLiveTarget ? liveRemainingSec : item.savedRemainingSec
    const showRemaining = hasSubs
        ? ['running', 'paused', 'partial'].includes(derivedStatus)
        : ['running', 'paused'].includes(item.status) && (item.savedRemainingSec !== undefined || isLiveTarget)
    const durationLabel = hasSubs
        ? formatSec(subs.reduce((acc, s) => acc + durationToSec(s.duration), 0))
        : formatDuration(item.duration)

    return (
        <div className="flex flex-col" style={{ opacity: isDragOver ? 0.45 : 1, transition: 'opacity 0.15s' }}>
            <div
                className={`relative flex flex-row items-center gap-0 p-0! overflow-hidden rounded-lg border transition-all duration-200 ${
                    isSelected
                        ? 'bg-white/22 border-white/50 shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_4px_20px_rgba(255,255,255,0.08)] scale-[1.01]'
                        : 'bg-white/8 border-white/12 hover:bg-white/12 hover:border-white/20'
                }`}
                style={group ? {
                    borderLeft: `3px solid ${group.color}`,
                    backgroundColor: isSelected ? `${group.color}2e` : `${group.color}0a`,
                    boxShadow: isSelected ? `0 0 0 1px ${group.color}40, 0 4px 20px ${group.color}18` : undefined,
                } : {}}
            >
                {/* Drag handle */}
                <div
                    {...dragHandleProps}
                    className="self-stretch px-1.5 text-white/15 hover:text-white/45 transition-colors shrink-0 flex items-center cursor-grab active:cursor-grabbing"
                >
                    <MdDragIndicator size={13} />
                </div>

                {hasSubs && (
                    <button
                        onClick={() => onToggleExpand(item.id)}
                        onMouseDown={e => e.stopPropagation()}
                        className="self-stretch px-2 text-white/25 hover:text-white/60 transition-colors shrink-0"
                    >
                        <span style={{
                            display: 'inline-block',
                            transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)',
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}>
                            <MdExpandMore size={15} />
                        </span>
                    </button>
                )}

                <button
                    className="flex-1 text-left flex flex-row items-center justify-between py-[0.6rem] px-3 min-w-0"
                    onClick={() => !hasSubs && onSelect(item.id)}
                    onMouseDown={e => e.stopPropagation()}
                >
                    <div className="flex flex-col gap-0.5 min-w-0 mr-2 w-full">
                        {group && (
                            <span
                                className="text-[9px] font-semibold tracking-[0.12em] uppercase mb-0.5"
                                style={{ color: group.color, opacity: 0.8 }}
                            >
                                {group.name}
                            </span>
                        )}
                        <p className="text-sm leading-tight text-white/90">{item.name}</p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                            <span className={`text-xs ${className}`}>{label}</span>
                            {showRemaining && totalRemSec !== undefined && (
                                <span className={`text-xs tabular-nums ${className} opacity-70`}>
                                    · {formatRemaining(totalRemSec)}
                                </span>
                            )}
                        </div>
                        {hasSubs && (
                            <SubtaskProgressBar done={doneSubs} total={subs.length} groupColor={group?.color} />
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className="text-white/55 text-xs tabular-nums">{durationLabel}</span>
                        {hasSubs && (
                            <span className="text-white/30 text-xs tabular-nums">{doneSubs}/{subs.length}</span>
                        )}
                    </div>
                </button>

                <div
                    className="flex flex-col gap-1 border-l border-white/10 px-1.5 py-1 self-stretch justify-center"
                    onMouseDown={e => e.stopPropagation()}
                >
                    <button
                        onClick={e => { e.stopPropagation(); onEdit(item) }}
                        className="text-white/35 hover:text-white/75 transition-colors"
                    >
                        <MdOutlineEdit size={13} />
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(item) }}
                        className="text-white/35 hover:text-red-400 transition-colors"
                    >
                        <MdDeleteOutline size={13} />
                    </button>
                </div>
            </div>

            <AnimatedSubtasks open={isOpen}>
                <SubtaskList subs={subs} selectedId={selectedId} group={group ?? null} onSelect={onSelect} />
            </AnimatedSubtasks>
        </div>
    )
}

// ─── Subtask list ─────────────────────────────────────────────────────────────

interface SubtaskListProps {
    subs: Item[]
    selectedId: number | null
    group: Group | null
    onSelect: (id: number) => void
}

function SubtaskList({ subs, selectedId, group, onSelect }: SubtaskListProps) {
    const { liveRemainingSec } = useTimerLive()
    return (
        <div className="flex flex-col gap-1 pt-1.5 pb-0.5">
            {subs.map(sub => {
                const subIsSelected = sub.id === selectedId
                const { label, className, dot } = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG['idle']
                const isLive = subIsSelected && sub.status === 'running' && liveRemainingSec !== null
                const subShowRem = ['running', 'paused'].includes(sub.status) && (sub.savedRemainingSec !== undefined || isLive)
                const remSec = isLive ? liveRemainingSec : sub.savedRemainingSec
                return (
                    <div key={sub.id} className="flex flex-row items-stretch pl-3">
                        <div className="flex flex-col items-center mr-1 shrink-0" style={{ width: 14 }}>
                            <div className="w-px flex-1 bg-white/10" />
                            <div className="w-1.5 h-px bg-white/10" />
                        </div>
                        <div
                            className={`flex-1 flex flex-row items-center overflow-hidden rounded-md border transition-all duration-150 ${
                                subIsSelected
                                    ? 'bg-white/12 border-white/30'
                                    : 'bg-white/5 border-white/10 hover:bg-white/9'
                            }`}
                            style={group ? { borderLeft: `2px solid ${group.color}80` } : {}}
                        >
                            <button
                                className="flex-1 text-left flex flex-row items-center justify-between py-1.5 px-2.5 min-w-0"
                                onClick={() => onSelect(sub.id)}
                            >
                                <div className="flex flex-col gap-0.5 min-w-0 mr-1">
                                    <p className="text-xs leading-tight text-white/80">{sub.name}</p>
                                    <div className="flex items-center gap-1 flex-wrap">
                                        <span className={`w-1 h-1 rounded-full shrink-0 ${dot}`} />
                                        <span className={`text-[10px] ${className}`}>{label}</span>
                                        {subShowRem && remSec !== undefined && remSec !== null && (
                                            <span className={`text-[10px] tabular-nums ${className} opacity-70`}>
                                                · {formatRemaining(remSec)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-white/40 text-[10px] tabular-nums shrink-0">
                                    {formatDuration(sub.duration)}
                                </span>
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ─── History panel ────────────────────────────────────────────────────────────

function HistoryPanel({ entries, onClear }: { entries: CompletedEntry[]; onClear: () => void }) {
    const grouped = entries.reduce<Record<string, CompletedEntry[]>>((acc, e) => {
        const date = new Date(e.completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        ;(acc[date] ??= []).push(e)
        return acc
    }, {})

    const dates = Object.keys(grouped).sort((a, b) => {
        const [da, ma, ya] = a.split('/').map(Number)
        const [db, mb, yb] = b.split('/').map(Number)
        return new Date(yb, mb - 1, db).getTime() - new Date(ya, ma - 1, da).getTime()
    })

    return (
        <div className="rounded-xl border border-white/12 overflow-hidden" style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px 8px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MdHistory size={13} style={{ color: 'rgba(99,102,241,0.7)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Concluídas
                    </span>
                    {entries.length > 0 && (
                        <span style={{
                            background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
                            borderRadius: 20, padding: '1px 6px',
                            color: 'rgba(99,102,241,0.9)', fontSize: 9, fontWeight: 700,
                        }}>
                            {entries.length}
                        </span>
                    )}
                </div>
                {entries.length > 0 && (
                    <button
                        onClick={onClear}
                        style={{
                            fontSize: 10, color: 'rgba(239,68,68,0.45)', background: 'none',
                            border: 'none', cursor: 'pointer', padding: '2px 4px',
                            transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.8)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.45)')}
                    >
                        Limpar
                    </button>
                )}
            </div>

            {/* Body */}
            <div style={{ maxHeight: 260, overflowY: 'auto', padding: entries.length === 0 ? '20px 12px' : '8px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {entries.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 12, textAlign: 'center' }}>
                        Nenhuma tarefa concluída ainda
                    </p>
                ) : dates.map(date => (
                    <div key={date}>
                        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, paddingLeft: 2 }}>
                            {date}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {grouped[date].map(e => (
                                <div
                                    key={e.id}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                        borderLeft: '2px solid rgba(99,102,241,0.35)',
                                        borderRadius: 8, padding: '6px 10px',
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                                        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {e.name}
                                        </span>
                                        <span style={{ color: 'rgba(99,102,241,0.55)', fontSize: 10 }}>
                                            {new Date(e.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0, marginLeft: 8 }}>
                                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'monospace' }}>
                                            {formatDuration(e.duration)}
                                        </span>
                                        {e.taskElapsed > 0 && (
                                            <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 9, fontFamily: 'monospace' }}>
                                                {formatTime(e.taskElapsed)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Drag-and-drop list ───────────────────────────────────────────────────────

interface DraggableListProps {
    roots: Item[]
    items: Item[]
    selectedId: number | null
    groups: Group[]
    expanded: Set<number>
    onToggleExpand: (id: number) => void
    onSelect: (id: number) => void
    onEdit: (item: Item) => void
    onDelete: (item: Item) => void
    onReorder: (from: number, to: number) => void
}

function DraggableTaskList({ roots, items, selectedId, groups, expanded, onToggleExpand, onSelect, onEdit, onDelete, onReorder }: DraggableListProps) {
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [overIndex, setOverIndex] = useState<number | null>(null)
    // ref so that toggling doesn't re-render and lose click events
    const allowDragRef = useRef<number | null>(null)

    function handleDragStart(e: React.DragEvent, index: number) {
        if (allowDragRef.current !== index) { e.preventDefault(); return }
        setDragIndex(index)
        e.dataTransfer.effectAllowed = 'move'
        const el = e.currentTarget as HTMLDivElement
        requestAnimationFrame(() => { el.style.opacity = '0.4' })
    }

    function handleDragEnd(e: React.DragEvent, index: number) {
        const el = e.currentTarget as HTMLDivElement
        el.style.opacity = '1'
        allowDragRef.current = null
        setDragIndex(prev => {
            setOverIndex(over => {
                if (prev !== null && over !== null && prev !== over) onReorder(prev, over)
                return null
            })
            return null
        })
    }

    return (
        <>
            {roots.map((item, index) => (
                <div
                    key={item.id}
                    draggable
                    onDragStart={e => handleDragStart(e, index)}
                    onDragEnd={e => handleDragEnd(e, index)}
                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOverIndex(index) }}
                    onDrop={e => e.preventDefault()}
                >
                    <TaskCard
                        item={item}
                        subs={items.filter(i => i.parentId === item.id)}
                        selectedId={selectedId}
                        groups={groups}
                        isOpen={expanded.has(item.id)}
                        isDragOver={overIndex === index && dragIndex !== null && dragIndex !== index}
                        dragHandleProps={{
                            style: { cursor: 'grab' },
                            onMouseDown: () => { allowDragRef.current = index },
                            onMouseUp:   () => { allowDragRef.current = null },
                        }}
                        onToggleExpand={onToggleExpand}
                        onSelect={onSelect}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </div>
            ))}
        </>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { openCreateModal: () => void }

export default function LatButton({ openCreateModal }: Props) {
    const { items, select, remove, selectedId, hydrated, groups, completedHistory, clearHistory, reorder } = useTasks()
    const [editItem, setEditItem]       = useState<Item | null>(null)
    const [deleteItem, setDeleteItem]   = useState<Item | null>(null)
    const [expanded, setExpanded]       = useState<Set<number>>(new Set())
    const [showHistory, setShowHistory] = useState(false)

    const roots = items.filter(i => !i.parentId)

    function toggleExpand(id: number) {
        setExpanded(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    function handleDeleteConfirm() {
        if (deleteItem) { remove(deleteItem.id); setDeleteItem(null) }
    }

    return (
        <div className="flex flex-col w-[26vw] m-4 ml-10" style={{ height: 'calc(100vh - 2rem)' }}>
            <div className="flex-1 overflow-y-auto task-scroll py-3 flex flex-col gap-3 pr-1">
                {!hydrated ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="btn-glass rounded-lg flex flex-col gap-2 animate-pulse">
                            <div className="h-3 w-3/4 rounded bg-white/10" />
                            <div className="h-2 w-1/3 rounded bg-white/10" />
                        </div>
                    ))
                ) : roots.length === 0 ? (
                    <span className="text-white/70 text-sm text-center cursor-default">Sem itens por aqui</span>
                ) : (
                    <DraggableTaskList
                        roots={roots}
                        items={items}
                        selectedId={selectedId}
                        groups={groups}
                        expanded={expanded}
                        onToggleExpand={toggleExpand}
                        onSelect={select}
                        onEdit={setEditItem}
                        onDelete={setDeleteItem}
                        onReorder={reorder}
                    />
                )}
            </div>

            {/* Add + History buttons */}
            <div className="flex gap-2">
                <button
                    onClick={openCreateModal}
                    className="p-0! btn-glass flex items-center justify-center h-9 rounded-lg flex-1 gap-1.5"
                    style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}
                >
                    <MdAdd size={16} />
                    <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.03em' }}>Nova tarefa</span>
                </button>
                <button
                    onClick={() => setShowHistory(v => !v)}
                    title={showHistory ? 'Fechar histórico' : 'Ver concluídas'}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        height: 36, padding: '0 12px', borderRadius: 10, cursor: 'pointer',
                        background: showHistory
                            ? 'rgba(99,102,241,0.2)'
                            : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${showHistory ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.12)'}`,
                        backdropFilter: 'blur(12px)',
                        color: showHistory ? 'rgba(99,102,241,0.95)' : 'rgba(255,255,255,0.35)',
                        transition: 'all 0.2s',
                        flexShrink: 0, position: 'relative',
                    } as React.CSSProperties}
                >
                    <MdHistory size={15} />
                    {!showHistory && completedHistory.length > 0 && (
                        <span style={{
                            position: 'absolute', top: 6, right: 6,
                            width: 5, height: 5, borderRadius: '50%',
                            background: 'rgba(99,102,241,0.9)',
                            boxShadow: '0 0 4px rgba(99,102,241,0.6)',
                        }} />
                    )}
                </button>
            </div>

            {/* History panel — inline, below the buttons */}
            {showHistory && (
                <div style={{ animation: 'fadeSlideDown 0.18s ease' }}>
                    <style>{`@keyframes fadeSlideDown { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }`}</style>
                    <HistoryPanel entries={completedHistory} onClear={clearHistory} />
                </div>
            )}

            {typeof window !== 'undefined' && editItem && createPortal(
                <CreateModal
                    openModal={true}
                    onClose={() => setEditItem(null)}
                    editItem={editItem}
                />,
                document.body
            )}

            {typeof window !== 'undefined' && deleteItem && createPortal(
                <DeleteModal
                    name={deleteItem.name}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteItem(null)}
                />,
                document.body
            )}
        </div>
    )
}
