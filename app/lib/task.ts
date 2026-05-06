export const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string; dot: string }> = {
    idle:    { label: 'Aguardando',      className: 'text-white/40',    dot: 'bg-white/30' },
    running: { label: 'Em andamento',    className: 'text-emerald-400', dot: 'bg-emerald-400' },
    paused:  { label: 'Pausado',         className: 'text-amber-400',   dot: 'bg-amber-400' },
    partial: { label: 'Parc. concluído', className: 'text-sky-400',     dot: 'bg-sky-400' },
    done:    { label: 'Concluído',       className: 'text-violet-400',  dot: 'bg-violet-400' },
}

export function durationToSec(d: durationType): number {
    return (d.hours * 60 + d.minutes) * 60
}

export function formatRemaining(sec: number): string {
    const s = Math.max(0, sec)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const ss = s % 60
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

export function formatDuration(d: durationType): string {
    return `${String(d.hours).padStart(2, '0')}:${String(d.minutes).padStart(2, '0')}`
}

export function formatSec(sec: number): string {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    return `00:${String(m).padStart(2, '0')}`
}

export function formatTime(seconds: number): string {
    const s = Math.max(0, seconds)
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
        .map(n => String(n).padStart(2, '0')).join(':')
}

/** Gera ID único sem risco de colisão por Date.now() simultâneo */
export function genId(): number {
    return Date.now() * 1000 + Math.floor(Math.random() * 1000)
}
