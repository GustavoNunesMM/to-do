'use client';

import { Modal, ModalDialog, Input, Textarea, Button } from '@mui/joy';
import { useState, useEffect, useRef } from 'react';
import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import DurationPicker from '../timePicker';
import { useTasks } from '../../store/tasks';
import { genId } from '../../lib/task';

interface SubtaskDraft {
    id: number
    name: string
    duration: durationType
    pomodoroEnabled: boolean
}

interface Props {
    openModal: boolean;
    onClose: () => void;
    editItem?: Item;
}

function PomodoroToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!value)}
            title={value ? 'Pomodoro ativado' : 'Pomodoro desativado'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
        >
            <div style={{
                width: 28, height: 16, borderRadius: 8,
                backgroundColor: value ? 'rgba(251,146,60,0.65)' : 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.18)',
                position: 'relative', transition: 'background-color 0.2s', flexShrink: 0,
            }}>
                <div style={{
                    position: 'absolute', top: 2, left: value ? 12 : 2,
                    width: 10, height: 10, borderRadius: '50%',
                    backgroundColor: 'white', transition: 'left 0.2s',
                }} />
            </div>
            <span style={{ fontSize: '13px', lineHeight: 1 }}>🍅</span>
        </button>
    )
}

interface HeaderProps {
    isEditing: boolean
    name: string
    duration: durationType
    pomodoroEnabled: boolean
    onNameChange: (v: string) => void
    onDurationChange: (v: durationType) => void
    onPomodoroChange: (v: boolean) => void
}

function ModalHeader({ isEditing, name, duration, pomodoroEnabled, onNameChange, onDurationChange, onPomodoroChange }: HeaderProps) {
    return (
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
                {isEditing ? 'Editar atividade' : 'Nova atividade'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Input
                    placeholder="Nome da atividade"
                    value={name}
                    onChange={e => onNameChange(e.target.value)}
                    sx={{ ...inputStyle, flex: 1 }}
                />
                <DurationPicker value={duration} onChange={onDurationChange} />
                <PomodoroToggle value={pomodoroEnabled} onChange={onPomodoroChange} />
            </div>
        </div>
    )
}

interface SubtaskRowProps {
    sub: SubtaskDraft
    index: number
    inputRef: React.Ref<HTMLInputElement> | null
    onUpdate: (id: number, patch: Partial<SubtaskDraft>) => void
    onRemove: (id: number) => void
    onErrorClear: () => void
}

function SubtaskRow({ sub, index, inputRef, onUpdate, onRemove, onErrorClear }: SubtaskRowProps) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderLeft: '3px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px 10px',
        }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: 600, width: '14px', textAlign: 'right', flexShrink: 0 }}>
                {index + 1}
            </span>
            <input
                ref={inputRef}
                value={sub.name}
                onChange={e => { onUpdate(sub.id, { name: e.target.value }); onErrorClear(); }}
                placeholder="Nome da subtarefa"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.85)', fontSize: '13px', minWidth: 0 }}
            />
            <DurationPicker value={sub.duration} onChange={d => onUpdate(sub.id, { duration: d })} />
            <PomodoroToggle value={sub.pomodoroEnabled} onChange={v => onUpdate(sub.id, { pomodoroEnabled: v })} />
            <button
                type="button"
                onClick={() => onRemove(sub.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,100,100,0.55)', padding: '2px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
            >
                <MdDeleteOutline size={15} />
            </button>
        </div>
    )
}

interface BodyProps {
    description: string
    scheduledDate: string
    scheduledTime: string
    subtasks: SubtaskDraft[]
    lastInputRef: React.RefObject<HTMLInputElement | null>
    onDescriptionChange: (v: string) => void
    onScheduledDateChange: (v: string) => void
    onScheduledTimeChange: (v: string) => void
    onAddSubtask: () => void
    onUpdateDraft: (id: number, patch: Partial<SubtaskDraft>) => void
    onRemoveDraft: (id: number) => void
    onErrorClear: () => void
}

function ModalBody({ description, scheduledDate, scheduledTime, subtasks, lastInputRef, onDescriptionChange, onScheduledDateChange, onScheduledTimeChange, onAddSubtask, onUpdateDraft, onRemoveDraft, onErrorClear }: BodyProps) {
    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Textarea
                placeholder="Descrição (opcional)"
                minRows={2}
                value={description}
                onChange={e => onDescriptionChange(e.target.value)}
                sx={inputStyle}
            />

            {/* agendamento opcional */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, flexShrink: 0 }}>
                    Agendar
                </span>
                <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => onScheduledDateChange(e.target.value)}
                    style={{
                        flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 10, color: scheduledDate ? '#fff' : 'rgba(255,255,255,0.3)',
                        padding: '6px 10px', fontSize: 13, outline: 'none',
                        colorScheme: 'dark',
                    }}
                />
                <input
                    type="time"
                    value={scheduledTime}
                    onChange={e => onScheduledTimeChange(e.target.value)}
                    disabled={!scheduledDate}
                    style={{
                        width: 90, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 10, color: scheduledDate ? '#fff' : 'rgba(255,255,255,0.2)',
                        padding: '6px 10px', fontSize: 13, outline: 'none',
                        colorScheme: 'dark',
                        opacity: scheduledDate ? 1 : 0.4, cursor: scheduledDate ? 'auto' : 'not-allowed',
                    }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                        Subtarefas{subtasks.length > 0 ? ` · ${subtasks.length}` : ''}
                    </span>
                    <button
                        type="button"
                        onClick={onAddSubtask}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)',
                            borderRadius: '7px', color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
                            padding: '3px 9px', fontSize: '11px', fontWeight: 500, transition: 'background 0.15s',
                        }}
                    >
                        <MdAdd size={13} /> Adicionar
                    </button>
                </div>

                {subtasks.length === 0 && (
                    <div style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
                        Nenhuma subtarefa — clique em Adicionar para criar
                    </div>
                )}

                {subtasks.map((sub, idx) => (
                    <SubtaskRow
                        key={sub.id}
                        sub={sub}
                        index={idx}
                        inputRef={idx === subtasks.length - 1 ? lastInputRef : null}
                        onUpdate={onUpdateDraft}
                        onRemove={onRemoveDraft}
                        onErrorClear={onErrorClear}
                    />
                ))}
            </div>
        </div>
    )
}

interface FooterProps {
    error: string
    isEditing: boolean
    onClose: () => void
    onSave: () => void
}

function ModalFooter({ error, isEditing, onClose, onSave }: FooterProps) {
    return (
        <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            {error
                ? <span style={{ color: 'rgba(255,100,100,0.9)', fontSize: '12px' }}>{error}</span>
                : <span />
            }
            <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="plain" onClick={onClose} sx={buttonSecondary}>Fechar</Button>
                <Button onClick={onSave} sx={buttonPrimary}>
                    {isEditing ? 'Salvar alterações' : 'Salvar'}
                </Button>
            </div>
        </div>
    )
}

export default function CreateModal({ openModal, onClose, editItem }: Props) {
    const { add, update, addSubtask, remove, items } = useTasks();
    const [name, setName]                       = useState('');
    const [duration, setDuration]               = useState<durationType>({ hours: 0, minutes: 30 });
    const [description, setDescription]         = useState('');
    const [pomodoroEnabled, setPomodoroEnabled] = useState(true);
    const [scheduledDate, setScheduledDate]     = useState('');
    const [scheduledTime, setScheduledTime]     = useState('');
    const [error, setError]                     = useState('');
    const [subtasks, setSubtasks]               = useState<SubtaskDraft[]>([]);
    const lastInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (editItem) {
            setName(editItem.name);
            setDuration(editItem.duration);
            setDescription(editItem.description);
            setPomodoroEnabled(editItem.pomodoroEnabled ?? true);
            setScheduledDate(editItem.scheduledDate ?? '');
            setScheduledTime(editItem.scheduledTime ?? '');
            const existingSubs = items.filter(i => i.parentId === editItem.id);
            setSubtasks(existingSubs.map(s => ({
                id: s.id,
                name: s.name,
                duration: s.duration,
                pomodoroEnabled: s.pomodoroEnabled ?? true,
            })));
        } else {
            clear();
        }
    }, [editItem, openModal]);

    function clear() {
        setName('');
        setDuration({ hours: 0, minutes: 30 });
        setDescription('');
        setPomodoroEnabled(true);
        setScheduledDate('');
        setScheduledTime('');
        setError('');
        setSubtasks([]);
    }

    function addSubtaskDraft() {
        setSubtasks(prev => [...prev, { id: genId(), name: '', duration: { hours: 0, minutes: 30 }, pomodoroEnabled }]);
        setTimeout(() => lastInputRef.current?.focus(), 50);
    }

    function updateDraft(id: number, patch: Partial<SubtaskDraft>) {
        setSubtasks(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    }

    function removeDraft(id: number) {
        setSubtasks(prev => prev.filter(s => s.id !== id));
    }

    function handleSave() {
        if (name.trim().length <= 1) { setError('Nome deve ter pelo menos 2 caracteres'); return; }
        for (const sub of subtasks) {
            if (sub.name.trim().length <= 1) { setError('Subtarefa precisa ter pelo menos 2 caracteres'); return; }
        }

        const sDate = scheduledDate || null
        const sTime = scheduledDate && scheduledTime ? scheduledTime : null

        if (editItem) {
            update({ ...editItem, name, duration, description, pomodoroEnabled, scheduledDate: sDate, scheduledTime: sTime });

            const storeSubs = items.filter(i => i.parentId === editItem.id);
            const storeIds  = new Set(storeSubs.map(i => i.id));
            const draftIds  = new Set(subtasks.map(s => s.id));

            storeSubs.forEach(s => { if (!draftIds.has(s.id)) remove(s.id); });
            subtasks.forEach(sub => {
                if (storeIds.has(sub.id)) {
                    const orig = storeSubs.find(s => s.id === sub.id)!;
                    update({ ...orig, name: sub.name, duration: sub.duration, pomodoroEnabled: sub.pomodoroEnabled });
                } else {
                    addSubtask(editItem.id, { name: sub.name, duration: sub.duration, description: '', pomodoroEnabled: sub.pomodoroEnabled, groupId: editItem.groupId });
                }
            });
        } else {
            const parentId = genId();
            add({ name, duration, description, pomodoroEnabled, scheduledDate: sDate, scheduledTime: sTime }, parentId);
            subtasks.forEach(sub => {
                addSubtask(parentId, { name: sub.name, duration: sub.duration, description: '', pomodoroEnabled: sub.pomodoroEnabled });
            });
        }
        clear();
        onClose();
    }

    const isEditing = !!editItem;

    return (
        <Modal open={openModal} onClose={onClose}>
            <ModalDialog sx={{
                backdropFilter: 'blur(32px)',
                backgroundColor: 'rgba(255,255,255,0.11)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.25)',
                borderRadius: '20px',
                maxWidth: '600px',
                width: '92%',
                padding: '0',
                overflow: 'hidden',
                maxHeight: '88vh',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <ModalHeader
                    isEditing={isEditing}
                    name={name}
                    duration={duration}
                    pomodoroEnabled={pomodoroEnabled}
                    onNameChange={v => { setName(v); setError(''); }}
                    onDurationChange={setDuration}
                    onPomodoroChange={setPomodoroEnabled}
                />
                <ModalBody
                    description={description}
                    scheduledDate={scheduledDate}
                    scheduledTime={scheduledTime}
                    subtasks={subtasks}
                    lastInputRef={lastInputRef}
                    onDescriptionChange={setDescription}
                    onScheduledDateChange={setScheduledDate}
                    onScheduledTimeChange={setScheduledTime}
                    onAddSubtask={addSubtaskDraft}
                    onUpdateDraft={updateDraft}
                    onRemoveDraft={removeDraft}
                    onErrorClear={() => setError('')}
                />
                <ModalFooter
                    error={error}
                    isEditing={isEditing}
                    onClose={onClose}
                    onSave={handleSave}
                />
            </ModalDialog>
        </Modal>
    );
}

const inputStyle = {
    backgroundColor: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    backdropFilter: 'blur(10px)',
    borderRadius: '10px',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.11)' },
    '& input': { color: '#fff' },
};

const buttonPrimary = {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.22)',
    borderRadius: '10px',
    backdropFilter: 'blur(10px)',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
};

const buttonSecondary = {
    color: 'rgba(255,255,255,0.6)',
    borderRadius: '10px',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
};
