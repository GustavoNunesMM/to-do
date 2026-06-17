'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { MdAdd, MdDeleteOutline, MdOutlineEdit, MdCheck, MdClose } from 'react-icons/md'
import { useTasks } from '@/app/store/tasks'
import { STATUS_CONFIG, formatDuration } from '@/app/lib/task'
import type { GroupDragState } from '@/app/types'

function TaskCard({
    item,
    subtasks,
    onDragStart,
    onDragEnd,
    isDragging,
}: {
    item: Item
    subtasks: Item[]
    onDragStart: (e: React.DragEvent, itemId: number, groupId: number | null) => void
    onDragEnd: () => void
    isDragging: boolean
}) {
    const hasSubs = subtasks.length > 0

    // status derivado para pai com subtarefas
    function derivedStatus(): TaskStatus {
        if (!hasSubs) return item.status
        if (subtasks.some(s => s.status === 'running')) return 'running'
        if (subtasks.some(s => s.status === 'paused'))  return 'paused'
        if (subtasks.every(s => s.status === 'done'))   return 'done'
        if (subtasks.some(s => s.status === 'done'))    return 'partial'
        return 'idle'
    }

    const status = derivedStatus()
    const { dot, label } = STATUS_CONFIG[status] ?? STATUS_CONFIG['idle']
    const doneSubs = subtasks.filter(s => s.status === 'done').length

    return (
        <div
            draggable
            onDragStart={e => onDragStart(e, item.id, item.groupId ?? null)}
            onDragEnd={onDragEnd}
            className={`flex flex-col select-none transition-all duration-150 ${isDragging ? 'opacity-40 scale-95' : ''}`}
        >
            {/* card pai */}
            <div className={`glass p-3 flex flex-col gap-1.5 cursor-grab active:cursor-grabbing ${hasSubs ? 'rounded-t-lg rounded-b-none border-b-0' : ''} hover:bg-white/15`}>
                <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-sm font-medium leading-tight">{item.name}</p>
                    {hasSubs && (
                        <span className="text-white/35 text-xs tabular-nums shrink-0">{doneSubs}/{subtasks.length}</span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        <span className="text-white/50 text-xs">{label}</span>
                    </div>
                    <span className="text-white/40 text-xs tabular-nums">{formatDuration(item.duration)}</span>
                </div>
                {item.description && !hasSubs && (
                    <p className="text-white/40 text-xs line-clamp-2">{item.description}</p>
                )}
            </div>

            {/* subtarefas encaixadas */}
            {hasSubs && (
                <div className="flex flex-col border border-white/20 border-t-0 rounded-b-lg overflow-hidden">
                    {subtasks.map((sub, idx) => {
                        const { dot: sDot, label: sLabel } = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG['idle']
                        return (
                            <div
                                key={sub.id}
                                className={`flex items-center gap-2 px-3 py-1.5 bg-white/3 ${idx < subtasks.length - 1 ? 'border-b border-white/10' : ''}`}
                            >
                                <span className="text-white/15 text-[10px] shrink-0">└</span>
                                <span className="text-white/70 text-xs flex-1 leading-tight">{sub.name}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`w-1 h-1 rounded-full ${sDot}`} />
                                    <span className="text-white/40 text-[10px] tabular-nums">{formatDuration(sub.duration)}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

function Column({
    group,
    items,
    allItems,
    dragState,
    onDragStart,
    onDragEnd,
    onDrop,
    onRenameGroup,
    onDeleteGroup,
}: {
    group: Group | null
    items: Item[]           // apenas itens raiz desta coluna
    allItems: Item[]        // todos os itens (para buscar subtarefas)
    dragState: GroupDragState | null
    onDragStart: (e: React.DragEvent, itemId: number, groupId: number | null) => void
    onDragEnd: () => void
    onDrop: (targetGroupId: number | null) => void
    onRenameGroup: (group: Group, newName: string) => void
    onDeleteGroup: (groupId: number) => void
}) {
    const [isOver, setIsOver]       = useState(false)
    const [editing, setEditing]     = useState(false)
    const [editName, setEditName]   = useState(group?.name ?? '')
    const inputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsOver(true)
    }

    const handleDragLeave = () => setIsOver(false)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsOver(false)
        onDrop(group?.id ?? null)
    }

    function startEdit() {
        setEditName(group?.name ?? '')
        setEditing(true)
        setTimeout(() => inputRef.current?.focus(), 0)
    }

    function commitEdit() {
        if (group && editName.trim().length >= 1) {
            onRenameGroup(group, editName.trim())
        }
        setEditing(false)
    }

    const colColor = group?.color ?? 'rgba(255,255,255,0.1)'
    const headerBg = group ? `${group.color}30` : 'rgba(255,255,255,0.05)'

    return (
        <div
            className={`flex flex-col rounded-xl border transition-all duration-150 min-w-60 w-60 shrink-0 ${
                isOver ? 'border-white/50 bg-white/10' : 'border-white/15 bg-white/5'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* header da coluna */}
            <div
                className="flex items-center justify-between px-3 py-2.5 rounded-t-xl"
                style={{ background: headerBg, borderBottom: `1px solid ${colColor}40` }}
            >
                {editing ? (
                    <div className="flex items-center gap-1 flex-1">
                        <input
                            ref={inputRef}
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
                            className="flex-1 bg-white/10 border border-white/30 rounded px-2 py-0.5 text-white text-sm outline-none"
                        />
                        <button onClick={commitEdit} className="text-emerald-400 hover:text-emerald-300">
                            <MdCheck size={16} />
                        </button>
                        <button onClick={() => setEditing(false)} className="text-white/40 hover:text-white/70">
                            <MdClose size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            {group && (
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: group.color }} />
                            )}
                            <span className="text-white font-semibold text-sm tracking-wide">
                                {group?.name ?? 'Sem grupo'}
                            </span>
                            <span className="text-white/40 text-xs">({items.length})</span>
                        </div>
                        {group && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={startEdit}
                                    className="text-white/30 hover:text-white/70 transition-colors"
                                >
                                    <MdOutlineEdit size={14} />
                                </button>
                                <button
                                    onClick={() => onDeleteGroup(group.id)}
                                    className="text-white/30 hover:text-red-400 transition-colors"
                                >
                                    <MdDeleteOutline size={14} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* cards */}
            <div className="flex flex-col gap-2 p-2 flex-1 min-h-20">
                {items.length === 0 && (
                    <div className={`flex-1 flex items-center justify-center rounded-lg border border-dashed border-white/10 min-h-15 transition-colors ${
                        isOver ? 'border-white/30 bg-white/5' : ''
                    }`}>
                        <span className="text-white/20 text-xs">Arraste aqui</span>
                    </div>
                )}
                {items.map(item => (
                    <TaskCard
                        key={item.id}
                        item={item}
                        subtasks={allItems.filter(i => i.parentId === item.id)}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        isDragging={dragState?.itemId === item.id}
                    />
                ))}
            </div>
        </div>
    )
}

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
                className="btn-glass flex items-center gap-2 shrink-0 self-start px-4 py-2"
            >
                <MdAdd size={18} />
                <span className="text-sm">Novo grupo</span>
            </button>
        )
    }

    return (
        <div className="glass flex items-center gap-2 px-3 py-2 shrink-0 self-start">
            <input
                ref={inputRef}
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setCreating(false) }}
                placeholder="Nome do grupo..."
                className="bg-transparent border-b border-white/30 text-white text-sm outline-none w-36 pb-0.5"
            />
            <button onClick={commit} className="text-emerald-400 hover:text-emerald-300">
                <MdCheck size={16} />
            </button>
            <button onClick={() => setCreating(false)} className="text-white/40 hover:text-white/70">
                <MdClose size={16} />
            </button>
        </div>
    )
}

export default function GroupsPage({ open, onClose, onRequestClose }: { open: boolean; onClose: () => void; onRequestClose: () => void }) {
    const { items, groups, addGroup, removeGroup, updateGroup, setItemGroup } = useTasks()
    const [dragState, setGroupDragState] = useState<GroupDragState | null>(null)
    const [animClass, setAnimClass] = useState('groups-enter')

    useEffect(() => {
        if (!open) {
            setAnimClass('groups-exit')
            const t = setTimeout(onClose, 240)
            return () => clearTimeout(t)
        } else {
            setAnimClass('groups-enter')
        }
    }, [open])

    const handleDragStart = useCallback((_e: React.DragEvent, itemId: number, sourceGroupId: number | null) => {
        setGroupDragState({ itemId, sourceGroupId })
    }, [])

    const handleDragEnd = useCallback(() => setGroupDragState(null), [])

    const handleDrop = useCallback((targetGroupId: number | null) => {
        if (!dragState) return
        if (dragState.sourceGroupId !== targetGroupId) {
            setItemGroup(dragState.itemId, targetGroupId)
        }
        setGroupDragState(null)
    }, [dragState, setItemGroup])

    // somente raiz (sem parentId)
    const roots = items.filter(i => !i.parentId)
    const ungrouped = roots.filter(i => !i.groupId || !groups.find(g => g.id === i.groupId))

    return (
        <div className={`fixed inset-0 z-50 flex flex-col ${animClass}`} style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            {/* barra superior */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <span className="text-white text-xl font-semibold tracking-wide">Grupos</span>
                    <span className="text-white/30 text-sm">{groups.length} grupo{groups.length !== 1 ? 's' : ''}</span>
                </div>
                <button
                    onClick={onRequestClose}
                    className="btn-glass flex items-center gap-2 px-4 py-2 text-sm"
                >
                    <MdClose size={16} />
                    Fechar
                </button>
            </div>

            {/* colunas */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                <div className="flex gap-4 h-full items-start">
                    {/* coluna sem grupo */}
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

                    {/* colunas dos grupos */}
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

                    {/* botão novo grupo */}
                    <NewGroupButton onAdd={addGroup} />
                </div>
            </div>
        </div>
    )
}
