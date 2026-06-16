'use client'
import { useState, useRef, useEffect } from 'react'
import { MdAdd, MdDeleteOutline, MdOutlineEdit, MdExpandMore } from "react-icons/md";
import { useTasks } from '../store/tasks'
import CreateModal from './modal/createModal'
import { STATUS_CONFIG, durationToSec, formatRemaining, formatDuration, formatSec } from '../lib/task'

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

interface TaskCardProps {
    item: Item
    subs: Item[]
    selectedId: number | null
    groups: Group[]
    isOpen: boolean
    onToggleExpand: (id: number) => void
    onSelect: (id: number) => void
    onEdit: (item: Item) => void
    onRemove: (id: number) => void
}

function TaskCard({ item, subs, selectedId, groups, isOpen, onToggleExpand, onSelect, onEdit, onRemove }: TaskCardProps) {
    const hasSubs       = subs.length > 0
    const isSelected    = item.id === selectedId
    const group         = item.groupId ? groups.find(g => g.id === item.groupId) : null

    const derivedStatus: TaskStatus = hasSubs
        ? subs.some(s => s.status === 'running') ? 'running'
        : subs.some(s => s.status === 'paused')  ? 'paused'
        : subs.every(s => s.status === 'done')   ? 'done'
        : subs.some(s => s.status === 'done')    ? 'partial'
        : 'idle'
        : item.status

    const { label, className, dot } = STATUS_CONFIG[derivedStatus] ?? STATUS_CONFIG['idle']
    const doneSubs      = subs.filter(s => s.status === 'done').length
    const totalRemSec   = hasSubs
        ? subs.reduce((acc, s) => s.status === 'done' ? acc : acc + (s.savedRemainingSec ?? durationToSec(s.duration)), 0)
        : item.savedRemainingSec
    const showRemaining = hasSubs
        ? ['running', 'paused', 'partial'].includes(derivedStatus)
        : ['running', 'paused'].includes(item.status) && item.savedRemainingSec !== undefined
    const durationLabel = hasSubs
        ? formatSec(subs.reduce((acc, s) => acc + durationToSec(s.duration), 0))
        : formatDuration(item.duration)

    return (
        <div className="flex flex-col">
            <div
                className={`flex flex-row items-center gap-0 p-0! overflow-hidden rounded-lg border transition-all duration-200 ${
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
                {hasSubs && (
                    <button
                        onClick={() => onToggleExpand(item.id)}
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
                >
                    <div className="flex flex-col gap-0.5 min-w-0 mr-2">
                        {group && (
                            <span
                                className="text-[9px] font-semibold tracking-[0.12em] uppercase mb-0.5"
                                style={{ color: group.color, opacity: 0.8 }}
                            >
                                {group.name}
                            </span>
                        )}
                        <p className="text-sm leading-tight">{item.name}</p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                            <span className={`text-xs ${className}`}>{label}</span>
                            {showRemaining && totalRemSec !== undefined && (
                                <span className={`text-xs tabular-nums ${className} opacity-70`}>
                                    · {formatRemaining(totalRemSec)}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className="text-white/55 text-xs tabular-nums">{durationLabel}</span>
                        {hasSubs && (
                            <span className="text-white/30 text-xs tabular-nums">{doneSubs}/{subs.length}</span>
                        )}
                    </div>
                </button>

                <div className="flex flex-col gap-1 border-l border-white/10 px-1.5 py-1 self-stretch justify-center">
                    <button onClick={() => onEdit(item)} className="text-white/35 hover:text-white/75 transition-colors">
                        <MdOutlineEdit size={13} />
                    </button>
                    <button onClick={() => onRemove(item.id)} className="text-white/35 hover:text-red-400 transition-colors">
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

interface SubtaskListProps {
    subs: Item[]
    selectedId: number | null
    group: Group | null
    onSelect: (id: number) => void
}

function SubtaskList({ subs, selectedId, group, onSelect }: SubtaskListProps) {
    return (
        <div className="flex flex-col gap-1 pt-1.5 pb-0.5">
            {subs.map(sub => {
                const subIsSelected = sub.id === selectedId
                const { label, className, dot } = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG['idle']
                const subShowRem = ['running', 'paused'].includes(sub.status) && sub.savedRemainingSec !== undefined
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
                                        {subShowRem && (
                                            <span className={`text-[10px] tabular-nums ${className} opacity-70`}>
                                                · {formatRemaining(sub.savedRemainingSec!)}
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

interface Props { openCreateModal: () => void }

export default function LatButton({ openCreateModal }: Props) {
    const { items, select, remove, selectedId, hydrated, groups } = useTasks()
    const [editItem, setEditItem] = useState<Item | null>(null)
    const [expanded, setExpanded] = useState<Set<number>>(new Set())

    const roots = items.filter(i => !i.parentId)

    function toggleExpand(id: number) {
        setExpanded(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    return (
        <div className="flex flex-col gap-1 w-[20vw] m-4 ml-10">
            <div className="py-3 flex flex-col gap-3">
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
                    roots.map((item: Item) => (
                        <TaskCard
                            key={item.id}
                            item={item}
                            subs={items.filter(i => i.parentId === item.id)}
                            selectedId={selectedId}
                            groups={groups}
                            isOpen={expanded.has(item.id)}
                            onToggleExpand={toggleExpand}
                            onSelect={select}
                            onEdit={setEditItem}
                            onRemove={remove}
                        />
                    ))
                )}
            </div>

            <button
                onClick={openCreateModal}
                className="p-0! btn-glass flex place-self-center w-full items-center justify-center h-10 rounded-lg"
            >
                <MdAdd size={20} />
            </button>

            {editItem && (
                <CreateModal
                    openModal={true}
                    onClose={() => setEditItem(null)}
                    editItem={editItem}
                />
            )}
        </div>
    )
}
