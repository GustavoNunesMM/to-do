'use client'
import { useState, useRef } from "react";
import Clock from './clock'
import ControllButtons from './controllButtons'

type TarefaStatus = 'idle' | 'running' | 'paused' | 'done';

export default function ClockControl() {
    const [progress, setProgress] = useState(0)
    const [tarefa, setTarefa] = useState<TarefaStatus>('idle')
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    function startFunc() {
        if (intervalRef.current) return
        intervalRef.current = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    stopFunc()
                    setTarefa('done')
                    return 100
                }
                return p + 1
            })
        }, 100)
        setTarefa('running')
    }

    function pauseFunc() {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        setTarefa('paused')
    }

    function stopFunc() {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        setProgress(0)
        setTarefa('idle')
    }

    function controllButtons(event: string) {
        switch (event) {
            case 'stop':  stopFunc();  break
            case 'pause': pauseFunc(); break
            case 'play':
            case 'start': startFunc(); break
        }
    }

    return (
        <div className="h-full w-full flex items-center justify-center">
            <div className="relative h-full max-h-full aspect-square flex items-end justify-center pb-8">
                <div className="absolute inset-0 flex items-center justify-center">
                    <Clock progress={progress} arcSize={270} radius={150} />
                </div>

                <ControllButtons
                    onClick={controllButtons}
                    tarefa={tarefa}
                />
            </div>

        </div>
    )
}