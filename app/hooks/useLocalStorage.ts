import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(initialValue);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(key);
            if (stored) setValue(JSON.parse(stored));
        } catch {}
    }, [key]);

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {}
    }, [key, value]);

    return [value, setValue] as const;
}