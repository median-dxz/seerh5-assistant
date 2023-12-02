import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';

import React from 'react';
import { TextContext } from './StateView';

export interface TextEditDialogProps {
    open: boolean;
    onClose: (value: string) => void;
}

export function TextEditDialog({ open, onClose }: TextEditDialogProps) {
    const { text, setText } = React.useContext(TextContext);

    const handleTextChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        setText(event.target.value);
    };

    return (
        <Dialog
            open={open}
            onClose={(ev, reason) => {
                if (reason === 'backdropClick') {
                    setText('');
                    onClose('');
                } else {
                    onClose(text);
                }
            }}
        >
            <DialogTitle>编辑</DialogTitle>
            <DialogContent sx={{ minWidth: '25vw' }}>
                <DialogContentText>以英文逗号分隔</DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="text-battle-manager"
                    fullWidth
                    variant="standard"
                    onChange={handleTextChange}
                    value={text}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(text)}>保存</Button>
            </DialogActions>
        </Dialog>
    );
}
