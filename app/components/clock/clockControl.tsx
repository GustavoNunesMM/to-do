'use client'
import Clock from '@/app/components/clock/clock'
import ControllButtons from '@/app/components/controllButtons'
import { useTasks } from '@/app/store/tasks'
import { STATUS_CONFIG, durationToSec, formatTime } from '@/app/lib/task'
import { useTimer } from '@/app/hooks/useTimer'

const modeConfig = {
    task:     { dot: 'bg-emerald-400', label: 'Em andamento', timeColor: 'text-white/60',      arcClass: '' },
    pomodoro: { dot: 'bg-orange-400',  label: 'Pomodoro',     timeColor: 'text-orange-300/90', arcClass: 'text-orange-400' },
}

export default function ClockControl() {
    const { selected, pomodoroConfig } = useTasks()
    const { tarefa, mode, progress, remainingSec, pomodoroSec, nearPomodoro, start, pause, stop, skipPomodoro } = useTimer()

    function controllButtons(event: string) {
        switch (event) {
            case 'stop':               stop();  break
            case 'pause':              pause(); break
            case 'play': case 'start': start(); break
        }
    }

    const pomodoroMarkers = (() => {
        if (!selected?.pomodoroEnabled || !selected) return []
        const totalSec    = durationToSec(selected.duration)
        const intervalMin = selected.pomodoroIntervalMin ?? pomodoroConfig.intervalMin
        const intervalSec = intervalMin * 60
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
        : { ...STATUS_CONFIG[tarefa], timeColor: 'text-white/60', arcClass: '' }
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
                    {isRunning && (
                        <div className="flex items-center gap-2 mt-1">
                            {mode === 'pomodoro' && (
                                <button
                                    onClick={skipPomodoro}
                                    title="Pular pausa do pomodoro"
                                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-orange-400/60 hover:text-orange-300 border border-orange-400/20 hover:border-orange-400/50 bg-orange-400/5 hover:bg-orange-400/12 transition-all duration-150"
                                >
                                    <img src="/icons/skip.svg" width={11} height={11} alt="" style={{ opacity: 0.7 }} />
                                    Pular pausa
                                </button>
                            )}
                        </div>
                    )}
                    {nearPomodoro && (
                        <div className="mt-1 flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-400/10 border border-orange-400/30 animate-pulse">
                            <span className="text-xs">🍅</span>
                            <span className="text-orange-300 text-xs tracking-wide">Pausa chegando</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
