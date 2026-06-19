export {};

declare global {
    type TaskStatus = 'idle' | 'running' | 'paused' | 'done' | 'partial';

    interface Item {
        name: string;
        id: number;
        duration: durationType;
        description: string;
        status: TaskStatus;
        savedProgress?: number;
        savedRemainingSec?: number;
        taskElapsed?: number;
        pomodoroEnabled?: boolean;
        pomodoroIntervalMin?: number | null;
        groupId?: number | null;
        parentId?: number | null;
        scheduledDate?: string | null;
        scheduledTime?: string | null;
    }

    interface Group {
        id: number;
        name: string;
        color: string;
    }

    interface PomodoroConfig {
        intervalMin: number;
        breakMin: number;
    }

    interface durationType {
        hours: number;
        minutes: number;
    }
}