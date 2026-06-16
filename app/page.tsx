'use client';

import LatButtons from './components/latButtons';
import CreateModal from './components/modal/createModal';
import { useState } from "react";
import ClockControl from './components/clock/clockControl'
import GroupsPage from './components/group/groupsPage'
import GroupsTrigger from './components/group/groupsTrigger'
import CalendarTrigger from './components/calendar/calendarTrigger'
import CalendarPage from './components/calendar/calendarPage'

export default function Home() {
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [groupsMounted, setGroupsMounted] = useState(false);
    const [groupsOpen, setGroupsOpen]       = useState(false);
    const [calendarMounted, setCalendarMounted] = useState(false);
    const [calendarOpen, setCalendarOpen]       = useState(false);

    function openGroups()    { setGroupsMounted(true); setGroupsOpen(true) }
    function closeGroups()   { setGroupsOpen(false) }
    function openCalendar()  { setCalendarMounted(true); setCalendarOpen(true) }
    function closeCalendar() { setCalendarOpen(false) }

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
            <CalendarTrigger onOpen={openCalendar} />
            {calendarMounted && (
                <CalendarPage
                    open={calendarOpen}
                    onRequestClose={closeCalendar}
                    onClose={() => setCalendarMounted(false)}
                />
            )}
        </>
    );
}
