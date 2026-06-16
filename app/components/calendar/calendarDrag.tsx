'use client'
import { createContext, useContext, useRef, useState, useCallback, useEffect, ReactNode } from 'react'

interface CalendarDragContextValue {
    dragging: Item | null
    ghostX: number
    ghostY: number
    startDrag: (item: Item, e: React.PointerEvent) => void
    registerDrop: (el: HTMLElement, handler: (item: Item, x: number, y: number) => void) => () => void
}

const CalendarDragContext = createContext<CalendarDragContextValue | null>(null)

export function CalendarDragProvider({ children }: { children: ReactNode }) {
    const [dragging, setDragging] = useState<Item | null>(null)
    const [ghost, setGhost]       = useState({ x: 0, y: 0 })
    const itemRef   = useRef<Item | null>(null)
    const dropsRef  = useRef<Map<HTMLElement, (item: Item, x: number, y: number) => void>>(new Map())

    const registerDrop = useCallback((el: HTMLElement, handler: (item: Item, x: number, y: number) => void) => {
        dropsRef.current.set(el, handler)
        return () => { dropsRef.current.delete(el) }
    }, [])

    const startDrag = useCallback((item: Item, e: React.PointerEvent) => {
        e.preventDefault()
        itemRef.current = item
        setDragging(item)
        setGhost({ x: e.clientX, y: e.clientY })
    }, [])

    useEffect(() => {
        function onMove(e: PointerEvent) {
            if (!itemRef.current) return
            setGhost({ x: e.clientX, y: e.clientY })
        }

        function onUp(e: PointerEvent) {
            const item = itemRef.current
            if (!item) return
            itemRef.current = null
            setDragging(null)
            setGhost({ x: 0, y: 0 })

            // Encontra o destino de drop sob o cursor
            const els = document.elementsFromPoint(e.clientX, e.clientY)
            for (const el of els) {
                const handler = dropsRef.current.get(el as HTMLElement)
                if (handler) {
                    handler(item, e.clientX, e.clientY)
                    break
                }
            }
        }

        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        return () => {
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
        }
    }, [])

    return (
        <CalendarDragContext.Provider value={{ dragging, ghostX: ghost.x, ghostY: ghost.y, startDrag, registerDrop }}>
            {children}
            {dragging && (
                <div
                    style={{
                        position: 'fixed',
                        left: ghost.x + 14,
                        top: ghost.y + 14,
                        pointerEvents: 'none',
                        zIndex: 9999,
                        background: 'rgba(99,102,241,0.9)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: 6,
                        padding: '4px 10px',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                        userSelect: 'none',
                    }}
                >
                    {dragging.name}
                </div>
            )}
        </CalendarDragContext.Provider>
    )
}

export function useCalendarDrag() {
    const ctx = useContext(CalendarDragContext)
    if (!ctx) throw new Error('useCalendarDrag must be used inside CalendarDragProvider')
    return ctx
}
