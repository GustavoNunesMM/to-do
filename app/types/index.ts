export interface ArcProgressProps {
    progress: number
    arcSize: number
    numTicks?: number
    radius?: number
    className?: string
    pomodoroMarkers?: number[]
    isPomodoroMode?: boolean
    isNearPomodoro?: boolean
}

export type TasksAction =
    | { type: 'ADD';             payload: Item }
    | { type: 'DELETE';          payload: number }
    | { type: 'UPDATE';          payload: Item }
    | { type: 'UPDATE_STATUS';   payload: { id: number; status: TaskStatus } }
    | { type: 'UPDATE_PROGRESS'; payload: { id: number; progress: number; remainingSec: number; taskElapsed: number } }
    | { type: 'SELECT';          payload: number | null }
    | { type: 'SET_GROUP';       payload: { itemId: number; groupId: number | null } }
    | { type: 'REORDER';         payload: { fromIndex: number; toIndex: number } }
    | { type: 'HYDRATE';         payload: TasksState }

export interface TasksState {
    items: Item[]
    selectedId: number | null
}

export interface CompletedEntry {
    id: number
    name: string
    duration: durationType
    completedAt: string
    taskElapsed: number
    groupId?: number | null
}

export interface TasksContextValue {
    items: Item[]
    selected: Item | undefined
    selectedId: number | null
    hydrated: boolean
    pomodoroConfig: PomodoroConfig
    groups: Group[]
    completedHistory: CompletedEntry[]
    add:            (item: Omit<Item, 'id' | 'status'>, id?: number) => void
    addSubtask:     (parentId: number, item: Omit<Item, 'id' | 'status' | 'parentId'>) => void
    remove:         (id: number) => void
    update:         (item: Item) => void
    updateStatus:   (id: number, status: TaskStatus) => void
    updateProgress: (id: number, progress: number, remainingSec: number, taskElapsed: number) => void
    select:         (id: number | null) => void
    reorder:        (fromIndex: number, toIndex: number) => void
    setPomodoroConfig: (cfg: PomodoroConfig) => void
    addGroup:       (name: string) => Group
    removeGroup:    (id: number) => void
    updateGroup:    (group: Group) => void
    setItemGroup:   (itemId: number, groupId: number | null) => void
    clearHistory:   () => void
}

export interface ModalOpenProps {
    open: boolean
    onClose: () => void
}

export interface ModalPageProps extends ModalOpenProps {
    onRequestClose: () => void
}

export interface ControllButtonsProps {
    className?: string
    onClick?: (event: string) => void
    tarefa: TaskStatus
    disabled?: boolean
}

export interface TimePickerProps {
    value: durationType
    onChange: (value: durationType) => void
}

export interface SubtaskDraft {
    id: number
    name: string
    duration: durationType
    pomodoroEnabled: boolean
}

export interface CreateModalProps {
    openModal: boolean
    onClose: () => void
    editItem?: Item
}

export type CalendarTimerMode = 'task' | 'pomodoro'

export interface CalendarDragContextValue {
    dragging: Item | null
    ghostX: number
    ghostY: number
    startDrag: (item: Item, e: React.PointerEvent) => void
    registerDrop: (el: HTMLElement, handler: (item: Item, x: number, y: number) => void) => () => void
}

export interface GroupDragState {
    itemId: number
    sourceGroupId: number | null
}

export type SettingsTab = 'pomodoro' | 'aparencia' | 'som' | 'aplicativo'

export interface ToggleRowProps {
    label: string
    description: string
    value: boolean
    onChange: (v: boolean) => void
}
