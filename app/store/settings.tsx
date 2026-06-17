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
    setFlutterWidgetMode,
} from '@/app/lib/flutter_bridge'

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
    // Ambient sounds
    ambientEnabled: boolean
    ambientFile: string         // MP3 filename
    ambientVolume: number       // 0-100
    // Widget mode
    widgetMode: boolean
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
    ambientEnabled: false,
    ambientFile: 'rain.mp3',
    ambientVolume: 40,
    widgetMode: false,
    minimizeOnClose: true,
    startOnBoot: false,
    showNotifications: true,
}

const SettingsContext = createContext<{ settings: AppSettings; updateSettings: (patch: Partial<AppSettings>) => void } | null>(null)

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
            if (patch.ambientEnabled !== undefined)  setFlutterAmbientEnabled(next.ambientEnabled)
            if (patch.ambientFile !== undefined)     setFlutterAmbientFile(next.ambientFile)
            if (patch.ambientVolume !== undefined)   setFlutterAmbientVolume(next.ambientVolume)
            if (patch.widgetMode !== undefined)      setFlutterWidgetMode(next.widgetMode)
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
