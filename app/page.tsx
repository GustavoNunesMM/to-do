'use client';

import LatButtons from './components/latButtons';
import CreateModal from './components/createModal';
import { useState } from "react";
import ClockControl from './components/clockControl'

export default function Home() {
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [item, setItem] = useState<Item[]>([])
    const [selected, setSelected] = useState<Item>();

    function openModal() {
        setOpenCreateModal(true);
    }

    function closeModal() {
        setOpenCreateModal(false);
    }

    function addItemToList(value:Item ) {
        setItem([...item, value])
        console.log('Aqui esta o novo item:',item)
    }

    function getSelected(id: number) {
        const selectedItem = item.find((el) => el.id === id)
        if (selectedItem) setSelected(selectedItem)
    }

    function updateStatus(id: number, status: TaskStatus) {
        setItem(prev => prev.map(el => el.id === id ? { ...el, status } : el))
    }

    return (
        <>
            <div className="grid grid-cols-[25vw_75vw] h-screen">
                <LatButtons openCreateModal={openModal} itens={item} selectItem={getSelected} />
                <div className="flex items-center justify-center col-start-2 h-full p-8">
                    <ClockControl selectedItem={selected} onStatusChange={updateStatus} />
                </div>
            </div>
            <CreateModal
                openModal={openCreateModal}
                onClose={closeModal}
                addItem={(value)=> addItemToList(value)}
                itens={item}
            />
        </>
    );
}