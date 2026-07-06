import { MdPlayArrow, MdPause, MdStop, MdReplay, MdCheck } from 'react-icons/md'
import type { IconType } from 'react-icons'

interface Props {
    className?: string;
    onClick?: (event: string) => void;
    tarefa: TaskStatus;
    disabled?: boolean;
    hasProgress?: boolean;
}

interface ControlButton {
    title: string
    event: string
    Icon: IconType
}

export function FinishButton({ onClick, tarefa, disabled, hasProgress }: Props) {
    const visible = tarefa === 'running' || tarefa === 'paused' || (tarefa === 'idle' && hasProgress)
    if (!visible) return null

    return (
        <button
            onClick={() => onClick?.('finish')}
            disabled={disabled}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium
                text-emerald-300/80 hover:text-emerald-200
                border border-emerald-400/25 hover:border-emerald-400/55
                bg-emerald-400/8 hover:bg-emerald-400/15
                transition-all duration-150
                disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
            <MdCheck size={14} />
            finalizar tarefa
        </button>
    )
}

export default function ControllButtons({ className, onClick, tarefa, disabled, hasProgress }: Props) {

    function getButtons(): ControlButton[] {
        if (tarefa === 'idle') {
            return hasProgress
                ? [
                    { title: 'continuar', event: 'start',   Icon: MdPlayArrow },
                    { title: 'recomeçar', event: 'restart', Icon: MdReplay },
                ]
                : [
                    { title: 'começar', event: 'start', Icon: MdPlayArrow },
                ]
        }

        if (tarefa === 'running') {
            return [
                { title: 'pausar',    event: 'pause',   Icon: MdPause },
                { title: 'parar',     event: 'stop',    Icon: MdStop },
                { title: 'recomeçar', event: 'restart', Icon: MdReplay },
            ]
        }

        if (tarefa === 'paused') {
            return [
                { title: 'continuar', event: 'play',    Icon: MdPlayArrow },
                { title: 'parar',     event: 'stop',    Icon: MdStop },
                { title: 'recomeçar', event: 'restart', Icon: MdReplay },
            ]
        }

        if (tarefa === 'done') {
            return [
                { title: 'recomeçar', event: 'restart', Icon: MdReplay },
            ]
        }

        return []
    }

    const buttons = getButtons()

    return (
        <div className={`flex flex-row gap-2 place-self-center ${className ?? ''}`}>
            {buttons.map(({ title, event, Icon }) => (
                <button
                    key={event}
                    onClick={() => onClick?.(event)}
                    disabled={disabled}
                    title={title}
                    className="btn-glass flex items-center justify-center p-3! rounded-full!
                        disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                    <Icon size={18} className="opacity-85" />
                </button>
            ))}
        </div>
    )
}
