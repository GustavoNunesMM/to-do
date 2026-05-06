'use client'
import { useState, useRef, useEffect } from 'react'
import { MdAdd, MdDeleteOutline, MdOutlineEdit, MdExpandMore } from "react-icons/md";
import { useTasks } from '../store/tasks'
import CreateModal from './createModal'

const statusConfig: Record<TaskStatus, { label: string; className: string; dot: string }> = {
    idle:    { label: 'Aguardando',      className: 'text-white/40',    dot: 'bg-white/30' },
    running: { label: 'Em andamento',    className: 'text-emerald-400', dot: 'bg-emerald-400' },
    paused:  { label: 'Pausado',         className: 'text-amber-400',   dot: 'bg-amber-400' },
    partial: { label: 'Parc. concluído', className: 'text-sky-400',     dot: 'bg-sky-400' },
    done:    { label: 'Concluído',       className: 'text-violet-400',  dot: 'bg-violet-400' },
};

function formatRemaining(sec: number): string {
    const s = Math.max(0, sec)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const ss = s % 60
    if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
    return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
}

function durationToSec(d: durationType) { return (d.hours * 60 + d.minutes) * 60 }

function formatDuration(d: durationType): string {
    return `${String(d.hours).padStart(2,'0')}:${String(d.minutes).padStart(2,'0')}`
}

function formatSec(sec: number): string {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
    return `00:${String(m).padStart(2,'0')}`
}

// Wrapper que anima height de 0 → auto ao montar e auto → 0 ao desmontar
function AnimatedSubtasks({ open, children }: { open: boolean; children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState(0)
    const [visible, setVisible] = useState(open)

    useEffect(() => {
        if (open) {
            setVisible(true)
            // mede na próxima frame depois de visible=true renderizar
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (ref.current) setHeight(ref.current.scrollHeight)
                })
            })
        } else {
            // colapsa primeiro, depois desmonta
            setHeight(0)
            const t = setTimeout(() => setVisible(false), 220)
            return () => clearTimeout(t)
        }
    }, [open])

    if (!visible) return null

    return (
        <div
            style={{
                height: open ? height : 0,
                overflow: 'hidden',
                transition: 'height 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            <div ref={ref}>
                {children}
            </div>
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

    function getSubtasks(parentId: number) {
        return items.filter(i => i.parentId === parentId)
    }

    function parentStatus(subs: Item[]): TaskStatus {
        if (subs.length === 0) return 'idle'
        if (subs.some(s => s.status === 'running')) return 'running'
        if (subs.some(s => s.status === 'paused'))  return 'paused'
        if (subs.every(s => s.status === 'done'))   return 'done'
        if (subs.some(s => s.status === 'done'))    return 'partial'
        return 'idle'
    }

    function subsTotalRemaining(subs: Item[]): number {
        return subs.reduce((acc, s) => s.status === 'done' ? acc : acc + (s.savedRemainingSec ?? durationToSec(s.duration)), 0)
    }

    function subsTotalDuration(subs: Item[]): number {
        return subs.reduce((acc, s) => acc + durationToSec(s.duration), 0)
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
                    <span className="text-white/70 text-sm text-center cursor-default">
                        Sem itens por aqui
                    </span>
                ) : (
                    roots.map((item: Item) => {
                        const subs           = getSubtasks(item.id)
                        const hasSubs        = subs.length > 0
                        const isOpen         = expanded.has(item.id)
                        const isSelected     = item.id === selectedId
                        const group          = item.groupId ? groups.find(g => g.id === item.groupId) : null
                        const derivedStatus  = hasSubs ? parentStatus(subs) : item.status
                        const { label, className, dot } = statusConfig[derivedStatus] ?? statusConfig['idle']
                        const doneSubs       = subs.filter(s => s.status === 'done').length
                        const remainingSec   = hasSubs ? subsTotalRemaining(subs) : item.savedRemainingSec
                        const showRemaining  = hasSubs
                            ? ['running','paused','partial'].includes(derivedStatus)
                            : ['running','paused'].includes(item.status) && item.savedRemainingSec !== undefined
                        const durationLabel  = hasSubs ? formatSec(subsTotalDuration(subs)) : formatDuration(item.duration)

                        return (
                            <div key={item.id} className="flex flex-col">
                                {/* card principal */}
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
                                    {/* botão expandir */}
                                    {hasSubs && (
                                        <button
                                            onClick={() => toggleExpand(item.id)}
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

                                    {/* conteúdo */}
                                    <button
                                        className="flex-1 text-left flex flex-row items-center justify-between py-[0.6rem] px-3 min-w-0"
                                        onClick={() => !hasSubs && select(item.id)}
                                    >
                                        <div className="flex flex-col gap-0.5 min-w-0 mr-2">
                                            {/* nome do grupo como label acima do nome */}
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
                                                {showRemaining && remainingSec !== undefined && (
                                                    <span className={`text-xs tabular-nums ${className} opacity-70`}>
                                                        · {formatRemaining(remainingSec)}
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

                                    {/* editar / excluir */}
                                    <div className="flex flex-col gap-1 border-l border-white/10 px-1.5 py-1 self-stretch justify-center">
                                        <button onClick={() => setEditItem(item)} className="text-white/35 hover:text-white/75 transition-colors">
                                            <MdOutlineEdit size={13} />
                                        </button>
                                        <button onClick={() => remove(item.id)} className="text-white/35 hover:text-red-400 transition-colors">
                                            <MdDeleteOutline size={13} />
                                        </button>
                                    </div>
                                </div>

                                {/* subtarefas animadas */}
                                <AnimatedSubtasks open={isOpen}>
                                    <div className="flex flex-col gap-1 pt-1.5 pb-0.5">
                                        {subs.map(sub => {
                                            const subIsSelected = sub.id === selectedId
                                            const { label: sLabel, className: sCls, dot: sDot } = statusConfig[sub.status] ?? statusConfig['idle']
                                            const subShowRem = ['running','paused'].includes(sub.status) && sub.savedRemainingSec !== undefined
                                            return (
                                                <div key={sub.id} className="flex flex-row items-stretch pl-3">
                                                    {/* conector visual */}
                                                    <div className="flex flex-col items-center mr-1 shrink-0" style={{ width: 14 }}>
                                                        <div className="w-px flex-1 bg-white/10" />
                                                        <div className="w-1.5 h-px bg-white/10" />
                                                    </div>
                                                    {/* card subtarefa */}
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
                                                            onClick={() => select(sub.id)}
                                                        >
                                                            <div className="flex flex-col gap-0.5 min-w-0 mr-1">
                                                                <p className="text-xs leading-tight text-white/80">{sub.name}</p>
                                                                <div className="flex items-center gap-1 flex-wrap">
                                                                    <span className={`w-1 h-1 rounded-full shrink-0 ${sDot}`} />
                                                                    <span className={`text-[10px] ${sCls}`}>{sLabel}</span>
                                                                    {subShowRem && (
                                                                        <span className={`text-[10px] tabular-nums ${sCls} opacity-70`}>
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
                                </AnimatedSubtasks>
                            </div>
                        )
                    })
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
    );
}
