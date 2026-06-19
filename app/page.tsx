'use client';

import LatButtons from '@/app/components/latButtons';
import CreateModal from '@/app/components/modal/createModal';
import { useState } from "react";
import ClockControl from '@/app/components/clock/clockControl'
import GroupsPage from '@/app/components/group/groupsPage'
import GroupsTrigger from '@/app/components/group/groupsTrigger'
import CalendarTrigger from '@/app/components/calendar/calendarTrigger'
import CalendarPage from '@/app/components/calendar/calendarPage'
import SettingsModal from '@/app/components/settings/settingsModal'
import { useSettings } from '@/app/store/settings'

function AmbientButton() {
    const { settings, updateSettings } = useSettings()
    const on = settings.ambientEnabled

    return (
        <button
            type="button"
            onClick={() => updateSettings({ ambientEnabled: !on })}
            title={on ? 'Desativar som ambiente' : 'Ativar som ambiente'}
            style={{
                position: 'fixed', top: 16, right: 52, zIndex: 40,
                background: on ? 'rgba(99,102,241,0.18)' : 'transparent',
                border: on ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent',
                padding: 6, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8,
                opacity: on ? 1 : 0.4,
                transition: 'opacity 0.15s, background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = on ? '1' : '0.4')}
        >
            {on ? (
                /* Speaker with waves */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={on ? 'rgba(99,102,241,0.95)' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
            ) : (
                /* Speaker muted */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
                </svg>
            )}
        </button>
    )
}

export default function Home() {
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [groupsMounted, setGroupsMounted]     = useState(false);
    const [groupsOpen, setGroupsOpen]           = useState(false);
    const [calendarMounted, setCalendarMounted] = useState(false);
    const [calendarOpen, setCalendarOpen]       = useState(false);
    const [settingsOpen, setSettingsOpen]       = useState(false);

    function openGroups()    { setGroupsMounted(true); setGroupsOpen(true) }
    function closeGroups()   { setGroupsOpen(false) }
    function openCalendar()  { setCalendarMounted(true); setCalendarOpen(true) }
    function closeCalendar() { setCalendarOpen(false) }

    return (
        <>
            <AmbientButton />

            <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                style={{
                    position: 'fixed', top: 16, right: 16, zIndex: 40,
                    background: 'transparent', border: 'none', padding: 6,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', borderRadius: 8, opacity: 0.4,
                    transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}
                title="Configurações"
            >
                <img src="/icons/settings.svg" width={18} height={18} alt="" style={{ filter: 'invert(1)', display: 'block' }} />
            </button>

            <div className="grid grid-cols-[30vw_70vw] h-screen">
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
