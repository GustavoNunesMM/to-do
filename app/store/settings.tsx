'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
    setFlutterSoundEnabled,
    setFlutterVolume,
    setFlutterSoundFile,
    setFlutterMinimizeOnClose,
    setFlutterStartOnBoot,
} from '../lib/flutter_bridge'

const STORAGE_KEY = 'app-settings'

export interface AppSettings {
    // Pomodoro
    pomodoroInterval: number   // minutes, default 25
    pomodoroBreak: number      // minutes, default 5
    // Appearance
    wallpaper: string          // css url/gradient string
    // Sound
    soundEnabled: boolean
    soundVolume: number        // 0-100
    soundFile: string          // asset name
    // App behavior
    minimizeOnClose: boolean
    startOnBoot: boolean
    // Notifications
    showNotifications: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
    pomodoroInterval: 25,
    pomodoroBreak: 5,
    wallpaper: "url('/assets/bg.jpg')",
    soundEnabled: true,
    soundVolume: 80,
    soundFile: 'notify.wav',
    minimizeOnClose: true,
    startOnBoot: false,
    showNotifications: true,
}

interface ContextValue {
    settings: AppSettings
    updateSettings: (patch: Partial<AppSettings>) => void
}

const SettingsContext = createContext<ContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

    // Hydrate from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored) as Partial<AppSettings>
                setSettings(prev => ({ ...prev, ...parsed }))
            }
        } catch {}
    }, [])

    // Persist to localStorage whenever settings change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
        } catch {}
    }, [settings])

    function updateSettings(patch: Partial<AppSettings>) {
        setSettings(prev => {
            const next = { ...prev, ...patch }

            // Sync flutter bridge for relevant fields
            if (patch.soundEnabled !== undefined)    setFlutterSoundEnabled(next.soundEnabled)
            if (patch.soundVolume !== undefined)     setFlutterVolume(next.soundVolume)
            if (patch.soundFile !== undefined)       setFlutterSoundFile(next.soundFile)
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

export function useSettings(): ContextValue {
    const ctx = useContext(SettingsContext)
    if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
    return ctx
}
