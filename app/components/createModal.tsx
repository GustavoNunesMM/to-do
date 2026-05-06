'use client';

import {
    Modal,
    ModalDialog,
    Input,
    Textarea,
    Button
} from '@mui/joy';
import { useState } from 'react';
import DurationPicker from './timePicker';

interface Props {
    openModal: boolean;
    onClose: () => void;
    addItem: (item: any) => void;
}

export default function CreateModal({ openModal, onClose, addItem }: Props) {
    const [name, setName] = useState('');
    const [duration, setDuration] = useState({ hours: 0, minutes: 30 });
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    function clear() {
        setName('');
        setDuration({ hours: 0, minutes: 30 });
        setDescription('');
        setError('');
    }

    function handleSave() {
        if (name.trim().length <= 1) {
            setError('Nome deve ter pelo menos 2 caracteres');
            return;
        }

        addItem({
            name, duration, description
        })
        clear();
        onClose();
    }

    return (
        <Modal open={openModal} onClose={onClose}>
            <ModalDialog
                sx={{
                    backdropFilter: 'blur(32px)',
                    backgroundColor: 'rgba(255,255,255,0.13)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.3)',
                    borderRadius: '20px',
                    maxWidth: '560px',
                    width: '90%',
                    padding: '28px',
                    overflow: 'visible',
                }}
            >
                <p style={{
                    marginBottom: '20px',
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: '13px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                }}>
                    Nova Atividade
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

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
                        <Button variant="plain" onClick={onClose} sx={buttonSecondary}>
                            Fechar
                        </Button>
                        <Button onClick={handleSave} sx={buttonPrimary}>
                            Salvar
                        </Button>
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