interface Props {
    className?: string;
    onClick?: (event: string) => void;
    tarefa: TaskStatus;
    disabled?: boolean;
}
export default function ControllButtons({ className, onClick, tarefa, disabled }: Props) {

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

        return []
    }

    const buttons = getButtons()

    return (
        <div className={`flex flex-row gap-2 place-self-center ${className}`}>
            {buttons.map((button, index) => (
                <button
                    key={index}
                    onClick={button.action}
                    disabled={disabled}
                    className="btn-glass disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                    {button.title}
                </button>
            ))}
        </div>
    )
}