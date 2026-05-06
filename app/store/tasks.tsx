'use client'
import { createContext, useContext, useReducer, ReactNode } from 'react'

type Action =
    | { type: 'ADD';           payload: Item }
    | { type: 'DELETE';        payload: number }
    | { type: 'UPDATE';        payload: Item }
    | { type: 'UPDATE_STATUS'; payload: { id: number; status: TaskStatus } }
    | { type: 'SELECT';        payload: number | null }

interface State {
    items: Item[]
    selectedId: number | null
}

const initialState: State = { items: [], selectedId: null }

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'ADD':
            return { ...state, items: [...state.items, action.payload] }

        case 'DELETE':
            return {
                items: state.items.filter(i => i.id !== action.payload),
                selectedId: state.selectedId === action.payload ? null : state.selectedId,
            }

        case 'UPDATE':
            return {
                ...state,
                items: state.items.map(i => i.id === action.payload.id ? action.payload : i),
            }

        case 'UPDATE_STATUS':
            return {
                ...state,
                items: state.items.map(i =>
                    i.id === action.payload.id ? { ...i, status: action.payload.status } : i
                ),
            }

        case 'SELECT':
            return { ...state, selectedId: action.payload }

        default:
            return state
    }
}

interface ContextValue {
    items: Item[]
    selected: Item | undefined
    selectedId: number | null
    add:          (item: Omit<Item, 'id' | 'status'>) => void
    remove:       (id: number) => void
    update:       (item: Item) => void
    updateStatus: (id: number, status: TaskStatus) => void
    select:       (id: number | null) => void
}

const TasksContext = createContext<ContextValue | null>(null)

export function TasksProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState)

    const selected = state.items.find(i => i.id === state.selectedId)

    const value: ContextValue = {
        items: state.items,
        selected,
        selectedId: state.selectedId,
        add: (item) => dispatch({
            type: 'ADD',
            payload: { ...item, id: Date.now(), status: 'idle' },
        }),
        remove:       (id)           => dispatch({ type: 'DELETE',        payload: id }),
        update:       (item)         => dispatch({ type: 'UPDATE',        payload: item }),
        updateStatus: (id, status)   => dispatch({ type: 'UPDATE_STATUS', payload: { id, status } }),
        select:       (id)           => dispatch({ type: 'SELECT',        payload: id }),
    }

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks(): ContextValue {
    const ctx = useContext(TasksContext)
    if (!ctx) throw new Error('useTasks must be used inside TasksProvider')
    return ctx
}
