'use client'
import { useState, useRef, useEffect } from 'react'
import { durationToSec } from '@/app/lib/task'
import { notifyPomodoroBreak, notifyTaskDone } from '@/app/lib/flutter_bridge'
import { useTasks } from '@/app/store/tasks'
import { useTimerLive } from '@/app/store/timerContext'

export type TimerMode = 'task' | 'pomodoro'

const NEAR_POMODORO_SEC = 10

export interface UseTimerReturn {
    tarefa: TaskStatus
    mode: TimerMode
    progress: number
    remainingSec: number | null
    pomodoroSec: number | null
    nearPomodoro: boolean
    start: () => void
    pause: () => void
    stop: () => void
    skipPomodoro: () => void
}

export function useTimer(): UseTimerReturn {
    const { selected, updateStatus, updateProgress, pomodoroConfig } = useTasks()
    const { setLiveRemainingSec } = useTimerLive()

    const [tarefa, setTarefa]             = useState<TaskStatus>('idle')
    const [mode, setMode]                 = useState<TimerMode>('task')
    const [progress, setProgress]         = useState(0)
    const [remainingSec, setRemainingSec] = useState<number | null>(null)
    const [pomodoroSec, setPomodoroSec]   = useState<number | null>(null)
    const [nearPomodoro, setNearPomodoro] = useState(false)

    const timerRef          = useRef<NodeJS.Timeout | null>(null)
    const timerGenRef       = useRef(0)
    const modeRef           = useRef<TimerMode>('task')
    const taskElapsedRef    = useRef(0)
    const pomSecRef         = useRef(0)
    const progressRef       = useRef(0)
    const remainingSecRef   = useRef<number | null>(null)
    const selectedRef       = useRef(selected)
    selectedRef.current     = selected
    const updateStatusRef   = useRef(updateStatus)
    updateStatusRef.current = updateStatus
    const updateProgressRef = useRef(updateProgress)
    updateProgressRef.current = updateProgress
    const pomConfigRef      = useRef(pomodoroConfig)
    pomConfigRef.current    = pomodoroConfig
    const startTimerRef         = useRef<(totalSec: number) => void>(() => {})
    const setLiveRemSecRef      = useRef(setLiveRemainingSec)
    setLiveRemSecRef.current    = setLiveRemainingSec

    function clearTimer() {
        timerGenRef.current += 1
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }

    function saveProgress() {
        const sel = selectedRef.current
        if (sel) updateProgressRef.current(sel.id, progressRef.current, remainingSecRef.current ?? 0, taskElapsedRef.current)
    }

    function startTimer(totalTaskSec: number) {
        clearTimer()
        const gen = timerGenRef.current
        timerRef.current = setInterval(() => {
            if (timerGenRef.current !== gen) return
            if (modeRef.current !== 'task') return

            taskElapsedRef.current += 1
            const cfg = pomConfigRef.current
            const sel = selectedRef.current

            const intervalMin     = sel?.pomodoroIntervalMin ?? cfg.intervalMin
            const intervalSec     = intervalMin * 60
            const pomodoroEnabled = sel?.pomodoroEnabled ?? true

            // Decrementa remaining usando ref para evitar stale closure
            const nextRemaining = remainingSecRef.current !== null && remainingSecRef.current > 1
                ? remainingSecRef.current - 1
                : 0
            remainingSecRef.current = nextRemaining
            setRemainingSec(nextRemaining)
            setLiveRemSecRef.current(nextRemaining)

            // Incrementa progresso usando ref
            const nextProgress = Math.min(progressRef.current + (100 / totalTaskSec), 100)
            progressRef.current = nextProgress
            setProgress(nextProgress)

            if (nextProgress >= 100) {
                clearTimer()
                setTarefa('done')
                setNearPomodoro(false)
                setLiveRemSecRef.current(null)
                if (sel) {
                    updateStatusRef.current(sel.id, 'done')
                    updateProgressRef.current(sel.id, 100, 0, taskElapsedRef.current)
                    notifyTaskDone(sel.name)
                }
                return
            }

            if (pomodoroEnabled && intervalSec > 0) {
                const secsUntil = intervalSec - (taskElapsedRef.current % intervalSec)
                setNearPomodoro(secsUntil <= NEAR_POMODORO_SEC && secsUntil > 0)

                if (taskElapsedRef.current % intervalSec === 0) {
                    clearTimer()
                    setNearPomodoro(false)
                    notifyPomodoroBreak()
                    const breakSec = cfg.breakMin * 60
                    modeRef.current = 'pomodoro'
                    pomSecRef.current = breakSec
                    setMode('pomodoro')
                    setPomodoroSec(breakSec)
                    saveProgress()

                    const pomGen = timerGenRef.current
                    timerRef.current = setInterval(() => {
                        if (timerGenRef.current !== pomGen) return
                        pomSecRef.current -= 1
                        setPomodoroSec(pomSecRef.current)
                        if (pomSecRef.current <= 0) {
                            clearTimer()
                            modeRef.current = 'task'
                            taskElapsedRef.current = 0
                            setMode('task')
                            setPomodoroSec(null)
                            startTimerRef.current(totalTaskSec)
                        }
                    }, 1000)
                }
            }
        }, 1000)
    }
    startTimerRef.current = startTimer

    function start() {
        if (timerRef.current || !selectedRef.current) return
        const totalSec = durationToSec(selectedRef.current.duration)
        modeRef.current = 'task'
        setMode('task')
        setTarefa('running')
        updateStatus(selectedRef.current.id, 'running')
        startTimer(totalSec)
    }

    function pause() {
        clearTimer()
        saveProgress()
        modeRef.current = 'task'
        setMode('task')
        setPomodoroSec(null)
        setNearPomodoro(false)
        setTarefa('paused')
        setLiveRemainingSec(null)
        if (selectedRef.current) updateStatus(selectedRef.current.id, 'paused')
    }

    function stop() {
        clearTimer()
        modeRef.current = 'task'
        taskElapsedRef.current = 0
        progressRef.current = 0
        const sel = selectedRef.current
        remainingSecRef.current = sel ? durationToSec(sel.duration) : null
        setMode('task')
        setProgress(0)
        setPomodoroSec(null)
        setNearPomodoro(false)
        setRemainingSec(sel ? durationToSec(sel.duration) : null)
        setTarefa('idle')
        setLiveRemainingSec(null)
        if (sel) {
            updateStatus(sel.id, 'idle')
            updateProgress(sel.id, 0, durationToSec(sel.duration), 0)
        }
    }

    function skipPomodoro() {
        if (modeRef.current !== 'pomodoro') return
        clearTimer()
        modeRef.current = 'task'
        setMode('task')
        setPomodoroSec(null)
        setNearPomodoro(false)
        const sel = selectedRef.current
        if (!sel) return
        const totalSec = durationToSec(sel.duration)
        taskElapsedRef.current = 0
        startTimerRef.current(totalSec)
    }

    // Sincroniza quando a tarefa selecionada muda (troca de id)
    useEffect(() => {
        clearTimer()
        modeRef.current = 'task'
        setMode('task')
        setPomodoroSec(null)
        setNearPomodoro(false)
        setLiveRemainingSec(null)

        if (selected) {
            const p   = selected.savedProgress ?? 0
            const rem = (selected.savedRemainingSec != null && selected.savedRemainingSec > 0)
                ? selected.savedRemainingSec
                : durationToSec(selected.duration)
            const el  = selected.taskElapsed ?? 0
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

    return { tarefa, mode, progress, remainingSec, pomodoroSec, nearPomodoro, start, pause, stop, skipPomodoro }
}
