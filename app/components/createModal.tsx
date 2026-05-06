'use client';

import { Modal, ModalDialog, Input, Textarea, Button } from '@mui/joy';
import { useState, useEffect } from 'react';
import DurationPicker from './timePicker';
import { useTasks } from '../store/tasks';

interface Props {
    openModal: boolean;
    onClose: () => void;
    editItem?: Item;
}

export default function CreateModal({ openModal, onClose, editItem }: Props) {
    const { add, update } = useTasks();
    const [name, setName]                       = useState('');
    const [duration, setDuration]               = useState({ hours: 0, minutes: 30 });
    const [description, setDescription]         = useState('');
    const [pomodoroEnabled, setPomodoroEnabled] = useState(true);
    const [error, setError]                     = useState('');

    useEffect(() => {
        if (editItem) {
            setName(editItem.name);
            setDuration(editItem.duration);
            setDescription(editItem.description);
            setPomodoroEnabled(editItem.pomodoroEnabled ?? true);
        } else {
            clear();
        }
    }, [editItem, openModal]);

    function clear() {
        setName('');
        setDuration({ hours: 0, minutes: 30 });
        setDescription('');
        setPomodoroEnabled(true);
        setError('');
    }

    function handleSave() {
        if (name.trim().length <= 1) {
            setError('Nome deve ter pelo menos 2 caracteres');
            return;
        }
        if (editItem) {
            update({ ...editItem, name, duration, description, pomodoroEnabled });
        } else {
            add({ name, duration, description, pomodoroEnabled });
        }
        clear();
        onClose();
    }

    return (
        <Modal open={openModal} onClose={onClose}>
            <ModalDialog sx={{
                backdropFilter: 'blur(32px)',
                backgroundColor: 'rgba(255,255,255,0.13)',
                border: '1px solid rgba(255,255,255,0.22)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.3)',
                borderRadius: '20px',
                maxWidth: '560px',
                width: '90%',
                padding: '28px',
                overflow: 'visible',
            }}>
                <p style={{
                    marginBottom: '20px',
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: '13px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                }}>
                    {editItem ? 'Editar Atividade' : 'Nova Atividade'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'start' }}>
                        <Input
                            placeholder="Nome da atividade"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(''); }}
                            sx={inputStyle}
                        />
                        <DurationPicker value={duration} onChange={setDuration} />
                    </div>

                    <Textarea
                        placeholder="Descrição"
                        minRows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        sx={inputStyle}
                    />

                    {error && (
                        <p style={{ color: 'rgba(255,100,100,0.9)', fontSize: '13px', margin: 0 }}>
                            {error}
                        </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                        {/* toggle pomodoro */}
                        <button
                            type="button"
                            onClick={() => setPomodoroEnabled(v => !v)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                            }}
                        >
                            <div style={{
                                width: 36, height: 20,
                                borderRadius: 10,
                                backgroundColor: pomodoroEnabled ? 'rgba(251,146,60,0.6)' : 'rgba(255,255,255,0.15)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                position: 'relative',
                                transition: 'background-color 0.25s',
                                flexShrink: 0,
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: 2, left: pomodoroEnabled ? 18 : 2,
                                    width: 14, height: 14,
                                    borderRadius: '50%',
                                    backgroundColor: 'white',
                                    transition: 'left 0.25s',
                                }} />
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                                🍅 Pomodoro {pomodoroEnabled ? 'ativado' : 'desativado'}
                            </span>
                        </button>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button variant="plain" onClick={onClose} sx={buttonSecondary}>
                                Fechar
                            </Button>
                            <Button onClick={handleSave} sx={buttonPrimary}>
                                {editItem ? 'Salvar alterações' : 'Salvar'}
                            </Button>
                        </div>
                    </div>
                </div>
            </ModalDialog>
        </Modal>
    );
}

const inputStyle = {
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: '#fff',
    backdropFilter: 'blur(10px)',
    borderRadius: '10px',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' },
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
