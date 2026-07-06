'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
    setFlutterSoundEnabled,
    setFlutterVolume,
    setFlutterSoundFile,
    setFlutterMinimizeOnClose,
    setFlutterStartOnBoot,
    setFlutterAmbientEnabled,
    setFlutterAmbientFile,
    setFlutterAmbientVolume,
} from '@/app/lib/flutter_bridge'

const STORAGE_KEY = 'app-settings'

export interface AppSettings {
    pomodoroInterval: number   
    pomodoroBreak: number     
    wallpaper: string         
    soundEnabled: boolean
    soundVolume: number        
    soundFile: string          
    ambientEnabled: boolean
    ambientFile: string       
    ambientVolume: number      
    minimizeOnClose: boolean
    startOnBoot: boolean
    showNotifications: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
    pomodoroInterval: 25,
    pomodoroBreak: 5,
    wallpaper: "url('/assets/bg.jpg')",
    soundEnabled: true,
    soundVolume: 80,
    soundFile: 'notify.wav',
    ambientEnabled: false,
    ambientFile: 'rain.mp3',
    ambientVolume: 40,
    minimizeOnClose: true,
    startOnBoot: false,
    showNotifications: true,
}

const SettingsContext = createContext<{ settings: AppSettings; updateSettings: (patch: Partial<AppSettings>) => void } | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored) as Partial<AppSettings>
                setSettings(prev => ({ ...prev, ...parsed }))
            }
        } catch {}
    }, [])

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
        } catch {}
    }, [settings])

    function updateSettings(patch: Partial<AppSettings>) {
        setSettings(prev => {
            const next = { ...prev, ...patch }

            if (patch.soundEnabled !== undefined)    setFlutterSoundEnabled(next.soundEnabled)
            if (patch.soundVolume !== undefined)     setFlutterVolume(next.soundVolume)
            if (patch.soundFile !== undefined)       setFlutterSoundFile(next.soundFile)
            if (patch.ambientEnabled !== undefined)  setFlutterAmbientEnabled(next.ambientEnabled)
            if (patch.ambientFile !== undefined)     setFlutterAmbientFile(next.ambientFile)
            if (patch.ambientVolume !== undefined)   setFlutterAmbientVolume(next.ambientVolume)
            if (patch.minimizeOnClose !== undefined) setFlutterMinimizeOnClose(next.minimizeOnClose)
            if (patch.startOnBoot !== undefined)     setFlutterStartOnBoot(next.startOnBoot)

            return next
        })
    }

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const ctx = useContext(SettingsContext)
    if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
    return ctx
}
