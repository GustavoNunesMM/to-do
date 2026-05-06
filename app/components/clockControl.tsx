'use client'
import { useState, useRef } from "react";
import Clock from './clock'
import ControllButtons from './controllButtons'

interface Props {
    selectedItem?: Item
    onStatusChange?: (id: number, status: TaskStatus) => void
}

const statusConfig: Record<TaskStatus, { label: string; dot: string }> = {
    idle:    { label: 'Aguardando',    dot: 'bg-white/30' },
    running: { label: 'Em andamento',  dot: 'bg-emerald-400' },
    paused:  { label: 'Pausado',       dot: 'bg-amber-400' },
    done:    { label: 'Concluído',     dot: 'bg-violet-400' },
}

function durationToMs(duration: Item['duration']): number {
    return (duration.hours * 60 + duration.minutes) * 60 * 1000
}

function durationToSec(duration: Item['duration']): number {
    return (duration.hours * 60 + duration.minutes) * 60
}

function formatTime(seconds: number): string {
    const s = Math.max(0, seconds)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function ClockControl({ selectedItem, onStatusChange }: Props) {
    const [progress, setProgress] = useState(0)
    const [remainingSec, setRemainingSec] = useState<number | null>(null)
    const [tarefa, setTarefa] = useState<TaskStatus>('idle')
    const progressRef = useRef<NodeJS.Timeout | null>(null)
    const secondRef = useRef<NodeJS.Timeout | null>(null)

    function notify(status: TaskStatus) {
        setTarefa(status)
        if (selectedItem) onStatusChange?.(selectedItem.id, status)
    }

    function clearAll() {
        if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null }
        if (secondRef.current)   { clearInterval(secondRef.current);   secondRef.current = null }
    }

    function startFunc() {
        if (progressRef.current || !selectedItem) return
        const totalMs = durationToMs(selectedItem.duration)
        const totalSec = durationToSec(selectedItem.duration)

        setRemainingSec(prev => prev ?? totalSec)

        progressRef.current = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearAll()
                    notify('done')
                    return 100
                }
                return p + 1
            })
        }, totalMs / 100)

        secondRef.current = setInterval(() => {
            setRemainingSec(s => (s !== null && s > 0) ? s - 1 : 0)
        }, 1000)

        notify('running')
    }

    function pauseFunc() {
        clearAll()
        notify('paused')
    }

    function stopFunc() {
        clearAll()
        setProgress(0)
        setRemainingSec(selectedItem ? durationToSec(selectedItem.duration) : null)
        notify('idle')
    }

    function controllButtons(event: string) {
        switch (event) {
            case 'stop':  stopFunc();  break
            case 'pause': pauseFunc(); break
            case 'play':
            case 'start': startFunc(); break
        }
    }

    const { label, dot } = statusConfig[tarefa]
    const totalSec = selectedItem ? durationToSec(selectedItem.duration) : null
    const displaySec = remainingSec ?? totalSec

    return (
        <div className="h-full w-full flex items-center justify-center">
            <div className="relative h-full max-h-full aspect-square flex items-end justify-center pb-8">
                <div className="absolute inset-0 flex items-center justify-center">
                    <Clock progress={progress} arcSize={270} radius={150} />
                </div>

                <div className="flex flex-col items-center gap-3 my-auto">
                    <div className="flex flex-col items-center gap-1">
                        {displaySec !== null && (
                            <p className="text-white/60 text-4xl font-light tabular-nums tracking-tight">
                                {formatTime(displaySec)} Restantes
                            </p>
                        )}
                        {selectedItem
                            ? <p className="text-white text-xl font-semibold tracking-wide">{selectedItem.name}</p>
                            : <p className="text-white/30 text-xl font-semibold tracking-wide">Nenhuma tarefa</p>
                        }
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                            <span className="text-white/50 text-xs tracking-widest uppercase">{label}</span>
                        </div>
                    </div>
                    <ControllButtons
                        onClick={controllButtons}
                        tarefa={tarefa}
                        disabled={!selectedItem}
                    />
                </div>
            </div>
        </div>
    )
}
