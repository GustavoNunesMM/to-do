interface button {
    title: string;
    icon?: string;
    action?: () => void;
    condition?: boolean;
}

interface Props {
    className?: string;
    onClick?: (event: string) => void;
    tarefa: 'idle' | 'running' | 'paused' | 'done';
}
export default function ControllButtons({ className, onClick,  tarefa }: Props) {

    function getButtons() {
        if (tarefa === 'idle') {
            return [
                { title: 'começar', action: () => onClick?.("start") }
            ]
        }

        if (tarefa === 'running') {
            return [
                { title: 'pausar', action: () => onClick?.("pause") },
                { title: 'parar', action: () => onClick?.("stop") }
            ]
        }

        if (tarefa === 'paused') {
            return [
                { title: 'continuar', action: () => onClick?.("play") },
                { title: 'parar', action: () => onClick?.("stop") }
            ]
        }

        if (tarefa === 'done') {
            return [
                { title: 'reiniciar', action: () => onClick?.("start") }
            ]
        }

        return []
    }

    const buttons = getButtons()

    return (
        <div className={`flex flex-row gap-2  place-self-center ${className}`}>
            {buttons.map((button, index) => (
                <button key={index} onClick={button.action} className="btn-glass">
                    {button.title}
                </button>
            ))}
        </div>
    )
}