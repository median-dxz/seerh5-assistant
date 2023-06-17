import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';

import React from 'react';

export interface TextEditDialogProps {
    open: boolean;
    initialValue: string;
    onClose: (value: string) => void;
}

export function TextEditDialog({ open, initialValue, onClose }: TextEditDialogProps) {
    const [value, setValue] = React.useState('');

    React.useEffect(() => {
        setValue(initialValue);
    }, [open, initialValue]);

    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    return (
        <Dialog
            open={open}
            onClose={(ev, reason) => {
                if (reason === 'backdropClick') {
                    onClose('');
                } else {
                    onClose(value);
                }
            }}
        >
            <DialogTitle>编辑</DialogTitle>
            <DialogContent>
                <DialogContentText>以英文逗号分隔</DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="text-battle-manager"
                    fullWidth
                    variant="standard"
                    onChange={handleTextChange}
                    value={value}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        onClose(value);
                    }}
                >
                    保存
                </Button>
            </DialogActions>
        </Dialog>
    );
}
