'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { MdAdd, MdDeleteOutline, MdOutlineEdit, MdCheck } from 'react-icons/md'
import { useTasks } from '@/app/store/tasks'
import { STATUS_CONFIG, formatDuration } from '@/app/lib/task'
import type { GroupDragState } from '@/app/types'

// ─── Task card ────────────────────────────────────────────────────────────────

function TaskCard({
    item, subtasks, group, onDragStart, onDragEnd, isDragging,
}: {
    item: Item
    subtasks: Item[]
    group: Group | null
    onDragStart: (e: React.DragEvent, itemId: number, groupId: number | null) => void
    onDragEnd: () => void
    isDragging: boolean
}) {
    const hasSubs = subtasks.length > 0

    function derivedStatus(): TaskStatus {
        if (!hasSubs) return item.status
        if (subtasks.some(s => s.status === 'running')) return 'running'
        if (subtasks.some(s => s.status === 'paused'))  return 'paused'
        if (subtasks.every(s => s.status === 'done'))   return 'done'
        if (subtasks.some(s => s.status === 'done'))    return 'partial'
        return 'idle'
    }

    const status = derivedStatus()
    const { dot, label, className } = STATUS_CONFIG[status] ?? STATUS_CONFIG['idle']
    const doneSubs = subtasks.filter(s => s.status === 'done').length
    const accent   = group?.color ?? 'rgba(255,255,255,0.2)'

    return (
        <div
            draggable
            onDragStart={e => onDragStart(e, item.id, item.groupId ?? null)}
            onDragEnd={onDragEnd}
            style={{
                opacity: isDragging ? 0.35 : 1,
                transform: isDragging ? 'scale(0.97)' : 'scale(1)',
                transition: 'opacity 0.15s, transform 0.15s',
                cursor: 'grab',
                display: 'flex', flexDirection: 'column',
            }}
        >
            {/* main card */}
            <div style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderLeft: `3px solid ${accent}`,
                borderRadius: hasSubs ? '10px 10px 0 0' : 10,
                borderBottom: hasSubs ? 'none' : undefined,
                padding: '10px 12px',
                display: 'flex', flexDirection: 'column', gap: 6,
                transition: 'background 0.15s',
            }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.11)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 500, lineHeight: 1.3, flex: 1 }}>{item.name}</p>
                    {hasSubs && (
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, flexShrink: 0, fontFamily: 'monospace' }}>
                            {doneSubs}/{subtasks.length}
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0 }} />
                        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }} className={className}>{label}</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'monospace' }}>{formatDuration(item.duration)}</span>
                </div>
                {item.description && !hasSubs && (
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, lineHeight: 1.4,
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                        {item.description}
                    </p>
                )}
            </div>

            {/* subtasks */}
            {hasSubs && (
                <div style={{
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderTop: 'none',
                    borderRadius: '0 0 10px 10px',
                    overflow: 'hidden',
                }}>
                    {subtasks.map((sub, idx) => {
                        const { dot: sDot } = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG['idle']
                        return (
                            <div
                                key={sub.id}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '6px 12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderBottom: idx < subtasks.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                }}
                            >
                                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10, flexShrink: 0 }}>└</span>
                                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, flex: 1, lineHeight: 1.3 }}>{sub.name}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                                    <span className={sDot} style={{ width: 5, height: 5, borderRadius: '50%' }} />
                                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'monospace' }}>{formatDuration(sub.duration)}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// ─── Column ───────────────────────────────────────────────────────────────────

function Column({
    group, items, allItems, dragState,
    onDragStart, onDragEnd, onDrop, onRenameGroup, onDeleteGroup,
}: {
    group: Group | null
    items: Item[]
    allItems: Item[]
    dragState: GroupDragState | null
    onDragStart: (e: React.DragEvent, itemId: number, groupId: number | null) => void
    onDragEnd: () => void
    onDrop: (targetGroupId: number | null) => void
    onRenameGroup: (group: Group, newName: string) => void
    onDeleteGroup: (groupId: number) => void
}) {
    const [isOver, setIsOver]     = useState(false)
    const [editing, setEditing]   = useState(false)
    const [editName, setEditName] = useState(group?.name ?? '')
    const inputRef = useRef<HTMLInputElement>(null)

    function startEdit() {
        setEditName(group?.name ?? '')
        setEditing(true)
        setTimeout(() => inputRef.current?.focus(), 0)
    }

    function commitEdit() {
        if (group && editName.trim().length >= 1) onRenameGroup(group, editName.trim())
        setEditing(false)
    }

    const accent  = group?.color ?? 'rgba(255,255,255,0.25)'
    const isUngrouped = !group

    return (
        <div
            onDragOver={e => { e.preventDefault(); setIsOver(true) }}
            onDragLeave={() => setIsOver(false)}
            onDrop={e => { e.preventDefault(); setIsOver(false); onDrop(group?.id ?? null) }}
            style={{
                display: 'flex', flexDirection: 'column',
                width: 232, flexShrink: 0,
                borderRadius: 14,
                border: isOver
                    ? `1px solid ${accent}60`
                    : '1px solid rgba(255,255,255,0.1)',
                background: isOver
                    ? 'rgba(255,255,255,0.09)'
                    : 'rgba(255,255,255,0.04)',
                transition: 'border-color 0.15s, background 0.15s',
                overflow: 'hidden',
            }}
        >
            {/* header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px',
                background: isUngrouped ? 'rgba(255,255,255,0.04)' : `${accent}18`,
                borderBottom: `1px solid ${isUngrouped ? 'rgba(255,255,255,0.07)' : `${accent}30`}`,
                flexShrink: 0,
            }}>
                {editing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                        <input
                            ref={inputRef}
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
                            style={{
                                flex: 1, background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.25)', borderRadius: 6,
                                color: '#fff', fontSize: 13, padding: '3px 8px', outline: 'none',
                            }}
                        />
                        <button
                            onClick={commitEdit}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(52,211,153,0.9)', display: 'flex', padding: 2 }}
                        >
                            <MdCheck size={15} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            {group && (
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: group.color, flexShrink: 0 }} />
                            )}
                            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                                {group?.name ?? 'Sem grupo'}
                            </span>
                            <span style={{
                                color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700,
                                background: 'rgba(255,255,255,0.07)', borderRadius: 20,
                                padding: '1px 7px',
                            }}>
                                {items.length}
                            </span>
                        </div>
                        {group && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <button
                                    onClick={startEdit}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', display: 'flex', padding: 2, transition: 'color 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
                                >
                                    <MdOutlineEdit size={13} />
                                </button>
                                <button
                                    onClick={() => onDeleteGroup(group.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', display: 'flex', padding: 2, transition: 'color 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.8)')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
                                >
                                    <MdDeleteOutline size={13} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* cards */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: 8, minHeight: 80 }}>
                {items.length === 0 && (
                    <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        minHeight: 60, borderRadius: 8,
                        border: `1px dashed ${isOver ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
                        transition: 'border-color 0.15s',
                    }}>
                        <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11 }}>Arraste aqui</span>
                    </div>
                )}
                {items.map(item => (
                    <TaskCard
                        key={item.id}
                        item={item}
                        subtasks={allItems.filter(i => i.parentId === item.id)}
                        group={group}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        isDragging={dragState?.itemId === item.id}
                    />
                ))}
            </div>
        </div>
    )
}

// ─── New group button ─────────────────────────────────────────────────────────

function NewGroupButton({ onAdd }: { onAdd: (name: string) => void }) {
    const [creating, setCreating] = useState(false)
    const [name, setName]         = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    function start() {
        setName('')
        setCreating(true)
        setTimeout(() => inputRef.current?.focus(), 0)
    }

    function commit() {
        if (name.trim().length >= 1) onAdd(name.trim())
        setCreating(false)
    }

    if (!creating) {
        return (
            <button
                onClick={start}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', flexShrink: 0,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.13)',
                    borderRadius: 10, cursor: 'pointer',
                    color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500,
                    transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
            >
                <MdAdd size={16} />
                Novo grupo
            </button>
        )
    }

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10, flexShrink: 0,
        }}>
            <input
                ref={inputRef}
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setCreating(false) }}
                placeholder="Nome do grupo..."
                style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#fff', fontSize: 13, width: 140,
                    borderBottom: '1px solid rgba(255,255,255,0.25)', paddingBottom: 2,
                }}
            />
            <button
                onClick={commit}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(52,211,153,0.9)', display: 'flex', padding: 2 }}
            >
                <MdCheck size={15} />
            </button>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GroupsPage({ open, onClose, onRequestClose }: { open: boolean; onClose: () => void; onRequestClose: () => void }) {
    const { items, groups, addGroup, removeGroup, updateGroup, setItemGroup } = useTasks()
    const [dragState, setGroupDragState] = useState<GroupDragState | null>(null)
    const [animClass, setAnimClass]      = useState('groups-enter')

    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onRequestClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onRequestClose])

    useEffect(() => {
        if (!open) {
            setAnimClass('groups-exit')
            const t = setTimeout(onClose, 240)
            return () => clearTimeout(t)
        } else {
            setAnimClass('groups-enter')
        }
    }, [open])

    const handleDragStart  = useCallback((_e: React.DragEvent, itemId: number, sourceGroupId: number | null) => {
        setGroupDragState({ itemId, sourceGroupId })
    }, [])
    const handleDragEnd    = useCallback(() => setGroupDragState(null), [])
    const handleDrop       = useCallback((targetGroupId: number | null) => {
        if (!dragState) return
        if (dragState.sourceGroupId !== targetGroupId) setItemGroup(dragState.itemId, targetGroupId)
        setGroupDragState(null)
    }, [dragState, setItemGroup])

    const roots     = items.filter(i => !i.parentId)
    const ungrouped = roots.filter(i => !i.groupId || !groups.find(g => g.id === i.groupId))

    return (
        <div
            className={animClass}
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

                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600 }}>Grupos</span>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
                    {groups.length} grupo{groups.length !== 1 ? 's' : ''}
                </span>

                <div style={{ flex: 1 }} />

                <NewGroupButton onAdd={addGroup} />
            </div>

            {/* colunas */}
            <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '16px 16px 12px' }} className="calendar-scroll">
                <div style={{ display: 'flex', gap: 10, height: '100%', alignItems: 'flex-start' }}>
                    <Column
                        group={null}
                        items={ungrouped}
                        allItems={items}
                        dragState={dragState}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDrop={handleDrop}
                        onRenameGroup={() => {}}
                        onDeleteGroup={() => {}}
                    />
                    {groups.map(group => (
                        <Column
                            key={group.id}
                            group={group}
                            items={roots.filter(i => i.groupId === group.id)}
                            allItems={items}
                            dragState={dragState}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDrop={handleDrop}
                            onRenameGroup={(g, newName) => updateGroup({ ...g, name: newName })}
                            onDeleteGroup={removeGroup}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
