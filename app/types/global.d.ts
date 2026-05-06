export {};

declare global {
    type TaskStatus = 'idle' | 'running' | 'paused' | 'done';

    interface Item {
        name: string;
        id: number;
        duration: durationType;
        description: string;
        status: TaskStatus;
    }

    interface durationType {
        hours: number;
        minutes: number;
    }
}