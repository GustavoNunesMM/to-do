// Envia eventos para o Flutter shell via flutter_inappwebview.
// Só executa quando rodando dentro do WebView Flutter — no browser normal é no-op.

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
