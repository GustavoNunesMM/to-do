'use client';

import LatButtons from './components/latButtons';
import CreateModal from './components/createModal';
import { useState } from "react";
import ClockControl from './components/clockControl'
import GroupsPage from './components/groupsPage'
import GroupsTrigger from './components/groupsTrigger'

export default function Home() {
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [groupsMounted, setGroupsMounted] = useState(false);
    const [groupsOpen, setGroupsOpen]       = useState(false);

    function openGroups()  { setGroupsMounted(true); setGroupsOpen(true) }
    function closeGroups() { setGroupsOpen(false) }   // animação dispara; GroupsPage chama onClose ao fim

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
            <GroupsTrigger onOpen={openGroups} />
            {groupsMounted && (
                <GroupsPage
                    open={groupsOpen}
                    onRequestClose={closeGroups}
                    onClose={() => setGroupsMounted(false)}
                />
            )}
        </>
    );
}
