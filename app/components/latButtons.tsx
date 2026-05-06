import { MdAdd } from "react-icons/md";

interface Item {
    name: string;
    duration: string;
    description: string;
}

interface Props {
    openCreateModal: () => void;
    itens: Item[];
}

export default function LatButton({ openCreateModal, itens }: Props) {
    return (
        <div className="flex flex-col gap-1 w-[20vw] m-4 ml-10">
            <div className="py-3 flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                    {itens.length === 0 ? (
                        <span className="text-white/70 text-sm text-center cursor-default">
                            Sem itens por aqui
                        </span>
                    ) : (
                        itens.map((item: Item, index: number) => (
                            <button key={index} className="btn-glass rounded-none text-left">
                                {item.name}
                            </button>
                        ))
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