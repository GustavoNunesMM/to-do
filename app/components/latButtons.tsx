import { MdAdd } from "react-icons/md";

interface Props {
    openCreateModal: () => void;
    itens: Item[];
    selectItem: (id: number) => void;
}

const statusConfig: Record<TaskStatus, { label: string; className: string; dot: string }> = {
    idle:    { label: 'Aguardando',   className: 'text-white/40',    dot: 'bg-white/30' },
    running: { label: 'Em andamento', className: 'text-emerald-400', dot: 'bg-emerald-400' },
    paused:  { label: 'Pausado',      className: 'text-amber-400',   dot: 'bg-amber-400' },
    done:    { label: 'Concluído',    className: 'text-violet-400',  dot: 'bg-violet-400' },
};

export default function LatButton({ openCreateModal, itens, selectItem }: Props) {
    function selectId(id: number) {
        selectItem(id)
    }

    return (
        <div className="flex flex-col gap-1 w-[20vw] m-4 ml-10">
            <div className="py-3 flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                    {itens.length === 0 ? (
                        <span className="text-white/70 text-sm text-center cursor-default">
                            Sem itens por aqui
                        </span>
                    ) : (
                        itens.map((item: Item) => {
                            const { label, className, dot } = statusConfig[item.status] ?? statusConfig['idle'];
                            return (
                                <button key={item.id} className="btn-glass rounded-none text-left justify-between flex flex-row items-center" onClick={() => selectId(item.id)}>
                                    <div className="flex flex-col gap-0.5">
                                        <p>{item.name}</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                                            <span className={`text-xs ${className}`}>{label}</span>
                                        </div>
                                    </div>
                                    <p className="text-white/60 text-sm tabular-nums">
                                        {String(item.duration.hours).padStart(2, '0')}:{String(item.duration.minutes).padStart(2, '0')}
                                    </p>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            <button
                onClick={openCreateModal}
                className="p-0! btn-glass flex place-self-center w-full items-center justify-center w-10 h-10 rounded-lg"
            >
                <MdAdd size={20} />
            </button>
        </div>
    );
}