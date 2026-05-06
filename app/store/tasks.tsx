'use client'
import { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react'
import { genId } from '../lib/task'

const STORAGE_KEY        = 'tasks-state'
const POMODORO_KEY       = 'pomodoro-config'
const GROUPS_KEY         = 'groups-state'
const DEFAULT_POMODORO: PomodoroConfig = { intervalMin: 25, breakMin: 5 }

const GROUP_COLORS = [
    '#6366f1', '#ec4899', '#10b981', '#f59e0b',
    '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6',
]

type Action =
    | { type: 'ADD';             payload: Item }
    | { type: 'DELETE';          payload: number }
    | { type: 'UPDATE';          payload: Item }
    | { type: 'UPDATE_STATUS';   payload: { id: number; status: TaskStatus } }
    | { type: 'UPDATE_PROGRESS'; payload: { id: number; progress: number; remainingSec: number; taskElapsed: number } }
    | { type: 'SELECT';          payload: number | null }
    | { type: 'SET_GROUP';       payload: { itemId: number; groupId: number | null } }
    | { type: 'HYDRATE';         payload: State }

interface State {
    items: Item[]
    selectedId: number | null
}

const initialState: State = { items: [], selectedId: null }

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'ADD':
            return { ...state, items: [...state.items, action.payload] }

        case 'DELETE': {
            const idsToRemove = new Set<number>()
            idsToRemove.add(action.payload)
            state.items.forEach(i => { if (i.parentId === action.payload) idsToRemove.add(i.id) })
            return {
                items: state.items.filter(i => !idsToRemove.has(i.id)),
                selectedId: idsToRemove.has(state.selectedId ?? -1) ? null : state.selectedId,
            }
        }

        case 'UPDATE':
            return { ...state, items: state.items.map(i => i.id === action.payload.id ? action.payload : i) }

        case 'UPDATE_STATUS':
            return {
                ...state,
                items: state.items.map(i =>
                    i.id === action.payload.id ? { ...i, status: action.payload.status } : i
                ),
            }

        case 'UPDATE_PROGRESS':
            return {
                ...state,
                items: state.items.map(i =>
                    i.id === action.payload.id
                        ? { ...i, savedProgress: action.payload.progress, savedRemainingSec: action.payload.remainingSec, taskElapsed: action.payload.taskElapsed }
                        : i
                ),
            }

        case 'SET_GROUP':
            return {
                ...state,
                items: state.items.map(i =>
                    i.id === action.payload.itemId ? { ...i, groupId: action.payload.groupId } : i
                ),
            }

        case 'SELECT':
            return { ...state, selectedId: action.payload }

        case 'HYDRATE':
            return action.payload

        default:
            return state
    }
}

interface ContextValue {
    items: Item[]
    selected: Item | undefined
    selectedId: number | null
    hydrated: boolean
    pomodoroConfig: PomodoroConfig
    groups: Group[]
    add:            (item: Omit<Item, 'id' | 'status'>, id?: number) => void
    addSubtask:     (parentId: number, item: Omit<Item, 'id' | 'status' | 'parentId'>) => void
    remove:         (id: number) => void
    update:         (item: Item) => void
    updateStatus:   (id: number, status: TaskStatus) => void
    updateProgress: (id: number, progress: number, remainingSec: number, taskElapsed: number) => void
    select:         (id: number | null) => void
    setPomodoroConfig: (cfg: PomodoroConfig) => void
    addGroup:       (name: string) => Group
    removeGroup:    (id: number) => void
    updateGroup:    (group: Group) => void
    setItemGroup:   (itemId: number, groupId: number | null) => void
}

const TasksContext = createContext<ContextValue | null>(null)

export function TasksProvider({ children }: { children: ReactNode }) {
    const [state, dispatch]           = useReducer(reducer, initialState)
    const [hydrated, setHydrated]     = useState(false)
    const [pomodoroConfig, setPomodoroConfigState] = useState<PomodoroConfig>(DEFAULT_POMODORO)
    const [groups, setGroups]         = useState<Group[]>([])

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) dispatch({ type: 'HYDRATE', payload: JSON.parse(stored) })
            const storedPom = localStorage.getItem(POMODORO_KEY)
            if (storedPom) setPomodoroConfigState(JSON.parse(storedPom))
            const storedGroups = localStorage.getItem(GROUPS_KEY)
            if (storedGroups) setGroups(JSON.parse(storedGroups))
        } catch {}
        setHydrated(true)
    }, [])

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
    }, [state])

    useEffect(() => {
        try { localStorage.setItem(GROUPS_KEY, JSON.stringify(groups)) } catch {}
    }, [groups])

    function setPomodoroConfig(cfg: PomodoroConfig) {
        setPomodoroConfigState(cfg)
        try { localStorage.setItem(POMODORO_KEY, JSON.stringify(cfg)) } catch {}
    }

    function addGroup(name: string): Group {
        const usedColors = groups.map(g => g.color)
        const color = GROUP_COLORS.find(c => !usedColors.includes(c)) ?? GROUP_COLORS[groups.length % GROUP_COLORS.length]
        const group: Group = { id: genId(), name, color }
        setGroups(prev => [...prev, group])
        return group
    }

    function removeGroup(id: number) {
        setGroups(prev => prev.filter(g => g.id !== id))
        // desassociar tarefas do grupo removido
        state.items.forEach(item => {
            if (item.groupId === id) dispatch({ type: 'SET_GROUP', payload: { itemId: item.id, groupId: null } })
        })
    }

    function updateGroup(group: Group) {
        setGroups(prev => prev.map(g => g.id === group.id ? group : g))
    }

    function setItemGroup(itemId: number, groupId: number | null) {
        dispatch({ type: 'SET_GROUP', payload: { itemId, groupId } })
    }

    const selected = state.items.find(i => i.id === state.selectedId)

    const value: ContextValue = {
        items: state.items,
        selected,
        selectedId: state.selectedId,
        hydrated,
        pomodoroConfig,
        groups,
        add: (item, id) => dispatch({ type: 'ADD', payload: { ...item, id: id ?? genId(), status: 'idle' } }),
        addSubtask: (parentId, item) => dispatch({ type: 'ADD', payload: { ...item, id: genId(), status: 'idle', parentId } }),
        remove:         (id)                              => dispatch({ type: 'DELETE',          payload: id }),
        update:         (item)                            => dispatch({ type: 'UPDATE',          payload: item }),
        updateStatus:   (id, status)                      => dispatch({ type: 'UPDATE_STATUS',   payload: { id, status } }),
        updateProgress: (id, progress, remainingSec, taskElapsed) =>
            dispatch({ type: 'UPDATE_PROGRESS', payload: { id, progress, remainingSec, taskElapsed } }),
        select:         (id)                              => dispatch({ type: 'SELECT',          payload: id }),
        setPomodoroConfig,
        addGroup,
        removeGroup,
        updateGroup,
        setItemGroup,
    }

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks(): ContextValue {
    const ctx = useContext(TasksContext)
    if (!ctx) throw new Error('useTasks must be used inside TasksProvider')
    return ctx
}
