type FlutterHandler = { callHandler: (name: string, ...args: unknown[]) => void }

function getFlutter(): FlutterHandler | null {
    if (typeof window === 'undefined') return null
    return (window as unknown as { flutter_inappwebview?: FlutterHandler }).flutter_inappwebview ?? null
}

export function notifyPomodoroBreak() {
    getFlutter()?.callHandler('pomodoroBreak')
}

export function notifyTaskDone(taskName: string) {
    getFlutter()?.callHandler('taskDone', taskName)
}

export function setFlutterSoundEnabled(v: boolean) {
    getFlutter()?.callHandler('setSoundEnabled', v)
}

export function setFlutterVolume(v: number) {
    getFlutter()?.callHandler('setVolume', v)
}

export function setFlutterSoundFile(name: string) {
    getFlutter()?.callHandler('setSoundFile', name)
}

export function setFlutterMinimizeOnClose(v: boolean) {
    getFlutter()?.callHandler('setMinimizeOnClose', v)
}

export function setFlutterStartOnBoot(v: boolean) {
    getFlutter()?.callHandler('setStartOnBoot', v)
}

export function previewSound(file: string, volume: number) {
    getFlutter()?.callHandler('previewSound', file, volume)
}

export function setFlutterAmbientEnabled(v: boolean) {
    getFlutter()?.callHandler('setAmbientEnabled', v)
}

export function setFlutterAmbientFile(name: string) {
    getFlutter()?.callHandler('setAmbientFile', name)
}

export function setFlutterAmbientVolume(v: number) {
    getFlutter()?.callHandler('setAmbientVolume', v)
}

