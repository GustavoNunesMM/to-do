'use client';

import LatButtons from './components/latButtons';
import CreateModal from './components/createModal';
import { useState } from "react";
import ClockControl from './components/clockControl'

interface Item {
    name:string
    duration:string
    description:string
}

export default function Home() {
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [item, setItem] = useState<Item[]>([])

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

    return (
        <>
            <div className="grid grid-cols-[25vw_75vw] h-screen">
            <LatButtons openCreateModal={openModal} itens={item} />
            <div className="flex items-center justify-center col-start-2 h-full p-8">
                <ClockControl/>
            </div>
        </div>
            <CreateModal
                openModal={openCreateModal}
                onClose={closeModal}
                addItem={(value)=> addItemToList(value)}
            />
        </>
    );
}