'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface TimerLiveValue {
    liveRemainingSec: number | null
    setLiveRemainingSec: (sec: number | null) => void
}

const TimerLiveContext = createContext<TimerLiveValue>({
    liveRemainingSec: null,
    setLiveRemainingSec: () => {},
})

export function TimerLiveProvider({ children }: { children: ReactNode }) {
    const [liveRemainingSec, setLiveRemainingSec] = useState<number | null>(null)
    return (
        <TimerLiveContext.Provider value={{ liveRemainingSec, setLiveRemainingSec }}>
            {children}
        </TimerLiveContext.Provider>
    )
}

export function useTimerLive() {
    return useContext(TimerLiveContext)
}
