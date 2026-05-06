'use client'
import { useState, useRef, useEffect } from "react";
import Clock from './clock'
import ControllButtons from './controllButtons'
import { useTasks } from '../store/tasks'
import { GiTomato } from "react-icons/gi";

type Mode = 'task' | 'pomodoro'

const NEAR_POMODORO_SEC = 10

const modeConfig = {
    task:     { dot: 'bg-emerald-400', label: 'Em andamento', timeColor: 'text-white/60',      arcClass: '' },
    pomodoro: { dot: 'bg-orange-400',  label: 'Pomodoro',     timeColor: 'text-orange-300/90', arcClass: 'text-orange-400' },
}

const statusConfig: Record<TaskStatus, { label: string; dot: string }> = {
    idle:    { label: 'Aguardando',   dot: 'bg-white/30' },
    running: { label: 'Em andamento', dot: 'bg-emerald-400' },
    paused:  { label: 'Pausado',      dot: 'bg-amber-400' },
    done:    { label: 'Concluído',    dot: 'bg-violet-400' },
}

function durationToSec(d: Item['duration']): number {
    return (d.hours * 60 + d.minutes) * 60
}

function formatTime(seconds: number): string {
    const s = Math.max(0, seconds)
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
        .map(n => String(n).padStart(2, '0')).join(':')
}

function PomodoroPanel() {
    const { pomodoroConfig, setPomodoroConfig } = useTasks()
    const [intervalMin, setIntervalMin] = useState(pomodoroConfig.intervalMin)
    const [breakMin, setBreakMin]       = useState(pomodoroConfig.breakMin)

    function save() { setPomodoroConfig({ intervalMin, breakMin }) }

    return (
        <div className="glass p-4 w-52 flex flex-col gap-3 mb-2">
            <p className="text-white/70 text-xs tracking-widest uppercase">Pomodoro</p>
            <label className="flex flex-col gap-1">
                <span className="text-white/50 text-xs">Intervalo (min)</span>
                <input
                    type="number" min={1} max={120} value={intervalMin}
                    onChange={e => setIntervalMin(Number(e.target.value))}
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm w-full focus:outline-none focus:border-white/40"
                />
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-white/50 text-xs">Pausa (min)</span>
                <input
                    type="number" min={1} max={60} value={breakMin}
                    onChange={e => setBreakMin(Number(e.target.value))}
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm w-full focus:outline-none focus:border-white/40"
                />
            </label>
            <button onClick={save} className="btn-glass text-sm">Salvar</button>
        </div>
    )
}

function TomatoIcon() {
    const [open, setOpen] = useState(false)
    return (
        <div
            className="absolute bottom-4 right-4 z-40 flex flex-col items-end"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {open && <PomodoroPanel />}
            <button className="text-2xl select-none opacity-50 hover:opacity-100 transition-opacity duration-200">
                <GiTomato size={24}/>
            </button>
        </div>
    )
}

export default function ClockControl() {
    const { selected, updateStatus, updateProgress, pomodoroConfig } = useTasks()

    const [tarefa, setTarefa]               = useState<TaskStatus>('idle')
    const [mode, setMode]                   = useState<Mode>('task')
    const [progress, setProgress]           = useState(0)
    const [remainingSec, setRemainingSec]   = useState<number | null>(null)
    const [pomodoroSec, setPomodoroSec]     = useState<number | null>(null)
    const [nearPomodoro, setNearPomodoro]   = useState(false)

    const timerRef            = useRef<NodeJS.Timeout | null>(null)
    const modeRef             = useRef<Mode>('task')
    const taskElapsedRef      = useRef(0)
    const pomSecRef           = useRef(0)
    const progressRef         = useRef(0)
    const remainingSecRef     = useRef<number | null>(null)
    const selectedRef         = useRef(selected)
    selectedRef.current       = selected
    const updateStatusRef     = useRef(updateStatus)
    updateStatusRef.current   = updateStatus
    const updateProgressRef   = useRef(updateProgress)
    updateProgressRef.current = updateProgress
    const pomodoroConfigRef   = useRef(pomodoroConfig)
    pomodoroConfigRef.current = pomodoroConfig
    const startTimerRef       = useRef<(totalTaskSec: number) => void>(() => {})

    function clearTimer() {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }

    function saveProgress() {
        const sel = selectedRef.current
        if (sel) updateProgressRef.current(sel.id, progressRef.current, remainingSecRef.current ?? 0, taskElapsedRef.current)
    }

    function startTimer(totalTaskSec: number) {
        clearTimer()
        timerRef.current = setInterval(() => {
            if (modeRef.current !== 'task') return

            taskElapsedRef.current += 1
            const cfg = pomodoroConfigRef.current
            const intervalSec = cfg.intervalMin * 60
            const pomodoroEnabled = selectedRef.current?.pomodoroEnabled ?? true

            setRemainingSec(s => {
                const next = (s !== null && s > 1) ? s - 1 : 0
                remainingSecRef.current = next
                return next
            })

            setProgress(p => {
                const next = Math.min(p + (100 / totalTaskSec), 100)
                progressRef.current = next
                if (next >= 100) {
                    clearTimer()
                    setTimeout(() => {
                        setTarefa('done')
                        setNearPomodoro(false)
                        const sel = selectedRef.current
                        if (sel) {
                            updateStatusRef.current(sel.id, 'done')
                            updateProgressRef.current(sel.id, 100, 0, taskElapsedRef.current)
                        }
                    }, 0)
                }
                return next
            })

            if (pomodoroEnabled && intervalSec > 0) {
                const secsUntilPomodoro = intervalSec - (taskElapsedRef.current % intervalSec)
                setNearPomodoro(secsUntilPomodoro <= NEAR_POMODORO_SEC && secsUntilPomodoro > 0)

                if (taskElapsedRef.current % intervalSec === 0) {
                    clearTimer()
                    setNearPomodoro(false)
                    const breakSec = cfg.breakMin * 60
                    modeRef.current = 'pomodoro'
                    pomSecRef.current = breakSec
                    setMode('pomodoro')
                    setPomodoroSec(breakSec)
                    saveProgress()

                    timerRef.current = setInterval(() => {
                        pomSecRef.current -= 1
                        setPomodoroSec(pomSecRef.current)
                        if (pomSecRef.current <= 0) {
                            clearTimer()
                            modeRef.current = 'task'
                            taskElapsedRef.current = 0
                            setMode('task')
                            setPomodoroSec(null)
                            // usa ref para garantir versão atual da função
                            startTimerRef.current(totalTaskSec)
                        }
                    }, 1000)
                }
            }
        }, 1000)
    }
    startTimerRef.current = startTimer

    function startFunc() {
        if (timerRef.current || !selected) return
        const totalSec = durationToSec(selected.duration)
        modeRef.current = 'task'
        setMode('task')
        setTarefa('running')
        updateStatus(selected.id, 'running')
        startTimer(totalSec)
    }

    function pauseFunc() {
        clearTimer()
        saveProgress()
        modeRef.current = 'task'
        setMode('task')
        setPomodoroSec(null)
        setNearPomodoro(false)
        setTarefa('paused')
        if (selected) updateStatus(selected.id, 'paused')
    }

    function stopFunc() {
        clearTimer()
        modeRef.current = 'task'
        taskElapsedRef.current = 0
        progressRef.current = 0
        remainingSecRef.current = selected ? durationToSec(selected.duration) : null
        setMode('task')
        setProgress(0)
        setPomodoroSec(null)
        setNearPomodoro(false)
        setRemainingSec(selected ? durationToSec(selected.duration) : null)
        setTarefa('idle')
        if (selected) {
            updateStatus(selected.id, 'idle')
            updateProgress(selected.id, 0, durationToSec(selected.duration), 0)
        }
    }

    function controllButtons(event: string) {
        switch (event) {
            case 'stop':  stopFunc();  break
            case 'pause': pauseFunc(); break
            case 'play':
            case 'start': startFunc(); break
        }
    }

    useEffect(() => {
        clearTimer()
        modeRef.current = 'task'
        setMode('task')
        setPomodoroSec(null)
        setNearPomodoro(false)

        if (selected) {
            const p   = selected.savedProgress     ?? 0
            const rem = selected.savedRemainingSec ?? durationToSec(selected.duration)
            const el  = selected.taskElapsed       ?? 0
            progressRef.current     = p
            remainingSecRef.current = rem
            taskElapsedRef.current  = el
            setProgress(p)
            setRemainingSec(rem)
            setTarefa(selected.status === 'running' ? 'paused' : selected.status)
        } else {
            progressRef.current     = 0
            remainingSecRef.current = null
            taskElapsedRef.current  = 0
            setProgress(0)
            setRemainingSec(null)
            setTarefa('idle')
        }
    }, [selected?.id])

    useEffect(() => () => { clearTimer() }, [])

    const pomodoroMarkers = (() => {
        if (!selected?.pomodoroEnabled || !selected) return []
        const totalSec    = durationToSec(selected.duration)
        const intervalSec = pomodoroConfig.intervalMin * 60
        if (intervalSec <= 0 || intervalSec >= totalSec) return []
        const markers: number[] = []
        for (let t = intervalSec; t < totalSec; t += intervalSec) {
            markers.push(t / totalSec)
        }
        return markers
    })()

    const isRunning  = tarefa === 'running'
    const activeCfg  = isRunning
        ? modeConfig[mode]
        : { ...statusConfig[tarefa], timeColor: 'text-white/60', arcClass: '' }
    const totalSec   = selected ? durationToSec(selected.duration) : null
    const displaySec = mode === 'pomodoro' ? pomodoroSec : (remainingSec ?? totalSec)

    return (
        <div className="relative h-full w-full flex items-center justify-center">
            <div className="relative h-full max-h-full aspect-square flex items-end justify-center pb-8">
                <div className="absolute inset-0 flex items-center justify-center">
                    <Clock
                        progress={progress}
                        arcSize={270}
                        radius={150}
                        className="transition-colors duration-700"
                        isPomodoroMode={isRunning && mode === 'pomodoro'}
                        isNearPomodoro={nearPomodoro}
                        pomodoroMarkers={pomodoroMarkers}
                    />
                </div>

                <div className="flex flex-col items-center gap-3 my-auto">
                    <div className="flex flex-col items-center gap-1">
                        {displaySec !== null && (
                            <p className={`text-4xl font-light tabular-nums tracking-tight transition-colors duration-700 ${activeCfg.timeColor}`}>
                                {formatTime(displaySec)} Restantes
                            </p>
                        )}
                        {selected
                            ? <p className="text-white text-xl font-semibold tracking-wide">{selected.name}</p>
                            : <p className="text-white/30 text-xl font-semibold tracking-wide">Nenhuma tarefa</p>
                        }
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-700 ${activeCfg.dot}`} />
                            <span className="text-white/50 text-xs tracking-widest uppercase">
                                {activeCfg.label}
                            </span>
                        </div>
                    </div>
                    <ControllButtons
                        onClick={controllButtons}
                        tarefa={tarefa}
                        disabled={!selected}
                    />
                    {nearPomodoro && (
                        <div className="mt-1 flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-400/10 border border-orange-400/30 animate-pulse">
                            <span className="text-xs">🍅</span>
                            <span className="text-orange-300 text-xs tracking-wide">Pausa chegando</span>
                        </div>
                    )}
                </div>
            </div>
            <TomatoIcon />
        </div>
    )
}
