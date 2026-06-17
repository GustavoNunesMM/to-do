'use client';

import LatButtons from './components/latButtons';
import CreateModal from './components/modal/createModal';
import { useState } from "react";
import ClockControl from './components/clock/clockControl'
import GroupsPage from './components/group/groupsPage'
import GroupsTrigger from './components/group/groupsTrigger'
import CalendarTrigger from './components/calendar/calendarTrigger'
import CalendarPage from './components/calendar/calendarPage'
import SettingsModal from './components/settings/settingsModal'

export default function Home() {
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [groupsMounted, setGroupsMounted] = useState(false);
    const [groupsOpen, setGroupsOpen]       = useState(false);
    const [calendarMounted, setCalendarMounted] = useState(false);
    const [calendarOpen, setCalendarOpen]       = useState(false);
    const [settingsOpen, setSettingsOpen]   = useState(false);

    function openGroups()    { setGroupsMounted(true); setGroupsOpen(true) }
    function closeGroups()   { setGroupsOpen(false) }
    function openCalendar()  { setCalendarMounted(true); setCalendarOpen(true) }
    function closeCalendar() { setCalendarOpen(false) }

    return (
        <>
            {/* Settings button */}
            <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                style={{
                    position: 'fixed', top: 16, right: 16, zIndex: 40,
                    background: 'transparent',
                    border: 'none',
                    padding: 6,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'opacity 0.15s',
                    borderRadius: 8,
                    opacity: 0.4,
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}
                title="Configurações"
            >
                <img src="/icons/settings.svg" width={18} height={18} alt="" style={{ filter: 'invert(1)', display: 'block' }} />
            </button>
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
            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </>
    );
}
