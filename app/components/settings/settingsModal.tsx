'use client'
import { useState, useEffect, useRef } from 'react'
import { useSettings } from '@/app/store/settings'
import { useTasks } from '@/app/store/tasks'
import { previewSound } from '@/app/lib/flutter_bridge'
import type { SettingsTab, ToggleRowProps, ModalOpenProps } from '@/app/types'

const GLASS: React.CSSProperties = {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 10,
}

const SECTION_LABEL: React.CSSProperties = {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 10,
}

const INPUT_STYLE: React.CSSProperties = {
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 8,
    color: '#fff',
    fontSize: 14,
    padding: '8px 12px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
}


function ToggleSwitch({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!value)}
            style={{
                width: 36, height: 20, borderRadius: 10,
                backgroundColor: value ? 'rgba(99,102,241,0.75)' : 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.18)',
                position: 'relative', flexShrink: 0,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'background-color 0.2s',
                outline: 'none',
            }}
        >
            <div style={{
                position: 'absolute', top: 2, left: value ? 16 : 2,
                width: 14, height: 14, borderRadius: '50%',
                backgroundColor: 'white', transition: 'left 0.2s',
            }} />
        </button>
    )
}

function NumberInput({ label, value, min, max, onChange }: {
    label: string; value: number; min: number; max: number; onChange: (v: number) => void
}) {
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{label}</span>
            <input
                type="number" min={min} max={max} value={value}
                onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
                style={{ ...INPUT_STYLE, appearance: 'textfield' } as React.CSSProperties}
            />
        </label>
    )
}


function TabPomodoro() {
    const { settings, updateSettings } = useSettings()
    const { setPomodoroConfig } = useTasks()

    function handleIntervalChange(v: number) {
        updateSettings({ pomodoroInterval: v })
        setPomodoroConfig({ intervalMin: v, breakMin: settings.pomodoroBreak })
    }

    function handleBreakChange(v: number) {
        updateSettings({ pomodoroBreak: v })
        setPomodoroConfig({ intervalMin: settings.pomodoroInterval, breakMin: v })
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={SECTION_LABEL}>Temporizador Pomodoro</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <NumberInput
                    label="Intervalo (min)"
                    value={settings.pomodoroInterval}
                    min={1} max={120}
                    onChange={handleIntervalChange}
                />
                <NumberInput
                    label="Pausa (min)"
                    value={settings.pomodoroBreak}
                    min={1} max={60}
                    onChange={handleBreakChange}
                />
            </div>
            <div>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 1.6 }}>
                    As alterações são aplicadas imediatamente. O cronômetro atual continuará com as configurações anteriores até ser reiniciado.
                </p>
            </div>
        </div>
    )
}


const WALLPAPERS = [
    { id: 'bg1',  label: 'Clássico',  value: "url('/assets/bg.jpg')" },
    { id: 'bg2',  label: 'Nebulosa',  value: "url('/assets/bg-2.png')" },
    { id: 'bg3',  label: 'Aurora',    value: "url('/assets/bg-3.png')" },
]

function TabAparencia() {
    const { settings, updateSettings } = useSettings()

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={SECTION_LABEL}>Wallpaper</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {WALLPAPERS.map(wp => {
                    const isSelected = settings.wallpaper === wp.value
                    return (
                        <button
                            key={wp.id}
                            type="button"
                            onClick={() => updateSettings({ wallpaper: wp.value })}
                            style={{
                                borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                                border: isSelected ? '2px solid rgba(99,102,241,0.9)' : '2px solid rgba(255,255,255,0.1)',
                                padding: 0, background: 'none',
                                outline: 'none', transition: 'border-color 0.2s',
                            }}
                        >
                            <div style={{
                                height: 90,
                                backgroundImage: wp.value,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                display: 'flex', alignItems: 'flex-end',
                            }}>
                                <span style={{
                                    width: '100%', padding: '4px 8px',
                                    background: 'rgba(0,0,0,0.55)',
                                    color: 'rgba(255,255,255,0.85)', fontSize: 11,
                                    textAlign: 'left',
                                }}>
                                    {wp.label}
                                </span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}


function SpeakerIcon({ muted }: { muted: boolean }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {muted ? (
                <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
                </>
            ) : (
                <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </>
            )}
        </svg>
    )
}

const AMBIENT_SOUNDS = [
    { id: 'rain.mp3',        label: 'Chuva',        emoji: '🌧️' },
    { id: 'brown-noise.mp3', label: 'Ruído marrom',  emoji: '🌫️' },
    { id: 'ambient.mp3',      label: 'Ambiente',      emoji: '🌿' },
]

function TabSom() {
    const { settings, updateSettings } = useSettings()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const isCustom = settings.soundFile !== 'notify.wav'

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        // Envia o nome do arquivo para o Flutter copiar/usar via bridge
        updateSettings({ soundFile: file.name })
        previewSound(file.name, settings.soundVolume)
        e.target.value = ''
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Toggle */}
            <div style={{ ...GLASS, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>Sons ativados</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
                        Reproduzir áudio ao completar intervalos
                    </p>
                </div>
                <ToggleSwitch value={settings.soundEnabled} onChange={v => updateSettings({ soundEnabled: v })} />
            </div>

            {/* Volume */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={SECTION_LABEL}>Volume</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: settings.soundEnabled ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}>
                        <SpeakerIcon muted={!settings.soundEnabled || settings.soundVolume === 0} />
                    </span>
                    <input
                        type="range" min={0} max={100} value={settings.soundVolume}
                        disabled={!settings.soundEnabled}
                        onChange={e => updateSettings({ soundVolume: Number(e.target.value) })}
                        style={{
                            flex: 1, height: 4, accentColor: '#6366f1',
                            cursor: settings.soundEnabled ? 'pointer' : 'not-allowed',
                            opacity: settings.soundEnabled ? 1 : 0.4,
                        }}
                    />
                    <span style={{
                        color: settings.soundEnabled ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
                        fontSize: 13, minWidth: 32, textAlign: 'right',
                    }}>
                        {settings.soundVolume}%
                    </span>
                </div>
            </div>

            {/* Som de notificação */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={SECTION_LABEL}>Som de notificação</p>

                {/* Preset padrão */}
                <button
                    type="button"
                    disabled={!settings.soundEnabled}
                    onClick={() => { updateSettings({ soundFile: 'notify.wav' }); previewSound('notify.wav', settings.soundVolume) }}
                    style={{
                        ...GLASS,
                        padding: '10px 14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: settings.soundEnabled ? 'pointer' : 'not-allowed',
                        opacity: settings.soundEnabled ? 1 : 0.4,
                        background: !isCustom ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                        border: !isCustom ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
                        transition: 'background 0.2s, border-color 0.2s',
                        textAlign: 'left',
                    }}
                >
                    <span style={{ color: '#fff', fontSize: 13 }}>Notificação</span>
                    {!isCustom && <span style={{ color: 'rgba(99,102,241,0.9)', fontSize: 11, fontWeight: 600 }}>Selecionado</span>}
                </button>

                {/* Som personalizado */}
                <div style={{
                    ...GLASS,
                    padding: '10px 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: isCustom ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                    border: isCustom ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
                    opacity: settings.soundEnabled ? 1 : 0.4,
                    gap: 12,
                }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#fff', fontSize: 13 }}>Personalizado</p>
                        {isCustom && (
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {settings.soundFile}
                            </p>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />
                    <button
                        type="button"
                        disabled={!settings.soundEnabled}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 7, padding: '5px 12px',
                            color: 'rgba(255,255,255,0.7)', fontSize: 12,
                            cursor: settings.soundEnabled ? 'pointer' : 'not-allowed',
                            flexShrink: 0,
                        }}
                    >
                        Escolher...
                    </button>
                </div>
            </div>

            {/* Sons ambiente */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={SECTION_LABEL}>Sons ambiente</p>

                {/* Grid de sons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                    {AMBIENT_SOUNDS.map(s => {
                        const isSelected = settings.ambientFile === s.id
                        return (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => updateSettings({ ambientFile: s.id })}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    gap: 6, padding: '10px 4px',
                                    borderRadius: 10,
                                    background: isSelected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                                    border: isSelected ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer', outline: 'none',
                                    transition: 'background 0.2s, border-color 0.2s',
                                }}
                            >
                                <span style={{ fontSize: 22 }}>{s.emoji}</span>
                                <span style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: 10, textAlign: 'center', lineHeight: 1.2 }}>
                                    {s.label}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Volume ambiente */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                        <SpeakerIcon muted={settings.ambientVolume === 0} />
                    </span>
                    <input
                        type="range" min={0} max={100} value={settings.ambientVolume}
                        onChange={e => updateSettings({ ambientVolume: Number(e.target.value) })}
                        style={{ flex: 1, height: 4, accentColor: '#6366f1', cursor: 'pointer' }}
                    />
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, minWidth: 32, textAlign: 'right' }}>
                        {settings.ambientVolume}%
                    </span>
                </div>
            </div>
        </div>
    )
}

function ToggleRow({ label, description, value, onChange }: ToggleRowProps) {
    return (
        <div style={{
            ...GLASS,
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
            <div style={{ flex: 1 }}>
                <p style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{label}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{description}</p>
            </div>
            <ToggleSwitch value={value} onChange={onChange} />
        </div>
    )
}

function TabAplicativo() {
    const { settings, updateSettings } = useSettings()

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4  }}>
                <ToggleRow
                    label="Minimizar ao fechar"
                    description="A janela é minimizada em vez de fechar"
                    value={settings.minimizeOnClose}
                    onChange={v => updateSettings({ minimizeOnClose: v })}
                />
                <ToggleRow
                    label="Iniciar com Windows"
                    description="Iniciar automaticamente ao ligar o computador"
                    value={settings.startOnBoot}
                    onChange={v => updateSettings({ startOnBoot: v })}
                />
                <ToggleRow
                    label="Mostrar notificações"
                    description="Notificações nativas ao completar tarefas"
                    value={settings.showNotifications}
                    onChange={v => updateSettings({ showNotifications: v })}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p style={SECTION_LABEL}>Sobre</p>
                <div style={{  display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Aplicativo</span>
                        <span style={{ color: '#fff', fontSize: 13 }}>To-Do Timer</span>
                    </div>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Versão</span>
                        <span style={{ color: '#fff', fontSize: 13 }}>0.9.2</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

const TABS: { id: SettingsTab; label: string }[] = [
    { id: 'pomodoro',   label: 'Pomodoro' },
    { id: 'aparencia',  label: 'Aparência' },
    { id: 'som',        label: 'Som' },
    { id: 'aplicativo', label: 'Aplicativo' },
]

export default function SettingsModal({ open, onClose }: ModalOpenProps) {
    const [activeTab, setActiveTab] = useState<SettingsTab>('pomodoro')
    const [visible, setVisible]     = useState(false)
    const [animClass, setAnimClass] = useState('settings-enter')

    useEffect(() => {
        if (open) {
            setVisible(true)
            setAnimClass('settings-enter')
        } else if (visible) {
            setAnimClass('settings-exit')
            const t = setTimeout(() => setVisible(false), 200)
            return () => clearTimeout(t)
        }
    }, [open])

    if (!visible) return null

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
            <div
                className={animClass}
                style={{
                    background: 'rgba(255,255,255,0.13)',
                    backdropFilter: 'blur(32px)',
                    WebkitBackdropFilter: 'blur(32px)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    borderRadius: 20,
                    boxShadow: '0 8px 48px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.25)',
                    width: '92%',
                    maxWidth: 560,
                    maxHeight: '88vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* Header: título + tabs + fechar numa única linha */}
                <div style={{
                    padding: '0 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'stretch',
                    gap: 0, flexShrink: 0, height: 52,
                }}>
                    {/* Título */}
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        paddingRight: 20,
                        borderRight: '1px solid rgba(255,255,255,0.08)',
                        flexShrink: 0,
                    }}>
                        <span style={{
                            color: 'rgba(255,255,255,0.55)',
                            fontSize: 11, fontWeight: 700,
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                        }}>
                            Configurações
                        </span>
                    </div>

                    {/* Tabs */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', paddingLeft: 8, gap: 2 }}>
                        {TABS.map(tab => {
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        padding: '0 14px',
                                        border: 'none',
                                        borderBottom: isActive
                                            ? '2px solid rgba(99,102,241,0.8)'
                                            : '2px solid transparent',
                                        background: 'transparent',
                                        color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                                        fontSize: 13, fontWeight: isActive ? 600 : 400,
                                        cursor: 'pointer',
                                        transition: 'color 0.15s, border-color 0.15s',
                                        outline: 'none',
                                        whiteSpace: 'nowrap',
                                    }}
                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                                >
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Fechar */}
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.14)',
                                borderRadius: 8, width: 28, height: 28, cursor: 'pointer',
                                color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 300, transition: 'background 0.15s, color 0.15s',
                                flexShrink: 0, outline: 'none',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.14)'
                                e.currentTarget.style.color = '#fff'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                                e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Tab content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {activeTab === 'pomodoro'   && <TabPomodoro />}
                    {activeTab === 'aparencia'  && <TabAparencia />}
                    {activeTab === 'som'        && <TabSom />}
                    {activeTab === 'aplicativo' && <TabAplicativo />}
                </div>
            </div>
        </div>
    )
}
