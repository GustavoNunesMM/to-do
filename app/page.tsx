'use client';

import LatButtons from './components/latButtons';
import CreateModal from './components/createModal';
import { useState } from "react";
import ClockControl from './components/clockControl'

export default function Home() {
    const [openCreateModal, setOpenCreateModal] = useState(false);

    return (
        <>
            <div className="grid grid-cols-[25vw_75vw] h-screen">
                <LatButtons openCreateModal={() => setOpenCreateModal(true)} />
                <div className="flex items-center justify-center col-start-2 h-full p-8">
                    <ClockControl />
                </div>
            </div>
            <CreateModal
                openModal={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
            />
        </>
    );
}
