import { useState } from 'react'
import { MdAdd } from "react-icons/md";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { useTasks } from '../store/tasks'
import CreateModal from './createModal'

const statusConfig: Record<TaskStatus, { label: string; className: string; dot: string }> = {
    idle:    { label: 'Aguardando',   className: 'text-white/40',    dot: 'bg-white/30' },
    running: { label: 'Em andamento', className: 'text-emerald-400', dot: 'bg-emerald-400' },
    paused:  { label: 'Pausado',      className: 'text-amber-400',   dot: 'bg-amber-400' },
    done:    { label: 'Concluído',    className: 'text-violet-400',  dot: 'bg-violet-400' },
};

interface Props {
    openCreateModal: () => void
}

export default function LatButton({ openCreateModal }: Props) {
    const { items, select, remove, selectedId } = useTasks()
    const [editItem, setEditItem] = useState<Item | null>(null)

    return (
        <div className="flex flex-col gap-1 w-[20vw] m-4 ml-10">
            <div className="py-3 flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                    {items.length === 0 ? (
                        <span className="text-white/70 text-sm text-center cursor-default">
                            Sem itens por aqui
                        </span>
                    ) : (
                        items.map((item: Item) => {
                            const { label, className, dot } = statusConfig[item.status] ?? statusConfig['idle'];
                            const isSelected = item.id === selectedId
                            return (
                                <div
                                    key={item.id}
                                    className={`btn-glass rounded-none flex flex-row items-center gap-2 p-0! ${isSelected ? 'border-white/40' : ''}`}
                                >
                                    <button
                                        className="flex-1 text-left flex flex-row items-center justify-between py-[0.6rem] px-[1.2rem]"
                                        onClick={() => select(item.id)}
                                    >
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

                                    <div className="flex flex-col gap-1 border-l border-white/10 px-2 py-1 self-stretch justify-center">
                                        <button
                                            onClick={() => setEditItem(item)}
                                            className="text-white/40 hover:text-white/80 transition-colors"
                                        >
                                            <MdOutlineEdit size={15} />
                                        </button>
                                        <button
                                            onClick={() => remove(item.id)}
                                            className="text-white/40 hover:text-red-400 transition-colors"
                                        >
                                            <MdDeleteOutline size={15} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <button
                onClick={openCreateModal}
                className="p-0! btn-glass flex place-self-center w-full items-center justify-center h-10 rounded-lg"
            >
                <MdAdd size={20} />
            </button>

            {editItem && (
                <CreateModal
                    openModal={true}
                    onClose={() => setEditItem(null)}
                    editItem={editItem}
                />
            )}
        </div>
    );
}
