'use client';

import LatButtons from '@/app/components/latButtons';
import CreateModal from '@/app/components/modal/createModal';
import { useState, useRef } from "react";
import ClockControl from '@/app/components/clock/clockControl'
import GroupsPage from '@/app/components/group/groupsPage'
import GroupsTrigger from '@/app/components/group/groupsTrigger'
import CalendarTrigger from '@/app/components/calendar/calendarTrigger'
import CalendarPage from '@/app/components/calendar/calendarPage'
import SettingsModal from '@/app/components/settings/settingsModal'
import WidgetView from '@/app/components/widgetView'
import { useSettings } from '@/app/store/settings'
import type { TimerState } from '@/app/types'

function WidgetButton() {
    const { settings, updateSettings } = useSettings()
    const active = settings.widgetMode

    return (
        <button
            type="button"
            onClick={() => updateSettings({ widgetMode: !active })}
            title={active ? 'Fechar widget' : 'Abrir widget'}
            style={{
                position: 'fixed', top: 16, right: 52, zIndex: 40,
                background: 'transparent',
                border: 'none',
                padding: 6,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8,
                opacity: active ? 0.85 : 0.4,
                transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = active ? '0.85' : '0.4')}
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
                <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
                <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
                <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.45"/>
            </svg>
        </button>
    )
}

export default function Home() {
    const { settings } = useSettings()
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [groupsMounted, setGroupsMounted]     = useState(false);
    const [groupsOpen, setGroupsOpen]           = useState(false);
    const [calendarMounted, setCalendarMounted] = useState(false);
    const [calendarOpen, setCalendarOpen]       = useState(false);
    const [settingsOpen, setSettingsOpen]       = useState(false);
    const [timerState, setTimerState]           = useState<TimerState>({
        tarefa: 'idle', remainingSec: null, mode: 'task', pomodoroSec: null,
    });

    const playRef  = useRef<() => void>(() => {})
    const pauseRef = useRef<() => void>(() => {})
    const stopRef  = useRef<() => void>(() => {})

    function openGroups()    { setGroupsMounted(true); setGroupsOpen(true) }
    function closeGroups()   { setGroupsOpen(false) }
    function openCalendar()  { setCalendarMounted(true); setCalendarOpen(true) }
    function closeCalendar() { setCalendarOpen(false) }

    return (
        <>
            {/* Layout principal — oculto (não desmontado) no modo widget */}
            <div style={settings.widgetMode ? { visibility: 'hidden', pointerEvents: 'none', position: 'fixed', inset: 0 } : {}}>
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

                <WidgetButton />

                <div className="grid grid-cols-[25vw_75vw] h-screen">
                    <LatButtons openCreateModal={() => setOpenCreateModal(true)} />
                    <div className="flex items-center justify-center col-start-2 h-full p-8">
                        <ClockControl
                            onPlayRef={playRef}
                            onPauseRef={pauseRef}
                            onStopRef={stopRef}
                            onTimerState={setTimerState}
                        />
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
            </div>

            {/* Widget: sobrepõe tudo quando ativo */}
            {settings.widgetMode && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
                    <WidgetView
                        tarefa={timerState.tarefa}
                        remainingSec={timerState.remainingSec}
                        mode={timerState.mode}
                        pomodoroSec={timerState.pomodoroSec}
                        onPlay={() => playRef.current()}
                        onPause={() => pauseRef.current()}
                        onStop={() => stopRef.current()}
                    />
                </div>
            )}
        </>
    );
}
