'use client'
import { useEffect, ReactNode } from 'react'
import { useSettings } from '@/app/store/settings'

export default function WallpaperProvider({ children }: { children: ReactNode }) {
    const { settings } = useSettings()

    useEffect(() => {
        document.documentElement.style.backgroundImage = settings.wallpaper
    }, [settings.wallpaper])

    return <>{children}</>
}
